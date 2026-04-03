"""
API покера: раздача карт, ставки (fold/call/raise/check), смена фаз (preflop→flop→turn→river→showdown).
Полностью серверная логика — клиент только отправляет действия.
"""
import json
import os
import random
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Player-Id, X-Player-Name',
}

SUITS = ['♠', '♥', '♦', '♣']
RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
RANK_VAL = {r: i for i, r in enumerate(RANKS)}

PHASE_ORDER = ['preflop', 'flop', 'turn', 'river', 'showdown']


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def make_deck():
    d = [{'rank': r, 'suit': s} for s in SUITS for r in RANKS]
    random.shuffle(d)
    return d


def hand_rank(cards):
    if len(cards) < 2:
        return 0
    vals = sorted([RANK_VAL[c['rank']] for c in cards], reverse=True)
    suits = [c['suit'] for c in cards]
    ranks = [c['rank'] for c in cards]
    counts = {}
    for v in vals:
        counts[v] = counts.get(v, 0) + 1
    cnt = sorted(counts.values(), reverse=True)
    flush = len(set(suits)) == 1 and len(cards) >= 5
    straight = len(set(vals)) == 5 and (max(vals) - min(vals) == 4)
    if flush and straight: return 8000 + max(vals)
    if cnt[0] == 4: return 7000 + max(k for k, v in counts.items() if v == 4)
    if cnt[0] == 3 and cnt[1] == 2: return 6000 + max(k for k, v in counts.items() if v == 3)
    if flush: return 5000 + max(vals)
    if straight: return 4000 + max(vals)
    if cnt[0] == 3: return 3000 + max(k for k, v in counts.items() if v == 3)
    if cnt[0] == 2 and cnt[1] == 2: pairs = [k for k, v in counts.items() if v == 2]; return 2000 + max(pairs)
    if cnt[0] == 2: return 1000 + max(k for k, v in counts.items() if v == 2)
    return max(vals)


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            pass

    headers = event.get('headers', {})
    player_id = headers.get('X-Player-Id') or headers.get('x-player-id', '')

    conn = get_conn()
    cur = conn.cursor()

    try:
        # POST /poker/start — начать игру (хост запускает)
        if method == 'POST' and '/start' in path:
            room_code = body.get('code', '').upper()
            cur.execute("SELECT id, host_id, small_blind, big_blind FROM game_rooms WHERE code = %s", (room_code,))
            room = cur.fetchone()
            if not room:
                return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Комната не найдена'})}
            room_id, host_id, small_blind, big_blind = room
            if host_id != player_id:
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Только хост может начать игру'})}

            cur.execute("SELECT player_id, seat FROM room_players WHERE room_id = %s AND status != 'left' ORDER BY seat", (str(room_id),))
            players = cur.fetchall()
            if len(players) < 2:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужно минимум 2 игрока'})}

            deck = make_deck()
            hands = {}
            for pid, seat in players:
                hands[pid] = [deck.pop(), deck.pop()]

            dealer_seat = 0
            sb_seat = players[1 % len(players)][1] if len(players) > 1 else 0
            bb_seat = players[2 % len(players)][1] if len(players) > 2 else players[1][1]

            round_bets = {}
            for pid, seat in players:
                round_bets[pid] = 0
                if seat == sb_seat:
                    round_bets[pid] = small_blind
                    cur.execute("UPDATE room_players SET chips = chips - %s WHERE room_id = %s AND player_id = %s", (small_blind, str(room_id), pid))
                elif seat == bb_seat:
                    round_bets[pid] = big_blind
                    cur.execute("UPDATE room_players SET chips = chips - %s WHERE room_id = %s AND player_id = %s", (big_blind, str(room_id), pid))

            pot = small_blind + big_blind
            current_seat = players[(3 % len(players))][1] if len(players) > 2 else players[0][1]

            cur.execute("UPDATE game_rooms SET status = 'playing' WHERE id = %s", (str(room_id),))
            cur.execute(
                """INSERT INTO poker_game_state (room_id, phase, deck, community_cards, pot, current_seat, dealer_seat, round_bets, hands)
                   VALUES (%s, 'preflop', %s, '[]', %s, %s, %s, %s, %s)
                   ON CONFLICT (room_id) DO UPDATE SET
                     phase='preflop', deck=EXCLUDED.deck, community_cards='[]',
                     pot=EXCLUDED.pot, current_seat=EXCLUDED.current_seat, dealer_seat=EXCLUDED.dealer_seat,
                     round_bets=EXCLUDED.round_bets, hands=EXCLUDED.hands, updated_at=NOW()""",
                (str(room_id), json.dumps(deck), pot, current_seat, dealer_seat, json.dumps(round_bets), json.dumps(hands))
            )
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'phase': 'preflop'})}

        # POST /poker/action — сделать ход: fold/check/call/raise
        if method == 'POST' and '/action' in path:
            room_code = body.get('code', '').upper()
            action = body.get('action', '')
            amount = int(body.get('amount', 0))

            cur.execute("SELECT id, small_blind, big_blind FROM game_rooms WHERE code = %s", (room_code,))
            room = cur.fetchone()
            if not room:
                return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Комната не найдена'})}
            room_id, small_blind, big_blind = room

            cur.execute("SELECT phase, deck, community_cards, pot, current_seat, dealer_seat, round_bets, hands FROM poker_game_state WHERE room_id = %s", (str(room_id),))
            gs = cur.fetchone()
            if not gs:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Игра не начата'})}

            phase, deck_raw, cc_raw, pot, current_seat, dealer_seat, rb_raw, hands_raw = gs
            deck = json.loads(deck_raw)
            community = json.loads(cc_raw)
            round_bets = json.loads(rb_raw)
            hands = json.loads(hands_raw)

            cur.execute("SELECT player_id, seat, chips, status FROM room_players WHERE room_id = %s AND status != 'left' ORDER BY seat", (str(room_id),))
            players = cur.fetchall()
            seats = {p[1]: p for p in players}
            active = [p for p in players if p[3] == 'waiting' or p[3] == 'playing']

            cur_player = next((p for p in active if p[1] == current_seat), None)
            if not cur_player or cur_player[0] != player_id:
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Не ваш ход'})}

            max_bet = max(round_bets.values()) if round_bets else 0
            my_bet = round_bets.get(player_id, 0)
            call_amount = max_bet - my_bet
            chips = cur_player[2]

            if action == 'fold':
                cur.execute("UPDATE room_players SET status = 'folded' WHERE room_id = %s AND player_id = %s", (str(room_id), player_id))
            elif action == 'check':
                if call_amount > 0:
                    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нельзя check, нужен call'})}
            elif action == 'call':
                actual_call = min(call_amount, chips)
                round_bets[player_id] = my_bet + actual_call
                pot += actual_call
                cur.execute("UPDATE room_players SET chips = chips - %s WHERE room_id = %s AND player_id = %s", (actual_call, str(room_id), player_id))
            elif action == 'raise':
                if amount <= max_bet:
                    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Рейз должен быть больше текущей ставки'})}
                add = amount - my_bet
                add = min(add, chips)
                round_bets[player_id] = my_bet + add
                pot += add
                cur.execute("UPDATE room_players SET chips = chips - %s WHERE room_id = %s AND player_id = %s", (add, str(room_id), player_id))

            still_active = [p[0] for p in active if p[3] not in ('folded',) and p[0] != player_id]
            if action == 'fold':
                still_active = [p[0] for p in active if p[0] != player_id and p[3] != 'folded']

            cur.execute("SELECT player_id, seat, chips, status FROM room_players WHERE room_id = %s AND status != 'left' AND status != 'folded' ORDER BY seat", (str(room_id),))
            remaining = cur.fetchall()

            next_phase = phase
            new_community = community
            last_action = f"{player_id}:{action}:{amount}"

            if len(remaining) == 1:
                winner = remaining[0]
                cur.execute("UPDATE room_players SET chips = chips + %s WHERE room_id = %s AND player_id = %s", (pot, str(room_id), winner[0]))
                next_phase = 'finished'
                pot = 0
                round_bets = {}
            else:
                all_bets_equal = all(round_bets.get(p[0], 0) == max(round_bets.values()) for p in remaining)
                next_idx = None
                for i, p in enumerate(remaining):
                    if p[1] == current_seat:
                        next_idx = (i + 1) % len(remaining)
                        break
                if next_idx is None:
                    next_idx = 0
                next_seat = remaining[next_idx][1]

                if all_bets_equal and next_seat == remaining[0][1]:
                    phase_idx = PHASE_ORDER.index(phase) if phase in PHASE_ORDER else 0
                    if phase_idx + 1 < len(PHASE_ORDER):
                        next_phase = PHASE_ORDER[phase_idx + 1]
                        round_bets = {p[0]: 0 for p in remaining}
                        if next_phase == 'flop':
                            new_community = [deck.pop(), deck.pop(), deck.pop()]
                        elif next_phase in ('turn', 'river'):
                            new_community = community + [deck.pop()]
                        elif next_phase == 'showdown':
                            scores = {}
                            for p in remaining:
                                ph = hands.get(p[0], [])
                                scores[p[0]] = hand_rank(ph + new_community)
                            winner_id = max(scores, key=lambda x: scores[x])
                            cur.execute("UPDATE room_players SET chips = chips + %s WHERE room_id = %s AND player_id = %s", (pot, str(room_id), winner_id))
                            pot = 0
                            next_phase = 'finished'
                        next_seat = remaining[0][1]

                cur.execute("UPDATE poker_game_state SET current_seat = %s WHERE room_id = %s", (next_seat, str(room_id)))

            cur.execute(
                """UPDATE poker_game_state SET phase=%s, deck=%s, community_cards=%s, pot=%s, round_bets=%s, last_action=%s, updated_at=NOW()
                   WHERE room_id=%s""",
                (next_phase, json.dumps(deck), json.dumps(new_community), pot, json.dumps(round_bets), last_action, str(room_id))
            )
            if next_phase == 'finished':
                cur.execute("UPDATE game_rooms SET status = 'waiting' WHERE id = %s", (str(room_id),))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'phase': next_phase})}

        # GET /poker/state — получить текущее состояние игры
        if method == 'GET' and '/state' in path:
            qs = event.get('queryStringParameters') or {}
            room_code = qs.get('code', '').upper()

            cur.execute("SELECT id FROM game_rooms WHERE code = %s", (room_code,))
            room = cur.fetchone()
            if not room:
                return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Комната не найдена'})}
            room_id = room[0]

            cur.execute("SELECT phase, community_cards, pot, current_seat, round_bets, hands, last_action FROM poker_game_state WHERE room_id = %s", (str(room_id),))
            gs = cur.fetchone()
            if not gs:
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'phase': 'waiting', 'community_cards': [], 'pot': 0})}

            phase, cc_raw, pot, current_seat, rb_raw, hands_raw, last_action = gs
            community = json.loads(cc_raw)
            round_bets = json.loads(rb_raw)
            hands = json.loads(hands_raw)

            cur.execute("SELECT player_id, player_name, chips, seat, status FROM room_players WHERE room_id = %s AND status != 'left' ORDER BY seat", (str(room_id),))
            players = [{'player_id': r[0], 'player_name': r[1], 'chips': r[2], 'seat': r[3], 'status': r[4], 'bet': round_bets.get(r[0], 0)} for r in cur.fetchall()]

            my_hand = hands.get(player_id, []) if phase not in ('waiting', 'finished') else []

            return {
                'statusCode': 200,
                'headers': CORS,
                'body': json.dumps({
                    'phase': phase,
                    'community_cards': community,
                    'pot': pot,
                    'current_seat': current_seat,
                    'players': players,
                    'my_hand': my_hand,
                    'round_bets': round_bets,
                    'last_action': last_action
                })
            }

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}

    except Exception as e:
        conn.rollback()
        return {'statusCode': 500, 'headers': CORS, 'body': json.dumps({'error': str(e)})}
    finally:
        cur.close()
        conn.close()

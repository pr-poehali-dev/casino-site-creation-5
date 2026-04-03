"""
API для управления игровыми комнатами казино:
создание комнаты, вход, список игроков, состояние лобби.
"""
import json
import os
import random
import string
import psycopg2
from datetime import datetime

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Player-Id, X-Player-Name',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def gen_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


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
    player_name = headers.get('X-Player-Name') or headers.get('x-player-name', 'Игрок')

    conn = get_conn()
    cur = conn.cursor()

    try:
        # POST /lobby/create — создать комнату
        if method == 'POST' and '/create' in path:
            game_type = body.get('game_type', 'poker')
            max_players = int(body.get('max_players', 6))
            small_blind = int(body.get('small_blind', 100))
            big_blind = int(body.get('big_blind', 200))
            host_name = body.get('host_name', player_name)

            code = gen_code()
            for _ in range(10):
                cur.execute("SELECT 1 FROM game_rooms WHERE code = %s", (code,))
                if not cur.fetchone():
                    break
                code = gen_code()

            cur.execute(
                """INSERT INTO game_rooms (code, game_type, host_name, host_id, max_players, small_blind, big_blind)
                   VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id, code""",
                (code, game_type, host_name, player_id, max_players, small_blind, big_blind)
            )
            room_id, room_code = cur.fetchone()

            cur.execute(
                """INSERT INTO room_players (room_id, player_id, player_name, chips, seat)
                   VALUES (%s, %s, %s, 10000, 0)""",
                (str(room_id), player_id, host_name)
            )
            conn.commit()
            return {
                'statusCode': 200,
                'headers': CORS,
                'body': json.dumps({'room_id': str(room_id), 'code': room_code})
            }

        # POST /lobby/join — войти в комнату по коду
        if method == 'POST' and '/join' in path:
            code = body.get('code', '').upper().strip()
            join_name = body.get('player_name', player_name)

            cur.execute("SELECT id, status, max_players FROM game_rooms WHERE code = %s", (code,))
            row = cur.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Комната не найдена'})}

            room_id, status, max_players = row
            if status == 'playing':
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Игра уже идёт'})}

            cur.execute("SELECT COUNT(*) FROM room_players WHERE room_id = %s", (str(room_id),))
            count = cur.fetchone()[0]
            if count >= max_players:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Комната заполнена'})}

            cur.execute("SELECT id FROM room_players WHERE room_id = %s AND player_id = %s", (str(room_id), player_id))
            if cur.fetchone():
                conn.commit()
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'room_id': str(room_id), 'code': code, 'rejoined': True})}

            cur.execute(
                """INSERT INTO room_players (room_id, player_id, player_name, chips, seat)
                   VALUES (%s, %s, %s, 10000, %s)""",
                (str(room_id), player_id, join_name, count)
            )
            conn.commit()
            return {
                'statusCode': 200,
                'headers': CORS,
                'body': json.dumps({'room_id': str(room_id), 'code': code})
            }

        # GET /lobby/room/{code} — состояние комнаты
        if method == 'GET' and '/room/' in path:
            code = path.split('/room/')[-1].split('?')[0].upper()
            cur.execute(
                """SELECT id, code, game_type, host_name, status, max_players, small_blind, big_blind
                   FROM game_rooms WHERE code = %s""",
                (code,)
            )
            room = cur.fetchone()
            if not room:
                return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Комната не найдена'})}

            room_id = room[0]
            cur.execute(
                "SELECT player_id, player_name, chips, seat, status FROM room_players WHERE room_id = %s ORDER BY seat",
                (str(room_id),)
            )
            players = [{'player_id': r[0], 'player_name': r[1], 'chips': r[2], 'seat': r[3], 'status': r[4]} for r in cur.fetchall()]

            return {
                'statusCode': 200,
                'headers': CORS,
                'body': json.dumps({
                    'room_id': str(room_id),
                    'code': room[1],
                    'game_type': room[2],
                    'host_name': room[3],
                    'status': room[4],
                    'max_players': room[5],
                    'small_blind': room[6],
                    'big_blind': room[7],
                    'players': players,
                    'player_count': len(players)
                })
            }

        # POST /lobby/leave — выйти из комнаты
        if method == 'POST' and '/leave' in path:
            code = body.get('code', '').upper()
            cur.execute("SELECT id FROM game_rooms WHERE code = %s", (code,))
            row = cur.fetchone()
            if row:
                cur.execute("UPDATE room_players SET status = 'left' WHERE room_id = %s AND player_id = %s", (str(row[0]), player_id))
                conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        # GET /lobby/list — список активных комнат
        if method == 'GET' and '/list' in path:
            cur.execute(
                """SELECT gr.id, gr.code, gr.game_type, gr.host_name, gr.status, gr.max_players, gr.small_blind, gr.big_blind,
                          COUNT(rp.id) as player_count
                   FROM game_rooms gr
                   LEFT JOIN room_players rp ON rp.room_id = gr.id AND rp.status != 'left'
                   WHERE gr.status != 'finished'
                   GROUP BY gr.id ORDER BY gr.created_at DESC LIMIT 20"""
            )
            rooms = []
            for r in cur.fetchall():
                rooms.append({
                    'room_id': str(r[0]), 'code': r[1], 'game_type': r[2],
                    'host_name': r[3], 'status': r[4], 'max_players': r[5],
                    'small_blind': r[6], 'big_blind': r[7], 'player_count': int(r[8])
                })
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'rooms': rooms})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}

    except Exception as e:
        conn.rollback()
        return {'statusCode': 500, 'headers': CORS, 'body': json.dumps({'error': str(e)})}
    finally:
        cur.close()
        conn.close()

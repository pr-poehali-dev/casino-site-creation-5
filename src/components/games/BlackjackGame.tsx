import { useState } from "react";
import Icon from "@/components/ui/icon";

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

interface Card { rank: string; suit: string; hidden?: boolean }

function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (const s of SUITS) for (const r of RANKS) deck.push({ rank: r, suit: s });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardValue(c: Card): number {
  if (["J","Q","K"].includes(c.rank)) return 10;
  if (c.rank === "A") return 11;
  return parseInt(c.rank);
}

function handTotal(cards: Card[]): number {
  let total = cards.filter(c => !c.hidden).reduce((s, c) => s + cardValue(c), 0);
  let aces = cards.filter(c => !c.hidden && c.rank === "A").length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function CardView({ card }: { card: Card }) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  if (card.hidden) return (
    <div className="w-12 h-18 rounded-lg border border-[rgba(201,168,76,0.3)] flex items-center justify-center w-12 h-16"
      style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
      <span className="text-[#C9A84C]">🂠</span>
    </div>
  );
  return (
    <div className="w-12 h-16 rounded-lg bg-white flex flex-col items-center justify-between p-1 shadow-md border border-gray-200">
      <span className={`text-xs font-bold ${isRed ? "text-red-600" : "text-gray-900"}`}>{card.rank}</span>
      <span className={`text-base ${isRed ? "text-red-600" : "text-gray-900"}`}>{card.suit}</span>
      <span className={`text-xs font-bold rotate-180 ${isRed ? "text-red-600" : "text-gray-900"}`}>{card.rank}</span>
    </div>
  );
}

type Phase = "idle" | "playing" | "done";

interface BlackjackGameProps {
  balance: number;
  onBalanceChange: (b: number) => void;
  onClose: () => void;
}

export default function BlackjackGame({ balance, onBalanceChange, onClose }: BlackjackGameProps) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [bet, setBet] = useState(1000);
  const [message, setMessage] = useState("Сделайте ставку и жмите «Раздать»!");
  const [lastWin, setLastWin] = useState(0);

  const deal = () => {
    if (balance < bet) { setMessage("Недостаточно средств!"); return; }
    const d = makeDeck();
    const player = [d.pop()!, d.pop()!];
    const dealer = [d.pop()!, { ...d.pop()!, hidden: true }];
    setDeck(d);
    setPlayerCards(player);
    setDealerCards(dealer);
    setPhase("playing");
    setLastWin(0);
    onBalanceChange(balance - bet);
    const total = handTotal(player);
    if (total === 21) {
      revealAndFinish(dealer, player, d, bet, balance - bet);
    } else {
      setMessage(`Ваш счёт: ${total}. Добавить карту или стоять?`);
    }
  };

  const revealAndFinish = (dCards: Card[], pCards: Card[], d: Card[], currentBet: number, currentBalance: number) => {
    let revealed = dCards.map(c => ({ ...c, hidden: false }));
    const newDeck = [...d];
    while (handTotal(revealed) < 17) {
      revealed = [...revealed, newDeck.pop()!];
    }
    setDealerCards(revealed);
    setDeck(newDeck);
    setPhase("done");

    const pTotal = handTotal(pCards);
    const dTotal = handTotal(revealed);

    if (pTotal > 21) {
      setMessage(`Перебор! Ваш счёт: ${pTotal}. Дилер победил.`);
    } else if (dTotal > 21 || pTotal > dTotal) {
      const win = currentBet * 2;
      setLastWin(win);
      onBalanceChange(currentBalance + win);
      setMessage(`🎉 Вы победили! ${pTotal} против ${dTotal}. +₽${win.toLocaleString()}`);
    } else if (pTotal === dTotal) {
      onBalanceChange(currentBalance + currentBet);
      setMessage(`Ничья! Счёт: ${pTotal}. Ставка возвращена.`);
    } else {
      setMessage(`Дилер победил! ${dTotal} против ${pTotal}.`);
    }
  };

  const hit = () => {
    if (phase !== "playing") return;
    const d = [...deck];
    const newCards = [...playerCards, d.pop()!];
    setDeck(d);
    setPlayerCards(newCards);
    const total = handTotal(newCards);
    if (total >= 21) {
      revealAndFinish(dealerCards, newCards, d, bet, balance);
    } else {
      setMessage(`Ваш счёт: ${total}.`);
    }
  };

  const stand = () => {
    if (phase !== "playing") return;
    revealAndFinish(dealerCards, playerCards, deck, bet, balance);
  };

  const double = () => {
    if (phase !== "playing" || balance < bet) return;
    onBalanceChange(balance - bet);
    const d = [...deck];
    const newCards = [...playerCards, d.pop()!];
    setDeck(d);
    setPlayerCards(newCards);
    revealAndFinish(dealerCards, newCards, d, bet * 2, balance - bet);
  };

  const betOptions = [500, 1000, 5000, 10000, 50000, 100000];
  const pTotal = handTotal(playerCards);
  const dTotal = handTotal(dealerCards.filter(c => !c.hidden));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.92)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, #0d1a0d, #0a120a)", border: "1px solid rgba(201,168,76,0.3)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(201,168,76,0.15)]">
          <h2 className="font-display text-2xl font-semibold gold-text-gradient">Blackjack Elite</h2>
          <button onClick={onClose} className="text-[#C9A84C]/60 hover:text-[#C9A84C]"><Icon name="X" size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#C9A84C]/50 text-xs uppercase tracking-wider">Дилер</span>
              {dealerCards.length > 0 && <span className="text-[#E8D5A0] text-sm font-semibold">{dTotal}</span>}
            </div>
            <div className="flex gap-2">
              {dealerCards.length === 0 ? <div className="text-[#C9A84C]/20 text-sm">Карты не розданы</div>
                : dealerCards.map((c, i) => <CardView key={i} card={c} />)}
            </div>
          </div>

          <div className="text-center py-2">
            <div className="bg-[rgba(201,168,76,0.05)] rounded-lg px-4 py-3 text-[#E8D5A0] text-sm">{message}</div>
            {lastWin > 0 && <div className="text-green-400 text-lg font-semibold mt-2">+₽{lastWin.toLocaleString()}</div>}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#C9A84C]/50 text-xs uppercase tracking-wider">Ваши карты</span>
              {playerCards.length > 0 && <span className={`text-sm font-semibold ${pTotal > 21 ? "text-red-400" : pTotal === 21 ? "text-green-400" : "text-[#E8D5A0]"}`}>{pTotal}</span>}
            </div>
            <div className="flex gap-2">
              {playerCards.length === 0 ? <div className="text-[#C9A84C]/20 text-sm">Карты не розданы</div>
                : playerCards.map((c, i) => <CardView key={i} card={c} />)}
            </div>
          </div>

          {phase === "idle" || phase === "done" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {betOptions.map(b => (
                  <button key={b} onClick={() => setBet(b)}
                    className={`px-3 py-1.5 rounded text-xs ${bet === b ? "btn-gold" : "btn-outline-gold opacity-60 hover:opacity-100"}`}>
                    ₽{b.toLocaleString()}
                  </button>
                ))}
              </div>
              <button onClick={deal} className="w-full btn-gold py-3 rounded font-semibold tracking-wider">
                {phase === "done" ? "Новая игра" : `Раздать (₽${bet.toLocaleString()})`}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button onClick={hit} className="py-3 rounded btn-gold text-sm font-semibold">Ещё</button>
              <button onClick={stand} className="py-3 rounded btn-outline-gold text-sm">Стоп</button>
              <button onClick={double} disabled={balance < bet}
                className="py-3 rounded text-sm font-semibold border border-[rgba(201,168,76,0.4)] text-[#C9A84C] hover:bg-[rgba(201,168,76,0.1)] transition-all disabled:opacity-30">
                Удвоить
              </button>
            </div>
          )}

          <div className="flex justify-between text-xs text-[#C9A84C]/40">
            <span>Баланс: ₽{balance.toLocaleString()}</span>
            <span>Ставка: ₽{bet.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

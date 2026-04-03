import { useState } from "react";
import Icon from "@/components/ui/icon";

const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const SUITS = ["♠","♥","♦","♣"];

interface Card { rank: string; suit: string }

function makeDeck() {
  const d: Card[] = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ rank: r, suit: s });
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function cardPoint(c: Card): number {
  if (["10","J","Q","K"].includes(c.rank)) return 0;
  if (c.rank === "A") return 1;
  return parseInt(c.rank);
}

function handPoints(cards: Card[]) {
  return cards.reduce((s, c) => s + cardPoint(c), 0) % 10;
}

function CardView({ card }: { card: Card }) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  return (
    <div className="w-10 h-14 rounded bg-white flex flex-col items-center justify-between p-1 shadow border border-gray-200">
      <span className={`text-xs font-bold ${isRed ? "text-red-600" : "text-gray-900"}`}>{card.rank}</span>
      <span className={`text-sm ${isRed ? "text-red-600" : "text-gray-900"}`}>{card.suit}</span>
    </div>
  );
}

type BetOn = "player" | "banker" | "tie";

interface BaccaratGameProps {
  balance: number;
  onBalanceChange: (b: number) => void;
  onClose: () => void;
}

export default function BaccaratGame({ balance, onBalanceChange, onClose }: BaccaratGameProps) {
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [bankerCards, setBankerCards] = useState<Card[]>([]);
  const [phase, setPhase] = useState<"idle" | "done">("idle");
  const [bet, setBet] = useState(1000);
  const [betOn, setBetOn] = useState<BetOn>("player");
  const [message, setMessage] = useState("Выберите ставку и нажмите «Раздать»!");
  const [lastWin, setLastWin] = useState(0);

  const deal = () => {
    if (balance < bet) { setMessage("Недостаточно средств!"); return; }
    const d = makeDeck();
    const p = [d.pop()!, d.pop()!];
    const b = [d.pop()!, d.pop()!];

    const pp = handPoints(p);
    const bp = handPoints(b);
    const pFinal = [...p];
    const bFinal = [...b];

    if (pp <= 5 && pp !== 8 && pp !== 9) pFinal.push(d.pop()!);
    if (bp <= 5 && bp !== 8 && bp !== 9) bFinal.push(d.pop()!);

    const pFinal_ = handPoints(pFinal);
    const bFinal_ = handPoints(bFinal);

    setPlayerCards(pFinal);
    setBankerCards(bFinal);
    setPhase("done");
    onBalanceChange(balance - bet);
    setLastWin(0);

    let win = 0;
    let msg = `Игрок: ${pFinal_} | Банкир: ${bFinal_}. `;

    if (pFinal_ > bFinal_) {
      msg += "Игрок победил!";
      if (betOn === "player") { win = bet * 2; }
    } else if (bFinal_ > pFinal_) {
      msg += "Банкир победил!";
      if (betOn === "banker") { win = Math.floor(bet * 1.95); }
    } else {
      msg += "Ничья!";
      if (betOn === "tie") { win = bet * 9; }
      else { win = bet; }
    }

    if (win > 0) {
      setLastWin(win);
      onBalanceChange(balance - bet + win);
      msg += ` +₽${win.toLocaleString()}`;
    }
    setMessage(msg);
  };

  const betOptions = [1000, 5000, 10000, 50000, 100000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.92)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, #0d0d1a, #0a0a15)", border: "1px solid rgba(201,168,76,0.3)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(201,168,76,0.15)]">
          <h2 className="font-display text-2xl font-semibold gold-text-gradient">Баккара VIP</h2>
          <button onClick={onClose} className="text-[#C9A84C]/60 hover:text-[#C9A84C]"><Icon name="X" size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Table */}
          <div className="rounded-xl p-4 space-y-4" style={{ background: "rgba(0,80,0,0.2)", border: "1px solid rgba(0,150,0,0.2)" }}>
            {[{ label: "Банкир", cards: bankerCards }, { label: "Игрок", cards: playerCards }].map(side => (
              <div key={side.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#C9A84C]/60 text-xs uppercase tracking-wider">{side.label}</span>
                  {side.cards.length > 0 && <span className="text-[#E8D5A0] text-lg font-bold font-display">{handPoints(side.cards)}</span>}
                </div>
                <div className="flex gap-2">
                  {side.cards.length === 0
                    ? <div className="text-[#C9A84C]/20 text-sm">Карты не розданы</div>
                    : side.cards.map((c, i) => <CardView key={i} card={c} />)}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[rgba(201,168,76,0.05)] rounded-lg px-4 py-3 text-[#E8D5A0] text-sm text-center">
            {message}
          </div>
          {lastWin > 0 && <div className="text-center font-display text-2xl gold-text-gradient font-bold">+₽{lastWin.toLocaleString()}</div>}

          {/* Bet on */}
          <div>
            <div className="text-[#C9A84C]/50 text-xs uppercase tracking-wider mb-2">Поставить на</div>
            <div className="grid grid-cols-3 gap-2">
              {([["player", "Игрок", "x2"], ["banker", "Банкир", "x1.95"], ["tie", "Ничья", "x9"]] as [BetOn, string, string][]).map(([v, label, mult]) => (
                <button key={v} onClick={() => setBetOn(v)}
                  className={`py-3 rounded text-xs font-semibold transition-all ${betOn === v ? "btn-gold" : "btn-outline-gold opacity-60 hover:opacity-100"}`}>
                  {label}<br /><span className="font-normal opacity-70">{mult}</span>
                </button>
              ))}
            </div>
          </div>

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

          <div className="flex justify-between text-xs text-[#C9A84C]/40">
            <span>Баланс: ₽{balance.toLocaleString()}</span>
            <span>Ставка: ₽{bet.toLocaleString()} на {betOn === "player" ? "игрока" : betOn === "banker" ? "банкира" : "ничью"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

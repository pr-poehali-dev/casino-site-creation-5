import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";

const SYMBOLS = ["🍒", "💎", "7️⃣", "🌟", "👑", "🐉", "⚜️", "🃏"];
const WEIGHTS = [30, 15, 10, 20, 8, 5, 7, 5];

const PAYOUTS: Record<string, number> = {
  "🍒🍒🍒": 3, "🌟🌟🌟": 5, "💎💎💎": 10,
  "7️⃣7️⃣7️⃣": 15, "⚜️⚜️⚜️": 20, "🃏🃏🃏": 25,
  "🐉🐉🐉": 50, "👑👑👑": 100,
  "💎💎": 2, "7️⃣7️⃣": 2, "👑👑": 3,
};

function weightedRandom(): string {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < SYMBOLS.length; i++) {
    r -= WEIGHTS[i];
    if (r <= 0) return SYMBOLS[i];
  }
  return SYMBOLS[0];
}

interface SlotsGameProps {
  balance: number;
  onBalanceChange: (b: number) => void;
  onClose: () => void;
  gameName?: string;
}

export default function SlotsGame({ balance, onBalanceChange, onClose, gameName = "Слоты" }: SlotsGameProps) {
  const [reels, setReels] = useState(["🍒", "💎", "🌟"]);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(500);
  const [message, setMessage] = useState("Нажмите SPIN!");
  const [lastWin, setLastWin] = useState(0);
  const [totalWon, setTotalWon] = useState(0);
  const [spins, setSpins] = useState(0);
  const spinRef = useRef<NodeJS.Timeout | null>(null);

  const spin = () => {
    if (spinning) return;
    if (balance < bet) { setMessage("Недостаточно средств!"); return; }
    onBalanceChange(balance - bet);
    setSpinning(true);
    setLastWin(0);
    setSpins(s => s + 1);

    let ticks = 0;
    const maxTicks = 20;
    spinRef.current = setInterval(() => {
      setReels([weightedRandom(), weightedRandom(), weightedRandom()]);
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(spinRef.current!);
        const final = [weightedRandom(), weightedRandom(), weightedRandom()];
        setReels(final);
        setSpinning(false);

        const combo = final.join("");
        const combo2 = final[0] === final[1] ? final[0] + final[0] : "";

        const multiplier = PAYOUTS[combo] || (combo2 ? PAYOUTS[combo2] || 0 : 0);
        if (multiplier > 0) {
          const win = bet * multiplier;
          setLastWin(win);
          setTotalWon(t => t + win);
          onBalanceChange(balance - bet + win);
          setMessage(`🎉 ${combo} — Выигрыш x${multiplier}! +₽${win.toLocaleString()}`);
        } else {
          setMessage("Попробуй ещё раз!");
        }
      }
    }, 80);
  };

  const betOptions = [100, 500, 1000, 5000, 10000, 50000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.92)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, #1a0d0d, #120a0a)", border: "1px solid rgba(201,168,76,0.3)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(201,168,76,0.15)]">
          <h2 className="font-display text-2xl font-semibold gold-text-gradient">{gameName}</h2>
          <button onClick={onClose} className="text-[#C9A84C]/60 hover:text-[#C9A84C]"><Icon name="X" size={20} /></button>
        </div>

        <div className="p-6">
          {/* Reels */}
          <div className="flex justify-center gap-3 mb-6">
            {reels.map((sym, i) => (
              <div key={i}
                className={`w-24 h-28 rounded-xl flex items-center justify-center text-5xl border ${
                  spinning ? "animate-pulse border-[rgba(201,168,76,0.4)]" : "border-[rgba(201,168,76,0.2)]"
                }`}
                style={{ background: "linear-gradient(145deg, #1a1a1a, #111)", boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)" }}>
                {sym}
              </div>
            ))}
          </div>

          {/* Win line */}
          <div className="h-1 rounded-full mb-4 mx-4" style={{ background: lastWin > 0 ? "linear-gradient(90deg, transparent, #C9A84C, transparent)" : "rgba(201,168,76,0.1)" }} />

          {/* Message */}
          <div className="text-center mb-5">
            <div className="bg-[rgba(201,168,76,0.05)] rounded-lg px-4 py-3 text-[#E8D5A0] text-sm mb-2">{message}</div>
            {lastWin > 0 && (
              <div className="font-display text-3xl gold-text-gradient font-bold">+₽{lastWin.toLocaleString()}</div>
            )}
          </div>

          {/* Bet */}
          <div className="mb-4">
            <div className="text-[#C9A84C]/50 text-xs uppercase tracking-wider mb-2">Ставка на спин</div>
            <div className="flex flex-wrap gap-2">
              {betOptions.map(b => (
                <button key={b} onClick={() => setBet(b)}
                  className={`px-3 py-1.5 rounded text-xs transition-all ${bet === b ? "btn-gold" : "btn-outline-gold opacity-60 hover:opacity-100"}`}>
                  ₽{b.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Spin button */}
          <button onClick={spin} disabled={spinning || balance < bet}
            className={`w-full py-4 rounded-xl text-lg font-bold tracking-widest transition-all ${
              spinning ? "opacity-50 bg-[#1a1a1a] text-[#C9A84C] border border-[rgba(201,168,76,0.3)]" : "btn-gold"
            }`}>
            {spinning ? "⠋ SPIN..." : "SPIN ₽" + bet.toLocaleString()}
          </button>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Баланс", value: `₽${balance.toLocaleString()}` },
              { label: "Спинов", value: spins },
              { label: "Выиграно", value: `₽${totalWon.toLocaleString()}` },
            ].map(s => (
              <div key={s.label} className="text-center bg-[rgba(201,168,76,0.04)] rounded-lg p-2 border border-[rgba(201,168,76,0.08)]">
                <div className="text-[#C9A84C] text-sm font-semibold">{s.value}</div>
                <div className="text-[#C9A84C]/40 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Paytable */}
          <div className="mt-4 rounded-lg p-3 border border-[rgba(201,168,76,0.1)]" style={{ background: "rgba(0,0,0,0.3)" }}>
            <div className="text-[#C9A84C]/50 text-xs uppercase tracking-wider mb-2">Таблица выплат</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {Object.entries(PAYOUTS).slice(0, 6).map(([combo, mult]) => (
                <div key={combo} className="flex justify-between">
                  <span>{combo}</span><span className="text-[#C9A84C]">x{mult}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

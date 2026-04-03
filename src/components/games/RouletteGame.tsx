import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";

const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const NUMBERS = Array.from({ length: 37 }, (_, i) => i);

function getColor(n: number) {
  if (n === 0) return "green";
  return RED_NUMBERS.includes(n) ? "red" : "black";
}

type BetType = "number" | "red" | "black" | "even" | "odd" | "1-18" | "19-36" | "dozen1" | "dozen2" | "dozen3";

interface Bet { type: BetType; value?: number; amount: number }

interface RouletteGameProps {
  balance: number;
  onBalanceChange: (b: number) => void;
  onClose: () => void;
}

export default function RouletteGame({ balance, onBalanceChange, onClose }: RouletteGameProps) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [betAmount, setBetAmount] = useState(1000);
  const [message, setMessage] = useState("Делайте ставки!");
  const [winAmount, setWinAmount] = useState(0);
  const [rotation, setRotation] = useState(0);
  const ballRef = useRef<HTMLDivElement>(null);

  const totalBet = bets.reduce((s, b) => s + b.amount, 0);

  const addBet = (type: BetType, value?: number) => {
    if (spinning) return;
    if (balance < betAmount) { setMessage("Недостаточно средств!"); return; }
    setBets(prev => {
      const existing = prev.find(b => b.type === type && b.value === value);
      if (existing) return prev.map(b => b.type === type && b.value === value ? { ...b, amount: b.amount + betAmount } : b);
      return [...prev, { type, value, amount: betAmount }];
    });
    onBalanceChange(balance - betAmount);
    setMessage(`Ставка добавлена. Всего в игре: ₽${(totalBet + betAmount).toLocaleString()}`);
  };

  const clearBets = () => {
    if (spinning) return;
    onBalanceChange(balance + totalBet);
    setBets([]);
    setMessage("Ставки сброшены.");
  };

  const spin = () => {
    if (spinning || bets.length === 0) { setMessage("Сначала сделайте ставку!"); return; }
    setSpinning(true);
    setResult(null);
    setWinAmount(0);

    const num = Math.floor(Math.random() * 37);
    const newRotation = rotation + 1800 + Math.floor(Math.random() * 360);
    setRotation(newRotation);

    setTimeout(() => {
      setResult(num);
      setSpinning(false);

      let win = 0;
      const color = getColor(num);
      for (const bet of bets) {
        if (bet.type === "number" && bet.value === num) win += bet.amount * 36;
        else if (bet.type === "red" && color === "red") win += bet.amount * 2;
        else if (bet.type === "black" && color === "black") win += bet.amount * 2;
        else if (bet.type === "even" && num > 0 && num % 2 === 0) win += bet.amount * 2;
        else if (bet.type === "odd" && num % 2 !== 0) win += bet.amount * 2;
        else if (bet.type === "1-18" && num >= 1 && num <= 18) win += bet.amount * 2;
        else if (bet.type === "19-36" && num >= 19 && num <= 36) win += bet.amount * 2;
        else if (bet.type === "dozen1" && num >= 1 && num <= 12) win += bet.amount * 3;
        else if (bet.type === "dozen2" && num >= 13 && num <= 24) win += bet.amount * 3;
        else if (bet.type === "dozen3" && num >= 25 && num <= 36) win += bet.amount * 3;
      }

      setWinAmount(win);
      setBets([]);

      if (win > 0) {
        onBalanceChange(balance + win);
        setMessage(`🎉 Выпало ${num} (${color === "red" ? "Красное" : color === "black" ? "Чёрное" : "Зеро"})! Выигрыш: +₽${win.toLocaleString()}`);
      } else {
        setMessage(`Выпало ${num} (${color === "red" ? "Красное" : color === "black" ? "Чёрное" : "Зеро"}). Удача в следующий раз!`);
      }
    }, 3000);
  };

  const betOptions = [500, 1000, 5000, 10000, 50000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.92)" }}>
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, #0d0d1a, #0a0a12)", border: "1px solid rgba(201,168,76,0.3)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(201,168,76,0.15)]">
          <h2 className="font-display text-2xl font-semibold gold-text-gradient">Европейская Рулетка</h2>
          <button onClick={onClose} className="text-[#C9A84C]/60 hover:text-[#C9A84C]"><Icon name="X" size={20} /></button>
        </div>

        <div className="p-5">
          {/* Wheel visual */}
          <div className="flex justify-center mb-5">
            <div className="relative w-40 h-40">
              <div className="w-40 h-40 rounded-full border-4 border-[#C9A84C] flex items-center justify-center overflow-hidden"
                style={{
                  background: "conic-gradient(from 0deg, #006600 0deg 10deg, #cc0000 10deg 20deg, #000000 20deg 30deg, #cc0000 30deg 40deg, #000000 40deg 50deg, #cc0000 50deg 60deg, #000000 60deg 70deg, #cc0000 70deg 80deg, #000000 80deg 90deg, #cc0000 90deg 100deg, #000000 100deg 110deg, #cc0000 110deg 120deg, #000000 120deg 130deg, #cc0000 130deg 140deg, #000000 140deg 150deg, #cc0000 150deg 160deg, #000000 160deg 170deg, #cc0000 170deg 180deg, #000000 180deg 190deg, #cc0000 190deg 200deg, #000000 200deg 210deg, #cc0000 210deg 220deg, #000000 220deg 230deg, #cc0000 230deg 240deg, #000000 240deg 250deg, #cc0000 250deg 260deg, #000000 260deg 270deg, #cc0000 270deg 280deg, #000000 280deg 290deg, #cc0000 290deg 300deg, #000000 300deg 310deg, #cc0000 310deg 320deg, #000000 320deg 330deg, #cc0000 330deg 340deg, #000000 340deg 350deg, #cc0000 350deg 360deg)",
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? "transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none"
                }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C] flex items-center justify-center text-white font-bold text-xl"
                  style={{ background: "rgba(0,0,0,0.8)", zIndex: 10 }}>
                  {spinning ? "..." : result !== null ? result : "🎡"}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            {result !== null && !spinning && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                getColor(result) === "red" ? "bg-red-900/30 text-red-400 border border-red-400/30" :
                getColor(result) === "black" ? "bg-gray-900 text-gray-300 border border-gray-500/30" :
                "bg-green-900/30 text-green-400 border border-green-400/30"
              }`}>
                {result} — {getColor(result) === "red" ? "Красное" : getColor(result) === "black" ? "Чёрное" : "Зеро"}
                {winAmount > 0 && <span className="text-green-400 ml-2">+₽{winAmount.toLocaleString()}</span>}
              </div>
            )}
            <div className="text-[#C9A84C]/70 text-sm mt-2">{message}</div>
          </div>

          {/* Betting area */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Outside bets */}
            <div className="space-y-2">
              <div className="text-[#C9A84C]/50 text-xs uppercase tracking-wider mb-1">Внешние ставки (x2)</div>
              <div className="grid grid-cols-2 gap-1.5">
                {(["red","black","even","odd","1-18","19-36"] as BetType[]).map(t => {
                  const labels: Record<string, string> = { red: "🔴 Красное", black: "⚫ Чёрное", even: "Чётное", odd: "Нечётное", "1-18": "1–18", "19-36": "19–36" };
                  const hasBet = bets.find(b => b.type === t);
                  return (
                    <button key={t} onClick={() => addBet(t)}
                      className={`py-2 rounded text-xs font-medium transition-all ${hasBet ? "btn-gold" : "btn-outline-gold opacity-70 hover:opacity-100"}`}>
                      {labels[t]}{hasBet ? ` ₽${hasBet.amount.toLocaleString()}` : ""}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(["dozen1","dozen2","dozen3"] as BetType[]).map(t => {
                  const labels: Record<string, string> = { dozen1: "1-12", dozen2: "13-24", dozen3: "25-36" };
                  const hasBet = bets.find(b => b.type === t);
                  return (
                    <button key={t} onClick={() => addBet(t)}
                      className={`py-2 rounded text-xs transition-all ${hasBet ? "btn-gold" : "btn-outline-gold opacity-60 hover:opacity-100"}`}>
                      {labels[t]}{hasBet ? ` ✓` : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Numbers */}
            <div>
              <div className="text-[#C9A84C]/50 text-xs uppercase tracking-wider mb-1">Числа (x36)</div>
              <div className="grid grid-cols-7 gap-0.5 max-h-36 overflow-y-auto scrollbar-thin">
                {NUMBERS.map(n => {
                  const c = getColor(n);
                  const hasBet = bets.find(b => b.type === "number" && b.value === n);
                  return (
                    <button key={n} onClick={() => addBet("number", n)}
                      className={`aspect-square rounded text-xs font-bold transition-all ${
                        hasBet ? "ring-2 ring-[#C9A84C]" : ""
                      } ${c === "red" ? "bg-red-700 hover:bg-red-600 text-white" :
                        c === "black" ? "bg-gray-800 hover:bg-gray-700 text-white" :
                        "bg-green-700 hover:bg-green-600 text-white"}`}>
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bet amount + actions */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[#C9A84C]/60 text-xs uppercase tracking-wider">Сумма ставки:</span>
            {betOptions.map(b => (
              <button key={b} onClick={() => setBetAmount(b)}
                className={`px-3 py-1 rounded text-xs transition-all ${betAmount === b ? "btn-gold" : "btn-outline-gold opacity-60 hover:opacity-100"}`}>
                ₽{b.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={clearBets} disabled={spinning || bets.length === 0}
              className="flex-1 btn-outline-gold py-3 rounded text-sm tracking-wider disabled:opacity-30">
              Сброс ставок
            </button>
            <button onClick={spin} disabled={spinning || bets.length === 0}
              className="flex-[2] btn-gold py-3 rounded text-sm font-semibold tracking-wider disabled:opacity-50">
              {spinning ? "Крутится..." : `Крутить (₽${totalBet.toLocaleString()})`}
            </button>
          </div>

          <div className="flex justify-between mt-3 text-xs text-[#C9A84C]/40">
            <span>Баланс: ₽{balance.toLocaleString()}</span>
            <span>В ставках: ₽{totalBet.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

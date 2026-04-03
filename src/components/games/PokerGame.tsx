import { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

interface Card { rank: string; suit: string; hidden?: boolean }

function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ rank, suit });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function CardView({ card, size = "md" }: { card: Card; size?: "sm" | "md" | "lg" }) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  const sz = size === "sm" ? "w-10 h-14 text-sm" : size === "lg" ? "w-16 h-22 text-xl" : "w-14 h-20 text-base";
  if (card.hidden) return (
    <div className={`${sz} rounded-lg border border-[rgba(201,168,76,0.3)] flex items-center justify-center`}
      style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
      <span className="text-[#C9A84C] text-xl">🂠</span>
    </div>
  );
  return (
    <div className={`${sz} rounded-lg bg-white border border-gray-200 flex flex-col items-center justify-between p-1.5 shadow-lg`}>
      <span className={`text-xs font-bold leading-none ${isRed ? "text-red-600" : "text-gray-900"}`}>{card.rank}</span>
      <span className={`text-lg leading-none ${isRed ? "text-red-600" : "text-gray-900"}`}>{card.suit}</span>
      <span className={`text-xs font-bold leading-none rotate-180 ${isRed ? "text-red-600" : "text-gray-900"}`}>{card.rank}</span>
    </div>
  );
}

type Phase = "idle" | "preflop" | "flop" | "turn" | "river" | "showdown";
type Action = "fold" | "call" | "raise" | "check";

interface PokerGameProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  onClose: () => void;
}

export default function PokerGame({ balance, onBalanceChange, onClose }: PokerGameProps) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pot, setPot] = useState(0);
  const [bet, setBet] = useState(1000);
  const [message, setMessage] = useState("Сделайте ставку и начните игру!");
  const [playerFolded, setPlayerFolded] = useState(false);
  const [lastWin, setLastWin] = useState(0);

  const startGame = useCallback(() => {
    if (balance < bet) { setMessage("Недостаточно средств!"); return; }
    const d = makeDeck();
    const pCards = [d.pop()!, d.pop()!];
    const dCards = [d.pop()!, { ...d.pop()!, hidden: true }];
    setDeck(d);
    setPlayerCards(pCards);
    setDealerCards(dCards);
    setCommunityCards([]);
    setPhase("preflop");
    setPot(bet * 2);
    setPlayerFolded(false);
    setLastWin(0);
    setMessage("Префлоп. Ваш ход: колл, рейз или фолд.");
    onBalanceChange(balance - bet);
  }, [balance, bet, onBalanceChange]);

  const dealCommunity = useCallback((d: Card[], count: number, current: Card[]) => {
    const cards = [...current];
    const newDeck = [...d];
    for (let i = 0; i < count; i++) cards.push(newDeck.pop()!);
    return { cards, deck: newDeck };
  }, []);

  const handStrength = useCallback((cards: Card[]): number => {
    const ranks = cards.map(c => RANKS.indexOf(c.rank));
    const suits = cards.map(c => c.suit);
    const rankCounts: Record<number, number> = {};
    ranks.forEach(r => { rankCounts[r] = (rankCounts[r] || 0) + 1; });
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const flush = suits.every(s => s === suits[0]);
    const sortedRanks = [...new Set(ranks)].sort((a, b) => a - b);
    const straight = sortedRanks.length >= 5 && sortedRanks[sortedRanks.length-1] - sortedRanks[0] === sortedRanks.length - 1;
    if (flush && straight) return 800;
    if (counts[0] === 4) return 700;
    if (counts[0] === 3 && counts[1] === 2) return 600;
    if (flush) return 500;
    if (straight) return 400;
    if (counts[0] === 3) return 300;
    if (counts[0] === 2 && counts[1] === 2) return 200;
    if (counts[0] === 2) return 100;
    return Math.max(...ranks);
  }, []);

  const handName = (score: number) => {
    if (score >= 800) return "Стрит-флеш!";
    if (score >= 700) return "Каре!";
    if (score >= 600) return "Фулл-хаус!";
    if (score >= 500) return "Флеш!";
    if (score >= 400) return "Стрит!";
    if (score >= 300) return "Тройка!";
    if (score >= 200) return "Две пары!";
    if (score >= 100) return "Пара!";
    return "Старшая карта";
  };

  const doAction = useCallback((action: Action) => {
    if (phase === "idle" || playerFolded) return;
    let d = [...deck];
    let community = [...communityCards];
    let newPot = pot;

    if (action === "fold") {
      setPlayerFolded(true);
      setDealerCards(prev => prev.map(c => ({ ...c, hidden: false })));
      setPhase("showdown");
      setMessage(`Вы сбросили карты. Дилер забирает банк ₽${pot.toLocaleString()}.`);
      return;
    }
    if (action === "raise") {
      if (balance < bet) { setMessage("Недостаточно средств для рейза!"); return; }
      newPot = pot + bet;
      setPot(newPot);
      onBalanceChange(balance - bet);
    }

    if (phase === "preflop") {
      const res = dealCommunity(d, 3, community);
      community = res.cards; d = res.deck;
      setCommunityCards(community);
      setDeck(d);
      setPhase("flop");
      setMessage("Флоп! Продолжайте...");
    } else if (phase === "flop") {
      const res = dealCommunity(d, 1, community);
      community = res.cards; d = res.deck;
      setCommunityCards(community);
      setDeck(d);
      setPhase("turn");
      setMessage("Тёрн!");
    } else if (phase === "turn") {
      const res = dealCommunity(d, 1, community);
      community = res.cards; d = res.deck;
      setCommunityCards(community);
      setDeck(d);
      setPhase("river");
      setMessage("Ривер! Последняя карта.");
    } else if (phase === "river") {
      const revealedDealer = dealerCards.map(c => ({ ...c, hidden: false }));
      setDealerCards(revealedDealer);
      setPhase("showdown");

      const playerScore = handStrength([...playerCards, ...community]);
      const dealerScore = handStrength([...revealedDealer, ...community]);

      if (playerScore > dealerScore) {
        const winAmount = newPot * 2;
        setLastWin(winAmount);
        onBalanceChange(balance + winAmount);
        setMessage(`Вы победили! ${handName(playerScore)} против ${handName(dealerScore)}. +₽${winAmount.toLocaleString()}`);
      } else if (dealerScore > playerScore) {
        setMessage(`Дилер победил. ${handName(dealerScore)} против ${handName(playerScore)}. Банк: ₽${newPot.toLocaleString()}`);
      } else {
        const half = Math.floor(newPot);
        onBalanceChange(balance + half);
        setMessage(`Ничья! ${handName(playerScore)}. Возврат ₽${half.toLocaleString()}`);
      }
    }
  }, [phase, deck, communityCards, pot, balance, playerCards, dealerCards, playerFolded, bet, dealCommunity, handStrength, onBalanceChange]);

  const betOptions = [500, 1000, 5000, 10000, 50000, 100000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.92)" }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, #0d1a0d, #0a120a)", border: "1px solid rgba(201,168,76,0.3)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(201,168,76,0.15)]">
          <h2 className="font-display text-2xl font-semibold gold-text-gradient">Texas Hold'em Poker</h2>
          <button onClick={onClose} className="text-[#C9A84C]/60 hover:text-[#C9A84C]"><Icon name="X" size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Dealer */}
          <div className="text-center">
            <div className="text-[#C9A84C]/50 text-xs uppercase tracking-wider mb-3">Дилер</div>
            <div className="flex justify-center gap-2">
              {dealerCards.length === 0 ? <div className="text-[#C9A84C]/20 text-sm">Карты не розданы</div>
                : dealerCards.map((c, i) => <CardView key={i} card={c} />)}
            </div>
          </div>

          {/* Community */}
          <div className="text-center">
            <div className="text-[#C9A84C]/50 text-xs uppercase tracking-wider mb-3">Общие карты</div>
            <div className="flex justify-center gap-2">
              {communityCards.length === 0 && phase !== "idle"
                ? <div className="text-[#C9A84C]/20 text-sm">Ждут вскрытия</div>
                : communityCards.map((c, i) => <CardView key={i} card={c} size="lg" />)}
            </div>
          </div>

          {/* Pot & message */}
          <div className="text-center">
            <div className="font-display text-3xl gold-text-gradient font-semibold">₽{pot.toLocaleString()}</div>
            <div className="text-[#C9A84C]/50 text-xs mt-1">Банк</div>
            <div className="mt-3 bg-[rgba(201,168,76,0.05)] rounded-lg px-4 py-2 text-[#E8D5A0] text-sm">{message}</div>
          </div>

          {/* Player cards */}
          <div className="text-center">
            <div className="text-[#C9A84C]/50 text-xs uppercase tracking-wider mb-3">Ваши карты</div>
            <div className="flex justify-center gap-2">
              {playerCards.length === 0 ? <div className="text-[#C9A84C]/20 text-sm">Карты не розданы</div>
                : playerCards.map((c, i) => <CardView key={i} card={c} size="lg" />)}
            </div>
          </div>

          {/* Controls */}
          {phase === "idle" || phase === "showdown" ? (
            <div className="space-y-3">
              <div>
                <div className="text-[#C9A84C]/60 text-xs uppercase tracking-wider mb-2">Ставка</div>
                <div className="flex flex-wrap gap-2">
                  {betOptions.map(b => (
                    <button key={b} onClick={() => setBet(b)}
                      className={`px-3 py-1.5 rounded text-xs transition-all ${bet === b ? "btn-gold" : "btn-outline-gold opacity-60 hover:opacity-100"}`}>
                      ₽{b.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={startGame} className="w-full btn-gold py-3 rounded font-semibold tracking-wider">
                {phase === "showdown" ? "Новая раздача" : "Раздать карты"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => doAction("fold")} className="py-2.5 rounded text-xs font-semibold text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-all">Фолд</button>
              <button onClick={() => doAction("check")} className="py-2.5 rounded text-xs font-semibold btn-outline-gold opacity-80 hover:opacity-100">Чек</button>
              <button onClick={() => doAction("call")} className="py-2.5 rounded text-xs font-semibold btn-outline-gold">Колл</button>
              <button onClick={() => doAction("raise")} className="py-2.5 rounded text-xs font-semibold btn-gold">Рейз +₽{bet.toLocaleString()}</button>
            </div>
          )}

          <div className="flex justify-between text-xs text-[#C9A84C]/40">
            <span>Баланс: ₽{balance.toLocaleString()}</span>
            {lastWin > 0 && <span className="text-green-400">+₽{lastWin.toLocaleString()}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/046444b8-51d5-4f3a-8ce7-af7c787a25de/files/623a3b61-4df1-4888-948e-42f1134d6d92.jpg";
const CARDS_IMAGE = "https://cdn.poehali.dev/projects/046444b8-51d5-4f3a-8ce7-af7c787a25de/files/733ddf07-2afb-48b8-8a47-209df12c70e7.jpg";
const TOURNAMENT_IMAGE = "https://cdn.poehali.dev/projects/046444b8-51d5-4f3a-8ce7-af7c787a25de/files/ff4bea99-52fd-4bff-ac67-41b16a5827b4.jpg";

type Section = "home" | "games" | "tournaments" | "profile" | "cashier" | "promos" | "support" | "about";

const NAV_ITEMS: { id: Section; label: string }[] = [
  { id: "home", label: "Главная" },
  { id: "games", label: "Игры" },
  { id: "tournaments", label: "Турниры" },
  { id: "profile", label: "Профиль" },
  { id: "cashier", label: "Касса" },
  { id: "promos", label: "Промоции" },
  { id: "support", label: "Поддержка" },
  { id: "about", label: "О нас" },
];

const GAMES = [
  { name: "Европейская Рулетка", category: "Рулетка", min: 100, max: 500000, rtp: "97.3%", emoji: "🎡", hot: true },
  { name: "Покер Техасский", category: "Покер", min: 500, max: 1000000, rtp: "99.5%", emoji: "🃏", hot: true },
  { name: "Blackjack Elite", category: "Блэкджек", min: 200, max: 750000, rtp: "99.6%", emoji: "♠️", hot: false },
  { name: "Баккара VIP", category: "Баккара", min: 1000, max: 2000000, rtp: "98.9%", emoji: "👑", hot: false },
  { name: "Слоты Dragon's Gold", category: "Слоты", min: 50, max: 100000, rtp: "96.5%", emoji: "🐉", hot: true },
  { name: "Слоты Golden Empire", category: "Слоты", min: 50, max: 150000, rtp: "97.1%", emoji: "⚜️", hot: false },
  { name: "Крэпс", category: "Кости", min: 300, max: 500000, rtp: "98.6%", emoji: "🎲", hot: false },
  { name: "Кено Лакшери", category: "Лотерея", min: 100, max: 50000, rtp: "92.0%", emoji: "✨", hot: false },
];

const TOURNAMENTS = [
  { name: "Grand Prix Roulette", prize: "₽ 5,000,000", participants: 128, ends: "3 дня", entry: 10000, status: "active" },
  { name: "Poker Masters Elite", prize: "₽ 10,000,000", participants: 64, ends: "7 дней", entry: 25000, status: "active" },
  { name: "Slots Championship", prize: "₽ 2,000,000", participants: 512, ends: "14 дней", entry: 2000, status: "upcoming" },
  { name: "Blackjack Invitational", prize: "₽ 3,500,000", participants: 32, ends: "1 день", entry: 15000, status: "ending" },
];

const PROMOS = [
  { title: "Приветственный бонус", desc: "200% на первый депозит до ₽100 000", badge: "Новым игрокам", icon: "Gift" },
  { title: "Кэшбэк VIP", desc: "До 15% возврата на все проигрыши каждую неделю", badge: "VIP клубы", icon: "RefreshCw" },
  { title: "Реферальная программа", desc: "₽5 000 за каждого приглашённого друга", badge: "Бессрочно", icon: "Users" },
  { title: "Турнирные билеты", desc: "Бесплатные входы в еженедельные турниры", badge: "Каждую неделю", icon: "Ticket" },
];

const FAQS = [
  { q: "Как сделать депозит?", a: "Перейдите в раздел «Касса» и выберите удобный способ пополнения — карта, криптовалюта или электронный кошелёк." },
  { q: "Как вывести выигрыш?", a: "Выводы обрабатываются в течение 24 часов. VIP-игроки получают приоритетную обработку в течение 1 часа." },
  { q: "Что такое RTP?", a: "RTP (Return to Player) — процент возврата ставок игрокам. Чем выше RTP, тем выгоднее игра для игрока." },
  { q: "Есть ли мобильное приложение?", a: "Да, наш сайт полностью адаптирован для мобильных устройств. Также доступны приложения для iOS и Android." },
];

const BET_LIMITS = [
  { type: "Рулетка", min: "₽100", max: "₽500 000", vipMax: "₽2 000 000" },
  { type: "Блэкджек", min: "₽200", max: "₽750 000", vipMax: "₽3 000 000" },
  { type: "Покер", min: "₽500", max: "₽1 000 000", vipMax: "₽5 000 000" },
  { type: "Баккара", min: "₽1 000", max: "₽2 000 000", vipMax: "₽10 000 000" },
  { type: "Слоты", min: "₽50", max: "₽150 000", vipMax: "₽500 000" },
];

export default function Index() {
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [betFilter, setBetFilter] = useState("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleNav = (id: Section) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8D5A0] font-body">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => handleNav("home")} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded gold-gradient flex items-center justify-center text-black font-bold text-sm">RF</div>
              <span className="font-display text-xl font-semibold gold-text-gradient tracking-wide hidden sm:block">Royal Flush</span>
            </button>

            <nav className="hidden lg:flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`nav-link ${activeSection === item.id ? "active" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button className="btn-outline-gold px-4 py-1.5 rounded text-xs font-body tracking-wider hidden sm:block">Войти</button>
              <button className="btn-gold px-4 py-1.5 rounded text-xs tracking-wider">Регистрация</button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-[#C9A84C] ml-1"
              >
                <Icon name={mobileMenuOpen ? "X" : "Menu"} size={22} />
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[rgba(201,168,76,0.1)]" style={{ background: "rgba(10,10,10,0.98)" }}>
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`text-left nav-link py-2 text-sm ${activeSection === item.id ? "active" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="pt-16">
        {/* ==================== HOME ==================== */}
        {activeSection === "home" && (
          <div>
            <section className="relative min-h-[92vh] flex items-center overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${HERO_IMAGE})`, filter: "brightness(0.3)" }}
              />
              <div className="absolute inset-0 pattern-diamonds" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,10,10,0.95) 40%, transparent 100%)" }} />

              <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="divider-gold w-12" />
                    <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase font-body">Премиум казино</span>
                  </div>
                  <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-semibold leading-none mb-6">
                    <span className="gold-text-gradient">Royal</span>
                    <br />
                    <span className="text-[#E8D5A0]">Flush</span>
                    <br />
                    <span className="text-[#E8D5A0] font-light italic">Casino</span>
                  </h1>
                  <p className="text-[#C9A84C]/70 text-lg mb-10 leading-relaxed font-light max-w-lg">
                    Где каждая ставка — произведение искусства. Роскошь, азарт и победы в одном месте.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => handleNav("games")} className="btn-gold px-8 py-3.5 rounded text-sm tracking-wider font-semibold">
                      Начать игру
                    </button>
                    <button onClick={() => handleNav("tournaments")} className="btn-outline-gold px-8 py-3.5 rounded text-sm tracking-wider">
                      Турниры
                    </button>
                  </div>

                  <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg">
                    {[
                      { value: "200+", label: "Игр" },
                      { value: "₽50M+", label: "Призовых" },
                      { value: "24/7", label: "Поддержка" },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="font-display text-3xl font-semibold gold-text-gradient">{s.value}</div>
                        <div className="text-[#C9A84C]/50 text-xs tracking-wider uppercase mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block">
                <div className="stat-card text-center animate-float" style={{ minWidth: 180 }}>
                  <div className="text-4xl mb-2">🎰</div>
                  <div className="font-display text-2xl gold-text-gradient font-semibold">VIP</div>
                  <div className="text-[#C9A84C]/60 text-xs mt-1 tracking-wider">Клуб</div>
                  <div className="divider-gold my-3" />
                  <div className="text-[#E8D5A0]/80 text-xs">Лимиты до ₽10M</div>
                </div>
              </div>
            </section>

            <div className="bg-[#111] border-y border-[rgba(201,168,76,0.15)] py-3 overflow-hidden">
              <div className="flex gap-16 whitespace-nowrap" style={{ animation: "scroll 30s linear infinite" }}>
                {[...Array(2)].map((_, rep) =>
                  ["🏆 Александр выиграл ₽125,000 в Рулетку", "💎 Мария сорвала джекпот ₽500,000", "♠️ Дмитрий победил в покерном турнире", "🎰 Екатерина выиграла ₽75,000 в слоты", "🎡 Николай снял ₽300,000 с Рулетки", "👑 VIP-игрок выиграл ₽2,000,000"].map((item, i) => (
                    <span key={`${rep}-${i}`} className="text-sm text-[#C9A84C]/70 flex-shrink-0">{item}</span>
                  ))
                )}
              </div>
              <style>{`@keyframes scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
            </div>

            <section className="max-w-7xl mx-auto px-6 py-20">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="divider-gold w-8" />
                    <span className="text-[#C9A84C] text-xs tracking-[0.25em] uppercase">Популярное</span>
                  </div>
                  <h2 className="section-heading text-[#E8D5A0]">Горячие игры</h2>
                </div>
                <button onClick={() => handleNav("games")} className="btn-outline-gold px-5 py-2 rounded text-xs tracking-wider hidden sm:flex items-center gap-2">
                  Все игры <Icon name="ArrowRight" size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {GAMES.filter(g => g.hot).map((game) => (
                  <div key={game.name} className="game-card p-5 group">
                    <div className="text-4xl mb-4">{game.emoji}</div>
                    <div className="font-display text-lg font-semibold text-[#E8D5A0] mb-1">{game.name}</div>
                    <div className="text-[#C9A84C]/50 text-xs mb-3">{game.category}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#C9A84C] text-xs">RTP {game.rtp}</span>
                      <span className="bg-[#C9A84C]/10 text-[#C9A84C] text-xs px-2 py-0.5 rounded">Хит</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-y border-[rgba(201,168,76,0.1)] pattern-diamonds py-20">
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { icon: "Shield", title: "Лицензировано", desc: "Работаем по лицензии Malta Gaming Authority. Честная игра гарантирована." },
                    { icon: "Zap", title: "Мгновенные выплаты", desc: "VIP-игроки получают выплаты в течение 1 часа. Стандарт — 24 часа." },
                    { icon: "Lock", title: "SSL Шифрование", desc: "Все данные и транзакции защищены 256-битным SSL шифрованием." },
                  ].map((f) => (
                    <div key={f.title} className="flex gap-5">
                      <div className="w-12 h-12 rounded border border-[rgba(201,168,76,0.3)] flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,168,76,0.05)" }}>
                        <Icon name={f.icon} size={20} className="text-[#C9A84C]" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-semibold text-[#E8D5A0] mb-2">{f.title}</h3>
                        <p className="text-[#C9A84C]/60 text-sm leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-20">
              <div className="relative rounded-2xl overflow-hidden glow-gold" style={{ background: "linear-gradient(135deg, #1a0f00, #2a1800, #1a0f00)" }}>
                <div className="absolute inset-0 pattern-diamonds opacity-50" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12">
                  <div>
                    <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase mb-3 block">Добро пожаловать</span>
                    <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#E8D5A0] mb-4">
                      Бонус 200%<br />
                      <span className="gold-text-gradient">до ₽100 000</span>
                    </h2>
                    <p className="text-[#C9A84C]/60 text-sm max-w-md">На первый депозит для новых игроков. Минимальный депозит ₽1 000.</p>
                  </div>
                  <button className="btn-gold px-10 py-4 rounded text-sm tracking-wider font-semibold whitespace-nowrap">
                    Получить бонус
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================== GAMES ==================== */}
        {activeSection === "games" && (
          <section className="max-w-7xl mx-auto px-6 py-16">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="divider-gold w-8" />
                <span className="text-[#C9A84C] text-xs tracking-[0.25em] uppercase">Каталог</span>
              </div>
              <h1 className="section-heading text-[#E8D5A0] mb-2">Игры казино</h1>
              <p className="text-[#C9A84C]/60 text-sm">Выберите игру и установите размер ставки</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
              {["all", "Рулетка", "Покер", "Блэкджек", "Баккара", "Слоты", "Кости"].map((f) => (
                <button
                  key={f}
                  onClick={() => setBetFilter(f)}
                  className={`px-4 py-1.5 rounded text-xs tracking-wider transition-all ${betFilter === f ? "btn-gold" : "btn-outline-gold opacity-60 hover:opacity-100"}`}
                >
                  {f === "all" ? "Все игры" : f}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
              {GAMES.filter(g => betFilter === "all" || g.category === betFilter).map((game) => (
                <div key={game.name} className="game-card group">
                  <div className="p-5 pb-0">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-5xl">{game.emoji}</span>
                      {game.hot && <span className="bg-[rgba(139,26,42,0.3)] text-[#ff6b7a] text-[10px] px-2 py-0.5 rounded border border-[rgba(255,107,122,0.2)]">🔥 Хит</span>}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-[#E8D5A0] mb-1">{game.name}</h3>
                    <span className="text-[#C9A84C]/50 text-xs">{game.category}</span>
                  </div>
                  <div className="p-5 pt-4">
                    <div className="divider-gold mb-4" />
                    <div className="grid grid-cols-2 gap-3 text-xs mb-5">
                      <div>
                        <div className="text-[#C9A84C]/40 mb-1">Мин. ставка</div>
                        <div className="text-[#E8D5A0]">₽{game.min.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[#C9A84C]/40 mb-1">Макс. ставка</div>
                        <div className="text-[#E8D5A0]">₽{game.max.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[#C9A84C]/40 mb-1">RTP</div>
                        <div className="text-[#C9A84C]">{game.rtp}</div>
                      </div>
                    </div>
                    <button className="w-full btn-gold py-2.5 rounded text-xs tracking-wider">Играть</button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="font-display text-3xl font-semibold text-[#E8D5A0] mb-6">Лимиты ставок</h2>
              <div className="overflow-x-auto scrollbar-thin rounded-xl border border-[rgba(201,168,76,0.15)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "rgba(201,168,76,0.08)" }}>
                      <th className="text-left px-6 py-4 text-[#C9A84C] font-body font-medium text-xs tracking-wider uppercase">Тип игры</th>
                      <th className="text-left px-6 py-4 text-[#C9A84C] font-body font-medium text-xs tracking-wider uppercase">Мин. ставка</th>
                      <th className="text-left px-6 py-4 text-[#C9A84C] font-body font-medium text-xs tracking-wider uppercase">Стандарт макс.</th>
                      <th className="text-left px-6 py-4 text-[#C9A84C] font-body font-medium text-xs tracking-wider uppercase">VIP макс.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BET_LIMITS.map((row) => (
                      <tr key={row.type} className="border-t border-[rgba(201,168,76,0.08)] hover:bg-[rgba(201,168,76,0.03)] transition-colors">
                        <td className="px-6 py-4 text-[#E8D5A0] font-medium">{row.type}</td>
                        <td className="px-6 py-4 text-[#C9A84C]/70">{row.min}</td>
                        <td className="px-6 py-4 text-[#C9A84C]/70">{row.max}</td>
                        <td className="px-6 py-4">
                          <span className="text-[#C9A84C] bg-[rgba(201,168,76,0.1)] px-2 py-0.5 rounded text-xs">{row.vipMax}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[#C9A84C]/40 text-xs mt-4">* VIP лимиты доступны игрокам с уровнем Gold и выше.</p>
            </div>
          </section>
        )}

        {/* ==================== TOURNAMENTS ==================== */}
        {activeSection === "tournaments" && (
          <section className="max-w-7xl mx-auto px-6 py-16">
            <div className="relative rounded-2xl overflow-hidden mb-12 h-64">
              <img src={TOURNAMENT_IMAGE} alt="Турниры" className="w-full h-full object-cover" style={{ filter: "brightness(0.4)" }} />
              <div className="absolute inset-0 flex items-center px-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="divider-gold w-8" />
                    <span className="text-[#C9A84C] text-xs tracking-[0.25em] uppercase">Соревнования</span>
                  </div>
                  <h1 className="section-heading text-[#E8D5A0]">Турниры</h1>
                  <p className="text-[#C9A84C]/70 text-sm mt-2">Общий призовой фонд этого месяца: <span className="text-[#C9A84C] font-semibold">₽20 500 000</span></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TOURNAMENTS.map((t) => (
                <div key={t.name} className="card-luxury rounded-xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-display text-2xl font-semibold text-[#E8D5A0] mb-1">{t.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded border ${
                          t.status === "active" ? "text-green-400 border-green-400/30 bg-green-400/5" :
                          t.status === "ending" ? "text-orange-400 border-orange-400/30 bg-orange-400/5" :
                          "text-blue-400 border-blue-400/30 bg-blue-400/5"
                        }`}>
                          {t.status === "active" ? "● Активный" : t.status === "ending" ? "⚡ Скоро финал" : "○ Скоро начало"}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-2xl font-semibold gold-text-gradient">{t.prize}</div>
                        <div className="text-[#C9A84C]/40 text-xs">призовой фонд</div>
                      </div>
                    </div>
                    <div className="divider-gold mb-4" />
                    <div className="grid grid-cols-3 gap-4 mb-5 text-xs">
                      <div>
                        <div className="text-[#C9A84C]/40 mb-1 uppercase tracking-wider">Участники</div>
                        <div className="text-[#E8D5A0]">{t.participants}</div>
                      </div>
                      <div>
                        <div className="text-[#C9A84C]/40 mb-1 uppercase tracking-wider">Взнос</div>
                        <div className="text-[#E8D5A0]">₽{t.entry.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[#C9A84C]/40 mb-1 uppercase tracking-wider">До финала</div>
                        <div className="text-[#E8D5A0]">{t.ends}</div>
                      </div>
                    </div>
                    <button className="w-full btn-gold py-3 rounded text-xs tracking-wider font-semibold">
                      {t.status === "upcoming" ? "Зарегистрироваться" : "Участвовать"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <h2 className="font-display text-3xl font-semibold text-[#E8D5A0] mb-6">Таблица лидеров — Текущий месяц</h2>
              <div className="rounded-xl overflow-hidden border border-[rgba(201,168,76,0.15)]">
                {[
                  { rank: 1, name: "AlphaPlayer_99", wins: 47, total: "₽2,450,000", badge: "👑" },
                  { rank: 2, name: "LuckyStrike_M", wins: 39, total: "₽1,890,000", badge: "🥈" },
                  { rank: 3, name: "RoyalAce_777", wins: 35, total: "₽1,560,000", badge: "🥉" },
                  { rank: 4, name: "GoldenPoker_K", wins: 28, total: "₽980,000", badge: "" },
                  { rank: 5, name: "NightOwl_Casino", wins: 24, total: "₽750,000", badge: "" },
                ].map((p, i) => (
                  <div key={p.rank} className={`flex items-center gap-4 px-6 py-4 border-b border-[rgba(201,168,76,0.08)] last:border-0 ${i < 3 ? "bg-[rgba(201,168,76,0.03)]" : ""}`}>
                    <div className={`w-8 text-center font-display text-xl font-semibold ${i === 0 ? "gold-text-gradient" : "text-[#C9A84C]/40"}`}>
                      {p.badge || p.rank}
                    </div>
                    <div className="flex-1 text-[#E8D5A0] text-sm">{p.name}</div>
                    <div className="text-[#C9A84C]/50 text-xs hidden sm:block">{p.wins} побед</div>
                    <div className="text-[#C9A84C] text-sm font-medium">{p.total}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== PROFILE ==================== */}
        {activeSection === "profile" && (
          <section className="max-w-5xl mx-auto px-6 py-16">
            <div className="flex items-center gap-3 mb-3">
              <div className="divider-gold w-8" />
              <span className="text-[#C9A84C] text-xs tracking-[0.25em] uppercase">Аккаунт</span>
            </div>
            <h1 className="section-heading text-[#E8D5A0] mb-10">Мой профиль</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card-luxury rounded-xl p-6 text-center">
                <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center text-3xl mx-auto mb-4">👤</div>
                <h2 className="font-display text-2xl font-semibold text-[#E8D5A0] mb-1">Игрок</h2>
                <div className="text-[#C9A84C]/60 text-sm mb-4">user@example.com</div>
                <div className="inline-flex items-center gap-2 bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] rounded-full px-4 py-1.5">
                  <span className="text-sm">👑</span>
                  <span className="text-[#C9A84C] text-xs font-semibold tracking-wider">VIP Gold</span>
                </div>
                <div className="divider-gold my-5" />
                <div className="text-xs text-[#C9A84C]/40">ID: RF-284756</div>
                <div className="text-xs text-[#C9A84C]/40 mt-1">Участник с: Январь 2024</div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Баланс", value: "₽45,200", icon: "Wallet" },
                    { label: "Всего выигрышей", value: "₽284,500", icon: "TrendingUp" },
                    { label: "Игр сыграно", value: "1,247", icon: "Gamepad2" },
                    { label: "Турниров", value: "23", icon: "Trophy" },
                  ].map((s) => (
                    <div key={s.label} className="stat-card">
                      <Icon name={s.icon} size={16} className="text-[#C9A84C]/60 mb-2" />
                      <div className="font-display text-2xl font-semibold gold-text-gradient">{s.value}</div>
                      <div className="text-[#C9A84C]/40 text-xs mt-1 uppercase tracking-wider">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="card-luxury rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#E8D5A0] text-sm font-medium">VIP Прогресс</span>
                    <span className="text-[#C9A84C] text-xs">Gold → Platinum</span>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-full h-2 mb-2 overflow-hidden">
                    <div className="h-full rounded-full gold-gradient" style={{ width: "67%" }} />
                  </div>
                  <div className="flex justify-between text-xs text-[#C9A84C]/40">
                    <span>67,000 очков</span>
                    <span>100,000 до Platinum</span>
                  </div>
                </div>

                <div className="card-luxury rounded-xl p-6">
                  <h3 className="font-display text-lg font-semibold text-[#E8D5A0] mb-4">Последние игры</h3>
                  <div className="space-y-3">
                    {[
                      { game: "Европейская Рулетка", result: "+₽12,500", time: "2 ч. назад", win: true },
                      { game: "Blackjack Elite", result: "-₽3,000", time: "5 ч. назад", win: false },
                      { game: "Poker Masters", result: "+₽28,000", time: "Вчера", win: true },
                      { game: "Слоты Dragon's Gold", result: "+₽5,400", time: "Вчера", win: true },
                    ].map((a, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-[rgba(201,168,76,0.06)] last:border-0">
                        <span className="text-[#E8D5A0]/80 text-sm">{a.game}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#C9A84C]/40 text-xs">{a.time}</span>
                          <span className={`text-sm font-medium ${a.win ? "text-green-400" : "text-red-400"}`}>{a.result}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==================== CASHIER ==================== */}
        {activeSection === "cashier" && (
          <section className="max-w-4xl mx-auto px-6 py-16">
            <div className="flex items-center gap-3 mb-3">
              <div className="divider-gold w-8" />
              <span className="text-[#C9A84C] text-xs tracking-[0.25em] uppercase">Финансы</span>
            </div>
            <h1 className="section-heading text-[#E8D5A0] mb-10">Касса</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {[
                { label: "Основной баланс", value: "₽45,200", icon: "Wallet" },
                { label: "Бонусный баланс", value: "₽12,800", icon: "Gift" },
                { label: "Ожидает вывода", value: "₽0", icon: "Clock" },
              ].map((b) => (
                <div key={b.label} className="stat-card flex items-center gap-4">
                  <div className="w-10 h-10 rounded border border-[rgba(201,168,76,0.3)] flex items-center justify-center" style={{ background: "rgba(201,168,76,0.05)" }}>
                    <Icon name={b.icon} size={18} className="text-[#C9A84C]" />
                  </div>
                  <div>
                    <div className="font-display text-xl font-semibold gold-text-gradient">{b.value}</div>
                    <div className="text-[#C9A84C]/40 text-xs">{b.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="card-luxury rounded-xl p-6">
                <h2 className="font-display text-2xl font-semibold text-[#E8D5A0] mb-6">Пополнение</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-[#C9A84C]/60 text-xs uppercase tracking-wider mb-2 block">Способ оплаты</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["💳 Карта", "₿ Крипто", "💰 Qiwi", "📱 СБП"].map((m) => (
                        <button key={m} className="btn-outline-gold py-2 rounded text-xs opacity-70 hover:opacity-100">{m}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[#C9A84C]/60 text-xs uppercase tracking-wider mb-2 block">Сумма пополнения</label>
                    <div className="bg-[#111] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 flex items-center gap-2">
                      <span className="text-[#C9A84C]">₽</span>
                      <input type="number" placeholder="1 000" className="bg-transparent text-[#E8D5A0] text-sm outline-none flex-1" />
                    </div>
                    <div className="flex gap-2 mt-2">
                      {["1 000", "5 000", "10 000", "50 000"].map((v) => (
                        <button key={v} className="flex-1 bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] rounded py-1 text-[#C9A84C] text-xs hover:border-[#C9A84C] transition-colors">{v}</button>
                      ))}
                    </div>
                  </div>
                  <button className="w-full btn-gold py-3 rounded text-sm tracking-wider font-semibold mt-2">Пополнить</button>
                </div>
              </div>

              <div className="card-luxury rounded-xl p-6">
                <h2 className="font-display text-2xl font-semibold text-[#E8D5A0] mb-6">Вывод средств</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-[#C9A84C]/60 text-xs uppercase tracking-wider mb-2 block">Метод вывода</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["💳 Карта", "₿ Крипто", "🏦 Банк", "📱 СБП"].map((m) => (
                        <button key={m} className="btn-outline-gold py-2 rounded text-xs opacity-70 hover:opacity-100">{m}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[#C9A84C]/60 text-xs uppercase tracking-wider mb-2 block">Сумма вывода</label>
                    <div className="bg-[#111] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 flex items-center gap-2">
                      <span className="text-[#C9A84C]">₽</span>
                      <input type="number" placeholder="1 000" className="bg-transparent text-[#E8D5A0] text-sm outline-none flex-1" />
                    </div>
                  </div>
                  <div className="bg-[rgba(201,168,76,0.04)] border border-[rgba(201,168,76,0.1)] rounded p-3">
                    <div className="text-[#C9A84C]/50 text-xs">VIP Gold: вывод за 1 час · Стандарт: 24 часа · Мин. вывод: ₽1 000</div>
                  </div>
                  <button className="w-full btn-outline-gold py-3 rounded text-sm tracking-wider font-semibold">Вывести</button>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-[#E8D5A0] mb-4">История транзакций</h2>
              <div className="rounded-xl overflow-hidden border border-[rgba(201,168,76,0.15)]">
                {[
                  { type: "Пополнение", amount: "+₽20,000", method: "Карта", date: "01.04.2026", status: "Выполнен" },
                  { type: "Вывод", amount: "-₽10,000", method: "СБП", date: "28.03.2026", status: "Выполнен" },
                  { type: "Бонус", amount: "+₽5,000", method: "Реферал", date: "25.03.2026", status: "Зачислен" },
                  { type: "Пополнение", amount: "+₽50,000", method: "Крипто", date: "20.03.2026", status: "Выполнен" },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-[rgba(201,168,76,0.06)] last:border-0 text-sm hover:bg-[rgba(201,168,76,0.02)] transition-colors">
                    <div className="flex-1 text-[#E8D5A0]">{tx.type}</div>
                    <div className="text-[#C9A84C]/50 hidden sm:block">{tx.method}</div>
                    <div className="text-[#C9A84C]/40 text-xs">{tx.date}</div>
                    <div className={tx.amount.startsWith("+") ? "text-green-400" : "text-red-400"}>{tx.amount}</div>
                    <div className="text-[#C9A84C]/40 text-xs bg-[rgba(201,168,76,0.05)] px-2 py-0.5 rounded">{tx.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== PROMOS ==================== */}
        {activeSection === "promos" && (
          <section className="max-w-6xl mx-auto px-6 py-16">
            <div className="flex items-center gap-3 mb-3">
              <div className="divider-gold w-8" />
              <span className="text-[#C9A84C] text-xs tracking-[0.25em] uppercase">Акции</span>
            </div>
            <h1 className="section-heading text-[#E8D5A0] mb-2">Промоции</h1>
            <p className="text-[#C9A84C]/60 text-sm mb-12">Эксклюзивные предложения для игроков Royal Flush Casino</p>

            <div className="relative rounded-2xl overflow-hidden mb-10 glow-gold" style={{ background: "linear-gradient(135deg, #1a0f00, #2d1a00, #1a0f00)" }}>
              <div className="absolute inset-0 pattern-diamonds" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
                <div className="text-7xl animate-float">🎁</div>
                <div className="flex-1">
                  <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase mb-3 block">Только сейчас</span>
                  <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#E8D5A0] mb-3">
                    Приветственный пакет<br />
                    <span className="gold-text-gradient">200% + ₽100 000</span>
                  </h2>
                  <p className="text-[#C9A84C]/60 text-sm max-w-lg">На первые три депозита. Вейджер x35. Срок действия — 30 дней с момента зачисления бонуса.</p>
                </div>
                <button className="btn-gold px-8 py-4 rounded text-sm tracking-wider font-semibold whitespace-nowrap">Получить</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {PROMOS.map((p) => (
                <div key={p.title} className="card-luxury rounded-xl p-6">
                  <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                    <Icon name={p.icon} size={20} className="text-[#C9A84C]" />
                  </div>
                  <span className="text-[#C9A84C]/50 text-xs uppercase tracking-wider mb-2 block">{p.badge}</span>
                  <h3 className="font-display text-xl font-semibold text-[#E8D5A0] mb-3">{p.title}</h3>
                  <p className="text-[#C9A84C]/60 text-sm mb-5 leading-relaxed">{p.desc}</p>
                  <button className="w-full btn-outline-gold py-2 rounded text-xs tracking-wider">Подробнее</button>
                </div>
              ))}
            </div>

            <div className="card-luxury rounded-xl p-8">
              <h2 className="font-display text-3xl font-semibold text-[#E8D5A0] mb-2">VIP Программа</h2>
              <p className="text-[#C9A84C]/60 text-sm mb-8">Четыре уровня привилегий — от Bronze до Diamond</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { level: "Bronze", icon: "🥉", perks: ["Кэшбэк 5%", "Вывод 48ч"], color: "#CD7F32" },
                  { level: "Silver", icon: "🥈", perks: ["Кэшбэк 8%", "Вывод 24ч"], color: "#C0C0C0" },
                  { level: "Gold", icon: "👑", perks: ["Кэшбэк 12%", "Вывод 1ч"], color: "#C9A84C" },
                  { level: "Diamond", icon: "💎", perks: ["Кэшбэк 15%", "Вывод 30мин"], color: "#88CCEE" },
                ].map((v) => (
                  <div key={v.level} className="rounded-xl p-5 text-center" style={{ background: "rgba(201,168,76,0.04)", border: `1px solid ${v.color}30` }}>
                    <div className="text-4xl mb-3">{v.icon}</div>
                    <div className="font-display text-lg font-semibold mb-3" style={{ color: v.color }}>{v.level}</div>
                    {v.perks.map((perk) => (
                      <div key={perk} className="text-[#C9A84C]/60 text-xs mb-1">{perk}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== SUPPORT ==================== */}
        {activeSection === "support" && (
          <section className="max-w-4xl mx-auto px-6 py-16">
            <div className="flex items-center gap-3 mb-3">
              <div className="divider-gold w-8" />
              <span className="text-[#C9A84C] text-xs tracking-[0.25em] uppercase">Помощь</span>
            </div>
            <h1 className="section-heading text-[#E8D5A0] mb-10">Поддержка 24/7</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
              {[
                { icon: "MessageCircle", title: "Живой чат", desc: "Среднее время ответа: 2 минуты", action: "Написать" },
                { icon: "Mail", title: "Email", desc: "support@royalflush.casino", action: "Отправить" },
                { icon: "Phone", title: "Телефон VIP", desc: "+7 (800) 000-00-00 (бесплатно)", action: "Позвонить" },
              ].map((c) => (
                <div key={c.title} className="card-luxury rounded-xl p-6 text-center">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                    <Icon name={c.icon} size={22} className="text-[#C9A84C]" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#E8D5A0] mb-2">{c.title}</h3>
                  <p className="text-[#C9A84C]/50 text-xs mb-5">{c.desc}</p>
                  <button className="btn-gold px-6 py-2 rounded text-xs tracking-wider w-full">{c.action}</button>
                </div>
              ))}
            </div>

            <div className="mb-12">
              <h2 className="font-display text-3xl font-semibold text-[#E8D5A0] mb-6">Частые вопросы</h2>
              <div className="space-y-3">
                {FAQS.map((faq, i) => (
                  <div key={i} className="card-luxury rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left"
                    >
                      <span className="text-[#E8D5A0] text-sm font-medium">{faq.q}</span>
                      <Icon name={openFaq === i ? "ChevronUp" : "ChevronDown"} size={16} className="text-[#C9A84C] flex-shrink-0 ml-4" />
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-5 border-t border-[rgba(201,168,76,0.08)]">
                        <p className="text-[#C9A84C]/70 text-sm leading-relaxed pt-4">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card-luxury rounded-xl p-8">
              <h2 className="font-display text-2xl font-semibold text-[#E8D5A0] mb-6">Отправить запрос</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Имя", "Email"].map((f) => (
                  <div key={f}>
                    <label className="text-[#C9A84C]/60 text-xs uppercase tracking-wider mb-2 block">{f}</label>
                    <input type="text" placeholder={f} className="w-full bg-[#111] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-[#E8D5A0] text-sm outline-none focus:border-[#C9A84C] transition-colors" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-[#C9A84C]/60 text-xs uppercase tracking-wider mb-2 block">Сообщение</label>
                  <textarea rows={4} placeholder="Опишите проблему или вопрос..." className="w-full bg-[#111] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-[#E8D5A0] text-sm outline-none focus:border-[#C9A84C] transition-colors resize-none" />
                </div>
              </div>
              <button className="btn-gold px-8 py-3 rounded text-sm tracking-wider font-semibold mt-4">Отправить</button>
            </div>
          </section>
        )}

        {/* ==================== ABOUT ==================== */}
        {activeSection === "about" && (
          <section>
            <div className="relative h-72 overflow-hidden">
              <img src={CARDS_IMAGE} alt="О нас" className="w-full h-full object-cover" style={{ filter: "brightness(0.3)" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="divider-gold w-12" />
                    <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">История</span>
                    <div className="divider-gold w-12" />
                  </div>
                  <h1 className="section-heading text-[#E8D5A0]">О Royal Flush Casino</h1>
                </div>
              </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-[#E8D5A0] mb-5">Наша история</h2>
                  <p className="text-[#C9A84C]/70 text-sm leading-relaxed mb-4">
                    Royal Flush Casino — премиум-платформа для онлайн-гемблинга, основанная в 2018 году. Мы создавали это место для тех, кто ценит истинную роскошь и справедливую игру.
                  </p>
                  <p className="text-[#C9A84C]/70 text-sm leading-relaxed">
                    За шесть лет мы выросли до более чем 500 000 игроков по всему миру, выплатив суммарно свыше ₽2 миллиардов в выигрышах. Наши ценности — честность, прозрачность и забота об игроках.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "500K+", label: "Игроков" },
                    { value: "₽2B+", label: "Выплачено" },
                    { value: "200+", label: "Игр" },
                    { value: "6 лет", label: "На рынке" },
                  ].map((s) => (
                    <div key={s.label} className="stat-card text-center">
                      <div className="font-display text-3xl font-semibold gold-text-gradient mb-1">{s.value}</div>
                      <div className="text-[#C9A84C]/50 text-xs uppercase tracking-wider">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="divider-gold mb-16" />

              <div className="mb-16">
                <h2 className="font-display text-3xl font-semibold text-[#E8D5A0] mb-8 text-center">Лицензии и безопасность</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { icon: "Award", title: "Malta Gaming Authority", desc: "Лицензия MGA/CRP/148/2007, действует с 2018 года" },
                    { icon: "Shield", title: "eCOGRA Certified", desc: "Сертификат честной игры и защиты игроков" },
                    { icon: "Lock", title: "SSL 256-bit", desc: "Все транзакции и данные зашифрованы" },
                  ].map((l) => (
                    <div key={l.title} className="card-luxury rounded-xl p-6 flex gap-4">
                      <div className="w-12 h-12 rounded border border-[rgba(201,168,76,0.3)] flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,168,76,0.05)" }}>
                        <Icon name={l.icon} size={20} className="text-[#C9A84C]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#E8D5A0] text-sm mb-1">{l.title}</h3>
                        <p className="text-[#C9A84C]/50 text-xs leading-relaxed">{l.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-8 text-center" style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}>
                <Icon name="Heart" size={32} className="text-[#C9A84C] mx-auto mb-4" />
                <h2 className="font-display text-2xl font-semibold text-[#E8D5A0] mb-3">Ответственная игра</h2>
                <p className="text-[#C9A84C]/60 text-sm max-w-lg mx-auto leading-relaxed mb-5">
                  Мы заботимся о наших игроках. Royal Flush Casino предоставляет инструменты самоограничения: лимиты на депозиты, временные паузы и полное самоисключение.
                </p>
                <button className="btn-outline-gold px-6 py-2 rounded text-xs tracking-wider">Узнать больше</button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(201,168,76,0.1)] mt-20" style={{ background: "#080808" }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded gold-gradient flex items-center justify-center text-black font-bold text-sm">RF</div>
                <span className="font-display text-xl font-semibold gold-text-gradient">Royal Flush</span>
              </div>
              <p className="text-[#C9A84C]/40 text-xs leading-relaxed">Премиум казино с лицензией MGA. Играй ответственно.</p>
            </div>
            {[
              { title: "Игры", links: ["Рулетка", "Покер", "Блэкджек", "Слоты"] },
              { title: "Аккаунт", links: ["Регистрация", "Войти", "Профиль", "Касса"] },
              { title: "Компания", links: ["О нас", "Лицензии", "Поддержка", "Блог"] },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-semibold mb-4">{col.title}</h3>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button className="text-[#C9A84C]/40 text-xs hover:text-[#C9A84C] transition-colors">{link}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="divider-gold mb-6" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#C9A84C]/30">
            <span>© 2024 Royal Flush Casino. Все права защищены.</span>
            <span>18+ | Играйте ответственно | MGA Licensed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
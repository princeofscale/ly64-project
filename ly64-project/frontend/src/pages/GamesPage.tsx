import { Rocket, Disc3, ChevronRight, Coins, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../store/authStore';

const GAMES = [
  {
    id: 'rocket',
    href: '/rocket',
    title: 'Ракетка',
    subtitle: 'Краш-игра',
    description: 'Делай ставку и забирай выигрыш до того, как ракета взорвётся. Чем дольше ждёшь — тем выше множитель.',
    icon: Rocket,
    gradient: 'from-indigo-900 via-violet-900 to-slate-900',
    borderGlow: 'hover:shadow-violet-500/30',
    accentColor: 'text-violet-400',
    accentBg: 'bg-violet-500/20',
    badge: 'Мультиплеер',
    badgeColor: 'bg-violet-500/30 text-violet-200 border-violet-500/40',
    stats: [
      { icon: TrendingUp, label: 'Макс. множитель', value: '100×' },
      { icon: Coins, label: 'Ставка', value: 'Рутении' },
      { icon: Zap, label: 'Тип', value: 'Краш' },
    ],
    preview: (
      <div className="relative w-full h-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 to-transparent z-10" />
        <svg viewBox="0 0 200 100" className="w-full h-full opacity-60">
          <defs>
            <linearGradient id="rocketLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <polyline
            points="10,90 40,70 80,45 130,20 170,8"
            fill="none"
            stroke="url(#rocketLine)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="170" cy="8" r="4" fill="#c4b5fd" />
          <text x="130" y="35" fill="#a78bfa" fontSize="18" fontWeight="bold" opacity="0.9">3.72×</text>
        </svg>
      </div>
    ),
  },
  {
    id: 'roulette',
    href: '/roulette',
    title: 'Европейская рулетка',
    subtitle: 'Казино',
    description: 'Классическая европейская рулетка с 37 секторами. Ставки на числа, цвета, чётность и дюжины. Демо-режим.',
    icon: Disc3,
    gradient: 'from-emerald-950 via-teal-950 to-slate-900',
    borderGlow: 'hover:shadow-emerald-500/30',
    accentColor: 'text-amber-400',
    accentBg: 'bg-amber-500/20',
    badge: 'Демо-режим',
    badgeColor: 'bg-emerald-500/30 text-emerald-200 border-emerald-500/40',
    stats: [
      { icon: Disc3, label: 'Секторов', value: '37' },
      { icon: Coins, label: 'Выплата', value: 'до 35×' },
      { icon: Zap, label: 'Тип', value: 'Рулетка' },
    ],
    preview: (
      <div className="relative w-full h-32 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 to-transparent z-10" />
        <svg viewBox="-60 -60 120 120" className="w-28 h-28 opacity-70">
          {Array.from({ length: 37 }, (_, i) => {
            const angle = (i * 360) / 37 - 90;
            const rad = (angle * Math.PI) / 180;
            const r = 55;
            const x1 = r * Math.cos(rad);
            const y1 = r * Math.sin(rad);
            const angle2 = ((i + 1) * 360) / 37 - 90;
            const rad2 = (angle2 * Math.PI) / 180;
            const x2 = r * Math.cos(rad2);
            const y2 = r * Math.sin(rad2);
            const red = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
            const fill = i === 0 ? '#059669' : red.has(i) ? '#dc2626' : '#0f172a';
            return (
              <path
                key={i}
                d={`M 0 0 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                fill={fill}
                stroke="#fbbf24"
                strokeWidth="0.5"
              />
            );
          })}
          <circle r="16" fill="#78350f" />
          <circle r="6" fill="#fbbf24" />
        </svg>
      </div>
    ),
  },
];

export default function GamesPage() {
  const { user } = useAuthStore();
  const balance = user?.rutheniumBalance ?? 0;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.08)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 20px)',
        }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
            Мини-игры
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            Выбери игру
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            Испытай удачу в краш-игре или классической рулетке
          </p>
          {balance > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-amber-200 font-bold tabular-nums text-sm">
                {balance.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ɍ
              </span>
              <span className="text-amber-400/60 text-xs">на балансе</span>
            </div>
          )}
        </div>

        {/* Game cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {GAMES.map((game) => {
            const Icon = game.icon;
            return (
              <Link
                key={game.id}
                to={game.href}
                className={`group relative rounded-3xl bg-gradient-to-br ${game.gradient} border border-white/8 overflow-hidden shadow-2xl ${game.borderGlow} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
              >
                {/* Preview area */}
                {game.preview}

                {/* Content */}
                <div className="p-6 pt-2">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${game.accentBg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${game.accentColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-black text-white">{game.title}</h2>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${game.badgeColor}`}>
                            {game.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{game.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all mt-1" />
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    {game.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3">
                    {game.stats.map((stat, i) => {
                      const StatIcon = stat.icon;
                      return (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                          <StatIcon className={`w-3 h-3 ${game.accentColor}`} />
                          <span className="text-slate-300 font-semibold">{stat.value}</span>
                          <span>{stat.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-3xl ring-1 ring-white/0 group-hover:ring-white/10 transition-all duration-300 pointer-events-none" />
              </Link>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-600 text-sm mt-10">
          Ракетка использует рутении с твоего баланса · Рулетка работает в демо-режиме с виртуальными фишками
        </p>
      </div>
    </div>
  );
}

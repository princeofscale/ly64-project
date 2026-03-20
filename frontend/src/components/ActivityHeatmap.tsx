import { useMemo, useState } from 'react';

interface HeatmapDay {
  date: string;
  count: number;
  points: number;
}

interface Props {
  data: HeatmapDay[];
}

const DAYS = ['Пн', '', 'Ср', '', 'Пт', '', 'Вс'];
const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

const LEVEL_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-slate-100 dark:bg-slate-800',
  1: 'bg-violet-200',
  2: 'bg-violet-400',
  3: 'bg-violet-600',
  4: 'bg-violet-800',
};

export function ActivityHeatmap({ data }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: HeatmapDay } | null>(null);

  // Build a map date → data for O(1) lookup
  const dataMap = useMemo(() => {
    const m = new Map<string, HeatmapDay>();
    for (const d of data) m.set(d.date, d);
    return m;
  }, [data]);

  // Build 52 complete weeks ending today (Sun → Sat grid, starting Monday)
  const weeks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the most recent Monday on or before today
    const dayOfWeek = today.getDay(); // 0=Sun … 6=Sat
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysToMonday);

    // 52 weeks = 364 days back from lastMonday
    const startDate = new Date(lastMonday);
    startDate.setDate(startDate.getDate() - 51 * 7);

    const result: Array<Array<{ date: string; isoDate: string; inRange: boolean }>> = [];
    const cursor = new Date(startDate);

    for (let w = 0; w < 52; w++) {
      const week: Array<{ date: string; isoDate: string; inRange: boolean }> = [];
      for (let d = 0; d < 7; d++) {
        const isoDate = cursor.toISOString().slice(0, 10);
        week.push({
          date: `${cursor.getDate()} ${MONTHS[cursor.getMonth()]}`,
          isoDate,
          inRange: cursor <= today,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      result.push(week);
    }
    return result;
  }, []);

  // Month labels: find first week where the month changes
  const monthLabels = useMemo(() => {
    const labels: Array<{ weekIndex: number; label: string }> = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const firstDay = week[0];
      if (!firstDay) return;
      const month = new Date(firstDay.isoDate).getMonth();
      if (month !== lastMonth) {
        labels.push({ weekIndex: wi, label: MONTHS[month] ?? '' });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  const totalCount = useMemo(() => data.reduce((s, d) => s + d.count, 0), [data]);
  const activeDays = useMemo(() => data.filter((d) => d.count > 0).length, [data]);

  return (
    <div className="w-full">
      {/* Stats summary */}
      <div className="flex gap-6 mb-4 text-sm text-slate-500">
        <span>
          <span className="font-semibold text-slate-700">{totalCount}</span> действий за год
        </span>
        <span>
          <span className="font-semibold text-slate-700">{activeDays}</span> активных дней
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-max">
          {/* Month labels row */}
          <div className="flex mb-1 ml-8">
            {weeks.map((_, wi) => {
              const label = monthLabels.find((m) => m.weekIndex === wi);
              return (
                <div key={wi} className="w-3.5 text-xs text-slate-400 leading-none">
                  {label ? label.label : ''}
                </div>
              );
            })}
          </div>

          {/* Grid: 7 rows × 52 cols */}
          <div className="flex gap-0.5">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAYS.map((label, i) => (
                <div key={i} className="h-3.5 w-6 text-xs text-slate-400 leading-none flex items-center justify-end pr-1">
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day) => {
                  const entry = dataMap.get(day.isoDate);
                  const count = entry?.count ?? 0;
                  const level = day.inRange ? getLevel(count) : 0;
                  return (
                    <div
                      key={day.isoDate}
                      className={`w-3.5 h-3.5 rounded-sm cursor-default transition-opacity ${LEVEL_CLASSES[level]} ${
                        !day.inRange ? 'opacity-30' : 'hover:opacity-80'
                      }`}
                      onMouseEnter={(e) => {
                        if (!day.inRange) return;
                        setTooltip({
                          x: e.clientX,
                          y: e.clientY,
                          day: entry ?? { date: day.isoDate, count: 0, points: 0 },
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 ml-8 text-xs text-slate-400">
            <span>Меньше</span>
            {([0, 1, 2, 3, 4] as const).map((lvl) => (
              <div key={lvl} className={`w-3.5 h-3.5 rounded-sm ${LEVEL_CLASSES[lvl]}`} />
            ))}
            <span>Больше</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <div className="font-semibold">{tooltip.day.date}</div>
          {tooltip.day.count > 0 ? (
            <div className="text-slate-300">
              {tooltip.day.count} действий · {tooltip.day.points} очков
            </div>
          ) : (
            <div className="text-slate-400">Нет активности</div>
          )}
        </div>
      )}
    </div>
  );
}

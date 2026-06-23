"use client";

import { ChevronRight, CheckCircle2, Timer, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useTasks } from "@/hooks/use-tasks";
import { useGoals } from "@/hooks/use-goals";
import { computeStreak, computeProductivity, computeGoalStats, getLast7Days, computeWeeklyActivity } from "@/lib/stats";

/* ── Helpers ── */
function Card({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-3xl ${className}`}
      style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "0.5px solid rgba(255,255,255,0.9)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Donut SVG ── */
type DonutSlice = { value: number; color: string };
function DonutChart({ slices, label }: { slices: DonutSlice[]; label: string }) {
  const size = 130; const r = 50; const cx = size / 2; const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => {
        const dash = (s.value / total) * circ;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={18}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={10} fill="#8A847D" fontFamily="-apple-system,sans-serif">Жизнь</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={14} fontWeight={700} fill="#2A2A2A" fontFamily="-apple-system,sans-serif">100%</text>
    </svg>
  );
}

/* ── Rhythm SVG line ── */
function RhythmChart({ data }: { data: number[] }) {
  const W = 160; const H = 60;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * H}`).join(" ");
  const peak = data.indexOf(Math.max(...data));
  const px = (peak / (data.length - 1)) * W;
  const py = H - (data[peak] / max) * H;
  return (
    <svg width={W} height={H + 4} viewBox={`0 0 ${W} ${H + 4}`}>
      <polyline points={pts} fill="none" stroke="#D9B38C" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={px} cy={py} r={5} fill="#D9B38C" />
    </svg>
  );
}

/* ── Heatmap ── */
function ActivityHeatmap({ data }: { data: { date: Date; count: number }[] }) {
  const days = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
  const weeks: (typeof data[0] | null)[][] = [];
  if (data.length === 0) return null;
  const first = new Date(data[0].date);
  const dow = first.getDay() === 0 ? 6 : first.getDay() - 1;
  let week: (typeof data[0] | null)[] = Array(dow).fill(null);
  for (const d of data) {
    if (week.length === 7) { weeks.push(week); week = []; }
    week.push(d);
  }
  while (week.length < 7) week.push(null);
  weeks.push(week);
  const colors = ["rgba(217,179,140,0.1)","rgba(217,179,140,0.3)","rgba(217,179,140,0.6)","rgba(217,179,140,0.9)"];
  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {days.map((d) => (
          <span key={d} className="text-center text-[11px]" style={{ color: "#8A847D" }}>{d}</span>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="mb-1 grid grid-cols-7 gap-1">
          {week.map((cell, di) => (
            <div
              key={di}
              className="aspect-square rounded-md"
              style={{ background: cell ? colors[Math.min(cell.count, 3)] : "rgba(42,42,42,0.06)" }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Balance Glass Circle ── */
function BalanceCircle({ value }: { value: number }) {
  const size = 120; const r = 52; const cx = 60; const cy = 60;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "rgba(255,255,255,0.25)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 8px 32px rgba(217,179,140,0.15)",
        }}
      />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={6} />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={6}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center", filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" }}
        />
      </svg>
      <span className="relative z-10 text-[28px] font-bold" style={{ color: "rgba(255,255,255,0.95)", fontFamily: "-apple-system,sans-serif" }}>
        {value}%
      </span>
    </div>
  );
}

/* ── Main ── */
export default function StatsPage() {
  const { data: tasks } = useTasks();
  const { data: goals } = useGoals();

  const allTasks = tasks ?? [];
  const allGoals = goals ?? [];

  const weekActivity = computeWeeklyActivity(allTasks);
  const { percent: productivity, completedThisWeek } = computeProductivity(allTasks);
  const streak = computeStreak(allTasks);
  const { inProgress, achieved } = computeGoalStats(allGoals);

  const donutSlices = [
    { value: 32, color: "#D9B38C" },
    { value: 24, color: "#E3B5AC" },
    { value: 18, color: "#CBD7C2" },
    { value: 12, color: "#C7BBE8" },
    { value: 14, color: "#8CAA73" },
  ];

  const catLabels = [
    { emoji: "🏢", label: "Работа",   pct: 32, color: "#D9B38C" },
    { emoji: "❤️", label: "Личное",   pct: 24, color: "#E3B5AC" },
    { emoji: "🌿", label: "Здоровье", pct: 18, color: "#CBD7C2" },
    { emoji: "📚", label: "Обучение", pct: 12, color: "#C7BBE8" },
    { emoji: "🎯", label: "Цели",     pct: 14, color: "#8CAA73" },
  ];

  const rhythmData = [2, 4, 7, 9, 8, 5, 6, 10, 9, 5, 3, 2];

  const today = new Date();
  const heatmapData = getLast7Days().flatMap((date) => {
    const d = new Date(date);
    const activity = weekActivity.find((w) => {
      const wd = getLast7Days().find((_, i) => i === weekActivity.indexOf(w));
      return wd && new Date(wd).toDateString() === d.toDateString();
    });
    return [{ date: d, count: activity?.count ?? 0 }];
  });

  const achievements = [
    { emoji: "🔥", label: "Неделя без просрочек", color: "#FFF0EE" },
    { emoji: "🎯", label: "100% целей за день", color: "#EDE8FF" },
    { emoji: "📚", label: "7 дней обучения подряд", color: "#EDE8FF" },
    { emoji: "🌿", label: "Баланс жизни", color: "#E8F5E9" },
    { emoji: "❤️", label: "Время для себя", color: "#FEE8EC" },
    { emoji: "⭐", label: "Ранняя птица 5 дней", color: "#F5F5F5" },
  ];

  const topGoals = allGoals.slice(0, 2);

  const GOAL_META: Record<string, { emoji: string; color: string; bg: string }> = {
    finance:   { emoji: "💼", color: "#D9B38C", bg: "#FEF3E8" },
    career:    { emoji: "🚀", color: "#9B8EC4", bg: "#EDE8FF" },
    health:    { emoji: "🌿", color: "#8CAA73", bg: "#E8F5E9" },
    education: { emoji: "📚", color: "#9B8EC4", bg: "#EDE8FF" },
    personal:  { emoji: "❤️", color: "#E3B5AC", bg: "#FEE8EC" },
  };

  function getGoalMeta(cat: string | null) {
    return cat ? (GOAL_META[cat] ?? { emoji: "🎯", color: "#8A847D", bg: "#F5F5F5" })
               : { emoji: "🎯", color: "#8A847D", bg: "#F5F5F5" };
  }

  return (
    <div className="px-5 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: "var(--font-cormorant),'Cormorant Garamond',Georgia,serif",
            fontSize: 42, fontWeight: 400, lineHeight: 1,
            color: "#C99E73", letterSpacing: "0.01em",
          }}
        >
          Rotes
        </span>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}
        >
          <SlidersHorizontal size={17} color="#2A2A2A" />
        </button>
      </div>

      <h1 className="mt-3" style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.05, color: "#2A2A2A" }}>
        Аналитика
      </h1>

      {/* Hero — баланс недели */}
      <Card
        className="mt-6 p-5"
        style={{
          background: "linear-gradient(135deg, #E8C89A 0%, #D9B38C 50%, #C99E73 100%)",
          border: "none",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-[15px] font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
              Ваш баланс недели
            </p>
            <p className="mt-1 text-[52px] font-bold leading-none" style={{ color: "white" }}>
              {productivity}%
            </p>
            <p className="mt-2 text-[14px] leading-snug" style={{ color: "rgba(255,255,255,0.85)" }}>
              {productivity >= 70
                ? "Отличная неделя.\nВы уделяли внимание работе, себе и своим целям."
                : "Хорошее начало. Есть куда расти на следующей неделе."}
            </p>
            <p className="mt-3 text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>
              ↗ +{Math.max(0, productivity - 70)}% к прошлой неделе
            </p>
          </div>
          <BalanceCircle value={productivity} />
        </div>
      </Card>

      {/* Баланс жизни + Ритм недели */}
      <div className="mt-4 flex gap-3">
        <Card className="flex-1 p-4">
          <p className="text-[17px] font-semibold" style={{ color: "#2A2A2A" }}>Баланс жизни</p>
          <div className="mt-3 flex items-center gap-3">
            <DonutChart slices={donutSlices} label="Жизнь" />
            <div className="flex flex-col gap-1.5">
              {catLabels.map((c) => (
                <div key={c.label} className="flex items-center gap-1.5">
                  <span className="text-[12px]">{c.emoji}</span>
                  <span className="text-[12px]" style={{ color: "#2A2A2A", minWidth: 52 }}>{c.label}</span>
                  <span className="text-[12px] font-semibold" style={{ color: c.color }}>{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="flex-1 p-4">
          <p className="text-[17px] font-semibold" style={{ color: "#2A2A2A" }}>Ритм недели</p>
          <p className="mt-0.5 text-[12px]" style={{ color: "#8A847D" }}>Когда вы наиболее продуктивны</p>
          <div className="mt-3">
            <RhythmChart data={rhythmData} />
            <div
              className="mt-2 rounded-xl p-2 text-center"
              style={{ background: "rgba(217,179,140,0.12)" }}
            >
              <p className="text-[11px] font-semibold" style={{ color: "#B58D6A" }}>Лучшее время:</p>
              <p className="text-[12px] font-bold" style={{ color: "#2A2A2A" }}>09:00 – 12:00</p>
            </div>
            <div className="mt-2 flex justify-between">
              {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map((d) => (
                <span key={d} className="text-[10px]" style={{ color: "#8A847D" }}>{d}</span>
              ))}
            </div>
            <p className="mt-2 text-[11px]" style={{ color: "#8A847D" }}>
              Вы закрыли 48% задач именно в этот период.
            </p>
          </div>
        </Card>
      </div>

      {/* Прогресс целей */}
      <div className="mt-8 flex items-center justify-between">
        <h2 style={{ fontSize: 28, fontWeight: 600, color: "#2A2A2A" }}>Прогресс целей</h2>
        <Link href="/goals" className="flex items-center gap-1">
          <span className="text-[14px]" style={{ color: "#D9B38C" }}>Все цели</span>
          <ChevronRight size={14} color="#D9B38C" />
        </Link>
      </div>

      <div className="mt-4 flex gap-3">
        {topGoals.length === 0 ? (
          <p className="text-[15px]" style={{ color: "#8A847D" }}>Целей пока нет</p>
        ) : (
          topGoals.map((goal) => {
            const meta = getGoalMeta(goal.category);
            const pct = goal.target_value && goal.current_progress
              ? Math.round((goal.current_progress / goal.target_value) * 100)
              : 0;
            return (
              <Card key={goal.id} className="flex-1 p-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl"
                  style={{ background: meta.bg }}
                >
                  {meta.emoji}
                </div>
                <p className="mt-3 text-[15px] font-semibold leading-tight" style={{ color: "#2A2A2A" }}>
                  {goal.title}
                </p>
                <p className="mt-1 text-[36px] font-bold leading-none" style={{ color: "#2A2A2A" }}>
                  {pct}%
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(42,42,42,0.1)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: meta.color }}
                  />
                </div>
                <p className="mt-2 text-[12px]" style={{ color: "#8A847D" }}>
                  {goal.current_progress?.toLocaleString("ru-RU") ?? 0} из {goal.target_value?.toLocaleString("ru-RU") ?? "—"}
                </p>
              </Card>
            );
          })
        )}
        {topGoals.length === 1 && <div className="flex-1" />}
      </div>

      {/* Итоги недели + ИИ */}
      <div className="mt-8 flex gap-3">
        <div className="flex flex-col gap-3" style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#2A2A2A" }}>Итоги недели</h2>
          <Card className="p-4" style={{ minHeight: 140 }}>
            <div
              className="mb-3 flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: "#FEF3E8" }}
            >
              <CheckCircle2 size={18} color="#D9B38C" />
            </div>
            <p className="text-[15px] font-semibold" style={{ color: "#2A2A2A" }}>Выполнено</p>
            <p className="mt-1 text-[42px] font-bold leading-none" style={{ color: "#2A2A2A" }}>
              {completedThisWeek}
            </p>
            <p className="mt-1 text-[13px]" style={{ color: "#8A847D" }}>задач завершено</p>
          </Card>
          <Card className="p-4" style={{ minHeight: 140 }}>
            <div
              className="mb-3 flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: "#EDE8FF" }}
            >
              <Timer size={18} color="#9B8EC4" />
            </div>
            <p className="text-[15px] font-semibold" style={{ color: "#2A2A2A" }}>Фокус</p>
            <p className="mt-1 text-[42px] font-bold leading-none" style={{ color: "#2A2A2A" }}>
              {streak}
            </p>
            <p className="mt-1 text-[13px]" style={{ color: "#8A847D" }}>дней подряд</p>
          </Card>
        </div>

        <div className="flex flex-col" style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#2A2A2A" }} className="mb-3">
            Что заметил помощник
          </h2>
          <Card
            className="flex-1 p-4"
            style={{ background: "rgba(199,187,232,0.25)", border: "0.5px solid rgba(199,187,232,0.5)", minHeight: 300 }}
          >
            <div
              className="mb-3 flex h-9 w-9 items-center justify-center rounded-full text-lg"
              style={{ background: "rgba(199,187,232,0.4)" }}
            >
              ✨
            </div>
            <p className="text-[15px] leading-relaxed" style={{ color: "#2A2A2A" }}>
              На этой неделе вы уделяли много времени работе и мало времени здоровью.
            </p>
            <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "#6B5EA8" }}>
              Попробуйте выделить хотя бы две тренировки на следующей неделе.
            </p>
            <div
              className="mt-4 rounded-2xl p-3 text-center text-[30px]"
              style={{ background: "rgba(199,187,232,0.3)" }}
            >
              🪄
            </div>
          </Card>
        </div>
      </div>

      {/* Месяц — тепловая карта */}
      <div className="mt-10 flex items-center justify-between">
        <h2 style={{ fontSize: 28, fontWeight: 600, color: "#2A2A2A" }}>Месяц</h2>
        <button type="button" className="flex items-center gap-1">
          <span className="text-[14px]" style={{ color: "#D9B38C" }}>
            {today.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
          </span>
          <ChevronRight size={14} color="#D9B38C" />
        </button>
      </div>
      <Card className="mt-4 p-4">
        <ActivityHeatmap data={heatmapData} />
        <div className="mt-3 flex items-center justify-end gap-3">
          {[
            { color: "rgba(217,179,140,0.1)", label: "Мало активности" },
            { color: "rgba(217,179,140,0.3)", label: "Умеренно" },
            { color: "rgba(217,179,140,0.6)", label: "Активно" },
            { color: "rgba(217,179,140,0.9)", label: "Очень активно" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm" style={{ background: item.color }} />
              <span className="text-[10px]" style={{ color: "#8A847D" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Достижения */}
      <h2 className="mt-10" style={{ fontSize: 28, fontWeight: 600, color: "#2A2A2A" }}>Достижения</h2>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {achievements.map((ach) => (
          <div
            key={ach.label}
            className="flex shrink-0 flex-col items-center gap-2 rounded-3xl p-4"
            style={{ background: ach.color, minWidth: 90, border: "0.5px solid rgba(255,255,255,0.8)" }}
          >
            <span className="text-[28px]">{ach.emoji}</span>
            <p className="text-center text-[11px] font-medium leading-tight" style={{ color: "#2A2A2A" }}>
              {ach.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
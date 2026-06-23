"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Check, Sparkles, Pencil, Star } from "lucide-react";
import { useGoals, useSetMainGoal } from "@/hooks/use-goals";
import { useAllMilestones, useToggleMilestone } from "@/hooks/use-milestones";
import { createClient } from "@/lib/supabase/client";

const CATEGORY_META: Record<string, {
  label: string; emoji: string; iconBg: string; iconColor: string; barColor: string;
}> = {
  finance:   { label: "Финансы",     emoji: "💰", iconBg: "#FEF3E8", iconColor: "#D9B38C", barColor: "#D9B38C" },
  personal:  { label: "Личное",      emoji: "❤️", iconBg: "#FEE8EC", iconColor: "#E3B5AC", barColor: "#E3B5AC" },
  health:    { label: "Здоровье",    emoji: "🌿", iconBg: "#E8F5E9", iconColor: "#8CAA73", barColor: "#8CAA73" },
  education: { label: "Образование", emoji: "📚", iconBg: "#EDE8FF", iconColor: "#9B8EC4", barColor: "#9B8EC4" },
  career:    { label: "Карьера",     emoji: "🚀", iconBg: "#F5EDE8", iconColor: "#C4956A", barColor: "#C4956A" },
};

function getMeta(cat: string | null) {
  return cat
    ? (CATEGORY_META[cat] ?? { label: cat, emoji: "🎯", iconBg: "#F5F5F5", iconColor: "#8A847D", barColor: "#8A847D" })
    : { label: "Другое", emoji: "🎯", iconBg: "#F5F5F5", iconColor: "#8A847D", barColor: "#8A847D" };
}

function formatDeadline(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function GlassCard({ children, className = "", style = {} }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-3xl ${className}`}
      style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: "0.5px solid rgba(255,255,255,0.9)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function HeroRing({ value }: { value: number }) {
  const size = 140; const r = 58; const cx = 70; const cy = 70;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(value / 100, 1) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.2)" stroke="rgba(217,179,140,0.2)" strokeWidth={10} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke="#D9B38C" strokeWidth={10}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "center", filter: "drop-shadow(0 0 6px rgba(217,179,140,0.4))" }}
      />
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize={28} fontWeight={700} fill="#C4956A" fontFamily="-apple-system,sans-serif">
        {value}%
      </text>
    </svg>
  );
}

const FILTERS = [
  { value: "all", label: "Все" },
  { value: "finance", label: "Финансы" },
  { value: "health", label: "Здоровье" },
  { value: "career", label: "Карьера" },
  { value: "education", label: "Образование" },
  { value: "personal", label: "Личное" },
];

export default function GoalsPage() {
  const { data: goals, isLoading } = useGoals();
  const { data: allMilestones } = useAllMilestones();
  const toggleMilestone = useToggleMilestone();
  const setMainGoal = useSetMainGoal();
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = activeFilter === "all" ? goals : goals?.filter((g) => g.category === activeFilter);
  const heroGoal = goals?.find((g) => g.is_main) ?? goals?.[0] ?? null;

  const heroPct = heroGoal?.target_value && heroGoal.current_progress
    ? Math.round((heroGoal.current_progress / heroGoal.target_value) * 100) : 0;

  const heroRemaining = heroGoal?.target_value && heroGoal.current_progress
    ? heroGoal.target_value - heroGoal.current_progress : null;

  const upcomingMilestones = allMilestones
    ?.filter((m) => !m.achieved_at)
    .slice(0, 4) ?? [];

  const doneMilestones = allMilestones
    ?.filter((m) => !!m.achieved_at)
    .slice(0, 2) ?? [];

  const displayMilestones = [...doneMilestones, ...upcomingMilestones].slice(0, 4);

  async function handleSetMain(goalId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setMainGoal.mutate({ goalId, userId: user.id });
  }

  return (
    <div className="px-5 pt-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span
            style={{
              fontFamily: "var(--font-cormorant),'Cormorant Garamond',Georgia,serif",
              fontSize: 42, fontWeight: 400, lineHeight: 1,
              color: "#C99E73", letterSpacing: "0.01em", display: "block",
            }}
          >
            Rotes
          </span>
          <h1 className="mt-2" style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.05, color: "#2A2A2A" }}>
            Мои цели
          </h1>
        </div>
        <Link
          href="/goals/new"
          className="mt-2 flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(40px)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            border: "0.5px solid rgba(255,255,255,0.9)",
          }}
        >
          <Plus size={20} color="#2A2A2A" />
        </Link>
      </div>

      {/* Hero card */}
      {heroGoal ? (
        <div
          className="mt-6 overflow-hidden rounded-3xl p-5"
          style={{
            background: "linear-gradient(160deg, #F3E5D4 0%, #F8F0E8 60%, #F8F4EF 100%)",
            boxShadow: "0 4px 24px rgba(217,179,140,0.15)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-[13px] font-medium uppercase tracking-wide" style={{ color: "#B58D6A" }}>
                Главная цель года
              </p>
              <p className="mt-1.5 text-[22px] font-bold leading-tight" style={{ color: "#2A2A2A" }}>
                {heroGoal.title}
              </p>
              <p className="mt-2 text-[52px] font-bold leading-none" style={{ color: "#C4956A" }}>
                {heroPct}<span className="text-[24px]">%</span>
              </p>
              {heroRemaining !== null && heroRemaining > 0 && (
                <p className="mt-1 text-[14px]" style={{ color: "#8A847D" }}>
                  Осталось: {heroRemaining.toLocaleString("ru-RU")}
                  {heroGoal.category === "finance" ? " ₸" : ""}
                </p>
              )}
            </div>
            <HeroRing value={heroPct} />
          </div>
        </div>
      ) : (
        <GlassCard className="mt-6 p-5">
          <p className="text-[17px]" style={{ color: "#8A847D" }}>
            Добавьте первую цель — она станет главной целью года
          </p>
        </GlassCard>
      )}

      {/* Filters */}
      <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {FILTERS.map((f) => {
          const active = activeFilter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setActiveFilter(f.value)}
              className="shrink-0 rounded-full px-4 py-2 text-[15px] font-medium transition-all"
              style={
                active
                  ? { background: "#D9B38C", color: "white", boxShadow: "0 4px 12px rgba(217,179,140,0.35)" }
                  : { background: "rgba(255,255,255,0.65)", backdropFilter: "blur(20px)", border: "0.5px solid rgba(255,255,255,0.9)", color: "#8A847D" }
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Goals list */}
      <div className="mt-5 flex flex-col gap-4">
        {isLoading && <p className="text-[15px]" style={{ color: "#8A847D" }}>Загрузка...</p>}

        {!isLoading && (!filtered || filtered.length === 0) && (
          <div className="flex flex-col items-center gap-4 py-12">
            <span className="text-[56px]">🎯</span>
            <div className="text-center">
              <p className="text-[20px] font-semibold" style={{ color: "#2A2A2A" }}>Пока нет целей</p>
              <p className="mt-1 text-[15px]" style={{ color: "#8A847D" }}>
                Добавьте первую цель и начните строить своё будущее.
              </p>
            </div>
            <Link
              href="/goals/new"
              className="rounded-full px-6 py-3 text-[17px] font-semibold text-white"
              style={{ background: "#D9B38C" }}
            >
              Создать цель
            </Link>
          </div>
        )}

        {filtered?.map((goal) => {
          const meta = getMeta(goal.category);
          const pct = goal.target_value && goal.current_progress
            ? Math.round((goal.current_progress / goal.target_value) * 100) : 0;
          const deadline = formatDeadline(goal.deadline);
          const isMain = goal.is_main;

          return (
            <GlassCard key={goal.id} className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: meta.iconBg }}
                >
                  {meta.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[18px] font-semibold leading-tight" style={{ color: "#2A2A2A" }}>
                          {goal.title}
                        </p>
                        {isMain && (
                          <Star size={14} fill="#D9B38C" color="#D9B38C" />
                        )}
                      </div>
                      {goal.target_value !== null && (
                        <p className="mt-0.5 text-[13px]" style={{ color: "#8A847D" }}>
                          {(goal.current_progress ?? 0).toLocaleString("ru-RU")} из{" "}
                          {goal.target_value.toLocaleString("ru-RU")}
                          {goal.category === "finance" ? " ₸" : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <p className="text-[22px] font-bold" style={{ color: meta.iconColor }}>{pct}%</p>
                      <button
                        type="button"
                        aria-label="Сделать главной"
                        onClick={() => handleSetMain(goal.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full transition-all"
                        style={{
                          background: isMain ? "rgba(217,179,140,0.15)" : "rgba(42,42,42,0.05)",
                        }}
                      >
                        <Star
                          size={14}
                          fill={isMain ? "#D9B38C" : "none"}
                          color={isMain ? "#D9B38C" : "#AAA39A"}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: "rgba(42,42,42,0.08)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: meta.barColor }}
                    />
                  </div>

                  {deadline && (
                    <p className="mt-2 flex items-center gap-1 text-[12px]" style={{ color: "#8A847D" }}>
                      <span>📅</span> До {deadline}
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Milestones */}
      {allMilestones && allMilestones.length > 0 && (
        <>
          <div className="mt-10 flex items-center justify-between">
            <h2 style={{ fontSize: 28, fontWeight: 600, color: "#2A2A2A" }}>Ближайшие этапы</h2>
            <button type="button" className="flex items-center gap-1">
              <span className="text-[14px]" style={{ color: "#D9B38C" }}>Смотреть все</span>
              <ChevronRight size={14} color="#D9B38C" />
            </button>
          </div>

          <div className="-mx-5 mt-4 flex gap-3 overflow-x-auto px-5 pb-2">
            {displayMilestones.map((m) => {
              const done = !!m.achieved_at;
              return (
                <GlassCard
                  key={m.id}
                  className="shrink-0 flex flex-col items-center justify-center gap-2.5 p-4"
                  style={{ width: 140, minHeight: 100 }}
                >
                  <button
                    type="button"
                    onClick={() => toggleMilestone.mutate({ id: m.id, achieved: !done })}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-all"
                    style={
                      done
                        ? { background: "#E8F5E9", border: "1.5px solid #8CAA73" }
                        : { background: "transparent", border: "1.5px solid rgba(42,42,42,0.2)" }
                    }
                  >
                    {done && <Check size={14} color="#8CAA73" strokeWidth={2.5} />}
                  </button>
                  <p
                    className="text-center text-[13px] font-medium leading-tight"
                    style={{ color: done ? "#8A847D" : "#2A2A2A" }}
                  >
                    {m.title}
                  </p>
                  {m.target_value > 0 && (
                    <p className="text-[11px]" style={{ color: "#AAA39A" }}>
                      {m.target_value.toLocaleString("ru-RU")}
                    </p>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </>
      )}

      {/* AI совет */}
      <div className="mt-10">
        <GlassCard
          className="p-5"
          style={{ background: "rgba(199,187,232,0.2)", border: "0.5px solid rgba(199,187,232,0.5)" }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "rgba(199,187,232,0.4)" }}
            >
              <Sparkles size={18} color="#9B8EC4" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold" style={{ color: "#2A2A2A" }}>Совет помощника</p>
              <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "#6B5EA8" }}>
                {heroGoal
                  ? `Сейчас активнее всего идёт «${heroGoal.title}» — ${heroPct}% выполнено. Продолжайте в том же темпе!`
                  : "Добавьте первую цель — и я начну отслеживать ваш прогресс и давать советы."}
              </p>
            </div>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl"
              style={{ background: "rgba(199,187,232,0.3)" }}
            >
              ✨
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Vision board */}
      <div className="mt-10 mb-4">
        <h2 style={{ fontSize: 28, fontWeight: 600, color: "#2A2A2A" }}>Зачем всё это?</h2>
        <div
          className="mt-4 overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(135deg, #F3E5D4 0%, #EDE0D0 100%)",
            minHeight: 180,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            position: "relative",
          }}
        >
          <div className="absolute inset-0 flex">
            <div className="flex-1 p-5">
              <p
                className="text-[22px] font-bold leading-tight"
                style={{ color: "#C4956A", fontFamily: "var(--font-cormorant),'Cormorant Garamond',Georgia,serif" }}
              >
                Моя жизнь{"\n"}в будущем
              </p>
              <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "#8A6A4A" }}>
                Свобода. Развитие. Новые возможности. Жизнь, о которой я мечтал.
              </p>
            </div>
            <div className="flex w-[45%] shrink-0 flex-col gap-1 p-2">
              {["#E8D5C0", "#D8C5B0", "#E0D0BC"].map((bg, i) => (
                <div key={i} className="flex-1 rounded-2xl" style={{ background: bg, opacity: 0.7 + i * 0.1 }} />
              ))}
            </div>
          </div>
          <button
            type="button"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)" }}
          >
            <Pencil size={14} color="#8A847D" />
          </button>
        </div>
      </div>
    </div>
  );
}
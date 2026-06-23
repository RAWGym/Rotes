import { LogOut, Pencil, CheckCircle2, Target, Bell, Layout, Palette } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/supabase/actions";
import { computeProductivity } from "@/lib/stats";

async function getStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { completed: 0, productivity: 0, name: "", email: "" };

  const { data: tasks } = await supabase.from("tasks").select("*").eq("user_id", user.id);
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const allTasks = tasks ?? [];
  const { percent, completedThisWeek } = computeProductivity(allTasks);

  return {
    completed: completedThisWeek,
    productivity: percent,
    name: profile?.name ?? user.email?.split("@")[0] ?? "",
    email: user.email ?? "",
  };
}

/* Ring SVG */
function Ring({ value, size = 80, color, strokeWidth = 7, label, sublabel }: {
  value: number; size?: number; color: string;
  strokeWidth?: number; label: string; sublabel: string;
}) {
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2; const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(value / 100, 1) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}22`} strokeWidth={strokeWidth} />
          <circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            style={{ transform: "rotate(-90deg)", transformOrigin: "center", filter: `drop-shadow(0 0 4px ${color}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[17px] font-bold leading-none" style={{ color: "#2A2A2A" }}>{label}</span>
          <span className="text-[9px] font-medium" style={{ color: "#8A847D" }}>{sublabel}</span>
        </div>
      </div>
    </div>
  );
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

export default async function ProfilePage() {
  const { completed, productivity, name, email } = await getStats();
  const initial = (name || email).charAt(0).toUpperCase() || "?";
  const displayName = name || email.split("@")[0];

  const lifeSections = [
    { emoji: "🏢", label: "Работа",  sub: "12 активных задач", bg: "#FEF3E8" },
    { emoji: "❤️", label: "Личное",  sub: "4 события на неделе", bg: "#FEE8EC" },
    { emoji: "🌿", label: "Здоровье",sub: "3 тренировки",       bg: "#E8F5E9" },
    { emoji: "🎯", label: "Цели",    sub: "4 активные цели",    bg: "#EDE8FF" },
  ];

  const integrations = [
    { icon: "📅", name: "Apple Calendar", connected: true,  color: "#FF3B30" },
    { icon: "❤️", name: "Apple Health",   connected: true,  color: "#FF2D55" },
    { icon: "📆", name: "Google Calendar",connected: false, color: "#4285F4" },
  ];

  const personalisation = [
    { icon: Pencil,       label: "Внешний вид"  },
    { icon: Palette,      label: "Цветовая тема" },
    { icon: Bell,         label: "Уведомления"   },
    { icon: Target,       label: "Фокус режим"   },
    { icon: Layout,       label: "Виджеты"       },
  ];

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
            Профиль
          </h1>
        </div>
        <button
          type="button"
          className="mt-2 flex items-center gap-2 rounded-full px-4 py-2.5"
          style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "0.5px solid rgba(255,255,255,0.7)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <Pencil size={14} color="#2A2A2A" />
          <span className="text-[15px] font-medium" style={{ color: "#2A2A2A" }}>Изменить</span>
        </button>
      </div>

      {/* Hero card */}
      <div
        className="relative mt-6 overflow-hidden rounded-3xl p-5"
        style={{
          background: "linear-gradient(135deg, #F8F0E8 0%, #F3E8DC 50%, #EEE0D2 100%)",
          boxShadow: "0 4px 24px rgba(217,179,140,0.12)",
          minHeight: 200,
        }}
      >
        {/* Decorative glass sphere */}
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2"
          style={{ width: 120, height: 120, opacity: 0.35 }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9) 0%, rgba(217,179,140,0.3) 60%, transparent 100%)",
              backdropFilter: "blur(8px)",
            }}
          />
          <div
            className="absolute inset-3 rounded-full"
            style={{
              background: "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.7) 0%, rgba(217,179,140,0.2) 70%, transparent 100%)",
            }}
          />
        </div>

        {/* Particles */}
        {[[15,20],[60,45],[35,70],[80,25],[50,80]].map(([x,y],i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${x}%`, top: `${y}%`,
              width: 3, height: 3,
              background: "rgba(217,179,140,0.5)",
              boxShadow: "0 0 4px rgba(217,179,140,0.6)",
            }}
          />
        ))}

        <div className="relative z-10 flex items-start gap-4">
          {/* Avatar */}
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[28px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #D9B38C, #C4956A)",
              boxShadow: "0 4px 16px rgba(217,179,140,0.4)",
            }}
          >
            {initial}
          </div>
          <div>
            <p className="text-[20px] font-semibold leading-tight" style={{ color: "#2A2A2A" }}>
              {displayName}
            </p>
            <p className="text-[13px]" style={{ color: "#8A847D" }}>Личный аккаунт Rotes</p>
            <div
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)" }}
            >
              <span className="text-[12px]" style={{ color: "#D9B38C" }}>↗</span>
              <span className="text-[13px] font-medium" style={{ color: "#C4956A" }}>{productivity}% баланс недели</span>
            </div>
          </div>
        </div>
        <p className="relative z-10 mt-4 text-[14px] leading-relaxed" style={{ color: "#6A5A4A" }}>
          Вы на правильном пути. За этот месяц выполнено {completed} задач и достигнуто нескольких важных этапов.
        </p>
      </div>

      {/* Моя жизнь */}
      <div className="mt-10 flex items-center justify-between">
        <h2 style={{ fontSize: 28, fontWeight: 600, color: "#2A2A2A" }}>Моя жизнь</h2>
        <button type="button" className="flex items-center gap-1">
          <span className="text-[14px]" style={{ color: "#D9B38C" }}>Все разделы</span>
          <span className="text-[14px]" style={{ color: "#D9B38C" }}>›</span>
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {lifeSections.map((s) => (
          <GlassCard key={s.label} className="flex items-center gap-3 p-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
              style={{ background: s.bg }}
            >
              {s.emoji}
            </div>
            <div>
              <p className="text-[16px] font-semibold" style={{ color: "#2A2A2A" }}>{s.label}</p>
              <p className="text-[12px]" style={{ color: "#8A847D" }}>{s.sub}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Интеграции */}
      <h2 className="mt-10" style={{ fontSize: 28, fontWeight: 600, color: "#2A2A2A" }}>Интеграции</h2>
      <GlassCard className="mt-4 divide-y" style={{ borderColor: "rgba(42,42,42,0.06)" }}>
        {integrations.map((int, i) => (
          <div
            key={int.name}
            className="flex items-center gap-3 px-4 py-4"
            style={{ borderColor: "rgba(42,42,42,0.06)" }}
          >
            <span className="text-2xl">{int.icon}</span>
            <div className="flex-1">
              <p className="text-[16px] font-semibold" style={{ color: "#2A2A2A" }}>{int.name}</p>
              <p className="text-[13px]" style={{ color: int.connected ? "#8CAA73" : "#8A847D" }}>
                {int.connected ? "Подключено" : "Не подключено"}
              </p>
            </div>
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={
                int.connected
                  ? { background: "#E8F5E9" }
                  : { background: "rgba(42,42,42,0.06)", border: "1.5px solid rgba(42,42,42,0.15)" }
              }
            >
              {int.connected
                ? <CheckCircle2 size={15} color="#8CAA73" />
                : <span className="text-[16px] font-medium" style={{ color: "#8A847D" }}>+</span>
              }
            </div>
          </div>
        ))}
      </GlassCard>

      {/* Персонализация */}
      <h2 className="mt-10" style={{ fontSize: 28, fontWeight: 600, color: "#2A2A2A" }}>Персонализация</h2>
      <GlassCard className="mt-4 p-4">
        <div className="flex justify-between">
          {personalisation.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className="flex flex-col items-center gap-2"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: "rgba(42,42,42,0.05)" }}
              >
                <Icon size={20} color="#8A847D" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-medium text-center leading-tight" style={{ color: "#8A847D" }}>
                {label}
              </span>
              <span className="text-[10px]" style={{ color: "#D9B38C" }}>›</span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Ваш прогресс */}
      <h2 className="mt-10" style={{ fontSize: 28, fontWeight: 600, color: "#2A2A2A" }}>Ваш прогресс</h2>
      <div className="mt-4 flex gap-3">
        <GlassCard className="flex flex-1 items-center justify-around p-4">
          <Ring value={Math.min(completed * 2, 100)} color="#D9B38C" label={String(completed)} sublabel="задачи" />
          <Ring value={70} color="#C7BBE8" label="17ч" sublabel="фокуса" />
          <Ring value={productivity} color="#CBD7C2" label={`${productivity}%`} sublabel="баланс" />
        </GlassCard>

        <div
          className="flex w-[42%] shrink-0 flex-col justify-between rounded-3xl p-4"
          style={{
            background: "rgba(199,187,232,0.25)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "0.5px solid rgba(199,187,232,0.5)",
          }}
        >
          <div>
            <p className="text-[14px] font-semibold" style={{ color: "#2A2A2A" }}>Совет помощника</p>
            <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "#6B5EA8" }}>
              {displayName}, вы чаще всего продуктивны с 9:00 до 12:00. Попробуйте планировать важные задачи именно на это время.
            </p>
          </div>
          <div
            className="mt-3 flex h-9 w-9 items-center justify-center self-end rounded-2xl text-lg"
            style={{ background: "rgba(199,187,232,0.4)" }}
          >
            ✨
          </div>
        </div>
      </div>

      {/* О приложении */}
      <h2 className="mt-10" style={{ fontSize: 28, fontWeight: 600, color: "#2A2A2A" }}>О приложении</h2>
      <GlassCard className="mt-4 flex items-center gap-4 p-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: "#FEF3E8" }}
        >
          <span
            style={{
              fontFamily: "var(--font-cormorant),'Cormorant Garamond',Georgia,serif",
              fontSize: 28, fontWeight: 400, color: "#C99E73",
            }}
          >
            R
          </span>
        </div>
        <div className="flex-1">
          <p className="text-[17px] font-semibold" style={{ color: "#2A2A2A" }}>Rotes</p>
          <p className="text-[13px]" style={{ color: "#8A847D" }}>Digital Life Planner · Версия 1.0</p>
        </div>
        <span style={{ color: "#8A847D", fontSize: 20 }}>›</span>
      </GlassCard>

      {/* Logout */}
      <form action={signOut} className="mt-6 mb-4">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[17px] font-semibold"
          style={{
            border: "1.5px solid rgba(201,123,99,0.4)",
            color: "#C97B63",
            background: "rgba(201,123,99,0.04)",
          }}
        >
          <LogOut size={18} color="#C97B63" />
          Выйти из аккаунта
        </button>
      </form>
    </div>
  );
}
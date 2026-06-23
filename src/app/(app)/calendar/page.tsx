"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SlidersHorizontal, MoreHorizontal, X, ChevronLeft, ChevronRight, Plus, Check,
} from "lucide-react";
import { useEvents, type Event } from "@/hooks/use-events";
import { useTasks, useToggleTaskStatus, type Task } from "@/hooks/use-tasks";
import { TaskDetailSheet } from "@/components/ui/task-detail-sheet";
import { useProjects } from "@/hooks/use-projects";

type View = "month" | "week" | "day";

const weekdayShort = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

const CATEGORY_META: Record<string, { label: string; dot: string; pill: string; pillText: string; emoji: string }> = {
  work:      { label: "Работа",          dot: "#D9B38C", pill: "#FEF3E8", pillText: "#B58D6A", emoji: "🏢" },
  personal:  { label: "Личное",          dot: "#E3B5AC", pill: "#FEE8EC", pillText: "#B5726A", emoji: "❤️" },
  health:    { label: "Здоровье",        dot: "#8CAA73", pill: "#E8F5E9", pillText: "#5A8A55", emoji: "🌿" },
  education: { label: "Обучение",        dot: "#9B8EC4", pill: "#EDE8FF", pillText: "#6B5EA8", emoji: "📚" },
  finance:   { label: "Финансы",         dot: "#D9B38C", pill: "#FEF3E8", pillText: "#B58D6A", emoji: "💰" },
  business:  { label: "Бизнес",          dot: "#C97B63", pill: "#FFF0EE", pillText: "#A05B45", emoji: "📊" },
};

function getCatMeta(cat: string | null) {
  return cat ? (CATEGORY_META[cat] ?? { label: cat, dot: "#8A847D", pill: "#F5F5F5", pillText: "#555", emoji: "📋" })
             : { label: "Другое", dot: "#8A847D", pill: "#F5F5F5", pillText: "#555", emoji: "📋" };
}

function getWeekDates(center: Date) {
  const d = center.getDay();
  const off = d === 0 ? -6 : 1 - d;
  const mon = new Date(center);
  mon.setDate(center.getDate() + off);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(mon);
    x.setDate(mon.getDate() + i);
    return x;
  });
}

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function getDayRange(d: Date) {
  const s = new Date(d); s.setHours(0, 0, 0, 0);
  const e = new Date(d); e.setHours(23, 59, 59, 999);
  return { start: s, end: e };
}

function getWeekRange(d: Date) {
  const dates = getWeekDates(d);
  const s = new Date(dates[0]); s.setHours(0, 0, 0, 0);
  const e = new Date(dates[6]); e.setHours(23, 59, 59, 999);
  return { start: s, end: e };
}

function getMonthRange(d: Date) {
  return {
    start: new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0),
    end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
  };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatDayTitle(d: Date) {
  return d.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
}

function formatWeekTaskDeadline(t: Task) {
  if (!t.deadline) return null;
  const d = new Date(t.deadline);
  return `до ${d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" })}`;
}

function eventsForDay(events: Event[], date: Date) {
  return events.filter((e) => sameDay(new Date(e.start_time), date));
}

function EventCard({ event }: { event: Event }) {
  const meta = getCatMeta(event.category);
  const timeRange = `${formatTime(event.start_time)} – ${formatTime(event.end_time)}`;

  return (
    <div
      className="flex-1 rounded-3xl p-4"
      style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "0.5px solid rgba(255,255,255,0.9)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <p className="text-[14px] font-semibold" style={{ color: meta.dot }}>
        {timeRange}
      </p>
      <p className="mt-1 text-[18px] font-semibold leading-tight" style={{ color: "#2A2A2A" }}>
        {event.title}
      </p>
      <p className="mt-2 text-[14px]" style={{ color: "#8A847D" }}>
        {meta.emoji} {meta.label}
      </p>
    </div>
  );
}

function TimelineRow({ event, showLine = true }: { event: Event; showLine?: boolean }) {
  const meta = getCatMeta(event.category);
  return (
    <div className="flex gap-3">
      <div className="flex w-14 shrink-0 flex-col items-end pt-4">
        <span className="text-[13px] font-medium" style={{ color: "#8A847D" }}>
          {formatTime(event.start_time)}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <div
          className="mt-4 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: meta.dot }}
        />
        {showLine && (
          <div className="flex-1 w-px mt-1" style={{ background: "rgba(42,42,42,0.1)", minHeight: 32 }} />
        )}
      </div>
      <div className="flex-1 pb-3 pt-2">
        <EventCard event={event} />
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [view, setView] = useState<View>("day");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [bannerVisible, setBannerVisible] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const weekDates = getWeekDates(selectedDate);
  const today = new Date();

  const { start, end } =
    view === "day" ? getDayRange(selectedDate)
    : view === "week" ? getWeekRange(selectedDate)
    : getMonthRange(selectedDate);

  const { data: events, isLoading } = useEvents(start, end);
  const { data: tasks } = useTasks();
  const { data: projects } = useProjects();
  const toggleTask = useToggleTaskStatus();

  const dayEvents = (events ?? []).filter((e) => sameDay(new Date(e.start_time), selectedDate));

  const weekStart = getWeekDates(selectedDate)[0];
  const weekEnd = getWeekDates(selectedDate)[6];
  const weekTasks = (tasks ?? []).filter((t) => {
    if (!t.deadline || t.status === "completed") return false;
    const d = new Date(t.deadline);
    return d >= weekStart && d <= weekEnd;
  }).slice(0, 5);

  function shiftWeek(delta: number) {
    const n = new Date(selectedDate);
    n.setDate(n.getDate() + delta * 7);
    setSelectedDate(n);
  }

  function handleDayClick(date: Date) {
    setSelectedDate(date);
    setView("day");
  }

  function hasEvents(date: Date) {
    return (events ?? []).some((e) => sameDay(new Date(e.start_time), date));
  }

  const selectedTask = (tasks ?? []).find((t) => t.id === selectedTaskId) ?? null;

  return (
    <div className="px-5 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 42,
            fontWeight: 400,
            lineHeight: 1,
            color: "#C99E73",
            letterSpacing: "0.01em",
          }}
        >
          Rotes
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}
          >
            <SlidersHorizontal size={17} color="#2A2A2A" />
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}
          >
            <MoreHorizontal size={17} color="#2A2A2A" />
          </button>
        </div>
      </div>

      <h1
        className="mt-3"
        style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.05, color: "#2A2A2A" }}
      >
        Календарь
      </h1>

      {/* Segment control */}
      <div
        className="mt-6 flex rounded-2xl p-1"
        style={{
          background: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "0.5px solid rgba(255,255,255,0.8)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        {(["month", "week", "day"] as const).map((v) => {
          const labels = { month: "Месяц", week: "Неделя", day: "День" };
          const isActive = view === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className="flex-1 rounded-xl py-2.5 transition-all"
              style={
                isActive
                  ? {
                      background: "rgba(255,255,255,0.55)",
                      backdropFilter: "blur(10px)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#2A2A2A",
                    }
                  : { fontSize: 17, fontWeight: 500, color: "#8A847D" }
              }
            >
              {labels[v]}
            </button>
          );
        })}
      </div>

      {/* Week strip */}
      <div className="mt-5 flex items-center gap-1">
        <button
          type="button"
          onClick={() => shiftWeek(-1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.6)" }}
        >
          <ChevronLeft size={16} color="#8A847D" />
        </button>
        <div className="flex flex-1 justify-between">
          {weekDates.map((date) => {
            const isSelected = view === "day" && sameDay(date, selectedDate);
            const isToday = sameDay(date, today);
            const hasEv = hasEvents(date);
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => handleDayClick(date)}
                className="flex flex-col items-center gap-1"
              >
                <span
                  className="text-[13px] font-medium"
                  style={{ color: isSelected ? "#B58D6A" : "#8A847D" }}
                >
                  {weekdayShort[date.getDay()]}
                </span>
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[24px] font-semibold transition-all"
                  style={
                    isSelected
                      ? {
                          background: "rgba(233,203,170,0.6)",
                          backdropFilter: "blur(8px)",
                          boxShadow: "0 4px 16px rgba(217,179,140,0.3)",
                          color: "#8A5A2A",
                          fontSize: 22,
                        }
                      : { color: isToday ? "#D9B38C" : "#2A2A2A", fontSize: 22 }
                  }
                >
                  {date.getDate()}
                </span>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: hasEv ? getCatMeta(null).dot : "transparent" }}
                />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => shiftWeek(1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.6)" }}
        >
          <ChevronRight size={16} color="#8A847D" />
        </button>
      </div>

      {/* Apple Calendar banner */}
      {bannerVisible && (
        <div
          className="mt-5 flex items-start gap-3 rounded-2xl p-4"
          style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(20px)", border: "0.5px solid rgba(255,255,255,0.9)" }}
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{ background: "#FEE8EC" }}
          >
            📅
          </div>
          <div className="flex-1">
            <p className="text-[16px] font-semibold" style={{ color: "#2A2A2A" }}>
              Синхронизировано с Apple Calendar
            </p>
            <p className="mt-0.5 text-[13px]" style={{ color: "#8A847D" }}>
              Последняя синхронизация сегодня, {new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button type="button" onClick={() => setBannerVisible(false)}>
            <X size={16} color="#8A847D" />
          </button>
        </div>
      )}

      {/* Day title */}
      <h2
        className="mt-7"
        style={{ fontSize: 28, fontWeight: 600, color: "#2A2A2A", lineHeight: 1.2 }}
      >
        {formatDayTitle(selectedDate)}
      </h2>

      {/* Timeline */}
      <div className="mt-4">
        {isLoading && (
          <p className="text-[15px]" style={{ color: "#8A847D" }}>Загрузка...</p>
        )}
        {!isLoading && dayEvents.length === 0 && (
          <div
            className="flex items-center gap-4 rounded-3xl p-5 mt-2"
            style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(20px)", border: "0.5px solid rgba(255,255,255,0.9)" }}
          >
            <div className="text-4xl">📅</div>
            <div>
              <p className="text-[17px] font-semibold" style={{ color: "#2A2A2A" }}>Пока свободно</p>
              <p className="text-[14px] mt-0.5" style={{ color: "#8A847D" }}>Можно посвятить время себе 🌿</p>
            </div>
          </div>
        )}
        <div className="flex flex-col">
          {dayEvents.map((event, i) => (
            <TimelineRow
              key={event.id}
              event={event}
              showLine={i < dayEvents.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Задачи на неделю */}
      <div className="mt-10 flex items-center justify-between">
        <h2 style={{ fontSize: 28, fontWeight: 600, color: "#2A2A2A", lineHeight: 1.2 }}>
          Задачи на неделю
        </h2>
        <button type="button" className="flex items-center gap-1">
          <span className="text-[14px]" style={{ color: "#D9B38C" }}>Смотреть все</span>
          <ChevronRight size={14} color="#D9B38C" />
        </button>
      </div>

      <div className="mt-3 flex flex-col">
        {weekTasks.length === 0 && (
          <p className="text-[15px]" style={{ color: "#8A847D" }}>На этой неделе задач с дедлайном нет</p>
        )}
        {weekTasks.map((task, i) => {
          const meta = getCatMeta(task.category);
          const deadline = formatWeekTaskDeadline(task);
          const done = task.status === "completed";
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 py-4"
              style={{
                borderTop: i === 0 ? "none" : "1px solid rgba(42,42,42,0.07)",
                minHeight: 60,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  toggleTask.mutate({ id: task.id, status: done ? "active" : "completed" })
                }
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all"
                style={
                  done
                    ? { background: "var(--accent)", borderColor: "var(--accent)" }
                    : { background: "transparent", borderColor: "rgba(42,42,42,0.2)" }
                }
              >
                {done && <Check size={12} color="white" strokeWidth={3} />}
              </button>
              <button
                type="button"
                onClick={() => setSelectedTaskId(task.id)}
                className="flex-1 text-left"
              >
                <p
                  className="text-[17px] font-medium"
                  style={{
                    color: done ? "rgba(42,42,42,0.35)" : "#2A2A2A",
                    textDecoration: done ? "line-through" : "none",
                  }}
                >
                  {task.title}
                </p>
              </button>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {deadline && (
                  <span className="text-[13px]" style={{ color: "#8A847D" }}>{deadline}</span>
                )}
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide"
                  style={{ background: meta.pill, color: meta.pillText }}
                >
                  {meta.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <Link
        href={`/calendar/new?date=${selectedDate.toISOString().slice(0, 10)}`}
        aria-label="Новое событие"
        className="fixed right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
        style={{
          bottom: "max(7rem, calc(env(safe-area-inset-bottom) + 7rem))",
          background: "var(--accent)",
          boxShadow: "0 8px 24px rgba(217,179,140,0.45)",
        }}
      >
        <Plus size={24} color="white" />
      </Link>

      <TaskDetailSheet
        task={selectedTask}
        projects={projects ?? []}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}
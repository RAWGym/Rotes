"use client";

import { useState } from "react";
import { SlidersHorizontal, MoreHorizontal, X, Check, CalendarDays, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { EventRow } from "@/components/ui/event-row";
import { EventFormModal } from "@/components/ui/event-form-modal";
import { DayIslandCard } from "@/components/ui/day-island-card";
import { TaskDetailSheet } from "@/components/ui/task-detail-sheet";
import { useEvents, type Event } from "@/hooks/use-events";
import { useTasks, useToggleTaskStatus, type Task } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";

type View = "month" | "week" | "day";

const weekdayLabels = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function getWeekDates(centerDate: Date) {
  const day = centerDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(centerDate);
  monday.setDate(centerDate.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getDayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getWeekRange(date: Date) {
  const dates = getWeekDates(date);
  const start = new Date(dates[0]);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dates[6]);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function formatDayHeader(date: Date) {
  return date.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
}

function formatHeading(view: View, date: Date) {
  if (view === "day") return formatDayHeader(date);
  if (view === "week") {
    const { start, end } = getWeekRange(date);
    return `${start.getDate()} – ${end.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`;
  }
  return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
}

function groupEventsByDay(events: Event[]) {
  const map = new Map<string, Event[]>();
  for (const event of events) {
    const key = new Date(event.start_time).toDateString();
    map.set(key, [...(map.get(key) ?? []), event]);
  }
  return Array.from(map.entries()).map(([key, items]) => ({ date: new Date(key), items }));
}

function eventsForDay(events: Event[], date: Date) {
  return events.filter((e) => new Date(e.start_time).toDateString() === date.toDateString());
}

function tasksForDay(tasks: Task[], date: Date) {
  return tasks.filter((t) => t.deadline && new Date(t.deadline).toDateString() === date.toDateString());
}

export default function CalendarPage() {
  const [view, setView] = useState<View>("day");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [bannerVisible, setBannerVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const weekDates = getWeekDates(selectedDate);
  const today = new Date();

  const { start, end } =
    view === "day" ? getDayRange(selectedDate) : view === "week" ? getWeekRange(selectedDate) : getMonthRange(selectedDate);

  const { data: events, isLoading } = useEvents(start, end);
  const { data: tasks } = useTasks();
  const { data: projects } = useProjects();
  const toggleTask = useToggleTaskStatus();

  const groups = groupEventsByDay(events ?? []);
  const selectedTask = tasks?.find((t) => t.id === selectedTaskId) ?? null;

  function handleSelectDay(date: Date) {
    setSelectedDate(date);
    setView("day");
  }

  function shiftWeek(delta: number) {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta * 7);
    setSelectedDate(next);
  }

  function handleToggleTask(id: string) {
    const task = tasks?.find((t) => t.id === id);
    if (!task) return;
    const nextStatus = task.status === "completed" ? "active" : "completed";
    toggleTask.mutate({ id, status: nextStatus });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">Календарь</h1>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Фильтры"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm shadow-foreground/5"
          >
            <SlidersHorizontal size={18} className="text-foreground/70" />
          </button>
          <button
            type="button"
            aria-label="Ещё"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm shadow-foreground/5"
          >
            <MoreHorizontal size={18} className="text-foreground/70" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-1 rounded-full bg-warm-beige/20 p-1">
        {([
          { value: "month", label: "Месяц" },
          { value: "week", label: "Неделя" },
          { value: "day", label: "День" },
        ] as const).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setView(tab.value)}
            className={
              view === tab.value
                ? "flex-1 rounded-full bg-card py-2 text-caption font-medium text-foreground shadow-sm"
                : "flex-1 rounded-full py-2 text-caption text-foreground/50"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          aria-label="Предыдущая неделя"
          onClick={() => shiftWeek(-1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/40 hover:text-foreground/70"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex flex-1 justify-between">
          {weekDates.map((date) => {
            const isSelected = view === "day" && date.toDateString() === selectedDate.toDateString();
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => handleSelectDay(date)}
                className="flex flex-col items-center gap-1.5"
              >
                <span className="text-caption text-foreground/50">{weekdayLabels[date.getDay()]}</span>
                <span
                  className={
                    isSelected
                      ? "flex h-9 w-9 items-center justify-center rounded-full bg-accent/25 text-body font-medium text-foreground"
                      : "flex h-9 w-9 items-center justify-center rounded-full text-body text-foreground/70"
                  }
                >
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Следующая неделя"
          onClick={() => shiftWeek(1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/40 hover:text-foreground/70"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {bannerVisible && (
        <div className="mt-5 rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-priority-high text-card">
              <CalendarDays size={18} />
            </span>
            <div className="flex-1">
              <p className="text-body text-foreground">Синхронизировано с Apple Calendar</p>
              <p className="mt-0.5 text-caption text-foreground/50">
                Все события и задачи в одном месте
              </p>
            </div>
            <button type="button" aria-label="Скрыть" onClick={() => setBannerVisible(false)}>
              <X size={18} className="text-foreground/40" />
            </button>
          </div>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-sage/25 px-3 py-1 text-caption text-foreground/70">
            <Check size={12} />
            Подключено
          </span>
        </div>
      )}

      <h2 className="mt-6 text-h2 capitalize">{formatHeading(view, selectedDate)}</h2>

      {view === "week" ? (
        <div className="mt-3 -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2">
          {weekDates.map((date) => (
            <DayIslandCard
              key={date.toISOString()}
              date={date}
              isToday={date.toDateString() === today.toDateString()}
              events={eventsForDay(events ?? [], date)}
              tasks={tasksForDay(tasks ?? [], date)}
              onToggleTask={handleToggleTask}
              onTaskClick={setSelectedTaskId}
            />
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-5">
          {isLoading && <p className="text-caption text-foreground/50">Загрузка...</p>}
          {!isLoading && groups.length === 0 && (
            <p className="text-caption text-foreground/50">
              {view === "day" && "На этот день событий нет."}
              {view === "month" && "В этом месяце событий нет."}
            </p>
          )}
          {groups.map(({ date, items }) => (
            <div key={date.toDateString()}>
              {view !== "day" && (
                <p className="mb-2 text-caption font-medium text-foreground/60 capitalize">
                  {formatDayHeader(date)}
                </p>
              )}
              <div className="flex flex-col gap-3">
                {items.map((event) => (
                  <EventRow
                    key={event.id}
                    title={event.title}
                    category={event.category}
                    startTime={event.start_time}
                    endTime={event.end_time}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        aria-label="Новое событие"
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-card shadow-lg shadow-accent/30"
      >
        <Plus size={24} />
      </button>

      <EventFormModal open={isModalOpen} onClose={() => setIsModalOpen(false)} date={selectedDate} />
      <TaskDetailSheet task={selectedTask} projects={projects ?? []} onClose={() => setSelectedTaskId(null)} />
    </div>
  );
}

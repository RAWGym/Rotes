import type { Event } from "@/hooks/use-events";
import type { Task } from "@/hooks/use-tasks";

const categoryDotClass: Record<string, string> = {
  work: "bg-lavender",
  personal: "bg-sage",
};

const priorityDotClass: Record<string, string> = {
  high: "bg-priority-high",
  medium: "bg-priority-medium",
  low: "bg-priority-low",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "short" });
}

type DayIslandCardProps = {
  date: Date;
  isToday: boolean;
  events: Event[];
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onTaskClick: (id: string) => void;
};

export function DayIslandCard({ date, isToday, events, tasks, onToggleTask, onTaskClick }: DayIslandCardProps) {
  const isEmpty = events.length === 0 && tasks.length === 0;

  return (
    <div
      className={`w-[270px] shrink-0 snap-center rounded-2xl p-4 shadow-sm shadow-foreground/5 ${
        isToday ? "bg-accent/15 ring-1 ring-accent/40" : "bg-card"
      }`}
    >
      <p className="text-body font-medium capitalize text-foreground">{formatDayLabel(date)}</p>

      {isEmpty && <p className="mt-4 text-caption text-foreground/40">Ничего не запланировано</p>}

      {events.length > 0 && (
        <div className="mt-3 flex flex-col">
          {events.map((event) => {
            const dotClass = (event.category && categoryDotClass[event.category]) || "bg-accent";
            return (
              <div key={event.id} className="flex items-center gap-2 py-1.5">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
                <span className="flex-1 truncate text-caption text-foreground">{event.title}</span>
                <span className="shrink-0 text-caption text-foreground/40">{formatTime(event.start_time)}</span>
              </div>
            );
          })}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="mt-3 flex flex-col">
          <p className="text-caption font-medium text-foreground/50">Задачи</p>
          {tasks.map((task) => {
            const checked = task.status === "completed";
            const dotClass = task.priority ? priorityDotClass[task.priority] : null;
            return (
              <div
                key={task.id}
                onClick={() => onTaskClick(task.id)}
                className="flex w-full cursor-pointer items-center gap-2 py-1.5 text-left"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTask(task.id);
                  }}
                  className={
                    checked
                      ? "h-4 w-4 shrink-0 rounded-full bg-accent"
                      : "h-4 w-4 shrink-0 rounded-full border-2 border-foreground/20"
                  }
                />
                <span
                  className={
                    checked
                      ? "flex-1 truncate text-caption text-foreground/40 line-through"
                      : "flex-1 truncate text-caption text-foreground"
                  }
                >
                  {task.title}
                </span>
                {dotClass && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

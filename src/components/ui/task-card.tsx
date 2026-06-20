import { ChevronRight } from "lucide-react";

type Priority = "high" | "medium" | "low";

const priorityLabel: Record<Priority, string> = {
  high: "Высокий",
  medium: "Средний",
  low: "Низкий",
};

const priorityColorClass: Record<Priority, string> = {
  high: "bg-priority-high",
  medium: "bg-priority-medium",
  low: "bg-priority-low",
};

type TaskCardProps = {
  id: string;
  title: string;
  time?: string | null;
  priority?: string | null;
  checked?: boolean;
  onToggle?: (id: string) => void;
  onClick?: (id: string) => void;
};

export function TaskCard({ id, title, time, priority, checked = false, onToggle, onClick }: TaskCardProps) {
  const knownPriority =
    priority === "high" || priority === "medium" || priority === "low" ? priority : null;

  return (
    <div
      onClick={() => onClick?.(id)}
      className="flex cursor-pointer items-center gap-3 rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5"
    >
      <button
        type="button"
        aria-pressed={checked}
        aria-label={checked ? "Отметить как невыполненную" : "Отметить как выполненную"}
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.(id);
        }}
        className={
          checked
            ? "h-5 w-5 shrink-0 rounded-full bg-accent"
            : "h-5 w-5 shrink-0 rounded-full border-2 border-foreground/20"
        }
      />
      <div className="flex-1">
        <p
          className={
            checked
              ? "text-body text-foreground/40 line-through"
              : "text-body text-foreground"
          }
        >
          {title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-caption text-foreground/50">
          {time && <span>{time.slice(0, 5)}</span>}
          {knownPriority && (
            <span className="flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${priorityColorClass[knownPriority]}`} />
              {priorityLabel[knownPriority]}
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={18} className="shrink-0 text-foreground/30" />
    </div>
  );
}

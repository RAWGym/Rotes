"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Target,
  Bot,
  AlertCircle,
  Clock,
  Zap,
  Flame,
  ChevronRight,
} from "lucide-react";
import { TaskDetailSheet } from "@/components/ui/task-detail-sheet";
import { useTasks, useToggleTaskStatus, type Task } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useProfile } from "@/hooks/use-profile";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Доброе утро,";
  if (hour >= 12 && hour < 17) return "Добрый день,";
  if (hour >= 17 && hour < 22) return "Добрый вечер,";
  return "Доброй ночи,";
}

function getCategoryLabel(category: string | null) {
  const map: Record<string, string> = {
    work: "Работа",
    personal: "Личное",
    health: "Здоровье",
    finance: "Финансы",
    education: "Образование",
    business: "Бизнес",
  };
  return category ? (map[category] ?? category) : "Другое";
}

function isOverdue(task: Task) {
  if (!task.deadline || task.status === "completed") return false;
  return new Date(task.deadline) < new Date(new Date().setHours(0, 0, 0, 0));
}

function isDueToday(task: Task) {
  if (!task.deadline || task.status === "completed") return false;
  return new Date(task.deadline).toDateString() === new Date().toDateString();
}

function isDueTomorrow(task: Task) {
  if (!task.deadline || task.status === "completed") return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return new Date(task.deadline).toDateString() === tomorrow.toDateString();
}

function isUrgent(task: Task) {
  return (
    task.priority === "high" ||
    isOverdue(task) ||
    isDueToday(task)
  );
}

function pluralTasks(n: number) {
  if (n === 1) return "1 задача";
  if (n >= 2 && n <= 4) return `${n} задачи`;
  return `${n} задач`;
}

function formatDeadlineHint(task: Task) {
  if (isOverdue(task)) return "просрочена";
  if (isDueToday(task)) return "сегодня";
  if (isDueTomorrow(task)) return "завтра";
  if (task.deadline)
    return new Date(task.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  return null;
}

type TaskRowProps = {
  task: Task;
  subtasks: Task[];
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
  indent?: boolean;
};

function TaskRow({ task, subtasks, onToggle, onOpen, indent = false }: TaskRowProps) {
  const hint = formatDeadlineHint(task);
  const checked = task.status === "completed";

  return (
    <>
      <div
        className={`flex items-center gap-3 py-3 ${indent ? "pl-6" : ""} ${indent ? "border-l-2 border-foreground/10" : ""}`}
      >
        <div className="flex-1 cursor-pointer" onClick={() => onOpen(task.id)}>
          <p className={checked ? "text-body text-foreground/40 line-through" : "text-body text-foreground"}>
            {task.title}
          </p>
          {hint && (
            <p className={`text-caption ${isOverdue(task) ? "text-priority-high" : "text-foreground/50"}`}>
              Дедлайн: {hint}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          className={
            checked
              ? "shrink-0 rounded-full bg-sage/25 px-3 py-1 text-caption text-sage"
              : "shrink-0 rounded-full border border-foreground/15 px-3 py-1 text-caption text-foreground/60"
          }
        >
          {checked ? "Выполнено" : "Выполнить"}
        </button>
      </div>
      {subtasks.map((sub) => (
        <TaskRow
          key={sub.id}
          task={sub}
          subtasks={[]}
          onToggle={onToggle}
          onOpen={onOpen}
          indent
        />
      ))}
    </>
  );
}

type CategoryCardProps = {
  label: string;
  icon?: React.ReactNode;
  tasks: Task[];
  allTasks: Task[];
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
  accentClass?: string;
  defaultOpen?: boolean;
};

function CategoryCard({
  label,
  icon,
  tasks,
  allTasks,
  onToggle,
  onOpen,
  accentClass = "bg-accent/15 text-accent",
  defaultOpen = false,
}: CategoryCardProps) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const parentTasks = tasks.filter((t) => !t.parent_task_id);
  const completed = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-sm shadow-foreground/5">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${accentClass}`}>
              {icon}
            </div>
          )}
          <div className="text-left">
            <p className="text-body font-medium text-foreground">{label}</p>
            <p className="text-caption text-foreground/50">
              {pluralTasks(tasks.length)}
              {completed > 0 && ` · ${completed} выполнено`}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="shrink-0 text-foreground/40" />
        ) : (
          <ChevronDown size={16} className="shrink-0 text-foreground/40" />
        )}
      </button>

      {expanded && (
        <div className="divide-y divide-foreground/5 border-t border-foreground/5 px-4">
          {parentTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              subtasks={allTasks.filter((t) => t.parent_task_id === task.id)}
              onToggle={onToggle}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: tasks, isLoading } = useTasks();
  const { data: projects } = useProjects();
  const { data: profile } = useProfile();
  const toggleTask = useToggleTaskStatus();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const activeTasks = (tasks ?? []).filter((t) => t.status !== "completed");
  const urgentTasks = activeTasks.filter(isUrgent);

  const categoryMap: Record<string, Task[]> = {};
  for (const task of activeTasks.filter((t) => !isUrgent(t) && !t.parent_task_id)) {
    const key = task.category ?? "other";
    categoryMap[key] = categoryMap[key] ? [...categoryMap[key], task] : [task];
  }

  const overdue = activeTasks.filter(isOverdue);
  const dueToday = activeTasks.filter((t) => isDueToday(t) && !isOverdue(t));
  const dueTomorrow = activeTasks.filter(isDueTomorrow);
  const hasAttention = overdue.length > 0 || dueToday.length > 0 || dueTomorrow.length > 0 || activeTasks.length >= 7;

  const selectedTask = tasks?.find((t) => t.id === selectedTaskId) ?? null;

  function handleToggle(id: string) {
    const task = tasks?.find((t) => t.id === id);
    if (!task) return;
    toggleTask.mutate({ id, status: task.status === "completed" ? "active" : "completed" });
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <p className="text-caption text-foreground/60">{getGreeting()}</p>
        <h1 className="text-h1">{profile?.name ?? "..."}</h1>
      </div>

      <h2 className="text-h2">На сегодня</h2>
      <div className="mt-3 flex flex-col gap-3">
        {isLoading && <p className="text-caption text-foreground/50">Загрузка...</p>}
        {!isLoading && activeTasks.length === 0 && (
          <p className="text-caption text-foreground/50">Все задачи выполнены 🎉</p>
        )}

        {urgentTasks.length > 0 && (
          <CategoryCard
            label="Срочные"
            icon={<Flame size={14} />}
            accentClass="bg-priority-high/15 text-priority-high"
            tasks={urgentTasks}
            allTasks={tasks ?? []}
            onToggle={handleToggle}
            onOpen={setSelectedTaskId}
            defaultOpen
          />
        )}

        {Object.entries(categoryMap).map(([category, catTasks]) => (
          <CategoryCard
            key={category}
            label={getCategoryLabel(category)}
            tasks={catTasks}
            allTasks={tasks ?? []}
            onToggle={handleToggle}
            onOpen={setSelectedTaskId}
          />
        ))}
      </div>

      {hasAttention && (
        <>
          <h2 className="mt-8 text-h2">Стоит обратить внимание</h2>
          <div className="mt-3 flex flex-col gap-2">
            {overdue.length > 0 && (
              <div className="flex items-start gap-3 rounded-2xl bg-priority-high/10 p-4">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-priority-high" />
                <div>
                  <p className="text-body font-medium text-foreground">
                    {overdue.length === 1 ? "1 просроченная задача" : `${overdue.length} просроченных задачи`}
                  </p>
                  {overdue.slice(0, 2).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTaskId(t.id)}
                      className="mt-1 flex items-center gap-1 text-caption text-foreground/60"
                    >
                      <ChevronRight size={12} />
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(dueToday.length > 0 || dueTomorrow.length > 0) && (
              <div className="flex items-start gap-3 rounded-2xl bg-priority-medium/10 p-4">
                <Clock size={18} className="mt-0.5 shrink-0 text-priority-medium" />
                <div>
                  <p className="text-body font-medium text-foreground">
                    {[
                      dueToday.length > 0 && `${dueToday.length} с дедлайном сегодня`,
                      dueTomorrow.length > 0 && `${dueTomorrow.length} с дедлайном завтра`,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {[...dueToday, ...dueTomorrow].slice(0, 2).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTaskId(t.id)}
                      className="mt-1 flex items-center gap-1 text-caption text-foreground/60"
                    >
                      <ChevronRight size={12} />
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTasks.length >= 7 && (
              <div className="flex items-start gap-3 rounded-2xl bg-sage/20 p-4">
                <Zap size={18} className="mt-0.5 shrink-0 text-sage" />
                <p className="text-body text-foreground">
                  {activeTasks.length} активных задач — стоит выполнить несколько, чтобы снизить нагрузку
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <h2 className="mt-8 text-h2">Быстрые действия</h2>
      <div className="mt-3 flex flex-col gap-2">
        <Link
          href="/assistant?mode=task"
          className="flex items-center gap-3 rounded-2xl bg-accent p-4 text-card"
        >
          <Bot size={20} />
          <div>
            <p className="text-body font-medium">Создать задачу с ИИ</p>
            <p className="text-caption opacity-80">Опишите — ИИ всё оформит сам</p>
          </div>
        </Link>
        <div className="flex gap-2">
          <Link
            href="/tasks/new"
            className="flex flex-1 items-center gap-2 rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5"
          >
            <Plus size={18} className="text-accent" />
            <span className="text-body text-foreground">Добавить задачу</span>
          </Link>
          <Link
            href="/goals/new"
            className="flex flex-1 items-center gap-2 rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5"
          >
            <Target size={18} className="text-sage" />
            <span className="text-body text-foreground">Добавить цель</span>
          </Link>
        </div>
        <Link
          href="/assistant"
          className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5"
        >
          <Bot size={18} className="text-lavender" />
          <span className="text-body text-foreground">Помощник</span>
        </Link>
      </div>

      <TaskDetailSheet
        task={selectedTask}
        projects={projects ?? []}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Plus, Target, Bot, AlertCircle, Clock, Zap } from "lucide-react";
import { ProgressRing } from "@/components/ui/progress-ring";
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
  };
  return category ? (map[category] ?? category) : "Другое";
}

function isOverdue(task: Task) {
  if (!task.deadline || task.status === "completed") return false;
  return new Date(task.deadline) < new Date(new Date().setHours(0, 0, 0, 0));
}

function isDueToday(task: Task) {
  if (!task.deadline || task.status === "completed") return false;
  const today = new Date();
  const d = new Date(task.deadline);
  return d.toDateString() === today.toDateString();
}

function isDueTomorrow(task: Task) {
  if (!task.deadline || task.status === "completed") return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return new Date(task.deadline).toDateString() === tomorrow.toDateString();
}

type CategoryGroup = { category: string; label: string; tasks: Task[] };

function groupTasksByCategory(tasks: Task[]): CategoryGroup[] {
  const map: Record<string, Task[]> = {};
  for (const task of tasks) {
    const key = task.category ?? "other";
    map[key] = map[key] ? [...map[key], task] : [task];
  }
  return Object.entries(map).map(([category, tasks]) => ({
    category,
    label: getCategoryLabel(category),
    tasks,
  }));
}

type CategoryCardProps = {
  group: CategoryGroup;
  onToggle: (id: string) => void;
  onTaskClick: (id: string) => void;
};

function CategoryCard({ group, onToggle, onTaskClick }: CategoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const completed = group.tasks.filter((t) => t.status === "completed").length;
  const total = group.tasks.length;

  return (
    <div className="rounded-2xl bg-card shadow-sm shadow-foreground/5">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div>
            <p className="text-left text-body font-medium text-foreground">{group.label}</p>
            <p className="text-caption text-foreground/50">
              {completed} из {total} выполнено
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-caption font-medium text-accent">
            {total}
          </span>
          {expanded ? (
            <ChevronUp size={16} className="text-foreground/40" />
          ) : (
            <ChevronDown size={16} className="text-foreground/40" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-foreground/5 px-4 pb-3">
          {group.tasks.map((task) => (
            <div
              key={task.id}
              className="flex cursor-pointer items-center gap-3 py-3"
              onClick={() => onTaskClick(task.id)}
            >
              <button
                type="button"
                aria-label="Выполнить"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(task.id);
                }}
                className={
                  task.status === "completed"
                    ? "h-5 w-5 shrink-0 rounded-full bg-accent"
                    : "h-5 w-5 shrink-0 rounded-full border-2 border-foreground/20"
                }
              />
              <div className="flex-1">
                <p
                  className={
                    task.status === "completed"
                      ? "text-body text-foreground/40 line-through"
                      : "text-body text-foreground"
                  }
                >
                  {task.title}
                </p>
                {task.deadline && (
                  <p className={`text-caption ${isOverdue(task) ? "text-priority-high" : "text-foreground/50"}`}>
                    {isOverdue(task) ? "Просрочено · " : ""}
                    {new Date(task.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                  </p>
                )}
              </div>
            </div>
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
  const total = tasks?.length ?? 0;
  const completed = tasks?.filter((t) => t.status === "completed").length ?? 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const groups = groupTasksByCategory(activeTasks);

  const overdue = activeTasks.filter(isOverdue);
  const dueToday = activeTasks.filter(isDueToday);
  const dueTomorrow = activeTasks.filter(isDueTomorrow);

  const selectedTask = tasks?.find((t) => t.id === selectedTaskId) ?? null;

  function handleToggle(id: string) {
    const task = tasks?.find((t) => t.id === id);
    if (!task) return;
    const nextStatus = task.status === "completed" ? "active" : "completed";
    toggleTask.mutate({ id, status: nextStatus });
  }

  const hasAttention = overdue.length > 0 || dueToday.length > 0 || dueTomorrow.length > 0;

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-caption text-foreground/60">{getGreeting()}</p>
          <h1 className="text-h1">{profile?.name ?? "..."}</h1>
        </div>
        <ProgressRing value={progress} size={56} strokeWidth={5} />
      </div>

      <h2 className="mt-8 text-h2">На сегодня</h2>

      <div className="mt-3 flex flex-col gap-3">
        {isLoading && <p className="text-caption text-foreground/50">Загрузка...</p>}
        {!isLoading && activeTasks.length === 0 && (
          <p className="text-caption text-foreground/50">Все задачи выполнены 🎉</p>
        )}
        {groups.map((group) => (
          <CategoryCard
            key={group.category}
            group={group}
            onToggle={handleToggle}
            onTaskClick={setSelectedTaskId}
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
                <p className="text-body text-foreground">
                  {overdue.length === 1
                    ? `1 просроченная задача — «${overdue[0].title}»`
                    : `${overdue.length} просроченных задачи`}
                </p>
              </div>
            )}
            {(dueToday.length > 0 || dueTomorrow.length > 0) && (
              <div className="flex items-start gap-3 rounded-2xl bg-priority-medium/10 p-4">
                <Clock size={18} className="mt-0.5 shrink-0 text-priority-medium" />
                <p className="text-body text-foreground">
                  {[
                    dueToday.length > 0 && `${dueToday.length} с дедлайном сегодня`,
                    dueTomorrow.length > 0 && `${dueTomorrow.length} с дедлайном завтра`,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}
            {activeTasks.length >= 5 && (
              <div className="flex items-start gap-3 rounded-2xl bg-sage/20 p-4">
                <Zap size={18} className="mt-0.5 shrink-0 text-sage" />
                <p className="text-body text-foreground">
                  Много активных задач — стоит выполнить несколько, чтобы снизить нагрузку
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
            <p className="text-caption opacity-80">Опишите — ИИ всё оформит</p>
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

      <TaskDetailSheet task={selectedTask} projects={projects ?? []} onClose={() => setSelectedTaskId(null)} />
    </div>
  );
}
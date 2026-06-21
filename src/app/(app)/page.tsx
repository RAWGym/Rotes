"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  Target,
  FileText,
  Sparkles,
  Briefcase,
  Home as HomeIcon,
  type LucideIcon,
} from "lucide-react";
import { ProgressRing } from "@/components/ui/progress-ring";
import { TaskCard } from "@/components/ui/task-card";
import { QuickActionButton } from "@/components/ui/quick-action-button";
import { TaskDetailSheet } from "@/components/ui/task-detail-sheet";
import { useTasks, useToggleTaskStatus, type Task } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useProfile } from "@/hooks/use-profile";

const filters = [
  { value: "all", label: "Все" },
  { value: "work", label: "Работа" },
  { value: "personal", label: "Личное" },
];

const categoryMeta: Record<string, { label: string; icon: LucideIcon }> = {
  work: { label: "Работа", icon: Briefcase },
  personal: { label: "Личное", icon: HomeIcon },
};

function groupByCategory(tasks: Task[]) {
  const groups: Record<string, Task[]> = {};
  for (const task of tasks) {
    const key = task.category && categoryMeta[task.category] ? task.category : "other";
    groups[key] = groups[key] ? [...groups[key], task] : [task];
  }
  const order = ["work", "personal", "other"];
  return order.filter((key) => groups[key]?.length).map((key) => ({ key, items: groups[key] }));
}

export default function DashboardPage() {
  const { data: tasks, isLoading } = useTasks();
  const { data: projects } = useProjects();
  const { data: profile } = useProfile();
  const toggleTask = useToggleTaskStatus();
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const total = tasks?.length ?? 0;
  const completed = tasks?.filter((t) => t.status === "completed").length ?? 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filteredTasks =
    activeFilter === "all" ? tasks ?? [] : (tasks ?? []).filter((t) => t.category === activeFilter);

  const groups = groupByCategory(filteredTasks);
  const selectedTask = tasks?.find((t) => t.id === selectedTaskId) ?? null;

  function handleToggle(id: string) {
    const task = tasks?.find((t) => t.id === id);
    if (!task) return;
    const nextStatus = task.status === "completed" ? "active" : "completed";
    toggleTask.mutate({ id, status: nextStatus });
  }

  return (
    <div className="relative p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-caption text-foreground/60">Добрый вечер,</p>
          <h1 className="text-h1">{profile?.name ?? "..."}</h1>
        </div>
        <button
          type="button"
          aria-label="Уведомления"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card shadow-sm shadow-foreground/5"
        >
          <Bell size={18} className="text-foreground/70" />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl bg-card p-6 shadow-sm shadow-foreground/5">
        <div>
          <p className="text-caption text-foreground/60">Прогресс дня</p>
          <p className="text-h1">{progress}%</p>
          <p className="text-caption text-foreground/60">
            {completed} из {total} задач выполнено
          </p>
        </div>
        <ProgressRing value={progress} />
      </div>

      <div className="mt-4 flex gap-2">
        <Link href="/tasks/new" className="flex-1">
          <QuickActionButton
            icon={Plus}
            label="Новая задача"
            bgColorClass="bg-accent/15"
            iconColorClass="text-accent"
          />
        </Link>
        <Link href="/goals/new" className="flex-1">
          <QuickActionButton
            icon={Target}
            label="Новая цель"
            bgColorClass="bg-sage/25"
            iconColorClass="text-sage"
          />
        </Link>
        <Link href="/notes" className="flex-1">
          <QuickActionButton
            icon={FileText}
            label="Заметка"
            bgColorClass="bg-lavender/20"
            iconColorClass="text-lavender"
          />
        </Link>
        <Link href="/focus" className="flex-1">
          <QuickActionButton
            icon={Sparkles}
            label="Фокус режим"
            bgColorClass="bg-lavender/35"
            iconColorClass="text-[#7C6BC7]"
          />
        </Link>
      </div>

      <div className="mt-6 flex gap-2 rounded-full bg-card p-1">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
            className={
              activeFilter === filter.value
                ? "flex-1 rounded-full bg-foreground py-2 text-caption font-medium text-background"
                : "flex-1 rounded-full py-2 text-caption text-foreground/60"
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-h2">Сегодня</h2>
          <span className="text-caption text-foreground/50">{total} задач</span>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-5">
        {isLoading && <p className="text-caption text-foreground/50">Загрузка...</p>}
        {!isLoading && filteredTasks.length === 0 && (
          <p className="text-caption text-foreground/50">Пока нет ни одной задачи.</p>
        )}
        {groups.map(({ key, items }) => {
          const meta = categoryMeta[key];
          const GroupIcon = meta?.icon;
          return (
            <div key={key}>
              {meta && (
                <div className="mb-2 flex items-center gap-2 text-caption text-foreground/60">
                  <GroupIcon size={14} />
                  <span>{meta.label}</span>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {items.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    time={task.time}
                    priority={task.priority}
                    checked={task.status === "completed"}
                    onToggle={handleToggle}
                    onClick={setSelectedTaskId}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/tasks/new"
        aria-label="Новая задача"
        className="fixed bottom-24 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-card shadow-lg shadow-accent/30"
      >
        <Plus size={24} />
      </Link>

      <TaskDetailSheet task={selectedTask} projects={projects ?? []} onClose={() => setSelectedTaskId(null)} />
    </div>
  );
}

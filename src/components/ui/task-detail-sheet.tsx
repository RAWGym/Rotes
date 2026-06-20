"use client";

import { useState } from "react";
import { X, Pencil, Calendar, Clock, FolderKanban, Flag, Layers } from "lucide-react";
import type { Task } from "@/hooks/use-tasks";
import type { Project } from "@/hooks/use-projects";
import { useUpdateTask, useToggleTaskStatus } from "@/hooks/use-tasks";

const priorityLabel: Record<string, string> = { high: "Высокий", medium: "Средний", low: "Низкий" };
const priorityDotClass: Record<string, string> = {
  high: "bg-priority-high",
  medium: "bg-priority-medium",
  low: "bg-priority-low",
};
const categoryLabel: Record<string, string> = { work: "Работа", personal: "Личное" };

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

type TaskDetailSheetProps = {
  task: Task | null;
  projects: Project[];
  onClose: () => void;
};

export function TaskDetailSheet({ task, projects, onClose }: TaskDetailSheetProps) {
  const updateTask = useUpdateTask();
  const toggleStatus = useToggleTaskStatus();
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("work");
  const [projectId, setProjectId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [time, setTime] = useState("");

  if (!task) return null;

  const project = projects.find((p) => p.id === task.project_id);
  const checked = task.status === "completed";

  function startEditing() {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(task.priority ?? "medium");
    setCategory(task.category ?? "work");
    setProjectId(task.project_id ?? "");
    setDeadline(task.deadline ? task.deadline.slice(0, 10) : "");
    setTime(task.time ?? "");
    setIsEditing(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!task) return;
    updateTask.mutate(
      {
        id: task.id,
        title: title.trim(),
        description: description.trim() || null,
        priority,
        category,
        project_id: projectId || null,
        deadline: deadline || null,
        time: time || null,
      },
      { onSuccess: () => setIsEditing(false) }
    );
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-background">
      <div className="flex items-center justify-between p-6">
        <button
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm shadow-foreground/5"
        >
          <X size={18} className="text-foreground/70" />
        </button>
        {!isEditing && (
          <button
            type="button"
            aria-label="Редактировать"
            onClick={startEditing}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm shadow-foreground/5"
          >
            <Pencil size={18} className="text-foreground/70" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-10">
        {!isEditing ? (
          <>
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() =>
                  toggleStatus.mutate({ id: task.id, status: checked ? "active" : "completed" })
                }
                className={
                  checked
                    ? "mt-1 h-6 w-6 shrink-0 rounded-full bg-accent"
                    : "mt-1 h-6 w-6 shrink-0 rounded-full border-2 border-foreground/20"
                }
              />
              <h1 className={checked ? "text-h1 text-foreground/40 line-through" : "text-h1"}>
                {task.title}
              </h1>
            </div>

            {task.description && <p className="mt-4 text-body text-foreground/70">{task.description}</p>}

            <div className="mt-6 flex flex-col gap-3">
              {task.priority && (
                <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5">
                  <Flag size={18} className="text-foreground/50" />
                  <span className="flex-1 text-body text-foreground">Приоритет</span>
                  <span className="flex items-center gap-1.5 text-caption text-foreground/60">
                    <span className={`h-2 w-2 rounded-full ${priorityDotClass[task.priority]}`} />
                    {priorityLabel[task.priority]}
                  </span>
                </div>
              )}

              {task.category && (
                <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5">
                  <Layers size={18} className="text-foreground/50" />
                  <span className="flex-1 text-body text-foreground">Раздел</span>
                  <span className="text-caption text-foreground/60">
                    {categoryLabel[task.category] ?? task.category}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5">
                <FolderKanban size={18} className="text-foreground/50" />
                <span className="flex-1 text-body text-foreground">Проект</span>
                {project ? (
                  <span className="flex items-center gap-1.5 text-caption text-foreground/60">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: project.color ?? undefined }}
                    />
                    {project.name}
                  </span>
                ) : (
                  <span className="text-caption text-foreground/40">Без проекта</span>
                )}
              </div>

              {task.deadline && (
                <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5">
                  <Calendar size={18} className="text-foreground/50" />
                  <span className="flex-1 text-body text-foreground">Дедлайн</span>
                  <span className="text-caption text-foreground/60">{formatDate(task.deadline)}</span>
                </div>
              )}

              {task.time && (
                <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5">
                  <Clock size={18} className="text-foreground/50" />
                  <span className="flex-1 text-body text-foreground">Время</span>
                  <span className="text-caption text-foreground/60">{task.time.slice(0, 5)}</span>
                </div>
              )}
            </div>

            <p className="mt-6 text-caption text-foreground/40">Создано {formatDate(task.created_at)}</p>
          </>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание"
              rows={4}
              className="resize-none rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
            >
              <option value="work">Работа</option>
              <option value="personal">Личное</option>
            </select>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
            >
              <option value="">Без проекта</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
            >
              <option value="high">Высокий приоритет</option>
              <option value="medium">Средний приоритет</option>
              <option value="low">Низкий приоритет</option>
            </select>
            <div className="flex gap-3">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="flex-1 rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1 rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
              />
            </div>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 rounded-xl border border-foreground/15 px-4 py-3 text-body text-foreground"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={updateTask.isPending}
                className="flex-1 rounded-xl bg-accent px-4 py-3 text-body font-medium text-card disabled:opacity-50"
              >
                {updateTask.isPending ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

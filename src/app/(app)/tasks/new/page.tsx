"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubPageHeader } from "@/components/ui/sub-page-header";
import { useCreateTask } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { ProjectFormModal } from "@/components/ui/project-form-modal";

export default function NewTaskPage() {
  const router = useRouter();
  const createTask = useCreateTask();
  const { data: projects } = useProjects();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [time, setTime] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("work");
  const [projectId, setProjectId] = useState("");
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    createTask.mutate(
      {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        time: time || null,
        deadline: deadline || null,
        category,
        projectId: projectId || null,
      },
      { onSuccess: () => router.back() }
    );
  }

  function handleProjectSelectChange(value: string) {
    if (value === "__new__") {
      setIsProjectModalOpen(true);
      return;
    }
    setProjectId(value);
  }

  return (
    <div className="p-6">
      <SubPageHeader title="Новая задача" onBack={() => router.back()} />

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Что нужно сделать?"
          required
          className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание (необязательно)"
          rows={3}
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
          onChange={(e) => handleProjectSelectChange(e.target.value)}
          className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
        >
          <option value="">Без проекта</option>
          {projects?.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
          <option value="__new__">+ Новый проект</option>
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

        <button
          type="submit"
          disabled={createTask.isPending}
          className="mt-2 rounded-xl bg-accent px-4 py-3 text-body font-medium text-card disabled:opacity-50"
        >
          {createTask.isPending ? "Сохранение..." : "Создать"}
        </button>
      </form>

      <ProjectFormModal
        open={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onCreated={(id) => setProjectId(id)}
      />
    </div>
  );
}
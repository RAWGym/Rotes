"use client";

import { useEffect, useRef, useState } from "react";
import { useCreateTask } from "@/hooks/use-tasks";

type TaskFormModalProps = {
  open: boolean;
  onClose: () => void;
};

export function TaskFormModal({ open, onClose }: TaskFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const createTask = useCreateTask();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("work");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    createTask.mutate(
      { title: title.trim(), priority, time: time || null, category },
      {
        onSuccess: () => {
          setTitle("");
          setPriority("medium");
          setTime("");
          setCategory("work");
          onClose();
        },
      }
    );
  }

  return (
    <dialog ref={dialogRef} onClose={onClose} className="w-full max-w-sm rounded-2xl bg-card p-6">
      <h2 className="text-h2">Новая задача</h2>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Что нужно сделать?"
          required
          className="rounded-xl border border-foreground/15 bg-background px-4 py-3 text-body outline-none focus:border-accent"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-foreground/15 bg-background px-4 py-3 text-body outline-none focus:border-accent"
        >
          <option value="work">Работа</option>
          <option value="personal">Личное</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-xl border border-foreground/15 bg-background px-4 py-3 text-body outline-none focus:border-accent"
        >
          <option value="high">Высокий приоритет</option>
          <option value="medium">Средний приоритет</option>
          <option value="low">Низкий приоритет</option>
        </select>

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-xl border border-foreground/15 bg-background px-4 py-3 text-body outline-none focus:border-accent"
        />

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-foreground/15 px-4 py-3 text-body text-foreground"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={createTask.isPending}
            className="flex-1 rounded-xl bg-accent px-4 py-3 text-body font-medium text-card disabled:opacity-50"
          >
            {createTask.isPending ? "Сохранение..." : "Создать"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useCreateGoal } from "@/hooks/use-goals";

type GoalFormModalProps = {
  open: boolean;
  onClose: () => void;
};

export function GoalFormModal({ open, onClose }: GoalFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const createGoal = useCreateGoal();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("personal");
  const [targetValue, setTargetValue] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    createGoal.mutate(
      {
        title: title.trim(),
        category,
        targetValue: targetValue ? Number(targetValue) : null,
        currentProgress: 0,
        deadline: deadline || null,
      },
      {
        onSuccess: () => {
          setTitle("");
          setCategory("personal");
          setTargetValue("");
          setDeadline("");
          onClose();
        },
      }
    );
  }

  return (
    <dialog ref={dialogRef} onClose={onClose} className="w-full max-w-sm rounded-2xl bg-card p-6">
      <h2 className="text-h2">Новая цель</h2>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Какая цель?"
          required
          className="rounded-xl border border-foreground/15 bg-background px-4 py-3 text-body outline-none focus:border-accent"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-foreground/15 bg-background px-4 py-3 text-body outline-none focus:border-accent"
        >
          <option value="finance">Финансы</option>
          <option value="health">Здоровье</option>
          <option value="career">Карьера</option>
          <option value="education">Образование</option>
          <option value="personal">Личное</option>
        </select>

        <input
          type="number"
          min={1}
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          placeholder="Целевое значение (например, 5000000)"
          className="rounded-xl border border-foreground/15 bg-background px-4 py-3 text-body outline-none focus:border-accent"
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
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
            disabled={createGoal.isPending}
            className="flex-1 rounded-xl bg-accent px-4 py-3 text-body font-medium text-card disabled:opacity-50"
          >
            {createGoal.isPending ? "Сохранение..." : "Создать"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

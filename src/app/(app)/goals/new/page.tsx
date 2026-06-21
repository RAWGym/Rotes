"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubPageHeader } from "@/components/ui/sub-page-header";
import { useCreateGoal } from "@/hooks/use-goals";

export default function NewGoalPage() {
  const router = useRouter();
  const createGoal = useCreateGoal();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("personal");
  const [targetValue, setTargetValue] = useState("");
  const [deadline, setDeadline] = useState("");

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
      { onSuccess: () => router.back() }
    );
  }

  return (
    <div className="p-6">
      <SubPageHeader title="Новая цель" onBack={() => router.back()} />

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Какая цель?"
          required
          className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
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
          className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
        />

        <button
          type="submit"
          disabled={createGoal.isPending}
          className="mt-2 rounded-xl bg-accent px-4 py-3 text-body font-medium text-card disabled:opacity-50"
        >
          {createGoal.isPending ? "Сохранение..." : "Создать"}
        </button>
      </form>
    </div>
  );
}

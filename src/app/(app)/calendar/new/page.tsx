"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SubPageHeader } from "@/components/ui/sub-page-header";
import { useCreateEvent } from "@/hooks/use-events";

function buildIso(dateStr: string, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(dateStr);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

export default function NewEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const createEvent = useCreateEvent();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("work");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) return;
    if (startTime >= endTime) {
      setError("Время окончания должно быть позже начала");
      return;
    }

    createEvent.mutate(
      {
        title: title.trim(),
        category,
        startTime: buildIso(dateParam, startTime),
        endTime: buildIso(dateParam, endTime),
      },
      { onSuccess: () => router.back() }
    );
  }

  const dayLabel = new Date(dateParam).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

  return (
    <div className="p-6">
      <SubPageHeader title="Новое событие" onBack={() => router.back()} />
      <p className="mt-1 text-caption text-foreground/50">{dayLabel}</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название события"
          required
          className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
        >
          <option value="work">Работа</option>
          <option value="personal">Личное</option>
        </select>

        <div className="flex gap-3">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="flex-1 rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="flex-1 rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
          />
        </div>

        {error && <p className="text-caption text-priority-high">{error}</p>}

        <button
          type="submit"
          disabled={createEvent.isPending}
          className="mt-2 rounded-xl bg-accent px-4 py-3 text-body font-medium text-card disabled:opacity-50"
        >
          {createEvent.isPending ? "Сохранение..." : "Создать"}
        </button>
      </form>
    </div>
  );
}

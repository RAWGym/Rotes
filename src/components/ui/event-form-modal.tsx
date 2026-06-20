"use client";

import { useEffect, useRef, useState } from "react";
import { useCreateEvent } from "@/hooks/use-events";

type EventFormModalProps = {
  open: boolean;
  onClose: () => void;
  date: Date;
};

function buildIso(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

export function EventFormModal({ open, onClose, date }: EventFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const createEvent = useCreateEvent();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("work");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

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
        startTime: buildIso(date, startTime),
        endTime: buildIso(date, endTime),
      },
      {
        onSuccess: () => {
          setTitle("");
          setCategory("work");
          setStartTime("09:00");
          setEndTime("10:00");
          onClose();
        },
      }
    );
  }

  const dayLabel = date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

  return (
    <dialog ref={dialogRef} onClose={onClose} className="w-full max-w-sm rounded-2xl bg-card p-6">
      <h2 className="text-h2">Новое событие</h2>
      <p className="mt-1 text-caption text-foreground/50">{dayLabel}</p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название события"
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

        <div className="flex gap-3">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="flex-1 rounded-xl border border-foreground/15 bg-background px-4 py-3 text-body outline-none focus:border-accent"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="flex-1 rounded-xl border border-foreground/15 bg-background px-4 py-3 text-body outline-none focus:border-accent"
          />
        </div>

        {error && <p className="text-caption text-priority-high">{error}</p>}

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
            disabled={createEvent.isPending}
            className="flex-1 rounded-xl bg-accent px-4 py-3 text-body font-medium text-card disabled:opacity-50"
          >
            {createEvent.isPending ? "Сохранение..." : "Создать"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

"use client";

import { useState } from "react";
import { SubPageHeader } from "@/components/ui/sub-page-header";

export default function SettingsPage() {
  const [weekStart, setWeekStart] = useState<"monday" | "sunday">("monday");
  const [timeFormat, setTimeFormat] = useState<"24" | "12">("24");

  return (
    <div className="p-6">
      <SubPageHeader title="Настройки" />

      <div className="mt-6 flex flex-col gap-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5">
          <p className="text-body text-foreground">Начало недели</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setWeekStart("monday")}
              className={
                weekStart === "monday"
                  ? "flex-1 rounded-xl bg-foreground py-2 text-caption font-medium text-background"
                  : "flex-1 rounded-xl border border-foreground/15 py-2 text-caption text-foreground/60"
              }
            >
              Понедельник
            </button>
            <button
              type="button"
              onClick={() => setWeekStart("sunday")}
              className={
                weekStart === "sunday"
                  ? "flex-1 rounded-xl bg-foreground py-2 text-caption font-medium text-background"
                  : "flex-1 rounded-xl border border-foreground/15 py-2 text-caption text-foreground/60"
              }
            >
              Воскресенье
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5">
          <p className="text-body text-foreground">Формат времени</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setTimeFormat("24")}
              className={
                timeFormat === "24"
                  ? "flex-1 rounded-xl bg-foreground py-2 text-caption font-medium text-background"
                  : "flex-1 rounded-xl border border-foreground/15 py-2 text-caption text-foreground/60"
              }
            >
              24-часовой
            </button>
            <button
              type="button"
              onClick={() => setTimeFormat("12")}
              className={
                timeFormat === "12"
                  ? "flex-1 rounded-xl bg-foreground py-2 text-caption font-medium text-background"
                  : "flex-1 rounded-xl border border-foreground/15 py-2 text-caption text-foreground/60"
              }
            >
              12-часовой (AM/PM)
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-caption text-foreground/40">
        Эти настройки пока не сохраняются между сессиями — рабочий макет, реальное хранение в
        таблице settings подключим отдельным шагом.
      </p>
    </div>
  );
}

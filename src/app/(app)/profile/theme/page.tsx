"use client";

import { useState } from "react";
import { Sun, Moon, MonitorSmartphone } from "lucide-react";
import { SubPageHeader } from "@/components/ui/sub-page-header";

const options = [
  { value: "light", label: "Светлая", icon: Sun },
  { value: "dark", label: "Тёмная", icon: Moon },
  { value: "system", label: "Системная", icon: MonitorSmartphone },
] as const;

export default function ThemePage() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  return (
    <div className="p-6">
      <SubPageHeader title="Тема оформления" />

      <div className="mt-6 flex flex-col gap-3">
        {options.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={
              theme === value
                ? "flex items-center gap-3 rounded-2xl bg-accent/15 p-4 text-left ring-2 ring-accent"
                : "flex items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm shadow-foreground/5"
            }
          >
            <Icon size={18} className="text-foreground/70" />
            <span className="text-body text-foreground">{label}</span>
          </button>
        ))}
      </div>

      <p className="mt-6 text-caption text-foreground/40">
        Тёмная палитра ещё не нарисована в дизайн-системе — выбор сохраняется на экране, но
        визуально пока ничего не меняет.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUpdateProfile } from "@/hooks/use-profile";

const occupationOptions = ["Работа по найму", "Фриланс", "Учёба", "Своё дело", "Не работаю"];
const priorityOptions = [
  { value: "tasks", label: "Отслеживание задач" },
  { value: "organize", label: "Упорядочивание дел" },
  { value: "goals", label: "Создание и трекер целей" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [occupation, setOccupation] = useState<string[]>([]);
  const [mainPriority, setMainPriority] = useState("");
  const [error, setError] = useState("");

  function toggleOccupation(option: string) {
    setOccupation((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !age || occupation.length === 0 || !mainPriority) {
      setError("Заполни, пожалуйста, все поля");
      return;
    }

    updateProfile.mutate(
      {
        name: name.trim(),
        age: Number(age),
        occupation,
        main_priority: mainPriority,
        onboarding_completed: true,
      },
      {
        onSuccess: () => router.push("/"),
        onError: () => setError("Не получилось сохранить, попробуй ещё раз"),
      }
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-h1">Расскажи о себе</h1>
      <p className="mt-2 text-caption text-foreground/60">
        Это поможет настроить Rotes под тебя. Займёт меньше минуты.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <div>
          <label className="text-caption font-medium text-foreground/70">Как вас зовут?</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя"
            className="mt-2 w-full rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="text-caption font-medium text-foreground/70">Ваш возраст</label>
          <input
            type="number"
            min={1}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Возраст"
            className="mt-2 w-full rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="text-caption font-medium text-foreground/70">
            Чем занимаетесь? (можно несколько)
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {occupationOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleOccupation(option)}
                className={
                  occupation.includes(option)
                    ? "rounded-full bg-accent px-4 py-2 text-caption font-medium text-card"
                    : "rounded-full border border-foreground/15 bg-card px-4 py-2 text-caption text-foreground/70"
                }
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-caption font-medium text-foreground/70">Что важнее всего?</label>
          <div className="mt-2 flex flex-col gap-2">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMainPriority(option.value)}
                className={
                  mainPriority === option.value
                    ? "rounded-xl bg-accent/15 p-4 text-left text-body ring-2 ring-accent"
                    : "rounded-xl bg-card p-4 text-left text-body shadow-sm shadow-foreground/5"
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-caption text-priority-high">{error}</p>}

        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="rounded-xl bg-accent px-4 py-3 text-body font-medium text-card disabled:opacity-50"
        >
          {updateProfile.isPending ? "Сохранение..." : "Готово"}
        </button>
      </form>
    </div>
  );
}

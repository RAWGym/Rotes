"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUpdateProfile } from "@/hooks/use-profile";
import { ChevronRight } from "lucide-react";

const OCCUPATION_OPTIONS = [
  { value: "employed",  label: "Работа по найму", emoji: "💼" },
  { value: "freelance", label: "Фриланс",          emoji: "💻" },
  { value: "student",   label: "Учёба",             emoji: "📚" },
  { value: "business",  label: "Своё дело",         emoji: "🚀" },
  { value: "none",      label: "Не работаю",        emoji: "🌿" },
];

const PRIORITY_OPTIONS = [
  {
    value: "tasks",
    label: "Отслеживание задач",
    sub: "Контролировать что и когда нужно сделать",
    emoji: "✅",
  },
  {
    value: "organize",
    label: "Упорядочивание дел",
    sub: "Навести порядок в жизни и голове",
    emoji: "🗂️",
  },
  {
    value: "goals",
    label: "Создание и трекер целей",
    sub: "Строить планы и видеть прогресс",
    emoji: "🎯",
  },
];

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 overflow-hidden rounded-full"
          style={{ background: "rgba(42,42,42,0.1)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: i <= step ? "100%" : "0%",
              background: i <= step ? "#D9B38C" : "transparent",
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const updateProfile = useUpdateProfile();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [occupation, setOccupation] = useState<string[]>([]);
  const [mainPriority, setMainPriority] = useState("");
  const [error, setError] = useState("");

  function toggleOccupation(val: string) {
    setOccupation((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  }

  function canProceed() {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return occupation.length > 0;
    if (step === 2) return mainPriority.length > 0;
    return false;
  }

  function handleNext() {
    setError("");
    if (!canProceed()) {
      setError(step === 0 ? "Введите ваше имя" : "Выберите хотя бы один вариант");
      return;
    }
    if (step < 2) {
      setStep((s) => s + 1);
    } else {
      updateProfile.mutate(
        {
          name: name.trim(),
          age: age ? Number(age) : null,
          occupation,
          main_priority: mainPriority,
          onboarding_completed: true,
        },
        {
          onSuccess: () => router.push("/"),
          onError: () => setError("Не удалось сохранить. Попробуй ещё раз."),
        }
      );
    }
  }

  return (
    <div
      className="relative flex min-h-screen flex-col px-6"
      style={{
        background: "#F8F4EF",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute right-0 top-0"
        style={{
          width: 320, height: 320,
          background: "radial-gradient(circle at 70% 20%, rgba(243,229,212,0.7) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Header */}
      <div className="relative z-10 mt-14">
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: "var(--font-cormorant),'Cormorant Garamond',Georgia,serif",
              fontSize: 40, fontWeight: 400, lineHeight: 1,
              color: "#C99E73", letterSpacing: "0.01em",
            }}
          >
            Rotes
          </span>
          {step > 0 && (
            <button
              type="button"
              onClick={() => { setError(""); setStep((s) => s - 1); }}
              className="text-[15px]"
              style={{ color: "#8A847D" }}
            >
              Назад
            </button>
          )}
        </div>
        <div className="mt-6">
          <ProgressBar step={step} total={3} />
        </div>
      </div>

      {/* Step 0 — Имя */}
      {step === 0 && (
        <div className="relative z-10 mt-12 flex flex-1 flex-col">
          <p className="text-[13px] font-medium uppercase tracking-widest" style={{ color: "#D9B38C" }}>
            Шаг 1 из 3
          </p>
          <h1
            className="mt-3"
            style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.1, color: "#2A2A2A" }}
          >
            Как вас зовут?
          </h1>
          <p className="mt-2 text-[17px]" style={{ color: "#8A847D" }}>
            Rotes будет обращаться к вам по имени каждый день.
          </p>

          <div className="mt-10 flex flex-col gap-3">
            <div
              className="flex items-center rounded-2xl px-5"
              style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(40px)", height: 62 }}
            >
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="flex-1 bg-transparent text-[20px] font-medium outline-none"
                style={{ color: "#2A2A2A" }}
              />
            </div>

            <div
              className="flex items-center rounded-2xl px-5"
              style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(40px)", height: 62 }}
            >
              <input
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ваш возраст (необязательно)"
                className="flex-1 bg-transparent text-[18px] outline-none"
                style={{ color: "#2A2A2A" }}
              />
            </div>
          </div>

          {/* Decorative glass arch */}
          <div className="pointer-events-none mt-auto flex justify-center py-8" aria-hidden>
            <div
              style={{
                width: 160, height: 200, opacity: 0.15,
                background: "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.9) 0%, rgba(217,179,140,0.3) 60%, transparent 100%)",
                borderRadius: "80px 80px 0 0",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}
            />
          </div>
        </div>
      )}

      {/* Step 1 — Чем занимаетесь */}
      {step === 1 && (
        <div className="relative z-10 mt-12 flex flex-1 flex-col">
          <p className="text-[13px] font-medium uppercase tracking-widest" style={{ color: "#D9B38C" }}>
            Шаг 2 из 3
          </p>
          <h1
            className="mt-3"
            style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.1, color: "#2A2A2A" }}
          >
            Чем вы занимаетесь?
          </h1>
          <p className="mt-2 text-[17px]" style={{ color: "#8A847D" }}>
            Можно выбрать несколько вариантов.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {OCCUPATION_OPTIONS.map((opt) => {
              const selected = occupation.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleOccupation(opt.value)}
                  className="flex items-center gap-4 rounded-2xl px-5 transition-all"
                  style={{
                    height: 68,
                    background: selected
                      ? "rgba(217,179,140,0.2)"
                      : "rgba(255,255,255,0.65)",
                    backdropFilter: "blur(40px)",
                    border: selected
                      ? "1.5px solid rgba(217,179,140,0.6)"
                      : "0.5px solid rgba(255,255,255,0.9)",
                    boxShadow: selected
                      ? "0 4px 16px rgba(217,179,140,0.15)"
                      : "none",
                  }}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span
                    className="text-[17px] font-medium"
                    style={{ color: selected ? "#C4956A" : "#2A2A2A" }}
                  >
                    {opt.label}
                  </span>
                  {selected && (
                    <div
                      className="ml-auto flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ background: "#D9B38C" }}
                    >
                      <span className="text-[13px] text-white font-bold">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2 — Что важнее */}
      {step === 2 && (
        <div className="relative z-10 mt-12 flex flex-1 flex-col">
          <p className="text-[13px] font-medium uppercase tracking-widest" style={{ color: "#D9B38C" }}>
            Шаг 3 из 3
          </p>
          <h1
            className="mt-3"
            style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.1, color: "#2A2A2A" }}
          >
            Что важнее всего?
          </h1>
          <p className="mt-2 text-[17px]" style={{ color: "#8A847D" }}>
            Rotes настроится под вашу главную цель.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {PRIORITY_OPTIONS.map((opt) => {
              const selected = mainPriority === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMainPriority(opt.value)}
                  className="flex items-start gap-4 rounded-2xl px-5 py-5 text-left transition-all"
                  style={{
                    background: selected
                      ? "rgba(217,179,140,0.2)"
                      : "rgba(255,255,255,0.65)",
                    backdropFilter: "blur(40px)",
                    border: selected
                      ? "1.5px solid rgba(217,179,140,0.6)"
                      : "0.5px solid rgba(255,255,255,0.9)",
                    boxShadow: selected
                      ? "0 4px 16px rgba(217,179,140,0.15)"
                      : "none",
                  }}
                >
                  <span className="mt-0.5 text-2xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <p
                      className="text-[17px] font-semibold"
                      style={{ color: selected ? "#C4956A" : "#2A2A2A" }}
                    >
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-[14px]" style={{ color: "#8A847D" }}>
                      {opt.sub}
                    </p>
                  </div>
                  {selected && (
                    <div
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{ background: "#D9B38C" }}
                    >
                      <span className="text-[13px] font-bold text-white">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="relative z-10 mt-3 text-center text-[14px]" style={{ color: "#C97B63" }}>
          {error}
        </p>
      )}

      {/* CTA button */}
      <div className="relative z-10 pb-10 pt-6">
        <button
          type="button"
          onClick={handleNext}
          disabled={updateProfile.isPending}
          className="flex w-full items-center justify-center gap-2 text-[18px] font-semibold text-white disabled:opacity-50"
          style={{
            height: 62,
            borderRadius: 31,
            background: canProceed()
              ? "#D9B38C"
              : "rgba(217,179,140,0.35)",
            boxShadow: canProceed()
              ? "0 6px 24px rgba(217,179,140,0.4)"
              : "none",
            transition: "all 0.2s",
          }}
        >
          {updateProfile.isPending
            ? "Сохранение..."
            : step < 2
              ? "Продолжить"
              : "Начать"}
          {!updateProfile.isPending && <ChevronRight size={20} color="white" />}
        </button>

        {step === 2 && (
          <p className="mt-4 text-center text-[13px]" style={{ color: "#AAA39A" }}>
            Всё это можно изменить позже в профиле
          </p>
        )}
      </div>
    </div>
  );
}
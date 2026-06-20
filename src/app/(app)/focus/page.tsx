"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import { SubPageHeader } from "@/components/ui/sub-page-header";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useTasks } from "@/hooks/use-tasks";

type Mode = "focus" | "break";

const DURATION_OPTIONS = [15, 25, 40, 60, 120];
const BREAK_SECONDS = 5 * 60;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function playBeep() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    // Web Audio API недоступен — пропускаем звук
  }
}

export default function FocusPage() {
  const { data: tasks } = useTasks();
  const activeTasks = (tasks ?? []).filter((t) => t.status === "active");

  const [focusDurationMinutes, setFocusDurationMinutes] = useState(25);
  const [mode, setMode] = useState<Mode>("focus");
  const [focusRemaining, setFocusRemaining] = useState(25 * 60);
  const [breakRemaining, setBreakRemaining] = useState(BREAK_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedTask = activeTasks.find((t) => t.id === selectedTaskId);
  const remaining = mode === "focus" ? focusRemaining : breakRemaining;
  const totalForMode = mode === "focus" ? focusDurationMinutes * 60 : BREAK_SECONDS;
  const progressPercent = Math.round((remaining / totalForMode) * 100);
  const canChangeDuration =
    mode === "focus" && !isRunning && focusRemaining === focusDurationMinutes * 60;

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      if (mode === "focus") {
        setFocusRemaining((prev) => Math.max(0, prev - 1));
      } else {
        setBreakRemaining((prev) => Math.max(0, prev - 1));
      }
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  useEffect(() => {
    if (!isRunning) return;

    if (mode === "focus" && focusRemaining === 0) {
      playBeep();
      setMode("break");
      setBreakRemaining(BREAK_SECONDS);
      setIsRunning(true);
    }

    if (mode === "break" && breakRemaining === 0) {
      setIsRunning(false);
      playBeep();
      setMode("focus");
      setFocusRemaining((prev) => (prev === 0 ? focusDurationMinutes * 60 : prev));
      setBreakRemaining(BREAK_SECONDS);
    }
  }, [focusRemaining, breakRemaining, isRunning, mode, focusDurationMinutes]);

  function handleSelectDuration(minutes: number) {
    if (!canChangeDuration) return;
    setFocusDurationMinutes(minutes);
    setFocusRemaining(minutes * 60);
  }

  function handleReset() {
    setIsRunning(false);
    if (mode === "focus") {
      setFocusRemaining(focusDurationMinutes * 60);
    } else {
      setBreakRemaining(BREAK_SECONDS);
    }
  }

  function handleTakeBreak() {
    setIsRunning(false);
    setMode("break");
    setBreakRemaining(BREAK_SECONDS);
    setIsRunning(true);
  }

  function handleEndBreakEarly() {
    setIsRunning(false);
    setMode("focus");
    setFocusRemaining((prev) => (prev === 0 ? focusDurationMinutes * 60 : prev));
    setBreakRemaining(BREAK_SECONDS);
  }

  return (
    <div className="p-6">
      <SubPageHeader title="Фокус режим" backHref="/" />

      <div className="mt-6 flex items-center justify-center gap-2 text-caption font-medium uppercase tracking-wide text-foreground/50">
        {mode === "focus" ? <Brain size={14} /> : <Coffee size={14} />}
        {mode === "focus" ? "Фокус" : "Перерыв"}
      </div>

      {mode === "focus" && (
        <div className="mt-4 flex justify-between gap-2">
          {DURATION_OPTIONS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              disabled={!canChangeDuration}
              onClick={() => handleSelectDuration(minutes)}
              className={
                minutes === focusDurationMinutes
                  ? "flex-1 rounded-xl bg-accent py-2 text-caption font-medium text-card"
                  : `flex-1 rounded-xl border border-foreground/15 py-2 text-caption text-foreground/60 ${
                      canChangeDuration ? "" : "opacity-40"
                    }`
              }
            >
              {minutes}
            </button>
          ))}
        </div>
      )}

      {mode === "focus" && (
        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          className="mt-4 w-full rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body text-foreground outline-none focus:border-accent"
        >
          <option value="">Без привязки к задаче</option>
          {activeTasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      )}

      <div className="mt-10 flex flex-col items-center">
        <ProgressRing value={progressPercent} size={240} strokeWidth={14} label={formatTime(remaining)} />
        {mode === "focus" && selectedTask && (
          <p className="mt-4 text-center text-body text-foreground/70">
            Работаешь над: {selectedTask.title}
          </p>
        )}
        {mode === "break" && (
          <p className="mt-4 text-center text-body text-foreground/70">Отдохни немного ☕</p>
        )}
      </div>

      <div className="mt-10 flex gap-3">
        <button
          type="button"
          onClick={handleReset}
          aria-label="Сбросить"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-foreground/15 text-foreground/70"
        >
          <RotateCcw size={20} />
        </button>
        <button
          type="button"
          onClick={() => setIsRunning((prev) => !prev)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent py-4 text-body font-medium text-card"
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          {isRunning ? "Пауза" : "Старт"}
        </button>
      </div>

      <div className="mt-3">
        {mode === "focus" ? (
          <button
            type="button"
            onClick={handleTakeBreak}
            className="w-full rounded-full border border-foreground/15 py-3 text-body text-foreground/70"
          >
            Взять перерыв
          </button>
        ) : (
          <button
            type="button"
            onClick={handleEndBreakEarly}
            className="w-full rounded-full border border-foreground/15 py-3 text-body text-foreground/70"
          >
            Вернуться к фокусу
          </button>
        )}
      </div>
    </div>
  );
}

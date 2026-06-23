"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, Bell, ChevronDown, ChevronUp,
  ChevronRight, AlertCircle, Clock, Zap, Plus, Target, Bot, Brain,
} from "lucide-react";
import { TaskDetailSheet } from "@/components/ui/task-detail-sheet";
import { useTasks, useToggleTaskStatus, type Task } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useProfile } from "@/hooks/use-profile";

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Доброе утро,";
  if (h >= 12 && h < 17) return "Добрый день,";
  if (h >= 17 && h < 22) return "Добрый вечер,";
  return "Доброй ночи,";
}

const CATEGORY_META: Record<string, { emoji: string; label: string; bg: string }> = {
  work:      { emoji: "💼", label: "Работа",   bg: "#FEF3E8" },
  personal:  { emoji: "❤️", label: "Личное",   bg: "#FEE8EC" },
  health:    { emoji: "🌿", label: "Здоровье", bg: "#E8F5E9" },
  education: { emoji: "📚", label: "Обучение", bg: "#EDE8FF" },
  finance:   { emoji: "💰", label: "Финансы",  bg: "#FEF3E8" },
  business:  { emoji: "🏢", label: "Бизнес",   bg: "#FFF0E8" },
};

function getCatMeta(cat: string | null) {
  return cat ? (CATEGORY_META[cat] ?? { emoji: "📋", label: cat, bg: "#F5F5F5" })
             : { emoji: "📋", label: "Другое", bg: "#F5F5F5" };
}

function isOverdue(t: Task) {
  if (!t.deadline || t.status === "completed") return false;
  return new Date(t.deadline) < new Date(new Date().setHours(0, 0, 0, 0));
}
function isDueToday(t: Task) {
  if (!t.deadline || t.status === "completed") return false;
  return new Date(t.deadline).toDateString() === new Date().toDateString();
}
function isDueTomorrow(t: Task) {
  if (!t.deadline || t.status === "completed") return false;
  const tm = new Date(); tm.setDate(tm.getDate() + 1);
  return new Date(t.deadline).toDateString() === tm.toDateString();
}
function isUrgent(t: Task) {
  return t.priority === "high" || isOverdue(t) || isDueToday(t);
}
function pluralTasks(n: number) {
  if (n === 1) return "1 задача";
  if (n >= 2 && n <= 4) return `${n} задачи`;
  return `${n} задач`;
}
function deadlineHint(t: Task) {
  if (isOverdue(t))    return { text: "просрочена", color: "#C97B63" };
  if (isDueToday(t))   return { text: "до сегодня", color: "#D9B38C" };
  if (isDueTomorrow(t))return { text: "до завтра",  color: "#8CAA73" };
  if (t.deadline) return {
    text: new Date(t.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
    color: "rgba(42,42,42,0.45)",
  };
  return null;
}

function GlassButton({ icon: Icon, badge }: { icon: React.ElementType; badge?: number }) {
  return (
    <button
      type="button"
      className="relative flex h-12 w-12 items-center justify-center rounded-full"
      style={{
        background: "rgba(255,255,255,0.75)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Icon size={19} color="#2A2A2A" />
      {badge ? (
        <span
          className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ background: "var(--accent)" }}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

type TaskRowProps = {
  task: Task; subtasks: Task[];
  onToggle: (id: string) => void; onOpen: (id: string) => void; indent?: boolean;
};

function TaskRow({ task, subtasks, onToggle, onOpen, indent = false }: TaskRowProps) {
  const hint = deadlineHint(task);
  const done = task.status === "completed";
  return (
    <>
      <div className={`flex items-center gap-3 py-3 ${indent ? "pl-5 border-l-2 border-foreground/10 ml-2" : ""}`}>
        <button type="button" onClick={() => onOpen(task.id)} className="flex-1 text-left">
          <p className={done ? "text-body text-foreground/40 line-through" : "text-body text-foreground"}>
            {task.title}
          </p>
          {hint && (
            <p className="text-caption mt-0.5" style={{ color: hint.color }}>⏰ {hint.text}</p>
          )}
        </button>
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          className="shrink-0 rounded-full px-3 py-1.5 text-caption font-medium"
          style={done ? { background: "#EEF5E8", color: "#8CAA73" } : { background: "#EEF5E8", color: "#5A8A55" }}
        >
          {done ? "Выполнено" : "Выполнить"}
        </button>
      </div>
      {subtasks.map((s) => (
        <TaskRow key={s.id} task={s} subtasks={[]} onToggle={onToggle} onOpen={onOpen} indent />
      ))}
    </>
  );
}

type CategoryCardProps = {
  label: string; emoji?: string; bgEmoji?: string;
  tasks: Task[]; allTasks: Task[];
  onToggle: (id: string) => void; onOpen: (id: string) => void;
  cardBg?: string; borderColor?: string;
  defaultOpen?: boolean; isUrgentCard?: boolean;
};

function CategoryCard({
  label, emoji, bgEmoji, tasks, allTasks, onToggle, onOpen,
  cardBg, borderColor, defaultOpen = false, isUrgentCard = false,
}: CategoryCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const parents = tasks.filter((t) => !t.parent_task_id);
  const completed = tasks.filter((t) => t.status === "completed").length;

  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{
        background: cardBg ?? "var(--card)",
        border: borderColor ? `1px solid ${borderColor}` : "none",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <button type="button" onClick={() => setOpen((p) => !p)} className="flex w-full items-center gap-3 px-5 py-4">
        {emoji && (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
            style={{ background: bgEmoji ?? "rgba(255,255,255,0.7)" }}
          >
            {emoji}
          </span>
        )}
        <div className="flex-1 text-left">
          <p className="text-body font-semibold" style={{ color: isUrgentCard ? "#C97B63" : "var(--foreground)" }}>
            {label}
          </p>
          {!isUrgentCard && (
            <p className="text-caption text-foreground/50">
              {pluralTasks(tasks.length)}{completed > 0 ? ` · ${completed} выполнено` : ""}
            </p>
          )}
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-caption font-bold"
          style={
            isUrgentCard
              ? { background: "rgba(255,255,255,0.8)", color: "#C97B63" }
              : { background: "rgba(0,0,0,0.06)", color: "var(--foreground)" }
          }
        >
          {tasks.length}
        </span>
        {open ? <ChevronUp size={16} className="shrink-0 text-foreground/40" />
               : <ChevronDown size={16} className="shrink-0 text-foreground/40" />}
      </button>

      {open && (
        <div className="divide-y divide-foreground/5 border-t border-foreground/5 px-5">
          {parents.map((t) => (
            <TaskRow
              key={t.id} task={t}
              subtasks={allTasks.filter((s) => s.parent_task_id === t.id)}
              onToggle={onToggle} onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: tasks, isLoading } = useTasks();
  const { data: projects } = useProjects();
  const { data: profile } = useProfile();
  const toggleTask = useToggleTaskStatus();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const allTasks = tasks ?? [];
  const active = allTasks.filter((t) => t.status !== "completed");
  const urgent = active.filter(isUrgent);
  const rest = active.filter((t) => !isUrgent(t) && !t.parent_task_id);

  const catMap: Record<string, Task[]> = {};
  for (const t of rest) {
    const k = t.category ?? "other";
    catMap[k] = catMap[k] ? [...catMap[k], t] : [t];
  }

  const overdue    = active.filter(isOverdue);
  const dueToday   = active.filter((t) => isDueToday(t) && !isOverdue(t));
  const dueTomorrow = active.filter(isDueTomorrow);
  const hasAttention = overdue.length > 0 || dueToday.length > 0 || dueTomorrow.length > 0 || active.length >= 7;
  const selectedTask = allTasks.find((t) => t.id === selectedTaskId) ?? null;

  function handleToggle(id: string) {
    const t = allTasks.find((x) => x.id === id);
    if (!t) return;
    toggleTask.mutate({ id, status: t.status === "completed" ? "active" : "completed" });
  }

  return (
    <div className="px-5 pt-8">
      <div className="flex items-center justify-between">
        <span
          className="font-serif text-[44px] leading-none"
          style={{ color: "#C99E73", fontFamily: "var(--font-cormorant), Georgia, serif", letterSpacing: "0.01em" }}
        >
          Rotes
        </span>
        <div className="flex gap-2">
          <GlassButton icon={Search} />
          <GlassButton icon={Bell} badge={overdue.length > 0 ? overdue.length : undefined} />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[20px] font-medium" style={{ color: "#B58D6A" }}>{getGreeting()}</p>
        <h1 className="text-[42px] font-bold leading-tight" style={{ color: "var(--foreground)" }}>
          {profile?.name ?? "..."}!
        </h1>
      </div>

      <h2 className="mt-7 text-h2 text-foreground">На сегодня</h2>
      <div className="mt-3 flex flex-col gap-3">
        {isLoading && <p className="text-caption text-foreground/50">Загрузка...</p>}
        {!isLoading && active.length === 0 && (
          <p className="text-caption text-foreground/50">Все задачи выполнены 🎉</p>
        )}
        {urgent.length > 0 && (
          <CategoryCard
            label="Срочные" emoji="🔥" bgEmoji="rgba(255,255,255,0.6)"
            tasks={urgent} allTasks={allTasks}
            onToggle={handleToggle} onOpen={setSelectedTaskId}
            cardBg="#FFF2EE" borderColor="#F0D4CC"
            defaultOpen isUrgentCard
          />
        )}
        {Object.entries(catMap).map(([cat, catTasks]) => {
          const meta = getCatMeta(cat);
          return (
            <CategoryCard
              key={cat} label={meta.label} emoji={meta.emoji} bgEmoji={meta.bg}
              tasks={catTasks} allTasks={allTasks}
              onToggle={handleToggle} onOpen={setSelectedTaskId}
            />
          );
        })}
      </div>

      {hasAttention && (
        <>
          <h2 className="mt-7 text-h2 text-foreground">Стоит обратить внимание!</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {overdue.length > 0 && (
              <button
                type="button"
                onClick={() => overdue[0] && setSelectedTaskId(overdue[0].id)}
                className="flex flex-col gap-2 rounded-2xl p-3 text-left"
                style={{ background: "#FFF0EE", minHeight: 110 }}
              >
                <AlertCircle size={18} color="#C97B63" opacity={0.7} />
                <p className="text-caption font-medium leading-tight text-foreground/80">
                  {overdue.length} просроченная задача
                </p>
                <ChevronRight size={13} color="rgba(42,42,42,0.4)" className="mt-auto" />
              </button>
            )}
            {(dueToday.length > 0 || dueTomorrow.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  const t = dueToday[0] ?? dueTomorrow[0];
                  if (t) setSelectedTaskId(t.id);
                }}
                className="flex flex-col gap-2 rounded-2xl p-3 text-left"
                style={{ background: "#FEF6EE", minHeight: 110 }}
              >
                <Clock size={18} color="#D9B38C" opacity={0.8} />
                <p className="text-caption font-medium leading-tight text-foreground/80">
                  {dueToday.length + dueTomorrow.length} с дедлайном сегодня
                </p>
                <ChevronRight size={13} color="rgba(42,42,42,0.4)" className="mt-auto" />
              </button>
            )}
            {active.length >= 7 && (
              <div className="flex flex-col gap-2 rounded-2xl p-3" style={{ background: "#EEF6EE", minHeight: 110 }}>
                <Zap size={18} color="#8CAA73" opacity={0.8} />
                <p className="text-caption font-medium leading-tight text-foreground/80">
                  Снизьте нагрузку — много активных задач
                </p>
                <ChevronRight size={13} color="rgba(42,42,42,0.4)" className="mt-auto" />
              </div>
            )}
          </div>
        </>
      )}

      <h2 className="mt-7 text-h2 text-foreground">Быстрые действия</h2>
      <div className="mt-3 flex flex-col gap-2">
        <Link
          href="/assistant?mode=task"
          className="flex items-center justify-between rounded-3xl p-5"
          style={{ background: "linear-gradient(135deg, #F8E8D7, #F3DCC1)" }}
        >
          <div>
            <p className="text-h2 font-bold text-foreground">Создать задачу с ИИ</p>
            <p className="mt-1 text-caption text-foreground/60">
              Опишите задачу в пару слов, а я всё организую
            </p>
          </div>
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "rgba(255,255,255,0.5)" }}
          >
            <Bot size={28} color="#B58D6A" />
          </div>
        </Link>

        <div className="flex gap-2">
          <Link
            href="/tasks/new"
            className="flex flex-1 items-center gap-2 rounded-2xl p-4"
            style={{ background: "var(--card)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "#FEF3E8" }}>
              <Plus size={18} color="#D9B38C" />
            </div>
            <span className="text-body text-foreground">Добавить задачу</span>
          </Link>
          <Link
            href="/goals/new"
            className="flex flex-1 items-center gap-2 rounded-2xl p-4"
            style={{ background: "var(--card)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "#EEF5E8" }}>
              <Target size={18} color="#8CAA73" />
            </div>
            <span className="text-body text-foreground">Добавить цель</span>
          </Link>
        </div>

        <Link
          href="/assistant"
          className="flex items-center justify-between rounded-2xl p-4"
          style={{ background: "#F3EDFF", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <div>
            <p className="text-body font-medium text-foreground">Помощник</p>
            <p className="text-caption text-foreground/50">Ваш личный ассистент Rotes</p>
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "rgba(199,187,232,0.4)" }}
          >
            <Bot size={20} color="#9B8EC4" />
          </div>
        </Link>

        <Link
          href="/assistant?mode=analyze"
          className="flex items-center justify-between rounded-2xl p-4"
          style={{ background: "var(--card)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <div>
            <p className="text-body font-medium text-foreground">Анализировать задачи</p>
            <p className="text-caption text-foreground/50">ИИ расставит приоритеты и найдёт узкие места</p>
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "#EBF5EB" }}
          >
            <Brain size={20} color="#8CAA73" />
          </div>
        </Link>
      </div>

      <TaskDetailSheet
        task={selectedTask}
        projects={projects ?? []}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}
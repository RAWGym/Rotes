import type { Task } from "@/hooks/use-tasks";
import type { Goal } from "@/hooks/use-goals";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function getLast7Days(): Date[] {
  const today = startOfDay(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });
}

export function computeWeeklyActivity(tasks: Task[]) {
  return getLast7Days().map((date) => ({
    label: date.toLocaleDateString("ru-RU", { weekday: "short" }),
    count: tasks.filter(
      (t) => t.status === "completed" && t.updated_at && isSameDay(new Date(t.updated_at), date)
    ).length,
  }));
}

export function computeStreak(tasks: Task[]): number {
  const completedDates = new Set(
    tasks
      .filter((t) => t.status === "completed" && t.updated_at)
      .map((t) => startOfDay(new Date(t.updated_at as string)).getTime())
  );

  let streak = 0;
  const cursor = startOfDay(new Date());

  while (completedDates.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function pluralDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "дня";
  return "дней";
}

export function computeProductivity(tasks: Task[]) {
  const sevenDaysAgo = startOfDay(new Date());
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const backlog = tasks.filter((t) => t.status !== "archived");
  const completedThisWeek = backlog.filter(
    (t) => t.status === "completed" && t.updated_at && new Date(t.updated_at) >= sevenDaysAgo
  );

  const percent =
    backlog.length > 0 ? Math.min(100, Math.round((completedThisWeek.length / backlog.length) * 100)) : 0;

  return { percent, completedThisWeek: completedThisWeek.length };
}

export function computeGoalStats(goals: Goal[]) {
  let inProgress = 0;
  let achieved = 0;

  for (const goal of goals) {
    if (goal.target_value !== null && (goal.current_progress ?? 0) >= goal.target_value) {
      achieved += 1;
    } else {
      inProgress += 1;
    }
  }

  return { inProgress, achieved };
}

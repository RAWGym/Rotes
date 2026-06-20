"use client";

import { ListChecks, Flame, Target, Award } from "lucide-react";
import { ProgressRing } from "@/components/ui/progress-ring";
import { WeeklyChart } from "@/components/ui/weekly-chart";
import { StatCard } from "@/components/ui/stat-card";
import { useTasks } from "@/hooks/use-tasks";
import { useGoals } from "@/hooks/use-goals";
import {
  computeWeeklyActivity,
  computeStreak,
  computeProductivity,
  computeGoalStats,
  pluralDays,
} from "@/lib/stats";

export default function StatsPage() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: goals, isLoading: goalsLoading } = useGoals();

  const isLoading = tasksLoading || goalsLoading;
  const weeklyActivity = computeWeeklyActivity(tasks ?? []);
  const streak = computeStreak(tasks ?? []);
  const productivity = computeProductivity(tasks ?? []);
  const goalStats = computeGoalStats(goals ?? []);

  return (
    <div className="p-6">
      <h1 className="text-h1">Статистика</h1>

      <div className="mt-6 flex items-center justify-between rounded-2xl bg-card p-6 shadow-sm shadow-foreground/5">
        <div>
          <p className="text-caption text-foreground/60">Продуктивность</p>
          <p className="text-h1">{isLoading ? "—" : `${productivity.percent}%`}</p>
          <p className="text-caption text-foreground/60">За последние 7 дней</p>
        </div>
        <ProgressRing value={isLoading ? 0 : productivity.percent} />
      </div>

      <h2 className="mt-8 text-h2">Активность за неделю</h2>
      <div className="mt-3">
        <WeeklyChart data={weeklyActivity} />
      </div>

      <h2 className="mt-8 text-h2">Показатели</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <StatCard
          icon={ListChecks}
          value={isLoading ? "—" : String(productivity.completedThisWeek)}
          label="Задач выполнено за неделю"
        />
        <StatCard
          icon={Flame}
          value={isLoading ? "—" : `${streak} ${pluralDays(streak)}`}
          label="Серия подряд"
          bgColorClass="bg-priority-high/15"
          iconColorClass="text-priority-high"
        />
        <StatCard
          icon={Target}
          value={isLoading ? "—" : String(goalStats.inProgress)}
          label="Целей в процессе"
          bgColorClass="bg-sage/25"
          iconColorClass="text-sage"
        />
        <StatCard
          icon={Award}
          value={isLoading ? "—" : String(goalStats.achieved)}
          label="Целей достигнуто"
          bgColorClass="bg-lavender/25"
          iconColorClass="text-lavender"
        />
      </div>
    </div>
  );
}

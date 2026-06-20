import { Wallet, HeartPulse, Rocket, BookOpen, Heart, type LucideIcon } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";

type CategoryConfig = {
  label: string;
  icon: LucideIcon;
  bgClass: string;
  iconClass: string;
  barClass: string;
};

const categoryConfig: Record<string, CategoryConfig> = {
  finance: { label: "Финансы", icon: Wallet, bgClass: "bg-accent/20", iconClass: "text-accent", barClass: "bg-accent" },
  health: { label: "Здоровье", icon: HeartPulse, bgClass: "bg-sage/30", iconClass: "text-sage", barClass: "bg-sage" },
  career: { label: "Карьера", icon: Rocket, bgClass: "bg-warm-beige/30", iconClass: "text-warm-beige", barClass: "bg-warm-beige" },
  education: { label: "Образование", icon: BookOpen, bgClass: "bg-lavender/25", iconClass: "text-lavender", barClass: "bg-lavender" },
  personal: { label: "Личное", icon: Heart, bgClass: "bg-rose/25", iconClass: "text-rose", barClass: "bg-rose" },
};

const fallbackConfig: CategoryConfig = {
  label: "Другое",
  icon: Heart,
  bgClass: "bg-foreground/10",
  iconClass: "text-foreground/50",
  barClass: "bg-foreground/40",
};

function formatDeadline(deadline: string | null) {
  if (!deadline) return null;
  return new Date(deadline).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type GoalCardProps = {
  title: string;
  category: string | null;
  currentProgress: number | null;
  targetValue: number | null;
  deadline: string | null;
};

export function GoalCard({ title, category, currentProgress, targetValue, deadline }: GoalCardProps) {
  const config = (category && categoryConfig[category]) || fallbackConfig;
  const Icon = config.icon;
  const current = currentProgress ?? 0;
  const target = targetValue ?? 0;
  const percent = target > 0 ? Math.round((current / target) * 100) : 0;
  const formattedDeadline = formatDeadline(deadline);
  const suffix = category === "finance" ? " ₸" : "";

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bgClass}`}>
          <Icon size={18} className={config.iconClass} strokeWidth={2} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-body text-foreground">{title}</p>
            <span className="shrink-0 text-caption font-medium text-foreground/70">{percent}%</span>
          </div>
          {targetValue !== null && (
            <p className="mt-0.5 text-caption text-foreground/50">
              {current.toLocaleString("ru-RU")} из {target.toLocaleString("ru-RU")}
              {suffix}
            </p>
          )}
          <div className="mt-2">
            <ProgressBar value={percent} colorClassName={config.barClass} />
          </div>
          {formattedDeadline && (
            <p className="mt-2 text-caption text-foreground/40">Дедлайн: {formattedDeadline}</p>
          )}
        </div>
      </div>
    </div>
  );
}

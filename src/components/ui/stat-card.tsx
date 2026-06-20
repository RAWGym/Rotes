import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  value: string;
  label: string;
  iconColorClass?: string;
  bgColorClass?: string;
};

export function StatCard({
  icon: Icon,
  value,
  label,
  iconColorClass = "text-accent",
  bgColorClass = "bg-accent/15",
}: StatCardProps) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5">
      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${bgColorClass}`}>
        <Icon size={16} className={iconColorClass} />
      </span>
      <p className="mt-3 text-h2">{value}</p>
      <p className="text-caption text-foreground/50">{label}</p>
    </div>
  );
}

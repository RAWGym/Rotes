import type { LucideIcon } from "lucide-react";

type QuickActionButtonProps = {
  icon: LucideIcon;
  label: string;
  iconColorClass: string;
  bgColorClass: string;
  onClick?: () => void;
};

export function QuickActionButton({
  icon: Icon,
  label,
  iconColorClass,
  bgColorClass,
  onClick,
}: QuickActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-2 rounded-2xl bg-card px-2 py-3 text-center"
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-full ${bgColorClass}`}>
        <Icon size={20} className={iconColorClass} strokeWidth={2} />
      </span>
      <span className="text-caption leading-tight text-foreground/80">{label}</span>
    </button>
  );
}

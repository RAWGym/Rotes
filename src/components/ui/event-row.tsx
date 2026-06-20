import { ChevronRight } from "lucide-react";

const categoryDotClass: Record<string, string> = {
  work: "bg-lavender",
  personal: "bg-sage",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

const categoryLabel: Record<string, string> = {
  work: "Работа",
  personal: "Личное",
};

type EventRowProps = {
  title: string;
  category: string | null;
  startTime: string;
  endTime: string;
};

export function EventRow({ title, category, startTime, endTime }: EventRowProps) {
  const dotClass = (category && categoryDotClass[category]) || "bg-accent";
  const label = (category && categoryLabel[category]) || "Без категории";

  return (
    <div className="flex items-start gap-3">
      <span className="w-12 shrink-0 pt-4 text-caption text-foreground/50">{formatTime(startTime)}</span>
      <div className="flex flex-1 items-center gap-3 rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5">
        <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
        <div className="flex-1">
          <p className="text-body text-foreground">{title}</p>
          <p className="mt-0.5 text-caption text-foreground/50">
            {label} · {formatTime(startTime)} – {formatTime(endTime)}
          </p>
        </div>
        <ChevronRight size={18} className="shrink-0 text-foreground/30" />
      </div>
    </div>
  );
}

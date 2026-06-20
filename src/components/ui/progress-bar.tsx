type ProgressBarProps = {
  value: number;
  colorClassName?: string;
};

export function ProgressBar({ value, colorClassName = "bg-accent" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
      <div
        className={`h-full rounded-full ${colorClassName}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

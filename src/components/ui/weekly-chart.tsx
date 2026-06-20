type WeeklyChartProps = {
  data: { label: string; count: number }[];
};

export function WeeklyChart({ data }: WeeklyChartProps) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex items-end justify-between gap-2 rounded-2xl bg-card p-5 shadow-sm shadow-foreground/5">
      {data.map(({ label, count }, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-24 w-full items-end justify-center">
            <div className="w-2.5 rounded-full bg-accent/70" style={{ height: `${(count / max) * 100}%` }} />
          </div>
          <span className="text-caption capitalize text-foreground/50">{label}</span>
        </div>
      ))}
    </div>
  );
}

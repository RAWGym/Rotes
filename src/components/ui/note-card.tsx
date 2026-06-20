type NoteCardProps = {
  title: string | null;
  content: string | null;
  updatedAt: string | null;
};

function formatRelative(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function NoteCard({ title, content, updatedAt }: NoteCardProps) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-body text-foreground">{title || "Без названия"}</p>
        <span className="shrink-0 text-caption text-foreground/40">{formatRelative(updatedAt)}</span>
      </div>
      {content && <p className="mt-1 line-clamp-2 text-caption text-foreground/60">{content}</p>}
    </div>
  );
}

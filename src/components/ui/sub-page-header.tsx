import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type SubPageHeaderProps = {
  title: string;
  backHref?: string;
  onBack?: () => void;
};

export function SubPageHeader({ title, backHref = "/profile", onBack }: SubPageHeaderProps) {
  const btnClass =
    "flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm shadow-foreground/5";

  return (
    <div className="flex items-center gap-4">
      {onBack ? (
        <button type="button" aria-label="Назад" onClick={onBack} className={btnClass}>
          <ArrowLeft size={18} className="text-foreground/70" />
        </button>
      ) : (
        <Link href={backHref} aria-label="Назад" className={btnClass}>
          <ArrowLeft size={18} className="text-foreground/70" />
        </Link>
      )}
      <h1 className="text-display-md">{title}</h1>
    </div>
  );
}
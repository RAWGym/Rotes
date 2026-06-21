import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type SubPageHeaderProps = {
  title: string;
  backHref?: string;
  onBack?: () => void;
};

export function SubPageHeader({ title, backHref = "/profile", onBack }: SubPageHeaderProps) {
  const buttonClass =
    "flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm shadow-foreground/5";

  return (
    <div className="flex items-center gap-3">
      {onBack ? (
        <button type="button" aria-label="Назад" onClick={onBack} className={buttonClass}>
          <ArrowLeft size={18} className="text-foreground/70" />
        </button>
      ) : (
        <Link href={backHref} aria-label="Назад" className={buttonClass}>
          <ArrowLeft size={18} className="text-foreground/70" />
        </Link>
      )}
      <h1 className="text-h1">{title}</h1>
    </div>
  );
}

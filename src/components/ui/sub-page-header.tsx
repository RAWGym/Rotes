import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type SubPageHeaderProps = {
  title: string;
  backHref?: string;
};

export function SubPageHeader({ title, backHref = "/profile" }: SubPageHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href={backHref}
        aria-label="Назад"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm shadow-foreground/5"
      >
        <ArrowLeft size={18} className="text-foreground/70" />
      </Link>
      <h1 className="text-h1">{title}</h1>
    </div>
  );
}

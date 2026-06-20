import { SubPageHeader } from "@/components/ui/sub-page-header";

export default function AboutPage() {
  return (
    <div className="p-6">
      <SubPageHeader title="О приложении" />

      <div className="mt-6 rounded-2xl bg-card p-6 text-center shadow-sm shadow-foreground/5">
        <p className="text-h1">Rotes</p>
        <p className="mt-1 text-caption uppercase tracking-wide text-foreground/50">
          Digital Life Planner
        </p>
        <p className="mt-4 text-body text-foreground/70">
          Цифровой планировщик для осознанной и продуктивной жизни. Помогает фокусироваться на
          важном, балансировать работу и личное, достигать целей и развиваться каждый день.
        </p>
        <p className="mt-4 text-caption text-foreground/40">Версия MVP 0.1</p>
      </div>
    </div>
  );
}

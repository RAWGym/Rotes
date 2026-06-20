import { LogOut, Settings, Bell, Palette, Info } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/supabase/actions";

const menuItems = [
  { icon: Settings, label: "Настройки", href: "/profile/settings" },
  { icon: Bell, label: "Уведомления", href: "/profile/notifications" },
  { icon: Palette, label: "Тема оформления", href: "/profile/theme" },
  { icon: Info, label: "О приложении", href: "/profile/about" },
];

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "";
  const initial = email.charAt(0).toUpperCase() || "?";

  return (
    <div className="p-6">
      <h1 className="text-h1">Профиль</h1>

      <div className="mt-6 flex items-center gap-4 rounded-2xl bg-card p-5 shadow-sm shadow-foreground/5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/20 text-h2 text-accent">
          {initial}
        </span>
        <div>
          <p className="text-body text-foreground">{email}</p>
          <p className="text-caption text-foreground/50">Личный аккаунт Rotes</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {menuItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm shadow-foreground/5"
          >
            <Icon size={18} className="text-foreground/60" />
            <span className="text-body text-foreground">{label}</span>
          </Link>
        ))}
      </div>

      <form action={signOut} className="mt-6">
        <button
          type="submit"
          className="w-full rounded-xl border border-priority-high/30 px-4 py-3 text-body text-priority-high"
        >
          <span className="inline-flex items-center gap-2">
            <LogOut size={16} />
            Выйти
          </span>
        </button>
      </form>
    </div>
  );
}

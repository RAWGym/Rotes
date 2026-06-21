"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Target, BarChart3, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/calendar", label: "Календарь", icon: Calendar },
  { href: "/goals", label: "Цели", icon: Target },
  { href: "/stats", label: "Статистика", icon: BarChart3 },
  { href: "/profile", label: "Профиль", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-4 z-30 mx-auto max-w-xs"
      style={{ bottom: "max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))" }}
    >
      <div className="flex items-center justify-around rounded-full border border-foreground/5 bg-card/80 px-3 py-2.5 shadow-lg shadow-foreground/15 backdrop-blur-md">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={
                isActive
                  ? "flex h-10 w-10 items-center justify-center rounded-full bg-accent text-card"
                  : "flex h-10 w-10 items-center justify-center rounded-full text-foreground/50"
              }
            >
              <Icon size={20} strokeWidth={2} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

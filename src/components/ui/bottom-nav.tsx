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
    <nav className="fixed inset-x-0 bottom-0 border-t border-foreground/10 bg-card">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-3">
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

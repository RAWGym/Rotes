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

const HIDDEN_ON = ["/assistant"];

export function BottomNav() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav
      className="fixed inset-x-4 z-30 mx-auto max-w-sm"
      style={{ bottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 0.75rem))" }}
    >
      <div
        className="flex items-center justify-around rounded-full border px-2 py-2"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderColor: "rgba(255,255,255,0.8)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.05), 0 1px 0 rgba(255,255,255,0.6) inset",
        }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} aria-label={label} className="flex flex-col items-center gap-0.5 py-1">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={isActive ? { background: "var(--accent)" } : {}}
              >
                <Icon size={20} strokeWidth={2} color={isActive ? "#FCFAF7" : "rgba(42,42,42,0.45)"} />
              </span>
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: isActive ? "var(--accent)" : "rgba(42,42,42,0.45)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
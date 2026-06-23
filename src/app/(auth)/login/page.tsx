"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signIn, signUp } from "@/lib/supabase/actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="flex min-h-screen flex-col px-6" style={{ paddingTop: "env(safe-area-inset-top)" }}>

      {/* Glass arch — decorative */}
      <div
        className="pointer-events-none absolute right-4 top-8"
        style={{ width: 200, height: 260, opacity: 0.18 }}
        aria-hidden
      >
        <svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="80" width="160" height="160" rx="80" fill="url(#archGrad)" />
          <rect x="38" y="98" width="124" height="124" rx="62"
            fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
          <rect x="56" y="116" width="88" height="88" rx="44"
            fill="rgba(255,255,255,0.25)" />
          <ellipse cx="100" cy="100" rx="70" ry="30"
            fill="rgba(255,255,255,0.15)" />
          <defs>
            <radialGradient id="archGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="40%" stopColor="rgba(217,179,140,0.4)" />
              <stop offset="100%" stopColor="rgba(217,179,140,0.05)" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Logo + headline */}
      <div className="mt-16 flex-1">
        <div>
          <span
            style={{
              fontFamily: "var(--font-cormorant),'Cormorant Garamond',Georgia,serif",
              fontSize: 72, fontWeight: 400, lineHeight: 1,
              color: "#C99E73", letterSpacing: "0.01em", display: "block",
            }}
          >
            Rotes
          </span>
          <p className="mt-1 text-[16px]" style={{ color: "#8A847D", fontFamily: "-apple-system,sans-serif" }}>
            Digital Life Planner
          </p>
        </div>

        <h1
          className="mt-10"
          style={{
            fontSize: 54, fontWeight: 700, lineHeight: 0.95,
            color: "#2A2A2A", fontFamily: "-apple-system,'SF Pro Display',sans-serif",
          }}
        >
          Управляйте жизнью, а не задачами.
        </h1>
        <p className="mt-4 text-[18px] leading-relaxed" style={{ color: "#8A847D" }}>
          Планируйте работу, цели и личную жизнь в одном красивом пространстве.
        </p>
      </div>

      {/* Auth card */}
      <div className="mt-12 pb-10">
        <div
          className="rounded-3xl p-5"
          style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(60px)",
            WebkitBackdropFilter: "blur(60px)",
            border: "0.5px solid rgba(255,255,255,0.7)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.04)",
          }}
        >
          {/* Segment */}
          <div
            className="flex rounded-2xl p-1"
            style={{ background: "rgba(255,255,255,0.45)" }}
          >
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="flex-1 rounded-xl py-3 text-[16px] font-medium transition-all"
                style={
                  mode === m
                    ? { background: "#D9B38C", color: "white", boxShadow: "0 2px 8px rgba(217,179,140,0.3)" }
                    : { color: "#8A847D" }
                }
              >
                {m === "login" ? "Вход" : "Регистрация"}
              </button>
            ))}
          </div>

          <form action={mode === "login" ? signIn : signUp} className="mt-5 flex flex-col gap-3">
            {/* Email */}
            <div
              className="flex items-center gap-3 rounded-2xl px-4"
              style={{ background: "rgba(255,255,255,0.6)", height: 58 }}
            >
              <Mail size={18} color="#AAA39A" />
              <input
                name="email"
                type="email"
                required
                placeholder="Введите email"
                className="flex-1 bg-transparent text-[16px] outline-none"
                style={{ color: "#2A2A2A" }}
              />
            </div>

            {/* Password */}
            <div
              className="flex items-center gap-3 rounded-2xl px-4"
              style={{ background: "rgba(255,255,255,0.6)", height: 58 }}
            >
              <Lock size={18} color="#AAA39A" />
              <input
                name="password"
                type={showPass ? "text" : "password"}
                required
                minLength={6}
                placeholder="Введите пароль"
                className="flex-1 bg-transparent text-[16px] outline-none"
                style={{ color: "#2A2A2A" }}
              />
              <button type="button" onClick={() => setShowPass((p) => !p)}>
                {showPass
                  ? <EyeOff size={18} color="#AAA39A" />
                  : <Eye size={18} color="#AAA39A" />
                }
              </button>
            </div>

            {mode === "login" && (
              <button type="button" className="self-start text-[14px]" style={{ color: "#8A847D" }}>
                Забыли пароль?
              </button>
            )}

            {/* CTA */}
            <button
              type="submit"
              className="mt-1 w-full text-[18px] font-semibold text-white"
              style={{
                height: 58,
                borderRadius: 29,
                background: "#D9B38C",
                boxShadow: "0 4px 20px rgba(217,179,140,0.4)",
              }}
            >
              {mode === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "rgba(42,42,42,0.1)" }} />
            <span className="text-[13px]" style={{ color: "#AAA39A" }}>или</span>
            <div className="h-px flex-1" style={{ background: "rgba(42,42,42,0.1)" }} />
          </div>

          {/* Social */}
          <div className="flex flex-col gap-2.5">
            {[
              { label: "Продолжить через Apple",  icon: "🍎" },
              { label: "Продолжить через Google", icon: "🌐" },
            ].map((s) => (
              <button
                key={s.label}
                type="button"
                className="flex w-full items-center justify-center gap-3 text-[16px] font-medium"
                style={{
                  height: 56,
                  borderRadius: 28,
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  color: "#2A2A2A",
                }}
              >
                <span className="text-xl">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom trust */}
        <div className="mt-6 flex justify-center gap-6">
          {[
            { icon: "☁️", text: "Синхронизация между устройствами" },
            { icon: "🔒", text: "Конфиденциальность по умолчанию" },
            { icon: "📱", text: "Работает даже без интернета" },
          ].map((f) => (
            <div key={f.text} className="flex max-w-[90px] flex-col items-center gap-1.5 text-center">
              <span className="text-[18px]">{f.icon}</span>
              <p className="text-[11px] leading-tight" style={{ color: "#8A847D" }}>{f.text}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-[12px]" style={{ color: "#AAA39A" }}>
          Продолжая, вы соглашаетесь{" "}
          <span style={{ color: "#D9B38C" }}>с условиями использования.</span>
        </p>
      </div>
    </div>
  );
}
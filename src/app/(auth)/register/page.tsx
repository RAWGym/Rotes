import { signUp } from "@/lib/supabase/actions";
import Link from "next/link";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="text-h1">Регистрация</h1>

      {error && <p className="mt-3 text-caption text-priority-high">{error}</p>}

      <form action={signUp} className="mt-6 flex flex-col gap-4">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Пароль (минимум 6 символов)"
          className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-3 text-body font-medium text-card"
        >
          Создать аккаунт
        </button>
      </form>

      <p className="mt-4 text-caption text-foreground/60">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-accent">
          Войти
        </Link>
      </p>
    </div>
  );
}

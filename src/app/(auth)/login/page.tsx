import { signIn } from "@/lib/supabase/actions";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const { error, registered } = await searchParams;

  return (
    <div>
      <h1 className="text-h1">Вход</h1>

      {registered && (
        <p className="mt-3 text-caption text-priority-low">
          Регистрация прошла успешно. Проверьте почту и подтвердите аккаунт.
        </p>
      )}
      {error && <p className="mt-3 text-caption text-priority-high">{error}</p>}

      <form action={signIn} className="mt-6 flex flex-col gap-4">
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
          placeholder="Пароль"
          className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-3 text-body font-medium text-card"
        >
          Войти
        </button>
      </form>

      <p className="mt-4 text-caption text-foreground/60">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-accent">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}

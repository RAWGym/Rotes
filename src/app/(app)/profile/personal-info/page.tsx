"use client";

import { useEffect, useState } from "react";
import { SubPageHeader } from "@/components/ui/sub-page-header";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";

export default function PersonalInfoPage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setAge(profile.age ? String(profile.age) : "");
    }
  }, [profile]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    updateProfile.mutate(
      { name: name.trim(), age: age ? Number(age) : null },
      { onSuccess: () => setSaved(true) }
    );
  }

  return (
    <div className="p-6">
      <SubPageHeader title="Личная информация" />

      {isLoading ? (
        <p className="mt-6 text-caption text-foreground/50">Загрузка...</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-caption font-medium text-foreground/70">Имя</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-caption font-medium text-foreground/70">Возраст</label>
            <input
              type="number"
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-2 w-full rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-caption font-medium text-foreground/70">Почта</label>
            <div className="mt-2 w-full rounded-xl border border-foreground/15 bg-foreground/5 px-4 py-3 text-body text-foreground/50">
              {profile?.email}
            </div>
            <p className="mt-1 text-caption text-foreground/40">
              Изменение почты пока не поддерживается
            </p>
          </div>

          {saved && <p className="text-caption text-priority-low">Сохранено</p>}

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="mt-2 rounded-xl bg-accent px-4 py-3 text-body font-medium text-card disabled:opacity-50"
          >
            {updateProfile.isPending ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      )}
    </div>
  );
}

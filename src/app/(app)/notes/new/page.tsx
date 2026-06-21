"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubPageHeader } from "@/components/ui/sub-page-header";
import { useCreateNote } from "@/hooks/use-notes";

export default function NewNotePage() {
  const router = useRouter();
  const createNote = useCreateNote();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    createNote.mutate(
      { title: title.trim(), content: content.trim() },
      { onSuccess: () => router.back() }
    );
  }

  return (
    <div className="p-6">
      <SubPageHeader title="Новая заметка" onBack={() => router.back()} />

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Заголовок"
          className="rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Текст заметки..."
          rows={8}
          className="resize-none rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
        />

        <button
          type="submit"
          disabled={createNote.isPending}
          className="mt-2 rounded-xl bg-accent px-4 py-3 text-body font-medium text-card disabled:opacity-50"
        >
          {createNote.isPending ? "Сохранение..." : "Создать"}
        </button>
      </form>
    </div>
  );
}

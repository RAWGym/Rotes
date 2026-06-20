"use client";

import { useEffect, useRef, useState } from "react";
import { useCreateNote } from "@/hooks/use-notes";

type NoteFormModalProps = {
  open: boolean;
  onClose: () => void;
};

export function NoteFormModal({ open, onClose }: NoteFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const createNote = useCreateNote();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    createNote.mutate(
      { title: title.trim(), content: content.trim() },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          onClose();
        },
      }
    );
  }

  return (
    <dialog ref={dialogRef} onClose={onClose} className="w-full max-w-sm rounded-2xl bg-card p-6">
      <h2 className="text-h2">Новая заметка</h2>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Заголовок"
          className="rounded-xl border border-foreground/15 bg-background px-4 py-3 text-body outline-none focus:border-accent"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Текст заметки..."
          rows={5}
          className="resize-none rounded-xl border border-foreground/15 bg-background px-4 py-3 text-body outline-none focus:border-accent"
        />

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-foreground/15 px-4 py-3 text-body text-foreground"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={createNote.isPending}
            className="flex-1 rounded-xl bg-accent px-4 py-3 text-body font-medium text-card disabled:opacity-50"
          >
            {createNote.isPending ? "Сохранение..." : "Создать"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

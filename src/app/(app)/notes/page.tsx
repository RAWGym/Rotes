"use client";

import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { NoteCard } from "@/components/ui/note-card";
import { useNotes } from "@/hooks/use-notes";

export default function NotesPage() {
  const { data: notes, isLoading } = useNotes();

  return (
    <div className="p-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Назад"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm shadow-foreground/5"
        >
          <ArrowLeft size={18} className="text-foreground/70" />
        </Link>
        <h1 className="text-h1">Заметки</h1>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading && <p className="text-caption text-foreground/50">Загрузка...</p>}
        {!isLoading && notes?.length === 0 && (
          <p className="text-caption text-foreground/50">Пока нет ни одной заметки.</p>
        )}
        {notes?.map((note) => (
          <NoteCard key={note.id} title={note.title} content={note.content} updatedAt={note.updated_at} />
        ))}
      </div>

      <Link
        href="/notes/new"
        aria-label="Новая заметка"
        className="fixed bottom-24 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-card shadow-lg shadow-accent/30"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useCreateProject } from "@/hooks/use-projects";

const colorPresets = ["#D9B38C", "#CBD7C2", "#DCC7B6", "#C7BBE8", "#E3B5AC", "#C97B63"];

type ProjectFormModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (projectId: string) => void;
};

export function ProjectFormModal({ open, onClose, onCreated }: ProjectFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const createProject = useCreateProject();
  const [name, setName] = useState("");
  const [color, setColor] = useState(colorPresets[0]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    createProject.mutate(
      { name: name.trim(), color },
      {
        onSuccess: (project) => {
          setName("");
          setColor(colorPresets[0]);
          onCreated?.(project.id);
          onClose();
        },
      }
    );
  }

  return (
    <dialog ref={dialogRef} onClose={onClose} className="w-full max-w-sm rounded-2xl bg-card p-6">
      <h2 className="text-h2">Новый проект</h2>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название проекта"
          required
          className="rounded-xl border border-foreground/15 bg-background px-4 py-3 text-body outline-none focus:border-accent"
        />

        <div className="flex gap-2">
          {colorPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setColor(preset)}
              aria-label={`Цвет ${preset}`}
              className={`h-8 w-8 rounded-full ${
                color === preset ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : ""
              }`}
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>

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
            disabled={createProject.isPending}
            className="flex-1 rounded-xl bg-accent px-4 py-3 text-body font-medium text-card disabled:opacity-50"
          >
            {createProject.isPending ? "Сохранение..." : "Создать"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

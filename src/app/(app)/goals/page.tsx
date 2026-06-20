"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { GoalCard } from "@/components/ui/goal-card";
import { GoalFormModal } from "@/components/ui/goal-form-modal";
import { useGoals } from "@/hooks/use-goals";

const filters = [
  { value: "all", label: "Все" },
  { value: "finance", label: "Финансы" },
  { value: "health", label: "Здоровье" },
  { value: "career", label: "Карьера" },
  { value: "education", label: "Образование" },
  { value: "personal", label: "Личное" },
];

export default function GoalsPage() {
  const { data: goals, isLoading } = useGoals();
  const [activeFilter, setActiveFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredGoals =
    activeFilter === "all" ? goals : goals?.filter((g) => g.category === activeFilter);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">Мои цели</h1>
        <button
          type="button"
          aria-label="Новая цель"
          onClick={() => setIsModalOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm shadow-foreground/5"
        >
          <Plus size={20} className="text-foreground/70" />
        </button>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
            className={
              activeFilter === filter.value
                ? "shrink-0 rounded-full bg-foreground px-4 py-2 text-caption font-medium text-background"
                : "shrink-0 rounded-full border border-foreground/10 bg-card px-4 py-2 text-caption text-foreground/70"
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {isLoading && <p className="text-caption text-foreground/50">Загрузка...</p>}
        {!isLoading && filteredGoals?.length === 0 && (
          <p className="text-caption text-foreground/50">В этой категории пока нет целей.</p>
        )}
        {filteredGoals?.map((goal) => (
          <GoalCard
            key={goal.id}
            title={goal.title}
            category={goal.category}
            currentProgress={goal.current_progress}
            targetValue={goal.target_value}
            deadline={goal.deadline}
          />
        ))}
      </div>

      <GoalFormModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

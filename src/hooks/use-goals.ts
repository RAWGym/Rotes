"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

export type Goal = Database["public"]["Tables"]["goals"]["Row"];

const GOALS_KEY = ["goals"] as const;

export function useGoals() {
  const supabase = createClient();

  return useQuery({
    queryKey: GOALS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("is_main", { ascending: false })
        .order("deadline", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateGoal() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      category: string;
      targetValue: number | null;
      currentProgress: number;
      deadline: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Не авторизован");

      const { error } = await supabase.from("goals").insert({
        title: input.title,
        category: input.category,
        target_value: input.targetValue,
        current_progress: input.currentProgress,
        deadline: input.deadline,
        user_id: user.id,
        is_main: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
    },
  });
}

export function useSetMainGoal() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ goalId, userId }: { goalId: string; userId: string }) => {
      await supabase.from("goals").update({ is_main: false }).eq("user_id", userId);
      const { error } = await supabase.from("goals").update({ is_main: true }).eq("id", goalId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
    },
  });
}

export function useUpdateGoalProgress() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, current_progress }: { id: string; current_progress: number }) => {
      const { error } = await supabase.from("goals").update({ current_progress }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
    },
  });
}
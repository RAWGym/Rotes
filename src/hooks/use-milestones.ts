"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

export type Milestone = Database["public"]["Tables"]["milestones"]["Row"];

export function useMilestones(goalId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["milestones", goalId],
    queryFn: async () => {
      let query = supabase
        .from("milestones")
        .select("*")
        .order("order", { ascending: true, nullsFirst: false });

      if (goalId) query = query.eq("goal_id", goalId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useAllMilestones() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["milestones", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .order("order", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useToggleMilestone() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, achieved }: { id: string; achieved: boolean }) => {
      const { error } = await supabase
        .from("milestones")
        .update({ achieved_at: achieved ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
  });
}

export function useCreateMilestone() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { goal_id: string; title: string; target_value: number; order?: number }) => {
      const { error } = await supabase.from("milestones").insert(input);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
  });
}
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];

const TASKS_KEY = ["tasks"] as const;

export function useTasks() {
  const supabase = createClient();

  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .neq("status", "archived")
        .order("status", { ascending: true })
        .order("time", { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useToggleTaskStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previous = queryClient.getQueryData<Task[]>(TASKS_KEY);

      queryClient.setQueryData<Task[]>(TASKS_KEY, (old) =>
        old?.map((task) => (task.id === id ? { ...task, status } : task))
      );

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TASKS_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useCreateTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      description: string | null;
      priority: string | null;
      time: string | null;
      deadline: string | null;
      category: string | null;
      projectId: string | null;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Не авторизован");

      const { error } = await supabase.from("tasks").insert({
        title: input.title,
        description: input.description,
        priority: input.priority,
        time: input.time,
        deadline: input.deadline,
        category: input.category,
        project_id: input.projectId,
        status: "active",
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useUpdateTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: { id: string } & Partial<{
        title: string;
        description: string | null;
        priority: string | null;
        category: string | null;
        deadline: string | null;
        time: string | null;
        project_id: string | null;
      }>
    ) => {
      const { id, ...fields } = input;
      const { error } = await supabase.from("tasks").update(fields).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

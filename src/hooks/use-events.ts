"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

export type Event = Database["public"]["Tables"]["events"]["Row"];

export function useEvents(start: Date, end: Date) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["events", start.toISOString(), end.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("start_time", start.toISOString())
        .lte("start_time", end.toISOString())
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateEvent() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      category: string;
      startTime: string;
      endTime: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Не авторизован");

      const { error } = await supabase.from("events").insert({
        title: input.title,
        category: input.category,
        start_time: input.startTime,
        end_time: input.endTime,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

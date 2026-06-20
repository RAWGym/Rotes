"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

export type Note = Database["public"]["Tables"]["notes"]["Row"];

const NOTES_KEY = ["notes"] as const;

export function useNotes() {
  const supabase = createClient();

  return useQuery({
    queryKey: NOTES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateNote() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { title: string; content: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Не авторизован");

      const { error } = await supabase.from("notes").insert({
        title: input.title || null,
        content: input.content || null,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
  });
}

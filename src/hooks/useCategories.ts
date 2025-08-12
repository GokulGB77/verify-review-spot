import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CategoryItem = string;

export function useCategories() {
  return useQuery<{ categories: CategoryItem[] }>({
    queryKey: ["categories"],
    queryFn: async () => {
      // Fetch minimal fields to compute categories
      const { data, error } = await supabase
        .from("entities")
        .select("industry")
        .eq("status", "active");

      if (error) throw error;

      const set = new Set<string>();
      for (const row of data || []) {
        const industry = (row as any).industry?.trim();
        if (industry) set.add(industry);
      }

      const categories = Array.from(set).sort((a, b) => a.localeCompare(b));
      return { categories };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GrowthPoint {
  day: string;
  count: number;
}

export const useAdminGrowth = (daysBack = 30) => {
  const userGrowth = useQuery<GrowthPoint[]>({
    queryKey: ["admin-growth", "users", daysBack],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_user_growth" as any, { days_back: daysBack });
      if (error) throw error;
      return (data as any) ?? [];
    },
    staleTime: 60_000,
  });

  const coupleGrowth = useQuery<GrowthPoint[]>({
    queryKey: ["admin-growth", "couples", daysBack],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_couple_growth" as any, { days_back: daysBack });
      if (error) throw error;
      return (data as any) ?? [];
    },
    staleTime: 60_000,
  });

  return { userGrowth, coupleGrowth };
};

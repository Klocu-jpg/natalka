import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminStats = () => {
  const { data: userCount = 0, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-stats", "users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_user_count");
      if (error) throw error;
      return Number(data) || 0;
    },
  });

  const { data: coupleCount = 0, isLoading: loadingCouples } = useQuery({
    queryKey: ["admin-stats", "couples"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_couple_count");
      if (error) throw error;
      return Number(data) || 0;
    },
  });

  return { userCount, coupleCount, isLoading: loadingUsers || loadingCouples };
};

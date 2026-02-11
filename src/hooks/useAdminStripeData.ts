import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

export const useAdminStripeData = () => {
  const { testMode } = useSubscription();

  return useQuery({
    queryKey: ["admin-stripe-data", testMode],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-stats", {
        body: { testMode },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
    retry: 1,
  });
};

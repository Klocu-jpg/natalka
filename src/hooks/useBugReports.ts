import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useBugReports = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const submitReport = useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("bug_reports" as any).insert({
        user_id: user.id,
        title,
        description,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Zgłoszenie wysłane!");
      queryClient.invalidateQueries({ queryKey: ["bug-reports"] });
    },
    onError: () => toast.error("Nie udało się wysłać zgłoszenia"),
  });

  return { submitReport };
};

export const useAdminBugReports = () => {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["bug-reports", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bug_reports" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("bug_reports" as any)
        .update({
          status,
          ...(status === "resolved" ? { resolved_at: new Date().toISOString() } : {}),
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bug-reports"] });
      toast.success("Status zaktualizowany");
    },
  });

  return { reports, isLoading, updateStatus };
};

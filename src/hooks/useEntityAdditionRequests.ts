
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useEntityAdditionRequests = () => {
  return useQuery({
    queryKey: ["entity-addition-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entity_addition_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateEntityAdditionRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("entity_addition_requests")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity-addition-requests"] });
      toast({
        title: "Success",
        description: "Request status updated successfully!",
      });
    },
    onError: (error) => {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description: "Failed to update request status.",
        variant: "destructive",
      });
    },
  });
};

import { useMutation, QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast'; // Import useToast directly

export const useEntityMutations = (queryClient: QueryClient) => {
  const { toast } = useToast(); // Get toast function from the hook

  const toggleBusinessClaimed = useMutation({
    mutationFn: async ({ entityId, currentStatus }: { entityId: string; currentStatus: boolean }) => {
      const { error } = await supabase
        .from('entities')
        .update({ claimed_by_business: !currentStatus })
        .eq('entity_id', entityId);
      if (error) throw error;
      return !currentStatus; // Return the new status
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      toast({
        title: `Business ${newStatus ? 'Claimed' : 'Unclaimed'}`,
        description: `The entity has been ${newStatus ? 'marked as business claimed' : 'unmarked as business claimed'}.`,
      });
    },
    onError: (error) => {
      console.error("Error toggling business claimed status:", error);
      toast({
        title: 'Error',
        description: 'Failed to update business claimed status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deactivateEntity = useMutation({
    mutationFn: async (entityId: string) => {
      const { error } = await supabase
        .from('entities')
        .update({ status: 'inactive' })
        .eq('entity_id', entityId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      toast({
        title: 'Entity Deactivated',
        description: 'The entity has been successfully deactivated.',
      });
    },
    onError: (error) => {
      console.error("Error deactivating entity:", error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate entity. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const reactivateEntity = useMutation({
    mutationFn: async (entityId: string) => {
      const { error } = await supabase
        .from('entities')
        .update({ status: 'active' })
        .eq('entity_id', entityId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      toast({
        title: 'Entity Reactivated',
        description: 'The entity has been successfully reactivated.',
      });
    },
    onError: (error) => {
      console.error("Error reactivating entity:", error);
      toast({
        title: 'Error',
        description: 'Failed to reactivate entity. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete entity mutation (basic structure, can be expanded)
  const deleteEntity = useMutation({
    mutationFn: async (entityId: string) => {
      // Add confirmation dialog logic here before proceeding
      const { error } = await supabase
        .from('entities')
        .delete()
        .eq('entity_id', entityId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      toast({
        title: "Entity Deleted",
        description: "The entity has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error("Error deleting entity:", error);
      toast({
        title: "Error Deleting Entity",
        description: "Failed to delete entity. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    toggleBusinessClaimed,
    deactivateEntity,
    reactivateEntity,
    deleteEntity, // Included, but implementation might need confirmation step
  };
};

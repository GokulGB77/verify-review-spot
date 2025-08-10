import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const CreateDummyReviews = () => {
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createDummyReviews = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-dummy-reviews', {
        body: {
          entityId: '6e71f4ee-899c-4cf2-bf7a-9bab296c0f08',
          count: 50,
        },
      });

      if (!error) {
        toast({
          title: "Success!",
          description: `Created ${data?.insertedCount ?? 50} dummy reviews for the specified entity.`,
        });
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
      } else {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || error?.error || "Failed to create dummy reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteDummyReviews = async () => {
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-dummy-reviews', {
        body: {
          entityName: 'Miles Education',
        },
      });

      if (!error) {
        toast({
          title: "Removed",
          description: `Deleted ${data?.deletedCount ?? 0} dummy reviews for Miles Education.`,
        });
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
      } else {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || error?.error || "Failed to delete dummy reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={createDummyReviews} disabled={creating}>
        {creating ? 'Creating…' : 'Create Dummy Reviews'}
      </Button>
      <Button onClick={deleteDummyReviews} variant="outline" disabled={deleting}>
        {deleting ? 'Removing…' : 'Remove Dummy Reviews'}
      </Button>
    </div>
  );
};

export default CreateDummyReviews;

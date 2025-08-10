
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CreateDummyReviews = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createDummyReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-dummy-reviews', {
        body: {
          entityName: 'Miles Education',
          count: 50,
        },
      });

      if (!error) {
        toast({
          title: "Success!",
          description: `Created ${data?.insertedCount ?? 50} dummy reviews for Miles Education.`,
        });
      } else {
        throw error;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create dummy reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={createDummyReviews} disabled={loading}>
      {loading ? 'Creating...' : 'Create Dummy Reviews'}
    </Button>
  );
};

export default CreateDummyReviews;

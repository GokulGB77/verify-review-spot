
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CreateDummyReviews = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createDummyReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-dummy-reviews', {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: "Success!",
          description: "Dummy reviews have been created successfully.",
        });
      } else {
        throw new Error('Failed to create dummy reviews');
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

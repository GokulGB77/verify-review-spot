
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface EntityAdditionRequestFormProps {
  onSuccess?: () => void;
}

const EntityAdditionRequestForm = ({ onSuccess }: EntityAdditionRequestFormProps) => {
  const [formData, setFormData] = useState({
    entity_name: "",
    sector: "",
    website_link: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.entity_name.trim() || !formData.sector.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("entity_addition_requests")
        .insert({
          entity_name: formData.entity_name.trim(),
          sector: formData.sector.trim(),
          website_link: formData.website_link.trim() || null,
          requested_by: user?.id || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your entity addition request has been submitted successfully!",
      });

      setFormData({
        entity_name: "",
        sector: "",
        website_link: ""
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Request Entity Addition</CardTitle>
        <CardDescription>
          Can't find what you're looking for? Request to add a new entity to our platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entity_name">Entity Name *</Label>
            <Input
              id="entity_name"
              type="text"
              placeholder="Enter entity name"
              value={formData.entity_name}
              onChange={(e) => handleChange("entity_name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">Sector *</Label>
            <Input
              id="sector"
              type="text"
              placeholder="e.g., Technology, Healthcare, Finance"
              value={formData.sector}
              onChange={(e) => handleChange("sector", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_link">Website Link</Label>
            <Input
              id="website_link"
              type="url"
              placeholder="https://example.com (optional)"
              value={formData.website_link}
              onChange={(e) => handleChange("website_link", e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EntityAdditionRequestForm;

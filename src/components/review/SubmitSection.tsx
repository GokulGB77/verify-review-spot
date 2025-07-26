
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitSectionProps {
  canSubmit: boolean;
  isPending: boolean;
  isEdit: boolean;
  isUpdate: boolean;
  isBasicFormValid: boolean;
  needsProof: boolean;
  hasFile: boolean;
}

const SubmitSection = ({ 
  canSubmit, 
  isPending, 
  isEdit, 
  isUpdate, 
  isBasicFormValid, 
  needsProof, 
  hasFile 
}: SubmitSectionProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <Button
          type="submit"
          disabled={!canSubmit || isPending}
          className="w-full"
          size="lg"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending 
            ? (isEdit ? 'Updating...' : (isUpdate ? 'Submitting Update...' : 'Submitting...'))
            : (isEdit ? 'Update Review' : (isUpdate ? 'Submit Update' : 'Submit Review'))
          }
        </Button>
        
        {!canSubmit && (
          <div className="text-sm text-gray-500 text-center mt-3 space-y-1">
            {!isBasicFormValid && (
              <p>Please complete all required fields (business, rating, title, review text with at least 50 characters)</p>
            )}
            {needsProof && !hasFile && (
              <p>Please upload proof or select 'No specific connection' to proceed</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubmitSection;

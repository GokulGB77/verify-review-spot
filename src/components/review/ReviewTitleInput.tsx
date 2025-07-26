import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReviewTitleInputProps {
  title: string;
  onTitleChange: (title: string) => void;
  isEdit: boolean;
  isUpdate: boolean;
}

const ReviewTitleInput = ({ title, onTitleChange, isEdit, isUpdate }: ReviewTitleInputProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Title</CardTitle>
        <CardDescription>
          {isEdit 
            ? 'Update your review title'
            : (isUpdate 
              ? 'Add a title for this review update'
              : 'Give your review a descriptive title'
            )
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g., My experience as a student and employee"
            maxLength={100}
            className="w-full"
          />
          <p className="text-sm text-gray-500">
            {title.length}/100 characters
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewTitleInput;
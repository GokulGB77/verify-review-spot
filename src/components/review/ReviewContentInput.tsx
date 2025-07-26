
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReviewContentInputProps {
  title: string;
  onTitleChange: (title: string) => void;
  content: string;
  onContentChange: (content: string) => void;
  isEdit: boolean;
  isUpdate: boolean;
}

const ReviewContentInput = ({ title, onTitleChange, content, onContentChange, isEdit, isUpdate }: ReviewContentInputProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? 'Your Review' : (isUpdate ? 'Your Update' : 'Your Review')}
        </CardTitle>
        <CardDescription>
          {isEdit 
            ? 'Update your review content'
            : (isUpdate 
              ? 'What has changed since your last review?' 
              : 'Share your detailed experience. Be honest and constructive.'
            )
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Review Title *</Label>
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
          <div className="space-y-2">
            <Label htmlFor="content">Review Content *</Label>
            <Textarea
              id="content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={isEdit 
            ? "Update your review with new thoughts or experiences..."
            : (isUpdate 
              ? "What's new? Have they improved? What changes have you noticed since your last review?"
              : "Describe your experience with this business or service. What went well? What could be improved? Include specific details that would help others make informed decisions."
            )
          }
          rows={6}
          className="w-full"
        />
            <p className="text-sm text-gray-500 mt-2">
              Minimum 50 characters. Current: {content.length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewContentInput;

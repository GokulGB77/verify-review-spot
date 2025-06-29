
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from 'lucide-react';

interface RatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  isEdit: boolean;
  isUpdate: boolean;
}

const RatingInput = ({ rating, onRatingChange, isEdit, isUpdate }: RatingInputProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? 'Updated Rating' : (isUpdate ? 'Updated Rating' : 'Overall Rating')}
        </CardTitle>
        <CardDescription>
          {isEdit 
            ? 'Update your rating for this experience'
            : (isUpdate 
              ? 'How would you rate your experience now?' 
              : 'How would you rate your overall experience?'
            )
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((ratingValue) => (
            <button
              type="button"
              key={ratingValue}
              onClick={() => onRatingChange(ratingValue)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 ${
                  ratingValue <= rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-3 text-lg font-medium">
            {rating > 0 && (
              <>
                {rating} star{rating !== 1 ? 's' : ''}
              </>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RatingInput;

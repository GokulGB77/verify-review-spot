
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ReviewContentProps {
  content: string;
  maxLength?: number;
  maxLines?: number;
}

const ReviewContent = ({ content, maxLength = 150, maxLines }: ReviewContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // If maxLines is specified, use line-based truncation
  if (maxLines) {
    return (
      <div>
        <p className={`text-gray-700 text-sm leading-relaxed ${!isExpanded ? `line-clamp-${maxLines}` : ''}`}>
          {content}
        </p>
        {content.length > 100 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 flex items-center space-x-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>See less</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>See more</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  }
  
  // Original character-based truncation
  const shouldTruncate = content.length > maxLength;
  
  return (
    <div>
      <p className="text-gray-700 text-sm leading-relaxed">
        {shouldTruncate && !isExpanded ? `${content.slice(0, maxLength)}...` : content}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 flex items-center space-x-1"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span>See less</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>See more</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ReviewContent;

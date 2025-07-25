
import { useState } from 'react';

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
        <p className={`text-gray-700 text-sm leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap ${!isExpanded ? `line-clamp-${maxLines}` : ''}`}>
          {content}
        </p>
        {content.length > 100 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
          >
            {isExpanded ? 'See less' : 'See more'}
          </button>
        )}
      </div>
    );
  }
  
  // Original character-based truncation
  const shouldTruncate = content.length > maxLength;
  
  return (
    <div>
      <p className="text-gray-700 text-sm leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap">
        {shouldTruncate && !isExpanded ? `${content.slice(0, maxLength)}...` : content}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
        >
          {isExpanded ? 'See less' : 'See more'}
        </button>
      )}
    </div>
  );
};

export default ReviewContent;

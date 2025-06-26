
import { useState } from 'react';

interface ReviewContentProps {
  content: string;
  maxLength?: number;
}

const ReviewContent = ({ content, maxLength = 80 }: ReviewContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = content.length > maxLength;
  
  return (
    <div>
      <p className="text-gray-700 text-xs leading-relaxed">
        {shouldTruncate && !isExpanded ? `${content.slice(0, maxLength)}...` : content}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-1"
        >
          {isExpanded ? 'See less' : 'See more'}
        </button>
      )}
    </div>
  );
};

export default ReviewContent;

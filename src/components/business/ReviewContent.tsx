
import { useState } from 'react';

interface ReviewContentProps {
  content: string;
  maxLength?: number;
}

const ReviewContent = ({ content, maxLength = 150 }: ReviewContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = content.length > maxLength;
  
  return (
    <div>
      <p className="text-gray-700 text-sm leading-relaxed">
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

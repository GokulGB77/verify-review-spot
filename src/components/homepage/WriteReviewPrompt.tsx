import { Link } from "react-router-dom";

const WriteReviewPrompt = () => {
  return (
    <div className="flex items-center justify-center px-2 sm:px-4 pt-4 pb-10 sm:pb-12 md:pb-16">
      <div className="flex items-center w-full max-w-4xl sm:max-w-6xl lg:max-w-10xl">
        {/* Left extending line - hidden on mobile */}
        <div className="hidden sm:flex flex-1 h-px bg-gray-300"></div>
        
        {/* Pill container */}
        <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 mx-2 sm:mx-6 shadow-sm border border-gray-200 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left">
            <span className="text-gray-700 text-xs sm:text-sm font-medium mb-2 sm:mb-0 sm:mr-2 leading-relaxed">
              Tried something new — maybe a course or a product?
            </span>
            <Link
              to="/write-review"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap"
            >
              Share your review.
              <svg
                className="ml-1 w-3 h-3 sm:w-4 sm:h-4 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Right extending line - hidden on mobile */}
        <div className="hidden sm:flex flex-1 h-px bg-gray-300"></div>
      </div>
    </div>
  );
};

export default WriteReviewPrompt;
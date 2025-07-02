import { Link } from "react-router-dom";

const WriteReviewPrompt = () => {
  return (
    <div className="flex items-center justify-center px-4 pt-4">
      <div className="flex items-center w-full max-w-10xl">
        {/* Left extending line */}
        <div className="flex-1 h-px bg-gray-300"></div>
        {/* Pill container */}
        <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-full px-8 py-4 mx-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-center whitespace-nowrap">
            <span className="text-gray-700 text-sm font-medium mr-2">
              Tried something new — maybe a course or a product?
            </span>
            <Link
              to="/write-review"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
            >
              Share your review.
              <svg
                className="ml-1 w-4 h-4 mt-0.5"
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
        {/* Right extending line */}
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>
    </div>
  );
};

export default WriteReviewPrompt;

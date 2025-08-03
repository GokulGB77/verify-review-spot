import { Link } from "react-router-dom";

const WriteReviewPrompt = () => {
  return (
    <div className="pt-4 pb-10 sm:pb-12 md:pb-16">
      {/* Mobile design */}
      <div className="block sm:hidden px-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-blue-100">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Your Experience</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tried something new? Help others make informed decisions.
            </p>
          </div>
          <Link
            to="/write-review"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            Write a Review
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Desktop design */}
      <div className="hidden sm:flex items-center justify-center px-2 sm:px-4">
        <div className="flex items-center w-full max-w-4xl sm:max-w-6xl lg:max-w-10xl">
          {/* Left extending line */}
          <div className="flex flex-1 h-px bg-gray-300"></div>
          
          {/* Pill container */}
          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-full px-6 lg:px-8 py-4 mx-6 shadow-sm border border-gray-200">
            <div className="flex flex-row items-center justify-center text-center">
              <span className="text-gray-700 text-sm font-medium mr-2 leading-relaxed">
                Tried something new — maybe a course or a product?
              </span>
              <Link
                to="/write-review"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 whitespace-nowrap"
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
          <div className="flex flex-1 h-px bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
};

export default WriteReviewPrompt;
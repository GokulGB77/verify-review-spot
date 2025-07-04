import { Link } from "react-router-dom";

const WriteReviewPromptMinimal = () => (
  <div className="flex justify-center py-4">
    <div className="bg-white border border-gray-200 rounded-full px-6 py-2 shadow-sm">
      <span className="text-gray-700 text-sm mr-2">Tried something new?</span>
      <Link
        to="/write-review"
        className="text-blue-600 font-medium hover:underline text-sm"
      >
        Write a review
      </Link>
    </div>
  </div>
);

export default WriteReviewPromptMinimal;

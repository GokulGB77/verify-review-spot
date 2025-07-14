import { useState } from "react";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useReviews } from "@/hooks/useReviews";
import { transformReviewsToTestimonials } from "@/components/homepage/ScrollingReviews"; // Assumes export
import { Star, CheckCircle, Shield, Clock, ArrowRight } from "lucide-react";

const RecentReviews = () => {
  const { data: businesses = [] } = useBusinesses();
  const { data: allReviews = [] } = useReviews();
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  const testimonials = transformReviewsToTestimonials(allReviews, businesses)
    .filter(testimonial => testimonial.isVerified === true)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 3);

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedReviews(newExpanded);
  };

  const getBadgeDisplay = (testimonial) => {
    if (
      testimonial.isProofSubmitted &&
      testimonial.isVerified === true &&
      testimonial.customVerificationTag
    ) {
      return {
        text: testimonial.customVerificationTag,
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <Shield className="h-3 w-3 mr-1" />,
      };
    }
    if (testimonial.isProofSubmitted && testimonial.isVerified !== true) {
      return {
        text: "Pending Verification",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: <Clock className="h-3 w-3 mr-1" />,
      };
    }
    if (testimonial.mainBadge === "Verified User") {
      return {
        text: "Verified",
        className: "bg-green-50 text-green-700 border-green-200",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      };
    }
    return {
      text: "Unverified",
      className: "bg-gray-50 text-gray-600 border-gray-200",
      icon: null,
    };
  };

    // Helper for truncating
  const truncateText = (text, wordLimit = 35) => {
    const words = text.split(" ");
    if (words.length <= wordLimit) return { truncated: text, needsTruncation: false };
    return {
      truncated: words.slice(0, wordLimit).join(" ") + "...",
      needsTruncation: true,
    };
  };

  // Early return if no testimonials to prevent hook inconsistency
  if (testimonials.length === 0) {
    return (
      <section className="py-10 sm:py-12 md:py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Recent Verified Reviews</h2>
              <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center">
                View All Reviews <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-600">No reviews available yet.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-12 md:py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
  <div className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Recent Verified Reviews</h2>
        <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center">
          View All Reviews <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((review, index) => {
          const badge = getBadgeDisplay(review);
          const { truncated, needsTruncation } = truncateText(review.text);
          const expanded = expandedReviews.has(index);

          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  {review.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{review.author}</h4>
                  <p className="text-sm text-gray-600">{review.company}</p>
                </div>
              </div>

              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">{review.rating}/5</span>
              </div>

              <p className="text-gray-700 mb-2 text-sm leading-relaxed break-words overflow-wrap-anywhere">
                {expanded ? review.text : truncated}
              </p>

              {needsTruncation && (
                <button
                  className="text-blue-600 hover:underline text-xs font-medium mb-4"
                  onClick={() => toggleExpanded(index)}
                >
                  {expanded ? "Show Less" : "Read More"}
                </button>
              )}

              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.className}`}
                >
                  {badge.icon}
                  {badge.text}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
      </div>
    </section>
  );
};

export default RecentReviews;

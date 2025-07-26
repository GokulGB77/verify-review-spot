import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useReviews } from "@/hooks/useReviews";
import {
  getDisplayName,
  getMainBadge,
  getReviewSpecificBadge,
} from "@/utils/reviewHelpers";
import { Star, CheckCircle, Shield, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Function to get user initials for avatar
const getUserInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Function to transform review data to testimonial format
export const transformReviewsToTestimonials = (reviews, businesses) => {
  if (!reviews || !businesses || reviews.length === 0) {
    return [];
  }

  // First, let's be less strict about filtering - include all reviews initially
  let activeEntityReviews = reviews;

  // Only filter by active status if businesses have a status field
  if (businesses.some((b) => b.status !== undefined)) {
    activeEntityReviews = reviews.filter((review) => {
      const business = businesses.find(
        (b) => b.entity_id === review.business_id
      );
      return business && (business.status === "active" || !business.status);
    });
  }

  // Group reviews by user and business, showing only the latest review/update
  const reviewGroups = new Map();

  activeEntityReviews.forEach((review) => {
    const key = `${review.user_id}-${review.business_id}`;

    if (!reviewGroups.has(key)) {
      reviewGroups.set(key, []);
    }

    reviewGroups.get(key).push(review);
  });

  // For each group, get the latest review and transform to testimonial format
  const testimonials = [];

  reviewGroups.forEach((reviewsInGroup, groupKey) => {
    // Sort by created_at to get the latest (same logic as Homepage)
    const sortedReviews = reviewsInGroup.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const latestReview = sortedReviews[0];
    const business = businesses.find(
      (b) => b.entity_id === latestReview.business_id
    );

    // Use the same logic as Homepage - more lenient content check
    if (latestReview.content && latestReview.content.trim() && business) {
      const userName = getDisplayName(latestReview.profiles);

      // Get badge information
      const mainBadge = getMainBadge(latestReview.profiles);
      const reviewSpecificBadge = getReviewSpecificBadge(latestReview);
      const proofProvided = !!latestReview.proof_url;
      const proofVerified = latestReview.proof_verified;

      const testimonial = {
        text: latestReview.content,
        title: latestReview.title, // Add title to testimonial object
        author: userName,
        company: business.name,
        businessId: business.entity_id, // Add business ID for navigation
        avatar: getUserInitials(userName),
        rating: latestReview.rating || 0,
        created_at: latestReview.created_at,
        // Badge information (new fields)
        mainBadge,
        customVerificationTag: latestReview.custom_verification_tag,
        isProofSubmitted: latestReview.is_proof_submitted,
        isVerified: latestReview.is_verified,
      };

      testimonials.push(testimonial);
    }
  });

  // Sort by creation date and return
  return testimonials.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

const TestimonialCard = ({ testimonial, onHover, onLeave, onReadMore }) => {
  const navigate = useNavigate();
  
  // Function to truncate text - use shorter limit for better mobile experience
  const truncateText = (text, wordLimit = 35) => {
    const words = text.split(" ");
    if (words.length <= wordLimit) {
      return { truncated: text, needsTruncation: false };
    }
    return {
      truncated: words.slice(0, wordLimit).join(" ") + "...",
      needsTruncation: true,
    };
  };

  const { truncated, needsTruncation } = truncateText(testimonial.text);

  // Badge display logic - show only one badge per review (same as SingleReviewCard)
  const getBadgeDisplay = () => {
    // Priority 1: If proof is uploaded and verified, show custom verification tag
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

    // Priority 2: If proof is uploaded but not yet verified, show pending verification
    if (testimonial.isProofSubmitted && testimonial.isVerified !== true) {
      return {
        text: "Pending Verification",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: <Clock className="h-3 w-3 mr-1" />,
      };
    }

    // Priority 3: Fall back to profile-based verification status
    if (testimonial.mainBadge === "Verified User") {
      return {
        text: "Verified",
        className: "bg-green-50 text-green-700 border-green-200",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      };
    }

    // Default: Unverified
    return {
      text: "Unverified",
      className: "bg-gray-50 text-gray-600 border-gray-200",
      icon: null,
    };
  };

  const badgeDisplay = getBadgeDisplay();

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 mb-4 flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[380px] xl:w-[440px]"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="space-y-3">
        {/* Title */}
        {testimonial.title && (
          <h3 className="font-semibold text-base text-gray-900 leading-tight line-clamp-2">
            {testimonial.title}
          </h3>
        )}
        <p className="text-gray-900 text-sm leading-relaxed">
          "{truncated}"
        </p>
        {needsTruncation && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReadMore(testimonial);
            }}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium focus:outline-none"
          >
            Read more
          </button>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
              {testimonial.avatar}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {testimonial.author}
              </p>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/entities/${testimonial.businessId}`);
                }}
                className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 truncate transition-colors duration-200 cursor-pointer underline-offset-2 hover:underline text-left"
              >
                {testimonial.company}
              </button>
            </div>
          </div>
        </div>
        
        {/* Rating stars - moved to bottom */}
        {testimonial.rating && (
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(testimonial.rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-medium text-gray-700">
              {testimonial.rating}/5
            </span>
          </div>
        )}
        
        {/* Badge display */}
        <Badge
          variant="outline"
          className={`text-xs px-2 py-1 h-5 ${badgeDisplay.className} flex items-center w-fit`}
        >
          {badgeDisplay.icon}
          {badgeDisplay.text}
        </Badge>
      </div>
    </div>
  );
};

const ScrollingColumn = ({ testimonials, direction, speed, onReadMore }) => {
  const duplicatedTestimonials = [...testimonials, ...testimonials];
  const [isPaused, setIsPaused] = useState(false);
  const columnRef = useRef(null);

  const handleCardHover = () => {
    setIsPaused(true);
    if (columnRef.current) {
      columnRef.current.style.animationPlayState = "paused";
    }
  };

  const handleCardLeave = () => {
    setIsPaused(false);
    if (columnRef.current) {
      columnRef.current.style.animationPlayState = "running";
    }
  };

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <div
        ref={columnRef}
        className={`flex flex-col animate-scroll-${direction}`}
        style={{
          animation: `scroll-${direction} ${speed}s linear infinite`,
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <TestimonialCard
            key={`${testimonial.author}-${index}`}
            testimonial={testimonial}
            onHover={handleCardHover}
            onLeave={handleCardLeave}
            onReadMore={onReadMore}
          />
        ))}
      </div>
    </div>
  );
};

const ReviewScrollSection = ({ testimonials, direction, speed, title, onReadMore }) => {
  return (
    <div className="flex-1">
      <div className="relative">
        {/* Gradient overlays for fade effect */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent z-10 pointer-events-none"></div>

        <div className="h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden flex justify-center">
          <ScrollingColumn
            testimonials={testimonials}
            direction={direction}
            speed={speed}
            onReadMore={onReadMore}
          />
        </div>
      </div>
    </div>
  );
};

const AnimatedTestimonials = () => {
  // Modal state for full review display
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch real data
  const { data: businesses = [] } = useBusinesses();
  const { data: allReviews = [] } = useReviews();

  // Transform reviews to testimonials format
  const allTestimonials = transformReviewsToTestimonials(
    allReviews,
    businesses
  );

  // Handle opening modal with selected review
  const handleReadMore = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTestimonial(null);
  };

  // If no real testimonials, show "No reviews yet" message
  if (allTestimonials.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-10 sm:py-12 md:py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Header */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Building the Internet's <span className="text-blue-600">Trust</span> Layer
            </h1>
            <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              One Verified Review at a Time
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              A new way to review — proof-backed, people-powered, and impossible
              to fake.
            </p>
          </div>

          {/* No Reviews Message */}
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 max-w-md mx-auto">
              <div className="text-4xl sm:text-6xl mb-4">💭</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
                No Reviews Yet
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Be the first to share your experience and help build trust in
                our community.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16 sm:mt-20 lg:mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 text-center px-4">
            <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                {allReviews.filter(review => review.is_verified === true).length}
              </div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">Verified Reviews</div>
            </div>
            <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">
                {businesses.filter((b) => b.status === "active").length}
              </div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">Businesses Listed</div>
            </div>
            <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-200 sm:col-span-2 md:col-span-1">
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
                {Array.from(new Set(allReviews.filter(review => review.profiles && getMainBadge(review.profiles) === 'Verified User').map(review => review.user_id))).length}
              </div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">
                Verified Users
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Distribute testimonials across three columns using round-robin to ensure all columns have content
  const testimonials1 = [];
  const testimonials2 = [];
  const testimonials3 = [];

  // Round-robin distribution - cycles through columns to ensure even spread
  allTestimonials.forEach((testimonial, index) => {
    const columnIndex = index % 3;
    if (columnIndex === 0) {
      testimonials1.push(testimonial);
    } else if (columnIndex === 1) {
      testimonials2.push(testimonial);
    } else {
      testimonials3.push(testimonial);
    }
  });

  // For mobile view, combine all testimonials into one column
  const mobileTestimonials = allTestimonials;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-10 sm:py-12 md:py-16">
      <style>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        
        @keyframes scroll-down {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
        
        .animate-scroll-up {
          animation: scroll-up var(--animation-duration, 40s) linear infinite;
        }
        
        .animate-scroll-down {
          animation: scroll-down var(--animation-duration, 35s) linear infinite;
        }
      `}</style>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Building the Internet's <span className="text-blue-600">Trust</span> Layer
            </h1>
            <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              One Verified Review at a Time
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              A new way to review — proof-backed, people-powered, and impossible
              to fake.
            </p>
          </div>

        {/* Three Review Scroll Sections */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Mobile Single Column - Contains all reviews, scrolls up */}
          <div className="block sm:hidden flex-1">
            <ReviewScrollSection
              testimonials={mobileTestimonials}
              direction="up"
              speed={60}
              title="All Reviews"
              onReadMore={handleReadMore}
            />
          </div>

          {/* Left Section - Scrolling Up (Slow) - Hidden on mobile */}
          <div className="hidden sm:block flex-1">
            <ReviewScrollSection
              testimonials={testimonials1}
              direction="up"
              speed={90}
              title="Recent Reviews"
              onReadMore={handleReadMore}
            />
          </div>

          {/* Middle Section - Scrolling Down - Hidden on mobile */}
          <div className="hidden sm:block flex-1">
            <ReviewScrollSection
              testimonials={testimonials2}
              direction="down"
              speed={80}
              title="User Experiences"
              onReadMore={handleReadMore}
            />
          </div>

          {/* Right Section - Scrolling Up (Fast) - Hidden on mobile, visible on md+ */}
          <div className="hidden md:block flex-1">
            <ReviewScrollSection
              testimonials={testimonials3}
              direction="up"
              speed={30}
              title="Business Feedback"
              onReadMore={handleReadMore}
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 sm:mt-20 lg:mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 text-center px-4">
          <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
              {allReviews.filter(review => review.is_verified === true).length}
            </div>
            <div className="text-sm sm:text-base text-gray-600 font-medium">
              Verified Reviews
            </div>
          </div>
          <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">
              {businesses.filter((b) => b.status === "active").length}
            </div>
            <div className="text-sm sm:text-base text-gray-600 font-medium">
              Businesses Listed
            </div>
          </div>
          <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-200 sm:col-span-2 md:col-span-1">
            <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
              {Array.from(new Set(allReviews.filter(review => review.profiles && getMainBadge(review.profiles) === 'Verified User').map(review => review.user_id))).length}
            </div>
            <div className="text-sm sm:text-base text-gray-600 font-medium">
              Verified Users
            </div>
          </div>
        </div>
      </div>

      {/* Review Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Review Details</DialogTitle>
          </DialogHeader>
          {selectedTestimonial && (
            <div className="space-y-4">
              {/* Author Info */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {selectedTestimonial.avatar}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{selectedTestimonial.author}</h3>
                  <p className="text-sm text-gray-600">{selectedTestimonial.company}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(selectedTestimonial.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-lg">{selectedTestimonial.rating}/5</span>
              </div>

              {/* Badge */}
              <div>
                <Badge 
                  variant="outline" 
                  className={`text-sm px-3 py-1 ${
                    selectedTestimonial.proofProvided && selectedTestimonial.proofVerified === true && selectedTestimonial.reviewSpecificBadge
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : selectedTestimonial.proofProvided && selectedTestimonial.proofVerified === false
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : selectedTestimonial.mainBadge === 'Verified User'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  } flex items-center w-fit`}
                >
                  {selectedTestimonial.proofProvided && selectedTestimonial.proofVerified === true && selectedTestimonial.reviewSpecificBadge ? (
                    <>
                      <Shield className="h-4 w-4 mr-1" />
                      {selectedTestimonial.reviewSpecificBadge === 'Verified Employee' ? 'Verified Employee' : 'Verified Student'}
                    </>
                  ) : selectedTestimonial.proofProvided && selectedTestimonial.proofVerified === false ? (
                    <>
                      <Clock className="h-4 w-4 mr-1" />
                      Pending Verification
                    </>
                  ) : selectedTestimonial.mainBadge === 'Verified User' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified
                    </>
                  ) : (
                    'Unverified'
                  )}
                </Badge>
              </div>

              {/* Title and Full Review Text */}
              <div className="bg-gray-50 rounded-lg p-4">
                {selectedTestimonial.title && (
                  <h3 className="font-semibold text-lg mb-3 text-gray-900">{selectedTestimonial.title}</h3>
                )}
                <p className="text-gray-900 leading-relaxed">"{selectedTestimonial.text}"</p>
              </div>

              {/* Date */}
              <div className="text-sm text-gray-500">
                Reviewed on {new Date(selectedTestimonial.created_at).toLocaleDateString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimatedTestimonials;

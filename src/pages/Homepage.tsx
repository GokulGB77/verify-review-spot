// import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import TypingAnimation from "@/components/ui/typing-animation";
// import {
//   Search,
//   Shield,
//   CheckCircle,
//   Star,
//   Users,
//   TrendingUp,
//   Lock,
//   Eye,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { Link } from "react-router-dom";

import CTASection from "@/components/CtaSection";
import ScrollingReviews from "@/components/homepage/ScrollingReviews";

// New component imports
import HeroSection from "@/components/homepage/HeroSection";
import TrustIndicators from "@/components/homepage/TrustIndicators";
import WriteReviewPrompt from "@/components/homepage/WriteReviewPrompt";
import BestEntitiesSection from "@/components/homepage/BestEntitiesSection";
import HowItWorksSection from "@/components/homepage/HowItWorksSection";

// Removed useBusinesses and useReviews, getDisplayName as they are in the hook
// import { useBusinesses } from "@/hooks/useBusinesses";
// import { useReviews } from "@/hooks/useReviews";
// import { getDisplayName } from "@/utils/reviewHelpers";
import { useHomepageData } from "@/hooks/useHomepageData"; // Import the new hook

// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

const Index = () => {
  // Data fetching and processing is now handled by the custom hook
  const { bestEntities } = useHomepageData();
  // Note: businesses and allReviews are also available from useHomepageData if needed directly here,
  // but HeroSection handles its own business data, and ScrollingReviews likely handles its own review data.

  // Removed all data processing logic that was moved to useHomepageData:
  // - Search state and logic (moved to HeroSection)
  // - activeEntityReviews calculation
  // - getLatestReviewsGrouped function
  // - featuredReviews calculation (was unused)
  // - bestEntities calculation (now in hook)

  // Helper functions getUserInitials and getAvatarColor have been moved to src/utils/uiHelpers.ts
  // They were not directly used in the final JSX of Homepage.tsx after previous refactorings.
  // If any child component needs them, they should import them from the utility file.

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <HeroSection />
      <TrustIndicators />
      <WriteReviewPrompt />

      {/* Recent Reviews Section */}
        <Card>
          
          <CardContent className="p-0">
            <ScrollingReviews />
          </CardContent>
        </Card>

      {/* Best Entities Section */}
      <BestEntitiesSection bestEntities={bestEntities} />
      <HowItWorksSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
};

export default Index;

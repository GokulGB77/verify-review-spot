import { Card, CardContent } from "@/components/ui/card";
import CTASection from "@/components/homepage/CtaSection";
import ScrollingReviews from "@/components/homepage/ScrollingReviews";
import RecentReviews from "@/components/homepage/RecentReviews";
import HeroSection from "@/components/homepage/HeroSection";
import AudienceSegments from "@/components/homepage/AudienceSegments";
import TrustIndicators from "@/components/homepage/TrustIndicators";
import WriteReviewPrompt from "@/components/homepage/WriteReviewPrompt";
import BestEntitiesSection from "@/components/homepage/BestEntitiesSection";
import HowItWorksSection from "@/components/homepage/HowItWorksSection";
import { useHomepageData } from "@/hooks/useHomepageData"; // Import the new hook

const Index = () => {
  const { bestEntities } = useHomepageData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <HeroSection />
      <TrustIndicators />
      <WriteReviewPrompt />
      <HowItWorksSection />
      <AudienceSegments />

      {/* Scrolling Reviews Section */}
      <Card className="p-0 ">
        <CardContent className="p-0 ">
          <ScrollingReviews />
        </CardContent>
      </Card>

      {/* Best Entities Section */}
      <BestEntitiesSection bestEntities={bestEntities} />
      <RecentReviews />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
};

export default Index;

import { Link } from "react-router-dom";
import TypingAnimation from "@/components/ui/typing-animation";
import { Shield, PenTool, Building2 } from "lucide-react";
import SearchBar from "@/components/common/SearchBar";

const HeroSection = () => {

  return (
    <section className="pt-6 sm:pt-16 md:pt-10 pb-6 sm:pb-8 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-2">
          <Shield className="h-4 w-4 mr-2" />
          The only review platform that requires proof
        </div>
        <h1 className="text-5xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 sm:mb-6">
          Reviews You Can
          <span className="text-blue-600"> Actually Trust</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-12 sm:mb-8 max-w-2xl mx-auto">
          Discover verified reviews from real users. No fake reviews, no
          manipulation. Just honest experiences backed by proof.
        </p>

        <TypingAnimation />

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mt-6 sm:mt-8">
          <SearchBar variant="hero" placeholder="Search for entities..." />
        </div>

        <div className="flex flex-row gap-2 sm:gap-4 justify-center mt-8">
          <Link
            to="/write-review"
            className="border-2 border-blue-600 text-blue-600 px-3 sm:px-8 py-2 sm:py-4 rounded-lg font-semibold hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center justify-center text-xs sm:text-base min-h-[40px] sm:min-h-[52px]"
          >
            <PenTool className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0" />
            <span>Write A Review</span>
          </Link>
          <Link
            to="/entities"
            className="border-2 border-blue-600 text-blue-600 px-3 sm:px-8 py-2 sm:py-4 rounded-lg font-semibold hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center justify-center text-xs sm:text-base min-h-[40px] sm:min-h-[52px]"
          >
            <Building2 className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0" />
            <span>Browse Entities</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

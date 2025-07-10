import { Users, CheckCircle, Shield } from "lucide-react";

const HowItWorksSection = () => {
  return (
    <section className="py-10 sm:py-12 md:py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            How Verification Works
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Simple, transparent, and trustworthy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              1. Verify Your Identity
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Upload an official ID for one-time verification. We use bank-level security.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              2. Submit Proof
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Upload receipts, photos, certificates, or other evidence of your experience.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">3. Get Verified</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Our team reviews your proof and approves authentic reviews within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

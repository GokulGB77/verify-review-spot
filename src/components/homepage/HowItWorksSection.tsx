import { Users, CheckCircle, Shield } from "lucide-react";

const HowItWorksSection = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How Review Spot Works
          </h2>
          <p className="text-lg text-gray-600">
            Simple, transparent, and trustworthy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Verify Your Identity
            </h3>
            <p className="text-gray-600">
              Complete PAN verification to ensure authentic reviews from real
              people
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Share Your Experience
            </h3>
            <p className="text-gray-600">
              Write honest reviews with optional proof of your experience or
              interaction
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Build Trust</h3>
            <p className="text-gray-600">
              Help others make informed decisions with verified, authentic
              feedback
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

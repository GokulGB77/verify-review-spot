import { Users, CheckCircle, Shield, PenTool, Building2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const AudienceSegments = () => {
  const [selectedTab, setSelectedTab] = useState("reviewers");

  return (
    <section className="py-10 sm:py-12 md:py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Who Is This For?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your path to get started with verified reviews
          </p>
        </div>

        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="bg-white rounded-xl p-1 flex shadow-sm border border-gray-200">
            <button
              onClick={() => setSelectedTab("reviewers")}
              className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                selectedTab === "reviewers"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Users className="h-4 w-4" />
              <span className="text-sm sm:text-base">For Reviewers</span>
            </button>
            <button
              onClick={() => setSelectedTab("businesses")}
              className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                selectedTab === "businesses"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span className="text-sm sm:text-base">For Entities</span>
            </button>
          </div>
        </div>

        {selectedTab === "reviewers" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <PenTool className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Share Your Experience
                </h3>
              </div>
              
              <ul className="space-y-4 text-gray-600 mb-8">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Write honest, detailed reviews with proof</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Upload evidence of your experience</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Help others make informed decisions</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Build your trusted reviewer reputation</span>
                </li>
              </ul>
              
              <Link
                to="/write-review"
                className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm"
              >
                <PenTool className="h-5 w-5" />
                <span>Write Your First Review</span>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Find Trustworthy Reviews
                </h3>
              </div>
              
              <ul className="space-y-4 text-gray-600 mb-8">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Search verified reviews only</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">See proof behind each review</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Compare entities confidently</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Make informed purchasing decisions</span>
                </li>
              </ul>
              
              <Link
                to="/businesses"
                className="w-full border-2 border-blue-600 text-blue-600 py-3 sm:py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Shield className="h-5 w-5" />
                <span>Explore Reviews</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Build Customer Trust
                </h3>
              </div>
              
              <ul className="space-y-4 text-gray-600 mb-8">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Get authentic customer feedback</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Showcase verified reviews</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Improve services based on proof</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Stand out from competitors</span>
                </li>
              </ul>
              
              <Link
                to="/claim-entity"
                className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm"
              >
                <Building2 className="h-5 w-5" />
                <span>Claim Your Entity</span>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Monitor Your Reputation
                </h3>
              </div>
              
              <ul className="space-y-4 text-gray-600 mb-8">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Track all reviews in one place</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Respond to customer feedback</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Get insights from verified data</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Build lasting customer relationships</span>
                </li>
              </ul>
              
              <Link
                to="/business-dashboard"
                className="w-full border-2 border-blue-600 text-blue-600 py-3 sm:py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Users className="h-5 w-5" />
                <span>View Dashboard Demo</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AudienceSegments;
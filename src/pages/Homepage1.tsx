import React, { useState } from 'react';
import { Search, CheckCircle, Lock, Eye, Star, Shield, Clock, TrendingUp, Users, ArrowRight, Play, ChevronRight } from 'lucide-react';

const Homepage1 = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('reviewers');

  // Mock data for demonstration
  const mockReviews = [
    {
      id: 1,
      author: "Sarah K.",
      company: "TechCorp Solutions",
      rating: 5,
      text: "Amazing customer service and product quality. They went above and beyond to solve our technical issues.",
      badge: "Verified Purchase",
      avatar: "SK",
      proofType: "Receipt"
    },
    {
      id: 2,
      author: "Mike R.",
      company: "Digital Marketing Pro",
      rating: 4,
      text: "Great course content and practical examples. The instructor was knowledgeable and responsive.",
      badge: "Verified Student",
      avatar: "MR",
      proofType: "Certificate"
    },
    {
      id: 3,
      author: "Lisa M.",
      company: "Green Energy Solutions",
      rating: 5,
      text: "Professional installation team and excellent follow-up service. Highly recommend for solar solutions.",
      badge: "Verified Customer",
      avatar: "LM",
      proofType: "Invoice"
    }
  ];

  const topBusinesses = [
    { name: "TechCorp Solutions", rating: 4.8, reviews: 124, category: "Technology" },
    { name: "Digital Marketing Pro", rating: 4.7, reviews: 89, category: "Education" },
    { name: "Green Energy Solutions", rating: 4.9, reviews: 156, category: "Energy" }
  ];

  const ValueProp = () => (
    <div className="text-center max-w-4xl mx-auto mb-16">
      <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6">
        <Shield className="h-4 w-4 mr-2" />
        The only review platform that requires proof
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
        Reviews You Can
        <span className="text-blue-600"> Actually Trust</span>
      </h1>
      
      <p className="text-xl text-gray-600 mb-8 leading-relaxed">
        Every review is backed by proof. No fake reviews, no bots, no manipulation. 
        Just real experiences from verified users.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
          <Search className="h-5 w-5 mr-2" />
          Search Reviews
        </button>
        <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center">
          <Play className="h-5 w-5 mr-2" />
          See How It Works
        </button>
      </div>
    </div>
  );

  const SearchSection = () => (
    <div className="max-w-2xl mx-auto mb-16">
      <div className="relative">
        <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search companies, products, or services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
        />
        <button className="absolute right-2 top-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Search
        </button>
      </div>
    </div>
  );

  const TrustIndicators = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Verified Users Only</h3>
        <p className="text-gray-600">Every reviewer must verify their identity with government ID</p>
      </div>
      
      <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Proof Required</h3>
        <p className="text-gray-600">Upload receipts, certificates, or interaction proof with every review</p>
      </div>
      
      <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Immutable Reviews</h3>
        <p className="text-gray-600">Reviews can't be deleted, only updated - creating permanent trust records</p>
      </div>
    </div>
  );

  const AudienceSegments = () => (
    <div className="bg-gray-50 rounded-2xl p-8 mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Who Is This For?</h2>
        <p className="text-gray-600">Choose your path to get started</p>
      </div>
      
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg p-1 flex">
          <button
            onClick={() => setSelectedTab('reviewers')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              selectedTab === 'reviewers'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🧑‍💻 For Reviewers
          </button>
          <button
            onClick={() => setSelectedTab('businesses')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              selectedTab === 'businesses'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏢 For Businesses
          </button>
        </div>
      </div>
      
      {selectedTab === 'reviewers' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Share Your Experience</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                Write honest, detailed reviews
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                Upload proof of your experience
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                Help others make informed decisions
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                Build your reviewer reputation
              </li>
            </ul>
            <button className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Write Your First Review
            </button>
          </div>
          
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Find Trustworthy Reviews</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                Search verified reviews only
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                See proof behind each review
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                Compare businesses confidently
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                Make informed purchasing decisions
              </li>
            </ul>
            <button className="mt-6 w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Explore Reviews
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Build Customer Trust</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                Get authentic customer feedback
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                Showcase verified reviews
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                Improve your services based on proof
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                Stand out from competitors
              </li>
            </ul>
            <button className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Claim Your Business
            </button>
          </div>
          
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Monitor Your Reputation</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                Track all reviews in one place
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                Respond to customer feedback
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                Get insights from verified data
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                Build lasting customer relationships
              </li>
            </ul>
            <button className="mt-6 w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              View Dashboard Demo
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const VerificationProcess = () => (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">How Verification Works</h2>
        <p className="text-gray-600">Our 3-step process ensures every review is authentic</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="relative text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3">1. Verify Identity</h3>
          <p className="text-gray-600">Upload government ID for one-time verification. We use bank-level security.</p>
          <div className="hidden md:block absolute top-10 -right-4 w-8 h-8">
            <ChevronRight className="h-8 w-8 text-gray-300" />
          </div>
        </div>
        
        <div className="relative text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3">2. Submit Proof</h3>
          <p className="text-gray-600">Upload receipts, photos, certificates, or other evidence of your experience.</p>
          <div className="hidden md:block absolute top-10 -right-4 w-8 h-8">
            <ChevronRight className="h-8 w-8 text-gray-300" />
          </div>
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3">3. Get Verified</h3>
          <p className="text-gray-600">Our team reviews your proof and approves authentic reviews within 24 hours.</p>
        </div>
      </div>
    </div>
  );

  const RecentReviews = () => (
    <div className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Recent Verified Reviews</h2>
        <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center">
          View All Reviews <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">{review.rating}/5</span>
            </div>
            
            <p className="text-gray-700 mb-4 text-sm leading-relaxed">{review.text}</p>
            
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                {review.badge}
              </span>
              <span className="text-xs text-gray-500">Proof: {review.proofType}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TopBusinesses = () => (
    <div className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Top Rated Businesses</h2>
        <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center">
          Browse All <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topBusinesses.map((business, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mr-4">
                <span className="text-xl font-bold text-blue-600">
                  {business.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{business.name}</h3>
                <p className="text-sm text-gray-600">{business.category}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                <span className="font-semibold text-gray-900">{business.rating}</span>
                <span className="text-sm text-gray-600 ml-1">({business.reviews})</span>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const FinalCTA = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
      <h2 className="text-3xl font-bold mb-4">Ready to Experience True Review Trust?</h2>
      <p className="text-blue-100 mb-8 text-lg">
        Join thousands who've already discovered the difference verified reviews make
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
          Write Your First Review
        </button>
        <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
          Explore Reviews
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ValueProp />
        <SearchSection />
        <TrustIndicators />
        <AudienceSegments />
        <VerificationProcess />
        <RecentReviews />
        <TopBusinesses />
        <FinalCTA />
      </div>
    </div>
  );
};

export default Homepage1;
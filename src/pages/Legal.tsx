import React, { useState } from 'react';
import { ChevronRight, Shield, Users, FileText, Eye, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const Legal = () => {
  const [activeTab, setActiveTab] = useState('privacy');
  const [activeSection, setActiveSection] = useState('overview');

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'guidelines', label: 'Reviewer Guidelines', icon: Users }
  ];

  const Navigation = () => (
    <div className="bg-indigo-50 p-6 rounded-lg mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Legal Documents</h2>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-indigo-100'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const PrivacyPolicy = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-lg opacity-90">
          Effective Date: January 1, 2025 | Version 1.0
        </p>
        <p className="mt-4 text-indigo-100">
          At Review Spot, your privacy is our priority. This policy explains how we collect, use, and protect your personal information on our verification-focused review platform.
        </p>
      </div>

      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
        
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-blue-600" />
            Public Information
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Your username and profile information you choose to display</li>
            <li>• Reviews and ratings you submit</li>
            <li>• Verification badges (Verified Graduate, Verified Employee, etc.)</li>
            <li>• Your interactions with reviews (upvotes, downvotes, comments)</li>
            <li>• Institution or business information you've reviewed</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-yellow-600" />
            Private Information
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Aadhaar verification documents (encrypted and securely stored)</li>
            <li>• Email address and contact information</li>
            <li>• Educational/employment verification documents</li>
            <li>• IP address and device information</li>
            <li>• Usage patterns and platform interactions</li>
            <li>• Payment information for business subscriptions</li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Platform Operations</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Verify user authenticity</li>
              <li>• Display verified reviews</li>
              <li>• Prevent fraud and fake reviews</li>
              <li>• Improve platform security</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">User Experience</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Personalize your experience</li>
              <li>• Send important notifications</li>
              <li>• Provide customer support</li>
              <li>• Process dispute resolutions</li>
            </ul>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Aadhaar Verification</h2>
        
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Special Protection for Aadhaar Data</h3>
              <p className="text-red-700 mb-4">
                We understand the sensitivity of Aadhaar information and implement special safeguards:
              </p>
              <ul className="space-y-2 text-red-700">
                <li>• Aadhaar documents are encrypted with military-grade security</li>
                <li>• Access is limited to authorized verification personnel only</li>
                <li>• Documents are automatically deleted after verification</li>
                <li>• We never store complete Aadhaar numbers</li>
                <li>• Compliance with UIDAI guidelines and data protection laws</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing</h2>
        
        <div className="space-y-4 mb-6">
          <div className="border-l-4 border-indigo-500 pl-4">
            <h4 className="font-semibold text-gray-900">We Share Public Information With:</h4>
            <p className="text-gray-700">Search engines, partner platforms, and verified businesses to increase review visibility and platform trust.</p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-semibold text-gray-900">We Never Share:</h4>
            <p className="text-gray-700">Aadhaar information, private verification documents, or personal contact details without explicit consent.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Eye className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Access</h4>
            <p className="text-sm text-gray-600">View all data we have about you</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Correct</h4>
            <p className="text-sm text-gray-600">Update or fix your information</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Shield className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Delete</h4>
            <p className="text-sm text-gray-600">Remove your data from our platform</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
        
        <div className="bg-indigo-50 p-6 rounded-lg">
          <p className="text-gray-700 mb-4">
            For privacy concerns or to exercise your rights, contact our Data Protection Officer:
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> privacy@reviewspot.com</p>
            <p><strong>Address:</strong> Review Spot Privacy Team, [Your Address]</p>
            <p><strong>Response Time:</strong> Within 30 days of your request</p>
          </div>
        </div>
      </div>
    </div>
  );

  const TermsOfService = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-lg opacity-90">
          Effective Date: January 1, 2025 | Version 1.0
        </p>
        <p className="mt-4 text-green-100">
          These terms govern your use of Review Spot's verification-focused review platform. By using our service, you agree to these terms.
        </p>
      </div>

      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. About Review Spot</h2>
        
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <p className="text-gray-700">
            Review Spot is a verification-focused review aggregator platform that eliminates fake reviews through Aadhaar-based user verification and proof-of-experience validation. We create a trustworthy ecosystem for authentic reviews across educational institutions, businesses, and services.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Eligibility</h2>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-start">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900">You can use Review Spot if you:</h4>
              <ul className="mt-2 space-y-1 text-gray-700">
                <li>• Are at least 18 years old</li>
                <li>• Have a valid Aadhaar card for verification</li>
                <li>• Provide accurate information during registration</li>
                <li>• Agree to follow our guidelines and terms</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Responsibilities</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">You Must:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Keep your login credentials secure</li>
              <li>• Provide accurate verification documents</li>
              <li>• Update your information when it changes</li>
              <li>• Use only one account per person</li>
            </ul>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">You Must Not:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Share your account with others</li>
              <li>• Create fake or duplicate accounts</li>
              <li>• Submit fraudulent documents</li>
              <li>• Attempt to bypass verification</li>
            </ul>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Review Standards</h2>
        
        <div className="space-y-4 mb-6">
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-gray-900">Authentic Reviews</h4>
            <p className="text-gray-700">All reviews must be based on genuine experiences. We verify educational and employment claims through documentation.</p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold text-gray-900">Verification Requirements</h4>
            <p className="text-gray-700">Reviews may require proof of experience such as certificates, employment letters, or transaction records.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Business Services</h2>
        
        <div className="bg-purple-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Subscription Plans</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold text-purple-800">Basic Plan - ₹2,999/month</h4>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>• Business dashboard access</li>
                <li>• Review monitoring</li>
                <li>• Basic analytics</li>
                <li>• Public response capability</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold text-purple-800">Premium Plan - ₹4,999/month</h4>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>• All Basic features</li>
                <li>• Advanced analytics</li>
                <li>• Priority support</li>
                <li>• "Trusted by Review Spot" badge</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Activities</h2>
        
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-red-800 mb-3">Strictly Prohibited:</h3>
          <ul className="space-y-2 text-red-700">
            <li>• Posting fake or fraudulent reviews</li>
            <li>• Offering incentives for reviews</li>
            <li>• Harassment or discriminatory content</li>
            <li>• Attempting to manipulate ratings</li>
            <li>• Violating others' privacy</li>
            <li>• Illegal activities or content</li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Dispute Resolution</h2>
        
        <div className="space-y-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Resolution Process</h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Contact our support team via email</li>
              <li>2. Provide relevant documentation</li>
              <li>3. Our team will investigate within 7 business days</li>
              <li>4. Resolution or escalation to legal assistance</li>
            </ol>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
        
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <p className="text-gray-700">
            Review Spot provides a platform for authentic reviews but does not guarantee the accuracy of all user-generated content. Our liability is limited to the amount paid for our services. We are not responsible for decisions made based on reviews on our platform.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
        
        <div className="bg-indigo-50 p-6 rounded-lg">
          <p className="text-gray-700">
            We may update these terms periodically. Significant changes will be communicated via email and platform notifications. Continued use of our service after changes constitutes acceptance of new terms.
          </p>
        </div>
      </div>
    </div>
  );

  const ReviewerGuidelines = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Guidelines for Reviewers</h1>
        <p className="text-lg opacity-90">
          January 2025
        </p>
        <p className="mt-4 text-orange-100">
          Review Spot is here to help you make informed decisions through authentic, verified reviews. Follow these guidelines to help us maintain a trustworthy platform for everyone.
        </p>
      </div>

      <div className="prose max-w-none">
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2" />
            You Can Write a Review If:
          </h2>
          <ul className="space-y-2 text-green-700">
            <li>• You've had a genuine, recent experience (within 12 months)</li>
            <li>• You can provide verification of your experience</li>
            <li>• You're sharing your authentic opinion</li>
            <li>• You have relevant documentation (certificates, receipts, etc.)</li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Verification Requirements</h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Verified Graduate</h4>
            <p className="text-sm text-blue-700">Educational certificates, transcripts, or degree documents</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Verified Employee</h4>
            <p className="text-sm text-purple-700">Employment letter, salary slip, or offer letter</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Verified User</h4>
            <p className="text-sm text-green-700">Transaction receipts, booking confirmations, or service records</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. What Makes a Great Review</h2>
        
        <div className="space-y-4 mb-6">
          <div className="border-l-4 border-indigo-500 pl-4">
            <h4 className="font-semibold text-gray-900">Be Specific and Detailed</h4>
            <p className="text-gray-700">Describe your actual experience, what you liked or disliked, and why.</p>
          </div>
          <div className="border-l-4 border-indigo-500 pl-4">
            <h4 className="font-semibold text-gray-900">Stay Factual</h4>
            <p className="text-gray-700">Share what happened rather than making broad generalizations.</p>
          </div>
          <div className="border-l-4 border-indigo-500 pl-4">
            <h4 className="font-semibold text-gray-900">Be Helpful</h4>
            <p className="text-gray-700">Help others make informed decisions by sharing relevant details.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Review Standards</h2>
        
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Prohibited Content
          </h3>
          <ul className="space-y-2 text-red-700">
            <li>• Fake or fraudulent reviews</li>
            <li>• Reviews written for incentives or rewards</li>
            <li>• Hate speech, discrimination, or harassment</li>
            <li>• Personal attacks or defamatory statements</li>
            <li>• Reviews about competitors (if you work for one)</li>
            <li>• Spam, promotional content, or irrelevant information</li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Verification Process</h2>
        
        <div className="space-y-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Step 1: Submit Your Review</h4>
            <p className="text-sm text-yellow-700">Write your review and select the appropriate verification type.</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Step 2: Upload Documentation</h4>
            <p className="text-sm text-yellow-700">Provide supporting documents to verify your experience.</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Step 3: Review Verification</h4>
            <p className="text-sm text-yellow-700">Our team will verify your documents within 2-3 business days.</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Step 4: Badge Assignment</h4>
            <p className="text-sm text-yellow-700">Your review will display the appropriate verification badge.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Responsibilities</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Do:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Keep documentation handy for verification</li>
              <li>• Update reviews if your experience changes</li>
              <li>• Respect others' privacy and opinions</li>
              <li>• Report suspicious or fake reviews</li>
              <li>• Use respectful language</li>
            </ul>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Don't:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Share personal information of others</li>
              <li>• Write reviews for businesses you haven't used</li>
              <li>• Accept payment for reviews</li>
              <li>• Post the same review multiple times</li>
              <li>• Use offensive or discriminatory language</li>
            </ul>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Community Standards</h2>
        
        <div className="bg-indigo-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Building Trust Together</h3>
          <p className="text-gray-700 mb-4">
            Review Spot is a community platform where trust is built through authentic experiences. Help us maintain this trust by:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• Being honest and transparent in your reviews</li>
            <li>• Providing constructive feedback that helps others</li>
            <li>• Respecting different perspectives and experiences</li>
            <li>• Reporting violations when you see them</li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Consequences of Violations</h2>
        
        <div className="space-y-4 mb-6">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">First Violation</h4>
            <p className="text-sm text-orange-700">Warning and opportunity to correct the review</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Serious Violations</h4>
            <p className="text-sm text-red-700">Review removal, account suspension, or permanent ban</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Getting Help</h2>
        
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="text-gray-700 mb-4">
            Have questions about our guidelines or need help with verification?
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Support Email:</strong> support@reviewspot.com</p>
            <p><strong>Guidelines Questions:</strong> guidelines@reviewspot.com</p>
            <p><strong>Verification Help:</strong> verify@reviewspot.com</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsOfService />;
      case 'guidelines':
        return <ReviewerGuidelines />;
      default:
        return <PrivacyPolicy />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-600 text-white p-2 rounded-lg mr-3">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Review Spot Legal</h1>
              <p className="text-gray-600">Transparency and trust through clear policies</p>
            </div>
          </div>
        </div>
        
        <Navigation />
        {renderContent()}
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-500">
            <p className="mb-2">© 2025 Review Spot. All rights reserved.</p>
            <p className="text-sm">
              Questions? Contact us at <a href="mailto:legal@reviewspot.com" className="text-indigo-600 hover:underline">legal@reviewspot.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
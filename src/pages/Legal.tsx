import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Shield, Users, FileText, Eye, Lock, AlertCircle, CheckCircle, Search, Filter } from 'lucide-react';

const Legal = () => {
  const [activeTab, setActiveTab] = useState('privacy');

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Lock, color: 'bg-blue-500' },
    { id: 'terms', label: 'Terms of Service', icon: FileText, color: 'bg-green-500' },
    { id: 'guidelines', label: 'Reviewer Guidelines', icon: Users, color: 'bg-purple-500' }
  ];

  const PrivacyPolicy = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Lock className="w-6 h-6 mr-3 text-blue-600" />
            Privacy Policy
          </CardTitle>
          <CardDescription>
            Effective Date: January 1, 2025 | Version 1.0
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            At Review Spot, your privacy is our priority. This policy explains how we collect, use, and protect your personal information on our verification-focused review platform.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Eye className="w-5 h-5 mr-2 text-blue-600" />
              Public Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700">
              <li>• Your username and profile information you choose to display</li>
              <li>• Reviews and ratings you submit</li>
              <li>• Verification badges (Verified Graduate, Verified Employee, etc.)</li>
              <li>• Your interactions with reviews (upvotes, downvotes, comments)</li>
              <li>• Institution or business information you've reviewed</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Lock className="w-5 h-5 mr-2 text-amber-600" />
              Private Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700">
              <li>• Aadhaar verification documents (encrypted and securely stored)</li>
              <li>• Email address and contact information</li>
              <li>• Educational/employment verification documents</li>
              <li>• IP address and device information</li>
              <li>• Usage patterns and platform interactions</li>
              <li>• Payment information for business subscriptions</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-800">Platform Operations</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Verify user authenticity</li>
                <li>• Display verified reviews</li>
                <li>• Prevent fraud and fake reviews</li>
                <li>• Improve platform security</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-800">User Experience</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Personalize your experience</li>
                <li>• Send important notifications</li>
                <li>• Provide customer support</li>
                <li>• Process dispute resolutions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-800">
            <AlertCircle className="w-6 h-6 mr-2" />
            Special Protection for Aadhaar Data
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Sharing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900">We Share Public Information With:</h4>
              <p className="text-gray-700">Search engines, partner platforms, and verified businesses to increase review visibility and platform trust.</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-gray-900">We Never Share:</h4>
              <p className="text-gray-700">Aadhaar information, private verification documents, or personal contact details without explicit consent.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Rights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Eye className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Access</h4>
              <p className="text-sm text-gray-600">View all data we have about you</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Correct</h4>
              <p className="text-sm text-gray-600">Update or fix your information</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Shield className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Delete</h4>
              <p className="text-sm text-gray-600">Remove your data from our platform</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            For privacy concerns or to exercise your rights, contact our Data Protection Officer:
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> privacy@reviewspot.com</p>
            <p><strong>Address:</strong> Review Spot Privacy Team, [Your Address]</p>
            <p><strong>Response Time:</strong> Within 30 days of your request</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const TermsOfService = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <FileText className="w-6 h-6 mr-3 text-green-600" />
            Terms of Service
          </CardTitle>
          <CardDescription>
            Effective Date: January 1, 2025 | Version 1.0
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            These terms govern your use of Review Spot's verification-focused review platform. By using our service, you agree to these terms.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Review Spot</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Review Spot is a verification-focused review aggregator platform that eliminates fake reviews through Aadhaar-based user verification and proof-of-experience validation. We create a trustworthy ecosystem for authentic reviews across educational institutions, businesses, and services.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Eligibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">You can use Review Spot if you:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Are at least 18 years old</li>
                <li>• Have a valid Aadhaar card for verification</li>
                <li>• Provide accurate information during registration</li>
                <li>• Agree to follow our guidelines and terms</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Responsibilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-800 mb-3">You Must:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Keep your login credentials secure</li>
                <li>• Provide accurate verification documents</li>
                <li>• Update your information when it changes</li>
                <li>• Use only one account per person</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-800 mb-3">You Must Not:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Share your account with others</li>
                <li>• Create fake or duplicate accounts</li>
                <li>• Submit fraudulent documents</li>
                <li>• Attempt to bypass verification</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review Standards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900">Authentic Reviews</h4>
              <p className="text-gray-700">All reviews must be based on genuine experiences. We verify educational and employment claims through documentation.</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Verification Requirements</h4>
              <p className="text-gray-700">Reviews may require proof of experience such as certificates, employment letters, or transaction records.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-purple-800">Basic Plan - ₹2,999/month</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Business dashboard access</li>
                  <li>• Review monitoring</li>
                  <li>• Basic analytics</li>
                  <li>• Public response capability</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-purple-800">Premium Plan - ₹4,999/month</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• All Basic features</li>
                  <li>• Advanced analytics</li>
                  <li>• Priority support</li>
                  <li>• "Trusted by Review Spot" badge</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-800">Prohibited Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold text-red-800 mb-3">Strictly Prohibited:</h4>
          <ul className="space-y-2 text-red-700">
            <li>• Posting fake or fraudulent reviews</li>
            <li>• Offering incentives for reviews</li>
            <li>• Harassment or discriminatory content</li>
            <li>• Attempting to manipulate ratings</li>
            <li>• Violating others' privacy</li>
            <li>• Illegal activities or content</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dispute Resolution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Resolution Process</h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Contact our support team via email</li>
              <li>2. Provide relevant documentation</li>
              <li>3. Our team will investigate within 7 business days</li>
              <li>4. Resolution or escalation to legal assistance</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            We may update these terms periodically. Significant changes will be communicated via email and platform notifications. Continued use of our service after changes constitutes acceptance of new terms.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const ReviewerGuidelines = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Users className="w-6 h-6 mr-3 text-purple-600" />
            Guidelines for Reviewers
          </CardTitle>
          <CardDescription>
            January 2025
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Review Spot is here to help you make informed decisions through authentic, verified reviews. Follow these guidelines to help us maintain a trustworthy platform for everyone.
          </p>
        </CardContent>
      </Card>

      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2" />
            You Can Write a Review If:
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-green-700">
            <li>• You've had a genuine, recent experience (within 12 months)</li>
            <li>• You can provide verification of your experience</li>
            <li>• You're sharing your authentic opinion</li>
            <li>• You have relevant documentation (certificates, receipts, etc.)</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Badge className="mb-2 bg-blue-100 text-blue-800">Verified Graduate</Badge>
              <p className="text-sm text-blue-700">Educational certificates, transcripts, or degree documents</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Badge className="mb-2 bg-purple-100 text-purple-800">Verified Employee</Badge>
              <p className="text-sm text-purple-700">Employment letter, salary slip, or offer letter</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Badge className="mb-2 bg-green-100 text-green-800">Verified User</Badge>
              <p className="text-sm text-green-700">Transaction receipts, booking confirmations, or service records</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What Makes a Great Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Prohibited Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-red-700">
            <li>• Fake or fraudulent reviews</li>
            <li>• Reviews written for incentives or rewards</li>
            <li>• Hate speech, discrimination, or harassment</li>
            <li>• Personal attacks or defamatory statements</li>
            <li>• Reviews about competitors (if you work for one)</li>
            <li>• Spam, promotional content, or irrelevant information</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Step 1: Submit Your Review</h4>
                <p className="text-sm text-yellow-700">Write your review and select the appropriate verification type.</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Step 2: Upload Documentation</h4>
                <p className="text-sm text-yellow-700">Provide supporting documents to verify your experience.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Step 3: Review Verification</h4>
                <p className="text-sm text-yellow-700">Our team will verify your documents within 2-3 business days.</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Step 4: Badge Assignment</h4>
                <p className="text-sm text-yellow-700">Your review will display the appropriate verification badge.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Responsibilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-800 mb-3">Do:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Keep documentation handy for verification</li>
                <li>• Update reviews if your experience changes</li>
                <li>• Respect others' privacy and opinions</li>
                <li>• Report suspicious or fake reviews</li>
                <li>• Use respectful language</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-800 mb-3">Don't:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Share personal information of others</li>
                <li>• Write reviews for businesses you haven't used</li>
                <li>• Accept payment for reviews</li>
                <li>• Post the same review multiple times</li>
                <li>• Use offensive or discriminatory language</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consequences of Violations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">First Violation</h4>
              <p className="text-sm text-orange-700">Warning and opportunity to correct the review</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Serious Violations</h4>
              <p className="text-sm text-red-700">Review removal, account suspension, or permanent ban</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>Getting Help</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            Have questions about our guidelines or need help with verification?
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Support Email:</strong> support@reviewspot.com</p>
            <p><strong>Guidelines Questions:</strong> guidelines@reviewspot.com</p>
            <p><strong>Verification Help:</strong> verify@reviewspot.com</p>
          </div>
        </CardContent>
      </Card>
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
      <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-80 flex-shrink-0">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Shield className="h-5 w-5 text-gray-500 mr-2" />
                  Legal Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-none transition-colors ${
                          activeTab === tab.id
                            ? 'bg-gray-100 text-gray-900 border-r-2 border-blue-500'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        <span className="font-medium">{tab.label}</span>
                        <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                          activeTab === tab.id ? 'rotate-90' : ''
                        }`} />
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Stats in Sidebar */}
            <div className="mt-6 space-y-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold text-blue-600">Jan 2025</div>
                  <div className="text-xs text-gray-600">Last Updated</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold text-green-600">v1.0</div>
                  <div className="text-xs text-gray-600">Current Version</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold text-purple-600">3</div>
                  <div className="text-xs text-gray-600">Documents</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>


        </div>
     
    

        
  );
};

export default Legal;
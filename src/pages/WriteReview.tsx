
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Upload, Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const WriteReview = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [verificationLevel, setVerificationLevel] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  const verificationOptions = [
    { value: 'verified-graduate', label: 'Verified Graduate', description: 'I am a graduate/student of this institution' },
    { value: 'verified-employee', label: 'Verified Employee', description: 'I am/was an employee of this organization' },
    { value: 'verified-user', label: 'Verified User', description: 'I have used their services' },
    { value: 'unverified', label: 'Unverified', description: 'I prefer not to verify my connection' }
  ];

  const handleRating = (value: number) => {
    setRating(value);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProofFile(file);
    }
  };

  const handleSubmit = () => {
    if (!businessName || !rating || !reviewText.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    console.log('Review submission:', {
      businessName,
      rating,
      reviewText,
      verificationLevel,
      proofFile
    });
    
    alert('Review submitted for verification! You will receive an email confirmation shortly.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-blue-600">Review Spot</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">Back to Search</Button>
              <Button variant="ghost">Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Write a Review</h1>
          <p className="text-lg text-gray-600">
            Share your honest experience to help others make informed decisions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Review Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Business Search */}
                <div>
                  <Label htmlFor="business-name">Business/Institution Name *</Label>
                  <Input
                    id="business-name"
                    placeholder="Search or enter the name of the business..."
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Can't find your business? <Button variant="link" className="p-0 h-auto">Request to add it</Button>
                  </p>
                </div>

                {/* Rating */}
                <div>
                  <Label>Overall Rating *</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={`h-8 w-8 cursor-pointer transition-colors ${
                          value <= (hoverRating || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleRating(value)}
                      />
                    ))}
                    <span className="ml-2 text-lg font-semibold">
                      {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>

                {/* Verification Level */}
                <div>
                  <Label>Your Connection to This Business</Label>
                  <Select value={verificationLevel} onValueChange={setVerificationLevel}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="How are you connected to this business?" />
                    </SelectTrigger>
                    <SelectContent>
                      {verificationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Proof Upload */}
                {verificationLevel && verificationLevel !== 'unverified' && (
                  <div>
                    <Label htmlFor="proof-upload">Proof of Connection (Optional)</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">
                        <label htmlFor="proof-upload" className="cursor-pointer text-blue-600 hover:text-blue-500">
                          Upload a file
                        </label>
                        <span> or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ID card, certificate, email confirmation, etc. (PDF, JPG, PNG up to 10MB)
                      </p>
                      <input
                        id="proof-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                      />
                    </div>
                    {proofFile && (
                      <div className="mt-2 text-sm text-green-600">
                        ✓ {proofFile.name} uploaded
                      </div>
                    )}
                  </div>
                )}

                {/* Review Text */}
                <div>
                  <Label htmlFor="review-text">Your Review *</Label>
                  <Textarea
                    id="review-text"
                    placeholder="Share your honest experience... What went well? What could be improved? Be specific and helpful for other users."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="mt-1 min-h-[120px]"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    {reviewText.length}/1000 characters
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button onClick={handleSubmit} size="lg" className="w-full">
                    Submit Review for Verification
                  </Button>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Your review will be verified before publication
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Verification Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    Verification Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium">Identity Verification</div>
                        <div className="text-gray-600">Aadhaar-based verification for all users</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium">Proof Verification</div>
                        <div className="text-gray-600">Manual verification of uploaded documents</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium">Content Review</div>
                        <div className="text-gray-600">Review content checked for authenticity</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle>Review Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Be honest and specific about your experience</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Focus on the service quality and value</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Provide constructive feedback</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-600">✗</span>
                      <span>No personal attacks or inappropriate language</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-600">✗</span>
                      <span>No fake or misleading information</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Legal Notice */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  By submitting this review, you agree to our Terms of Service and confirm that your review is based on genuine experience.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteReview;

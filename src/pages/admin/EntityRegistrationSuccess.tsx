
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Mail, Home } from "lucide-react";
import { Link } from "react-router-dom";

const EntityRegistrationSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registration Submitted Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for registering your entity with Verifyd Trust.
          </p>
        </div>

        {/* Main Success Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <span>What's Next?</span>
            </CardTitle>
            <CardDescription>
              Your registration is now under review. Here's what you can expect:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timeline Steps */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">Review Process</h3>
                  <p className="text-sm text-gray-600">
                    Our team will verify your entity information and documentation within 2-3 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                    <span className="text-sm font-medium text-blue-600">2</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">Email Notification</h3>
                  <p className="text-sm text-gray-600">
                    You'll receive an email notification once your registration has been reviewed.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                    <span className="text-sm font-medium text-green-600">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">Go Live</h3>
                  <p className="text-sm text-gray-600">
                    Once approved, your entity will be listed in our directory and you can start receiving reviews.
                  </p>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Review Timeline</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Most registrations are processed within 2-3 business days. Complex cases may take longer.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600">
                If you have any questions about your registration, please contact our support team at{" "}
                <a href="mailto:verifydtrust@gmail.com" className="text-blue-600 hover:text-blue-700">
                  verifydtrust@gmail.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Return to Home</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link to="/entities">Browse Directory</Link>
          </Button>
        </div>

        {/* Additional Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">While You Wait</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Prepare for Launch</h4>
                <p className="text-sm text-gray-600">
                  Start thinking about how you'll encourage customers to leave reviews once your entity is approved.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Learn More</h4>
                <p className="text-sm text-gray-600">
                  Explore our platform features and see how other businesses are using Verifyd Trust to build trust.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EntityRegistrationSuccess;

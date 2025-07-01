import React from "react";
import ScrollingReviews from "@/components/ScrollingReviews";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TestScrollPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ScrollingReviews Component Test Page
          </h1>
          <p className="text-lg text-gray-600">
            Test page to showcase the ScrollingReviews component functionality
          </p>
        </div>

        <div className="space-y-8">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Component Information</CardTitle>
              <CardDescription>
                This page displays the ScrollingReviews component which shows a
                continuous scroll of reviews from the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Component:</strong> ScrollingReviews
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  /src/components/ScrollingReviews.tsx
                </p>
                <p>
                  <strong>Purpose:</strong> Display reviews in a scrolling
                  format for the homepage or landing pages
                </p>
                <p>
                  <strong>Features:</strong> Auto-scrolling, responsive design,
                  review cards with ratings and badges
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ScrollingReviews Component */}
          <Card>
            <CardHeader>
              <CardTitle>Live Component Demo</CardTitle>
              <CardDescription>
                The ScrollingReviews component rendered below with live data
                from the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollingReviews />
            </CardContent>
          </Card>

          {/* Usage Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Instructions</CardTitle>
              <CardDescription>
                How to use and customize this component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Basic Usage:
                  </h4>
                  <code className="bg-gray-100 p-2 rounded text-sm block">
                    {`import ScrollingReviews from '@/components/ScrollingReviews'; <ScrollingReviews />`}
                  </code>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Features:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>
                      Automatically fetches and displays reviews from the
                      platform
                    </li>
                    <li>Responsive design that works on all screen sizes</li>
                    <li>Auto-scrolling animation with smooth transitions</li>
                    <li>Displays user ratings, badges, and review content</li>
                    <li>Shows business information and verification status</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Customization:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>Component automatically adapts to available data</li>
                    <li>
                      Styling can be customized through Tailwind CSS classes
                    </li>
                    <li>
                      Animation speed and behavior can be modified in the
                      component
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestScrollPage;

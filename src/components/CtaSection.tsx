
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

// This component renders a Call to Action section encouraging users to write reviews, browse entities, or register their own entity.
// It includes a title, description, and three buttons with different actions.

const CTASection = () => {
  const { user } = useAuth();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Share Your Experience?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join thousands of verified users making the review ecosystem more
          trustworthy
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Button size="lg" variant="secondary" asChild>
              <Link to="/write-review">Write a Review</Link>
            </Button>
          ) : (
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
            asChild
          >
            <Link to="/businesses">Browse All Entities</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
          >
            Register Your Entity
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

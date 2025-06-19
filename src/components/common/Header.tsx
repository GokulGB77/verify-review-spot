
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Review Spot
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/businesses" className="text-gray-700 hover:text-blue-600">
              Browse Entities
            </Link>
            <Link to="/reviews" className="text-gray-700 hover:text-blue-600">
              Reviews
            </Link>
            {user && (
              <Link to="/my-reviews" className="text-gray-700 hover:text-blue-600">
                My Reviews
              </Link>
            )}
          </nav>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/write-review">Write Review</Link>
                </Button>
                <Button variant="ghost" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

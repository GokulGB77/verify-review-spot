import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
            <Link to="/">
          <div className="flex items-center space-x-2">
              
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                Review Spot
              </span>
          </div>
            </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">For Entities</Button>
            <Button variant="ghost" asChild>
              <Link to="/reviews">Review Feed</Link>
            </Button>
            <Button variant="ghost">Sign In</Button>
            <Button>Get Started</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

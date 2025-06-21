import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-6 w-6" />
            <span className="text-xl font-bold">Review Spot</span>
          </div>
          <p className="text-gray-400">
            Building trust through verified, authentic reviews
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-4">For Users</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link to="/search" className="hover:text-white">
                Search Reviews
              </Link>
            </li>
            <li>
              <Link to="/write-review" className="hover:text-white">
                Write a Review
              </Link>
            </li>
            <li>
              <Link to="/verify" className="hover:text-white">
                Get Verified
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">For Entities</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link to="/business/register" className="hover:text-white">
                Register Entity
              </Link>
            </li>
            <li>
              <Link to="/business/dashboard" className="hover:text-white">
                Entity Dashboard
              </Link>
            </li>
            <li>
              <Link to="/business/pricing" className="hover:text-white">
                Pricing
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link to="/help" className="hover:text-white">
                Help Center
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/legal" className="hover:text-white">
                Legal Assistance
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm px-4">
        <p className="mb-2">&copy; 2024 Review Spot. All rights reserved.</p>
        <p>
          <Link
            to="/legal"
            className="hover:text-white transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <span className="mx-2">|</span>
          <Link
            to="/terms-of-service"
            className="hover:text-white transition-colors duration-200"
          >
            Terms of Service
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { contactInfo } from "@/components/common/CompanyDatas";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <img src="/logo.svg" alt="Verifyd Trust Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">Verifyd Trust</span>
          </div>
          <p className="text-gray-400">
            Building trust through verified, authentic reviews
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-4">For Users</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link to="/businesses" className="hover:text-white">
                Browse Entities
              </Link>
            </li>
            {/* <li>
              <Link to="/reviews" className="hover:text-white">
                Explore Reviews
              </Link>
            </li> */}
            <li>
              <Link to="/write-review" className="hover:text-white">
                Write a Review
              </Link>
            </li>
            <li>
              <Link to="/profile/verification" className="hover:text-white">
                Get Verified
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">For Entities</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link to="/register-entity" className="hover:text-white">
                Register Entity
              </Link>
            </li>
            {/* <li>
              <Link to="/business/dashboard" className="hover:text-white">
                Entity Dashboard
              </Link>
            </li> */}
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
              <Link to="/about" className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-white">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/report-problem" className="hover:text-white">
                Report a Problem
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm px-4">
        <p className="mb-2">&copy; 2025 Verifyd Trust. All rights reserved.</p>
        <p>
          <Link
            to="/legal?tab=privacy"
            className="hover:text-white transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <span className="mx-2">|</span>
          <Link
            to="/legal?tab=terms"
            className="hover:text-white transition-colors duration-200"
          >
            Terms of Service
          </Link>
          <span className="mx-2">|</span>
          <Link
            to="/legal?tab=guidelines"
            className="hover:text-white transition-colors duration-200"
          >
            Reviewer Guidelines
          </Link>
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Questions? Contact us at{" "}
          <a
            href={`mailto:${contactInfo.email}`}
            className="text-blue-400 hover:text-blue-300"
          >
            {contactInfo.email}
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

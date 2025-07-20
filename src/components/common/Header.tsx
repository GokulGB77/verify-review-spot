import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { useUnreadNotificationsCount } from "@/hooks/useNotifications";

const Header = () => {
  const { user, signOut, loading } = useAuth();
  const { isSuperAdmin, isEntityAdmin, roles } = useUserRoles();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name?: string | null } | null>(
    null
  );

  // Fetch user profile when user changes
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      // Clear profile when user signs out
      setProfile(null);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("Header: Starting sign out process");
      await signOut();
      console.log("Header: Sign out completed, navigating to home");
      navigate("/");
    } catch (error) {
      console.error("Header: Sign out error:", error);
    }
  };

  // Extract first name from full name, or use fallback
  const getFirstName = () => {
    if (profile?.full_name) {
      // Split by space and get the first part as the first name
      return profile.full_name.split(" ")[0];
    }
    // Fallback to username from email or generic "Account"
    return "Account";
  };

  const firstName = getFirstName();

  // Show loading state while auth is loading
  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                Verifyd Trust
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link
                to="/businesses"
                className="text-gray-700 hover:text-blue-600"
              >
                Browse Entities
              </Link>
              {/* <Link to="/reviews" className="text-gray-700 hover:text-blue-600">
                Reviews
              </Link> */}
            </nav>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-10 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Link
              to="/"
              className="flex items-center space-x-2 text-2xl font-bold text-blue-600"
            >
              <img
                src="/logo.svg"
                alt="Verifyd Trust Logo"
                className="h-8 w-8"
              />
              <span className="whitespace-nowrap">Verifyd Trust</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link
              to="/businesses"
              className="text-gray-700 hover:text-blue-600"
            >
              Browse Entities
            </Link>
            {/* <Link to="/reviews" className="text-gray-700 hover:text-blue-600">
              Reviews
            </Link> */}
          </nav>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link to="/write-review">Write A Review</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
                    >
                      <UserCircle className="h-4 w-4" />
                      <span className="hidden sm:inline max-w-[80px] truncate">
                        {firstName}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link
                        to="/my-reviews"
                        className="w-full cursor-pointer hover:text-blue-600"
                      >
                        My Reviews
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="w-full cursor-pointer hover:text-blue-600"
                      >
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <div>
                        {user && isEntityAdmin() && (
                          <>
                            {roles
                              .filter(
                                (role) =>
                                  role.role === "entity_admin" && role.entity_id
                              )
                              .map((role) => (
                                <Link
                                  key={role.entity_id}
                                  to={`/entity-dashboard/${role.entity_id}`}
                                  className="w-full cursor-pointer hover:text-blue-600"
                                >
                                  Admin Dashboard
                                </Link>
                              ))}
                          </>
                        )}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      {user && isSuperAdmin() && (
                        <Link
                          to="/admin"
                          className="w-full cursor-pointer hover:text-blue-600"
                        >
                          Super Admin Dashboard
                        </Link>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer hover:text-blue-600"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                                <NotificationDropdown unreadCount={unreadCount} />

              </>
            ) : (
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

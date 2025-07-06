import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useEntities } from "@/hooks/useEntities";
import { useReviews } from "@/hooks/useReviews";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Building2,
  MessageSquare,
  TrendingUp,
  Shield,
  FileCheck,
  UserCheck,
  BarChart3,
  ClipboardList,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";
import EntityManagementSection from "@/components/super_admin/EntityManagementSection";
import UserManagementSection from "@/components/super_admin/UserManagementSection";
import RoleManagement from "@/components/super_admin/RoleManagement";
import VerificationManagement from "@/components/super_admin/VerificationManagement";
import EntityRegistrationManagement from "@/components/super_admin/EntityRegistrationManagement";
import EntityCreateForm from "@/components/super_admin/EntityCreateForm";
import EntityBulkUpload from "@/components/super_admin/EntityBulkUpload";
import EntityAdditionRequestsManagement from "@/components/super_admin/EntityAdditionRequestsManagement";
import ReviewVerificationManagement from "@/components/super_admin/ReviewVerificationManagement";
import AnalyticsSection from "@/components/super_admin/AnalyticsSection";
import ReviewManagementSection from "@/components/super_admin/ReviewManagementSection"; 

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { isSuperAdmin, loading: rolesLoading } = useUserRoles();
  const { data: entities, isLoading: entitiesLoading } = useEntities();
  const { data: reviews, isLoading: reviewsLoading } = useReviews();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] = useState("businesses");

  if (rolesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isSuperAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // filteredEntities logic has been moved to EntityManagementSection
  // const filteredEntities = entities?.filter(entity => { ... });

  const stats = {
    totalBusinesses: entities?.length || 0,
    totalReviews: reviews?.filter((r) => !r.is_update).length || 0,
    verifiedBusinesses: entities?.filter((e) => e.is_verified).length || 0,
    activeBusinesses:
      entities?.filter((e) => (e.status || "active") === "active").length || 0,
    averageRating:
      entities?.reduce((acc, e) => acc + (e.average_rating || 0), 0) /
        (entities?.length || 1) || 0,
  };

  // Menu items for the sidebar
  const menuItems = [
    {
      title: "Users",
      icon: Users,
      value: "users",
    },
    {
      title: "Entities",
      icon: Building2,
      value: "businesses",
    },
    {
      title: "Create Entity",
      icon: Building2,
      value: "create-entity",
    },
    {
      title: "Bulk Upload",
      icon: Upload,
      value: "bulk-upload",
    },
    {
      title: "Reviews",
      icon: MessageSquare,
      value: "reviews",
    },
    {
      title: "Entity Registrations",
      icon: ClipboardList,
      value: "entity-registrations",
    },
    {
      title: "Entity Addition Requests",
      icon: Users,
      value: "entity-addition-requests",
    },
    {
      title: "Review Verification",
      icon: FileCheck,
      value: "review-verification",
    },
    {
      title: "Verification",
      icon: UserCheck,
      value: "verification",
    },
    {
      title: "Role Management",
      icon: Shield,
      value: "roles",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      value: "analytics",
    },
  ];

  // handleViewDialogClose and handleEditSuccess have been moved to EntityManagementSection

  const renderContent = () => {
    switch (activeSection) {
      case "create-entity":
        return (
          <EntityCreateForm
            onCancel={() => setActiveSection("businesses")}
            onSuccess={() => setActiveSection("businesses")}
          />
        );

      case "bulk-upload":
        return <EntityBulkUpload />;

      case "businesses":
        return (
          <EntityManagementSection
            entities={entities}
            entitiesLoading={entitiesLoading}
          />
        );
      case "users":
        return (
          <UserManagementSection/>
        );

      case "reviews":
        return (
          <ReviewManagementSection
            reviews={reviews}
            reviewsLoading={reviewsLoading}
          />
        );

      case "entity-registrations":
        return <EntityRegistrationManagement />;

      case "entity-addition-requests":
        return <EntityAdditionRequestsManagement />;

      case "review-verification":
        return <ReviewVerificationManagement />;

      case "proof-verification":
        return <ReviewVerificationManagement />;

      case "verification":
        return <VerificationManagement />;

      case "roles":
        return <RoleManagement />;

      case "analytics":
        return (
          <AnalyticsSection
            stats={stats}
            entities={entities}
            reviews={reviews}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Admin Tools</h2>
        </div>
        <nav className="px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveSection(item.value)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.value
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Super Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage businesses, reviews, and platform analytics
            </p>
          </div>

          {/* Dynamic Content */}
          <div className="space-y-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

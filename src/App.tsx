
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Homepage from './pages/Homepage';
import HomepageV1 from './pages/Homepage1';
import HomepageMinimal from './components/homepage/minimal/HomepageMinimal';
import MyReviewsPage from './pages/user/MyReviews';
import EntitiesDirectory from './pages/EntitiesDirectory';
import EntityProfile from './pages/EntityProfile';
import WriteReview from './pages/user/WriteReview';
import Reviews from './pages/Reviews';
import Auth from './pages/Auth';
import ProfileSettings from './pages/user/ProfileSettings';
import EntityRegistration from './pages/admin/EntityRegistration';
import EntityRegistrationSuccess from './pages/admin/EntityRegistrationSuccess';
import SearchResults from './pages/SearchResults';
import SuperAdminDashboard from './pages/super_admin/SuperAdminDashboard';
import TestScrollPage from './test/TestScrollPage';
import NotFound from './pages/NotFound';
import ReportProblem from './pages/ReportProblem';
import BusinessDashboard from './pages/BusinessDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Toaster } from "@/components/ui/sonner"

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/v1" element={<HomepageV1 />} />
                <Route path="/minimal" element={<HomepageMinimal />} />
                <Route path="/entities" element={<EntitiesDirectory />} />
                <Route path="/entities/:id" element={<EntityProfile />} />
                <Route path="/write-review" element={<WriteReview />} />
                <Route path="/my-reviews" element={<MyReviewsPage />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/register-entity" element={<EntityRegistration />} />
                <Route path="/register-entity/success" element={<EntityRegistrationSuccess />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/report-problem" element={<ReportProblem />} />
                <Route path="/business-dashboard" element={<BusinessDashboard />} />
                <Route path="/test-scroll" element={<TestScrollPage />} />
                {/* Redirect old business routes to new entity routes */}
                <Route path="/businesses" element={<Navigate to="/entities" replace />} />
                <Route path="/business/:id" element={<Navigate to="/entities/:id" replace />} />
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <SuperAdminDashboard />
                    </AdminRoute>
                  }
                />
                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isSuperAdmin, loading: rolesLoading } = useUserRoles();

  if (loading || rolesLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !isSuperAdmin()) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default App;

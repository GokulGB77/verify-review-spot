
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Homepage from './pages/Homepage';
import EntitiesDirectory from './pages/EntitiesDirectory';
import EntityProfile from './pages/EntityProfile';
import WriteReview from './pages/WriteReview';
import Reviews from './pages/Reviews';
import Auth from './pages/Auth';
import ProfileSettings from './pages/ProfileSettings';
import EntityRegistration from './pages/EntityRegistration';
import EntityRegistrationSuccess from './pages/EntityRegistrationSuccess';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
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
                <Route path="/entities" element={<EntitiesDirectory />} />
                <Route path="/entities/:id" element={<EntityProfile />} />
                <Route path="/write-review" element={<WriteReview />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/register-entity" element={<EntityRegistration />} />
                <Route path="/register-entity/success" element={<EntityRegistrationSuccess />} />
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

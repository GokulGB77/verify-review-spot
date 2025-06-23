
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Homepage from './pages/Homepage';
import EntitiesDirectory from './pages/EntitiesDirectory';
import EntityProfile from './pages/EntityProfile';
import Auth from './pages/Auth';
import ProfileSettings from './pages/ProfileSettings';
import EntityRegistration from './pages/EntityRegistration';
import EntityRegistrationSuccess from './pages/EntityRegistrationSuccess';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
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
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/register-entity" element={<EntityRegistration />} />
                <Route path="/register-entity/success" element={<EntityRegistrationSuccess />} />
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
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        // Assuming you have a function to fetch user roles
        const roles = await getRolesForUser(user.id);
        setIsAdmin(roles.includes('super_admin'));
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAdmin === null) {
    return <div>Checking admin status...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

async function getRolesForUser(userId: string): Promise<string[]> {
  // Replace with your actual implementation to fetch user roles
  // This is just a placeholder
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate fetching roles from a database or API
      const roles = userId === 'someAdminUserId' ? ['super_admin'] : [];
      resolve(roles);
    }, 500);
  });
}

export default App;

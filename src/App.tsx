import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Entities from './pages/Entities';
import EntityDetails from './pages/EntityDetails';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import EntityRegistration from './pages/EntityRegistration';
import EntityRegistrationSuccess from './pages/EntityRegistrationSuccess';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';

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
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/entities" element={<Entities />} />
                <Route path="/entities/:id" element={<EntityDetails />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/register-entity" element={<EntityRegistration />} />
                <Route path="/register-entity/success" element={<EntityRegistrationSuccess />} />
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
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

import { Toaster } from "@/components/ui/sonner"

export default App;

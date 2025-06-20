
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Homepage from '@/pages/Homepage';
import Auth from '@/pages/Auth';
import EntitiesDirectory from '@/pages/EntitiesDirectory';
import EntityProfile from '@/pages/EntityProfile';
import WriteReview from '@/pages/WriteReview';
import Reviews from '@/pages/Reviews';
import MyReviews from '@/pages/MyReviews';
import SearchResults from '@/pages/SearchResults';
import EntityDashboard from '@/pages/EntityDashboard';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import ProfileSettings from '@/pages/ProfileSettings';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/businesses" element={<EntitiesDirectory />} />
                <Route path="/business/:id" element={<EntityProfile />} />
                <Route path="/write-review" element={<WriteReview />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/my-reviews" element={<MyReviews />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/dashboard" element={<EntityDashboard />} />
                <Route path="/admin" element={<SuperAdminDashboard />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

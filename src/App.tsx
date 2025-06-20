
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Homepage";
import Reviews from "./pages/Reviews";
import BusinessDirectory from "./pages/EntitiesDirectory";
import SearchResults from "./pages/SearchResults";
import BusinessProfile from "./pages/EntityProfile";
import WriteReview from "./pages/WriteReview";
import Auth from "./pages/Auth";
import MyReviewsPage from "./pages/MyReviews";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import EntityDashboard from "./pages/EntityDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/businesses" element={<BusinessDirectory />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/business/:id" element={<BusinessProfile />} />
            <Route path="/write-review" element={<WriteReview />} />
            <Route path="/business/:id/write-review" element={<WriteReview />} />
            <Route path="/my-reviews" element={<MyReviewsPage />} />
            <Route path="/admin" element={<SuperAdminDashboard />} />
            <Route path="/business/:id/dashboard" element={<EntityDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

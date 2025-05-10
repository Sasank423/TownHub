
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import MemberDashboard from "./pages/MemberDashboard";
import LibrarianDashboard from "./pages/LibrarianDashboard";
import Catalog from "./pages/Catalog";
import BookDetails from "./pages/BookDetails";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import ReservationWizard from "./pages/ReservationWizard";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ element, requiredRole }: { element: React.ReactNode, requiredRole?: 'member' | 'librarian' | 'admin' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    // You can add a loading spinner here if needed
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard if user doesn't have required role
    return <Navigate to={user.role === 'librarian' ? '/librarian' : '/member'} replace />;
  }
  
  return <>{element}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Member routes */}
              <Route path="/member" element={<ProtectedRoute element={<MemberDashboard />} requiredRole="member" />} />
              
              {/* Librarian routes */}
              <Route path="/librarian" element={<ProtectedRoute element={<LibrarianDashboard />} requiredRole="librarian" />} />
              
              {/* Book routes */}
              <Route path="/catalog" element={<ProtectedRoute element={<Catalog />} />} />
              <Route path="/books/:id" element={<ProtectedRoute element={<BookDetails />} />} />
              
              {/* Room routes */}
              <Route path="/rooms" element={<ProtectedRoute element={<Rooms />} />} />
              <Route path="/rooms/:id" element={<ProtectedRoute element={<RoomDetails />} />} />
              
              {/* Reservation routes */}
              <Route path="/reserve/:type/:id" element={<ProtectedRoute element={<ReservationWizard />} />} />
              
              {/* Analytics route */}
              <Route path="/analytics" element={<Navigate to="/member" />} />
              
              {/* Report issue route */}
              <Route path="/report-issue" element={<Navigate to="/member" />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

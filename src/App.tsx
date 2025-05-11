
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PreventFormSubmission } from "./components/PreventFormSubmission";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import MemberDashboard from './pages/MemberDashboard';
import PendingRequests from './pages/PendingRequests';
import LibrarianDashboard from './pages/LibrarianDashboard';
import Catalog from "./pages/Catalog";
import BookDetails from "./pages/BookDetails";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import ReservationWizard from "./pages/ReservationWizard";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ReportIssue from "./pages/ReportIssue";
import AddBooks from "./pages/AddBooks";
import RoomManagement from "./pages/RoomManagement";
import ActiveReservations from "./pages/ActiveReservations";

const queryClient = new QueryClient();

// Protected route component that must be used within App component after AuthProvider is mounted
const ProtectedRoute = ({ element, requiredRole }: { element: React.ReactNode, requiredRole?: 'member' | 'librarian' | 'admin' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Only redirect if the user's role doesn't match the required role
  if (requiredRole && user.role !== requiredRole) {
    // Determine the appropriate home path based on user role
    const userHomePath = user.role === 'librarian' ? '/librarian' : '/member';
    return <Navigate to={userHomePath} replace />;
  }
  
  return <>{element}</>;
};

const AppRoutes = () => {
  return (
    <PreventFormSubmission>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Member routes */}
        <Route path="/member" element={<ProtectedRoute element={<MemberDashboard />} requiredRole="member" />} />
        <Route path="/pending-requests" element={<ProtectedRoute element={<PendingRequests />} requiredRole="member" />} />
        <Route path="/active-reservations" element={<ProtectedRoute element={<ActiveReservations />} requiredRole="member" />} />
        
        {/* Librarian routes */}
        <Route path="/librarian" element={<ProtectedRoute element={<LibrarianDashboard />} requiredRole="librarian" />} />
        <Route path="/add-books" element={<ProtectedRoute element={<AddBooks />} requiredRole="librarian" />} />
        <Route path="/room-management" element={<ProtectedRoute element={<RoomManagement />} requiredRole="librarian" />} />
        
        {/* Book routes */}
        <Route path="/catalog" element={<ProtectedRoute element={<Catalog />} />} />
        <Route path="/books/:id" element={<ProtectedRoute element={<BookDetails />} />} />
        
        {/* Room routes */}
        <Route path="/rooms" element={<ProtectedRoute element={<Rooms />} />} />
        <Route path="/rooms/:id" element={<ProtectedRoute element={<RoomDetails />} />} />
        
        {/* Reservation routes */}
        <Route path="/reserve/:type/:id" element={<ProtectedRoute element={<ReservationWizard />} />} />
        
        
        {/* Profile route */}
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        
        {/* Report issue route */}
        <Route path="/report-issue" element={<ProtectedRoute element={<ReportIssue />} />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PreventFormSubmission>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

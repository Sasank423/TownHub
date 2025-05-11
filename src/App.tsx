
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
import MemberManagement from "./pages/MemberManagement";
import BookManagement from "./pages/BookManagement";
import ActivityLogs from './pages/ActivityLogs';
import UserHistory from './pages/UserHistory';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

// Protected route component that must be used within App component after AuthProvider is mounted
const ProtectedRoute = ({ element, requiredRole }: { element: React.ReactNode, requiredRole?: 'member' | 'librarian' | 'admin' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Only redirect if a specific role is required and user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    console.log(`User role (${user.role}) doesn't match required role (${requiredRole}), redirecting`);
    
    // Determine the appropriate home path based on user role
    const homePath = user.role === 'librarian' ? '/librarian' : '/member';
    return <Navigate to={homePath} replace />;
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
        <Route path="/book-management" element={<ProtectedRoute element={<BookManagement />} requiredRole="librarian" />} />
        <Route path="/room-management" element={<ProtectedRoute element={<RoomManagement />} requiredRole="librarian" />} />
        <Route path="/member-management" element={<ProtectedRoute element={<MemberManagement />} requiredRole="librarian" />} />
        
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
        
        {/* Settings route */}
        <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
        
        {/* Report issue route */}
        <Route path="/report-issue" element={<ProtectedRoute element={<ReportIssue />} />} />
        
        {/* Activity logs route (librarian only) */}
        <Route path="/activity-logs" element={<ProtectedRoute element={<ActivityLogs />} requiredRole="librarian" />} />
        
        {/* User history route (member only) */}
        <Route path="/user-history" element={<ProtectedRoute element={<UserHistory />} requiredRole="member" />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PreventFormSubmission>
  );
};

// Import the I18nProvider
import { I18nProvider } from './i18n';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <I18nProvider>
          <BrowserRouter>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </I18nProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

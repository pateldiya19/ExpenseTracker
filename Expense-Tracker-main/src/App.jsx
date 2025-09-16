import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeProvider";
import { NotificationProvider } from "./context/NotificationContext";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import Dashboard from "./pages/Dashboard";
import TransactionsPage from "./pages/TransactionsPage";
import TransactionForm from "./pages/TransactionForm";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import NotificationsPage from "./pages/NotificationsPage";
import SetReminder from "./pages/SetReminder";


const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/auth/login" replace />;
}

function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/app/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page - Public Route */}
      <Route path="/" element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      } />
      
      {/* Auth Routes */}
      <Route path="/auth/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/auth/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />
      
      {/* Redirect legacy routes */}
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/transactions" element={<Navigate to="/app/transactions" replace />} />
      <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
      <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
      
      {/* Protected App Routes */}
      <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
  <Route path="dashboard" element={<Dashboard />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="transactions/new" element={<TransactionForm />} />
        <Route path="transactions/:id/edit" element={<TransactionForm />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
  <Route path="set-reminder" element={<SetReminder />} />
  <Route path="notifications" element={<NotificationsPage />} />
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <AppRoutes />
              <Toaster 
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'hsl(var(--navy-surface))',
                    color: 'hsl(var(--text-primary))',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import Sidebar from "./components/common/Sidebar";
import MobileBottomNav from "./components/common/MobileBottomNav";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Customer Pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import ParkingSearch from "./pages/customer/ParkingSearch";
import ParkingDetails from "./pages/customer/ParkingDetails";
import BookingCheckout from "./pages/customer/BookingCheckout";
import BookingHistory from "./pages/customer/BookingHistory";
import BookingDetail from "./pages/customer/BookingDetail";
import CustomerProfile from "./pages/customer/CustomerProfile";

// Owner Pages
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import ParkingList from "./pages/owner/ParkingList";
import SlotManager from "./pages/owner/SlotManager";
import OwnerBookings from "./pages/owner/OwnerBookings";
import EmployeeManager from "./pages/owner/EmployeeManager";
import OwnerAnalytics from "./pages/owner/OwnerAnalytics";

// Employee Pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import QRScannerPage from "./pages/employee/QRScannerPage";
import ActiveVehicleLogs from "./pages/employee/ActiveVehicleLogs";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import FacilityApprovals from "./pages/admin/FacilityApprovals";
import UserManagement from "./pages/admin/UserManagement";
import SystemAnalytics from "./pages/admin/SystemAnalytics";

const HomeRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "ADMIN":
      return <Navigate to="/admin" replace />;
    case "OWNER":
      return <Navigate to="/owner" replace />;
    case "EMPLOYEE":
      return <Navigate to="/employee" replace />;
    case "CUSTOMER":
    default:
      return <Navigate to="/customer" replace />;
  }
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#0B0F19] text-slate-100 pb-20 md:pb-0">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Root Redirect */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Customer Routes */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                  <AppLayout>
                    <CustomerDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/search"
              element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                  <AppLayout>
                    <ParkingSearch />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/parking/:id"
              element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                  <AppLayout>
                    <ParkingDetails />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/booking/checkout"
              element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                  <AppLayout>
                    <BookingCheckout />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/bookings"
              element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                  <AppLayout>
                    <BookingHistory />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/bookings/:id"
              element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                  <AppLayout>
                    <BookingDetail />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/profile"
              element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                  <AppLayout>
                    <CustomerProfile />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Owner Routes */}
            <Route
              path="/owner"
              element={
                <ProtectedRoute allowedRoles={["OWNER"]}>
                  <AppLayout>
                    <OwnerDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/parking"
              element={
                <ProtectedRoute allowedRoles={["OWNER"]}>
                  <AppLayout>
                    <ParkingList />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/slots"
              element={
                <ProtectedRoute allowedRoles={["OWNER"]}>
                  <AppLayout>
                    <SlotManager />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/bookings"
              element={
                <ProtectedRoute allowedRoles={["OWNER"]}>
                  <AppLayout>
                    <OwnerBookings />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/employees"
              element={
                <ProtectedRoute allowedRoles={["OWNER"]}>
                  <AppLayout>
                    <EmployeeManager />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/analytics"
              element={
                <ProtectedRoute allowedRoles={["OWNER"]}>
                  <AppLayout>
                    <OwnerAnalytics />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Employee Routes */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                  <AppLayout>
                    <EmployeeDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/scanner"
              element={
                <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                  <AppLayout>
                    <QRScannerPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/active-vehicles"
              element={
                <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                  <AppLayout>
                    <ActiveVehicleLogs />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/bookings"
              element={
                <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                  <AppLayout>
                    <ActiveVehicleLogs />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/activity"
              element={
                <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                  <AppLayout>
                    <ActiveVehicleLogs />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AppLayout>
                    <AdminDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/approvals"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AppLayout>
                    <FacilityApprovals />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/owners"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AppLayout>
                    <FacilityApprovals />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AppLayout>
                    <UserManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/parking"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AppLayout>
                    <FacilityApprovals />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AppLayout>
                    <SystemAnalytics />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AppLayout>
                    <SystemAnalytics />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AppLayout>
                    <SystemAnalytics />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch All Redirect */}
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";

// Public pages
import Landing from "./pages/global/Landing.jsx";
import SignIn from "./pages/global/SignIn.jsx";
import Signup from "./pages/global/Signup.jsx";
import ViewRestaurant from "./pages/ViewRestaurant.jsx";
import ViewOutlet from "./pages/ViewOutlet.jsx";
import Checkout from "./pages/Checkout.jsx";
import UserSignIn from "./pages/user/UserSignIn.jsx";
import UserSignUp from "./pages/user/UserSignUp.jsx";
import UserProfile from "./pages/user/UserProfile.jsx";
import UserOrders from "./pages/user/UserOrders.jsx";
import UserSettings from "./pages/user/UserSettings.jsx";
import OwnerDashboardNew from "./pages/owner/OwnerDashboardNew.jsx";
import OwnerAnalytics from "./pages/owner/OwnerAnalytics.jsx";
import OwnerPayments from "./pages/owner/OwnerPayments.jsx";
import OwnerOrders from "./pages/owner/OwnerOrders.jsx";
import ManagerDashboardNew from "./pages/manager/ManagerDashboardNew.jsx";
import Error from "./pages/global/unAuth.jsx";
import NotFound from "./pages/global/PageNotFound.jsx"

// Owner pages
import OwnerDashboard from "./pages/owner/OwnerDashboard.jsx";
import OwnerRestaurant from "./pages/owner/OwnerRestaurant.jsx";
import OwnerOutlet from "./pages/owner/OwnerOutlet.jsx";
import OwnerProfile from "./pages/owner/OwnerProfile.jsx";
import ManageMenu from "./pages/owner/ManageMenu.jsx";

// Manager pages
import ManagerDashboard from "./pages/manager/ManagerDashboard.jsx";
import ManagerOutlet from "./pages/manager/ManagerOutlet.jsx";


import ProtectedRoute from "./components/global/PrivateRoute.jsx";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>

            {/* Landing & Auth */}
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/user/signin" element={<UserSignIn />} />
            <Route path="/user/signup" element={<UserSignUp />} />
            <Route path="/error" element={<Error/>} />

            {/* Public View Routes */}
            <Route path="/view" element={<Navigate to="/" replace />} />
            <Route path="/view/:restaurantName" element={<ViewRestaurant />} />
            <Route path="/view/:restaurantName/:outletName" element={<ViewOutlet />} />
            <Route path="/checkout" element={<Checkout />} />
            
            {/* User Routes */}
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/user/orders" element={<UserOrders />} />
            <Route path="/user/settings" element={<UserSettings />} />
            <Route path="/user/favorites" element={<UserOrders />} />

          <Route element={<ProtectedRoute role="owner"/>}>
            {/* Owner Routes */}
            <Route path="/owner/dashboard" element={<OwnerDashboardNew />} />
            <Route path="/owner/restaurant/:restaurantId" element={<OwnerRestaurant />} />
            <Route path="/owner/outlet/:outletId" element={<OwnerOutlet />} />
            <Route path="/owner/menu/:outletId" element={<ManageMenu />} />
            <Route path="/owner/profile" element={<OwnerProfile />} />
            <Route path="/owner/analytics" element={<OwnerAnalytics />} />
            <Route path="/owner/payments" element={<OwnerPayments />} />
            <Route path="/owner/orders" element={<OwnerOrders />} />
            <Route path="/owner/restaurants" element={<OwnerDashboard />} />
            <Route path="/owner/settings" element={<OwnerProfile />} />
            <Route path="/owner/billing" element={<OwnerPayments />} />
          </Route>
          <Route element={<ProtectedRoute role="manager"/>}>
            {/* Manager Routes */}
            <Route path="/manager/dashboard" element={<ManagerDashboardNew />} />
            <Route path="/manager/outlet/:outletId" element={<ManagerOutlet />} />
            <Route path="/manager/menu/:outletId" element={<ManageMenu />} />
            <Route path="/manager/outlets" element={<ManagerDashboard />} />
            <Route path="/manager/orders" element={<OwnerOrders />} />
            <Route path="/manager/reports" element={<OwnerAnalytics />} />
            <Route path="/manager/profile" element={<OwnerProfile />} />
            <Route path="/manager/settings" element={<OwnerProfile />} />
          </Route>
            {/* Fallback */}

            <Route path="*" element={<NotFound/>} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

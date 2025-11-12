import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from './context/CartContext.jsx';

// Public pages
import Landing from "./pages/Landing.jsx";
import SignIn from "./pages/SignIn.jsx";
import Signup from "./pages/Signup.jsx";
import ViewRestaurant from "./pages/ViewRestaurant.jsx";
import ViewOutlet from "./pages/ViewOutlet.jsx";

// Owner pages
import OwnerDashboard from "./pages/OwnerDashboard.jsx";
import OwnerRestaurant from "./pages/OwnerRestaurant.jsx";
import OwnerOutlet from "./pages/OwnerOutlet.jsx";
import OwnerProfile from "./pages/OwnerProfile.jsx";
import ManageMenu from "./pages/ManageMenu.jsx";

// Manager pages
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import ManagerOutlet from "./pages/ManagerOutlet.jsx";

// Legacy pages (keeping for compatibility)
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Cart from "./pages/Cart.jsx";
import Payment from "./pages/Payment.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import StaffDashboard from "./pages/StaffDashboard.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Landing & Auth */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<SignIn />} />            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<Signup />} />
            {/* Public View Routes */}
            <Route path="/view" element={<Navigate to="/" replace />} />
            <Route path="/view/:restaurantName" element={<ViewRestaurant />} />
            <Route path="/view/:restaurantName/:outletName" element={<ViewOutlet />} />

            {/* Owner Routes */}
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/restaurant/:restaurantId" element={<OwnerRestaurant />} />
            <Route path="/owner/outlet/:outletId" element={<OwnerOutlet />} />
            <Route path="/owner/menu/:outletId" element={<ManageMenu />} />
            <Route path="/owner/profile" element={<OwnerProfile />} />

            {/* Manager Routes */}
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/outlet/:outletId" element={<ManagerOutlet />} />
            <Route path="/manager/menu/:outletId" element={<ManageMenu />} />

            {/* Legacy Routes (for backward compatibility) */}
            <Route path="/home" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/success" element={<PaymentSuccess />} />
            <Route
              path="/staff"
              element={
                <PrivateRoute role="staff">
                  <StaffDashboard />
                </PrivateRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

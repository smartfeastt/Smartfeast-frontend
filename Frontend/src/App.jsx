import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Cart from "./pages/Cart.jsx";
import Payment from "./pages/Payment.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import Login from "./pages/Login.jsx";
import StaffDashboard from "./pages/StaffDashboard.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/success" element={<PaymentSuccess />} />
      <Route path="/login" element={<Login />} />

      {/* Protected route for staff */}
      <Route
        path="/staff"
        element={
          <PrivateRoute role="staff">
            <StaffDashboard />
          </PrivateRoute>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

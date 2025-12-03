import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";

// Public pages
import Landing from "./pages/global/Landing.jsx";
import Error from "./pages/global/unAuth.jsx";
import NotFound from "./pages/global/PageNotFound.jsx"

//user pages
import ViewRestaurant from "./pages/ViewRestaurant.jsx";
import ViewOutlet from "./pages/ViewOutlet.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Payment from "./pages/Payment.jsx";
import PaymentVerify from "./pages/PaymentVerify.jsx";
import SuccessPayment from "./pages/SuccessPayment.jsx";
import UserSignIn from "./pages/user/UserSignIn.jsx";
import UserSignUp from "./pages/user/UserSignUp.jsx";
import UserProfile from "./pages/user/UserProfile.jsx";
import UserOrders from "./pages/user/UserOrders.jsx";
import UserFavorites from "./pages/user/UserFavorites.jsx";
import UserAddresses from "./pages/user/UserAddresses.jsx";
import UserSettings from "./pages/user/UserSettings.jsx";



// Owner pages
import OwnerRestaurants from "./pages/owner/OwnerRestaurants.jsx";
import OwnerRestaurant from "./pages/owner/OwnerRestaurant.jsx";
import OwnerOutlet from "./pages/owner/OwnerOutlet.jsx";
import OwnerProfile from "./pages/owner/OwnerProfile.jsx";
import ManageMenu from "./pages/owner/ManageMenu.jsx";
import OwnerDashboard from "./pages/owner/OwnerDashboard.jsx";
import OwnerAnalytics from "./pages/owner/OwnerAnalytics.jsx";
import OwnerPayments from "./pages/owner/OwnerPayments.jsx";
import OwnerOrders from "./pages/owner/OwnerOrders.jsx";
import SignIn from "./pages/owner/SignIn.jsx";
import SignUp from "./pages/owner/SignUp.jsx";

// Manager pages
import ManagerOutlets from "./pages/manager/ManagerOutlets.jsx";
import ManagerOutlet from "./pages/manager/ManagerOutlet.jsx";
import ManagerDashboard from "./pages/manager/ManagerDashboard.jsx";



import ProtectedRoute from "./components/global/PrivateRoute.jsx";
import Toast from "./components/ui/Toast.jsx";

export default function App() {
  return (
    <Provider store={store}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toast />
        <Routes>

            {/* Landing & Auth */}
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            <Route path="/user/signin" element={<UserSignIn />} />
            <Route path="/user/signup" element={<UserSignUp />} />
            <Route path="/error" element={<Error/>} />

            {/* Public View Routes */}
            <Route path="/view" element={<Navigate to="/" replace />} />
            <Route path="/view/:restaurantName" element={<ViewRestaurant />} />
            <Route path="/view/:restaurantName/:outletName" element={<ViewOutlet />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment/verify/:orderId" element={<PaymentVerify />} />
            <Route path="/payment/success" element={<SuccessPayment />} />
            
            {/* User Routes */}
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/user/orders" element={<UserOrders />} />
            <Route path="/user/favorites" element={<UserFavorites />} />
            <Route path="/user/addresses" element={<UserAddresses />} />
            <Route path="/user/settings" element={<UserSettings />} />

          <Route element={<ProtectedRoute role="owner"/>}>
            {/* Owner Routes */}
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/restaurant/:restaurantId" element={<OwnerRestaurant />} />
            <Route path="/owner/outlet/:outletId" element={<OwnerOutlet />} />
            <Route path="/owner/menu/:outletId" element={<ManageMenu />} />
            <Route path="/owner/profile" element={<OwnerProfile />} />
            <Route path="/owner/analytics" element={<OwnerAnalytics />} />
            <Route path="/owner/payments" element={<OwnerPayments />} />
            <Route path="/owner/orders" element={<OwnerOrders />} />
            <Route path="/owner/restaurants" element={<OwnerRestaurants />} />
            <Route path="/owner/settings" element={<OwnerProfile />} />
            <Route path="/owner/billing" element={<OwnerPayments />} />
          </Route>
          <Route element={<ProtectedRoute role="manager"/>}>
            {/* Manager Routes */}
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/outlet/:outletId" element={<ManagerOutlet />} />
            <Route path="/manager/menu/:outletId" element={<ManageMenu />} />
            <Route path="/manager/outlets" element={<ManagerOutlets />} />
            <Route path="/manager/orders" element={<OwnerOrders />} />
            <Route path="/manager/reports" element={<OwnerAnalytics />} />
            <Route path="/manager/profile" element={<OwnerProfile />} />
            <Route path="/manager/settings" element={<OwnerProfile />} />
          </Route>
            {/* Fallback */}

            <Route path="*" element={<NotFound/>} />
        </Routes>
      </Router>
    </Provider>
  );
}

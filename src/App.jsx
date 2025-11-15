import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";

// Public pages
import Landing from "./pages/global/Landing.jsx";
import SignIn from "./pages/global/SignIn.jsx";
import Signup from "./pages/global/Signup.jsx";
import ViewRestaurant from "./pages/ViewRestaurant.jsx";
import ViewOutlet from "./pages/ViewOutlet.jsx";
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
            <Route path="/error" element={<Error/>} />

            {/* Public View Routes */}
            <Route path="/view" element={<Navigate to="/" replace />} />
            <Route path="/view/:restaurantName" element={<ViewRestaurant />} />
            <Route path="/view/:restaurantName/:outletName" element={<ViewOutlet />} />

          <Route element={<ProtectedRoute role="owner"/>}>
            {/* Owner Routes */}
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/restaurant/:restaurantId" element={<OwnerRestaurant />} />
            <Route path="/owner/outlet/:outletId" element={<OwnerOutlet />} />
            <Route path="/owner/menu/:outletId" element={<ManageMenu />} />
            <Route path="/owner/profile" element={<OwnerProfile />} />
          </Route>
          <Route element={<ProtectedRoute role="manager"/>}>
            {/* Manager Routes */}
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/outlet/:outletId" element={<ManagerOutlet />} />
            <Route path="/manager/menu/:outletId" element={<ManageMenu />} />
          </Route>
            {/* Fallback */}

            <Route path="*" element={<NotFound/>} />
          </Routes>
        </Router>
    </AuthProvider>
  );
}

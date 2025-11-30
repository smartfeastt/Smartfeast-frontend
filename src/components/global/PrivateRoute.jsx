import { useAppSelector } from "../../store/hooks.js";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ role }) => {
    const { user, loading } = useAppSelector((state) => state.auth);
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
              <div className="relative w-12 h-12 animate-spin-custom">
                <div className="absolute w-5 h-5 bg-black rounded-full top-0 left-0"></div>
                <div className="absolute w-5 h-5 bg-black rounded-full top-0 right-0"></div>
                <div className="absolute w-5 h-5 bg-black rounded-full bottom-0 left-0"></div>
                <div className="absolute w-5 h-5 bg-black rounded-full bottom-0 right-0"></div>
              </div>
            </div>
          );
    }

    const isAuthenticated = user && user.type === role;
    return isAuthenticated ? <Outlet /> : <Navigate to="/error" />;
};

export default ProtectedRoute;

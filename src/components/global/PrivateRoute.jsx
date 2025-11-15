import { useAuth } from "../../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ role }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const { user,loading } = useAuth();

    useEffect(() => {

        const checkAuth = () => {
          if(!loading){
            console.log(user);
            const type=user.type;
            setIsAuthenticated(type===role);
          }
        };
        checkAuth();
    }, [loading]);

    if (isAuthenticated === null) {
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

    return isAuthenticated ? <Outlet /> : <Navigate to="/error" />;
};

export default ProtectedRoute;

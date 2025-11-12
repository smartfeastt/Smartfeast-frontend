import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("smartfeast_token");
    const savedUser = localStorage.getItem("smartfeast_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, type) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, type }),
      });

      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        const decoded = parseJwt(data.token);
        const userData = {
          userId: decoded.userId,
          email: decoded.email,
          type: decoded.type,
          ownedRestaurants: decoded.ownedRestaurants || [],
          managedOutlets: decoded.managedOutlets || [],
        };
        setUser(userData);
        localStorage.setItem("smartfeast_token", data.token);
        localStorage.setItem("smartfeast_user", JSON.stringify(userData));
        return { success: true, data: userData };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("smartfeast_token");
    localStorage.removeItem("smartfeast_user");
  };

  const setAuth = (tokenValue, userValue) => {
    setToken(tokenValue);
    setUser(userValue);
    if (tokenValue && userValue) {
      localStorage.setItem("smartfeast_token", tokenValue);
      localStorage.setItem("smartfeast_user", JSON.stringify(userValue));
    }
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

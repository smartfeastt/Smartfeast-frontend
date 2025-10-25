import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("qr_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = (email, pass) => {
    const fake = { email, role: email.includes("staff") ? "staff" : "user" };
    setUser(fake);
    localStorage.setItem("qr_user", JSON.stringify(fake));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("qr_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

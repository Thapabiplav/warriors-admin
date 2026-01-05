import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiAuthenticated } from "../http";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheckedPath, setLastCheckedPath] = useState(null);
  const location = useLocation();

  // Verify auth when on protected routes
  useEffect(() => {
    // Skip verify check on login page
    if (location.pathname === "/login") {
      setIsLoading(false);
      setIsAuthenticated(false);
      setLastCheckedPath(null); // Reset when going to login
      return;
    }

    // Check auth if we're on a protected route and haven't checked this path yet
    // This handles both initial load and page refresh
    if (lastCheckedPath !== location.pathname) {
      setIsLoading(true);
      const checkAuth = async () => {
        try {
          const res = await apiAuthenticated.get("/verify");
          setIsAuthenticated(res.data.success === true);
        } catch (err) {
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
          setLastCheckedPath(location.pathname);
        }
      };

      checkAuth();
    }
  }, [location.pathname, lastCheckedPath]);

  const login = async (credentials) => {
    try {
      const res = await apiAuthenticated.post("/login", credentials);
      if (res.status === 200) {
        setIsAuthenticated(true);
        setLastCheckedPath(null); // Reset so verify runs on next protected route
      }
      return res;
    } catch (error) {
      // Re-throw the error so Login component can handle it
      throw error;
    }
  };

  const logout = async () => {
    await apiAuthenticated.post("/logout");
    setIsAuthenticated(false);
    setLastCheckedPath(null); // Reset so verify runs again if needed
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

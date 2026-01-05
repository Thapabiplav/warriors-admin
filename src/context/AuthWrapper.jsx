import { useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "../Loader/Loader";
import { useAuth } from "./AuthContext";


const AuthWrapper = ({ children }) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const location = useLocation();
  const [hasChecked, setHasChecked] = useState(false);

  // If we're on login page, don't show anything (let login component handle it)
  if (location.pathname === "/login") {
    return null;
  }

  useEffect(() => {
    // Only check authentication if we haven't checked yet
    if (!hasChecked) {
      checkAuth();
      setHasChecked(true);
    }
  }, [checkAuth, hasChecked]);

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
};

export default AuthWrapper;

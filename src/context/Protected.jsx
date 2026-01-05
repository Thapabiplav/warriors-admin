import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Loader from "../Loader/Loader";

const Protect = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

export default Protect;

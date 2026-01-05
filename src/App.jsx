import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorBoundary from "./context/ErrorBoundary";
import { AuthProvider, useAuth } from "./context/AuthContext";

import DashboardLayout from "./Layout/DashBoardLayout";
import Home from "./component/Home";
import ApprovedMembers from "./component/ApprovedMembers";
import PendingMembers from "./component/PendingMembers";
import EditMember from "./component/EditForm";
import Login from "./component/Login";
import Loader from "./Loader/Loader";
import ViewMember from "./component/ViewMembers";

// Protect Component
const Protect = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route
            path="/login"
            element={
              <ErrorBoundary>
                <Login />
              </ErrorBoundary>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <Protect>
                <ErrorBoundary>
                  <DashboardLayout />
                </ErrorBoundary>
              </Protect>
            }
          >
            <Route index element={<Home />} />
            <Route path="admin/approved" element={<ApprovedMembers />} />
            <Route path="admin/pending" element={<PendingMembers />} />
            <Route path="admin/members/view/:id" element={<ViewMember />} />
            <Route path="admin/edit/:id" element={<EditMember />} />
          </Route>

          {/* Redirect any unknown route to /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        <ToastContainer position="top-right" autoClose={1000} />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

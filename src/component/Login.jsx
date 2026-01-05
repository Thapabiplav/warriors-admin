import { useNavigate } from "react-router-dom";
import logo from "../assets/logo2.jpg";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const result = await login(data);

      // Check if login was successful (status 200)
      if (result.status === 200 && result.data) {
        toast.success(result.data.message || "Login successful ", {
          autoClose: 2000,
        });
        setTimeout(() => navigate("/"), 2000);
      } else {
        // Handle case where response doesn't indicate success
        toast.error(result.data?.message || "Login failed ");
      }
    } catch (err) {
      console.error("Login error:", err);
      // Extract error message from response
      let errorMessage = "Incorrect email or password";

      if (err.response) {
        // Server responded with error status
        errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          `Request failed with status ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "Network error. Please check your connection.";
      } else {
        // Something else happened
        errorMessage = err.message || "An error occurred";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFF7] flex items-center justify-center px-4">
      <ToastContainer />

      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* LEFT – LOGIN FORM */}
        <div className="w-full lg:w-1/2 p-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#EDE4F0] rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10 text-[#6B2A7B]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9A3.75 3.75 0 1112 5.25 3.75 3.75 0 0115.75 9zM4.5 20.25A7.5 7.5 0 0112 12a7.5 7.5 0 017.5 8.25"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-[#2E1A33]">
                Welcome Back
              </h2>
              <p className="text-[#6B2A7B] mt-2">Login to continue</p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#2E1A33] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300
                             focus:ring-2 focus:ring-[#8E44AD]
                             focus:border-transparent outline-none"
                />
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#2E1A33] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300
                             focus:ring-2 focus:ring-[#8E44AD]
                             focus:border-transparent outline-none"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                  loading
                    ? "bg-[#BFA2CC] cursor-not-allowed"
                    : "bg-[#6B2A7B] hover:bg-[#5A2168]"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Logging in...
                  </div>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT – LOGO SECTION */}
        <div className="w-full lg:w-1/2 bg-[#EDE4F0] flex items-center justify-center p-10">
          <img
            src={logo}
            alt="Sindhuli IT Warriors"
            className="w-64 h-auto drop-shadow-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo2.jpg";

import { Menu, Home, CheckCircle, Clock, LogOut, X } from "lucide-react";

const DashboardLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: Home,
    },
    {
      name: "Approved Members",
      path: "/admin/approved",
      icon: CheckCircle,
    },
    {
      name: "Pending Members",
      path: "/admin/pending",
      icon: Clock,
    },
  ];

  return (
    <div className="flex h-screen bg-[#F5EFF7] overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-64 transform transition-transform duration-300
    ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
    bg-linear-to-b from-[#6B2A7B] to-[#5A2168] text-white shadow-xl
    flex flex-col justify-between`}
      >
        {/* BRAND */}
        <div>
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/20">
            <img
              src={logo}
              alt="Sindhuli IT Warriors"
              className="w-10 h-10 rounded-full bg-white p-1"
            />
            <div className="leading-tight">
              <h1 className="font-bold text-lg">Sindhuli IT</h1>
              <p className="text-xs text-white/80">Admin Panel</p>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="ml-auto md:hidden text-white/80 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* MENU */}
          <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all
              ${
                isActive
                  ? "bg-white text-[#6B2A7B] shadow-md"
                  : "text-white/90 hover:bg-white/10"
              }`}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* LOGOUT STICKED AT BOTTOM */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={() => {
              if (window.confirm("Do you want to logout?")) handleLogout();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                 text-sm font-semibold text-red-200 hover:bg-red-500/20 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/*  MOBILE HEADER */}
        <header
          className="md:hidden flex items-center gap-3 px-4 py-3
                     bg-linear-to-r from-[#6B2A7B] to-[#5A2168]
                     text-white shadow-md"
        >
          <button onClick={() => setMobileSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <img
            src={logo}
            alt="Logo"
            className="w-8 h-8 rounded-full bg-white p-1"
          />
          <div className="leading-tight">
            <h1 className="text-sm font-semibold">Sindhuli IT Warriors</h1>
            <p className="text-xs text-white/80">Admin Dashboard</p>
          </div>
        </header>
        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

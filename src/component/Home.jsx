import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiAuthenticated } from "../http";
import { useAuth } from "../context/AuthContext";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

import {
  Clock,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";

// Chart.js register
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Home = () => {
  const { isAuthenticated } = useAuth();

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    canceled: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const controller = new AbortController();

    const fetchStats = async () => {
      try {
        const res = await apiAuthenticated.get(
          "/enrollments/admin/stats",
          { signal: controller.signal }
        );
        setStats(res.data.data);
      } catch (err) {
        if (err.name !== "CanceledError") {
          toast.error("Failed to fetch stats");
        }
      }
    };

    fetchStats();
    return () => controller.abort();
  }, [isAuthenticated]);

  /* ------------------ CHART DATA ------------------ */
  const chartData = {
    labels: ["Pending", "Approved", "Canceled"],
    datasets: [
      {
        data: [stats.pending, stats.approved, stats.canceled],
        backgroundColor: ["#FBBF24", "#4ADE80", "#F87171"],
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 12 },
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* PAGE TITLE */}
      <div>
        <h1 className="text-2xl font-bold text-[#2E1A33]">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-600">
          Enrollment statistics & insights
        </p>
      </div>

      {/*  STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Enrollments"
          value={stats.pending + stats.approved + stats.canceled}
          icon={Users}
          color="bg-gradient-to-br from-[#6B2A7B] to-[#5A2168]"
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="bg-gradient-to-br from-yellow-400 to-yellow-500"
        />

        <StatCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="bg-gradient-to-br from-green-400 to-green-500"
        />

        <StatCard
          title="Canceled"
          value={stats.canceled}
          icon={XCircle}
          color="bg-gradient-to-br from-red-400 to-red-500"
        />
      </div>

      {/*  CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* BAR */}
        <div className="bg-white rounded-xl shadow-md p-5 h-87.5">
          <h2 className="font-semibold text-[#2E1A33] mb-4">
            Enrollment Distribution
          </h2>
          <Bar data={chartData} options={barOptions} />
        </div>

        {/* PIE */}
        <div className="bg-white rounded-xl shadow-md p-5 h-87.5">
          <h2 className="font-semibold text-[#2E1A33] mb-4">
            Enrollment Breakdown
          </h2>
          <Pie data={chartData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
};

/* ------------------ STAT CARD COMPONENT ------------------ */
const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${color}`}
      >
        <Icon size={22} />
      </div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-[#2E1A33]">
          {value}
        </h3>
      </div>
    </div>
  );
};

export default Home;

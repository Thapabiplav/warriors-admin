import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { apiAuthenticated } from "../http";
import "react-toastify/dist/ReactToastify.css";

import {
  Eye,
  Pencil,
  Trash2,
  Copy,
  Users,
  CheckCircle,
} from "lucide-react";

const ApprovedMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchApproved = async () => {
    try {
      setLoading(true);
      const res = await apiAuthenticated.get(
        "/enrollments/admin?requestStatus=approved"
      );

      let data = res.data?.data || [];

      data = data.map((m) => {
        let projects = [];
        let interests = [];

        try {
          projects =
            m.projects && typeof m.projects === "string"
              ? JSON.parse(m.projects)
              : m.projects || [];
        } catch {
          projects = [];
        }

        try {
          interests =
            m.interests && typeof m.interests === "string"
              ? JSON.parse(m.interests)
              : m.interests || [];
        } catch {
          interests = [];
        }

        return { ...m, projects, interests };
      });

      setMembers(data);
    } catch {
      toast.error("Failed to fetch approved members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApproved();
  }, []);

  const handleView = (id) => navigate(`/admin/members/view/${id}`);
  const handleEdit = (id) => navigate(`/admin/edit/${id}`);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      await apiAuthenticated.delete(`/enrollments/admin/${id}`);
      toast.success("Member deleted successfully");
      fetchApproved();
    } catch {
      toast.error("Failed to delete member");
    }
  };

  const FRONTEND_URL =
    import.meta.env.VITE_FRONTEND_URL || window.location.origin;

  const handleCopyLink = (cvSlug) => {
    const url = `${FRONTEND_URL}/cv/${cvSlug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("CV link copied"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const parseInterests = (i) =>
    Array.isArray(i) ? i.join(", ") : "-";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-600 text-lg font-medium">
        Loading approved members...
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-10 py-6">
      <ToastContainer />

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2E1A33]">
            Approved Members
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view all approved enrollments
          </p>
        </div>

        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-5 py-2 rounded-full font-semibold text-sm">
          <CheckCircle size={20} />
          {members.length} Approved
        </div>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500 text-lg">
          No approved members found
        </div>
      ) : (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden xl:block bg-white rounded-xl shadow-md overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[#F5EFF7] text-[#2E1A33]">
                <tr>
                  {[
                    "S.N",
                    "Photo",
                    "Name & DOB",
                    "Contact",
                    "Education",
                    "Skills",
                    "Interests",
                    "Projects",
                    "CV Link",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {members.map((m, i) => (
                  <tr
                    key={m.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-5 py-3 font-medium">{i + 1}</td>

                    <td className="px-5 py-3">
                      <img
                        src={m.photo}
                        alt={m.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      />
                    </td>

                    <td className="px-5 py-3">
                      <p className="font-semibold">{m.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {m.gender} • {m.dob}
                      </p>
                    </td>

                    <td className="px-5 py-3">
                      <p>{m.email}</p>
                      <p className="text-xs text-gray-500">{m.mobile}</p>
                    </td>

                    <td className="px-5 py-3">
                      {m.education} <br />
                      <span className="text-xs text-gray-500">{m.college}</span>
                    </td>

                    <td className="px-5 py-3">
                      {m.skillLevel} <br />
                      <span className="text-xs text-gray-500">{m.tools}</span>
                    </td>

                    <td className="px-5 py-3 max-w-xs">
                      <span className="inline-block bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs">
                        {parseInterests(m.interests)}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      {m.projects.length > 0 ? (
                        m.projects.map((p, idx) => (
                          <div key={idx} className="mb-1">
                            <p className="font-medium">{p.name}</p>
                            <a
                              href={p.link}
                              target="_blank"
                              className="text-indigo-600 text-xs hover:underline"
                            >
                              Visit Project
                            </a>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleCopyLink(m.cvSlug)}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                      >
                        <Copy size={14} />
                        Copy
                      </button>
                    </td>

                    <td className="px-5 py-3 flex gap-2">
                      <ActionBtn
                        icon={Eye}
                        color="blue"
                        onClick={() => handleView(m.id)}
                      />
                      <ActionBtn
                        icon={Pencil}
                        color="yellow"
                        onClick={() => handleEdit(m.id)}
                      />
                      <ActionBtn
                        icon={Trash2}
                        color="red"
                        onClick={() => handleDelete(m.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE CARDS ================= */}
          <div className="xl:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {members.map((m, i) => (
              <div
                key={m.id}
                className="bg-white rounded-xl shadow-md p-5 space-y-3 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={m.photo}
                    alt={m.fullName}
                    className="w-14 h-14 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{m.fullName}</h3>
                    <p className="text-xs text-gray-500">{m.gender} • {m.dob}</p>
                    <p className="text-xs text-gray-500">{m.email}</p>
                  </div>
                  <span className="text-sm text-gray-400">#{i + 1}</span>
                </div>

                <p><b>Mobile:</b> {m.mobile}</p>
                <p><b>Education:</b> {m.education} ({m.college})</p>
                <p><b>Skills:</b> {m.skillLevel} ({m.tools})</p>
                <p><b>Interests:</b> {parseInterests(m.interests)}</p>

                {m.projects.length > 0 && (
                  <div>
                    <b>Projects:</b>
                    {m.projects.map((p, idx) => (
                      <div key={idx} className="ml-2">
                        <p className="font-medium">{p.name}</p>
                        {p.link && (
                          <a
                            href={p.link}
                            target="_blank"
                            className="text-indigo-600 text-xs hover:underline"
                          >
                            Visit Project
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-3">
                  <MobileBtn icon={Eye} text="View" onClick={() => handleView(m.id)} />
                  <MobileBtn icon={Pencil} text="Edit" onClick={() => handleEdit(m.id)} />
                  <MobileBtn icon={Trash2} text="Delete" onClick={() => handleDelete(m.id)} danger />
                  <MobileBtn icon={Copy} text="Copy CV" onClick={() => handleCopyLink(m.cvSlug)} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */
const ActionBtn = ({ icon: Icon, color, ...props }) => {
  const colors = {
    blue: "hover:bg-blue-50 text-blue-600",
    yellow: "hover:bg-yellow-50 text-yellow-600",
    red: "hover:bg-red-50 text-red-600",
  };

  return (
    <button
      {...props}
      className={`p-2 rounded-lg transition ${colors[color]}`}
    >
      <Icon size={16} />
    </button>
  );
};

const MobileBtn = ({ icon: Icon, text, danger, ...props }) => (
  <button
    {...props}
    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold
      ${danger
        ? "bg-red-100 text-red-600 hover:bg-red-200"
        : "bg-purple-50 text-purple-700 hover:bg-purple-100"}
    `}
  >
    <Icon size={16} />
    {text}
  </button>
);

export default ApprovedMembers;

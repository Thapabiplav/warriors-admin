import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiAuthenticated } from "../http";
import {
  Download,
  ExternalLink,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

const ViewMember = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  // 👉 image slider index per project
  const [projectImageIndex, setProjectImageIndex] = useState({});

  // ---------------- FETCH MEMBER ----------------
  const fetchMember = async () => {
    try {
      setLoading(true);
      const res = await apiAuthenticated.get(`/enrollments/admin/${id}`);
      let data = res.data?.data || null;

      if (data?.projects && typeof data.projects === "string") {
        try { data.projects = JSON.parse(data.projects); } catch { data.projects = []; }
      }
      if (data?.interests && typeof data.interests === "string") {
        try { data.interests = JSON.parse(data.interests); } catch { data.interests = []; }
      }

      // initialize slider index
      const sliderIndex = {};
      data?.projects?.forEach((_, i) => sliderIndex[i] = 0);
      setProjectImageIndex(sliderIndex);

      setMember(data);
    } catch {
      console.error("Failed to fetch member details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMember(); }, [id]);

  const nextImage = (projIndex, total) => {
    setProjectImageIndex(prev => ({
      ...prev,
      [projIndex]: (prev[projIndex] + 1) % total
    }));
  };

  const prevImage = (projIndex, total) => {
    setProjectImageIndex(prev => ({
      ...prev,
      [projIndex]: (prev[projIndex] - 1 + total) % total
    }));
  };

  const handleDownloadOrOpen = (url, label) => {
    if (!url) return;
    if (url.endsWith(".pdf")) {
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${label}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(url, "_blank");
    }
  };

  const renderFileBox = (label, url) => (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center hover:shadow-xl transition">
      <h4 className="font-semibold text-lg mb-2 text-gray-800">{label}</h4>
      {url ? (
        <>
          {url.endsWith(".pdf") ? (
            <div className="w-full h-64 border border-gray-200 rounded-lg overflow-hidden relative">
              <iframe src={url} title={label} className="w-full h-full" style={{ border: "none" }} />
              <button
                onClick={() => handleDownloadOrOpen(url, label)}
                className="absolute bottom-2 right-2 bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
              >
                <Download size={14} /> Download
              </button>
            </div>
          ) : (
            <>
              <img
                src={url}
                alt={label}
                onClick={() => handleDownloadOrOpen(url, label)}
                className="w-full h-48 object-contain rounded-lg border border-gray-200 cursor-pointer hover:scale-105 transition-transform duration-200"
              />
              <button
                onClick={() => handleDownloadOrOpen(url, label)}
                className="mt-2 bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
              >
                <ExternalLink size={14} /> Open
              </button>
            </>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-sm">
          No file available
        </div>
      )}
    </div>
  );

  if (loading || !member) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600 text-lg font-medium">
        Loading member details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-1"
      >
        ← Back
      </button>

      {/* Member Info */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-[#2E1A33]">👤 {member.fullName}</h2>
        <p className="text-gray-500">{member.email} • {member.mobile}</p>
      </div>

      {/* Personal & Education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 space-y-2">
          <p><b>DOB:</b> {member.dob}</p>
          <p><b>Gender:</b> {member.gender}</p>
          <p><b>Mobile:</b> {member.mobile}</p>
          <p><b>Email:</b> {member.email}</p>
          <p><b>Address:</b> {member.address}</p>
          <p><b>Education:</b> {member.education}</p>
          <p><b>College:</b> {member.college}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 space-y-2">
          <p><b>Status:</b> {member.status || "-"}</p>
          <p><b>Skill Level:</b> {member.skillLevel || "-"}</p>
          <p><b>Tools:</b> {member.tools || "-"}</p>
          <p><b>Agreement:</b> {member.agreement ? "Yes" : "No"}</p>
        </div>
      </div>

      {/* Uploaded Files */}
      <h3 className="text-2xl font-semibold text-center mb-4">📎 Uploaded Documents</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {renderFileBox("Photo", member.photo)}
        {renderFileBox("Citizenship Front", member.citFront)}
        {renderFileBox("Citizenship Back", member.citBack)}
      </div>

      {/* 🔥 PROJECTS WITH SLIDER */}
      {member.projects && member.projects.length > 0 && (
        <>
          <h3 className="text-2xl font-semibold text-center mt-8 mb-4">💼 Projects</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {member.projects.map((p, idx) => {
              const totalImages = p.images?.length || 0;
              const currentIndex = projectImageIndex[idx] || 0;

              return (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition duration-300 flex flex-col"
                >
                  <h4 className="text-lg font-semibold mb-2">{p.name}</h4>

                  {totalImages > 0 && (
                    <div className="relative w-full h-40 mb-2 rounded-lg overflow-hidden">
                      <img
                        src={p.images[currentIndex]}
                        alt={`${p.name}-${currentIndex}`}
                        className="w-full h-full object-cover"
                      />

                      {totalImages > 1 && (
                        <>
                          <button
                            onClick={() => prevImage(idx, totalImages)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
                          >
                            <ArrowLeft size={18} />
                          </button>

                          <button
                            onClick={() => nextImage(idx, totalImages)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
                          >
                            <ArrowRight size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline mb-2 flex items-center gap-1"
                    >
                      <ExternalLink size={14} /> Visit Project
                    </a>
                  )}

                  <p className="text-gray-600 text-sm">{p.description}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ViewMember;

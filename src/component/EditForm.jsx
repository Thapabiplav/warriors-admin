import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiAuthenticated } from "../http";
import logo from "../assets/logo2.jpg";

const INTEREST_OPTIONS = [
  "Web Development",
  "Mobile App",
  "Graphic Design",
  "Video Editing",
  "Cyber Security",
  "AI / Data",
  "Drone / Media",
];

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const EMPTY_PROJECT = { name: "", link: "", description: "", images: [] };

const EditMember = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [interests, setInterests] = useState([]);
  const [customInterest, setCustomInterest] = useState("");
  const [projects, setProjects] = useState([EMPTY_PROJECT]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [citFrontPreview, setCitFrontPreview] = useState(null);
  const [citBackPreview, setCitBackPreview] = useState(null);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [agreementError, setAgreementError] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= FETCH MEMBER =================
  useEffect(() => {
    const fetchMember = async () => {
      setLoading(true);
      try {
        const res = await apiAuthenticated.get(`/enrollments/admin/${id}`);
        const data = res.data?.data || {};

        // Interests
        let memberInterests = [];
        if (typeof data.interests === "string") {
          try {
            memberInterests = JSON.parse(data.interests);
          } catch {
            memberInterests = [];
          }
        } else if (Array.isArray(data.interests)) {
          memberInterests = data.interests;
        }

        const predefined = memberInterests.filter((i) =>
          INTEREST_OPTIONS.includes(i)
        );
        const custom = memberInterests.filter(
          (i) => !INTEREST_OPTIONS.includes(i)
        );

        setInterests(predefined);
        setCustomInterest(custom.join(", "));

        // Projects
        const parsedProjects = Array.isArray(data.projects)
          ? data.projects
          : typeof data.projects === "string"
          ? JSON.parse(data.projects)
          : [];
        setProjects(
          parsedProjects.length
            ? parsedProjects.map((p) => ({
                name: p.name || "",
                link: p.link || "",
                description: p.description || "",
                images: Array.isArray(p.images) ? p.images : [],
              }))
            : [EMPTY_PROJECT]
        );

        // Other member data
        setMember(data);
        setPhotoPreview(data.photo || null);
        setCitFrontPreview(data.citFront || null);
        setCitBackPreview(data.citBack || null);
        setAgreementChecked(Boolean(data.agreement));
      } catch (err) {
        toast.error("Failed to load member data");
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  // ================= INTEREST HANDLERS =================
  const handleInterestChange = (interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleAddCustomInterest = () => {
    const newInterests = customInterest
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i && !interests.includes(i));
    if (!newInterests.length) return;
    setInterests([...interests, ...newInterests]);
    setCustomInterest("");
  };

  // ================= FILE HANDLERS =================
  const handleFilePreview = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 1MB");
      e.target.value = null;
      return;
    }
    setter(file);
  };

  // ================= PROJECT HANDLERS =================
  const handleProjectChange = (index, field, value) => {
    setProjects((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const handleProjectImages = (index, files) => {
    if (!files || files.length === 0) return;

    setProjects((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p;

        // Preserve ALL existing images (both URLs and File objects)
        const existingImages = p.images || [];

        // Filter and validate new files
        const validFiles = Array.from(files).filter(
          (f) => f.size <= MAX_FILE_SIZE
        );

        // Append new files to existing images
        return { ...p, images: [...existingImages, ...validFiles] };
      })
    );
  };

  const removeProjectImage = (projectIndex, imageIndex) => {
    setProjects((prev) =>
      prev.map((p, i) => {
        if (i !== projectIndex) return p;
        return {
          ...p,
          images: p.images.filter((_, imgIdx) => imgIdx !== imageIndex),
        };
      })
    );
  };

  const addProject = () =>
    setProjects((prev) => [...prev, { ...EMPTY_PROJECT }]);
  const removeProject = (index) =>
    setProjects((prev) => prev.filter((_, i) => i !== index));

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreementChecked) {
      setAgreementError(true);
      return;
    }

    const formData = new FormData();

    // Member fields
    [
      "fullName",
      "dob",
      "gender",
      "mobile",
      "email",
      "address",
      "education",
      "college",
      "status",
      "skillLevel",
      "tools",
    ].forEach((key) => member[key] && formData.append(key, member[key]));

    // Interests - Merge custom interest before submission
    const finalInterests = [...interests];
    if (customInterest.trim()) {
      const customInterests = customInterest
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i && !finalInterests.includes(i));
      finalInterests.push(...customInterests);
    }
    formData.append("interests", JSON.stringify(finalInterests));

    // Photos / Citizenship
    if (photoPreview instanceof File) formData.append("photo", photoPreview);
    if (citFrontPreview instanceof File)
      formData.append("citFront", citFrontPreview);
    if (citBackPreview instanceof File)
      formData.append("citBack", citBackPreview);

    // Projects
    projects.forEach((p, i) => {
      formData.append(`projects[${i}][name]`, p.name);
      formData.append(`projects[${i}][link]`, p.link);
      formData.append(`projects[${i}][description]`, p.description);

      // Existing URLs - append without brackets for backend compatibility
      p.images
        .filter((img) => typeof img === "string")
        .forEach((url) =>
          formData.append(`projects[${i}][existingImages][]`, url)
        );

      // New Files - use correct fieldname without brackets
      p.images
        .filter((img) => img instanceof File)
        .forEach((file) => formData.append(`projectImages_${i}`, file));
    });

    // Agreement
    formData.append("agreement", agreementChecked);

    try {
      setLoading(true);
      await apiAuthenticated.put(`/enrollments/admin/${id}`, formData);
      toast.success("Member updated successfully");
      navigate("/admin/approved");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !member)
    return <div className="text-center mt-10 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-linear-to-br from-slate-900 to-slate-950 rounded-2xl shadow-xl text-gray-200">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-cyan-400">
            Sindhuli IT Warriors
          </h2>
          <p className="text-gray-400">Edit Membership</p>
        </div>
        <img src={logo} className="h-16 w-16 rounded-full" />
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <Section title="Personal Information">
          <Input
            label="Full Name"
            value={member.fullName}
            onChange={(v) => setMember({ ...member, fullName: v })}
          />
          <Input
            type="date"
            label="Date of Birth"
            value={member.dob}
            onChange={(v) => setMember({ ...member, dob: v })}
          />
          <Input
            label="Mobile"
            value={member.mobile}
            onChange={(v) => setMember({ ...member, mobile: v })}
          />
          <Input
            label="Email"
            value={member.email}
            onChange={(v) => setMember({ ...member, email: v })}
          />
          <Input
            label="Address"
            value={member.address}
            onChange={(v) => setMember({ ...member, address: v })}
          />
        </Section>

        {/* Interests */}
        <Section title="IT Skills & Interests">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {INTEREST_OPTIONS.map((i) => (
              <label key={i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={interests.includes(i)}
                  onChange={() => handleInterestChange(i)}
                />
                {i}
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              placeholder="Custom interest"
              className="flex-1 p-2 rounded bg-slate-800"
            />
            <button
              type="button"
              onClick={handleAddCustomInterest}
              className="px-4 bg-cyan-500 rounded"
            >
              Add
            </button>
          </div>
        </Section>

        {/* Photos */}
        <Section title="Profile Photo">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFilePreview(e, setPhotoPreview)}
          />
          {photoPreview && (
            <img
              src={
                photoPreview instanceof File
                  ? URL.createObjectURL(photoPreview)
                  : photoPreview
              }
              className="mt-2 w-40 rounded"
            />
          )}
        </Section>

        {/* Citizenship */}
        <Section title="Citizenship">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFilePreview(e, setCitFrontPreview)}
            />
            {citFrontPreview && (
              <img
                src={
                  citFrontPreview instanceof File
                    ? URL.createObjectURL(citFrontPreview)
                    : citFrontPreview
                }
                className="mt-2 w-40 rounded"
              />
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFilePreview(e, setCitBackPreview)}
            />
            {citBackPreview && (
              <img
                src={
                  citBackPreview instanceof File
                    ? URL.createObjectURL(citBackPreview)
                    : citBackPreview
                }
                className="mt-2 w-40 rounded"
              />
            )}
          </div>
        </Section>

        {/* Projects */}
        <Section title="Projects / Portfolio">
          {projects.map((p, index) => (
            <div
              key={index}
              className="space-y-2 border-b border-white/10 pb-4"
            >
              <Input
                placeholder="Project Name"
                value={p.name}
                onChange={(v) => handleProjectChange(index, "name", v)}
              />
              <Input
                placeholder="Project Link"
                value={p.link}
                onChange={(v) => handleProjectChange(index, "link", v)}
              />
              <textarea
                value={p.description}
                onChange={(e) =>
                  handleProjectChange(index, "description", e.target.value)
                }
                placeholder="Description"
                className="w-full p-2 rounded bg-slate-800"
              />
              <input
                type="file"
                multiple
                name={`projectImages_${index}`}
                onChange={(e) => handleProjectImages(index, e.target.files)}
              />

              {p.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {p.images.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={
                          typeof img === "string"
                            ? img
                            : URL.createObjectURL(img)
                        }
                        className="w-24 h-24 object-cover rounded-lg border-2 border-slate-600"
                        alt={`Project image ${i + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeProjectImage(index, i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {projects.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className="text-red-400 text-sm"
                >
                  Remove Project
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addProject}
            className="text-cyan-400 mt-2"
          >
            + Add Project
          </button>
        </Section>

        {/* Agreement */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={agreementChecked}
            onChange={(e) => {
              setAgreementChecked(e.target.checked);
              setAgreementError(false);
            }}
          />
          I agree to the rules and code of conduct
        </label>
        {agreementError && (
          <p className="text-red-400 text-sm">Agreement required</p>
        )}

        <button
          disabled={loading}
          className="w-full py-3 bg-cyan-500 rounded-xl font-bold"
        >
          {loading ? "Updating..." : "Update Member"}
        </button>
      </form>
    </div>
  );
};

const Section = ({ title, children }) => (
  <fieldset className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
    <legend className="text-cyan-400 font-semibold">{title}</legend>
    {children}
  </fieldset>
);

const Input = ({ label, value, onChange, type = "text", placeholder }) => (
  <div>
    {label && <label className="block mb-1">{label}</label>}
    <input
      type={type}
      value={value || ""}
      placeholder={placeholder || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 rounded bg-slate-800"
    />
  </div>
);

export default EditMember;

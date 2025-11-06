import React, { useState, useEffect } from "react";
import { uploadImageToBlob } from "../azure";
import StepEditor from "./StepEditor";

const initialForm = {
  title: "",
  category: "",
  model: "",
  difficulty: "Beginner",
  durationMinutes: "",
  summary: "",
  tools: [],
  videoUrl: "",
  thumbnailUrl: "",
  steps: []
};

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const CreatorDashboardForm = ({ initialValues, onSubmit, editing, loading, categories = [] }) => {
  const [form, setForm] = useState(initialForm);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (initialValues) {
      // Convert legacy format to new format if needed
      const steps = initialValues.steps && Array.isArray(initialValues.steps) && initialValues.steps.length > 0
        ? (typeof initialValues.steps[0] === "string" 
            ? initialValues.steps.map((s, i) => ({
                number: i + 1,
                title: "",
                description: s,
                images: [],
                warnings: [],
                tips: [],
                tools: [],
                parts: []
              }))
            : initialValues.steps.map((s, i) => ({
                number: i + 1,
                title: s.title || "",
                description: s.description || "",
                images: s.images || [],
                warnings: s.warnings || [],
                tips: s.tips || [],
                tools: s.tools || [],
                parts: s.parts || []
              })))
        : [];
      
      setForm({
        ...initialForm,
        ...initialValues,
        tools: Array.isArray(initialValues.tools) ? initialValues.tools : (initialValues.tools || "").split("\n").filter(Boolean),
        steps: steps
      });
    } else {
      setForm(initialForm);
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleStepsChange = (steps) => {
    setForm(f => ({ ...f, steps }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      durationMinutes: Number(form.durationMinutes) || 0,
      steps: form.steps.map((step, index) => ({
        ...step,
        number: index + 1
      }))
    };
    onSubmit(data);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToBlob(file, "thumbnails");
      setForm(f => ({ ...f, thumbnailUrl: url }));
    } catch (err) {
      alert(`上传失败: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Get available categories from categories prop
  const categoryOptions = categories.length > 0 
    ? categories.map(c => ({ value: c.name, label: c.name }))
    : [{ value: "Phones", label: "Phones" }, { value: "Tablets", label: "Tablets" }, { value: "Laptops", label: "Laptops" }, { value: "Other", label: "Other" }];

  return (
    <form className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-6 border border-neutral-100 max-w-5xl mx-auto" onSubmit={handleSubmit}>
      <div className="border-b border-neutral-200 pb-4">
          <h2 className="font-bold text-2xl text-neutral-900">{editing ? "Edit Guide" : "Create New Guide"}</h2>
        <p className="text-sm text-neutral-500 mt-1">Create detailed repair guides using the advanced step-by-step editor</p>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="e.g., iPhone 13 Screen Replacement"
            className="input"
          />
        </div>
        <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Category *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Select category...</option>
            {categoryOptions.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Model</label>
          <input
            type="text"
            name="model"
            value={form.model}
            onChange={handleChange}
            placeholder="e.g., iPhone 13 Pro Max"
            className="input"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Difficulty</label>
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="input"
            >
              {DIFFICULTIES.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Estimated Time (minutes)</label>
            <input
              type="number"
              name="durationMinutes"
              value={form.durationMinutes}
              onChange={handleChange}
              min="1"
              placeholder="e.g., 30"
              className="input"
            />
          </div>
        </div>
      </div>

      <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Summary / Problem Description *</label>
          <textarea
            name="summary"
            value={form.summary}
            onChange={handleChange}
            required
            placeholder="Briefly describe the problem this repair guide solves..."
            className="input min-h-[100px]"
            rows={3}
          />
      </div>

      {/* Thumbnail */}
      <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Thumbnail Image</label>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              name="thumbnailUrl"
              value={form.thumbnailUrl}
              onChange={handleChange}
              placeholder="Image URL (or upload below)"
              className="input"
            />
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm"
              />
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !file}
                className="px-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg disabled:opacity-60 hover:bg-neutral-200 transition"
              >
                {uploading ? "Uploading..." : "Upload to Azure"}
              </button>
            </div>
            {form.thumbnailUrl && (
              <div className="mt-2">
                <img
                  src={form.thumbnailUrl}
                  alt="Preview"
                  className="max-w-xs h-32 object-cover rounded-lg border border-neutral-200"
                />
              </div>
            )}
          </div>
      </div>

      {/* Video URL */}
      <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Video Link (YouTube)</label>
          <input
            type="url"
            name="videoUrl"
            value={form.videoUrl}
            onChange={handleChange}
            placeholder="https://www.youtube.com/embed/..."
            className="input"
          />
      </div>

      {/* Tools (Legacy) */}
      <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">General Tools List (Optional)</label>
          <textarea
            name="tools"
            value={Array.isArray(form.tools) ? form.tools.join("\n") : form.tools}
            onChange={(e) => {
              const value = e.target.value.split("\n").filter(Boolean);
              setForm(f => ({ ...f, tools: value }));
            }}
            placeholder="One tool name per line (these tools will be displayed at the top of the guide)"
            className="input min-h-[60px]"
          />
      </div>

      {/* Step Editor */}
      <div className="border-t border-neutral-200 pt-6">
        <StepEditor steps={form.steps || []} onChange={handleStepsChange} />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-4 border-t border-neutral-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow transition disabled:opacity-60 disabled:cursor-wait"
        >
          {loading ? "Saving..." : (editing ? "Save Changes" : "Publish Guide")}
        </button>
      </div>
    </form>
  );
};

export default CreatorDashboardForm;

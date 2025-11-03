import React, { useState, useEffect } from "react";
import { uploadImageToBlob } from "../azure";

const initialForm = {
  title: "",
  category: "Phones",
  model: "",
  difficulty: "Beginner",
  durationMinutes: "",
  summary: "",
  tools: "",
  videoUrl: "",
  thumbnailUrl: "",
  steps: ""
};

const CATEGORIES = ["Phones", "Tablets", "Laptops", "Other"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const CreatorDashboardForm = ({ initialValues, onSubmit, editing, loading }) => {
  const [form, setForm] = useState(initialForm);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (initialValues) {
      setForm({
        ...initialForm,
        ...initialValues,
        tools: (initialValues.tools || []).join("\n"),
        steps: (initialValues.steps || []).join("\n")
      });
    } else {
      setForm(initialForm);
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      durationMinutes: Number(form.durationMinutes),
      tools: form.tools.split("\n").map(t => t.trim()).filter(Boolean),
      steps: form.steps.split("\n").map(s => s.trim()).filter(Boolean)
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
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-5 border border-neutral-100 max-w-xl mx-auto" onSubmit={handleSubmit}>
      <h2 className="font-bold text-xl mb-2">{editing ? "Edit Guide" : "Create New Guide"}</h2>
      <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="Title" className="input" />
      <div className="flex gap-4">
        <select name="category" value={form.category} onChange={handleChange} className="input">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="text" name="model" value={form.model} onChange={handleChange} placeholder="Model (e.g. iPhone 13)" className="input flex-1" />
      </div>
      <div className="flex gap-4">
        <select name="difficulty" value={form.difficulty} onChange={handleChange} className="input">
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <input type="number" name="durationMinutes" value={form.durationMinutes} onChange={handleChange} required min="1" placeholder="Time (min)" className="input flex-1" />
      </div>
      <textarea name="summary" value={form.summary} onChange={handleChange} required placeholder="Summary / Problem Statement" className="input min-h-[64px]" />
      <textarea name="tools" value={form.tools} onChange={handleChange} placeholder="Tools Needed (one per line)" className="input min-h-[48px]" />
      <input type="text" name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="YouTube Embed URL" className="input" />
      <div className="flex flex-col gap-2">
        <input type="text" name="thumbnailUrl" value={form.thumbnailUrl} onChange={handleChange} placeholder="Thumbnail Image URL (or upload below)" className="input" />
        <div className="flex items-center gap-2">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button type="button" onClick={handleUpload} disabled={uploading || !file} className="px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-lg disabled:opacity-60">
            {uploading ? "Uploading..." : "Upload to Azure"}
          </button>
        </div>
        {form.thumbnailUrl && (
          <div className="text-sm text-green-700 break-all">Uploaded: {form.thumbnailUrl}</div>
        )}
      </div>
      <textarea name="steps" value={form.steps} onChange={handleChange} placeholder="Step-by-step Instructions (one per line)" className="input min-h-[96px]" />
      <button type="submit" disabled={loading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow transition disabled:opacity-60 disabled:cursor-wait">
        {loading ? "Saving..." : (editing ? "Save Changes" : "Publish Guide")}
      </button>
    </form>
  );
};

export default CreatorDashboardForm;

// Reusable input Tailwind: input = "w-full rounded-xl border border-neutral-200 px-4 py-2 text-base bg-neutral-50 focus:bg-white focus:border-blue-400 outline-none transition"

import React, { useState, useEffect } from "react";
import { uploadImageToBlob } from "../azure";
import StepEditor from "./StepEditor";
import { ChevronRight } from "lucide-react";

const initialForm = {
  title: "",
  category: "",
  brand: "",
  model: "",
  part: "",
  relatedParts: [],
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
  
  // Cascading dropdown states
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [availableParts, setAvailableParts] = useState([]);
  const [selectedRelatedParts, setSelectedRelatedParts] = useState([]);

  // Load cascading dropdown data when category/brand/model changes
  useEffect(() => {
    if (form.category) {
      const selectedCategory = categories.find(c => c.name === form.category);
      if (selectedCategory && selectedCategory.subcategories) {
        setAvailableBrands(selectedCategory.subcategories);
        // Reset downstream selections if category changes
        if (!editing || !initialValues?.brand) {
          setForm(f => ({ ...f, brand: "", model: "", part: "", relatedParts: [] }));
          setAvailableModels([]);
          setAvailableParts([]);
        }
      } else {
        setAvailableBrands([]);
      }
    } else {
      setAvailableBrands([]);
      setAvailableModels([]);
      setAvailableParts([]);
    }
  }, [form.category, categories]);

  useEffect(() => {
    if (form.brand && availableBrands.length > 0) {
      const selectedBrand = availableBrands.find(b => b.name === form.brand);
      if (selectedBrand && selectedBrand.models) {
        setAvailableModels(selectedBrand.models);
        // Don't set parts from brand - parts are model-specific
        setAvailableParts([]);
        // Reset downstream selections if brand changes
        if (!editing || !initialValues?.model) {
          setForm(f => ({ ...f, model: "", part: "", relatedParts: [] }));
        }
      } else {
        setAvailableModels([]);
        setAvailableParts([]);
      }
    } else {
      setAvailableModels([]);
      setAvailableParts([]);
    }
  }, [form.brand, availableBrands]);

  useEffect(() => {
    if (form.model && availableModels.length > 0) {
      const selectedModel = availableModels.find(m => {
        const modelName = typeof m === 'string' ? m : m.name;
        return modelName === form.model;
      });
      if (selectedModel && typeof selectedModel === 'object' && selectedModel.parts) {
        setAvailableParts(selectedModel.parts);
      }
      // Reset part selection if model changes
      if (!editing || !initialValues?.part) {
        setForm(f => ({ ...f, part: "", relatedParts: [] }));
      }
    }
  }, [form.model, availableModels]);

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
        brand: initialValues.brand || "",
        part: initialValues.part || "",
        relatedParts: initialValues.relatedParts || [],
        tools: Array.isArray(initialValues.tools) ? initialValues.tools : (initialValues.tools || "").split("\n").filter(Boolean),
        steps: steps
      });
      setSelectedRelatedParts(initialValues.relatedParts || []);
    } else {
      setForm(initialForm);
      setSelectedRelatedParts([]);
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
      relatedParts: selectedRelatedParts,
      durationMinutes: Number(form.durationMinutes) || 0,
      steps: form.steps.map((step, index) => ({
        ...step,
        number: index + 1
      }))
    };
    onSubmit(data);
  };

  const toggleRelatedPart = (part) => {
    setSelectedRelatedParts(prev => {
      if (prev.includes(part)) {
        return prev.filter(p => p !== part);
      } else {
        return [...prev, part];
      }
    });
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

  // Breadcrumb display
  const breadcrumb = [
    form.category,
    form.brand,
    form.model,
    form.part
  ].filter(Boolean).join(" > ");

  return (
    <form className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-6 border border-neutral-100 max-w-5xl mx-auto" onSubmit={handleSubmit}>
      <div className="border-b border-neutral-200 pb-4">
          <h2 className="font-bold text-2xl text-neutral-900">{editing ? "Edit Guide" : "Create New Guide"}</h2>
        <p className="text-sm text-neutral-500 mt-1">Create detailed repair guides using the advanced step-by-step editor</p>
        {breadcrumb && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
            <span className="font-medium">Selected Path:</span>
            <span>{breadcrumb}</span>
          </div>
        )}
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

      {/* Cascading Dropdowns: Brand → Model → Part */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Brand / OS *
          </label>
          <select
            name="brand"
            value={form.brand}
            onChange={handleChange}
            disabled={!form.category || availableBrands.length === 0}
            required
            className="input disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select brand...</option>
            {availableBrands.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
          {form.category && availableBrands.length === 0 && (
            <p className="text-xs text-neutral-500 mt-1">No brands available. Add brands in Category Management.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Model *
          </label>
          <select
            name="model"
            value={form.model}
            onChange={handleChange}
            disabled={!form.brand || availableModels.length === 0}
            required
            className="input disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select model...</option>
            {availableModels.map((m, idx) => {
              const modelName = typeof m === 'string' ? m : m.name;
              return <option key={idx} value={modelName}>{modelName}</option>;
            })}
          </select>
          {form.brand && availableModels.length === 0 && (
            <p className="text-xs text-neutral-500 mt-1">No models available. Add models in Category Management.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Part *
          </label>
          <select
            name="part"
            value={form.part}
            onChange={handleChange}
            disabled={!form.model || availableParts.length === 0}
            required
            className="input disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select part...</option>
            {availableParts.map((part, idx) => (
              <option key={idx} value={part}>{part}</option>
            ))}
          </select>
          {form.model && availableParts.length === 0 && (
            <p className="text-xs text-neutral-500 mt-1">No parts available. Add parts in Category Management.</p>
          )}
        </div>
      </div>

      {/* Related Parts (optional multi-select) */}
      {availableParts.length > 0 && form.part && (
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Related Parts (Optional)
          </label>
          <p className="text-xs text-neutral-500 mb-3">
            Select additional parts that might be affected or useful during this repair
          </p>
          <div className="flex flex-wrap gap-2">
            {availableParts.filter(p => p !== form.part).map(part => (
              <button
                key={part}
                type="button"
                onClick={() => toggleRelatedPart(part)}
                className={`px-3 py-1.5 rounded-full text-sm border-2 transition ${
                  selectedRelatedParts.includes(part)
                    ? "bg-purple-100 border-purple-400 text-purple-900 font-medium"
                    : "bg-white border-neutral-300 text-neutral-700 hover:border-purple-300"
                }`}
              >
                {part}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

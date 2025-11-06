import React, { useState } from "react";
import { Upload, X, AlertTriangle, Info, Plus, Trash2, MoveUp, MoveDown, Link as LinkIcon } from "lucide-react";
import { uploadImageToBlob } from "../azure";

const StepEditor = ({ steps = [], onChange }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const addStep = () => {
    const newStep = {
      number: steps.length + 1,
      title: "",
      description: "",
      images: [],
      warnings: [],
      tips: [],
      tools: [],
      parts: []
    };
    onChange([...steps, newStep]);
    setEditingIndex(steps.length);
  };

  const updateStep = (index, updates) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    // Update step numbers
    newSteps.forEach((step, i) => {
      step.number = i + 1;
    });
    onChange(newSteps);
  };

  const deleteStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    newSteps.forEach((step, i) => {
      step.number = i + 1;
    });
    onChange(newSteps);
    if (editingIndex === index) setEditingIndex(null);
    else if (editingIndex > index) setEditingIndex(editingIndex - 1);
  };

  const moveStep = (index, direction) => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === steps.length - 1)) return;
    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    newSteps.forEach((step, i) => {
      step.number = i + 1;
    });
    onChange(newSteps);
    setEditingIndex(targetIndex);
  };

  const handleImageUpload = async (stepIndex, files) => {
    const step = steps[stepIndex];
    const uploadPromises = Array.from(files).map(file => uploadImageToBlob(file, "tutorial-steps"));
    try {
      const urls = await Promise.all(uploadPromises);
      updateStep(stepIndex, {
        images: [...(step.images || []), ...urls]
      });
    } catch (error) {
      alert(`Image upload failed: ${error.message}`);
    }
  };

  const removeImage = (stepIndex, imageIndex) => {
    const step = steps[stepIndex];
    updateStep(stepIndex, {
      images: step.images.filter((_, i) => i !== imageIndex)
    });
  };

  const addItem = (stepIndex, type, value = "") => {
    const step = steps[stepIndex];
    const field = type === "warning" ? "warnings" : type === "tip" ? "tips" : type === "tool" ? "tools" : "parts";
    updateStep(stepIndex, {
      [field]: [...(step[field] || []), value]
    });
  };

  const updateItem = (stepIndex, type, itemIndex, value) => {
    const step = steps[stepIndex];
    const field = type === "warning" ? "warnings" : type === "tip" ? "tips" : type === "tool" ? "tools" : "parts";
    const newItems = [...(step[field] || [])];
    newItems[itemIndex] = value;
    updateStep(stepIndex, { [field]: newItems });
  };

  const removeItem = (stepIndex, type, itemIndex) => {
    const step = steps[stepIndex];
    const field = type === "warning" ? "warnings" : type === "tip" ? "tips" : type === "tool" ? "tools" : "parts";
    updateStep(stepIndex, {
      [field]: step[field].filter((_, i) => i !== itemIndex)
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">Step-by-Step Guide Editor</h3>
        <button
          type="button"
          onClick={addStep}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          <Plus size={18} />
          Add Step
        </button>
      </div>

      {steps.length === 0 && (
        <div className="text-center py-12 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200">
          <p className="text-neutral-500 mb-4">No steps added yet</p>
          <button
            type="button"
            onClick={addStep}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Create First Step
          </button>
        </div>
      )}

      {steps.map((step, stepIndex) => (
        <div
          key={stepIndex}
          className={`bg-white rounded-xl border-2 ${
            editingIndex === stepIndex ? "border-blue-500 shadow-lg" : "border-neutral-200"
          } overflow-hidden transition-all`}
        >
          {/* Step Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xl">
                {step.number}
              </div>
              <div>
                <div className="font-semibold text-lg">
                  {step.title || `Step ${step.number}`}
                </div>
                {step.description && (
                  <div className="text-sm text-blue-100 mt-1 line-clamp-1">{step.description}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => moveStep(stepIndex, "up")}
                disabled={stepIndex === 0}
                className="p-2 hover:bg-white/20 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Move Up"
              >
                <MoveUp size={18} />
              </button>
              <button
                type="button"
                onClick={() => moveStep(stepIndex, "down")}
                disabled={stepIndex === steps.length - 1}
                className="p-2 hover:bg-white/20 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Move Down"
              >
                <MoveDown size={18} />
              </button>
              <button
                type="button"
                onClick={() => setEditingIndex(editingIndex === stepIndex ? null : stepIndex)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition"
              >
                {editingIndex === stepIndex ? "Collapse" : "Edit"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete step ${step.number}?`)) {
                    deleteStep(stepIndex);
                  }
                }}
                className="p-2 hover:bg-red-500/50 rounded-lg transition"
                title="Delete Step"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Step Editor */}
          {editingIndex === stepIndex && (
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Step Title</label>
                <input
                  type="text"
                  value={step.title || ""}
                  onChange={(e) => updateStep(stepIndex, { title: e.target.value })}
                  placeholder="e.g., Remove back cover"
                  className="input"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Detailed Instructions</label>
                <textarea
                  value={step.description || ""}
                  onChange={(e) => updateStep(stepIndex, { description: e.target.value })}
                  placeholder="Describe the operation method for this step in detail..."
                  className="input min-h-[120px]"
                  rows={4}
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Step Images ({step.images?.length || 0})
                </label>
                <div className="flex flex-wrap gap-4 mb-4">
                  {step.images?.map((url, imgIndex) => (
                    <div key={imgIndex} className="relative group">
                      <img
                        src={url}
                        alt={`Step ${step.number} image ${imgIndex + 1}`}
                        className="w-32 h-32 object-cover rounded-lg border-2 border-neutral-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(stepIndex, imgIndex)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition">
                  <Upload size={18} />
                  <span>Upload Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(stepIndex, e.target.files)}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-neutral-500 mt-2">Supports uploading multiple images at once</p>
              </div>

              {/* Warnings */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-orange-500" />
                  Warnings
                </label>
                {step.warnings?.map((warning, warnIndex) => (
                  <div key={warnIndex} className="flex gap-2 mb-2">
                    <div className="flex-1 bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <input
                        type="text"
                        value={warning}
                        onChange={(e) => updateItem(stepIndex, "warning", warnIndex, e.target.value)}
                        placeholder="Enter warning content..."
                        className="w-full bg-transparent border-none outline-none text-neutral-800"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(stepIndex, "warning", warnIndex)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(stepIndex, "warning")}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition"
                >
                  <Plus size={16} />
                  Add Warning
                </button>
              </div>

              {/* Tips */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                  <Info size={16} className="text-blue-500" />
                  Tips
                </label>
                {step.tips?.map((tip, tipIndex) => (
                  <div key={tipIndex} className="flex gap-2 mb-2">
                    <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <input
                        type="text"
                        value={tip}
                        onChange={(e) => updateItem(stepIndex, "tip", tipIndex, e.target.value)}
                        placeholder="Enter tip content..."
                        className="w-full bg-transparent border-none outline-none text-neutral-800"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(stepIndex, "tip", tipIndex)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(stepIndex, "tip")}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Plus size={16} />
                  Add Tip
                </button>
              </div>

              {/* Tools */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                  <LinkIcon size={16} className="text-green-500" />
                  Required Tools (linkable to store)
                </label>
                {step.tools?.map((tool, toolIndex) => (
                  <div key={toolIndex} className="flex gap-2 mb-2">
                    <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
                      <input
                        type="text"
                        value={typeof tool === "string" ? tool : tool.name}
                        onChange={(e) => {
                          const value = typeof tool === "string" ? e.target.value : { ...tool, name: e.target.value };
                          updateItem(stepIndex, "tool", toolIndex, value);
                        }}
                        placeholder="Tool name..."
                        className="w-full bg-transparent border-none outline-none text-neutral-800 mb-2"
                      />
                      <input
                        type="url"
                        value={typeof tool === "string" ? "" : (tool.url || "")}
                        onChange={(e) => {
                          const value = typeof tool === "string" 
                            ? { name: tool, url: e.target.value }
                            : { ...tool, url: e.target.value };
                          updateItem(stepIndex, "tool", toolIndex, value);
                        }}
                        placeholder="Store link (optional)..."
                        className="w-full bg-transparent border border-green-300 rounded px-2 py-1 text-sm text-neutral-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(stepIndex, "tool", toolIndex)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(stepIndex, "tool")}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition"
                >
                  <Plus size={16} />
                  Add Tool
                </button>
              </div>

              {/* Parts */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                  <LinkIcon size={16} className="text-purple-500" />
                  Required Parts (linkable to store)
                </label>
                {step.parts?.map((part, partIndex) => (
                  <div key={partIndex} className="flex gap-2 mb-2">
                    <div className="flex-1 bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <input
                        type="text"
                        value={typeof part === "string" ? part : part.name}
                        onChange={(e) => {
                          const value = typeof part === "string" ? e.target.value : { ...part, name: e.target.value };
                          updateItem(stepIndex, "part", partIndex, value);
                        }}
                        placeholder="Part name..."
                        className="w-full bg-transparent border-none outline-none text-neutral-800 mb-2"
                      />
                      <input
                        type="url"
                        value={typeof part === "string" ? "" : (part.url || "")}
                        onChange={(e) => {
                          const value = typeof part === "string" 
                            ? { name: part, url: e.target.value }
                            : { ...part, url: e.target.value };
                          updateItem(stepIndex, "part", partIndex, value);
                        }}
                        placeholder="Store link (optional)..."
                        className="w-full bg-transparent border border-purple-300 rounded px-2 py-1 text-sm text-neutral-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(stepIndex, "part", partIndex)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(stepIndex, "part")}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition"
                >
                  <Plus size={16} />
                  Add Part
                </button>
              </div>
            </div>
          )}

          {/* Step Preview */}
          {editingIndex !== stepIndex && (
            <div className="p-6">
              <div className="mb-4">
                {step.title && <h4 className="font-semibold text-lg text-neutral-900 mb-2">{step.title}</h4>}
                {step.description && (
                  <p className="text-neutral-700 whitespace-pre-wrap">{step.description}</p>
                )}
              </div>
              
              {step.images && step.images.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {step.images.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Step ${step.number} image ${i + 1}`}
                      className="h-24 w-24 object-cover rounded-lg border border-neutral-200"
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {step.warnings?.map((w, i) => (
                  <div key={i} className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {w}
                  </div>
                ))}
                {step.tips?.map((t, i) => (
                  <div key={i} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                    <Info size={12} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepEditor;


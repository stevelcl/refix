import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";

const CreatorGuideTable = ({ guides, onEdit, onDelete }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (guide) => {
    if (!confirm(`Are you sure you want to delete the guide "${guide.title}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeletingId(guide.id);
    try {
      await onDelete(guide.id);
    } catch (error) {
      alert(`Delete failed: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-neutral-100 mt-6 p-6">
      <h3 className="font-bold text-lg mb-4 text-neutral-900">Existing Guides</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="px-4 py-3 font-semibold text-neutral-700">Title</th>
              <th className="px-4 py-3 font-semibold text-neutral-700">Category</th>
              <th className="px-4 py-3 font-semibold text-neutral-700">Model</th>
              <th className="px-4 py-3 font-semibold text-neutral-700">Difficulty</th>
              <th className="px-4 py-3 font-semibold text-neutral-700">Steps</th>
              <th className="px-4 py-3 font-semibold text-neutral-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(guides || []).map(guide => (
              <tr key={guide.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition">
                <td className="px-4 py-3 font-medium text-neutral-900 max-w-xs truncate">{guide.title}</td>
                <td className="px-4 py-3 text-neutral-600">{guide.category}</td>
                <td className="px-4 py-3 text-neutral-600">{guide.model || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    guide.difficulty === "Beginner" ? "bg-green-100 text-green-700" :
                    guide.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {guide.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {guide.steps?.length || 0}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                      onClick={() => onEdit(guide)}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleDelete(guide)}
                      disabled={deletingId === guide.id}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!guides || guides.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-neutral-400">
                  No guides published yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreatorGuideTable;

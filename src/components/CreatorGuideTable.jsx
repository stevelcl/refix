import React from "react";

const CreatorGuideTable = ({ guides, onEdit }) => (
  <div className="bg-white rounded-2xl shadow-md border border-neutral-100 mt-6 p-6">
    <h3 className="font-bold text-lg mb-4">Existing Guides</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead>
          <tr>
            <th className="px-4 py-2 font-semibold text-neutral-700">Title</th>
            <th className="px-4 py-2 font-semibold text-neutral-700">Category</th>
            <th className="px-4 py-2 font-semibold text-neutral-700">Model</th>
            <th className="px-4 py-2 font-semibold text-neutral-700">Difficulty</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {(guides || []).map(guide => (
            <tr key={guide.id} className="border-t border-neutral-100">
              <td className="px-4 py-2 font-medium text-neutral-900 max-w-xs truncate">{guide.title}</td>
              <td className="px-4 py-2">{guide.category}</td>
              <td className="px-4 py-2 text-neutral-600">{guide.model}</td>
              <td className="px-4 py-2">{guide.difficulty}</td>
              <td className="px-4 py-2">
                <button
                  className="px-3 py-1 rounded-lg bg-neutral-200 hover:bg-blue-600 hover:text-white transition text-sm font-semibold"
                  onClick={() => onEdit(guide)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
          {(!guides || guides.length === 0) && (
            <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-400">No guides published yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default CreatorGuideTable;

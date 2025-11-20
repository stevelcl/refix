import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";

const ModelRepairPage = () => {
  const { category, brand, model } = useParams();
  const navigate = useNavigate();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchParts();
  }, [category, brand, model]);

  const fetchParts = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiBase = import.meta.env.VITE_API_BASE;
      if (!apiBase) {
        throw new Error('API base URL not configured');
      }

      // Fetch parts for this model
      const response = await fetch(
        `${apiBase}/categories/${encodeURIComponent(category)}/brands/${encodeURIComponent(brand)}/models/${encodeURIComponent(model)}/parts`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch parts');
      }

      const data = await response.json();
      setParts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching parts:', err);
      setError(err.message);
      setParts([]);
    } finally {
      setLoading(false);
    }
  };

  const getPartIcon = (partName) => {
    const lower = partName.toLowerCase();
    if (lower.includes('screen') || lower.includes('display')) return '📱';
    if (lower.includes('battery')) return '🔋';
    if (lower.includes('speaker') || lower.includes('loudspeaker')) return '🔊';
    if (lower.includes('microphone') || lower.includes('mic')) return '🎤';
    if (lower.includes('camera')) return '📷';
    if (lower.includes('button')) return '🔘';
    if (lower.includes('port') || lower.includes('charging')) return '🔌';
    if (lower.includes('keyboard')) return '⌨️';
    if (lower.includes('touchpad') || lower.includes('trackpad')) return '🖱️';
    if (lower.includes('fan')) return '🌀';
    if (lower.includes('memory') || lower.includes('ram')) return '💾';
    if (lower.includes('storage') || lower.includes('ssd') || lower.includes('hard')) return '💿';
    if (lower.includes('wifi') || lower.includes('wireless')) return '📡';
    return '🔧';
  };

  const handlePartClick = (part) => {
    const route = `/device/${encodeURIComponent(category)}/${encodeURIComponent(brand)}/${encodeURIComponent(model)}/${encodeURIComponent(part)}`;
    navigate(route);
  };

  const breadcrumbItems = [
    { label: "Device", to: "/" },
    { label: category, to: `/device/${category}` },
    { label: brand, to: `/device/${category}/${brand}` },
    { label: model }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          {model} Repair
        </h1>
        <p className="text-neutral-600 mb-8">
          Select a part to view repair guides
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-neutral-500 mt-3">Loading parts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-3">⚠️</div>
            <p className="text-neutral-600">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        ) : parts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 mb-4">No parts found for {model}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {parts.map((part, idx) => (
              <div
                key={idx}
                onClick={() => handlePartClick(part)}
                className="bg-white rounded-xl shadow-md border border-neutral-200 p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group"
              >
                <div className="w-full h-24 flex items-center justify-center mb-4">
                  <span className="text-5xl">{getPartIcon(part)}</span>
                </div>
                <h3 className="text-base font-semibold text-neutral-900 text-center">
                  {part}
                </h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelRepairPage;


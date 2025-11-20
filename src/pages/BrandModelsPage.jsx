import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";

const BrandModelsPage = () => {
  const { category, brand } = useParams();
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModels();
  }, [category, brand]);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiBase = import.meta.env.VITE_API_BASE;
      if (!apiBase) {
        throw new Error('API base URL not configured');
      }

      // Fetch models for this brand
      const response = await fetch(`${apiBase}/categories/${encodeURIComponent(category)}/brands/${encodeURIComponent(brand)}/models`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      
      // Transform data - models can be strings or objects with {name, parts}
      const modelList = Array.isArray(data) ? data : [];
      setModels(modelList);
    } catch (err) {
      console.error('Error fetching models:', err);
      setError(err.message);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const getModelName = (model) => {
    return typeof model === 'string' ? model : model.name;
  };

  const getPartsCount = (model) => {
    if (typeof model === 'object' && model.parts && Array.isArray(model.parts)) {
      return model.parts.length;
    }
    return 0;
  };

  const handleModelClick = (model) => {
    const modelName = getModelName(model);
    const route = `/device/${encodeURIComponent(category)}/${encodeURIComponent(brand)}/${encodeURIComponent(modelName)}`;
    navigate(route);
  };

  const breadcrumbItems = [
    { label: "Device", to: "/" },
    { label: category, to: `/device/${category}` },
    { label: brand }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          {brand} Models
        </h1>
        <p className="text-neutral-600 mb-8">
          {loading ? 'Loading...' : `${models.length} models available`}
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-neutral-500 mt-3">Loading models...</p>
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
        ) : models.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 mb-4">No models found for {brand}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {models.map((model, idx) => {
              const modelName = getModelName(model);
              const partsCount = getPartsCount(model);
              
              return (
                <div
                  key={idx}
                  onClick={() => handleModelClick(model)}
                  className="bg-white rounded-xl shadow-md border border-neutral-200 p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group relative"
                >
                  <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">📱</span>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 text-center mb-2">
                    {modelName}
                  </h3>
                  {partsCount > 0 && (
                    <div className="text-center">
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {partsCount} parts available
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandModelsPage;

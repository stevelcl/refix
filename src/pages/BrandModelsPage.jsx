import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";

const BrandModelsPage = () => {
  const { category, brand } = useParams();
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brandParts, setBrandParts] = useState([]);

  useEffect(() => {
    fetchModels();
  }, [category, brand]);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    setBrandParts([]);
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
      
      // If no models found, check if there are parts that might have been added incorrectly
      if (modelList.length === 0) {
        try {
          // Fetch brand info to check for parts
          const brandsResponse = await fetch(`${apiBase}/categories/${encodeURIComponent(category)}/brands`);
          if (brandsResponse.ok) {
            const brands = await brandsResponse.json();
            const brandInfo = Array.isArray(brands) ? brands.find(b => {
              const brandName = typeof b === 'string' ? b : (b?.name || '');
              return brandName.toLowerCase() === brand.toLowerCase();
            }) : null;
            
            // If brand has parts but no models, store parts for display
            if (brandInfo && typeof brandInfo === 'object' && brandInfo.parts && Array.isArray(brandInfo.parts) && brandInfo.parts.length > 0) {
              setBrandParts(brandInfo.parts);
            }
          }
        } catch (partsErr) {
          // Ignore error, just proceed with empty models
          console.log('Could not fetch brand parts info:', partsErr);
        }
      }
      
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
            
            {/* Show helpful message if parts exist but no models */}
            {brandParts.length > 0 && (
              <div className="max-w-2xl mx-auto mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-yellow-800 mb-3">
                  <p className="font-semibold mb-2">💡 提示：检测到 Parts 但未找到 Models</p>
                  <p className="text-sm mb-3">
                    您已为 <strong>{brand}</strong> 添加了以下 Parts，但这些是零件，不是型号。要显示型号，请在管理后台的 "Models" 部分添加型号（如 "predator"）。
                  </p>
                  <div className="text-left bg-white p-3 rounded border border-yellow-300">
                    <p className="text-xs font-semibold text-yellow-900 mb-2">当前 Parts 列表：</p>
                    <div className="flex flex-wrap gap-2">
                      {brandParts.map((part, idx) => (
                        <span key={idx} className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-yellow-700 mt-3">
                    <strong>解决方案：</strong> 在管理后台，找到 "{brand}" 品牌，在 "Add Model" 输入框中输入型号名称（如 "predator"），然后点击 "Add Model" 按钮。
                  </p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => navigate(-1)}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

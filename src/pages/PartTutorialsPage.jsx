import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import TutorialCard from "../components/TutorialCard";

const PartTutorialsPage = () => {
  const { category, brand, model, part } = useParams();
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTutorials();
  }, [category, brand, model, part]);

  const fetchTutorials = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiBase = import.meta.env.VITE_API_BASE;
      if (!apiBase) {
        throw new Error('API base URL not configured');
      }

      // Build query parameters
      const params = new URLSearchParams({
        category,
        brand,
        model,
        part
      });

      const response = await fetch(`${apiBase}/tutorials/by-part?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tutorials');
      }

      const data = await response.json();
      setTutorials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tutorials:', err);
      setError(err.message);
      setTutorials([]);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Device", to: "/" },
    { label: category, to: `/device/${category}` },
    { label: brand, to: `/device/${category}/${brand}` },
    { label: model, to: `/device/${category}/${brand}/${model}` },
    { label: part }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {model} - {part} Repair
          </h1>
          <p className="text-neutral-600">
            {loading ? 'Loading tutorials...' : `${tutorials.length} repair guide${tutorials.length !== 1 ? 's' : ''} available`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-neutral-500 mt-3">Loading tutorials...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-3 text-4xl">⚠️</div>
            <p className="text-neutral-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        ) : tutorials.length === 0 ? (
          <div className="text-center py-12 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-300">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              No tutorials available yet
            </h2>
            <p className="text-neutral-600 mb-6">
              There are no repair guides for {model} {part} at the moment.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300"
              >
                Go Back
              </button>
              <button
                onClick={() => navigate('/tutorials')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Browse All Tutorials
              </button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                onClick={() => navigate(`/tutorials/${tutorial.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartTutorialsPage;

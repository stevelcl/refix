import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listTutorials } from "../azure";
import TutorialCard from "../components/TutorialCard";
import SearchBar from "../components/SearchBar";

const TutorialsPage = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  // Hierarchy filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedPart, setSelectedPart] = useState("");
  const [search, setSearch] = useState("");
  
  // Cascading data
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [availableParts, setAvailableParts] = useState([]);
  
  const [params] = useSearchParams();

  // Fetch tutorial categories for filters
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE;
        if (apiBase) {
          const response = await fetch(`${apiBase}/categories`);
          if (response.ok) {
            const data = await response.json();
            setCategories(data || []);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Handle URL parameters
  useEffect(() => {
    const catFromQ = params.get("category");
    const brandFromQ = params.get("brand");
    const modelFromQ = params.get("model");
    const partFromQ = params.get("part");
    const searchFromQ = params.get("search");
    
    if (catFromQ) setSelectedCategory(catFromQ);
    if (brandFromQ) setSelectedBrand(brandFromQ);
    if (modelFromQ) setSelectedModel(modelFromQ);
    if (partFromQ) setSelectedPart(partFromQ);
    if (searchFromQ) setSearch(searchFromQ);
  }, [params]);

  // Update available brands when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory !== "All") {
      const category = categories.find(c => c.name === selectedCategory);
      if (category && category.subcategories) {
        setAvailableBrands(category.subcategories);
      } else {
        setAvailableBrands([]);
      }
      setSelectedBrand("");
      setSelectedModel("");
      setSelectedPart("");
    } else {
      setAvailableBrands([]);
      setSelectedBrand("");
      setSelectedModel("");
      setSelectedPart("");
    }
  }, [selectedCategory, categories]);

  // Update available models when brand changes
  useEffect(() => {
    if (selectedBrand && availableBrands.length > 0) {
      const brand = availableBrands.find(b => b.name === selectedBrand);
      if (brand && brand.models) {
        setAvailableModels(brand.models);
        // Don't set parts from brand - parts are model-specific
        setAvailableParts([]);
      } else {
        setAvailableModels([]);
        setAvailableParts([]);
      }
      setSelectedModel("");
      setSelectedPart("");
    } else {
      setAvailableModels([]);
      setAvailableParts([]);
    }
  }, [selectedBrand, availableBrands]);

  // Update available parts when model changes
  useEffect(() => {
    if (selectedModel && availableModels.length > 0) {
      const model = availableModels.find(m => {
        const modelName = typeof m === 'string' ? m : m.name;
        return modelName === selectedModel;
      });
      if (model && typeof model === 'object' && model.parts) {
        setAvailableParts(model.parts);
      }
      setSelectedPart("");
    }
  }, [selectedModel, availableModels]);

  // Fetch tutorials with filters
  useEffect(() => {
    async function fetchGuides() {
      setLoading(true);
      const filters = {
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        brand: selectedBrand || undefined,
        model: selectedModel || undefined,
        part: selectedPart || undefined,
        search: search || undefined
      };
      const items = await listTutorials(filters);
      setGuides(items || []);
      setLoading(false);
    }
    fetchGuides();
  }, [selectedCategory, selectedBrand, selectedModel, selectedPart, search]);

  const categoryOptions = categories.length > 0
    ? categories.map(c => c.name)
    : ["Phones", "Tablets", "Laptops", "Other"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Browse Repair Guides</h1>
      
      {/* Hierarchical Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="input w-full"
            >
              <option value="All">All Categories</option>
              {categoryOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Brand / OS</label>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              disabled={!selectedCategory || selectedCategory === "All" || availableBrands.length === 0}
              className="input w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Brands</option>
              {availableBrands.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Model Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Model</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              disabled={!selectedBrand || availableModels.length === 0}
              className="input w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Models</option>
              {availableModels.map((m, idx) => {
                const modelName = typeof m === 'string' ? m : m.name;
                return <option key={idx} value={modelName}>{modelName}</option>;
              })}
            </select>
          </div>

          {/* Part Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Part</label>
            <select
              value={selectedPart}
              onChange={e => setSelectedPart(e.target.value)}
              disabled={availableParts.length === 0}
              className="input w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Parts</option>
              {availableParts.map((part, idx) => (
                <option key={idx} value={part}>{part}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <SearchBar 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by title or description…" 
          />
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== "All" || selectedBrand || selectedModel || selectedPart || search) && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-neutral-600">Active filters:</span>
            {selectedCategory !== "All" && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {selectedCategory}
              </span>
            )}
            {selectedBrand && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {selectedBrand}
              </span>
            )}
            {selectedModel && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {selectedModel}
              </span>
            )}
            {selectedPart && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                {selectedPart}
              </span>
            )}
            {search && (
              <span className="px-3 py-1 bg-neutral-100 text-neutral-800 rounded-full text-sm">
                "{search}"
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedBrand("");
                setSelectedModel("");
                setSelectedPart("");
                setSearch("");
              }}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-neutral-600">
          {loading ? 'Loading...' : `${guides.length} guide${guides.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-neutral-500 mt-3">Loading guides...</p>
          </div>
        ) : guides.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-neutral-500">No guides found matching your criteria.</p>
          </div>
        ) : (
          guides.map(guide => (
            <TutorialCard key={guide.id} id={guide.id} {...guide} summary={guide.summary} />
          ))
        )}
      </div>
    </div>
  );
};

export default TutorialsPage;


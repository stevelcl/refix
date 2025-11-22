import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import { findCategoryByKeyword, buildDeviceRoute } from "../utils/catalog";

const AndroidPhonePage = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);

  useEffect(() => {
    const loadModels = async () => {
      // Try to load from an optional backend API if configured
      const apiBase = import.meta.env.VITE_API_BASE;
      // Try to fetch categories and derive models for the Android brand under the phone category
      if (apiBase) {
        try {
          const catsRes = await fetch(`${apiBase.replace(/\/$/, '')}/api/categories`);
          if (catsRes.ok) {
            const cats = await catsRes.json();
            // find phone category by keyword
            const phoneCat = findCategoryByKeyword(cats, 'phone') || cats.find(c => (c.id || '').toLowerCase().includes('phone')) || cats[0];
            if (phoneCat && phoneCat.subcategories && phoneCat.subcategories.length) {
              // find Android brand robustly by name or slug
              const brandMatch = phoneCat.subcategories.find(s => {
                const name = (s.name || '').toString().toLowerCase();
                const id = (s.id || '').toString().toLowerCase();
                const requested = 'android';
                const slug = requested.replace(/[^a-z0-9]+/g, '-');
                const normalize = (str) => str.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                return name === requested || id === requested || normalize(name) === normalize(requested) || normalize(id) === normalize(requested);
              });
              if (brandMatch && brandMatch.models && brandMatch.models.length) {
                const mapped = brandMatch.models.map(m => typeof m === 'string' ? { name: m } : m);
                setModels(mapped);
                return;
              }
            }
          }
        } catch (err) {
          // fall through to other fetches
        }
      }
      if (apiBase) {
        try {
          // Fetch models from the backend categories API. Expect models as array of strings or objects { name, imageUrl }
          const categoryName = 'Phone';
          const brandName = 'Android';
          const url = `${apiBase.replace(/\/$/, '')}/api/categories/${encodeURIComponent(categoryName)}/brands/${encodeURIComponent(brandName)}/models`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setModels(data);
              return;
            }
          }
        } catch (e) {
          // fall through to defaults
        }
      }
      // Fallback defaults if no backend
      setModels(["Samsung Galaxy S22", "Google Pixel", "OnePlus", "Xiaomi"]);
    };
    loadModels();
  }, []);

  const makeSlug = (entry) => {
    // Prefer explicit id if available
    const raw = (entry && (entry.id || entry.name || entry)) || '';
    const s = raw.toString().toLowerCase().trim();
    return encodeURIComponent(s.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[
        { label: "Device", to: "/" },
        { label: "Phone", to: "/device/phone" },
        { label: "Android Phone" }
      ]} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Android Phone Repair</h1>
        <select className="mb-6 input md:w-64" onChange={(e) => e.target.value && navigate(e.target.value)}>
          <option value="">Choose your Android Phone</option>
          {models.map((modelEntry) => {
            const modelName = typeof modelEntry === 'string' ? modelEntry : modelEntry.name;
            const slug = makeSlug(modelEntry);
            const route = `/device/phone/android/${slug}`;
            return <option key={slug} value={route}>{modelName}</option>;
          })}
        </select>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {models.map((modelEntry) => {
            const modelName = typeof modelEntry === 'string' ? modelEntry : modelEntry.name;
            const imageUrl = typeof modelEntry === 'object' ? modelEntry.imageUrl : null;
            return (
              <div
                key={modelName}
                onClick={() => {
                  const slug = makeSlug(modelEntry);
                  navigate(`/device/phone/android/${slug}`);
                }}
                className="bg-white rounded-xl shadow-md border border-neutral-200 p-6 flex flex-col items-center cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group"
              >
                <div className="w-24 h-32 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg mb-3 flex items-center justify-center">
                  {imageUrl ? (
                      <img src={imageUrl} alt={modelName} style={{ width: 72, height: 96, objectFit: 'contain' }} />
                    ) : (
                      <span className="text-2xl">📱</span>
                    )}
                </div>
                <h3 className="text-base font-semibold text-neutral-900 text-center">{modelName}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AndroidPhonePage;


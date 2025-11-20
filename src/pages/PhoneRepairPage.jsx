import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import { getPublicSubcategories } from "../azure";

const FALLBACK_BRANDS = [
  { name: "Apple iPhone", route: "/device/phone/apple-iphone", icon: "🍎" },
  { name: "Android Phone", route: "/device/phone/android", icon: "🤖" }
];

const PhoneRepairPage = ({ showAndroid = false }) => {
  const navigate = useNavigate();
  const [androidModels, setAndroidModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!showAndroid) {
      fetchPhoneBrands();
    }
  }, [showAndroid]);

  const fetchPhoneBrands = async () => {
    try {
      // Try to fetch "Phone" category subcategories
      // First, get all public categories to find the Phone category ID
      const { getPublicCategories } = await import("../azure");
      const allCategories = await getPublicCategories();
      const phoneCategory = allCategories.find(c => 
        c.name.toLowerCase().includes('phone') && !c.parentId
      );

      if (phoneCategory) {
        const subcats = await getPublicSubcategories(phoneCategory.id);
        if (subcats && subcats.length > 0) {
          const transformed = subcats
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map(sub => ({
              name: sub.name,
              route: sub.path || `/device/phone/${sub.name.toLowerCase().replace(/\s+/g, '-')}`,
              icon: sub.imageUrl ? null : (sub.icon || "📱"),
              imageUrl: sub.imageUrl
            }));
          setBrands(transformed);
        } else {
          setBrands(FALLBACK_BRANDS);
        }
      } else {
        setBrands(FALLBACK_BRANDS);
      }
    } catch (error) {
      console.error('Failed to fetch phone brands:', error);
      setBrands(FALLBACK_BRANDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showAndroid) {
      const fetchAndroidModels = async () => {
        const apiBase = import.meta.env.VITE_API_BASE;
        if (apiBase) {
          try {
            const res = await fetch(`${apiBase.replace(/\/$/, "")}/models?category=Phones&platform=Android`);
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) {
                setAndroidModels(data);
                return;
              }
            }
          } catch (error) {
            // fall through
          }
        }
        setAndroidModels(["Samsung Galaxy", "Google Pixel", "OnePlus"]);
      };
      fetchAndroidModels();
    }
  }, [showAndroid]);

  if (showAndroid) {
    return (
      <div className="min-h-screen bg-white">
        <Breadcrumb items={[
          { label: "Device", to: "/" },
          { label: "Phone", to: "/device/phone" },
          { label: "Android Phone" }
        ]} />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-neutral-900 mb-8">Android Phone Repair</h1>
          <select className="mb-6 input md:w-64">
            <option>Choose your Android Phone</option>
            {androidModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {androidModels.map((model) => (
              <div
                key={model}
                onClick={() => navigate(`/device/phone/android/${model.toLowerCase().replace(/\s+/g, '-')}`)}
                className="bg-white rounded-xl shadow-md border border-neutral-200 p-6 flex flex-col items-center cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group"
              >
                <div className="w-24 h-32 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-base font-semibold text-neutral-900 text-center">{model}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[
        { label: "Device", to: "/" },
        { label: "Phone" }
      ]} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Phone Repair</h1>
        <p className="text-neutral-600 mb-8">{brands.length} Categories</p>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-neutral-500 mt-3">Loading brands...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {brands.map((brand) => (
              <div
                key={brand.name}
                onClick={() => navigate(brand.route)}
                className="bg-white rounded-xl shadow-md border border-neutral-200 p-8 flex flex-col items-center cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group"
              >
                {brand.imageUrl ? (
                  <img src={brand.imageUrl} alt={brand.name} className="w-16 h-16 object-contain mb-4" />
                ) : (
                  <div className="text-6xl mb-4">{brand.icon}</div>
                )}
                <h3 className="text-xl font-semibold text-neutral-900">{brand.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneRepairPage;


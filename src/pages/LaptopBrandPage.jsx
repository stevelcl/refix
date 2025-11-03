import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listTutorials } from "../azure";
import Breadcrumb from "../components/Breadcrumb";

const LaptopBrandPage = () => {
  const { brand } = useParams();
  const navigate = useNavigate();
  const [models, setModels] = useState([]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        // Fetch unique models from tutorials for this brand
        const allTutorials = await listTutorials({ category: "Laptops" });
        
        // Filter by brand (assuming model names contain brand)
        const brandModels = [...new Set(
          allTutorials
            .filter(t => t.model?.toLowerCase().includes(brand.toLowerCase()))
            .map(t => t.model)
        )];
        
        if (brandModels.length === 0) {
          // Use default models if none found
          const defaults = {
            asus: ["Asus ROG Laptop", "Asus ZenBook", "Asus VivoBook"],
            acer: ["Acer Predator", "Acer Aspire", "Acer Nitro"],
            hp: ["HP Pavilion", "HP EliteBook", "HP Spectre"],
            mac: ["MacBook Pro", "MacBook Air", "MacBook"]
          };
          setModels(defaults[brand.toLowerCase()] || []);
        } else {
          setModels(brandModels);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
        // Fallback to defaults
        const defaults = {
          asus: ["Asus ROG Laptop", "Asus ZenBook", "Asus VivoBook"],
          acer: ["Acer Predator", "Acer Aspire"],
          hp: ["HP Pavilion", "HP EliteBook"],
          mac: ["MacBook Pro", "MacBook Air"]
        };
        setModels(defaults[brand.toLowerCase()] || []);
      }
    };
    fetchModels();
  }, [brand]);

  const formatBrandName = (name) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[
        { label: "Device", to: "/" },
        { label: "PC Laptop", to: "/device/laptop" },
        { label: formatBrandName(brand) }
      ]} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">
          {formatBrandName(brand)} Repair
        </h1>
        <select className="mb-6 input md:w-64">
          <option>Choose your {formatBrandName(brand)}</option>
          {models.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {models.map((model) => (
            <div
              key={model}
              onClick={() => navigate(`/device/laptop/${brand}/${model.toLowerCase().replace(/\s+/g, '-')}`)}
              className="bg-white rounded-xl shadow-md border border-neutral-200 p-6 flex flex-col items-center cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group"
            >
              <div className="w-32 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-3xl">💻</span>
              </div>
              <h3 className="text-base font-semibold text-neutral-900 text-center">{model}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LaptopBrandPage;


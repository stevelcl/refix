import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listTutorials } from "../azure";
import Breadcrumb from "../components/Breadcrumb";

const AndroidPhonePage = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);

  useEffect(() => {
    const fetchAndroidModels = async () => {
      try {
        const tutorials = await listTutorials({ category: "Phones" });
        const allModels = (tutorials || []).map(t => t.model).filter(Boolean);
        const androidModels = [...new Set(
          allModels.filter(model => 
            !model.toLowerCase().includes("iphone") && 
            !model.toLowerCase().includes("apple")
          )
        )];
        setModels(androidModels.length > 0 ? androidModels : ["Samsung Galaxy S22", "Google Pixel", "OnePlus", "Xiaomi"]);
      } catch (error) {
        setModels(["Samsung Galaxy S22", "Google Pixel", "OnePlus", "Xiaomi"]);
      }
    };
    fetchAndroidModels();
  }, []);

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
          {models.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {models.map((model) => (
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
};

export default AndroidPhonePage;


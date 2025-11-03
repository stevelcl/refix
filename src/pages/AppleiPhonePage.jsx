import React from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";

const AppleiPhonePage = () => {
  const navigate = useNavigate();

  const models = [
    "iPhone 13",
    "iPhone 13 Pro",
    "iPhone 13 Pro Max",
    "iPhone 14",
    "iPhone 14 Pro Max",
    "iPhone 15",
    "iPhone 16"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[
        { label: "Device", to: "/" },
        { label: "Phone", to: "/device/phone" },
        { label: "Apple iPhone" }
      ]} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Apple iPhone Repair</h1>
        <select className="mb-6 input md:w-64">
          <option>Choose your iPhone model</option>
          {models.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {models.map((model) => (
            <div
              key={model}
              onClick={() => navigate(`/device/phone/apple-iphone/${model.toLowerCase().replace(/\s+/g, '-')}`)}
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

export default AppleiPhonePage;


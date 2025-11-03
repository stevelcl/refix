import React from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";

const LaptopRepairPage = () => {
  const navigate = useNavigate();

  const brands = [
    { name: "Asus Laptop", route: "/device/laptop/asus", icon: "💻" },
    { name: "Acer Laptop", route: "/device/laptop/acer", icon: "💻" },
    { name: "HP Laptop", route: "/device/laptop/hp", icon: "💻" },
    { name: "Mac", route: "/device/laptop/mac", icon: "🍎" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[
        { label: "Device", to: "/" },
        { label: "PC Laptop" }
      ]} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">PC Laptop Repair</h1>
        <p className="text-neutral-600 mb-8">{brands.length} Categories</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.name}
              onClick={() => navigate(brand.route)}
              className="bg-white rounded-xl shadow-md border border-neutral-200 p-8 flex flex-col items-center cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group"
            >
              <div className="text-6xl mb-4">{brand.icon}</div>
              <h3 className="text-xl font-semibold text-neutral-900 text-center">{brand.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LaptopRepairPage;


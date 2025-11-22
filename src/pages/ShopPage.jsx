import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";

const StoreCategoriesPage = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'android',
      name: 'Android Parts',
      icon: '🤖',
      description: 'Parts for Android phones',
      color: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-300'
    },
    {
      id: 'iphone',
      name: 'iPhone Parts',
      icon: '🍎',
      description: 'Parts for Apple iPhones',
      color: 'from-slate-50 to-gray-50',
      borderColor: 'border-slate-300'
    },
    {
      id: 'laptop',
      name: 'Laptop Parts',
      icon: '💻',
      description: 'Parts for Windows & Linux laptops',
      color: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-300'
    },
    {
      id: 'mac',
      name: 'Mac Parts',
      icon: '🍎',
      description: 'Parts for MacBooks',
      color: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-300'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "Spare Parts Store", to: "/store/categories" },
          { label: "Categories" }
        ]}
      />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Spare Parts Store</h1>
          <p className="text-neutral-600">Browse parts by device category</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => navigate(`/store/products/${category.id}`)}
              className={`bg-gradient-to-br ${category.color} rounded-xl border-2 ${category.borderColor} p-8 flex flex-col items-center cursor-pointer hover:shadow-lg transition-all group relative`}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2 text-center">
                {category.name}
              </h3>
              <p className="text-sm text-neutral-600 text-center mb-6">
                {category.description}
              </p>
              <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreCategoriesPage;

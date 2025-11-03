import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Smartphone, Laptop, Monitor } from "lucide-react";
import heroBackground from '../assets/4fbcc306fecdeb4dcd083583022be42ce5567ffe.png';

const CATEGORIES = [
  {
    name: "Phone",
    route: "/device/phone",
    icon: <Smartphone className="w-16 h-16" />
  },
  {
    name: "PC / Laptop",
    route: "/device/laptop",
    icon: <Laptop className="w-16 h-16" />
  },
  {
    name: "Mac",
    route: "/device/more",
    icon: <Monitor className="w-16 h-16" />
  }
];

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/tutorials?search=${encodeURIComponent(search)}`);
    }
  };

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner with background image */}
      <section className="relative text-white overflow-hidden">
        {/* Background image */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
            backgroundRepeat: 'no-repeat',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            willChange: 'auto'
          }}
        ></div>
        {/* Subtle dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/30"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-8" style={{ fontFamily: 'serif' }}>
              Discover. Connect. Repair — all in one place.
            </h1>
            
            {/* Search Bar in Hero Section */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mt-8">
              <div className="flex items-center bg-white rounded-full px-6 py-4 shadow-lg">
                <Search className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Try 'Screen Replacement Guidelines'"
                  className="flex-1 outline-none bg-transparent text-base text-neutral-800 placeholder-neutral-400"
                  autoComplete="off"
                />
                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="ml-3 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Device Selection */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="border-t border-neutral-200 pt-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Choose a device you need to fix.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            {CATEGORIES.map((category) => (
              <div
                key={category.name}
                onClick={() => navigate(category.route)}
                className="bg-neutral-50 rounded-xl border border-neutral-200 p-8 flex flex-col items-center cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group relative"
              >
                <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">{category.name}</h3>
                <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <p className="text-sm text-neutral-500 text-center">
            More options will be coming soon...
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;



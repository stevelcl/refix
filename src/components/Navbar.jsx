import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from '../assets/logo.png';
import SubscribeModal from './SubscribeModal';

const Navbar = () => {
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

  return (
    <>
      <nav className="w-full bg-[#2C3E50] shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center relative px-6 py-4">
          {/* Logo centered */}
          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
            <img
              src={logo}
              alt="ReFix Logo"
              className="h-16 w-auto object-contain brightness-0 invert"
            />
          </Link>
          {/* Right side elements */}
          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={() => setIsSubscribeModalOpen(true)}
              className="bg-transparent text-white text-sm border border-white/30 rounded px-4 py-1.5 hover:bg-white/10 transition"
            >
              Subscribe
            </button>
            <select className="bg-transparent text-white text-sm border border-white/30 rounded px-3 py-1.5 outline-none cursor-pointer">
              <option value="en" className="bg-[#2C3E50]">Language</option>
              <option value="en" className="bg-[#2C3E50]">English</option>
            </select>
            <button className="bg-white text-[#2C3E50] px-4 py-1.5 rounded text-sm font-medium hover:bg-neutral-100 transition">
              Log in
            </button>
        </div>
      </div>
    </nav>
      <SubscribeModal 
        isOpen={isSubscribeModalOpen} 
        onClose={() => setIsSubscribeModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;


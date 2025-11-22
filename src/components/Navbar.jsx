import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import logo from '../assets/logo.png';
import SubscribeModal from './SubscribeModal';
import CartModal from './CartModal';
import { useSite } from '../context/SiteContext';

const Navbar = () => {
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const { cartItems } = useSite();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
            {/* Shopping Cart Icon */}
            <button
              onClick={() => setIsCartModalOpen(true)}
              className="relative bg-transparent text-white hover:bg-white/10 transition rounded p-2"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
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
      <CartModal 
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
      />
    </>
  );
};

export default Navbar;


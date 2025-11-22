import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Smartphone, Laptop, Monitor } from "lucide-react";
import heroBackground from '../assets/4fbcc306fecdeb4dcd083583022be42ce5567ffe.png';
import { getPublicCategories, getProducts } from '../azure';
import { useSite } from '../context/SiteContext';

// Note: Public categories are now fetched from the backend (unified categories).
// Removed hardcoded fallback so UI reflects backend state (empty DB => no categories shown).

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [addedProductId, setAddedProductId] = useState(null);
  const { addToCart } = useSite();

  useEffect(() => {
    fetchCategories();
    fetchProductsData();
  }, []);

  const fetchCategories = async () => {
    try {
      const cats = await getPublicCategories();
      if (cats && cats.length > 0) {
        // Transform API categories to match component structure
        const transformed = cats
          .filter(c => !c.parentId) // Only top-level categories
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .map(cat => ({
            name: cat.name,
            route: cat.path,
            icon: cat.imageUrl ? (
              <img src={cat.imageUrl} alt={cat.name} className="w-16 h-16 object-contain" />
            ) : (
              <span className="text-6xl">{cat.icon}</span>
            ),
            iconType: cat.imageUrl ? 'image' : 'emoji'
          }));
        setCategories(transformed);
      } else {
        // No categories returned from API - show empty list so UI can indicate "no devices found"
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsData = async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/tutorials?search=${encodeURIComponent(search)}`);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
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
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-neutral-500 mt-3">Loading categories...</p>
            </div>
          ) : (
            <>
              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-500">No devices found.</p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-3 gap-8 mb-6">
                    {categories.map((category) => (
                      <div
                        key={category.name}
                        onClick={() => navigate(category.route)}
                        className="bg-neutral-50 rounded-xl border border-neutral-200 p-8 flex flex-col items-center cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group relative"
                      >
                        <div className={`text-blue-600 mb-4 group-hover:scale-110 transition-transform ${category.iconType === 'emoji' ? '' : 'flex items-center justify-center'}`}>
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
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Spare Parts Store Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-neutral-200">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Spare Parts Store</h2>
          <p className="text-neutral-600 mb-8">Shop genuine replacement parts for your devices</p>
          
          {productsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-neutral-500 mt-3">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500 mb-4">No products available at this time</p>
              <button
                onClick={() => navigate('/shop')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View Shop
              </button>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {products.slice(0, 8).map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md border border-neutral-200 overflow-hidden hover:shadow-lg transition-all"
                  >
                    {/* Product Image */}
                    <div className="w-full h-40 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="text-3xl">📦</span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-neutral-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-neutral-600 text-xs mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-blue-600">
                          RM {product.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`px-3 py-1 rounded text-xs transition font-medium ${
                            addedProductId === product.id
                              ? 'bg-green-600 text-white'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {addedProductId === product.id ? '✓' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {products.length > 8 && (
                <div className="text-center">
                  <button
                    onClick={() => navigate('/shop')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View All Products
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;



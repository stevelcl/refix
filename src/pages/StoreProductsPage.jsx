import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import { getProducts } from "../azure";
import { useSite } from "../context/SiteContext";

const StoreProductsPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedProductId, setAddedProductId] = useState(null);
  const { addToCart } = useSite();

  const categoryInfo = {
    android: {
      name: 'Android Parts',
      icon: '🤖',
      description: 'Parts for Android phones'
    },
    iphone: {
      name: 'iPhone Parts',
      icon: '🍎',
      description: 'Parts for Apple iPhones'
    },
    laptop: {
      name: 'Laptop Parts',
      icon: '💻',
      description: 'Parts for Windows & Linux laptops'
    },
    mac: {
      name: 'Mac Parts',
      icon: '🍎',
      description: 'Parts for MacBooks'
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      const allProducts = Array.isArray(data) ? data : [];
      setProducts(allProducts);

      // Filter products by category
      const filtered = allProducts.filter(product => {
        const urlCategory = category.toLowerCase();
        const productCategory = (product.category || '').toLowerCase();
        
        // Map URL slugs to database category names (case-insensitive)
        const categoryMap = {
          'android': 'android parts',
          'iphone': 'iphone parts',
          'laptop': 'laptop parts',
          'mac': 'mac parts'
        };

        const expectedCategory = categoryMap[urlCategory];
        
        // Check if product category matches (direct field comparison)
        if (expectedCategory && productCategory === expectedCategory) {
          return true;
        }

        // Fallback to name/description matching for backwards compatibility
        const productName = (product.name || '').toLowerCase();
        const productDesc = (product.description || '').toLowerCase();

        switch (urlCategory) {
          case 'android':
            return productName.includes('android') || productDesc.includes('android');
          case 'iphone':
            return productName.includes('iphone') || productName.includes('apple') || productDesc.includes('iphone') || productDesc.includes('apple');
          case 'laptop':
            return productName.includes('laptop') || productName.includes('windows') || productDesc.includes('laptop') || productDesc.includes('windows');
          case 'mac':
            return productName.includes('mac') || productDesc.includes('mac');
          default:
            return true;
        }
      });

      setFilteredProducts(filtered);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const catInfo = categoryInfo[category] || { name: 'Products', icon: '📦', description: '' };

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "Spare Parts Store", to: "/store/categories" },
          { label: catInfo.name }
        ]}
      />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center gap-4">
          <span className="text-5xl">{catInfo.icon}</span>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">{catInfo.name}</h1>
            <p className="text-neutral-600">{catInfo.description}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-neutral-500 mt-3">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-3">⚠️</div>
            <p className="text-neutral-600">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 mb-4">No {catInfo.name.toLowerCase()} available at this time</p>
            <button
              onClick={() => navigate('/store/categories')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Categories
            </button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md border border-neutral-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Product Image */}
                  <div className="w-full h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        RM {product.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                          addedProductId === product.id
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {addedProductId === product.id ? '✓ Added' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => navigate('/store/categories')}
                className="px-6 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition"
              >
                Back to Categories
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StoreProductsPage;

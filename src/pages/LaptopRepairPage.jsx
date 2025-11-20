import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import { getCategories } from "../azure";
import { buildDeviceRoute, findCategoryByKeyword, sortSubcategories } from "../utils/catalog";

const FALLBACK_LAPTOP_BRANDS = [
  { name: "Asus Laptop", route: "/device/laptop/asus", icon: "💻" },
  { name: "Acer Laptop", route: "/device/laptop/acer", icon: "💻" },
  { name: "HP Laptop", route: "/device/laptop/hp", icon: "💻" },
  { name: "Mac", route: "/device/laptop/mac", icon: "🍎" }
];

const LaptopRepairPage = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState(FALLBACK_LAPTOP_BRANDS);
  const [categoryName, setCategoryName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaptopBrands();
  }, []);

  const fetchLaptopBrands = async () => {
    try {
      const categories = await getCategories();
      const laptopCategory = findCategoryByKeyword(categories, "laptop");

      if (laptopCategory && laptopCategory.subcategories?.length) {
        setCategoryName(laptopCategory.name);
        const transformed = sortSubcategories(laptopCategory.subcategories).map((sub) => ({
          id: sub.id || sub.name,
          name: sub.name,
          route: buildDeviceRoute(laptopCategory.name, sub.name),
          icon: "💻",
          imageUrl: sub.imageUrl || null
        }));
        setBrands(transformed);
      } else {
        setCategoryName(null);
        setBrands(FALLBACK_LAPTOP_BRANDS);
      }
    } catch (error) {
      console.error("Failed to fetch laptop brands:", error);
      setCategoryName(null);
      setBrands(FALLBACK_LAPTOP_BRANDS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[
        { label: "Device", to: "/" },
        { label: "PC Laptop" }
      ]} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">PC Laptop Repair</h1>
        <p className="text-neutral-600 mb-8">{brands.length} Categories</p>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-neutral-500 mt-3">Loading laptop brands...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <div
                key={brand.name}
                onClick={() => navigate(brand.route || buildDeviceRoute(categoryName || "Laptops", brand.name))}
                className="bg-white rounded-xl shadow-md border border-neutral-200 p-8 flex flex-col items-center cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group"
              >
                {brand.imageUrl ? (
                  <img src={brand.imageUrl} alt={brand.name} className="w-16 h-16 object-contain mb-4" />
                ) : (
                  <div className="text-6xl mb-4">{brand.icon || "💻"}</div>
                )}
                <h3 className="text-xl font-semibold text-neutral-900 text-center">{brand.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LaptopRepairPage;


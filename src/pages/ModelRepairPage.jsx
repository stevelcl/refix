import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Breadcrumb from "../components/Breadcrumb";

const ModelRepairPage = () => {
  const { brand, model } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [repairTypes, setRepairTypes] = useState([]);
  const [deviceImage, setDeviceImage] = useState("");

  // Extract category and brand from URL path
  let category = "unknown";
  let detectedBrand = brand;
  
  if (location.pathname.includes("/phone/")) {
    category = "phone";
    if (location.pathname.includes("/apple-iphone/")) {
      detectedBrand = "apple-iphone";
    } else if (location.pathname.includes("/android/")) {
      detectedBrand = "android";
    }
  } else if (location.pathname.includes("/laptop/")) {
    category = "laptop";
  }

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        // Fetch tutorials for this specific model
        const modelName = decodeURIComponent(model).replace(/-/g, " ");
        const q = query(
          collection(db, "tutorials"),
          where("model", "==", modelName)
        );
        const snapshot = await getDocs(q);
        const repairs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Group by repair type (extract from title)
        const types = repairs.map(r => ({
          id: r.id,
          title: r.title,
          thumbnailUrl: r.thumbnailUrl,
          type: extractRepairType(r.title)
        }));
        
        setRepairTypes(types);
        if (repairs.length > 0 && repairs[0].thumbnailUrl) {
          setDeviceImage(repairs[0].thumbnailUrl);
        }
      } catch (error) {
        console.error("Error fetching repairs:", error);
      }
    };
    if (model) {
      fetchRepairs();
    }
  }, [model]);

  const extractRepairType = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes("screen") || lower.includes("display")) return "Screen";
    if (lower.includes("battery")) return "Battery";
    if (lower.includes("loudspeaker") || lower.includes("speaker")) return "Loudspeaker";
    if (lower.includes("microphone")) return "Microphone";
    if (lower.includes("keyboard")) return "Keyboard Keys";
    if (lower.includes("fan")) return "Fan";
    return "Other";
  };

  const formatModelName = (name) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getCategoryLabel = () => {
    if (category === "phone") return "Phone";
    if (category === "laptop") return "PC Laptop";
    return category;
  };

  // Build breadcrumb based on URL structure
  const buildBreadcrumb = () => {
    const items = [{ label: "Device", to: "/" }];
    
    if (category === "phone") {
      items.push({ label: "Phone", to: "/device/phone" });
      if (detectedBrand === "apple-iphone") {
        items.push({ label: "Apple iPhone", to: "/device/phone/apple-iphone" });
      } else if (detectedBrand === "android") {
        items.push({ label: "Android Phone", to: "/device/phone/android" });
      }
    } else if (category === "laptop") {
      items.push({ label: "PC Laptop", to: "/device/laptop" });
      if (detectedBrand) {
        items.push({ label: formatModelName(detectedBrand), to: `/device/laptop/${detectedBrand}` });
      }
    }
    
    items.push({ label: formatModelName(model) });
    return items;
  };

  const breadcrumbItems = buildBreadcrumb();

  const defaultRepairTypes = [
    { name: "Screen", icon: "🖥️" },
    { name: "Battery", icon: "🔋" },
    { name: "Loudspeaker", icon: "🔊" },
    { name: "Microphone", icon: "🎤" }
  ];

  const availableTypes = repairTypes.length > 0 
    ? [...new Set(repairTypes.map(r => r.type))].map(type => ({
        name: type,
        icon: defaultRepairTypes.find(d => d.name === type)?.icon || "🔧",
        tutorials: repairTypes.filter(r => r.type === type)
      }))
    : defaultRepairTypes.map(type => ({ ...type, tutorials: [] }));

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">
          {formatModelName(model)} Repair
        </h1>
        <div className="grid md:grid-cols-3 gap-8">
          {deviceImage && (
            <div className="md:col-span-1">
              <img
                src={deviceImage}
                alt={formatModelName(model)}
                className="w-full rounded-xl shadow-md"
              />
            </div>
          )}
          <div className={deviceImage ? "md:col-span-2" : "md:col-span-3"}>
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Guides:</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {availableTypes.map((type, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (type.tutorials && type.tutorials.length > 0) {
                      navigate(`/tutorials/${type.tutorials[0].id}`);
                    } else {
                      // Navigate to a generic guide page or show message
                      const basePath = category === "phone" 
                        ? `/device/phone/${detectedBrand}/${model}` 
                        : `/device/laptop/${detectedBrand}/${model}`;
                      navigate(`${basePath}/${type.name.toLowerCase()}`);
                    }
                  }}
                  className="bg-white rounded-xl shadow-md border border-neutral-200 p-6 flex flex-col items-center cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group"
                >
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h3 className="text-lg font-semibold text-neutral-900">{type.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelRepairPage;


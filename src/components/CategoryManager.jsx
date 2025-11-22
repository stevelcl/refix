import React, { useState, useEffect } from 'react';
import { uploadImageToBlob } from '../azure';

export default function CategoryManager({ categories, onCategoriesChange }) {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState({});
  const [newModelName, setNewModelName] = useState({});
  const [newPartName, setNewPartName] = useState({});
  const [expandedModels, setExpandedModels] = useState({});
  const [sharedParts, setSharedParts] = useState([]);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(null);

  useEffect(() => {
    fetchSharedParts();
  }, []);

  const fetchSharedParts = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/api/shared-parts`);
      if (!res.ok) {
        console.error('Failed to fetch shared parts:', res.status);
        return;
      }
      const data = await res.json();
      // Extract parts from the object structure {phones: [...], laptops: [...], etc}
      const allParts = [];
      Object.values(data).forEach(categoryParts => {
        if (Array.isArray(categoryParts)) {
          allParts.push(...categoryParts);
        }
      });
      // Remove duplicates
      setSharedParts([...new Set(allParts)]);
    } catch (error) {
      console.error('Failed to fetch shared parts:', error);
      // Set empty array on error so component doesn't crash
      setSharedParts([]);
    }
  };

  const handleImageUpload = async (categoryId, subcategoryId, file) => {
    if (!file) return;
    
    setUploadingImage(`${categoryId}-${subcategoryId}`);
    try {
      const imageUrl = await uploadImageToBlob(file, 'subcategory-images');
      
      const updatedCategories = categories.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            subcategories: cat.subcategories.map(sub => 
              sub.id === subcategoryId 
                ? { ...sub, imageUrl }
                : sub
            )
          };
        }
        return cat;
      });
      
      onCategoriesChange(updatedCategories);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(null);
    }
  };

  // Add part to a specific model
  const handleAddPartToModel = (categoryId, subcategoryId, modelName) => {
    const partName = newPartName[`${categoryId}-${subcategoryId}-${modelName}`]?.trim();
    if (!partName) return;

    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: cat.subcategories.map(sub => {
            if (sub.id === subcategoryId) {
              return {
                ...sub,
                models: (sub.models || []).map(model => {
                  const currentModelName = typeof model === 'string' ? model : model.name;
                  if (currentModelName === modelName) {
                    const modelObj = typeof model === 'string' ? { name: model, parts: [] } : model;
                    const existingParts = modelObj.parts || [];
                    if (existingParts.includes(partName)) {
                      alert('This part already exists for this model');
                      return model;
                    }
                    return { ...modelObj, parts: [...existingParts, partName] };
                  }
                  return model;
                })
              };
            }
            return sub;
          })
        };
      }
      return cat;
    });

    onCategoriesChange(updatedCategories);
    setNewPartName({ ...newPartName, [`${categoryId}-${subcategoryId}-${modelName}`]: '' });
  };

  // Remove part from a specific model
  const handleRemovePartFromModel = (categoryId, subcategoryId, modelName, partToRemove) => {
    if (!confirm(`Remove part "${partToRemove}" from model "${modelName}"?`)) {
      return;
    }

    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: cat.subcategories.map(sub => {
            if (sub.id === subcategoryId) {
              return {
                ...sub,
                models: (sub.models || []).map(model => {
                  const currentModelName = typeof model === 'string' ? model : model.name;
                  if (currentModelName === modelName) {
                    const modelObj = typeof model === 'string' ? { name: model, parts: [] } : model;
                    return {
                      ...modelObj,
                      parts: (modelObj.parts || []).filter(p => p !== partToRemove)
                    };
                  }
                  return model;
                })
              };
            }
            return sub;
          })
        };
      }
      return cat;
    });

    onCategoriesChange(updatedCategories);
  };

  const toggleModel = (modelKey) => {
    setExpandedModels(prev => ({ ...prev, [modelKey]: !prev[modelKey] }));
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCategory = {
      id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      name: newCategoryName,
      subcategories: []
    };
    onCategoriesChange([...categories, newCategory]);
    setNewCategoryName('');
  };

  const handleAddSubcategory = (categoryId) => {
    const name = newSubcategoryName[categoryId]?.trim();
    if (!name) return;

    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        const newSub = {
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          models: [],
          imageUrl: null
        };
        return { ...cat, subcategories: [...cat.subcategories, newSub] };
      }
      return cat;
    });

    onCategoriesChange(updatedCategories);
    setNewSubcategoryName({ ...newSubcategoryName, [categoryId]: '' });
  };

  const handleAddModel = (categoryId, subcategoryId) => {
    const modelName = newModelName[`${categoryId}-${subcategoryId}`]?.trim();
    if (!modelName) return;

    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: cat.subcategories.map(sub => {
            if (sub.id === subcategoryId) {
              // Create new model with empty parts array (parts are model-specific)
              const newModel = { name: modelName, parts: [] };
              return { ...sub, models: [...(sub.models || []), newModel] };
            }
            return sub;
          })
        };
      }
      return cat;
    });

    onCategoriesChange(updatedCategories);
    setNewModelName({ ...newModelName, [`${categoryId}-${subcategoryId}`]: '' });
  };

  const handleDeleteCategory = (categoryId) => {
    if (!confirm('Delete this category and all its subcategories/models?')) return;
    onCategoriesChange(categories.filter(cat => cat.id !== categoryId));
  };

  const handleDeleteSubcategory = (categoryId, subcategoryId) => {
    if (!confirm('Delete this subcategory and all its models?')) return;
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: cat.subcategories.filter(sub => sub.id !== subcategoryId)
        };
      }
      return cat;
    });
    onCategoriesChange(updatedCategories);
  };

  const handleDeleteModel = (categoryId, subcategoryId, modelName) => {
    if (!confirm(`Delete model "${modelName}"?`)) return;
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: cat.subcategories.map(sub => {
            if (sub.id === subcategoryId) {
              return {
                ...sub,
                models: (sub.models || []).filter(m => m.name !== modelName)
              };
            }
            return sub;
          })
        };
      }
      return cat;
    });
    onCategoriesChange(updatedCategories);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const toggleSubcategory = (subcategoryId) => {
    setExpandedSubcategories(prev => ({ ...prev, [subcategoryId]: !prev[subcategoryId] }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Category Management</h2>
        <p className="text-gray-600 mb-6">Manage repair guide categories, brands, models, and parts</p>

        {/* Add Category */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="New category name..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Category
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category.id} className="border rounded-lg">
              <div className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100" onClick={() => toggleCategory(category.id)}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{expandedCategories[category.id] ? '▼' : '▶'}</span>
                  <h3 className="font-bold text-lg">{category.name}</h3>
                  <span className="text-sm text-gray-500">({category.subcategories?.length || 0} brands)</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                  className="text-red-600 hover:text-red-800 px-3 py-1"
                >
                  Delete
                </button>
              </div>

              {expandedCategories[category.id] && (
                <div className="p-4 space-y-4">
                  {/* Add Subcategory */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New brand/subcategory name..."
                      value={newSubcategoryName[category.id] || ''}
                      onChange={(e) => setNewSubcategoryName({ ...newSubcategoryName, [category.id]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSubcategory(category.id)}
                      className="flex-1 border rounded px-3 py-2"
                    />
                    <button
                      onClick={() => handleAddSubcategory(category.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Add Brand
                    </button>
                  </div>

                  {/* Subcategories */}
                  {category.subcategories?.map(subcategory => (
                    <div key={subcategory.id} className="border rounded-lg ml-6">
                      <div className="flex items-center justify-between p-3 bg-blue-50 cursor-pointer hover:bg-blue-100" onClick={() => toggleSubcategory(subcategory.id)}>
                        <div className="flex items-center gap-3">
                          <span>{expandedSubcategories[subcategory.id] ? '▼' : '▶'}</span>
                          {subcategory.imageUrl && (
                            <img src={subcategory.imageUrl} alt={subcategory.name} className="w-8 h-8 object-cover rounded" />
                          )}
                          <span className="font-semibold">{subcategory.name}</span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {subcategory.models?.length || 0} models
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm">
                            {uploadingImage === `${category.id}-${subcategory.id}` ? 'Uploading...' : '📷 Upload Image'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(category.id, subcategory.id, e.target.files[0])}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </label>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteSubcategory(category.id, subcategory.id); }}
                            className="text-red-600 hover:text-red-800 px-2"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {expandedSubcategories[subcategory.id] && (
                        <div className="p-3 space-y-4">
                          {/* Add Model */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="New model name..."
                              value={newModelName[`${category.id}-${subcategory.id}`] || ''}
                              onChange={(e) => setNewModelName({ ...newModelName, [`${category.id}-${subcategory.id}`]: e.target.value })}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddModel(category.id, subcategory.id)}
                              className="flex-1 border rounded px-3 py-2 text-sm"
                            />
                            <button
                              onClick={() => handleAddModel(category.id, subcategory.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                            >
                              Add Model
                            </button>
                          </div>

                          {/* Models List */}
                          <div className="space-y-3">
                            {subcategory.models?.map((model, idx) => {
                              const modelName = typeof model === 'string' ? model : model.name;
                              const modelParts = typeof model === 'object' && model.parts ? model.parts : [];
                              const modelKey = `${category.id}-${subcategory.id}-${modelName}`;
                              const isExpanded = expandedModels[modelKey];
                              
                              return (
                                <div key={idx} className="border rounded-lg bg-gray-50">
                                  <div 
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100"
                                    onClick={() => toggleModel(modelKey)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
                                      <span className="font-medium text-sm">{modelName}</span>
                                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                        {modelParts.length} parts
                                      </span>
                                    </div>
                                    <button
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        handleDeleteModel(category.id, subcategory.id, modelName);
                                      }}
                                      className="text-red-600 hover:text-red-800 text-sm px-2"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                  
                                  {isExpanded && (
                                    <div className="p-3 bg-white border-t">
                                      {/* Parts Management for this Model */}
                                      <div className="bg-purple-50 p-3 rounded mb-3">
                                        <div className="flex items-center gap-2 mb-3">
                                          <span className="text-purple-700 font-semibold text-sm">🏷️ Parts for {modelName}</span>
                                        </div>
                                        
                                        <div className="flex gap-2 mb-3">
                                          <input
                                            type="text"
                                            list={`parts-${modelKey}`}
                                            placeholder="Add part (e.g., Screen, Battery)..."
                                            value={newPartName[modelKey] || ''}
                                            onChange={(e) => setNewPartName({ ...newPartName, [modelKey]: e.target.value })}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddPartToModel(category.id, subcategory.id, modelName)}
                                            className="flex-1 border rounded px-3 py-2 text-sm"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                          <datalist id={`parts-${modelKey}`}>
                                            {sharedParts.map(part => (
                                              <option key={part} value={part} />
                                            ))}
                                          </datalist>
                                          <button
                                            onClick={(e) => { 
                                              e.stopPropagation();
                                              handleAddPartToModel(category.id, subcategory.id, modelName);
                                            }}
                                            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
                                          >
                                            Add Part
                                          </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                          {modelParts.map((part, partIdx) => (
                                            <span key={partIdx} className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                                              🏷️ {part}
                                              <button
                                                onClick={(e) => { 
                                                  e.stopPropagation();
                                                  handleRemovePartFromModel(category.id, subcategory.id, modelName, part);
                                                }}
                                                className="text-purple-900 hover:text-purple-700 ml-1"
                                              >
                                                ×
                                              </button>
                                            </span>
                                          ))}
                                          {modelParts.length === 0 && (
                                            <span className="text-gray-500 text-sm italic">No parts yet for this model</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {(!subcategory.models || subcategory.models.length === 0) && (
                              <p className="text-gray-500 text-sm italic">No models yet</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { uploadImageToBlob, updateCategories } from '../azure';

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
  const [newCategoryPublicFields, setNewCategoryPublicFields] = useState({
    icon: '📁',
    path: '',
    displayOrder: 0,
    imageUrl: null
  });
  const [editingCategoryPublic, setEditingCategoryPublic] = useState(null);
  const [editCategoryPublicFields, setEditCategoryPublicFields] = useState({});
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    fetchSharedParts();
  }, []);

  const handleSaveChanges = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await updateCategories(categories);
      setSaveMessage({ type: 'success', text: '✓ All changes saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save changes:', error);
      setSaveMessage({ type: 'error', text: `✗ Failed to save changes: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

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

  const handleCategoryImageUploadNew = async (file) => {
    if (!file) return;
    setUploadingCategoryImage('new');
    try {
      const imageUrl = await uploadImageToBlob(file, 'category-images');
      setNewCategoryPublicFields({ ...newCategoryPublicFields, imageUrl });
    } catch (error) {
      console.error('Failed to upload category image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingCategoryImage(null);
    }
  };

  const handleCategoryImageUploadEdit = async (categoryId, file) => {
    if (!file) return;
    setUploadingCategoryImage(categoryId);
    try {
      const imageUrl = await uploadImageToBlob(file, 'category-images');
      setEditCategoryPublicFields({ ...editCategoryPublicFields, imageUrl });
    } catch (error) {
      console.error('Failed to upload category image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingCategoryImage(null);
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
    const id = newCategoryName.toLowerCase().replace(/\s+/g, '-');
    const newCategory = {
      id,
      name: newCategoryName,
      subcategories: [],
      // Public fields for UI navigation
      icon: newCategoryPublicFields.icon || '📁',
      path: newCategoryPublicFields.path || `/device/${id}`,
      displayOrder: parseInt(newCategoryPublicFields.displayOrder) || 0,
      imageUrl: newCategoryPublicFields.imageUrl || null,
      isPublic: true
    };
    onCategoriesChange([...categories, newCategory]);
    setNewCategoryName('');
    setNewCategoryPublicFields({ icon: '📁', path: '', displayOrder: 0 });
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

  const handleModelImageUpload = async (categoryId, subcategoryId, modelName, file) => {
    if (!file) return;
    const key = `${categoryId}-${subcategoryId}-${modelName}`;
    setUploadingImage(key);
    try {
      const imageUrl = await uploadImageToBlob(file, 'model-images');

      const updatedCategories = categories.map(cat => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.map(sub => {
            if (sub.id !== subcategoryId) return sub;
            return {
              ...sub,
              models: (sub.models || []).map(m => {
                const currentModelName = typeof m === 'string' ? m : m.name;
                if (currentModelName !== modelName) return m;
                if (typeof m === 'string') return { name: m, parts: [], imageUrl };
                return { ...m, imageUrl };
              })
            };
          })
        };
      });

      onCategoriesChange(updatedCategories);
    } catch (error) {
      console.error('Failed to upload model image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleDeleteCategory = (categoryId) => {
    if (!confirm('Delete this category and all its subcategories/models?')) return;
    const updated = categories.filter(cat => cat.id !== categoryId);
    // Update local state immediately
    onCategoriesChange(updated);
    // Persist change immediately; parent will also attempt to persist but do a best-effort save here
    (async () => {
      try {
        await updateCategories(updated);
      } catch (err) {
        console.error('Failed to persist category deletion:', err);
        alert('Warning: Failed to persist deletion to the backend. The change is local only. Please ensure you are logged in and try saving again.');
      }
    })();
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
    (async () => {
      try {
        await updateCategories(updatedCategories);
      } catch (err) {
        console.error('Failed to persist subcategory deletion:', err);
        alert('Warning: Failed to persist deletion to the backend. The change is local only. Please ensure you are logged in and try saving again.');
      }
    })();
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
                models: (sub.models || []).filter(m => {
                  const name = typeof m === 'string' ? m : m.name;
                  return name !== modelName;
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
    (async () => {
      try {
        await updateCategories(updatedCategories);
      } catch (err) {
        console.error('Failed to persist model deletion:', err);
        alert('Warning: Failed to persist deletion to the backend. The change is local only. Please ensure you are logged in and try saving again.');
      }
    })();
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Category Management</h2>
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition font-semibold flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                💾 Save Changes
              </>
            )}
          </button>
        </div>

        {saveMessage && (
          <div className={`mb-4 p-3 rounded ${saveMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
            {saveMessage.text}
          </div>
        )}

        <p className="text-gray-600 mb-6">Manage repair guide categories, brands, models, and parts</p>

        {/* Add Category */}
        <div className="mb-6">
          <div className="flex gap-2 mb-3">
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
          
          {newCategoryName && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-2">
              <p className="text-sm font-semibold text-blue-900">Public Appearance (Optional)</p>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Icon (e.g., 📱)"
                  maxLength="2"
                  value={newCategoryPublicFields.icon}
                  onChange={(e) => setNewCategoryPublicFields({...newCategoryPublicFields, icon: e.target.value})}
                  className="border rounded px-2 py-1 text-sm"
                />
                <input
                  type="text"
                  placeholder="Path (e.g., /device/phones)"
                  value={newCategoryPublicFields.path}
                  onChange={(e) => setNewCategoryPublicFields({...newCategoryPublicFields, path: e.target.value})}
                  className="border rounded px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  placeholder="Display Order"
                  value={newCategoryPublicFields.displayOrder}
                  onChange={(e) => setNewCategoryPublicFields({...newCategoryPublicFields, displayOrder: e.target.value})}
                  className="border rounded px-2 py-1 text-sm"
                />
              </div>
              <div className="mt-2">
                <label className="text-sm font-medium">Category Image (optional)</label>
                <div className="flex items-center gap-3 mt-2">
                  {newCategoryPublicFields.imageUrl && (
                    <img src={newCategoryPublicFields.imageUrl} alt="category" className="w-12 h-12 object-cover rounded" />
                  )}
                  <label className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm">
                    {uploadingCategoryImage === 'new' ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleCategoryImageUploadNew(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category.id} className="border rounded-lg">
              <div className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100" onClick={() => toggleCategory(category.id)}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{expandedCategories[category.id] ? '▼' : '▶'}</span>
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      style={{ width: 30, height: 30, objectFit: 'contain' }}
                      className="rounded"
                    />
                  ) : (
                    <span className="text-2xl">{category.icon || '📁'}</span>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    <div className="text-xs text-gray-500">
                      {category.path && <span>{category.path} • </span>}
                      {category.subcategories?.length || 0} brands
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setEditingCategoryPublic(category.id);
                      setEditCategoryPublicFields({
                        icon: category.icon || '📁',
                        path: category.path || '',
                        displayOrder: category.displayOrder || 0
                      });
                    }}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm"
                    title="Edit public appearance"
                  >
                    ⚙️ Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                    className="text-red-600 hover:text-red-800 px-3 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {editingCategoryPublic === category.id && (
                <div className="p-4 bg-blue-50 border-t border-blue-200 space-y-3">
                  <p className="text-sm font-semibold text-blue-900">Edit Public Appearance</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Icon</label>
                      <input
                        type="text"
                        maxLength="2"
                        value={editCategoryPublicFields.icon}
                        onChange={(e) => setEditCategoryPublicFields({...editCategoryPublicFields, icon: e.target.value})}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Path</label>
                      <input
                        type="text"
                        placeholder="/device/phones"
                        value={editCategoryPublicFields.path}
                        onChange={(e) => setEditCategoryPublicFields({...editCategoryPublicFields, path: e.target.value})}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Order</label>
                      <input
                        type="number"
                        value={editCategoryPublicFields.displayOrder}
                        onChange={(e) => setEditCategoryPublicFields({...editCategoryPublicFields, displayOrder: e.target.value})}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs font-medium mb-1">Image (optional)</label>
                    <div className="flex items-center gap-3">
                      {editCategoryPublicFields.imageUrl && (
                        <img src={editCategoryPublicFields.imageUrl} alt="category" className="w-12 h-12 object-cover rounded" />
                      )}
                      <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                        {uploadingCategoryImage === category.id ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleCategoryImageUploadEdit(category.id, e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        const updated = categories.map(c => 
                          c.id === category.id 
                            ? {
                                ...c,
                                icon: editCategoryPublicFields.icon,
                                path: editCategoryPublicFields.path,
                                displayOrder: parseInt(editCategoryPublicFields.displayOrder) || 0,
                                isPublic: true,
                                imageUrl: editCategoryPublicFields.imageUrl !== undefined ? editCategoryPublicFields.imageUrl : c.imageUrl
                              }
                            : c
                        );
                        onCategoriesChange(updated);
                        setEditingCategoryPublic(null);
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCategoryPublic(null)}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {expandedCategories[category.id] && editingCategoryPublic !== category.id && (
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
                                      {(() => {
                                        const modelObj = typeof model === 'string' ? { name: model } : model;
                                        return modelObj.imageUrl ? (
                                          <img src={modelObj.imageUrl} alt={modelObj.name} className="w-6 h-6 object-contain rounded" />
                                        ) : null;
                                      })()}
                                      <span className="font-medium text-sm">{modelName}</span>
                                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                        {modelParts.length} parts
                                      </span>
                                    </div>
                                      <div className="flex items-center gap-2">
                                        <label className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm px-2">
                                          {uploadingImage === `${category.id}-${subcategory.id}-${modelName}` ? 'Uploading...' : '📷 Upload Image'}
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => { 
                                              e.stopPropagation();
                                              handleModelImageUpload(category.id, subcategory.id, modelName, e.target.files[0]);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </label>
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


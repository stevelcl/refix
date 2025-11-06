import React, { useState } from "react";
import { Plus, X, Edit2, Save, Trash2, Folder, FolderOpen } from "lucide-react";

const CategoryManager = ({ categories = [], onChange }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState({});
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      subcategories: []
    };
    onChange([...categories, newCategory]);
    setNewCategoryName("");
    setExpandedCategories(prev => ({ ...prev, [newCategory.id]: true }));
  };

  const updateCategory = (categoryId, updates) => {
    onChange(categories.map(cat => 
      cat.id === categoryId ? { ...cat, ...updates } : cat
    ));
  };

  const deleteCategory = (categoryId) => {
    if (confirm("Are you sure you want to delete this category? This will delete all subcategories under it.")) {
      onChange(categories.filter(cat => cat.id !== categoryId));
    }
  };

  const addSubcategory = (categoryId) => {
    const name = newSubcategoryName[categoryId]?.trim();
    if (!name) return;
    
    updateCategory(categoryId, {
      subcategories: [
        ...(categories.find(c => c.id === categoryId)?.subcategories || []),
        {
          id: `sub-${Date.now()}`,
          name: name,
          models: []
        }
      ]
    });
    setNewSubcategoryName(prev => ({ ...prev, [categoryId]: "" }));
  };

  const updateSubcategory = (categoryId, subcategoryId, updates) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    updateCategory(categoryId, {
      subcategories: category.subcategories.map(sub => 
        sub.id === subcategoryId ? { ...sub, ...updates } : sub
      )
    });
  };

  const deleteSubcategory = (categoryId, subcategoryId) => {
    if (confirm("Are you sure you want to delete this subcategory? This will delete all models under it.")) {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;
      
      updateCategory(categoryId, {
        subcategories: category.subcategories.filter(sub => sub.id !== subcategoryId)
      });
    }
  };

  const addModel = (categoryId, subcategoryId, modelName) => {
    if (!modelName.trim()) return;
    const category = categories.find(c => c.id === categoryId);
    const subcategory = category?.subcategories.find(s => s.id === subcategoryId);
    if (!subcategory) return;
    
    updateSubcategory(categoryId, subcategoryId, {
      models: [...(subcategory.models || []), modelName.trim()]
    });
  };

  const deleteModel = (categoryId, subcategoryId, modelIndex) => {
    const category = categories.find(c => c.id === categoryId);
    const subcategory = category?.subcategories.find(s => s.id === subcategoryId);
    if (!subcategory) return;
    
    updateSubcategory(categoryId, subcategoryId, {
      models: subcategory.models.filter((_, i) => i !== modelIndex)
    });
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <Folder size={20} />
          Category Management
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCategory()}
            placeholder="New category name..."
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={addCategory}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 text-neutral-400">
          <Folder size={48} className="mx-auto mb-2 opacity-50" />
          <p>No categories created yet</p>
        </div>
      )}

      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="border border-neutral-200 rounded-lg overflow-hidden"
          >
            {/* Category Header */}
            <div className="bg-neutral-50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="p-1 hover:bg-neutral-200 rounded transition"
                >
                  {expandedCategories[category.id] ? (
                    <FolderOpen size={18} className="text-blue-600" />
                  ) : (
                    <Folder size={18} className="text-neutral-600" />
                  )}
                </button>
                
                {editingCategory === category.id ? (
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                    onBlur={() => setEditingCategory(null)}
                    onKeyPress={(e) => e.key === "Enter" && setEditingCategory(null)}
                    autoFocus
                    className="flex-1 px-2 py-1 border border-blue-300 rounded bg-white"
                  />
                ) : (
                  <span
                    className="flex-1 font-semibold text-neutral-900 cursor-pointer"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.name}
                  </span>
                )}
                
                    <span className="text-xs text-neutral-500">
                  {category.subcategories?.length || 0} subcategories
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(editingCategory === category.id ? null : category.id)}
                  className="p-1.5 hover:bg-neutral-200 rounded transition"
                  title="Edit Category"
                >
                  <Edit2 size={16} className="text-neutral-600" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteCategory(category.id)}
                  className="p-1.5 hover:bg-red-100 rounded transition"
                  title="Delete Category"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>

            {/* Subcategories */}
            {expandedCategories[category.id] && (
              <div className="p-4 bg-white space-y-3">
                {/* Add Subcategory */}
                <div className="flex gap-2 pb-3 border-b border-neutral-100">
                  <input
                    type="text"
                    value={newSubcategoryName[category.id] || ""}
                    onChange={(e) => setNewSubcategoryName(prev => ({
                      ...prev,
                      [category.id]: e.target.value
                    }))}
                    onKeyPress={(e) => e.key === "Enter" && addSubcategory(category.id)}
                    placeholder="New subcategory name..."
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => addSubcategory(category.id)}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Subcategory
                  </button>
                </div>

                {/* Subcategory List */}
                {category.subcategories?.length > 0 ? (
                  category.subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="border border-neutral-200 rounded-lg p-4 bg-neutral-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        {editingSubcategory === subcategory.id ? (
                          <input
                            type="text"
                            value={subcategory.name}
                            onChange={(e) => updateSubcategory(category.id, subcategory.id, { name: e.target.value })}
                            onBlur={() => setEditingSubcategory(null)}
                            onKeyPress={(e) => e.key === "Enter" && setEditingSubcategory(null)}
                            autoFocus
                            className="flex-1 px-2 py-1 border border-blue-300 rounded bg-white"
                          />
                        ) : (
                          <span className="font-medium text-neutral-900">{subcategory.name}</span>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingSubcategory(editingSubcategory === subcategory.id ? null : subcategory.id)}
                            className="p-1 hover:bg-neutral-200 rounded"
                            title="Edit Subcategory"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSubcategory(category.id, subcategory.id)}
                            className="p-1 hover:bg-red-100 rounded"
                            title="Delete Subcategory"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Models */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                addModel(category.id, subcategory.id, e.target.value);
                                e.target.value = "";
                              }
                            }}
                            placeholder="Add model (press Enter)..."
                            className="flex-1 px-2 py-1.5 border border-neutral-300 rounded text-sm bg-white"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {subcategory.models?.map((model, modelIndex) => (
                            <div
                              key={modelIndex}
                              className="flex items-center gap-1 px-2 py-1 bg-white border border-neutral-300 rounded text-sm"
                            >
                              <span>{model}</span>
                              <button
                                type="button"
                                onClick={() => deleteModel(category.id, subcategory.id, modelIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-neutral-400 text-sm">
                    No subcategories yet
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;


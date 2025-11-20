import React, { useState, useEffect } from 'react';
import { Folder, Plus, Edit2, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { uploadImageToBlob } from '../azure';

const PublicCategoryManager = ({ 
  categories, 
  onCategoriesChange 
}) => {
  const [localCategories, setLocalCategories] = useState(categories || []);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '📱',
    path: '',
    displayOrder: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  useEffect(() => {
    setLocalCategories(categories || []);
  }, [categories]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearNewCategoryForm = () => {
    setNewCategory({ name: '', icon: '📱', path: '', displayOrder: 0 });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImageToBlob(imageFile, 'category-images');
      }

      const categoryData = {
        ...newCategory,
        imageUrl,
        displayOrder: parseInt(newCategory.displayOrder) || 0
      };

      // Notify parent component
      await onCategoriesChange('create', categoryData);
      clearNewCategoryForm();
    } catch (error) {
      console.error('Failed to add category:', error);
      alert(`Failed to add category: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditForm({ ...category });
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  const handleSaveEdit = async (id) => {
    setLoading(true);
    try {
      let imageUrl = editForm.imageUrl;
      
      if (editImageFile) {
        imageUrl = await uploadImageToBlob(editImageFile, 'category-images');
      }

      const updates = {
        ...editForm,
        imageUrl,
        displayOrder: parseInt(editForm.displayOrder) || 0
      };

      await onCategoriesChange('update', updates, id);
      setEditingId(null);
      setEditForm({});
      setEditImageFile(null);
      setEditImagePreview(null);
    } catch (error) {
      console.error('Failed to update category:', error);
      alert(`Failed to update category: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    setLoading(true);
    try {
      await onCategoriesChange('delete', null, id);
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert(`Failed to delete category: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <Folder size={20} />
          Public Page Categories
        </h3>
      </div>

      {/* Add New Category Form */}
      <div className="mb-8 p-6 border border-neutral-200 rounded-lg bg-neutral-50">
        <h4 className="font-semibold mb-4 text-neutral-900">Add New Category</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Phone"
              value={newCategory.name}
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Path *
            </label>
            <input
              type="text"
              placeholder="e.g., /device/phone"
              value={newCategory.path}
              onChange={(e) => setNewCategory({...newCategory, path: e.target.value})}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Icon Emoji
            </label>
            <input
              type="text"
              placeholder="e.g., 📱"
              value={newCategory.icon}
              onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              placeholder="0"
              value={newCategory.displayOrder}
              onChange={(e) => setNewCategory({...newCategory, displayOrder: e.target.value})}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Category Image (optional)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imagePreview && (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-neutral-200" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            If provided, image will be shown instead of emoji icon
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddCategory}
            disabled={loading || !newCategory.name}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
          >
            <Plus size={16} />
            {loading ? 'Adding...' : 'Add Category'}
          </button>
          <button
            onClick={clearNewCategoryForm}
            className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg font-medium hover:bg-neutral-300 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Existing Categories List */}
      <div className="space-y-3">
        <h4 className="font-semibold text-neutral-900">Existing Categories ({localCategories.length})</h4>
        
        {localCategories.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 border border-neutral-200 rounded-lg">
            <Folder size={48} className="mx-auto mb-3 opacity-50" />
            <p>No public categories yet</p>
            <p className="text-sm mt-1">Add your first category above</p>
          </div>
        ) : (
          localCategories.map((cat) => (
            <div key={cat.id} className="border border-neutral-200 rounded-lg p-4 hover:border-blue-300 transition">
              {editingId === cat.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Path</label>
                      <input
                        type="text"
                        value={editForm.path || ''}
                        onChange={(e) => setEditForm({...editForm, path: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Icon</label>
                      <input
                        type="text"
                        value={editForm.icon || ''}
                        onChange={(e) => setEditForm({...editForm, icon: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Display Order</label>
                      <input
                        type="number"
                        value={editForm.displayOrder || 0}
                        onChange={(e) => setEditForm({...editForm, displayOrder: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Update Image</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
                        className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                      />
                      {(editImagePreview || editForm.imageUrl) && (
                        <img 
                          src={editImagePreview || editForm.imageUrl} 
                          alt="Preview" 
                          className="w-12 h-12 object-cover rounded-lg border border-neutral-200" 
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(cat.id)}
                      disabled={loading}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditForm({});
                        setEditImageFile(null);
                        setEditImagePreview(null);
                      }}
                      className="px-3 py-1.5 bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {cat.imageUrl ? (
                      <img 
                        src={cat.imageUrl} 
                        alt={cat.name} 
                        className="w-12 h-12 object-cover rounded-lg border border-neutral-200" 
                      />
                    ) : (
                      <span className="text-3xl">{cat.icon}</span>
                    )}
                    <div>
                      <div className="font-semibold text-neutral-900">{cat.name}</div>
                      <div className="text-sm text-neutral-500">{cat.path}</div>
                      <div className="text-xs text-neutral-400">Order: {cat.displayOrder}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-2 hover:bg-neutral-100 rounded-lg transition"
                      title="Edit Category"
                    >
                      <Edit2 size={16} className="text-neutral-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition"
                      title="Delete Category"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PublicCategoryManager;

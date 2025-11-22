import React, { useState, useEffect } from 'react';
import { uploadImageToBlob, getProducts, createProduct, deleteProduct } from '../azure';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: null
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const imageUrl = await uploadImageToBlob(file, 'products');
      setNewProduct({ ...newProduct, imageUrl });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.description.trim()) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const created = await createProduct(newProduct);
      setProducts([created, ...products]);
      setNewProduct({ name: '', price: '', description: '', imageUrl: null });
      setMessage('Product created successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to create product:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      setMessage('Product deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to delete product:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Product Management</h2>
        <p className="text-gray-600 mb-6">Create and manage spare parts products for the store</p>

        {/* Add Product Form */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Add New Product</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input
                type="text"
                placeholder="e.g., iPhone Screen Replacement"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price (RM)</label>
                <input
                  type="number"
                  placeholder="29.99"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Product Image</label>
                <label className="flex items-center gap-2 cursor-pointer text-blue-600 hover:text-blue-800">
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                placeholder="Describe the product..."
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full border rounded px-3 py-2 h-24"
              />
            </div>
            {newProduct.imageUrl && (
              <div className="flex items-center gap-3">
                <img src={newProduct.imageUrl} alt="preview" className="w-16 h-16 object-cover rounded" />
                <span className="text-sm text-gray-600">Image uploaded</span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleAddProduct}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
              >
                {loading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Products List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Existing Products ({products.length})</h3>
          {products.length === 0 ? (
            <p className="text-gray-500 italic">No products yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 bg-white hover:shadow-lg transition">
                  {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover rounded mb-3" />
                  )}
                  <h4 className="font-semibold text-lg mb-1">{product.name}</h4>
                  <p className="text-blue-600 font-bold mb-2">RM {product.price.toFixed(2)}</p>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

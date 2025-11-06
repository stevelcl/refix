import React, { useCallback, useEffect, useState } from "react";
import { listTutorials, createTutorial, updateTutorial, deleteTutorial, getCategories, updateCategories } from "../azure";
import { useSite } from "../context/SiteContext";
import CreatorDashboardForm from "../components/CreatorDashboardForm";
import CreatorGuideTable from "../components/CreatorGuideTable";
import CategoryManager from "../components/CategoryManager";

const CreatorDashboardPage = () => {
  const { isAdmin, isAuthenticated, user, login, logout, loading: authLoading } = useSite();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [allGuides, setAllGuides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingGuide, setEditingGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("guides"); // "guides" or "categories"
  const [loginLoading, setLoginLoading] = useState(false);

  const fetchGuides = useCallback(async () => {
    try {
      const items = await listTutorials();
      setAllGuides(items || []);
    } catch (error) {
      console.error("Failed to fetch guides:", error);
      setMessage("Failed to fetch guides list");
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await getCategories();
      setCategories(cats || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      // If categories API doesn't exist yet, use default structure
      setCategories([
        { id: "phones", name: "Phones", subcategories: [] },
        { id: "laptops", name: "Laptops", subcategories: [] },
        { id: "tablets", name: "Tablets", subcategories: [] },
        { id: "other", name: "Other Devices", subcategories: [] }
      ]);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchGuides();
      fetchCategories();
    }
  }, [isAuthenticated, isAdmin, fetchGuides, fetchCategories]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setMessage("");
    
    try {
      const result = await login(username, password);
      if (result.success) {
        setMessage("");
        setUsername("");
        setPassword("");
      } else {
        setMessage(result.error || "Login failed");
      }
    } catch (error) {
      // Show detailed error message
      const errorMsg = error.message || "Login failed. Please check your credentials.";
      setMessage(errorMsg);
      console.error("Login error:", error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    try {
      if (editingGuide) {
        await updateTutorial(editingGuide.id, data);
        setMessage("Guide updated successfully!");
      } else {
        await createTutorial(data);
        setMessage("Guide published successfully!");
      }
      setEditingGuide(null);
      await fetchGuides();
    } catch (error) {
      setMessage(`Operation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTutorial(id);
      setMessage("Guide deleted successfully!");
      await fetchGuides();
    } catch (error) {
      throw error; // Let the table handle the error display
    }
  };

  const handleCategoriesChange = async (newCategories) => {
    setCategories(newCategories);
    try {
      await updateCategories(newCategories);
      setMessage("Categories saved successfully!");
    } catch (error) {
      console.error("Failed to save categories:", error);
      setMessage("Categories save failed, but local cache updated");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 max-w-sm w-full flex flex-col gap-4">
          <div className="font-bold text-xl text-neutral-900 mb-1">Admin Login</div>
          <p className="text-sm text-neutral-500 mb-4">Enter your admin credentials to access the dashboard</p>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            className="input"
            autoFocus
            required
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="input"
            required
          />
          <button 
            type="submit" 
            disabled={loginLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition disabled:opacity-60 disabled:cursor-wait"
          >
            {loginLoading ? "Logging in..." : "Login"}
          </button>
          {message && (
            <div className={`text-sm mt-1 ${
              message.includes("Failed to connect") || message.includes("Failed to fetch") 
                ? "text-red-600 bg-red-50 p-3 rounded-lg border border-red-200" 
                : "text-red-600"
            }`}>
              {message.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-neutral-50 px-2 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Repair Guide Management System</h1>
            <p className="text-neutral-600">Create and manage detailed repair guides with step-by-step editing and category management</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm text-neutral-600">
                <span className="font-semibold">{user.username}</span>
                <span className="mx-2">•</span>
                <span className="text-blue-600">{user.role}</span>
              </div>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-lg font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-neutral-200">
            <button
              onClick={() => { setActiveTab("guides"); setEditingGuide(null); }}
              className={`px-6 py-3 font-semibold transition border-b-2 ${
                activeTab === "guides"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Guide Management
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-6 py-3 font-semibold transition border-b-2 ${
                activeTab === "categories"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Category Management
            </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes("failed") || message.includes("error") || message.includes("Failed") || message.includes("Error") 
              ? "bg-red-50 text-red-700" 
              : "bg-green-50 text-green-700"
          }`}>
            {message}
          </div>
        )}

        {/* Guides Tab */}
        {activeTab === "guides" && (
          <div className="space-y-8">
            {!editingGuide && (
              <div className="flex justify-end">
                <button
                  onClick={() => setEditingGuide({})}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow transition"
                >
                  Create New Guide
                </button>
              </div>
            )}

            {editingGuide !== null && (
              <CreatorDashboardForm
                initialValues={editingGuide}
                onSubmit={handleSubmit}
                editing={!!editingGuide.id}
                loading={loading}
                categories={categories}
              />
            )}

            {!editingGuide && (
              <CreatorGuideTable
                guides={allGuides}
                onEdit={setEditingGuide}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <CategoryManager
            categories={categories}
            onChange={handleCategoriesChange}
          />
        )}
      </div>
    </div>
  );
};

export default CreatorDashboardPage;

// Azure integration helpers for the React app
// - Blob uploads via SAS (client-side) using plain fetch (no SDK)
// - Data operations via a backend API that talks to Cosmos DB
//   Configure env vars in Vite: VITE_BLOB_CONTAINER_SAS_URL and VITE_API_BASE

// Optional: local fallback so devs can run without a .env.local
// This file is generated in the repo: src/localEnv.js
// eslint-disable-next-line import/no-unresolved
import { VITE_BLOB_CONTAINER_SAS_URL as LOCAL_BLOB_SAS, VITE_API_BASE as LOCAL_API_BASE } from "./localEnv";

const containerSasUrl = import.meta.env.VITE_BLOB_CONTAINER_SAS_URL || LOCAL_BLOB_SAS;
const apiBase = import.meta.env.VITE_API_BASE || LOCAL_API_BASE;

function ensure(value, name) {
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

// Upload an image file to Azure Blob Storage using a container SAS URL
export async function uploadImageToBlob(file, pathPrefix = "tutorials") {
  ensure(containerSasUrl, "VITE_BLOB_CONTAINER_SAS_URL");
  const ext = (file?.name || "").split(".").pop() || "bin";
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
  const blobName = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;

  // Build blob URL from container SAS URL
  const u = new URL(containerSasUrl);
  const base = `${u.origin}${u.pathname}`; // .../container
  const sas = u.search; // ?sv=...
  const blobUrlWithSas = `${base.replace(/\/$/, "")}/${blobName}${sas}`;

  let res;
  try {
    res = await fetch(blobUrlWithSas, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "x-ms-version": "2020-10-02",
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });
  } catch (networkError) {
    // Most common causes:
    // 1) CORS not configured on the Blob service for http://localhost:5173
    // 2) SAS expired or clock skew
    // 3) Mixed content (http vs https) or adblock/proxy interference
    const hint =
      "Network error during upload. Likely CORS/SAS issue.\n" +
      "- Ensure Storage account CORS allows http://localhost:5173 with methods: PUT, OPTIONS, GET, HEAD\n" +
      "- Allowed headers: * ; Exposed headers: x-ms-*, ETag, Last-Modified\n" +
      "- Verify the SAS is not expired and time is correct (UTC)\n" +
      "- Use HTTPS everywhere";
    throw new Error(`${hint}\nDetails: ${networkError?.message || networkError}`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Blob upload failed: ${res.status} ${text}`);
  }
  // Return URL (may require SAS to read unless container has public access)
  return blobUrlWithSas;
}

// --- Cosmos DB (via backend API) ---
// The frontend calls a backend (e.g., Azure Functions) that performs
// authenticated Cosmos DB operations. This avoids exposing keys client-side.

// Get authentication token from localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// API helper with automatic authentication
async function api(path, options = {}) {
  // Provide helpful error message if VITE_API_BASE is not configured
  if (!apiBase) {
    const errorMsg = 
      "VITE_API_BASE is not configured. " +
      "Please create a .env file in the project root with: " +
      "VITE_API_BASE=http://localhost:3000/api (or your backend URL). " +
      "See ENV_CONFIG.md for detailed instructions.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  ensure(apiBase, "VITE_API_BASE");
  const token = getAuthToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  
  // Add authentication token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    headers,
  });
  
  // Handle 401 Unauthorized - token expired or invalid
  if (res.status === 401) {
    localStorage.removeItem("authToken");
    throw new Error("Authentication expired. Please login again.");
  }
  
  // Handle 403 Forbidden - insufficient permissions
  if (res.status === 403) {
    throw new Error("You don't have permission to perform this action.");
  }
  
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  
  // Some endpoints might return 204
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : null;
}

// --- Authentication APIs ---
export async function login(username, password) {
  // Provide helpful error message if VITE_API_BASE is not configured
  if (!apiBase) {
    const errorMsg = 
      "VITE_API_BASE is not configured. " +
      "Please create a .env file in the project root with: " +
      "VITE_API_BASE=http://localhost:3000/api (or your backend URL). " +
      "See ENV_CONFIG.md for detailed instructions.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  ensure(apiBase, "VITE_API_BASE");
  
  try {
    const res = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Login failed: ${res.status} ${text}`);
    }
    
    return res.json();
  } catch (error) {
    // Provide more helpful error messages for common issues
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      const apiUrl = `${apiBase}/auth/login`;
      throw new Error(
        `Failed to connect to backend server at ${apiUrl}. ` +
        `Please check:\n` +
        `1. Is your backend server running?\n` +
        `2. Is the URL correct in .env file? (Current: ${apiBase})\n` +
        `3. Check browser console Network tab for detailed error\n` +
        `4. Verify CORS settings on your backend server`
      );
    }
    throw error;
  }
}

export async function logout() {
  const token = getAuthToken();
  if (!token) return;
  
  try {
    await api(`/auth/logout`, { method: "POST" });
  } catch (error) {
    // Even if API fails, clear local token
    console.error("Logout API error:", error);
  }
}

export async function getCurrentUser() {
  return api(`/auth/me`);
}

// --- Public User Registration API (for regular users only) ---
// Regular users can register, but they will automatically be assigned "user" role
// This endpoint is NOT for admin registration - admin account must be manually created in database
export async function registerUser(username, password, email) {
  ensure(apiBase, "VITE_API_BASE");
  const res = await fetch(`${apiBase}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email }),
  });
  
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Registration failed: ${res.status} ${text}`);
  }
  
  return res.json();
}

// --- Public APIs (no authentication required) ---

export async function listTutorials({ category, model, search } = {}) {
  const params = new URLSearchParams();
  if (category && category !== "All") params.set("category", category);
  if (model) params.set("model", model);
  if (search) params.set("search", search);
  const qs = params.toString();
  return api(`/tutorials${qs ? `?${qs}` : ""}`);
}

export async function getTutorial(id) {
  return api(`/tutorials/${encodeURIComponent(id)}`);
}

export async function createFeedback(data) {
  return api(`/feedback`, { method: "POST", body: JSON.stringify(data) });
}

// --- Admin APIs (require authentication and admin role) ---
// These endpoints are protected by the backend API which checks for admin role
export async function createTutorial(data) {
  return api(`/admin/tutorials`, { method: "POST", body: JSON.stringify(data) });
}

export async function updateTutorial(id, data) {
  return api(`/admin/tutorials/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTutorial(id) {
  return api(`/admin/tutorials/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// Category Management APIs (admin only)
export async function getCategories() {
  // Public read access
  return api(`/categories`);
}

export async function createCategory(data) {
  return api(`/admin/categories`, { method: "POST", body: JSON.stringify(data) });
}

export async function updateCategories(categories) {
  return api(`/admin/categories`, {
    method: "PUT",
    body: JSON.stringify(categories),
  });
}

// Public Category Management APIs
export async function getPublicCategories() {
  // Public read access
  return api(`/public-categories`);
}

export async function getPublicSubcategories(parentId) {
  // Public read access
  return api(`/public-categories/${encodeURIComponent(parentId)}/subcategories`);
}

export async function createPublicCategory(data) {
  return api(`/admin/public-categories`, { 
    method: "POST", 
    body: JSON.stringify(data) 
  });
}

export async function updatePublicCategory(id, data) {
  return api(`/admin/public-categories/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePublicCategory(id) {
  return api(`/admin/public-categories/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

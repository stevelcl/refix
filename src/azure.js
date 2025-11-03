// Azure integration helpers for the React app
// - Blob uploads via SAS (client-side)
// - Data operations via a backend API that talks to Cosmos DB
//   Configure env vars in Vite: VITE_BLOB_CONTAINER_SAS_URL and VITE_API_BASE

import { ContainerClient } from "@azure/storage-blob";

const containerSasUrl = import.meta.env.VITE_BLOB_CONTAINER_SAS_URL;
const apiBase = import.meta.env.VITE_API_BASE;

function ensure(value, name) {
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

// Upload an image file to Azure Blob Storage using a container SAS URL
export async function uploadImageToBlob(file, pathPrefix = "tutorials") {
  ensure(containerSasUrl, "VITE_BLOB_CONTAINER_SAS_URL");
  const containerClient = new ContainerClient(containerSasUrl);
  const ext = (file?.name || "").split(".").pop() || "bin";
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
  const blobName = `${pathPrefix}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${safeExt}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(file, {
    blobHTTPHeaders: { blobContentType: file.type || "application/octet-stream" },
  });
  return blockBlobClient.url;
}

// --- Cosmos DB (via backend API) ---
// The frontend calls a backend (e.g., Azure Functions) that performs
// authenticated Cosmos DB operations. This avoids exposing keys client-side.

async function api(path, options = {}) {
  ensure(apiBase, "VITE_API_BASE");
  const res = await fetch(`${apiBase}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  // Some endpoints might return 204
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : null;
}

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

export async function createTutorial(data) {
  return api(`/tutorials`, { method: "POST", body: JSON.stringify(data) });
}

export async function updateTutorial(id, data) {
  return api(`/tutorials/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function createFeedback(data) {
  return api(`/feedback`, { method: "POST", body: JSON.stringify(data) });
}


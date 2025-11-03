// Azure integration helpers for the React app
// - Blob uploads via SAS (client-side) using plain fetch (no SDK)
// - Data operations via a backend API that talks to Cosmos DB
//   Configure env vars in Vite: VITE_BLOB_CONTAINER_SAS_URL and VITE_API_BASE

const containerSasUrl = import.meta.env.VITE_BLOB_CONTAINER_SAS_URL;
const apiBase = import.meta.env.VITE_API_BASE;

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

  const res = await fetch(blobUrlWithSas, {
    method: "PUT",
    headers: {
      "x-ms-blob-type": "BlockBlob",
      "x-ms-version": "2020-10-02",
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });
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

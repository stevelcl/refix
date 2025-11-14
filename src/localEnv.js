// Local fallback for environment variables when .env.local is not present.
// NOTE: This file is meant for local development only.
// Do not commit real long-lived secrets to source control in production.

// Azure Blob Storage Container SAS URL
// Provided by user for local dev; rotate/replace as needed.
export const VITE_BLOB_CONTAINER_SAS_URL = "https://refix1storage.blob.core.windows.net/tutorials?sp=racw&st=2025-11-14T09:54:01Z&se=2026-01-30T18:09:01Z&spr=https&sv=2024-11-04&sr=c&sig=OJ78NiqNtgrBM1KTbvillTjrcgZCeYv1sCmPV87SPMo%3D";

// If you have a backend API, you can optionally export:
// export const VITE_API_BASE = "http://localhost:3000/api";



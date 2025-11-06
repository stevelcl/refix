# ReFix MVP

A high-end, professional repair guide platform inspired by iFixit. Browse trusted guides for phones, tablets, and laptops, or use the internal CMS to add new tutorials. Built with React, Vite, Tailwind, and Azure (Cosmos DB + Blob Storage).

## Setup Instructions

### 1. Configure Environment Variables

**IMPORTANT**: You must create a `.env` file before running the application.

Create a `.env` file in the project root (same directory as `package.json`) with:

```env
VITE_API_BASE=http://localhost:3000/api
VITE_BLOB_CONTAINER_SAS_URL=https://<account>.blob.core.windows.net/<container>?<SAS>
```

**Required:**
- `VITE_API_BASE` - Your backend API base URL (e.g., `http://localhost:3000/api` or `https://your-api.azurewebsites.net/api`)

**Optional:**
- `VITE_BLOB_CONTAINER_SAS_URL` - Azure Blob Storage SAS URL for image uploads (only needed if you want to upload images directly from browser)

**See `ENV_CONFIG.md` for detailed configuration instructions and troubleshooting.**

### 2. Configure Azure

- `VITE_API_BASE` points to a backend API (Azure Functions/Web App) that performs Cosmos DB operations (NoSQL Core SQL API). Endpoints expected:
  - `GET /tutorials` (supports `category`, `model`, `search`)
  - `GET /tutorials/:id`
  - `POST /tutorials`
  - `PUT /tutorials/:id`
  - `POST /feedback`
- `VITE_BLOB_CONTAINER_SAS_URL` is a container-level SAS URL with write permission (w). The app uploads images directly to Blob Storage from the browser using this SAS and stores the resulting URLs in Cosmos DB via the API above.

### 3. Install Dependencies

```
npm install
```

### 4. Run the Dev Server

```
npm run dev
```
- Open the local URL printed in the terminal to view ReFix.

### 5. Public Site
- Home page lets users search for repair guides, pick a category, or browse featured/latest guides.
- Click "Tutorials" in the navbar to browse/filter all guides.
- Click "Feedback" to leave a device or model request (stored in Cosmos DB `feedback` container via the API).

### 6. Admin Dashboard

- Manually go to the `/creator-dashboard` route (not linked in nav or footer).
- Login with admin credentials:
  - **Username**: `admin`
  - **Password**: `admin123` (change after first login!)
- See `ADMIN_SETUP.md` for admin account initialization instructions.
- Access a clean internal tool for:
  - Creating new guides (all required fields, multi-line for tools & steps)
  - Editing existing guides (click [Edit] in the table below the form)
  - All guides saved via API to Cosmos DB (`tutorials` container)
  - Thumbnail images can be uploaded to Azure Blob Storage with a SAS token; the resulting URL is saved with the tutorial

### 7. Publishing & Editing Guides
- New guides: Fill the form in the "Create New Guide" section, then "Publish Guide"
- Edit guides: Click "Edit" in the table, make changes, then "Save Changes"
- Fields are mapped as in the MVP prompt for Cosmos DB items.

### 8. Brand, UI/UX, and Experience
- ReFix is visually calm, premium, and content-first
- Immediately lets users pick category/model
- No payment, plans, or pricing implemented — focus is on repair content and a smooth internal CMS for guide editors

---

Built with ♥ following the ReFix MVP prompt.

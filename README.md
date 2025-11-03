# ReFix MVP

A high-end, professional repair guide platform inspired by iFixit. Browse trusted guides for phones, tablets, and laptops, or use the internal CMS to add new tutorials. Built with React, Vite, Tailwind, and Azure (Cosmos DB + Blob Storage).

## Setup Instructions

### 1. Configure Azure
Create `.env` from `.env.example` and set:

```
VITE_API_BASE=https://<your-function-app>.azurewebsites.net/api
VITE_BLOB_CONTAINER_SAS_URL=https://<account>.blob.core.windows.net/<container>?<SAS>
```

- `VITE_API_BASE` points to a backend API (Azure Functions/Web App) that performs Cosmos DB operations (NoSQL Core SQL API). Endpoints expected:
  - `GET /tutorials` (supports `category`, `model`, `search`)
  - `GET /tutorials/:id`
  - `POST /tutorials`
  - `PUT /tutorials/:id`
  - `POST /feedback`
- `VITE_BLOB_CONTAINER_SAS_URL` is a container-level SAS URL with write permission (w). The app uploads images directly to Blob Storage from the browser using this SAS and stores the resulting URLs in Cosmos DB via the API above.

### 2. Install Dependencies

```
npm install
```

### 3. Run the Dev Server

```
npm run dev
```
- Open the local URL printed in the terminal to view ReFix.

### 4. Public Site
- Home page lets users search for repair guides, pick a category, or browse featured/latest guides.
- Click "Tutorials" in the navbar to browse/filter all guides.
- Click "Feedback" to leave a device or model request (stored in Cosmos DB `feedback` container via the API).

### 5. Private Creator Dashboard (Internal CMS)
- Manually go to the `/creator-dashboard` route (not linked in nav or footer).
- Enter the internal password: `refix-internal` (as defined in SiteContext).
- Access a clean internal tool for:
  - Creating new guides (all required fields, multi-line for tools & steps)
  - Editing existing guides (click [Edit] in the table below the form)
  - All guides saved via API to Cosmos DB (`tutorials` container)
  - Thumbnail images can be uploaded to Azure Blob Storage with a SAS token; the resulting URL is saved with the tutorial

### 6. Publishing & Editing Guides
- New guides: Fill the form in the "Create New Guide" section, then "Publish Guide"
- Edit guides: Click "Edit" in the table, make changes, then "Save Changes"
- Fields are mapped as in the MVP prompt for Cosmos DB items.

### 7. Brand, UI/UX, and Experience
- ReFix is visually calm, premium, and content-first
- Immediately lets users pick category/model
- No payment, plans, or pricing implemented — focus is on repair content and a smooth internal CMS for guide editors

---

Built with ♥ following the ReFix MVP prompt.

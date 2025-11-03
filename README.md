# ReFix MVP

A high-end, professional repair guide platform inspired by iFixit. Browse trusted guides for phones, tablets, and laptops, or use the internal CMS to add new tutorials using Firestore. Built with React, Vite, Tailwind, and Firebase.

## Setup Instructions

### 1. Add Your Firebase Config
- Open `src/firebase.js`
- Replace the placeholder values in `firebaseConfig` with your project's config (from the Firebase Console: Project Settings → General → Your apps → SDK setup and config).

```
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

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
- Click "Feedback" to leave a device or model request (stored in Firestore).

### 5. Private Creator Dashboard (Internal CMS)
- Manually go to the `/creator-dashboard` route (not linked in nav or footer).
- Enter the internal password: `refix-internal` (as defined in SiteContext).
- Access a clean internal tool for:
  - Creating new guides (all required fields, multi-line for tools & steps)
  - Editing existing guides (click [Edit] in the table below the form)
  - All guides saved directly to Firestore (`tutorials` collection)

### 6. Publishing & Editing Guides
- New guides: Fill the form in the "Create New Guide" section, then "Publish Guide"
- Edit guides: Click "Edit" in the table, make changes, then "Save Changes"
- Fields are mapped exactly as in the MVP prompt for Firestore objects.

### 7. Brand, UI/UX, and Experience
- ReFix is visually calm, premium, and content-first
- Immediately lets users pick category/model
- No payment, plans, or pricing implemented — focus is on repair content and a smooth internal CMS for guide editors

---

Built with ♥ following the ReFix MVP prompt.

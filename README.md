# ArcGIS Parking Availability App

A modern, production-ready parking availability dashboard built with Next.js 15, React 19, Tailwind CSS, and ArcGIS JS API. This app displays real-time parking bay and lot availability using data from ArcGIS Enterprise, with authentication via ArcGIS OAuth.

## Features
- **Interactive Map**: Parking lots and bays visualized with color-coded, speech-bubble markers.
- **ArcGIS Integration**: Uses WebMap and FeatureLayers from ArcGIS Enterprise.
- **Authentication**: Secure OAuth login with ArcGIS.
- **Layer Toggle**: Show/hide underground and bay layers.
- **Legend**: Color legend for parking availability.
- **Exclusion List**: Manually exclude specific lots from display.
- **TypeScript**: Fully typed for safety and maintainability.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env` (or create `.env`)
   - Fill in your ArcGIS portal/app IDs and layer URLs:
     ```env
     NEXT_PUBLIC_ARCGIS_PORTAL_URL=... # e.g. https://arcgis.curtin.edu.au/portal
     NEXT_PUBLIC_ARCGIS_APP_ID=...     # Your ArcGIS OAuth App ID
     NEXT_PUBLIC_ARCGIS_WEBMAP_ID=...  # WebMap ID
     NEXT_PUBLIC_ARCGIS_BAY_LAYER_URL=...
     NEXT_PUBLIC_ARCGIS_UNDER_BAY_LAYER_URL=...
     NEXT_PUBLIC_ARCGIS_PARKING_LAYER_URL=...
     ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

4. **Build for production:**
   ```bash
   npm run build && npm start
   ```

## Project Structure
- `src/app/` — Next.js app entry, layout, and global styles
- `src/components/` — UI, map, and auth components
- `src/hooks/` — Custom React hooks (e.g., authentication)
- `src/lib/` — Utility functions
- `src/types/` — TypeScript type definitions

## Security & Best Practices
- **No secrets are committed.** All sensitive config is loaded from `.env` and ignored by git.
- **Production ready.** Linting, type-checking, and build scripts included.

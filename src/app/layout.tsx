// src/app/layout.tsx
"use client";

import { ReactNode } from "react";
import "./globals.css";
import "@arcgis/core/assets/esri/themes/light/main.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>Parking Availability</title>
        <meta name="description" content="Real-time parking availability map" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

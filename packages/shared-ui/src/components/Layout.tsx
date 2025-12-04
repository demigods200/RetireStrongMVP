"use client";

import React from "react";
import { Navbar } from "./Navbar";

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8" role="main">
        {children}
      </main>
      <footer className="bg-white border-t-2 border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-600 text-base">
            © {new Date().getFullYear()} Retire Strong. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};


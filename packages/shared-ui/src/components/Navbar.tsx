"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon?: string;
}

const navItems: NavItem[] = [
  { href: "/today", label: "Today" },
  { href: "/plan", label: "Plan" },
  { href: "/progress", label: "Progress" },
  { href: "/coach", label: "Coach" },
  { href: "/library", label: "Library" },
  { href: "/settings", label: "Settings" },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b-2 border-gray-200 shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary hover:text-primary-dark">
              Retire Strong
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-lg font-medium transition-colors min-h-[44px] flex items-center ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button (placeholder for future) */}
          <div className="md:hidden">
            <button
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] min-w-[44px]"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};


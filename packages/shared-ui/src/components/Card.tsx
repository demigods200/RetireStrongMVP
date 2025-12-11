import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "", title, subtitle }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-soft border border-gray-100 p-6 sm:p-8 flex flex-col h-full transition-shadow duration-200 hover:shadow-medium ${className}`}>
      {title && (
        <div className="mb-6 flex-shrink-0">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{title}</h3>
          {subtitle && <p className="text-lg sm:text-xl text-gray-600 mt-2 leading-relaxed">{subtitle}</p>}
        </div>
      )}
      <div className="flex flex-col flex-grow min-h-0">
        {children}
      </div>
    </div>
  );
};


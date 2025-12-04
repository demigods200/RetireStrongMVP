import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "", title, subtitle }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 flex flex-col h-full ${className}`}>
      {title && (
        <div className="mb-4 flex-shrink-0">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-lg text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="flex flex-col flex-grow min-h-0">
        {children}
      </div>
    </div>
  );
};


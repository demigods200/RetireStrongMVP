import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const baseStyles =
    "font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-base", // 50+ friendly: minimum 16px
    md: "px-6 py-3 text-lg", // 18px
    lg: "px-8 py-4 text-xl", // 20px
  };

  // Ensure minimum touch target size (44x44px for accessibility)
  const touchTarget = size === "sm" ? "min-h-[44px] min-w-[44px]" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${touchTarget} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};


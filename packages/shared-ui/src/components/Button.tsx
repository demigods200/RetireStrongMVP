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
    "font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none";
  
  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary-dark hover:shadow-primary focus:ring-primary shadow-soft active:scale-[0.98]",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400 shadow-soft active:scale-[0.98]",
    outline: "border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white focus:ring-primary active:scale-[0.98]",
  };

  const sizeStyles = {
    sm: "px-5 py-2.5 text-base min-h-[44px]", // 50+ friendly: minimum 16px
    md: "px-7 py-3.5 text-lg min-h-[48px]", // 18px
    lg: "px-9 py-4.5 text-xl min-h-[52px]", // 20px
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};


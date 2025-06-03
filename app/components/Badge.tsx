import React from "react";

type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  primary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  secondary: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  info: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
};

export function Badge({ children, variant = "default", className = "", onClick }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${onClick ? "cursor-pointer hover:opacity-80" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
}

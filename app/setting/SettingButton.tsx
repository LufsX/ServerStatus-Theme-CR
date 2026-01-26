import React from "react";
import { motion } from "framer-motion";

interface SettingButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function SettingButton({ isActive, onClick, children, className = "" }: SettingButtonProps): React.ReactElement {
  return (
    <motion.button
      onClick={onClick}
      className={`${className} py-1 text-sm text-center truncate border transition-colors duration-150 ${
        isActive
          ? "font-medium"
          : "hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-800"
      }`}
      style={{
        borderRadius: "var(--radius-sm)",
        ...(isActive && {
          backgroundColor: "var(--color-primary-light)",
          color: "var(--color-primary)",
          borderColor: "var(--color-primary)",
        }),
      }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
    >
      {children}
    </motion.button>
  );
}

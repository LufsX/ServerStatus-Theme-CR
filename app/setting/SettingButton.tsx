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
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={`${className} py-1 text-sm text-center truncate rounded-control-sm border transition-colors duration-150 ${
        isActive
          ? "bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 font-medium border-accent-300 dark:border-accent-600"
          : "hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-800"
      }`}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
    >
      {children}
    </motion.button>
  );
}

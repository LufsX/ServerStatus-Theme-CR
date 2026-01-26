import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  barColor?: string;
  backgroundColor?: string;
  animationDuration?: number;
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3.5",
};

const variantClasses = {
  default: "", // Uses CSS variable --color-primary via inline style
  success: "bg-green-500 dark:bg-green-700",
  warning: "bg-yellow-500 dark:bg-yellow-700",
  danger: "bg-red-500 dark:bg-red-700",
};

/**
 * 根据百分比值自动决定颜色变体
 */
function getVariantFromValue(value: number): "success" | "warning" | "danger" {
  if (value < 70) return "success";
  if (value < 90) return "warning";
  return "danger";
}

export function ProgressBar({
  value,
  max = 100,
  className = "",
  barClassName = "",
  showValue = false,
  valueFormat,
  size = "md",
  variant,
  barColor,
  backgroundColor = "bg-gray-200 dark:bg-gray-700",
  animationDuration = 0.6,
}: ProgressBarProps) {
  // 确保值在 0-max 范围内
  const clampedValue = Math.min(Math.max(0, value), max);
  const percentage = (clampedValue / max) * 100;

  // 如果没有指定变体，则根据百分比自动选择
  const autoVariant = variant || getVariantFromValue(percentage);

  // 使用自定义颜色或从变体中选择
  const finalBarColor = barColor || variantClasses[autoVariant];
  
  // 检查是否使用默认变体（需要应用 CSS 变量颜色）
  const isDefaultVariant = autoVariant === "default" && !barColor;

  // 格式化显示的值
  const displayValue = valueFormat ? valueFormat(clampedValue) : `${percentage.toFixed(0)}%`;

  return (
    <div 
      className={`w-full ${backgroundColor} overflow-hidden ${sizeClasses[size]} ${className}`}
      style={{ borderRadius: "var(--radius-full)" }}
    >
      <motion.div
        className={`${finalBarColor} ${sizeClasses[size]} ${barClassName}`}
        style={{ 
          borderRadius: "var(--radius-full)",
          ...(isDefaultVariant && { backgroundColor: "var(--color-primary)" }),
        }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration: animationDuration,
          ease: "easeOut",
        }}
      >
        {showValue && size === "lg" && <div className="text-xs font-medium text-white text-center leading-none flex items-center justify-center h-full">{displayValue}</div>}
      </motion.div>
      {showValue && size !== "lg" && <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">{displayValue}</div>}
    </div>
  );
}

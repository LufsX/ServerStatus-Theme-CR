"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "./settings";
import { SettingButton } from "./SettingButton";

const SettingsMenu = () => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"appearance" | "performance">("appearance");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 处理点击外部和 ESC 键关闭下拉框
  useEffect(() => {
    if (!isOpen) return;

    const handleEvent = (event: MouseEvent | KeyboardEvent) => {
      if (event.type === "mousedown" && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      } else if (event.type === "keydown" && (event as KeyboardEvent).key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleEvent);
    document.addEventListener("keydown", handleEvent);
    return () => {
      document.removeEventListener("mousedown", handleEvent);
      document.removeEventListener("keydown", handleEvent);
    };
  }, [isOpen]);

  // 切换主题
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  // 切换单位类型
  const handleUnitTypeChange = (unitType: "binary" | "decimal") => {
    updateSettings({ unitType });
    window.dispatchEvent(new Event("storage"));
  };

  // 切换刷新间隔
  const handleRefreshIntervalChange = (refreshInterval: 1000 | 2000 | 5000 | 10000) => {
    updateSettings({ refreshInterval });
    window.dispatchEvent(new Event("storage"));
  };

  // 切换显示模式
  const handleDisplayModeChange = (displayMode: "card" | "row") => {
    updateSettings({ displayMode });
    window.dispatchEvent(new Event("storage"));
  };

  // 切换摘要显示
  const handleShowSummaryChange = (showSummary: boolean) => {
    updateSettings({ showSummary });
    window.dispatchEvent(new Event("storage"));
  };

  // 切换筛选器显示
  const handleShowFiltersChange = (showFilters: boolean) => {
    updateSettings({ showFilters });
    window.dispatchEvent(new Event("storage"));
  };

  if (!mounted) {
    return <div className="w-8 h-8"></div>;
  }

  // 渲染设置图标
  const renderSettingsIcon = () => (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: 1, rotate: 0 }}
      exit={{ opacity: 0, rotate: 0 }}
      transition={{ duration: 0.08, type: "spring", stiffness: 400, damping: 25 }}
      aria-hidden="true"
    >
      <path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );

  const renderAppearanceTab = () => (
    <motion.div className="py-1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, delay: 0.05 }} layout>
      <motion.div className="px-3 py-2" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15, delay: 0.08 }}>
        <motion.div className="text-xs text-gray-500 dark:text-gray-400 mb-2" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1, delay: 0.1 }}>
          主题模式
        </motion.div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "system", label: "系统" },
            { value: "light", label: "浅色" },
            { value: "dark", label: "深色" },
          ].map(({ value, label }, index) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
                delay: 0.12 + index * 0.03,
              }}
            >
              <SettingButton isActive={theme === value} onClick={() => handleThemeChange(value)} className="w-full">
                {label}
              </SettingButton>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="px-3 py-2" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15, delay: 0.22 }}>
        <motion.div className="text-xs text-gray-500 dark:text-gray-400 mb-2" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1, delay: 0.25 }}>
          界面组件
        </motion.div>
        <div className="flex space-x-2">
          {[
            { key: "showSummary", label: "摘要", value: settings.showSummary, handler: handleShowSummaryChange },
            { key: "showFilters", label: "筛选", value: settings.showFilters, handler: handleShowFiltersChange },
          ].map(({ key, label, value, handler }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
                delay: 0.28 + index * 0.03,
              }}
              className="flex-1"
            >
              <SettingButton isActive={value} onClick={() => handler(!value)} className="w-full">
                {label}
              </SettingButton>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="px-3 py-2" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15, delay: 0.35 }}>
        <motion.div className="text-xs text-gray-500 dark:text-gray-400 mb-2" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1, delay: 0.38 }}>
          显示模式
        </motion.div>
        <div className="flex space-x-2">
          {[
            {
              value: "card",
              label: "卡片",
              icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                  <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                  <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                </svg>
              ),
            },
            {
              value: "row",
              label: "横排",
              icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                  <rect x="3" y="4" width="18" height="2" rx="1" stroke="currentColor" strokeWidth="2" />
                  <rect x="3" y="11" width="18" height="2" rx="1" stroke="currentColor" strokeWidth="2" />
                  <rect x="3" y="18" width="18" height="2" rx="1" stroke="currentColor" strokeWidth="2" />
                </svg>
              ),
            },
          ].map(({ value, label, icon }, index) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
                delay: 0.4 + index * 0.03,
              }}
              className="flex-1"
            >
              <SettingButton isActive={settings.displayMode === value} onClick={() => handleDisplayModeChange(value as "card" | "row")} className="w-full flex items-center justify-center">
                {icon}
                {label}
              </SettingButton>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  const renderPerformanceTab = () => (
    <motion.div className="py-1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: 0.05 }}>
      <motion.div className="px-3 py-2" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15, delay: 0.08 }}>
        <motion.div className="text-xs text-gray-500 dark:text-gray-400 mb-2" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1, delay: 0.1 }}>
          数据单位
        </motion.div>
        <div className="flex space-x-2">
          {[
            { value: "binary", label: "GiB" },
            { value: "decimal", label: "GB" },
          ].map(({ value, label }, index) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
                delay: 0.12 + index * 0.03,
              }}
              className="flex-1"
            >
              <SettingButton isActive={settings.unitType === value} onClick={() => handleUnitTypeChange(value as "binary" | "decimal")} className="w-full flex items-center justify-center">
                {label}
              </SettingButton>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="px-3 py-2" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15, delay: 0.22 }}>
        <motion.div className="text-xs text-gray-500 dark:text-gray-400 mb-2" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1, delay: 0.25 }}>
          刷新间隔
        </motion.div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 1000, label: "1s" },
            { value: 2000, label: "2s" },
            { value: 5000, label: "5s" },
            { value: 10000, label: "10s" },
          ].map(({ value, label }, index) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
                delay: 0.28 + index * 0.03,
              }}
            >
              <SettingButton isActive={settings.refreshInterval === value} onClick={() => handleRefreshIntervalChange(value as 1000 | 2000 | 5000 | 10000)} className="w-full">
                {label}
              </SettingButton>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 w-8 h-8"
        aria-label="打开设置"
        aria-haspopup="true"
      >
        {mounted && (
          <AnimatePresence mode="wait" initial={false}>
            {renderSettingsIcon()}
          </AnimatePresence>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="settings-dropdown"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{
              duration: 0.18,
              ease: [0.25, 0.46, 0.45, 0.94],
              scale: { type: "spring", stiffness: 400, damping: 30 },
            }}
            layout
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1a1a1a] rounded-md shadow-md dark:shadow-gray-900/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700 z-50"
          >
            {/* 选项卡切换 */}
            <motion.div
              className="flex border-b border-gray-200 dark:border-gray-700 relative"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: 0.03 }}
            >
              <motion.button
                onClick={() => setActiveTab("appearance")}
                className={`flex-1 px-4 py-2 text-sm font-medium text-center transition-colors duration-200 relative z-10 ${
                  activeTab === "appearance" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                whileTap={{}}
                transition={{ duration: 0.1 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                外观
              </motion.button>
              <motion.button
                onClick={() => setActiveTab("performance")}
                className={`flex-1 px-4 py-2 text-sm font-medium text-center transition-colors duration-200 relative z-10 ${
                  activeTab === "performance" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                whileTap={{}}
                transition={{ duration: 0.1 }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                性能
              </motion.button>
              {/* 活动选项卡指示器 */}
              <motion.div
                className="absolute bottom-0 h-0.5 bg-blue-500 dark:bg-blue-400"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{
                  opacity: 1,
                  scaleX: 1,
                  x: activeTab === "appearance" ? "0%" : "100%",
                  width: "50%",
                }}
                transition={{
                  opacity: { duration: 0.15, delay: 0.05 },
                  scaleX: { duration: 0.2, delay: 0.05 },
                  x: {
                    type: "spring",
                    stiffness: 400,
                    damping: 35,
                    duration: 0.2,
                  },
                }}
                style={{
                  left: 0,
                  transformOrigin: "left",
                }}
              />
            </motion.div>

            {/* 选项卡内容 */}
            <motion.div
              role="tabpanel"
              className="relative overflow-hidden"
              layout
              transition={{
                duration: 0.2,
                ease: "easeInOut",
                layout: { duration: 0.2 },
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === "appearance" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === "appearance" ? -20 : 20 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  layout
                  style={{ minHeight: "auto" }}
                  layoutId="tab-content"
                >
                  {activeTab === "appearance" ? renderAppearanceTab() : renderPerformanceTab()}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsMenu;

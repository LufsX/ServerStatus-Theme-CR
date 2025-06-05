"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "./settings";

const SettingsMenu = () => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"theme" | "display">("theme");
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
      initial={{ opacity: 0, rotate: 0, scale: 0.7 }}
      animate={{ opacity: 1, rotate: 0, scale: 1 }}
      exit={{ opacity: 0, rotate: 0, scale: 0.7 }}
      transition={{ duration: 0.1, type: "spring", stiffness: 300, damping: 20 }}
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

  // 渲染主题设置选项卡
  const renderThemeTab = () => (
    <motion.div className="py-1" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15, delay: 0.05 }} layout>
      {[
        { type: "system", label: "跟随系统" },
        { type: "light", label: "浅色主题" },
        { type: "dark", label: "深色主题" },
      ].map(({ type, label }, index) => (
        <motion.div key={type} className="px-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15, delay: 0.1 + index * 0.05 }}>
          <motion.button
            onClick={() => handleThemeChange(type)}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 ${
              theme === type ? "text-blue-500 dark:text-blue-400 font-medium" : ""
            }`}
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {type === "system" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3" aria-hidden="true">
                <rect x="4" y="6" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 22h6M12 18v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {type === "light" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3" aria-hidden="true">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M12 4V2M12 22v-2M4 12H2M22 12h-2M6.34 6.34l-1.42-1.42M19.07 19.07l-1.42-1.42M6.34 17.66l-1.42 1.42M19.07 4.93l-1.42 1.42"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {type === "dark" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {label}
          </motion.button>
        </motion.div>
      ))}
    </motion.div>
  );

  // 渲染显示设置选项卡
  const renderDisplayTab = () => (
    <motion.div className="py-1" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: 0.05 }}>
      <motion.div className="px-3 py-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15, delay: 0.1 }}>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">界面组件</div>
        <div className="flex space-x-2">
          <motion.button
            onClick={() => handleShowSummaryChange(!settings.showSummary)}
            className={`flex-1 px-2 py-1 text-sm rounded-sm transition-colors duration-150 ${
              settings.showSummary ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            摘要
          </motion.button>
          <motion.button
            onClick={() => handleShowFiltersChange(!settings.showFilters)}
            className={`flex-1 px-2 py-1 text-sm rounded-sm transition-colors duration-150 ${
              settings.showFilters ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            筛选
          </motion.button>
        </div>
      </motion.div>

      <motion.div className="px-3 py-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15, delay: 0.12 }}>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">显示模式</div>
        <div className="flex space-x-2">
          <motion.button
            onClick={() => handleDisplayModeChange("card")}
            className={`flex-1 px-2 py-1 text-sm rounded-sm transition-colors duration-150 flex items-center justify-center ${
              settings.displayMode === "card" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            </svg>
            卡片
          </motion.button>
          <motion.button
            onClick={() => handleDisplayModeChange("row")}
            className={`flex-1 px-2 py-1 text-sm rounded-sm transition-colors duration-150 flex items-center justify-center ${
              settings.displayMode === "row" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
              <rect x="3" y="4" width="18" height="2" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="3" y="11" width="18" height="2" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="3" y="18" width="18" height="2" rx="1" stroke="currentColor" strokeWidth="2" />
            </svg>
            横排
          </motion.button>
        </div>
      </motion.div>

      <motion.div className="px-3 py-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15, delay: 0.14 }}>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">数据单位</div>
        <div className="flex space-x-2">
          <motion.button
            onClick={() => handleUnitTypeChange("binary")}
            className={`flex-1 px-2 py-1 text-sm rounded-sm transition-colors duration-150 ${
              settings.unitType === "binary" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            GiB
          </motion.button>
          <motion.button
            onClick={() => handleUnitTypeChange("decimal")}
            className={`flex-1 px-2 py-1 text-sm rounded-sm transition-colors duration-150 ${
              settings.unitType === "decimal" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            GB
          </motion.button>
        </div>
      </motion.div>

      <motion.div className="px-3 py-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15, delay: 0.16 }}>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">刷新间隔</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 1000, label: "1s" },
            { value: 2000, label: "2s" },
            { value: 5000, label: "5s" },
            { value: 10000, label: "10s" },
          ].map(({ value, label }, index) => (
            <motion.button
              key={value}
              onClick={() => handleRefreshIntervalChange(value as 1000 | 2000 | 5000 | 10000)}
              className={`px-2 py-1 text-sm rounded-sm transition-colors duration-150 ${
                settings.refreshInterval === value ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                delay: 0.18 + index * 0.05,
              }}
            >
              {label}
            </motion.button>
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
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            layout
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1a1a1a] rounded-md shadow-md dark:shadow-gray-900/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700 z-50"
          >
            {/* 选项卡切换 */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <motion.button
                onClick={() => setActiveTab("theme")}
                className={`flex-1 px-4 py-2 text-sm font-medium text-center transition-colors duration-200 ${
                  activeTab === "theme"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                transition={{ duration: 0.15 }}
              >
                主题
              </motion.button>
              <motion.button
                onClick={() => setActiveTab("display")}
                className={`flex-1 px-4 py-2 text-sm font-medium text-center transition-colors duration-200 ${
                  activeTab === "display"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                transition={{ duration: 0.15 }}
              >
                显示
              </motion.button>
            </div>

            {/* 选项卡内容 */}
            <motion.div
              role="tabpanel"
              className="relative overflow-hidden"
              layout
              transition={{
                duration: 0.3,
                ease: "easeInOut",
                layout: { duration: 0.3 },
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === "theme" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === "theme" ? -20 : 20 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  layout
                  style={{ minHeight: "auto" }}
                  layoutId="tab-content"
                >
                  {activeTab === "theme" ? renderThemeTab() : renderDisplayTab()}
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

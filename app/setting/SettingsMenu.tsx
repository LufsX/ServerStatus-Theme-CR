"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useHydrated, useSettings } from "./settings";
import { SettingButton } from "./SettingButton";
import { useI18n } from "@/lib/i18n/hooks";
import Image from "next/image";
import { Grid2X2, List, Settings } from "lucide-react";

const SettingsMenu = () => {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"appearance" | "performance">("appearance");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mounted = useHydrated();

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

  // 切换语言
  const handleLocaleChange = (locale: "zh-CN" | "zh-TW" | "en-US" | "ja-JP") => {
    updateSettings({ locale });
  };

  // 切换单位类型
  const handleUnitTypeChange = (unitType: "binary" | "decimal") => {
    updateSettings({ unitType });
  };

  // 切换刷新间隔
  const handleRefreshIntervalChange = (refreshInterval: 1000 | 2000 | 5000 | 10000) => {
    updateSettings({ refreshInterval });
  };

  // 切换显示模式
  const handleDisplayModeChange = (displayMode: "card" | "row") => {
    updateSettings({ displayMode });
  };

  // 切换摘要显示
  const handleShowSummaryChange = (showSummary: boolean) => {
    updateSettings({ showSummary });
  };

  // 切换筛选器显示
  const handleShowFiltersChange = (showFilters: boolean) => {
    updateSettings({ showFilters });
  };

  // 切换精简模式
  const handleCompactModeChange = (compactMode: boolean) => {
    updateSettings({ compactMode });
  };

  // 切换 CPU 图表显示
  const handleShowCpuChartChange = (showCpuChart: boolean) => {
    updateSettings({ showCpuChart });
  };

  // 切换 CPU 图表时长
  const handleCpuChartDurationChange = (cpuChartDuration: 1 | 3 | 5) => {
    updateSettings({ cpuChartDuration });
  };

  if (!mounted) {
    return <div className="w-8 h-8"></div>;
  }

  const renderSettingsIcon = () => (
    <motion.div
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: 1, rotate: isOpen ? 90 : 0 }}
      exit={{ opacity: 0, rotate: 0 }}
      transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 25 }}
    >
      <Settings size={20} aria-hidden="true" />
    </motion.div>
  );

  const renderAppearanceTab = () => (
    <div className="py-1">
      <div className="px-3 py-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t("settings.theme")}</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "system", label: t("settings.auto") },
            { value: "light", label: t("settings.light") },
            { value: "dark", label: t("settings.dark") },
          ].map(({ value, label }) => (
            <SettingButton key={value} isActive={theme === value} onClick={() => handleThemeChange(value)} className="w-full">
              {label}
            </SettingButton>
          ))}
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t("settings.interfaceComponents")}</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "showSummary", label: t("settings.summary"), value: settings.showSummary, handler: handleShowSummaryChange },
            { key: "showFilters", label: t("settings.filters"), value: settings.showFilters, handler: handleShowFiltersChange },
            { key: "compactMode", label: t("settings.compact"), value: settings.compactMode, handler: handleCompactModeChange },
          ].map(({ key, label, value, handler }) => (
            <SettingButton key={key} isActive={value} onClick={() => handler(!value)} className="w-full">
              {label}
            </SettingButton>
          ))}
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t("settings.displayMode")}</div>
        <div className="flex space-x-2">
          {[
            {
              value: "card",
              label: t("settings.card"),
              icon: <Grid2X2 size={12} className="mr-1" aria-hidden="true" />,
            },
            {
              value: "row",
              label: t("settings.row"),
              icon: <List size={12} className="mr-1" aria-hidden="true" />,
            },
          ].map(({ value, label, icon }) => (
            <SettingButton key={value} isActive={settings.displayMode === value} onClick={() => handleDisplayModeChange(value as "card" | "row")} className="w-full flex items-center justify-center">
              {icon}
              {label}
            </SettingButton>
          ))}
        </div>
      </div>

      {/* 语言切换选项 */}
      <div className="px-3 py-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t("settings.language")}</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "zh-CN", label: t("settings.chinese"), flag: "cn" },
            { value: "zh-TW", label: t("settings.traditionalChinese"), flag: "tw" },
            { value: "en-US", label: t("settings.english"), flag: "us" },
            { value: "ja-JP", label: t("settings.japanese"), flag: "jp" },
          ].map(({ value, label, flag }) => (
            <SettingButton
              key={value}
              isActive={settings.locale === value}
              onClick={() => handleLocaleChange(value as "zh-CN" | "zh-TW" | "en-US" | "ja-JP")}
              className="w-full flex items-center justify-center"
            >
              <Image src={`/image/flags/${flag}.svg`} alt={`${flag} flag`} width={16} height={16} className="object-cover mr-1" />
              {label}
            </SettingButton>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="py-1">
      <div className="px-3 py-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t("settings.dataUnits")}</div>
        <div className="flex space-x-2">
          {[
            { value: "binary", label: "GiB" },
            { value: "decimal", label: "GB" },
          ].map(({ value, label }) => (
            <SettingButton key={value} isActive={settings.unitType === value} onClick={() => handleUnitTypeChange(value as "binary" | "decimal")} className="w-full flex items-center justify-center">
              {label}
            </SettingButton>
          ))}
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t("settings.refreshInterval")}</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 1000, label: "1s" },
            { value: 2000, label: "2s" },
            { value: 5000, label: "5s" },
            { value: 10000, label: "10s" },
          ].map(({ value, label }) => (
            <SettingButton key={value} isActive={settings.refreshInterval === value} onClick={() => handleRefreshIntervalChange(value as 1000 | 2000 | 5000 | 10000)} className="w-full">
              {label}
            </SettingButton>
          ))}
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t("settings.cpuChart")}</div>
        <div className="flex space-x-2">
          {[
            { value: true, label: t("settings.on") },
            { value: false, label: t("settings.off") },
          ].map(({ value, label }) => (
            <SettingButton key={String(value)} isActive={settings.showCpuChart === value} onClick={() => handleShowCpuChartChange(value)} className="w-full">
              {label}
            </SettingButton>
          ))}
        </div>
      </div>

      {settings.showCpuChart && (
        <div className="px-3 py-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t("settings.recordDuration")}</div>
          <div className="flex space-x-2">
            {[
              { value: 1, label: "1min" },
              { value: 3, label: "3min" },
              { value: 5, label: "5min" },
            ].map(({ value, label }) => (
              <SettingButton key={value} isActive={settings.cpuChartDuration === value} onClick={() => handleCpuChartDurationChange(value as 1 | 3 | 5)} className="w-full">
                {label}
              </SettingButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 w-8 h-8"
        aria-label={t("settings.title")}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={isOpen ? "settings-dropdown" : undefined}
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
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              duration: 0.2,
            }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1a1a1a] rounded-md shadow-md dark:shadow-gray-900/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700 z-50"
          >
            {/* 选项卡切换 */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 relative">
              <button
                onClick={() => setActiveTab("appearance")}
                className={`flex-1 px-4 py-2 text-sm font-medium text-center transition-colors duration-200 relative z-10 ${
                  activeTab === "appearance" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {t("settings.appearance")}
              </button>
              <button
                onClick={() => setActiveTab("performance")}
                className={`flex-1 px-4 py-2 text-sm font-medium text-center transition-colors duration-200 relative z-10 ${
                  activeTab === "performance" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {t("settings.performance")}
              </button>
              {/* 活动选项卡指示器 */}
              <motion.div
                className="absolute bottom-0 h-0.5 bg-blue-500 dark:bg-blue-400"
                initial={false}
                animate={{
                  x: activeTab === "appearance" ? "0%" : "100%",
                  width: "50%",
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 35,
                  duration: 0.3,
                }}
                style={{
                  left: 0,
                }}
              />
            </div>

            {/* 选项卡内容 */}
            <div role="tabpanel" className="relative overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{
                    duration: 0.15,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="w-full"
                >
                  {activeTab === "appearance" ? renderAppearanceTab() : renderPerformanceTab()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsMenu;

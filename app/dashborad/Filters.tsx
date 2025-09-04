"use client";

import React, { memo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/hooks";
import { ServerData } from "@/lib/api";
import { SortOption, SortOrder } from "@/lib/sorting";

export type { SortOption, SortOrder };

interface FiltersProps {
  servers: ServerData[];
  selectedLocation: string | null;
  onLocationChange: (location: string | null) => void;
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  selectedStatus: "all" | "online" | "offline" | null;
  onStatusChange: (status: "all" | "online" | "offline" | null) => void;
  sortBy: SortOption;
  onSortByChange: (sortBy: SortOption) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (sortOrder: SortOrder) => void;
}

export const Filters = memo(function Filters({
  servers,
  selectedLocation,
  onLocationChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: FiltersProps) {
  const { t } = useI18n();
  const [searchLocation, setSearchLocation] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (servers.length > 0 && locations.length === 0) {
      setLocations([...new Set(servers.map((s) => s.location).filter(Boolean))].sort());
    }
    if (servers.length > 0 && types.length === 0) {
      setTypes([...new Set(servers.map((s) => s.type?.toLowerCase()).filter(Boolean))].sort());
    }
  }, [servers, locations.length, types.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };

    const handleScroll = () => {
      // 滚动时关闭下拉菜单
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // 监听按钮容器的滚动
    const scrollContainer = buttonScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [openDropdown]);

  const filteredLocations = searchLocation ? locations.filter((loc) => loc.toLowerCase().includes(searchLocation.toLowerCase())) : locations;

  const activeFiltersCount = (selectedStatus && selectedStatus !== "all" ? 1 : 0) + (selectedLocation ? 1 : 0) + (selectedType ? 1 : 0) + (sortBy !== "default" ? 1 : 0);

  const clearAllFilters = () => {
    onStatusChange(null);
    onLocationChange(null);
    onTypeChange(null);
    onSortByChange("default");
    onSortOrderChange("desc");
    setSearchLocation("");
    setOpenDropdown(null);
  };

  const toggleDropdown = (dropdown: string, event?: React.MouseEvent) => {
    if (openDropdown === dropdown) {
      setOpenDropdown(null);
    } else {
      if (event && containerRef.current && buttonScrollRef.current) {
        const button = event.currentTarget as HTMLElement;
        const buttonRect = button.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        // 计算按钮相对于组件容器的位置
        let left = buttonRect.left - containerRect.left;
        const top = buttonRect.bottom - containerRect.top - 20;

        // 检查是否会超出右边界，如果会则调整位置
        const viewportWidth = window.innerWidth;
        const estimatedDropdownWidth = dropdown === "location" ? 250 : dropdown === "sort" ? 120 : 100;

        if (buttonRect.left + estimatedDropdownWidth > viewportWidth) {
          // 右对齐到按钮
          left = buttonRect.right - containerRect.left - estimatedDropdownWidth;
        }

        // 确保不会超出左边界
        left = Math.max(0, left);

        setDropdownPosition({ left, top });
      }
      setOpenDropdown(dropdown);
    }
  };

  const sortOptions = [
    { value: "default" as SortOption, label: t("dashboard.all") },
    { value: "name" as SortOption, label: t("server.name") },
    { value: "location" as SortOption, label: t("server.location") },
    { value: "cpu" as SortOption, label: t("server.cpu") },
    { value: "memory" as SortOption, label: t("server.memory") },
    { value: "uptime" as SortOption, label: t("server.uptime") },
    { value: "load" as SortOption, label: t("server.load") },
    { value: "network_rx" as SortOption, label: t("server.network") },
    { value: "network_tx" as SortOption, label: t("server.traffic") },
  ];
  return (
    <div className="relative mb-6" ref={containerRef}>
      {/* 按钮容器 */}
      <div className="flex items-center gap-2 h-8 overflow-x-auto overflow-y-visible" ref={buttonScrollRef}>
        {/* 状态筛选按钮 */}
        <div className="dropdown-container relative flex-shrink-0">
          <button
            onClick={(e) => toggleDropdown("status", e)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border ${
              selectedStatus !== null && selectedStatus !== "all"
                ? "bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400"
                : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 hover:dark:bg-gray-800"
            }`}
          >
            <span className="truncate">{selectedStatus === "online" ? t("server.online") : selectedStatus === "offline" ? t("server.offline") : t("dashboard.status")}</span>
            <motion.span animate={{ rotate: openDropdown === "status" ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-xs">
              ▼
            </motion.span>
          </button>
        </div>

        {/* 位置筛选按钮 */}
        {locations.length > 0 && (
          <div className="dropdown-container relative flex-shrink-0">
            <button
              onClick={(e) => toggleDropdown("location", e)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border ${
                selectedLocation !== null
                  ? "bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400"
                  : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 hover:dark:bg-gray-800"
              }`}
            >
              <span className="truncate">{selectedLocation ? `📍 ${selectedLocation}` : t("server.location")}</span>
              <motion.span animate={{ rotate: openDropdown === "location" ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-xs">
                ▼
              </motion.span>
            </button>
          </div>
        )}

        {/* 类型筛选按钮 */}
        {types.length > 0 && (
          <div className="dropdown-container relative flex-shrink-0">
            <button
              onClick={(e) => toggleDropdown("type", e)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border ${
                selectedType !== null
                  ? "bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400"
                  : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 hover:dark:bg-gray-800"
              }`}
            >
              <span className="truncate">{selectedType ? selectedType.toUpperCase() : t("server.arch")}</span>
              <motion.span animate={{ rotate: openDropdown === "type" ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-xs">
                ▼
              </motion.span>
            </button>
          </div>
        )}

        {/* 排序筛选按钮 */}
        <div className="dropdown-container relative flex gap-1 flex-shrink-0">
          {/* 排序字段选择按钮 */}
          <button
            onClick={(e) => toggleDropdown("sort", e)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border ${
              sortBy !== "default"
                ? "bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400"
                : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 hover:dark:bg-gray-800"
            }`}
          >
            <span className="truncate">{sortBy !== "default" ? sortOptions.find((opt) => opt.value === sortBy)?.label : t("dashboard.sort")}</span>
            <motion.span animate={{ rotate: openDropdown === "sort" ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-xs">
              ▼
            </motion.span>
          </button>

          {/* 排序方向切换按钮 */}
          {sortBy !== "default" && (
            <motion.button
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1 }}
              onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
              className="px-2 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 hover:dark:bg-blue-700 border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center min-w-[28px]"
              title={`${t("dashboard.clickToToggle")}${sortOrder === "asc" ? t("dashboard.desc") : t("dashboard.asc")}`}
            >
              <motion.span key={sortOrder} initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} transition={{ duration: 0.2 }} className="text-sm">
                {sortOrder === "asc" ? "↑" : "↓"}
              </motion.span>
            </motion.button>
          )}
        </div>

        {/* 清除筛选按钮 */}
        {activeFiltersCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            onClick={clearAllFilters}
            className="px-3 py-1.5 bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-700 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 flex-shrink-0"
          >
            <span>{t("dashboard.clear")}</span>
            <span className="text-xs">({activeFiltersCount})</span>
          </motion.button>
        )}
      </div>

      {/* 下拉菜单容器 */}
      <div className="absolute top-full left-0 right-0 z-50">
        {/* 状态下拉菜单 */}
        <AnimatePresence>
          {openDropdown === "status" && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 bg-white hover:border-gray-400 hover:dark:border-gray-600 rounded-lg shadow-lg min-w-[100px] transition-colors whitespace-nowrap"
              style={{ left: dropdownPosition.left, top: dropdownPosition.top }}
            >
              <div className="p-1 grid gap-y-0.5">
                <button
                  onClick={() => {
                    onStatusChange(null);
                    setOpenDropdown(null);
                  }}
                  className={`w-full px-3 py-2 rounded-md text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    !selectedStatus || selectedStatus === "all" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {t("dashboard.all")}
                </button>
                <button
                  onClick={() => {
                    onStatusChange("online");
                    setOpenDropdown(null);
                  }}
                  className={`w-full px-3 py-2 rounded-md text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 ${
                    selectedStatus === "online" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {t("server.online")}
                </button>
                <button
                  onClick={() => {
                    onStatusChange("offline");
                    setOpenDropdown(null);
                  }}
                  className={`w-full px-3 py-2 rounded-md text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 ${
                    selectedStatus === "offline" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {t("server.offline")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 位置下拉菜单 */}
        <AnimatePresence>
          {openDropdown === "location" && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 bg-white hover:border-gray-400 hover:dark:border-gray-600 rounded-lg shadow-lg min-w-[100px] max-w-[250px] transition-colors whitespace-nowrap"
              style={{ left: dropdownPosition.left, top: dropdownPosition.top }}
            >
              <div className="p-1 grid gap-y-0.5 max-h-60 overflow-y-auto">
                {locations.length > 6 && (
                  <div className="px-1 pt-1 pb-2">
                    <input
                      type="text"
                      placeholder={t("dashboard.searchLocation")}
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 min-w-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
                <button
                  onClick={() => {
                    onLocationChange(null);
                    setOpenDropdown(null);
                  }}
                  className={`w-full px-3 py-2 rounded-md text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    !selectedLocation ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {t("dashboard.all")}
                </button>
                {filteredLocations.map((location) => (
                  <button
                    key={location}
                    onClick={() => {
                      onLocationChange(location);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-2 rounded-md text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors truncate ${
                      selectedLocation === location ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
                    }`}
                    title={location}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 类型下拉菜单 */}
        <AnimatePresence>
          {openDropdown === "type" && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 bg-white hover:border-gray-400 hover:dark:border-gray-600 rounded-lg shadow-lg min-w-[80px] transition-colors whitespace-nowrap"
              style={{ left: dropdownPosition.left, top: dropdownPosition.top }}
            >
              <div className="p-1 grid gap-y-0.5">
                <button
                  onClick={() => {
                    onTypeChange(null);
                    setOpenDropdown(null);
                  }}
                  className={`w-full px-3 py-2 rounded-md text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    !selectedType ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {t("dashboard.all")}
                </button>
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      onTypeChange(type);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-2 rounded-md text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                      selectedType === type ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 排序下拉菜单 */}
        <AnimatePresence>
          {openDropdown === "sort" && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 bg-white hover:border-gray-400 hover:dark:border-gray-600 rounded-lg shadow-lg min-w-[100px] transition-colors whitespace-nowrap"
              style={{ left: dropdownPosition.left, top: dropdownPosition.top }}
            >
              <div className="p-1 grid gap-y-0.5">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortByChange(option.value);
                      if (option.value !== "default") {
                        onSortOrderChange("asc");
                      }
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-2 rounded-md text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                      sortBy === option.value ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

"use client";

import React, { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [searchLocation, setSearchLocation] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const sortOptions = [
    { value: "default" as SortOption, label: "默认" },
    { value: "name" as SortOption, label: "名称" },
    { value: "location" as SortOption, label: "位置" },
    { value: "cpu" as SortOption, label: "CPU" },
    { value: "memory" as SortOption, label: "内存" },
    { value: "uptime" as SortOption, label: "运行时长" },
    { value: "load" as SortOption, label: "负载" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 h-8 mb-6">
      {/* 状态筛选按钮 */}
      <div className="dropdown-container relative">
        <button
          onClick={() => toggleDropdown("status")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border ${
            selectedStatus !== null && selectedStatus !== "all"
              ? "bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400"
              : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 hover:dark:bg-gray-800"
          }`}
        >
          <span className="truncate">{selectedStatus === "online" ? "在线" : selectedStatus === "offline" ? "离线" : "状态"}</span>
          <motion.span animate={{ rotate: openDropdown === "status" ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-xs">
            ▼
          </motion.span>
        </button>

        <AnimatePresence>
          {openDropdown === "status" && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-1 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 bg-white hover:border-gray-400 hover:dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[100px] transition-colors"
            >
              <div className="p-1">
                <button
                  onClick={() => {
                    onStatusChange(null);
                    setOpenDropdown(null);
                  }}
                  className={`w-full px-3 py-2 rounded-md text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    !selectedStatus || selectedStatus === "all" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  全部
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
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>在线
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
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>离线
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 位置筛选按钮 */}
      {locations.length > 0 && (
        <div className="dropdown-container relative">
          <button
            onClick={() => toggleDropdown("location")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border ${
              selectedLocation !== null
                ? "bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400"
                : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 hover:dark:bg-gray-800"
            }`}
          >
            <span className="truncate">{selectedLocation ? `📍 ${selectedLocation}` : "位置"}</span>
            <motion.span animate={{ rotate: openDropdown === "location" ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-xs">
              ▼
            </motion.span>
          </button>

          <AnimatePresence>
            {openDropdown === "location" && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-1 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 bg-white hover:border-gray-400 hover:dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[100px] max-w-[250px] transition-colors"
              >
                <div className="p-1 max-h-60 overflow-y-auto">
                  {locations.length > 6 && (
                    <div className="px-1 pt-1 pb-2">
                      <input
                        type="text"
                        placeholder="搜索位置..."
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
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
                    全部
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
        </div>
      )}

      {/* 类型筛选按钮 */}
      {types.length > 0 && (
        <div className="dropdown-container relative">
          <button
            onClick={() => toggleDropdown("type")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border ${
              selectedType !== null
                ? "bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400"
                : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 hover:dark:bg-gray-800"
            }`}
          >
            <span className="truncate">{selectedType ? selectedType.toUpperCase() : "类型"}</span>
            <motion.span animate={{ rotate: openDropdown === "type" ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-xs">
              ▼
            </motion.span>
          </button>

          <AnimatePresence>
            {openDropdown === "type" && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-1 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 bg-white hover:border-gray-400 hover:dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[80px] transition-colors"
              >
                <div className="p-1">
                  <button
                    onClick={() => {
                      onTypeChange(null);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-2 rounded-md text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                      !selectedType ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    全部
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
        </div>
      )}

      {/* 排序筛选按钮 */}
      <div className="dropdown-container relative flex gap-1">
        {/* 排序字段选择按钮 */}
        <button
          onClick={() => toggleDropdown("sort")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border ${
            sortBy !== "default"
              ? "bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400"
              : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 hover:dark:bg-gray-800"
          }`}
        >
          <span className="truncate">{sortBy !== "default" ? sortOptions.find((opt) => opt.value === sortBy)?.label : "排序"}</span>
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
            title={`点击切换${sortOrder === "asc" ? "降序" : "升序"}`}
          >
            <motion.span key={sortOrder} initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} transition={{ duration: 0.2 }} className="text-sm">
              {sortOrder === "asc" ? "↑" : "↓"}
            </motion.span>
          </motion.button>
        )}

        <AnimatePresence>
          {openDropdown === "sort" && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-1 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 bg-white hover:border-gray-400 hover:dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[100px] transition-colors"
            >
              <div className="p-1">
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

      {/* 清除筛选按钮 */}
      {activeFiltersCount > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          onClick={clearAllFilters}
          className="px-3 py-1.5 bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-700 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1"
        >
          <span>清除</span>
          <span className="text-xs">({activeFiltersCount})</span>
        </motion.button>
      )}
    </div>
  );
});

"use client";

export type UnitType = "binary" | "decimal"; // GiB | GB
export type RefreshInterval = 1000 | 2000 | 5000 | 10000; // 1s, 2s, 5s, 10s
export type DisplayMode = "card" | "row"; // 卡片模式 | 横排模式

export interface Settings {
  unitType: UnitType;
  refreshInterval: RefreshInterval;
  displayMode: DisplayMode;
  showSummary: boolean;
  showFilters: boolean;
}

// 默认设置
const DEFAULT_SETTINGS: Settings = {
  unitType: "binary",
  refreshInterval: 2000,
  displayMode: "card",
  showSummary: false,
  showFilters: false,
};

// 自定义事件名称
const SETTINGS_CHANGE_EVENT = "settingsChange";

/**
 * 设置管理类
 */
class SettingsManager {
  private settings: Settings;

  constructor() {
    this.settings = this.loadSettings();
  }

  /**
   * 从 localStorage 加载设置
   */
  private loadSettings(): Settings {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS;
    }

    try {
      const savedSettings = localStorage.getItem("appSettings");
      return savedSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error("加载设置失败:", error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * 保存设置到 localStorage
   */
  private saveSettings(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("appSettings", JSON.stringify(this.settings));
      // 触发自定义事件通知组件设置已更改
      window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT));
    }
  }

  /**
   * 获取当前设置
   */
  getSettings(): Settings {
    return { ...this.settings };
  }

  /**
   * 更新设置
   */
  updateSettings(newSettings: Partial<Settings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  /**
   * 重置设置为默认值
   */
  resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }
}

// 创建单例实例
let settingsManagerInstance: SettingsManager | null = null;

/**
 * 获取设置管理器实例
 */
export function getSettingsManager(): SettingsManager {
  if (!settingsManagerInstance) {
    settingsManagerInstance = new SettingsManager();
  }
  return settingsManagerInstance;
}

/**
 * React Hook 用于在组件中使用设置
 */
import { useState, useEffect } from "react";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // 组件挂载时获取设置
    const manager = getSettingsManager();
    setSettings(manager.getSettings());

    // 监听设置变更事件
    const handleSettingsChange = () => {
      setSettings(manager.getSettings());
    };

    window.addEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange);

    // 清理事件监听
    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange);
    };
  }, []);

  // 返回设置和更新函数
  return {
    settings,
    updateSettings: (newSettings: Partial<Settings>) => {
      getSettingsManager().updateSettings(newSettings);
    },
    resetSettings: () => {
      getSettingsManager().resetSettings();
    },
  };
}

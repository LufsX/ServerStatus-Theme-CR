"use client";

export type UnitType = "binary" | "decimal"; // GiB | GB
export type RefreshInterval = 1000 | 2000 | 5000 | 10000; // 1s, 2s, 5s, 10s
export type DisplayMode = "card" | "row"; // 卡片模式 | 横排模式
export type CpuChartDuration = 1 | 3 | 5; // 1min, 3min, 5min
export type Locale = "zh-CN" | "zh-TW" | "en-US" | "ja-JP"; // 语言

export interface Settings {
  unitType: UnitType;
  refreshInterval: RefreshInterval;
  displayMode: DisplayMode;
  showSummary: boolean;
  showFilters: boolean;
  showCpuChart: boolean;
  cpuChartDuration: CpuChartDuration;
  compactMode: boolean;
  locale: Locale;
}

// 默认设置 Default Settings
export const DEFAULT_SETTINGS: Settings = {
  unitType: "binary", // "binary" | "decimal"; // GiB | GB
  refreshInterval: 2000, // 1000 | 2000 | 5000 | 10000; // 刷新间隔 1s, 2s, 5s, 10s
  displayMode: "card", // "card" | "row"; // 卡片模式 | 横排模式
  showSummary: false, // "true" | "false"; // 是否显示摘要
  showFilters: false, // "true" | "false"; // 是否显示过滤器
  showCpuChart: false, // "true" | "false"; // 是否显示 CPU 图表
  cpuChartDuration: 3, // 1 | 3 | 5; // CPU 图表记录时长 1min, 3min, 5min
  compactMode: false, // "true" | "false"; // 是否启用紧凑模式
  locale: "zh-CN", // "zh-CN" | "zh-TW" | "en-US" | "ja-JP"; // 语言
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
      try {
        localStorage.setItem("appSettings", JSON.stringify(this.settings));
      } catch (error) {
        console.error("保存设置失败:", error);
      }
      // 触发自定义事件通知组件设置已更改
      window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT));
    }
  }

  /**
   * 获取当前设置
   */
  getSettings(): Settings {
    return this.settings;
  }

  /** Reload settings so changes made in another tab are visible. */
  reloadSettings(): void {
    this.settings = this.loadSettings();
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

export function hasStoredSettings(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("appSettings") !== null;
  } catch {
    return false;
  }
}

/**
 * React Hook 用于在组件中使用设置
 */
import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
const settingsSubscribers = new Set<() => void>();
let settingsEventsAttached = false;

function notifySettingsSubscribers(): void {
  settingsSubscribers.forEach((subscriber) => subscriber());
}

function attachSettingsEvents(): void {
  if (settingsEventsAttached || typeof window === "undefined") return;
  settingsEventsAttached = true;
  window.addEventListener(SETTINGS_CHANGE_EVENT, notifySettingsSubscribers);
  window.addEventListener("storage", (event) => {
    if (event.key === "appSettings" || event.key === null) {
      getSettingsManager().reloadSettings();
      notifySettingsSubscribers();
    }
  });
}

export function subscribeToSettings(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return noopSubscribe();
  attachSettingsEvents();
  settingsSubscribers.add(onStoreChange);
  return () => settingsSubscribers.delete(onStoreChange);
}

/** Hydration state shared by client-only UI which must not differ from SSR. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

function getSettingsSnapshot(): Settings {
  return getSettingsManager().getSettings();
}

function getServerSettingsSnapshot(): Settings {
  return DEFAULT_SETTINGS;
}

export function useSettings() {
  const settings = useSyncExternalStore(subscribeToSettings, getSettingsSnapshot, getServerSettingsSnapshot);

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

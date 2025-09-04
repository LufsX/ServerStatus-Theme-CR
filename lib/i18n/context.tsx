"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSettingsManager, type Locale } from "@/app/setting/settings";
import defaultMessages from "@/locales/zh-CN.json";

export { type Locale } from "@/app/setting/settings";
export const locales: Locale[] = ["zh-CN", "en-US"];

// 从设置管理器获取默认语言
const getDefaultLocale = (): Locale => {
  return getSettingsManager().getSettings().locale;
};

export const localeInfo: Record<Locale, { name: string; flag: string }> = {
  "zh-CN": { name: "简体中文", flag: "🇨🇳" },
  "en-US": { name: "English", flag: "🇺🇸" },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getDefaultLocale());
  const [messages, setMessages] = useState<Record<string, unknown>>(defaultMessages);

  // 初始化时从设置管理器获取语言设置
  useEffect(() => {
    if (typeof window === "undefined") return;

    const settings = getSettingsManager().getSettings();
    if (settings.locale && locales.includes(settings.locale as Locale)) {
      setLocale(settings.locale as Locale);
    }
  }, []);

  // 监听设置变化
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSettingsChange = () => {
      const settings = getSettingsManager().getSettings();
      if (settings.locale && locales.includes(settings.locale as Locale)) {
        setLocale(settings.locale as Locale);
      }
    };

    window.addEventListener("settingsChange", handleSettingsChange);

    return () => {
      window.removeEventListener("settingsChange", handleSettingsChange);
    };
  }, []);

  // 加载语言包
  useEffect(() => {
    const loadMessages = async () => {
      if (locale === "zh-CN") {
        setMessages(defaultMessages);
        return;
      }

      try {
        const msgs = await import(`../../locales/${locale}.json`);
        setMessages(msgs.default);
      } catch {
        setMessages(defaultMessages);
        setLocale("zh-CN");
      }
    };

    loadMessages();
  }, [locale]);

  const t = (key: string): string => {
    const keys = key.split(".");
    let result: unknown = messages;

    for (const k of keys) {
      if (result && typeof result === "object" && result !== null && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    return result as string;
  };

  const updateLocale = (newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      setLocale(newLocale);
      getSettingsManager().updateSettings({ locale: newLocale });
    }
  };

  return <I18nContext.Provider value={{ locale, setLocale: updateLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

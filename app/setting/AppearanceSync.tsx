"use client";

import { useEffect } from "react";
import { useSettings } from "./settings";

/** Keep appearance in sync with settings, including resets and other tabs. */
export function AppearanceSync() {
  const { settings } = useSettings();
  useEffect(() => {
    const { dataset } = document.documentElement;
    dataset.radius = settings.radiusStyle;
    dataset.color = settings.colorStyle;
    dataset.font = settings.fontStyle;
  }, [settings.radiusStyle, settings.colorStyle, settings.fontStyle]);
  return null;
}

export const RADIUS_STYLES = ["none", "small", "large"] as const;
export const COLOR_STYLES = ["default", "violet", "emerald", "rose", "amber"] as const;
export const FONT_STYLES = ["auto", "standard", "serif"] as const;

export type RadiusStyle = (typeof RADIUS_STYLES)[number];
export type ColorStyle = (typeof COLOR_STYLES)[number];
export type FontStyle = (typeof FONT_STYLES)[number];

export interface AppearanceSettings {
  radiusStyle: RadiusStyle;
  colorStyle: ColorStyle;
  fontStyle: FontStyle;
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  radiusStyle: "small",
  colorStyle: "default",
  fontStyle: "auto",
};

export function normalizeAppearance(value: unknown): AppearanceSettings {
  const saved = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    radiusStyle: RADIUS_STYLES.includes(saved.radiusStyle as RadiusStyle) ? saved.radiusStyle as RadiusStyle : DEFAULT_APPEARANCE.radiusStyle,
    colorStyle: COLOR_STYLES.includes(saved.colorStyle as ColorStyle) ? saved.colorStyle as ColorStyle : DEFAULT_APPEARANCE.colorStyle,
    fontStyle: FONT_STYLES.includes(saved.fontStyle as FontStyle) ? saved.fontStyle as FontStyle : DEFAULT_APPEARANCE.fontStyle,
  };
}

// Apply saved preferences before paint; storage may be disabled or contain invalid JSON.
export const appearanceInitScript = `(()=>{try{const s=JSON.parse(localStorage.getItem("appSettings")||"{}");const d=document.documentElement.dataset;${[
  ["radius", "radiusStyle", RADIUS_STYLES, DEFAULT_APPEARANCE.radiusStyle],
  ["color", "colorStyle", COLOR_STYLES, DEFAULT_APPEARANCE.colorStyle],
  ["font", "fontStyle", FONT_STYLES, DEFAULT_APPEARANCE.fontStyle],
].map(([attr, key, values, fallback]) => `d.${attr}=${JSON.stringify(values)}.includes(s?.${key})?s.${key}:${JSON.stringify(fallback)};`).join("")}}catch{}})();`;

// Canvas text cannot inherit CSS, so charts use the same explicit font stacks.
export const APPEARANCE_FONTS = {
  standard: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: '"Noto Serif CJK SC", "Noto Serif SC", "Source Han Serif SC", "Songti SC", SimSun, Georgia, "Times New Roman", serif',
} as const;

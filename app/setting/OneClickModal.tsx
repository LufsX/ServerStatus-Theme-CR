"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/hooks";

interface OneClickForm {
  uid: string;
  gid: string;
  pass: string;
  vnstat: boolean;
  ping: boolean;
  tupd: boolean;
  extra: boolean;
  notify: boolean;
  alias: string;
  type: string;
  loc: string;
  interval: number;
  weight: number;
  cn: boolean;
  vnstatMr: number;
  cm: string;
  ct: string;
  cu: string;
  iface: string;
  excludeIface: string;
  ipSource: string;
}

const serverDefaults: OneClickForm = {
  uid: "",
  gid: "",
  pass: "",
  vnstat: false,
  ping: true,
  tupd: true,
  extra: true,
  notify: true,
  alias: "",
  type: "",
  loc: "",
  interval: 1,
  weight: 0,
  cn: false,
  vnstatMr: 1,
  cm: "",
  ct: "",
  cu: "",
  iface: "",
  excludeIface: "",
  ipSource: "ip-api.com",
};

export default function OneClickModal(): React.ReactElement | null {
  const { t } = useI18n();
  const hideOneClickDeploy = process.env.NEXT_PUBLIC_HIDE_ONE_CLICK_DEPLOY === "true";

  const [isOpen, setIsOpen] = useState(false);
  const [useSudo, setUseSudo] = useState(false);
  const [useCurl, setUseCurl] = useState(true);
  const [form, setForm] = useState<OneClickForm>(serverDefaults);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 处理点击外部和 ESC 键关闭模态框
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEvent = (e: MouseEvent | KeyboardEvent) => {
      if (e.type === "keydown" && (e as KeyboardEvent).key === "Escape") {
        setIsOpen(false);
      } else if (e.type === "mousedown" && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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

  // 验证表单是否有效
  const isValid = (): boolean => {
    const uid = (form.uid || "").trim();
    const gid = (form.gid || "").trim();
    const alias = (form.alias || "").trim();
    const pass = (form.pass || "").trim();
    return (!!(uid || (gid && alias)) && !!pass) || false;
  };

  // 必填标识：返回 'red' 表示必填，'black' 表示可二选/条件必填，null 表示非必填
  const getRequiredMark = (fieldKey: keyof OneClickForm): "red" | "black" | null => {
    const uid = (form.uid || "").trim();
    const gid = (form.gid || "").trim();
    const alias = (form.alias || "").trim();
    const path = uid ? "A" : gid || alias ? "B" : null; // A: uid 路径；B: gid+alias 路径；null: 尚未选择

    if (fieldKey === "pass") return "red";

    if (fieldKey === "uid") {
      if (path === null) return "black"; // 两种路径二选一
      if (path === "A") return "red"; // 已选择 uid 路径
      return null; // 走 B 路径时无需 uid
    }

    if (fieldKey === "gid" || fieldKey === "alias") {
      if (path === null) return "black"; // 两种路径二选一（B 路径是 gid+alias）
      if (path === "B") return "red"; // 已选择 B 路径时二者都必填
      return null; // 走 A 路径时无需 gid/alias
    }

    return null;
  };

  // 生成部署命令
  const generateCommand = (): string => {
    const envBase = typeof process !== "undefined" ? (process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined) : undefined;
    const base = envBase && envBase.length > 0 ? envBase : typeof window !== "undefined" ? window.location.origin : "";
    const url = new URL("i", base || "http://localhost");

    (Object.keys(form) as (keyof OneClickForm)[]).forEach((key) => {
      const value = form[key];
      if (value === undefined || value === null || serverDefaults[key] === value) return;

      if (key === "vnstatMr") {
        if (value !== serverDefaults[key]) {
          url.searchParams.append("vnstat-mr", String(value));
        }
        return;
      }

      if (key === "excludeIface") {
        if (value && String(value).trim()) {
          url.searchParams.append("exclude-iface", String(value));
        }
        return;
      }

      if (key === "ipSource") {
        if (value !== serverDefaults[key]) {
          url.searchParams.append("ip-source", String(value));
        }
        return;
      }

      if (typeof value === "boolean") {
        url.searchParams.append(key, value ? "1" : "0");
      } else if (String(value).trim()) {
        url.searchParams.append(key, String(value));
      }
    });

    const prefix = useSudo ? "sudo " : "";
    const urlString = url.toString();

    if (useCurl) {
      return `curl -fsSL "${urlString}" | ${prefix}bash`;
    } else {
      return `wget -qO- "${urlString}" | ${prefix}bash`;
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateCommand());
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch {
      // noop
    }
  };

  // 更新表单字段
  const updateField = (key: keyof OneClickForm, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 渲染一键部署图标
  const renderOneClickIcon = () => (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: 1, rotate: isOpen ? 90 : 0 }}
      exit={{ opacity: 0, rotate: 0 }}
      transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 25 }}
      aria-hidden="true"
    >
      <path d="M16 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6L2 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 4l-4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );

  if (hideOneClickDeploy) {
    return null;
  }

  if (!mounted) {
    return <div className="w-8 h-8"></div>;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        aria-label={t("oneClick.title")}
        onClick={() => setIsOpen((s) => !s)}
        className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 w-8 h-8"
        transition={{ duration: 0.15 }}
      >
        {mounted && (
          <AnimatePresence mode="wait" initial={false}>
            {renderOneClickIcon()}
          </AnimatePresence>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-75 sm:w-[380px] max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto bg-white dark:bg-[#1a1a1a] rounded-md shadow-md dark:shadow-gray-900/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700 z-50 p-3 sm:p-4"
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{
              duration: 0.18,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <motion.div className="flex flex-col gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05, duration: 0.15 }}>
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.15 }}>
                <h3 className="font-semibold text-lg">{t("oneClick.title")}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("oneClick.description")}</p>
              </motion.div>

              <motion.div className="grid grid-cols-1 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12, duration: 0.15 }}>
                {/* 基础配置 */}
                <motion.div className="space-y-2" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.13, duration: 0.15 }}>
                  <motion.h4
                    className="text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.13, duration: 0.15 }}
                  >
                    {t("oneClick.basicConfig")}
                  </motion.h4>
                  {[
                    { key: "uid", label: t("oneClick.userId"), placeholder: t("oneClick.userIdPlaceholder"), type: "text" },
                    { key: "gid", label: t("oneClick.groupId"), placeholder: t("oneClick.groupIdPlaceholder"), type: "text" },
                    { key: "pass", label: t("oneClick.password"), placeholder: t("oneClick.passwordPlaceholder"), type: "text" },
                    { key: "alias", label: t("oneClick.alias"), placeholder: t("oneClick.aliasPlaceholder"), type: "text" },
                  ].map(({ key, label, placeholder, type }, index) => (
                    <motion.div
                      key={key}
                      className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.02, duration: 0.15 }}
                    >
                      <label className="w-full sm:w-24 text-base text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        {label}
                        {(() => {
                          const m = getRequiredMark(key as keyof OneClickForm);
                          if (!m) return null;
                          return <span className={m === "red" ? "text-red-500" : "text-black dark:text-white/80"}>*</span>;
                        })()}
                      </label>
                      <input
                        aria-label={label}
                        placeholder={placeholder}
                        type={type}
                        className="flex-1 bg-gray-100 border border-gray-300 text-base md:text-sm rounded px-2 py-1.5 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-all duration-200"
                        value={form[key as keyof OneClickForm] as string}
                        onChange={(e) => updateField(key as keyof OneClickForm, e.target.value)}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* 高级配置 */}
                <motion.div className="space-y-2" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.23, duration: 0.15 }}>
                  <motion.button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.15 }}
                  >
                    <span>{t("oneClick.advancedConfig")}</span>
                    <motion.svg width="16" height="16" viewBox="0 0 24 24" fill="none" animate={{ rotate: showAdvanced ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-gray-500">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  </motion.button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        className="space-y-3 pl-2 border-l-2 border-gray-200 dark:border-gray-700"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* 基础高级配置 */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wide">{t("oneClick.basicConfig")}</h5>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <label className="w-full sm:w-24 text-sm text-gray-700 dark:text-gray-300">Interval</label>
                            <input
                              aria-label={t("oneClick.interval")}
                              type="number"
                              min={1}
                              placeholder={t("oneClick.interval")}
                              value={form.interval}
                              onChange={(e) => updateField("interval", Number(e.target.value))}
                              className="flex-1 bg-gray-100 border border-gray-300 text-base md:text-sm rounded px-2 py-1.5 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-all duration-200"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <label className="w-full sm:w-24 text-sm text-gray-700 dark:text-gray-300">
                              vnstat-mr <span className="text-xs text-gray-500">(v1.5.7+)</span>
                            </label>
                            <input
                              aria-label={t("oneClick.vnstatMr")}
                              type="number"
                              min={1}
                              max={28}
                              placeholder={t("oneClick.vnstatMr")}
                              value={form.vnstatMr || ""}
                              onChange={(e) => updateField("vnstatMr", Number(e.target.value) || 1)}
                              className="flex-1 bg-gray-100 border border-gray-300 text-base md:text-sm rounded px-2 py-1.5 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-all duration-200"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <label className="w-full sm:w-24 text-sm text-gray-700 dark:text-gray-300">
                              IP Source <span className="text-xs text-gray-500">(v1.7.1+)</span>
                            </label>
                            <select
                              aria-label={t("oneClick.ipSource")}
                              value={form.ipSource}
                              onChange={(e) => updateField("ipSource", e.target.value)}
                              className="flex-1 bg-gray-100 border border-gray-300 text-base md:text-sm rounded px-2 py-1.5 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-all duration-200"
                            >
                              <option value="ip-api.com">ip-api.com ({t("oneClick.ipSource")})</option>
                              <option value="ip.sb">ip.sb</option>
                              <option value="ipapi.co">ipapi.co</option>
                              <option value="myip.la">myip.la</option>
                            </select>
                          </div>
                        </div>

                        {/* 显示信息 */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wide">{t("dashboard.title")}</h5>
                          {[
                            { key: "type", label: "Type", placeholder: t("oneClick.type"), type: "text" },
                            { key: "loc", label: "Location", placeholder: t("oneClick.location"), type: "text" },
                          ].map(({ key, label, placeholder, type }) => (
                            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                              <label className="w-full sm:w-24 text-sm text-gray-700 dark:text-gray-300">{label}</label>
                              <input
                                aria-label={label}
                                placeholder={placeholder}
                                type={type}
                                className="flex-1 bg-gray-100 border border-gray-300 text-base md:text-sm rounded px-2 py-1.5 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-all duration-200"
                                value={form[key as keyof OneClickForm] as string}
                                onChange={(e) => updateField(key as keyof OneClickForm, e.target.value)}
                              />
                            </div>
                          ))}

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <label className="w-full sm:w-24 text-sm text-gray-700 dark:text-gray-300">Weight</label>
                            <input
                              aria-label={t("oneClick.weight")}
                              type="number"
                              min={0}
                              placeholder={t("oneClick.weight")}
                              value={form.weight || ""}
                              onChange={(e) => updateField("weight", Number(e.target.value) || 0)}
                              className="flex-1 bg-gray-100 border border-gray-300 text-base md:text-sm rounded px-2 py-1.5 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-all duration-200"
                            />
                          </div>
                        </div>

                        {/* 网络配置 (v1.6.1+) */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wide">
                            {t("server.network")} <span className="text-xs text-gray-500">(v1.6.1+)</span>
                          </h5>
                          {[
                            { key: "cm", label: t("oneClick.cm"), placeholder: t("oneClick.cmPlaceholder") },
                            { key: "ct", label: t("oneClick.ct"), placeholder: t("oneClick.ctPlaceholder") },
                            { key: "cu", label: t("oneClick.cu"), placeholder: t("oneClick.cuPlaceholder") },
                            { key: "iface", label: t("oneClick.iface"), placeholder: t("oneClick.ifacePlaceholder") },
                            { key: "excludeIface", label: t("oneClick.excludeIface"), placeholder: t("oneClick.excludeIfacePlaceholder") },
                          ].map(({ key, label, placeholder }) => (
                            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                              <label className="w-full sm:w-24 text-sm text-gray-700 dark:text-gray-300">{label}</label>
                              <input
                                aria-label={label}
                                placeholder={placeholder}
                                type="text"
                                className="flex-1 bg-gray-100 border border-gray-300 text-base md:text-sm rounded px-2 py-1.5 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-all duration-200"
                                value={form[key as keyof OneClickForm] as string}
                                onChange={(e) => updateField(key as keyof OneClickForm, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>

                        {/* 数据收集 (v1.5.1+) */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wide">
                            {t("oneClick.dataCollection")} <span className="text-xs text-gray-500">(v1.5.1+)</span>
                          </h5>
                          {[
                            { key: "ping", label: t("oneClick.ping") },
                            { key: "tupd", label: t("oneClick.tupd") },
                            { key: "extra", label: t("oneClick.extra") },
                            { key: "vnstat", label: t("oneClick.vnstat") },
                            { key: "notify", label: t("oneClick.notify") },
                          ].map(({ key, label }) => (
                            <div key={key} className="flex flex-row sm:items-center gap-1 sm:gap-3">
                              <label className="w-24 text-sm text-gray-700 dark:text-gray-300">{label}</label>
                              <div className="flex-1">
                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                  <input
                                    type="checkbox"
                                    aria-label={label}
                                    checked={form[key as keyof OneClickForm] as boolean}
                                    onChange={(e) => updateField(key as keyof OneClickForm, e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:outline-none"
                                  />
                                  {t("oneClick.enable")}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 特殊配置 */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wide">{t("oneClick.specialConfig")}</h5>
                          <div className="flex flex-row sm:items-center gap-1 sm:gap-3">
                            <label className="w-24 text-sm text-gray-700 dark:text-gray-300">{t("oneClick.acceleration")}</label>
                            <div className="flex-1">
                              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input
                                  type="checkbox"
                                  aria-label={t("oneClick.cn")}
                                  checked={form.cn}
                                  onChange={(e) => updateField("cn", e.target.checked)}
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:outline-none"
                                />
                                {t("oneClick.cn")}
                              </label>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* 执行配置 */}
                <motion.div className="space-y-2" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.29, duration: 0.15 }}>
                  <motion.h4
                    className="text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.31, duration: 0.15 }}
                  >
                    {t("oneClick.executionConfig")}
                  </motion.h4>

                  <motion.div
                    className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.33, duration: 0.15 }}
                  >
                    <label className="w-full sm:w-24 text-sm text-gray-700 dark:text-gray-300">{t("oneClick.downloadTool")}</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="radio"
                          name="downloadTool"
                          aria-label="Use curl"
                          checked={useCurl}
                          onChange={() => setUseCurl(true)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:outline-none"
                        />
                        <span className="font-mono">curl</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="radio"
                          name="downloadTool"
                          aria-label="Use wget"
                          checked={!useCurl}
                          onChange={() => setUseCurl(false)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:outline-none"
                        />
                        <span className="font-mono">wget</span>
                      </label>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35, duration: 0.15 }}
                  >
                    <label className="w-full sm:w-24 text-sm text-gray-700 dark:text-gray-300">{t("oneClick.executionPrivilege")}</label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        aria-label={t("oneClick.sudo")}
                        checked={useSudo}
                        onChange={(e) => setUseSudo(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:outline-none"
                      />
                      <span className="font-mono">sudo</span>
                    </label>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.37, duration: 0.15 }}>
                {isValid() ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05, duration: 0.15 }}>
                    <motion.pre
                      className="block w-full mb-2 bg-gray-900 dark:bg-black dark:border dark:border-gray-800 text-gray-200 font-mono text-sm whitespace-pre-wrap break-all select-all rounded-lg p-3"
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.08, duration: 0.12 }}
                    >
                      {generateCommand()}
                    </motion.pre>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-gray-400 dark:text-gray-500 text-xs">{t("oneClick.commandCheck")}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={copyToClipboard}
                          className="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 relative overflow-hidden"
                        >
                          <AnimatePresence mode="wait">
                            {showCopySuccess ? (
                              <motion.span
                                key="success"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="text-green-600 dark:text-green-400"
                              >
                                {t("oneClick.copied")}
                              </motion.span>
                            ) : (
                              <motion.span key="copy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                                {t("oneClick.copy")}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </button>
                        <button onClick={() => setIsOpen(false)} className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
                          {t("oneClick.close")}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.p className="text-amber-500 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05, duration: 0.15 }}>
                    {t("oneClick.invalidForm")}
                  </motion.p>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

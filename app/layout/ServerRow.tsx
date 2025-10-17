"use client";

import React from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/hooks";
import { ServerData } from "@/lib/api";
import { isOnline, isCountryFlagEmoji, calculatePercentage, parseLabels } from "@/lib/utils";
import { Badge } from "../components/Badge";
import { ProgressBar } from "../components/ProgressBar";
import { formatLoad, formatCPU, getFormattedNetworkSpeed, formatBytes } from "@/lib/formatters";
import { StatusIndicator } from "../components/StatusIndicator";
import { useSettings } from "../setting/settings";

interface ServerRowProps {
  server: ServerData;
  onClick?: () => void;
  className?: string;
}

export function ServerRow({ server, onClick, className = "" }: ServerRowProps) {
  const { t } = useI18n();
  const { settings } = useSettings();
  const online = isOnline(server);
  const { downloadSpeed, uploadSpeed } = getFormattedNetworkSpeed(server);

  const loadDisplay = formatLoad(server.load_1, server.load_5, server.load_15);

  // 格式化流量数据
  const totalDownload = formatBytes(server.network_in);
  const monthlyDownload = server.network_in ? formatBytes(server.network_in - server.last_network_in) : server.last_network_in ? formatBytes(server.last_network_in) : "0 B";
  const totalUpload = formatBytes(server.network_out);
  const monthlyUpload = server.network_out ? formatBytes(server.network_out - server.last_network_out) : server.last_network_out ? formatBytes(server.last_network_out) : "0 B";

  // 格式化运行时间
  const formatUptime = (uptime: string) => {
    return uptime.replace(/天/g, t("server.day"));
  };

  // 计算百分比
  const cpuPercentage = server.cpu;
  const memoryPercentage = calculatePercentage(server.memory_used, server.memory_total);
  const diskPercentage = calculatePercentage(server.hdd_used, server.hdd_total);

  // 获取操作系统信息
  const labels = parseLabels(server.labels);
  const os = labels.os ? labels.os.toLowerCase() : "";
  const osIcons: Record<string, string> = {
    // 只有这些有对应的 SVG 图标
    android: "android",
    arch: "arch",
    archlinux: "archlinux",
    centos: "centos",
    debian: "debian",
    linux: "linux",
    macos: "macos",
    raspberry: "raspberry",
    ubuntu: "ubuntu",
    windows: "windows",
  };
  const osIcon = osIcons[os] || "linux";

  return (
    <div
      onClick={onClick}
      className={`bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-white hover:dark:bg-black hover:border-gray-400 hover:dark:border-gray-600 rounded-lg hover:shadow-md dark:hover:shadow-gray-900/30 transition-all cursor-pointer ${
        settings.compactMode ? "p-2" : "p-3"
      } ${className}`}
    >
      {/* 小屏幕布局 */}
      <div className="block md:hidden">
        <div className={settings.compactMode ? "space-y-1.5" : "space-y-2"}>
          {/* 第一行：基本信息 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {/* 状态指示 */}
              <StatusIndicator status={online ? "online" : "offline"} className="mr-2" />

              {/* 地区和名称 */}
              <div className="flex items-center space-x-1 min-w-0 flex-1">
                {server.location &&
                  (isCountryFlagEmoji(server.location) ? (
                    <span className="text-sm flex-shrink-0">{server.location}</span>
                  ) : (
                    <div className="relative h-3 w-5 items-center overflow-hidden flex-shrink-0">
                      <Image src={`/image/flags/${server.location.toLowerCase()}.svg`} alt={`${server.location} flag`} width={16} height={12} className="object-cover" />
                    </div>
                  ))}
                <h3 className="font-medium text-sm truncate">{server.host ? server.name : server.alias || server.name}</h3>
                {server.type && <span className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-[8px] flex-shrink-0">{server.type.toUpperCase()}</span>}
              </div>
            </div>
            {/* 系统图标 */}
            {os && <Image src={`/image/os/${osIcon}.svg`} alt={os} width={16} height={16} className="w-4 h-4 rounded-full flex-shrink-0" />}
          </div>

          {/* 第二行：资源使用情况 */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium text-[10px] text-gray-600 dark:text-gray-400">CPU</div>
              <div className="font-semibold">{formatCPU(cpuPercentage)}</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-[10px] text-gray-600 dark:text-gray-400">{t("server.memory")}</div>
              <div className="font-semibold">{memoryPercentage.toFixed(0)}%</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-[10px] text-gray-600 dark:text-gray-400">{t("server.disk")}</div>
              <div className="font-semibold">{diskPercentage.toFixed(0)}%</div>
            </div>
          </div>

          {/* 第三行：网络信息 */}
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <span className="text-green-600 dark:text-green-400 font-medium">↓</span>
              <span className="font-medium">{downloadSpeed}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-blue-600 dark:text-blue-400 font-medium">↑</span>
              <span className="font-medium">{uploadSpeed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 大屏幕布局 */}
      <div className="hidden md:block">
        <div className={`grid grid-cols-24 items-center text-sm ${settings.compactMode ? "gap-2" : "gap-3"}`}>
          {/* IPv4/IPv6 状态 */}
          <div className="col-span-1 ml-3">
            {settings.compactMode ? (
              <div className="flex flex-col gap-1 items-center">
                <StatusIndicator status={online ? "online" : "offline"} />
              </div>
            ) : (
              <div className="flex flex-col gap-0.5 items-center">
                <Badge variant={server.online4 ? "success" : "danger"} className="text-[0.6em] px-1 py-1 leading-none w-fit min-w-0">
                  IPv4
                </Badge>
                <Badge variant={server.online6 ? "success" : "danger"} className="text-[0.6em] px-1 py-1 leading-none w-fit min-w-0">
                  IPv6
                </Badge>
              </div>
            )}
          </div>

          {/* 系统图标 */}
          {os && (
            <div className={`flex justify-center ${settings.compactMode ? "col-span-1" : "col-span-2"}`}>
              <Image src={`/image/os/${osIcon}.svg`} alt={os} width={20} height={20} className={settings.compactMode ? "w-6 h-6 rounded-sm" : "w-9 h-9 rounded-sm"} />
            </div>
          )}

          {/* 基本信息 */}
          <div className={os ? (settings.compactMode ? "col-span-10" : "col-span-7") : settings.compactMode ? "col-span-8" : "col-span-6"}>
            <div className="min-w-0">
              <div className="flex items-center space-x-1">
                {server.location &&
                  (isCountryFlagEmoji(server.location) ? (
                    <span className={settings.compactMode ? "text-base flex-shrink-0" : "text-lg flex-shrink-0"}>{server.location}</span>
                  ) : (
                    <div className={`relative items-center overflow-hidden flex-shrink-0 ${settings.compactMode ? "h-3 w-5" : "h-4 w-6"}`}>
                      <Image src={`/image/flags/${server.location.toLowerCase()}.svg`} alt={`${server.location} flag`} width={20} height={18} className="object-cover" />
                    </div>
                  ))}
                <h3 className={`font-medium truncate ${settings.compactMode ? "text-base" : "text-lg"}`}>{server.host ? server.name : server.alias || server.name}</h3>
                {server.type && <span className="ml-1 bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-[8px] flex-shrink-0">{server.type.toUpperCase()}</span>}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                <span>{online ? formatUptime(server.uptime) : <span className="text-red-500">{t("server.offline")}</span>}</span>
                {!settings.compactMode && (
                  <>
                    <span className="mx-1 text-gray-300 dark:text-gray-600">•</span>
                    <span>
                      {t("server.load")}: {loadDisplay}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* CPU */}
          <div className={settings.compactMode ? "col-span-3" : "col-span-3"}>
            <div className={`flex items-center justify-between ${settings.compactMode ? "mb-0.5" : "mb-1"}`}>
              <div className={`font-medium ${settings.compactMode ? "text-xs" : "text-sm"}`}>CPU</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{formatCPU(cpuPercentage)}</div>
            </div>
            <ProgressBar value={cpuPercentage} />
          </div>

          {/* 内存 */}
          <div className={settings.compactMode ? "col-span-3" : "col-span-3"}>
            <div className={`flex items-center justify-between ${settings.compactMode ? "mb-0.5" : "mb-1"}`}>
              <div className={`font-medium ${settings.compactMode ? "text-xs" : "text-sm"}`}>{t("server.memory")}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{memoryPercentage.toFixed(1)}%</div>
            </div>
            <ProgressBar value={memoryPercentage} />
          </div>

          {/* 存储 */}
          <div className={settings.compactMode ? "col-span-3" : "col-span-3"}>
            <div className={`flex items-center justify-between ${settings.compactMode ? "mb-0.5" : "mb-1"}`}>
              <div className={`font-medium ${settings.compactMode ? "text-xs" : "text-sm"}`}>{t("server.disk")}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{diskPercentage.toFixed(1)}%</div>
            </div>
            <ProgressBar value={diskPercentage} />
          </div>

          {/* 网络速度和流量 */}
          <div className={settings.compactMode ? "col-span-3" : "col-span-5"}>
            <div className="space-y-0.5">
              <div className={`grid ${settings.compactMode ? "grid-cols-[12px_auto]" : "grid-cols-[12px_auto_auto_1fr]"} gap-1 items-center text-xs min-w-0`}>
                <span className="text-green-600 dark:text-green-400 font-medium">↓</span>
                <span className="font-medium whitespace-nowrap">{downloadSpeed}</span>
                {!settings.compactMode && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-gray-600 dark:text-gray-300 text-[10px] min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {monthlyDownload}/{totalDownload}
                    </span>
                  </>
                )}
              </div>
              <div className={`grid ${settings.compactMode ? "grid-cols-[12px_auto]" : "grid-cols-[12px_auto_auto_1fr]"} gap-1 items-center text-xs min-w-0`}>
                <span className="text-blue-600 dark:text-blue-400 font-medium">↑</span>
                <span className="font-medium whitespace-nowrap">{uploadSpeed}</span>
                {!settings.compactMode && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-gray-600 dark:text-gray-300 text-[10px] min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {monthlyUpload}/{totalUpload}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

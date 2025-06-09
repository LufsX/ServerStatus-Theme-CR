"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { ServerData } from "@/lib/api";
import { isOnline, isCountryFlagEmoji, calculatePercentage, parseLabels } from "@/lib/utils";
import { Badge } from "../components/Badge";
import { ProgressBar } from "../components/ProgressBar";
import { CpuChart } from "../components/CpuChart";
import { formatCPU, formatMemory, formatDisk, formatLoad, getFormattedNetworkSpeed, formatBytes, formatAllLatencies } from "@/lib/formatters";
import { StatusIndicator } from "../components/StatusIndicator";
import { useSettings } from "../setting/settings";
import { getCpuHistoryManager } from "@/lib/cpuHistory";

interface ServerCardProps {
  server: ServerData;
  onClick?: () => void;
  className?: string;
}

export function ServerCard({ server, onClick, className = "" }: ServerCardProps) {
  const { settings } = useSettings();
  const online = isOnline(server);
  const { downloadSpeed, uploadSpeed } = getFormattedNetworkSpeed(server);

  // CPU历史数据管理
  const cpuHistoryManager = getCpuHistoryManager();
  const serverId = `${server.name}-${server.alias}`;

  // 记录 CPU 数据点
  useEffect(() => {
    if (online) {
      cpuHistoryManager.addDataPoint(serverId, server.cpu);
    }
  }, [server.cpu, online, serverId, cpuHistoryManager]);

  // 获取CPU历史数据
  const cpuHistory = settings.showCpuChart ? cpuHistoryManager.getHistory(serverId, settings.cpuChartDuration) : [];

  // 格式化网络流量数据
  const totalDownload = formatBytes(server.network_in);
  const monthlyDownload = server.network_in ? formatBytes(server.network_in - server.last_network_in) : server.last_network_in ? formatBytes(server.last_network_in) : "0 B";
  const totalUpload = formatBytes(server.network_out);
  const monthlyUpload = server.network_out ? formatBytes(server.network_out - server.last_network_out) : server.last_network_out ? formatBytes(server.last_network_out) : "0 B";

  // 计算百分比
  const cpuPercentage = server.cpu;
  const memoryPercentage = calculatePercentage(server.memory_used, server.memory_total);
  const swapPercentage = calculatePercentage(server.swap_used, server.swap_total);
  const diskPercentage = calculatePercentage(server.hdd_used, server.hdd_total);

  // 获取标签信息
  const labels = parseLabels(server.labels);
  const os = labels.os ? labels.os.toLowerCase() : "";
  const expiryDate = labels.ndd || "";
  const spec = labels.spec || "";

  // 只有这些有对应的 SVG 图标
  const osIcons: Record<string, string> = {
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

  // 无标签判断
  const hasOtherLabels = Object.entries(labels).some(([key, value]) => !["os", "ndd", "spec"].includes(key) && value);
  const hasAnyLabels = os || spec || expiryDate || hasOtherLabels;

  return (
    <div
      onClick={onClick}
      className={`flex flex-col h-auto bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-white hover:dark:bg-black hover:border-gray-400 hover:dark:border-gray-600 rounded-lg shadow-md p-4 transition-all ${
        onClick ? "cursor-pointer hover:shadow-lg" : ""
      } ${className}`}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <StatusIndicator status={online ? "online" : "offline"} className="mr-2" />
          <div>
            <h3 className="font-medium text-lg">
              {server.host ? server.name : server.alias || server.name}
              {server.type && <span className="ml-2 text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded-sm">{server.type.toUpperCase()}</span>}
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {server.location &&
            (isCountryFlagEmoji(server.location) ? (
              <span className="h-6 text-2xl">{server.location}</span>
            ) : (
              <div className="relative h-6 w-6 overflow-hidden">
                <Image src={`/image/flags/${server.location.toLowerCase()}.svg`} alt={`${server.location} flag`} width={24} height={16} className="object-cover" />
              </div>
            ))}
        </div>
      </div>

      {/* Status Section */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="space-y-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">运行时间</div>
          <div className="text-sm font-medium">
            {server.online4 || server.online6 ? server.uptime : <span className="text-red-500">离线</span>}
            {!server.online4 && !server.online6 && server.latest_ts && (
              <code className="text-[10px] text-red-500 ml-1">{new Date(server.latest_ts * 1000).toLocaleString(undefined, { hour12: false })}</code>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">负载</div>
          <div className="text-sm font-medium">{formatLoad(server.load_1, server.load_5, server.load_15)}</div>
        </div>

        <div className="space-y-1 col-span-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">网络延迟（联通/电信/移动）</div>
          <div className="text-sm font-medium">{formatAllLatencies(server)}</div>
        </div>

        <div className="col-span-2 flex flex-wrap gap-2 mt-1">
          <Badge variant={server.online4 ? "success" : "danger"}>IPv4</Badge>
          <Badge variant={server.online6 ? "success" : "danger"}>IPv6</Badge>
          <Badge variant="info">TCP: {server.tcp_count || 0}</Badge>
          <Badge variant="info">UDP: {server.udp_count || 0}</Badge>
          <Badge variant="primary">进程: {server.process_count || 0}</Badge>
          <Badge variant="secondary">线程: {server.thread_count || 0}</Badge>
        </div>
      </div>

      {/* Resource Section */}
      <div className="space-y-3 mb-4">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">CPU</span>
            <span className="text-xs font-medium">{formatCPU(server.cpu)}</span>
          </div>
          {settings.showCpuChart ? (
            <div className="mt-2">
              <CpuChart data={cpuHistory} className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
            </div>
          ) : (
            <ProgressBar value={cpuPercentage} />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">内存</span>
            <span className="text-xs font-medium">{formatMemory(server.memory_used, server.memory_total)}</span>
          </div>
          <ProgressBar value={memoryPercentage} />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">交换</span>
            <span className="text-xs font-medium">{formatMemory(server.swap_used, server.swap_total)}</span>
          </div>
          <ProgressBar value={swapPercentage} />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">硬盘</span>
            <span className="text-xs font-medium">{formatDisk(server.hdd_used, server.hdd_total)}</span>
          </div>
          <ProgressBar value={diskPercentage} />
        </div>
      </div>

      {/* Network Section */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="space-y-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">下载 ↓</div>
          <div className="text-sm font-medium">{downloadSpeed}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            月/总: {monthlyDownload} / {totalDownload}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">上传 ↑</div>
          <div className="text-sm font-medium">{uploadSpeed}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            月/总: {monthlyUpload} / {totalUpload}
          </div>
        </div>
      </div>

      {/* Info Section */}
      {hasAnyLabels && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {/* 操作系统标签 */}
            {os && (
              <Badge variant="default" className="flex items-center space-x-1">
                {osIcon && <Image src={`/image/os/${osIcon}.svg`} alt={os} width={12} height={12} className="w-3 h-3 rounded-full" />}
                <span>{os.charAt(0).toUpperCase() + os.slice(1)}</span>
              </Badge>
            )}

            {/* 规格信息 */}
            {spec && <Badge variant="secondary">{spec}</Badge>}

            {/* 到期日期 */}
            {expiryDate && <Badge variant={new Date(expiryDate) > new Date() ? "primary" : "danger"}>到期: {expiryDate}</Badge>}
          </div>

          {/* 其他自定义标签 */}
          {Object.entries(labels).map(([key, value]) => {
            // 跳过上面的标签
            if (["os", "ndd", "spec"].includes(key)) return null;

            return (
              <Badge key={key} variant="default" className="mr-2 mt-2">
                {key}: {value}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

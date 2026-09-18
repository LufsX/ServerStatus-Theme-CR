"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp } from "lucide-react";
import { OSIcon } from "../components/OSIcon";
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

interface ResourceMetricProps {
  label: string;
  value: number;
  displayValue: string;
  compact: boolean;
}

function ResourceMetric({ label, value, displayValue, compact }: ResourceMetricProps) {
  return (
    <div className="min-w-0">
      <div className={`flex flex-wrap items-center justify-between gap-x-1 ${compact ? "mb-0.5 text-xs" : "mb-1 text-sm"}`}>
        <span className="min-w-0 break-words font-medium">{label}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{displayValue}</span>
      </div>
      <ProgressBar value={value} size={compact ? "sm" : "md"} />
    </div>
  );
}

export function ServerRow({ server, onClick, className = "" }: ServerRowProps) {
  const { t } = useI18n();
  const { settings } = useSettings();
  const compact = settings.compactMode;
  const online = isOnline(server);
  const { downloadSpeed, uploadSpeed } = getFormattedNetworkSpeed(server);
  const loadDisplay = formatLoad(server.load_1, server.load_5, server.load_15);

  const totalDownload = formatBytes(server.network_in);
  const monthlyDownload = server.network_in ? formatBytes(server.network_in - server.last_network_in) : server.last_network_in ? formatBytes(server.last_network_in) : "0 B";
  const totalUpload = formatBytes(server.network_out);
  const monthlyUpload = server.network_out ? formatBytes(server.network_out - server.last_network_out) : server.last_network_out ? formatBytes(server.last_network_out) : "0 B";

  const cpuPercentage = server.cpu;
  const memoryPercentage = calculatePercentage(server.memory_used, server.memory_total);
  const diskPercentage = calculatePercentage(server.hdd_used, server.hdd_total);
  const labels = parseLabels(server.labels);
  const os = labels.os ? labels.os.toLowerCase() : "";
  const name = server.host ? server.name : server.alias || server.name;

  return (
    <div
      onClick={onClick}
      className={`@container/server-row min-w-0 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-white hover:dark:bg-black hover:border-gray-400 hover:dark:border-gray-600 rounded-lg hover:shadow-md dark:hover:shadow-gray-900/30 transition-all cursor-pointer ${
        compact ? "p-2" : "p-3"
      } ${className}`}
    >
      {/* 窄屏使用精简布局，避免同时展示过多诊断信息。 */}
      <div className="grid min-w-0 grid-cols-1 gap-2 @min-[36rem]/server-row:hidden">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <StatusIndicator status={online ? "online" : "offline"} />
            {server.location &&
              (isCountryFlagEmoji(server.location) ? (
                <span className="shrink-0 text-sm">{server.location}</span>
              ) : (
                <Image src={`/image/flags/${server.location.toLowerCase()}.svg`} alt={`${server.location} flag`} width={18} height={18} className="shrink-0 object-contain" />
              ))}
            <h3 title={name} className="min-w-0 truncate text-sm font-medium">{name}</h3>
            {server.type && <span title={server.type} className="max-w-16 shrink-0 truncate rounded bg-gray-100 px-1 py-0.5 text-[8px] dark:bg-gray-700">{server.type.toUpperCase()}</span>}
          </div>
          {os && <OSIcon os={os} size={16} className="shrink-0" />}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            { label: "CPU", value: formatCPU(cpuPercentage) },
            { label: t("server.memory"), value: `${memoryPercentage.toFixed(0)}%` },
            { label: t("server.disk"), value: `${diskPercentage.toFixed(0)}%` },
          ].map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <div className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{label}</div>
              <div className="font-semibold tabular-nums">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-5 text-xs">
          <span className="flex items-center gap-1 font-medium">
            <ArrowDown size={12} className="text-green-600 dark:text-green-400" aria-hidden="true" />
            {downloadSpeed}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <ArrowUp size={12} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
            {uploadSpeed}
          </span>
        </div>
      </div>

      {/* 宽度足够时展示完整诊断信息。 */}
      <div className={`hidden min-w-0 items-center @min-[36rem]/server-row:grid @min-[36rem]/server-row:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] @min-[72rem]/server-row:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,3fr)] ${compact ? "gap-2" : "gap-3"}`}>
        <div className="min-w-0 @min-[36rem]/server-row:col-span-2 @min-[72rem]/server-row:col-span-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex shrink-0"><StatusIndicator status={online ? "online" : "offline"} /></span>
            {os && <OSIcon os={os} size={compact ? 20 : 24} className="shrink-0" />}
            {server.location &&
              (isCountryFlagEmoji(server.location) ? (
                <span className="shrink-0 text-base">{server.location}</span>
              ) : (
                <Image src={`/image/flags/${server.location.toLowerCase()}.svg`} alt={`${server.location} flag`} width={20} height={20} className="shrink-0 object-contain" />
              ))}
            <h3 title={name} className={`min-w-0 flex-1 truncate font-medium ${compact ? "text-sm" : "text-base"}`}>{name}</h3>
            {server.type && <span title={server.type} className="max-w-20 truncate rounded bg-gray-100 px-1 py-0.5 text-[8px] dark:bg-gray-700">{server.type.toUpperCase()}</span>}
          </div>
          <div className={`flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400 ${compact ? "mt-1" : "mt-1.5"}`}>
            <div className="flex shrink-0 gap-1">
              <Badge variant={server.online4 ? "success" : "danger"} className="min-w-0 px-1 py-0.5 text-[10px] leading-none">IPv4</Badge>
              <Badge variant={server.online6 ? "success" : "danger"} className="min-w-0 px-1 py-0.5 text-[10px] leading-none">IPv6</Badge>
            </div>
            <span className="min-w-0 break-words">{online ? server.uptime.replace(/天/g, t("server.day")) : <span className="text-red-500">{t("server.offline")}</span>}</span>
            <span className="min-w-0 break-words">{t("server.load")}: {loadDisplay}</span>
          </div>
        </div>

        <div className={`grid min-w-0 grid-cols-3 ${compact ? "gap-2" : "gap-3"}`}>
          <ResourceMetric label="CPU" value={cpuPercentage} displayValue={formatCPU(cpuPercentage)} compact={compact} />
          <ResourceMetric label={t("server.memory")} value={memoryPercentage} displayValue={`${memoryPercentage.toFixed(1)}%`} compact={compact} />
          <ResourceMetric label={t("server.disk")} value={diskPercentage} displayValue={`${diskPercentage.toFixed(1)}%`} compact={compact} />
        </div>

        <div className="min-w-0 space-y-0.5 text-xs">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5">
            <span className="flex min-w-0 items-center gap-1">
              <ArrowDown size={12} className="shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
              <span className="min-w-0 break-words font-medium">{downloadSpeed}</span>
            </span>
            {!compact && <span className="min-w-0 break-words text-[10px] text-gray-600 dark:text-gray-300">{monthlyDownload}/{totalDownload}</span>}
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5">
            <span className="flex min-w-0 items-center gap-1">
              <ArrowUp size={12} className="shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span className="min-w-0 break-words font-medium">{uploadSpeed}</span>
            </span>
            {!compact && <span className="min-w-0 break-words text-[10px] text-gray-600 dark:text-gray-300">{monthlyUpload}/{totalUpload}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

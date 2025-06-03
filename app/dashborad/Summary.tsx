"use client";

import React from "react";

import { ServerData } from "@/lib/api";
import { Badge } from "../components/Badge";
import { isOnline, formatTime } from "@/lib/utils";

interface SummaryProps {
  servers: ServerData[];
  lastUpdated: number;
  selectedStatus: "all" | "online" | "offline" | null;
  onStatusChange: (status: "all" | "online" | "offline" | null) => void;
}

export function Summary({ servers, lastUpdated, selectedStatus, onStatusChange }: SummaryProps) {
  // 计算在线和离线的服务器数量
  const onlineCount = servers.filter((server) => isOnline(server)).length;
  const offlineCount = servers.length - onlineCount;

  // 格式化最后更新时间
  const formattedLastUpdated = React.useMemo(() => {
    if (!lastUpdated) return "未知";
    return formatTime(lastUpdated);
  }, [lastUpdated]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-white hover:dark:bg-black hover:border-gray-400 hover:dark:border-gray-600 rounded-lg shadow-md p-4 mb-6 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">服务器状态摘要</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <code className="text-sm">{formattedLastUpdated}</code>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div
          className={`p-3 rounded-md border cursor-pointer transition-all ${
            selectedStatus === "all" || selectedStatus === null
              ? "bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600"
              : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-800 hover:bg-gray-200 hover:dark:bg-gray-800"
          }`}
          onClick={() => onStatusChange(selectedStatus === "all" ? null : "all")}
        >
          <div className={`text-sm mb-1 ${selectedStatus === "all" || selectedStatus === null ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-500 dark:text-gray-400"}`}>总服务器数</div>
          <div className={`text-2xl font-semibold ${selectedStatus === "all" || selectedStatus === null ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-gray-100"}`}>
            {servers.length}
          </div>
        </div>

        <div
          className={`p-3 rounded-md border cursor-pointer transition-all ${
            selectedStatus === "online"
              ? "bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-600"
              : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-800 hover:bg-gray-200 hover:dark:bg-gray-800"
          }`}
          onClick={() => onStatusChange(selectedStatus === "online" ? null : "online")}
        >
          <div className={`text-sm mb-1 ${selectedStatus === "online" ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-500 dark:text-gray-400"}`}>在线</div>
          <div className={`text-2xl font-semibold ${selectedStatus === "online" ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}>{onlineCount}</div>
        </div>

        <div
          className={`p-3 rounded-md border cursor-pointer transition-all ${
            selectedStatus === "offline"
              ? "bg-red-100 dark:bg-red-800 border-red-300 dark:border-red-600"
              : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-800 hover:bg-gray-200 hover:dark:bg-gray-800"
          }`}
          onClick={() => onStatusChange(selectedStatus === "offline" ? null : "offline")}
        >
          <div className={`text-sm mb-1 ${selectedStatus === "offline" ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-500 dark:text-gray-400"}`}>离线</div>
          <div className={`text-2xl font-semibold ${selectedStatus === "offline" ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}`}>{offlineCount}</div>
        </div>
      </div>

      {offlineCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium mb-2">离线服务器</div>
          <div className="flex flex-wrap gap-2">
            {servers
              .filter((server) => !isOnline(server))
              .map((server) => (
                <Badge key={server.name} variant="danger">
                  {server.alias || server.name}
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

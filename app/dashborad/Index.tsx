"use client";

import React from "react";

import { ServerData } from "@/lib/api";
import { isOnline } from "@/lib/utils";
import { Summary } from "./Summary";
import { Filters } from "./Filters";
import { ServerGrid } from "./ServerGrid";

interface DashboardProps {
  servers: ServerData[];
  lastUpdated: number;
}

export function Dashboard({ servers, lastUpdated }: DashboardProps) {
  const [selectedLocation, setSelectedLocation] = React.useState<string | null>(null);
  const [selectedType, setSelectedType] = React.useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<"all" | "online" | "offline" | null>(null);

  // 根据筛选服务器
  const filteredServers = React.useMemo(() => {
    return servers.filter((server) => {
      // 按位置筛选
      if (selectedLocation && server.location !== selectedLocation) {
        return false;
      }

      // 按类型筛选
      if (selectedType && (!server.type || server.type.toLowerCase() !== selectedType)) {
        return false;
      }

      // 按状态筛选
      if (selectedStatus) {
        const online = isOnline(server);
        if (selectedStatus === "online" && !online) {
          return false;
        }
        if (selectedStatus === "offline" && online) {
          return false;
        }
        // selectedStatus === 'all' 显示所有服务器
      }

      return true;
    });
  }, [servers, selectedLocation, selectedType, selectedStatus]);

  // 服务器排序: 首先按权重排序, 然后在线的排在前面
  const sortedServers = React.useMemo(() => {
    return [...filteredServers].sort((a, b) => {
      // 优先按权重排序，权重大的排在前面
      if (a.weight !== b.weight) {
        return b.weight - a.weight;
      }

      // 然后在线的排在前面
      const aOnline = isOnline(a);
      const bOnline = isOnline(b);

      if (aOnline !== bOnline) {
        return aOnline ? -1 : 1;
      }

      // 最后按名称排序
      return (a.alias || a.name).localeCompare(b.alias || b.name);
    });
  }, [filteredServers]);

  return (
    <div>
      <Summary servers={servers} lastUpdated={lastUpdated} selectedStatus={selectedStatus} onStatusChange={setSelectedStatus} />

      <Filters
        servers={servers}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <ServerGrid servers={sortedServers} />
    </div>
  );
}

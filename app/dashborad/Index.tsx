"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ServerData } from "@/lib/api";
import { isOnline } from "@/lib/utils";
import { useSettings } from "@/app/setting/settings";
import { Summary } from "./Summary";
import { Filters } from "./Filters";
import { ServerGrid } from "./ServerGrid";

interface DashboardProps {
  servers: ServerData[];
  lastUpdated: number;
}

export function Dashboard({ servers, lastUpdated }: DashboardProps) {
  const { settings } = useSettings();
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

  // 动画配置
  const layoutTransition = {
    type: "spring" as const,
    stiffness: 500,
    damping: 50,
    mass: 1,
  };

  return (
    <>
      <AnimatePresence>
        {settings.showSummary && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 0.8,
              opacity: { duration: 0.2 },
            }}
            style={{ overflow: "hidden" }}
          >
            <Summary servers={servers} lastUpdated={lastUpdated} selectedStatus={selectedStatus} onStatusChange={setSelectedStatus} />
          </motion.div>
        )}

        {settings.showFilters && (
          <motion.div
            key="filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 0.8,
              opacity: { duration: 0.2 },
            }}
            style={{ overflow: "hidden" }}
          >
            <Filters
              servers={servers}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout transition={layoutTransition} style={{ minHeight: "200px" }}>
        <ServerGrid servers={sortedServers} />
      </motion.div>
    </>
  );
}

"use client";

import { memo } from "react";
import { useI18n } from "@/lib/i18n/hooks";
import type { ServerData } from "@/lib/api";
import { getServerId } from "@/lib/cpuHistory";
import { ServerCard } from "../layout/ServerCard";
import { ServerRow } from "../layout/ServerRow";
import { useSettings } from "../setting/settings";

interface ServerGridProps {
  servers: ServerData[];
  fetchTime: number;
}

// 不修改 ServerRow 本身；排序/筛选保留对象引用时可跳过未变行。
const MemoServerRow = memo(ServerRow);

export const ServerGrid = memo(function ServerGrid({ servers, fetchTime }: ServerGridProps) {
  const { settings } = useSettings();
  const { t } = useI18n();

  if (servers.length === 0) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t("dashboard.noFilterServers")}</div>;
  }

  // 实时排序不做逐项 layout 测量和交错入场，避免大量服务器时交互延迟。
  const rowMode = settings.displayMode === "row";
  const className = rowMode
    ? settings.compactMode ? "space-y-2" : "space-y-4"
    : `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${settings.compactMode ? "xl:grid-cols-4 gap-4" : "gap-6"} items-start`;

  return (
    <div className={className}>
      {servers.map((server) => (
        rowMode
          ? <MemoServerRow key={getServerId(server)} server={server} />
          : <ServerCard key={getServerId(server)} server={server} fetchTime={fetchTime} />
      ))}
    </div>
  );
});

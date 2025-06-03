"use client";

import React from "react";

import { Badge } from "../components/Badge";
import { ServerData } from "../../lib/api";

interface FiltersProps {
  servers: ServerData[];
  selectedLocation: string | null;
  onLocationChange: (location: string | null) => void;
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  selectedStatus: "all" | "online" | "offline" | null;
  onStatusChange: (status: "all" | "online" | "offline" | null) => void;
}

export function Filters({ servers, selectedLocation, onLocationChange, selectedType, onTypeChange, selectedStatus, onStatusChange }: FiltersProps) {
  // 获取所有可用的位置
  const locations = React.useMemo(() => {
    const locationMap = new Map<string, string>();
    servers.forEach((server) => {
      if (server.location) {
        locationMap.set(server.location, server.location);
      }
    });
    return Array.from(locationMap.values());
  }, [servers]);

  // 获取所有服务器类型
  const types = React.useMemo(() => {
    const typeSet = new Set<string>();
    servers.forEach((server) => {
      if (server.type) {
        typeSet.add(server.type.toLowerCase());
      }
    });
    return Array.from(typeSet);
  }, [servers]);

  return (
    <div className="mb-6">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">状态</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant={selectedStatus === null || selectedStatus === "all" ? "primary" : "default"} onClick={() => onStatusChange(null)} className="cursor-pointer">
            全部
          </Badge>
          <Badge variant={selectedStatus === "online" ? "primary" : "default"} onClick={() => onStatusChange("online")} className="cursor-pointer">
            在线
          </Badge>
          <Badge variant={selectedStatus === "offline" ? "primary" : "default"} onClick={() => onStatusChange("offline")} className="cursor-pointer">
            离线
          </Badge>
        </div>
      </div>

      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">位置</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant={selectedLocation === null ? "primary" : "default"} onClick={() => onLocationChange(null)} className="cursor-pointer">
            全部
          </Badge>

          {locations.map((location) => (
            <Badge key={location} variant={selectedLocation === location ? "primary" : "default"} onClick={() => onLocationChange(location)} className="cursor-pointer">
              {location}
            </Badge>
          ))}
        </div>
      </div>

      {types.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">类型</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant={selectedType === null ? "primary" : "default"} onClick={() => onTypeChange(null)} className="cursor-pointer">
              全部
            </Badge>

            {types.map((type) => (
              <Badge key={type} variant={selectedType === type ? "primary" : "default"} onClick={() => onTypeChange(type)} className="cursor-pointer">
                {type.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useSettings } from "../app/setting/settings";

// API 基础路径
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// 服务器状态接口返回的数据类型定义
export interface ServerData {
  name: string;
  alias: string;
  host?: string; // 可选字段，兼容 cppla/ServerStatus
  type: string;
  location: string;
  notify: boolean;
  vnstat: boolean;
  online4: boolean;
  online6: boolean;
  uptime: string;
  load_1: number;
  load_5: number;
  load_15: number;
  ping_10010: number;
  ping_189: number;
  ping_10086: number;
  time_10010: number;
  time_189: number;
  time_10086: number;
  tcp_count: number;
  udp_count: number;
  process_count: number;
  thread_count: number;
  network_rx: number;
  network_tx: number;
  network_in: number;
  network_out: number;
  last_network_in: number;
  last_network_out: number;
  cpu: number;
  memory_total: number;
  memory_used: number;
  swap_total: number;
  swap_used: number;
  hdd_total: number;
  hdd_used: number;
  labels: string;
  custom: string;
  gid: string;
  weight: number;
  latest_ts: number;
  si: boolean;
}

export interface ApiResponse {
  updated: number;
  servers: ServerData[];
  fetchTime: number;
}

/**
 * 获取服务器状态数据
 * @returns Promise<ApiResponse> 服务器状态数据
 */
export async function fetchServerStatus(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/json/stats.json`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`获取服务器状态失败: ${response.status}`);
    }

    const data = await response.json();

    // 处理 alias 和 host 字段的兼容性
    // 兼容 cppla/ServerStatus 的数据格式
    if (data.servers) {
      data.servers = data.servers.map((server: ServerData & { host?: string }) => {
        // 如果不存在 alias 但存在 host，则将 host 赋值给 alias
        if (!server.alias && server.host) {
          server.alias = server.host;
        }
        return server;
      });
    }

    // fetchTime 优先使用获取到的数据的 updated 字段，如果不存在则使用当前时间戳
    const fetchTime = data.updated ? data.updated * 1000 : Date.now();

    return {
      ...data,
      fetchTime,
    };
  } catch (error) {
    console.error("获取服务器状态出错:", error);
    throw error;
  }
}

/**
 * 定期刷新服务器状态数据
 */
export function useServerStatus(customRefreshInterval?: number) {
  "use client";
  const { settings } = useSettings();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 使用自定义刷新间隔或设置中的刷新间隔
  const refreshInterval = customRefreshInterval || settings.refreshInterval;

  useEffect(() => {
    async function loadServerStatus() {
      try {
        // 如果不是初次加载，则不显示 loading 状态
        if (isInitialLoading) {
          setLoading(true);
        }
        const result = await fetchServerStatus();
        setData(result);
        setError(null);
        setIsInitialLoading(false);
      } catch (err: unknown) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        if (isInitialLoading) {
          setIsInitialLoading(false);
        }
      } finally {
        if (isInitialLoading) {
          setLoading(false);
        }
      }
    }

    // 初始加载
    loadServerStatus();

    // 设置定时刷新
    const intervalId = setInterval(loadServerStatus, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, isInitialLoading]);

  return { data, loading, error, isInitialLoading };
}

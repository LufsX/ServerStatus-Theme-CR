import { useState, useEffect, useRef } from "react";
import { getCpuHistoryManager, getServerId } from "./cpuHistory";
import { isOnline } from "./utils";
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
export async function fetchServerStatus(signal?: AbortSignal): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/json/stats.json`, {
      cache: "no-store",
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP STATUS CODE: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.servers)) throw new Error("Invalid server status response");

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
    const updatedMs = data.updated * 1000;
    const fetchTime = Number.isFinite(updatedMs) && updatedMs > 0 ? updatedMs : Date.now();

    return {
      ...data,
      fetchTime,
    };
  } catch (error) {
    if (!signal?.aborted) console.error(error);
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
  const latestFetchTime = useRef(-Infinity);

  // 使用自定义刷新间隔或设置中的刷新间隔
  const requestedInterval = customRefreshInterval ?? settings.refreshInterval;
  const refreshInterval = Number.isFinite(requestedInterval) && requestedInterval > 0 ? requestedInterval : 1000;

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function loadServerStatus() {
      try {
        const result = await fetchServerStatus(controller.signal);
        // 即使底层请求未响应 abort，旧 effect 的结果也不能提交。
        if (disposed) return;
        if (result.fetchTime < latestFetchTime.current) return;
        latestFetchTime.current = result.fetchTime;
        // 在发布数据前写入全部在线服务器，不受卡片筛选或挂载状态影响。
        const history = getCpuHistoryManager();
        // 同一批响应共用采样时间；服务端 updated 仍单独用于拒绝过期响应。
        const sampledAt = Date.now();
        for (const server of result.servers) {
          if (isOnline(server)) history.addDataPoint(getServerId(server), server.cpu, sampledAt);
        }
        setData(result);
        setError(null);
      } catch (err: unknown) {
        if (disposed || controller.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!disposed) {
          setLoading(false);
          setIsInitialLoading(false);
          // 请求完成后才安排下一次，慢请求不会造成轮询重叠。
          timeoutId = setTimeout(loadServerStatus, refreshInterval);
        }
      }
    }

    void loadServerStatus();

    return () => {
      disposed = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [refreshInterval]);

  return { data, loading, error, isInitialLoading };
}

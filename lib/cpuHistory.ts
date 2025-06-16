"use client";

import { CpuChartDuration } from "@/app/setting/settings";

export interface CpuDataPoint {
  timestamp: number;
  cpu: number;
}

export interface ServerCpuHistory {
  [serverId: string]: CpuDataPoint[];
}

/**
 * CPU 历史
 */
class CpuHistoryManager {
  private history: ServerCpuHistory = {};
  private maxDataPoints: { [duration: number]: number } = {
    1: 60,
    3: 180,
    5: 300,
  };

  /**
   * 添加CPU数据点
   * @param serverId 服务器 ID
   * @param cpu CPU 使用率
   * @param timestamp 可选时间戳，默认使用当前时间
   */
  addDataPoint(serverId: string, cpu: number, timestamp?: number): void {
    const dataTimestamp = timestamp || Date.now();

    if (!this.history[serverId]) {
      this.history[serverId] = [];
    }

    this.history[serverId].push({ timestamp: dataTimestamp, cpu });

    // 清理过期数据
    this.cleanupOldData(serverId);
  }

  /**
   * 获取服务器的CPU历史数据
   */
  getHistory(serverId: string, duration: CpuChartDuration): CpuDataPoint[] {
    if (!this.history[serverId]) {
      return [];
    }

    const now = Date.now();
    const durationMs = duration * 60 * 1000;
    const cutoffTime = now - durationMs;

    // 按时间范围过滤数据，并限制最大点数
    const timeFilteredData = this.history[serverId].filter((point) => point.timestamp >= cutoffTime);
    const maxPoints = this.maxDataPoints[duration] || 600;

    // 如果数据点超过限制，保留最新的点
    return timeFilteredData.length > maxPoints ? timeFilteredData.slice(-maxPoints) : timeFilteredData;
  }

  /**
   * 清理过期数据
   */
  private cleanupOldData(serverId: string): void {
    if (!this.history[serverId]) return;

    // 获取最大保留时间和最大点数
    const maxAge = 5 * 60 * 1000;
    const maxPoints = Math.max(...Object.values(this.maxDataPoints));
    const now = Date.now();

    // 清理超时数据
    this.history[serverId] = this.history[serverId].filter((point) => now - point.timestamp <= maxAge);

    // 清理
    if (this.history[serverId].length > maxPoints) {
      this.history[serverId] = this.history[serverId].slice(-maxPoints);
    }
  }

  /**
   * 清理所有历史数据
   */
  clearHistory(): void {
    this.history = {};
  }

  /**
   * 清理特定服务器的历史数据
   */
  clearServerHistory(serverId: string): void {
    delete this.history[serverId];
  }
}

// 创建单例实例
let cpuHistoryManagerInstance: CpuHistoryManager | null = null;

/**
 * 获取 CPU 历史数据管理器实例
 */
export function getCpuHistoryManager(): CpuHistoryManager {
  if (!cpuHistoryManagerInstance) {
    cpuHistoryManagerInstance = new CpuHistoryManager();
  }
  return cpuHistoryManagerInstance;
}

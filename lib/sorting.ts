import { ServerData } from "./api";
import { isOnline } from "./utils";

export type SortOption = "default" | "name" | "location" | "cpu" | "memory" | "uptime" | "load";
export type SortOrder = "asc" | "desc";

/**
 * 解析运行时间字符串并转换为数值（秒数）
 */
export function parseUptime(uptime: string): number {
  if (!uptime || uptime.trim() === "") {
    return -1; // 不存在的情况返回 -1，用于排序时放到最后
  }

  // 匹配 "X 天" 格式
  const dayMatch = uptime.match(/(\d+) ?天/);
  if (dayMatch) {
    return parseInt(dayMatch[1]) * 24 * 3600; // 转换为秒数
  }

  // 匹配 "HH:MM:SS" 格式
  const timeMatch = uptime.match(/(\d{2}):(\d{2}):(\d{2})/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const seconds = parseInt(timeMatch[3]);
    return hours * 3600 + minutes * 60 + seconds; // 转换为总秒数
  }

  return -1; // 无法解析的情况也返回 -1
}

/**
 * 计算内存使用百分比
 */
export function getMemoryPercent(server: ServerData): number {
  if (!server.memory_total || server.memory_total <= 0) {
    return -1; // 数据不存在时返回 -1，排序时放到最后
  }
  return (server.memory_used / server.memory_total) * 100;
}

/**
 * 计算磁盘使用百分比
 */
export function getDiskPercent(server: ServerData): number {
  if (!server.hdd_total || server.hdd_total <= 0) {
    return -1; // 数据不存在时返回 -1，排序时放到最后
  }
  return (server.hdd_used / server.hdd_total) * 100;
}

/**
 * 获取 CPU 使用率，处理不存在的情况
 */
export function getCpuPercent(server: ServerData): number {
  if (server.cpu === undefined || server.cpu === null || isNaN(server.cpu)) {
    return -1; // 数据不存在时返回 -1，排序时放到最后
  }
  return server.cpu;
}

/**
 * 获取负载值，处理不存在的情况
 */
export function getLoadValue(server: ServerData): number {
  if (server.load_1 === undefined || server.load_1 === null || isNaN(server.load_1)) {
    return -1; // 数据不存在时返回 -1，排序时放到最后
  }
  return server.load_1;
}

/**
 * 默认排序函数：按权重 -> 在线状态 -> 名称
 */
export function defaultSort(a: ServerData, b: ServerData): number {
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
}

/**
 * 自定义排序函数
 */
export function customSort(a: ServerData, b: ServerData, sortBy: SortOption, sortOrder: SortOrder): number {
  let comparison = 0;

  switch (sortBy) {
    case "name":
      const nameA = a.alias || a.name || "";
      const nameB = b.alias || b.name || "";
      comparison = nameA.localeCompare(nameB);
      break;
    case "location":
      const locationA = a.location || "";
      const locationB = b.location || "";
      comparison = locationA.localeCompare(locationB);
      break;
    case "cpu":
      const cpuA = getCpuPercent(a);
      const cpuB = getCpuPercent(b);
      // 处理不存在的情况：-1 的值始终排到最后
      if (cpuA === -1 && cpuB === -1) comparison = 0;
      else if (cpuA === -1) comparison = 1; // A 没有数据，排到后面
      else if (cpuB === -1) comparison = -1; // B 没有数据，排到后面
      else comparison = cpuA - cpuB;
      break;
    case "memory":
      const memoryA = getMemoryPercent(a);
      const memoryB = getMemoryPercent(b);
      // 处理不存在的情况：-1 的值始终排到最后
      if (memoryA === -1 && memoryB === -1) comparison = 0;
      else if (memoryA === -1) comparison = 1; // A 没有数据，排到后面
      else if (memoryB === -1) comparison = -1; // B 没有数据，排到后面
      else comparison = memoryA - memoryB;
      break;
    case "uptime":
      const uptimeA = parseUptime(a.uptime || "");
      const uptimeB = parseUptime(b.uptime || "");
      // 处理不存在的情况：-1 的值始终排到最后
      if (uptimeA === -1 && uptimeB === -1) comparison = 0;
      else if (uptimeA === -1) comparison = 1; // A 没有数据，排到后面
      else if (uptimeB === -1) comparison = -1; // B 没有数据，排到后面
      else comparison = uptimeA - uptimeB;
      break;
    case "load":
      const loadA = getLoadValue(a);
      const loadB = getLoadValue(b);
      // 处理不存在的情况：-1 的值始终排到最后
      if (loadA === -1 && loadB === -1) comparison = 0;
      else if (loadA === -1) comparison = 1; // A 没有数据，排到后面
      else if (loadB === -1) comparison = -1; // B 没有数据，排到后面
      else comparison = loadA - loadB;
      break;
    default:
      return 0;
  }

  // 如果涉及缺失数据的比较，直接返回结果
  if (
    (sortBy === "cpu" && (getCpuPercent(a) === -1 || getCpuPercent(b) === -1)) ||
    (sortBy === "memory" && (getMemoryPercent(a) === -1 || getMemoryPercent(b) === -1)) ||
    (sortBy === "uptime" && (parseUptime(a.uptime || "") === -1 || parseUptime(b.uptime || "") === -1)) ||
    (sortBy === "load" && (getLoadValue(a) === -1 || getLoadValue(b) === -1))
  ) {
    return comparison; // 缺失数据的排序不受升序/降序影响
  }

  // 只有都有有效数据时，才应用排序方向
  return sortOrder === "asc" ? comparison : -comparison;
}

/**
 * 排序服务器数组
 */
export function sortServers(servers: ServerData[], sortBy: SortOption, sortOrder: SortOrder): ServerData[] {
  const sorted = [...servers];

  if (sortBy === "default") {
    return sorted.sort(defaultSort);
  }

  return sorted.sort((a, b) => customSort(a, b, sortBy, sortOrder));
}

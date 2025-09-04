import { calculatePercentage } from "./utils";
import { ServerData } from "./api";
import { getSettingsManager } from "@/app/setting/settings";

/**
 * 将字节大小转换为可读格式（支持二进制和十进制单位）
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 可读的大小字符串
 */
export function formatBytes(bytes: number, decimals = 2): string {
  const safeBytes = bytes ?? 0;

  // 如果在服务端运行，默认使用二进制单位
  if (typeof window === "undefined") {
    return formatBytesWithType(safeBytes, decimals, "binary");
  }

  // 获取当前设置的单位类型
  try {
    const settings = getSettingsManager().getSettings();
    return formatBytesWithType(safeBytes, decimals, settings.unitType);
  } catch (error) {
    // 发生错误时使用二进制单位作为默认值
    console.error(error);
    return formatBytesWithType(safeBytes, decimals, "binary");
  }
}

/**
 * 基于指定单位类型格式化字节大小
 */
function formatBytesWithType(bytes: number, decimals = 2, unitType: "binary" | "decimal" = "binary"): string {
  const safeBytes = bytes ?? 0;
  if (safeBytes === 0) return "0 B";

  const k = unitType === "binary" ? 1024 : 1000;
  const dm = decimals < 0 ? 0 : decimals;

  // 根据单位类型选择适当的单位名称
  const sizes = unitType === "binary" ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"] : ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(safeBytes) / Math.log(k));

  return `${Number.parseFloat((safeBytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * 格式化 CPU 使用率
 * @param cpu CPU 使用率数值
 * @returns 格式化后的字符串
 */
export function formatCPU(cpu: number): string {
  const safeCpu = cpu ?? 0;
  return `${safeCpu.toFixed(0)}%`;
}

/**
 * 格式化内存使用情况
 * @param used 已使用内存（KB）
 * @param total 总内存（KB）
 * @returns 格式化后的字符串
 */
export function formatMemory(used: number, total: number): string {
  const safeUsed = used ?? 0;
  const safeTotal = total ?? 0;

  const usedGB = formatBytes(safeUsed * 1024);
  const totalGB = formatBytes(safeTotal * 1024);
  const percentage = calculatePercentage(safeUsed, safeTotal).toFixed(1);

  return `${usedGB} / ${totalGB} (${percentage}%)`;
}

/**
 * 格式化磁盘使用情况
 * @param used 已使用空间（MB）
 * @param total 总空间（MB）
 * @returns 格式化后的字符串
 */
export function formatDisk(used: number, total: number): string {
  const safeUsed = used ?? 0;
  const safeTotal = total ?? 0;

  const usedGB = formatBytes(safeUsed * 1024 * 1024);
  const totalGB = formatBytes(safeTotal * 1024 * 1024);
  const percentage = calculatePercentage(safeUsed, safeTotal).toFixed(1);

  return `${usedGB} / ${totalGB} (${percentage}%)`;
}

/**
 * 格式化网络速度
 * @param speed 速度（B/s）
 * @returns 格式化后的字符串
 */
export function formatNetworkSpeed(speed: number): string {
  return `${formatBytes(speed)}/s`;
}

/**
 * 计算网络速度
 * @param current 当前总流量
 * @param last 上次总流量
 * @param interval 时间间隔（秒）
 * @returns 每秒流量（B/s）
 */
export function calculateNetworkSpeed(current: number, last: number, interval: number = 10): number {
  if (current < last) return 0; // 处理计数器重置的情况
  return (current - last) / interval;
}

/**
 * 获取并格式化网络速度
 */
export function getFormattedNetworkSpeed(server: ServerData): {
  downloadSpeed: string;
  uploadSpeed: string;
} {
  return {
    downloadSpeed: `${formatBytes(server.network_rx || 0, 1)}/s`,
    uploadSpeed: `${formatBytes(server.network_tx || 0, 1)}/s`,
  };
}

/**
 * 格式化服务器负载
 */
export function formatLoad(load_1: number, load_5: number, load_15: number): string {
  // 处理 undefined 或 null 值，使用默认值 0
  const safeLoad1 = load_1 ?? 0;
  const safeLoad5 = load_5 ?? 0;
  const safeLoad15 = load_15 ?? 0;

  return `${safeLoad1.toFixed(2)} / ${safeLoad5.toFixed(2)} / ${safeLoad15.toFixed(2)}`;
}

/**
 * 格式化网络延迟
 */
export function formatLatency(ping: number, t: (key: string) => string): string {
  // 处理 undefined 或 null 值
  const safePing = ping ?? 0;

  // 如果ping值为0，表示不可用或超时
  if (safePing === 0) return t("server.timeout");
  // 如果ping值为100，表示不可用
  if (safePing === 100) return t("server.unavailable");

  return `${safePing.toFixed(0)}ms`;
}

/**
 * 格式化全部延迟（国际化版本）
 * @param server 服务器数据
 * @param t 翻译函数
 * @returns 格式化后的字符串
 */
export function formatAllLatencies(server: ServerData, t: (key: string) => string): string {
  const latencies = [formatLatency(server.ping_10010, t), formatLatency(server.ping_189, t), formatLatency(server.ping_10086, t)];

  return latencies.join(" / ");
}

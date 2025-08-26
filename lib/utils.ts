/**
 * 解析服务器标签字符串
 * @param labelsString 标签字符串，格式如 "os=debian;ndd=2024/11/19;spec=2C/1G/40G;"
 * @returns 解析后的标签对象
 */
export function parseLabels(labelsString: string | undefined): Record<string, string> {
  if (labelsString === undefined) return {};

  const result: Record<string, string> = {};
  const list = labelsString.split(";");

  list.forEach((item) => {
    if (item === "") return;
    const [key, value] = item.split("=");
    if (key) {
      result[key] = value;
    }
  });

  return result;
}

/**
 * 检查服务器是否在线
 * @param server 服务器数据
 * @returns 是否在线
 */
export function isOnline(server: { online4: boolean; online6: boolean }): boolean {
  return server.online4 || server.online6;
}

/**
 * 计算百分比并限制在0-100范围内
 * @param used 已使用量
 * @param total 总量
 * @returns 百分比
 */
export function calculatePercentage(used: number, total: number): number {
  const safeUsed = used ?? 0;
  const safeTotal = total ?? 0;

  if (safeTotal <= 0) return 0;
  const percentage = (safeUsed / safeTotal) * 100;
  return Math.min(100, Math.max(0, percentage));
}

/**
 * 格式化时间戳为可读日期时间
 * @param seconds 时间戳（秒）
 * @returns 格式化后的日期时间字符串
 */
export function formatTime(seconds: number): string {
  const date = new Date(seconds * 1000);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
}

/**
 * 判断文本是否为国家旗帜emoji
 * @param text 待检测文本
 * @returns 是否为国家旗帜emoji
 */
export function isCountryFlagEmoji(text: string): boolean {
  const regex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  return regex.test(text);
}

/**
 * 检查服务器是否包含负载数据
 * @param server 服务器数据
 * @returns 是否没有负载数据
 */
export function hasLoadData(server: { load?: number; load_1?: number; load_5?: number; load_15?: number }): boolean {
  return server.load === undefined && server.load_1 === undefined && server.load_5 === undefined && server.load_15 === undefined;
}

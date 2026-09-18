"use client";

import { memo, useMemo } from "react";
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Filler, ChartData, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import { CpuDataPoint } from "@/lib/cpuHistory";
import { useI18n } from "@/lib/i18n/hooks";

// 注册 Chart.js 组件
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Filler);

// 常量定义
const COLORS = {
  high: "#ef4444", // red-500
  medium: "#f59e0b", // amber-500
  low: "#10b981", // emerald-500
} as const;

interface CpuChartProps {
  data: CpuDataPoint[];
  height?: number;
  className?: string;
}

// 工具函数
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("zh-CN", { hour12: false });
};

const getLineColor = (cpu: number): string => {
  if (cpu >= 80) return COLORS.high;
  if (cpu >= 60) return COLORS.medium;
  return COLORS.low;
};

export const CpuChart = memo(function CpuChart({ data, className = "" }: CpuChartProps) {
  const { t } = useI18n();

  // 计算数据指标
  const { currentCpu, maxCpu } = useMemo(() => {
    if (!data || data.length === 0) return { currentCpu: 0, maxCpu: 0 };

    const cpuValues = data.map((d) => d.cpu);
    const currentCpu = cpuValues[cpuValues.length - 1] || 0;
    const maxCpu = Math.max(...cpuValues);

    return { currentCpu, maxCpu };
  }, [data]);

  const lineColor = useMemo(() => getLineColor(currentCpu), [currentCpu]);

  // 准备图表数据
  const chartData = useMemo<ChartData<"line", { x: number; y: number }[]>>(() => {
    if (!data || data.length < 2) {
      return { labels: [], datasets: [] };
    }

    return {
      datasets: [
        {
          label: t("server.cpuUsage"),
          data: data.map((point) => ({ x: point.timestamp, y: point.cpu })),
          parsing: false,
          normalized: true,
          borderColor: lineColor,
          backgroundColor: lineColor + "20",
          borderWidth: 2,
          fill: true,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: lineColor,
          pointHoverBorderColor: "#ffffff",
          pointHoverBorderWidth: 2,
        },
      ],
    };
  }, [data, lineColor, t]);

  // 图表配置选项
  const chartOptions = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 450,
        easing: "easeOutCubic",
      },
      transitions: {
        active: {
          animation: { duration: 180 },
        },
        resize: {
          animation: { duration: 180 },
        },
      },
      parsing: false,
      normalized: true,
      resizeDelay: 100,
      interaction: { mode: "nearest", axis: "x", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          callbacks: {
            title: (items) => items.length ? formatTime(items[0].parsed.x ?? 0) : "",
            label: (item) => `CPU: ${(item.parsed.y ?? 0).toFixed(1)}%`,
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          min: data[0]?.timestamp,
          max: data[data.length - 1]?.timestamp,
          ticks: { display: false },
          grid: { display: false },
        },
        // 由 Chart.js 根据真实数据计算刻度，保留顶部留白而非硬编码上限。
        y: { beginAtZero: true, grace: "10%", ticks: { maxTicksLimit: 4, callback: (value) => `${value}%`, font: { size: 10 } }, border: { display: false } },
      },
    }),
    [data]
  );

  if (!data || data.length < 2) {
    return (
      <div className={`flex items-center justify-center w-full h-26 ${className}`}>
        <span className="text-xs text-gray-400">{t("common.noData")}</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-26 ${className}`}>
      <div className="w-full h-full">
        <Line data={chartData} options={chartOptions} updateMode="default" />
      </div>

      {/* 最大 CPU 值 */}
      <div className="absolute top-1 right-1 text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 hover:dark:text-gray-100 bg-white dark:bg-gray-800 px-1 py-0.5 rounded shadow-sm opacity-75 hover:opacity-100 border border-gray-200 dark:border-gray-700 duration-200">
        {t("dashboard.max")}: {maxCpu.toFixed(1)}%
      </div>
    </div>
  );
});

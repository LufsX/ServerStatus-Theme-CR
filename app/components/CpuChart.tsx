"use client";

import React, { useMemo, useEffect, useRef } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler, TooltipItem } from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { CpuDataPoint } from "@/lib/cpuHistory";
import { useI18n } from "@/lib/i18n/hooks";

// 注册 Chart.js 组件
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler);

// 常量定义
const COLORS = {
  high: "#ef4444", // red-500
  medium: "#f59e0b", // amber-500
  low: "#10b981", // emerald-500
} as const;

const Y_AXIS_THRESHOLDS = [5, 10, 20, 40, 60, 80, 100] as const;

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

const calculateYAxisMax = (maxCpu: number): number => {
  return Y_AXIS_THRESHOLDS.find((threshold) => maxCpu < threshold) || 100;
};

export function CpuChart({ data, className = "" }: CpuChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null);
  const { t } = useI18n();

  // 计算数据指标
  const { currentCpu, maxCpu, yMax } = useMemo(() => {
    if (!data || data.length === 0) return { currentCpu: 0, maxCpu: 0, yMax: 100 };

    const cpuValues = data.map((d) => d.cpu);
    const currentCpu = cpuValues[cpuValues.length - 1] || 0;
    const maxCpu = Math.max(...cpuValues);
    const yMax = calculateYAxisMax(maxCpu);

    return { currentCpu, maxCpu, yMax };
  }, [data]);

  const lineColor = useMemo(() => getLineColor(currentCpu), [currentCpu]);

  // 准备图表数据
  const chartData = useMemo(() => {
    if (!data || data.length < 2) {
      return { labels: [], datasets: [] };
    }

    return {
      labels: data.map((point) => new Date(point.timestamp)),
      datasets: [
        {
          label: t("server.cpuUsage"),
          data: data.map((point) => point.cpu),
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
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: "index" as const,
          intersect: false,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: lineColor,
          borderWidth: 1,
          displayColors: false,
          callbacks: {
            title: (context: TooltipItem<"line">[]) => {
              const x = context[0]?.parsed?.x;
              return x !== null && x !== undefined ? formatTime(x) : "";
            },
            label: (context: TooltipItem<"line">) => {
              const y = context.parsed?.y;
              return y !== null && y !== undefined ? `CPU: ${y.toFixed(1)}%` : "";
            },
          },
        },
      },
      scales: {
        x: {
          type: "time" as const,
          time: {
            displayFormats: {
              minute: "HH:mm",
              second: "HH:mm:ss",
            },
          },
          grid: { display: false },
          ticks: { display: false },
          border: { display: true },
        },
        y: {
          min: 0,
          max: yMax,
          grid: {
            color: "rgba(156, 163, 175, 0.3)",
            lineWidth: 1,
          },
          ticks: {
            display: true,
            color: "rgba(107, 114, 128, 0.8)",
            font: { size: 10 },
            callback: (value: number | string) => `${value}%`,
            maxTicksLimit: 4,
          },
          border: { display: false },
        },
      },
      interaction: {
        mode: "nearest" as const,
        axis: "x" as const,
        intersect: false,
      },
      animation: { duration: 300 },
      elements: {
        point: { hoverRadius: 6 },
      },
    }),
    [lineColor, yMax]
  );

  // 当数据更新时，更新图表
  useEffect(() => {
    if (chartRef.current && data.length >= 2) {
      chartRef.current.update("none");
    }
  }, [data]);

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
        <Line ref={chartRef} data={chartData} options={chartOptions} />
      </div>

      {/* 最大 CPU 值 */}
      <div className="absolute top-1 right-1 text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 hover:dark:text-gray-100 bg-white dark:bg-gray-800 px-1 py-0.5 rounded shadow-sm opacity-75 hover:opacity-100 border border-gray-200 dark:border-gray-700 duration-200">
        {t("dashboard.max")}: {maxCpu.toFixed(1)}%
      </div>
    </div>
  );
}

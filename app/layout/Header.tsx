"use client";

import React from "react";

import SettingsMenu from "../setting/SettingsMenu";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "服务器状态", subtitle = "实时监控各服务器状态" }: HeaderProps) {
  return (
    <header className="py-6">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          {subtitle && <div className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">{subtitle}</div>}
        </div>
        <SettingsMenu />
      </div>
    </header>
  );
}

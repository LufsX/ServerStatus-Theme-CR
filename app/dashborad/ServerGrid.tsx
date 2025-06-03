"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ServerData } from "../../lib/api";
import { ServerCard } from "../layout/ServerCard";
import { ServerRow } from "../layout/ServerRow";
import { useSettings } from "../setting/settings";

interface ServerGridProps {
  servers: ServerData[];
}

export function ServerGrid({ servers }: ServerGridProps) {
  const { settings } = useSettings();

  if (servers.length === 0) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">没有找到符合条件的服务器</div>;
  }

  // 根据显示模式选择不同的布局
  if (settings.displayMode === "row") {
    return (
      <motion.div className="space-y-4" layout>
        <AnimatePresence mode="popLayout">
          {servers.map((server, index) => (
            <motion.div
              key={`row-${server.name}-${server.alias}`}
              layout
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: -20,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                delay: index * 0.03,
                layout: {
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                },
              }}
            >
              <ServerRow server={server} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  // 默认卡片模式
  return (
    <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" layout>
      <AnimatePresence mode="popLayout">
        {servers.map((server, index) => (
          <motion.div
            key={`card-${server.name}-${server.alias}`}
            layout
            initial={{
              opacity: 0,
              scale: 0.8,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              y: -20,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: index * 0.05,
              layout: {
                type: "spring",
                stiffness: 300,
                damping: 30,
              },
            }}
            className="h-full"
          >
            <ServerCard server={server} className="h-full" />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

"use client";

import { Header } from "./layout/Header";
import Footer from "./layout/Footer";
import { useServerStatus } from "@/lib/api";
import { Dashboard } from "./dashborad/Index";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { data, error, isInitialLoading } = useServerStatus();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* 错误提示横幅 */}
      <AnimatePresence mode="wait">
        {error && data && (
          <div className="container mx-auto px-4 pt-6 pb-0">
            <motion.div
              key="error-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 hover:bg-red-50 hover:dark:bg-red-950 hover:border-red-300 hover:dark:border-red-700 rounded-lg shadow-md p-4 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 dark:text-red-300 text-sm font-medium">数据刷新失败</span>
                  <span className="text-red-600 dark:text-red-400 text-xs">{error.message}</span>
                </div>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-all">
                  手动刷新
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {error && !data ? (
            <motion.div
              key="error-initial"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 hover:bg-red-50 hover:dark:bg-red-950 hover:border-red-300 hover:dark:border-red-700 rounded-lg shadow-md p-4 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 dark:text-red-300 text-sm font-medium">获取数据出错</span>
                  <span className="text-red-600 dark:text-red-400 text-xs">{error.message}</span>
                </div>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-all">
                  重试
                </button>
              </div>
            </motion.div>
          ) : isInitialLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              className="flex flex-col justify-center items-center py-20"
            >
              <div className="flex justify-center items-center mb-4">
                <div className="flex space-x-4">
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      className="w-4 h-4 bg-gradient-to-r from-blue-200 to-blue-400 dark:from-blue-600 dark:to-blue-800 rounded-full"
                      animate={{
                        y: ["0%", "-20%", "0%"],
                        scale: [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 1,
                        delay: index * 0.15,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">数据加载中...</span>
            </motion.div>
          ) : data ? (
            <Dashboard servers={data.servers} lastUpdated={data.updated} fetchTime={data.fetchTime} />
          ) : null}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

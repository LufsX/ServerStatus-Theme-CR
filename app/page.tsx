"use client";

import { Header } from "./layout/Header";
import Footer from "./layout/Footer";
import { useServerStatus } from "@/lib/api";
import { Dashboard } from "./dashborad/Index";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const { data, loading, error } = useServerStatus();

  // 加载状态
  const [isLoading, setIsLoading] = useState(true);

  // 初次加载
  useEffect(() => {
    if (!loading && data) {
      setIsLoading(false);
    }
  }, [loading, data]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        {error ? (
          <div className="text-center py-10">
            <div className="text-red-500 font-medium">获取数据出错</div>
            <div className="text-gray-500 mt-2">{error.message}</div>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              重试
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="flex justify-center items-center mb-4">
              <div className="flex space-x-4">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"
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
            <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">数据加载中，请稍候...</span>
          </div>
        ) : data ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Dashboard servers={data.servers} lastUpdated={data.updated} />
          </motion.div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

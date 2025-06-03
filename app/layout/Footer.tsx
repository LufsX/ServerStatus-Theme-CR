import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import nextjs from "@/public/next.svg";
import nextjsDark from "@/public/next.dark.svg";

export default function Footer() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <footer className="w-full bg-gray-100 dark:bg-gray-900 shadow-sm p-4 text-left text-gray-500 dark:text-gray-400">
      <div className="container px-4 mx-auto pl-1">
        <div className="flex flex-col sm:flex-row gap-1">
          <span className="flex items-center">
            <Link href="https://github.com/LufsX/ServerStatus-Theme">© 2025 - {new Date().getFullYear()} ServerStatus-Theme</Link>
          </span>
          <span className="hidden sm:block"> · </span>
          <span className="flex items-center">
            Designed by
            <Link className="ml-1 text-black dark:text-white" href="https://isteed.cc" target="_blank" rel="noopener noreferrer">
              LufsX
            </Link>
          </span>
          <span className="hidden sm:block"> · </span>
          <span className="flex items-center">
            Powered by{" "}
            <Link href="https://nextjs.org">
              <Image className="h-4 ml-1" src={isDark ? nextjsDark : nextjs} alt="Nextjs Logo" width={72} height={16} loading="lazy" />
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

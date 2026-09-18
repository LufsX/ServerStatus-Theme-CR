"use client";

import { Header } from "./layout/Header";
import Footer from "./layout/Footer";
import { useServerStatus } from "@/lib/api";
import { Dashboard } from "./dashborad/Index";
import { useI18n } from "@/lib/i18n/hooks";

function reloadPage() {
  window.location.reload();
}

function ErrorNotice({ error, retry = false }: { error: Error; retry?: boolean }) {
  const { t } = useI18n();

  return (
    <div role="alert" className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-panel shadow-md p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <span className="w-2 h-2 shrink-0 bg-red-500 rounded-full" aria-hidden="true" />
          <span className="text-red-700 dark:text-red-300 text-sm font-medium">{t("common.error")}</span>
          <span className="text-red-600 dark:text-red-400 text-xs break-all">{error.message}</span>
        </div>
        <button type="button" onClick={reloadPage} className="px-4 py-2 bg-red-600 text-white text-xs font-medium rounded-control hover:bg-red-700 transition-colors motion-reduce:transition-none">
          {t(retry ? "dashboard.retry" : "dashboard.refresh")}
        </button>
      </div>
    </div>
  );
}

// 将轮询状态限制在内容区，避免每次响应都重新渲染 Header / Footer。
function StatusContent() {
  const { t } = useI18n();
  const { data, error, isInitialLoading } = useServerStatus();

  return (
    <>
      {error && data && (
        <div className="container mx-auto px-4 pt-6 pb-0">
          <ErrorNotice error={error} />
        </div>
      )}
      <main className="flex-1 container mx-auto px-4 py-6">
        {error && !data ? (
          <ErrorNotice error={error} retry />
        ) : isInitialLoading ? (
          <div role="status" className="flex flex-col justify-center items-center py-20">
            <div aria-hidden="true" className="w-8 h-8 mb-4 rounded-full border-4 border-accent-200 border-t-accent-500 motion-safe:animate-spin" />
            <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">{t("common.loading")}</span>
          </div>
        ) : data ? (
          <Dashboard servers={data.servers} lastUpdated={data.updated} fetchTime={data.fetchTime} />
        ) : null}
      </main>
    </>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <StatusContent />
      <Footer />
    </div>
  );
}

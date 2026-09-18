"use client";

import { useI18n } from "@/lib/i18n/hooks";
import { useHydrated } from "@/app/setting/settings";
import SettingsMenu from "../setting/SettingsMenu";
import OneClickModal from "../setting/OneClickModal";

export function Header() {
  const { t } = useI18n();
  const mounted = useHydrated();

  return (
    <header className="pt-6">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div>
          {mounted && (
            <>
              <h1 className="text-2xl md:text-3xl font-bold">{t("common.appTitle")}</h1>
              <div className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">{t("common.subtitle")}</div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <OneClickModal />
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
}

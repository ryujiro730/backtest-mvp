"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

/**
 * 現在のロケールを <html lang> に反映する。
 * root layout では params が取れないため、next-intl の useLocale で設定。
 */
export function LocaleLangSync() {
  const locale = useLocale();
  useEffect(() => {
    if (locale === "ja" || locale === "en") {
      document.documentElement.lang = locale;
    }
  }, [locale]);
  return null;
}

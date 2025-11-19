// components/NativeStatusBar.tsx
"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export function NativeStatusBar() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const applyStatusBar = () => {
      const isDark = document.documentElement.classList.contains("dark");

      // 1) Tailwind 테마에서 --background 값 읽어오기
      const rootStyle = getComputedStyle(document.documentElement);
      const bgColor = rootStyle.getPropertyValue("--background").trim() || "#000000";

      // 2) 상태바 배경색을 테마 배경색과 동일하게
      StatusBar.setBackgroundColor({ color: bgColor }).catch(console.error);

      // 3) 상태바 아이콘 색 (다크모드면 밝게, 라이트면 어둡게)
      StatusBar.setStyle({
        style: isDark ? Style.Light : Style.Dark,
      }).catch(console.error);
    };

    // 첫 진입 시 한 번 적용
    applyStatusBar();

    // html.class 변경(다크모드 토글) 감지해서 다시 적용
    const observer = new MutationObserver(applyStatusBar);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // 4) safe-area 패딩도 같이 적용 (상/하단 노치 영역)
    const body = document.body;
    body.style.paddingTop = "env(safe-area-inset-top)";
    body.style.paddingBottom = "env(safe-area-inset-bottom)";

    return () => {
      observer.disconnect();
      // cleanup (원하면 주석 처리 가능)
      body.style.paddingTop = "";
      body.style.paddingBottom = "";
    };
  }, []);

  return null;
}

import React from "react";
import GoBackButton from "./GoBackButton";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

interface PageHeaderProps {
  /** Optional target for go back button */
  goBackTarget?: string;
  /** Optional translation key for page title */
  titleKey?: string;
  /** Layout mode: "top" shows header horizontally, "centered" shows controls absolutely positioned */
  mode?: "centered" | "top";
  /** Optional authentication state */
  isAuthenticated?: boolean;
  /** Optional Login button component */
  LoginButton?: React.ComponentType<{ absolute?: boolean }>;
}

/**
 * PageHeader component for page headers with navigation, title, and controls.
 * Used with AppLayout to provide consistent header functionality.
 *
 * Features:
 * - Optional go back button
 * - Optional translated title
 * - Theme and language switchers
 * - Optional login button
 * - Two layout modes: "top" (horizontal) and "centered" (absolute positioned)
 */
export default function PageHeader({
  goBackTarget,
  titleKey,
  mode = "centered",
  isAuthenticated = false,
  LoginButton,
}: PageHeaderProps) {
  // Always call hook (React rules), but only use it if titleKey is provided
  const { t: translationT } = useFallbackTranslation();
  // Fallback function that returns the key if translations aren't needed/available
  const t = titleKey ? translationT : (key: string) => key;

  if (mode === "top") {
    return (
      <div className="w-full flex items-start justify-between p-6 gap-4 z-10">
        <div className="flex-none min-w-[60px] flex justify-start mt-1">
          {goBackTarget && (
            <GoBackButton target={goBackTarget} absolute={false} />
          )}
        </div>
        {titleKey && (
          <div className="flex-1 flex justify-center">
            <h1 className="text-4xl font-bold text-text-primary text-center break-words w-full max-w-3xl drop-shadow-sm">
              {t(titleKey)}
            </h1>
          </div>
        )}
        <div className="flex-none min-w-[200px] flex justify-end items-center gap-2 mt-1">
          {isAuthenticated && LoginButton ? (
            <LoginButton absolute={false} />
          ) : (
            <>
              <ThemeSwitcher absolute={false} />
              <LanguageSwitcher absolute={false} />
              {LoginButton && <LoginButton absolute={false} />}
            </>
          )}
        </div>
      </div>
    );
  }

  // "centered" mode
  return (
    <>
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {isAuthenticated && LoginButton ? (
          <LoginButton absolute={false} />
        ) : (
          <>
            <ThemeSwitcher absolute={false} />
            <LanguageSwitcher absolute={false} />
            {LoginButton && <LoginButton absolute={false} />}
          </>
        )}
      </div>
      {goBackTarget && <GoBackButton target={goBackTarget} />}
      {titleKey && (
        <div className="w-full flex items-center justify-center p-4 text-4xl font-bold text-text-primary z-10">
          <h1 className="drop-shadow-sm">{t(titleKey)}</h1>
        </div>
      )}
    </>
  );
}

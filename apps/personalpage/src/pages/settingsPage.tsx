import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Button } from "@websites/ui";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";
import { createComponentLogger } from "@websites/infrastructure/logging";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import nextI18NextConfig from "@websites/infrastructure/i18n/next-i18next.config";
import type { GetServerSideProps } from "next";
import type { ExtendedPageProps } from "@websites/infrastructure/app";

const logger = createComponentLogger("SettingsPage");

const pageNamespaces = ["common", "settings"];

interface UserData {
  id: string;
  nickname?: string;
  preferences?: {
    language?: string;
    theme?: string;
  };
}

export const getServerSideProps: GetServerSideProps<ExtendedPageProps> = async (context) => {
  const defaultLocale = nextI18NextConfig.i18n?.defaultLocale || "en";
  const resolvedLocale = context.locale || defaultLocale;

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, pageNamespaces, nextI18NextConfig)),
      translationNamespaces: pageNamespaces,
      layoutTitleKey: "settings",
      layoutMode: "top",
      layoutGoBackTarget: "/",
    },
  };
};

/**
 * Settings page - only accessible when logged in
 */
export default function SettingsPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const { t } = useFallbackTranslation(["common", "settings"]);

  const [user, setUser] = useState<UserData | null>(null);
  const [nickname, setNickname] = useState("");
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const isLoading = status === "loading";
  const isAuthenticated = !!session;

  // Fetch user data when session is available
  useEffect(() => {
    if (session?.userId && !user) {
      const fetchUserData = async () => {
        try {
          const response = await fetch("/api/auth/user/status");
          const data = await response.json();

          if (data.authenticated && data.user) {
            setUser(data.user);
            setNickname(data.user.nickname || "");
            setLanguage(data.user.preferences?.language || router.locale || "en");
            if (typeof window !== "undefined") {
              const currentTheme =
                document.body.getAttribute("data-theme") || data.user.preferences?.theme || "light";
              setTheme(currentTheme);
            } else {
              setTheme(data.user.preferences?.theme || "light");
            }
          }
        } catch (error) {
          logger.error(
            "Failed to fetch user data",
            error instanceof Error ? error : new Error(String(error))
          );
        }
      };

      fetchUserData();
    }
  }, [session, user, router.locale]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      logger.info("Unauthenticated user attempted to access settings, redirecting to home");
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const hasChanges = () => {
    if (!user) return false;

    const currentNickname = user.nickname || "";
    const currentLanguage = user.preferences?.language || router.locale || "en";
    const currentTheme =
      user.preferences?.theme ||
      (typeof window !== "undefined" ? document.body.getAttribute("data-theme") : null) ||
      "light";

    return nickname !== currentNickname || language !== currentLanguage || theme !== currentTheme;
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/auth/user/update-userdata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname, language, theme }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveMessage(t("settings_saved", "Settings saved successfully!"));

        // Apply changes immediately
        if (language !== router.locale) {
          router.push(router.asPath, router.asPath, { locale: language });
        }
        if (typeof window !== "undefined" && theme !== document.body.getAttribute("data-theme")) {
          document.body.setAttribute("data-theme", theme);
        }

        // Refresh session and user data
        await updateSession();
        // Refetch user data to get updated preferences
        const statusResponse = await fetch("/api/auth/user/status");
        const statusData = await statusResponse.json();
        if (statusData.authenticated && statusData.user) {
          setUser(statusData.user);
        }
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage(data.message || t("save_failed", "Failed to save settings"));
      }
    } catch (error) {
      logger.error(
        "Error saving settings",
        error instanceof Error ? error : new Error(String(error))
      );
      setSaveMessage(t("save_error", "An error occurred while saving"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-surface-card rounded-lg p-6 shadow-medium">
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          {t("user_profile", "User Profile")}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t("user_id", "User ID")}
            </label>
            <p className="text-text-primary font-mono text-sm bg-surface-button p-2 rounded">
              {user?.id}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t("nickname", "Nickname")}
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t("enter_nickname", "Enter your nickname")}
              maxLength={50}
              className="w-full bg-surface-button border border-border-default rounded-md px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface-card rounded-lg p-6 shadow-medium">
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          {t("preferences", "Preferences")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">
              {t("language", "Language")}
            </label>
            <div className="flex space-x-2">
              {["lt", "en", "ru"].map((lang) => (
                <Button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  variant={language === lang ? "primary" : "subliminal"}
                  size="sm"
                  className={
                    language === lang ? "" : "bg-surface-button hover:bg-surface-button-hover"
                  }
                >
                  {lang.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">
              {t("theme", "Theme")}
            </label>
            <div className="flex space-x-2">
              {[
                { id: "light", label: t("light", "Light") },
                { id: "dark", label: t("dark", "Dark") },
              ].map((themeOption) => (
                <Button
                  key={themeOption.id}
                  onClick={() => setTheme(themeOption.id)}
                  variant={theme === themeOption.id ? "primary" : "subliminal"}
                  size="sm"
                  className={
                    theme === themeOption.id
                      ? ""
                      : "bg-surface-button hover:bg-surface-button-hover"
                  }
                >
                  {themeOption.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4">
          {saveMessage && (
            <p
              className={`text-sm ${saveMessage.includes("success") || saveMessage.includes("saved") ? "text-success-500" : "text-danger-500"}`}
            >
              {saveMessage}
            </p>
          )}
          <Button
            onClick={handleSaveAll}
            disabled={isSaving || !hasChanges()}
            variant="primary"
            size="md"
          >
            {isSaving ? t("saving", "Saving...") : t("save_all", "Save All Settings")}
          </Button>
        </div>
      </div>
    </div>
  );
}

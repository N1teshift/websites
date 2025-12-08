import { useRouter } from "next/router";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button, IconButton } from "@websites/ui";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";
import { Settings } from "lucide-react";

/**
 * Login button component that appears next to the language switcher
 * Shows "Login" when not authenticated, or logout + settings gear when authenticated
 * Uses NextAuth for authentication
 */
const LoginButton = ({ absolute = false }: { absolute?: boolean }) => {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session;
  const isLoading = status === "loading";
  const login = () => signIn("google");
  const logout = () => signOut();
  const router = useRouter();
  const { t } = useFallbackTranslation(["common"]);

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <div className={absolute ? "absolute top-4 right-4 z-50" : ""}>
        <div className="flex items-center gap-2">
          <IconButton
            icon={<Settings />}
            onClick={() => router.push("/settingsPage")}
            size="medium"
            variant="outline"
            color="gray"
            title={t("settings", "Settings")}
          />
          <Button
            onClick={logout}
            variant="subliminal"
            size="sm"
            className="bg-surface-button hover:bg-surface-button-hover"
          >
            {t("logout", "Logout")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={absolute ? "absolute top-4 right-4 z-50" : ""}>
      <Button
        onClick={login}
        variant="subliminal"
        size="sm"
        className="bg-surface-button hover:bg-surface-button-hover"
      >
        {t("login", "Login")}
      </Button>
    </div>
  );
};

export default LoginButton;

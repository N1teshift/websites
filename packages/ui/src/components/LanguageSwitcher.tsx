import { useRouter } from "next/router";
import { Button } from "./Button";

/**
 * A component that allows users to switch the application's language.
 * Displays buttons for available languages (LT, EN, RU).
 * Can be optionally positioned absolutely in the top-right corner.
 *
 * @param props The component props.
 * @param props.absolute Optional. If true, positions the switcher absolutely. Defaults to true.
 * @returns A React element representing the language switcher.
 */
const LanguageSwitcher = ({ absolute = true }: { absolute?: boolean }) => {
    const languages = ["lt", "en", "ru"];

    const router = useRouter();
    const { pathname, asPath, query } = router;

    const changeLanguage = (locale: string) => {
        router.push({ pathname, query }, asPath, { locale });
    };

    // Use absolute positioning only if absolute is true
    const switcherClass = absolute
        ? "absolute top-4 right-4 z-50"
        : "flex items-center";

    return (
        <div className={switcherClass}>
            <div className="flex space-x-2">
                {languages.map((lang) => (
                    <Button
                        key={lang}
                        onClick={() => changeLanguage(lang)}
                        variant={router.locale === lang ? "primary" : "subliminal"}
                        size="sm"
                        className={router.locale === lang ? "" : "bg-surface-button hover:bg-surface-button-hover"}
                    >
                        {lang.toUpperCase()}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSwitcher;


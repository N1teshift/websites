import { useEffect, useState } from "react";
import { Button } from "./Button";

const ThemeSwitcher = ({ absolute = true }: { absolute?: boolean }) => {
    const themes = [
        { id: "light", label: "Light" },
        { id: "dark", label: "Dark" }
    ];

    const [currentTheme, setCurrentTheme] = useState<string>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const bodyTheme = document.body.getAttribute("data-theme") || "light";
        setCurrentTheme(bodyTheme);
    }, []);

    const changeTheme = (themeId: string) => {
        document.body.setAttribute("data-theme", themeId);
        setCurrentTheme(themeId);
    };

    const switcherClass = absolute
        ? "absolute top-4 right-4 z-50"
        : "flex items-center";

    if (!mounted) {
        return (
            <div className={switcherClass}>
                <div className="flex space-x-2">
                    {themes.map((theme) => (
                        <Button
                            key={theme.id}
                            variant="subliminal"
                            size="sm"
                            className="bg-surface-button hover:bg-surface-button-hover"
                        >
                            {theme.label}
                        </Button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={switcherClass}>
            <div className="flex space-x-2">
                {themes.map((theme) => (
                    <Button
                        key={theme.id}
                        onClick={() => changeTheme(theme.id)}
                        variant={currentTheme === theme.id ? "primary" : "subliminal"}
                        size="sm"
                        className={currentTheme === theme.id ? "" : "bg-surface-button hover:bg-surface-button-hover"}
                    >
                        {theme.label}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default ThemeSwitcher;


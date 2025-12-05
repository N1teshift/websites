import React from "react";
import { ToolbarProps, View } from "react-big-calendar";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";

interface CalendarToolbarProps extends ToolbarProps<any> {
    canNavigatePrev: boolean;
}

const buttonBase =
    "inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50";
const buttonDefault =
    "border-[color:var(--border-default)] bg-[color:var(--surface-button)] text-[color:var(--text-primary)] hover:border-[color:var(--brand-primary)] hover:bg-[color:var(--surface-button-hover)]";
const buttonPrimary =
    "border-transparent bg-[color:var(--brand-primary)] text-[color:var(--text-inverse)] hover:opacity-90";

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({ label, onNavigate, view, views, onView, canNavigatePrev }) => {
    const { t } = useFallbackTranslation();
    const availableViews = React.useMemo(() => {
        if (!views) {
            return [];
        }
        if (Array.isArray(views)) {
            return views;
        }
        return Object.entries(views)
            .filter(([, config]) => config !== false)
            .map(([viewName]) => viewName as View);
    }, [views]);

    const handleViewChange = (nextView: View) => () => {
        if (onView) {
            onView(nextView);
        }
    };

    const handleNavigate = (action: "TODAY" | "PREV" | "NEXT") => () => {
        if (action === "PREV" && !canNavigatePrev) {
            return;
        }
        onNavigate(action);
    };

    return (
        <div className="flex flex-wrap items-center gap-3 border-b border-[color:var(--border-default)] bg-[color:var(--surface-card)] px-4 py-3">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className={`${buttonBase} ${buttonDefault}`}
                    onClick={handleNavigate("TODAY")}
                >
                    {t("today")}
                </button>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className={`${buttonBase} ${buttonDefault}`}
                        onClick={handleNavigate("PREV")}
                        disabled={!canNavigatePrev}
                        aria-label={t("previous")}
                    >
                        ← {t("back")}
                    </button>
                    <button
                        type="button"
                        className={`${buttonBase} ${buttonDefault}`}
                        onClick={handleNavigate("NEXT")}
                        aria-label={t("next")}
                    >
                        {t("next")} →
                    </button>
                </div>
            </div>

            <div className="flex-1 text-center text-base font-semibold text-[color:var(--text-primary)]">
                {label}
            </div>

            <div className="flex items-center gap-2">
                {availableViews.map((availableView) => (
                    <button
                        key={availableView}
                        type="button"
                        className={`${buttonBase} ${availableView === view ? buttonPrimary : buttonDefault}`}
                        onClick={handleViewChange(availableView)}
                    >
                        {t(availableView)}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CalendarToolbar;





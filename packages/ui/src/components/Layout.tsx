import React, { useMemo } from 'react';
import GoBackButton from "./GoBackButton";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import { TranslationNamespaceContext, useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import { createComponentLogger } from '@websites/infrastructure/logging';

interface LayoutProps {
    children?: React.ReactNode;
    goBackTarget?: string;
    titleKey?: string;
    mode?: "centered" | "top";
    pageTranslationNamespaces?: string | string[];
    isUnderConstruction?: boolean;
    constructionMessageKey?: string;
    estimatedCompletion?: string;
    // Optional auth props - apps can provide their own auth implementation
    isAuthenticated?: boolean;
    LoginButton?: React.ComponentType<{ absolute?: boolean }>;
}

export default function Layout({
    children,
    goBackTarget,
    titleKey,
    mode = "centered",
    pageTranslationNamespaces = ["common"],
    isUnderConstruction = false,
    constructionMessageKey = "coming_soon_message",
    estimatedCompletion,
    isAuthenticated = false,
    LoginButton
}: LayoutProps) {
    const { t } = useFallbackTranslation(pageTranslationNamespaces);
    const logger = createComponentLogger('Layout');

    logger.debug('Layout title info', {
        titleKey,
        titleTranslation: titleKey ? t(titleKey) : 'no title key',
        namespacesFromContext: pageTranslationNamespaces
    });

    const contextValue = useMemo(() => ({
        translationNs: pageTranslationNamespaces,
        defaultNS: Array.isArray(pageTranslationNamespaces)
            ? pageTranslationNamespaces[0]
            : pageTranslationNamespaces,
        fallbackNS: Array.isArray(pageTranslationNamespaces)
            ? pageTranslationNamespaces.slice(1)
            : []
    }), [pageTranslationNamespaces]);

    const renderUnderConstructionContent = () => {
        return (
            <div className="relative flex items-center justify-center h-full p-8 text-center">
                <div className="relative z-10 text-center space-y-4 bg-white/30 backdrop-blur-sm p-8 rounded-xl border border-white/50 shadow-lg">
                    <p className="text-xl font-bold text-text-primary">
                        {t(constructionMessageKey)}
                    </p>
                    {estimatedCompletion && (
                        <p className="text-sm text-text-secondary mt-4">
                            Expected completion: {estimatedCompletion}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <TranslationNamespaceContext.Provider value={contextValue}>
            <div className={`min-h-screen flex flex-col ${mode === "centered" ? "items-center justify-center" : "items-center"} bg-math-pattern bg-math bg-page-bg`}>
                {mode === "top" ? (
                    <div className="w-full flex items-start justify-between p-6 gap-4 z-10">
                        <div className="flex-none min-w-[60px] flex justify-start mt-1">
                            {goBackTarget && <GoBackButton target={goBackTarget} absolute={false} />}
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
                ) : (
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
                )}

                <div
                    className={`w-full z-10 p-5 flex flex-col ${mode === "centered" ? "justify-center items-center" : "items-start"} ${mode === "top" ? "min-h-[500px]" : ""}`}
                >
                    {isUnderConstruction ? renderUnderConstructionContent() : children}
                </div>
            </div>
        </TranslationNamespaceContext.Provider>
    );
}


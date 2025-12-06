import React from 'react';
import GoBackButton from "./GoBackButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { TranslationNamespaceContext, useFallbackTranslation} from '@websites/infrastructure/i18n';
import { createComponentLogger } from '@websites/infrastructure/logging';
import styles from './ComingSoonMessage.module.css';

interface LayoutProps {
    children?: React.ReactNode;
    goBackTarget?: string;
    titleKey?: string; // Expected to be a translation key
    mode?: "centered" | "top";
    pageTranslationNamespaces?: string | string[];
    // New props for under construction state
    isUnderConstruction?: boolean;
    constructionMessageKey?: string;
    estimatedCompletion?: string;
}

/**
 * A layout component that wraps page content, providing consistent structure,
 * optional back button, language switcher, title, and translation context.
 *
 * It supports two modes: "centered" (content centered vertically and horizontally)
 * and "top" (content aligned to the top, with controls in a header row).
 *
 * @param props The component props.
 * @param props.children The content to be rendered within the layout.
 * @param props.goBackTarget Optional. If provided, renders a "Go Back" button linking to this target.
 * @param props.title Optional. A translation key for the page title.
 * @param props.mode Optional. Layout mode ("centered" or "top"). Defaults to "centered".
 * @param props.pageTranslationNamespaces Optional. Namespace(s) required for the page content and layout title. Defaults to ["common"]. Provides context for child components.
 * @param props.isUnderConstruction Optional. If true, renders under construction content instead of children.
 * @param props.constructionMessageKey Optional. Translation key for the construction message.
 * @param props.estimatedCompletion Optional. Estimated completion timeframe.
 * @returns A React element representing the page layout.
 */
export default function Layout({ 
    children, 
    goBackTarget, 
    titleKey, 
    mode = "centered", 
    pageTranslationNamespaces = ["common"],
    isUnderConstruction = false,
    constructionMessageKey = "coming_soon_message",
    estimatedCompletion
}: LayoutProps) {
    // Use fallback translation for titles - they can be in any namespace
    const { t } = useFallbackTranslation(pageTranslationNamespaces);
    const logger = createComponentLogger('Layout');
    
    // Log title translation info (debug level - hidden by default)
    logger.debug('Layout title info', {
        titleKey,
        titleTranslation: titleKey ? t(titleKey) : 'no title key',
        namespacesFromContext: pageTranslationNamespaces
    });

    const contextValue = {
        translationNs: pageTranslationNamespaces,
        defaultNS: Array.isArray(pageTranslationNamespaces)
            ? pageTranslationNamespaces[0]
            : pageTranslationNamespaces,
        fallbackNS: Array.isArray(pageTranslationNamespaces)
            ? pageTranslationNamespaces.slice(1)
            : []
    };

    // Render under construction content if specified
    const renderUnderConstructionContent = () => (
        <div className="relative flex items-center justify-center h-full p-8 text-center">
            {/* Container for bubbles - positioned behind the text */}
            <div className="absolute inset-0 z-0">
                {/* Render multiple bubble elements */}
                {[...Array(5)].map((_, index) => (
                    <div key={index} className={styles.bubble}>
                        {/* Inner spans for bubble coloring and effects */}
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                ))}
            </div>

            {/* Text content - positioned above the bubbles */}
            <div className="relative z-10 text-center space-y-4">
                <p className="text-lg text-black">
                    {t(constructionMessageKey)}
                </p>
                {estimatedCompletion && (
                    <p className="text-sm text-gray-600 mt-4">
                        Expected completion: {estimatedCompletion}
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <TranslationNamespaceContext.Provider value={contextValue}>
            <div className={`min-h-screen flex flex-col ${mode === "centered" ? "items-center justify-center" : "items-center"} math_pattern`}>
                {/*
                    When mode is 'top', render the LanguageSwitcher, GoBackButton, and title in a single flex row.
                    The title will wrap under the buttons if it is too long, using flex-wrap and min-w-0/flex-1.
                    For 'centered' mode, keep the old layout.
                */}
                {mode === "top" ? (
                    // Three-column flex layout: GoBackButton (left), Title (center), LanguageSwitcher (right)
                    <div className="w-full flex items-start justify-between p-4 gap-2">
                        {/* Left: GoBackButton (if present), not absolutely positioned in top mode */}
                        <div className="flex-none min-w-[60px] flex justify-start mt-1">
                            {goBackTarget && <GoBackButton target={goBackTarget} absolute={false} />}
                        </div>
                        {/* Center: Title, always centered and wraps if too long. Aligned to top for better visual balance. */}
                        {titleKey && (
                            <div className="flex-1 flex justify-center">
                                <h1 className="text-4xl font-bold text-black text-center break-words w-full max-w-3xl">
                                    {t(titleKey)}
                                </h1>
                            </div>
                        )}
                        {/* Right: LanguageSwitcher, not absolutely positioned in top mode */}
                        <div className="flex-none min-w-[120px] flex justify-end mt-1">
                            <LanguageSwitcher absolute={false} />
                        </div>
                    </div>
                ) : (
                    // Old layout for 'centered' mode, keep absolute positioning
                    <>
                        <LanguageSwitcher/>
                        {goBackTarget && <GoBackButton target={goBackTarget} />}
                        {titleKey && (
                            <div className="w-full flex items-center justify-center p-4 text-4xl font-bold text-black">
                                <h1>{t(titleKey)}</h1>
                            </div>
                        )}
                    </>
                )}

                <div
                    className={`w-full ${mode === "centered" ? "flex justify-center" : "flex"}`}
                    style={{
                        padding: "20px",
                        flexDirection: "column",
                        alignItems: mode === "centered" ? "center" : "flex-start",
                        minHeight: mode === "top" ? "500px" : undefined,
                    }}
                >
                    {isUnderConstruction ? renderUnderConstructionContent() : children}
                </div>
            </div>
        </TranslationNamespaceContext.Provider>
    );
}

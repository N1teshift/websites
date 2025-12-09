import React from "react";
import { TranslationNamespaceContext } from "@websites/infrastructure/i18n/client";

interface AppLayoutProps {
  children?: React.ReactNode;
  pageTranslationNamespaces?: string | string[];
  /** Optional Header component or element to render at the top */
  Header?: React.ComponentType | React.ReactElement;
  /** Optional Footer component to render at the bottom */
  Footer?: React.ComponentType;
  /** Optional DataCollectionNotice component to render */
  DataCollectionNotice?: React.ComponentType;
  /** Optional custom background class */
  backgroundClassName?: string;
  /** Content alignment mode: "centered" centers content, "top" aligns to top */
  contentMode?: "centered" | "top";
}

/**
 * AppLayout component for full application layouts with Header, Footer, and translation support.
 * Used by ITT Web and other apps that need a full app structure.
 *
 * Features:
 * - Translation namespace context
 * - Optional Header, Footer, and DataCollectionNotice components
 * - Flexible background styling
 */
export default function AppLayout({
  children,
  pageTranslationNamespaces = ["common"],
  Header,
  Footer,
  DataCollectionNotice,
  backgroundClassName = "min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black",
  contentMode = "centered",
}: AppLayoutProps) {
  const contextValue = {
    translationNs: pageTranslationNamespaces,
    defaultNS: Array.isArray(pageTranslationNamespaces)
      ? pageTranslationNamespaces[0]
      : pageTranslationNamespaces,
    fallbackNS: Array.isArray(pageTranslationNamespaces)
      ? pageTranslationNamespaces.slice(1)
      : [],
  };

  return (
    <TranslationNamespaceContext.Provider value={contextValue}>
      <div className={backgroundClassName}>
        {Header &&
          (React.isValidElement(Header) ? (
            Header
          ) : typeof Header === "function" ? (
            <Header />
          ) : null)}

        {/* Main Content */}
        <main
          className={`flex-1 w-full z-10 p-5 flex flex-col ${
            contentMode === "centered"
              ? "justify-center items-center"
              : "items-start"
          } ${contentMode === "top" ? "min-h-[500px]" : ""}`}
        >
          {children}
        </main>

        {Footer && <Footer />}
        {DataCollectionNotice && <DataCollectionNotice />}
      </div>
    </TranslationNamespaceContext.Provider>
  );
}

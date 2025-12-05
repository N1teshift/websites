/**
 * @file Defines the custom Document component for the Next.js application.
 * This allows customizing the `<html>` and `<body>` tags.
 * @author Your Name
 */

import { Html, Head, Main, NextScript } from "next/document";

/**
 * Custom Document component.
 *
 * Augments the application's `<html>` and `<body>` tags. This is necessary
 * to customize attributes like the `lang` attribute on `<html>` or add
 * global CSS classes to `<body>`.
 *
 * @returns {JSX.Element} The rendered Document component.
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

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
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Personal portfolio and projects showcase" />
        <meta name="robots" content="max-image-preview:large" />
      </Head>
      <body className="antialiased" data-theme="dark">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

import React from "react";
import { getStaticPropsWithTranslations } from "@websites/infrastructure/i18n/getStaticProps";
import type { GetStaticProps } from "next";
import type { ExtendedPageProps } from "@websites/infrastructure/app";

const pageNamespaces = ["common"];
export const getStaticProps: GetStaticProps<ExtendedPageProps> = async (context) => {
  const baseProps = await getStaticPropsWithTranslations(pageNamespaces)(context);
  return {
    ...baseProps,
    props: {
      ...baseProps.props,
      translationNamespaces: pageNamespaces,
    },
  };
};

export default function HomePage() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}

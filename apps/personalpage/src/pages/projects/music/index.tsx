import React from "react";
import { getStaticPropsWithTranslations } from "@websites/infrastructure/i18n/getStaticProps";
import { MusicPage } from "../../../features/modules/music";
import type { GetStaticProps } from "next";
import type { ExtendedPageProps } from "@websites/infrastructure/app";

const pageNamespaces = ["music", "links", "common"];
export const getStaticProps: GetStaticProps<ExtendedPageProps> = async (context) => {
  const baseProps = await getStaticPropsWithTranslations(pageNamespaces)(context);
  return {
    ...baseProps,
    props: {
      ...baseProps.props,
      translationNamespaces: pageNamespaces,
      layoutGoBackTarget: "/",
      layoutTitleKey: "music",
    },
  };
};

export default function Music() {
  return <MusicPage />;
}

import { getStaticPropsWithTranslations } from "@websites/infrastructure/i18n/getStaticProps";
import { CountingPrecinctsPage } from "../../../features/modules/emw";
import type { GetStaticProps } from "next";
import type { ExtendedPageProps } from "@websites/infrastructure/app";

const pageNamespaces = ["emw", "links", "common"];
export const getStaticProps: GetStaticProps<ExtendedPageProps> = async (context) => {
  const baseProps = await getStaticPropsWithTranslations(pageNamespaces)(context);
  return {
    ...baseProps,
    props: {
      ...baseProps.props,
      translationNamespaces: pageNamespaces,
      layoutGoBackTarget: "/",
      layoutTitleKey: "nav_counting_precincts",
      layoutMode: "top",
    },
  };
};

export default function CountingPrecincts() {
  return <CountingPrecinctsPage />;
}

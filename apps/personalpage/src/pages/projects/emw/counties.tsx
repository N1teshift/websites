import { getStaticPropsWithTranslations } from "@websites/infrastructure/i18n/getStaticProps";
import { CountiesPage } from "../../../features/modules/emw";
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
      layoutGoBackTarget: "/projects/emw/index",
      layoutTitleKey: "nav_counties",
      layoutMode: "top",
    },
  };
};

export default function Counties() {
  return <CountiesPage />;
}

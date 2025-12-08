import { getStaticPropsWithTranslations } from "@websites/infrastructure/i18n/getStaticProps";
import { VotingPrecinctsPage } from "../../../features/modules/emw";
import type { GetStaticProps } from "next";
import type { ExtendedPageProps } from "@websites/infrastructure/app";

const pageNamespaces = ["emw", "common", "links"];
export const getStaticProps: GetStaticProps<ExtendedPageProps> = async (context) => {
  const baseProps = await getStaticPropsWithTranslations(pageNamespaces)(context);
  return {
    ...baseProps,
    props: {
      ...baseProps.props,
      translationNamespaces: pageNamespaces,
      layoutGoBackTarget: "/",
      layoutTitleKey: "nav_voting_precincts",
      layoutMode: "top",
    },
  };
};

export default function VotingPrecincts() {
  return <VotingPrecinctsPage />;
}

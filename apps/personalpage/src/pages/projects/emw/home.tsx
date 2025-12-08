import { getStaticPropsWithTranslations } from "@websites/infrastructure/i18n/getStaticProps";
import { EmwHomePage } from "../../../features/modules/emw";
import { isFeatureEnabled } from "@/config/features";
import type { GetStaticProps } from "next";
import type { ExtendedPageProps } from "@websites/infrastructure/app";

const pageNamespaces = ["emw", "links", "common"];
export const getStaticProps: GetStaticProps<ExtendedPageProps> = async (context) => {
  const baseProps = await getStaticPropsWithTranslations(pageNamespaces)(context);
  const isDisabled = !isFeatureEnabled("emwHome");

  return {
    ...baseProps,
    props: {
      ...baseProps.props,
      translationNamespaces: pageNamespaces,
      layoutGoBackTarget: "/projects/emw",
      layoutTitleKey: "election_monitoring_wizard",
      layoutMode: "top",
      layoutIsUnderConstruction: isDisabled,
      ...(isDisabled && { layoutConstructionMessageKey: "emw_disabled_message" }),
    },
  };
};

export default function EmwHome() {
  const isDisabled = !isFeatureEnabled("emwHome");
  return !isDisabled ? <EmwHomePage /> : null;
}

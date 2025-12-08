import { getStaticPropsWithTranslations } from "@websites/infrastructure/i18n/getStaticProps";
import { ProgressReportPage } from "@/features/modules/edtech/progressReport";
import type { GetStaticProps } from "next";
import type { ExtendedPageProps } from "@websites/infrastructure/app";

const pageNamespaces = ["progress-report", "links", "common"];

export const getStaticProps: GetStaticProps<ExtendedPageProps> = async (context) => {
  const baseProps = await getStaticPropsWithTranslations(pageNamespaces)(context);
  return {
    ...baseProps,
    props: {
      ...baseProps.props,
      translationNamespaces: pageNamespaces,
      layoutGoBackTarget: "/",
      layoutTitleKey: "progress_report_dashboard",
      layoutMode: "top",
    },
  };
};

export default function ProgressReportPageWrapper() {
  return <ProgressReportPage />;
}

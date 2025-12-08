import { getStaticPropsWithTranslations } from "@websites/infrastructure/i18n/getStaticProps";
import ExamGeneratorPage from "@/features/modules/math/ExamGeneratorPage";
import { isFeatureEnabled } from "@/config/features";
import type { GetStaticProps } from "next";
import type { ExtendedPageProps } from "@websites/infrastructure/app";

const pageNamespaces = ["examGenerator", "links", "common"];
export const getStaticProps: GetStaticProps<ExtendedPageProps> = async (context) => {
  const baseProps = await getStaticPropsWithTranslations(pageNamespaces)(context);
  const isDisabled = !isFeatureEnabled("examGenerator");

  return {
    ...baseProps,
    props: {
      ...baseProps.props,
      translationNamespaces: pageNamespaces,
      layoutGoBackTarget: "/",
      layoutTitleKey: "exam_generator",
      layoutIsUnderConstruction: isDisabled,
      ...(isDisabled && { layoutConstructionMessageKey: "exam_generator_disabled" }),
    },
  };
};

export default function ExamGenerator() {
  const isDisabled = !isFeatureEnabled("examGenerator");
  return !isDisabled ? <ExamGeneratorPage /> : null;
}

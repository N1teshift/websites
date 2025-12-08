import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n/getStaticProps';
import { UnitPlanGeneratorPage } from '@/features/modules/edtech/unitPlanGenerator';
import type { GetStaticProps } from 'next';
import type { ExtendedPageProps } from '@websites/infrastructure/app';

const pageNamespaces = [
  "edtech-common",
  "edtech-guide", 
  "edtech-basic-info",
  "edtech-inquiry",
  "edtech-planning",
  "edtech-content",
  "edtech-concepts",
  "edtech-command-terms",
  "edtech-atl",
  "edtech-objectives",
  "edtech-resources",
  "links",
  "common"
];
export const getStaticProps: GetStaticProps<ExtendedPageProps> = async (context) => {
    const baseProps = await getStaticPropsWithTranslations(pageNamespaces)(context);
    return {
        ...baseProps,
        props: {
            ...baseProps.props,
            translationNamespaces: pageNamespaces,
            layoutGoBackTarget: "/",
            layoutTitleKey: "unit_plan_generator",
            layoutMode: "top",
        },
    };
};

export default function UnitPlanGeneratorPageWrapper() {
    return <UnitPlanGeneratorPage />;
}




import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n/getStaticProps';
import { Layout } from "@websites/ui";
import { UnitPlanGeneratorPage } from '@/features/modules/edtech/unitPlanGenerator';

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
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function UnitPlanGeneratorPageWrapper() {
    return (
        <Layout
            goBackTarget="/"
            titleKey="unit_plan_generator"
            pageTranslationNamespaces={pageNamespaces}
            mode="top"
        >
            <UnitPlanGeneratorPage />
        </Layout>
    );
}




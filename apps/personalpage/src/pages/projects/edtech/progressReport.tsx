import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n/getStaticProps';
import { Layout } from "@websites/ui";
import { ProgressReportPage } from '@/features/modules/edtech/progressReport';

const pageNamespaces = [
  "progress-report",
  "links",
  "common"
];

export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function ProgressReportPageWrapper() {
    return (
        <Layout
            goBackTarget="/"
            titleKey="progress_report_dashboard"
            pageTranslationNamespaces={pageNamespaces}
            mode="top"
        >
            <ProgressReportPage />
        </Layout>
    );
}





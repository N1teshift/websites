import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n';
import { Layout } from "@websites/ui";
import { CountingPrecinctsPage } from '../../../features/modules/emw';

const pageNamespaces = ["emw", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function CountingPrecincts() {
    return (
        <Layout
            goBackTarget="/projects/emw/index"
            titleKey="nav_counting_precincts"
            mode="top"
            pageTranslationNamespaces={pageNamespaces}
        >
            <CountingPrecinctsPage />
        </Layout>
    );
} 




import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n';
import { Layout } from "@websites/ui";
import { CountiesPage } from '../../../features/modules/emw';

const pageNamespaces = ["emw", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function Counties() {
    return (
        <Layout 
            goBackTarget="/projects/emw/index" 
            titleKey="nav_counties" 
            mode="top" 
            pageTranslationNamespaces={pageNamespaces}
        >
            <CountiesPage />
        </Layout>
    );
} 




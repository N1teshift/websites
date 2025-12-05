import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n';
import { Layout } from "@websites/ui";
import { AboutMePage } from '@/features/modules/aboutme';

const pageNamespaces = ["aboutme", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function AboutMe() {
    return (
        <Layout 
            goBackTarget="/" 
            titleKey="about_me" 
            pageTranslationNamespaces={pageNamespaces}
        >
            <AboutMePage />
        </Layout>
    );
}




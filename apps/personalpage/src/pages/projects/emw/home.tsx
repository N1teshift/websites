import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n';
import { Layout } from "@websites/ui";
import { EmwHomePage } from '../../../features/modules/emw';
import { isFeatureEnabled } from '@/config/features';

const pageNamespaces = ["emw", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function EmwHome() {
    const isDisabled = !isFeatureEnabled('emwHome');
    
    return (
        <Layout 
            goBackTarget="/projects/emw" 
            titleKey="election_monitoring_wizard" 
            mode="top" 
            pageTranslationNamespaces={pageNamespaces}
            isUnderConstruction={isDisabled}
            constructionMessageKey={isDisabled ? "emw_disabled_message" : undefined}
        >
            {!isDisabled && <EmwHomePage />}
        </Layout>
    );
}




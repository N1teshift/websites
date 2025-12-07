import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n/getStaticProps';
import { Layout } from "@websites/ui";
import { ConnectingVesselsPage } from '@/features/modules/connecting_vessels';
import { isFeatureEnabled } from '@/config/features';

const pageNamespaces = ["connecting_vessels", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function ConnectingVesselsPageWrapper() {
    const isDisabled = !isFeatureEnabled('connectingVessels');
    
    return (
        <Layout 
            goBackTarget="/" 
            titleKey="connecting_vessels" 
            pageTranslationNamespaces={pageNamespaces}
            mode="top"
            isUnderConstruction={isDisabled}
            constructionMessageKey={isDisabled ? "coming_soon_message" : undefined}
        >
            {!isDisabled && <ConnectingVesselsPage />}
        </Layout>
    );
}




import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n/getStaticProps';
import { ConnectingVesselsPage } from '@/features/modules/connecting_vessels';
import { isFeatureEnabled } from '@/config/features';
import type { GetStaticProps } from 'next';
import type { ExtendedPageProps } from '@websites/infrastructure/app';

const pageNamespaces = ["connecting_vessels", "links", "common"];
export const getStaticProps: GetStaticProps<ExtendedPageProps> = async (context) => {
    const baseProps = await getStaticPropsWithTranslations(pageNamespaces)(context);
    const isDisabled = !isFeatureEnabled('connectingVessels');
    
    return {
        ...baseProps,
        props: {
            ...baseProps.props,
            translationNamespaces: pageNamespaces,
            layoutGoBackTarget: "/",
            layoutTitleKey: "connecting_vessels",
            layoutMode: "top",
            layoutIsUnderConstruction: isDisabled,
            ...(isDisabled && { layoutConstructionMessageKey: "coming_soon_message" }),
        },
    };
};

export default function ConnectingVesselsPageWrapper() {
    const isDisabled = !isFeatureEnabled('connectingVessels');
    return !isDisabled ? <ConnectingVesselsPage /> : null;
}




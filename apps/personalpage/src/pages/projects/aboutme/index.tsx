import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n/getStaticProps';
import { AboutMePage } from '@/features/modules/aboutme';
import type { GetStaticProps } from 'next';
import type { ExtendedPageProps } from '@websites/infrastructure/app';

const pageNamespaces = ["aboutme", "links", "common"];
export const getStaticProps: GetStaticProps<ExtendedPageProps> = async (context) => {
    const baseProps = await getStaticPropsWithTranslations(pageNamespaces)(context);
    return {
        ...baseProps,
        props: {
            ...baseProps.props,
            translationNamespaces: pageNamespaces,
            layoutGoBackTarget: "/",
            layoutTitleKey: "about_me",
        },
    };
};

export default function AboutMe() {
    return <AboutMePage />;
}




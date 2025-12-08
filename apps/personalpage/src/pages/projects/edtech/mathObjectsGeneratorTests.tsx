import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { MathObjectsGeneratorTestsPage } from '../../../features/modules/math';
import type { GetServerSideProps } from 'next';
import type { ExtendedPageProps } from '@websites/infrastructure/app';
import nextI18NextConfig from '@websites/infrastructure/i18n/next-i18next.config';

const pageNamespaces = ["mathTests", "math", "links", "common"];
export const getServerSideProps: GetServerSideProps<ExtendedPageProps> = async (context) => {
    const defaultLocale = nextI18NextConfig.i18n?.defaultLocale || 'en';
    const resolvedLocale = context.locale || defaultLocale;
    
    return {
        props: {
            ...(await serverSideTranslations(resolvedLocale, pageNamespaces, nextI18NextConfig)),
            translationNamespaces: pageNamespaces,
            layoutGoBackTarget: "/",
            layoutTitleKey: "math_object_generation_testing_environment",
            layoutMode: "top",
        },
    };
};

export default function MathObjectsGeneratorTests() {
    return <MathObjectsGeneratorTestsPage />;
}




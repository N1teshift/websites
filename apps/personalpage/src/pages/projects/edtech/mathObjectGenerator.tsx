import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n/getStaticProps';
import MathObjectGeneratorPage from '@/features/modules/math/MathObjectGeneratorPage';
import type { GetStaticProps } from 'next';
import type { ExtendedPageProps } from '@websites/infrastructure/app';

const pageNamespaces = ["math", "links", "common"];
export const getStaticProps: GetStaticProps<ExtendedPageProps> = async (context) => {
    const baseProps = await getStaticPropsWithTranslations(pageNamespaces)(context);
    return {
        ...baseProps,
        props: {
            ...baseProps.props,
            translationNamespaces: pageNamespaces,
            layoutGoBackTarget: "/",
            layoutTitleKey: "math_object_generator",
            layoutMode: "top",
        },
    };
};

export default function MathObjectGenerator() {
    return <MathObjectGeneratorPage />;
}




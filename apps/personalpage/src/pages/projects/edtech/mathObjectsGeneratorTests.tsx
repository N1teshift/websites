import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n/getStaticProps';
import { MathObjectsGeneratorTestsPage } from '../../../features/modules/math';
import type { GetStaticProps } from 'next';
import type { ExtendedPageProps } from '@websites/infrastructure/app';

const pageNamespaces = ["mathTests", "math", "links", "common"];
export const getStaticProps: GetStaticProps<ExtendedPageProps> = async (context) => {
    const baseProps = await getStaticPropsWithTranslations(pageNamespaces)(context);
    return {
        ...baseProps,
        props: {
            ...baseProps.props,
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




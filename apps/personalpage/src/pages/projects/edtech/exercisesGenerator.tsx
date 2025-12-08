import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n/getStaticProps';
import { ExercisesGeneratorPage } from '../../../features/modules/math';
import { isFeatureEnabled } from '@/config/features';
import type { GetStaticProps } from 'next';
import type { ExtendedPageProps } from '@websites/infrastructure/app';

const pageNamespaces = ["exerciseEditor", "links", "common"];
export const getStaticProps: GetStaticProps<ExtendedPageProps> = async (context) => {
    const baseProps = await getStaticPropsWithTranslations(pageNamespaces)(context);
    const isDisabled = !isFeatureEnabled('exercisesGenerator');
    
    return {
        ...baseProps,
        props: {
            ...baseProps.props,
            translationNamespaces: pageNamespaces,
            layoutGoBackTarget: "/",
            layoutTitleKey: "exercises_generator",
            layoutIsUnderConstruction: isDisabled,
            ...(isDisabled && { layoutConstructionMessageKey: "exercises_generator_disabled" }),
        },
    };
};

export default function ExercisesGenerator() {
    const isDisabled = !isFeatureEnabled('exercisesGenerator');
    return !isDisabled ? <ExercisesGeneratorPage /> : null;
}




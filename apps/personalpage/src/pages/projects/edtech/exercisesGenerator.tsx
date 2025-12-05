import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n';
import { Layout } from "@websites/ui";
import { ExercisesGeneratorPage } from '../../../features/modules/math';
import { isFeatureEnabled } from '@/config/features';

const pageNamespaces = ["exerciseEditor", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function ExercisesGenerator() {
    const isDisabled = !isFeatureEnabled('exercisesGenerator');
    
    return (
        <Layout
            goBackTarget="/"
            titleKey="exercises_generator"
            pageTranslationNamespaces={pageNamespaces}
            isUnderConstruction={isDisabled}
            constructionMessageKey={isDisabled ? "exercises_generator_disabled" : undefined}
        >
            {!isDisabled && <ExercisesGeneratorPage />}
        </Layout>
    );
}




import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n';
import { Layout } from "@websites/ui";
import ExamGeneratorPage from '@/features/modules/math/ExamGeneratorPage';
import { isFeatureEnabled } from '@/config/features';

const pageNamespaces = ["examGenerator", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function ExamGenerator() {
    const isDisabled = !isFeatureEnabled('examGenerator');
    
    return (
        <Layout
            goBackTarget="/"
            titleKey="exam_generator"
            pageTranslationNamespaces={pageNamespaces}
            isUnderConstruction={isDisabled}
            constructionMessageKey={isDisabled ? "exam_generator_disabled" : undefined}
        >
            {!isDisabled && <ExamGeneratorPage />}
        </Layout>
    );
}




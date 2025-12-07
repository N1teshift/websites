import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n/getStaticProps';
import { Layout } from "@websites/ui";
import { MathObjectsGeneratorTestsPage } from '../../../features/modules/math';

const pageNamespaces = ["mathTests", "math", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function MathObjectsGeneratorTests() {
    return (
        <Layout
            goBackTarget="/"
            titleKey="math_object_generation_testing_environment"
            pageTranslationNamespaces={pageNamespaces}
            mode="top"
        >
            <MathObjectsGeneratorTestsPage />
        </Layout>
    );
}




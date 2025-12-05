import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n';
import { Layout } from "@websites/ui";
import MathObjectGeneratorPage from '@/features/modules/math/MathObjectGeneratorPage';

const pageNamespaces = ["math", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function MathObjectGenerator() {
    return (
        <Layout
            goBackTarget="/"
            titleKey="math_object_generator"
            mode="top"
            pageTranslationNamespaces={pageNamespaces}
        >
            <MathObjectGeneratorPage />
        </Layout>
    );
}




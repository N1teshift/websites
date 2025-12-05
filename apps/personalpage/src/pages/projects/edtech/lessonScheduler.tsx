import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n';
import { Layout } from "@websites/ui";
import { LessonSchedulerPage } from '../../../features/modules/calendar';

const pageNamespaces = ["calendar", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function LessonSchedulerPageWrapper() {
    return (
        <Layout
            goBackTarget="/"
            titleKey="lesson_scheduler"
            pageTranslationNamespaces={pageNamespaces}
            mode="top"
        >
            <LessonSchedulerPage />
        </Layout>
    );
}




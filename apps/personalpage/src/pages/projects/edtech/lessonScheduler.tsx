import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n/getStaticProps';
import { LessonSchedulerPage } from '../../../features/modules/calendar';
import type { GetStaticProps } from 'next';
import type { ExtendedPageProps } from '@websites/infrastructure/app';

const pageNamespaces = ["calendar", "links", "common"];
export const getStaticProps: GetStaticProps<ExtendedPageProps> = async (context) => {
    const baseProps = await getStaticPropsWithTranslations(pageNamespaces)(context);
    return {
        ...baseProps,
        props: {
            ...baseProps.props,
            translationNamespaces: pageNamespaces,
            layoutGoBackTarget: "/",
            layoutTitleKey: "lesson_scheduler",
            layoutMode: "top",
        },
    };
};

export default function LessonSchedulerPageWrapper() {
    return <LessonSchedulerPage />;
}




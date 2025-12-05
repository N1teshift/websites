import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n';
import { Layout } from "@websites/ui";
import { MyTasksPage } from '../../../features/modules/emw';

const pageNamespaces = ["emw", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function MyTasks() {
    return (
        <Layout 
            goBackTarget="/projects/emw/index" 
            titleKey="nav_my_tasks" 
            mode="top" 
            pageTranslationNamespaces={pageNamespaces}
        >
            <MyTasksPage />
        </Layout>
    );
} 




import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n';
import { Layout } from "@websites/ui";
import { VotingPrecinctsPage } from '../../../features/modules/emw';

const pageNamespaces = ["emw", "common", "links"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function VotingPrecincts() {
    return (
        <Layout
            goBackTarget="/projects/emw/index"
            titleKey="nav_voting_precincts"
            mode="top"
            pageTranslationNamespaces={pageNamespaces}
        >
            <VotingPrecinctsPage />
        </Layout>
    );
} 




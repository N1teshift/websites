import React from 'react';
import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n/getStaticProps';
import { Layout } from "@websites/ui";
import { MusicPage } from '../../../features/modules/music';

const pageNamespaces = ["music", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function Music() {
    return (
        <Layout
            goBackTarget="/"
            titleKey={"music"}
            pageTranslationNamespaces={pageNamespaces}
        >
            <MusicPage />
        </Layout>
    );
} 




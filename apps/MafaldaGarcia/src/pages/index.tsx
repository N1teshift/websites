import React from 'react';
import Head from 'next/head';
import path from 'path';
import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n/getStaticProps';
import { MafaldaGarciaPage } from '../MafaldaGarciaPage';
import type { GetStaticProps } from 'next';
import type { ExtendedPageProps } from '@websites/infrastructure/app';

const pageNamespaces = ["common"];
export const getStaticProps: GetStaticProps<ExtendedPageProps> = async (context) => {
    const baseProps = await getStaticPropsWithTranslations(pageNamespaces, {
        i18n: {
            locales: ['en', 'pt', 'lv', 'ru'],
            defaultLocale: 'en',
        },
        localePath: path.resolve(process.cwd(), 'locales'),
    })(context);
    
    return {
        ...baseProps,
        props: {
            ...baseProps.props,
            translationNamespaces: pageNamespaces,
        },
    };
};

export default function HomePage() {
  const title = 'Mafalda Garcia';

  return (
    <>
      <Head>
        <title>{title || 'Mafalda Garcia - Performance Artist'}</title>
        <meta name="description" content="Mafalda Garcia - Performance Artist exploring artivism, rituals & well-being through interdisciplinary dialogue" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <MafaldaGarciaPage title={title} />
    </>
  );
}

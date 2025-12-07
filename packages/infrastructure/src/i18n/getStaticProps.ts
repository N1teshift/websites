import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from './next-i18next.config';
import { UserConfig } from 'next-i18next';

/**
 * Creates a `getStaticProps` function pre-configured with `next-i18next` translations.
 *
 * @param namespaces An array of namespace strings to load. Defaults to ["common"].
 * @param userConfig Optional user config to override base config (e.g., for app-specific localePath).
 * @returns An async `getStaticProps` function suitable for use in Next.js pages.
 */
export function getStaticPropsWithTranslations(
    namespaces: string[] = ["common"],
    userConfig?: Partial<UserConfig>
) {
    return async function getStaticProps({ locale }: { locale: string }) {
        // Create a properly typed config object for serverSideTranslations
        // Merge base config with user-provided config (user config takes precedence)
        const typedConfig: UserConfig = {
            // Base config from next-i18next.config.ts
            i18n: userConfig?.i18n || nextI18NextConfig.i18n,
            localePath: userConfig?.localePath || nextI18NextConfig.localePath,
            keySeparator: userConfig?.keySeparator || nextI18NextConfig.keySeparator, 
            defaultNS: namespaces[0],
            fallbackNS: namespaces.slice(1),
        };
        
        return {
            props: {
                ...(await serverSideTranslations(locale, namespaces, typedConfig)),
            },
        };
    };
}


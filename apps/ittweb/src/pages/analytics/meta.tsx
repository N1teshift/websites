import type { GetStaticProps } from "next";
import { getStaticPropsWithTranslations } from "@websites/infrastructure/i18n/getStaticProps";
import { MetaPage } from "@/features/modules/analytics-group/meta/components/MetaPage";
import { ErrorBoundary } from "@/features/infrastructure/components";

const pageNamespaces = ["common"];

export const getStaticProps: GetStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function Meta() {
  return (
    <ErrorBoundary>
      <MetaPage pageNamespaces={pageNamespaces} />
    </ErrorBoundary>
  );
}

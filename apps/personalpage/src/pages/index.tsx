import React from 'react';
import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n';
import { Layout, CenteredLinkGrid } from "@websites/ui";

const links = [
    {
        titleKey: "about_me",
        splitLinks: [
            { href: "/projects/music", titleKey: "music" },
            { href: "/projects/aboutme", titleKey: "cv" }
        ]
    },

    {
        titleKey: "Community projects",
        splitLinks: [
            { href: "/projects/connecting-vessels", titleKey: "connecting_vessels" },
            { href: "https://www.islandtrolltribes.com", titleKey: "island_troll_tribes_website" },
            { href: "https://www.mafaldagarcia.eu", titleKey: "mafalda_garcia_website" },
            {
                titleKey: "election_monitoring",
                splitLinks: [
                    { href: "projects/emw", titleKey: "election_monitoring_wizard" },
                    { href: "https://www.stebetojugildija.lt", titleKey: "stebetoju_gildija" }
                ]
            }
        ]
    },
    {
        titleKey: "education_technologies",
        splitLinks: [
            { href: "/projects/edtech/mathObjectGenerator", titleKey: "math_object_generator"},
            { href: "/projects/edtech/exercisesGenerator", titleKey: "exercises_generator" },
            { href: "/projects/edtech/examGenerator", titleKey: "exam_generator" },
            { href: "/projects/edtech/lessonScheduler", titleKey: "lesson_scheduler" },
            { href: "/projects/edtech/unitPlanGenerator", titleKey: "unit_plan_generator"},
            { href: "/projects/edtech/progressReport", titleKey: "progress_report_dashboard"},
            { href: "/projects/edtech/mathObjectsGeneratorTests", titleKey: "math_object_generation_testing_environment"}
        ]
    }
];

const pageNamespaces = ["links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function Projects() {

    return (
        <Layout
            titleKey={"projects"}
            pageTranslationNamespaces={pageNamespaces}
            mode="top"
        >
            <CenteredLinkGrid links={links} />
        </Layout>
    );
} 



import React from "react";
import { WorkItem } from "../ui/WorkItem";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";

interface WorksSectionProps {
  images: string[];
}

export const WorksSection: React.FC<WorksSectionProps> = ({ images = [] }) => {
  const { t } = useFallbackTranslation();

  const works = [
    {
      title: t("works.workItems.rogovka.title"),
      description: t("works.workItems.rogovka.description"),
      credits: "https://youtu.be/nDKhde6XhI4?si=KkYYg6LUN0nEfRMI",
      quotes: [],
    },
    {
      title: t("works.workItems.rezekne.title"),
      description: t("works.workItems.rezekne.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.klaipeda.title"),
      description: t("works.workItems.klaipeda.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.leiria.title"),
      description: t("works.workItems.leiria.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.lisbon2019dec.title"),
      description: t("works.workItems.lisbon2019dec.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.lisbon2019nov.title"),
      description: t("works.workItems.lisbon2019nov.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.lisbon2018aug.title"),
      description: t("works.workItems.lisbon2018aug.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.rezekne2019.title"),
      description: t("works.workItems.rezekne2019.description"),
      credits: "https://youtu.be/CenxtSruMIM?si=jdhAGmB7DEKeJd5P",
      quotes: [],
    },
    {
      title: t("works.workItems.lisbon2018jul.title"),
      description: t("works.workItems.lisbon2018jul.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.lisbon2017nov.title"),
      description: t("works.workItems.lisbon2017nov.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.lisbon2017oct.title"),
      description: t("works.workItems.lisbon2017oct.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.marinha2017may.title"),
      description: t("works.workItems.marinha2017may.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.leiria2017may.title"),
      description: t("works.workItems.leiria2017may.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.barreiro2016dec.title"),
      description: t("works.workItems.barreiro2016dec.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.barreiro2016nov.title"),
      description: t("works.workItems.barreiro2016nov.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.lisbon2016oct1.title"),
      description: t("works.workItems.lisbon2016oct1.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.lisbon2016oct2.title"),
      description: t("works.workItems.lisbon2016oct2.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.leiria2016aug.title"),
      description: t("works.workItems.leiria2016aug.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.leiria2016jul1.title"),
      description: t("works.workItems.leiria2016jul1.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.barreiro2016jul.title"),
      description: t("works.workItems.barreiro2016jul.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.leiria2016jun.title"),
      description: t("works.workItems.leiria2016jun.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.portomos2016may.title"),
      description: t("works.workItems.portomos2016may.description"),
      quotes: [],
    },
    {
      title: t("works.workItems.lisbon2014jan.title"),
      description: t("works.workItems.lisbon2014jan.description"),
      quotes: [],
    },
  ];

  return (
    <section id="works" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-6xl font-playfair text-gray-900 mb-6">
            {t("works.title")}
          </h2>
        </div>

        <div className="space-y-24">
          {works.map((work, index) => (
            <WorkItem
              key={index}
              title={work.title}
              description={work.description}
              image={images[index % images.length]}
              credits={work.credits}
              isReversed={index % 2 === 1}
              quotes={work.quotes}
            />
          ))}
        </div>
      </div>
      <div className="section-divider"></div>
    </section>
  );
};

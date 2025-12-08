import { FaLinkedin, FaEnvelope } from "react-icons/fa";
import { useAboutMeData } from "../hooks";
import { Card } from "@websites/ui";

export default function AboutMePage() {
  const { t, techSkills, experience, projects, education, languages, interests, softSkills } =
    useAboutMeData();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <header className="mb-8 text-center md:text-left">
        <h1 className="text-4xl font-bold mb-2 text-text-primary">{t("name")}</h1>
        <p className="text-lg text-text-secondary mb-4">{t("location")}</p>
        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-text-secondary">
          <a
            href={`mailto:${t("email")}`}
            className="hover:text-brand-primary transition-colors flex items-center gap-2"
          >
            <FaEnvelope /> {t("email")}
          </a>
          <a
            href={`https://${t("linkedin")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-primary transition-colors flex items-center gap-2"
            aria-label={t("linkedinAria")}
          >
            <FaLinkedin /> {t("linkedinDisplay")}
          </a>
        </div>
      </header>

      {/* Professional Summary Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold pb-2 mb-4 text-text-primary border-b-2 border-border-default">
          {t("summaryTitle")}
        </h2>
        <p className="leading-relaxed text-text-secondary">{t("summaryContent")}</p>
      </section>

      {/* Technical Skills Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold pb-2 mb-4 text-text-primary border-b-2 border-border-default">
          {t("techSkillsTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Iterate over each skill category */}
          {Object.entries(techSkills).map(([key, category]) => (
            <Card key={key} className="p-4">
              <h3 className="text-lg font-medium mb-2 text-text-primary">{category.title}</h3>
              <ul className="list-disc list-inside text-text-secondary space-y-1">
                {/* Iterate over items in the category */}
                {category.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Soft Skills Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold pb-2 mb-4 text-text-primary border-b-2 border-border-default">
          {t("softSkillsTitle")}
        </h2>
        <ul className="list-disc list-inside text-text-secondary space-y-1">
          {softSkills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </section>

      {/* Professional Experience Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold pb-2 mb-4 text-text-primary border-b-2 border-border-default">
          {t("experienceTitle")}
        </h2>
        <div className="space-y-6">
          {/* Iterate over each experience item */}
          {experience.map((exp, index) => (
            <div key={index} className="border-l-4 border-brand-primary pl-4">
              <h3 className="text-xl font-medium text-text-primary">{exp.title}</h3>
              {exp.company && (
                <p className="text-md font-semibold text-text-secondary">{exp.company}</p>
              )}
              <p className="text-sm text-text-muted mb-1">
                {exp.location} · {exp.dates}
              </p>
              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <ul className="list-disc list-inside text-text-secondary space-y-1 mt-2">
                  {exp.responsibilities.map((responsibility, respIndex) => (
                    <li key={respIndex}>{responsibility}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold pb-2 mb-4 text-text-primary border-b-2 border-border-default">
          {t("projectsTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Iterate over each project item */}
          {projects.map((project, index) => (
            <Card key={index} className="p-4">
              <h3 className="text-lg font-medium mb-2 text-text-primary">{project.title}</h3>
              <p className="text-text-secondary leading-relaxed">{project.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold pb-2 mb-4 text-text-primary border-b-2 border-border-default">
          {t("educationTitle")}
        </h2>
        <div className="space-y-4">
          {/* Iterate over each education item */}
          {education.map((edu, index) => (
            <div key={index} className="border-l-4 border-brand-primary pl-4">
              <h3 className="text-xl font-medium text-text-primary">{edu.degree}</h3>
              <p className="text-md font-semibold text-text-secondary">{edu.institution}</p>
              <p className="text-sm text-text-muted">{edu.dates}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Languages Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold pb-2 mb-4 text-text-primary border-b-2 border-border-default">
          {t("languagesTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Iterate over each language item */}
          {languages.map((lang, index) => (
            <Card key={index} className="p-3">
              <h3 className="text-lg font-medium text-text-primary">{lang.language}</h3>
              <p className="text-sm text-text-secondary">{lang.level}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Interests Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold pb-2 mb-4 text-text-primary border-b-2 border-border-default">
          {t("interestsTitle")}
        </h2>
        <ul className="list-disc list-inside text-text-secondary space-y-1">
          {interests.map((interest, index) => (
            <li key={index}>{interest}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

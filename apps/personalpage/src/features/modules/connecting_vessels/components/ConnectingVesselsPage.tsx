import { useFallbackTranslation } from "@websites/infrastructure/i18n";
import { ImageCarousel, Card, Button } from "@websites/ui";

export default function ConnectingVesselsPage() {
  const { t } = useFallbackTranslation(["connecting_vessels", "links", "common"]);

  // Photo gallery data
  const galleryImages = [
    {
      src: "/images/yaga2025/cube_day.jpg",
      alt: "Cube sculpture during day",
      caption: "Cube sculpture installation during daylight",
    },
    {
      src: "/images/yaga2025/cube_night_1.jpg",
      alt: "Cube sculpture at night",
      caption: "Cube sculpture illuminated at night",
    },
    {
      src: "/images/yaga2025/cube_night_2.jpg",
      alt: "Cube sculpture night view 2",
      caption: "Another view of the cube sculpture at night",
    },
    {
      src: "/images/yaga2025/cube_night_3.jpg",
      alt: "Cube sculpture night view 3",
      caption: "Cube sculpture with ambient lighting",
    },
    {
      src: "/images/yaga2025/pyramid_day.jpg",
      alt: "Pyramid sculpture during day",
      caption: "Pyramid sculpture installation during daylight",
    },
    {
      src: "/images/yaga2025/pyramid_night_1.jpg",
      alt: "Pyramid sculpture at night",
      caption: "Pyramid sculpture illuminated at night",
    },
    {
      src: "/images/yaga2025/pyramid_night_2.jpg",
      alt: "Pyramid sculpture night view 2",
      caption: "Another view of the pyramid sculpture at night",
    },
    {
      src: "/images/yaga2025/rock_day.jpg",
      alt: "Rock sculpture during day",
      caption: "Rock sculpture installation during daylight",
    },
    {
      src: "/images/yaga2025/rock_night_1.jpg",
      alt: "Rock sculpture at night",
      caption: "Rock sculpture illuminated at night",
    },
    {
      src: "/images/yaga2025/rock_night_2.jpg",
      alt: "Rock sculpture night view 2",
      caption: "Another view of the rock sculpture at night",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Project Overview, Role & Gallery */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-text-primary mb-6 border-b-2 border-border-default pb-2">
          {t("project_overview")}
        </h2>

        <div className="mb-8">
          <p className="text-text-secondary leading-relaxed mb-6">{t("project_overview_text")}</p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-text-primary mb-4">{t("role_description")}</h3>
          <p className="text-text-secondary leading-relaxed">{t("role_description_text")}</p>
        </div>

        {/* Photo Gallery */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-text-primary mb-4">{t("photo_gallery")}</h3>
          <ImageCarousel images={galleryImages} />
        </div>
      </Card>

      {/* Technical Details */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-text-primary mb-6 border-b-2 border-border-default pb-2">
          {t("technical_details")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              {t("technologies_used")}
            </h3>
            <ul className="list-disc list-inside text-text-secondary space-y-1">
              <li>{t("raspberry_pi")}</li>
              <li>{t("darkice")}</li>
              <li>{t("liquidsoap")}</li>
              <li>{t("icecast")}</li>
              <li>{t("mqtt")}</li>
              <li>{t("node_red")}</li>
              <li>{t("ansible")}</li>
              <li>{t("pulseaudio")}</li>
              <li>{t("mpv")}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              {t("technical_implementation")}
            </h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              {t("technical_details_text")}
            </p>
            <h4 className="text-md font-semibold text-text-primary mb-2">{t("audio_flow")}</h4>
            <p className="text-text-secondary leading-relaxed">{t("audio_flow_text")}</p>
          </div>
        </div>
      </Card>

      {/* Open Source */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-text-primary mb-6 border-b-2 border-border-default pb-2">
          {t("open_source")}
        </h2>

        <div className="space-y-4">
          <p className="text-text-secondary leading-relaxed">{t("open_source_text")}</p>
          <Button
            as="a"
            href={t("github_url")}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
          >
            {t("github_link")}
          </Button>
        </div>
      </Card>
    </div>
  );
}

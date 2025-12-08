import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Card, Button } from "@websites/ui";

export default function MusicPage() {
  const { t } = useFallbackTranslation();

  // Your SoundCloud profile data (you can update these manually)
  const userInfo = {
    username: "Scatman33",
    avatar_url: "https://i1.sndcdn.com/avatars-SPjcYaAZa6LTymWY-sPGG2w-large.jpg",
    permalink_url: "https://soundcloud.com/scatman33",
    track_count: 5,
    public_favorites_count: 224,
    followers_count: 38,
  };

  // Your tracks (you can add more manually)
  const tracks = [
    {
      id: 1,
      title: "Santechnikas iš Ukmergės - Sing It Back - Mashup Cover",
      permalink_url:
        "https://soundcloud.com/scatman33/santechnikas-is-ukmerger-sing-it-back-mashup-cover",
      embed_url:
        "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/759841018&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
    },
    {
      id: 2,
      title: "Disolved Girl cover",
      permalink_url: "https://soundcloud.com/scatman33/disolved-girl-cover",
      embed_url:
        "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/184235689&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
    },
    {
      id: 3,
      title: "Summer'13",
      permalink_url: "https://soundcloud.com/scatman33/summer13",
      embed_url:
        "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/183441147&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
    },
    {
      id: 4,
      title: "Raudoni vakarai / In the House, In a Heartbeat cover",
      permalink_url:
        "https://soundcloud.com/scatman33/raudoni-vakarai-in-the-house-in-a-heartbeat-cover",
      embed_url:
        "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/198301119&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
    },
    {
      id: 5,
      title: "Likimas",
      permalink_url: "https://soundcloud.com/scatman33/likimas",
      embed_url:
        "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/169846764&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
    },
    // Add more tracks here manually
  ];

  return (
    <div className="space-y-6">
      {/* Follow Button */}
      <div className="flex justify-center">
        <Button
          as="a"
          href={userInfo.permalink_url}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          className="flex items-center gap-2 text-lg"
        >
          <FaExternalLinkAlt />
          {t("follow_on_soundcloud")}
        </Button>
      </div>

      {/* Tracks Grid */}
      <Card className="w-full max-w-none p-0 overflow-hidden">
        {tracks.map((track) => (
          <div key={track.id} className="border-b border-border-default last:border-b-0">
            <div className="w-full relative">
              <iframe
                width="100%"
                height="200"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={track.embed_url}
                title={`SoundCloud player for ${track.title}`}
                loading="lazy"
                onError={(e) => {
                  console.warn("SoundCloud embed failed to load:", e);
                }}
              />
              <div className="absolute inset-0 bg-surface-card flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                <p className="text-text-muted text-sm">Loading player...</p>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

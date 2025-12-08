import React from "react";

interface WorkItemProps {
  title: string;
  description: string;
  image?: string;
  credits?: string;
  isReversed?: boolean;
  quotes?: string[];
}

export const WorkItem: React.FC<WorkItemProps> = ({
  title,
  description,
  image: _image,
  credits,
  isReversed: _isReversed = false,
  quotes = [],
}) => {
  const renderYouTubeEmbed = () => {
    if (!credits) return null;

    const youtubeMatch = credits.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (!youtubeMatch) return null;

    const videoId = youtubeMatch[1];
    return (
      <div className="mt-6">
        <div className="relative overflow-hidden rounded-lg">
          <div className="aspect-video relative">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    );
  };

  const content = (
    <div className="flex-1 space-y-6">
      <h3 className="font-playfair text-3xl lg:text-4xl text-gray-900 mb-6">{title}</h3>
      <div className="space-y-4 text-lg leading-relaxed text-gray-700">
        <p>{description}</p>
        {quotes.map((quote, index) => (
          <p key={index} className="italic">
            &quot;{quote}&quot;
          </p>
        ))}
        {credits && !credits.includes("youtu.be") && !credits.includes("youtube.com") && (
          <p className="text-sm text-warm-gray italic mt-4">{credits}</p>
        )}
        {renderYouTubeEmbed()}
      </div>
    </div>
  );

  return <div className="fade-in visible max-w-4xl mx-auto">{content}</div>;
};

import React, { useState } from "react";
import { getBUPTopics, getCambridgeTopics, applyConnections } from "./curriculumData";
import TimelineCell from "./TimelineCell";

interface CurriculumTimelineProps {
  title: string;
  description: string;
  curriculumType: "bup" | "cambridge";
  grade: number;
  onTopicHover?: (topicId: string | null, connections: string[]) => void;
}

const CurriculumTimeline: React.FC<CurriculumTimelineProps> = ({
  title,
  description,
  curriculumType,
  grade,
  onTopicHover,
}) => {
  const [hoveredTopicId, setHoveredTopicId] = useState<string | null>(null);

  // Get real curriculum data
  const rawTopics = curriculumType === "bup" ? getBUPTopics(grade) : getCambridgeTopics(grade);

  // Apply connections
  const topics = applyConnections(rawTopics);

  const handleHover = (topicId: string | null) => {
    setHoveredTopicId(topicId);
    if (onTopicHover && topicId) {
      const topic = topics.find((t) => t.id === topicId);
      onTopicHover(topicId, topic?.connections || []);
    } else if (onTopicHover) {
      onTopicHover(null, []);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <p className="text-xs text-gray-500 mt-1">{topics.length} topics available</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
        <div className="inline-flex gap-2 min-w-full">
          {topics.map((topic) => (
            <TimelineCell
              key={topic.id}
              topic={topic}
              isHovered={hoveredTopicId === topic.id}
              onHover={handleHover}
              curriculumType={curriculumType}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurriculumTimeline;

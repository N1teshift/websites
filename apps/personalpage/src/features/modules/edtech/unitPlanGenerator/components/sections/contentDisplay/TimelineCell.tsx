import React from 'react';
import { CurriculumTopic } from './curriculumData';

interface TimelineCellProps {
    topic: CurriculumTopic;
    isHovered: boolean;
    onHover: (id: string | null) => void;
    curriculumType: 'bup' | 'cambridge';
    isConnected?: boolean; // When another topic is hovered that connects to this
}

const TimelineCell: React.FC<TimelineCellProps> = ({ 
    topic, 
    isHovered,
    isConnected = false,
    onHover,
    curriculumType 
}) => {
    const bgColor = curriculumType === 'bup' 
        ? 'bg-blue-100 hover:bg-blue-200 border-blue-300' 
        : 'bg-green-100 hover:bg-green-200 border-green-300';
    
    const hoverBgColor = curriculumType === 'bup'
        ? 'bg-blue-300 border-blue-500'
        : 'bg-green-300 border-green-500';
    
    const connectedBgColor = curriculumType === 'bup'
        ? 'bg-blue-200 border-blue-400'
        : 'bg-green-200 border-green-400';

    return (
        <div
            className={`
                relative flex-shrink-0 w-64 p-3 rounded-lg border-2 cursor-pointer
                transition-all duration-200 transform
                ${isHovered ? `${hoverBgColor} scale-105 shadow-xl z-10` : 
                  isConnected ? `${connectedBgColor} scale-102 shadow-md` : 
                  bgColor}
            `}
            onMouseEnter={() => onHover(topic.id)}
            onMouseLeave={() => onHover(null)}
        >
            <div className="space-y-2">
                {/* Module/Strand badge */}
                {(topic.module || topic.strand) && (
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600 bg-white bg-opacity-60 px-2 py-1 rounded">
                            {topic.module || topic.strand}
                        </span>
                    </div>
                )}
                
                <h4 className="text-sm font-bold text-gray-900 leading-tight">
                    {topic.title}
                </h4>
                
                {/* BUP: Show content preview */}
                {topic.content && (
                    <p className="text-xs text-gray-700 line-clamp-3">
                        {topic.content}
                    </p>
                )}
                
                {/* Cambridge: Show objectives count */}
                {topic.objectives && topic.objectives.length > 0 && (
                    <div className="text-xs text-gray-700">
                        <span className="font-semibold">{topic.objectives.length} objectives</span>
                        <ul className="mt-1 space-y-1">
                            {topic.objectives.slice(0, 2).map((obj, idx) => (
                                <li key={idx} className="truncate" title={obj}>
                                    • {obj}
                                </li>
                            ))}
                            {topic.objectives.length > 2 && (
                                <li className="text-gray-500 italic">
                                    + {topic.objectives.length - 2} more...
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {topic.connections && topic.connections.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                        <span className="text-xs text-gray-600 font-semibold flex items-center">
                            🔗 {topic.connections.length} {topic.connections.length === 1 ? 'connection' : 'connections'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimelineCell;





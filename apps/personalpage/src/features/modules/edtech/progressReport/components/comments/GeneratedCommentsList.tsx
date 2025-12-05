import React, { useState } from 'react';
import { GeneratedComment } from '../../utils/comments/mathCommentGenerator';

interface GeneratedCommentsListProps {
    comments: GeneratedComment[];
    activeTemplateId: string;
    onCopyComment: (comment: string) => void;
}

export const GeneratedCommentsList: React.FC<GeneratedCommentsListProps> = ({
    comments,
    activeTemplateId,
    onCopyComment
}) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (comment: string, index: number) => {
        onCopyComment(comment);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const isMathTemplate = activeTemplateId === 'default-unit1';

    return (
        <div className="space-y-6">
            {comments.map((result, index) => (
                <div key={result.student.id || `${result.student.first_name}-${result.student.last_name}`} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    {/* Student Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {result.student.first_name} {result.student.last_name}
                            </h3>
                            {isMathTemplate && (
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                    <span>SD1: {result.sd1myp}</span>
                                    <span>SD2: {result.sd2myp}</span>
                                    <span>SD3: {result.sd3myp}</span>
                                    <span className="font-medium">
                                        MYP Level: {result.mypLevel}
                                    </span>
                                    {result.p1 !== null && (
                                        <>
                                            <span>P1: {result.p1}</span>
                                            <span className="font-medium">
                                                MYP-Based Grade: {result.mypBasedGrade}
                                            </span>
                                            {result.deviation !== null && (
                                                <span className={result.deviation >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                                    Deviation: {result.deviation >= 0 ? '+' : ''}{result.deviation}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                            {result.weakSections.length > 0 && (
                                <div className="mt-2">
                                    <span className="text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                                        {isMathTemplate ? 'Weak Sections: ' : 'Weakest Area: '}
                                        {result.weakSections.map(w => `${w.section} (${Math.round(w.score)}${isMathTemplate ? '' : '%'})`).join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => handleCopy(result.comment, index)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                copiedIndex === index
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                        >
                            {copiedIndex === index ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy
                                </>
                            )}
                        </button>
                    </div>

                    {/* Comment Text */}
                    <div className="prose prose-sm max-w-none">
                        <p className="text-gray-800 leading-relaxed">
                            {result.comment}
                        </p>
                    </div>

                    {/* Character Count */}
                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                        Character count: {result.comment.length}
                    </div>
                </div>
            ))}
        </div>
    );
};





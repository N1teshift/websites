import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StudentData } from '../../types/ProgressReportTypes';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import { buildAllTimelineEvents, TimelineEvent } from '../../utils/processing/timelineEventsBuilder';

interface ActivityTimelineChartProps {
    student: StudentData;
    selectedTypes: string[];
    dateRange?: { startDate: string | null; endDate: string | null };
    height?: number;
}

interface ActivityChartData {
    date: string;
    displayDate: string;
    count: number;
    events: TimelineEvent[];
}

interface ScoreChartData {
    date: string;
    displayDate: string;
    score: number;
    event: TimelineEvent;
}

const ActivityTimelineChart: React.FC<ActivityTimelineChartProps> = ({
    student,
    selectedTypes,
    dateRange,
    height = 300
}) => {
    const { t } = useFallbackTranslation();

    const isActivityMode = selectedTypes.length === 0 || selectedTypes.length > 1;

    const timelineEvents = useMemo(() => {
        return buildAllTimelineEvents(student, selectedTypes, dateRange);
    }, [student, selectedTypes, dateRange]);

    const chartData = useMemo(() => {
        if (isActivityMode) {
            // Activity mode: Group by date and count events
            const activityByDate = new Map<string, { date: string; displayDate: string; count: number; events: TimelineEvent[] }>();

            timelineEvents.forEach(event => {
                if (!activityByDate.has(event.date)) {
                    activityByDate.set(event.date, {
                        date: event.date,
                        displayDate: event.displayDate,
                        count: 0,
                        events: []
                    });
                }
                const entry = activityByDate.get(event.date)!;
                entry.count++;
                entry.events.push(event);
            });

            return Array.from(activityByDate.values());
        } else {
            // Score mode: Show individual scores
            return timelineEvents
                .filter(e => e.score !== undefined)
                .map(event => ({
                    date: event.date,
                    displayDate: event.displayDate,
                    score: event.score,
                    event
                }));
        }
    }, [timelineEvents, isActivityMode]);

    const typeColors: Record<string, string> = {
        homework: '#3B82F6',
        homework_graded: '#2563EB',
        classwork: '#10B981',
        summative: '#F59E0B',
        test: '#EAB308',
        diagnostic: '#8B5CF6',
        board_solving: '#06B6D4',
        consultation: '#EC4899',
        cambridge_test: '#14B8A6',
        default: '#6B7280'
    };

    if (timelineEvents.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">{t('no_assessments')}</p>
            </div>
        );
    }

    const ActivityTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: ActivityChartData }[] }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
                    <p className="font-semibold text-gray-900 mb-2">{data.displayDate}</p>
                    <p className="text-sm text-gray-600 mb-2">{data.count} {data.count === 1 ? 'activity' : 'activities'}</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {data.events?.map((event: TimelineEvent, idx: number) => (
                            <div key={idx} className="text-xs border-l-2 pl-2" style={{ borderColor: typeColors[event.type] || typeColors.default }}>
                                <p className="font-medium text-gray-900">{event.details.title}</p>
                                <p className="text-gray-600">{event.details.description}</p>
                                {event.details.score && <p className="text-gray-800 font-semibold">Score: {event.details.score}</p>}
                                {event.details.comment && <p className="text-gray-500 italic">{event.details.comment}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    const ScoreTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: ScoreChartData }[] }) => {
        if (active && payload && payload.length) {
            const event = payload[0].payload.event;
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
                    <p className="font-semibold text-gray-900 mb-1">{event.displayDate}</p>
                    <p className="text-sm font-medium text-blue-600 mb-2">{event.details.title}</p>
                    <p className="text-xs text-gray-600 mb-1">{event.details.description}</p>
                    {event.details.column && (
                        <p className="text-xs text-gray-500">Column: {event.details.column}</p>
                    )}
                    {event.details.score && (
                        <p className="text-lg font-bold text-gray-900 mt-2">Score: {event.details.score}</p>
                    )}
                    {event.details.comment && event.details.comment !== '' && (
                        <p className="text-xs text-gray-600 mt-2 italic border-t pt-2">
                            💬 {event.details.comment}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full">
            <div className="mb-2 text-sm text-gray-600 flex items-center justify-between">
                <span>
                    {isActivityMode ? (
                        <span className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            Activity Timeline Mode
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                            Score Timeline Mode ({selectedTypes[0]})
                        </span>
                    )}
                </span>
                <span className="text-xs text-gray-500">
                    {timelineEvents.length} {timelineEvents.length === 1 ? 'event' : 'events'}
                </span>
            </div>

            <ResponsiveContainer width="100%" height={height}>
                {isActivityMode ? (
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="displayDate"
                            tick={{ fontSize: 11 }}
                            stroke="#6B7280"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            stroke="#6B7280"
                            allowDecimals={false}
                            label={{ value: 'Activities', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={<ActivityTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={{ fill: '#3B82F6', r: 6, strokeWidth: 2, stroke: '#ffffff' }}
                            activeDot={{ r: 8, strokeWidth: 2 }}
                            connectNulls={false}
                        />
                    </LineChart>
                ) : (
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="displayDate"
                            tick={{ fontSize: 11 }}
                            stroke="#6B7280"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            stroke="#6B7280"
                            domain={[0, 'auto']}
                            label={{ value: t('score'), angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={<ScoreTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke={typeColors[selectedTypes[0]] || '#3B82F6'}
                            strokeWidth={2}
                            dot={{ fill: typeColors[selectedTypes[0]] || '#3B82F6', r: 5, strokeWidth: 2, stroke: '#ffffff' }}
                            activeDot={{ r: 7, strokeWidth: 2 }}
                        />
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

export default ActivityTimelineChart;




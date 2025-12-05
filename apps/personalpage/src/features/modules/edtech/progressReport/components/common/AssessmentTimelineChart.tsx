import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Assessment } from '../../types/ProgressReportTypes';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';

interface AssessmentTimelineChartProps {
    assessments: Assessment[];
    height?: number;
}

const AssessmentTimelineChart: React.FC<AssessmentTimelineChartProps> = ({
    assessments,
    height = 300
}) => {
    const { t } = useFallbackTranslation();

    const chartData = useMemo(() => {
        const sorted = [...assessments]
            .filter(a => {
                const score = parseFloat(a.score);
                return !isNaN(score);
            })
            .sort((a, b) => a.date.localeCompare(b.date));

        return sorted.map(assessment => ({
            date: new Date(assessment.date).toLocaleDateString('en-GB', { 
                month: 'short', 
                day: 'numeric' 
            }),
            fullDate: assessment.date,
            score: parseFloat(assessment.score),
            type: assessment.type,
            task: assessment.task_name
        }));
    }, [assessments]);


    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">{t('no_assessments')}</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={height}>
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        stroke="#6B7280"
                    />
                    <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#6B7280"
                        domain={[0, 'auto']}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '0.5rem',
                            padding: '0.75rem'
                        }}
                        formatter={(value: number) => [value, t('score')]}
                        labelFormatter={(label) => `${t('date')}: ${label}`}
                    />
                    <Legend 
                        wrapperStyle={{ paddingTop: '1rem' }}
                        iconType="line"
                    />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', r: 4 }}
                        activeDot={{ r: 6 }}
                        name={t('score')}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AssessmentTimelineChart;





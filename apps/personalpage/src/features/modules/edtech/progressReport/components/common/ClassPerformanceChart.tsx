import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { StudentData } from "../../types/ProgressReportTypes";
import { calculateStudentStats } from "../../utils/progressReportUtils";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

interface ClassPerformanceChartProps {
  students: StudentData[];
  height?: number;
}

const ClassPerformanceChart: React.FC<ClassPerformanceChartProps> = ({
  students,
  height = 300,
}) => {
  const { t } = useFallbackTranslation();

  const chartData = useMemo(() => {
    const ranges = [
      { range: "0-2", min: 0, max: 2, count: 0, color: "#EF4444" },
      { range: "2-4", min: 2, max: 4, count: 0, color: "#F59E0B" },
      { range: "4-6", min: 4, max: 6, count: 0, color: "#FCD34D" },
      { range: "6-8", min: 6, max: 8, count: 0, color: "#10B981" },
      { range: "8-10", min: 8, max: 10, count: 0, color: "#059669" },
    ];

    students.forEach((student) => {
      const stats = calculateStudentStats(student);
      const score = stats.averageScore;

      const range = ranges.find((r) => score >= r.min && score < r.max);
      if (range) {
        range.count++;
      } else if (score === 10) {
        ranges[ranges.length - 1].count++;
      }
    });

    return ranges;
  }, [students]);

  const maxCount = Math.max(...chartData.map((d) => d.count));

  if (students.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">{t("no_students")}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
            label={{ value: t("score") + " Range", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
            allowDecimals={false}
            domain={[0, maxCount + 1]}
            label={{ value: t("students"), angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "0.5rem",
              padding: "0.75rem",
            }}
            formatter={(value: number) => [value, t("students")]}
            labelFormatter={(label) => `${t("score")} Range: ${label}`}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClassPerformanceChart;

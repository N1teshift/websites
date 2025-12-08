/**
 * Mission Creator Component
 * Main view for creating missions from unmastered objectives
 */

import React, { useState, useMemo } from "react";
import { StudentData } from "../../types/ProgressReportTypes";
import { StudentMissionCandidate } from "../../types/MissionTypes";
import { StudentMissionCard } from "./StudentMissionCard";
import { CreateMissionDialog } from "./CreateMissionDialog";
import {
  createMissionCandidate,
  groupCandidatesByPriority,
  createMission,
  startMission,
  addMissionToStudent,
} from "../../utils/missionUtils";
import { Logger } from "@websites/infrastructure/logging";

interface MissionCreatorProps {
  students: StudentData[];
  onStudentUpdate: (student: StudentData) => void;
}

export const MissionCreator: React.FC<MissionCreatorProps> = ({ students, onStudentUpdate }) => {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedStrand, setSelectedStrand] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"points" | "name">("points");
  const [creatingMission, setCreatingMission] = useState<{
    candidate: StudentMissionCandidate;
    objectives: string[];
  } | null>(null);

  // Generate candidates
  const candidates = useMemo(() => {
    return students
      .map((student) => createMissionCandidate(student))
      .filter(Boolean) as StudentMissionCandidate[];
  }, [students]);

  // Get unique classes
  const classes = useMemo(() => {
    const classSet = new Set(candidates.map((c) => c.class_name));
    return Array.from(classSet).sort();
  }, [candidates]);

  // Get unique strands
  const strands = useMemo(() => {
    const strandSet = new Set<string>();
    candidates.forEach((c) => {
      c.unmastered_objectives.forEach((obj) => {
        strandSet.add(obj.strand);
      });
    });
    return Array.from(strandSet).sort();
  }, [candidates]);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    let filtered = candidates;

    // Filter by class
    if (selectedClass !== "all") {
      filtered = filtered.filter((c) => c.class_name === selectedClass);
    }

    // Filter by strand
    if (selectedStrand !== "all") {
      filtered = filtered
        .map((c) => ({
          ...c,
          unmastered_objectives: c.unmastered_objectives.filter(
            (obj) => obj.strand === selectedStrand
          ),
          missing_points: c.unmastered_objectives
            .filter((obj) => obj.strand === selectedStrand)
            .reduce((sum, obj) => sum + obj.missing_points, 0),
        }))
        .filter((c) => c.unmastered_objectives.length > 0);
    }

    // Sort
    if (sortBy === "points") {
      filtered.sort((a, b) => b.missing_points - a.missing_points);
    } else {
      filtered.sort((a, b) =>
        `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`)
      );
    }

    return filtered;
  }, [candidates, selectedClass, selectedStrand, sortBy]);

  // Group by priority
  const grouped = useMemo(() => {
    return groupCandidatesByPriority(filteredCandidates);
  }, [filteredCandidates]);

  const handleCreateMission = (studentId: string, objectives: string[]) => {
    const candidate = candidates.find((c) => c.student_id === studentId);
    if (!candidate) return;

    setCreatingMission({ candidate, objectives });
  };

  const handleConfirmMission = (title: string, deadline: string | null, notes: string) => {
    if (!creatingMission) return;

    const student = students.find((s) => s.id === creatingMission.candidate.student_id);
    if (!student || !student.curriculum_progress?.cambridge_objectives) {
      Logger.error("Student or objectives not found");
      return;
    }

    // Create the mission
    let mission = createMission(
      creatingMission.candidate.student_id,
      creatingMission.objectives,
      student.curriculum_progress.cambridge_objectives,
      title,
      deadline ?? undefined
    );

    // Add notes if provided
    if (notes.trim()) {
      mission = { ...mission, notes };
    }

    // Start the mission immediately
    mission = startMission(mission);

    // Add to student
    const updatedStudent = addMissionToStudent(student, mission);

    // Notify parent
    onStudentUpdate(updatedStudent);

    // Close dialog
    setCreatingMission(null);

    Logger.info(`Created mission: ${title}`, {
      student: `${student.first_name} ${student.last_name}`,
      objectives: creatingMission.objectives.length,
    });
  };

  const handleCancelMission = () => {
    setCreatingMission(null);
  };

  const PrioritySection: React.FC<{
    title: string;
    icon: string;
    candidates: StudentMissionCandidate[];
    color: string;
  }> = ({ title, icon, candidates: sectionCandidates, color }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (sectionCandidates.length === 0) return null;

    return (
      <div className="mb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg mb-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div className="text-left">
              <h3 className={`text-lg font-semibold ${color}`}>{title}</h3>
              <p className="text-sm text-gray-600">
                {sectionCandidates.length} student{sectionCandidates.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <svg
            className={`w-6 h-6 text-gray-500 transition-transform ${
              isExpanded ? "transform rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sectionCandidates.map((candidate) => (
              <StudentMissionCard
                key={candidate.student_id}
                candidate={candidate}
                onCreateMission={handleCreateMission}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Mission Creator</h2>
        <p className="text-gray-600">
          Create targeted missions for students to master unmastered Cambridge learning objectives
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">All Classes</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          {/* Strand Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Strand</label>
            <select
              value={selectedStrand}
              onChange={(e) => setSelectedStrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">All Strands</option>
              {strands.map((strand) => (
                <option key={strand} value={strand}>
                  {strand}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "points" | "name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="points">Missing Points</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-6 text-sm">
          <div>
            <span className="text-gray-600">Total Students: </span>
            <span className="font-semibold text-gray-900">{filteredCandidates.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Missing Points: </span>
            <span className="font-semibold text-red-600">
              {filteredCandidates.reduce((sum, c) => sum + c.missing_points, 0).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Priority Groups */}
      {filteredCandidates.length > 0 ? (
        <>
          <PrioritySection
            title="Critical (≥5 missing points)"
            icon="🔴"
            candidates={grouped.critical}
            color="text-red-600"
          />
          <PrioritySection
            title="Moderate (3-5 missing points)"
            icon="🟡"
            candidates={grouped.moderate}
            color="text-yellow-600"
          />
          <PrioritySection
            title="Minor (<3 missing points)"
            icon="🟢"
            candidates={grouped.minor}
            color="text-green-600"
          />
        </>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Students Need Missions</h3>
          <p className="text-gray-600">
            All students in the selected filters have mastered their assessed objectives!
          </p>
        </div>
      )}

      {/* Create Mission Dialog */}
      {creatingMission && (
        <CreateMissionDialog
          candidate={creatingMission.candidate}
          selectedObjectives={creatingMission.objectives}
          onConfirm={handleConfirmMission}
          onCancel={handleCancelMission}
        />
      )}
    </div>
  );
};

/**
 * My Missions Component
 * Main view for viewing and managing existing Cambridge objectives missions
 */

import React, { useState, useMemo } from "react";
import { StudentData } from "../../types/ProgressReportTypes";
import { CambridgeMission, MissionStatus } from "../../types/MissionTypes";
import { MissionCard } from "./MissionCard";
import { MissionDetails } from "./MissionDetails";
import { EditDeadlineDialog } from "./EditDeadlineDialog";
import {
  completeMission,
  cancelMission,
  updateMissionInStudent,
  isMissionOverdue,
} from "../../utils/missionUtils";
import { Logger } from "@websites/infrastructure/logging";

interface MyMissionsProps {
  students: StudentData[];
  onStudentUpdate: (student: StudentData) => void;
}

export const MyMissions: React.FC<MyMissionsProps> = ({ students, onStudentUpdate }) => {
  const [filterStatus, setFilterStatus] = useState<MissionStatus[]>(["in_progress"]);
  const [filterClass, setFilterClass] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"deadline" | "created" | "student">("deadline");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMission, setSelectedMission] = useState<{
    mission: CambridgeMission;
    student: StudentData;
  } | null>(null);
  const [editingDeadline, setEditingDeadline] = useState<{
    mission: CambridgeMission;
    student: StudentData;
  } | null>(null);

  // Get all missions with student info
  const allMissionsWithStudents = useMemo(() => {
    const missions: Array<{ mission: CambridgeMission; student: StudentData }> = [];

    students.forEach((student) => {
      if (student.cambridge_missions) {
        student.cambridge_missions.forEach((mission) => {
          missions.push({ mission, student });
        });
      }
    });

    return missions;
  }, [students]);

  // Get unique classes
  const classes = useMemo(() => {
    const classSet = new Set(students.map((s) => s.class_name));
    return Array.from(classSet).sort();
  }, [students]);

  // Filter missions
  const filteredMissions = useMemo(() => {
    let filtered = allMissionsWithStudents;

    // Filter by status
    if (filterStatus.length > 0) {
      filtered = filtered.filter(({ mission }) => filterStatus.includes(mission.status));
    }

    // Filter by class
    if (filterClass !== "all") {
      filtered = filtered.filter(({ student }) => student.class_name === filterClass);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(({ mission, student }) => {
        const studentName = `${student.first_name} ${student.last_name}`.toLowerCase();
        const missionTitle = mission.title.toLowerCase();
        return studentName.includes(query) || missionTitle.includes(query);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "deadline") {
        // Sort by deadline (missions with deadlines first, then by date)
        if (!a.mission.deadline && !b.mission.deadline) return 0;
        if (!a.mission.deadline) return 1;
        if (!b.mission.deadline) return -1;
        return a.mission.deadline.localeCompare(b.mission.deadline);
      } else if (sortBy === "created") {
        return b.mission.created_date.localeCompare(a.mission.created_date);
      } else {
        // student
        const nameA = `${a.student.last_name} ${a.student.first_name}`;
        const nameB = `${b.student.last_name} ${b.student.first_name}`;
        return nameA.localeCompare(nameB);
      }
    });

    return filtered;
  }, [allMissionsWithStudents, filterStatus, filterClass, searchQuery, sortBy]);

  // Count by status
  const statusCounts = useMemo(() => {
    const counts = {
      in_progress: 0,
      not_started: 0,
      completed: 0,
      cancelled: 0,
    };

    allMissionsWithStudents.forEach(({ mission }) => {
      counts[mission.status]++;
    });

    return counts;
  }, [allMissionsWithStudents]);

  const handleViewDetails = (mission: CambridgeMission, student: StudentData) => {
    setSelectedMission({ mission, student });
  };

  const handleEditDeadline = (mission: CambridgeMission, student: StudentData) => {
    setEditingDeadline({ mission, student });
  };

  const handleSaveDeadline = (newDeadline: string | null) => {
    if (!editingDeadline) return;

    const updatedMission = {
      ...editingDeadline.mission,
      deadline: newDeadline,
    };

    const updatedStudent = updateMissionInStudent(editingDeadline.student, updatedMission);
    onStudentUpdate(updatedStudent);
    setEditingDeadline(null);

    Logger.info("Updated mission deadline", {
      mission: updatedMission.title,
      deadline: newDeadline,
    });
  };

  const handleComplete = (mission: CambridgeMission, student: StudentData) => {
    const completedMission = completeMission(mission);
    const updatedStudent = updateMissionInStudent(student, completedMission);
    onStudentUpdate(updatedStudent);

    Logger.info("Completed mission", {
      mission: mission.title,
      student: `${student.first_name} ${student.last_name}`,
    });
  };

  const handleCancel = (mission: CambridgeMission, student: StudentData) => {
    if (!confirm(`Are you sure you want to cancel mission "${mission.title}"?`)) {
      return;
    }

    const cancelledMission = cancelMission(mission);
    const updatedStudent = updateMissionInStudent(student, cancelledMission);
    onStudentUpdate(updatedStudent);

    Logger.info("Cancelled mission", {
      mission: mission.title,
      student: `${student.first_name} ${student.last_name}`,
    });
  };

  const toggleStatusFilter = (status: MissionStatus) => {
    setFilterStatus((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  // Count overdue missions
  const overdueCount = useMemo(() => {
    return allMissionsWithStudents.filter(({ mission }) => isMissionOverdue(mission)).length;
  }, [allMissionsWithStudents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📚 My Missions</h2>
        <p className="text-gray-600">View and manage Cambridge learning objectives missions</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{statusCounts.in_progress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-600">{statusCounts.not_started}</div>
          <div className="text-sm text-gray-600">Not Started</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{allMissionsWithStudents.length}</div>
          <div className="text-sm text-gray-600">Total Missions</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        {/* Status Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleStatusFilter("in_progress")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus.includes("in_progress")
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🟡 In Progress ({statusCounts.in_progress})
            </button>
            <button
              onClick={() => toggleStatusFilter("not_started")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus.includes("not_started")
                  ? "bg-gray-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ⚪ Not Started ({statusCounts.not_started})
            </button>
            <button
              onClick={() => toggleStatusFilter("completed")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus.includes("completed")
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ✅ Completed ({statusCounts.completed})
            </button>
            <button
              onClick={() => toggleStatusFilter("cancelled")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus.includes("cancelled")
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ❌ Cancelled ({statusCounts.cancelled})
            </button>
          </div>
        </div>

        {/* Other Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
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

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "deadline" | "created" | "student")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="deadline">Deadline</option>
              <option value="created">Date Created</option>
              <option value="student">Student Name</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Student or mission name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredMissions.length} mission{filteredMissions.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Missions List */}
      {filteredMissions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMissions.map(({ mission, student }) => (
            <MissionCard
              key={`${student.id}-${mission.mission_id}`}
              mission={mission}
              studentName={`${student.first_name} ${student.last_name}`}
              onViewDetails={() => handleViewDetails(mission, student)}
              onEditDeadline={() => handleEditDeadline(mission, student)}
              onComplete={() => handleComplete(mission, student)}
              onCancel={() => handleCancel(mission, student)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Missions Found</h3>
          <p className="text-gray-600">
            {allMissionsWithStudents.length === 0
              ? "No missions have been created yet. Go to Mission Creator to create your first mission!"
              : "Try adjusting your filters to see more missions."}
          </p>
        </div>
      )}

      {/* Mission Details Modal */}
      {selectedMission && (
        <MissionDetails
          mission={selectedMission.mission}
          studentName={`${selectedMission.student.first_name} ${selectedMission.student.last_name}`}
          onClose={() => setSelectedMission(null)}
        />
      )}

      {/* Edit Deadline Dialog */}
      {editingDeadline && (
        <EditDeadlineDialog
          mission={editingDeadline.mission}
          onSave={handleSaveDeadline}
          onCancel={() => setEditingDeadline(null)}
        />
      )}
    </div>
  );
};

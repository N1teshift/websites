/**
 * Script to generate missions data from student assessments
 * Run: npx ts-node scripts/generateMissions.ts <input-file> <output-file>
 */

import * as fs from "fs";
import * as path from "path";

interface StudentData {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  assessments: Array<{
    column?: string;
    assessment_id?: string;
    score?: string;
    evaluation_details?: {
      percentage_score?: number | null;
    };
  }>;
}

interface ProgressReportData {
  metadata?: any;
  students: StudentData[];
  missions?: any[];
  [key: string]: any;
}

interface StudentMissionProgress {
  student_id: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assigned_date: string;
  missing_assessments?: string[];
  notes?: string;
}

interface Mission {
  mission_id: string;
  title: string;
  description: string;
  deadline: string;
  created_date: string;
  status: "active" | "completed" | "archived";
  check_type: "column" | "assessment-ids";
  assessment_column?: string;
  assessment_display_name?: string;
  assessment_ids?: string[];
  assessment_display_names?: string[];
  students_assigned: StudentMissionProgress[];
}

function findStudentsMissingKD2(students: StudentData[]): StudentMissionProgress[] {
  const today = new Date().toISOString().split("T")[0];
  const missingStudents: StudentMissionProgress[] = [];

  students.forEach((student) => {
    const kdAssessment = student.assessments.find((a) => a.column === "KD");

    // Check if missing or has empty/n score
    const isMissing =
      !kdAssessment ||
      kdAssessment.score === "" ||
      kdAssessment.score === "n" ||
      !kdAssessment.score;

    if (isMissing) {
      missingStudents.push({
        student_id: student.id,
        status: "pending",
        assigned_date: today,
        notes: "",
      });
    }
  });

  return missingStudents;
}

function findStudentsMissingSDTests(students: StudentData[]): StudentMissionProgress[] {
  const today = new Date().toISOString().split("T")[0];
  const missingStudents: StudentMissionProgress[] = [];

  const sdTestIds = [
    "test-u1s1-irrational-numbers",
    "test-u1s2-standard-form",
    "test-u1s3-indices",
  ];
  const sdTestNames = ["SD1", "SD2", "SD3"];

  students.forEach((student) => {
    const missingTests: string[] = [];

    sdTestIds.forEach((testId, index) => {
      const assessment = student.assessments.find((a) => a.assessment_id === testId);
      const percentageScore = assessment?.evaluation_details?.percentage_score;

      if (!assessment || percentageScore === null || percentageScore === undefined) {
        missingTests.push(sdTestNames[index]);
      }
    });

    if (missingTests.length > 0) {
      missingStudents.push({
        student_id: student.id,
        status: "pending",
        assigned_date: today,
        missing_assessments: missingTests,
        notes: "",
      });
    }
  });

  return missingStudents;
}

function generateMissions(data: ProgressReportData): Mission[] {
  const today = new Date().toISOString().split("T")[0];

  const missions: Mission[] = [
    {
      mission_id: "kd2-missing-data",
      title: "KD2 Test Completion",
      description: "Students with blank KD2 data must complete this test",
      deadline: "2025-10-31",
      created_date: today,
      status: "active",
      check_type: "column",
      assessment_column: "KD",
      assessment_display_name: "KD2",
      students_assigned: findStudentsMissingKD2(data.students),
    },
    {
      mission_id: "sd-tests-missing",
      title: "SD1, SD2, SD3 Tests Completion",
      description:
        "Students must complete all three subunit tests (SD1, SD2, SD3) for grade calculation",
      deadline: "2025-11-07",
      created_date: today,
      status: "active",
      check_type: "assessment-ids",
      assessment_ids: [
        "test-u1s1-irrational-numbers",
        "test-u1s2-standard-form",
        "test-u1s3-indices",
      ],
      assessment_display_names: ["SD1", "SD2", "SD3"],
      students_assigned: findStudentsMissingSDTests(data.students),
    },
  ];

  return missions;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error("Usage: npx ts-node scripts/generateMissions.ts <input-file> [output-file]");
    console.error(
      "Example: npx ts-node scripts/generateMissions.ts master_student_data_v4_45.json master_student_data_v4_46.json"
    );
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1] || inputFile.replace(".json", "_with_missions.json");

  console.log(`Reading from: ${inputFile}`);

  // Read input file
  const rawData = fs.readFileSync(inputFile, "utf-8");
  const data: ProgressReportData = JSON.parse(rawData);

  console.log(`Found ${data.students.length} students`);

  // Generate missions
  const missions = generateMissions(data);

  console.log("\n=== Mission Summary ===");
  missions.forEach((mission) => {
    console.log(`\n${mission.title}:`);
    console.log(`  Deadline: ${mission.deadline}`);
    console.log(`  Students assigned: ${mission.students_assigned.length}`);

    if (mission.students_assigned.length > 0 && mission.students_assigned.length <= 10) {
      mission.students_assigned.forEach((sp) => {
        const student = data.students.find((s) => s.id === sp.student_id);
        if (student) {
          const missing = sp.missing_assessments
            ? ` (Missing: ${sp.missing_assessments.join(", ")})`
            : "";
          console.log(`    - ${student.first_name} ${student.last_name}${missing}`);
        }
      });
    }
  });

  // Add missions to data
  data.missions = missions;

  // Write output file
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), "utf-8");

  console.log(`\n✅ Written to: ${outputFile}`);
  console.log(`\nMissions generated successfully!`);
}

main();

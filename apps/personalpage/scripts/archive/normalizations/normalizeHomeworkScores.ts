import * as fs from "fs";
import * as path from "path";

interface Assessment {
  date: string;
  column: string;
  type: string;
  task_name: string;
  score: string;
  comment: string;
  added: string;
  assessment_id: string;
  assessment_title: string;
  evaluation_details?: {
    percentage_score?: number | null;
    myp_score?: number | null;
    cambridge_score?: number | null;
  };
  updated?: string;
}

interface StudentData {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  assessments?: Assessment[];
  [key: string]: any;
}

interface MasterData {
  metadata: {
    exported_at: string;
    schema_version: string;
    total_students: number;
    export_version: string;
    teacher_type: string;
    teacher_name: string;
  };
  students: StudentData[];
}

// Normalize homework score from decimal string to integer string
function normalizeHomeworkScore(score: string): string {
  // If it's already in the correct format (just "0" or "1"), return as-is
  if (score === "0" || score === "1" || score === "") {
    return score;
  }

  // Parse the score and convert to integer string
  const numValue = parseFloat(score);

  // Handle NaN case
  if (isNaN(numValue)) {
    return score; // Keep original if not a valid number
  }

  // Convert to integer string (0.0 → "0", 1.0 → "1")
  return Math.round(numValue).toString();
}

function normalizeHomeworkScores(inputFile: string, outputFile: string): void {
  console.log(`📖 Reading file: ${inputFile}`);

  // Read the JSON file
  const fileContent = fs.readFileSync(inputFile, "utf-8");
  const data: MasterData = JSON.parse(fileContent);

  console.log(`✅ Loaded data with ${data.students.length} students`);

  let totalScoresNormalized = 0;
  const normalizedColumns = new Set<string>();

  // Process each student
  data.students.forEach((student) => {
    if (!student.assessments) return;

    student.assessments.forEach((assessment) => {
      // Only process homework-type assessments
      if (assessment.type === "homework" && assessment.score) {
        const originalScore = assessment.score;
        const normalizedScore = normalizeHomeworkScore(originalScore);

        if (originalScore !== normalizedScore) {
          assessment.score = normalizedScore;
          totalScoresNormalized++;
          normalizedColumns.add(assessment.column);

          // Update the timestamp
          assessment.updated = new Date().toISOString();
        }
      }
    });
  });

  console.log(`\n📊 Normalization Summary:`);
  console.log(`   Total scores normalized: ${totalScoresNormalized}`);
  console.log(`   Columns affected: ${Array.from(normalizedColumns).sort().join(", ")}`);

  // Update metadata
  data.metadata.exported_at = new Date().toISOString();

  // Write to output file
  console.log(`\n💾 Writing normalized data to: ${outputFile}`);
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), "utf-8");

  console.log(`✅ Successfully normalized homework scores!`);
}

// Main execution
const inputFile = process.argv[2] || "master_student_data_v4_46.json";
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const backupFile = `master_student_data_v4_46_backup_normalize_${timestamp}.json`;
const outputFile = inputFile; // Overwrite the original file

// Create backup first
console.log("🔄 Starting homework score normalization process...\n");
console.log(`📦 Creating backup: ${backupFile}`);
fs.copyFileSync(inputFile, backupFile);
console.log("✅ Backup created successfully\n");

// Run normalization
try {
  normalizeHomeworkScores(inputFile, outputFile);
  console.log("\n✨ All done! Your homework scores are now normalized.");
  console.log(`📦 Backup available at: ${backupFile}`);
} catch (error) {
  console.error("❌ Error during normalization:", error);
  process.exit(1);
}

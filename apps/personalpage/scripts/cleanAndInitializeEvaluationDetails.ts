import * as fs from "fs";
import * as path from "path";

interface EvaluationDetails {
  percentage_score: number | null;
  myp_score: number | null;
  cambridge_score: number | null;
}

interface Assessment {
  date: string;
  column: string;
  type: string;
  task_name: string;
  score: string;
  comment: string;
  added: string;
  updated?: string;
  evaluation_details?: EvaluationDetails;
  assessment_id?: string | null;
  assessment_title?: string | null;
}

interface Student {
  first_name: string;
  last_name: string;
  assessments: Assessment[];
  [key: string]: unknown;
}

interface DatabaseData {
  snapshot_metadata: unknown;
  original_metadata: unknown;
  students: Student[];
}

const INPUT_FILE = "master_student_data_v4_41.json";
const OUTPUT_FILE = "master_student_data_v4_42.json";

console.log("Starting evaluation_details cleanup and initialization...\n");

// Read the database
const filePath = path.join(process.cwd(), INPUT_FILE);
const rawData = fs.readFileSync(filePath, "utf-8");
const data: DatabaseData = JSON.parse(rawData);

let totalAssessments = 0;
let assessmentsWithEvalDetails = 0;
let assessmentsInitialized = 0;
let kd1MypNullified = 0;
let kd1cNullified = 0;
let kd2MypNullified = 0;
let kd2cNullified = 0;

// Process each student
data.students.forEach((student) => {
  student.assessments.forEach((assessment) => {
    totalAssessments++;

    // Check if this is a test or summative (types that should have evaluation_details)
    const needsEvalDetails = assessment.type === "test" || assessment.type === "summative";

    if (needsEvalDetails) {
      // Initialize evaluation_details if it doesn't exist
      if (!assessment.evaluation_details) {
        assessment.evaluation_details = {
          percentage_score: null,
          myp_score: null,
          cambridge_score: null,
        };
        assessmentsInitialized++;
      } else {
        assessmentsWithEvalDetails++;

        // Ensure all fields exist
        if (assessment.evaluation_details.percentage_score === undefined) {
          assessment.evaluation_details.percentage_score = null;
        }
        if (assessment.evaluation_details.myp_score === undefined) {
          assessment.evaluation_details.myp_score = null;
        }
        if (assessment.evaluation_details.cambridge_score === undefined) {
          assessment.evaluation_details.cambridge_score = null;
        }
      }

      // Nullify KD1 and KD2 MYP/Cambridge scores as requested
      if (assessment.assessment_id === "summative-cambridge-unit1") {
        // KD1MYP and KD1C
        if (assessment.evaluation_details.myp_score !== null) {
          assessment.evaluation_details.myp_score = null;
          kd1MypNullified++;
        }
        if (assessment.evaluation_details.cambridge_score !== null) {
          assessment.evaluation_details.cambridge_score = null;
          kd1cNullified++;
        }
      } else if (assessment.assessment_id === "summative-cambridge-unit2") {
        // KD2MYP and KD2C
        if (assessment.evaluation_details.myp_score !== null) {
          assessment.evaluation_details.myp_score = null;
          kd2MypNullified++;
        }
        if (assessment.evaluation_details.cambridge_score !== null) {
          assessment.evaluation_details.cambridge_score = null;
          kd2cNullified++;
        }
      }
    }
  });
});

// Save the updated data
const outputPath = path.join(process.cwd(), OUTPUT_FILE);
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");

console.log("✅ Cleanup and initialization complete!\n");
console.log("Statistics:");
console.log(`  Total assessments processed: ${totalAssessments}`);
console.log(`  Assessments with existing evaluation_details: ${assessmentsWithEvalDetails}`);
console.log(`  Assessments initialized with evaluation_details: ${assessmentsInitialized}`);
console.log(`\nNullified scores:`);
console.log(`  KD1MYP scores nullified: ${kd1MypNullified}`);
console.log(`  KD1C scores nullified: ${kd1cNullified}`);
console.log(`  KD2MYP scores nullified: ${kd2MypNullified}`);
console.log(`  KD2C scores nullified: ${kd2cNullified}`);
console.log(`\n📁 Output saved to: ${OUTPUT_FILE}`);

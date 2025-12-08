import { useMemo } from "react";
import { StudentData } from "../types/ProgressReportTypes";
import { CommentTemplate } from "../types/CommentTemplateTypes";
import {
  extractMathTestData,
  extractEnglishDiagnosticData,
  extractEnglishUnit1Data,
  MathTestData,
  EnglishDiagnosticData,
  EnglishUnit1Data,
} from "../utils/comments/commentDataExtractors";
import { generateMathComment, GeneratedComment } from "../utils/comments/mathCommentGenerator";
import {
  generateEnglishDiagnosticComment,
  generateEnglishUnit1Comment,
} from "../utils/comments/englishCommentGenerator";

export interface StudentCommentData {
  student: StudentData;
  mathData: MathTestData;
  diagnosticData: EnglishDiagnosticData;
  unit1Data: EnglishUnit1Data;
  hasAllData: boolean;
  missingFields: string[];
}

/**
 * Hook to extract and process student comment data
 */
export function useStudentCommentData(
  students: StudentData[],
  activeTemplateId: string
): {
  studentCommentData: StudentCommentData[];
  studentsWithMissingData: StudentCommentData[];
} {
  const studentCommentData = useMemo((): StudentCommentData[] => {
    return students.map((student) => {
      // Extract all data types
      const mathData = extractMathTestData(student.assessments);
      const diagnosticData = extractEnglishDiagnosticData(student.assessments);
      const unit1Data = extractEnglishUnit1Data(student.assessments);

      // Check which dataset is complete based on active template
      const mathValues = [
        mathData.sd1p,
        mathData.sd1myp,
        mathData.sd1c1,
        mathData.sd1c2,
        mathData.sd2p,
        mathData.sd2myp,
        mathData.sd2c,
        mathData.sd3p,
        mathData.sd3myp,
        mathData.sd3c,
      ];
      const d1Values = [
        diagnosticData.d1Paper1Percent,
        diagnosticData.d1Paper2Percent,
        diagnosticData.d1Paper3Percent,
        diagnosticData.d1TotalPercent,
      ];
      const t1Values = [
        unit1Data.t1Lis,
        unit1Data.t1Read,
        unit1Data.t1Voc,
        unit1Data.t1Gr,
        unit1Data.t1TotalScore,
        unit1Data.t1TotalPercent,
      ];

      // Determine if student has all required data based on template type
      let hasAllData = false;
      if (activeTemplateId === "english-diagnostic-1") {
        hasAllData = d1Values.every((v) => v !== null);
      } else if (activeTemplateId === "english-unit-1") {
        hasAllData = t1Values.every((v) => v !== null);
      } else {
        hasAllData = mathValues.every((v) => v !== null);
      }

      // Build missing fields list (for display purposes)
      const missingFields: string[] = [];
      if (activeTemplateId === "default-unit1") {
        if (mathData.sd1p === null) missingFields.push("SD1P");
        if (mathData.sd1myp === null) missingFields.push("SD1MYP");
        if (mathData.sd1c1 === null) missingFields.push("SD1C1");
        if (mathData.sd1c2 === null) missingFields.push("SD1C2");
        if (mathData.sd2p === null) missingFields.push("SD2P");
        if (mathData.sd2myp === null) missingFields.push("SD2MYP");
        if (mathData.sd2c === null) missingFields.push("SD2C");
        if (mathData.sd3p === null) missingFields.push("SD3P");
        if (mathData.sd3myp === null) missingFields.push("SD3MYP");
        if (mathData.sd3c === null) missingFields.push("SD3C");
      } else if (activeTemplateId === "english-diagnostic-1") {
        if (diagnosticData.d1Paper1Percent === null) missingFields.push("D1 Paper1%");
        if (diagnosticData.d1Paper2Percent === null) missingFields.push("D1 Paper2%");
        if (diagnosticData.d1Paper3Percent === null) missingFields.push("D1 Paper3%");
        if (diagnosticData.d1TotalPercent === null) missingFields.push("D1 Total%");
      } else if (activeTemplateId === "english-unit-1") {
        if (unit1Data.t1Lis === null) missingFields.push("T1 Listening");
        if (unit1Data.t1Read === null) missingFields.push("T1 Reading");
        if (unit1Data.t1Voc === null) missingFields.push("T1 Vocabulary");
        if (unit1Data.t1Gr === null) missingFields.push("T1 Grammar");
        if (unit1Data.t1TotalScore === null) missingFields.push("T1 Total");
        if (unit1Data.t1TotalPercent === null) missingFields.push("T1 %");
      }

      return {
        student,
        mathData,
        diagnosticData,
        unit1Data,
        hasAllData,
        missingFields,
      };
    });
  }, [students, activeTemplateId]);

  const studentsWithMissingData = useMemo(() => {
    return studentCommentData.filter((data) => !data.hasAllData);
  }, [studentCommentData]);

  return { studentCommentData, studentsWithMissingData };
}

/**
 * Hook to generate comments from student data
 */
export function useGeneratedComments(
  studentCommentData: StudentCommentData[],
  activeTemplate: CommentTemplate,
  regenerateKey: number
): GeneratedComment[] {
  return useMemo((): GeneratedComment[] => {
    return studentCommentData
      .filter((data) => data.hasAllData)
      .map((data) => {
        // Generate comment based on template type
        if (activeTemplate.id === "english-diagnostic-1") {
          return generateEnglishDiagnosticComment(
            data.student,
            data.diagnosticData,
            activeTemplate
          );
        } else if (activeTemplate.id === "english-unit-1") {
          return generateEnglishUnit1Comment(data.student, data.unit1Data, activeTemplate);
        } else {
          return generateMathComment(data.student, data.mathData, activeTemplate);
        }
      })
      .filter((comment): comment is GeneratedComment => comment !== null)
      .sort((a, b) => {
        // Sort by last name first, then by first name
        const lastNameCompare = a.student.last_name.localeCompare(b.student.last_name);
        if (lastNameCompare !== 0) return lastNameCompare;
        return a.student.first_name.localeCompare(b.student.first_name);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentCommentData, activeTemplate, regenerateKey]);
}

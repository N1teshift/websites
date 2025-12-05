import ExcelJS from 'exceljs';
import { UnitPlanData, AssessmentTask, ATLCard } from '../../../unitPlanGenerator/types/UnitPlanTypes';
import { formatArrayAsString, formatArrayAsNewlines, formatATLSkillsAsNewlines, formatAcademicYear, formatCommandTermsAsString } from './ExcelFormattingUtils';
import { getEnglishSubjectName } from '../../../unitPlanGenerator/utils/subjectTranslationUtils';
import { getStrandByFullId, getObjectiveById } from '../../../unitPlanGenerator/data/objectives';

/**
 * Format objectives/strands for Excel display
 */
function formatObjectivesForExcel(objectives: string[]): string {
  if (!objectives || objectives.length === 0) {
    return 'Not specified';
  }

  // Group strands by objective
  const objectiveGroups: Record<string, string[]> = {};
  
  objectives.forEach(strandId => {
    const strand = getStrandByFullId(strandId);
    if (strand) {
      const objectiveId = strand.objectiveId;
      if (!objectiveGroups[objectiveId]) {
        objectiveGroups[objectiveId] = [];
      }
      objectiveGroups[objectiveId].push(strandId);
    }
  });

  // Format each objective group
  const formattedObjectives: string[] = [];
  
  Object.keys(objectiveGroups).sort().forEach(objectiveId => {
    const objective = getObjectiveById(objectiveId);
    if (objective) {
      formattedObjectives.push(`${objective.name}:`);
      
      // Add each strand for this objective
      objectiveGroups[objectiveId].forEach(strandId => {
        const strand = getStrandByFullId(strandId);
        if (strand) {
          formattedObjectives.push(`  ${strand.id}. ${strand.description}`);
        }
      });
      
      // Add a blank line between objectives
      formattedObjectives.push('');
    }
  });

  return formattedObjectives.join('\n');
}

/**
 * Format assessment tasks for Excel display
 */
function formatAssessmentTasksForExcel(tasks: AssessmentTask[]): string {
  if (!tasks || tasks.length === 0) {
    return 'No assessment tasks specified';
  }

  return tasks.map((task, index) => {
    let strandDescription = task.criterionID;
    
    // Try to get strand description
    const strand = getStrandByFullId(task.criterionID);
    if (strand) {
      strandDescription = strand.description;
    } else {
      // If it's a main objective ID (like "A", "B", etc.), get the objective name
      const objective = getObjectiveById(task.criterionID);
      if (objective) {
        strandDescription = objective.name;
      }
    }
    
    return `TASK ${index + 1}: ${task.taskTitle}\n` +
           `${task.taskDescription}\n` +
           `${task.criterionID}. ${strandDescription}\n` +
           `${task.criterionDescription}`;
  }).join('\n\n');
}

/**
 * Format ATL cards for Excel display
 */
function formatATLCardsForExcel(cards: ATLCard[]): string {
  if (!cards || cards.length === 0) {
    return 'No ATL cards specified';
  }

  return cards.map((card, _index) => {
    return `Category Cluster: ${card.categoryCluster}\n` +
           `ATL Support: ${card.atlSupport}\n` +
           `Strategy Name: ${card.atlStrategyName}\n` +
           `Strategy Description: ${card.atlStrategyDescription}`;
  }).join('\n\n');
}

export const applyKMMMYPUnitFormatting = async (worksheet: ExcelJS.Worksheet, unitPlan: UnitPlanData, workbook?: ExcelJS.Workbook) => {
    // Define header font styles
    const mainHeaderStyle = {
        font: { 
            name: 'Calibri', 
            size: 14, 
            bold: true, 
            color: { argb: 'FFFFFFFF' } 
        },
        alignment: { 
            vertical: 'middle', 
            horizontal: 'center' 
        }
    };

    const subHeaderStyle = {
        font: { 
            name: 'Calibri', 
            size: 12, 
            bold: true, 
            italic: true,
            color: { argb: 'FF000000' } 
        },
        alignment: { 
            vertical: 'middle', 
            horizontal: 'center' 
        }
    };

    const contentCellStyle = {
        font: { 
            name: 'Calibri', 
            size: 12, 
            color: { argb: 'FF000000' } 
        },
        alignment: { 
            vertical: 'top', 
            horizontal: 'left',
            wrapText: true 
        }
    };

    // Unified styles for header labels and values
    const headerLabelStyle = {
        font: { 
            name: 'Calibri', 
            size: 12, 
            bold: true, 
            color: { argb: 'FF000000' } 
        },
        alignment: { 
            vertical: 'middle', 
            horizontal: 'right' 
        }
    };

    const headerValueStyle = {
        font: { 
            name: 'Calibri', 
            size: 12, 
            bold: true, 
            color: { argb: 'FF000000' } 
        },
        alignment: { 
            vertical: 'middle', 
            horizontal: 'left' 
        }
    };



    // Set row heights
    worksheet.getRow(2).height = 20.0;
    worksheet.getRow(4).height = 16.0;
    worksheet.getRow(6).height = 16.0;
    worksheet.getRow(7).height = 16.0;
    worksheet.getRow(8).height = 16.0;
    worksheet.getRow(9).height = 16.0;
    worksheet.getRow(10).height = 16.0;
    worksheet.getRow(11).height = 16.0;
    worksheet.getRow(12).height = 16.0;
    worksheet.getRow(13).height = 6.0;
    worksheet.getRow(14).height = 30.0;
    worksheet.getRow(15).height = 6.0;
    worksheet.getRow(16).height = 30.0;
    worksheet.getRow(17).height = 45.0;
    worksheet.getRow(18).height = 45.0;
    worksheet.getRow(19).height = 45.0;
    worksheet.getRow(20).height = 30.0;
    worksheet.getRow(21).height = 15.0;
    worksheet.getRow(22).height = 120.0;
    worksheet.getRow(23).height = 30.0;
    worksheet.getRow(24).height = 15.0;
    worksheet.getRow(25).height = 120.0;
    worksheet.getRow(26).height = 30.0;
    worksheet.getRow(27).height = 120.0;
    worksheet.getRow(28).height = 150.0;
    worksheet.getRow(29).height = 60.0;
    worksheet.getRow(30).height = 300.0;
    worksheet.getRow(31).height = 30.0;
    worksheet.getRow(32).height = 6.0;
    worksheet.getRow(33).height = 30.0;
    worksheet.getRow(34).height = 15.0;
    worksheet.getRow(35).height = 60;

    // Apply background colors to specific cell ranges
    // Color A1 to G5 with white
    for (let row = 1; row <= 5; row++) {
        for (let col = 1; col <= 7; col++) { // A=1, G=7
            const cell = worksheet.getCell(row, col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFFFF' }
            };
        }
    }

    // Color A1 to A34 with white
    for (let row = 1; row <= 34; row++) {
        const cell = worksheet.getCell(row, 1); // A=1
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' }
        };
    }
    
    // Color A35 to A{endRow} with white (dynamic rows area)
    const lastLessonRow = 35 + (unitPlan.subunits?.length || 0) - 1;
    const instructionsRow = lastLessonRow + 2;
    const reflectionValuesRow = instructionsRow + 6; // Instructions + 3 (reflection title) + 1 (reflection subheaders) + 1 (reflection values)
    const endRow = reflectionValuesRow;
    for (let row = 35; row <= endRow; row++) {
        const cell = worksheet.getCell(row, 1); // A=1
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' }
        };
    }
    
    // Color B13:G13 with white
    for (let col = 2; col <= 7; col++) { // B=2, G=7
        const cell = worksheet.getCell(13, col);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' }
        };
    }
    
    // Color B15:G15 with white
    for (let col = 2; col <= 7; col++) { // B=2, G=7
        const cell = worksheet.getCell(15, col);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' }
        };
    }
    
    // Color B32:S32 with white
    for (let col = 2; col <= 19; col++) { // B=2, S=19
        const cell = worksheet.getCell(32, col);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' }
        };
    }
    
    // Add borders to G27, G28, G29
    const gCellsWithBorders = ['G27', 'G28', 'G29'];
    gCellsWithBorders.forEach(cellAddress => {
        const cell = worksheet.getCell(cellAddress);
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    
    // Paint H1:Z30 with white
    for (let row = 1; row <= 30; row++) {
        for (let col = 8; col <= 26; col++) { // H=8, Z=26
            const cell = worksheet.getCell(row, col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFFFF' }
            };
        }
    }
    
    // Paint T31:Z34 with white (static part)
    for (let row = 31; row <= 34; row++) {
        for (let col = 20; col <= 26; col++) { // T=20, Z=26
            const cell = worksheet.getCell(row, col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFFFF' }
            };
        }
    }

    // Color B6 to G12 with #00264C
    for (let row = 6; row <= 12; row++) {
        for (let col = 2; col <= 7; col++) { // B=2, G=7
            const cell = worksheet.getCell(row, col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF00264C' }
            };
        }
    }

    // Make C7-D7, C9-D9, C11-D11, E8-F8, E10-F10 white
    const whiteCells = [
        { row: 7, col: 3 }, { row: 7, col: 4 }, // C7, D7
        { row: 8, col: 5 }, { row: 8, col: 6 }, // E8, F8
        { row: 9, col: 3 }, { row: 9, col: 4 }, // C9, D9
        { row: 10, col: 5 }, { row: 10, col: 6 }, // E10, F10
        { row: 11, col: 3 }, { row: 11, col: 4 } // C11, D11
    ];

    whiteCells.forEach(({ row, col }) => {
        const cell = worksheet.getCell(row, col);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' }
        };
    });

    // Add teacher/subject/MYP year information
    // C7: TEACHER(S):
    const teacherLabel = worksheet.getCell(7, 3); // C7
    teacherLabel.value = 'TEACHER(S):';
    Object.assign(teacherLabel, headerLabelStyle);

    // D7: Teacher names (array as comma-separated)
    const teacherNames = worksheet.getCell(7, 4); // D7
    teacherNames.value = formatArrayAsString(unitPlan.contributingTeachers);
    Object.assign(teacherNames, headerValueStyle);

    // C9: SUBJECT:
    const subjectLabel = worksheet.getCell(9, 3); // C9
    subjectLabel.value = 'SUBJECT:';
    Object.assign(subjectLabel, headerLabelStyle);

    // D9: Subject
    const subjectValue = worksheet.getCell(9, 4); // D9
    subjectValue.value = getEnglishSubjectName(unitPlan.subject);
    Object.assign(subjectValue, headerValueStyle);

    // C11: MYP YEAR:
    const mypYearLabel = worksheet.getCell(11, 3); // C11
    mypYearLabel.value = 'MYP YEAR:';
    Object.assign(mypYearLabel, headerLabelStyle);

    // D11: MYP Year
    const mypYearValue = worksheet.getCell(11, 4); // D11
    mypYearValue.value = unitPlan.mypYear;
    Object.assign(mypYearValue, headerValueStyle);

    // E8: UNIT TITLE:
    const unitTitleLabel = worksheet.getCell(8, 5); // E8
    unitTitleLabel.value = 'UNIT TITLE:';
    Object.assign(unitTitleLabel, headerLabelStyle);

    // F8: Unit Title
    const unitTitleValue = worksheet.getCell(8, 6); // F8
    unitTitleValue.value = unitPlan.unitTitle;
    Object.assign(unitTitleValue, headerValueStyle);

    // E10: LESSONS/HOURS:
    const lessonsLabel = worksheet.getCell(10, 5); // E10
    lessonsLabel.value = 'LESSONS/HOURS:';
    Object.assign(lessonsLabel, headerLabelStyle);

    // F10: Lessons Count
    const lessonsValue = worksheet.getCell(10, 6); // F10
    lessonsValue.value = unitPlan.lessonCount;
    Object.assign(lessonsValue, headerValueStyle);

    // Color B14 to G14 with #00264C
    for (let col = 2; col <= 7; col++) { // B=2, G=7
        const cell = worksheet.getCell(14, col);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00264C' }
        };
    }

    // Color B16 to G16 with #00264C
    for (let col = 2; col <= 7; col++) { // B=2, G=7
        const cell = worksheet.getCell(16, col);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00264C' }
        };
    }

    // Color B20 to G20 with #00264C
    for (let col = 2; col <= 7; col++) { // B=2, G=7
        const cell = worksheet.getCell(20, col);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00264C' }
        };
    }

    // Make B17 white
    worksheet.getCell(17, 2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFFFF' }
    };

    // Make B19 dark blue
    worksheet.getCell(19, 2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF00264C' }
    };

    // Make D18 white
    worksheet.getCell(18, 4).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFFFF' }
    };

    // Make B23 dark blue
    worksheet.getCell(23, 2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF00264C' }
    };

    // Color B26 to F26 with #00264C
    for (let col = 2; col <= 6; col++) { // B=2, F=6
        const cell = worksheet.getCell(26, col);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00264C' }
        };
    }

    // Color B16 with #00264C (B17 is already set to white above)
    worksheet.getCell(16, 2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF00264C' }
    };

    // Color B18 to G18 with #00264C (except D18 which is white)
    for (let col = 2; col <= 7; col++) { // B=2, G=7
        if (col !== 4) { // Skip D=4 (D18) as it's already set to white above
            const cell = worksheet.getCell(18, col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF00264C' }
            };
        }
    }

    // Color B21 to G21 with #00264C
    for (let col = 2; col <= 7; col++) { // B=2, G=7
        const cell = worksheet.getCell(21, col);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00264C' }
        };
    }

    // Color B24 to G24 with #00264C
    for (let col = 2; col <= 7; col++) { // B=2, G=7
        const cell = worksheet.getCell(24, col);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00264C' }
        };
    }

    // Color B31 to G31 with #00264C
    for (let col = 2; col <= 7; col++) { // B=2, G=7
        const cell = worksheet.getCell(31, col);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00264C' }
        };
    }

    // Color H31 with #00264C
    worksheet.getCell(31, 8).fill = { // H=8
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF00264C' }
    };

    // Additional background colors
    // Color D21 to F21 with #DDEBF7
    for (let col = 4; col <= 6; col++) { // D=4, F=6
        const cell = worksheet.getCell(21, col);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDDEBF7' }
        };
    }

    // Color D24 to F24 with #DDEBF7
    for (let col = 4; col <= 6; col++) { // D=4, F=6
        const cell = worksheet.getCell(24, col);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDDEBF7' }
        };
    }

    // Color H34 to P34 with #DDEBF7
    for (let col = 8; col <= 16; col++) { // H=8, P=16
        const cell = worksheet.getCell(34, col);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDDEBF7' }
        };
    }

    // Color B14 with #996633
    worksheet.getCell(14, 2).fill = { // B=2
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF996633' }
    };

    // Color B31 to S31 with #996633
    for (let col = 2; col <= 19; col++) { // B=2, S=19
        const cell = worksheet.getCell(31, col);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF996633' }
        };
    }

    // Color B21 to C22 with #DAE1F2
    for (let row = 21; row <= 22; row++) {
        for (let col = 2; col <= 3; col++) { // B=2, C=3
            const cell = worksheet.getCell(row, col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDAE1F2' }
            };
        }
    }

    // Color B24 to C25 with #DAE1F2
    for (let row = 24; row <= 25; row++) {
        for (let col = 2; col <= 3; col++) { // B=2, C=3
            const cell = worksheet.getCell(row, col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDAE1F2' }
            };
        }
    }

    // Color G21 to G22 with #DAE1F2
    for (let row = 21; row <= 22; row++) {
        const cell = worksheet.getCell(row, 7); // G=7
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDAE1F2' }
        };
    }

    // Color G24 to G25 with #DAE1F2
    for (let row = 24; row <= 25; row++) {
        const cell = worksheet.getCell(row, 7); // G=7
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDAE1F2' }
        };
    }

    // Color F27 to F30 with #DAE1F2
    for (let row = 27; row <= 30; row++) {
        const cell = worksheet.getCell(row, 6); // F=6
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDAE1F2' }
        };
    }

    // Color G30 with #DAE1F2
    worksheet.getCell(30, 7).fill = { // G=7
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDAE1F2' }
    };

    // Set up the KMM MYP Unit form structure
    // D2: School Name
    const schoolCell = worksheet.getCell('D2');
    schoolCell.value = unitPlan.schoolName;
    schoolCell.font = { 
        name: 'Times New Roman', 
        size: 14, 
        bold: true,
        color: { argb: 'FF000000' } 
    };
    schoolCell.alignment = { 
        vertical: 'middle', 
        horizontal: 'center' 
    };

    // D4: Academic Year with special formatting
    const academicYearCell = worksheet.getCell('D4');
    academicYearCell.value = formatAcademicYear(unitPlan.academicYear);
    academicYearCell.font = { 
        name: 'Times New Roman', 
        size: 12, 
        color: { argb: 'FF000000' } 
    };
    academicYearCell.alignment = { 
        vertical: 'middle', 
        horizontal: 'center' 
    };

    // B14-G14: Inquiry header
    worksheet.mergeCells('B14:G14');
    const inquiryHeader = worksheet.getCell('B14');
    inquiryHeader.value = 'Inquiry: Establishing the purpose of the unit';
    Object.assign(inquiryHeader, mainHeaderStyle);

    // B16-C16: Specified Concept(s) header
    worksheet.mergeCells('B16:C16');
    const specifiedConceptsHeader = worksheet.getCell('B16');
    specifiedConceptsHeader.value = 'Specified Concept(s)';
    Object.assign(specifiedConceptsHeader, mainHeaderStyle);

    // D16: Conceptual Understandings header
    const conceptualHeader = worksheet.getCell('D16');
    conceptualHeader.value = 'Conceptual Understandings';
    Object.assign(conceptualHeader, mainHeaderStyle);

    // E16-F16: Enhanced Global Context header
    worksheet.mergeCells('E16:F16');
    const globalContextHeader = worksheet.getCell('E16');
    globalContextHeader.value = 'Enhanced Global Context';
    Object.assign(globalContextHeader, mainHeaderStyle);

    // G16: Global Context Explanation header
    const globalExplanationHeader = worksheet.getCell('G16');
    globalExplanationHeader.value = 'Global Context Explanation and/or Exploration';
    globalExplanationHeader.font = { 
        name: 'Calibri', 
        size: 11, 
        bold: true, 
        color: { argb: 'FFFFFFFF' } 
    };
    globalExplanationHeader.alignment = { 
        vertical: 'middle', 
        horizontal: 'center' 
    };

    // B17-C17: Specified Concepts (array as comma-separated)
    worksheet.mergeCells('B17:C17');
    const specifiedConceptsCell = worksheet.getCell('B17');
    specifiedConceptsCell.value = formatArrayAsString(unitPlan.specifiedConcepts);
    Object.assign(specifiedConceptsCell, contentCellStyle);

    // D17: Conceptual Understandings
    const conceptualCell = worksheet.getCell('D17');
    conceptualCell.value = unitPlan.conceptualUnderstandings;
    Object.assign(conceptualCell, contentCellStyle);

    // E17-F17: Enhanced Global Context
    worksheet.mergeCells('E17:F17');
    const globalContextCell = worksheet.getCell('E17');
    globalContextCell.value = unitPlan.globalContext;
    Object.assign(globalContextCell, contentCellStyle);

    // G17: Global Context Explanation
    const globalExplanationCell = worksheet.getCell('G17');
    globalExplanationCell.value = unitPlan.globalContextExplanation;
    Object.assign(globalExplanationCell, contentCellStyle);

    // B18-C18: Statement of Understanding header
    worksheet.mergeCells('B18:C18');
    const statementHeader = worksheet.getCell('B18');
    statementHeader.value = 'Statement of Understanding';
    Object.assign(statementHeader, mainHeaderStyle);

    // D18-G18: Statement of Understanding value
    worksheet.mergeCells('D18:G18');
    const statementCell = worksheet.getCell('D18');
    statementCell.value = unitPlan.inquiryStatement;
    Object.assign(statementCell, contentCellStyle);

    // B19-C19: Inquiry Statement header
    worksheet.mergeCells('B19:C19');
    const inquiryStatementHeader = worksheet.getCell('B19');
    inquiryStatementHeader.value = 'Inquiry Statement/Question';
    Object.assign(inquiryStatementHeader, mainHeaderStyle);

    // D19-G19: Inquiry Statement value
    worksheet.mergeCells('D19:G19');
    const inquiryStatementCell = worksheet.getCell('D19');
    inquiryStatementCell.value = unitPlan.inquiryStatement;
    Object.assign(inquiryStatementCell, contentCellStyle);

    // B20-G20: Inquiry Statement/Guiding Question(s) header
    worksheet.mergeCells('B20:G20');
    const guidingQuestionsHeader = worksheet.getCell('B20');
    guidingQuestionsHeader.value = 'Inquiry Statement/Guiding Question(s)';
    Object.assign(guidingQuestionsHeader, mainHeaderStyle);

    // D21: Factual knowledge header
    const factualHeader = worksheet.getCell('D21');
    factualHeader.value = 'Factual knowledge';
    Object.assign(factualHeader, subHeaderStyle);

    // E21: Conceptual header
    const conceptualQuestionsHeader = worksheet.getCell('E21');
    conceptualQuestionsHeader.value = 'Conceptual';
    Object.assign(conceptualQuestionsHeader, subHeaderStyle);

    // F21: Debatable header
    const debatableHeader = worksheet.getCell('F21');
    debatableHeader.value = 'Debatable';
    Object.assign(debatableHeader, subHeaderStyle);

    // D22: Factual Questions (array as newlines)
    const factualCell = worksheet.getCell('D22');
    factualCell.value = formatArrayAsNewlines(unitPlan.factualQuestions);
    Object.assign(factualCell, contentCellStyle);

    // E22: Conceptual Questions (array as newlines)
    const conceptualQuestionsCell = worksheet.getCell('E22');
    conceptualQuestionsCell.value = formatArrayAsNewlines(unitPlan.conceptualQuestions);
    Object.assign(conceptualQuestionsCell, contentCellStyle);

    // F22: Debatable Questions (array as newlines)
    const debatableCell = worksheet.getCell('F22');
    debatableCell.value = formatArrayAsNewlines(unitPlan.debatableQuestions);
    Object.assign(debatableCell, contentCellStyle);

    // B23-G23: Contextual lens header
    worksheet.mergeCells('B23:G23');
    const contextualLensHeader = worksheet.getCell('B23');
    contextualLensHeader.value = 'Contextual lens/lenses';
    Object.assign(contextualLensHeader, mainHeaderStyle);

    // D24: Individual header
    const individualHeader = worksheet.getCell('D24');
    individualHeader.value = 'Individual';
    Object.assign(individualHeader, subHeaderStyle);

    // E24: Local header
    const localHeader = worksheet.getCell('E24');
    localHeader.value = 'Local';
    Object.assign(localHeader, subHeaderStyle);

    // F24: Global header
    const globalLensHeader = worksheet.getCell('F24');
    globalLensHeader.value = 'Global';
    Object.assign(globalLensHeader, subHeaderStyle);

    // D25: Individual Context (array as newlines)
    const individualCell = worksheet.getCell('D25');
    individualCell.value = formatArrayAsNewlines(unitPlan.individualContext ? [unitPlan.individualContext] : []);
    Object.assign(individualCell, contentCellStyle);

    // E25: Local Context (array as newlines)
    const localCell = worksheet.getCell('E25');
    localCell.value = formatArrayAsNewlines(unitPlan.localContext ? [unitPlan.localContext] : []);
    Object.assign(localCell, contentCellStyle);

    // F25: Global Context Lens (array as newlines)
    const globalLensCell = worksheet.getCell('F25');
    globalLensCell.value = formatArrayAsNewlines(unitPlan.globalContextLens ? [unitPlan.globalContextLens] : []);
    Object.assign(globalLensCell, contentCellStyle);

    // B26-C26: Objectives header
    worksheet.mergeCells('B26:C26');
    const objectivesHeader = worksheet.getCell('B26');
    objectivesHeader.value = 'Objectives/Strand(s)';
    Object.assign(objectivesHeader, mainHeaderStyle);

    // D26: Summative Assessment header
    const summativeHeader = worksheet.getCell('D26');
    summativeHeader.value = 'Summative Assessment(s)';
    Object.assign(summativeHeader, mainHeaderStyle);

    // E26: Learner Profile Attribute header
    const learnerProfileHeader = worksheet.getCell('E26');
    learnerProfileHeader.value = 'Learner Profile Attribute';
    Object.assign(learnerProfileHeader, mainHeaderStyle);

    // F26-G26: ATL Skills header
    worksheet.mergeCells('F26:G26');
    const atlSkillsHeader = worksheet.getCell('F26');
    atlSkillsHeader.value = 'ATL Skills';
    Object.assign(atlSkillsHeader, mainHeaderStyle);

    // B27-C30: Merged objectives area
    worksheet.mergeCells('B27:C30');
    const objectivesCell = worksheet.getCell('B27');
    objectivesCell.value = formatObjectivesForExcel(unitPlan.objectives);
    Object.assign(objectivesCell, contentCellStyle);

    // Add assessment tasks if they exist
    if (unitPlan.assessmentTasks && unitPlan.assessmentTasks.length > 0) {
        // B31-C34: Merged assessment tasks area
        worksheet.mergeCells('B31:C34');
        const assessmentTasksCell = worksheet.getCell('B31');
        assessmentTasksCell.value = formatAssessmentTasksForExcel(unitPlan.assessmentTasks);
        Object.assign(assessmentTasksCell, contentCellStyle);
    }

    // D27: Assessment Title with bolded label
    const assessmentTitleCell = worksheet.getCell('D27');
    assessmentTitleCell.value = `Assessment Title:\n${unitPlan.assessmentTitle}`;
    assessmentTitleCell.font = { 
        name: 'Calibri', 
        size: 12, 
        color: { argb: 'FF000000' },
        bold: true
    };
    assessmentTitleCell.alignment = { 
        vertical: 'top', 
        horizontal: 'left',
        wrapText: true 
    };

    // D28: Assessment Type with bolded label
    const assessmentTypeCell = worksheet.getCell('D28');
    assessmentTypeCell.value = `Assessment Type:\n${unitPlan.assessmentType}`;
    assessmentTypeCell.font = { 
        name: 'Calibri', 
        size: 12, 
        color: { argb: 'FF000000' },
        bold: true
    };
    assessmentTypeCell.alignment = { 
        vertical: 'top', 
        horizontal: 'left',
        wrapText: true 
    };

    // D29: Command Terms with bolded label
    const commandTermsCell = worksheet.getCell('D29');
    commandTermsCell.value = `Command Terms:\n${formatCommandTermsAsString(unitPlan.commandTerms)}`;
    commandTermsCell.font = { 
        name: 'Calibri', 
        size: 12, 
        color: { argb: 'FF000000' },
        bold: true
    };
    commandTermsCell.alignment = { 
        vertical: 'top', 
        horizontal: 'left',
        wrapText: true 
    };

    // D30: Summative Assessment with bolded label
    const summativeCell = worksheet.getCell('D30');
    summativeCell.value = `Summative Assessment(s):\n${unitPlan.summativeAssessment}`;
    summativeCell.font = { 
        name: 'Calibri', 
        size: 12, 
        color: { argb: 'FF000000' },
        bold: true
    };
    summativeCell.alignment = { 
        vertical: 'top', 
        horizontal: 'left',
        wrapText: true 
    };

    // E27-E30: Merged learner profile area
    worksheet.mergeCells('E27:E30');

    // F27: ATL Skill/s header
    const atlSkillHeader = worksheet.getCell('F27');
    atlSkillHeader.value = 'ATL Skill/s';
    atlSkillHeader.font = { bold: true, color: { argb: 'FF000000' } };

    // F28: ATL Strategy header
    const atlStrategyHeader = worksheet.getCell('F28');
    atlStrategyHeader.value = 'ATL Strategy(ies) Selected';
    atlStrategyHeader.font = { bold: true, color: { argb: 'FF000000' } };

    // F29: Connection header
    const connectionHeader = worksheet.getCell('F29');
    connectionHeader.value = 'Connection to Process and/or Product';
    connectionHeader.font = { bold: true, color: { argb: 'FF000000' } };

    // G27: ATL Skills (array as newlines)
    const atlSkillsCell = worksheet.getCell('G27');
    atlSkillsCell.value = formatATLSkillsAsNewlines(unitPlan.atlSkills);
    Object.assign(atlSkillsCell, contentCellStyle);

    // G28: ATL Strategies
    const atlStrategiesCell = worksheet.getCell('G28');
    atlStrategiesCell.value = unitPlan.atlStrategies;
    Object.assign(atlStrategiesCell, contentCellStyle);

    // G29: Connection (empty for now)
    const connectionCell = worksheet.getCell('G29');
    
    // Add ATL cards if they exist and output mapping is current or custom
    if ((unitPlan.outputMapping === 'current' || unitPlan.outputMapping === 'custom') && unitPlan.atlCards && unitPlan.atlCards.length > 0) {
        // F30: ATL Cards header
        const atlCardsHeader = worksheet.getCell('F30');
        atlCardsHeader.value = 'ATL Cards';
        atlCardsHeader.font = { bold: true, color: { argb: 'FF000000' } };
        
        // G30: ATL Cards content
        const atlCardsCell = worksheet.getCell('G30');
        atlCardsCell.value = formatATLCardsForExcel(unitPlan.atlCards);
        Object.assign(atlCardsCell, contentCellStyle);
    }
    connectionCell.value = '';
    connectionCell.font = { color: { argb: 'FF000000' } };

    // B31-D31: Action header
    worksheet.mergeCells('B31:D31');
    const actionHeader = worksheet.getCell('B31');
    actionHeader.value = 'Action: Teaching and Learning through Inquiry';
    Object.assign(actionHeader, mainHeaderStyle);

    // B33-B34: No. of lessons header
    worksheet.mergeCells('B33:B34');
    const lessonsHeader = worksheet.getCell('B33');
    lessonsHeader.value = 'No. of lessons';
    lessonsHeader.font = { 
        name: 'Calibri', 
        size: 8, 
        bold: true, 
        color: { argb: 'FFFFFFFF' } 
    };
    lessonsHeader.alignment = { 
        vertical: 'middle', 
        horizontal: 'center',
        wrapText: true 
    };

    // C33-C34: Unit Content header
    worksheet.mergeCells('C33:C34');
    const unitContentHeader = worksheet.getCell('C33');
    unitContentHeader.value = 'Unit Content';
    Object.assign(unitContentHeader, mainHeaderStyle);

    // D33-D34: Success criteria header
    worksheet.mergeCells('D33:D34');
    const successCriteriaHeader = worksheet.getCell('D33');
    successCriteriaHeader.value = 'Success criteria';
    Object.assign(successCriteriaHeader, mainHeaderStyle);

    // E33-E34: Activities header
    worksheet.mergeCells('E33:E34');
    const activitiesHeader = worksheet.getCell('E33');
    activitiesHeader.value = 'Activities';
    Object.assign(activitiesHeader, mainHeaderStyle);

    // F33-F34: Learning experiences header
    worksheet.mergeCells('F33:F34');
    const learningExperiencesHeader = worksheet.getCell('F33');
    learningExperiencesHeader.value = 'Learning experiences and teaching strategies';
    learningExperiencesHeader.font = { 
        name: 'Calibri', 
        size: 14, 
        bold: true, 
        color: { argb: 'FFFFFFFF' } 
    };
    learningExperiencesHeader.alignment = { 
        vertical: 'middle', 
        horizontal: 'center',
        wrapText: true 
    };

    // G33-G34: Differentiation header
    worksheet.mergeCells('G33:G34');
    const differentiationHeader = worksheet.getCell('G33');
    differentiationHeader.value = 'Differentiation and Inclusion Strategies (content, process,product, examples)';
    differentiationHeader.font = { 
        name: 'Calibri', 
        size: 14, 
        bold: true, 
        color: { argb: 'FFFFFFFF' } 
    };
    differentiationHeader.alignment = { 
        vertical: 'middle', 
        horizontal: 'center',
        wrapText: true 
    };

    // B33-G33: Dark blue background (excluding A33)
    const b33Cell = worksheet.getCell('B33');
    const c33Cell = worksheet.getCell('C33');
    const d33Cell = worksheet.getCell('D33');
    const e33Cell = worksheet.getCell('E33');
    const f33Cell = worksheet.getCell('F33');
    const g33Cell = worksheet.getCell('G33');
    
    [b33Cell, c33Cell, d33Cell, e33Cell, f33Cell, g33Cell].forEach(cell => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00264C' }
        };
    });

    // H33-S33: Methods of evaluation header
    worksheet.mergeCells('H33:S33');
    const methodsHeader = worksheet.getCell('H33');
    methodsHeader.value = 'Methods of evaluation';
    Object.assign(methodsHeader, mainHeaderStyle);

    // H33: Dark blue background (applied after header styling to ensure it's not overwritten)
    const h33Cell = worksheet.getCell('H33');
    h33Cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF00264C' }
    };

    // H34-K34: Summative assessment header
    worksheet.mergeCells('H34:K34');
    const summativeEvalHeader = worksheet.getCell('H34');
    summativeEvalHeader.value = 'Summative assessment';
    Object.assign(summativeEvalHeader, subHeaderStyle);

    // L34-O34: Interim assessment header
    worksheet.mergeCells('L34:O34');
    const interimEvalHeader = worksheet.getCell('L34');
    interimEvalHeader.value = 'Interim assessment';
    Object.assign(interimEvalHeader, subHeaderStyle);

    // P34-S34: Formative assessment header
    worksheet.mergeCells('P34:S34');
    const formativeEvalHeader = worksheet.getCell('P34');
    formativeEvalHeader.value = 'Formative assessment';
    Object.assign(formativeEvalHeader, subHeaderStyle);

    // Add subunit rows starting from row 35
    if (unitPlan.subunits && unitPlan.subunits.length > 0) {
        unitPlan.subunits.forEach((subunit, index) => {
            const rowNumber = 35 + index;
            
            // B{rowNumber}: Number of lessons in this subunit
            const subunitNumberCell = worksheet.getCell(`B${rowNumber}`);
            subunitNumberCell.value = subunit.lessonsPerSubunit;
            Object.assign(subunitNumberCell, contentCellStyle);
            
            // C{rowNumber}: Unit content
            const contentCell = worksheet.getCell(`C${rowNumber}`);
            contentCell.value = subunit.content || '';
            Object.assign(contentCell, contentCellStyle);
            
            // D{rowNumber}: Success criteria
            const successCriteriaCell = worksheet.getCell(`D${rowNumber}`);
            successCriteriaCell.value = subunit.successCriteria?.join('\n') || '';
            Object.assign(successCriteriaCell, contentCellStyle);
            
            // E{rowNumber}: Activities
            const activitiesCell = worksheet.getCell(`E${rowNumber}`);
            activitiesCell.value = subunit.activities || '';
            Object.assign(activitiesCell, contentCellStyle);
            
            // F{rowNumber}: Learning experiences and teaching strategies
            const learningExperiencesCell = worksheet.getCell(`F${rowNumber}`);
            learningExperiencesCell.value = subunit.learningExperiences || '';
            Object.assign(learningExperiencesCell, contentCellStyle);
            
            // G{rowNumber}: Differentiation
            const differentiationCell = worksheet.getCell(`G${rowNumber}`);
            differentiationCell.value = subunit.differentiation || '';
            Object.assign(differentiationCell, contentCellStyle);
            
            // H{rowNumber}-K{rowNumber}: Summative assessment (merged)
            worksheet.mergeCells(`H${rowNumber}:K${rowNumber}`);
            const summativeAssessmentCell = worksheet.getCell(`H${rowNumber}`);
            summativeAssessmentCell.value = subunit.summativeAssessment || '';
            Object.assign(summativeAssessmentCell, contentCellStyle);
            
            // L{rowNumber}-O{rowNumber}: Interim assessment (merged)
            worksheet.mergeCells(`L${rowNumber}:O${rowNumber}`);
            const interimAssessmentCell = worksheet.getCell(`L${rowNumber}`);
            interimAssessmentCell.value = subunit.interimAssessment || '';
            Object.assign(interimAssessmentCell, contentCellStyle);
            
            // P{rowNumber}-S{rowNumber}: Formative assessment (merged)
            worksheet.mergeCells(`P${rowNumber}:S${rowNumber}`);
            const formativeAssessmentCell = worksheet.getCell(`P${rowNumber}`);
            formativeAssessmentCell.value = subunit.formativeAssessment || '';
            Object.assign(formativeAssessmentCell, contentCellStyle);
            
                    // Set lesson row height to 64
        worksheet.getRow(rowNumber).height = 64;
        
        // Paint T{rowNumber}:Z{rowNumber} with white for each lesson row
        for (let col = 20; col <= 26; col++) { // T=20, Z=26
            const cell = worksheet.getCell(rowNumber, col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFFFF' }
            };
        }
        
        // Add borders to lesson row cells (including assessment cells)
        const lessonRowCells = [
            `B${rowNumber}`, `C${rowNumber}`, `D${rowNumber}`, `E${rowNumber}`, `F${rowNumber}`, `G${rowNumber}`,
            `H${rowNumber}`, `L${rowNumber}`, `P${rowNumber}` // Assessment cells (merged, so only need the first cell of each merge)
        ];
        lessonRowCells.forEach(cellAddress => {
            const cell = worksheet.getCell(cellAddress);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
        });
        
        // Add instructions row after the last subunit row
        const lastLessonRow = 35 + unitPlan.subunits.length - 1; // Last subunit row number
        const instructionsRow = lastLessonRow + 2; // Row after the last lesson (empty row) + 1 for instructions
        
        // Set empty line above Resources/Community Engagement titles to 6.0 height
        worksheet.getRow(instructionsRow - 1).height = 6.0;
        
        // Color B{instructionsRow-1}:F{instructionsRow-1} with white
        for (let col = 2; col <= 6; col++) { // B=2, F=6
            const cell = worksheet.getCell(instructionsRow - 1, col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFFFF' }
            };
        }
        
        // Set Resources and Community Engagement titles row height to 30.0
        worksheet.getRow(instructionsRow).height = 30.0;
        
        // B{instructionsRow}-D{instructionsRow}: Resources (merged)
        worksheet.mergeCells(`B${instructionsRow}:D${instructionsRow}`);
        const resourcesCell = worksheet.getCell(`B${instructionsRow}`);
        resourcesCell.value = 'Resources';
        Object.assign(resourcesCell, mainHeaderStyle);
        
        // E{instructionsRow}-F{instructionsRow}: Community Engagement (merged)
        worksheet.mergeCells(`E${instructionsRow}:F${instructionsRow}`);
        const communityEngagementCell = worksheet.getCell(`E${instructionsRow}`);
        communityEngagementCell.value = 'Community Engagement';
        Object.assign(communityEngagementCell, mainHeaderStyle);
        
        // Apply brown color to B{instructionsRow}-E{instructionsRow}
        const brownColor = { argb: 'FF996633' }; // Brown color #996633
        for (let col = 2; col <= 5; col++) { // B=2, C=3, D=4, E=5
            const cell = worksheet.getCell(instructionsRow, col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: brownColor
            };
        }
        
        // Set Resources value row height to 120.0
        worksheet.getRow(instructionsRow + 1).height = 120.0;
        
        // B{instructionsRow+1}-D{instructionsRow+1}: Resources value (merged)
        worksheet.mergeCells(`B${instructionsRow + 1}:D${instructionsRow + 1}`);
        const resourcesValueCell = worksheet.getCell(`B${instructionsRow + 1}`);
        resourcesValueCell.value = unitPlan.resources || '';
        Object.assign(resourcesValueCell, contentCellStyle);
        
        // E{instructionsRow+1}-F{instructionsRow+1}: Community Engagement value (merged)
        worksheet.mergeCells(`E${instructionsRow + 1}:F${instructionsRow + 1}`);
        const communityEngagementValueCell = worksheet.getCell(`E${instructionsRow + 1}`);
        communityEngagementValueCell.value = unitPlan.communityEngagement || '';
        Object.assign(communityEngagementValueCell, contentCellStyle);
        
        // Set empty line above Reflection title to 6.0 height
        worksheet.getRow(instructionsRow + 2).height = 6.0;
        
        // Color B{instructionsRow+2}:F{instructionsRow+2} with white
        for (let col = 2; col <= 6; col++) { // B=2, F=6
            const cell = worksheet.getCell(instructionsRow + 2, col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFFFF' }
            };
        }
        
        // Set Reflection title row height to 30.0
        worksheet.getRow(instructionsRow + 3).height = 30.0;
        
        // Set empty line above "Prior to Teaching" row to 6.0 height and paint white
        worksheet.getRow(instructionsRow + 4).height = 6.0;
        for (let col = 2; col <= 6; col++) { // B=2, F=6
            const cell = worksheet.getCell(instructionsRow + 4, col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFFFF' }
            };
        }
        
        // Set "Prior to Teaching" row height to 30.0
        worksheet.getRow(instructionsRow + 5).height = 30.0;
        
        // B{instructionsRow+3}-F{instructionsRow+3}: Reflection header (merged)
        worksheet.mergeCells(`B${instructionsRow + 3}:F${instructionsRow + 3}`);
        const reflectionHeader = worksheet.getCell(`B${instructionsRow + 3}`);
        reflectionHeader.value = 'Reflection: Considering the planning, process and impact of the inquiry';
        Object.assign(reflectionHeader, mainHeaderStyle);
        
        // Apply brown color to B{instructionsRow+3}-F{instructionsRow+3}
        for (let col = 2; col <= 6; col++) { // B=2, C=3, D=4, E=5, F=6
            const cell = worksheet.getCell(instructionsRow + 3, col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: brownColor
            };
        }
        
        // B{instructionsRow+5}-F{instructionsRow+5}: Reflection subheaders
        const darkBlueColor = { argb: 'FF00264C' }; // Dark blue color used in D26
        
        // B{instructionsRow+5}: No.
        const noCell = worksheet.getCell(`B${instructionsRow + 5}`);
        noCell.value = 'No.';
        Object.assign(noCell, mainHeaderStyle);
        
        // C{instructionsRow+5}: Prior to teaching
        const priorToTeachingCell = worksheet.getCell(`C${instructionsRow + 5}`);
        priorToTeachingCell.value = 'Prior to teaching the unit';
        Object.assign(priorToTeachingCell, mainHeaderStyle);
        
        // D{instructionsRow+5}: During teaching
        const duringTeachingCell = worksheet.getCell(`D${instructionsRow + 5}`);
        duringTeachingCell.value = 'During teaching';
        Object.assign(duringTeachingCell, mainHeaderStyle);
        
        // E{instructionsRow+5}: After teaching
        const afterTeachingCell = worksheet.getCell(`E${instructionsRow + 5}`);
        afterTeachingCell.value = 'After teaching the unit';
        Object.assign(afterTeachingCell, mainHeaderStyle);
        
        // F{instructionsRow+5}: Future planning
        const futurePlanningCell = worksheet.getCell(`F${instructionsRow + 5}`);
        futurePlanningCell.value = 'Future planning';
        Object.assign(futurePlanningCell, mainHeaderStyle);
        
        // Apply dark blue color to B{instructionsRow+5}-F{instructionsRow+5}
        for (let col = 2; col <= 6; col++) { // B=2, C=3, D=4, E=5, F=6
            const cell = worksheet.getCell(instructionsRow + 5, col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: darkBlueColor
            };
        }
        
        // C{instructionsRow+6}: Prior to teaching reflection value
        const priorToTeachingValueCell = worksheet.getCell(`C${instructionsRow + 6}`);
        priorToTeachingValueCell.value = unitPlan.reflectionPriorToTeaching || '';
        Object.assign(priorToTeachingValueCell, contentCellStyle);
        
        // D{instructionsRow+6}: During teaching reflection value
        const duringTeachingValueCell = worksheet.getCell(`D${instructionsRow + 6}`);
        duringTeachingValueCell.value = unitPlan.reflectionDuringTeaching || '';
        Object.assign(duringTeachingValueCell, contentCellStyle);
        
        // E{instructionsRow+6}: After teaching reflection value
        const afterTeachingValueCell = worksheet.getCell(`E${instructionsRow + 6}`);
        afterTeachingValueCell.value = unitPlan.reflectionAfterTeaching || '';
        Object.assign(afterTeachingValueCell, contentCellStyle);
        
        // Set Reflection values row height to 120.0
        worksheet.getRow(instructionsRow + 6).height = 120.0;
        
        // F{instructionsRow+6}: Future planning reflection value
        const futurePlanningValueCell = worksheet.getCell(`F${instructionsRow + 6}`);
        futurePlanningValueCell.value = unitPlan.reflectionFuturePlanning || '';
        Object.assign(futurePlanningValueCell, contentCellStyle);
        
        // Add borders to specified cells
        const cellsWithBorders = [
            `B${instructionsRow + 5}`, `C${instructionsRow + 5}`, `D${instructionsRow + 5}`, `E${instructionsRow + 5}`, `F${instructionsRow + 5}`,
            `B${instructionsRow + 6}`, `C${instructionsRow + 6}`, `D${instructionsRow + 6}`, `E${instructionsRow + 6}`, `F${instructionsRow + 6}`,
            `B${instructionsRow + 1}`, `E${instructionsRow + 1}` // B39, E39 (resources and community engagement value cells)
        ];
        
        cellsWithBorders.forEach(cellAddress => {
            const cell = worksheet.getCell(cellAddress);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
        
        // Paint G{lastLessonRow+1} to Z86 with white (area to the right and below content)
        const lastLessonRowForWhite = 35 + (unitPlan.subunits?.length || 0) - 1;
        for (let row = lastLessonRowForWhite + 1; row <= 86; row++) {
            for (let col = 7; col <= 26; col++) { // G=7, Z=26
                const cell = worksheet.getCell(row, col);
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFFFFF' }
                };
            }
        }
        
        // Paint A{reflectionEndRow+1} to F86 with white (area below reflection content on the left)
        const reflectionEndRow = instructionsRow + 6; // Last row with reflection content
        for (let row = reflectionEndRow + 1; row <= 86; row++) {
            for (let col = 1; col <= 6; col++) { // A=1, F=6
                const cell = worksheet.getCell(row, col);
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFFFFF' }
                };
            }
        }
    }

    // Add borders to specific cells
    const cellsWithBorders = [
        'B16', 'B17', 'E16', 'G16', 'D17', 'E17', 'G17', 'B18', 'D18', 'B19', 'D19', 'B20',
        'D21', 'D22', 'E21', 'E22', 'F21', 'F22', 'B23', 'D24', 'D25', 'E24', 'E25', 'F24', 'F25',
        'B26', 'D26', 'E26', 'F26', 'B27', 'D27', 'D28', 'D29', 'D30', 'F27', 'F28', 'F29',
        'B33', 'C33', 'D33', 'E33', 'F33', 'G33', 'H33', 'H34', 'L34', 'P34'
    ];
    
    cellsWithBorders.forEach(cellAddress => {
        const cell = worksheet.getCell(cellAddress);
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // Set column widths AFTER all content has been populated
    // This ensures content doesn't override the specified widths
    // ExcelJS column widths are measured in characters (approximately)
    worksheet.getColumn('A').width = 9;
    worksheet.getColumn('B').width = 6;
    worksheet.getColumn('C').width = 44;
    worksheet.getColumn('D').width = 46;
    worksheet.getColumn('E').width = 35;
    worksheet.getColumn('F').width = 40;
    worksheet.getColumn('G').width = 52;
    
    // Force the widths to be applied by setting them again
    // Sometimes ExcelJS needs explicit width enforcement
    worksheet.columns.forEach((column, index) => {
        if (index === 0) column.width = 9;      // A
        if (index === 1) column.width = 6;      // B
        if (index === 2) column.width = 44;     // C
        if (index === 3) column.width = 46;     // D
        if (index === 4) column.width = 35;     // E
        if (index === 5) column.width = 40;     // F
        if (index === 6) column.width = 52;     // G
    });

    // Insert KMM logo with pixel-based positioning to match original Excel settings
    if (workbook) {
        try {
            // Load image from public folder using fetch
            const response = await fetch('/images/unitPlanGenerator/KMM_logo.png');
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                const base64Image = btoa(Array.from(uint8Array, byte => String.fromCharCode(byte)).join(''));
                
                // Add image to workbook
                const imageId = workbook.addImage({
                    base64: base64Image,
                    extension: 'png',
                });
                
                // Convert cm to pixels (approximate: 1 cm ≈ 37.8 pixels in Excel)
                const cmToPixels = 37.8;
                const widthPixels = 3.49 * cmToPixels;  // 3.49 cm
                const heightPixels = 2.21 * cmToPixels; // 2.21 cm
                
                // Add image with pixel-based positioning using ext property
                worksheet.addImage(imageId, {
                    tl: { col: 2, row: 0 }, // C1 cell (0-based indexing)
                    ext: { width: widthPixels, height: heightPixels },
                    editAs: 'oneCell' // Anchor to cell, not move with cells
                });
            } else {
                console.warn('KMM_logo.png not found in public/images/unitPlanGenerator');
            }
        } catch (error) {
            console.error('Error inserting KMM logo:', error);
        }
    }
};




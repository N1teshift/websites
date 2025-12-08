import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import {
  UnitPlanData,
  AssessmentTask,
  ATLCard,
  LearningExperienceCard,
} from "../../types/UnitPlanTypes";
import { getStrandByFullId, getObjectiveById } from "../../data/objectives";

/**
 * Export unit plan as Word document using Docxtemplater
 * This function expects a template file to be provided
 */
export async function exportUnitPlanWithDocxtemplater(
  unitPlan: UnitPlanData,
  templateBuffer?: ArrayBuffer
): Promise<Blob> {
  try {
    // If no template is provided, load the default template
    if (!templateBuffer) {
      const response = await fetch("/templates/wordTemplate.docx");
      if (!response.ok) {
        throw new Error("Failed to load default template");
      }
      templateBuffer = await response.arrayBuffer();
    }

    // Load the template
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Prepare the data for the template
    const templateData = prepareTemplateData(unitPlan);

    // Render the document
    doc.render(templateData);

    // Generate the output
    const output = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    return output;
  } catch (error) {
    console.error("Error in Docxtemplater export:", error);
    throw error;
  }
}

/**
 * Format objectives/strands for template display
 */
function formatObjectivesForTemplate(objectives: string[]): string {
  if (!objectives || objectives.length === 0) {
    return "Not specified";
  }

  // Group strands by objective
  const objectiveGroups: Record<string, string[]> = {};

  objectives.forEach((strandId) => {
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

  Object.keys(objectiveGroups)
    .sort()
    .forEach((objectiveId) => {
      const objective = getObjectiveById(objectiveId);
      if (objective) {
        formattedObjectives.push(`${objective.name}:`);

        // Add each strand for this objective
        objectiveGroups[objectiveId].forEach((strandId) => {
          const strand = getStrandByFullId(strandId);
          if (strand) {
            formattedObjectives.push(`  ${strand.id}. ${strand.description}`);
          }
        });

        // Add a blank line between objectives
        formattedObjectives.push("");
      }
    });

  return formattedObjectives.join("\n");
}

/**
 * Format assessment tasks for template display
 */
function formatAssessmentTasksForTemplate(tasks: AssessmentTask[]): string {
  if (!tasks || tasks.length === 0) {
    return "No assessment tasks specified";
  }

  return tasks
    .map((task, index) => {
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

      return (
        `TASK ${index + 1}: ${task.taskTitle}\n` +
        `${task.taskDescription}\n` +
        `${task.criterionID}. ${strandDescription}\n` +
        `${task.criterionDescription}`
      );
    })
    .join("\n\n");
}

/**
 * Format ATL cards for template display
 */
interface ATLCardTemplateData {
  categoryCluster: string;
  atlSupport: string;
  strategy: string;
  index: number;
}

function formatATLCardsForTemplate(cards: ATLCard[]): ATLCardTemplateData[] {
  if (!cards || cards.length === 0) {
    return [];
  }

  return cards.map((card, index) => ({
    categoryCluster: card.categoryCluster,
    atlSupport: card.atlSupport,
    strategy: `Strategy: ${card.atlStrategyName}\n${card.atlStrategyDescription}`,
    index: index + 1,
  }));
}

interface LearningExperienceCardTemplateData {
  learningExperienceDayRange: string;
  learningExperienceHoursCount: string;
  learningExperienceName: string;
  learningExperienceDescription: string;
  learningExperienceFormativeAssessment: string;
  activities: ActivityCardTemplateData[];
  activitiesAsText: string;
  activitiesCompact: string;
}

interface ActivityCardTemplateData {
  activityName: string;
  activityDescription: string;
  activityFormativeAssessmentTitle: string;
}

function formatLearningExperienceCardsForTemplate(
  cards: LearningExperienceCard[]
): LearningExperienceCardTemplateData[] {
  if (!cards || cards.length === 0) {
    return [];
  }

  return cards.map((card, _index) => {
    // Format all activities as a single string for the row
    const activitiesText = card.activities
      .map((activity, activityIndex) => {
        return `Activity ${activityIndex + 1}: ${activity.activityName}\n${activity.activityDescription}\nFormative Assessment: ${activity.activityFormativeAssessmentTitle}`;
      })
      .join("\n\n");

    // Create a formatted version for Word tables (without extra spacing)
    const formattedActivitiesText = card.activities
      .map((activity, activityIndex) => {
        return `Activity ${activityIndex + 1}: ${activity.activityName}\n${activity.activityDescription}\nFormative Assessment: ${activity.activityFormativeAssessmentTitle}`;
      })
      .join("\n");

    return {
      learningExperienceDayRange: card.learningExperienceDayRange,
      learningExperienceHoursCount: card.learningExperienceHoursCount,
      learningExperienceName: card.learningExperienceName,
      learningExperienceDescription: card.learningExperienceDescription,
      learningExperienceFormativeAssessment: card.learningExperienceFormativeAssessment,
      activities: card.activities.map((activity, activityIndex) => ({
        activityName: `Activity ${activityIndex + 1}: ${activity.activityName}`,
        activityDescription: activity.activityDescription,
        activityFormativeAssessmentTitle: activity.activityFormativeAssessmentTitle,
      })),
      // New field for single-row display
      activitiesAsText: activitiesText || "No activities defined",
      // Compact version for Word tables
      activitiesCompact: formattedActivitiesText || "No activities defined",
    };
  });
}

/**
 * Prepare unit plan data for Docxtemplater template
 */
function prepareTemplateData(unitPlan: UnitPlanData) {
  return {
    // Basic Information
    schoolName: unitPlan.schoolName || "Not specified",
    unitTitle: unitPlan.unitTitle || "Not specified",
    academicYear: unitPlan.academicYear || "Not specified",
    subject: unitPlan.subject || "Not specified",
    mypYear: unitPlan.mypYear || "Not specified",

    // Concepts and Understandings
    specifiedConcepts: unitPlan.specifiedConcepts?.join(", ") || "Not specified",
    keyConcepts: unitPlan.keyConcepts?.join(", ") || "Not specified",
    relatedConcepts: unitPlan.relatedConcepts?.join(", ") || "Not specified",
    conceptualUnderstandings: unitPlan.conceptualUnderstandings || "Not specified",
    globalContext: unitPlan.globalContext || "Not specified",
    globalContextExplanation: unitPlan.globalContextExplanation || "Not specified",

    // Inquiry
    inquiryStatement: unitPlan.inquiryStatement || "Not specified",
    factualQuestions: unitPlan.factualQuestions?.join("\n") || "Not specified",
    conceptualQuestions: unitPlan.conceptualQuestions?.join("\n") || "Not specified",
    debatableQuestions: unitPlan.debatableQuestions?.join("\n") || "Not specified",

    // Assessment - Updated to use new formatting functions
    objectives: formatObjectivesForTemplate(unitPlan.objectives),
    assessmentTitle: unitPlan.assessmentTitle || "Not specified",
    assessmentType: unitPlan.assessmentType || "Not specified",
    summativeAssessment: unitPlan.summativeAssessment || "Not specified",
    summativeAssessmentRelationshipDescription:
      unitPlan.summativeAssessmentRelationshipDescription || "Not specified",
    assessmentTasks: formatAssessmentTasksForTemplate(unitPlan.assessmentTasks),
    commandTerms: unitPlan.commandTerms?.join(", ") || "Not specified",

    // Context
    individualContext: unitPlan.individualContext || "Not specified",
    localContext: unitPlan.localContext || "Not specified",
    globalContextLens: unitPlan.globalContextLens || "Not specified",

    // ATL Skills
    atlSkills: unitPlan.atlSkills?.join("\n") || "Not specified",
    atlStrategies: unitPlan.atlStrategies || "Not specified",
    atlCards: formatATLCardsForTemplate(unitPlan.atlCards),

    // Learning Process (for current mode)
    learningExperienceCards: formatLearningExperienceCardsForTemplate(
      unitPlan.learningExperienceCards
    ),

    // Subunits
    subunits:
      unitPlan.subunits?.map((subunit, index) => ({
        number: subunit.subunitNumber || index + 1,
        title: `Subunit ${subunit.subunitNumber || index + 1}`,
        description: subunit.content || "Not specified",
        lessonsPerSubunit: subunit.lessonsPerSubunit || 0,
        interimAssessment: subunit.interimAssessment || "Not specified",
        formativeAssessment: subunit.formativeAssessment || "Not specified",
        successCriteria: subunit.successCriteria || "Not specified",
        activities: subunit.activities || "Not specified",
        learningExperiences: subunit.learningExperiences || "Not specified",
        differentiation: subunit.differentiation || "Not specified",
        summativeAssessment: subunit.summativeAssessment || "Not specified",
      })) || [],

    // Prior Knowledge (for current mode)
    priorKnowledgeSubjectSpecific:
      unitPlan.priorKnowledgeSubjectSpecific?.map((item) => `• ${item}`).join("\n") ||
      "Not specified",
    priorKnowledgeLearningSkills:
      unitPlan.priorKnowledgeLearningSkills?.map((item) => `• ${item}`).join("\n") ||
      "Not specified",

    // New Knowledge (for current mode)
    topicsTerminology:
      unitPlan.topicsTerminology?.map((item) => `• ${item}`).join("\n") || "Not specified",
    conceptualKnowledge:
      unitPlan.conceptualKnowledge?.map((item) => `• ${item}`).join("\n") || "Not specified",
    proceduralKnowledge:
      unitPlan.proceduralKnowledge?.map((item) => `• ${item}`).join("\n") || "Not specified",

    // Formative Assessment (for current mode)
    informalFormativeAssessment:
      unitPlan.informalFormativeAssessment?.map((item) => `• ${item}`).join("\n") ||
      "Not specified",
    formalFormativeAssessment:
      unitPlan.formalFormativeAssessment?.map((item) => `• ${item}`).join("\n") || "Not specified",

    // Resources and Community
    resources: unitPlan.resources || "Not specified",
    printedResources:
      unitPlan.printedResources?.map((item) => `• ${item}`).join("\n") || "Not specified",
    digitalResources:
      unitPlan.digitalResources?.map((item) => `• ${item}`).join("\n") || "Not specified",
    guestsResources:
      unitPlan.guestsResources?.map((item) => `• ${item}`).join("\n") || "Not specified",
    communityEngagement: unitPlan.communityEngagement || "Not specified",

    // Reflection
    reflectionPriorToTeaching: unitPlan.reflectionPriorToTeaching || "Not specified",
    reflectionDuringTeaching: unitPlan.reflectionDuringTeaching || "Not specified",
    reflectionAfterTeaching: unitPlan.reflectionAfterTeaching || "Not specified",
    reflectionFuturePlanning: unitPlan.reflectionFuturePlanning || "Not specified",

    // Teachers
    contributingTeachers: unitPlan.contributingTeachers?.join(", ") || "Not specified",
    lessonCount: unitPlan.lessonCount || 0,

    // Helper functions for template
    hasSubunits: unitPlan.subunits && unitPlan.subunits.length > 0,
    hasFactualQuestions: unitPlan.factualQuestions && unitPlan.factualQuestions.length > 0,
    hasConceptualQuestions: unitPlan.conceptualQuestions && unitPlan.conceptualQuestions.length > 0,
    hasDebatableQuestions: unitPlan.debatableQuestions && unitPlan.debatableQuestions.length > 0,
    hasContributingTeachers:
      unitPlan.contributingTeachers && unitPlan.contributingTeachers.length > 0,
  };
}

/**
 * Create a default template for Docxtemplater
 * This can be used as a starting point for creating your own template
 */
export function getDefaultTemplateStructure(): string {
  return `
# Unit Plan Template Structure

## Basic Information
School Name: {schoolName}
Unit Title: {unitTitle}
Academic Year: {academicYear}
Subject: {subject}
MYP Year: {mypYear}

## Concepts and Understandings
Specified Concepts: {specifiedConcepts}
Key Concepts: {keyConcepts}
Related Concepts: {relatedConcepts}
Conceptual Understandings: {conceptualUnderstandings}
Global Context: {globalContext}
Global Context Explanation: {globalContextExplanation}

## Inquiry
Inquiry Statement: {inquiryStatement}

Factual Questions:
{factualQuestions}

Conceptual Questions:
{conceptualQuestions}

Debatable Questions:
{debatableQuestions}

## Assessment
Objectives:
{objectives}
Assessment Title: {assessmentTitle}
Assessment Type: {assessmentType}
Summative Assessment: {summativeAssessment}
Assessment Tasks:
{assessmentTasks}
Command Terms: {commandTerms}

## Context
Individual Context: {individualContext}
Local Context: {localContext}
Global Context Lens: {globalContextLens}

## ATL Skills
ATL Skills:
{atlSkills}
ATL Strategies: {atlStrategies}

ATL Cards Table:
{#atlCards}
Row {index}: {categoryCluster} | {atlSupport} | {strategy}
{/atlCards}

Note: In your Word template, create a table with 3 columns and use this loop:
{#atlCards}
{categoryCluster} | {atlSupport} | {strategy}
{/atlCards}

## Subunits
{#subunits}
Subunit {number}: {title}
Description: {description}
Lessons: {lessonsPerSubunit}
Interim Assessment: {interimAssessment}
Formative Assessment: {formativeAssessment}

{/subunits}

## Resources
{resources}

## Community Engagement
{communityEngagement}

## Reflection
Prior to Teaching: {reflectionPriorToTeaching}
During Teaching: {reflectionDuringTeaching}
After Teaching: {reflectionAfterTeaching}
Future Planning: {reflectionFuturePlanning}

## Contributing Teachers
{contributingTeachers}

Total Lessons: {lessonCount}
  `;
}

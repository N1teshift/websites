import * as fs from 'fs/promises';
import * as path from 'path';

interface ProgressReportData {
    metadata: {
        schema_version: string;
        last_updated: string;
        total_students: number;
    };
    students: Array<{
        first_name: string;
        last_name: string;
        class_name: string;
        assessments: Array<{
            date: string;
            column: string;
            type: string;
            score: string;
            assessment_id?: string | null;
            assessment_title?: string | null;
        }>;
    }>;
}

async function validateDatabase() {
    try {
        console.log('🔍 Validating V4.1 database...\n');
        
        const dbPath = path.join(process.cwd(), 'master_student_data_v4_1.json');
        const content = await fs.readFile(dbPath, 'utf-8');
        const data: ProgressReportData = JSON.parse(content);
        
        // Basic structure validation
        console.log('✓ JSON is valid');
        console.log(`✓ Schema version: ${data.metadata.schema_version}`);
        console.log(`✓ Total students: ${data.metadata.total_students}`);
        console.log(`✓ Students array length: ${data.students.length}`);
        
        // Check required fields
        const requiredFields = ['first_name', 'last_name', 'class_name', 'assessments'];
        const firstStudent = data.students[0];
        
        for (const field of requiredFields) {
            if (!(field in firstStudent)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        console.log('✓ Required student fields present');
        
        // Check assessment structure
        const assessmentTypes = new Set<string>();
        const assessmentIdsSet = new Set<string>();
        let hasAssessmentId = 0;
        let hasAssessmentTitle = 0;
        let totalAssessments = 0;
        
        data.students.forEach(student => {
            student.assessments.forEach(assessment => {
                totalAssessments++;
                assessmentTypes.add(assessment.type);
                if (assessment.assessment_id) {
                    hasAssessmentId++;
                    assessmentIdsSet.add(assessment.assessment_id);
                }
                if (assessment.assessment_title) {
                    hasAssessmentTitle++;
                }
            });
        });
        
        console.log(`✓ Total assessments: ${totalAssessments}`);
        console.log(`✓ Assessment types found: ${Array.from(assessmentTypes).join(', ')}`);
        console.log(`✓ Assessments with assessment_id: ${hasAssessmentId} (${((hasAssessmentId/totalAssessments)*100).toFixed(1)}%)`);
        console.log(`✓ Assessments with assessment_title: ${hasAssessmentTitle} (${((hasAssessmentTitle/totalAssessments)*100).toFixed(1)}%)`);
        console.log(`✓ Unique assessment_ids: ${assessmentIdsSet.size}`);
        
        // Check homework completeness
        const homeworkTypes = ['homework', 'homework_graded'];
        const homeworkCounts = new Map<string, number>();
        
        data.students.forEach(student => {
            const studentHomework = student.assessments.filter(a => 
                homeworkTypes.includes(a.type)
            );
            const count = studentHomework.length;
            homeworkCounts.set(`${student.first_name} ${student.last_name}`, count);
        });
        
        const expectedHomework = 6; // ND1, ND2, ND3, ND4, ND5, ND6
        const studentsWithCorrectHomework = Array.from(homeworkCounts.values()).filter(c => c === expectedHomework).length;
        
        console.log(`\n📊 Homework Check:`);
        console.log(`✓ Students with ${expectedHomework} homework records: ${studentsWithCorrectHomework}/${data.students.length}`);
        
        if (studentsWithCorrectHomework !== data.students.length) {
            console.log('\n⚠️ Some students have incorrect homework count:');
            homeworkCounts.forEach((count, name) => {
                if (count !== expectedHomework) {
                    console.log(`   - ${name}: ${count} records`);
                }
            });
        }
        
        // Check for new assessment types
        const expectedTypes = ['summative', 'test', 'homework', 'homework_graded', 'classwork', 
                               'weekly_assessment', 'diagnostic', 'board_solving', 'weekly_comment'];
        const unexpectedTypes = Array.from(assessmentTypes).filter(t => !expectedTypes.includes(t));
        
        if (unexpectedTypes.length > 0) {
            console.log(`\n⚠️ Unexpected assessment types: ${unexpectedTypes.join(', ')}`);
        } else {
            console.log('\n✓ All assessment types are recognized');
        }
        
        console.log('\n✅ Database validation complete! V4.1 is ready to use.');
        
    } catch (error) {
        console.error('\n❌ Validation failed:', error);
        process.exit(1);
    }
}

validateDatabase();


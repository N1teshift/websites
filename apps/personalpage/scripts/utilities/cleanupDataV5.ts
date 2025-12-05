/**
 * Data Cleanup Script for V5
 * Removes old/duplicate assessments while preserving valid data
 */

import fs from 'fs';
import path from 'path';

interface Assessment {
    date: string;
    column: string;
    type: string;
    task_name: string;
    score: string;
    comment: string;
    added: string;
    [key: string]: any;
}

interface StudentData {
    id: string;
    first_name: string;
    last_name: string;
    class_name: string;
    assessments: Assessment[];
    [key: string]: any;
}

interface MasterData {
    metadata: any;
    students: StudentData[];
}

class DataCleaner {
    private deletedCount = 0;
    private deletedByReason = new Map<string, number>();

    /**
     * Clean entire database
     */
    cleanData(data: MasterData): MasterData {
        console.log('🧹 Starting data cleanup...\n');
        
        for (const student of data.students) {
            this.cleanStudent(student);
        }
        
        this.reportResults();
        
        return data;
    }

    /**
     * Clean single student's assessments
     */
    private cleanStudent(student: StudentData) {
        if (!student.assessments || student.assessments.length === 0) {
            return;
        }

        const originalCount = student.assessments.length;
        
        student.assessments = student.assessments.filter(assessment => {
            return this.shouldKeepAssessment(assessment, student);
        });
        
        const deletedCount = originalCount - student.assessments.length;
        if (deletedCount > 0) {
            this.deletedCount += deletedCount;
        }
    }

    /**
     * Determine if assessment should be kept
     */
    private shouldKeepAssessment(assessment: Assessment, student: StudentData): boolean {
        const studentName = `${student.first_name} ${student.last_name}`;
        
        // Rule 1: Delete all Diag1 and Diag2 columns
        if (assessment.column === 'Diag1' || assessment.column === 'Diag2') {
            this.trackDeletion('Diag1/Diag2 columns', studentName, assessment);
            return false;
        }
        
        // Rule 2: Delete all PA columns
        if (assessment.column === 'PA') {
            this.trackDeletion('PA column (duplicate)', studentName, assessment);
            return false;
        }
        
        // Rule 3: Delete KD (no number) from Oct 10
        if (assessment.column === 'KD' && assessment.date === '2025-10-10') {
            this.trackDeletion('KD (no number) from Oct 10', studentName, assessment);
            return false;
        }
        
        // Rule 4: Delete ND1 weekly_assessment from Oct 10
        if (assessment.column === 'ND1' && 
            assessment.type === 'weekly_assessment' && 
            assessment.date === '2025-10-10') {
            this.trackDeletion('ND1 weekly_assessment Oct 10', studentName, assessment);
            return false;
        }
        
        // Rule 5: Delete all EXT assessments before Oct 20, 2025
        if (assessment.column.match(/^EXT\d+$/)) {
            const assessmentDate = new Date(assessment.date);
            const cutoffDate = new Date('2025-10-20');
            
            if (assessmentDate < cutoffDate) {
                this.trackDeletion('EXT before Oct 20', studentName, assessment);
                return false;
            }
        }
        
        // Rule 6: Delete assessments with score = "n"
        if (assessment.score === 'n') {
            this.trackDeletion('Score = "n"', studentName, assessment);
            return false;
        }
        
        // Keep this assessment
        return true;
    }

    /**
     * Track deletion for reporting
     */
    private trackDeletion(reason: string, studentName: string, assessment: Assessment) {
        const count = this.deletedByReason.get(reason) || 0;
        this.deletedByReason.set(reason, count + 1);
    }

    /**
     * Report cleanup results
     */
    private reportResults() {
        console.log('\n📊 Cleanup Report:\n');
        console.log(`✅ Total assessments deleted: ${this.deletedCount}\n`);
        
        console.log('Deletions by reason:');
        for (const [reason, count] of Array.from(this.deletedByReason.entries())) {
            console.log(`  - ${reason}: ${count}`);
        }
    }
}

// Main execution
function main() {
    const inputFile = process.argv[2] || 'data_2025-11-08.json';
    const jsonPath = path.join(process.cwd(), inputFile);
    
    console.log(`📖 Reading: ${inputFile}\n`);
    
    const content = fs.readFileSync(jsonPath, 'utf-8');
    const data: MasterData = JSON.parse(content);
    
    console.log(`📊 Database info:`);
    console.log(`   - Students: ${data.students.length}`);
    console.log(`   - Total assessments: ${data.students.reduce((sum, s) => sum + (s.assessments?.length || 0), 0)}\n`);
    
    // Clean data
    const cleaner = new DataCleaner();
    const cleanedData = cleaner.cleanData(data);
    
    // Update metadata
    cleanedData.metadata.exported_at = new Date().toISOString();
    cleanedData.metadata.cleaned_at = new Date().toISOString();
    
    // Save cleaned database
    const outputFile = inputFile.replace('.json', '_cleaned.json');
    const outputPath = path.join(process.cwd(), outputFile);
    
    console.log(`\n💾 Saving cleaned database: ${outputFile}`);
    fs.writeFileSync(outputPath, JSON.stringify(cleanedData, null, 2), 'utf-8');
    
    console.log('\n✨ Done! Your database has been cleaned.');
    console.log(`📁 Cleaned file: ${outputFile}`);
    console.log(`📁 Original file unchanged: ${inputFile}`);
}

try {
    main();
} catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
}


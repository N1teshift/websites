#!/usr/bin/env node

/**
 * Migrate student data from v2 to v3 schema
 * 
 * Major changes:
 * - Structured hierarchy (identity, academic, profile, engagement)
 * - Normalize Cambridge objectives (move to reference file)
 * - Add unique student IDs
 * - Convert string booleans to typed enums
 * - Add computed metrics
 * - Add academic year context
 * 
 * Usage: npx tsx scripts/migrateToV3.ts
 */

import fs from 'fs/promises';
import path from 'path';
import { StudentData } from '../../../src/features/modules/edtech/progressReport/student-data/types/StudentDataTypes';
import { StudentDataV3, LearningLevel } from '../../../src/features/modules/edtech/progressReport/student-data/types/StudentDataTypesV3';

const DATA_DIR = path.join(process.cwd(), 'src', 'features', 'student-data', 'data');
const BACKUP_DIR = path.join(process.cwd(), 'backups', `v2_backup_${new Date().toISOString().split('T')[0]}`);

// Academic year configuration
const ACADEMIC_YEAR = "2024-2025";
const GRADE = 8;

// Class to ID prefix mapping
const CLASS_TO_PREFIX: Record<string, string> = {
    "8 Vydūnas": "VYD",
    "8 A. J. Greimas": "GRE",
    "8 M. A. Gimbutienė": "GIM",
    "8 I. Veisaitė": "VEI"
};

// Objective code to ID mapping (from _cambridge_objectives.json)
const OBJECTIVE_CODE_TO_ID: Record<string, string> = {
    "9Ni.01": "obj_001", "9Ni.02": "obj_002", "9Ni.03": "obj_003", "9Ni.04": "obj_004",
    "9Ae.01": "obj_005", "9Ae.02": "obj_006", "9Ae.03": "obj_007", "9Ae.04": "obj_008",
    "9Ae.05": "obj_009", "9Ae.06": "obj_010", "9Ae.07": "obj_011",
    "9Np.01": "obj_012", "9Np.02": "obj_013",
    "9NF.01": "obj_014", "9NF.02": "obj_015", "9NF.03": "obj_016", "9NF.05": "obj_017",
    "9NF.06": "obj_018", "9NF.07": "obj_019", "9NF.08": "obj_020",
    "9Gg.01": "obj_021", "9Gg.02": "obj_022", "9Gg.03": "obj_023", "9Gg.04": "obj_024",
    "9Gg.05": "obj_025", "9Gg.06": "obj_026", "9Gg.07": "obj_027", "9Gg.08": "obj_028",
    "9Gg.09": "obj_029", "9Gg.10": "obj_030", "9Gg.11": "obj_031",
    "9Gp.01": "obj_032", "9Gp.02": "obj_033", "9Gp.03": "obj_034", "9Gp.04": "obj_035",
    "9Gp.05": "obj_036", "9Gp.06": "obj_037", "9Gp.07": "obj_038",
    "9Ss.01": "obj_039", "9Ss.02": "obj_040", "9Ss.03": "obj_041", "9Ss.04": "obj_042",
    "9Ss.05": "obj_043",
    "9Sp.01": "obj_044", "9Sp.02": "obj_045", "9Sp.03": "obj_046", "9Sp.04": "obj_047",
    "9As.01": "obj_048", "9As.02": "obj_049", "9As.03": "obj_050", "9As.04": "obj_051",
    "9As.05": "obj_052", "9As.06": "obj_053", "9As.07": "obj_054"
};

/**
 * Generate unique student ID
 */
function generateStudentId(firstName: string, lastName: string, className: string, index: number): string {
    const prefix = CLASS_TO_PREFIX[className] || "STU";
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitials = lastName.split(' ')[0].substring(0, 3).toUpperCase();
    const paddedIndex = String(index).padStart(3, '0');
    return `${prefix}-${firstInitial}${lastInitials}-${paddedIndex}`;
}

/**
 * Convert string boolean to LearningLevel
 */
function stringToLearningLevel(value: string): LearningLevel {
    if (value === "1") return "proficient";
    if (value === "0") return "needs_support";
    if (value === "0.5") return "developing";
    return "developing"; // default
}

/**
 * Calculate computed metrics
 */
function calculateComputedMetrics(v2Data: StudentData): any {
    const assessments = v2Data.assessments;
    
    // Group by type
    const homework = assessments.filter(a => a.type === 'homework');
    const classwork = assessments.filter(a => a.type === 'classwork');
    const summative = assessments.filter(a => a.type === 'summative');
    const participation = assessments.filter(a => a.type === 'participation');
    
    // Calculate averages (safely)
    const avg = (arr: any[], key: string = 'score') => {
        const nums = arr.map(a => parseFloat(a[key])).filter(n => !isNaN(n));
        return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    };
    
    const hwAvg = avg(homework);
    const cwAvg = avg(classwork);
    const sumAvg = avg(summative);
    const partAvg = avg(participation);
    const overall = (hwAvg + cwAvg + sumAvg + partAvg) / 4;
    
    // Completion rates
    const hwCompletion = homework.length > 0 ? 
        homework.filter(a => parseFloat(a.score) > 0).length / homework.length : 0;
    
    // Material completion
    const materials = Object.values(v2Data.material_completion || {});
    const matCompletion = materials.length > 0 ?
        materials.reduce((sum: number, m: any) => sum + m.percentage, 0) / (materials.length * 100) : 0;
    
    // Objective mastery
    const objectives = v2Data.cambridge_learning_objectives || [];
    const mastered = objectives.filter(o => o.level === 3).length;
    const proficient = objectives.filter(o => o.level === 2).length;
    const developing = objectives.filter(o => o.level === 1).length;
    const notStarted = objectives.filter(o => o.level === 0).length;
    
    return {
        last_computed: new Date().toISOString(),
        averages: {
            homework: Math.round(hwAvg * 100) / 100,
            classwork: Math.round(cwAvg * 100) / 100,
            summative: Math.round(sumAvg * 100) / 100,
            participation: Math.round(partAvg * 100) / 100,
            overall: Math.round(overall * 100) / 100
        },
        completion_rates: {
            homework: Math.round(hwCompletion * 100) / 100,
            material: Math.round(matCompletion * 100) / 100
        },
        trends: {
            period: "last_month",
            direction: "stable" as const,
            momentum: 0
        },
        objective_mastery: {
            mastered,
            proficient,
            developing,
            not_started: notStarted
        }
    };
}

/**
 * Migrate a single student from v2 to v3
 */
function migrateStudent(v2Data: StudentData, id: string): StudentDataV3 {
    // Convert Cambridge objectives to new format
    const cambridgeObjectives: Record<string, any> = {};
    (v2Data.cambridge_learning_objectives || []).forEach(obj => {
        const objId = OBJECTIVE_CODE_TO_ID[obj.code];
        if (objId) {
            cambridgeObjectives[objId] = {
                level: obj.level,
                last_assessed: v2Data.created || new Date().toISOString().split('T')[0],
                assessment_count: 0
            };
        }
    });
    
    // Convert material completion
    const materialCompletion: Record<string, any> = {};
    Object.entries(v2Data.material_completion || {}).forEach(([unit, data]: [string, any]) => {
        materialCompletion[`unit_${unit.replace('.', '_')}`] = {
            percentage: data.percentage,
            completed_date: data.percentage === 100 ? data.last_updated : undefined,
            last_updated: data.last_updated
        };
    });
    
    // Build v3 structure
    const v3Data: StudentDataV3 = {
        // IDENTITY
        id,
        first_name: v2Data.first_name,
        last_name: v2Data.last_name,
        class_name: v2Data.class_name,
        
        // ACADEMIC CONTEXT
        academic: {
            year: ACADEMIC_YEAR,
            grade: GRADE,
            class_id: v2Data.class_name.toLowerCase().replace(/\s+/g, '-'),
            enrolled_date: v2Data.created || `${ACADEMIC_YEAR.split('-')[0]}-09-01`
        },
        
        // PROFILE
        profile: {
            learning_attributes: {
                writing_quality: stringToLearningLevel(v2Data.profile?.writing_quality || ""),
                notebook_organization: stringToLearningLevel(v2Data.profile?.notebook_quality || ""),
                reflective_practice: stringToLearningLevel(v2Data.profile?.is_reflective || ""),
                math_communication: stringToLearningLevel(v2Data.profile?.math_communication || ""),
                seeks_tutoring: v2Data.profile?.has_corepetitor === "1"
            },
            notes: {
                date_of_birth: v2Data.profile?.date_of_birth,
                language_profile: v2Data.profile?.language_profile,
                strengths: v2Data.profile?.strengths || [],
                challenges: v2Data.profile?.challenges || [],
                interests: v2Data.profile?.motivation_and_interests || []
            }
        },
        
        // ASSESSMENTS (convert to v3 format)
        assessments: v2Data.assessments.map(a => ({
            ...a,
            type: a.type as any
        })),
        
        // CURRICULUM PROGRESS
        curriculum_progress: {
            cambridge_objectives: cambridgeObjectives,
            material_completion: materialCompletion
        },
        
        // ENGAGEMENT
        engagement: {
            attendance_records: v2Data.attendance_records || [],
            attendance_notes: v2Data.attendance_notes || [],
            consultations: v2Data.consultation_log || [],
            social_hours: v2Data.social_hours || 0
        },
        
        // CAMBRIDGE TESTS
        cambridge_tests: v2Data.cambridge_tests || [],
        
        // COMMUNICATION (only if has data)
        communication: (v2Data.reporting_checkpoints && v2Data.reporting_checkpoints.length > 0) ? {
            parent_contacts: [],
            teacher_notes: [],
            reporting_checkpoints: v2Data.reporting_checkpoints
        } : undefined,
        
        // COMPUTED METRICS
        computed_metrics: calculateComputedMetrics(v2Data),
        
        // CONDUCT (only if has data)
        conduct: (v2Data.conduct_notes && v2Data.conduct_notes.length > 0) ? {
            notes: v2Data.conduct_notes,
            praises: v2Data.praises_and_remarks?.map((p: any) => JSON.stringify(p)) || [],
            concerns: []
        } : undefined,
        
        // SYSTEM METADATA
        metadata: {
            schema_version: "3.0",
            created_at: v2Data.created ? `${v2Data.created}T00:00:00Z` : new Date().toISOString(),
            updated_at: new Date().toISOString(),
            migrations_applied: ["v2_to_v3"]
        }
    };
    
    return v3Data;
}

/**
 * Main migration function
 */
async function migrate() {
    console.log('📦 Student Data Migration v2 → v3\n');
    console.log('='.repeat(70));
    
    try {
        // Create backup directory
        console.log('\n📁 Creating backup...');
        await fs.mkdir(BACKUP_DIR, { recursive: true });
        
        // Read all student files
        const files = await fs.readdir(DATA_DIR);
        const studentFiles = files.filter(f => f.endsWith('.json') && !f.startsWith('_'));
        
        console.log(`Found ${studentFiles.length} student files`);
        
        // Group by class for ID generation
        const studentsByClass: Record<string, Array<{file: string, data: StudentData}>> = {};
        
        for (const file of studentFiles) {
            const filePath = path.join(DATA_DIR, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const v2Data: StudentData = JSON.parse(content);
            
            if (!studentsByClass[v2Data.class_name]) {
                studentsByClass[v2Data.class_name] = [];
            }
            studentsByClass[v2Data.class_name].push({ file, data: v2Data });
            
            // Backup original
            await fs.copyFile(filePath, path.join(BACKUP_DIR, file));
        }
        
        console.log(`✅ Backup created at: ${BACKUP_DIR}`);
        
        // Migrate students
        console.log('\n🔄 Migrating students...\n');
        
        let migrated = 0;
        let totalSizeBefore = 0;
        let totalSizeAfter = 0;
        
        for (const [className, students] of Object.entries(studentsByClass)) {
            console.log(`\n📚 Class: ${className} (${students.length} students)`);
            
            students.forEach(({ file, data }, index) => {
                // Generate unique ID
                const id = generateStudentId(data.first_name, data.last_name, className, index + 1);
                
                // Migrate
                const v3Data = migrateStudent(data, id);
                
                // Calculate sizes
                const oldSize = JSON.stringify(data).length;
                const newSize = JSON.stringify(v3Data).length;
                totalSizeBefore += oldSize;
                totalSizeAfter += newSize;
                
                // Save
                const filePath = path.join(DATA_DIR, file);
                fs.writeFile(filePath, JSON.stringify(v3Data, null, 2), 'utf-8');
                
                console.log(`  ✅ ${data.first_name} ${data.last_name} → ${id} (${oldSize}B → ${newSize}B)`);
                migrated++;
            });
        }
        
        // Wait for all writes
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Update metadata file
        console.log('\n📝 Updating metadata...');
        const metadataPath = path.join(DATA_DIR, '_metadata.json');
        const metadata = {
            created: new Date().toISOString().split('T')[0],
            last_updated: new Date().toISOString().split('T')[0],
            version: "4.0",
            schema_version: "3.0",
            storage_type: "individual_files_v3",
            total_students: migrated,
            academic_year: ACADEMIC_YEAR,
            grade: GRADE,
            migrated_from: "schema_v2",
            migration_date: new Date().toISOString()
        };
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
        
        // Summary
        console.log('\n' + '='.repeat(70));
        console.log('✅ Migration Complete!\n');
        console.log(`📊 Statistics:`);
        console.log(`   Students migrated: ${migrated}`);
        console.log(`   Total size before: ${(totalSizeBefore / 1024).toFixed(2)} KB`);
        console.log(`   Total size after: ${(totalSizeAfter / 1024).toFixed(2)} KB`);
        console.log(`   Size reduction: ${((1 - totalSizeAfter / totalSizeBefore) * 100).toFixed(1)}%`);
        console.log(`\n📁 Backup location: ${BACKUP_DIR}`);
        console.log('\n' + '='.repeat(70));
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        console.error('\n💡 To restore from backup:');
        console.error(`   cp ${BACKUP_DIR}/* ${DATA_DIR}/`);
        process.exit(1);
    }
}

migrate();


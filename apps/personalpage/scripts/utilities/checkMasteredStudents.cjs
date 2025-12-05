const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data_2025-11-09.json', 'utf-8'));

console.log('=== CAMBRIDGE OBJECTIVES ANALYSIS ===\n');

const studentsWithData = data.students.filter(s => 
    s.curriculum_progress?.cambridge_objectives && 
    Object.keys(s.curriculum_progress.cambridge_objectives).length > 0
);

const studentsMastered = studentsWithData.filter(s => {
    const objectives = s.curriculum_progress.cambridge_objectives;
    const unmasteredCount = Object.values(objectives).filter(obj => {
        if (obj.current_score === null) return false; // Don't count unassessed
        return obj.current_score < 1;
    }).length;
    return unmasteredCount === 0;
});

const studentsWithUnmastered = studentsWithData.filter(s => {
    const objectives = s.curriculum_progress.cambridge_objectives;
    const unmasteredCount = Object.values(objectives).filter(obj => {
        if (obj.current_score === null) return false;
        return obj.current_score < 1;
    }).length;
    return unmasteredCount > 0;
});

const studentsWithoutData = data.students.filter(s => 
    !s.curriculum_progress?.cambridge_objectives || 
    Object.keys(s.curriculum_progress.cambridge_objectives).length === 0
);

console.log(`Total Students: ${data.students.length}`);
console.log(`Students with Cambridge data: ${studentsWithData.length}`);
console.log(`Students with all objectives mastered: ${studentsMastered.length}`);
console.log(`Students with unmastered objectives: ${studentsWithUnmastered.length}`);
console.log(`Students without Cambridge data: ${studentsWithoutData.length}`);
console.log();

if (studentsMastered.length > 0) {
    console.log('🌟 STUDENTS WHO MASTERED EVERYTHING:');
    studentsMastered.forEach(s => {
        const objectives = s.curriculum_progress.cambridge_objectives;
        const totalObjectives = Object.keys(objectives).length;
        console.log(`  ✅ ${s.first_name} ${s.last_name} (${s.class_name}) - ${totalObjectives} objectives mastered`);
    });
    console.log();
}

if (studentsWithoutData.length > 0) {
    console.log('⚠️ STUDENTS WITHOUT CAMBRIDGE DATA:');
    studentsWithoutData.forEach(s => {
        console.log(`  ❌ ${s.first_name} ${s.last_name} (${s.class_name})`);
    });
    console.log();
}

console.log('Mission Creator should show:', studentsWithUnmastered.length, 'students');


export interface ATLSkill {
    id: string;
    name: string;
    category: string;
    subcategory?: string;
}

export const ATL_SKILLS: ATLSkill[] = [
    // Communication ATL Skills
    {
        id: 'understand-mathematical-notation',
        name: 'Understand and use mathematical notation',
        category: 'Communication',
        subcategory: 'Communication through language'
    },
    {
        id: 'take-effective-notes',
        name: 'Take effective notes in class',
        category: 'Communication',
        subcategory: 'Communication through language'
    },

    // Self-management ATL Skills
    {
        id: 'create-assessment-plans',
        name: 'Create plans to prepare for summative assessments (examinations and performances)',
        category: 'Self-management',
        subcategory: 'Organization skills'
    },
    {
        id: 'bring-necessary-equipment',
        name: 'Bring necessary equipment and supplies to class',
        category: 'Self-management',
        subcategory: 'Organization skills'
    },

    // Thinking ATL Skills - Critical thinking
    {
        id: 'interpret-data',
        name: 'Interpret data',
        category: 'Thinking',
        subcategory: 'Critical thinking'
    },
    {
        id: 'draw-conclusions',
        name: 'Draw reasonable conclusions and generalizations',
        category: 'Thinking',
        subcategory: 'Critical thinking'
    },
    {
        id: 'analyze-synthesize-concepts',
        name: 'Analyze complex concepts and projects into their constituent parts and synthesize them to create new understanding',
        category: 'Thinking',
        subcategory: 'Critical thinking'
    },
    {
        id: 'propose-evaluate-solutions',
        name: 'Propose and evaluate a variety of solutions',
        category: 'Thinking',
        subcategory: 'Critical thinking'
    },
    {
        id: 'use-models-simulations',
        name: 'Use models and simulations to explore complex systems and issues',
        category: 'Thinking',
        subcategory: 'Critical thinking'
    },

    // Thinking ATL Skills - Creative thinking
    {
        id: 'use-visible-thinking',
        name: 'Use visible thinking strategies and techniques',
        category: 'Thinking',
        subcategory: 'Creative thinking'
    }
];

export const getATLSkillsByCategory = (): Record<string, ATLSkill[]> => {
    return ATL_SKILLS.reduce((acc, skill) => {
        if (!acc[skill.category]) {
            acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
    }, {} as Record<string, ATLSkill[]>);
};

export const getATLSkillById = (id: string): ATLSkill | undefined => {
    return ATL_SKILLS.find(skill => skill.id === id);
};

// Get ATL skills based on subject - currently only mathematics has defined skills
export const getATLSkillsBySubject = (subjectId: string): ATLSkill[] => {
    switch (subjectId) {
        case 'mathematics':
            return ATL_SKILLS;
        default:
            return []; // Return empty array for subjects without defined ATL skills
    }
};

export const formatATLSkillsForDisplay = (selectedSkillIds: string[]): string => {
    const selectedSkills = selectedSkillIds.map(id => getATLSkillById(id)).filter(Boolean) as ATLSkill[];
    
    if (selectedSkills.length === 0) return '';
    
    const groupedSelected = selectedSkills.reduce((acc, skill) => {
        if (!acc[skill.category]) {
            acc[skill.category] = {};
        }
        if (!acc[skill.category][skill.subcategory || 'General']) {
            acc[skill.category][skill.subcategory || 'General'] = [];
        }
        acc[skill.category][skill.subcategory || 'General'].push(skill.name);
        return acc;
    }, {} as Record<string, Record<string, string[]>>);
    
    const result: string[] = [];
    
    for (const [category, subcategories] of Object.entries(groupedSelected)) {
        for (const [subcategory, skills] of Object.entries(subcategories)) {
            if (subcategory === 'General') {
                result.push(`${category} – ${skills.join(', ')}`);
            } else {
                result.push(`${category} – ${subcategory} (${skills.join(', ')})`);
            }
        }
    }
    
    return result.join('\n');
};




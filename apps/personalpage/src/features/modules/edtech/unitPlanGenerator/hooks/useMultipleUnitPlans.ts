import { useState, useCallback, useMemo, useEffect } from 'react';
import { UnitPlanData, UnitPlanDocument, SubunitData, QuestionType, AssessmentTask, ATLCard, ActivityCard, LearningExperienceCard, CurriculumConnection } from '../types/UnitPlanTypes';
import { getEmptyUnitPlanData, calculateTotalLessonCount } from '../utils/unitPlanUtils';

const generateId = () => {
    return `unit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const generateName = (data: UnitPlanData, existingNames: string[]) => {
    const baseName = data.unitTitle || 'Untitled Unit Plan';
    let name = baseName;
    let counter = 1;
    
    while (existingNames.includes(name)) {
        counter++;
        name = `${baseName} (${counter})`;
    }
    
    return name;
};

// Check if a unit plan is still fresh (empty and unedited)
const isUnitPlanFresh = (plan: UnitPlanDocument): boolean => {
    const emptyData = getEmptyUnitPlanData();
    const data = plan.data;
    
    // Check if the name is the default "Unit Plan 1"
    if (plan.name !== 'Unit Plan 1') return false;
    
    // Check all string fields
    const stringFields: (keyof UnitPlanData)[] = [
        'schoolName', 'unitTitle', 'unitContent', 'academicYear', 'subject',
        'conceptualUnderstandings', 'globalContext', 'globalContextExplanation',
        'inquiryStatement', 'assessmentTitle', 'summativeAssessment',
        'summativeAssessmentRelationshipDescription', 'assessmentType',
        'individualContext', 'localContext', 'globalContextLens', 'atlStrategies',
        'resources', 'communityEngagement', 'reflectionPriorToTeaching',
        'reflectionDuringTeaching', 'reflectionAfterTeaching', 'reflectionFuturePlanning'
    ];
    
    for (const field of stringFields) {
        if (data[field] !== emptyData[field]) return false;
    }
    
    // Check array fields
    const arrayFields: (keyof UnitPlanData)[] = [
        'specifiedConcepts', 'keyConcepts', 'relatedConcepts',
        'factualQuestions', 'conceptualQuestions', 'debatableQuestions',
        'objectives', 'assessmentTasks', 'commandTerms', 'atlSkills',
        'atlCards', 'learningExperienceCards', 'subunits',
        'priorKnowledgeSubjectSpecific', 'priorKnowledgeLearningSkills',
        'topicsTerminology', 'conceptualKnowledge', 'proceduralKnowledge',
        'informalFormativeAssessment', 'formalFormativeAssessment',
        'differentiationByAccess', 'differentiationByProcess', 'differentiationByProduct',
        'printedResources', 'digitalResources', 'guestsResources', 'contributingTeachers',
        'curriculumConnections'
    ];
    
    for (const field of arrayFields) {
        const dataArray = data[field] as unknown[];
        const emptyArray = emptyData[field] as unknown[];
        if (dataArray.length !== emptyArray.length) return false;
    }
    
    // Check numeric fields
    if (data.lessonCount !== 0 || data.mypYear !== 0) return false;
    
    return true;
};

// Migrate old data format to new format
const migrateUnitPlanData = (data: Partial<UnitPlanData> & Record<string, unknown>): UnitPlanData => {
    // Handle old displayMode field
    if ('displayMode' in data && !('outputMapping' in data)) {
        const oldMode = data.displayMode as string;
        data.outputMapping = (oldMode === 'full' ? 'custom' : oldMode) as 'current' | 'enhanced' | 'custom';
        delete data.displayMode;
    }
    
    // Migrate editorDisplayMode to viewingMode
    if ('editorDisplayMode' in data && !('viewingMode' in data)) {
        // Old editorDisplayMode doesn't matter for migration, always default to 'individual'
        delete data.editorDisplayMode;
    }
    
    // Add viewingMode if missing
    if (!('viewingMode' in data)) {
        data.viewingMode = 'individual';
    }
    
    return data as UnitPlanData;
};

export const useMultipleUnitPlans = () => {
    // Always initialize empty to prevent hydration mismatch - populate on client via useEffect
    const [unitPlans, setUnitPlans] = useState<UnitPlanDocument[]>(() => []);
    
    // Initialize activeUnitPlanId as empty - will be set in useEffect
    const [activeUnitPlanId, setActiveUnitPlanId] = useState<string>('');

    // Initialize state on client side only to prevent hydration mismatch
    useEffect(() => {
        // Initialize with first plan if empty (prevents SSR/client ID mismatch)
        if (unitPlans.length === 0) {
            const initialPlan: UnitPlanDocument = {
                id: generateId(),
                name: 'Unit Plan 1',
                data: getEmptyUnitPlanData(),
                lastModified: new Date()
            };
            setUnitPlans([initialPlan]);
            setActiveUnitPlanId(initialPlan.id);
        }
    }, []); // Run only once on mount

    // Get the currently active unit plan
    const currentUnitPlan = useMemo(() => {
        const plan = unitPlans.find(plan => plan.id === activeUnitPlanId) || unitPlans[0];
        // Return a default empty plan if no plans exist yet (prevents SSR errors)
        if (!plan) {
            return {
                id: '',
                name: 'Unit Plan 1',
                data: getEmptyUnitPlanData(),
                lastModified: new Date()
            };
        }
        return plan;
    }, [unitPlans, activeUnitPlanId]);

    // Get the index of the current unit plan
    const currentIndex = useMemo(() => {
        return unitPlans.findIndex(plan => plan.id === activeUnitPlanId);
    }, [unitPlans, activeUnitPlanId]);

    // Switch to a different unit plan
    const switchToUnitPlan = useCallback((id: string) => {
        const plan = unitPlans.find(p => p.id === id);
        if (plan) {
            setActiveUnitPlanId(id);
        }
    }, [unitPlans]);

    // Add a new unit plan
    const addUnitPlan = useCallback((data?: UnitPlanData, name?: string) => {
        const existingNames = unitPlans.map(p => p.name);
        const planData = data || getEmptyUnitPlanData();
        const planName = name || generateName(planData, existingNames);
        
        const newPlan: UnitPlanDocument = {
            id: generateId(),
            name: planName,
            data: planData,
            lastModified: new Date()
        };

        setUnitPlans(prev => [...prev, newPlan]);
        setActiveUnitPlanId(newPlan.id);
        
        return newPlan.id;
    }, [unitPlans]);

    // Duplicate current plan with basic info only
    const duplicateUnitPlanWithBasicInfo = useCallback(() => {
        const currentData = currentUnitPlan.data;
        const emptyData = getEmptyUnitPlanData();
        
        const basicInfoData: UnitPlanData = {
            ...emptyData,
            schoolName: currentData.schoolName,
            unitTitle: currentData.unitTitle,
            unitContent: currentData.unitContent,
            academicYear: currentData.academicYear,
            subject: currentData.subject,
            mypYear: currentData.mypYear,
            unitOrder: currentData.unitOrder,
            outputMapping: currentData.outputMapping,
            viewingMode: currentData.viewingMode,
            specifiedConcepts: [...currentData.specifiedConcepts],
            keyConcepts: [...currentData.keyConcepts],
            relatedConcepts: [...currentData.relatedConcepts],
            globalContext: currentData.globalContext,
            contributingTeachers: [...currentData.contributingTeachers]
        };
        
        const existingNames = unitPlans.map(p => p.name);
        const baseName = `${currentUnitPlan.name} (Copy)`;
        let newName = baseName;
        let counter = 1;
        
        while (existingNames.includes(newName)) {
            counter++;
            newName = `${baseName} ${counter}`;
        }
        
        return addUnitPlan(basicInfoData, newName);
    }, [currentUnitPlan, unitPlans, addUnitPlan]);

    // Remove a unit plan
    const removeUnitPlan = useCallback((id: string) => {
        setUnitPlans(prev => {
            const filtered = prev.filter(plan => plan.id !== id);
            
            // If we're removing the active plan, switch to another one
            if (id === activeUnitPlanId && filtered.length > 0) {
                const currentIdx = prev.findIndex(p => p.id === id);
                const newActiveIdx = Math.max(0, Math.min(currentIdx, filtered.length - 1));
                setActiveUnitPlanId(filtered[newActiveIdx].id);
            }
            
            // Keep at least one empty plan
            if (filtered.length === 0) {
                const emptyPlan: UnitPlanDocument = {
                    id: generateId(),
                    name: 'Unit Plan 1',
                    data: getEmptyUnitPlanData(),
                    lastModified: new Date()
                };
                setActiveUnitPlanId(emptyPlan.id);
                return [emptyPlan];
            }
            
            return filtered;
        });
    }, [activeUnitPlanId]);

    // Update a specific field of the current unit plan
    const updateUnitPlan = useCallback((field: keyof UnitPlanData, value: string | string[] | number | SubunitData[] | AssessmentTask[] | ATLCard[] | ActivityCard[] | LearningExperienceCard[] | CurriculumConnection[] | undefined) => {
        setUnitPlans(prev => prev.map(plan => 
            plan.id === activeUnitPlanId
                ? {
                    ...plan,
                    data: { ...plan.data, [field]: value },
                    lastModified: new Date()
                }
                : plan
        ));
    }, [activeUnitPlanId]);

    // Update the name of a unit plan
    const updateUnitPlanName = useCallback((id: string, newName: string) => {
        setUnitPlans(prev => prev.map(plan =>
            plan.id === id
                ? { ...plan, name: newName, lastModified: new Date() }
                : plan
        ));
    }, []);

    // Update subunit in current plan
    const updateSubunit = useCallback((subunitIndex: number, field: keyof SubunitData, value: string | number | string[]) => {
        setUnitPlans(prev => prev.map(plan => {
            if (plan.id !== activeUnitPlanId) return plan;
            
            const updatedSubunits = plan.data.subunits.map((subunit, index) => 
                index === subunitIndex ? { ...subunit, [field]: value } : subunit
            );
            
            return {
                ...plan,
                data: {
                    ...plan.data,
                    subunits: updatedSubunits,
                    lessonCount: field === 'lessonsPerSubunit' ? calculateTotalLessonCount(updatedSubunits) : plan.data.lessonCount
                },
                lastModified: new Date()
            };
        }));
    }, [activeUnitPlanId]);

    // Add subunit to current plan
    const addSubunit = useCallback(() => {
        setUnitPlans(prev => prev.map(plan => {
            if (plan.id !== activeUnitPlanId) return plan;
            
            const newSubunitNumber = plan.data.subunits.length + 1;
            const newSubunit: SubunitData = {
                subunitNumber: newSubunitNumber,
                lessonsPerSubunit: 1,
                subunitName: '',
                content: '',
                priorKnowledgeSubjectSpecific: [],
                priorKnowledgeLearningSkills: [],
                topicsTerminology: [],
                conceptualKnowledge: [],
                proceduralKnowledge: [],
                successCriteria: [],
                activities: '',
                learningExperiences: '',
                differentiation: '',
                summativeAssessment: '',
                interimAssessment: '',
                formativeAssessment: ''
            };
            
            const updatedSubunits = [...plan.data.subunits, newSubunit];
            
            return {
                ...plan,
                data: {
                    ...plan.data,
                    subunits: updatedSubunits,
                    lessonCount: calculateTotalLessonCount(updatedSubunits)
                },
                lastModified: new Date()
            };
        }));
    }, [activeUnitPlanId]);

    // Remove subunit from current plan
    const removeSubunit = useCallback((subunitIndex: number) => {
        setUnitPlans(prev => prev.map(plan => {
            if (plan.id !== activeUnitPlanId) return plan;
            
            const updatedSubunits = plan.data.subunits.filter((_, index) => index !== subunitIndex);
            const renumberedSubunits = updatedSubunits.map((subunit, index) => ({
                ...subunit,
                subunitNumber: index + 1
            }));
            
            return {
                ...plan,
                data: {
                    ...plan.data,
                    subunits: renumberedSubunits,
                    lessonCount: calculateTotalLessonCount(renumberedSubunits)
                },
                lastModified: new Date()
            };
        }));
    }, [activeUnitPlanId]);

    // Add question to current plan
    const addQuestion = useCallback((type: QuestionType) => {
        setUnitPlans(prev => prev.map(plan =>
            plan.id === activeUnitPlanId
                ? {
                    ...plan,
                    data: {
                        ...plan.data,
                        [type]: [...plan.data[type], '']
                    },
                    lastModified: new Date()
                }
                : plan
        ));
    }, [activeUnitPlanId]);

    // Update question in current plan
    const updateQuestion = useCallback((type: QuestionType, index: number, value: string) => {
        setUnitPlans(prev => prev.map(plan =>
            plan.id === activeUnitPlanId
                ? {
                    ...plan,
                    data: {
                        ...plan.data,
                        [type]: plan.data[type].map((question, i) => i === index ? value : question)
                    },
                    lastModified: new Date()
                }
                : plan
        ));
    }, [activeUnitPlanId]);

    // Remove question from current plan
    const removeQuestion = useCallback((type: QuestionType, index: number) => {
        setUnitPlans(prev => prev.map(plan =>
            plan.id === activeUnitPlanId
                ? {
                    ...plan,
                    data: {
                        ...plan.data,
                        [type]: plan.data[type].filter((_, i) => i !== index)
                    },
                    lastModified: new Date()
                }
                : plan
        ));
    }, [activeUnitPlanId]);

    // Add teacher to current plan
    const addTeacher = useCallback((teacherName: string) => {
        if (teacherName.trim() && !currentUnitPlan.data.contributingTeachers.includes(teacherName.trim())) {
            setUnitPlans(prev => prev.map(plan =>
                plan.id === activeUnitPlanId
                    ? {
                        ...plan,
                        data: {
                            ...plan.data,
                            contributingTeachers: [...plan.data.contributingTeachers, teacherName.trim()]
                        },
                        lastModified: new Date()
                    }
                    : plan
            ));
        }
    }, [activeUnitPlanId, currentUnitPlan]);

    // Remove teacher from current plan
    const removeTeacher = useCallback((teacherIndex: number) => {
        setUnitPlans(prev => prev.map(plan =>
            plan.id === activeUnitPlanId
                ? {
                    ...plan,
                    data: {
                        ...plan.data,
                        contributingTeachers: plan.data.contributingTeachers.filter((_, index) => index !== teacherIndex)
                    },
                    lastModified: new Date()
                }
                : plan
        ));
    }, [activeUnitPlanId]);

    // Export a specific unit plan to JSON
    const exportToJSON = useCallback((id?: string) => {
        const planToExport = id ? unitPlans.find(p => p.id === id) : currentUnitPlan;
        
        if (!planToExport) return;
        
        const dataStr = JSON.stringify(planToExport.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        try {
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${planToExport.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading JSON:', error);
            const url = URL.createObjectURL(dataBlob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
    }, [unitPlans, currentUnitPlan]);

    // Export all unit plans as a collection
    const exportCollectionToJSON = useCallback(() => {
        const collection = {
            type: 'unit-plan-collection',
            version: '1.0',
            exportDate: new Date().toISOString(),
            planCount: unitPlans.length,
            plans: unitPlans.map(plan => ({
                name: plan.name,
                data: plan.data,
                lastModified: plan.lastModified
            }))
        };
        
        const dataStr = JSON.stringify(collection, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const timestamp = new Date().toISOString().split('T')[0];
        
        try {
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `unit_plan_collection_${timestamp}.json`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading collection JSON:', error);
            const url = URL.createObjectURL(dataBlob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
    }, [unitPlans]);

    // Get all unit plans for combined HTML export
    const getAllUnitPlansForExport = useCallback(() => {
        return unitPlans.map(plan => ({
            name: plan.name,
            data: plan.data
        }));
    }, [unitPlans]);

    // Import unit plans from JSON files (smart detection of single/multiple/collection)
    const importFromJSON = useCallback(async (files: File[]): Promise<number> => {
        let successCount = 0;
        const existingNames = unitPlans.map(p => p.name);
        
        for (const file of files) {
            try {
                const text = await file.text();
                const importedData = JSON.parse(text);
                
                // Check if it's a collection file
                if (importedData && 
                    typeof importedData === 'object' && 
                    importedData.type === 'unit-plan-collection' &&
                    Array.isArray(importedData.plans)) {
                    
                    // Import all plans from the collection
                    for (const planData of importedData.plans) {
                        if (planData.data && typeof planData.data === 'object' && 'unitTitle' in planData.data) {
                            const migratedData = migrateUnitPlanData(planData.data);
                            const planName = migratedData.unitTitle || planData.name || generateName(migratedData, [...existingNames]);
                            existingNames.push(planName);
                            
                            const newPlan: UnitPlanDocument = {
                                id: generateId(),
                                name: planName,
                                data: migratedData,
                                lastModified: planData.lastModified ? new Date(planData.lastModified) : new Date()
                            };
                            
                            setUnitPlans(prev => [...prev, newPlan]);
                            successCount++;
                        }
                    }
                }
                // Check if it's a single unit plan file
                else if (importedData && typeof importedData === 'object' && 'unitTitle' in importedData) {
                    // Migrate old data format to new format
                    const migratedData = migrateUnitPlanData(importedData);
                    
                    const planName = generateName(migratedData, [...existingNames]);
                    existingNames.push(planName);
                    
                    const newPlan: UnitPlanDocument = {
                        id: generateId(),
                        name: planName,
                        data: migratedData,
                        lastModified: new Date()
                    };
                    
                    setUnitPlans(prev => [...prev, newPlan]);
                    successCount++;
                } else {
                    console.error(`Invalid file format: ${file.name}`);
                }
            } catch (error) {
                console.error(`Error importing file ${file.name}:`, error);
            }
        }
        
        // After successful import, remove the default empty unit plan if it's still fresh
        if (successCount > 0) {
            setUnitPlans(prev => {
                // Check if the first plan is fresh and there's more than one plan
                if (prev.length > 1 && isUnitPlanFresh(prev[0])) {
                    // Remove the first (default) plan
                    const filtered = prev.slice(1);
                    
                    // If the removed plan was active, switch to the first remaining plan
                    if (activeUnitPlanId === prev[0].id && filtered.length > 0) {
                        setActiveUnitPlanId(filtered[0].id);
                    }
                    
                    return filtered;
                }
                return prev;
            });
        }
        
        return successCount;
    }, [unitPlans, activeUnitPlanId]);

    // Year Plan View methods - update any plan by ID
    const updateSubunitByPlanId = useCallback((planId: string, subunitIndex: number, field: keyof SubunitData, value: string | number | string[]) => {
        setUnitPlans(prev => prev.map(plan => {
            if (plan.id !== planId) return plan;
            
            const updatedSubunits = plan.data.subunits.map((subunit, index) => 
                index === subunitIndex ? { ...subunit, [field]: value } : subunit
            );
            
            return {
                ...plan,
                data: {
                    ...plan.data,
                    subunits: updatedSubunits,
                    lessonCount: field === 'lessonsPerSubunit' ? calculateTotalLessonCount(updatedSubunits) : plan.data.lessonCount
                },
                lastModified: new Date()
            };
        }));
    }, []);

    const addSubunitByPlanId = useCallback((planId: string) => {
        setUnitPlans(prev => prev.map(plan => {
            if (plan.id !== planId) return plan;
            
            const newSubunitNumber = plan.data.subunits.length + 1;
            const newSubunit: SubunitData = {
                subunitNumber: newSubunitNumber,
                lessonsPerSubunit: 1,
                subunitName: '',
                content: '',
                priorKnowledgeSubjectSpecific: [],
                priorKnowledgeLearningSkills: [],
                topicsTerminology: [],
                conceptualKnowledge: [],
                proceduralKnowledge: [],
                successCriteria: [],
                activities: '',
                learningExperiences: '',
                differentiation: '',
                summativeAssessment: '',
                interimAssessment: '',
                formativeAssessment: ''
            };
            
            const updatedSubunits = [...plan.data.subunits, newSubunit];
            
            return {
                ...plan,
                data: {
                    ...plan.data,
                    subunits: updatedSubunits,
                    lessonCount: calculateTotalLessonCount(updatedSubunits)
                },
                lastModified: new Date()
            };
        }));
    }, []);

    const removeSubunitByPlanId = useCallback((planId: string, subunitIndex: number) => {
        setUnitPlans(prev => prev.map(plan => {
            if (plan.id !== planId) return plan;
            
            const updatedSubunits = plan.data.subunits
                .filter((_, index) => index !== subunitIndex)
                .map((subunit, index) => ({ ...subunit, subunitNumber: index + 1 }));
            
            return {
                ...plan,
                data: {
                    ...plan.data,
                    subunits: updatedSubunits,
                    lessonCount: calculateTotalLessonCount(updatedSubunits)
                },
                lastModified: new Date()
            };
        }));
    }, []);

    const updateCommunityEngagementByPlanId = useCallback((planId: string, value: string) => {
        setUnitPlans(prev => prev.map(plan => {
            if (plan.id !== planId) return plan;
            
            return {
                ...plan,
                data: {
                    ...plan.data,
                    communityEngagement: value
                },
                lastModified: new Date()
            };
        }));
    }, []);

    const updateReflectionByPlanId = useCallback((planId: string, field: 'reflectionPriorToTeaching' | 'reflectionDuringTeaching' | 'reflectionAfterTeaching' | 'reflectionFuturePlanning', value: string) => {
        setUnitPlans(prev => prev.map(plan => {
            if (plan.id !== planId) return plan;
            
            return {
                ...plan,
                data: {
                    ...plan.data,
                    [field]: value
                },
                lastModified: new Date()
            };
        }));
    }, []);

    return {
        unitPlans,
        currentUnitPlan,
        currentIndex,
        activeUnitPlanId,
        unitPlan: currentUnitPlan?.data || getEmptyUnitPlanData(), // For backward compatibility, with fallback
        switchToUnitPlan,
        addUnitPlan,
        duplicateUnitPlanWithBasicInfo,
        removeUnitPlan,
        updateUnitPlanName,
        updateUnitPlan,
        updateSubunit,
        addSubunit,
        removeSubunit,
        addQuestion,
        updateQuestion,
        removeQuestion,
        addTeacher,
        removeTeacher,
        exportToJSON,
        exportCollectionToJSON,
        importFromJSON,
        getAllUnitPlansForExport,
        updateSubunitByPlanId,
        addSubunitByPlanId,
        removeSubunitByPlanId,
        updateCommunityEngagementByPlanId,
        updateReflectionByPlanId
    };
};





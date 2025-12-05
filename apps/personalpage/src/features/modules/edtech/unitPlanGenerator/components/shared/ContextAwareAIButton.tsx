import React, { useState } from 'react';
import { UnitPlanData, SubunitData } from '../../types/UnitPlanTypes';
import { UnitPlanGenerationOptions } from '@/features/infrastructure/ai/shared/services/unitPlanAI';
import { getModelResponse } from '@/features/infrastructure/ai/shared/services/openaiResponsesClient';
import { ResponsesResult } from '@/features/infrastructure/ai/types';
import { createComponentLogger } from '@websites/infrastructure/logging';

interface ContextAwareAIButtonProps<K extends keyof UnitPlanData | string> {
    /** The field name to generate content for */
    fieldName: K;
    /** The complete unit plan context */
    unitPlanContext: Partial<UnitPlanData>;
    /** Callback when content is generated */
    onGenerate: (content: string | string[] | number | SubunitData[]) => void;
    /** Button size */
    size?: 'sm' | 'md' | 'lg';
    /** Additional CSS classes */
    className?: string;
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Generation options */
    options?: UnitPlanGenerationOptions;
    /** Custom prompt override (optional) - not currently used */
    _customPrompt?: string;
    /** Subunit-specific context (for subunit fields) */
    subunitContext?: {
        subunitIndex: number;
        subunitNumber: number;
    };
}

/**
 * Context-Aware AI Generate Button
 * 
 * An enhanced AI generation button that leverages the full unit plan context
 * to generate more relevant and coherent content for specific fields.
 */
const ContextAwareAIButton = React.memo(<K extends keyof UnitPlanData | string>({
    fieldName,
    unitPlanContext,
    onGenerate,
    size = 'md',
    className = '',
    disabled = false,
    options = {},
    _customPrompt,
    subunitContext
}: ContextAwareAIButtonProps<K>) => {
    const [isLoading, setIsLoading] = useState(false);
    const logger = createComponentLogger('ContextAwareAIButton');

    const sizeClasses = {
        sm: 'w-3 h-3 text-xs',
        md: 'w-4 h-4 text-sm',
        lg: 'w-5 h-5 text-base'
    };

    const handleClick = async () => {
        if (disabled || isLoading) return;

        setIsLoading(true);
        try {
            logger.info(`Generating content for ${String(fieldName)}`, {
                fieldName,
                contextKeys: Object.keys(unitPlanContext),
                hasSubject: !!unitPlanContext.subject,
                hasConcepts: !!unitPlanContext.specifiedConcepts?.length,
                subunitContext
            });

            // Use the same approach for all fields - generate custom prompts
            const prompt = buildFieldPrompt(fieldName, unitPlanContext, subunitContext);
            logger.info(`Generated prompt for ${String(fieldName)}: ${prompt}`);
            logger.info(`Unit plan context being sent:`, {
                unitTitle: unitPlanContext.unitTitle,
                subject: unitPlanContext.subject,
                concepts: unitPlanContext.specifiedConcepts,
                subunitContext
            });
            
            const generatedContent = await generateFieldContent(prompt, options);

            logger.info(`Generated content: ${typeof generatedContent === 'string' ? generatedContent.substring(0, 100) + '...' : String(generatedContent)}`);

            if (generatedContent !== undefined && generatedContent !== null) {
                onGenerate(generatedContent);
            } else {
                logger.error('No content generated');
                alert('No content was generated. Please try again.');
            }
        } catch (error) {
            logger.error(`Error generating content for ${String(fieldName)}: ${error instanceof Error ? error.message : String(error)}`);
            
            // Provide user-friendly error messages
            if (error instanceof Error) {
                if (error.message.includes('401') || error.message.includes('403')) {
                    alert('OpenAI API key not configured. Please check your environment variables.');
                } else if (error.message.includes('429')) {
                    alert('Rate limit exceeded. Please try again later.');
                } else if (error.message.includes('context')) {
                    alert('Please fill in more unit plan details to provide better context for AI generation.');
                } else {
                    alert(`Failed to generate content: ${error.message}`);
                }
            } else {
                alert('Failed to generate content. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Field dependency mapping for context-aware prompts
    const fieldDependencies: Record<string, (keyof UnitPlanData)[]> = {
        // Basic info - minimal dependencies
        schoolName: [],
        academicYear: [],
        subject: [],
        mypYear: [],
        contributingTeachers: [],
        unitTitle: [],
        
        // Inquiry fields
        outputMapping: ['subject'],
        specifiedConcepts: ['subject', 'mypYear'],
        keyConcepts: ['subject', 'mypYear'],
        relatedConcepts: ['subject', 'mypYear'],
        conceptualUnderstandings: ['specifiedConcepts', 'unitTitle'],
        globalContext: ['unitTitle'],
        globalContextExplanation: ['globalContext', 'specifiedConcepts', 'unitTitle'],
        inquiryStatement: ['specifiedConcepts', 'conceptualUnderstandings', 'globalContext', 'unitTitle'],
        
        // Question fields
        factualQuestions: ['unitTitle'],
        conceptualQuestions: ['specifiedConcepts', 'conceptualUnderstandings'],
        debatableQuestions: ['inquiryStatement', 'globalContext'],
        
        // Planning fields
        objectives: ['subject', 'mypYear'],
        assessmentTitle: ['inquiryStatement', 'unitTitle', 'objectives'],
        assessmentType: ['inquiryStatement', 'unitTitle', 'objectives'],
        summativeAssessment: ['inquiryStatement', 'specifiedConcepts', 'objectives'],
        commandTerms: ['objectives'],
        atlSkills: ['summativeAssessment'],
        atlStrategies: ['atlSkills'],
        
        // Resources & Community
        resources: ['unitTitle'], // Will be enhanced with lesson content when available
        communityEngagement: ['globalContext', 'inquiryStatement'],
        
        // Reflection fields
        reflectionPriorToTeaching: ['unitTitle', 'objectives'],
        reflectionDuringTeaching: ['unitTitle'], // Will be enhanced with lesson content
        reflectionAfterTeaching: ['summativeAssessment'],
        reflectionFuturePlanning: ['unitTitle'] // Will be enhanced with overall experience
    };

    // Helper function to build context-aware prompts for any field
    const buildFieldPrompt = (
        fieldName: string, 
        unitPlanContext: Partial<UnitPlanData>, 
        subunitContext?: { subunitIndex: number; subunitNumber: number }
    ): string => {
        const unitTitle = unitPlanContext.unitTitle || 'this unit';
        const subject = unitPlanContext.subject || 'this subject';
        const _concepts = unitPlanContext.specifiedConcepts?.join(', ') || '';
        
        // Get dependencies for this field
        const dependencies = fieldDependencies[fieldName] || [];
        const availableContext = buildContextString(dependencies, unitPlanContext, subunitContext);
        
        // Check if critical dependencies are missing
        const missingCritical = checkMissingCriticalDependencies(fieldName, unitPlanContext);
        const contextWarning = missingCritical ? `\n\n⚠️ NOTE: Some important context is missing (${missingCritical.join(', ')}). Consider filling these fields first for better results.` : '';

        // Subunit-specific field prompts with enhanced context
        if (subunitContext) {
            const subunitNumber = subunitContext.subunitNumber;
            const subunitFieldPrompts: Record<string, string> = {
                content: `Generate engaging subunit content for subunit ${subunitNumber} about "${unitTitle}" in ${subject}.${availableContext}\n\nThe content should be educational and interactive, building on the unit's foundation.`,
                successCriteria: `Generate clear and measurable success criteria for subunit ${subunitNumber} about "${unitTitle}" in ${subject}.${availableContext}\n\nThe criteria should align with the learning objectives and be achievable within this subunit.`,
                activities: `Generate engaging activities for subunit ${subunitNumber} about "${unitTitle}" in ${subject}.${availableContext}\n\nThe activities should be interactive, educational, and support the subunit's success criteria.`,
                learningExperiences: `Generate learning experiences and teaching strategies for subunit ${subunitNumber} about "${unitTitle}" in ${subject}.${availableContext}\n\nFocus on effective teaching methods that support the subunit objectives.`,
                differentiation: `Generate differentiation and inclusion strategies for subunit ${subunitNumber} about "${unitTitle}" in ${subject}.${availableContext}\n\nConsider diverse learning needs and how to adapt the subunit activities.`,
                summativeAssessment: `Generate summative assessment for subunit ${subunitNumber} about "${unitTitle}" in ${subject}.${availableContext}\n\nThe assessment should evaluate student learning effectively for this specific subunit.`,
                interimAssessment: `Generate interim assessment for subunit ${subunitNumber} about "${unitTitle}" in ${subject}.${availableContext}\n\nThis should be a mid-unit check on student progress for this subunit.`,
                formativeAssessment: `Generate formative assessment for subunit ${subunitNumber} about "${unitTitle}" in ${subject}.${availableContext}\n\nThis should provide ongoing feedback during learning for this subunit.`
            };
            
            if (subunitFieldPrompts[fieldName]) {
                return subunitFieldPrompts[fieldName] + contextWarning;
            }
        }

        // Unit plan field prompts with enhanced context
        const unitPlanFieldPrompts: Record<string, string> = {
            resources: `Generate comprehensive unit resources for "${unitTitle}" in ${subject}.${availableContext}\n\nThe resources should include materials, tools, references, and digital resources that support student learning throughout the unit.`,
            communityEngagement: `Generate community engagement activities for "${unitTitle}" in ${subject}.${availableContext}\n\nThese should connect students with local community resources, experts, or real-world applications related to the unit.`,
            reflectionPriorToTeaching: `Generate reflection prompts for teachers before teaching "${unitTitle}" in ${subject}.${availableContext}\n\nThese should help teachers prepare and consider their approach to the unit.`,
            reflectionDuringTeaching: `Generate reflection prompts for teachers during the teaching of "${unitTitle}" in ${subject}.${availableContext}\n\nThese should help teachers monitor and adjust their instruction throughout the unit.`,
            reflectionAfterTeaching: `Generate reflection prompts for teachers after teaching "${unitTitle}" in ${subject}.${availableContext}\n\nThese should help teachers evaluate and improve for future iterations of this unit.`,
            reflectionFuturePlanning: `Generate reflection prompts for future planning of "${unitTitle}" in ${subject}.${availableContext}\n\nThese should help teachers plan improvements and adaptations for future units.`,
            conceptualUnderstandings: `Generate conceptual understandings for "${unitTitle}" in ${subject}.${availableContext}\n\nThese should be transferable big ideas that go beyond factual knowledge and connect to the specified concepts.`,
            globalContext: `Generate global context for "${unitTitle}" in ${subject}.${availableContext}\n\nThis should connect the unit to global issues and perspectives that are relevant to the content.`,
            globalContextExplanation: `Generate global context explanation for "${unitTitle}" in ${subject}.${availableContext}\n\nThis should elaborate on how the unit connects to global issues and provide exploration opportunities.`,
            inquiryStatement: `Generate an inquiry statement for "${unitTitle}" in ${subject}.${availableContext}\n\nThis should be an open-ended question that drives student investigation and connects the concepts and understandings.`,
            objectives: `Generate learning objectives for "${unitTitle}" in ${subject}.${availableContext}\n\nThese should be specific, measurable, and aligned with curriculum standards for this subject and MYP level.`,
            assessmentTitle: `Generate an assessment title for "${unitTitle}" in ${subject}.${availableContext}\n\nThis should be descriptive, engaging, and reflect the inquiry focus and objectives.`,
            summativeAssessment: `Generate summative assessment for "${unitTitle}" in ${subject}.${availableContext}\n\nThis should evaluate student learning at the end of the unit and align with the inquiry statement and objectives.`,
            assessmentType: `Generate assessment type for "${unitTitle}" in ${subject}.${availableContext}\n\nThis should specify the format and approach of the assessment that best fits the inquiry and objectives.`
        };

        return (unitPlanFieldPrompts[fieldName] || `Generate content for ${fieldName} in "${unitTitle}" for ${subject}.${availableContext}`) + contextWarning;
    };

    // Helper function to build context string from available dependencies
    const buildContextString = (
        dependencies: (keyof UnitPlanData)[], 
        unitPlanContext: Partial<UnitPlanData>,
        subunitContext?: { subunitIndex: number; subunitNumber: number }
    ): string => {
        const contextParts: string[] = [];
        
        dependencies.forEach(dep => {
            const value = unitPlanContext[dep];
            if (value && String(value).trim()) {
                if (Array.isArray(value)) {
                    contextParts.push(`${String(dep)}: ${value.join(', ')}`);
                } else {
                    contextParts.push(`${String(dep)}: ${String(value)}`);
                }
            }
        });

        // Add subunit-specific context if available
        if (subunitContext && unitPlanContext.subunits?.[subunitContext.subunitIndex]) {
            const subunit = unitPlanContext.subunits[subunitContext.subunitIndex];
            if (subunit.content) {
                contextParts.push(`subunit content: ${subunit.content.substring(0, 200)}...`);
            }
        }

        return contextParts.length > 0 ? `\n\nCONTEXT:\n${contextParts.join('\n')}` : '';
    };

    // Helper function to check for missing critical dependencies
    const checkMissingCriticalDependencies = (
        fieldName: string, 
        unitPlanContext: Partial<UnitPlanData>
    ): string[] => {
        const criticalDependencies: Record<string, (keyof UnitPlanData)[]> = {
            inquiryStatement: ['specifiedConcepts', 'conceptualUnderstandings'],
            summativeAssessment: ['inquiryStatement', 'objectives'],
            atlSkills: ['summativeAssessment'],
            atlStrategies: ['atlSkills'],
            conceptualQuestions: ['specifiedConcepts', 'conceptualUnderstandings'],
            debatableQuestions: ['inquiryStatement'],
            assessmentTitle: ['inquiryStatement', 'objectives'],
            commandTerms: ['objectives']
        };

        const critical = criticalDependencies[fieldName] || [];
        return critical.filter(dep => !unitPlanContext[dep] || String(unitPlanContext[dep]).trim() === '');
    };

    // Helper function to generate content for any field
    const generateFieldContent = async (
        prompt: string, 
        _options: UnitPlanGenerationOptions
    ): Promise<string> => {
        logger.info(`Calling OpenAI API with prompt: ${prompt}`);
        
        try {
            const response = await getModelResponse(
                prompt,
                {
                    systemPrompt: "You are an expert educational content generator. Generate high-quality, educational content that is appropriate for the specified field and subject area.",
                    temperature: 0.7,
                    maxTokens: 500,
                    model: 'gpt-4o-mini',
                    textFormat: 'text'
                }
            );

            // Handle the actual response structure which has data nested
            const responseWithData = response as ResponsesResult & { success?: boolean; data?: { output_text?: string } };
            logger.info(`OpenAI API response received:`, { success: responseWithData.success, hasData: !!responseWithData.data });
            
            // Extract text from the correct location in the response
            let extractedText = '';
            if (responseWithData.data?.output_text) {
                extractedText = responseWithData.data.output_text;
            } else if (response.output_text) {
                extractedText = response.output_text;
            }
            
            logger.info(`Extracted text length: ${extractedText.length}`);
            if (extractedText.length > 0) {
                logger.info(`Text preview: ${extractedText.substring(0, 100)}...`);
            }

            return extractedText;
        } catch (error) {
            logger.error(`Error in generateFieldContent: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    };

    // Show context quality indicator
    const getContextQuality = (): 'poor' | 'fair' | 'good' | 'excellent' => {
        const contextScore = 
            (unitPlanContext.subject ? 1 : 0) +
            (unitPlanContext.specifiedConcepts?.length ? 1 : 0) +
            (unitPlanContext.unitTitle ? 1 : 0) +
            (unitPlanContext.conceptualUnderstandings ? 1 : 0);

        if (contextScore === 0) return 'poor';
        if (contextScore === 1) return 'fair';
        if (contextScore === 2) return 'good';
        return 'excellent';
    };

    const contextQuality = getContextQuality();
    const qualityColors = {
        poor: 'border-red-300 bg-red-50 text-red-600',
        fair: 'border-yellow-300 bg-yellow-50 text-yellow-600',
        good: 'border-blue-300 bg-blue-50 text-blue-600',
        excellent: 'border-green-300 bg-green-50 text-green-600'
    };

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={handleClick}
                disabled={disabled || isLoading}
                className={`
                    ${sizeClasses[size]} 
                    rounded-full 
                    ${qualityColors[contextQuality]}
                    border 
                    flex 
                    items-center 
                    justify-center 
                    cursor-pointer 
                    hover:opacity-80 
                    transition-all
                    disabled:opacity-50 
                    disabled:cursor-not-allowed
                    ${className}
                `}
                title={`Generate AI content for ${String(fieldName)} (Context: ${contextQuality})`}
            >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                ) : (
                    <span className="font-medium text-xs">🧠</span>
                )}
            </button>
            
            {/* Context quality indicator */}
            {size !== 'sm' && (
                <span className={`text-xs ${
                    contextQuality === 'poor' ? 'text-red-500' :
                    contextQuality === 'fair' ? 'text-yellow-500' :
                    contextQuality === 'good' ? 'text-blue-500' :
                    'text-green-500'
                }`}>
                    {contextQuality === 'poor' && '⚠️'}
                    {contextQuality === 'fair' && '⚡'}
                    {contextQuality === 'good' && '✨'}
                    {contextQuality === 'excellent' && '🎯'}
                </span>
            )}
        </div>
    );
});

ContextAwareAIButton.displayName = 'ContextAwareAIButton';

export default ContextAwareAIButton;




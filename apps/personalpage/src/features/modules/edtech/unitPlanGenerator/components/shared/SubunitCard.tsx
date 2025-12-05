import React, { useState } from 'react';
import { SubunitData, UnitPlanData } from '../../types/UnitPlanTypes';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import { FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import IconButton from '@websites/ui';
import FormField from './FormField';

interface SubunitCardProps {
    subunit: SubunitData;
    onUpdate: (field: keyof SubunitData, value: string | number | string[]) => void;
    onRemove: () => void;
    canRemove?: boolean;
    unitPlanContext?: Partial<UnitPlanData>;
    subunitIndex?: number;
    displayMode?: 'current' | 'enhanced' | 'custom';
}

const SubunitCard: React.FC<SubunitCardProps> = ({
    subunit,
    onUpdate,
    onRemove,
    canRemove = true,
    unitPlanContext,
    subunitIndex,
    displayMode
}) => {
    const { t } = useFallbackTranslation();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isKnowledgeExpanded, setIsKnowledgeExpanded] = useState(false);
    const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(true);
    const [isSuccessCriteriaExpanded, setIsSuccessCriteriaExpanded] = useState(false);
    const [isLearningActivitiesExpanded, setIsLearningActivitiesExpanded] = useState(false);
    const [isEvaluationExpanded, setIsEvaluationExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    // Helper functions for Success Criteria
    const addSuccessCriteriaItem = () => {
        const currentList = Array.isArray(subunit.successCriteria) ? subunit.successCriteria : [];
        onUpdate('successCriteria', [...currentList, '']);
    };

    const updateSuccessCriteriaItem = (index: number, value: string) => {
        const currentList = Array.isArray(subunit.successCriteria) ? subunit.successCriteria : [];
        const updatedList = currentList.map((item, i) => i === index ? value : item);
        onUpdate('successCriteria', updatedList);
    };

    const removeSuccessCriteriaItem = (index: number) => {
        const currentList = Array.isArray(subunit.successCriteria) ? subunit.successCriteria : [];
        const updatedList = currentList.filter((_, i) => i !== index);
        onUpdate('successCriteria', updatedList);
    };

    // Helper functions for Prior Knowledge
    const addPriorKnowledgeItem = (field: 'priorKnowledgeSubjectSpecific' | 'priorKnowledgeLearningSkills') => {
        const currentList = Array.isArray(subunit[field]) ? subunit[field] : [];
        onUpdate(field, [...currentList, '']);
    };

    const updatePriorKnowledgeItem = (field: 'priorKnowledgeSubjectSpecific' | 'priorKnowledgeLearningSkills', index: number, value: string) => {
        const currentList = Array.isArray(subunit[field]) ? subunit[field] : [];
        const updatedList = currentList.map((item, i) => i === index ? value : item);
        onUpdate(field, updatedList);
    };

    const removePriorKnowledgeItem = (field: 'priorKnowledgeSubjectSpecific' | 'priorKnowledgeLearningSkills', index: number) => {
        const currentList = Array.isArray(subunit[field]) ? subunit[field] : [];
        const updatedList = currentList.filter((_, i) => i !== index);
        onUpdate(field, updatedList);
    };

    // Helper functions for New Knowledge
    const addNewKnowledgeItem = (field: 'topicsTerminology' | 'conceptualKnowledge' | 'proceduralKnowledge') => {
        const currentList = Array.isArray(subunit[field]) ? subunit[field] : [];
        onUpdate(field, [...currentList, '']);
    };

    const updateNewKnowledgeItem = (field: 'topicsTerminology' | 'conceptualKnowledge' | 'proceduralKnowledge', index: number, value: string) => {
        const currentList = Array.isArray(subunit[field]) ? subunit[field] : [];
        const updatedList = currentList.map((item, i) => i === index ? value : item);
        onUpdate(field, updatedList);
    };

    const removeNewKnowledgeItem = (field: 'topicsTerminology' | 'conceptualKnowledge' | 'proceduralKnowledge', index: number) => {
        const currentList = Array.isArray(subunit[field]) ? subunit[field] : [];
        const updatedList = currentList.filter((_, i) => i !== index);
        onUpdate(field, updatedList);
    };

    // Helper functions to count filled fields
    const countBasicInfoFields = () => {
        let filled = 0;
        const total = 3;
        if (subunit.lessonsPerSubunit && subunit.lessonsPerSubunit > 0) filled++;
        if (subunit.subunitName && subunit.subunitName.trim() !== '') filled++;
        if (subunit.content && subunit.content.trim() !== '') filled++;
        return { filled, total };
    };

    const countKnowledgeFields = () => {
        let filled = 0;
        const total = 5;
        const priorSubject = Array.isArray(subunit.priorKnowledgeSubjectSpecific) ? subunit.priorKnowledgeSubjectSpecific : [];
        const priorSkills = Array.isArray(subunit.priorKnowledgeLearningSkills) ? subunit.priorKnowledgeLearningSkills : [];
        const topics = Array.isArray(subunit.topicsTerminology) ? subunit.topicsTerminology : [];
        const conceptual = Array.isArray(subunit.conceptualKnowledge) ? subunit.conceptualKnowledge : [];
        const procedural = Array.isArray(subunit.proceduralKnowledge) ? subunit.proceduralKnowledge : [];
        
        if (priorSubject.some(item => item && item.trim() !== '')) filled++;
        if (priorSkills.some(item => item && item.trim() !== '')) filled++;
        if (topics.some(item => item && item.trim() !== '')) filled++;
        if (conceptual.some(item => item && item.trim() !== '')) filled++;
        if (procedural.some(item => item && item.trim() !== '')) filled++;
        return { filled, total };
    };

    const countSuccessCriteriaFields = () => {
        const criteria = Array.isArray(subunit.successCriteria) ? subunit.successCriteria : [];
        const filled = criteria.filter(item => item && item.trim() !== '').length;
        const total = Math.max(criteria.length, 1);
        return { filled, total };
    };

    const countLearningActivitiesFields = () => {
        let filled = 0;
        const total = 3;
        if (subunit.activities && subunit.activities.trim() !== '') filled++;
        if (subunit.learningExperiences && subunit.learningExperiences.trim() !== '') filled++;
        if (subunit.differentiation && subunit.differentiation.trim() !== '') filled++;
        return { filled, total };
    };

    const countEvaluationFields = () => {
        let filled = 0;
        const total = 3;
        if (subunit.summativeAssessment && subunit.summativeAssessment.trim() !== '') filled++;
        if (subunit.interimAssessment && subunit.interimAssessment.trim() !== '') filled++;
        if (subunit.formativeAssessment && subunit.formativeAssessment.trim() !== '') filled++;
        return { filled, total };
    };

    return (
        <div className="w-full bg-surface-card border-2 border-border-default rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-border-default">
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                        {subunit.subunitNumber}
                    </span>
                    {subunit.subunitName && subunit.subunitName.trim() !== '' 
                        ? subunit.subunitName 
                        : `${t('subunit')} ${subunit.subunitNumber}`}
                </h3>
                <div className="flex items-center gap-2">
                    <IconButton
                        icon={isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                        onClick={toggleExpanded}
                        color="gray"
                        size="medium"
                        title={isExpanded ? t('collapse_lesson') : t('expand_lesson')}
                    />
                    {canRemove && (
                        <IconButton
                            icon={<FiTrash2 size={16} />}
                            onClick={onRemove}
                            color="red"
                            size="medium"
                            title={t('remove_lesson')}
                        />
                    )}
                </div>
            </div>

            <div 
                className={`overflow-hidden transition-all duration-250 ease-in-out ${
                    isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="space-y-6">
                    <div className="mb-4">
                        <button
                            onClick={() => setIsBasicInfoExpanded(!isBasicInfoExpanded)}
                            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-2 border-blue-600 rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                {isBasicInfoExpanded ? <FiChevronDown size={18} className="text-white" /> : <FiChevronUp size={18} className="text-white" />}
                                <h4 className="text-md font-semibold text-white">
                                    ℹ️ {t('basic_information')}
                                </h4>
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-200 text-blue-800 rounded-full">
                                    {countBasicInfoFields().filled}/{countBasicInfoFields().total}
                                </span>
                            </div>
                        </button>

                        {isBasicInfoExpanded && (
                            <div className="mt-2 p-4 bg-surface-card rounded-lg border-2 border-border-default">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        label={t('lessons_per_subunit')}
                                        value={subunit.lessonsPerSubunit.toString()}
                                        onChange={(value) => onUpdate('lessonsPerSubunit', parseInt(value) || 1)}
                                        type="input"
                                        placeholder={t('lessons_per_subunit_placeholder')}
                                        info={t('lessons_per_subunit_info')}
                                        fieldName="lessonsPerSubunit"
                                        unitPlanContext={unitPlanContext}
                                        subunitContext={{ subunitIndex: subunitIndex || 0, subunitNumber: subunit.subunitNumber }}
                                    />
                                    
                                    <FormField
                                        label={t('subunit_name')}
                                        value={subunit.subunitName || ''}
                                        onChange={(value) => onUpdate('subunitName', value)}
                                        type="input"
                                        placeholder={t('subunit_name_placeholder')}
                                        info={t('subunit_name_info')}
                                        fieldName="subunitName"
                                        unitPlanContext={unitPlanContext}
                                        subunitContext={{ subunitIndex: subunitIndex || 0, subunitNumber: subunit.subunitNumber }}
                                    />
                                    
                                    <FormField
                                        label={t('subunit_content')}
                                        value={subunit.content}
                                        onChange={(value) => onUpdate('content', value)}
                                        type="textarea"
                                        rows={3}
                                        placeholder={t('unit_content_placeholder')}
                                        info={t('unit_content_info')}
                                        useContextAI={true}
                                        fieldName="content"
                                        unitPlanContext={unitPlanContext}
                                        subunitContext={{ subunitIndex: subunitIndex || 0, subunitNumber: subunit.subunitNumber }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Prior Knowledge and New Knowledge sections - Custom Mode Only */}
                    {displayMode === 'custom' && (
                        <div className="my-6">
                            <button
                                onClick={() => setIsKnowledgeExpanded(!isKnowledgeExpanded)}
                                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-2 border-indigo-600 rounded-lg transition-colors mb-2"
                            >
                                <div className="flex items-center gap-2">
                                    {isKnowledgeExpanded ? <FiChevronDown size={20} className="text-white" /> : <FiChevronUp size={20} className="text-white" />}
                                    <h4 className="text-lg font-semibold text-white">
                                        📚 {t('prior_knowledge')} & {t('new_knowledge')}
                                    </h4>
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-200 text-indigo-800 rounded-full">
                                        {countKnowledgeFields().filled}/{countKnowledgeFields().total}
                                    </span>
                                </div>
                            </button>

                            {isKnowledgeExpanded && (
                                <div className="space-y-6 p-4 bg-surface-card rounded-lg border-2 border-border-default">
                                    {/* Prior Knowledge Section */}
                                    <div className="p-4 bg-surface-card rounded-lg border-2 border-border-default">
                                        <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                                            <span>🔵</span>
                                            {t('prior_knowledge')}
                                        </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Subject-specific prior knowledge list */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-md font-medium text-text-primary">
                                                {t('prior_knowledge_subject_specific')}
                                            </h5>
                                            <button
                                                type="button"
                                                onClick={() => addPriorKnowledgeItem('priorKnowledgeSubjectSpecific')}
                                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand"
                                            >
                                                {t('add_item')}
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {(Array.isArray(subunit.priorKnowledgeSubjectSpecific) ? subunit.priorKnowledgeSubjectSpecific : []).map((item, index) => (
                                                <div key={index} className="flex items-start space-x-2">
                                                    <textarea
                                                        value={item}
                                                        onChange={(e) => updatePriorKnowledgeItem('priorKnowledgeSubjectSpecific', index, e.target.value)}
                                                        placeholder={t('prior_knowledge_subject_specific_placeholder')}
                                                        rows={3}
                                                        className="flex-1 px-4 py-2.5 border-2 border-border-default rounded-xl bg-surface-card text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand hover:border-border-accent resize-y"
                                                    />
                                                    <IconButton
                                                        icon={<FiTrash2 size={16} />}
                                                        onClick={() => removePriorKnowledgeItem('priorKnowledgeSubjectSpecific', index)}
                                                        color="red"
                                                        size="medium"
                                                        title={t('remove')}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Learning skills list */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-md font-medium text-text-primary">
                                                {t('prior_knowledge_learning_skills')}
                                            </h5>
                                            <button
                                                type="button"
                                                onClick={() => addPriorKnowledgeItem('priorKnowledgeLearningSkills')}
                                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand"
                                            >
                                                {t('add_item')}
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {(Array.isArray(subunit.priorKnowledgeLearningSkills) ? subunit.priorKnowledgeLearningSkills : []).map((item, index) => (
                                                <div key={index} className="flex items-start space-x-2">
                                                    <textarea
                                                        value={item}
                                                        onChange={(e) => updatePriorKnowledgeItem('priorKnowledgeLearningSkills', index, e.target.value)}
                                                        placeholder={t('prior_knowledge_learning_skills_placeholder')}
                                                        rows={3}
                                                        className="flex-1 px-4 py-2.5 border-2 border-border-default rounded-xl bg-surface-card text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand hover:border-border-accent resize-y"
                                                    />
                                                    <IconButton
                                                        icon={<FiTrash2 size={16} />}
                                                        onClick={() => removePriorKnowledgeItem('priorKnowledgeLearningSkills', index)}
                                                        color="red"
                                                        size="medium"
                                                        title={t('remove')}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                    </div>

                                    {/* New Knowledge Section */}
                                    <div className="p-4 bg-surface-card rounded-lg border-2 border-border-default">
                                        <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                                            <span>🟢</span>
                                            {t('new_knowledge')}
                                        </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Topics/Terminology list */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-md font-medium text-text-primary">
                                                {t('topics_terminology')}
                                            </h5>
                                            <button
                                                type="button"
                                                onClick={() => addNewKnowledgeItem('topicsTerminology')}
                                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand"
                                            >
                                                {t('add_item')}
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {(Array.isArray(subunit.topicsTerminology) ? subunit.topicsTerminology : []).map((item, index) => (
                                                <div key={index} className="flex items-start space-x-2">
                                                    <textarea
                                                        value={item}
                                                        onChange={(e) => updateNewKnowledgeItem('topicsTerminology', index, e.target.value)}
                                                        placeholder={t('topics_terminology_placeholder')}
                                                        rows={3}
                                                        className="flex-1 px-4 py-2.5 border-2 border-border-default rounded-xl bg-surface-card text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand hover:border-border-accent resize-y"
                                                    />
                                                    <IconButton
                                                        icon={<FiTrash2 size={16} />}
                                                        onClick={() => removeNewKnowledgeItem('topicsTerminology', index)}
                                                        color="red"
                                                        size="medium"
                                                        title={t('remove')}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Conceptual knowledge list */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-md font-medium text-text-primary">
                                                {t('conceptual_knowledge')}
                                            </h5>
                                            <button
                                                type="button"
                                                onClick={() => addNewKnowledgeItem('conceptualKnowledge')}
                                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand"
                                            >
                                                {t('add_item')}
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {(Array.isArray(subunit.conceptualKnowledge) ? subunit.conceptualKnowledge : []).map((item, index) => (
                                                <div key={index} className="flex items-start space-x-2">
                                                    <textarea
                                                        value={item}
                                                        onChange={(e) => updateNewKnowledgeItem('conceptualKnowledge', index, e.target.value)}
                                                        placeholder={t('conceptual_knowledge_placeholder')}
                                                        rows={3}
                                                        className="flex-1 px-4 py-2.5 border-2 border-border-default rounded-xl bg-surface-card text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand hover:border-border-accent resize-y"
                                                    />
                                                    <IconButton
                                                        icon={<FiTrash2 size={16} />}
                                                        onClick={() => removeNewKnowledgeItem('conceptualKnowledge', index)}
                                                        color="red"
                                                        size="medium"
                                                        title={t('remove')}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Procedural knowledge list */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-md font-medium text-text-primary">
                                                {t('procedural_knowledge')}
                                            </h5>
                                            <button
                                                type="button"
                                                onClick={() => addNewKnowledgeItem('proceduralKnowledge')}
                                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand"
                                            >
                                                {t('add_item')}
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {(Array.isArray(subunit.proceduralKnowledge) ? subunit.proceduralKnowledge : []).map((item, index) => (
                                                <div key={index} className="flex items-start space-x-2">
                                                    <textarea
                                                        value={item}
                                                        onChange={(e) => updateNewKnowledgeItem('proceduralKnowledge', index, e.target.value)}
                                                        placeholder={t('procedural_knowledge_placeholder')}
                                                        rows={3}
                                                        className="flex-1 px-4 py-2.5 border-2 border-border-default rounded-xl bg-surface-card text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand hover:border-border-accent resize-y"
                                                    />
                                                    <IconButton
                                                        icon={<FiTrash2 size={16} />}
                                                        onClick={() => removeNewKnowledgeItem('proceduralKnowledge', index)}
                                                        color="red"
                                                        size="medium"
                                                        title={t('remove')}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Success Criteria List */}
                    <div className="my-6">
                        <button
                            onClick={() => setIsSuccessCriteriaExpanded(!isSuccessCriteriaExpanded)}
                            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 border-2 border-yellow-600 rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                {isSuccessCriteriaExpanded ? <FiChevronDown size={18} className="text-white" /> : <FiChevronUp size={18} className="text-white" />}
                                <h4 className="text-md font-semibold text-white">
                                    ✅ {t('success_criteria')}
                                </h4>
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-200 text-yellow-800 rounded-full">
                                    {countSuccessCriteriaFields().filled}/{countSuccessCriteriaFields().total}
                                </span>
                            </div>
                        </button>

                        {isSuccessCriteriaExpanded && (
                            <div className="mt-2 p-4 bg-surface-card rounded-lg border-2 border-border-default">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-text-primary">
                                            {t('success_criteria')}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addSuccessCriteriaItem}
                                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand"
                                        >
                                            {t('add_item')}
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {(Array.isArray(subunit.successCriteria) ? subunit.successCriteria : []).map((item, index) => (
                                            <div key={index} className="flex items-start space-x-2">
                                                <textarea
                                                    value={item}
                                                    onChange={(e) => updateSuccessCriteriaItem(index, e.target.value)}
                                                    placeholder="Enter success criteria"
                                                    rows={3}
                                                    className="flex-1 px-4 py-2.5 border-2 border-border-default rounded-xl bg-surface-card text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand hover:border-border-accent resize-y"
                                                />
                                                <IconButton
                                                    icon={<FiTrash2 size={16} />}
                                                    onClick={() => removeSuccessCriteriaItem(index)}
                                                    color="red"
                                                    size="medium"
                                                    title={t('remove')}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Learning Activities Section */}
                    <div className="my-6">
                        <button
                            onClick={() => setIsLearningActivitiesExpanded(!isLearningActivitiesExpanded)}
                            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-2 border-purple-600 rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                {isLearningActivitiesExpanded ? <FiChevronDown size={18} className="text-white" /> : <FiChevronUp size={18} className="text-white" />}
                                <h4 className="text-md font-semibold text-white">
                                    🎯 {t('learning_activities')}
                                </h4>
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-purple-200 text-purple-800 rounded-full">
                                    {countLearningActivitiesFields().filled}/{countLearningActivitiesFields().total}
                                </span>
                            </div>
                        </button>

                        {isLearningActivitiesExpanded && (
                            <div className="mt-2 p-4 bg-surface-card rounded-lg border-2 border-border-default space-y-6">
                                <FormField
                                    label={t('activities')}
                                    value={subunit.activities}
                                    onChange={(value) => onUpdate('activities', value)}
                                    type="textarea"
                                    rows={3}
                                    placeholder={t('activities_placeholder')}
                                    info={t('activities_info')}
                                    useContextAI={true}
                                    fieldName="activities"
                                    unitPlanContext={unitPlanContext}
                                    subunitContext={{ subunitIndex: subunitIndex || 0, subunitNumber: subunit.subunitNumber }}
                                />
                                
                                <FormField
                                    label={t('learning_experiences')}
                                    value={subunit.learningExperiences}
                                    onChange={(value) => onUpdate('learningExperiences', value)}
                                    type="textarea"
                                    rows={3}
                                    placeholder={t('learning_experiences_placeholder')}
                                    info={t('learning_experiences_info')}
                                    useContextAI={true}
                                    fieldName="learningExperiences"
                                    unitPlanContext={unitPlanContext}
                                    subunitContext={{ subunitIndex: subunitIndex || 0, subunitNumber: subunit.subunitNumber }}
                                />
                                
                                <FormField
                                    label={t('differentiation')}
                                    value={subunit.differentiation}
                                    onChange={(value) => onUpdate('differentiation', value)}
                                    type="textarea"
                                    rows={3}
                                    placeholder={t('differentiation_placeholder')}
                                    info={t('differentiation_info')}
                                    useContextAI={true}
                                    fieldName="differentiation"
                                    unitPlanContext={unitPlanContext}
                                    subunitContext={{ subunitIndex: subunitIndex || 0, subunitNumber: subunit.subunitNumber }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Methods of Evaluation Subsection */}
                    <div className="my-6">
                        <button
                            onClick={() => setIsEvaluationExpanded(!isEvaluationExpanded)}
                            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 border-2 border-teal-600 rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                {isEvaluationExpanded ? <FiChevronDown size={18} className="text-white" /> : <FiChevronUp size={18} className="text-white" />}
                                <h4 className="text-md font-semibold text-white">
                                    📊 {t('methods_of_evaluation')}
                                </h4>
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-teal-200 text-teal-800 rounded-full">
                                    {countEvaluationFields().filled}/{countEvaluationFields().total}
                                </span>
                            </div>
                        </button>

                        {isEvaluationExpanded && (
                            <div className="mt-2 p-4 bg-surface-card rounded-lg border-2 border-border-default space-y-4">
                                <FormField
                                    label={t('summative_assessment')}
                                    value={subunit.summativeAssessment || ''}
                                    onChange={(value) => onUpdate('summativeAssessment', value)}
                                    type="textarea"
                                    rows={2}
                                    placeholder={t('summative_assessment_placeholder')}
                                    info={t('summative_assessment_info')}
                                    useContextAI={true}
                                    fieldName="summativeAssessment"
                                    unitPlanContext={unitPlanContext}
                                    subunitContext={{ subunitIndex: subunitIndex || 0, subunitNumber: subunit.subunitNumber }}
                                />
                                
                                <FormField
                                    label={t('interim_assessment')}
                                    value={subunit.interimAssessment || ''}
                                    onChange={(value) => onUpdate('interimAssessment', value)}
                                    type="textarea"
                                    rows={2}
                                    placeholder={t('interim_assessment_placeholder')}
                                    info={t('interim_assessment_info')}
                                    useContextAI={true}
                                    fieldName="interimAssessment"
                                    unitPlanContext={unitPlanContext}
                                    subunitContext={{ subunitIndex: subunitIndex || 0, subunitNumber: subunit.subunitNumber }}
                                />
                                
                                <FormField
                                    label={t('formative_assessment')}
                                    value={subunit.formativeAssessment || ''}
                                    onChange={(value) => onUpdate('formativeAssessment', value)}
                                    type="textarea"
                                    rows={2}
                                    placeholder={t('formative_assessment_placeholder')}
                                    info={t('formative_assessment_info')}
                                    useContextAI={true}
                                    fieldName="formativeAssessment"
                                    unitPlanContext={unitPlanContext}
                                    subunitContext={{ subunitIndex: subunitIndex || 0, subunitNumber: subunit.subunitNumber }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubunitCard;




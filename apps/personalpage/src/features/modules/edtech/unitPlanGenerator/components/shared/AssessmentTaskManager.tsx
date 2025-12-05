import React from 'react';
import { AssessmentTask } from '../../types/UnitPlanTypes';
import FormField from './FormField';
import LabelWithInfo from './LabelWithInfo';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import { ALL_STRANDS } from '../../data/objectives';

interface AssessmentTaskManagerProps {
    tasks: AssessmentTask[];
    onTasksChange: (tasks: AssessmentTask[]) => void;
}

const AssessmentTaskManager: React.FC<AssessmentTaskManagerProps> = ({
    tasks,
    onTasksChange
}) => {
    const { t } = useFallbackTranslation();
    const addTask = () => {
        const newTask: AssessmentTask = {
            id: `task-${Date.now()}`,
            taskTitle: '',
            taskDescription: '',
            criterionID: 'A-i',
            criterionDescription: ''
        };
        onTasksChange([...tasks, newTask]);
    };

    const updateTask = (taskId: string, field: keyof AssessmentTask, value: string) => {
        const updatedTasks = tasks.map(task => 
            task.id === taskId ? { ...task, [field]: value } : task
        );
        onTasksChange(updatedTasks);
    };

    const removeTask = (taskId: string) => {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        onTasksChange(updatedTasks);
    };

    // Create strand options from ALL_STRANDS (use localized strand text when available)
    const strandOptions = ALL_STRANDS.map(strand => ({
        value: strand.fullId,
        label: `${strand.fullId}. ${t(`strand.${strand.fullId}`) || strand.description}`
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <LabelWithInfo 
                    label={t('assessment_tasks')} 
                    info={t('assessment_tasks_info')}
                />
                <button
                    type="button"
                    onClick={addTask}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {t('add_task')}
                </button>
            </div>

            {tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>{t('no_assessment_tasks')}</p>
                    <p className="text-sm">{t('no_assessment_tasks_help')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map((task, index) => (
                        <div key={task.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-medium text-gray-900">
                                    Task {index + 1}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => removeTask(task.id)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    label={t('task_title')}
                                    value={task.taskTitle}
                                    onChange={(value) => updateTask(task.id, 'taskTitle', value)}
                                    placeholder={t('enter_task_title')}
                                    required
                                />

                                <div>
                                    <LabelWithInfo 
                                        label={t('criterion_strand')} 
                                        info={t('criterion_strand_info')}
                                        required
                                    />
                                    <select
                                        value={task.criterionID}
                                        onChange={(e) => updateTask(task.id, 'criterionID', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                    >
                                        {strandOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <FormField
                                    label={t('task_description')}
                                    value={task.taskDescription}
                                    onChange={(value) => updateTask(task.id, 'taskDescription', value)}
                                    type="textarea"
                                    rows={3}
                                    placeholder={t('task_description_placeholder')}
                                    required
                                />
                            </div>

                            <div className="mt-4">
                                <FormField
                                    label={t('criterion_description')}
                                    value={task.criterionDescription}
                                    onChange={(value) => updateTask(task.id, 'criterionDescription', value)}
                                    type="textarea"
                                    rows={2}
                                    placeholder={t('criterion_description_placeholder')}
                                    required
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssessmentTaskManager;




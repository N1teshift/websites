import React, { useState } from 'react';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import JSONFileUpload from '@websites/ui';
import ExcelFileUpload from './ExcelFileUpload';
import { ProgressReportData } from '../../types/ProgressReportTypes';

interface DataManagementSectionProps {
    data: ProgressReportData | null;
    onLoadData: (data: ProgressReportData) => void;
    onClearData: () => void;
    onExportData: () => void;
    validateData: (data: unknown) => { valid: boolean; error?: string };
    hasUnsavedChanges?: boolean;
}

const DataManagementSection: React.FC<DataManagementSectionProps> = ({
    data,
    onLoadData,
    onClearData,
    onExportData,
    validateData,
    hasUnsavedChanges = false
}) => {
    const { t } = useFallbackTranslation();
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [uploadError, setUploadError] = useState<string>('');

    const handleUpload = (uploadedData: unknown) => {
        try {
            onLoadData(uploadedData as ProgressReportData);
            const data = uploadedData as ProgressReportData;
            setUploadStatus(t('upload_success', { count: data.students.length }));
            setUploadError('');
            setTimeout(() => setUploadStatus(''), 5000);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : t('upload_error');
            setUploadError(errorMessage);
            setUploadStatus('');
        }
    };

    const handleUploadError = (error: string) => {
        setUploadError(error);
        setUploadStatus('');
    };

    const handleClear = () => {
        if (window.confirm(t('clear_confirm'))) {
            onClearData();
            setUploadStatus('');
            setUploadError('');
        }
    };

    const handleExport = () => {
        if (hasUnsavedChanges) {
            const confirmed = window.confirm(
                'Warning: You have pending cell edits in the Class View that haven\'t been saved yet.\n\n' +
                'Please go to the Class View and click "Save Changes" before exporting, or your pending edits will not be included in the export.\n\n' +
                'Do you want to export anyway (without the pending edits)?'
            );
            if (!confirmed) return;
        }
        
        try {
            onExportData();
            setUploadStatus('Export successful!');
            setTimeout(() => setUploadStatus(''), 3000);
        } catch {
            setUploadError('Export failed');
        }
    };

    const handleExcelSuccess = () => {
        setUploadStatus('Excel processed successfully! Data auto-synced to dashboard. Reloading...');
        setTimeout(() => {
            // Force reload the data from localStorage
            const stored = localStorage.getItem('progress_report_data');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    onLoadData(parsed);
                    setUploadStatus('✅ Data reloaded successfully! All changes are now visible.');
                    setTimeout(() => setUploadStatus(''), 5000);
                } catch {
                    setUploadError('Failed to reload data. Please refresh the page.');
                }
            }
        }, 3000);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t('data_management')}
                </h2>
                <p className="text-gray-600 mb-6">
                    {t('upload_instruction')}
                </p>
            </div>

            {/* Excel Processing Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">📊</span>
                    Process New Assessment Data
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Upload your <code className="bg-white px-1.5 py-0.5 rounded text-green-700">raw_data.xlsx</code> file to add new assessments 
                    from EXT, LNT, SD, ND, and KONS columns. The updated data will <strong>automatically sync</strong> to your dashboard!
                </p>
                <ExcelFileUpload 
                    onSuccess={handleExcelSuccess}
                    buttonText="Upload & Process Excel"
                />
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                    <strong>✨ New:</strong> After processing Excel, your dashboard automatically reloads with the updated data. No manual export needed!
                </div>
            </div>

            {/* Data Status */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Current Data Status
                </h3>
                {data ? (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <span className="text-green-600 text-2xl">✓</span>
                            <span className="text-gray-900 font-medium">{t('data_loaded')}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            {t('students_loaded', { count: data.students.length })}
                        </div>
                        {hasUnsavedChanges && (
                            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                                <div className="flex items-center space-x-2">
                                    <span className="text-orange-600 text-lg">⚠️</span>
                                    <span className="text-orange-800 font-medium text-sm">Pending cell edits not saved</span>
                                </div>
                                <p className="text-xs text-orange-700 mt-1">
                                    You have pending cell edits in the Class View. Click &quot;Save Changes&quot; there before exporting.
                                </p>
                            </div>
                        )}
                        {data.snapshot_metadata && (
                            <div className="text-xs text-gray-500 mt-2 space-y-1">
                                <div>Created: {data.snapshot_metadata.created_date}</div>
                                <div>Total Assessments: {data.snapshot_metadata.data_statistics.total_assessments}</div>
                                <div>Total Cambridge Tests: {data.snapshot_metadata.data_statistics.total_cambridge_tests}</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-2xl">○</span>
                        <span className="text-gray-500">{t('no_data_loaded')}</span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <JSONFileUpload
                    onUpload={handleUpload}
                    onError={handleUploadError}
                    buttonText={t('upload_json')}
                    validator={validateData}
                />

                <button
                    onClick={handleExport}
                    disabled={!data}
                    className={`inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md focus:outline-none focus:ring-2 transition-colors touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${
                        hasUnsavedChanges 
                            ? 'text-orange-700 bg-orange-100 border-2 border-orange-400 hover:bg-orange-200 focus:ring-orange-500 animate-pulse'
                            : 'text-blue-700 bg-blue-100 border border-blue-300 hover:bg-blue-200 focus:ring-blue-500'
                    }`}
                >
                    <span className="mr-2">{hasUnsavedChanges ? '⚠️' : '📥'}</span>
                    {hasUnsavedChanges ? 'Export (Pending Edits!)' : t('download_data')}
                </button>

                <button
                    onClick={handleClear}
                    disabled={!data}
                    className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="mr-2">🗑️</span>
                    {t('clear_data')}
                </button>
            </div>

            {/* Status Messages */}
            {uploadStatus && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-green-800 font-medium">{uploadStatus}</span>
                    </div>
                </div>
            )}

            {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-red-600">✗</span>
                        <span className="text-red-800 font-medium">{uploadError}</span>
                    </div>
                </div>
            )}

            {/* Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    ℹ️ Data Management Workflow
                </h3>
                <div className="text-gray-600 text-sm space-y-3">
                    <div>
                        <strong className="text-gray-900">1. Initial Load:</strong> Upload your student data JSON file to view existing records
                    </div>
                    <div>
                        <strong className="text-gray-900">2. Process Excel:</strong> Upload raw_data.xlsx to add new assessments (updates individual student files)
                    </div>
                    <div>
                        <strong className="text-gray-900">3. Export Updated Data:</strong> Download the updated JSON collection to backup and view new data
                    </div>
                    <div className="pt-2 border-t border-blue-200">
                        <strong className="text-gray-900">Note:</strong> The dashboard shows data from the loaded JSON. 
                        After processing Excel, export and re-upload the JSON to see the updated assessments.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataManagementSection;





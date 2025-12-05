import React, { useState } from 'react';

interface ImportButtonProps {
    importFromJSON: (files: File[]) => Promise<number>;
    t: (key: string, params?: Record<string, unknown>) => string;
}

const ImportButton: React.FC<ImportButtonProps> = ({ importFromJSON, t }) => {
    const [importStatus, setImportStatus] = useState<string>('');

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setImportStatus(t('importing'));
            const filesArray = Array.from(files);
            const successCount = await importFromJSON(filesArray);
            
            if (successCount > 0) {
                setImportStatus(t('import_success_count', { count: successCount }));
                setTimeout(() => setImportStatus(''), 3000);
            } else {
                setImportStatus(t('import_failed'));
                setTimeout(() => setImportStatus(''), 5000);
            }
        }
        event.target.value = '';
    };

    return (
        <>
            <label className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-text-primary bg-surface-button border border-border-default rounded-md hover:bg-surface-button-hover focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer transition-colors touch-manipulation min-h-[44px]">
                <span className="mr-2">📤</span>
                {t('import_json_button')}
                <input
                    type="file"
                    accept=".json"
                    multiple
                    onChange={handleFileImport}
                    className="sr-only"
                />
            </label>
            {importStatus && (
                <div className="text-sm font-medium text-text-primary mb-4 p-3 bg-surface-card rounded-md border border-border-default">
                    {importStatus}
                </div>
            )}
        </>
    );
};

export default ImportButton;








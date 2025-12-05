import React from 'react';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';

interface PendingEditsActionBarProps {
    pendingEditsCount: number;
    onSave: () => void;
    onDiscard: () => void;
}

const PendingEditsActionBar: React.FC<PendingEditsActionBarProps> = ({
    pendingEditsCount,
    onSave,
    onDiscard
}) => {
    const { t } = useFallbackTranslation();

    return (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                    <span className="font-semibold text-orange-600">{pendingEditsCount}</span>{' '}
                    {pendingEditsCount === 1 ? t('unsaved_changes') : t('unsaved_changes_plural')}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onDiscard}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                        <span className="mr-1">✗</span>
                        {t('discard_changes')}
                    </button>
                    <button
                        onClick={onSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-700 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                    >
                        <span className="mr-1">💾</span>
                        {t('save_changes')}
                    </button>
                </div>
            </div>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                <strong>💡 Tip:</strong> {t('edit_cell_tip')}
            </div>
        </div>
    );
};

export default PendingEditsActionBar;





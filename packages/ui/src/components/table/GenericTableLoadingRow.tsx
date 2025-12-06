import React from 'react';
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

interface GenericTableLoadingRowProps {
    colSpan: number;
    messageKey: string;
}

/**
 * Renders a table row indicating that data is currently loading.
 *
 * @param props The component props.
 * @param props.colSpan The number of columns the loading message should span.
 * @param props.messageKey The translation key for the loading message (e.g., "loading").
 * @returns A React element representing the loading row.
 */
export const GenericTableLoadingRow: React.FC<GenericTableLoadingRowProps> = ({ colSpan, messageKey }) => {
    const { t } = useFallbackTranslation();

    return (
        <tr>
            <td colSpan={colSpan} className="p-4 text-center text-text-muted">
                {t(messageKey)}...
            </td>
        </tr>
    );
};


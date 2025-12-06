import React from 'react';
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

interface GenericTableRowEmptyProps {
    /** The number of columns the empty row message should span. */
    colSpan: number;
    /** Optional message to display. Defaults to "No items found.". */
    messageKey: string;
}

/**
 * Renders a table row indicating that there are no items to display.
 */
export const GenericTableRowEmpty: React.FC<GenericTableRowEmptyProps> = ({
    colSpan,
    messageKey
}) => {
    const { t } = useFallbackTranslation();

    return (
        <tr>
            <td colSpan={colSpan} className="px-6 py-4 text-center text-sm text-text-muted">
                {t(messageKey)}
            </td>
        </tr>
    );
}; 


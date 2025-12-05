/**
 * Name alias mapping for students with shortened names
 * Maps shortened names (from Excel) to full names (in database)
 */

export interface NameAlias {
    excelFirstName: string;
    excelLastName: string;
    fullFirstName: string;
    fullLastName: string;
    className: string;
}

/**
 * List of known name aliases
 * Add entries here when you need to map shortened names to full names
 */
export const NAME_ALIASES: NameAlias[] = [
    {
        excelFirstName: 'Ažuolas',
        excelLastName: 'Vainilka',
        fullFirstName: 'Ažuolas Jonas',
        fullLastName: 'Vainilka',
        className: '8 Vydūnas'
    },
    {
        excelFirstName: 'Daumantas',
        excelLastName: 'Van der Molen',
        fullFirstName: 'Daumantas Jokūbas',
        fullLastName: 'Van der Molen',
        className: '8 A. J. Greimas'
    },
    {
        excelFirstName: 'Paulius',
        excelLastName: 'Šulnius',
        fullFirstName: 'Paulius Martynas',
        fullLastName: 'Šulnius',
        className: '8 M. A. Gimbutienė'
    },
    {
        excelFirstName: 'Kristupas',
        excelLastName: 'Vinča',
        fullFirstName: 'Kristupas Augustas',
        fullLastName: 'Vinča',
        className: '8 M. A. Gimbutienė'
    },
    {
        excelFirstName: 'Bonifacijus',
        excelLastName: 'Kiela',
        fullFirstName: 'Bonifacijus Marijus',
        fullLastName: 'Kiela',
        className: '8 I. Veisaitė'
    }
];

/**
 * Resolve a name from Excel to the full name in the database
 */
export function resolveNameAlias(
    firstName: string,
    lastName: string,
    className: string
): { firstName: string; lastName: string } {
    const alias = NAME_ALIASES.find(
        a => a.excelFirstName === firstName && 
             a.excelLastName === lastName && 
             a.className === className
    );
    
    if (alias) {
        return {
            firstName: alias.fullFirstName,
            lastName: alias.fullLastName
        };
    }
    
    // No alias found, return original names
    return { firstName, lastName };
}





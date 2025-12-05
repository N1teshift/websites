import React, { useState } from 'react';
import { useFallbackTranslation } from '@websites/infrastructure/i18n';
import { GenericTable, ColumnDefinition, FilterDefinition } from '@websites/ui';

interface PrecinctData {
    id: number;                // Unique identifier for the precinct
    name: string;              // Name of the precinct
    status: 'Observed' | 'Pending' | 'Not Observed'; // Current observation status of the precinct
    observerCount: number;     // Number of observers assigned or present at the precinct
    [key: string]: unknown;    // Allows for potential additional properties
}

// Mock data for the precincts table
const mockPrecincts: PrecinctData[] = [
    { id: 101, name: 'Vilnius District 1', status: 'Observed', observerCount: 2 },
    { id: 102, name: 'Vilnius District 2', status: 'Pending', observerCount: 1 },
    { id: 103, name: 'Kaunas District 1', status: 'Not Observed', observerCount: 0 },
    { id: 104, name: 'Kaunas District 2', status: 'Observed', observerCount: 3 },
    { id: 105, name: 'Klaipėda District 1', status: 'Pending', observerCount: 1 },
    { id: 106, name: 'Klaipėda District 2', status: 'Observed', observerCount: 2 },
    { id: 107, name: 'Šiauliai District 1', status: 'Pending', observerCount: 1 },
    { id: 108, name: 'Šiauliai District 2', status: 'Observed', observerCount: 0 },
    { id: 109, name: 'Panevėžys District 1', status: 'Not Observed', observerCount: 0 },
    { id: 110, name: 'Panevėžys District 2', status: 'Pending', observerCount: 1 },
    { id: 111, name: 'Alytus District 1', status: 'Observed', observerCount: 4 },
    { id: 112, name: 'Alytus District 2', status: 'Observed', observerCount: 2 },
    { id: 113, name: 'Marijampolė District 1', status: 'Pending', observerCount: 1 },
    { id: 114, name: 'Marijampolė District 2', status: 'Not Observed', observerCount: 0 },
    { id: 115, name: 'Tauragė District 1', status: 'Observed', observerCount: 3 },
    { id: 116, name: 'Tauragė District 2', status: 'Pending', observerCount: 1 },
    { id: 117, name: 'Telšiai District 1', status: 'Observed', observerCount: 2 },
    { id: 118, name: 'Telšiai District 2', status: 'Pending', observerCount: 0 },
    { id: 119, name: 'Utena District 1', status: 'Not Observed', observerCount: 0 },
    { id: 120, name: 'Utena District 2', status: 'Observed', observerCount: 1 },
];

// Array of possible status values for filtering.
const precinctStatuses: PrecinctData['status'][] = ['Observed', 'Pending', 'Not Observed'];

export default function CountingPrecinctTable() {
    const { t } = useFallbackTranslation();

    const columns: ColumnDefinition<PrecinctData>[] = [
        {
            key: 'id', // Corresponds to the key in PrecinctData
            header: t('precinct_id'), // Translate header
            renderCell: (item) => item.id, // Simple cell render
            sortable: true, // Allow sorting by ID
        },
        {
            key: 'name',
            header: t('precinct_name'),
            renderCell: (item) => item.name,
            sortable: true, // Allow sorting by Name
        },
        {
            key: 'status',
            header: t('status'), // Use common translation
            renderCell: (item) => (
                // Example of slightly more complex cell rendering with conditional styling
                <span
                    className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Observed' ? 'bg-success-100 text-success-800' :
                            item.status === 'Pending' ? 'bg-warning-100 text-warning-800' :
                                'bg-danger-100 text-danger-800'
                        }`}
                >
                    {item.status}
                </span>
            ),
            sortable: true,
        },
        {
            key: 'observerCount',
            header: t('observer_count'),
            renderCell: (item) => item.observerCount,
            sortable: true,
        },
    ];

    const filterDefinitions: FilterDefinition<PrecinctData>[] = [
        {
            key: 'status', // Key to filter on
            label: t('status'), // Label for the filter section
            options: precinctStatuses, // Provide the possible status options
            // initialValues: ['all'] // Optional: default to showing all initially
        }
    ];

    const [selectedPrecincts, setSelectedPrecincts] = useState<PrecinctData[]>([]);

    const handleTogglePrecinct = (item: PrecinctData) => {
        setSelectedPrecincts(prev =>
            prev.some(p => p.id === item.id)
                ? prev.filter(p => p.id !== item.id)
                : [...prev, item]
        );
    };

    const handleSelectAllPrecincts = (items: PrecinctData[], select: boolean) => {
        if (select) {
            // Add all items that aren't already selected
            setSelectedPrecincts(prev => [
                ...prev,
                ...items.filter(item => !prev.some(p => p.id === item.id))
            ]);
        } else {
            // Remove all items that are in the current page
            setSelectedPrecincts(prev =>
                prev.filter(p => !items.some(item => item.id === p.id))
            );
        }
    };

    return (
        <div className="p-4 text-text-primary space-y-4">
            <GenericTable<PrecinctData>
                tableId="counting-precincts-table"
                items={mockPrecincts}
                columns={columns}
                filterDefinitions={filterDefinitions} // Pass filter definitions
                showFilters={true} // Show the filters section
                showTopPagination={true}
                showBottomPagination={true}
                paginationOptions={{
                    pageSizeOptions: [5, 10, 20],
                    defaultPageSize: 5,
                    localStorageKey: 'counting-precincts-table-page-size'
                }}
                selectionOptions={{
                    selectedItems: selectedPrecincts,
                    onToggleItem: handleTogglePrecinct,
                    onSelectAll: handleSelectAllPrecincts,
                    itemKey: 'id', // Unique key for each row
                }}
            />
        </div>
    );
}




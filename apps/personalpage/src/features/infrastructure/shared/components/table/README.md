# GenericTable Component

A flexible, feature-rich table component with built-in pagination, sorting, filtering, and user preference persistence.

## Features

- **Pagination**: Configurable page sizes with localStorage persistence
- **Sorting**: Multi-column sorting with custom sort functions
- **Filtering**: Flexible filtering with custom filter functions
- **Selection**: Row selection with select all functionality
- **Loading States**: Built-in loading indicators
- **Responsive**: Mobile-friendly design
- **Accessible**: ARIA attributes and keyboard navigation

## Basic Usage

```tsx
import { GenericTable } from '@/features/infrastructure/shared/components/table/GenericTable';

const MyTable = () => {
  const columns = [
    {
      key: 'name',
      header: 'Name',
      renderCell: (item) => item.name,
      sortable: true
    },
    {
      key: 'email',
      header: 'Email',
      renderCell: (item) => item.email
    }
  ];

  return (
    <GenericTable
      tableId="users-table"
      items={users}
      columns={columns}
      paginationOptions={{
        defaultPageSize: 25,
        pageSizeOptions: [10, 25, 50, 100],
        localStorageKey: 'users-table-page-size' // Persists user's page size preference
      }}
    />
  );
};
```

## Pagination with localStorage Persistence

The table supports persisting user's page size preference across sessions:

```tsx
<GenericTable
  tableId="data-table"
  items={data}
  columns={columns}
  paginationOptions={{
    defaultPageSize: 50,
    pageSizeOptions: [25, 50, 100, 200],
    localStorageKey: 'my-feature-table-page-size' // Optional: enables persistence
  }}
/>
```

### How it Works

1. **Initial Load**: If `localStorageKey` is provided, the table loads the user's previously selected page size
2. **Validation**: Stored values are validated (must be > 0 and ≤ 1000)
3. **Fallback**: If no stored value or invalid, uses `defaultPageSize`
4. **Persistence**: When user changes page size, it's automatically saved to localStorage
5. **Error Handling**: Gracefully handles localStorage errors (private browsing, quota exceeded)

### localStorage Key Naming

Follow the established pattern for user preference keys:
- Format: `feature-table-page-size` or `feature:table-page-size`
- Examples: `users-table-page-size`, `calendar-events-page-size`

## Advanced Features

### Custom Sorting

```tsx
const customSortFunction = (items, sortState) => {
  // Your custom sorting logic
  return sortedItems;
};

<GenericTable
  customSortFunction={customSortFunction}
  // ... other props
/>
```

### Custom Filtering

```tsx
const customFilterFunction = (items, activeFilters) => {
  // Your custom filtering logic
  return filteredItems;
};

<GenericTable
  customFilterFunction={customFilterFunction}
  // ... other props
/>
```

### Row Selection

```tsx
const [selectedItems, setSelectedItems] = useState([]);

<GenericTable
  selectionOptions={{
    selectedItems,
    onToggleItem: (item) => {
      setSelectedItems(prev => 
        prev.includes(item) 
          ? prev.filter(i => i !== item)
          : [...prev, item]
      );
    },
    onSelectAll: (items, select) => {
      setSelectedItems(select ? items : []);
    },
    itemKey: 'id'
  }}
  // ... other props
/>
```

## Configuration Options

### PaginationOptions

```typescript
interface PaginationOptions {
  defaultPageSize?: number;        // Default: 50
  pageSizeOptions?: number[];      // Available page size choices
  localStorageKey?: string;        // Optional: enables persistence
}
```

### ColumnDefinition

```typescript
interface ColumnDefinition<T> {
  key: keyof T | string;
  header: React.ReactNode;
  renderCell: (item: T) => React.ReactNode;
  sortable?: boolean;              // Default: false
  initialVisible?: boolean;        // Default: true
  className?: string;
}
```

## Best Practices

1. **Always provide a unique `tableId`** for accessibility and debugging
2. **Use meaningful localStorage keys** that include the feature name
3. **Validate stored preferences** to handle corrupted data
4. **Provide sensible defaults** for all optional configurations
5. **Handle errors gracefully** for localStorage operations

## Error Handling

The component handles various error scenarios:

- **localStorage unavailable**: Falls back to default values
- **Invalid stored data**: Validates and uses defaults
- **Storage quota exceeded**: Logs warning and continues
- **SSR compatibility**: Checks for window object before accessing localStorage

## Performance Considerations

- **Large datasets**: Consider virtual scrolling for tables with >1000 rows
- **Frequent updates**: Use `React.memo` for custom render functions
- **Memory usage**: Clear localStorage entries when no longer needed
- **Network requests**: Cache API responses using the centralized cache utility

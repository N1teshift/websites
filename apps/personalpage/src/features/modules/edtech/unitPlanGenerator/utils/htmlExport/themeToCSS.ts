// Convert React inline styles from theme to CSS string for HTML export
import { KMMColors } from '../../components/sections/preview/previewTheme';

export const generateCSSFromTheme = (): string => `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        line-height: 1.6; 
        color: ${KMMColors.textPrimary}; 
        background: #f1f5f9;
        padding: 20px;
    }
    
    .container {
        max-width: 72rem; /* 1152px - matches max-w-6xl */
        margin: 0 auto;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        overflow: hidden;
    }
    
    /* Tailwind-like Utility Classes */
    
    /* Spacing */
    .space-y-1 > * + * { margin-top: 0.25rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .space-y-6 > * + * { margin-top: 1.5rem; }
    .space-y-8 > * + * { margin-top: 2rem; }
    
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mr-2 { margin-right: 0.5rem; }
    .ml-2 { margin-left: 0.5rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    
    .p-3 { padding: 0.75rem; }
    .p-4 { padding: 1rem; }
    .p-8 { padding: 2rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
    .pb-2 { padding-bottom: 0.5rem; }
    .pl-3 { padding-left: 0.75rem; }
    
    /* Flexbox */
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-start { align-items: flex-start; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .flex-1 { flex: 1; }
    .flex-shrink-0 { flex-shrink: 0; }
    
    /* Grid */
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .col-span-full { grid-column: 1 / -1; }
    
    /* Text */
    .text-white { color: white; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-600 { color: #4b5563; }
    .text-gray-700 { color: #374151; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-base { font-size: 1rem; line-height: 1.5rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .uppercase { text-transform: uppercase; }
    .tracking-wide { letter-spacing: 0.025em; }
    .italic { font-style: italic; }
    
    /* Borders */
    .border { border-width: 1px; border-style: solid; border-color: #e5e7eb; }
    .border-l-2 { border-left-width: 2px; border-left-style: solid; }
    .border-l-4 { border-left-width: 4px; border-left-style: solid; }
    .border-b-2 { border-bottom-width: 2px; border-bottom-style: solid; }
    .rounded { border-radius: 0.25rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-full { border-radius: 9999px; }
    .rounded-t-lg { border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem; }
    
    /* Layout */
    .overflow-x-auto { overflow-x: auto; }
    .min-w-full { min-width: 100%; }
    .block { display: block; }
    
    /* Lists */
    .list-disc { list-style-type: disc; }
    .list-inside { list-style-position: inside; }
    
    /* Backgrounds */
    .bg-white { background-color: white; }
    
    /* Shadows */
    .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    
    /* Other Utilities */
    .strong, strong { font-weight: 700; }
    h1, h2, h3, h4, h5, h6 { font-weight: inherit; }
    img { max-width: 100%; height: auto; display: block; }
    
    /* Responsive Grid Utilities */
    @media (min-width: 768px) {
        .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    
    @media (min-width: 1024px) {
        .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    }
    
    /* Custom Component Styles */
    
    /* Content Block Styles */
    .content-block {
        background: ${KMMColors.bgPrimary};
        padding: 1.25rem;
        border-radius: 0.5rem;
        border-left: 4px solid ${KMMColors.secondary};
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        margin-bottom: 1rem;
    }
    
    .secondary-block {
        background: ${KMMColors.bgTertiary};
        padding: 1.25rem;
        border-radius: 0.5rem;
        border-left: 4px solid ${KMMColors.secondaryLight};
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        margin-bottom: 1rem;
    }
    
    .field-label {
        font-weight: 700;
        color: ${KMMColors.primary};
        margin-bottom: 0.5rem;
        font-size: 0.875em;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .subheading {
        font-weight: 700;
        color: ${KMMColors.secondary};
        margin-bottom: 0.75rem;
        font-size: 1em;
    }
    
    /* Table Styles */
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1.5rem;
        background: white;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    thead tr {
        background: linear-gradient(to bottom, ${KMMColors.primary}, ${KMMColors.primaryDark});
        color: white;
    }
    
    th {
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        font-size: 0.875em;
    }
    
    td {
        padding: 1rem;
        border-bottom: 1px solid ${KMMColors.borderLight};
        vertical-align: top;
        color: ${KMMColors.textSecondary};
        font-size: 0.875em;
    }
    
    tbody tr:nth-child(4n+1):not(.knowledge-row),
    tbody tr:nth-child(4n+2):not(.knowledge-row) {
        background: ${KMMColors.bgSecondary};
    }
    
    tbody tr:nth-child(4n+3):not(.knowledge-row),
    tbody tr:nth-child(4n+4):not(.knowledge-row) {
        background: ${KMMColors.bgPrimary};
    }
    
    /* Badge Styles */
    .badge {
        background: ${KMMColors.accent};
        color: white;
        padding: 0.375rem 0.875rem;
        border-radius: 1.25rem;
        font-weight: 600;
        text-align: center;
        display: inline-block;
        min-width: 30px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        font-size: 0.875em;
    }
    
    /* Knowledge Row Styles */
    .knowledge-row {
        background: ${KMMColors.bgAccent} !important;
        border-top: 2px solid ${KMMColors.knowledgeBorder} !important;
        border-bottom: 2px solid ${KMMColors.knowledgeBorder} !important;
    }
    
    .knowledge-row td {
        padding: 1.5rem 1rem;
    }
    
    .knowledge-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .knowledge-block {
        background: ${KMMColors.bgPrimary};
        padding: 1.25rem;
        border-radius: 0.5rem;
        border-left: 4px solid ${KMMColors.secondaryLight};
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);
    }
    
    .knowledge-block h4 {
        color: ${KMMColors.secondary};
        margin-bottom: 0.75rem;
        font-size: 1em;
        font-weight: 700;
    }
    
    .knowledge-block strong {
        color: ${KMMColors.primary};
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.875em;
    }
    
    /* List Styles */
    ul {
        margin-left: 1.25rem;
        margin-top: 0.5rem;
    }
    
    li {
        margin-bottom: 0.375rem;
        line-height: 1.5;
        color: ${KMMColors.textSecondary};
    }
    
    /* Grid Layouts */
    .grid-2 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }
    
    .grid-3 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }
    
    .grid-4 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.25rem;
        margin-top: 1rem;
    }
    
    /* Utility Classes */
    .space-y-4 > * + * {
        margin-top: 1rem;
    }
    
    .space-y-6 > * + * {
        margin-top: 1.5rem;
    }
    
    .empty-state {
        color: ${KMMColors.textMuted};
        font-style: italic;
    }
    
    /* Print Styles */
    @media print {
        body { 
            background: white; 
            padding: 0; 
        }
        .container { 
            box-shadow: none; 
        }
        .section-container { 
            page-break-inside: avoid; 
        }
        table { 
            page-break-inside: avoid; 
        }
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .header-info {
            flex-direction: column;
        }
        .grid-2, .grid-3, .grid-4 {
            grid-template-columns: 1fr;
        }
        table {
            font-size: 0.8em;
        }
        th, td {
            padding: 0.75rem;
        }
        .section-container {
            padding: 1.5rem;
        }
        .knowledge-container {
            flex-direction: column;
        }
    }
`;





// Sophisticated Modern Color Palette for Unit Plan Preview
export const KMMColors = {
  // Primary Colors - Deep Navy Blue (professional, trustworthy)
  primary: '#1e3a8a',           // Rich navy blue for headers and important elements
  primaryLight: '#3b82f6',      // Bright blue for accents
  primaryDark: '#1e293b',       // Very dark blue for text
  
  // Secondary Colors - Elegant Teal/Cyan (modern, fresh)
  secondary: '#0891b2',         // Teal for secondary elements
  secondaryLight: '#06b6d4',    // Bright cyan for highlights
  
  // Accent Colors - Warm Amber/Gold (energy, emphasis)
  accent: '#f59e0b',            // Amber for important highlights
  accentLight: '#fbbf24',       // Light gold
  
  // Background Colors - Soft, elegant neutrals
  bgPrimary: '#ffffff',         // Pure white
  bgSecondary: '#f8fafc',       // Very light blue-gray
  bgTertiary: '#f1f5f9',        // Light blue-gray
  bgAccent: '#ecfeff',          // Very light cyan
  
  // Knowledge Section Colors
  knowledgeBg: '#cffafe',       // Light cyan for knowledge rows
  knowledgeBorder: '#06b6d4',   // Cyan border
  
  // Border Colors
  borderLight: '#e2e8f0',       // Light gray border
  borderMedium: '#cbd5e1',      // Medium gray border
  borderAccent: '#0891b2',      // Teal accent border
  
  // Text Colors
  textPrimary: '#1e293b',       // Dark slate for main text
  textSecondary: '#475569',     // Medium gray for secondary text
  textMuted: '#94a3b8',         // Light gray for muted text
} as const;

// Reusable style objects for common patterns
export const previewStyles = {
  // Section titles - Bold navy with amber accent border
  sectionTitle: {
    color: KMMColors.primary,
    borderColor: KMMColors.accent,
  },
  
  // Main content blocks - Clean white with teal border
  contentBlock: {
    backgroundColor: KMMColors.bgPrimary,
    borderColor: KMMColors.secondary,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  
  // Secondary blocks - Light blue-gray background with cyan border
  secondaryBlock: {
    backgroundColor: KMMColors.bgTertiary,
    borderColor: KMMColors.secondaryLight,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  
  // Tertiary blocks - Very light background
  tertiaryBlock: {
    backgroundColor: KMMColors.bgSecondary,
    borderColor: KMMColors.borderMedium,
  },
  
  // Field labels - Rich navy
  fieldLabel: {
    color: KMMColors.primary,
  },
  
  // Subheadings - Teal
  subheading: {
    color: KMMColors.secondary,
  },
  
  // Header - Elegant gradient from navy to teal
  header: {
    background: `linear-gradient(135deg, ${KMMColors.primary} 0%, ${KMMColors.primaryLight} 100%)`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  
  headerText: {
    color: '#ffffff',
    opacity: 0.95,
  },
  
  headerBorder: {
    borderTopColor: KMMColors.accent,
    borderTopWidth: '3px',
  },
  
  // Table styles
  tableHeader: {
    background: `linear-gradient(to bottom, ${KMMColors.primary}, ${KMMColors.primaryDark})`,
    color: '#ffffff',
  },
  
  tableRowEven: {
    backgroundColor: KMMColors.bgSecondary,
  },
  
  tableRowOdd: {
    backgroundColor: KMMColors.bgPrimary,
  },
  
  // Knowledge rows in table - Elegant cyan tint
  knowledgeRowBg: {
    backgroundColor: KMMColors.bgAccent,
    borderTop: `2px solid ${KMMColors.knowledgeBorder}`,
    borderBottom: `2px solid ${KMMColors.knowledgeBorder}`,
  },
  
  knowledgeBlock: {
    backgroundColor: KMMColors.bgPrimary,
    borderColor: KMMColors.secondary,
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  knowledgeBlockBorder: {
    borderColor: KMMColors.secondaryLight,
    borderLeftWidth: '4px',
  },
  
  // Badges and pills
  badge: {
    backgroundColor: KMMColors.accent,
    color: '#ffffff',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  
  badgeSecondary: {
    backgroundColor: KMMColors.secondary,
    color: '#ffffff',
  },
  
  // Bullet points - Teal accent
  bulletColor: {
    color: KMMColors.secondary,
  },
  
  // Borders
  border: {
    borderColor: KMMColors.borderLight,
  },
  
  borderAccent: {
    borderColor: KMMColors.borderAccent,
  },
  
  // Card with hover effect (for future use)
  card: {
    backgroundColor: KMMColors.bgPrimary,
    borderColor: KMMColors.borderLight,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease-in-out',
  },
  
  // Accent highlight
  highlight: {
    backgroundColor: KMMColors.accentLight,
    color: KMMColors.primaryDark,
    padding: '2px 8px',
    borderRadius: '4px',
  },
} as const;




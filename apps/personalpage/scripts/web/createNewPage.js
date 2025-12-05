#!/usr/bin/env node

/**
 * Script to create a new page with all required files and configurations
 * Usage: node scripts/createNewPage.js <feature-name> <feature-title>
 * Example: node scripts/createNewPage.js taskManager "Task Manager"
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('Usage: node scripts/createNewPage.js <feature-name> <feature-title>');
    console.error('Example: node scripts/createNewPage.js taskManager "Task Manager"');
    process.exit(1);
}

const featureName = args[0];
const featureTitle = args[1];
const featureNameKebab = featureName.replace(/([A-Z])/g, '-$1').toLowerCase();
const featureNameSnake = featureName.replace(/([A-Z])/g, '_$1').toLowerCase();

console.log(`Creating new page: ${featureName} (${featureTitle})`);

// 1. Update features.ts
const featuresPath = 'src/config/features.ts';
let featuresContent = fs.readFileSync(featuresPath, 'utf8');

// Find the last feature flag and add the new one
const lastFeatureMatch = featuresContent.match(/(\s+)(\w+):\s+(true|false),?\s*\/\/.*$/m);
if (lastFeatureMatch) {
    const newFeatureLine = `${lastFeatureMatch[1]}${featureName}:                 false, // ${featureTitle} - Brief description\n} as const;`;
    featuresContent = featuresContent.replace(/} as const;/, newFeatureLine);
    fs.writeFileSync(featuresPath, featuresContent);
    console.log('✅ Updated src/config/features.ts');
}

// 2. Create translation files
const locales = ['en', 'lt', 'ru'];

locales.forEach(locale => {
    const localePath = `locales/${locale}/${featureNameSnake}.json`;
    const translations = {
        [`${featureNameSnake}_title`]: featureTitle,
        [`${featureNameSnake}_description`]: `Description of ${featureTitle.toLowerCase()}`,
        'coming_soon_message': 'This feature is currently under development. Check back soon!',
        'nav_home': locale === 'lt' ? 'Pradžia' : locale === 'ru' ? 'Главная' : 'Home',
        'nav_section1': locale === 'lt' ? '1 skyrius' : locale === 'ru' ? 'Раздел 1' : 'Section 1'
    };
    
    fs.writeFileSync(localePath, JSON.stringify(translations, null, 2));
    console.log(`✅ Created ${localePath}`);
});

// 3. Update projects navigation
const projectsPath = 'src/pages/projects/index.tsx';
let projectsContent = fs.readFileSync(projectsPath, 'utf8');

// Find the links array and add the new link
const linksMatch = projectsContent.match(/(const links = \[[\s\S]*?];)/);
if (linksMatch) {
    const newLink = `    { href: "/projects/${featureNameKebab}", titleKey: "${featureNameSnake}_title" }`;
    const updatedLinks = linksMatch[1].replace(/];$/, `,\n${newLink}\n];`);
    projectsContent = projectsContent.replace(linksMatch[1], updatedLinks);
    fs.writeFileSync(projectsPath, projectsContent);
    console.log('✅ Updated src/pages/projects/index.tsx');
}

// 4. Create page component
const pageDir = `src/pages/projects/${featureNameKebab}`;
if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
}

const pageComponent = `import { getStaticPropsWithTranslations } from '@lib/getStaticProps';
import Layout from "@components/ui/Layout";
import { isFeatureEnabled } from '@/config/features';
import UnderConstructionPage from '@/features/infrastructure/shared/components/ui/UnderConstructionPage';

const pageNamespaces = ["${featureNameSnake}", "links", "common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function ${featureName}Page() {
    // Feature flag check - show under construction if disabled
    if (!isFeatureEnabled('${featureName}')) {
        return (
            <UnderConstructionPage
                titleKey="${featureNameSnake}_title"
                goBackTarget="/projects"
                pageTranslationNamespaces={pageNamespaces}
                messageKey="coming_soon_message"
            />
        );
    }

    return (
        <Layout 
            goBackTarget="/projects" 
            titleKey="${featureNameSnake}_title" 
            pageTranslationNamespaces={pageNamespaces}
        >
            {/* Your page content here */}
            <div className="p-4">
                <h1>${featureTitle}</h1>
                {/* Add your components and content */}
            </div>
        </Layout>
    );
}`;

fs.writeFileSync(`${pageDir}/index.tsx`, pageComponent);
console.log(`✅ Created ${pageDir}/index.tsx`);

// 5. Create feature directory structure (optional)
const featureDir = `src/features/${featureNameSnake}`;
if (!fs.existsSync(featureDir)) {
    fs.mkdirSync(featureDir, { recursive: true });
    
    // Create subdirectories
    const subdirs = ['components', 'hooks', 'types', 'utils'];
    subdirs.forEach(subdir => {
        fs.mkdirSync(`${featureDir}/${subdir}`, { recursive: true });
    });
    
    // Create index files
    fs.writeFileSync(`${featureDir}/components/index.ts`, `// Export your components here\n`);
    fs.writeFileSync(`${featureDir}/hooks/index.ts`, `// Export your hooks here\n`);
    fs.writeFileSync(`${featureDir}/types/index.ts`, `// Export your types here\n`);
    fs.writeFileSync(`${featureDir}/utils/index.ts`, `// Export your utilities here\n`);
    
    console.log(`✅ Created feature directory structure: ${featureDir}`);
}

console.log('\n🎉 New page created successfully!');
console.log('\nNext steps:');
console.log('1. Test the page at http://localhost:3000/projects/' + featureNameKebab);
console.log('2. Verify under construction mode works (feature flag = false)');
console.log('3. Enable the feature by setting the flag to true in src/config/features.ts');
console.log('4. Add your actual page content');
console.log('5. Update translations as needed');
console.log('\nFiles created/modified:');
console.log(`- src/config/features.ts (added feature flag)`);
console.log(`- locales/en/${featureNameSnake}.json`);
console.log(`- locales/lt/${featureNameSnake}.json`);
console.log(`- locales/ru/${featureNameSnake}.json`);
console.log(`- src/pages/projects/index.tsx (added navigation link)`);
console.log(`- src/pages/projects/${featureNameKebab}/index.tsx`);
console.log(`- src/features/${featureNameSnake}/ (directory structure)`);

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const BUILD_DIR = path.join(
    path.dirname(path.dirname(fileURLToPath(import.meta.url))),
    "build"
);

// Path alias mappings based on tsconfig.test.json
const PATH_ALIASES = {
    '@components': 'infrastructure/shared/components',
    '@lib': 'infrastructure/shared/lib',
    '@styles': 'styles',
    '@utils': 'infrastructure/shared/utils',
    '@features': 'features',
    '@tests': 'features/tests',
    '@mathObjectGenerator': 'features/modules/math/mathObjectGenerator',
    '@exerciseGenerator': 'features/modules/math/exerciseGenerator',
    '@services': 'services',
    '@shared': 'infrastructure/shared',
    '@ai': 'features/infrastructure/ai'
};

// Simple regex patterns to match imports without worrying about path modifications
const IMPORT_PATTERNS = [
    /(import\s+[^'"]+from\s+['"])([^'"]+)(['"])/g,  // import ... from '...'
    /(import\s+['"])([^'"]+)(['"])/g,  // import '...'
    /(require\(['"])([^'"]+)(['"])/g,  // require('...')
    /(from\s+['"])([^'"]+)(['"])/g,    // from '...'
    /(export\s+[^'"]+from\s+['"])([^'"]+)(['"])/g  // export ... from '...'
];

// External packages that should not be modified
const EXTERNAL_PACKAGES = [
    'node_modules',
    'readline-sync',
    'react',
    'next-i18next',
    'next/',
    'katex/',
    'nprogress',
    'mathjs',
    'axios'
];

function shouldSkipImport(importPath) {
    // Skip if it's a bare import (no ./ or ../ at the start)
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        return true;
    }
    
    // Skip if it matches any of our external packages
    return EXTERNAL_PACKAGES.some(pkg => 
        importPath.includes(pkg) || importPath === pkg
    );
}

function resolveAliasPath(importPath, currentFilePath) {
    // Check if the import uses a path alias
    for (const [alias, aliasPath] of Object.entries(PATH_ALIASES)) {
        if (importPath.startsWith(alias + '/')) {
            // Replace alias with its actual path
            const resolvedPath = importPath.replace(alias, aliasPath);
            // Get the absolute path of the target file
            const targetPath = path.join(BUILD_DIR, resolvedPath);
            // Get the absolute path of the current file's directory
            const currentDir = path.dirname(currentFilePath);
            // Calculate relative path from current file to target file
            let relativePath = path.relative(currentDir, targetPath).replace(/\\/g, '/');
            // Ensure the path starts with ./ or ../
            if (!relativePath.startsWith('.')) {
                relativePath = './' + relativePath;
            }
            return relativePath;
        }
    }
    return importPath;
}

function fixImports(content, filePath) {
    let hasChanges = false;
    let updatedContent = content;

    for (const pattern of IMPORT_PATTERNS) {
        updatedContent = updatedContent.replace(pattern, (match, start, importPath, end) => {
            // Skip if it's a bare module import (no ./ or ../ at start)
            if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
                return match;
            }

            // Skip if it's an external package
            if (shouldSkipImport(importPath)) {
                return match;
            }

            // Skip if it already has .js extension
            if (importPath.endsWith('.js')) {
                return match;
            }

            hasChanges = true;
            console.log(`Added .js extension in ${filePath}:\n  From: ${importPath}\n  To:   ${importPath}.js`);
            return `${start}${importPath}.js${end}`;
        });
    }

    return { content: updatedContent, hasChanges };
}

function traverseAndFix(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            traverseAndFix(filePath);
        } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
            let content = fs.readFileSync(filePath, "utf-8");
            const { content: updatedContent, hasChanges } = fixImports(content, filePath);
            if (hasChanges) {
                console.log(`Writing updates to ${filePath}`);
                fs.writeFileSync(filePath, updatedContent, "utf-8");
            }
        }
    }
}

// Run the script
console.log(`Adding .js extensions to imports in build directory: ${BUILD_DIR}`);
traverseAndFix(BUILD_DIR);
console.log("All imports updated.");

# Scripts Development Guide

## Environment Overview

This project uses **ES Modules** as indicated by `"type": "module"` in `package.json`. This means:

- **File Extensions**: `.js` files are treated as ES modules by default
- **Import Syntax**: Use `import` instead of `require`
- **Export Syntax**: Use `export` instead of `module.exports`

## Script Writing Standards

### 1. **ES Module Syntax (Recommended)**

```javascript
// ✅ Correct - ES Module syntax
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function myFunction() {
  // Your code here
}
```

### 2. **CommonJS Syntax (Alternative)**

If you need to use CommonJS syntax, rename files to `.cjs`:

```javascript
// ✅ Correct - CommonJS syntax in .cjs files
const fs = require("fs");
const path = require("path");

module.exports = {
  myFunction: function () {
    // Your code here
  },
};
```

## Script Categories

### **Build Scripts**

- **Location**: `scripts/` directory
- **Purpose**: Build, compile, or transform code
- **Examples**: TypeScript compilation, asset processing

### **Validation Scripts**

- **Location**: `scripts/` directory
- **Purpose**: Validate code quality, translations, types
- **Examples**: Translation validation, linting, type checking

### **Test Scripts**

- **Location**: `scripts/test/` directory
- **Purpose**: Run tests, generate test data
- **Examples**: Test runners, test data generators

## Running Scripts

### **NPM Scripts**

```bash
# Defined in package.json
npm run script-name

# Examples
npm run validate:translations
npm run check:missing
npm run build:test
```

### **Direct Execution**

```bash
# ES Module scripts
node scripts/myScript.js

# CommonJS scripts
node scripts/myScript.cjs
```

## Dependencies

### **Built-in Modules**

```javascript
import fs from "fs"; // File system
import path from "path"; // Path utilities
import { fileURLToPath } from "url"; // URL utilities
```

### **Third-party Modules**

```javascript
import { glob } from "glob"; // File pattern matching
import chalk from "chalk"; // Terminal colors
```

## Best Practices

### **1. Error Handling**

```javascript
try {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
} catch (error) {
  console.error(`Error reading ${filePath}:`, error.message);
  process.exit(1);
}
```

### **2. Exit Codes**

```javascript
// Success
process.exit(0);

// Error
process.exit(1);
```

### **3. Console Output**

```javascript
console.log("✅ Success message");
console.error("❌ Error message");
console.warn("⚠️ Warning message");
```

### **4. File Paths**

```javascript
// Get current script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve relative paths
const projectRoot = path.resolve(__dirname, "..");
const localesDir = path.join(projectRoot, "locales");
```

## Common Patterns

### **Configuration Object**

```javascript
const CONFIG = {
  LOCALES_DIR: "locales",
  LANGUAGES: ["en", "lt", "ru"],
  NAMESPACES: ["common", "aboutme", "emw", "itt"],
};
```

### **Main Execution Pattern**

```javascript
// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  }
}

export function main() {
  // Your main logic here
}
```

## Migration from CommonJS

If you have existing CommonJS scripts:

1. **Option 1**: Convert to ES modules

   ```javascript
   // Before (CommonJS)
   const fs = require("fs");
   module.exports = { myFunction };

   // After (ES Modules)
   import fs from "fs";
   export { myFunction };
   ```

2. **Option 2**: Rename to `.cjs`
   ```bash
   mv script.js script.cjs
   ```

## Troubleshooting

### **"require is not defined" Error**

- **Cause**: Using CommonJS syntax in `.js` file with ES modules
- **Solution**: Convert to ES module syntax or rename to `.cjs`

### **"import.meta.url is not defined" Error**

- **Cause**: Running ES module script with Node.js < 12.17
- **Solution**: Update Node.js or use CommonJS syntax

### **Path Resolution Issues**

- **Cause**: `__dirname` not available in ES modules
- **Solution**: Use `fileURLToPath` and `dirname` pattern

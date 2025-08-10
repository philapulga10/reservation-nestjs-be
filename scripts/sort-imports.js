const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files
function findTsFiles(dir, files = []) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            findTsFiles(fullPath, files);
        } else if (item.endsWith('.ts') && !item.includes('.spec.') && !item.includes('.test.')) {
            files.push(fullPath);
        }
    }

    return files;
}

// Function to categorize imports
function categorizeImports(imports) {
    const categories = {
        external: [], // Third-party libraries (node_modules)
        internal: [], // Internal project imports (@/...)
        relative: []  // Relative imports (./, ../)
    };

    imports.forEach(importStatement => {
        const match = importStatement.match(/from\s+['"]([^'"]+)['"]/);
        if (match) {
            const importPath = match[1];

            if (importPath.startsWith('@/')) {
                categories.internal.push(importStatement);
            } else if (importPath.startsWith('.') || importPath.startsWith('..')) {
                categories.relative.push(importStatement);
            } else {
                categories.external.push(importStatement);
            }
        }
    });

    return categories;
}

// Function to sort imports within each category
function sortImports(imports) {
    return imports.sort((a, b) => {
        // Extract the import path for comparison
        const aMatch = a.match(/from\s+['"]([^'"]+)['"]/);
        const bMatch = b.match(/from\s+['"]([^'"]+)['"]/);

        if (aMatch && bMatch) {
            return aMatch[1].localeCompare(bMatch[1]);
        }
        return 0;
    });
}

// Function to sort and organize imports in a file
function sortFileImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find all import statements
    const importRegex = /import\s+.*\s+from\s+['"][^'"]+['"];?\s*$/gm;
    const imports = content.match(importRegex) || [];

    if (imports.length === 0) {
        return false;
    }

    // Remove all import statements from content
    let newContent = content.replace(importRegex, '');

    // Clean up multiple empty lines
    newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');

    // Categorize and sort imports
    const categories = categorizeImports(imports);

    // Sort each category
    categories.external = sortImports(categories.external);
    categories.internal = sortImports(categories.internal);
    categories.relative = sortImports(categories.relative);

    // Build new import section
    let newImports = '';

    // Add external imports
    if (categories.external.length > 0) {
        newImports += categories.external.join('\n');
        if (categories.internal.length > 0 || categories.relative.length > 0) {
            newImports += '\n\n';
        }
    }

    // Add internal imports
    if (categories.internal.length > 0) {
        newImports += categories.internal.join('\n');
        if (categories.relative.length > 0) {
            newImports += '\n\n';
        }
    }

    // Add relative imports
    if (categories.relative.length > 0) {
        newImports += categories.relative.join('\n');
    }

    // Add new imports at the beginning of the file
    if (newImports) {
        newContent = newImports + '\n\n' + newContent.trim();
    }

    // Write back to file
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
}

// Main execution
console.log('🔄 Starting import sorting...');

const files = findTsFiles('src');
console.log(`📁 Found ${files.length} TypeScript files`);

let updatedFiles = 0;
files.forEach(file => {
    try {
        if (sortFileImports(file)) {
            updatedFiles++;
            console.log(`✅ Sorted imports in: ${path.relative('src', file)}`);
        }
    } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
    }
});

console.log(`\n✨ Import sorting complete!`);
console.log(`📊 Updated ${updatedFiles} files`);
console.log(`\n📋 Import organization rules applied:`);
console.log(`1. External libraries (node_modules)`);
console.log(`2. Internal project imports (@/...)`);
console.log(`3. Relative imports (./, ../)`);
console.log(`\n💡 Next steps:`);
console.log(`1. Run: npm run build`);
console.log(`2. Test your application`);
console.log(`3. Review the changes and adjust if needed`);

import fs from 'fs/promises';
import glob from 'fast-glob';

/**
 * @param {any} logger
 * @param {string[]} updatedDependencies
 * @param {Array<[string, string]>} dependencyMappings
 * @returns {Promise<void>}
 */
export const rewriteSourceImports = async (logger, updatedDependencies, dependencyMappings) => {
    try {
        const parsedDependencyMappings = new Map(dependencyMappings);

        const dependencyReplacements = new Map(
            updatedDependencies
                .map(originalDependencyName => [originalDependencyName, parsedDependencyMappings.get(originalDependencyName)])
                // Ensure a valid mapping exists
                .filter(([, newDependencyName]) => newDependencyName)
        );

        if (dependencyReplacements.size === 0)
            return logger.log('No applicable dependency rewrites found. Skipping source file modification.');

        logger.log(`Rewriting source imports for: ${[...dependencyReplacements.keys()].join(', ')}`);

        // Find all source files in the 'src' directory
        const files = await glob('src/**/*.{ts,tsx,js,jsx}');

        if (files.length === 0)
            return logger.log('No source files found in "src" directory.');

        logger.log(`Processing ${files.length} source files...`);

        let filesChangedCount = 0;

        await Promise.all(
            files.map(async (file) => {
                const originalContent = await fs.readFile(file, 'utf-8');

                let newContent = originalContent;

                let hasChanged = false;

                for (const [originalDependencyName, newDependencyName] of dependencyReplacements.entries()) {
                    if (newContent.includes(originalDependencyName)) {
                        newContent = newContent.replaceAll(originalDependencyName, newDependencyName);
                        hasChanged = true;
                    }
                }

                if (hasChanged) {
                    filesChangedCount++;
                    await fs.writeFile(file, newContent, 'utf-8');
                }
            })
        );
        
        logger.log(`✅ Rewrite complete. ${filesChangedCount} files were modified.`);

    } catch (error) {
        logger.error('An error occurred while rewriting source imports:', error);
        throw error;
    }
};
import fs from 'fs/promises';
import glob from 'fast-glob';

/**
 * @param {any} logger
 * @param {string[]} updatedDependencies
 * @param {Array<[string, string]>} dependencyMappings
 * @returns {Promise<void>}
 */
export const restoreSourceImports = async (logger, updatedDependencies, dependencyMappings) => {
    try {
        const parsedDependencyMappings = new Map(dependencyMappings);

        // Create a reverse mapping from [newName, originalName]
        const dependencyReversions = new Map(
            updatedDependencies
                .map(originalDependencyName => {
                    const newDependencyName = parsedDependencyMappings.get(originalDependencyName);
                    // Return the [newName, originalName] pair for the reverse map
                    return [newDependencyName, originalDependencyName];
                })
                // Ensure a valid mapping exists (the new name is not undefined)
                .filter(([newDependencyName]) => newDependencyName)
        );

        if (dependencyReversions.size === 0) {
            return logger.log('No applicable dependency reversions found. Skipping source file modification.');
        }

        logger.log(`Restoring source imports for: ${[...dependencyReversions.keys()].join(', ')}`);

        // Find all source files in the 'src' directory
        const files = await glob('src/**/*.{ts,tsx,js,jsx}');

        if (files.length === 0) {
            return logger.log('No source files found in "src" directory.');
        }

        logger.log(`Processing ${files.length} source files...`);

        let filesChangedCount = 0;

        await Promise.all(
            files.map(async (file) => {
                const originalContent = await fs.readFile(file, 'utf-8');
                let newContent = originalContent;
                let hasChanged = false;

                // Iterate over the [newName, originalName] pairs
                for (const [newDependencyName, originalDependencyName] of dependencyReversions.entries()) {
                    if (newContent.includes(newDependencyName)) {
                        // Replace the new name with the original name
                        newContent = newContent.replaceAll(newDependencyName, originalDependencyName);
                        hasChanged = true;
                    }
                }

                if (hasChanged) {
                    filesChangedCount++;
                    await fs.writeFile(file, newContent, 'utf-8');
                }
            })
        );

        logger.log(`✅ Reversion complete. ${filesChangedCount} files were modified.`);

    } catch (error) {
        logger.error('An error occurred while restoring source imports:', error);
        throw error;
    }
};
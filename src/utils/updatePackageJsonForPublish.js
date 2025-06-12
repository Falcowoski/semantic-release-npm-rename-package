import fs from 'fs';

/**
 * @param {string} packageName
 * @param {Array<[string, string]>} dependencies
 * @param {string} packageJsonPath
 * @param {any} logger
 * @returns {Object}
 */
export const updatePackageJsonForPublish = (packageName, dependencies, packageJsonPath, logger) => {
    try {
        // Read current package.json
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Update package name if provided
        if (packageName) {
            logger.log(`Updating package name: ${packageJson.name} -> ${packageName}`);

            packageJson.name = packageName;
        }

        // Update dependencies if provided
        const updatedDependencies = dependencies && dependencies.length > 0
            ? updateDependencies(packageJson, dependencies, logger)
            : [];

        // Write updated package.json
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        logger.log('package.json updated successfully');

        return { updatedDependencies };
    } catch (error) {
        logger.error('Error updating package.json:', error);
        throw error;
    }
};
import fs from 'fs';

/**
 * @param {any} packageJson
 * @param {string} packageJsonPath
 * @param {Object} logger
 */
export const restoreOriginalPackageJson = (packageJson, packageJsonPath, logger) => {
    try {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        
        logger.log('Original package.json restored successfully');
    } catch (error) {
        logger.error('Error restoring original package.json:', error);

        throw error;
    }
};
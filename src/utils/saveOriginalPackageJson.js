import fs from 'fs';

/**
 * @param {string} packageJsonPath
 * @param {Object} logger
 */
export const saveOriginalPackageJson = (packageJsonPath, logger) => {
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        logger.log('Original package.json saved in memory');

        return packageJson;
    } catch (error) {
        logger.error('Error saving original package.json:', error);

        throw error;
    }
};
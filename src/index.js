import * as npm from '@semantic-release/npm';
import fs from 'fs';
import path from 'path';

/**
 * @param {string} packageName
 * @param {Object} logger
 * @returns {string|null}
 */
const updatePackageName = (packageName, logger) => {
    if (!packageName)
        return null;

    const packageJsonPath = path.resolve(process.cwd(), 'package.json');

    try {
        // Read current package.json
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Save original name
        const originalName = packageJson.name;

        // Update name
        packageJson.name = packageName;

        // Write back to file
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        logger.log(`Package name updated successfully to: ${packageName}`);

        return originalName;
    } catch (error) {
        logger.error('Error updating package name:', error);
        throw error;
    }
};

const prepare = (pluginConfig, context) => {
    const { packageName, ...restPluginConfig } = pluginConfig;

    if (!packageName)
        return npm.prepare(restPluginConfig, context);

    const { logger } = context;

    logger.log(`Changing package name to: ${packageName}`);

    const originalPackageName = updatePackageName(packageName, logger);

    if (originalPackageName !== null)
        context.originalPackageName = originalPackageName;

    return npm.prepare(restPluginConfig, context);
};

const publish = async (pluginConfig, context) => {
    const { packageName, ...restPluginConfig } = pluginConfig;
    const { logger } = context;

    if (!packageName)
        return npm.publish(restPluginConfig, context);

    logger.log(`Publishing package with name: ${packageName}`);

    const result = await npm.publish(restPluginConfig, context);

    if (!context.originalPackageName)
        return result;

    logger.log(`Restoring original package name: ${context.originalPackageName}`);

    try {
        updatePackageName(context.originalPackageName, logger);
        logger.log('Original package name restored successfully');
    } catch (error) {
        logger.error('Error restoring original package name:', error);
        // Don't throw error here to avoid interrupting the flow after publishing
    }

    return result;
};

export default { ...npm, prepare, publish };

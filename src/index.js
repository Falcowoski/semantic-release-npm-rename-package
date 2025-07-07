import * as npm from '@semantic-release/npm';
import path from 'path';
import { updatePackageJsonForPublish } from './utils/updatePackageJsonForPublish.js';
import { installDependencies } from './utils/installDependencies.js';
import { saveOriginalPackageJson } from './utils/saveOriginalPackageJson.js';
import { restoreOriginalPackageJson } from './utils/restoreOriginalPackageJson.js';
import { rewriteSourceImports } from './utils/rewriteSourceImports.js';
import { restoreSourceImports } from './utils/restoreSourceImports.js';

const publish = async (pluginConfig, context) => {
    const { 
        packageName, 
        dependencyMappings,
        hasLegacyPeerDependenciesFlag,
        ...restPluginConfig
    } = pluginConfig;

    const { logger } = context;

    // If no customizations needed, use default npm publish
    if (!packageName && (!dependencyMappings || dependencyMappings.length === 0)) {
        return npm.publish(restPluginConfig, context);
    }

    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    
    let originalPackageJson = null;

    try {
        originalPackageJson = saveOriginalPackageJson(packageJsonPath, logger);

        const { updatedDependencies } = updatePackageJsonForPublish(
            packageName,
            dependencyMappings,
            packageJsonPath,
            logger
        );

        if (updatedDependencies.length > 0) {
            installDependencies(logger, hasLegacyPeerDependenciesFlag);
            await rewriteSourceImports(logger, updatedDependencies, dependencyMappings)
        }

        logger.log('Publishing package with updated configuration...');

        const result = await npm.publish(restPluginConfig, context);

        logger.log('Package published successfully');

        return result;
    } catch (error) {
        logger.error('Error during publish:', error);
        throw error;
    } finally {
        // Always restore original package.json
        if (originalPackageJson) {
            try {
                restoreOriginalPackageJson(originalPackageJson, packageJsonPath, logger);
                
                if (dependencyMappings && dependencyMappings.length > 0) {
                    logger.log('Running npm install to restore original dependencies...');
                    installDependencies(logger, hasLegacyPeerDependenciesFlag);
                    await restoreSourceImports(logger, updatedDependencies, dependencyMappings)
                }
            } catch (restoreError) {
                logger.error('Error restoring original state:', restoreError);
                // Don't throw here to avoid masking the original error
            }
        }
    }
};


export default { ...npm, publish };

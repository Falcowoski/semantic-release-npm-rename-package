import { execSync } from 'child_process';

/**
 * @param {any} logger
 * @param {boolean} hasLegacyPeerDependenciesFlag
 */
export const installDependencies = (logger, hasLegacyPeerDependenciesFlag = false) => {
    try {
        logger.log('Running npm install to update dependencies...');

        const command = hasLegacyPeerDependenciesFlag
            ? 'npm install --legacy-peer-deps'
            : 'npm install';

        execSync(command, { stdio: 'inherit' });
        
        logger.log('npm install completed successfully');
    } catch (error) {
        logger.error('Error running npm install:', error);
        throw error;
    }
};
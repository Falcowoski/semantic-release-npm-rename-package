import { execSync } from 'child_process';

/**
 * @param {any} logger
 * @param {boolean} legacyPeerDependencies
 */
export const installDependencies = (logger, legacyPeerDependencies = false) => {
    try {
        logger.log('Running npm install to update dependencies...');

        const command = legacyPeerDependencies
            ? 'npm install --legacy-peer-deps'
            : 'npm install';

        execSync(command, { stdio: 'inherit' });
        
        logger.log('npm install completed successfully');
    } catch (error) {
        logger.error('Error running npm install:', error);
        throw error;
    }
};
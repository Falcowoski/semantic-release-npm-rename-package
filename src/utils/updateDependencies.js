const DEPENDENCY_TYPES = [
    'dependencies', 
    'devDependencies',
    'peerDependencies',
];

/**
 * @param {Object} packageJson
 * @param {Array<[string, string]>} dependencyMappings
 * @param {Object} logger
 * @returns {string[]}
 */
const updateDependencies = (packageJson, dependencyMappings, logger) => {    
    const updatedDependencyNames = dependencyMappings.map(([originalDependencyName, newDependencyName]) => {
        // Example:
        // input: @repo/snow-eagle-core (originalDependencyName)
        // dependencies: Not found.
        // devDependencies: Found.
        // peerDependencies: Found.
        // output: [false, true, true];
        const updatedDependencies = DEPENDENCY_TYPES.map(dependencyType => {
            const dependencies = packageJson[dependencyType];

            if (!dependencies)
                return false;

            const originalDependency = dependencies[originalDependencyName];

            if (!originalDependency)
                return false;

            dependencies[newDependencyName] = originalDependency;

            delete packageJson[dependencyType][originalDependencyName];

            logger.log(`Updated ${dependencyType}: ${originalDependencyName} -> ${newDependencyName}`);

            return true;
        })

        const hasUpdatedSomeType = updatedDependencies.some(isUpdated => isUpdated);

        if (!hasUpdatedSomeType)
            return null;

        return originalDependencyName;
    })

    return updatedDependencyNames;
};
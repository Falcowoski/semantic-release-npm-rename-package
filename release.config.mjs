/**
 * @type {import('semantic-release').GlobalConfig}
 * 
 * @see https://semantic-release.gitbook.io/semantic-release/usage/configuration
 */
export default {
    branches: ['main'],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/github',
        '@semantic-release/npm',
    ]
  };
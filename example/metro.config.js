const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

// Read the package's "exports" field and prefer its "source" condition so
// `react-native-waveforms` resolves to ../src/index.tsx for HMR-friendly dev
// instead of the prebuilt lib/module/index.js.
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'source',
  'react-native',
  'browser',
  'require',
  'import',
];

module.exports = config;

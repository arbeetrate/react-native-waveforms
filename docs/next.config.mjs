import nextra from 'nextra';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const withNextra = nextra({
  // Nextra v4 wires its own MDX pipeline; we only need to declare the theme.
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const reactNativeWebPath = path.dirname(
  require.resolve('react-native-web/package.json')
);
const docsNodeModules = path.join(__dirname, 'node_modules');

const config = {
  // Static export - `next build` writes a fully static site to `out/`.
  output: 'export',
  reactStrictMode: true,
  images: { unoptimized: true },
  // Skip linting at build time - the root ESLint config is RN-oriented
  // and conflicts with this Next.js app's plain DOM patterns. Lint
  // can be wired up separately later if needed.
  eslint: { ignoreDuringBuilds: true },
  // Forwarded base path (set ASSET_PREFIX / BASE_PATH env vars at build time
  // when deploying to a subpath).
  basePath: process.env.BASE_PATH || undefined,
  assetPrefix: process.env.ASSET_PREFIX || undefined,
  trailingSlash: true,
  // Compile TS / Flow sources from these workspace packages - they ship as
  // untranspiled JSX / Flow / 'worklet' directives that Next.js's SWC pass
  // would otherwise reject.
  transpilePackages: [
    'react-native-web',
    'react-native-svg',
    'react-native-reanimated',
    'react-native-worklets',
    'react-native-waveforms',
  ],
  webpack: (config, { webpack }) => {
    // React Native ships with a `__DEV__` global that Metro defines at
    // bundle time. Webpack does not, so reanimated / react-native-web
    // throw `ReferenceError: __DEV__ is not defined` at runtime. Inject
    // it via DefinePlugin keyed off NODE_ENV.
    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      })
    );
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      // Route bare `react-native` imports to the web build, but leave
      // `react-native-web`, `react-native-svg`, etc. untouched.
      'react-native$': reactNativeWebPath,
    };
    // Prefer `.web.{tsx,ts,js,jsx}` over plain ones so platform-specific
    // web implementations (e.g. AnimatedRecorder.web.tsx) win.
    config.resolve.extensions = [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      ...config.resolve.extensions,
    ];
    // Yarn workspaces hoist react-native-reanimated to the repo root but
    // leave react-native-web in docs/node_modules. When reanimated (from
    // root) imports `react-native-web/...`, the default resolver only
    // looks for node_modules walked up from its own location, missing
    // the docs-level copy. Add docs/node_modules explicitly so any such
    // sub-path imports resolve.
    config.resolve.modules = [
      docsNodeModules,
      ...(config.resolve.modules ?? ['node_modules']),
    ];
    return config;
  },
};

export default withNextra(config);

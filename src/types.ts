/**
 * A function that adds MDX support to your Next.js config
 */
export type WithMDX = (config?: NextConfig) => NextConfig;

/**
 * Next.js configuration options
 */
export interface NextConfig {
  env?: unknown[];
  webpack?: unknown;
  webpackDevMiddleware?: unknown;
  distDir?: string;
  assetPrefix?: string;
  configOrigin?: string;
  useFileSystemPublicRoutes?: boolean;
  generateBuildId?: Function;
  generateEtags?: boolean;
  pageExtensions?: string[];
  target?: string;
  poweredByHeader?: boolean;
  compress?: boolean;
  devIndicators?: {
    buildActivity?: boolean;
    autoPrerender?: boolean;
  };
  onDemandEntries?: {
    maxInactiveAge?: number;
    pagesBufferLength?: number;
  };
  amp?: {
    canonicalBase?: string;
  };
  basePath?: string;
  sassOptions?: object;
  trailingSlash?: boolean;
  experimental?: {
    cpus?: number;
    modern?: boolean;
    plugins?: boolean;
    profiling?: boolean;
    sprFlushToDisk?: true;
    reactMode?: string;
    workerThreads?: boolean;
    pageEnv?: boolean;
    productionBrowserSourceMaps?: boolean;
    optimizeFonts?: boolean;
    optimizeImages?: boolean;
    scrollRestoration?: boolean;
  };
  future?: {
    excludeDefaultMomentLocales?: boolean;
  };
  serverRuntimeConfig?: object;
  publicRuntimeConfig?: object;
  reactStrictMode?: boolean;
}

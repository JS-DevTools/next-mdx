export interface Options {
  /**
   * The default layout component to use if no `layout` is specified in frontmatter.
   *
   * Defaults to "docs" which, combined with the default `layoutsDir` option, will
   * use the component at "./layouts/docs".
   */
  defaultLayout: string;

  /**
   * The path of the directory containing layout components.
   *
   * Defaults to "./layouts"
   */
  layoutsDir: string;

  /**
   * The path of the Next.js "pages" directory.
   *
   * Defaults to "./pages"
   */
  pagesDir: string;

  /**
   * The name of the prop to pass to JSX components to indicate that they originally came from
   * Markdown syntax. This allows you to distinguish between `**bold**` and `<b>bold</b>`,
   * which can be used to apply different styling, or even render completely different JSX.
   *
   * Defaults to "markdown"
   */
  markdownPropName: string;

  /**
   * The value of the prop that's passed to JSX components to indicate that they originally
   * came from Markdown syntax.
   *
   * Defaults to `true`
   */
  markdownPropValue: unknown;

  /**
   * Next-MDX caches files to reduce disk IO, which reduces build times.
   * This is the number of milliseconds to cache each file before re-reading it.
   *
   * Defaults to `60000` (one minute)
   */
  fileCacheTimeout: number;
}

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

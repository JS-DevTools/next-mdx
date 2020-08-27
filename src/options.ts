import { FileCache } from "./file-cache";

export interface Options {
  /**
   * The default layout component to use if no `layout` is specified in frontmatter.
   *
   * Defaults to "docs" which, combined with the default `layoutsDir` option, will
   * use the component at "./layouts/docs".
   */
  defaultLayout?: string;

  /**
   * The path of the directory containing layout components.
   *
   * Defaults to "./layouts"
   */
  layoutsDir?: string;

  /**
   * The path of the Next.js "pages" directory.
   *
   * Defaults to "./pages"
   */
  pagesDir?: string;

  /**
   * The name of the prop to pass to JSX components to indicate that they originally came from
   * Markdown syntax. This allows you to distinguish between `**bold**` and `<b>bold</b>`,
   * which can be used to apply different styling, or even render completely different JSX.
   *
   * Defaults to "markdown"
   */
  markdownPropName?: string;

  /**
   * The value of the prop that's passed to JSX components to indicate that they originally
   * came from Markdown syntax.
   *
   * Defaults to `true`
   */
  markdownPropValue?: unknown;

  /**
   * Next-MDX caches files to reduce disk IO, which reduces build times.
   * This is the number of milliseconds to cache each file before re-reading it.
   *
   * Defaults to `60000` (one minute)
   */
  fileCacheTimeout?: number;

  /**
   * The path at which to generate a Sitemap of all pages.  Can be set to `false` to disable
   * sitemap generation.
   *
   * Defaults to "./public/sitemap.xml"
   */
  sitemap?: string | false;

  /**
   * The root URL of the website. This is used to resolve any relative URLs
   */
  siteURL: string | URL;
}


export interface NormalizedOptions extends Required<Omit<Options, "fileCacheTimeout">> {
  siteURL: URL;

  /**
   * A cache of whether file information, to save redundant disk I/O
   */
  fileCache: FileCache;
}


/**
 * Normalizes user-specified options, and applies defaults for any options that
 * aren't specified.
 */
export function normalizeOptions(options: Options): NormalizedOptions {
  const fileCacheTimeout = options.fileCacheTimeout || 60000;

  return {
    defaultLayout: options.defaultLayout || "docs",
    layoutsDir: options.layoutsDir || "./layouts",
    pagesDir: options.pagesDir || "./pages",
    markdownPropName: options.markdownPropName || "markdown",
    markdownPropValue: options.markdownPropValue || true,
    sitemap: options.sitemap === false ? false : (options.sitemap || "./public/sitemap.xml"),
    siteURL: options.siteURL instanceof URL ? options.siteURL : new URL(options.siteURL),
    fileCache: new FileCache(fileCacheTimeout),
  };
}

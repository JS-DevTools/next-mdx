import { promises as fs } from "fs";
import * as globby from "globby";
import * as path from "path";
import { Processor, Transformer } from "unified";
import { Parent } from "unist";
import { NormalizedOptions } from "./options";
import { FrontMatter, readFrontmatter } from "./read-frontmatter";


// Hacky way to ensure that MDX waits for the sitemap to be generated
let sitemapIsCurrentlyBeingGenerated: Promise<void> | undefined;


/**
 * This MDX plugin doesn't actually do anything. It just waits for the sitemap.xml file to finish
 * being generated, so MDX doesn't return while we're still reading/writing files.
 * This also ensures that the FileCache is fully populated, so subsequent MDX plugins can utilize it.
 */
export function awaitSitemap(this: Processor): Transformer {
  return async (root: Parent): Promise<Parent> => {
    await sitemapIsCurrentlyBeingGenerated;
    return root;
  }
}


/**
 * Creates a sitemap.xml file containing all the pages on the site.
 * Markdown and MDX pages can customize sitemap values in their frontmatter.
 */
export function generateSitemap(options: NormalizedOptions): void {
  // Generate the sitemap asynchronously,
  // and store the Promise so it can be awaited-on by the MDX plugin
  sitemapIsCurrentlyBeingGenerated = Promise.resolve().then(async () => {
    if (options.sitemap) {
      const pages = await getAllPages(options);
      await createSitemap(options.sitemap, pages);
    }
  });
}


/**
 * A single page in the sitemap
 *
 * @see https://github.com/ekalinin/sitemap.js/blob/master/api.md#sitemap-item-options
 */
interface Page {
  loc: string;
  lastmod: string;
  priority?: number;
  changefreq?: string;
  image?: string;
}


/**
 * Returns a list of all pages on the site
 */
async function getAllPages(options: NormalizedOptions): Promise<Page[]> {
  const pagePaths = await globby("**/*.{js,jsx,ts,tsx,md,mdx}", {
    cwd: options.pagesDir,
    onlyFiles: true,
    ignore: [
      "_app.{js,jsx,ts,tsx}",
      "_document.{js,jsx,ts,tsx}",
      "_error.{js,jsx,ts,tsx}",
      "404.{js,jsx,ts,tsx,md,mdx}",
    ],
  });

  const pages = await Promise.all(pagePaths.sort().map(getPage.bind(undefined, options)));
  return pages.filter(Boolean) as Page[];
}


/**
 * Returns the sitemap info for a page
 */
async function getPage(options: NormalizedOptions, relativePath: string): Promise<Page | undefined> {
  const absolutePath = path.resolve(options.pagesDir, relativePath);
  const fileExtension = path.extname(relativePath);
  const stats = await fs.stat(absolutePath);

  // Add this file to the file cache, to save redundant disk I/O
  options.fileCache.add({ absolutePath, exists: true });

  // Determine the page's public URL
  relativePath = relativePath.slice(0, -(fileExtension.length));
  if (path.basename(relativePath) === "index") {
    relativePath = path.dirname(relativePath);
  }
  const url = new URL(relativePath, options.siteURL);

  // Read the file's frontmatter, if applicable
  let frontmatter: FrontMatter = {};
  if (fileExtension === ".md" || fileExtension === ".mdx") {
    frontmatter = await readFrontmatter(absolutePath);
  }

  // Extract sitemap fields from the frontmatter
  // eslint-disable-next-line prefer-const
  let { hidden, draft, image, priority, changefreq, changeFrequency } = frontmatter;

  if (hidden || draft) {
    // Don't include this page in the sitemap
    return undefined;
  }

  if (typeof image === "string") {
    // Resolve the image URL against the page URL
    const imageURL = new URL(image, url);
    image = imageURL.href;
  }

  // Allow either one of these frontmatter fields
  changefreq = changefreq || changeFrequency;

  return {
    loc: url.href,
    lastmod: stats.mtime.toISOString(),
    image: typeof image === "string" ? image : undefined,
    priority: typeof priority === "number" ? priority : undefined,
    changefreq: typeof changefreq === "string" ? changefreq : undefined,
  };
}


/**
 * Creates a sitemap.xml file containing the specified pages
 */
async function createSitemap(filePath: string, pages: Page[]) {
  let xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"` +
    ` xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  for (const page of pages) {
    xml +=
      "  <url>\n" +
      `    <loc>${page.loc}</loc>\n` +
      `    <lastmod>${page.lastmod}</lastmod>\n`;

    if (page.changefreq) {
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    }

    if (page.priority) {
      xml += `    <priority>${page.priority.toFixed(1)}</priority>\n`;
    }

    if (page.image) {
      xml +=
        "    <image:image>\n" +
        `      <image:loc>${page.image}</image:loc>\n` +
        "    </image>\n";
    }

    xml += "  </url>\n";
  }

  xml += "</urlset>";

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, xml);
}

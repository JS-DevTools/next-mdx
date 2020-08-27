import * as officialNextMDX from "@next/mdx";
import * as path from "path";
import * as frontmatter from "remark-frontmatter";
import { annotateMarkdownNodes } from "./annotate-markdown-nodes";
import { frontmatterToMDX } from "./frontmatter-to-mdx";
import { linkToMDX } from "./link-to-mdx";
import { normalizeOptions, Options } from "./options";
import { sitemap } from "./sitemap";
import { WithMDX } from "./types";
import "./typings";

/**
 * Adds support for MDX with advanced syntax features in Next.js applications
 */
export function nextMDX(options: Options): WithMDX {
  const opt = normalizeOptions(options);

  // Resolve directory paths to absolute paths
  opt.layoutsDir = path.resolve(opt.layoutsDir);
  opt.pagesDir = path.resolve(opt.pagesDir);

  // Call the official Next.js MDX plugin with our custom options
  return officialNextMDX({
    options: {
      remarkPlugins: [
        frontmatter,
        [frontmatterToMDX, opt],
        [linkToMDX, opt],
      ],
      rehypePlugins: [
        [annotateMarkdownNodes, opt],
      ]
    }
  });
}

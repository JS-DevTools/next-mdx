import * as officialNextMDX from "@next/mdx";
import * as frontmatter from "remark-frontmatter";
import { annotateMarkdownNodes } from "./annotate-markdown-nodes";
import { frontmatterToMDX } from "./frontmatter-to-mdx";
import { linkToMDX } from "./link-to-mdx";
import { Options, WithMDX } from "./types";
import "./typings";

/**
 * Adds support for MDX with advanced syntax features in Next.js applications
 */
export function nextMDX(options: Partial<Options> = {}): WithMDX {
  options = {
    defaultLayout: "docs",
    layoutsDir: "./components/layouts",
    pagesDir: "./pages",
    markdownPropName: "markdown",
    markdownPropValue: true,
    fileCacheTimeout: 60000,
    ...options,
  };

  // Call the official Next.js MDX plugin with our custom options
  return officialNextMDX({
    options: {
      remarkPlugins: [
        frontmatter,
        [frontmatterToMDX, options],
        [linkToMDX, options],
      ],
      rehypePlugins: [
        [annotateMarkdownNodes, options],
      ]
    }
  });
}
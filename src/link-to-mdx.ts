import { promises as fs } from "fs";
import * as path from "path";
import { Processor, Transformer } from "unified";
import { Parent } from "unist";
import { fileURLToPath, pathToFileURL } from "url";
import { VFile } from "vfile";
import { Options } from "./types";
import { toPosixPath } from "./utils";

const mdxExtension = ".mdx";
const mdxIndex = "index.mdx";

// This RegExp pattern matches MDX file paths in JSX attributes
const jsxMdxLinkPattern = /"([^"]+\.mdx[^"]*)"/g;

// To save redundant disk IO, we cache verified file paths for a bit.
// This map contains verified file paths and their expiration times.
const fileCache = new Map<string, Promise<number>>();

/**
 * Rewrites links to MDX files (e.g. `../other-page.mdx` becomes `../other-page`).
 * Also verifies that the target file exists.
 */
export function linkToMDX(this: Processor, options: Options): Transformer {
  return async (root: Parent, file: VFile) => {
    await crawl(root, file, options);
    return root;
  };
}

/**
 * Recursively rewrites links to MDX files
 */
async function crawl(tree: Parent, file: VFile, options: Options): Promise<void> {
  const promises = [];

  for (const node of tree.children) {
    switch (node.type) {
      case "link":
        if (typeof node.url === "string" && node.url.includes(mdxExtension)) {
          const newLink = await validateAndRewriteLink(node.url, file, options);
          if (newLink) {
            node.url = newLink;
          }
        }
        break;

      case "jsx":
        if (typeof node.value === "string" && node.value.includes(mdxExtension)) {
          const matches = [...node.value.matchAll(jsxMdxLinkPattern)];
          for (const [, link] of matches) {
            const newLink = await validateAndRewriteLink(link, file, options);
            if (newLink) {
              node.value = (node.value as string).replace(link, newLink);
            }
          }
        }
        break;
    }

    if (node.children) {
      const promise = crawl(node as Parent, file, options);
      promises.push(promise);
    }
  }

  // Process all child nodes simultaneously
  await Promise.all(promises);
}

/**
 * Determines whether the link points to a local MDX file. If it does, then the link is validated
 * and rewritten to be relative to the Next.js "Pages" directory (which is required by Next.js).
 *
 * @param link - An absolute or relative URL that may point to an MDX file
 * @param file - The file that contains the link
 *
 * @returns
 * If `link` points to a local MDX file, then a new, rewritten link is returned.
 * Otherwise, `undefined` is returned.
 */
async function validateAndRewriteLink(link: string, file: VFile, options: Options): Promise<string | undefined> {
  // Resolve the link, relative to the current file
  const fileURL = pathToFileURL(file.path!);
  const linkURL = new URL(link, fileURL);

  // Abort if the link does not point to a local MDX file
  if (linkURL.protocol !== "file:" || !linkURL.pathname.endsWith(mdxExtension)) {
    return;
  }

  const absolutePath = fileURLToPath(linkURL);
  await validateLink(absolutePath, link, file, options);
  return rewriteLink(absolutePath, linkURL, options);
}

/**
 * Verifies that a link points to a valid file
 *
 * @param absolutePath - The absolute file path to validate
 * @param link - The original link, as authored in the file
 * @param file - The file that contains the link
 * @param options - An options object
 *
 * @throws A URIError if the target file does not exist
 */
async function validateLink(absolutePath: string, link: string, file: VFile, options: Options): Promise<void> {
  const cached = fileCache.get(absolutePath);

  try {
    if (cached) {
      // We've already started checking this file, so wait for the result
      const expires = await cached;
      if (expires >= Date.now()) {
        // This file has been verified, and the verification is not expired
        return;
      }
    }

    // This file has not been verified, or the verification has expired.
    // So verify it exists, and cache the result
    const promise = verifyFileExists(absolutePath, options);
    fileCache.set(absolutePath, promise);

    // wait for the file verification to finish
    await promise;
  }
  catch (e) {
    const error = e as NodeJS.ErrnoException;
    throw new URIError(
      `Broken link to "${link}" in ${file.basename!}.\n${error.message}`);
  }
}

/**
 * Verifies that the specified file exists
 *
 * @param absolutePath - The absolute file path to check
 * @param options - An options object
 * @returns The timestamp when this verification expires
 */
async function verifyFileExists(absolutePath: string, options: Options): Promise<number> {
  // Verify that the file exists (this will throw otherwise)
  await fs.access(absolutePath);

  // Return the timestamp when this verification expires
  return Date.now() + options.fileCacheTimeout;
}

/**
 * Rewrites a link to an MDX file
 *
 * NOTE: Next.js requires all links to be relative to the "pages" directory
 *
 * @param absolutePath - The absolute file path that the link points to
 * @param linkURL - The `absolutePath`, as a parsed "file://" URL
 * @param options - An options object
 * @returns The rewritten link, relative to the "pages" directory
 */
function rewriteLink(absolutePath: string, linkURL: URL, options: Options): string {
  // Get the relative path from the "pages" directory
  let relativePath = path.sep + path.relative(options.pagesDir, absolutePath);

  if (path.basename(relativePath) === mdxIndex) {
    // Remove "index.mdx"
    relativePath = path.dirname(relativePath);
  }
  else {
    // Remove the ".mdx" extension
    relativePath = relativePath.slice(0, -mdxExtension.length);
  }

  // Convert the path to a relative URL
  const relativeURL = toPosixPath(relativePath);

  // Append any querystring or hash from the original link
  return relativeURL + linkURL.search + linkURL.hash;
}

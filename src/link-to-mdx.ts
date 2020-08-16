import { promises as fs } from "fs";
import * as path from "path";
import { Processor, Transformer } from "unified";
import { Parent } from "unist";
import { fileURLToPath, pathToFileURL } from "url";
import { VFile } from "vfile";
import { Options } from "./types";

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
    const fileURL = pathToFileURL(file.path!);
    await crawl(root, fileURL, options);
    return root;
  };
}

/**
 * Recursively rewrites links to MDX files
 */
async function crawl(tree: Parent, fileURL: URL, options: Options): Promise<void> {
  const promises = [];

  for (const node of tree.children) {
    switch (node.type) {
      case "link":
        if (typeof node.url === "string" && node.url.includes(mdxExtension)) {
          // Determine whether this is a link to a local MDX file
          const url = resolveLinkToMdxFile(node.url, fileURL);
          if (!url) continue;

          // Validate and rewrite the link
          await validateLink(url, fileURL, options);
          node.url = rewriteLink(node.url, url);
        }
        break;

      case "jsx":
        if (typeof node.value === "string" && node.value.includes(mdxExtension)) {
          const matches = [...node.value.matchAll(jsxMdxLinkPattern)];
          for (const [, link] of matches) {
            // Determine whether this is a link to a local MDX file
            const url = resolveLinkToMdxFile(link, fileURL);
            if (!url) continue;

            // Validate and rewrite the link
            await validateLink(url, fileURL, options);
            node.value = (node.value as string).replace(link, rewriteLink(link, url));
          }
        }
        break;
    }

    if (node.children) {
      const promise = crawl(node as Parent, fileURL, options);
      promises.push(promise);
    }
  }

  // Process all child nodes simultaneously
  await Promise.all(promises);
}

/**
 * Resolves a URL, relative to the file URL, but ONLY returns it if it points to a local MDX file
 */
function resolveLinkToMdxFile(relativeURL: string, fileURL: URL): URL | undefined {
  const url = new URL(relativeURL, fileURL);
  if (url.protocol === "file:" && url.pathname.endsWith(mdxExtension)) {
    return url;
  }
}

/**
 * Verifies that the link points to a valid file
 */
async function validateLink(url: URL, fileURL: URL, options: Options): Promise<void> {
  const absolutePath = fileURLToPath(url);
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
      `Broken link to ${prettyName(url)} in ${prettyName(fileURL)}\n${error.message}`);
  }
}

/**
 * Verifies that the specified file exists
 */
async function verifyFileExists(absolutePath: string, options: Options): Promise<number> {
  // Verify that the file exists (this will throw otherwise)
  await fs.access(absolutePath);

  // Return the timestamp when this verification expires
  return Date.now() + options.fileCacheTimeout;
}

/**
 * Formats a URL for an error message
 */
function prettyName(url: URL): string {
  const fileName = path.basename(url.pathname);
  if (fileName === mdxIndex) {
    const dirname = path.basename(path.dirname(url.pathname));
    return path.posix.join(dirname, fileName);
  }
  else {
    return fileName;
  }
}

/**
 * Rewrites a link to an MDX file
 */
function rewriteLink(relativeURL: string, absoluteURL: URL): string {
  const fileName = path.basename(absoluteURL.pathname);

  if (fileName === mdxIndex) {
    relativeURL = relativeURL.replace(fileName, "");
  }
  else {
    relativeURL = relativeURL.replace(fileName, fileName.slice(0, -4));
  }

  return relativeURL;
}

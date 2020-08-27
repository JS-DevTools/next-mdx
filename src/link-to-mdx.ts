import { promises as fs } from "fs";
import * as path from "path";
import { Processor, Transformer } from "unified";
import { Parent } from "unist";
import { fileURLToPath, pathToFileURL } from "url";
import { VFile } from "vfile";
import { FileInfo } from "./file-cache";
import { NormalizedOptions } from "./options";
import { MDXNode, toPosixPath } from "./utils";

const mdxExtension = ".mdx";
const mdxIndex = "index.mdx";

/**
 * Rewrites links to MDX files (e.g. `../other-page.mdx` becomes `../other-page`).
 * Also verifies that the target file exists.
 */
export function linkToMDX(this: Processor, options: NormalizedOptions): Transformer {
  return async (root: Parent, file: VFile) => {
    await crawl(root, file, options);
    return root;
  };
}

/**
 * Recursively rewrites links to MDX files
 */
async function crawl(tree: Parent, file: VFile, options: NormalizedOptions): Promise<void> {
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

      case "mdxBlockElement":
      case "mdxSpanElement":
        const mdxNode = node as MDXNode;
        for (const attribute of mdxNode.attributes) {
          if (typeof attribute.value === "string" && attribute.value.includes(mdxExtension)) {
            const newLink = await validateAndRewriteLink(attribute.value, file, options);
            if (newLink) {
              attribute.value = newLink;
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
async function validateAndRewriteLink(link: string, file: VFile, options: NormalizedOptions): Promise<string | undefined> {
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
async function validateLink(absolutePath: string, link: string, file: VFile, options: NormalizedOptions): Promise<void> {
  const { fileCache } = options;

  // See if we've already started checking this file
  const cached = await fileCache.get(absolutePath);

  if (cached.exists && cached.expires >= Date.now()) {
    // This file has been verified, and the verification is not expired
    return;
  }

  // This file has not been verified, or the verification has expired.
  // So verify it exists, and cache the result
  fileCache.addPending(absolutePath, verifyFileExists(absolutePath));

  // wait for the file verification to finish
  const { exists } = await fileCache.get(absolutePath);

  if (!exists) {
    // Immediately remove the file from the cache
    fileCache.remove(absolutePath);

    throw new URIError(`Broken link to "${link}" in ${file.basename!}.`);
  }
}

/**
 * Verifies that the specified file exists
 *
 * @param absolutePath - The absolute file path to check
 * @returns The timestamp when this verification expires
 */
async function verifyFileExists(absolutePath: string): Promise<FileInfo> {
  try {
    // Verify that the file exists (this will throw otherwise)
    await fs.access(absolutePath);

    return {
      absolutePath,
      exists: true,
    };
  }
  catch (_) {
    return {
      absolutePath,
      exists: false,
    };
  }
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
function rewriteLink(absolutePath: string, linkURL: URL, options: NormalizedOptions): string {
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

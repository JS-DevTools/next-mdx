import { promises as fs } from "fs";
import * as grayMatter from "gray-matter";


export interface FrontMatter {
  [key: string]: unknown;
}


/**
 * Reads and parses a file's frontmatter, if any
 */
export async function readFrontmatter(filePath: string): Promise<FrontMatter> {
  // NOTE: This reads the ENTIRE file, not just the frontmatter section.
  // TODO: Add logic to only read the frontmatter section of the file.
  const contents = await fs.readFile(filePath, "utf8");

  // Parse the frontmatter
  const matter = grayMatter(contents);
  return matter.data;
}

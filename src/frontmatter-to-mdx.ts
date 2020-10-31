import { promises as fs } from "fs";
import * as path from "path";
import { Processor, Transformer } from "unified";
import { Parent } from "unist";
import { VFile } from "vfile";
import * as yaml from "yaml";
import { NormalizedOptions } from "./options";
import { toPosixPath } from "./utils";

interface Frontmatter {
  [key: string]: unknown;
}

/**
 * Parses the YAML frontmatter and converts it to an MDX default export
 */
export function frontmatterToMDX(this: Processor, options: NormalizedOptions): Transformer {
  return async (root: Parent, file: VFile): Promise<Parent> => {
    const stat = await fs.stat(file.path!);
    const frontmatter = extractFrontMatter(root);
    const insertionPoint = findInsertionPoint(root);
    const layoutPath = getLayoutPath(frontmatter, file, options);

    // Serialize the props as React attributes
    const props = toReactElementAttributes({
      ...frontmatter,
      createdAt: stat.birthtime,
      modifiedAt: stat.mtime
    });

    root.children.splice(insertionPoint, 0,
      {
        type: "import",
        value: `import Layout from ${JSON.stringify(layoutPath)};\n`,
      },
      ...Object.entries(frontmatter).map(([key, value]) => (

        {
          type: "export",
          value: `export const ${key} = ${JSON.stringify(value)};\n`,
        }
      )),
      {
        type: "export",
        value: `export const createdAt = new Date(${stat.birthtimeMs})\n`,
      },
      {
        type: "export",
        value: `export const modifiedAt = new Date(${stat.mtimeMs})\n`,
      },
      {
        type: "export",
        default: true,
        value: `export default (props) => <Layout${props}\n  {...props}\n/>\n`,
      },
    );

    return root;
  }
}

/**
 * Removes the frontmatter node, parses it, and returns the parsed value
 */
function extractFrontMatter(tree: Parent): Frontmatter {
  const frontmatterIndex = tree.children.findIndex(node => node.type === "yaml");

  if (frontmatterIndex >= 0) {
    const [frontmatterNode] = tree.children.splice(frontmatterIndex, 1);
    const frontmatter = yaml.parse(frontmatterNode.value as string) as unknown;
    if (typeof frontmatter === "object" && frontmatter !== null) {
      return frontmatter as Frontmatter;
    }
  }
  return {};
}

/**
 * Finds the point where we should insert the MDX default export.
 * This is after all "import" nodes, but before any "JSX" or "markdown" nodes.
 */
function findInsertionPoint(tree: Parent): number {
  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i];
    switch (node.type) {
      case "import":
        continue;
      default:
        return i;
    }
  }
  return 0;
}

/**
 * Returns the path of layout component to use
 */
function getLayoutPath(frontmatter: Frontmatter, file: VFile, options: NormalizedOptions): string {
  const layout = String(frontmatter.layout || options.defaultLayout);
  const layoutPath = path.relative(file.dirname!, path.join(options.layoutsDir, layout));
  delete frontmatter.layout;

  // "import" statements should use POSIX separators
  return toPosixPath(layoutPath);
}

/**
 * Serializes the given frontmatter as React element attributes
 */
function toReactElementAttributes(obj: Frontmatter): string {
  let props = "";

  // eslint-disable-next-line prefer-const
  for (let [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      value = JSON.stringify(value);
    }
    else if (value instanceof Date) {
      value = `{new Date(${value.getTime()})}`;
    }
    else if (Array.isArray(value)) {
      value = `{[\n    ${value.map(item => JSON.stringify(item)).join(",\n    ")}\n  ]}`;
    }
    else {
      value = `{${JSON.stringify(value)}}`;
    }

    props += `\n  ${key}=${value as string}`;
  }

  return props;
}

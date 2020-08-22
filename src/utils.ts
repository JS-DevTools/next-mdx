import { Node, Parent } from "unist";

const isWindows = process.platform === "win32";
const windowsPathSepartorPattern = /\\/g;
const posixPathSeparator = "/";

/**
 * An MDX AST node
 */
export interface MDXNode extends Parent {
  type: "mdxBlockElement" | "mdxSpanElement";
  name: string;
  attributes: MDXAttribute[];
  children: Node[];
}

/**
 * A JSX attribute on an MDX AST node
 */
export interface MDXAttribute extends Node {
  type: "mdxAttribute";
  name: string;
  value: string | MDXValueExpression;
}

/**
 * The value of a JSX attribute
 */
export interface MDXValueExpression extends Node {
  type: "mdxValueExpression";
  value: string;
}

/**
 * Replaces Windows path separators with POSIX separators.
 */
export function toPosixPath(p: string): string {
  if (isWindows) {
    return p.replace(windowsPathSepartorPattern, posixPathSeparator);
  }
  else {
    return p;
  }
}

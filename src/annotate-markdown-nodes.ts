import { Processor, Transformer } from "unified";
import { Node, Parent } from "unist";
import { Options } from "./types";

/**
 * A Rehype plugin that adds a property to all Markdown elements
 */
export function annotateMarkdownNodes(this: Processor, options: Options): Transformer {
  return (root: Parent) => {
    crawl(root, options);
    return root;
  };
}

/**
 * Recursively annotates child nodes
 */
function crawl(tree: Parent, options: Options): void {
  for (const node of tree.children) {
    if (node.type === "element") {
      const htmlNode = node as HtmlNode;
      htmlNode.properties = htmlNode.properties || {};
      htmlNode.properties[options.markdownPropName] = options.markdownPropValue;
    }
    if (node.children) {
      crawl(node as Parent, options);
    }
  }
}

/**
 * A Rehype HTML node
 */
export interface HtmlNode<T extends string = string, TChild extends Node = Node> extends Node {
  type: "element";
  tagName: T;
  properties: {
    title?: string;
    className?: string[];
    download?: boolean;
    href?: string;
    [key: string]: unknown;
  };
  children: TChild[];
}

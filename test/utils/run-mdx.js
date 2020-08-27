"use strict";

const nextMDX = require("../../lib");
const mdx = require("@mdx-js/mdx");
const { promises: fs } = require("fs");

module.exports = runMDX;

/**
 * Runs MDX on the given Markdown text, using the specified Next-MDX options
 */
async function runMDX (filepath, options) {
  // Default options
  options = {
    siteURL: "http://example.com",
    ...options,
  };

  // Produce a Next.js configuration
  const withMDX = nextMDX(options);
  const nextConfig = withMDX();

  // Simulate running Webpack, to configure the @mdx-js/loader
  // https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config
  const webpackConfig = { module: { rules: [] }};
  const nextOptions = { defaultLoaders: {} };
  nextConfig.webpack(webpackConfig, nextOptions);

  // Get the @mdx-js/loader options
  const mdxOptions = webpackConfig.module.rules[0].use[1].options;

  // Run MDX with the @mdx-js/loader options
  const markdown = await fs.readFile(filepath, "utf-8");
  return await mdx(markdown, { ...mdxOptions, filepath });
}

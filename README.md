Advanced MDX support for Next.js
==============================================
### Adds support for MDX with advanced syntax features in Next.js applications

[![Cross-Platform Compatibility](https://shipengine.github.io/img/badges/os-badges.svg)](https://github.com/ShipEngine/next-mdx/actions)
[![Build Status](https://github.com/ShipEngine/next-mdx/workflows/CI-CD/badge.svg)](https://github.com/ShipEngine/next-mdx/actions)

[![Coverage Status](https://coveralls.io/repos/github/ShipEngine/next-mdx/badge.svg?branch=master)](https://coveralls.io/github/ShipEngine/next-mdx)
[![Dependencies](https://david-dm.org/ShipEngine/next-mdx.svg)](https://david-dm.org/ShipEngine/next-mdx)

[![npm](https://img.shields.io/npm/v/@shipengine/next-mdx.svg)](https://www.npmjs.com/package/@shipengine/next-mdx)



This library wraps [the official Next.js + MDX plugin](https://github.com/vercel/next.js/tree/canary/packages/next-mdx) and configures it with additional [Remark](https://github.com/remarkjs/remark) and [Rehype](https://github.com/rehypejs/rehype) plugins to enable advanced Markdown syntax and make MDX easier to use for our specific use-cases.



Features
--------------------------

- Adds support for YAML frontmatter
  - Automatically adds `createdAt` and `modifiedAt` frontmatter fields. Useful for populating `<meta>` tags for SEO and social media.
  - Adds support for a `layout` frontmatter field, which can be used to customize the React layout component to use for each MDX page.

- Passes a `markdown` boolean to React components to indicate whether they originally came from Markdown syntax. This allows you to distinguish between `**bold**` and `<b>bold</b>`  which can be used to apply different styling, or even render completely different JSX.

- Adds support for links to MDX files (e.g. `/pages/docs/some-page.mdx` instead of `/pages/docs/some-page`)

- Detects broken links to MDX files

- Converts blockquotes to callouts if they begin with something like `**NOTE:**`, `**TIP:**`, etc.

- Combines multiple consecutive code blocks into a multi-language code sample

- Adds a table of contents to every page



Usage
--------------------------
Install the library via [npm](https://docs.npmjs.com/about-npm/):

> NOTE: This is a private NPM package. You need to be logged-in to the @shipengine NPM org

```bash
npm install @shipengine/next-mdx
```

Then use it in your `next.config.js` file:

```javascript
const withMDX = require("@shipengine/next-mdx");

module.exports = withMDX({
  pageExtensions: ["tsx", "mdx"],
});
```

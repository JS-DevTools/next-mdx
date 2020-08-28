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

- Rewrites links to MDX files (e.g. `/pages/docs/some-page.mdx` becomes `/pages/docs/some-page`)

- Detects broken links to MDX files



Usage
--------------------------
Install the library via [npm](https://docs.npmjs.com/about-npm/):

> NOTE: This is a private NPM package. You need to be logged-in to the @shipengine NPM org

```bash
npm install @shipengine/next-mdx
```

Then use it in your `next.config.js` file:

```javascript
const nextMDX = require("@shipengine/next-mdx");

const withMDX = nextMDX({
  // Next-MDX options go here
  siteURL: "http://example.com"
});

module.exports = withMDX({
  // Next.js options go here
  pageExtensions: ["tsx", "mdx"],
});
```



Options
--------------------------------
See [`options.ts`](src/options.ts) for all of the options that you can pass to Next-MDX.

> **NOTE:** Don't confuse the Next-MDX options with the Next.js options.
> Refer to the code example above to see where each goes.

Advanced MDX support for Next.js
==============================================
### Adds support for MDX with advanced syntax features in Next.js applications

[![Cross-Platform Compatibility](https://jstools.dev/img/badges/os-badges.svg)](https://github.com/JS-DevTools/next-mdx/actions)
[![Build Status](https://github.com/JS-DevTools/next-mdx/workflows/CI-CD/badge.svg)](https://github.com/JS-DevTools/next-mdx/actions)

[![Coverage Status](https://coveralls.io/repos/github/JS-DevTools/next-mdx/badge.svg?branch=master)](https://coveralls.io/github/JS-DevTools/next-mdx)
[![Dependencies](https://david-dm.org/JS-DevTools/next-mdx.svg)](https://david-dm.org/JS-DevTools/next-mdx)

[![npm](https://img.shields.io/npm/v/@jsdevtools/next-mdx.svg)](https://www.npmjs.com/package/@jsdevtools/next-mdx)
[![License](https://img.shields.io/npm/l/@jsdevtools/next-mdx.svg)](LICENSE)
[![Buy us a tree](https://img.shields.io/badge/Treeware-%F0%9F%8C%B3-lightgreen)](https://plant.treeware.earth/JS-DevTools/next-mdx)



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

```bash
npm install @jsdevtools/next-mdx
```

Then use it in your `next.config.js` file:

```javascript
const nextMDX = require("@jsdevtools/next-mdx");

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



Contributing
--------------------------
Contributions, enhancements, and bug-fixes are welcome!  [Open an issue](https://github.com/JS-DevTools/next-mdx/issues) on GitHub and [submit a pull request](https://github.com/JS-DevTools/next-mdx/pulls).

#### Building
To build the project locally on your computer:

1. __Clone this repo__<br>
`git clone https://github.com/JS-DevTools/next-mdx.git`

2. __Install dependencies__<br>
`npm install`

3. __Build the code__<br>
`npm run build`

4. __Run the tests__<br>
`npm test`



License
--------------------------
Next MDX is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.

This package is [Treeware](http://treeware.earth). If you use it in production, then we ask that you [**buy the world a tree**](https://plant.treeware.earth/JS-DevTools/next-mdx) to thank us for our work. By contributing to the Treeware forest you’ll be creating employment for local families and restoring wildlife habitats.



Big Thanks To
--------------------------
Thanks to these awesome companies for their support of Open Source developers ❤

[![GitHub](https://jstools.dev/img/badges/github.svg)](https://github.com/open-source)
[![NPM](https://jstools.dev/img/badges/npm.svg)](https://www.npmjs.com/)
[![Coveralls](https://jstools.dev/img/badges/coveralls.svg)](https://coveralls.io)
[![Travis CI](https://jstools.dev/img/badges/travis-ci.svg)](https://travis-ci.com)
[![SauceLabs](https://jstools.dev/img/badges/sauce-labs.svg)](https://saucelabs.com)

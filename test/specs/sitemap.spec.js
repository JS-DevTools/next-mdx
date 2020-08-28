"use strict";

const runMDX = require("../utils/run-mdx");
const createFiles = require("../utils/create-files");
const { promises: fs } = require("fs");
const { assert, expect } = require("chai");
const untag = require("untag");

describe("Sitemap", () => {

  it("should create a sitemap.xml file", async () => {
    await createFiles([
      {
        path: "./pages/index.mdx",
        contents: untag`
          ---
          title: The Home Page
          priority: 0.95
          ---

          # The Home Page
        `
      },
      {
        path: "./pages/markdown-page/index.md",
        contents: untag`
          ---
          title: The Page Title
          image: img/some-image.png
          changeFrequency: monthly
          ---

          # This is a Markdown page
        `
      },
      {
        path: "./pages/subdir/javascript-page.jsx",
        contents: untag`
          import styles from "./styles.module.css";

          export default () =>
            <div className={styles.page}>
              <h1>Hello, World!</h1>
            </div>
        `
      },
      {
        path: "./pages/subdir/subsubdir/typescript-page/index.jsx",
        contents: untag`
          import styles from "./styles.module.css";

          export default () =>
            <div className={styles.page}>
              <h1>Hello, World!</h1>
            </div>
        `
      },
    ]);

    await runMDX("./pages/index.mdx");

    const sitemap = await fs.readFile("public/sitemap.xml", "utf8");
    expect(sitemap).to.equal(untag`
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
        <url>
          <loc>http://example.com/</loc>
          <lastmod>2000-02-02T00:00:00.000Z</lastmod>
          <priority>0.9</priority>
        </url>
        <url>
          <loc>http://example.com/markdown-page</loc>
          <lastmod>2000-02-02T00:00:00.000Z</lastmod>
          <changefreq>monthly</changefreq>
          <image:image>
            <image:loc>http://example.com/img/some-image.png</image:loc>
          </image>
        </url>
        <url>
          <loc>http://example.com/subdir/javascript-page</loc>
          <lastmod>2000-02-02T00:00:00.000Z</lastmod>
        </url>
        <url>
          <loc>http://example.com/subdir/subsubdir/typescript-page</loc>
          <lastmod>2000-02-02T00:00:00.000Z</lastmod>
        </url>
      </urlset>`
    );
  });

  it("should not include hidden files in the sitemap", async () => {
    await createFiles([
      {
        path: "./pages/index.mdx",
        contents: untag`
          ---
          title: The Home Page
          hidden: true
          ---

          # The Home Page
        `
      },
      {
        path: "./pages/markdown-page/index.md",
        contents: untag`
          ---
          title: The Page Title
          image: img/some-image.png
          changeFrequency: monthly
          draft: true
          ---

          # This is a Markdown page
        `
      },
    ]);

    await runMDX("./pages/index.mdx");

    const sitemap = await fs.readFile("public/sitemap.xml", "utf8");
    expect(sitemap).to.equal(untag`
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
      </urlset>`
    );
  });

  it("should not include special NextJS files in the sitemap", async () => {
    await createFiles([
      {
        path: "./pages/_app.jsx",
        contents: untag`
          import styles from "./styles.module.css";

          export default () =>
            <div className={styles.page}>
              <h1>Hello, World!</h1>
            </div>
        `
      },
      {
        path: "./pages/_document.tsx",
        contents: untag`
          import styles from "./styles.module.css";

          export default () =>
            <div className={styles.page}>
              <h1>Hello, World!</h1>
            </div>
        `
      },
      {
        path: "./pages/_error.js",
        contents: untag`
          import styles from "./styles.module.css";

          export default () =>
            <div className={styles.page}>
              <h1>Hello, World!</h1>
            </div>
        `
      },
      {
        path: "./pages/404.mdx",
        contents: untag`
          ---
          title: Not Found
          ---

          # 404 Not Found
        `
      },
    ]);

    await runMDX("./pages/_app.jsx");

    const sitemap = await fs.readFile("public/sitemap.xml", "utf8");
    expect(sitemap).to.equal(untag`
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
      </urlset>`
    );
  });

  it("should not generate a sitemap if the siteURL option is not set", async () => {
    await createFiles("./pages/index.mdx", untag`
      ---
      title: Homepage
      ---

      # Home Page
      Lorem ipsum dolor sit amet
    `);

    await runMDX("./pages/index.mdx", { siteURL: "" });

    try {
      await fs.readFile("public/sitemap.xml", "utf8");
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error.code).to.equal("ENOENT");
    }
  });

});

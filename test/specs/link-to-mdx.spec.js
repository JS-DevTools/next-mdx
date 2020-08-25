"use strict";

const runMDX = require("../utils/run-mdx");
const createFiles = require("../utils/create-files");
const { assert, expect } = require("chai");
const untag = require("untag");

describe("Linking to MDX files", () => {

  it("should rewrite links to MDX files", async () => {
    await createFiles([
      {
        path: "./pages/docs/reference/index.mdx",
        contents: untag`
          [Link to Self](index.mdx#heading)
          =====================================
          Here are links to a [sibling page](sibling.mdx) and a [child page](subdir/descendant.mdx).

          > You can also link to [files](../index.mdx) [in parent](../../root.mdx) [directories](../guides/index.mdx)

          - Links to [external sites](http://example.com/page.mdx) are ignored
          - So are [links](page) [without](another/page) [extensions](../../another/page/)
          - [Relative links](../../index.mdx#hash) with [query params](../guides/index.mdx?foo=bar) are checked
        `
      },
      { path: "./pages/docs/reference/sibling.mdx" },
      { path: "./pages/docs/reference/subdir/descendant.mdx" },
      { path: "./pages/docs/index.mdx" },
      { path: "./pages/index.mdx" },
      { path: "./pages/root.mdx" },
      { path: "./pages/docs/guides/index.mdx" },
    ]);

    const results = await runMDX("./pages/docs/reference/index.mdx", { fileCacheTimeout: 200 });

    // Wait for the cache to expire, so other tests aren't affeccted
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(results).to.equal(untag`
      /* @jsx mdx */
      import Layout from "../../../layouts/docs";

      export const createdAt = new Date(946684800000);
      export const modifiedAt = new Date(949449600000);
      const makeShortcode = name => function MDXDefaultShortcode(props) {
        console.warn("Component " + name + " was not imported, exported, or provided by MDXProvider as global scope")
        return <div {...props}/>
      };

      const layoutProps = {
        createdAt,
        modifiedAt
      };
      const MDXLayout = (props) => <Layout {...props}/>

      export default function MDXContent({
        components,
        ...props
      }) {
        return <MDXLayout {...layoutProps} {...props} components={components} mdxType="MDXLayout">
          <h1 {...{
            "markdown": true
          }}><a {...{
              "href": "/docs/reference#heading",
              "markdown": true,
              "parentName": "h1"
            }}>{\`Link to Self\`}</a></h1>
          <p {...{
            "markdown": true
          }}>{\`Here are links to a \`}
            <a {...{
              "href": "/docs/reference/sibling",
              "markdown": true,
              "parentName": "p"
            }}>{\`sibling page\`}</a>
            {\` and a \`}
            <a {...{
              "href": "/docs/reference/subdir/descendant",
              "markdown": true,
              "parentName": "p"
            }}>{\`child page\`}</a>
            {\`.\`}</p>
          <blockquote {...{
            "markdown": true
          }}>

            <p {...{
              "markdown": true,
              "parentName": "blockquote"
            }}>{\`You can also link to \`}
              <a {...{
                "href": "/docs",
                "markdown": true,
                "parentName": "p"
              }}>{\`files\`}</a>
              {\` \`}
              <a {...{
                "href": "/root",
                "markdown": true,
                "parentName": "p"
              }}>{\`in parent\`}</a>
              {\` \`}
              <a {...{
                "href": "/docs/guides",
                "markdown": true,
                "parentName": "p"
              }}>{\`directories\`}</a></p>

          </blockquote>
          <ul {...{
            "markdown": true
          }}>

            <li {...{
              "markdown": true,
              "parentName": "ul"
            }}>{\`Links to \`}
              <a {...{
                "href": "http://example.com/page.mdx",
                "markdown": true,
                "parentName": "li"
              }}>{\`external sites\`}</a>
              {\` are ignored\`}</li>


            <li {...{
              "markdown": true,
              "parentName": "ul"
            }}>{\`So are \`}
              <a {...{
                "href": "page",
                "markdown": true,
                "parentName": "li"
              }}>{\`links\`}</a>
              {\` \`}
              <a {...{
                "href": "another/page",
                "markdown": true,
                "parentName": "li"
              }}>{\`without\`}</a>
              {\` \`}
              <a {...{
                "href": "../../another/page/",
                "markdown": true,
                "parentName": "li"
              }}>{\`extensions\`}</a></li>


            <li {...{
              "markdown": true,
              "parentName": "ul"
            }}><a {...{
                "href": "/#hash",
                "markdown": true,
                "parentName": "li"
              }}>{\`Relative links\`}</a>
              {\` with \`}
              <a {...{
                "href": "/docs/guides?foo=bar",
                "markdown": true,
                "parentName": "li"
              }}>{\`query params\`}</a>
              {\` are checked\`}</li>

          </ul>
        </MDXLayout>;
      }

      ;
      MDXContent.isMDXComponent = true;`
    );
  });

  it("should rewrite links to MDX files in JSX tags", async () => {
    await createFiles([
      {
        path: "./pages/docs/reference/index.mdx",
        contents: untag`
          # <Link page="index.mdx#heading" target="_blank">Link to Self</Link>

          <CustomElement foo={"invalid.mdx"} bar={123} baz={new Date()} biz="../../index.mdx">
            Here are links to a <a href="sibling.mdx">sibling page</a> and a <a href="subdir/descendant.mdx">child page</a>.
          </CustomElement>

          > You can also link to <a href="../index.mdx">files</a> <a href="../../root.mdx">in parent</a>
          > <a href="../guides/index.mdx">directories</a>

          - Links to <a href="http://example.com/page.mdx">external sites</a> are ignored
          - So are <a href="page">links</a> <a href="another/page">without</a> <a href="../../another/page/">extensions</a>
          - <a href="../../index.mdx#hash">Relative links</a> with <a href="../guides/index.mdx?foo=bar">query params</a> are checked
        `
      },
      { path: "./pages/docs/reference/sibling.mdx" },
      { path: "./pages/docs/reference/subdir/descendant.mdx" },
      { path: "./pages/docs/index.mdx" },
      { path: "./pages/index.mdx" },
      { path: "./pages/root.mdx" },
      { path: "./pages/docs/guides/index.mdx" },
    ]);

    const results = await runMDX("./pages/docs/reference/index.mdx", { fileCacheTimeout: 200 });

    // Wait for the cache to expire, so other tests aren't affeccted
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(results).to.equal(untag`
      /* @jsx mdx */
      import Layout from "../../../layouts/docs";

      export const createdAt = new Date(946684800000);
      export const modifiedAt = new Date(949449600000);
      const makeShortcode = name => function MDXDefaultShortcode(props) {
        console.warn("Component " + name + " was not imported, exported, or provided by MDXProvider as global scope")
        return <div {...props}/>
      };
      const Link = makeShortcode("Link");
      const CustomElement = makeShortcode("CustomElement");
      const layoutProps = {
        createdAt,
        modifiedAt
      };
      const MDXLayout = (props) => <Layout {...props}/>

      export default function MDXContent({
        components,
        ...props
      }) {
        return <MDXLayout {...layoutProps} {...props} components={components} mdxType="MDXLayout">
          <h1 {...{
            "markdown": true
          }}><Link page="/docs/reference#heading" target="_blank" mdxType="Link">{\`Link to Self\`}</Link></h1>
          <CustomElement foo={"invalid.mdx"} bar={123} baz={new Date()} biz="/" mdxType="CustomElement">
            <p {...{
              "markdown": true
            }}>{\`Here are links to a \`}
              <a href="/docs/reference/sibling">{\`sibling page\`}</a>
              {\` and a \`}
              <a href="/docs/reference/subdir/descendant">{\`child page\`}</a>
              {\`.\`}</p>
          </CustomElement>
          <blockquote {...{
            "markdown": true
          }}>

            <p {...{
              "markdown": true,
              "parentName": "blockquote"
            }}>{\`You can also link to \`}
              <a href="/docs">{\`files\`}</a>
              {\` \`}
              <a href="/root">{\`in parent\`}</a>
              {\`
      \`}
              <a href="/docs/guides">{\`directories\`}</a></p>

          </blockquote>
          <ul {...{
            "markdown": true
          }}>

            <li {...{
              "markdown": true,
              "parentName": "ul"
            }}>{\`Links to \`}
              <a href="http://example.com/page.mdx">{\`external sites\`}</a>
              {\` are ignored\`}</li>


            <li {...{
              "markdown": true,
              "parentName": "ul"
            }}>{\`So are \`}
              <a href="page">{\`links\`}</a>
              {\` \`}
              <a href="another/page">{\`without\`}</a>
              {\` \`}
              <a href="../../another/page/">{\`extensions\`}</a></li>


            <li {...{
              "markdown": true,
              "parentName": "ul"
            }}><a href="/#hash">{\`Relative links\`}</a>
              {\` with \`}
              <a href="/docs/guides?foo=bar">{\`query params\`}</a>
              {\` are checked\`}</li>

          </ul>
        </MDXLayout>;
      }

      ;
      MDXContent.isMDXComponent = true;`
    );
  });

  it("should throw an error if the MDX file doesn't exist", async () => {
    await createFiles([
      {
        path: "./pages/docs/reference/index.mdx",
        contents: untag`
          [Link to Self](index.mdx#heading)
          =====================================
          Here are links to a [sibling page](file2.mdx) and a [child page](subdir/file3.mdx).

          > You can also link to [files](../index.mdx) [in parent](../../file5.mdx) [directories](../guides/index.mdx)

          - Links to [external sites](http://example.com/page.mdx) are ignored
          - So are [links](page) [without](another/page) [extensions](../../another/page/)
          - [Relative links](./file2.mdx#hash) with [query params](../guides/index.mdx?foo=bar) are checked
        `
      },
      { path: "./pages/docs/reference/file2.mdx" },
      { path: "./pages/docs/reference/subdir/file3.mdx" },
      { path: "./pages/docs/index.mdx" },
      { path: "./pages/docs/guides/index.mdx" },
    ]);

    try {
      await runMDX("./pages/docs/reference/index.mdx", { fileCacheTimeout: 0 });
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(URIError);
      expect(error.message).to.match(
        /^Broken link to "\.\.\/\.\.\/file5\.mdx" in index\.mdx\.\nENOENT: no such file or directory.*file5.mdx'$/);
    }
  });

});

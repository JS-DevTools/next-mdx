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
      { path: "./pages/file5.mdx" },
      { path: "./pages/docs/guides/index.mdx" },
    ]);

    const results = await runMDX("./pages/docs/reference/index.mdx", { fileCacheTimeout: 200 });

    // Wait for the cache to expire, so other tests aren't affeccted
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(results).to.equal(untag`
      /* @jsx mdx */
      import Layout from "../../../components/layouts/docs";


      const layoutProps = {
      ${"  "}
      };
      const MDXLayout = (props) => <Layout
        createdAt={new Date(946684800000)}
        modifiedAt={new Date(949449600000)}
        {...props}
      />

      export default function MDXContent({
        components,
        ...props
      }) {
        return <MDXLayout {...layoutProps} {...props} components={components} mdxType="MDXLayout">


          <h1 {...{
            "markdown": true
          }}><a parentName="h1" {...{
              "href": "#heading",
              "markdown": true
            }}>{\`Link to Self\`}</a></h1>
          <p {...{
            "markdown": true
          }}>{\`Here are links to a \`}<a parentName="p" {...{
              "href": "file2",
              "markdown": true
            }}>{\`sibling page\`}</a>{\` and a \`}<a parentName="p" {...{
              "href": "subdir/file3",
              "markdown": true
            }}>{\`child page\`}</a>{\`.\`}</p>
          <blockquote {...{
            "markdown": true
          }}>
            <p parentName="blockquote" {...{
              "markdown": true
            }}>{\`You can also link to \`}<a parentName="p" {...{
                "href": "../",
                "markdown": true
              }}>{\`files\`}</a>{\` \`}<a parentName="p" {...{
                "href": "../../file5",
                "markdown": true
              }}>{\`in parent\`}</a>{\` \`}<a parentName="p" {...{
                "href": "../guides/",
                "markdown": true
              }}>{\`directories\`}</a></p>
          </blockquote>
          <ul {...{
            "markdown": true
          }}>
            <li parentName="ul" {...{
              "markdown": true
            }}>{\`Links to \`}<a parentName="li" {...{
                "href": "http://example.com/page.mdx",
                "markdown": true
              }}>{\`external sites\`}</a>{\` are ignored\`}</li>
            <li parentName="ul" {...{
              "markdown": true
            }}>{\`So are \`}<a parentName="li" {...{
                "href": "page",
                "markdown": true
              }}>{\`links\`}</a>{\` \`}<a parentName="li" {...{
                "href": "another/page",
                "markdown": true
              }}>{\`without\`}</a>{\` \`}<a parentName="li" {...{
                "href": "../../another/page/",
                "markdown": true
              }}>{\`extensions\`}</a></li>
            <li parentName="ul" {...{
              "markdown": true
            }}><a parentName="li" {...{
                "href": "./file2#hash",
                "markdown": true
              }}>{\`Relative links\`}</a>{\` with \`}<a parentName="li" {...{
                "href": "../guides/?foo=bar",
                "markdown": true
              }}>{\`query params\`}</a>{\` are checked
      \`}</li>
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
          # <a href="index.mdx#heading">Link to Self</a>

          Here are links to a <a href="file2.mdx">sibling page</a> and a <a href="subdir/file3.mdx">child page</a>.

          > You can also link to <a href="../index.mdx">files</a> <a href="../../file5.mdx">in parent</a>
          > <a href="../guides/index.mdx">directories</a>

          - Links to <a href="http://example.com/page.mdx">external sites</a> are ignored
          - So are <a href="page">links</a> <a href="another/page">without</a> <a href="../../another/page/">extensions</a>
          - <a href="./file2.mdx#hash">Relative links</a> with <a href="../guides/index.mdx?foo=bar">query params</a> are checked
        `
      },
      { path: "./pages/docs/reference/file2.mdx" },
      { path: "./pages/docs/reference/subdir/file3.mdx" },
      { path: "./pages/docs/index.mdx" },
      { path: "./pages/file5.mdx" },
      { path: "./pages/docs/guides/index.mdx" },
    ]);

    const results = await runMDX("./pages/docs/reference/index.mdx", { fileCacheTimeout: 200 });

    // Wait for the cache to expire, so other tests aren't affeccted
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(results).to.equal(untag`
      /* @jsx mdx */
      import Layout from "../../../components/layouts/docs";


      const layoutProps = {
      ${"  "}
      };
      const MDXLayout = (props) => <Layout
        createdAt={new Date(946684800000)}
        modifiedAt={new Date(949449600000)}
        {...props}
      />

      export default function MDXContent({
        components,
        ...props
      }) {
        return <MDXLayout {...layoutProps} {...props} components={components} mdxType="MDXLayout">


          <h1 {...{
            "markdown": true
          }}><a href="#heading">{\`Link to Self\`}</a></h1>
          <p {...{
            "markdown": true
          }}>{\`Here are links to a \`}<a href="file2">{\`sibling page\`}</a>{\` and a \`}<a href="subdir/file3">{\`child page\`}</a>{\`.\`}</p>
          <blockquote {...{
            "markdown": true
          }}>
            <p parentName="blockquote" {...{
              "markdown": true
            }}>{\`You can also link to \`}<a href="../">{\`files\`}</a>{\` \`}<a href="../../file5">{\`in parent\`}</a></p>
            <a href="../guides/">directories</a>
          </blockquote>
          <ul {...{
            "markdown": true
          }}>
            <li parentName="ul" {...{
              "markdown": true
            }}>{\`Links to \`}<a href="http://example.com/page.mdx">{\`external sites\`}</a>{\` are ignored\`}</li>
            <li parentName="ul" {...{
              "markdown": true
            }}>{\`So are \`}<a href="page">{\`links\`}</a>{\` \`}<a href="another/page">{\`without\`}</a>{\` \`}<a href="../../another/page/">{\`extensions\`}</a></li>
            <li parentName="ul" {...{
              "markdown": true
            }}><a href="./file2#hash">Relative links</a> with <a href="../guides/?foo=bar">query params</a> are checked
            </li>
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
        /^Broken link to file5\.mdx in reference\/index\.mdx\nENOENT: no such file or directory.*file5.mdx'$/);
    }
  });

});

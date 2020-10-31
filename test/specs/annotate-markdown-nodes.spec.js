"use strict";

const runMDX = require("../utils/run-mdx");
const createFiles = require("../utils/create-files");
const { expect } = require("chai");
const untag = require("untag");

describe("Annotating Markdown Nodes", () => {

  it("should annotate HTML elements that came from Markdown", async () => {
    await createFiles("./pages/docs/my-page.mdx", untag`
      Lorem Ipsum
      =================
      Nullam **consequat** ullamcorper [consequat](http://example.com).

      - Sed porta
      - Nulla _non_
      - Lectus alique
    `);

    const results = await runMDX("./pages/docs/my-page.mdx");

    expect(results).to.equal(untag`
      /* @jsx mdx */
      import Layout from "../../layouts/docs";

      export const createdAt = new Date(946684800000);
      export const modifiedAt = new Date(949449600000);
      const makeShortcode = name => function MDXDefaultShortcode(props) {
        console.warn("Component " + name + " was not imported, exported, or provided by MDXProvider as global scope")
        return <div {...props}/>
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
        return <MDXLayout {...props} components={components} mdxType="MDXLayout">
          <h1 {...{
            "markdown": true
          }}>{\`Lorem Ipsum\`}</h1>
          <p {...{
            "markdown": true
          }}>{\`Nullam \`}
            <strong {...{
              "markdown": true,
              "parentName": "p"
            }}>{\`consequat\`}</strong>
            {\` ullamcorper \`}
            <a {...{
              "href": "http://example.com",
              "markdown": true,
              "parentName": "p"
            }}>{\`consequat\`}</a>
            {\`.\`}</p>
          <ul {...{
            "markdown": true
          }}>

            <li {...{
              "markdown": true,
              "parentName": "ul"
            }}>{\`Sed porta\`}</li>


            <li {...{
              "markdown": true,
              "parentName": "ul"
            }}>{\`Nulla \`}
              <em {...{
                "markdown": true,
                "parentName": "li"
              }}>{\`non\`}</em></li>


            <li {...{
              "markdown": true,
              "parentName": "ul"
            }}>{\`Lectus alique\`}</li>

          </ul>
        </MDXLayout>;
      }

      ;
      MDXContent.isMDXComponent = true;`
    );
  });

  it("should not annotate inline HTML or JSX elements in Markdown", async () => {
    await createFiles("./pages/docs/my-page.mdx", untag`
      import Link from "next/link";

      Lorem Ipsum
      =================
      Nullam <b>consequat</b> ullamcorper <Link href="../index.md"><a>consequat</a></Link>.

      - Sed porta
      - Nulla <i>non</i>
      - Lectus alique
    `);

    const results = await runMDX("./pages/docs/my-page.mdx");

    expect(results).to.equal(untag`
      /* @jsx mdx */
      import Link from "next/link";
      import Layout from "../../layouts/docs";

      export const createdAt = new Date(946684800000);
      export const modifiedAt = new Date(949449600000);
      const makeShortcode = name => function MDXDefaultShortcode(props) {
        console.warn("Component " + name + " was not imported, exported, or provided by MDXProvider as global scope")
        return <div {...props}/>
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
        return <MDXLayout {...props} components={components} mdxType="MDXLayout">
          <h1 {...{
            "markdown": true
          }}>{\`Lorem Ipsum\`}</h1>
          <p {...{
            "markdown": true
          }}>{\`Nullam \`}
            <b>{\`consequat\`}</b>
            {\` ullamcorper \`}
            <Link href="../index.md" mdxType="Link"><a>{\`consequat\`}</a></Link>
            {\`.\`}</p>
          <ul {...{
            "markdown": true
          }}>

            <li {...{
              "markdown": true,
              "parentName": "ul"
            }}>{\`Sed porta\`}</li>


            <li {...{
              "markdown": true,
              "parentName": "ul"
            }}>{\`Nulla \`}
              <i>{\`non\`}</i></li>


            <li {...{
              "markdown": true,
              "parentName": "ul"
            }}>{\`Lectus alique\`}</li>

          </ul>
        </MDXLayout>;
      }

      ;
      MDXContent.isMDXComponent = true;`
    );
  });

});

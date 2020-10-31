"use strict";

const runMDX = require("../utils/run-mdx");
const createFiles = require("../utils/create-files");
const { expect } = require("chai");
const untag = require("untag");

describe("Layout", () => {

  it("should default to the \"docs\" layout", async () => {
    await createFiles("./pages/docs/index.mdx", untag`
      ---
      title: The Page Title
      ---
    `);

    const results = await runMDX("./pages/docs/index.mdx");

    expect(results).to.equal(untag`
      /* @jsx mdx */
      import Layout from "../../layouts/docs";

      export const title = "The Page Title";
      export const createdAt = new Date(946684800000);
      export const modifiedAt = new Date(949449600000);
      const makeShortcode = name => function MDXDefaultShortcode(props) {
        console.warn("Component " + name + " was not imported, exported, or provided by MDXProvider as global scope")
        return <div {...props}/>
      };

      const MDXLayout = (props) => <Layout
        title="The Page Title"
        createdAt={new Date(946684800000)}
        modifiedAt={new Date(949449600000)}
        {...props}
      />

      export default function MDXContent({
        components,
        ...props
      }) {
        return <MDXLayout {...props} components={components} mdxType="MDXLayout">

        </MDXLayout>;
      }

      ;
      MDXContent.isMDXComponent = true;`
    );
  });

  it("should use the layout specified in the frontmatter", async () => {
    await createFiles("./pages/docs/index.mdx", untag`
      ---
      layout: something-else
      title: The Page Title
      ---
    `);

    const results = await runMDX("./pages/docs/index.mdx");

    expect(results).to.equal(untag`
      /* @jsx mdx */
      import Layout from "../../layouts/something-else";

      export const title = "The Page Title";
      export const createdAt = new Date(946684800000);
      export const modifiedAt = new Date(949449600000);
      const makeShortcode = name => function MDXDefaultShortcode(props) {
        console.warn("Component " + name + " was not imported, exported, or provided by MDXProvider as global scope")
        return <div {...props}/>
      };

      const MDXLayout = (props) => <Layout
        title="The Page Title"
        createdAt={new Date(946684800000)}
        modifiedAt={new Date(949449600000)}
        {...props}
      />

      export default function MDXContent({
        components,
        ...props
      }) {
        return <MDXLayout {...props} components={components} mdxType="MDXLayout">

        </MDXLayout>;
      }

      ;
      MDXContent.isMDXComponent = true;`
    );
  });

  it("should use the layout options", async () => {
    await createFiles("./pages/docs/index.mdx", untag`
      ---
      title: The Page Title
      ---
    `);

    const results = await runMDX("./pages/docs/index.mdx", {
      defaultLayout: "FancyPage",
      layoutsDir: "layouts",
    });

    expect(results).to.equal(untag`
      /* @jsx mdx */
      import Layout from "../../layouts/FancyPage";

      export const title = "The Page Title";
      export const createdAt = new Date(946684800000);
      export const modifiedAt = new Date(949449600000);
      const makeShortcode = name => function MDXDefaultShortcode(props) {
        console.warn("Component " + name + " was not imported, exported, or provided by MDXProvider as global scope")
        return <div {...props}/>
      };

      const MDXLayout = (props) => <Layout
        title="The Page Title"
        createdAt={new Date(946684800000)}
        modifiedAt={new Date(949449600000)}
        {...props}
      />

      export default function MDXContent({
        components,
        ...props
      }) {
        return <MDXLayout {...props} components={components} mdxType="MDXLayout">

        </MDXLayout>;
      }

      ;
      MDXContent.isMDXComponent = true;`
    );
  });

});

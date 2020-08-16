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
      import Layout from "../../components/layouts/docs";


      const layoutProps = {
      ${"  "}
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
        return <MDXLayout {...layoutProps} {...props} components={components} mdxType="MDXLayout">


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
      import Layout from "../../components/layouts/something-else";


      const layoutProps = {
      ${"  "}
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
        return <MDXLayout {...layoutProps} {...props} components={components} mdxType="MDXLayout">


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


      const layoutProps = {
      ${"  "}
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
        return <MDXLayout {...layoutProps} {...props} components={components} mdxType="MDXLayout">


          </MDXLayout>;
      }

      ;
      MDXContent.isMDXComponent = true;`
    );
  });

});

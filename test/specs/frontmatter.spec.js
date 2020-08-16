"use strict";

const runMDX = require("../utils/run-mdx");
const createFiles = require("../utils/create-files");
const { expect } = require("chai");
const untag = require("untag");

describe("Frontmatter", () => {

  it("should convert frontmatter to the default MDX export", async () => {
    await createFiles("./pages/index.mdx", untag`
      ---
      title: The Page Title
      description: This is the description of my page
      tags:
        - a search term
        - another search term
      foo: bar
      random: true
      ---
    `);

    const results = await runMDX("./pages/index.mdx");

    expect(results).to.equal(untag`
      /* @jsx mdx */
      import Layout from "../components/layouts/docs";


      const layoutProps = {
      ${"  "}
      };
      const MDXLayout = (props) => <Layout
        title="The Page Title"
        description="This is the description of my page"
        tags={[
          "a search term",
          "another search term"
        ]}
        foo="bar"
        random={true}
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

  it("should support empty frontmatter", async () => {
    await createFiles("./pages/index.mdx", untag`
      ---
      ---
    `);

    const results = await runMDX("./pages/index.mdx");

    expect(results).to.equal(untag`
      /* @jsx mdx */
      import Layout from "../components/layouts/docs";


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


          </MDXLayout>;
      }

      ;
      MDXContent.isMDXComponent = true;`
    );
  });

  it("should support an empty file", async () => {
    await createFiles("./pages/index.mdx", "");
    const results = await runMDX("./pages/index.mdx");

    expect(results).to.equal(untag`
      /* @jsx mdx */
      import Layout from "../components/layouts/docs";


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


          </MDXLayout>;
      }

      ;
      MDXContent.isMDXComponent = true;`
    );
  });

});

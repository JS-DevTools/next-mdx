declare module "@next/mdx" {
  interface MDXOptions {
    /**
     * A regular expression for matching MDX files.
     *
     * Default: `\.mdx$`
     */
    extension?: RegExp;

    options?: {
      /**
       * A string that is prepended to the generated source of every MDX page.
       * This allows you to customize the imports and define any globals.
       *
       * @see https://github.com/mdx-js/mdx/tree/master/packages/loader
       */
      renderer?: string;

      /**
       * An array of remark plugins to manipulate the MDXAST
       *
       * @see https://mdxjs.com/advanced/plugins
       */
      remarkPlugins?: object[];

      /**
       * An array of remark plugins to manipulate the MDXHAST
       *
       * @see https://mdxjs.com/advanced/plugins
       */
      rehypePlugins?: object[];
    };
  }

  /**
   * Creates a function that adds MDX support to your Next.js config
   */
  type NextMDX = (options?: MDXOptions) => WithMDX;

  /**
   * A function that adds MDX support to your Next.js config
   */
  type WithMDX = (config?: object) => object;

  const nextMDX: NextMDX;
  export = nextMDX;
}

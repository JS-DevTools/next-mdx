import { nextMDX } from "./next-mdx";

export * from "./types";
export { nextMDX };

// Export `nextMDX` as the default export
export default nextMDX;

// CommonJS default export hack
if (typeof module === "object" && typeof module.exports === "object") {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  module.exports = Object.assign(module.exports.default, module.exports);
}

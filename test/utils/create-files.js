"use strict";

const { promises: fs } = require("fs");
const path = require("path");
const utimes = require("utimes");

// The created/modified timestamps assigned to each file
const btime = new Date("2000-01-01T00:00:00.000Z").getTime();
const mtime = new Date("2000-02-02T00:00:00.000Z").getTime();

module.exports = createFiles;

/**
 * Deletes all files and directories that are created by tests
 */
beforeEach("clean-up test files", async () => {
  await fs.rmdir("./pages", { recursive: true });
  await fs.rmdir("./public", { recursive: true });
});

/**
 * Creates one or many files.  Also creates any necessary parent directories.
 */
async function createFiles (files) {
  // Allow a single file to be specifeid as separate path and contents properties
  if (typeof files === "string") {
    files = [{ path: files, contents: arguments[1] }];
  }

  for (let file of files) {
    await fs.mkdir(path.dirname(file.path), { recursive: true });
    await fs.writeFile(file.path, file.contents || "");

    // Set the created/modified timestamps of the file, so tests can hard-code these values
    await utimes(file.path, { btime, mtime });
  }
}

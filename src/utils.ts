const isWindows = process.platform === "win32";
const windowsPathSepartorPattern = /\\/g;
const posixPathSeparator = "/";

/**
 * Replaces Windows path separators with POSIX separators.
 */
export function toPosixPath(p: string): string {
  if (isWindows) {
    return p.replace(windowsPathSepartorPattern, posixPathSeparator);
  }
  else {
    return p;
  }
}

/**
 * Information to cache about a file
 */
export interface FileInfo {
  absolutePath: string;
  exists: boolean;
}


/**
 * Cached information about a file
 */
export interface CachedFileInfo extends FileInfo {
  expires: number;
}


/**
 * A cache of whether file information, to save redundant disk I/O.
 */
export class FileCache {
  #cache = new Map<string, Promise<CachedFileInfo>>();
  #timeout: number;


  public constructor(timeout: number) {
    this.#timeout = timeout;
  }


  /**
   * Adds a file to the cache
   */
  public add(file: FileInfo): void {
    this.addPending(file.absolutePath, Promise.resolve(file));
  }


  /**
   * Adds a file to the cache while its info is being read from disk
   */
  public addPending(absolutePath: string, promise: Promise<FileInfo>): void {
    const cached: Promise<CachedFileInfo> = promise.then(file => ({
      ...file,
      expires: Date.now() + this.#timeout,
    }));

    this.#cache.set(absolutePath, cached);
  }


  /**
   * Removes a file from the cache
   */
  public remove(absolutePath: string): void {
    this.#cache.delete(absolutePath);
  }


  /**
   * Removes a file from the cache
   */
  public async get(absolutePath: string): Promise<CachedFileInfo> {
    const cached = this.#cache.get(absolutePath);

    if (cached) {
      return cached;
    }
    else {
      return {
        absolutePath,
        exists: false,
        expires: 0,
      };
    }
  }
}

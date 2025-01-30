import fs from "fs/promises";
import path from "path";

import { cacheFolder } from "#src/cache/config.js";

export class CacheManager {
  constructor() {
    this.cacheFile = path.resolve(cacheFolder, "cache.json");
    this.cache = {};
  }

  async initialize() {
    try {
      const data = await fs.readFile(this.cacheFile, "utf-8");
      this.cache = JSON.parse(data);
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.writeFile(this.cacheFile, JSON.stringify({}), "utf-8");
      } else {
        console.error("Error initializing cache:", err);
      }
    }
  }

  async set(key, value) {
    this.cache[key] = value;
    await this.save();
  }

  get(key) {
    return this.cache[key] || null;
  }

  async save() {
    try {
      await fs.writeFile(this.cacheFile, JSON.stringify(this.cache, null, 2), "utf-8");
    } catch (err) {
      console.error("Error saving cache:", err);
    }
  }
}

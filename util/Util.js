"use strict";
/**
 * @file
 * Util.js
 */
const fs = require("fs");
const path = require("path");

module.exports = class Util {

  /**
   * Get a recursive list of filenames from the given start folder.
   *
   * @see https://gist.github.com/kethinov/6658166
   */
  static getFiles(dir, filelist = []) {
    if (!dir || dir === null) return false;

    fs.readdirSync(dir).forEach(file => {
      filelist = fs.statSync(path.join(dir, file)).isDirectory()
        ? Util.getFiles(path.join(dir, file), filelist)
        : filelist.concat(path.join(dir, file));
    });
    return filelist;
  }

  /**
   * Given a folder, ensure the folder exists. If it doesn't already exist,
   * create it. Account for multiple levels of depth.
   *
   * @param string folder name to create or verify that it exists
   * @return boolean true if the folder exists, or was created
   * @return boolean false if an invalid option was provided
   */
  static ensureFolder(folder = null) {
    if (typeof folder !== "string") return false;
    if (folder.trim() === "") return false;
    if (!path.isAbsolute(folder)) return false;

    if (fs.existsSync(folder)) return true;

    fs.mkdirSync(folder, { recursive: true });
    return true;
  }
};


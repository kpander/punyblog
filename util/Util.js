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

};

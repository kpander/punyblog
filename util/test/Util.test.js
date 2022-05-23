"use strict";
/*global test, expect*/
/**
 * @file
 * Util.test.js
 */

const fs = require("fs");
const path = require("path");
const tmp = require("tmp");
const Util = require("../Util");

const createTmpFile = function(filename) {
  const dirname = path.dirname(filename);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname);
  }
  fs.writeFileSync(filename, "test file", "utf8");
};

test(
  `[Util.getfiles-001]
  Given
    - no directory
  When
    - we run getFiles()
  Then
    - we get an error
`.trim(), async() => {
  // Given...
  // When...
  const files = Util.getFiles();

  // Then...
  expect(files).toEqual(false);
});

test(
  `[Util.getfiles-002]
  Given
    - the current folder
  When
    - we run getFiles()
  Then
    - we should get an array of filenames
    - each item in the array should exist in the filesystem
`.trim(), async() => {
  // Given...
  const folder = __dirname;

  // When...
  const files = Util.getFiles(folder);

  // Then...
  expect(Array.isArray(files)).toEqual(true);
  expect(files.length).toBeGreaterThan(0);
  files.forEach(file => {
    expect(fs.existsSync(file)).toEqual(true);
  });
});

test(
  `[Util.getfiles-003]
  Given
    - a folder with multiple files
    - a folder with a subfolder, with files
  When
    - we run getFiles()
  Then
    - we should get an array of filenames
    - each item in the array should exist in the filesystem
`.trim(), async() => {
  // Given...
  const tmpobj = tmp.dirSync();
  const folder = tmpobj.name;
  createTmpFile(path.join(folder, "a-file1.txt"));
  createTmpFile(path.join(folder, "a-file2.txt"));
  createTmpFile(path.join(folder, "folderb", "b-file1.txt"));
  createTmpFile(path.join(folder, "folderb", "b-file2.txt"));

  // When...
  const files = Util.getFiles(folder);

  // Then...
  expect(Array.isArray(files)).toEqual(true);
  expect(files.length).toEqual(4);
  files.forEach(file => {
    expect(fs.existsSync(file)).toEqual(true);
  });
  expect(files[0].indexOf("a-file1.txt")).toBeGreaterThan(0);
  expect(files[1].indexOf("a-file2.txt")).toBeGreaterThan(0);
  expect(files[2].indexOf("b-file1.txt")).toBeGreaterThan(0);
  expect(files[3].indexOf("b-file2.txt")).toBeGreaterThan(0);
  expect(files[2].indexOf("folder")).toBeGreaterThan(0);
  expect(files[3].indexOf("folder")).toBeGreaterThan(0);
});


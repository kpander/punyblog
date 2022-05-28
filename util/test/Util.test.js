"use strict";
/*global describe, test, expect*/
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

describe("Util.getFiles:", () => {
  test(
    `[Util.getFiles-001]
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
    `[Util.getFiles-002]
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
    `[Util.getFiles-003]
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
});

describe("Util.ensureFolder:", () => {
  test(
    `[Util.ensureFolder-001]
  Given
    - no argument
  When
    - we run ensureFolder()
  Then
    - we get an error (we require a string)
`.trim(), async() => {
  // Given...
  // When...
  const result = Util.ensureFolder();

  // Then...
  expect(result).toEqual(false);
});

  test(
    `[Util.ensureFolder-002]
  Given
    - a non-string argument
  When
    - we run ensureFolder()
  Then
    - we get an error (we require a string)
`.trim(), async() => {
  // Given...
  // When...
  const result1 = Util.ensureFolder(123);
  const result2 = Util.ensureFolder({ abc: "123" });

  // Then...
  expect(result1).toEqual(false);
  expect(result2).toEqual(false);
});

  test(
    `[Util.ensureFolder-003]
  Given
    - an empty string argument
  When
    - we run ensureFolder()
  Then
    - we get an error (we require a non-empty string)
`.trim(), async() => {
  // Given...
  // When...
  const result = Util.ensureFolder("");

  // Then...
  expect(result).toEqual(false);
});

  test(
    `[Util.ensureFolder-004]
  Given
    - a relative path argument
  When
    - we run ensureFolder()
  Then
    - we get an error (we require an absolute path)
`.trim(), async() => {
  // Given...
  // When...
  const result = Util.ensureFolder("test-path");

  // Then...
  expect(result).toEqual(false);
});

  test(
    `[Util.ensureFolder-005]
  Given
    - an absolute folder that already exists
  When
    - we run ensureFolder()
  Then
    - we receive true (because the folder already exists)
`.trim(), async() => {
  // Given...
  const tmpobj = tmp.dirSync();
  const folder = tmpobj.name;

  // When...
  const result = Util.ensureFolder(folder);

  // Then...
  expect(result).toEqual(true);
});

  test(
    `[Util.ensureFolder-006]
  Given
    - an absolute path argument that doesn't exist yet
  When
    - we run ensureFolder()
  Then
    - we receive true (because the folder was created)
`.trim(), async() => {
  // Given...
  const tmpobj = tmp.dirSync();
  const folder = tmpobj.name;

  // When...
  const path_new = path.join(folder, "test-path");
  expect(fs.existsSync(path_new)).toEqual(false);
  const result = Util.ensureFolder(path_new);

  // Then...
  expect(result).toEqual(true);
  expect(fs.existsSync(path_new)).toEqual(true);
});

  test(
    `[Util.ensureFolder-007]
  Given
    - an absolute path argument with multiple levels that don't exist yet
  When
    - we run ensureFolder()
  Then
    - we receive true (because the folders were created)
`.trim(), async() => {
  // Given...
  const tmpobj = tmp.dirSync();
  const folder = tmpobj.name;

  // When...
  const path_new = path.join(folder, "test-path1", "test-path2", "test-path3");
  expect(fs.existsSync(path_new)).toEqual(false);
  const result = Util.ensureFolder(path_new);

  // Then...
  expect(result).toEqual(true);
  expect(fs.existsSync(path_new)).toEqual(true);
});

});

describe("Util.replaceAll:", () => {
  test(
    `[Util.replaceAll-001]
  Given
    - a string, a search term, a replace term
  When
    - we run replaceAll()
  Then
    - we get the string with [search] replaced by [replace]
`.trim(), async() => {
  // Given...
  const str = "this is my search string";
  const search = "search";
  const replace = "replace";
  const expected = "this is my replace string";

  // When...
  const result = Util.replaceAll(str, search, replace);

  // Then...
  expect(result).toEqual(expected);
});

  test(
    `[Util.replaceAll-001]
  Given
    - a string with multiple instances of a search term, a search term, a replace term
  When
    - we run replaceAll()
  Then
    - we get the string with all [search] replaced by [replace]
`.trim(), async() => {
  // Given...
  const str = "this is my search string with search and search";
  const search = "search";
  const replace = "replace";
  const expected = "this is my replace string with replace and replace";

  // When...
  const result = Util.replaceAll(str, search, replace);

  // Then...
  expect(result).toEqual(expected);
});

});


describe("Util.hasProp:", () => {
  test(
    `[Util.hasProp-001]
  Given
    - no object or key
  When
    - we run hasProp()
  Then
    - we return false
`.trim(), async() => {
  // Given...
  // When...
  const result = Util.hasProp();

  // Then...
  expect(result).toEqual(false);
});

  test(
    `[Util.hasProp-002]
  Given
    - an object and some valid and invalid keys
  When
    - we run hasProp()
  Then
    - we return true if the object has the key
`.trim(), async() => {
  // Given...
  const obj = {
    key1: "abc",
    "key2": "def",
  };

  // When...
  const result1 = Util.hasProp(obj, "key1");
  const result2 = Util.hasProp(obj, "key2");
  const result3 = Util.hasProp(obj, "key3");

  // Then...
  expect(result1).toEqual(true);
  expect(result2).toEqual(true);
  expect(result3).toEqual(false);
});

});

describe("Util.touch:", () => {
  test(
    `[Util.touch-001]
  Given
    - no filename
  When
    - we run touch()
  Then
    - we return false
`.trim(), async() => {
  // Given...
  // When...
  const result = Util.touch();

  // Then...
  expect(result).toEqual(false);
});

  test(
    `[Util.touch-002]
  Given
    - a filename and no content
  When
    - we run touch()
  Then
    - we return true
    - an empty file is created
`.trim(), async() => {
  // Given...
  const tmpobj = tmp.dirSync();
  const folder = tmpobj.name;
  const filename = path.join(folder, "myfile.txt");

  // When...
  const result = Util.touch(filename);
  const content = fs.readFileSync(filename, "utf8").trim();

  // Then...
  expect(result).toEqual(true);
  expect(fs.existsSync(filename)).toEqual(true);
  expect(content).toEqual("");
});

});


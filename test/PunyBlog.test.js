"use strict";
/*global describe, test, expect*/
/**
 * @file
 * PunyBlog.test.js
 */

const PunyBlog = require("../lib/PunyBlog");
const Util = require("../util/Util");
const fs = require("fs");
const path = require("path");
const tmp = require("tmp");

const createMarkdownFile = function(path_for_file, basename, contents) {
  const filename = path.join(path_for_file, basename);
  if (!fs.existsSync(path_for_file)) {
    fs.mkdirSync(path_for_file);
  }
  fs.writeFileSync(filename, contents, "utf8");
  return filename;
};

describe("Basic usage:", () => {
test(
  `[PunyBlog-001]
  Given
    - no configuration options
  When
    - we build
  Then
    - we should receive an error
`.trim(), async() => {
  // Given...
  const punyBlog = new PunyBlog();

  // When...
  const result = punyBlog.build();

  // Then...
  expect(result).toEqual(false);
});

test(
  `[PunyBlog-002]
  Given
    - a configuration option where the src path doesn't exist
  When
    - we build
  Then
    - we should receive an error
`.trim(), async() => {
  // Given...
  const config = {
    path_src: "non-existing-path"
  };
  const punyBlog = new PunyBlog(config);

  // When...
  const result = punyBlog.build();

  // Then...
  expect(result).toEqual(false);
});

test(
  `[PunyBlog-003]
  Given
    - a configuration option where the src path exists (without any files)
    - a configuration option where the dist path doesn't exist
  When
    - we build
  Then
    - we should receive true
    - the dist path should have been created
`.trim(), async() => {
  // Given...
  const tmpobj1 = tmp.dirSync();
  const tmpobj2 = tmp.dirSync();
  const path_src = tmpobj1.name;
  const path_dest = tmpobj2.name;
  fs.rmdirSync(path_dest);

  const config = {
    path_src: path_src,
    path_dest: path_dest,
  };
  const punyBlog = new PunyBlog(config);

  // When...
  const result = punyBlog.build();

  // Then...
  expect(result).toEqual(true);
  expect(fs.existsSync(path_dest)).toEqual(true);
});

test(
  `[PunyBlog-004]
  Given
    - a configuration option where the src path exists
    - a configuration option where the dist path exists
    - a src path with a single markdown file
  When
    - we build
  Then
    - we should receive true
    - the dist path should contain a single html file
`.trim(), async() => {
  // Given...
  const tmpobj1 = tmp.dirSync();
  const tmpobj2 = tmp.dirSync();
  const path_src = tmpobj1.name;
  const path_dest = tmpobj2.name;
  const expected_filename = createMarkdownFile(path_src, "myfile.md", "# a header\n\nsome content");

  const config = {
    path_src: path_src,
    path_dest: path_dest,
  };
  const punyBlog = new PunyBlog(config);

  // When...
  const result = punyBlog.build();

  // Then...
  expect(result).toEqual(true);
  expect(fs.existsSync(expected_filename)).toEqual(true);
});

test(
  `[PunyBlog-005]
  Given
    - a configuration option where the src path exists
    - a configuration option where the dist path exists
    - a src path with multiple markdown files, with some in subfolders
  When
    - we build
  Then
    - we should receive true
    - the dist path should contain html files for each markdown file, including subfolders
`.trim(), async() => {
  // Given...
  const tmpobj1 = tmp.dirSync();
  const tmpobj2 = tmp.dirSync();
  const path_src = tmpobj1.name;
  const path_dest = tmpobj2.name;

  createMarkdownFile(path_src, "a-myfile1.md", "# a-myfile1 header");
  createMarkdownFile(path_src, "a-myfile2.md", "# a-myfile2 header");
  createMarkdownFile(path.join(path_src, "sub-b"), "b-myfile1.md", "# b-myfile1 header");
  createMarkdownFile(path.join(path_src, "sub-b"), "b-myfile2.md", "# b-myfile2 header");

  const expected_files = [
    path.join(path_dest, "a-myfile1.html"),
    path.join(path_dest, "a-myfile2.html"),
    path.join(path_dest, "sub-b", "b-myfile1.html"),
    path.join(path_dest, "sub-b", "b-myfile2.html"),
  ];

  const config = {
    path_src: path_src,
    path_dest: path_dest,
  };
  const punyBlog = new PunyBlog(config);

  // When...
  const result = punyBlog.build();

  // Then...
  expect(result).toEqual(true);
  expected_files.forEach(filename => {
    expect(fs.existsSync(filename)).toEqual(true);
  });
});
});

describe("Static files:", () => {
test(
  `[Static-001]
  Given
    - a src folder that has non-markdown files, also in subfolders
  When
    - we build
  Then
    - the non-markdown files should be copied to the dest folder
`.trim(), async() => {
  // Given...
  const tmpobj1 = tmp.dirSync();
  const tmpobj2 = tmp.dirSync();
  const path_src = tmpobj1.name;
  const path_dest = tmpobj2.name;

  const config = {
    path_src: path_src,
    path_dest: path_dest,
  };

  Util.touch(path.join(path_src, "file1.css"));
  Util.touch(path.join(path_src, "css/file2.css"));

  const punyBlog = new PunyBlog(config);

  // When...
  const result = punyBlog.build();

  // Then...
  expect(result).toEqual(true);
  expect(fs.existsSync(path.join(path_dest, "file1.css"))).toEqual(true);
  expect(fs.existsSync(path.join(path_dest, "css/file2.css"))).toEqual(true);
});

});


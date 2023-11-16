"use strict";
/*global describe, test, expect*/
/**
 * @file
 * PunyBlog.test.js
 */

const PunyBlog = require("../lib/PunyBlog");
const Util = require("@kpander/nodejs-util");
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

test(
  `[PunyBlog-006]
  Given
    - a configuration option where the src path exists
    - a configuration option where the dist path exists
    - a src path with a markdown file
    - a partial, referenced in a markdown file, that exists only in the same folder as a markdown file
  When
    - we build
  Then
    - we should receive true
    - the rendered html should include the contents of the partial from the markdown file path
`.trim(), async() => {
  // Given...
  const tmpobj1 = tmp.dirSync();
  const tmpobj2 = tmp.dirSync();
  const tmpobj3 = tmp.dirSync();
  const path_src = tmpobj1.name;
  const path_dest = tmpobj2.name;

  createMarkdownFile(path_src, "index.md", `# my header {% include "my-partial.html" %}`);
  createMarkdownFile(path_src, "my-partial.html", "THIS IS MY PARTIAL");

  const expected_file = path.join(path_dest, "index.html");

  const config = {
    path_src: path_src,
    path_dest: path_dest,
  };
  const punyBlog = new PunyBlog(config);

  // When...
  const result = punyBlog.build();

  // Then...
  expect(result).toEqual(true);
  expect(fs.existsSync(expected_file)).toEqual(true);
  const contents = fs.readFileSync(expected_file, "utf8");
  expect(contents.indexOf("THIS IS MY PARTIAL")).not.toEqual(-1);
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

test(
  `[Static-002]
  Given
    - a src folder that has non-markdown files, also in subfolders
  When
    - we build but provide a relative src or dest path
  Then
    - build should fail
`.trim(), async() => {
  // Given...
  const tmpobj = tmp.dirSync();
  const path_tmp = tmpobj.name;

  const config1 = {
    path_src: path_tmp,
    path_dest: "some-relative-path",
  };
  const config2 = {
    path_src: "some-relative-path",
    path_dest: path_tmp,
  };

  const punyBlog1 = new PunyBlog(config1);
  const punyBlog2 = new PunyBlog(config2);

  // When...
  const result1 = punyBlog1.build();
  const result2 = punyBlog2.build();

  // Then...
  expect(result1).toEqual(false);
  expect(result2).toEqual(false);
});

test(
  `[Static-003]
  Given
    - a src folder that has non-markdown/non-css files, also in subfolders
  When
    - we build
  Then
    - the non-markdown/non-css files should be copied to the dest folder
    - the timestamps of the copied files should match the src files
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

  Util.touch(path.join(path_src, "file1.jpg"));
  const newTimestamp = new Date("2023-01-01T00:00:00Z");
  fs.utimesSync(path.join(path_src, "file1.jpg"), newTimestamp, newTimestamp);

  const punyBlog = new PunyBlog(config);

  // When...
  const result = punyBlog.build();

  // Then...
  expect(result).toEqual(true);
  expect(fs.existsSync(path.join(path_dest, "file1.jpg"))).toEqual(true);

  const stats = fs.statSync(path.join(path_dest, "file1.jpg"));
  expect(stats.mtime).toEqual(newTimestamp);
});




});

describe("Cachebusting:", () => {

test(
  `[Cachebust-001]
  Given
    - a src folder with a markdown file referencing a static image file that exists
  When
    - we build
  Then
    - the HTML reference to the image has a cachebusting timestamp
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

  Util.touch(path.join(path_src, "images/image.jpg"));
  createMarkdownFile(path_src, "myfile.md", `<img src="images/image.jpg">`);

  const punyBlog = new PunyBlog(config);

  // When...
  const result = punyBlog.build();

  // Then...
  expect(result).toEqual(true);
  expect(fs.existsSync(path.join(path_dest, "myfile.html"))).toEqual(true);

  // ... confirm the html image reference has a valid timestamp parameter
  const content = fs.readFileSync(path.join(path_dest, "myfile.html"), "utf8");
  const regex = new RegExp(/src="images\/image.jpg\?ts=[0-9]+"/i);
  const matches = content.match(regex);
  expect(matches).not.toEqual(null);
});

test(
  `[Cachebust-002]
  Given
    - a src folder with a markdown file referencing a static image file that doesn't exist
  When
    - we build
  Then
    - the HTML reference to the image has a cachebusting timestamp indicating a missing file
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

  createMarkdownFile(path_src, "myfile.md", `<img src="images/image.jpg">`);

  const punyBlog = new PunyBlog(config);

  // When...
  const result = punyBlog.build();

  // Then...
  expect(result).toEqual(true);
  expect(fs.existsSync(path.join(path_dest, "myfile.html"))).toEqual(true);

  // ... confirm the html image reference has a timestamp parameter indicating
  // the file doesn't exist (i.e., the '-m' suffix).
  const content = fs.readFileSync(path.join(path_dest, "myfile.html"), "utf8");
  const regex = new RegExp(/src="images\/image.jpg\?ts=[0-9]+-m"/i);
  const matches = content.match(regex);
  expect(matches).not.toEqual(null);
});

test(
  `[Cachebust-003]
  Given
    - a src folder with a markdown file referencing a css file
    - the css file imports another css file via @import
  When
    - we build
  Then
    - the rendered first file referening the second css file should have a timestamp
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

  // Create the src style.css file with a reference to a second css file.
  const file_css = path.join(path_src, "style.css");
  fs.writeFileSync(file_css, `
// css
@import "second.css";
`, "utf8");

  createMarkdownFile(path_src, "myfile.md", `<link rel="stylesheet" type="text/css" href="style.css">`);
  Util.touch(path.join(path_src, "second.css"));

  const punyBlog = new PunyBlog(config);

  // When...
  const result = punyBlog.build();

  // Then...
  expect(result).toEqual(true);
  expect(fs.existsSync(path.join(path_dest, "style.css"))).toEqual(true);

  // ... confirm the css file referenced in the @import rule inside the css
  // file has a timestamp parameter indicating the file does exist.
  const content = fs.readFileSync(path.join(path_dest, "style.css"), "utf8");
  const regex = new RegExp(/second.css\?ts=[0-9]+"/i);
  const matches = content.match(regex);
  expect(matches).not.toEqual(null);
});

test(
  `[Cachebust-004]
  Given
    - a src folder with a markdown file referencing a css file
    - the css file @imports other css files, with subfolders
  When
    - we build
  Then
    - all @imports in the first css file have valid timestamps
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

  // Create the src style.css file with a reference to a second css file.
  Util.touch(path.join(path_src, "css/style.css"));
  const file_css = path.join(path_src, "css/style.css");
  fs.writeFileSync(file_css, `
// css
@import "./second-no-sub.css";
@import "./sub/third-with-sub.css";
@import "./sub/deep/fourth-with-deep-sub.css";
`, "utf8");
  Util.touch(path.join(path_src, "css/second-no-sub.css"));
  Util.touch(path.join(path_src, "css/sub/third-with-sub.css"));
  Util.touch(path.join(path_src, "css/sub/deep/fourth-with-deep-sub.css"));

  createMarkdownFile(path_src, "myfile.md", `<link rel="stylesheet" type="text/css" href="style.css">`);

  const punyBlog = new PunyBlog(config);

  // When...
  const result = punyBlog.build();

  // Then...
  expect(result).toEqual(true);
  expect(fs.existsSync(path.join(path_dest, "css/style.css"))).toEqual(true);
  expect(fs.existsSync(path.join(path_dest, "css/second-no-sub.css"))).toEqual(true);
  expect(fs.existsSync(path.join(path_dest, "css/sub/third-with-sub.css"))).toEqual(true);
  expect(fs.existsSync(path.join(path_dest, "css/sub/deep/fourth-with-deep-sub.css"))).toEqual(true);

  // ... confirm the css files referenced in the @import rule inside the css
  // file has a timestamp parameter indicating the file does exist.
  const content = fs.readFileSync(path.join(path_dest, "css/style.css"), "utf8");

  const regexes = [
    new RegExp(/second-no-sub.css\?ts=[0-9]+"/i),
    new RegExp(/third-with-sub.css\?ts=[0-9]+"/i),
    new RegExp(/fourth-with-deep-sub.css\?ts=[0-9]+"/i),
  ];
  regexes.forEach(regex => {
    const matches = content.match(regex);
    expect(matches).not.toEqual(null);
  });
});

test(
  `[Cachebust-005]
  Given
    - a src folder with a markdown file referencing a css file in a subfolder
    - the css file imports another css file via @import
  When
    - we build
  Then
    - the rendered first file referening the second css file should have a timestamp
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

  // Create the src style.css file with a reference to a second css file.
  Util.touch(path.join(path_src, "css/style.css"));
  const file_css = path.join(path_src, "css/style.css");
  fs.writeFileSync(file_css, `
// css
@import "second.css"; 
`, "utf8");

  createMarkdownFile(path_src, "myfile.md", `<link rel="stylesheet" href="css/style.css">`);
  Util.touch(path.join(path_src, "css/second.css"));

  const punyBlog = new PunyBlog(config);

  // When...
  const result = punyBlog.build();

  // Then...
  expect(result).toEqual(true);
  expect(fs.existsSync(path.join(path_dest, "css/style.css"))).toEqual(true);

  // ... confirm the css file referenced in the @import rule inside the css
  // file has a timestamp parameter indicating the file does exist.
  const content = fs.readFileSync(path.join(path_dest, "css/style.css"), "utf8");
  expect(content.trim()).not.toEqual("");
  const regex = new RegExp(/second.css\?ts=[0-9]+"/i);
  const matches = content.match(regex);
  expect(matches).not.toEqual(null);
});

});

describe("Markdown exclude regexes:", () => {

test(
  `[PunyBlog-Exclude-Regexes-001]
  Given
    - good paths
    - 3 src markdown files
    - 2 of them are excluded via configuration
  When
    - we build
  Then
    - only 1 file should be generated (the one that was not excluded)
`.trim(), async() => {
  // Given...
  const tmpobj1 = tmp.dirSync();
  const tmpobj2 = tmp.dirSync();
  const path_src = tmpobj1.name;
  const path_dest = tmpobj2.name;

  createMarkdownFile(path_src, "myfile.md", "# a header\n\nsome content");
  createMarkdownFile(path_src, "ignore1.md", "# a header\n\nsome content");
  createMarkdownFile(path_src, "ignore2.md", "# a header\n\nsome content");
  const keep_filename = path.join(path_dest, "myfile.html");
  const ignore1_filename = path.join(path_dest, "ignore1.html");
  const ignore2_filename = path.join(path_dest, "ignore2.html");

  const config = {
    path_src: path_src,
    path_dest: path_dest,
  };
  const punyBlog = new PunyBlog(config);

  // When...
  const build_config = {
    markdown_exclude_regexes: [
      "ignore1",
      "ignore2",
    ],
  };
  const result = punyBlog.build(build_config);

  // Then...
  expect(result).toEqual(true);
  expect(fs.existsSync(keep_filename)).toEqual(true);
  expect(fs.existsSync(ignore1_filename)).toEqual(false);
  expect(fs.existsSync(ignore2_filename)).toEqual(false);
});

test(
  `[PunyBlog-Exclude-Regexes-002]
  Given
    - good paths, 3 src markdown files
    - 2 of them are excluded via regex objects
  When
    - we build
  Then
    - only 1 file should be generated (the one that was not excluded)
`.trim(), async() => {
  // Given...
  const tmpobj1 = tmp.dirSync();
  const tmpobj2 = tmp.dirSync();
  const path_src = tmpobj1.name;
  const path_dest = tmpobj2.name;

  createMarkdownFile(path_src, "myfile.md", "# a header\n\nsome content");
  createMarkdownFile(path_src, "ignore1.md", "# a header\n\nsome content");
  createMarkdownFile(path_src, "ignore2.md", "# a header\n\nsome content");
  const keep_filename = path.join(path_dest, "myfile.html");
  const ignore1_filename = path.join(path_dest, "ignore1.html");
  const ignore2_filename = path.join(path_dest, "ignore2.html");

  const config = {
    path_src: path_src,
    path_dest: path_dest,
  };
  const punyBlog = new PunyBlog(config);

  // When...
  const build_config = {
    markdown_exclude_regexes: [
      new RegExp("ignore1", "i"),
      new RegExp("ignore2\.md"),
    ],
  };
  const result = punyBlog.build(build_config);

  // Then...
  expect(result).toEqual(true);
  expect(fs.existsSync(keep_filename)).toEqual(true);
  expect(fs.existsSync(ignore1_filename)).toEqual(false);
  expect(fs.existsSync(ignore2_filename)).toEqual(false);
});

});


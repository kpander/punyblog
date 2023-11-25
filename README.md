# PunyBlog

Tiny npm package to render a folder of markdown files into HTML.

Intended to be included in node projects as a dependency, as the renderer.

Think of it as a small, opinionated HTML build system.


## Purpose

Take a source folder of markdown files and static assets:

  - render markdown into html
  - use templates for common page structures
  - copy static assets to a dist folder (and maintain their timestamps)

The rendered destination folder is a self-contained static website.


### Why another static site generator?

There are many, many, many variations of static site generators (from Jekyll to Hugo to many others). This aims to be quick, simple and easy (and intended for my own use).

The motivation is to be able to easily translate a simple structure of markdown files into a website.

For example:

```
./src/index.md
./src/about.md
./src/articles/2022-05-01-first-thing.md
./src/articles/2022-05-06-next-thing.md
./src/css/styles.css
./src/images/something.jpg
```

... should simply become...

```
./dest/index.html
./dest/about.html
./dest/articles/2022-05-01-first-thing.html
./dest/articles/2022-05-06-next-thing.html
./dest/css/styles.css
./dest/images/something.jpg
```


## Supports

- nunjucks templates
- frontmatter in markdown files (which are available in templates as nunjucks variables)


## Installation

### 1. Create `.npmrc` file

Ensure your project has a `.npmrc` file in the project root, containing the following line:

```
@kpander:registry=https://npm.pkg.github.com/
```

This tells `npm` to look to Github when installing the package. (Necessary because the package isn't published to the npm registry. It's published to the Github registry.)

Also be sure to include your Github access token, or else the installation will be denied and fail.


### 2. Install the package

Assuming you already have a `package.json` file for your project:

```bash
$ npm install --save @kpander/punyblog
```




## Markdown files and frontmatter

All frontmatter in a markdown file is converted to a variable that can be used in the template.

For example, if my markdown file was this:

```
---
title: My page title
description: Some minor description here
var1: a value
var2: another value
---

# {{ title }}

This page is about: {{ description }}

Value of var1 = {{ var1 }}

Value of var2 = {{ var2 }}
```

The values inside the `{{ }}` parentheses would be replaced with the values specified in the frontmatter.


## Templates

Each page renders using the default template. The default template is this:

```
<!doctype html>
<html>
  <head></head>
  <body>
    <main>
      {% block page %}{% endblock %}
    </main>
  </body>
</html>
```

The markdown content is rendered inside the `<main>` block.

You can specify a custom template instead of using the default one.

Specify a filename with the `template` variable inside the frontmatter. If the filename is found within your partials folder, it will be used to render the page.

For example, if you had a custom template named `my-custom-template.html`, you would specify it like this:

```
---
title: my page title
template: my-custom-template.html
---

markdown content...
```

If the specified template file is not found, the render will fail and throw an error.

### Specifying paths for custom partial templates

You need to specify the folder(s) where partial templates will be found.

Provide the absolute path(s) as an array in the configuration object, using the `path_partials` key.

e.g.,:

```js
const PunyBlog = require("PunyBlog");

const blog = new PunyBlog({
  path_src: "/path/to/src",
  path_dest: "/path/to/dest",
  path_partials: [
    "/path/to/partials",
    "/path/to/more/partials",
  ],
});

blog.build();
```

### Template variables

By default, all frontmatter keys and values will be available as variables in the template.

In addition, there are some dynamic variables that will be available in the template. Assume the current file being rendered is:
  - `/articles/2022-05-01/index.md`

The following template variables will be present:
  - `{{ render.current.basename }}` - the basename of the current output file, e.g. "index.html"
  - `{{ render.current.path }}` - the relative path to the current page, e.g. "articles/2022-05-01"


## Features

### Cachebusting

Static filenames referenced in the final HTML will have a query parameter added, with the last modified timestamp for the file. This has the effect of being a 'cache buster' when files are modified, but the filename remains the same.

Any CSS files referenced in CSS `@import` rules (found inside external CSS files) will also be cachebusted.

Note:
  - CSS `@import` rules inside HTML files are not currently processed

Cachebusting is provided by the [Cachebust](https://github.com/kpander/cachebust) package.


### Image sizes

Local images referenced in markdown files will have their width and height attributes set in the HTML automatically (if the image can be read).

Image sizes are provided by the [Imagedims-js](https://github.com/kpander/imagedims-js) package.



## FAQ

### There are some markdown files in the `path_src` that I want to exclude. How do I tell PunyBlog to ignore them?

**Requires PunyBlog v1.3.0 or later**

You can provide an array of patterns to the `build()` method in a configuration object. Any path/filename that matches one of the patterns will be ignored. Patterns can be strings (which will be converted into a RegExp) or RegExp objects.

For example, assume we have 3 markdown files in the source folder and there is one we want to ignore.

```
/path/to/src/render-this.md
/path/to/src/folder/do-not-render-this.md
/path/to/src/ignore-all-these/ignore-this.md
```

```js
const PunyBlog = require("PunyBlog");

const blog = new PunyBlog({
  path_src: "/path/to/src",
  path_dest: "/path/to/dest",
  path_partials: [
    "/path/to/partials",
    "/path/to/more/partials",
  ],
});

const build_config = {
  markdown_exclude_regexes: [
    new RegExp("do-not-render-this\.md"),
    "ignore-all-these",
  ],
};
blog.build(build_config);
```


### How can I see the frontmatter data for each markdown file that will be processed?

**Requires PunyBlog v1.7.0 or later**

```
/path/to/src/render-this.md
/path/to/src/folder/article2.md
```

Assume each of these files have frontmatter keys "key1" and "key2".

```js
const PunyBlog = require("PunyBlog");

const blog = new PunyBlog({
  path_src: "/path/to/src",
  path_dest: "/path/to/dest",
  path_partials: [
    "/path/to/partials",
    "/path/to/more/partials",
  ],
});

console.log(blog.documents);
```

```json
{
  "/path/to/src/render-this.md": {
    "attributes": {
      "key1": "value1",
      "key2": "value2"
    },
    "body": "The markdown content of render-this.md"
  },
  "/path/to/src/folder/article2.md": {
    "attributes": {
      "key1": "value1",
      "key2": "value2"
    },
    "body": "The markdown content of article2.md"
  }
}
```


## API

### Methods

#### `<object> constructor(config = {})`

Create a new PunyBlog object.

**Parameters**
  - config (object) - configuration options for the blog

| Key             | Type    | Req?  | Example               | Description |
| :-              | :-      | :-    | :-                    | :-          |
| `path_src`      | string  | yes   | `"/path/to/src"`      | The path to the source folder |
| `path_dest`     | string  | yes   | `"/path/to/dest"`     | The path to the output/destination folder |
| `path_partials` | array   | no    | `["/path/to/partials", "/path/to/more/partials"]` | An array of paths to folders containing partial templates |
| `template_vars` | object  | no    | `{ "key1": "value1", "key2": "value2" }` | An object containing key/value pairs that will be available in all templates. This example would make `{{ key1 }}` and `{{ key2 }}` available in the templates. Nested objects are valid. |

**Returns**
  - (object) - a new PunyBlog object


#### `<bool> build(build_config = {})`

Generate the blog files in the destination path.

**Parameters**
  - build_config (object) - configuration options for the build

| Key                         | Type  | Req?  | Example                               | Description |
| :-                          | :-    | :-    | :-                                    | :-          |
| `markdown_exclude_regexes`  | array | no    | `[ new RegExp("exclude"), "ignore" ]` | Array of regexes which, if matched against the markdown filename, will cause the markdown file to be ignored |

**Returns**
  - (boolean) - true if the build was successful, false otherwise


### Properties

#### `<array> markdownFiles`

Return an array of all markdown files found in the source path.

**Returns**
  - (array) - array of strings, each string is a path to a markdown file


#### `<array> nonMarkdownFiles`

Return an array of all non-markdown files found in the source path.

**Returns**
  - (array) - array of strings, each string is a path to a non-markdown file


#### `<object> documents`

Return a json object with all the documents in the source path. Frontmatter for each should be the value for each file.

**Returns**
  - (object) - key/value pairs of filename and data

Data is an object with keys:
  - attributes: the frontmatter data as an object, with key/value pairs
  - body: the string text body of the article




## Maintainers

  - Kendall Anderson (kpander@invisiblethreads.com)


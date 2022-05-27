# PunyBlog

Tiny npm package to render a folder of markdown files into HTML.

Intended to be included in node projects as a dependency, as the renderer.


## Purpose

Take a source folder of markdown files and static assets:

  - render markdown into html
  - use templates for common page structures
  - copy static assets to a dist folder

The rendered destination folder should be considered a self-contained static website.


### Why another static site generator?

There are many, many, many variations of static site generators (from Jekyll to Hugo to many others). This aims to be quick, simple and easy (and intended for my own use).

The motivation is to be able to easily translate a simple structure of markdown files into a website.

For example:

```
./src/index.md
./src/about.md
./src/articles/2022-05-01-first-thing.md
./src/articles/2022-05-06-next-thing.md
```

... should simply become...

```
./dest/index.html
./dest/about.html
./dest/articles/2022-05-01-first-thing.html
./dest/articles/2022-05-06-next-thing.html
```


## Supports

- nunjucks templates
- frontmatter in markdown files (which are available in templates as nunjucks variables)


## Getting started

### Requirements

### Installation


## Markdown files

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

const punyBlog = new PunyBlog({
  path_src: "/path/to/src",
  path_dest: "/path/to/dest",
  path_partials: [
    "/path/to/partials1",
    "/path/to/partials2",
  ],
});
```



## Maintainers


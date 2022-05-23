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



## Maintainers


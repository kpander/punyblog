# PunyBlog changelog

  - v1.9.1 (2023-12-15)
    - Bugfix: Fixes nunjucks variable and macro calls, when they include quotes
      - Nunjucks macro calls (e.g., `mymacro("somevalue")`) were breaking, because quotes were replaced with entities
      - Telling the markdown renderer to not escape quotes doesn't seem to address this, which is why (at this time) this hacky fix is in place

  - v1.9.0 (2023-11-24)
    - Feature: Adds template variables for current file being rendered
      - `{{ render.current.basename }}` - the current base HTML file (e.g., index.html)
      - `{{ render.current.path }}` - the relative path to the current base HTML file (e.g., path/to)
    - Maintenance: Updates README to include API documentation
    - Maintenance: Adds test cases for `template_vars` config option

  - v1.8.0 (2023-11-18)
    - Feature: Empty `<p></p>` tags are removed from the final HTML
      - These are typically caused by Nunjucks comments/conditions/etc.
      - See [Github issue](https://github.com/kpander/punyblog/issues/30)

  - v1.7.0 (2023-11-17)
    - Feature: Adds public property `punyBlogInstance.documents` which returns an object with all markdown documents, their frontmatter, and contents
      - See [Github issue](https://github.com/kpander/punyblog/issues/28)

  - v1.6.0 (2023-11-15)
    - Feature: When static files are copied, the timestamps are maintained
      - This means they remain the same as the source files instead of changing every time you do a build
      - See [Github issue](https://github.com/kpander/punyblog/issues/26)
    - Maintenance: Updates babel depdendabot vulnerability

  - v1.5.0 (2023-09-30)
    - Feature: Allows nunjucks includes (`{% include "file" %}`) from the same path as the current markdown file being rendered
      - This means you can now include markdown files from the same folder as the current markdown file
      - See [Github issue](https://github.com/kpander/punyblog/issues/24)

  - v1.4.3 (2023-09-07)
    - Maintenance: Updates cachebust package

  - v1.4.2 (2023-09-04)
    - Maintenance: Updates imagedims-js package

  - v.1.4.1 (2023-09-03)
    - Maintenance: Updates imagedims-js package

  - v1.4.0 (2023-09-03)
    - Feature: Automatically adds `<img>` `width` and `height` attributes, via imagedims-js package

  - v1.3.4 (2023-09-03)
    - Bugfix: Fixes incorrect base path passed to cachebust when updating markdown files
    - Maintenance: Updates cachebust package to exclude data URLs

  - v1.3.3 (2023-09-03)
    - Maintenance: Updates cachebust package to incorporate bugfix

  - v1.3.2 (2023-08-05)
    - Maintenance: Updates cachebust package to incorporate bugfix
    - Maintenance: Updates depdendabot vulnerability

  - v1.3.1 (2023-08-05)
    - Maintenance: Updates cachebust package to incorporate bugfix

  - v1.3.0 (2023-06-11)
    - Feature: Adds ability to exclude markdown files/folders from the build process
      - See [Github issue](https://github.com/kpander/punyblog/issues/11)

  - v1.2.2 (2023-06-11)
    - Maintenance: Rendering errors are easier to debug now, by identifying the markdown file that failed rendering

  - v1.2.1 (2023-05-14)
    - Bugfix: Fixes CSS cachebusting implementation bug
      - If the referenced CSS file (from the html) was in a subfolder, timestamps weren't determined from existing files because the file wasn't found

  - v1.2.0 (2023-05-13)
    - Feature: Adds cachebusting to CSS `@import` rules inside CSS files
    - Maintenance: `npm audit fix` for dependabot warnings

  - v1.1.1 (2022-08-20)
    - Bugfix: Added error checking to ensure we provide absolute paths to PunyBlog.build()

  - v1.1.0 (2022-06-13)
    - Feature: Adds cachebusting to static filename references

  - v1.0.1 (2022-06-12)
    - Refactor: Switches common Util code to external Util package

  - v1.0.0 (2022-06-05)
    - Initial MVP release

  - v0.0.1 (2022-05-22)
    - Initial tests and proof of concepts

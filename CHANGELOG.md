# PunyBlog changelog

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

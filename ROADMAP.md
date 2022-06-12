# PunyBlog Roadmap

To support development:

  - proper logging, so we can tell where we're failing and why

To make site building easier:

  - sass implementation
    - automatically rewrite scss references to css
    - automatically compile scss into css
  - automatic cache busting
    - [done] add a url timestamp argument to static files
    - [done] timestamp should reflect last modified date of the source file
    - [done] should affect all static files we can easily catch
    - multiple modes
      - html (cachebust a string of html)
      - css (cachebust a string of css)

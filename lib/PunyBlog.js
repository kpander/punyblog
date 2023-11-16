/**
 * @file
 * PunyBlog.js
 */
const fs = require("fs");
const path = require("path");

const RenderHtml = require("./RenderHtml");
const Cachebust = require("@kpander/cachebust");
const Imagedims = require("@kpander/imagedims-js");
const Util = require("@kpander/nodejs-util");
const Log = require("../util/Log");

module.exports = class PunyBlog {
  constructor(config = {}) {
    this._config = config;
    this._log = new Log();
  }

  /**
   * Generate the blog files in the destination path.
   */
  build(build_config = {}) {
    if (!this._config_is_valid()) return false;

    const renderer = new RenderHtml(this._config, this._log);
    const cachebust_options = { path: this._config.path_src };

    // Convert markdown to HTML and copy to dest folder.
    this.markdownFiles.filter(filename_md => {
      return this._should_render_file(filename_md, build_config);
    }).forEach(filename_md => {
      const markdown = fs.readFileSync(filename_md, "utf8");

      let html;
      try {
        // Provide the path to the markdown file we're rendering, so we can
        // include partials from that same path if needed.
        const options = {
          path_partials_local: path.dirname(filename_md),
        };
        html = renderer.toHtml(markdown, options);
      } catch (err) {
        this._log.error(`[${Log.currentFn}] Error rendering file: ${filename_md}`);
        this._log.error(`[${Log.currentFn}] Config:`, this._config);
        process.exit(1);
      }

      cachebust_options.path = path.dirname(filename_md);
      let html_cachebusted = Cachebust.html(html, cachebust_options);
      html_cachebusted = Imagedims.process(html_cachebusted, cachebust_options);

      this._write_html(filename_md, html_cachebusted);
    });

    // Copy static files to dest folder.
    let css_files = [];
    this.nonMarkdownFiles.forEach(filename_src => {
      const relative_name = filename_src.replace(this._config.path_src, "");
      const filename_dest = path.join(this._config.path_dest, relative_name);

      if (!Util.ensureFolder(path.dirname(filename_dest))) {
        this._log.error(`[${Log.currentFn}] Error trying to create non-markdown folder`, path.dirname(filename_dest));
        return false;
      }
      fs.copyFileSync(filename_src, filename_dest);
      this._match_timestamps(filename_src, filename_dest);

      if (filename_dest.match(/\.css$/i)) css_files.push(filename_dest);
    });

    // Add cachebusting to @import rules in CSS files in dest folder.
    css_files.forEach(filename => {
      const options = { ...cachebust_options };
      options.path = path.dirname(filename);

      let css = fs.readFileSync(filename, "utf8");
      if (css.match(/@import/i)) {
        css = Cachebust.css(css, options);
        fs.writeFileSync(filename, css, "utf8");
      }
    });

    return true;
  }

  /**
   * Given a src file and a dest file, change the dest file's timestamp to
   * match the src file's timestamp.
   */
  _match_timestamps(file_src, file_dest) {
    const stats_src = fs.statSync(file_src);
    const stats_dest = fs.statSync(file_dest);

    if (stats_src.mtimeMs !== stats_dest.mtimeMs) {
      fs.utimesSync(file_dest, stats_src.atime, stats_src.mtime);
    }
  }

  /**
   * For the configuration to be valid, we need to provide
   * - a src folder that exists
   * - a destination folder (that can be created if it doesn't exist)
   * - both paths must be absolute paths (not relative paths)
   */
  _config_is_valid() {
    if (!Util.hasProp(this._config, "path_src")) {
      this._log.error(`[${Log.currentFn}] Config missing path_src`);
      return false;
    }
    if (!Util.hasProp(this._config, "path_dest")) {
      this._log.error(`[${Log.currentFn}] Config missing path_dest`);
      return false;
    }

    if (!path.isAbsolute(this._config.path_src)) {
      this._log.error(`[${Log.currentFn}] Given path_src must be an absolute path. Relative path was given`, this._config.path_src);
      return false;
    }

    if (!path.isAbsolute(this._config.path_dest)) {
      this._log.error(`[${Log.currentFn}] Given path_dest must be an absolute path. Relative path was given`, this._config.path_dest);
      return false;
    }

    if (!fs.existsSync(this._config.path_src)) {
      this._log.error(`[${Log.currentFn}] Given path_src doesn't exist`, this._config.path_src);
      return false;
    }

    if (!Util.ensureFolder(this._config.path_dest)) {
      this._log.error(`[${Log.currentFn}] Error trying to create path_dest`, this._config.path_dest);
      return false;
    }

    return true;
  }

  /**
   * Based on the filename and the build_config, should we render this file?
   *
   * @param string filename_md - the path/filename to possibly render
   * @param object build_config - object with exclude patterns (if any)
   *
   * @return boolean true if the path does not match an exclude regex
   * @return boolean false if the path matches an exclude regex
   */
  _should_render_file(filename_md, build_config = {}) {
    if (!build_config.markdown_exclude_regexes) return true;
    if (!build_config.markdown_exclude_regexes.length) return true;

    let shouldRender = true;
    build_config.markdown_exclude_regexes.forEach(string => {
      let regex = string;
      if (typeof string === "string") {
        regex = new RegExp(string);
      }

      if (filename_md.match(regex)) shouldRender = false;
    });

    return shouldRender;
  }

  /**
   * Return an array of all markdown files found in the source path.
   */
  get markdownFiles() {
    return Util.getFiles(this._config.path_src).filter(filename => {
      return filename.match(/\.md$/i);
    });
  }

  /**
   * Return an array of all non-markdown files found in the source path.
   */
  get nonMarkdownFiles() {
    return Util.getFiles(this._config.path_src).filter(filename => {
      return !filename.match(/\.md$/i);
    });
  }


  /**
   * Given the rendered html for a source markdown file, write the html to
   * an html file in the destination folder.
   *
   * Side effects:
   * - creates the dest folder if it doesn't exist
   * - creates the dest html file
   *
   * @param string filename_md = the original markdown filename
   * @param string html = the rendered html (converted from markdown)
   */
  _write_html(filename_md, html) {
    const relative_name = filename_md.replace(this._config.path_src, "");
    const filename_html = path.join(this._config.path_dest, relative_name).replace(/\.md$/i, ".html");

    if (!Util.ensureFolder(path.dirname(filename_html))) {
      this._log.error(`[${Log.currentFn}] Error trying to create html folder`, path.dirname(filename_html));
      return false;
    }

    fs.writeFileSync(filename_html, html, "utf8");
  }
}

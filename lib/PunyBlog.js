/**
 * @file
 * PunyBlog.js
 */
const fs = require("fs");
const path = require("path");

const RenderHtml = require("./RenderHtml");
const Cachebust = require("@kpander/cachebust");
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
  build() {
    if (!this._config_is_valid()) return false;

    const renderer = new RenderHtml(this._config, this._log);
    const cachebust_options = { path: this._config.path_src };

    // Convert markdown to HTML and copy to dest folder.
    this.markdownFiles.forEach(filename_md => {
      const markdown = fs.readFileSync(filename_md, "utf8");
      const html = renderer.toHtml(markdown);

      const html_cachebusted = Cachebust.html(html, cachebust_options);

      this._write_html(filename_md, html_cachebusted);
    });

    // Copy static files to dest folder.
    this.nonMarkdownFiles.forEach(filename_src => {
      const relative_name = filename_src.replace(this._config.path_src, "");
      const filename_dest = path.join(this._config.path_dest, relative_name);

      if (!Util.ensureFolder(path.dirname(filename_dest))) {
        this._log.error(`[${Log.currentFn}] Error trying to create non-markdown folder`, path.dirname(filename_dest));
        return false;
      }
      fs.copyFileSync(filename_src, filename_dest);
    });

    return true;
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

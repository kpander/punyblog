/**
 * @file
 * PunyBlog.js
 */
const fs = require("fs");
const path = require("path");

const RenderHtml = require("./RenderHtml");
const Util = require("../util/Util");

module.exports = class PunyBlog {
  constructor(config = {}) {
    this._config = config;
  }

  build() {
    if (!this._config_is_valid()) return false;

    const renderer = new RenderHtml(this._config);

    this.markdownFiles.forEach(filename_md => {
      const markdown = fs.readFileSync(filename_md, "utf8");
      const html = renderer.toHtml(markdown);

      this._write_html(filename_md, html);
    });

    return true;
  }

  /**
   * For the configuration to be valid, we need to provide
   * - a src folder that exists
   * - a destination folder (that can be created if it doesn't exist)
   */
  _config_is_valid() {
    if (!Util.hasProp(this._config, "path_src")) return false;
    if (!Util.hasProp(this._config, "path_dest")) return false;

    if (!fs.existsSync(this._config.path_src)) return false;

    Util.ensureFolder(this._config.path_dest);

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

    Util.ensureFolder(path.dirname(filename_html));
    fs.writeFileSync(filename_html, html, "utf8");
  }
}

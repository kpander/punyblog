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
    this._render = new RenderHtml(config);
  }

  build() {
    if (!this._config_is_valid()) return false;

    this._get_markdown_files(this._config.path_src).forEach(filename_md => {
      const relative_name = filename_md.replace(this._config.path_src, "");
      const filename_html = path.join(this._config.path_dest, relative_name).replace(/\.md$/i, ".html");

      if (!fs.existsSync(path.dirname(filename_html))) {
        fs.mkdirSync(path.dirname(filename_html), { recursive: true });
      }

      const content = fs.readFileSync(filename_md, "utf8");
      const html = this._render.render(content);
      fs.writeFileSync(filename_html, html, "utf8");
    });

    return true;
  }

  /**
   * For the configuration to be valid, we need to provide
   * - a src folder that exists
   * - a destination folder (that can be created if it doesn't exist)
   */
  _config_is_valid() {
    if (!Object.prototype.hasOwnProperty.call(this._config, "path_src")) return false;
    if (!Object.prototype.hasOwnProperty.call(this._config, "path_dest")) return false;

    if (!fs.existsSync(this._config.path_src)) return false;

    if (!fs.existsSync(this._config.path_dest)) {
      fs.mkdirSync(this._config.path_dest, { recursive: true });
    }

    return true;
  }

  _get_markdown_files(folder) {
    return Util.getFiles(folder).filter(filename => {
      return filename.match(/\.md$/i);
    });
  }

}

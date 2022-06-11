/**
 * @file
 * Cachebust.js
 *
 * Should likely use an HTML library like cheerio to parse HTML, rather than
 * the brutal regex'ing we're doing... *but* I really don't want to mess with
 * the HTML and cheerio will 'clean' the markup in way.
 */
const fs = require("fs");
const path = require("path");

const Util = require("../util/Util");

module.exports = class Cachebust {

  /**
   * @param object config, with expected keys
   *   string path: absolute base path for referencing files
   */
  constructor(config = {}, logger) {
    this._config = config;
    this._config.path = config.path || "";
    this._log = logger;
    this._key = "ts";
  }

  build(html) {
    if (typeof html !== "string") return false;
    this.html = html;

    const tags = {
      "link": "href",
      "img": "src",
      "script": "src",
      "source": "srcset",
    };

    Object.keys(tags).forEach(element => {
      this._apply_element(element, tags[element]);
    });

    return this.html;
  }

  _apply_element(element, attr) {
    const regex = new RegExp(`<${element}[^>]+${attr}="(.*?)"`, "ig");
    const matches = this.html.match(regex);
    if (matches === null) return;

    matches.forEach(html_match => {
      this._apply_element_attr(html_match, element, attr);
    });
  }

  /**
   * Take the matching html element with the file reference, and apply the
   * cachebusting timestamp to the referenced URL. If the URL is an absolute
   * reference (e.g., with a protocol and domain), don't change it.
   *
   * @param string html_match, containing one file match
   *   = the matching string we want to cachebust, e.g.:
   *     '<link rel="stylesheet" type="text/css" href="myfile.css"'
   */
  _apply_element_attr(html_match, element, attr) {
    const regex = new RegExp(`<` + element + `[^>]+` + attr + `="(.*?)"`, "i");
    const match = html_match.match(regex);

    if (match === null) return;

    const href = match[1];
    if (this._is_absolute_url(href)) return html_match;

    const url_replace = this._cachebust_href(href);
    const search = `${attr}="${href}"`;
    const replace = `${attr}="${url_replace}"`;

    const html_match_replace = Util.replaceAll(html_match, search, replace);
    this.html = Util.replaceAll(this.html, html_match, html_match_replace);
  }

  /**
   * Given the contents of an href/src attribute, apply a timestamp query
   * parameter, with the last modified time of the referenced file.
   *
   * @param string href e.g., "path/to/file.css?key=value"
   * @return string href e.g., "path/to/file.css?key=value&ts=123456789"
   */
  _cachebust_href(href) {
    const url = new URL(href, "https://fakeurl.url");
    const filename = url.pathname;

    const timestamp = this.timestamp(filename);
    url.searchParams.set(this._key, timestamp);

    return url.toString().replace("https://fakeurl.url/", "");
  }

  /**
   * Determine if the given href is an absolute url or not.
   *
   * @param string href e.g., "https://test.com/path"
   * @return boolean
   */
  _is_absolute_url(href) {
    try {
      new URL(href);
      return true;
    } catch(err) {
      return false;
    }
  }

  /**
   * Get a timestamp string for the given filename. Search for the file
   * relative to our base path (in this._config.path).
   *
   * If the file doesn't exist, return the current stamp and append "-m"
   * (meaning, "missing file").
   *
   * @param string filename e.g., "myfile.css"
   * @return string timestamp e.g., "1654646722102"
   */
  timestamp(filename) {
    const file = path.join(this._config.path, filename);
    const exists = fs.existsSync(file);

    if (exists) {
      const stats = fs.statSync(file);
      return `${stats.mtime.valueOf()}`;
    } else {
      const timestamp = Date.now();
      return `${timestamp}-m`;
    }
  }

}

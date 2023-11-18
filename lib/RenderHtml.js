/**
 * @file
 * RenderHtml.js
 *
 * markdown: https://github.com/markdown-it/markdown-it#readme
 * frontmatter: https://www.npmjs.com/package/front-matter
 * nunjucks: https://mozilla.github.io/nunjucks/api.html
 */
const path = require("path");

const md = require('markdown-it')({ html: true });
const fm = require('front-matter');
const nunjucks = require("nunjucks");

const Util = require("@kpander/nodejs-util");
const Log = require("../util/Log");

module.exports = class RenderHtml {
  constructor(config = {}, logger) {
    if (typeof config.path_partials === "string") {
      config.path_partials = [ config.path_partials ];
    } else if (!Array.isArray(config.path_partials)) {
      config.path_partials = [];
    }
    this._path_partials = [ ...config.path_partials, path.join(__dirname, "../partials") ];
    this._config = config;
    this._log = logger;
  }

  /**
   * Convert the given markdown text into HTML.
   *
   * Note: Calls to this function should be wrapped in a try/catch to account
   * for nunjucks rendering errors (with the markup, the partials, etc.).
   *
   * @param string markdown content to be rendered into HTML
   * @param object options = optional configuration for rendering
   *   - string path_partials_local
   *     - if provided, prepend this path to the partial paths to use
   *
   * @return string html
   */
  toHtml(markdown, options = {}) {
    if (options && options.path_partials_local) {
      const paths = [ options.path_partials_local, ...this._path_partials ];
      this.nunjucks_env = nunjucks.configure(paths, {});
    } else {
      this.nunjucks_env = nunjucks.configure(this._path_partials, {});
    }

    // Split the text content into a front matter object and raw markdown body.
    const data = fm(markdown);
    const vars = { ...this._config.template_vars, ...data.attributes };
    const template = this._get_template_file(data.attributes);

    let html = md.render(data.body.trim());
    html = this._fix_nunjucks_quoting(html);
    html = this._fix_nunjucks_includes(html);
    html = `
{% extends "${template}" %}
{% block page %}
${html}
{% endblock %}
`;

    html = nunjucks.renderString(html, vars);
    return Util.replaceAll(html, "<p></p>", "");
  }

  _get_template_file(attrs = {}) {
    const default_template = "punyblog.template.html";

    if (attrs === {}) return default_template;
    if (attrs.template === undefined) return default_template;
    if (attrs.template.trim() === "") return default_template;

    return attrs.template;
  }

  /**
   * When the markdown renderer runs, it converts '"' characters into the
   * '&quot;' HTML entity.
   *
   * Find cases where a nunjucks includes/statement contains a quote character
   * which has been by the '&quot;' entity, and revert it back. This is
   * necessary for nunjucks to properly render {% include ... %} statements.
   *
   * @param string html = the html content we're fixing
   * @return string html = the fixed html content
   */
  _fix_nunjucks_quoting(html) {
    const regex = new RegExp(/{%(.*)&(quot|apos);(.*?)&(quot|apos);(.*?)%}/gi);
    const matches = html.match(regex);
    if (matches === null) return html;

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const replace = match.replace(/&(quot|apos);/gi, '"');
      html = Util.replaceAll(html, match, replace);
    }

    return html;
  }

  /**
   * If the markdown content has a nunjucks {% include ... %} directive, the
   * markdown renderer will wrap it with <p> elements. We don't want that,
   * because the content of the include should be HTML.
   *
   * Find nunjucks {% include ... %} lines that are wrapped with <p> tags
   * and remove the <p> wrappers.
   *
   * @param string html = the html content we're fixing
   * @return string html = the fixed html content
   */
  _fix_nunjucks_includes(html) {
    const regex = new RegExp(/<p>({%.*%})<\/p>/gi);
    const matches = html.match(regex);
    if (matches === null) return html;

    for (let i = 0; i < matches.length; i++) {
      const search = matches[i];
      const replace = search.replace(/^<p>/i, "").replace(/<\/p>$/i, "");
      html = Util.replaceAll(html, search, replace);
    }

    return html;
  }

}


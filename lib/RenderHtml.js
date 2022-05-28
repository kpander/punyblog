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

const Util = require("../util/Util");

module.exports = class RenderHtml {
  constructor(config = {}) {
    const options = {};
    if (!Array.isArray(config.path_partials)) {
      config.path_partials = [];
    }
    this._path_partials = [ ...config.path_partials, path.join(__dirname, "../partials") ];
    this.nunjucks_env = nunjucks.configure(this._path_partials, options);
    this._config = config;
  }

  /**
   * Convert the given markdown text into HTML.
   *
   * @param string markdown content to be rendered into HTML
   * @return string html
   */
  toHtml(markdown) {
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

    try {
      return nunjucks.renderString(html, vars);
    } catch (err) {
      this._throw_nunjucks_render(err, template);
    }
  }

  _get_template_file(attrs = {}) {
    const default_template = "punyblog.template.html";

    if (attrs === {}) return default_template;
    if (attrs.template === undefined) return default_template;
    if (attrs.template.trim() === "") return default_template;

    return attrs.template;
  }

  /**
   * Throw an error when nunjucks failed to render.
   *
   * @param error = the error object thrown during the attempt to render a
   *   nunjucks template
   * @param string template = name of the nunjucks template we were trying
   *   to render
   *
   * @return nothing because we throw an exception
   */
  _throw_nunjucks_render(error, template) {
    let msg = `
Error rendering nunjucks template [${template}].
Confirm the file exists in one of the partial paths.
`;
    if (this._path_partials.length) {
      msg += "\nDefined partial paths:";
      this._path_partials.forEach(my_path => {
        msg += `\n  - ${my_path}`;
      });
    }

    console.error(msg);
    console.error("Error trace:", error);
    throw "Error rendering nunjucks template. Aborting.";
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


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

module.exports = class RenderHtml {
  constructor(config = {}) {
    this._config = config;
    const options = {};
    const paths_partials = [ path.join(__dirname, "../partials") ];
    this.nunjucks_env = nunjucks.configure(paths_partials, options);
  }

  /**
   * @param string markdown content to be rendered into HTML
   * @return string html
   */
  render(markdown) {
    // Split the text content into a front matter object and raw markdown body.
    const data = fm(markdown);
    const vars = { ...this._config.template_vars, ...data.attributes };

    let html = md.render(data.body.trim());
    html = `
{% extends "punyblog.template.html" %}
{% block page %}
${html}
{% endblock %}
`;
    return nunjucks.renderString(html, vars);
  }

}


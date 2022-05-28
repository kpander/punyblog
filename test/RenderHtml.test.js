"use strict";
/*global test, expect*/
/**
 * @file
 * RenderHtml.test.js
 */

const RenderHtml = require("../lib/RenderHtml");
const fs = require("fs");
const path = require("path");
const tmp = require("tmp");

test(
  `[RenderHtml-001]
  Given
    - no arguments
  When
    - we run render()
  Then
    - we receive the default template partial, with no content inside <main>
`.trim(), async() => {
  // Given...
  const renderHtml = new RenderHtml();

  // When...
  // ... find the content within <main> and ensure it's empty, as it is in the
  // default template partial.
  const result = renderHtml.toHtml().trim();
  const search = new RegExp(/<main>([\s\n]{0,})<\/main>/im);
  const match = result.match(search);

  // Then...
  expect(match.length).toEqual(2);
  expect(match[1].trim()).toEqual("");
});

test(
  `[RenderHtml-002]
  Given
    - a single string
  When
    - we run render()
  Then
    - the content inside the template's <main> tag is the string wrapped in <p> tags (standard markdown)
`.trim(), async() => {
  // Given...
  const renderHtml = new RenderHtml();
  const string = "my test string";

  // When...
  const result = renderHtml.toHtml(string).trim();
  const search = new RegExp(/<main>(.*)<\/main>/ims);
  const match = result.match(search);

  // Then...
  expect(match[1].trim()).toEqual(`<p>${string}</p>`);
});

test(
  `[RenderHtml-003]
  Given
    - a single string with markdown markup
  When
    - we run render()
  Then
    - we receive the string converted to expected HTML (within the template <main> element)
`.trim(), async() => {
  // Given...
  const renderHtml = new RenderHtml();
  const string = "my test string";

  // When...
  const result = renderHtml.toHtml(`## ${string}`).trim();
  const search = new RegExp(/<main>(.*)<\/main>/ims);
  const match = result.match(search);

  // Then...
  expect(match[1].trim()).toEqual(`<h2>${string}</h2>`);
});

test(
  `[RenderHtml-004]
  Given
    - a string with both frontmatter and markdown markup
  When
    - we run render()
  Then
    - we receive the markdown content converted to expected HTML, within the <main> element of the template
`.trim(), async() => {
  // Given...
  const renderHtml = new RenderHtml();
  const string = "my test string";
  const markdown = `
---
abc: def
ghi: jkl
---

## ${string}
`.trim();

  // When...
  const result = renderHtml.toHtml(markdown).trim();
  const search = new RegExp(/<main>(.*)<\/main>/ims);
  const match = result.match(search);

  // Then...
  expect(match[1].trim()).toEqual(`<h2>${string}</h2>`);
});

test(
  `[RenderHtml-005]
  Given
    - a string with multiple frontmatter variables, and markdown markup
  When
    - we run render()
  Then
    - the rendered HTML includes the frontmatter values, as nunjucks variables
`.trim(), async() => {
  // Given...
  const renderHtml = new RenderHtml();
  const markdown = `
---
var1: my var1 value
var2: my var2 value
---

## we have '{{ var1 }}' and '{{ var2 }}'
`.trim();

  // When...
  const result = renderHtml.toHtml(markdown).trim();
  const search = new RegExp(/<main>(.*)<\/main>/ims);
  const match = result.match(search);

  // Then...
  expect(match[1].trim()).toEqual(`<h2>we have 'my var1 value' and 'my var2 value'</h2>`);
});

test(
  `[RenderHtml-006]
  Given
    - a string with markdown markup
    - a custom nunjucks template to override the default
  When
    - we run render()
  Then
    - the custom template (with the same name as the PunyBlog default) should be used and should override the default template when nunjucks renders the content
`.trim(), async() => {
  // Given...
  // ... create a path with a custom partial file, the same name as the default.
  const tmpobj = tmp.dirSync();
  const path_partials = tmpobj.name;
  const file_partial = path.join(path_partials, "punyblog.template.html");
  fs.writeFileSync(file_partial, "my custom template", "utf8");

  const config = {
    path_partials: [ path_partials ]
  };
  const renderHtml = new RenderHtml(config);
  const markdown = "## my custom markdown";

  // When...
  const result = renderHtml.toHtml(markdown).trim();

  // Then...
  expect(result).toEqual("my custom template");
});

test(
  `[RenderHtml-007]
  Given
    - a string with markdown markup
    - frontmatter that specifies a custom template
    - a custom template file, specified in the frontmatter
  When
    - we run render()
  Then
    - the result should be the custom template
`.trim(), async() => {
  // Given...
  // ... create a path with a custom partial file, the same name as the default.
  const tmpobj = tmp.dirSync();
  const path_partials = tmpobj.name;
  const file_partial = path.join(path_partials, "custom-template.html");
  fs.writeFileSync(file_partial, "my custom template", "utf8");

  const config = {
    path_partials: [ path_partials ]
  };
  const renderHtml = new RenderHtml(config);
  const markdown = `
---
template: custom-template.html
---
`.trim();

  // When...
  const result = renderHtml.toHtml(markdown).trim();

  // Then...
  expect(result).toEqual("my custom template");
});

test(
  `[RenderHtml-008]
  Given
    - a string with markdown markup
    - frontmatter that specifies a custom template
    - the template file doesn't exist
  When
    - we run render()
  Then
    - we should throw an error
`.trim(), async() => {
  // Given...
  const renderHtml = new RenderHtml();
  const markdown = `
---
template: missing-file.html
---
`.trim();

  // When...
  let error = false;
  try {
    renderHtml.toHtml(markdown).trim();
  } catch (err) {
    error = err;
  }

  // Then...
  expect(error).not.toEqual(false);
});

test(
  `[RenderHtml-009]
  Given
    - a string with markdown markup, that includes a nunjucks template
  When
    - we run render()
  Then
    - the result should contain the content of the custom nunjucks template file
    - the result should not wrap the {% include %} in <p> via markdown
    - the partial content should be correctly positioned
`.trim(), async() => {
  // Given...
  // ... create a path with a custom partial file
  const tmpobj = tmp.dirSync();
  const path_partials = tmpobj.name;
  const file_partial = path.join(path_partials, "custom-partial.html");
  fs.writeFileSync(file_partial, "<div>my custom partial</div>", "utf8");

  const config = {
    path_partials: [ path_partials ]
  };
  const renderHtml = new RenderHtml(config);
  const markdown = `
# header 1

{% include "custom-partial.html" %}

## header 2
`.trim();

  // When...
  const result = renderHtml.toHtml(markdown).trim();
  const regex = new RegExp(/header 1.*my custom partial.*header 2/is);
  const match = result.match(regex);

  // Then...
  expect(result.indexOf("<div>my custom partial")).toBeGreaterThan(-1);
  expect(result.indexOf("<p><div>my custom partial")).toEqual(-1);
  expect(match).not.toEqual(null);
});


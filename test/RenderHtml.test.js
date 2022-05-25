"use strict";
/*global test, expect*/
/**
 * @file
 * RenderHtml.test.js
 */

const fs = require("fs");
const path = require("path");
const RenderHtml = require("../lib/RenderHtml");

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
  const filename_partial = path.join(__dirname, "..", "partials", "default.template.html");

  // When...
  // ... find the content within <main> and ensure it's empty, as it is in the
  // default template partial.
  const result = renderHtml.render().trim();
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
  const result = renderHtml.render(string).trim();
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
  const result = renderHtml.render(`## ${string}`).trim();
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
  const result = renderHtml.render(markdown).trim();
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
  const result = renderHtml.render(markdown).trim();
  const search = new RegExp(/<main>(.*)<\/main>/ims);
  const match = result.match(search);

  // Then...
  expect(match[1].trim()).toEqual(`<h2>we have 'my var1 value' and 'my var2 value'</h2>`);
});


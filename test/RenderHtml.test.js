"use strict";
/*global test, expect*/
/**
 * @file
 * RenderHtml.test.js
 */

const RenderHtml = require("../lib/RenderHtml");

test(
  `[RenderHtml-001]
  Given
    - no arguments
  When
    - we run render()
  Then
    - we receive an empty string
`.trim(), async() => {
  // Given...
  const renderHtml = new RenderHtml();

  // When...
  const result = renderHtml.render();

  // Then...
  expect(result).toEqual("");
});

test(
  `[RenderHtml-002]
  Given
    - a single string
  When
    - we run render()
  Then
    - we receive the string wrapped in <p> tags (standard markdown)
`.trim(), async() => {
  // Given...
  const renderHtml = new RenderHtml();
  const string = "my test string";

  // When...
  const result = renderHtml.render(string).trim();

  // Then...
  expect(result).toEqual(`<p>${string}</p>`);
});

test(
  `[RenderHtml-003]
  Given
    - a single string with markdown markup
  When
    - we run render()
  Then
    - we receive the string converted to expected HTML
`.trim(), async() => {
  // Given...
  const renderHtml = new RenderHtml();
  const string = "my test string";

  // When...
  const result = renderHtml.render(`## ${string}`).trim();

  // Then...
  expect(result).toEqual(`<h2>${string}</h2>`);
});

test(
  `[RenderHtml-004]
  Given
    - a string with both frontmatter and markdown markup
  When
    - we run render()
  Then
    - we receive the markdown content converted to expected HTML
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

  // Then...
  expect(result).toEqual(`<h2>${string}</h2>`);
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

  // Then...
  expect(result).toEqual(`<h2>we have 'my var1 value' and 'my var2 value'</h2>`);
});



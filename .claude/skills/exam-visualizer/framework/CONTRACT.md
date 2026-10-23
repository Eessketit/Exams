# Exam visualizer: contract for question authors

One published HTML page per course explains every question of its sample exams (or homework sets) with figures.
The course's project folder (`PROJECT`, named in your brief) has `project.json`, which lists the sections (usually one
per sample exam, ids `s1`, `s2`, ...) and the parts of each section (for example `mc` = multiple choice and `w` =
written). `build.py` assembles the page from fragment files in `PROJECT/parts/`. You own exactly one scope
`<section>-<part>`, for example `s3-w` (Sample 3, written questions) or `s2-mc` (Sample 2, multiple choice).

Paths (absolute):
- `FRAMEWORK` = `/Users/jamol/Exams/.claude/skills/exam-visualizer/framework/` (this file, `shell.html`, `build.py`,
  `check.py`). Never edit anything here.
- `PROJECT` = the course's visuals folder from your brief, e.g. `/Users/jamol/Exams/Midterms/MultimediaComputing/visuals/`.
  `project.json` → `sources` points at the question files, notes and slides (paths relative to `PROJECT`).
- Reference implementation (always read it, whatever the course):
  `/Users/jamol/Exams/Midterms/MultimediaComputing/visuals/parts/s1-mc.html` + `.js` (question `s1-mc5`), and for a
  written question `parts/s2-w.html` + `.js` in the same folder.

## What you write

Only two files: `PROJECT/parts/<scope>.html` and `PROJECT/parts/<scope>.js`. Never edit the framework, `project.json` or
another scope's files. If the shell lacks something you need, solve it inside your files with the existing classes, and mention it
in your final message.

Read the reference implementation first. It shows the quality bar, the markup, and how the JS uses the `QV` helpers.
Read `FRAMEWORK/shell.html` too: its CSS lists every class you may use, and its `QV` object is the helper library.

`parts/<scope>.html` holds only `<article>` elements, in question order. `parts/<scope>.js` holds one
`QV.register('<article id>', function (q) { ... })` call per article. `q` is the article element.

If your scope file already has articles (a question done earlier), keep them unchanged and put yours around them in
question order.

### Article ids and attributes

`<article class="q" id="<scope><K>" data-part="<part key>" data-num="<K>" data-topic="Short topic">`, for example
`<article class="q" id="s2-mc3" data-part="mc" data-num="3" data-topic="Entropy">` or
`<article class="q" id="s1-w2" data-part="w" data-num="2" data-topic="Filtering">`. The id doubles as the deep link
(`<artifact url>#s2-mc3`), so never change an id once published.

`data-topic` is 1 to 3 words (it labels the index chip for parts with `"chip": "topic"` and is the tooltip otherwise), e.g. `Morphology`,
`Histogram equalization`, `LZW`, `Nyquist rate`, `MIDI status byte`.

No other element may have an `id`. Find your hosts with `q.querySelector('[data-viz="name"]')` and text slots with
`[data-role="name"]`. Never use `document.getElementById` / `document.querySelector` (the build warns).

### Multiple-choice template

```html
<article class="q" id="s2-mc3" data-part="mc" data-num="3" data-topic="Entropy">
  <div class="q-head">
    <p class="eyebrow">Question 3 · Lecture 4, Entropy</p>
    <h3 class="q-title">Question text, verbatim from the md (keep "..." blanks)</h3>
  </div>
  <ol class="options">
    <li><span class="key">a</span><span>option text verbatim</span><span class="why">No. One short reason.</span></li>
    <li class="right"><span class="key">b</span><span>...</span><span class="why">Correct. ...</span></li>
    ...
  </ol>
  <div class="answer"><p><strong>Answer: b.</strong> 2 to 4 plain sentences that explain why.</p></div>
  <figure class="fig">
    <div class="fig-head"><span class="fig-no">Figure 1</span><h4>Title that states what the figure shows</h4></div>
    <p class="fig-lede">One or two sentences: what to look at.</p>
    <div data-viz="main"></div>
  </figure>
  <!-- optional: <div class="q-head"><h4>Why the other options are wrong</h4><div class="why-grid">.mini cards</div></div> -->
  <div class="exam-line">
    <span class="label">Exam line</span>
    <p>The one or two sentences to remember, in slide wording.</p>
    <p class="source">Source: L4 p.12 · Notes: Lecture 4 › 3. Section name</p>
  </div>
</article>
```

MC questions get 1 or 2 figures. Every figure must show the mechanism behind the answer (a waveform with the period
marked, a byte with its bit fields, a pixel grid with the neighbours lit, the system flow chart with the stage
highlighted), not decoration and not a restatement of the text. A definitional question still gets a picture: draw the
concept (e.g. the pattern-recognition pipeline with the asked stage highlighted, clusters vs labelled classes).

### Written template

```html
<article class="q" id="s1-w2" data-part="w" data-num="2" data-topic="Filtering">
  <div class="q-head">
    <p class="eyebrow">Question 2 · 10 pts · Lecture 11, Spatial filtering</p>
    <h3 class="q-title">Filtering: blurring vs median</h3>
  </div>
  <div class="prompt">
    <ol class="subq">
      <li><span class="tag">(a)</span><span>Sub-question text verbatim. <span class="pts">(4 pts)</span></span></li>
      <li><span class="tag">(b)</span><span>... <span class="pts">(6 pts)</span></span></li>
    </ol>
    <div class="given" data-viz="given"></div>   <!-- the given image / table / matrix, drawn with QV.mat or QV.table -->
  </div>
  <div class="solution">
    <div class="sol-part">
      <h4>(a) What to write</h4>
      <ul><li>...</li></ul>
    </div>
    <div class="sol-part">
      <h4>(b) Worked solution</h4>
      <pre class="calc">57 + 59 + ... = 741
741 / 9 = 82.33 → 82</pre>
      <figure class="fig">...</figure>
      <p>Result: <span class="result">...</span></p>
    </div>
  </div>
  <div class="exam-line">...</div>
</article>
```

`q-title` for written questions is the md heading without the `Q1.` prefix and points (e.g. `Morphology: erosion`).
Include everything from the md answer that earns marks (definitions, method, working, final result, checks), in short
bullet points. Written questions get 2 to 4 figures, roughly one per computational sub-part. Where the work is a
procedure, make the figure a step-through with `QV.steps` (sliding a structuring element or mask over the image,
building a Huffman / Shannon-Fano tree, filling an LZW dictionary, accumulating a histogram-equalization CDF, assigning a
point to the nearest class mean). The default state of a step-through must already be meaningful: start on "All" or on
the final result, never on an empty frame.

## Visual rules

- Use only the classes in `shell.html`. No `<style>` or `<script>` in the html part. Inline `style` only for one-off
  geometry (font-size, stroke-width, opacity), never for colors, except data colors below.
- Colors only through classes / tokens: `t-*` text, `f-*` fills, `s-*` strokes, `a-*` arrows, `area-*`, `sw-*` legend
  swatches, `.mat td.on/.hl/.hl2/.org`. Text on a solid accent fill (`f-pri`, `f-sec`, `f-ok`...) uses `t-on`; text on a
  soft fill or `f-seg` uses `t-fg`.
- Data colors are allowed where the color is the data: gray pixel intensities (use `QV.gray(v, max)`, which returns a
  fill style and the matching `t-ink` / `t-paper` text class), and real colors in color-science figures (chromaticity
  diagram, RGB primaries). Put the text `data-color` in a `//` comment on any line with a literal color, or the build warns.
- Binary images: 1 = `f-pri` with `t-on` text, 0 = `f-seg` with `t-fg` (or `t-muted`) text. Highlight a structuring
  element footprint with an outline (`outline-sec` on a rect with `f-none`), not by recoloring the data.
- Semantic color: `pri` (cobalt) is the main subject, `sec` (plum) the contrast or "the other method", `ter` (ochre) a
  third series, `ok` correct / result, `bad` wrong / error. Keep it consistent within a question.
- Never measure layout (`getBBox`, `getBoundingClientRect`, `clientWidth`...); compute every coordinate from numbers.
  Hidden samples are drawn lazily, but figures must not depend on being visible.
- SVG via `QV.svg(host, w, h, { label, minWidth, maxWidth })`. Design widths 320 to 860. Text in an SVG is 11px at
  design size by default (`t-sm` = 10px, the minimum; `t-lg` = 13px). The SVG is scaled to the column (max 1.3x
  design width), and on phones it keeps `minWidth` (default 80% of design width, capped) and scrolls sideways inside its
  own box, so keep minWidth at or below about 560.
- Keep every label inside the viewBox with a margin, and clear of marks and other labels. Draw charts to scale with
  `QV.axes`; every tick label names a value the chart reaches.
- Matrices and small images: `QV.mat` (HTML table, good for given data and results) or `QV.grid` (SVG, good when you
  need overlays, arrows, sliding windows). Show row/column indices when the question uses coordinates.
- Interactions: `QV.steps` for procedures, `QV.slider` for a continuous parameter. Don't add interaction that teaches
  nothing.
- Don't use emoji, decorative gradients, or numbered markers that are not a real sequence.
- An SVG inside `.given` shrinks to its minWidth; give it `minWidth` = `maxWidth` = its design width.
- A `.legend` item with `<sub>` in its label: wrap the label in an inner `<span>`, or the flex gap splits it.
- Gray rasters may use the inline style `shape-rendering: crispEdges` to stop seams between cells.
- Letter + combining mark runs (B̂, x̄, l̄, f̃) are set in STIX Two automatically by the shell, in HTML and SVG text
  alike; write them as plain Unicode and don't work around the font.

## Writing rules

- Plain, short, direct sentences. No em-dash asides, no "not X, but Y" framing, no colon-then-reveal sentences, no
  "worth noting", no scare quotes. Use the slide's terms and quote the slide wording where the md quotes it.
- Question and option text verbatim from the md. Fix nothing in them.
- Each question ends with the exam line: the sentence to remember and `Source: L.. p..` plus
  `Notes: Lecture N › section` copied from the md's Source/Notes lines (plain text, no links; the notes are local files).
- Escape `<`, `>` and `&` in HTML text (`&lt;` etc.). Use real Unicode for math where it reads well (×, −, ≤, ≥, ≠,
  ∩, ∪, ⊕, ⊖, ∘, •, θ, √, Σ, subscripts ₀₁₂, superscripts ², ᶜ) and `<sub>` / `<sup>` otherwise. No LaTeX: the page
  does not render it.

## Accuracy

The md answers were already checked. Use them, keep their numbers, and recompute every number you draw or print with
`python3 -I` (no numpy available; plain Python). If the md has an error, follow the correct math and report it in your
final message with the evidence.

## Code style

- Spaces only, never tabs. Match the reference JS: `const`, arrow functions, `QV` helpers, compact geometry objects.
- Comments only to say why, one line, rarely. No narration.
- Each `QV.register` body is independent; one throwing must not affect others (the shell already isolates them).

## Process

1. Read this file, the reference implementation, the `QV` part of `FRAMEWORK/shell.html`, your questions in the source
   file, and the notes sections they link to.
2. Write all your articles and their JS.
3. Build: `python3 -I FRAMEWORK/build.py PROJECT --only <scope> --out PROJECT/dist/<scope>.html`. Fix every ERROR and
   WARN.
4. Check: `python3 -I FRAMEWORK/check.py PROJECT/dist/<scope>.html <id> <id> ...` with all your ids. It prints script
   errors and overflow from headless Chrome, and writes screenshots to `PROJECT/dist/shots/<id>-900-light*.png` and
   `<id>-500-dark*.png` (tall questions come in numbered 1600px chunks from the top). Headless Chrome cannot go below
   500px wide. Read every screenshot. Fix overlapping or clipped labels, unreadable text in either theme, empty or
   wrong figures, horizontal page overflow.
5. Re-run the check only for the questions you changed and look once more. At most two screenshot rounds in total.
6. Don't delete files outside `PROJECT/dist/`.

## Final message

Return: the ids you finished, one line per question naming its figures, anything you were unsure about, and any error
you found in the md (with the corrected value). Keep it short.

## QV API (from shell.html)

- `QV.s(tag, attrs, parent, text)` SVG element. `QV.h(tag, attrs, parent, text)` HTML element (`class`, `html` keys).
- `QV.svg(host, w, h, {label, minWidth, maxWidth})` → `<svg>` inside a `.scroll` wrapper appended to `host`.
- `QV.scale(d0, d1, r0, r1)` → linear function. `QV.fmt(n, digits=3)` → trimmed number string.
- `QV.axes(g, {x, y, w, h, xd:[a,b], yd:[a,b], xt:[...], yt:[...], xf, yf, xl, yl, grid})` → `{x(v), y(v), box}`.
  Leave about 40px below the plot box for tick labels plus `xl`, and 14px above for `yl`.
- `QV.line(g, [[x,y],...], cls)`, `QV.plot(g, ax, f, a, b, n, cls)`.
- `QV.grid(g, {x, y, data, cell, gap, fill(v,r,c) → cls | {cls, style, text}, text(v,r,c) → label|null, textCls, rowLabels, colLabels, title, round, stroke})`
  → `{rects[r][c], texts[r][c], cx(c), cy(r), w, h}`. Use `title` only with room above (y ≥ 30 with colLabels).
- `QV.gray(v, max=255)` → `{style, text}` (usable directly as a `grid` fill result).
- `QV.box(g, x, y, w, h, 'line1\nline2', {cls, textCls, rx, lh, stroke})` rounded box with centered text.
- `QV.arrow(g, x1, y1, x2, y2, {cls:'a-muted'|'a-pri'|..., label, dx, dy, dash, width, head})`.
- `QV.steps(host, labels, onChange(k), start)` → `{set(k), buttons}`; calls `onChange(start)` immediately.
- `QV.slider(host, {label, min, max, step, value, fmt}, onInput(v))` → input; calls `onInput` immediately.
- `QV.table(host, headers, rows, {cls})` → `{table, rows}`; a cell is a string or `{text|html, cls}` (`l` = left align,
  `hl` = highlighted). Row class `on` highlights a row.
- `QV.mat(host, data, {caption, text(v,r,c), hl(v,r,c) → 'on'|'hl'|'hl2'|'org'|null})` → `{table, cells}`.

QV.register('s3-w1', function (q) {
  const { s, svg, grid, steps, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const A = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0],
  ];
  const N = 7, C = 28;
  const at = (M, r, c) => (r >= 0 && r < N && c >= 0 && c < N ? M[r][c] : 0);
  const win = (r, c) => [-1, 0, 1].flatMap(i => [-1, 0, 1].map(j => [r + i, c + j]));
  const E = A.map((row, r) => row.map((_, c) => (win(r, c).every(([i, j]) => at(A, i, j)) ? 1 : 0)));
  const D = E.map((row, r) => row.map((_, c) => (win(r, c).some(([i, j]) => at(E, i, j)) ? 1 : 0)));
  const idx = ['0', '1', '2', '3', '4', '5', '6'];
  const binGrid = (g, x, y, M, title) => grid(g, {
    x, y, data: M, cell: C, title, rowLabels: idx, colLabels: idx,
    fill: v => (v ? 'f-pri' : 'f-seg'), textCls: v => (v ? 't-on' : 't-muted'),
  });
  const seFrame = (g, x0, y0, r, c, cls) => s('rect', { x: x0 + (c - 1) * C, y: y0 + (r - 1) * C, width: 3 * C, height: 3 * C, class: 'f-none ' + (cls || 'outline-sec') }, g);

  // Given: A and B with its origin
  const giv = svg(viz('given'), 420, 260, { label: 'Binary image A, 7 by 7, and the 3 by 3 structuring element B with origin at the centre', minWidth: 360 });
  binGrid(giv, 30, 48, A, 'A');
  const gB = grid(giv, { x: 300, y: 104, data: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], cell: C, fill: () => 'f-pri', textCls: () => 't-on', title: 'B' });
  s('rect', { x: gB.cx(1) + 3, y: gB.cy(1) + 3, width: C - 6, height: C - 6, class: 'f-none sep', style: 'stroke-width: 2' }, giv);
  s('text', { x: 300, y: 214 }, giv, 'origin = centre');

  // Figure 1: erosion
  const ero = svg(viz('ero'), 600, 274, { label: 'Erosion of A by B: A on the left, A eroded by B on the right', minWidth: 480 });
  const EA = { x: 34, y: 52 }, EO = { x: 360, y: 52 };
  binGrid(ero, EA.x, EA.y, A, 'A');
  binGrid(ero, EO.x, EO.y, E, 'A ⊖ B');
  arrow(ero, 274, EA.y + 3.5 * C, 344, EA.y + 3.5 * C, { label: '⊖ B', labelCls: 't-fg t-bold', dy: -10 });
  const eroLayer = s('g', {}, ero);
  const ERO = [
    null,
    [2, 2, 'Origin at (2,2). All 9 pixels under B are 1, so B fits and the output is 1.'],
    [2, 4, 'Origin at (2,4). (1,5) and (3,5) are 0, so B does not fit and the output is 0.'],
    [1, 1, 'Origin at (1,1). Row 0 and column 0 of the window are 0, five misses, so the output is 0. Every edge pixel of the block fails like this.'],
    [2, 5, 'Origin at (2,5), on the protrusion. The rows above and below it are 0 at columns 5 and 6, so the output is 0.'],
    [5, 6, 'Origin at (5,6), the noise pixel. 8 of the 9 positions are 0, three of them outside the image, so the output is 0.'],
  ];
  steps(viz('ero-steps'), ['All', '(2,2)', '(2,4)', '(1,1)', '(2,5)', '(5,6)'], k => {
    eroLayer.textContent = '';
    if (!k) {
      role('ero-note').textContent = 'B fits only with its origin at (2,2), (2,3), (3,2) and (3,3), so A ⊖ B keeps those 4 pixels. Pick a pixel to test it.';
      return;
    }
    const [r, c, note] = ERO[k];
    win(r, c).forEach(([i, j]) => {
      if (at(A, i, j)) return;
      const x = EA.x + j * C, y = EA.y + i * C;
      const out = i < 0 || j < 0 || i >= N || j >= N;
      s('rect', { x: x + 4, y: y + 4, width: C - 8, height: C - 8, class: 'f-none s-bad' + (out ? ' dash' : ''), style: 'stroke-width: 2' }, eroLayer);
      if (out) s('text', { x: x + C / 2, y: y + C / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-bad' }, eroLayer, '0');
    });
    seFrame(eroLayer, EA.x, EA.y, r, c);
    s('rect', { x: EO.x + c * C, y: EO.y + r * C, width: C, height: C, class: 'f-none outline-sec' }, eroLayer);
    role('ero-note').textContent = note;
  });

  // Figure 2: dilation of the eroded image
  const dil = svg(viz('dil'), 600, 274, { label: 'Dilation of A eroded by B: each surviving pixel stamps a 3 by 3 copy of B', minWidth: 480 });
  const DA = { x: 34, y: 52 }, DO = { x: 360, y: 52 };
  binGrid(dil, DA.x, DA.y, E, 'A ⊖ B');
  binGrid(dil, DO.x, DO.y, D, 'A ∘ B = (A ⊖ B) ⊕ B');
  arrow(dil, 274, DA.y + 3.5 * C, 344, DA.y + 3.5 * C, { label: '⊕ B', labelCls: 't-fg t-bold', dy: -10 });
  const dilLayer = s('g', {}, dil);
  const SEEDS = [[2, 2], [2, 3], [3, 2], [3, 3]];
  steps(viz('dil-steps'), ['All', '(2,2)', '(2,3)', '(3,2)', '(3,3)'], k => {
    dilLayer.textContent = '';
    const list = k ? [SEEDS[k - 1]] : SEEDS;
    list.forEach(([r, c]) => {
      s('rect', { x: DA.x + c * C, y: DA.y + r * C, width: C, height: C, class: 'f-none outline-sec' }, dilLayer);
      const f = seFrame(dilLayer, DO.x, DO.y, r, c, k ? 'outline-sec' : 'outline-sec dash');
      if (!k) f.setAttribute('style', 'stroke-width: 1.5');
    });
    if (!k) {
      role('dil-note').textContent = 'The four copies of B overlap. Together they cover rows 1-4, cols 1-4, 16 pixels.';
    } else {
      const [r, c] = SEEDS[k - 1];
      role('dil-note').textContent = `(${r},${c}) is 1 in A ⊖ B, so B centred there writes 1 into rows ${r - 1}-${r + 1}, cols ${c - 1}-${c + 1}.`;
    }
  });

  // Figure 3: kept against removed pixels
  const dif = svg(viz('diff'), 560, 256, { label: 'A with the pixels kept by the opening and the pixels it removed', minWidth: 440 });
  const G3 = grid(dif, {
    x: 34, y: 40, data: A, cell: C, rowLabels: idx, colLabels: idx,
    fill: (v, r, c) => (v ? (D[r][c] ? 'f-pri' : 'f-bad') : 'f-seg'), textCls: v => (v ? 't-on' : 't-muted'),
  });
  const right = 34 + N * C;
  arrow(dif, 300, G3.cy(2) + C / 2, right + 6, G3.cy(2) + C / 2, { cls: 'a-bad' });
  s('text', { x: 308, y: G3.cy(2) + C / 2 - 6, class: 't-bad t-bold' }, dif, 'thin protrusion (2,5), (2,6)');
  s('text', { x: 308, y: G3.cy(2) + C / 2 + 10, class: 't-muted' }, dif, '1 pixel wide, B cannot fit');
  arrow(dif, 300, G3.cy(5) + C / 2, right + 6, G3.cy(5) + C / 2, { cls: 'a-bad' });
  s('text', { x: 308, y: G3.cy(5) + C / 2 - 6, class: 't-bad t-bold' }, dif, 'noise pixel (5,6)');
  s('text', { x: 308, y: G3.cy(5) + C / 2 + 10, class: 't-muted' }, dif, 'isolated, B cannot fit');
  arrow(dif, 300, G3.cy(4) - 6, 34 + 5 * C + 4, G3.cy(4) - 6, { cls: 'a-pri' });
  s('text', { x: 308, y: G3.cy(4) - 12, class: 't-pri t-bold' }, dif, '4x4 block kept');
  s('text', { x: 308, y: G3.cy(4) + 4, class: 't-muted' }, dif, 'rows 1-4, cols 1-4');
});

QV.register('s3-w2', function (q) {
  const { s, svg, grid, gray, steps, table } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const I = [
    [50, 52, 55, 58, 60],
    [51, 255, 57, 60, 62],
    [53, 56, 58, 0, 64],
    [54, 58, 61, 63, 255],
    [56, 60, 62, 65, 68],
  ];
  const idx = ['0', '1', '2', '3', '4'];
  const windowAt = (r, c) => [-1, 0, 1].flatMap(i => [-1, 0, 1].map(j => I[r + i][c + j]));
  const noisy = v => v === 0 || v === 255;
  const median = w => w.slice().sort((a, b) => a - b)[4];

  const giv = svg(viz('given'), 260, 262, { label: '5 by 5 image I with salt (255) and pepper (0) pixels, drawn as gray levels', minWidth: 240 });
  grid(giv, { x: 34, y: 50, data: I, cell: 40, fill: v => gray(v), rowLabels: idx, colLabels: idx, title: 'I' });

  // Figure 1: the two windows and their sorted values
  const PX = [
    { name: 'P1', r: 1, c: 1, cls: 'pri' },
    { name: 'P2', r: 2, c: 3, cls: 'sec' },
  ];
  const fig = svg(viz('win'), 800, 290, { label: 'The 3 by 3 windows at P1 and P2, and each window sorted with min, median and max marked', minWidth: 600 });
  const G = { x: 30, y: 52, cell: 36 };
  const img = grid(fig, { x: G.x, y: G.y, data: I, cell: G.cell, fill: v => gray(v), rowLabels: idx, colLabels: idx, title: 'I' });
  const S = { x: 262, cell: 52, h: 44, rows: [44, 166] };
  const layers = PX.map((p, pi) => {
    const g = s('g', { class: 'fade' }, fig);
    s('rect', { x: img.cx(p.c - 1), y: img.cy(p.r - 1), width: 3 * G.cell, height: 3 * G.cell, class: 'f-none ' + (pi ? 'outline-sec' : 'outline-pri') }, g);
    s('text', { x: G.x + pi * 112, y: G.y + 5 * G.cell + 24, class: 't-' + p.cls + ' t-bold' }, g, `${p.name} (${p.r},${p.c}) window`);
    const w = windowAt(p.r, p.c).sort((a, b) => a - b);
    const y = S.rows[pi];
    s('text', { x: S.x, y: y - 10, class: 't-' + p.cls + ' t-bold' }, g, `${p.name} = (${p.r},${p.c}), sorted window`);
    grid(g, { x: S.x, y, data: [w], cell: S.cell, fill: v => gray(v) });
    [[0, 'min'], [4, 'median'], [8, 'max']].forEach(([k, name]) => {
      const v = w[k], cx = S.x + k * S.cell + S.cell / 2, bad = noisy(v);
      s('rect', { x: S.x + k * S.cell + 2, y: y + 2, width: S.cell - 4, height: S.cell - 4, class: 'f-none ' + (bad ? 's-bad' : 's-ok') }, g);
      s('text', { x: cx, y: y + S.cell + 18, 'text-anchor': 'middle', class: bad ? 't-bad t-bold' : 't-ok t-bold' }, g, `${name} ${v}`);
      s('text', { x: cx, y: y + S.cell + 33, 'text-anchor': 'middle', class: 't-sm' }, g, `rank ${k + 1}`);
    });
    return g;
  });
  const rowsData = PX.map(p => {
    const w = windowAt(p.r, p.c), sw = w.slice().sort((a, b) => a - b);
    const mean = w.reduce((a, b) => a + b, 0) / 9;
    return [{ text: `${p.name} (${p.r},${p.c})`, cls: 'l' }, { text: sw.join(' '), cls: 'l' }, { text: String(median(w)), cls: 'hl' }, String(Math.max(...w)), String(Math.min(...w)), mean.toFixed(2)];
  });
  const tbl = table(viz('win-table'), [{ text: 'Pixel', cls: 'l' }, { text: 'Sorted window', cls: 'l' }, 'Median', 'Max', 'Min', '3x3 mean'], rowsData);
  const NOTES = [
    'Both windows. Noise sorts to the ends: 255 is always rank 9 and 0 is rank 1. The median at rank 5 is a clean value in both.',
    'P1 has one salt pixel, the 255 at the centre. Min (50) and the median (55) remove it. Max returns the 255.',
    'P2 has pepper at the centre and salt at (3,4). Min returns the 0 and max returns the 255. Only the median, 61, is clean.',
  ];
  steps(viz('win-steps'), ['Both', 'P1', 'P2'], k => {
    layers.forEach((g, i) => g.classList.toggle('dim', k > 0 && i !== k - 1));
    tbl.rows.forEach((r, i) => r.classList.toggle('on', i === k - 1));
    role('win-note').textContent = NOTES[k];
  });

  // Figure 2: the filters over the interior 3x3
  const all = svg(viz('all'), 720, 244, { label: 'Median, max and min filter outputs at the nine interior pixels of I', minWidth: 560 });
  const gi = grid(all, { x: 30, y: 52, data: I, cell: 30, fill: v => gray(v), rowLabels: idx, colLabels: idx, title: 'I' });
  s('rect', { x: gi.cx(1), y: gi.cy(1), width: 90, height: 90, class: 'f-none s-fg dash' }, all);
  s('text', { x: 30, y: 52 + 150 + 20, class: 't-sm' }, all, 'interior dashed');
  const FILTERS = [
    ['Median', median, 'clean everywhere', 'removes both'],
    ['Max', w => Math.max(...w), '6 outputs are 255', 'salt spreads'],
    ['Min', w => Math.min(...w), '6 outputs are 0', 'pepper spreads'],
  ];
  FILTERS.forEach(([name, f, line1, line2], fi) => {
    const x0 = 236 + fi * 166;
    const out = [1, 2, 3].map(r => [1, 2, 3].map(c => f(windowAt(r, c))));
    const g = grid(all, { x: x0, y: 52, data: out, cell: 40, fill: v => gray(v), rowLabels: ['1', '2', '3'], colLabels: ['1', '2', '3'], title: name });
    out.forEach((row, r) => row.forEach((v, c) => {
      if (noisy(v)) s('rect', { x: g.cx(c) + 3, y: g.cy(r) + 3, width: 34, height: 34, class: 'f-none s-bad', style: 'stroke-width: 2' }, all);
    }));
    const bad = fi > 0;
    s('text', { x: x0, y: 52 + 120 + 22, class: (bad ? 't-bad' : 't-ok') + ' t-bold' }, all, line1);
    s('text', { x: x0, y: 52 + 120 + 38 }, all, line2);
  });
});

QV.register('s3-w3', function (q) {
  const { s, h, svg, axes, line, steps, table, mat } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const A = [[1, 2, 2, 3], [2, 3, 4, 5], [2, 3, 4, 4], [1, 2, 3, 5]];
  const L = [0, 1, 2, 3, 4, 5, 6, 7];
  const nr = L.map(k => A.flat().filter(v => v === k).length);
  const cumsum = a => a.map((_, i) => a.slice(0, i + 1).reduce((x, y) => x + y, 0));
  const cr = cumsum(nr), T = cr.map(c => c * 7 / 16), sR = T.map(t => Math.floor(t + 0.5));
  const nz = [0, 0, 0, 3, 4, 5, 2, 2];
  const cz = cumsum(nz), G = cz.map(c => c * 7 / 16);
  const inv = L.map(sv => L.reduce((best, z) => (Math.abs(G[z] - sv) < Math.abs(G[best] - sv) ? z : best), 0));
  const lut = L.map(r => inv[sR[r]]);
  const out = A.map(row => row.map(v => lut[v]));
  const nOut = L.map(k => out.flat().filter(v => v === k).length);
  const f4 = v => String(Number(v.toFixed(4)));

  const gHost = viz('given');
  mat(h('div', {}, gHost), A, { caption: 'A, 4x4, L = 8' });
  const gd = h('div', {}, gHost);
  table(gd, [{ text: 'z', cls: 'l' }, ...L.map(String)], [[{ text: 'desired count n_z', cls: 'l' }, ...nz.map(String)]]);

  table(viz('t-table'), ['r', 'n_r', 'cumulative', 'cum × 7/16', 's = T(r)'], L.map(r => [String(r), String(nr[r]), String(cr[r]), f4(T[r]), { text: String(sR[r]), cls: 'hl' }]));
  table(viz('g-table'), ['z', 'n_z', 'cumulative', 'G(z) = cum × 7/16'], L.map(z => [String(z), String(nz[z]), String(cz[z]), { text: f4(G[z]), cls: 'hl' }]));
  table(viz('inv-table'), [{ text: 's', cls: 'l' }, ...L.map(String)], [
    [{ text: 'closest G(z)', cls: 'l' }, ...L.map(sv => f4(G[inv[sv]]))],
    [{ text: 'z = G⁻¹(s)', cls: 'l' }, ...L.map(sv => ({ text: String(inv[sv]), cls: 'hl' }))],
  ]);

  const levelAxes = (g, x, yd, yt, yl, xl) => axes(g, { x, y: 26, w: 300, h: 170, xd: [-0.5, 7.5], yd, xt: L, yt, xl, yl });

  // Figure 1: histogram of A and T(r)
  const tc = svg(viz('t-chart'), 760, 250, { label: 'Histogram of A and the equalization mapping T(r)', minWidth: 600 });
  const ax1 = levelAxes(tc, 46, [0, 6], [0, 1, 2, 3, 4, 5, 6], 'count n_r', 'r');
  const ax2 = levelAxes(tc, 430, [0, 7.5], L, 's = T(r)', 'r');
  const bars = L.map(r => {
    const b = s('rect', { x: ax1.x(r - 0.35), y: ax1.y(nr[r]), width: ax1.x(0.7) - ax1.x(0), height: ax1.y(0) - ax1.y(nr[r]), class: 'f-pri' }, tc);
    if (nr[r]) s('text', { x: ax1.x(r), y: ax1.y(nr[r]) - 6, 'text-anchor': 'middle', class: 't-fg' }, tc, String(nr[r]));
    return b;
  });
  line(tc, L.map(r => [ax2.x(r), ax2.y(T[r])]), 's-muted');
  const tPts = L.map(r => {
    const g = s('g', { class: 'fade' }, tc);
    s('circle', { cx: ax2.x(r), cy: ax2.y(T[r]), r: 5, class: 'f-surface s-muted' }, g);
    s('circle', { cx: ax2.x(r), cy: ax2.y(sR[r]), r: 4, class: 'f-pri' }, g);
    if (r >= 1 && r <= 5) s('text', { x: ax2.x(r) - 9, y: ax2.y(sR[r]) - 7, 'text-anchor': 'end', class: 't-pri t-bold' }, g, 's=' + sR[r]);
    return g;
  });
  steps(viz('t-steps'), ['All', 'r = 1', 'r = 2', 'r = 3', 'r = 4', 'r = 5'], k => {
    bars.forEach((b, r) => b.setAttribute('class', !k || r <= k ? 'f-pri' : 'f-pri-soft'));
    tPts.forEach((g, r) => g.classList.toggle('dim', k > 0 && r !== k));
    if (!k) {
      role('t-note').textContent = 'T rises fastest where the histogram is tall. The 5 pixels at r = 2 move s from 1 to 3. Pick r to see the running sum.';
    } else {
      const parts = nr.slice(0, k + 1).filter(n => n).join(' + ');
      role('t-note').textContent = `r = ${k}: cumulative ${parts} = ${cr[k]}. ${cr[k]} × 7/16 = ${f4(T[k])}, rounded s = ${sR[k]}.`;
    }
  });

  // Figure 2: desired histogram and G(z)
  const gc = svg(viz('g-chart'), 760, 250, { label: 'Desired histogram and its equalization G(z)', minWidth: 600 });
  const bx1 = levelAxes(gc, 46, [0, 6], [0, 1, 2, 3, 4, 5, 6], 'desired count n_z', 'z');
  const bx2 = levelAxes(gc, 430, [0, 7.5], L, 'G(z)', 'z');
  L.forEach(z => {
    if (!nz[z]) return;
    s('rect', { x: bx1.x(z - 0.35), y: bx1.y(nz[z]), width: bx1.x(0.7) - bx1.x(0), height: bx1.y(0) - bx1.y(nz[z]), class: 'f-sec' }, gc);
    s('text', { x: bx1.x(z), y: bx1.y(nz[z]) - 6, 'text-anchor': 'middle', class: 't-fg' }, gc, String(nz[z]));
  });
  line(gc, L.map(z => [bx2.x(z), bx2.y(G[z])]), 's-sec');
  L.forEach(z => {
    s('circle', { cx: bx2.x(z), cy: bx2.y(G[z]), r: 4.5, class: 'f-sec' }, gc);
    if (z >= 3) s('text', { x: bx2.x(z) - 8, y: bx2.y(G[z]) - 6, 'text-anchor': 'end', class: 't-sec t-bold halo' }, gc, f4(G[z]));
  });
  s('text', { x: bx2.x(1), y: bx2.y(0) - 10, 'text-anchor': 'middle', class: 't-sec' }, gc, 'G = 0');

  // Figure 3: r → s → z
  const mp = svg(viz('map'), 800, 270, { label: 'Mapping each input level r through T(r) and the inverse of G(z) to an output level z', minWidth: 620 });
  const mx1 = axes(mp, { x: 46, y: 26, w: 300, h: 190, xd: [-0.5, 7.5], yd: [0, 7.5], xt: L, yt: L, xl: 'r (input level)', yl: 's = T(r)' });
  const mx2 = axes(mp, { x: 470, y: 26, w: 300, h: 190, xd: [-0.5, 7.5], yd: [0, 7.5], xt: L, yt: L, xl: 'z (output level)', yl: 'G(z)' });
  L.forEach(r => s('circle', { cx: mx1.x(r), cy: mx1.y(sR[r]), r: 4.5, class: 'f-pri' }, mp));
  line(mp, L.map(z => [mx2.x(z), mx2.y(G[z])]), 's-sec');
  L.forEach(z => s('circle', { cx: mx2.x(z), cy: mx2.y(G[z]), r: 4.5, class: 'f-sec' }, mp));
  const links = [1, 2, 3, 4, 5].map(r => {
    const g = s('g', { class: 'fade' }, mp);
    const sv = sR[r], z = lut[r], ys = mx1.y(sv);
    line(g, [[mx1.x(r), ys], [mx2.box.x - 26, ys]], 's-pri dash').setAttribute('style', 'stroke-width: 1.5');
    line(g, [[mx2.box.x, ys], [mx2.x(z), ys]], 's-pri dash').setAttribute('style', 'stroke-width: 1.5');
    line(g, [[mx2.x(z), mx2.y(G[z])], [mx2.x(z), mx2.y(0)]], 's-ok dash').setAttribute('style', 'stroke-width: 1.5');
    s('circle', { cx: mx2.x(z), cy: mx2.y(G[z]), r: 7, class: 'f-none s-ok' }, g);
    s('circle', { cx: mx1.x(r), cy: ys, r: 7, class: 'f-none s-pri' }, g);
    const lab = s('g', { class: 'lab' }, g);
    s('text', { x: mx1.x(r) + 10, y: ys - 8, class: 't-pri t-bold halo' }, lab, `T(${r}) = ${sv}`);
    s('text', { x: mx2.x(z) - 10, y: mx2.y(G[z]) + 16, 'text-anchor': 'end', class: 't-ok t-bold halo' }, lab, `z = ${z}`);
    return { g, lab };
  });
  const lutTbl = table(viz('lut-table'), [{ text: 'r', cls: 'l' }, '1', '2', '3', '4', '5'], [
    [{ text: 's = T(r)', cls: 'l' }, ...[1, 2, 3, 4, 5].map(r => String(sR[r]))],
    [{ text: 'z = G⁻¹(T(r))', cls: 'l' }, ...[1, 2, 3, 4, 5].map(r => String(lut[r]))],
  ]);
  const MAPN = {
    1: 's = T(1) = 1. G(3) = 1.3125 is 0.3125 away and G(0..2) = 0 is 1 away, so z = 3.',
    2: 's = T(2) = 3. G(4) = 3.0625 is 0.0625 away, the closest, so z = 4.',
    3: 's = T(3) = 5. G(5) = 5.25 is 0.25 away and G(4) = 3.0625 is 1.9375 away, so z = 5.',
    4: 's = T(4) = 6. G(6) = 6.125 is 0.125 away, so z = 6.',
    5: 's = T(5) = 7. G(7) = 7 matches exactly, so z = 7.',
  };
  steps(viz('map-steps'), ['All', 'r = 1', 'r = 2', 'r = 3', 'r = 4', 'r = 5'], k => {
    links.forEach((l, i) => {
      l.g.classList.toggle('dim', k > 0 && i !== k - 1);
      l.lab.style.display = k && i === k - 1 ? '' : 'none';
    });
    lutTbl.rows.forEach(tr => [...tr.children].forEach((td, j) => {
      if (j) td.className = j === k ? 'hl' : '';
    }));
    role('map-note').textContent = k ? `r = ${k}: ${MAPN[k]}` : 'All five used levels. Each dashed line leaves T at height s and stops at the G(z) closest to that height. Pick r to follow one.';
  });

  // Figure 4: output image and histogram
  const oh = viz('out-imgs');
  mat(h('div', {}, oh), A, { caption: 'A (input r)' });
  mat(h('div', {}, oh), out, { caption: 'output z = LUT(r)', hl: () => 'hl' });
  const oc = svg(viz('out-chart'), 620, 240, { label: 'Output histogram against the desired histogram', minWidth: 500 });
  const ox = axes(oc, { x: 46, y: 26, w: 540, h: 160, xd: [-0.5, 7.5], yd: [0, 6], xt: L, yt: [0, 1, 2, 3, 4, 5, 6], xl: 'z', yl: 'count' });
  const bw = ox.x(0.36) - ox.x(0);
  L.forEach(z => {
    if (nz[z]) {
      s('rect', { x: ox.x(z) - bw - 1, y: ox.y(nz[z]), width: bw, height: ox.y(0) - ox.y(nz[z]), class: 'f-sec-soft' }, oc);
      s('text', { x: ox.x(z) - bw / 2 - 1, y: ox.y(nz[z]) - 6, 'text-anchor': 'middle', class: 't-sec' }, oc, String(nz[z]));
    }
    if (nOut[z]) {
      s('rect', { x: ox.x(z) + 1, y: ox.y(nOut[z]), width: bw, height: ox.y(0) - ox.y(nOut[z]), class: 'f-pri' }, oc);
      s('text', { x: ox.x(z) + bw / 2 + 1, y: ox.y(nOut[z]) - 6, 'text-anchor': 'middle', class: 't-pri t-bold' }, oc, String(nOut[z]));
    }
  });
});

QV.register('s3-w4', function (q) {
  const { s, svg, axes, box, arrow, line, steps, table } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  table(viz('given'), [{ text: 'Class', cls: 'l' }, { text: 'Samples [lightness, width]', cls: 'l' }], [
    [{ text: 'Salmon', cls: 'l' }, { text: '[3, 15], [4, 17], [5, 16]', cls: 'l' }],
    [{ text: 'Sea bass', cls: 'l' }, { text: '[7, 20], [9, 21], [8, 22]', cls: 'l' }],
  ]);

  // Figure 1: flow chart, bottom to top
  const fl = svg(viz('flow'), 640, 520, { label: 'Pattern recognition system: input, sensing, segmentation, feature extraction, classification, post-processing, decision, with side inputs', minWidth: 500 });
  const B = { x: 60, w: 240, h: 44 };
  const STAGES = ['sensing', 'segmentation', 'feature extraction', 'classification', 'post-processing'];
  const ys = [404, 326, 248, 170, 92];
  const boxes = STAGES.map((name, i) => {
    const g = s('g', {}, fl);
    const r = box(g, B.x, ys[i], B.w, B.h, name, { cls: 'f-pri-soft', textCls: 't-fg t-bold' });
    return { g, r, t: g.querySelector('text') };
  });
  s('text', { x: B.x + B.w / 2, y: 506, 'text-anchor': 'middle', class: 't-fg t-bold' }, fl, 'input');
  arrow(fl, B.x + B.w / 2, 492, B.x + B.w / 2, ys[0] + B.h + 2, { cls: 'a-pri', width: 2 });
  arrow(fl, B.x + B.w / 2, ys[4], B.x + B.w / 2, 42, { cls: 'a-pri', width: 2 });
  s('text', { x: B.x + B.w / 2, y: 30, 'text-anchor': 'middle', class: 't-fg t-bold' }, fl, 'decision');
  for (let i = 0; i < 4; i++) {
    arrow(fl, B.x + 80, ys[i], B.x + 80, ys[i + 1] + B.h + 1, { cls: 'a-pri', width: 2 });
    arrow(fl, B.x + 160, ys[i + 1] + B.h, B.x + 160, ys[i] - 1, { cls: 'a-muted', dash: true });
  }
  const R = B.x + B.w, SX = 450;
  arrow(fl, SX, ys[4] + 12, R + 1, ys[4] + 12, { cls: 'a-sec' });
  s('text', { x: SX + 8, y: ys[4] + 12, dy: '0.35em', class: 't-sec t-bold' }, fl, 'costs');
  const ctxY = (ys[4] + B.h + ys[3]) / 2 + 4;
  line(fl, [[SX, ctxY], [370, ctxY]], 's-sec').setAttribute('style', 'stroke-width: 1.5');
  line(fl, [[370, ys[4] + 32], [370, ys[3] + 12]], 's-sec').setAttribute('style', 'stroke-width: 1.5');
  arrow(fl, 370, ys[4] + 32, R + 1, ys[4] + 32, { cls: 'a-sec' });
  arrow(fl, 370, ys[3] + 12, R + 1, ys[3] + 12, { cls: 'a-sec' });
  s('text', { x: SX + 8, y: ctxY - 7, dy: '0.35em', class: 't-sec t-bold' }, fl, 'adjustments for');
  s('text', { x: SX + 8, y: ctxY + 7, dy: '0.35em', class: 't-sec t-bold' }, fl, 'context');
  arrow(fl, SX, ys[3] + 32, R + 1, ys[3] + 32, { cls: 'a-sec' });
  s('text', { x: SX + 8, y: ys[3] + 32 - 7, dy: '0.35em', class: 't-sec t-bold' }, fl, 'adjustments for');
  s('text', { x: SX + 8, y: ys[3] + 32 + 7, dy: '0.35em', class: 't-sec t-bold' }, fl, 'missing features');
  const FN = [
    'Read bottom to top: input → sensing → segmentation → feature extraction → classification → post-processing → decision. Side inputs enter at the top two stages.',
    'Sensing: "Use of a transducer (camera or microphone)". For the fish, a camera above the conveyor.',
    'Segmentation (and grouping): "Patterns should be well separated and should not overlap". Each fish is cut out from the background and from the other fish.',
    'Feature extraction: "Discriminative features"; "Invariant features with respect to translation, rotation and scale". For the fish, lightness and width.',
    'Classification: "Use a feature vector provided by a feature extractor to assign the object to a category". Side inputs: adjustments for context and for missing features.',
    'Post-processing: "Exploit context input dependent information other than from the target pattern itself to improve performance". Side inputs: costs and adjustments for context.',
  ];
  steps(viz('flow-steps'), ['All', 'Sensing', 'Segmentation', 'Features', 'Classification', 'Post-processing'], k => {
    boxes.forEach((b, i) => {
      const on = k === i + 1;
      b.r.setAttribute('class', (on ? 'f-pri' : 'f-pri-soft') + ' box');
      b.t.setAttribute('class', on ? 't-on t-bold' : 't-fg t-bold');
    });
    role('flow-note').textContent = FN[k];
  });

  // Figure 2: feature space and distance bars
  const nn = svg(viz('nn'), 780, 400, { label: 'Fish feature space: samples, class means, reject circles of radius 4, and the distances of x1 and x2 to each mean', minWidth: 600 });
  const ax = axes(nn, { x: 50, y: 24, w: 280, h: 320, xd: [0, 14], yd: [10, 26], xt: [0, 2, 4, 6, 8, 10, 12, 14], yt: [10, 12, 14, 16, 18, 20, 22, 24, 26], xl: 'lightness', yl: 'width' });
  const u = ax.x(1) - ax.x(0);
  const SAL = [[3, 15], [4, 17], [5, 16]], SEA = [[7, 20], [9, 21], [8, 22]];
  const MS = [4, 16], MB = [8, 21];
  const X1 = [6, 18], X2 = [11, 15];
  const P = ([a, b]) => [ax.x(a), ax.y(b)];
  [[MS, 's-pri'], [MB, 's-sec']].forEach(([m, cls]) => s('circle', { cx: ax.x(m[0]), cy: ax.y(m[1]), r: 4 * u, class: cls + ' dash', style: 'stroke-width: 1.5' }, nn));
  const meanLayer = s('g', { class: 'fade' }, nn);
  [[SAL, MS, 's-pri'], [SEA, MB, 's-sec']].forEach(([pts, m, cls]) => pts.forEach(p => line(meanLayer, [P(p), P(m)], cls).setAttribute('style', 'stroke-width: 1; opacity: 0.5')));
  SAL.forEach(p => s('circle', { cx: P(p)[0], cy: P(p)[1], r: 4, class: 'f-pri' }, nn));
  SEA.forEach(p => s('circle', { cx: P(p)[0], cy: P(p)[1], r: 4, class: 'f-sec' }, nn));
  const diamond = (m, cls) => {
    const [x, y] = P(m);
    s('polygon', { points: `${x},${y - 8} ${x + 8},${y} ${x},${y + 8} ${x - 8},${y}`, class: cls + ' sep' }, nn);
  };
  diamond(MS, 'f-pri');
  diamond(MB, 'f-sec');
  s('text', { x: ax.x(MS[0]), y: ax.y(MS[1]) + 46, 'text-anchor': 'middle', class: 't-pri t-bold halo' }, nn, 'salmon mean [4, 16]');
  s('text', { x: ax.x(MB[0]), y: ax.y(25) - 7, 'text-anchor': 'middle', class: 't-sec t-bold halo' }, nn, 'sea bass mean [8, 21]');
  const xLayers = [[X1, 'x1'], [X2, 'x2']].map(([x, name]) => {
    const g = s('g', { class: 'fade' }, nn);
    const dS = Math.hypot(x[0] - MS[0], x[1] - MS[1]), dB = Math.hypot(x[0] - MB[0], x[1] - MB[1]);
    line(g, [P(x), P(MS)], 's-pri' + (dS < dB ? '' : ' dash')).setAttribute('style', 'stroke-width: 1.5');
    line(g, [P(x), P(MB)], 's-sec' + (dB < dS ? '' : ' dash')).setAttribute('style', 'stroke-width: 1.5');
    s('circle', { cx: P(x)[0], cy: P(x)[1], r: 6, class: 'f-ter sep' }, g);
    s('text', { x: P(x)[0] + 9, y: P(x)[1] + 16, class: 't-ter t-bold halo' }, g, name);
    return { g, dS, dB };
  });

  const bx = axes(nn, { x: 450, y: 24, w: 300, h: 290, xd: [0, 2.6], yd: [0, 8], yt: [0, 2, 4, 6, 8], yl: 'Euclidean distance' });
  line(nn, [[bx.x(0), bx.y(4)], [bx.x(2.6), bx.y(4)]], 's-bad dash').setAttribute('style', 'stroke-width: 1.5');
  s('text', { x: bx.x(2.58), y: bx.y(4) - 22, 'text-anchor': 'end', class: 't-bad t-bold' }, nn, 'reject');
  s('text', { x: bx.x(2.58), y: bx.y(4) - 8, 'text-anchor': 'end', class: 't-bad t-bold' }, nn, 'above 4');
  const barLayers = xLayers.map((xl, i) => {
    const g = s('g', { class: 'fade' }, nn);
    const c = 0.5 + i;
    [[xl.dS, 'f-pri', -1], [xl.dB, 'f-sec', 1]].forEach(([d, fcls, side]) => {
      const x0 = side < 0 ? bx.x(c - 0.36) : bx.x(c + 0.04);
      const w = bx.x(0.32) - bx.x(0);
      s('rect', { x: x0, y: bx.y(d), width: w, height: bx.y(0) - bx.y(d), class: fcls }, g);
      s('text', { x: x0 + w / 2, y: bx.y(d) + 14, 'text-anchor': 'middle', class: 't-on t-bold' }, g, d.toFixed(2));
    });
    s('text', { x: bx.x(c), y: bx.y(0) + 18, 'text-anchor': 'middle', class: 't-ter t-bold' }, g, i ? 'x2 = [11, 15]' : 'x1 = [6, 18]');
    s('text', { x: bx.x(c), y: bx.y(0) + 34, 'text-anchor': 'middle', class: (i ? 't-bad' : 't-ok') + ' t-bold' }, g, i ? 'reject' : 'salmon');
    return g;
  });
  const NN = [
    'Both fish. x1 is nearest the salmon mean and inside its circle. x2 is nearest the sea bass mean but outside every circle, so it is rejected.',
    'Class means: salmon [(3+4+5)/3, (15+17+16)/3] = [4, 16]; sea bass [(7+9+8)/3, (20+21+22)/3] = [8, 21].',
    'x1 = [6, 18]: d(salmon) = √(2² + 2²) = √8 = 2.83, d(sea bass) = √(2² + 3²) = √13 = 3.61. Nearest is salmon and 2.83 ≤ 4, so salmon.',
    'x2 = [11, 15]: d(salmon) = √(7² + 1²) = √50 = 7.07, d(sea bass) = √(3² + 6²) = √45 = 6.71. Nearest is sea bass, but 6.71 > 4, so reject class.',
  ];
  steps(viz('nn-steps'), ['All', 'Means', 'x1', 'x2'], k => {
    meanLayer.classList.toggle('dim', k > 1);
    xLayers.forEach((l, i) => l.g.classList.toggle('dim', k === 1 || (k > 1 && i !== k - 2)));
    barLayers.forEach((g, i) => g.classList.toggle('dim', k === 1 || (k > 1 && i !== k - 2)));
    role('nn-note').textContent = NN[k];
  });
});

QV.register('s3-w5', function (q) {
  const { s, svg, grid, steps, table, line } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  table(viz('given'), [{ text: 'Symbol', cls: 'l' }, 'A', 'B', 'C', '$'], [
    [{ text: 'Probability', cls: 'l' }, '0.4', '0.3', '0.2', '0.1'],
    [{ text: 'Range', cls: 'l' }, '[0, 0.4)', '[0.4, 0.7)', '[0.7, 0.9)', '[0.9, 1.0)'],
  ]);

  // Figure 1: lossless against lossy on one row of values
  const ORIG = [52, 55, 61, 66, 70, 61, 64, 73];
  const LOSSY = ORIG.map(v => Math.round(v / 10) * 10);
  const ls = svg(viz('loss'), 720, 206, { label: 'Eight pixel values, the lossless decode and the lossy decode with its error', minWidth: 560 });
  const LX = 124, CW = 50;
  const rowAt = (y, data, name, nameCls, cellCls, mark) => {
    s('text', { x: 0, y: y + 20, dy: '0.35em', class: nameCls + ' t-bold' }, ls, name);
    const g = grid(ls, { x: LX, y, data: [data], cell: 40, gap: 10, fill: () => cellCls, textCls: () => 't-fg' });
    if (mark) data.forEach((v, i) => {
      if (v !== ORIG[i]) s('rect', { x: g.cx(i) + 2, y: y + 2, width: 36, height: 36, class: 'f-none s-bad', style: 'stroke-width: 2' }, ls);
    });
  };
  rowAt(8, ORIG, 'original', 't-fg', 'f-seg');
  rowAt(64, ORIG, 'lossless', 't-ok', 'f-ok-soft');
  rowAt(120, LOSSY, 'lossy', 't-sec', 'f-sec-soft', true);
  s('text', { x: 0, y: 186, dy: '0.35em', class: 't-muted' }, ls, 'error');
  ORIG.forEach((v, i) => {
    const e = LOSSY[i] - v;
    s('text', { x: LX + i * CW + 20, y: 186, dy: '0.35em', 'text-anchor': 'middle', class: e ? 't-bad t-bold' : 't-muted' }, ls, e > 0 ? '+' + e : e < 0 ? '−' + (-e) : '0');
  });
  s('text', { x: LX + 8 * CW + 6, y: 84, dy: '0.35em', class: 't-ok t-bold' }, ls, 'identical');
  s('text', { x: LX + 8 * CW + 6, y: 100, dy: '0.35em', class: 't-muted' }, ls, 'PNG, FLAC');
  s('text', { x: LX + 8 * CW + 6, y: 140, dy: '0.35em', class: 't-sec t-bold' }, ls, 'approximation');
  s('text', { x: LX + 8 * CW + 6, y: 156, dy: '0.35em', class: 't-muted' }, ls, 'JPEG, MP3');
  s('text', { x: LX + 8 * CW + 6, y: 186, dy: '0.35em', class: 't-bad' }, ls, 'lost for good');

  // Figure 2: interval ladder for BAB$
  const SYMS = [['A', 0, 0.4], ['B', 0.4, 0.7], ['C', 0.7, 0.9], ['$', 0.9, 1]];
  const RNG = {};
  SYMS.forEach(([k, a, b]) => { RNG[k] = [a, b]; });
  const MSG = ['B', 'A', 'B', '$'];
  const LOWS = ['0', '0.4', '0.4', '0.448', '0.4804'];
  const HIGHS = ['1', '0.7', '0.52', '0.484', '0.484'];
  const RANGES = ['1', '0.3', '0.12', '0.036', '0.0036'];
  const PROB = { A: '0.4', B: '0.3', $: '0.1' };
  const ld = svg(viz('ladder'), 820, 362, { label: 'Interval ladder for BAB$: each column zooms into the chosen symbol slice', minWidth: 640 });
  const Lg = { top: 52, bot: 322, x0: 50, dx: 148, cw: 40 };
  const ys = f => Lg.bot - f * (Lg.bot - Lg.top);
  const cols = [], fans = [];
  for (let i = 0; i < 5; i++) {
    const x = Lg.x0 + i * Lg.dx;
    if (i < 4) {
      const [r0, r1] = RNG[MSG[i]];
      const fg = s('g', { class: 'fade' }, ld);
      s('polygon', { points: `${x + Lg.cw},${ys(r1)} ${x + Lg.cw},${ys(r0)} ${x + Lg.dx},${Lg.bot} ${x + Lg.dx},${Lg.top}`, class: 'area-pri' }, fg);
      fans.push(fg);
    }
    const g = s('g', { class: 'fade' }, ld);
    cols.push(g);
    s('text', { x: x + Lg.cw / 2, y: 16, 'text-anchor': 'middle', class: 't-fg t-bold' }, g, i === 0 ? 'start' : 'after ' + MSG.slice(0, i).join(''));
    s('text', { x: x + Lg.cw / 2, y: Lg.top - 10, 'text-anchor': 'middle' }, g, HIGHS[i]);
    s('text', { x: x + Lg.cw / 2, y: Lg.bot + 17, 'text-anchor': 'middle' }, g, LOWS[i]);
    if (i < 4) {
      SYMS.forEach(([sym, r0, r1]) => {
        const on = sym === MSG[i];
        s('rect', { x, y: ys(r1), width: Lg.cw, height: ys(r0) - ys(r1), class: (on ? 'f-pri' : 'f-seg') + ' sep' }, g);
        s('text', { x: x + Lg.cw / 2, y: (ys(r0) + ys(r1)) / 2, dy: '0.35em', 'text-anchor': 'middle', class: on ? 't-on t-bold' : 't-fg' }, g, sym);
      });
      s('text', { x: x + Lg.cw / 2, y: Lg.bot + 35, 'text-anchor': 'middle', class: 't-pri t-bold' }, g, 'next: ' + MSG[i]);
    } else {
      s('rect', { x, y: Lg.top, width: Lg.cw, height: Lg.bot - Lg.top, class: 'f-pri-soft outline-pri' }, g);
      const f = (0.48046875 - 0.4804) / 0.0036;
      s('line', { x1: x - 4, x2: x + Lg.cw + 10, y1: ys(f), y2: ys(f), class: 's-fg', style: 'stroke-width: 2' }, g);
      s('text', { x: x + Lg.cw + 14, y: ys(f) - 6, class: 't-fg t-bold' }, g, 'code 0.48046875');
      s('text', { x: x + Lg.cw + 14, y: ys(f) + 10, class: 't-fg' }, g, '= 0.01111011₂');
      s('text', { x: x + Lg.cw / 2, y: Lg.bot + 35, 'text-anchor': 'middle', class: 't-pri t-bold' }, g, 'width 0.0036');
    }
  }
  const lt = table(viz('ladder-table'), [{ text: 'Step', cls: 'l' }, { text: 'Symbol', cls: 'l' }, { text: 'low', cls: 'l' }, { text: 'high', cls: 'l' }, 'range'], [
    ['0', 'start', '0', '1', '1'],
    ['1', 'B', '0 + 1(0.4) = 0.4', '0 + 1(0.7) = 0.7', '0.3'],
    ['2', 'A', '0.4 + 0.3(0) = 0.4', '0.4 + 0.3(0.4) = 0.52', '0.12'],
    ['3', 'B', '0.4 + 0.12(0.4) = 0.448', '0.4 + 0.12(0.7) = 0.484', '0.036'],
    ['4', '$', '0.448 + 0.036(0.9) = 0.4804', '0.448 + 0.036(1.0) = 0.484', '0.0036'],
  ].map((r, ri) => r.map((c, i) => (i < 4 ? { text: c, cls: 'l' + (ri === 4 && i > 1 ? ' hl' : '') } : { text: c, cls: ri === 4 ? 'hl' : '' }))));
  steps(viz('ladder-steps'), ['All', '1 · B', '2 · A', '3 · B', '4 · $'], k => {
    cols.forEach((g, i) => g.classList.toggle('dim', k > 0 && i !== k - 1 && i !== k));
    fans.forEach((g, i) => g.classList.toggle('dim', k > 0 && i !== k - 1));
    lt.rows.forEach((r, i) => r.classList.toggle('on', k > 0 && i === k));
    if (!k) {
      role('ladder-note').textContent = 'All four steps. The range goes 1 → 0.3 → 0.12 → 0.036 → 0.0036, multiplied each time by the probability of the symbol. Pick a step to follow it.';
    } else {
      const sym = MSG[k - 1];
      role('ladder-note').textContent = `Step ${k}, ${sym}: inside [${LOWS[k - 1]}, ${HIGHS[k - 1]}) take ${sym}'s slice [${RNG[sym][0]}, ${RNG[sym][1]}), giving [${LOWS[k]}, ${HIGHS[k]}). Width ${RANGES[k - 1]} × ${PROB[sym]} = ${RANGES[k]}.`;
    }
  });

  // Figure 3: codeword search, full line and zoom
  const LOW = 0.4804, HIGH = 0.484;
  const TRIES = [];
  let val = 0, code = '0.';
  for (let k = 1; val < LOW; k++) {
    const t = val + Math.pow(2, -k);
    const ok = t <= HIGH;
    if (ok) val = t;
    code += ok ? '1' : '0';
    TRIES.push({ k, t, ok, val, code, bin: code.slice(0, -1) + '1' });
  }
  const cd = svg(viz('code'), 800, 262, { label: 'Number line from 0 to 1 and a zoom near the final interval, with each tried binary fraction', minWidth: 620 });
  const T1 = { x0: 40, x1: 760, y: 70 }, T2 = { x0: 40, x1: 760, y: 196, a: 0.465, b: 0.49 };
  const X1 = v => T1.x0 + v * (T1.x1 - T1.x0);
  const X2 = v => T2.x0 + (v - T2.a) / (T2.b - T2.a) * (T2.x1 - T2.x0);
  s('line', { x1: T1.x0, x2: T1.x1, y1: T1.y, y2: T1.y, class: 'l-axis' }, cd);
  [0, 0.25, 0.5, 0.75, 1].forEach(v => {
    s('line', { x1: X1(v), x2: X1(v), y1: T1.y, y2: T1.y + 5, class: 'l-axis' }, cd);
    s('text', { x: X1(v), y: T1.y + 18, 'text-anchor': 'middle' }, cd, String(v));
  });
  s('line', { x1: T2.x0, x2: T2.x1, y1: T2.y, y2: T2.y, class: 'l-axis' }, cd);
  [0.465, 0.47, 0.475, 0.48, 0.485, 0.49].forEach(v => {
    s('line', { x1: X2(v), x2: X2(v), y1: T2.y, y2: T2.y + 5, class: 'l-axis' }, cd);
    s('text', { x: X2(v), y: T2.y + 18, 'text-anchor': 'middle' }, cd, String(v));
  });
  s('rect', { x: X1(LOW), y: T1.y - 9, width: Math.max(3, X1(HIGH) - X1(LOW)), height: 18, class: 'f-ok' }, cd);
  s('rect', { x: X2(LOW), y: T2.y - 9, width: X2(HIGH) - X2(LOW), height: 18, class: 'f-ok-soft' }, cd);
  s('text', { x: X2(LOW), y: T2.y + 34, 'text-anchor': 'middle', class: 't-ok t-bold' }, cd, 'low 0.4804');
  s('text', { x: X2(HIGH), y: T2.y + 34, 'text-anchor': 'middle', class: 't-ok t-bold' }, cd, 'high 0.484');
  line(cd, [[X1(T2.a), T1.y + 24], [T2.x0, T2.y - 44]], 's-muted dash').setAttribute('style', 'stroke-width: 1');
  line(cd, [[X1(T2.b), T1.y + 24], [T2.x1, T2.y - 44]], 's-muted dash').setAttribute('style', 'stroke-width: 1');
  s('text', { x: (T2.x0 + T2.x1) / 2, y: T2.y - 52, 'text-anchor': 'middle', class: 't-muted' }, cd, 'zoom: 0.465 to 0.49');
  const marks = TRIES.map(tr => {
    const g = s('g', { class: 'fade' }, cd);
    const onTop = tr.k <= 5, onZoom = tr.k >= 5;
    const put = (x, y) => {
      s('line', { x1: x, x2: x, y1: y - 20, y2: y, class: tr.ok ? 's-pri' : 's-bad', style: 'stroke-width: 2' }, g);
      s('circle', { cx: x, cy: y - 20, r: 4, class: tr.ok ? 'f-pri' : 'f-bad' }, g);
      s('text', { x, y: y - 30, 'text-anchor': 'middle', class: (tr.ok ? 't-pri' : 't-bad') + ' t-bold' }, g, String(tr.k));
    };
    if (onTop) put(X1(tr.t), T1.y);
    if (onZoom) put(X2(tr.t), T2.y);
    return g;
  });
  s('text', { x: T1.x0, y: 16, class: 't-muted' }, cd, 'try k adds 2⁻ᵏ:');
  s('text', { x: T1.x0 + 120, y: 16, class: 't-pri t-bold' }, cd, 'kept, bit 1');
  s('text', { x: T1.x0 + 220, y: 16, class: 't-bad t-bold' }, cd, 'above high, bit 0');
  const ct = table(viz('code-table'), ['k', { text: 'try', cls: 'l' }, 'value', 'vs high', 'bit k', { text: 'code so far', cls: 'l' }, { text: 'value < low?', cls: 'l' }], TRIES.map(tr => [
    String(tr.k), { text: tr.bin, cls: 'l' }, String(tr.t), tr.ok ? 'ok' : '> high', { text: tr.ok ? '1' : '0', cls: 'hl' }, { text: tr.code, cls: 'l' },
    { text: tr.val < LOW ? 'yes' + (tr.ok ? '' : ' (' + tr.val + ')') : 'no, stop', cls: 'l' },
  ]));
  steps(viz('code-steps'), ['All', ...TRIES.map(tr => 'k=' + tr.k)], k => {
    marks.forEach((g, i) => g.classList.toggle('dim', k > 0 && i !== k - 1));
    ct.rows.forEach((r, i) => r.classList.toggle('on', i === k - 1));
    if (!k) {
      role('code-note').textContent = 'All eight tries. Bits 1 and 6 overshoot high and are set back to 0. After bit 8 the value 0.48046875 is ≥ low, so the codeword is 01111011, 8 bits.';
      return;
    }
    const tr = TRIES[k - 1];
    const prev = k > 1 ? TRIES[k - 2].val : 0;
    role('code-note').textContent = tr.ok
      ? `k = ${k}: try ${tr.bin}₂ = ${tr.t}. Not above high 0.484, so bit ${k} = 1. ${tr.val < LOW ? 'Still below low 0.4804, continue.' : 'Now ≥ low 0.4804, stop.'}`
      : `k = ${k}: try ${tr.bin}₂ = ${tr.t}. That is above high 0.484, so bit ${k} = 0 and the value stays ${prev}.`;
  });
});

QV.register('s3-w6', function (q) {
  const { s, svg, axes, line, box, arrow, steps, slider, table } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  table(viz('given'), [{ text: 'Sub-band', cls: 'l' }, '1', '2', '3'], [
    [{ text: 'SNR (dB)', cls: 'l' }, '28', '22', '35'],
    [{ text: 'SMR (dB)', cls: 'l' }, '12', '18', '20'],
  ]);

  // Figure 1: threshold in quiet plus a masking sketch around a 1 kHz tone
  const quiet = f => { const k = f / 1000; return 3.64 * Math.pow(k, -0.8) - 6.5 * Math.exp(-0.6 * (k - 3.3) * (k - 3.3)) + 1e-3 * Math.pow(k, 4); };
  const bark = f => 13 * Math.atan(0.00076 * f) + 3.5 * Math.atan(Math.pow(f / 7500, 2));
  const FM = 1000;
  const maskDb = (f, L) => {
    const dz = bark(f) - bark(FM);
    return dz < 0 ? L - 8 + 25 * dz : L - 8 - (20 - 0.15 * L) * dz;
  };
  const thr = (f, L) => 10 * Math.log10(Math.pow(10, quiet(f) / 10) + Math.pow(10, maskDb(f, L) / 10));
  const fm = svg(viz('fm'), 760, 320, { label: 'Hearing threshold against frequency, raised around a 1 kHz masking tone, with three 25 dB test tones', minWidth: 600 });
  const lg = Math.log10;
  const TK = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 16000];
  const ax = axes(fm, { x: 52, y: 24, w: 680, h: 240, xd: [lg(20), lg(16000)], yd: [-10, 90], xt: TK.map(lg), yt: [-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90], xf: v => { const f = Math.round(Math.pow(10, v)); return f >= 1000 ? f / 1000 + 'k' : String(f); }, xl: 'frequency (Hz, log scale)', yl: 'level (dB)' });
  const FS = [];
  for (let i = 0; i <= 240; i++) FS.push(Math.pow(10, lg(20) + (lg(16000) - lg(20)) * i / 240));
  const clampY = v => ax.y(Math.max(-10, Math.min(90, v)));
  const qPts = FS.map(f => [ax.x(lg(f)), clampY(quiet(f))]);
  s('path', { d: 'M' + qPts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + ` L${ax.x(lg(16000))} ${ax.y(-10)} L${ax.x(lg(20))} ${ax.y(-10)} Z`, class: 'f-seg' }, fm);
  line(fm, qPts, 's-muted');
  s('text', { x: ax.x(lg(60)), y: ax.y(46), class: 't-muted halo' }, fm, 'threshold in quiet');
  const live = s('g', {}, fm);
  const PROBES = [700, 1400, 5000];
  s('text', { x: ax.x(lg(100)), y: ax.y(-4), class: 't-muted' }, fm, 'not heard below the curves');
  slider(viz('fm-slider'), { label: 'masker level', min: 40, max: 80, step: 1, value: 60, fmt: v => v + ' dB' }, Lv => {
    live.textContent = '';
    const mPts = FS.map(f => [ax.x(lg(f)), clampY(thr(f, Lv))]);
    s('path', { d: 'M' + mPts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + ' L' + qPts.slice().reverse().map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + ' Z', class: 'area-pri' }, live);
    const runs = [];
    FS.forEach((f, i) => {
      if (thr(f, Lv) - quiet(f) < 0.3) return;
      if (!runs.length || runs[runs.length - 1].end !== i - 1) runs.push({ pts: [], end: i });
      const run = runs[runs.length - 1];
      run.pts.push(mPts[i]);
      run.end = i;
    });
    runs.forEach(run => line(live, run.pts, 's-pri'));
    s('line', { x1: ax.x(lg(FM)), x2: ax.x(lg(FM)), y1: ax.y(-10), y2: ax.y(Lv), class: 's-pri', style: 'stroke-width: 4' }, live);
    s('circle', { cx: ax.x(lg(FM)), cy: ax.y(Lv), r: 5, class: 'f-pri' }, live);
    s('text', { x: ax.x(lg(FM)) - 8, y: ax.y(Lv) - 4, 'text-anchor': 'end', class: 't-pri t-bold halo' }, live, `masker ${Lv} dB`);
    PROBES.forEach((f, i) => {
      const t = thr(f, Lv), heard = 25 > t, x = ax.x(lg(f));
      s('line', { x1: x, x2: x, y1: ax.y(-10), y2: ax.y(25), class: heard ? 's-sec' : 's-sec dash', style: 'stroke-width: 2.5' + (heard ? '' : '; opacity: 0.6') }, live);
      s('circle', { cx: x, cy: ax.y(25), r: 4.5, class: heard ? 'f-sec' : 'f-surface s-sec' }, live);
      s('text', { x: x + (i === 0 ? -7 : 7), y: ax.y(25) - 9, 'text-anchor': i === 0 ? 'end' : 'start', class: 't-sec t-bold halo' }, live, heard ? 'heard' : 'masked');
      const v = role('p' + i);
      v.textContent = heard ? 'heard' : 'masked';
      v.className = 'v ' + (heard ? 'sec' : '');
      role('p' + i + 's').textContent = `threshold here ${t.toFixed(1)} dB`;
    });
  });

  // Figure 2: temporal masking
  const tm = svg(viz('tm'), 760, 268, { label: 'Temporal masking: masker from 0 to 200 ms, pre-masking 20 ms before and post-masking 150 ms after', minWidth: 600 });
  const tx = axes(tm, { x: 52, y: 42, w: 680, h: 170, xd: [-100, 450], yd: [0, 70], xt: [-100, 0, 100, 200, 300, 400], yt: [0, 20, 40, 60], xl: 'time (ms), masker on from 0 to 200', yl: 'level (dB)' });
  s('rect', { x: tx.x(0), y: tx.y(60), width: tx.x(200) - tx.x(0), height: tx.y(0) - tx.y(60), class: 'f-pri-soft' }, tm);
  s('rect', { x: tx.x(0), y: tx.y(60), width: tx.x(200) - tx.x(0), height: 6, class: 'f-pri' }, tm);
  s('text', { x: tx.x(100), y: tx.y(60) + 22, 'text-anchor': 'middle', class: 't-pri t-bold' }, tm, 'masker, 60 dB');
  const base = 4, peak = 42;
  const mth = t => {
    if (t < -20 || t > 400) return base;
    if (t < 0) return base + (peak - base) * Math.pow((t + 20) / 20, 2);
    if (t <= 200) return peak;
    return base + (peak - base) * Math.exp(-(t - 200) / 40) * (1 - (t - 200) / 600);
  };
  const tPts = [];
  for (let t = -100; t <= 450; t += 2) tPts.push([tx.x(t), tx.y(mth(t))]);
  s('path', { d: 'M' + tPts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + ` L${tx.x(450)} ${tx.y(0)} L${tx.x(-100)} ${tx.y(0)} Z`, class: 'area-sec' }, tm);
  line(tm, tPts, 's-sec');
  s('text', { x: tx.x(100), y: tx.y(peak) + 16, 'text-anchor': 'middle', class: 't-sec t-bold' }, tm, 'raised threshold');
  const brace = (t0, t1, y, label, anchor) => {
    line(tm, [[tx.x(t0), y + 5], [tx.x(t0), y], [tx.x(t1), y], [tx.x(t1), y + 5]], 's-fg').setAttribute('style', 'stroke-width: 1');
    s('text', { x: anchor === 'end' ? tx.x(t1) : (tx.x(t0) + tx.x(t1)) / 2, y: y - 6, 'text-anchor': anchor || 'middle', class: 't-fg t-bold' }, tm, label);
  };
  brace(-20, 0, 26, 'pre ≈ 20 ms', 'end');
  brace(0, 200, 26, 'simultaneous ≈ 200 ms');
  brace(200, 350, 26, 'post ≈ 150 ms');

  // Figure 3: encoder block diagram
  const en = svg(viz('enc'), 800, 370, { label: 'MPEG audio encoder: filter bank and psychoacoustic model in parallel, then quantization and bit allocation, then multiplexer and entropy coder', minWidth: 600 });
  s('text', { x: 400, y: 18, 'text-anchor': 'middle', class: 't-fg t-bold' }, en, 'uncompressed audio');
  line(en, [[400, 26], [400, 38]], 's-fg');
  line(en, [[220, 38], [580, 38]], 's-fg');
  arrow(en, 220, 38, 220, 62, { cls: 'a-sec' });
  arrow(en, 580, 38, 580, 62, { cls: 'a-pri' });
  box(en, 110, 62, 220, 56, 'psychoacoustic model\nmasking, threshold of hearing', { cls: 'f-sec-soft' });
  box(en, 470, 62, 220, 56, 'filter bank\ntime → frequency', { cls: 'f-pri-soft' });
  arrow(en, 580, 118, 580, 172, { cls: 'a-pri', width: 2, label: '32 sub-bands', dx: 50, dy: 4, labelCls: 't-pri t-bold' });
  line(en, [[220, 118], [220, 200]], 's-sec').setAttribute('style', 'stroke-width: 1.5');
  arrow(en, 220, 200, 330, 200, { cls: 'a-sec' });
  s('text', { x: 210, y: 150, 'text-anchor': 'end', class: 't-sec t-bold' }, en, 'SMR of');
  s('text', { x: 210, y: 164, 'text-anchor': 'end', class: 't-sec t-bold' }, en, 'each sub-band');
  box(en, 330, 172, 360, 56, 'quantization, bit/noise allocation\nnoise high → rough · noise low → finer', { cls: 'f-pri-soft' });
  arrow(en, 510, 228, 510, 264, { cls: 'a-pri', width: 2, label: 'quantized values', dx: 62, dy: 4, labelCls: 't-pri' });
  box(en, 330, 264, 360, 50, 'multiplexer, entropy coder\nHuffman coding', { cls: 'f-pri-soft' });
  arrow(en, 510, 314, 510, 342, { cls: 'a-pri', width: 2 });
  s('text', { x: 510, y: 360, 'text-anchor': 'middle', class: 't-fg t-bold' }, en, 'compressed bitstream');

  // Figure 4: bit allocation rounds
  const SMR = [12, 18, 20];
  const ROUNDS = [[28, 22, 35]];
  const GOT = [];
  for (let b = 0; b < 3; b++) {
    const snr = ROUNDS[b].slice();
    const mnr = snr.map((v, i) => v - SMR[i]);
    const i = mnr.indexOf(Math.min(...mnr));
    GOT.push(i);
    snr[i] += 6;
    ROUNDS.push(snr);
  }
  const bt = svg(viz('bits'), 640, 310, { label: 'SNR bars with SMR lines for three sub-bands; the gap above the line is the MNR', minWidth: 520 });
  const bx = axes(bt, { x: 52, y: 40, w: 560, h: 210, xd: [0, 3], yd: [0, 45], yt: [0, 10, 20, 30, 40], yl: 'dB' });
  [0, 1, 2].forEach(i => s('text', { x: bx.x(i + 0.5), y: bx.y(0) + 18, 'text-anchor': 'middle', class: 't-fg t-bold' }, bt, 'sub-band ' + (i + 1)));
  const layer = s('g', {}, bt);
  const BN = [
    'Start: MNR = 28 − 12 = 16, 22 − 18 = 4, 35 − 20 = 15. Sub-band 2 has the lowest MNR, 4 dB, so it gets the next bit.',
    'After bit 1: sub-band 2 SNR 22 + 6 = 28, MNR 10. Still the lowest, so bit 2 also goes to sub-band 2.',
    'After bit 2: sub-band 2 SNR 34, MNR 16. Now sub-band 3 is lowest at 15 dB, so bit 3 goes there.',
    'After bit 3: SNR 28, 34, 41 and MNR 16, 16, 21 dB. Sub-band 2 got 2 bits, sub-band 3 got 1, sub-band 1 got 0.',
  ];
  steps(viz('bits-steps'), ['Start', 'After bit 1', 'After bit 2', 'After bit 3'], k => {
    layer.textContent = '';
    const snr = ROUNDS[k];
    const mnr = snr.map((v, i) => v - SMR[i]);
    const next = k < 3 ? GOT[k] : -1;
    const bw = bx.x(0.44) - bx.x(0);
    snr.forEach((v, i) => {
      const x0 = bx.x(i + 0.5) - bw / 2;
      s('rect', { x: x0, y: bx.y(SMR[i]), width: bw, height: bx.y(0) - bx.y(SMR[i]), class: 'f-pri-soft' }, layer);
      s('rect', { x: x0, y: bx.y(v), width: bw, height: bx.y(SMR[i]) - bx.y(v), class: 'f-pri' }, layer);
      s('text', { x: x0 + bw / 2, y: (bx.y(v) + bx.y(SMR[i])) / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, layer, 'MNR ' + mnr[i]);
      const added = GOT.slice(0, k).filter(g => g === i).length;
      for (let a = 0; a < added; a++) {
        const top = v - a * 6;
        s('rect', { x: x0 + 2, y: bx.y(top) + 1, width: bw - 4, height: bx.y(top - 6) - bx.y(top) - 2, class: 'f-none sep dash' }, layer);
        s('text', { x: x0 + bw + 6, y: (bx.y(top) + bx.y(top - 6)) / 2, dy: '0.35em', class: 't-pri' }, layer, '+6 dB');
      }
      line(layer, [[x0 - 8, bx.y(SMR[i])], [x0 + bw + 8, bx.y(SMR[i])]], 's-sec');
      s('text', { x: x0 + bw + 12, y: bx.y(SMR[i]), dy: '0.35em', class: 't-sec t-bold' }, layer, 'SMR ' + SMR[i]);
      s('text', { x: x0 + bw / 2, y: bx.y(v) - 8, 'text-anchor': 'middle', class: i === next ? 't-ok t-bold' : 't-fg' }, layer, 'SNR ' + v + (i === next ? ' · next bit' : ''));
      if (i === next) s('rect', { x: x0 - 3, y: bx.y(v) - 3, width: bw + 6, height: bx.y(0) - bx.y(v) + 3, class: 'f-none s-ok' }, layer);
    });
    role('bits-note').textContent = BN[k];
  }, 3);
});

QV.register('s3-w7', function (q) {
  const { s, svg, axes, line, plot, gray, grid, steps, slider, table } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  table(viz('given'), ['', 'col 4', 'col 5'], [
    [{ text: 'row 2', cls: 'l' }, '40', '80'],
    [{ text: 'row 3', cls: 'l' }, '60', '120'],
  ], { cls: 'tbl' });

  const keys = t => {
    const a = -0.5, x = Math.abs(t);
    if (x <= 1) return (a + 2) * x * x * x - (a + 3) * x * x + 1;
    if (x < 2) return a * x * x * x - 5 * a * x * x + 8 * a * x - 4 * a;
    return 0;
  };
  const at = (arr, i) => arr[Math.max(0, Math.min(arr.length - 1, i))];
  const nn1 = (arr, x) => at(arr, Math.round(x));
  const lin1 = (arr, x) => { const i = Math.floor(x), f = x - i; return at(arr, i) * (1 - f) + at(arr, i + 1) * f; };
  const cub1 = (arr, x) => { const i = Math.floor(x); let v = 0; for (let k = i - 1; k <= i + 2; k++) v += at(arr, k) * keys(x - k); return v; };

  // Figure 1a: 1D profile
  const V = [30, 30, 30, 200, 200, 90, 140, 60];
  const pr = svg(viz('prof'), 760, 290, { label: 'Eight pixel values resampled by nearest neighbour, linear and cubic interpolation', minWidth: 600 });
  const ax = axes(pr, { x: 52, y: 24, w: 680, h: 210, xd: [-0.3, 7.3], yd: [0, 255], xt: [0, 1, 2, 3, 4, 5, 6, 7], yt: [0, 50, 100, 150, 200, 250], xl: 'pixel position x', yl: 'value' });
  plot(pr, ax, x => nn1(V, x), 0, 7, 700, 's-sec');
  plot(pr, ax, x => lin1(V, x), 0, 7, 140, 's-pri');
  plot(pr, ax, x => cub1(V, x), 0, 7, 280, 's-ter');
  V.forEach((v, i) => s('circle', { cx: ax.x(i), cy: ax.y(v), r: 4, class: 'f-fg' }, pr));
  const mk = s('g', {}, pr);
  slider(viz('prof-slider'), { label: 'x', min: 0, max: 7, step: 0.05, value: 2.6, fmt: v => v.toFixed(2) }, x => {
    mk.textContent = '';
    s('line', { x1: ax.x(x), x2: ax.x(x), y1: ax.y(0), y2: ax.y(255), class: 's-fg dash', style: 'opacity: 0.5' }, mk);
    const i = Math.floor(x);
    const used = [
      [[Math.round(x)], 's-sec', 7],
      [[i, i + 1], 's-pri', 10.5],
      [[i - 1, i, i + 1, i + 2], 's-ter', 14],
    ];
    used.forEach(([ks, cls, r]) => ks.forEach(k => {
      const kk = Math.max(0, Math.min(7, k));
      s('circle', { cx: ax.x(kk), cy: ax.y(V[kk]), r, class: cls, style: 'stroke-width: 2' }, mk);
    }));
    const vals = [[nn1(V, x), 'f-sec', 'v-nn'], [lin1(V, x), 'f-pri', 'v-li'], [cub1(V, x), 'f-ter', 'v-cu']];
    vals.forEach(([v, cls, r]) => {
      s('circle', { cx: ax.x(x), cy: ax.y(v), r: 5, class: cls + ' sep' }, mk);
      role(r).textContent = v.toFixed(1);
    });
  });

  // Figure 1b: 4x4 image enlarged 8 times
  const IMG = [[220, 40, 40, 40], [40, 220, 40, 40], [40, 40, 220, 40], [40, 40, 40, 220]];
  const n = 4, F = 8, M = n * F;
  const src = u => (u + 0.5) / F - 0.5;
  const interp2 = (f1, r, c) => f1(IMG.map(row => f1(row, c)), r);
  const up = svg(viz('up'), 760, 222, { label: 'A 4 by 4 image and its 8 times enlargement by nearest neighbour, bilinear and bicubic interpolation', minWidth: 600 });
  const PW = 160, GAP = 32;
  const panel = (k, title) => {
    s('text', { x: 10 + k * (PW + GAP), y: 20, class: 't-fg t-bold' }, up, title);
    return 10 + k * (PW + GAP);
  };
  grid(up, { x: panel(0, 'original 4x4'), y: 34, data: IMG, cell: PW / n, fill: v => gray(v), text: () => null });
  [[nn1, 'nearest ×8'], [lin1, 'bilinear ×8'], [cub1, 'bicubic ×8']].forEach(([f1, title], k) => {
    const x0 = panel(k + 1, title);
    const cs = PW / M;
    const rg = s('g', { style: 'shape-rendering: crispEdges' }, up);
    for (let r = 0; r < M; r++) {
      for (let c = 0; c < M; c++) {
        const v = Math.max(0, Math.min(255, interp2(f1, src(r), src(c))));
        s('rect', { x: x0 + c * cs, y: 34 + r * cs, width: cs + 0.3, height: cs + 0.3, style: gray(v).style }, rg);
      }
    }
  });
  s('text', { x: 10, y: 34 + PW + 16, class: 't-sm' }, up, 'each output pixel centre maps back to (i + 0.5)/8 − 0.5 in the original');

  // Figure 2: bilinear on the given square
  const Q = { x: 150, y: 70, w: 260 };
  const f = (rr, cc) => { const b = rr - 2, a = cc - 4; return (1 - a) * (1 - b) * 40 + a * (1 - b) * 80 + (1 - a) * b * 60 + a * b * 120; };
  const X = cc => Q.x + (cc - 4) * Q.w, Y = rr => Q.y + (rr - 2) * Q.w;
  const bl = svg(viz('bl'), 600, 400, { label: 'Bilinear interpolation inside the square of pixels f(2,4), f(2,5), f(3,4), f(3,5) at the point row 2.7, col 4.25', minWidth: 480 });
  const RES = 26, cs2 = Q.w / RES;
  const rg2 = s('g', { style: 'shape-rendering: crispEdges' }, bl);
  for (let i = 0; i < RES; i++) {
    for (let j = 0; j < RES; j++) {
      s('rect', { x: Q.x + j * cs2, y: Q.y + i * cs2, width: cs2 + 0.3, height: cs2 + 0.3, style: gray(f(2 + (i + 0.5) / RES, 4 + (j + 0.5) / RES)).style }, rg2);
    }
  }
  s('rect', { x: Q.x, y: Q.y, width: Q.w, height: Q.w, class: 'f-none s-fg' }, bl);
  [[4, 'col 4'], [4.25, '4.25'], [5, 'col 5']].forEach(([cc, t]) => s('text', { x: X(cc), y: Q.y - 30, 'text-anchor': 'middle', class: cc === 4.25 ? 't-ter t-bold' : 't-fg' }, bl, t));
  [[2, 'row 2'], [2.7, 'row 2.7'], [3, 'row 3']].forEach(([rr, t]) => s('text', { x: Q.x - 24, y: Y(rr), dy: '0.35em', 'text-anchor': 'end', class: rr === 2.7 ? 't-ter t-bold' : 't-fg' }, bl, t));
  const layer = s('g', {}, bl);
  const corners = [[2, 4, 40], [2, 5, 80], [3, 4, 60], [3, 5, 120]];
  const cornerLayer = s('g', {}, bl);
  const drawCorners = hlKey => {
    cornerLayer.textContent = '';
    corners.forEach(([rr, cc, v]) => {
      const on = hlKey === rr * 10 + cc;
      s('circle', { cx: X(cc), cy: Y(rr), r: 16, class: (on ? 'f-ok' : 'f-surface') + ' box', style: 'stroke-width: 1.5' }, cornerLayer);
      s('text', { x: X(cc), y: Y(rr), dy: '0.35em', 'text-anchor': 'middle', class: (on ? 't-on' : 't-fg') + ' t-bold' }, cornerLayer, String(v));
    });
  };
  const PX = X(4.25), PY = Y(2.7);
  const dot = (x, y, cls, r) => s('circle', { cx: x, cy: y, r: r || 6, class: cls + ' sep' }, layer);
  const lab = (x, y, t, cls, anchor) => s('text', { x, y, dy: '0.35em', 'text-anchor': anchor || 'start', class: (cls || 't-fg t-bold') + ' halo' }, layer, t);
  const tag = (x, y, t, cls, anchor) => {
    const w = t.length * 6.8 + 10;
    s('rect', { x: anchor === 'middle' ? x - w / 2 : x - 5, y: y - 9, width: w, height: 18, rx: 4, class: 'f-surface box' }, layer);
    return s('text', { x, y, dy: '0.35em', 'text-anchor': anchor || 'start', class: cls || 't-fg t-bold' }, layer, t);
  };
  const BL = [
    'P = (row 2.7, col 4.25). Along row 2 the value is 50, along row 3 it is 75, and 70% of the way between them it is 67.5.',
    'Along row 2: a = 4.25 − 4 = 0.25 of the way from 40 to 80, so 40 + 0.25 (80 − 40) = 50.',
    'Along row 3: the same a = 0.25 from 60 to 120, so 60 + 0.25 (120 − 60) = 75.',
    'Between the rows: b = 2.7 − 2 = 0.7 of the way from 50 to 75, so 50 + 0.7 (75 − 50) = 67.5.',
    'Each pixel is weighted by the area of the rectangle opposite it: 0.225·40 + 0.075·80 + 0.525·60 + 0.175·120 = 9 + 6 + 31.5 + 21 = 67.5.',
    'Nearest neighbour: row 2.7 rounds to 3 and col 4.25 rounds to 4. P lies in the quarter nearest f(3,4), so the value is 60.',
  ];
  steps(viz('bl-steps'), ['Result', 'Row 2', 'Row 3', 'Between rows', 'Area weights', 'Nearest'], k => {
    layer.textContent = '';
    drawCorners(k === 5 ? 34 : 0);
    if (k === 0 || k === 1) {
      line(layer, [[X(4), Y(2)], [X(5), Y(2)]], 's-pri');
      dot(PX, Y(2), 'f-pri');
      lab(PX + 10, Y(2) - 14, '50', 't-pri t-bold');
    }
    if (k === 0 || k === 2) {
      line(layer, [[X(4), Y(3)], [X(5), Y(3)]], 's-pri');
      dot(PX, Y(3), 'f-pri');
      lab(PX + 10, Y(3) + 14, '75', 't-pri t-bold');
    }
    if (k === 0 || k === 3) {
      line(layer, [[PX, Y(2)], [PX, Y(3)]], 's-ter');
      if (k === 3) { dot(PX, Y(2), 'f-pri'); dot(PX, Y(3), 'f-pri'); lab(PX + 10, Y(2) - 14, '50', 't-pri t-bold'); lab(PX + 10, Y(3) + 14, '75', 't-pri t-bold'); }
    }
    if (k === 4) {
      line(layer, [[PX, Y(2)], [PX, Y(3)]], 's-fg dash');
      line(layer, [[X(4), PY], [X(5), PY]], 's-fg dash');
      tag((X(4) + PX) / 2, (Y(2) + PY) / 2 - 11, '0.175', 't-fg t-bold', 'middle');
      tag((X(4) + PX) / 2, (Y(2) + PY) / 2 + 11, '× 120', 't-fg', 'middle');
      tag((PX + X(5)) / 2, (Y(2) + PY) / 2, '0.525 × 60', 't-fg t-bold', 'middle');
      tag((X(4) + PX) / 2, (PY + Y(3)) / 2 - 11, '0.075', 't-fg t-bold', 'middle');
      tag((X(4) + PX) / 2, (PY + Y(3)) / 2 + 11, '× 80', 't-fg', 'middle');
      tag((PX + X(5)) / 2, (PY + Y(3)) / 2, '0.225 × 40', 't-fg t-bold', 'middle');
    }
    if (k === 5) {
      line(layer, [[X(4.5), Y(2)], [X(4.5), Y(3)]], 's-fg dash');
      line(layer, [[X(4), Y(2.5)], [X(5), Y(2.5)]], 's-fg dash');
      s('rect', { x: X(4), y: Y(2.5), width: Q.w / 2, height: Q.w / 2, class: 'f-none s-ok' }, layer);
      tag(X(4.5) + 10, Y(2.5) + 16, 'nearest f(3,4)', 't-ok t-bold');
    }
    dot(PX, PY, 'f-ter', 7);
    if (k === 5) tag(PX + 16, PY, 'P → 60', 't-ok t-bold');
    else tag(PX + 16, PY, k === 0 || k >= 3 ? 'P = 67.5' : 'P', 't-ter t-bold');
    role('bl-note').textContent = BL[k];
  });

  // Figure 3: storage before and after
  const sz = svg(viz('size'), 760, 290, { label: '640 by 480 image and 320 by 240 image at the same scale, with storage in bytes', minWidth: 600 });
  const k = 0.4;
  s('rect', { x: 20, y: 30, width: 640 * k, height: 480 * k, class: 'f-pri-soft outline-pri' }, sz);
  s('rect', { x: 20, y: 30, width: 320 * k, height: 240 * k, class: 'f-none s-sec dash', style: 'stroke-width: 1.5' }, sz);
  s('text', { x: 20 + 320 * k / 2, y: 30 + 240 * k / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-sec halo' }, sz, '1/4 of the area');
  s('text', { x: 20, y: 18, class: 't-pri t-bold' }, sz, 'before: 640 × 480');
  s('text', { x: 20, y: 30 + 480 * k + 22, class: 't-fg' }, sz, '640 × 480 × 3 = 921,600 bytes');
  const sx = 320;
  s('rect', { x: sx, y: 30, width: 320 * k, height: 240 * k, class: 'f-sec-soft outline-sec' }, sz);
  s('text', { x: sx, y: 18, class: 't-sec t-bold' }, sz, 'after: 320 × 240');
  s('text', { x: sx, y: 30 + 240 * k + 22, class: 't-fg' }, sz, '320 × 240 × 3');
  s('text', { x: sx, y: 30 + 240 * k + 38, class: 't-fg' }, sz, '= 230,400 bytes');
  const zx = 560, zc = 26;
  s('text', { x: zx, y: 18, class: 't-fg t-bold' }, sz, 'one new pixel');
  grid(sz, { x: zx, y: 40, data: [[0, 0], [0, 0]], cell: zc, fill: () => 'f-pri-soft', text: () => null, stroke: 'box' });
  QV.arrow(sz, zx + 2 * zc + 10, 40 + zc, zx + 2 * zc + 50, 40 + zc, { cls: 'a-muted' });
  s('rect', { x: zx + 2 * zc + 58, y: 40 + zc / 2, width: zc, height: zc, class: 'f-sec-soft box' }, sz);
  s('text', { x: zx, y: 40 + 2 * zc + 20, class: 't-sm' }, sz, '2x2 block, 4 × 3 = 12 bytes');
  s('text', { x: zx, y: 40 + 2 * zc + 34, class: 't-sm' }, sz, '→ 1 pixel, 3 bytes');
});

QV.register('s3-w8', function (q) {
  const { s, svg, axes, plot, line, gray, grid, steps, slider } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const R = [31, 63, 127, 200];
  const c = 255 / Math.log10(256);
  const NEG = r => 255 - r;
  const LOG = r => c * Math.log10(1 + r);
  const GAM = g => r => 255 * Math.pow(r / 255, g);
  const CS = r => (r <= 50 ? 0 : r >= 150 ? 255 : 255 * (r - 50) / 100);
  const rnd = v => Math.round(v);

  const gv = svg(viz('given'), 330, 96, { label: 'The four input pixel values as gray levels', minWidth: 300 });
  grid(gv, { x: 10, y: 10, data: [R], cell: 60, gap: 18, fill: v => gray(v), stroke: 'box' });
  R.forEach((r, i) => s('text', { x: 10 + i * 78 + 30, y: 88, 'text-anchor': 'middle', class: 't-fg' }, gv, 'r = ' + r));

  const square = (g, yl) => axes(g, { x: 56, y: 26, w: 256, h: 256, xd: [0, 255], yd: [0, 255], xt: [0, 50, 100, 150, 200, 255], yt: [0, 50, 100, 150, 200, 255], xl: 'input r', yl });
  const swatches = (g, x, y, rows) => {
    rows.forEach(([name, vals, cls], ri) => {
      s('text', { x: x - 8, y: y + ri * 52 + 22, dy: '0.35em', 'text-anchor': 'end', class: (cls || 't-fg') + ' t-bold' }, g, name);
      grid(g, { x, y: y + ri * 52, data: [vals.map(rnd)], cell: 44, gap: 6, fill: v => gray(v), stroke: 'box' });
    });
  };

  // Figure 1: negative and log
  const ng = svg(viz('neg'), 640, 330, { label: 'Negative and log transfer curves with the four input values', minWidth: 520 });
  const ax = square(ng, 'output s');
  line(ng, [[ax.x(0), ax.y(0)], [ax.x(255), ax.y(255)]], 's-muted dash').setAttribute('style', 'stroke-width: 1');
  const curves = [[NEG, 's-sec', 'f-sec', 'negative 255 − r', 't-sec', 205, 72], [LOG, 's-pri', 'f-pri', 'log, c = 105.89', 't-pri', 258, 250]].map(([fn, scls, fcls, name, tcls, lx, ly]) => {
    const g = s('g', { class: 'fade' }, ng);
    plot(g, ax, fn, 0, 255, 255, scls);
    R.forEach(r => s('circle', { cx: ax.x(r), cy: ax.y(fn(r)), r: 4.5, class: fcls + ' sep' }, g));
    s('text', { x: ax.x(lx), y: ax.y(ly), class: tcls + ' t-bold halo' }, g, name);
    return g;
  });
  R.forEach(r => line(ng, [[ax.x(r), ax.y(0)], [ax.x(r), ax.y(Math.max(NEG(r), LOG(r)))]], 's-muted dash').setAttribute('style', 'stroke-width: 1; opacity: 0.6'));
  const swN = s('g', {}, ng);
  swatches(swN, 420, 60, [['input', R, 't-fg']]);
  const swRows = [['negative', R.map(NEG), 't-sec'], ['log', R.map(LOG), 't-pri']].map((row, i) => {
    const g = s('g', { class: 'fade' }, ng);
    swatches(g, 420, 112 + i * 52, [row]);
    return g;
  });
  steps(viz('neg-steps'), ['Both', 'Negative', 'Log'], k => {
    curves.forEach((g, i) => g.classList.toggle('dim', k > 0 && i !== k - 1));
    swRows.forEach((g, i) => g.classList.toggle('dim', k > 0 && i !== k - 1));
  });

  // Figure 2: gamma
  const gm = svg(viz('gam'), 640, 330, { label: 'Gamma curve s = 255 (r/255) to the power gamma, with the four input values', minWidth: 520 });
  const gx = square(gm, 'output s');
  line(gm, [[gx.x(0), gx.y(0)], [gx.x(255), gx.y(255)]], 's-muted dash').setAttribute('style', 'stroke-width: 1');
  plot(gm, gx, GAM(2), 0, 255, 200, 's-sec').setAttribute('style', 'stroke-width: 1.5; opacity: 0.7');
  s('circle', { cx: gx.x(127), cy: gx.y(GAM(2)(127)), r: 4.5, class: 'f-sec sep' }, gm);
  s('text', { x: gx.x(132), y: gx.y(GAM(2)(127)) + 14, class: 't-sec t-bold halo' }, gm, 'γ = 2: 127 → 63');
  const gl = s('g', {}, gm);
  slider(viz('gam-slider'), { label: 'γ', min: 0.2, max: 3, step: 0.1, value: 0.5, fmt: v => v.toFixed(1) }, g => {
    gl.textContent = '';
    const fn = GAM(g);
    plot(gl, gx, fn, 0, 255, 255, 's-pri');
    R.forEach((r, i) => {
      s('line', { x1: gx.x(r), x2: gx.x(r), y1: gx.y(0), y2: gx.y(fn(r)), class: 's-muted dash', style: 'stroke-width: 1; opacity: 0.6' }, gl);
      s('circle', { cx: gx.x(r), cy: gx.y(fn(r)), r: 4.5, class: 'f-pri sep' }, gl);
      role('g' + i).textContent = String(rnd(fn(r)));
    });
    swatches(gl, 420, 60, [['input', R, 't-fg'], ['γ = ' + g.toFixed(1), R.map(fn), 't-pri']]);
    const v = role('gam-verdict');
    const gs = g.toFixed(1);
    v.innerHTML = Math.abs(g - 1) < 1e-9
      ? 'γ = 1 is the diagonal: every output equals its input.'
      : g < 1
        ? `γ = <b>${gs}</b> &lt; 1: the curve lies above the diagonal, so every pixel gets <b>brighter</b>.`
        : `γ = <b>${gs}</b> &gt; 1: the curve lies below the diagonal, so every pixel gets <b>darker</b>.`;
  });

  // Figure 3: contrast stretching
  const cs = svg(viz('cs'), 640, 330, { label: 'Contrast stretching with low 50 and high 150, with the four input values', minWidth: 520 });
  const cx = square(cs, 'output s');
  s('rect', { x: cx.x(0), y: cx.y(255), width: cx.x(50) - cx.x(0), height: cx.y(0) - cx.y(255), class: 'f-seg' }, cs);
  s('rect', { x: cx.x(150), y: cx.y(255), width: cx.x(255) - cx.x(150), height: cx.y(0) - cx.y(255), class: 'f-seg' }, cs);
  s('text', { x: cx.x(25), y: cx.y(128), 'text-anchor': 'middle', class: 't-muted' }, cs, '→ 0');
  s('text', { x: cx.x(230), y: cx.y(128), 'text-anchor': 'middle', class: 't-muted' }, cs, '→ 255');
  line(cs, [[cx.x(0), cx.y(0)], [cx.x(255), cx.y(255)]], 's-muted dash').setAttribute('style', 'stroke-width: 1');
  line(cs, [[cx.x(0), cx.y(0)], [cx.x(50), cx.y(0)], [cx.x(150), cx.y(255)], [cx.x(255), cx.y(255)]], 's-pri');
  s('text', { x: cx.x(50), y: cx.y(0) - 8, 'text-anchor': 'middle', class: 't-fg t-bold halo' }, cs, 'low 50');
  s('text', { x: cx.x(150), y: cx.y(255) - 8, 'text-anchor': 'middle', class: 't-fg t-bold halo' }, cs, 'high 150');
  R.forEach(r => {
    const v = CS(r);
    s('line', { x1: cx.x(r), x2: cx.x(r), y1: cx.y(0), y2: cx.y(v), class: 's-muted dash', style: 'stroke-width: 1; opacity: 0.6' }, cs);
    s('circle', { cx: cx.x(r), cy: cx.y(v), r: 4.5, class: 'f-pri sep' }, cs);
  });
  s('text', { x: cx.x(63) + 8, y: cx.y(CS(63)) + 4, class: 't-pri t-bold halo' }, cs, '63 → 33');
  s('text', { x: cx.x(127) - 10, y: cx.y(CS(127)) - 4, 'text-anchor': 'end', class: 't-pri t-bold halo' }, cs, '127 → 196');
  swatches(cs, 420, 60, [['input', R, 't-fg'], ['stretched', R.map(CS), 't-pri']]);
});

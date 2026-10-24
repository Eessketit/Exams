QV.register('s4-w1', function (q) {
  const { s, svg, grid, mat, steps, arrow } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const role = n => q.querySelector(`[data-role="${n}"]`);
  const N = 7;
  const A = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ];
  const at = (M, r, c) => (r >= 0 && r < N && c >= 0 && c < N ? M[r][c] : 0);
  const op = (M, f) => M.map((row, r) => row.map((_, c) => {
    const w = [];
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) w.push(at(M, r + i, c + j));
    return f(...w);
  }));
  const D = op(A, Math.max), C = op(D, Math.min), E = op(A, Math.min), O = op(E, Math.max);
  const isNew = (r, c) => C[r][c] === 1 && A[r][c] === 0;
  const idx = [...Array(N).keys()].map(String);
  const bin = (g, x, y, M, cell, o) => grid(g, {
    x, y, data: M, cell,
    fill: (v, r, c) => (o.mark && o.mark(r, c) ? 'f-ok' : v ? 'f-pri' : 'f-seg'),
    text: o.small ? false : undefined,
    textCls: v => (v ? 't-on' : 't-muted'),
    rowLabels: o.idx ? idx : null, colLabels: o.idx ? idx : null,
  });

  const given = viz('given');
  mat(given, A, { caption: 'Image A, rows and columns 0-6', hl: v => (v ? 'on' : null) });
  mat(given, [[1, 1, 1], [1, 1, 1], [1, 1, 1]], { caption: 'B, origin [1]', text: (v, r, c) => (r === 1 && c === 1 ? '[1]' : '1'), hl: (v, r, c) => (r === 1 && c === 1 ? 'on org' : 'on') });

  // Figure 1: closing and opening on the same A
  const ord = svg(viz('order'), 720, 370, { label: 'Closing: A, A dilated, then eroded, 19 ones. Opening: A, A eroded to nothing, then dilated, still empty', minWidth: 560 });
  const cs = 16, gw = cs * N, xs = [110, 300, 490];
  [
    { y: 50, name: 'Closing', sub: 'dilate first', mats: [A, D, C], titles: ['A', 'A ⊕ B', 'A • B'], ops: ['⊕ B', '⊖ B'], sum: ['16 → 19 ones', 'A ⊆ A • B'], cls: 't-ok', mark: true },
    { y: 230, name: 'Opening', sub: 'erode first', mats: [A, E, O], titles: ['A', 'A ⊖ B', 'A ∘ B'], ops: ['⊖ B', '⊕ B'], sum: ['16 → 0 ones', 'A ∘ B ⊆ A'], cls: 't-sec' },
  ].forEach(R => {
    s('text', { x: 0, y: R.y + gw / 2 - 4, class: 't-fg t-bold t-lg' }, ord, R.name);
    s('text', { x: 0, y: R.y + gw / 2 + 14 }, ord, R.sub);
    R.mats.forEach((M, k) => {
      s('text', { x: xs[k] + gw / 2, y: R.y - 10, 'text-anchor': 'middle', class: 't-fg t-bold' }, ord, R.titles[k]);
      bin(ord, xs[k], R.y, M, cs, { small: true, mark: R.mark && k === 2 ? isNew : null });
      if (k < 2) arrow(ord, xs[k] + gw + 10, R.y + gw / 2, xs[k + 1] - 10, R.y + gw / 2, { label: R.ops[k], labelCls: 't-fg t-bold', dy: -8 });
    });
    s('text', { x: 622, y: R.y + gw / 2 - 4, class: R.cls + ' t-bold' }, ord, R.sum[0]);
    s('text', { x: 622, y: R.y + gw / 2 + 14, class: 't-fg' }, ord, R.sum[1]);
  });

  // Figures 2 and 3: a 3x3 window on the input decides one output pixel
  function slide(o) {
    const cell = 30, w = cell * N, L = { x: 70, y: 84 }, R = { x: 400, y: 84 };
    const el = svg(viz(o.host), 680, 340, { label: o.label, minWidth: 540 });
    s('text', { x: L.x, y: 30, class: 't-fg t-bold' }, el, o.titles[0]);
    s('text', { x: R.x, y: 30, class: 't-fg t-bold' }, el, o.titles[1]);
    bin(el, L.x, L.y, o.src, cell, { idx: true });
    bin(el, R.x, R.y, o.dst, cell, { idx: true, mark: o.mark });
    arrow(el, 322, L.y + w / 2, 380, L.y + w / 2, { label: o.op, labelCls: 't-fg t-bold', dy: -8 });
    const hl = s('g', {}, el);
    const note = role(o.note);
    steps(viz(o.host + '-steps'), ['All'].concat(o.picks.map(p => `(${p[0]},${p[1]})`)), k => {
      hl.textContent = '';
      const cells = k === 0 ? o.allMarks : [o.picks[k - 1]];
      cells.forEach(([r, c]) => s('rect', { x: R.x + c * cell, y: R.y + r * cell, width: cell, height: cell, rx: 2, class: 'f-none outline-sec' }, hl));
      if (k > 0) {
        const [r, c] = o.picks[k - 1];
        s('rect', { x: L.x + (c - 1) * cell, y: L.y + (r - 1) * cell, width: 3 * cell, height: 3 * cell, rx: 3, class: 'f-none outline-sec' }, hl);
      }
      note.textContent = k === 0 ? o.allNote : o.notes[k - 1];
    });
  }

  slide({
    host: 'dil', note: 'dil-note', titles: ['A', 'A ⊕ B'], op: 'max',
    label: 'Dilation of A by a 3x3 square: a window on A and the output pixel it decides',
    src: A, dst: D, allMarks: [[0, 3], [1, 3]],
    allNote: 'A ⊕ B: every pixel takes the maximum of its 3x3 window. 47 of 49 pixels become 1. Only (0,3) and (1,3), outlined, stay 0.',
    picks: [[1, 3], [0, 3], [2, 3], [4, 2], [6, 6]],
    notes: [
      'Window rows 0-2, columns 2-4: all nine pixels are 0. Maximum 0, so (1,3) stays 0.',
      'Window rows −1 to 1, columns 2-4. Row −1 is outside and counts as 0, and the six pixels inside are 0. Maximum 0.',
      'Window rows 1-3, columns 2-4 holds (3,2) and (3,3), which are 1. Maximum 1.',
      'This pixel is 0 in A, but its window holds eight 1s. Maximum 1, so the hole is already filled after dilation.',
      'Corner pixel. Five window pixels are outside the image and count as 0, but (5,5) is 1. Maximum 1, so dilation reaches the image frame.',
    ],
  });

  slide({
    host: 'ero', note: 'ero-note', titles: ['A ⊕ B', '(A ⊕ B) ⊖ B = A • B'], op: 'min',
    label: 'Erosion of A dilated by the same 3x3 square: window and output pixel, with the three filled pixels marked',
    src: D, dst: C, mark: isNew, allMarks: [],
    allNote: '(A ⊕ B) ⊖ B: a pixel stays 1 only if all nine window pixels are 1. 19 ones remain. The green pixels were 0 in A: the hole, the break and the crack.',
    picks: [[4, 2], [2, 5], [3, 4], [2, 3], [0, 1]],
    notes: [
      'Window rows 3-5, columns 1-3: all nine are 1 in A ⊕ B. Minimum 1. In A this pixel was 0, so the one-pixel hole is filled.',
      'Window rows 1-3, columns 4-6: all 1. Minimum 1. The break in the right arm at (2,5) is fused.',
      'Window rows 2-4, columns 3-5: all 1. Minimum 1. The one-pixel crack at (3,4) is filled.',
      'Window rows 1-3, columns 2-4 contains (1,3) = 0. Minimum 0. The notch is 3 pixels wide, as wide as B, so it stays open.',
      'The window reaches row −1, outside the image, where pixels count as 0. Minimum 0. The frame that dilation added is eroded away.',
    ],
  });
});

QV.register('s4-w2', function (q) {
  const { s, svg, grid, mat, steps, gray, scale } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const role = n => q.querySelector(`[data-role="${n}"]`);
  const I = [
    [80, 80, 70, 50, 40],
    [80, 60, 60, 40, 30],
    [70, 60, 100, 50, 30],
    [50, 40, 50, 40, 20],
    [40, 30, 30, 20, 20],
  ];
  const AVG = [[1, 1, 1], [1, 1, 1], [1, 1, 1]], GAU = [[1, 2, 1], [2, 4, 2], [1, 2, 1]];
  const val = (mode, r, c) => {
    if (r >= 0 && r < 5 && c >= 0 && c < 5) return I[r][c];
    if (mode === 'zero') return 0;
    if (mode === 'dup') return I[Math.min(4, Math.max(0, r))][Math.min(4, Math.max(0, c))];
    return I[(r + 5) % 5][(c + 5) % 5];
  };
  const win = (mode, r, c) => [-1, 0, 1].map(i => [-1, 0, 1].map(j => val(mode, r + i, c + j)));
  const padded = mode => [-1, 0, 1, 2, 3, 4, 5].map(r => [-1, 0, 1, 2, 3, 4, 5].map(c => val(mode, r, c)));
  const apply = (W, M, d) => W.reduce((t, row, i) => t + row.reduce((u, v, j) => u + v * M[i][j], 0), 0) / d;
  const conv = (mode, M, d) => I.map((row, r) => row.map((_, c) => apply(win(mode, r, c), M, d)));
  const grayGrid = (g, x, y, data, cell) => {
    const gr = grid(g, { x, y, data, cell, fill: v => gray(v, 100), text: v => String(Math.round(v)) });
    s('rect', { x, y, width: gr.w, height: gr.h, class: 'f-none s-line' }, g);
    return gr;
  };

  const given = viz('given');
  mat(given, I, { caption: 'Image I, 8-bit', hl: (v, r, c) => (r === 2 && c === 2 ? 'hl' : r === 0 && c === 0 ? 'hl2' : null) });
  mat(given, AVG, { caption: 'Average × 1/9' });
  mat(given, GAU, { caption: 'Gaussian × 1/16', hl: v => (v === 4 ? 'hl' : null) });

  // Figure 1: the four border rules around the same 5x5 image
  const bd = svg(viz('borders'), 800, 262, { label: 'Four ways to treat the image border: zero padding, start at (1,1), duplication of the edges, wrap-around', minWidth: 560 });
  const c1 = 24;
  [
    { mode: 'zero', title: '1 · Zero padding', cap: ['(0,0): average 33.33', 'five fake black pixels'] },
    { mode: 'start', title: '2 · Start at (1,1)', cap: ['(0,0) gets no output', '5x5 image → 3x3 output'] },
    { mode: 'dup', title: '3 · Duplication', cap: ['(0,0): average 77.78', 'edge pixels copied out'] },
    { mode: 'wrap', title: '4 · Wrap-around', cap: ['(0,0): average 51.11', 'far corner 20 pulled in'] },
  ].forEach((p, i) => {
    const x = 16 + i * 200, y = 40;
    s('text', { x, y: 20, class: 't-fg t-bold' }, bd, p.title);
    if (p.mode === 'start') {
      grayGrid(bd, x + c1, y + c1, I, c1);
      s('rect', { x: x + 2 * c1, y: y + 2 * c1, width: 3 * c1, height: 3 * c1, class: 'f-none s-pri dash' }, bd);
    } else {
      grayGrid(bd, x, y, padded(p.mode), c1);
    }
    s('rect', { x: x + c1, y: y + c1, width: 5 * c1, height: 5 * c1, class: 'f-none s-ter' }, bd);
    const wx = p.mode === 'start' ? x + c1 : x;
    s('rect', { x: wx, y: wx === x ? y : y + c1, width: 3 * c1, height: 3 * c1, rx: 2, class: 'f-none outline-sec' }, bd);
    s('text', { x, y: y + 7 * c1 + 22, class: 't-fg' }, bd, p.cap[0]);
    s('text', { x, y: y + 7 * c1 + 38 }, bd, p.cap[1]);
  });

  // Figure 2: window × mask at the interior pixel (2,2)
  const it = svg(viz('interior'), 720, 350, { label: 'Average and Gaussian masks applied at pixel (2,2): products, sums and results 55.56 and 63.75 against the original 100', minWidth: 560 });
  const W = win('zero', 2, 2);
  const cc = 30;
  [['window (2,2)', 100], ['mask', 220], ['window × mask', 340]].forEach(([t, x]) => s('text', { x, y: 32, class: 't-fg t-bold' }, it, t));
  [
    { y: 44, name: 'Average', d: 9, cls: 't-sec', M: AVG, mfill: () => 'f-sec-soft', mtext: () => 't-fg', soft: 'f-sec-soft', sum: 500, res: '55.56', centre: 'centre weight 1/9 = 0.11' },
    { y: 176, name: 'Gaussian', d: 16, cls: 't-pri', M: GAU, mfill: v => (v === 4 ? 'f-pri' : v === 2 ? 'f-pri-soft' : 'f-seg'), mtext: v => (v === 4 ? 't-on' : 't-fg'), soft: 'f-pri-soft', sum: 1020, res: '63.75', centre: 'centre weight 4/16 = 0.25' },
  ].forEach(R => {
    s('text', { x: 0, y: R.y + 40, class: R.cls + ' t-bold t-lg' }, it, R.name);
    s('text', { x: 0, y: R.y + 58 }, it, '÷ ' + R.d);
    grayGrid(it, 100, R.y, W, cc);
    s('text', { x: 205, y: R.y + 45, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg' }, it, '×');
    grid(it, { x: 220, y: R.y, data: R.M, cell: cc, fill: R.mfill, textCls: R.mtext });
    s('text', { x: 325, y: R.y + 45, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg' }, it, '=');
    const P = W.map((row, i) => row.map((v, j) => v * R.M[i][j]));
    grid(it, { x: 340, y: R.y, data: P, cell: cc, fill: (v, i, j) => (i === 1 && j === 1 ? R.soft : 'f-seg') });
    s('text', { x: 450, y: R.y + 34, class: 't-fg' }, it, 'sum = ' + R.sum);
    s('text', { x: 450, y: R.y + 56, class: R.cls + ' t-bold t-lg' }, it, `${R.sum} / ${R.d} = ${R.res}`);
    s('text', { x: 220, y: R.y + 3 * cc + 16, class: 't-sm' }, it, R.centre);
  });
  const nx = scale(0, 100, 100, 640), ny = 312;
  s('text', { x: 0, y: ny + 4 }, it, 'result');
  s('line', { x1: nx(0), x2: nx(100), y1: ny, y2: ny, class: 'l-axis' }, it);
  [0, 20, 40, 60, 80, 100].forEach(v => {
    s('line', { x1: nx(v), x2: nx(v), y1: ny, y2: ny + 5, class: 'l-axis' }, it);
    s('text', { x: nx(v), y: ny + 20, 'text-anchor': 'middle' }, it, v);
  });
  [[500 / 9, 'f-sec', 't-sec', 'average 55.56', 'end', -8], [63.75, 'f-pri', 't-pri', 'Gaussian 63.75', 'start', 8], [100, 'f-fg', 't-fg', 'original 100', 'end', 0]].forEach(([v, f, t, label, anchor, dx]) => {
    s('circle', { cx: nx(v), cy: ny, r: 6, class: f }, it);
    s('text', { x: nx(v) + dx, y: ny - 12, 'text-anchor': anchor, class: t + ' t-bold' }, it, label);
  });

  // Figure 3: the whole filtered image for each border rule
  const cr = svg(viz('corner'), 700, 240, { label: 'Image with its border ring, and the average and Gaussian outputs for the chosen border rule', minWidth: 540 });
  const layer = s('g', {}, cr);
  const NOTES = {
    zero: 'Zero padding: the window at (0,0) is [0 0 0; 0 80 80; 0 80 60]. Average 300 / 9 = 33.33, Gaussian 700 / 16 = 43.75. The whole border of the output turns dark.',
    dup: 'Duplication: the window is [80 80 80; 80 80 80; 80 80 60]. Average 700 / 9 = 77.78, Gaussian 1260 / 16 = 78.75. The corner stays near its true value 80.',
    wrap: 'Wrap-around: the window is [20 40 30; 40 80 80; 30 80 60], with pixels from the far edges. Average 460 / 9 = 51.11, Gaussian 940 / 16 = 58.75. The far corner 20 drags the result down.',
  };
  const modes = ['zero', 'dup', 'wrap'];
  steps(viz('corner-steps'), ['Zero padding', 'Duplication', 'Wrap-around'], k => {
    const mode = modes[k];
    layer.textContent = '';
    s('text', { x: 40, y: 24, class: 't-fg t-bold' }, layer, 'input with border ring');
    grayGrid(layer, 40, 40, padded(mode), 26);
    s('rect', { x: 66, y: 66, width: 130, height: 130, class: 'f-none s-ter' }, layer);
    s('rect', { x: 40, y: 40, width: 78, height: 78, rx: 2, class: 'f-none outline-sec' }, layer);
    [['average output', 300, AVG, 9], ['Gaussian output', 510, GAU, 16]].forEach(([t, x, M, d]) => {
      s('text', { x, y: 24, class: 't-fg t-bold' }, layer, t);
      grayGrid(layer, x, 56, conv(mode, M, d), 30);
      s('rect', { x, y: 56, width: 30, height: 30, rx: 2, class: 'f-none outline-sec' }, layer);
    });
    role('corner-note').textContent = NOTES[mode];
  });
});

QV.register('s4-w3', function (q) {
  const { s, svg, grid, mat, steps, gray, axes, table, arrow } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const role = n => q.querySelector(`[data-role="${n}"]`);
  const IMG = [
    [3, 3, 4, 2, 3],
    [2, 4, 5, 3, 1],
    [3, 4, 6, 4, 2],
    [5, 3, 3, 4, 2],
    [1, 2, 4, 5, 3],
  ];
  const LV = [0, 1, 2, 3, 4, 5, 6, 7];
  const SUBK = '₀₁₂₃₄₅₆₇';
  const n = LV.map(k => IMG.flat().filter(v => v === k).length);
  const cum = LV.map(k => n.slice(0, k + 1).reduce((a, b) => a + b, 0));
  const sK = cum.map(c => Math.round(7 * c / 25));
  const EQ = IMG.map(row => row.map(v => sK[v]));
  const ns = LV.map(k => EQ.flat().filter(v => v === k).length);
  const grayGrid = (g, x, y, data, cell) => {
    const gr = grid(g, { x, y, data, cell, fill: v => gray(v, 7) });
    s('rect', { x, y, width: gr.w, height: gr.h, class: 'f-none s-line' }, g);
    return gr;
  };

  mat(viz('given'), IMG, { caption: '3-bit image, 5 × 5' });

  // Figure 1: image and histogram, one level at a time
  const hs = svg(viz('hist'), 720, 290, { label: 'Image and its histogram: n_k = 0, 2, 5, 8, 6, 3, 1, 0 for levels 0 to 7', minWidth: 560 });
  s('text', { x: 30, y: 30, class: 't-fg t-bold' }, hs, 'image, 25 pixels');
  grayGrid(hs, 30, 44, IMG, 34);
  const ax = axes(hs, { x: 310, y: 36, w: 390, h: 196, xd: [-0.5, 7.5], yd: [0, 9], xt: LV, yt: [0, 2, 4, 6, 8], xl: 'gray level rₖ', yl: 'nₖ, pixel count' });
  const bars = LV.map(k => {
    const g = s('g', { class: 'fade' }, hs);
    s('rect', { x: ax.x(k) - 17, y: ax.y(n[k]), width: 34, height: ax.y(0) - ax.y(n[k]), class: 'f-pri' }, g);
    s('text', { x: ax.x(k), y: ax.y(n[k]) - 6, 'text-anchor': 'middle', class: 't-fg t-bold' }, g, n[k]);
    return g;
  });
  const outl = s('g', {}, hs);
  steps(viz('hist-steps'), ['All'].concat(LV.map(k => 'r = ' + k)), k => {
    outl.textContent = '';
    bars.forEach((b, i) => b.classList.toggle('dim', k > 0 && i !== k - 1));
    if (k === 0) {
      role('hist-note').textContent = 'All levels: nₖ = 0, 2, 5, 8, 6, 3, 1, 0, which sums to 25. Divide each count by 25 for p(rₖ).';
      return;
    }
    const L = k - 1;
    IMG.forEach((row, r) => row.forEach((v, c) => {
      if (v === L) s('rect', { x: 30 + c * 34, y: 44 + r * 34, width: 34, height: 34, rx: 2, class: 'f-none outline-sec' }, outl);
    }));
    role('hist-note').textContent = n[L] === 0
      ? `r = ${L}: no pixel has this level, so n${SUBK[L]} = 0 and p(r${SUBK[L]}) = 0.00.`
      : `r = ${L}: ${n[L]} pixel${n[L] > 1 ? 's' : ''}, so n${SUBK[L]} = ${n[L]} and p(r${SUBK[L]}) = ${n[L]}/25 = ${(n[L] / 25).toFixed(2)}.`;
  });

  // Figure 2: cumulative sum scaled to 0..7, then rounded
  const cd = svg(viz('cdf'), 700, 296, { label: '7 times the cumulative distribution for each input level, with the rounded output level', minWidth: 540 });
  const ax2 = axes(cd, { x: 60, y: 30, w: 610, h: 220, xd: [-0.5, 7.5], yd: [0, 8], xt: LV, yt: LV, xl: 'input level rₖ', yl: '7 × cdf, and output level sₖ' });
  const cols = LV.map(k => {
    const v = 7 * cum[k] / 25, g = s('g', { class: 'fade' }, cd);
    s('rect', { x: ax2.x(k) - 20, y: ax2.y(v), width: 40, height: ax2.y(0) - ax2.y(v), class: 'f-pri-soft' }, g);
    if (Math.abs(v - sK[k]) > 0.01) s('line', { x1: ax2.x(k), x2: ax2.x(k), y1: ax2.y(v), y2: ax2.y(sK[k]), class: 's-ok dash', style: 'stroke-width: 1.5' }, g);
    s('circle', { cx: ax2.x(k), cy: ax2.y(v), r: 4, class: 'f-pri' }, g);
    s('circle', { cx: ax2.x(k), cy: ax2.y(sK[k]), r: 6, class: 'f-ok' }, g);
    const t = s('text', { x: ax2.x(k), y: ax2.y(Math.max(v, sK[k])) - 12, 'text-anchor': 'middle', class: 't-pri halo' }, g, v.toFixed(2) + ' ');
    s('tspan', { class: 't-ok t-bold' }, t, '→ ' + sK[k]);
    return g;
  });
  const tb = table(viz('cdf-table'), [{ html: 'r<sub>k</sub>', cls: 'l' }, { html: 'n<sub>k</sub>' }, { html: 'p(r<sub>k</sub>)' }, { html: 'Σ n<sub>j</sub>' }, 'cdf', '7 × cdf', { html: 's<sub>k</sub>' }],
    LV.map(k => [{ text: k, cls: 'l' }, n[k], (n[k] / 25).toFixed(2), cum[k], (cum[k] / 25).toFixed(2), (7 * cum[k] / 25).toFixed(2), { text: sK[k], cls: 'hl' }]));
  steps(viz('cdf-steps'), ['All'].concat(LV.map(k => 'k = ' + k)), k => {
    cols.forEach((g, i) => g.classList.toggle('dim', k > 0 && i > k - 1));
    tb.rows.forEach((r, i) => r.classList.toggle('on', k > 0 && i === k - 1));
    if (k === 0) {
      role('cdf-note').textContent = 'Running sum of nₖ, scaled by 7/25. The biggest step comes where the histogram is tallest: level 3 adds 8 pixels and lifts 7 × cdf by 8 × 7/25 = 2.24.';
      return;
    }
    const L = k - 1, v = (7 * cum[L] / 25).toFixed(2), cdf = (cum[L] / 25).toFixed(2);
    role('cdf-note').textContent = `k = ${L}: Σ n = ${n.slice(0, L + 1).join(' + ')} = ${cum[L]}. cdf = ${cum[L]}/25 = ${cdf}. 7 × ${cdf} = ${v}, rounded to s${SUBK[L]} = ${sK[L]}.`;
  });

  // Figure 3: LUT arrows between the input and output histograms
  const lu = svg(viz('lut'), 720, 330, { label: 'Look-up table from input levels to output levels, with the input histogram on the left and the output histogram on the right', minWidth: 560 });
  const ly = lev => 60 + (7 - lev) * 34, RX = 300, SX = 420, U = 22;
  s('text', { x: 190, y: 24, 'text-anchor': 'middle', class: 't-fg t-bold' }, lu, 'input histogram nₖ');
  s('text', { x: 530, y: 24, 'text-anchor': 'middle', class: 't-fg t-bold' }, lu, 'output histogram');
  s('text', { x: RX, y: 40, 'text-anchor': 'middle', class: 't-fg t-bold' }, lu, 'r');
  s('text', { x: SX, y: 40, 'text-anchor': 'middle', class: 't-fg t-bold' }, lu, 's');
  LV.forEach(k => {
    const w = 1 + n[k] * 0.6;
    if (n[k]) arrow(lu, RX + 14, ly(k), SX - 14, ly(sK[k]), { cls: 'a-pri', width: w, head: 7 + w });
    else arrow(lu, RX + 14, ly(k), SX - 14, ly(sK[k]), { cls: 'a-muted', dash: true, width: 1 });
  });
  LV.forEach(k => {
    const y = ly(k);
    if (n[k]) {
      s('rect', { x: RX - 20 - n[k] * U, y: y - 11, width: n[k] * U, height: 22, rx: 2, class: 'f-pri-soft' }, lu);
      s('text', { x: RX - 26 - n[k] * U, y, dy: '0.35em', 'text-anchor': 'end', class: 't-pri t-bold' }, lu, n[k]);
    } else s('text', { x: RX - 26, y, dy: '0.35em', 'text-anchor': 'end', class: 't-muted' }, lu, '0');
    if (ns[k]) {
      s('rect', { x: SX + 20, y: y - 11, width: ns[k] * U, height: 22, rx: 2, class: 'f-ok-soft' }, lu);
      s('text', { x: SX + 26 + ns[k] * U, y, dy: '0.35em', class: 't-ok t-bold' }, lu, k === 7 ? '4, from levels 5 and 6' : ns[k]);
    } else s('text', { x: SX + 26, y, dy: '0.35em', class: k > 0 ? 't-bad' : 't-muted' }, lu, k > 0 && k < 7 ? 'empty' : '0');
    [RX, SX].forEach(x => {
      s('circle', { cx: x, cy: y, r: 12, class: 'f-seg' }, lu);
      s('text', { x, y, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, lu, k);
    });
  });

  // Figure 4: original and equalized image
  const im = svg(viz('images'), 540, 254, { label: 'Original image with levels 1 to 6 and equalized image with levels 1 to 7', minWidth: 440 });
  [['original', 20, IMG, 'levels 1 to 6'], ['equalized', 340, EQ, 'levels 1 to 7']].forEach(([t, x, M, cap]) => {
    s('text', { x, y: 28, class: 't-fg t-bold' }, im, t);
    grayGrid(im, x, 40, M, 34);
    s('text', { x, y: 232 }, im, cap);
  });
  arrow(im, 206, 125, 326, 125, { label: 'LUT', labelCls: 't-fg t-bold', dy: -8 });
});

QV.register('s4-w4', function (q) {
  const { s, svg, axes, steps, box, arrow, line } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const role = n => q.querySelector(`[data-role="${n}"]`);

  // Figure 1: flow chart, bottom to top
  const fl = svg(viz('flow'), 640, 540, { label: 'Pattern recognition system: input, sensing, segmentation, feature extraction, classification, post-processing, decision, with three side inputs', minWidth: 500 });
  const BX = 150, BW = 220, BH = 42;
  const ST = [
    { name: 'post-processing', y: 60 },
    { name: 'classification', y: 152 },
    { name: 'feature extraction', y: 244 },
    { name: 'segmentation', y: 336 },
    { name: 'sensing', y: 428 },
  ];
  const SIDE = [
    { label: ['costs'], ly: 70, to: [[0, 70]] },
    { label: ['adjustments for', 'context'], ly: 133, to: [[0, 92], [1, 162]] },
    { label: ['adjustments for', 'missing features'], ly: 185, to: [[1, 185]] },
  ];
  const NOTES = [
    'Data flows up from input to decision: sensing, segmentation, feature extraction, classification, post-processing. Costs and context enter post-processing; context and missing features enter classification.',
    'Sensing: "use of a transducer (camera or microphone)". The system depends on the bandwidth, resolution, sensitivity and distortion of the transducer. No side input.',
    'Segmentation and grouping: "patterns should be well separated and should not overlap". No side input.',
    'Feature extraction: "discriminative features", "invariant features with respect to translation, rotation and scale". No side input.',
    'Classification: "use a feature vector provided by a feature extractor to assign the object to a category". Side inputs: adjustments for missing features, adjustments for context.',
    'Post-processing: "exploit context input dependent information other than from the target pattern itself to improve performance". Side inputs: costs, adjustments for context.',
  ];
  const layer = s('g', {}, fl);
  function draw(sel) {
    layer.textContent = '';
    arrow(layer, 260, ST[0].y, 260, 36, { cls: 'a-muted', width: 2 });
    s('text', { x: 260, y: 24, 'text-anchor': 'middle', class: 't-fg t-bold t-lg' }, layer, 'decision');
    arrow(layer, 260, 508, 260, ST[4].y + BH, { cls: 'a-muted', width: 2 });
    s('text', { x: 260, y: 528, 'text-anchor': 'middle', class: 't-fg t-bold t-lg' }, layer, 'input');
    for (let i = 0; i < 4; i++) {
      arrow(layer, 215, ST[i + 1].y, 215, ST[i].y + BH, { cls: 'a-muted', width: 2 });
      arrow(layer, 305, ST[i].y + BH, 305, ST[i + 1].y, { cls: 'a-muted', dash: true });
    }
    ST.forEach((st, i) => box(layer, BX, st.y, BW, BH, st.name, { cls: i === sel ? 'f-pri' : 'f-surface', textCls: (i === sel ? 't-on' : 't-fg') + ' t-lg t-bold' }));
    SIDE.forEach(sd => {
      const g = s('g', { class: sel != null && !sd.to.some(t => t[0] === sel) ? 'dim' : null }, layer);
      sd.label.forEach((l, j) => s('text', { x: 470, y: sd.ly + (j - (sd.label.length - 1) / 2) * 14, dy: '0.35em', class: 't-sec t-bold' }, g, l));
      if (sd.to.length > 1) {
        line(g, [[462, sd.ly], [420, sd.ly]], 's-sec');
        line(g, [[420, sd.to[0][1]], [420, sd.to[1][1]]], 's-sec');
        sd.to.forEach(t => arrow(g, 420, t[1], BX + BW + 2, t[1], { cls: 'a-sec', width: 2.5 }));
      } else arrow(g, 462, sd.to[0][1], BX + BW + 2, sd.to[0][1], { cls: 'a-sec', width: 2.5 });
    });
    line(layer, [[10, 482], [40, 482]], 's-muted');
    s('text', { x: 46, y: 482, dy: '0.35em' }, layer, 'data, up');
    s('line', { x1: 10, x2: 40, y1: 502, y2: 502, class: 's-muted dash' }, layer);
    s('text', { x: 46, y: 502, dy: '0.35em' }, layer, 'back down');
  }
  steps(viz('flow-steps'), ['All', 'Sensing', 'Segmentation', 'Feature extraction', 'Classification', 'Post-processing'], k => {
    draw(k === 0 ? null : 5 - k);
    role('flow-note').textContent = NOTES[k];
  });

  // Figure 2: 1-NN and 3-NN around x = [5, 5]
  const nn = svg(viz('nn'), 760, 380, { label: 'Training samples in the lightness-width plane, the new fish at (5, 5) and the circles holding its 1 and 3 nearest neighbours', minWidth: 560 });
  const ax = axes(nn, { x: 50, y: 24, w: 300, h: 300, xd: [0, 10], yd: [0, 10], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6, 8, 10], xl: 'lightness', yl: 'width' });
  const X = [5, 5];
  const P = [
    { id: 'S1', p: [2, 3], c: 'salmon', side: -1 },
    { id: 'S2', p: [3, 5], c: 'salmon', side: -1 },
    { id: 'S3', p: [4, 2], c: 'salmon', side: 1 },
    { id: 'B1', p: [6, 5], c: 'sea bass', side: 1 },
    { id: 'B2', p: [8, 8], c: 'sea bass', side: 1 },
  ].map(o => Object.assign(o, { d: Math.hypot(o.p[0] - X[0], o.p[1] - X[1]) }));
  const sorted = P.slice().sort((a, b) => a.d - b.d);
  const PX = ax.x(1) - ax.x(0);
  const lines = s('g', {}, nn), circ = s('g', {}, nn);
  P.forEach(o => {
    const [cx, cy] = [ax.x(o.p[0]), ax.y(o.p[1])];
    s('circle', { cx, cy, r: 7, class: o.c === 'salmon' ? 'f-pri' : 'f-sec' }, nn);
    s('text', { x: cx + o.side * 12, y: cy, dy: '0.35em', 'text-anchor': o.side < 0 ? 'end' : 'start', class: 't-fg t-bold halo' }, nn, o.id);
  });
  const [qx, qy] = [ax.x(X[0]), ax.y(X[1])];
  s('polygon', { points: `${qx},${qy - 9} ${qx + 9},${qy} ${qx},${qy + 9} ${qx - 9},${qy}`, class: 'f-ter' }, nn);
  s('text', { x: qx - 6, y: qy - 16, 'text-anchor': 'end', class: 't-ter t-bold halo' }, nn, 'x');
  s('text', { x: 420, y: 36, class: 't-fg t-bold' }, nn, 'distance to x, nearest first');
  const RY = i => 70 + i * 40;
  const rows = sorted.map((o, i) => {
    const g = s('g', { class: 'fade' }, nn);
    s('text', { x: 420, y: RY(i), dy: '0.35em', class: 't-fg t-bold' }, g, o.id);
    s('rect', { x: 456, y: RY(i) - 10, width: o.d * 45, height: 20, rx: 2, class: o.c === 'salmon' ? 'f-pri' : 'f-sec' }, g);
    s('text', { x: 462 + o.d * 45, y: RY(i), dy: '0.35em', class: 't-fg' }, g, o.d.toFixed(2) + ' ' + o.c);
    return g;
  });
  const cut = s('g', {}, nn);
  const verdict = s('text', { x: 420, y: 300, class: 't-fg t-bold t-lg' }, nn, '');
  const NOTES2 = [
    'Distances from x = [5, 5]: B1 1.00, S2 2.00, S3 3.16, S1 3.61, B2 4.24.',
    '1-NN: the nearest sample is B1 at d = 1. x takes its class: sea bass.',
    '3-NN: the three nearest are B1 (sea bass), S2 and S3 (salmon). Majority vote 2 to 1: salmon. The class changes.',
  ];
  steps(viz('nn-steps'), ['All distances', '1-NN', '3-NN'], k => {
    const kk = k === 0 ? 5 : k === 1 ? 1 : 3;
    lines.textContent = ''; circ.textContent = ''; cut.textContent = '';
    sorted.forEach((o, i) => {
      const near = i < kk;
      s('line', { x1: qx, y1: qy, x2: ax.x(o.p[0]), y2: ax.y(o.p[1]), class: (k > 0 && near ? 's-ter' : 's-muted dash'), style: 'stroke-width: ' + (k > 0 && near ? 2 : 1) + (k > 0 && !near ? '; opacity: 0.35' : '') }, lines);
      rows[i].classList.toggle('dim', k > 0 && !near);
    });
    if (k > 0) {
      s('circle', { cx: qx, cy: qy, r: sorted[kk - 1].d * PX, class: 'f-none s-ter dash', style: 'stroke-width: 1.5' }, circ);
      const y = RY(kk - 1) + 20;
      s('line', { x1: 416, x2: 740, y1: y, y2: y, class: 's-ter dash', style: 'stroke-width: 1.5' }, cut);
      s('text', { x: 740, y: y - 5, 'text-anchor': 'end', class: 't-ter t-bold' }, cut, 'k = ' + kk);
    }
    verdict.textContent = ['B1 < S2 < S3 < S1 < B2', '1-NN → sea bass', '3-NN → salmon, 2 to 1'][k];
    verdict.setAttribute('class', 't-bold t-lg ' + ['t-fg', 't-sec', 't-pri'][k]);
    role('nn-note').textContent = NOTES2[k];
  });
});

QV.register('s4-w5', function (q) {
  const { s, svg, steps, box } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const role = n => q.querySelector(`[data-role="${n}"]`);
  const SY = [['A', 10, '00'], ['B', 9, '01'], ['C', 6, '10'], ['D', 4, '110'], ['E', 3, '111']];
  const off = [0, 10, 19, 25, 29, 32];

  // Figure 1: Shannon-Fano splits on the sorted count bar, and the tree
  const sf = svg(viz('sf'), 740, 400, { label: 'Shannon-Fano: candidate cuts on the sorted counts, and the code tree A 00, B 01, C 10, D 110, E 111', minWidth: 560 });
  const U = 20, X0 = 50, BY = 30, BH = 30;
  const ux = u => X0 + u * U;
  const SPL = [
    { lo: 0, hi: 5, pick: 2, cuts: [[1, '10 | 22', 'diff 12'], [2, '19 | 13', 'diff 6'], [3, '25 | 7', 'diff 18']] },
    { lo: 0, hi: 2, pick: 1, cuts: [[1, '10 | 9', 'diff 1']] },
    { lo: 2, hi: 5, pick: 3, cuts: [[3, '6 | 7', 'diff 1'], [4, '10 | 3', 'diff 7']] },
    { lo: 3, hi: 5, pick: 4, cuts: [[4, '4 | 3', 'diff 1']] },
  ];
  const T = {
    root: { x: 370, y: 140, t: '32', at: 0 },
    n19: { x: 210, y: 210, t: '19', at: 1 }, n13: { x: 530, y: 210, t: '13', at: 1 },
    A: { x: 130, y: 280, leaf: 0, at: 2 }, B: { x: 290, y: 280, leaf: 1, at: 2 },
    C: { x: 450, y: 280, leaf: 2, at: 3 }, n7: { x: 610, y: 280, t: '7', at: 3 },
    D: { x: 550, y: 350, leaf: 3, at: 4 }, E: { x: 670, y: 350, leaf: 4, at: 4 },
  };
  const EDGES = [['root', 'n19', 0], ['root', 'n13', 1], ['n19', 'A', 0], ['n19', 'B', 1], ['n13', 'C', 0], ['n13', 'n7', 1], ['n7', 'D', 0], ['n7', 'E', 1]];
  const PARENT = [null, 'root', 'n19', 'n13', 'n7'];
  const NOTES = [
    'Final code: A 00, B 01, C 10, D 110, E 111. Every symbol sits at a leaf, so no codeword is a prefix of another.',
    'Split 1, all five symbols (32). Cutting after B gives 19 against 13, the smallest difference (6). {A,B} gets 0, {C,D,E} gets 1.',
    'Split 2, {A,B} (19). Only one cut: 10 against 9. A = 00, B = 01.',
    'Split 3, {C,D,E} (13). C alone gives 6 against 7 (diff 1); C and D give 10 against 3 (diff 7). C = 10, {D,E} = 11.',
    'Split 4, {D,E} (7). 4 against 3. D = 110, E = 111.',
  ];
  const layer = s('g', {}, sf);
  steps(viz('sf-steps'), ['All', 'Split 1', 'Split 2', 'Split 3', 'Split 4'], k => {
    layer.textContent = '';
    const sp = k > 0 ? SPL[k - 1] : null;
    SY.forEach(([sym, cnt], i) => {
      let cls = 'f-pri-soft', dim = false;
      if (sp) {
        if (i < sp.lo || i >= sp.hi) { cls = 'f-seg'; dim = true; } else cls = i < sp.pick ? 'f-pri-soft' : 'f-sec-soft';
      }
      const g = s('g', { class: dim ? 'dim' : null }, layer);
      s('rect', { x: ux(off[i]), y: BY, width: cnt * U, height: BH, class: cls + ' sep' }, g);
      s('text', { x: ux(off[i] + cnt / 2), y: BY + BH / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, g, sym + ' ' + cnt);
    });
    if (!sp) {
      [1, 2, 3, 4].forEach(i => s('line', { x1: ux(off[i]), x2: ux(off[i]), y1: BY - 5, y2: BY + BH + 5, class: 's-ok' }, layer));
      SY.forEach(([, cnt, code], i) => s('text', { x: ux(off[i] + cnt / 2), y: BY + BH + 20, 'text-anchor': 'middle', class: 't-pri t-bold' }, layer, code));
    } else {
      sp.cuts.forEach(([i, bal, diff]) => {
        const on = i === sp.pick;
        s('line', { x1: ux(off[i]), x2: ux(off[i]), y1: BY - 5, y2: BY + BH + 5, class: on ? 's-ok' : 's-muted dash', style: on ? null : 'stroke-width: 2' }, layer);
        s('text', { x: ux(off[i]), y: BY + BH + 20, 'text-anchor': 'middle', class: on ? 't-ok t-bold' : 't-muted' }, layer, bal);
        s('text', { x: ux(off[i]), y: BY + BH + 34, 'text-anchor': 'middle', class: on ? 't-ok t-bold' : 't-muted' }, layer, diff);
      });
    }
    const lim = k === 0 ? 4 : k;
    EDGES.forEach(([a, b, bit]) => {
      if (T[b].at > lim) return;
      const [p, c] = [T[a], T[b]];
      s('line', { x1: p.x, y1: p.y, x2: c.x, y2: c.y, class: 's-muted' }, layer);
      s('text', { x: (p.x + c.x) / 2 + (bit ? 10 : -10), y: (p.y + c.y) / 2 - 4, 'text-anchor': bit ? 'start' : 'end', class: (bit ? 't-sec' : 't-pri') + ' t-bold' }, layer, bit);
    });
    Object.keys(T).forEach(key => {
      const nd = T[key];
      if (nd.at > lim) return;
      let cls = 'f-surface', tc = 't-fg';
      if (k > 0 && PARENT[k] === key) { cls = 'f-pri'; tc = 't-on'; }
      if (k > 0 && nd.at === k) {
        const left = EDGES.some(([, b, bit]) => b === key && bit === 0);
        cls = left ? 'f-pri-soft' : 'f-sec-soft';
      }
      if (nd.leaf != null) {
        const [sym, cnt, code] = SY[nd.leaf];
        box(layer, nd.x - 28, nd.y - 14, 56, 28, sym + ' ' + cnt, { cls: cls === 'f-surface' && k === 0 ? 'f-pri-soft' : cls, textCls: tc + ' t-bold' });
        s('text', { x: nd.x, y: nd.y + 30, 'text-anchor': 'middle', class: 't-pri t-bold' }, layer, code);
      } else {
        s('circle', { cx: nd.x, cy: nd.y, r: 17, class: cls + ' box' }, layer);
        s('text', { x: nd.x, y: nd.y, dy: '0.35em', 'text-anchor': 'middle', class: tc + ' t-bold' }, layer, nd.t);
      }
    });
    role('sf-note').textContent = NOTES[k];
  });

  // Figure 2: bits per symbol, fixed length against Shannon-Fano and the entropy bound
  const bt = svg(viz('bits'), 760, 190, { label: 'Total bits: fixed length 96, Shannon-Fano 71, entropy bound 69.99', minWidth: 560 });
  const G = { lab: 130, px: 6, rowH: 30, rows: [12, 56, 100], axis: 144 };
  for (let b = 0; b <= 100; b += 10) {
    s('line', { x1: G.lab + b * G.px, x2: G.lab + b * G.px, y1: 4, y2: G.axis, class: 'l-grid' }, bt);
    if (b % 20 === 0) s('text', { x: G.lab + b * G.px, y: G.axis + 16, 'text-anchor': 'middle' }, bt, b + (b === 100 ? ' bits' : ''));
  }
  s('line', { x1: G.lab, x2: G.lab + 100 * G.px, y1: G.axis, y2: G.axis, class: 'l-axis' }, bt);
  [
    { name: 'fixed length', total: '32 × 3 = 96 bits', cls: 't-sec', fill: 'f-sec', text: 't-on', parts: SY.map(([sym, c]) => [sym + ' ' + c * 3, c * 3]) },
    { name: 'Shannon-Fano', total: '71 bits', cls: 't-pri', fill: 'f-pri', text: 't-on', parts: SY.map(([sym, c, code]) => [sym + ' ' + c * code.length, c * code.length]) },
    { name: 'entropy bound', total: '69.99 bits', cls: 't-fg', fill: 'f-seg', text: 't-fg', parts: [['32 × 2.187 = 69.99', 32 * 2.187085]] },
  ].forEach((row, ri) => {
    const y = G.rows[ri];
    s('text', { x: 0, y: y + 10, dy: '0.35em', class: row.cls + ' t-bold' }, bt, row.name);
    s('text', { x: 0, y: y + 24, dy: '0.35em', class: 't-sm' }, bt, row.total);
    let x = G.lab;
    row.parts.forEach(([label, bits]) => {
      const w = bits * G.px;
      s('rect', { x, y, width: w, height: G.rowH, class: row.fill + ' sep' }, bt);
      s('text', { x: x + w / 2, y: y + G.rowH / 2, dy: '0.35em', 'text-anchor': 'middle', class: row.text }, bt, label);
      x += w;
    });
  });

  // Figure 3: run-length coding of X and Y
  const rl = svg(viz('rle'), 840, 316, { label: 'Run-length coding: X, 30 symbols, becomes 12 symbols; Y, 5 symbols, becomes 10', minWidth: 560 });
  const CW = 24, RX0 = 110;
  const runsOf = str => {
    const out = [];
    for (const ch of str) {
      const last = out[out.length - 1];
      if (last && last.ch === ch) last.n++; else out.push({ ch, n: 1 });
    }
    return out;
  };
  function rle(str, yIn, yOut, name, outName, ratio, ratioCls) {
    const runs = runsOf(str);
    let i = 0;
    runs.forEach((r, k) => {
      const fill = k % 2 ? 'f-ter-soft' : 'f-pri-soft';
      for (let j = 0; j < r.n; j++, i++) {
        s('rect', { x: RX0 + i * CW, y: yIn, width: CW, height: CW, class: fill + ' sep' }, rl);
        s('text', { x: RX0 + i * CW + CW / 2, y: yIn + CW / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, rl, r.ch);
      }
      const cIn = RX0 + (i - r.n / 2) * CW, cOut = RX0 + (2 * k + 1) * CW;
      s('line', { x1: cIn, y1: yIn + CW + 4, x2: cOut, y2: yOut - 4, class: 's-muted', style: 'stroke-width: 1' }, rl);
      s('rect', { x: RX0 + 2 * k * CW, y: yOut, width: CW, height: CW, class: 'f-pri sep' }, rl);
      s('text', { x: RX0 + 2 * k * CW + CW / 2, y: yOut + CW / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, rl, r.n);
      s('rect', { x: RX0 + (2 * k + 1) * CW, y: yOut, width: CW, height: CW, class: fill + ' sep' }, rl);
      s('text', { x: RX0 + (2 * k + 1) * CW + CW / 2, y: yOut + CW / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, rl, r.ch);
    });
    [[yIn, name, str.length], [yOut, outName, runs.length * 2]].forEach(([y, nm, len]) => {
      s('text', { x: 0, y: y + 8, dy: '0.35em', class: 't-fg t-bold' }, rl, nm);
      s('text', { x: 0, y: y + 22, dy: '0.35em', class: 't-sm' }, rl, len + ' symbols');
    });
    s('text', { x: RX0 + runs.length * 2 * CW + 14, y: yOut + CW / 2, dy: '0.35em', class: ratioCls + ' t-bold t-lg' }, rl, ratio);
  }
  rle('KKKKKKKMMMNNNNNNNNNPKKKKSSSSSS', 24, 104, 'X', 'RLE(X)', 'ratio 30 / 12 = 2.5', 't-ok');
  s('line', { x1: 0, x2: 840, y1: 160, y2: 160, class: 's-line' }, rl);
  rle('PQRST', 190, 270, 'Y', 'RLE(Y)', 'ratio 5 / 10 = 0.5, twice as long', 't-bad');
});

QV.register('s4-w6', function (q) {
  const { s, svg, steps, slider } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const role = n => q.querySelector(`[data-role="${n}"]`);

  // Figure 1: WAV and MIDI sizes as areas
  const WAV = 44100 * 2 * 2 * 180, MIDI = 3000;
  const sz = svg(viz('size'), 660, 360, { label: 'Area comparison: 3 minutes of CD-quality WAV, 31,752,000 bytes, against about 3,000 bytes of MIDI', minWidth: 480 });
  const side = 300, small = side / Math.sqrt(WAV / MIDI);
  s('rect', { x: 30, y: 30, width: side, height: side, class: 'f-sec-soft' }, sz);
  s('rect', { x: 30, y: 30, width: side, height: side, class: 'f-none s-sec' }, sz);
  s('text', { x: 180, y: 160, 'text-anchor': 'middle', class: 't-sec t-bold t-lg' }, sz, 'WAV, 3 min');
  s('text', { x: 180, y: 180, 'text-anchor': 'middle', class: 't-fg' }, sz, '31,752,000 bytes');
  s('text', { x: 180, y: 198, 'text-anchor': 'middle', class: 't-fg' }, sz, '≈ 31.75 MB');
  const mx = 372, my = 330 - small;
  s('rect', { x: mx, y: my, width: small, height: small, class: 'f-pri' }, sz);
  s('circle', { cx: mx + small / 2, cy: my + small / 2, r: 12, class: 's-pri', style: 'stroke-width: 1.5' }, sz);
  s('text', { x: 394, y: 316, class: 't-pri t-bold t-lg' }, sz, 'MIDI, 3 min');
  s('text', { x: 394, y: 334, class: 't-fg' }, sz, 'about 3,000 bytes');
  [
    [48, 't-fg t-bold', 'WAV stores samples'],
    [66, '', '44,100 per second'],
    [82, '', 'for each of 2 channels,'],
    [98, '', '16 bits each'],
    [150, 't-fg t-bold', 'MIDI stores events'],
    [168, '', 'Note On, key, velocity:'],
    [184, '', 'a few bytes per note'],
    [236, 't-fg t-bold', 'ratio ≈ 10,584'],
    [254, '', 'MIDI squares per WAV square'],
  ].forEach(([y, cls, t]) => s('text', { x: 372, y, class: cls || null }, sz, t));

  // Figure 2: bit fields of the three bytes, channel adjustable
  const by = svg(viz('bytes'), 780, 150, { label: 'Note On message bytes: status 1001 0101, key 0100 0011, velocity 0101 1010', minWidth: 560 });
  const BW = 26, BXS = [40, 292, 544], Y0 = 48;
  const bl = s('g', {}, by);
  const hex = v => '&H' + v.toString(16).toUpperCase().padStart(2, '0');
  const bits = v => v.toString(2).padStart(8, '0').split('');
  function drawBytes(ch) {
    bl.textContent = '';
    s('text', { x: 0, y: Y0 + 13, dy: '0.35em', class: 't-sm' }, bl, 'bits');
    s('text', { x: 0, y: Y0 + 42, dy: '0.35em', class: 't-sm' }, bl, 'hex');
    const BY = [
      { title: 'status byte', v: 144 + ch, fields: [[0, 1, 'f-ter', 'MSB 1', 'status'], [1, 4, 'f-pri', 'type 001', 'Note On'], [4, 8, 'f-sec', 'n = ' + bits(ch).slice(4).join(''), 'channel ' + ch]] },
      { title: 'data byte 1', v: 67, fields: [[0, 1, 'f-ter', 'MSB 0', 'data'], [1, 8, 'f-seg', '1000011', 'key 67']] },
      { title: 'data byte 2', v: 90, fields: [[0, 1, 'f-ter', 'MSB 0', 'data'], [1, 8, 'f-seg', '1011010', 'velocity 90']] },
    ];
    BY.forEach((b, i) => {
      const x0 = BXS[i], bt = bits(b.v);
      s('text', { x: x0, y: 16, class: 't-fg t-bold' }, bl, b.title);
      s('text', { x: x0, y: 34, class: 't-fg' }, bl, `${hex(b.v)} = ${b.v}`);
      b.fields.forEach(([a, z, fill, l1, l2]) => {
        for (let k = a; k < z; k++) {
          s('rect', { x: x0 + k * BW, y: Y0, width: BW, height: BW, class: fill + ' sep' }, bl);
          s('text', { x: x0 + k * BW + BW / 2, y: Y0 + BW / 2, dy: '0.35em', 'text-anchor': 'middle', class: (fill === 'f-seg' ? 't-fg' : 't-on') + ' t-bold' }, bl, bt[k]);
        }
        const cx = x0 + (a + z) * BW / 2;
        s('line', { x1: x0 + a * BW + 3, x2: x0 + z * BW - 3, y1: Y0 + 58, y2: Y0 + 58, class: 's-muted', style: 'stroke-width: 1' }, bl);
        s('text', { x: cx, y: Y0 + 74, 'text-anchor': 'middle', class: 't-fg' }, bl, l1);
        s('text', { x: cx, y: Y0 + 90, 'text-anchor': 'middle', class: 't-sm' }, bl, l2);
      });
      const hx = b.v.toString(16).toUpperCase().padStart(2, '0');
      s('text', { x: x0 + 2 * BW, y: Y0 + 42, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, bl, hx[0]);
      s('text', { x: x0 + 6 * BW, y: Y0 + 42, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, bl, hx[1]);
    });
  }
  slider(viz('chan'), { label: 'channel n', min: 0, max: 15, step: 1, value: 5 }, v => drawBytes(v));

  // Figure 3: 10-bit frames and messages on the 31.25 kbps line
  const wr = svg(viz('wire'), 760, 262, { label: 'Serial timing: one message is 30 bits or 0.96 ms; five Note On take 4.8 ms; adding five Note Off takes 9.6 ms', minWidth: 560 });
  const ZX = 80, BIT = 20, ZY = 40, TX = 80, MS = 62.5, TY = 150;
  s('polygon', { points: `${ZX},${ZY + 24} ${ZX + 30 * BIT},${ZY + 24} ${TX + 0.96 * MS},${TY} ${TX},${TY}`, class: 'area-pri' }, wr);
  ['&H95', '&H43', '&H5A'].forEach((h, f) => {
    const x = ZX + f * 10 * BIT;
    s('rect', { x, y: ZY, width: BIT, height: 24, class: 'f-seg sep' }, wr);
    s('rect', { x: x + BIT, y: ZY, width: 8 * BIT, height: 24, class: 'f-pri-soft sep' }, wr);
    for (let k = 1; k < 8; k++) s('line', { x1: x + BIT + k * BIT, x2: x + BIT + k * BIT, y1: ZY + 16, y2: ZY + 24, class: 's-line' }, wr);
    s('text', { x: x + 5 * BIT, y: ZY + 10, dy: '0.35em', 'text-anchor': 'middle', class: 't-pri t-bold' }, wr, h);
    s('rect', { x: x + 9 * BIT, y: ZY, width: BIT, height: 24, class: 'f-seg sep' }, wr);
  });
  s('text', { x: ZX + BIT / 2, y: ZY - 8, 'text-anchor': 'middle', class: 't-sm' }, wr, 'start');
  s('text', { x: ZX + 5 * BIT, y: ZY - 8, 'text-anchor': 'middle', class: 't-sm' }, wr, '8 data bits');
  s('text', { x: ZX + 9.5 * BIT, y: ZY - 8, 'text-anchor': 'middle', class: 't-sm' }, wr, 'stop');
  s('text', { x: ZX + 30 * BIT + 10, y: ZY + 12, dy: '0.35em', class: 't-fg t-bold' }, wr, '30 bits');
  s('text', { x: 380, y: 92, 'text-anchor': 'middle', class: 't-fg halo' }, wr, 'one message = 3 bytes × 10 bits = 30 bits, 30 / 31,250 = 0.96 ms');
  const blocks = [];
  for (let i = 0; i < 10; i++) {
    const g = s('g', { class: 'fade' }, wr), x = TX + i * 0.96 * MS, on = i < 5;
    s('rect', { x, y: TY, width: 0.96 * MS, height: 30, class: (on ? 'f-pri' : 'f-sec') + ' sep' }, g);
    s('text', { x: x + 0.48 * MS, y: TY + 15, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, g, on ? 'On' : 'Off');
    blocks.push(g);
  }
  s('line', { x1: TX, x2: TX + 9.6 * MS, y1: TY + 42, y2: TY + 42, class: 'l-axis' }, wr);
  [0, 2, 4, 6, 8].forEach(t => {
    s('line', { x1: TX + t * MS, x2: TX + t * MS, y1: TY + 42, y2: TY + 47, class: 'l-axis' }, wr);
    s('text', { x: TX + t * MS, y: TY + 60, 'text-anchor': 'middle' }, wr, t === 8 ? '8 ms' : t);
  });
  const br = s('g', {}, wr);
  const CASES = [
    [1, '0.96 ms', 'One Note On message: 3 bytes × 10 bits = 30 bits. 30 / 31,250 = 0.00096 s = 0.96 ms.'],
    [5, '4.8 ms', 'Chord of 5 notes, Note On only: 5 × 30 = 150 bits, 0.0048 s = 4.8 ms. The fifth note starts 3.84 ms after the first.'],
    [10, '9.6 ms', 'With the 5 Note Off messages (status &H85): 300 bits, 0.0096 s = 9.6 ms.'],
  ];
  steps(viz('wire-steps'), ['One Note On', '5-note chord', '+ 5 Note Off'], k => {
    const [m, label, note] = CASES[k];
    blocks.forEach((g, i) => g.classList.toggle('dim', i >= m));
    br.textContent = '';
    const x2 = TX + m * 0.96 * MS, y = TY + 78;
    s('path', { d: `M${TX} ${y - 6} V${y} H${x2} V${y - 6}`, class: 's-ok', style: 'stroke-width: 2' }, br);
    s('text', { x: (TX + x2) / 2, y: y + 18, 'text-anchor': 'middle', class: 't-ok t-bold t-lg' }, br, label);
    role('wire-note').textContent = note;
  }, 2);
});

QV.register('s4-w7', function (q) {
  const { s, svg, axes } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const comma = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const lg = Math.log10;
  const dIc = (parent, attrs, rest) => {
    const t = s('text', attrs, parent, 'ΔI');
    s('tspan', { 'baseline-shift': 'sub', class: 't-sm' }, t, 'c');
    s('tspan', {}, t, rest);
    return t;
  };

  // Figure 1: the just noticeable step against equal-length backgrounds
  const wb = svg(viz('weber'), 750, 184, { label: 'Weber ratio: 4 on 80 is 5 percent, 0.5 on 2 is 25 percent', minWidth: 560 });
  const BX = 140, BL = 360;
  [
    { y: 40, name: 'bright, I = 80', sub: 'photopic: cones', dI: '4', r: 0.05, k: 'pri', ratio: '4 / 80 = 0.05', verdict: 'good discrimination' },
    { y: 122, name: 'dim, I = 2', sub: 'scotopic: rods', dI: '0.5', r: 0.25, k: 'sec', ratio: '0.5 / 2 = 0.25', verdict: 'poor discrimination' },
  ].forEach(R => {
    s('text', { x: 0, y: R.y + 12, class: 't-fg t-bold' }, wb, R.name);
    s('text', { x: 0, y: R.y + 28 }, wb, R.sub);
    s('rect', { x: BX, y: R.y, width: BL, height: 32, class: 'f-' + R.k + '-soft' }, wb);
    s('text', { x: BX + BL / 2, y: R.y + 16, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, wb, 'background I, drawn at 100%');
    s('rect', { x: BX + BL, y: R.y, width: BL * R.r, height: 32, class: 'f-' + R.k }, wb);
    dIc(wb, { x: BX + BL, y: R.y - 8, class: 't-' + R.k + ' t-bold' }, ` = ${R.dI}  (+${Math.round(R.r * 100)}%)`);
    s('text', { x: 600, y: R.y + 12, class: 't-' + R.k + ' t-bold t-lg' }, wb, R.ratio);
    s('text', { x: 600, y: R.y + 30, class: 't-fg' }, wb, R.verdict);
  });

  const yf = v => comma(10 ** v);

  // Figure 2: f = i · r on a log scale
  const fm = svg(viz('formation'), 640, 340, { label: 'Page and ink values under office light and on a cloudy day, log scale: both pairs are a factor 15 apart', minWidth: 500 });
  const ax = axes(fm, { x: 80, y: 28, w: 520, h: 256, xd: [0, 2], yd: [1, 5], yt: [1, 2, 3, 4, 5], yf, yl: 'f = i · r (log scale)' });
  [
    { c: 0.5, name: 'office', i: 1000 },
    { c: 1.5, name: 'cloudy day', i: 10000 },
  ].forEach(C => {
    const x = ax.x(C.c), page = 0.75 * C.i, ink = 0.05 * C.i;
    s('line', { x1: x - 50, x2: x + 50, y1: ax.y(lg(C.i)), y2: ax.y(lg(C.i)), class: 's-muted dash' }, fm);
    s('text', { x: x + 56, y: ax.y(lg(C.i)), dy: '0.35em', class: 't-muted' }, fm, 'i = ' + comma(C.i));
    s('path', { d: `M${x + 18} ${ax.y(lg(page))} h6 V${ax.y(lg(ink))} h-6`, class: 's-fg', style: 'stroke-width: 1.5' }, fm);
    s('text', { x: x + 30, y: (ax.y(lg(page)) + ax.y(lg(ink))) / 2, dy: '0.35em', class: 't-fg t-bold' }, fm, '× 15');
    [[page, 'pri', 'page '], [ink, 'sec', 'ink ']].forEach(([v, k, t]) => {
      s('circle', { cx: x, cy: ax.y(lg(v)), r: 7, class: 'f-' + k }, fm);
      s('text', { x: x - 14, y: ax.y(lg(v)), dy: '0.35em', 'text-anchor': 'end', class: 't-' + k + ' t-bold' }, fm, t + comma(v));
    });
    s('text', { x, y: 306, 'text-anchor': 'middle', class: 't-fg t-bold' }, fm, C.name);
    s('text', { x, y: 322, 'text-anchor': 'middle' }, fm, 'i = ' + comma(C.i) + ' lm/m²');
  });

  // Figure 3: sensor range against the scene range
  const rg = svg(viz('range'), 640, 330, { label: 'Sensor range from noise 8 to saturation 12,000 holds the scene values 50 to 7,500', minWidth: 500 });
  const ax3 = axes(rg, { x: 80, y: 28, w: 520, h: 256, xd: [0, 3], yd: [0, 5], yt: [0, 1, 2, 3, 4, 5], yf, yl: 'intensity (log scale)' });
  const ys = ax3.y(lg(12000)), yn = ax3.y(lg(8));
  s('rect', { x: ax3.x(0), y: ys, width: ax3.x(3) - ax3.x(0), height: yn - ys, class: 'area-pri' }, rg);
  [[ys, 'saturation 12,000'], [yn, 'noise level 8']].forEach(([y, t]) => {
    s('line', { x1: ax3.x(0), x2: ax3.x(3), y1: y, y2: y, class: 's-bad dash', style: 'stroke-width: 1.5' }, rg);
    s('text', { x: ax3.x(3) - 4, y: y - 6, 'text-anchor': 'end', class: 't-bad t-bold' }, rg, t);
  });
  const bracket = (x, y1, y2, l1, l2, cls) => {
    s('path', { d: `M${x - 6} ${y1} H${x} V${y2} H${x - 6}`, class: 's-fg', style: 'stroke-width: 1.5' }, rg);
    s('text', { x: x + 8, y: (y1 + y2) / 2 - 8, class: cls + ' t-bold' }, rg, l1);
    s('text', { x: x + 8, y: (y1 + y2) / 2 + 8, class: cls + ' t-bold' }, rg, l2);
  };
  bracket(ax3.x(0.3), ys, yn, 'sensor', '1,500 : 1', 't-pri');
  [[1.2, 'office', 750, 50], [1.8, 'cloudy', 7500, 500]].forEach(([c, name, page, ink]) => {
    const x = ax3.x(c);
    [[page, 'pri', 'page '], [ink, 'sec', 'ink ']].forEach(([v, k, t]) => {
      s('circle', { cx: x, cy: ax3.y(lg(v)), r: 6, class: 'f-' + k }, rg);
      s('text', { x: x + 11, y: ax3.y(lg(v)), dy: '0.35em', class: 't-' + k + ' t-bold halo' }, rg, t + comma(v));
    });
    s('text', { x, y: ax3.y(0) + 18, 'text-anchor': 'middle', class: 't-fg t-bold' }, rg, name);
  });
  bracket(ax3.x(2.45), ax3.y(lg(7500)), ax3.y(lg(50)), 'scene', '150 : 1', 't-ok');
});

QV.register('s4-w8', function (q) {
  const { s, svg, grid, mat, steps, gray, axes, line, arrow } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const role = n => q.querySelector(`[data-role="${n}"]`);
  const W1 = [[50, 30, 10], [70, 40, 20], [90, 60, 30]];
  const W2 = [[30, 32, 30], [28, 110, 30], [30, 30, 34]];
  const HR = [[1, 0, -1], [1, 0, -1], [1, 0, -1]], HC = [[-1, -1, -1], [0, 0, 0], [1, 1, 1]];
  const LAP = [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]];
  const neg = v => (v < 0 ? '−' + -v : String(v));
  const signFill = v => (v > 0 ? 'f-pri-soft' : v < 0 ? 'f-sec-soft' : 'f-seg');
  const signGrid = (g, x, y, data, cell) => grid(g, { x, y, data, cell, fill: signFill, text: neg, textCls: v => (v ? 't-fg' : 't-muted') });
  const grayGrid = (g, x, y, data, cell) => grid(g, { x, y, data, cell, fill: v => gray(v) });
  const sub = (parent, attrs, base, low) => {
    const t = s('text', attrs, parent, base);
    s('tspan', { 'baseline-shift': 'sub', class: 't-sm' }, t, low);
    return t;
  };

  const given = viz('given');
  mat(given, W1, { caption: 'W1', hl: (v, r, c) => (r === 1 && c === 1 ? 'org' : null) });
  mat(given, W2, { caption: 'W2', hl: (v, r, c) => (r === 1 && c === 1 ? 'org' : null) });
  mat(given, HR, { caption: 'Prewitt row mask', text: neg });
  mat(given, HC, { caption: 'Prewitt column mask', text: neg });
  mat(given, LAP, { caption: 'Laplacian', text: neg });

  // Figure 1: a blurred step edge and its first and second differences
  const NS = 49, C0 = 24;
  const clean = [...Array(NS).keys()].map(i => 30 + 50 / (1 + Math.exp(-(i - C0) / 1.6)));
  let seed = 12345;
  const noise = clean.map(() => { seed = (seed * 16807) % 2147483647; return (seed / 2147483647 - 0.5) * 1.6; });
  const d1 = f => f.map((v, i) => (i > 0 && i < NS - 1 ? (f[i + 1] - f[i - 1]) / 2 : null));
  const d2 = f => f.map((v, i) => (i > 0 && i < NS - 1 ? f[i + 1] - 2 * v + f[i - 1] : null));
  const dv = svg(viz('deriv'), 700, 440, { label: 'Edge profile, its first derivative with one peak, and its second derivative with a zero crossing at the edge', minWidth: 540 });
  const layer = s('g', {}, dv);
  const PAN = [
    { y: 30, h: 100, yd: [0, 100], yt: [0, 50, 100], yl: 'f(x), intensity' },
    { y: 170, h: 80, yd: [-2, 9], yt: [0, 4, 8], yl: 'f′(x), first derivative' },
    { y: 290, h: 100, yd: [-4, 4], yt: [-4, 0, 4], yl: 'f″(x), second derivative' },
  ];
  const curve = (ax, ys, cls) => line(layer, ys.map((v, i) => (v == null ? null : [ax.x(i), ax.y(v)])).filter(Boolean), cls);
  steps(viz('deriv-steps'), ['Clean edge', 'Noisy edge'], k => {
    layer.textContent = '';
    const f = k ? clean.map((v, i) => v + noise[i]) : clean;
    const F = [f, d1(f), d2(f)];
    const axs = PAN.map((p, j) => axes(layer, { x: 60, y: p.y, w: 600, h: p.h, xd: [0, NS - 1], yd: p.yd, yt: p.yt, xt: j === 2 ? [0, 12, 24, 36, 48] : [], xl: j === 2 ? 'position x (pixels)' : null, yl: p.yl }));
    axs.slice(1).forEach(ax => s('line', { x1: ax.x(0), x2: ax.x(NS - 1), y1: ax.y(0), y2: ax.y(0), class: 'l-axis' }, layer));
    s('line', { x1: axs[0].x(C0), x2: axs[0].x(C0), y1: 30, y2: 390, class: 's-muted dash', style: 'stroke-width: 1' }, layer);
    s('text', { x: axs[0].x(C0) - 6, y: 44, 'text-anchor': 'end', class: 't-fg' }, layer, 'edge centre');
    F.forEach((ys, j) => curve(axs[j], ys, j === 2 ? 's-sec' : 's-pri'));
    const zc = F[2].reduce((t, v, i) => t + (v != null && F[2][i + 1] != null && v * F[2][i + 1] < 0 ? 1 : 0), 0);
    if (!k) {
      s('text', { x: axs[1].x(C0 + 3) + 10, y: axs[1].y(7.2), dy: '0.35em', class: 't-pri t-bold' }, layer, 'one spike');
      s('text', { x: axs[2].x(C0 - 2) - 10, y: axs[2].y(2.4), 'text-anchor': 'end', class: 't-sec t-bold' }, layer, '+ lobe');
      s('text', { x: axs[2].x(C0 + 2) + 10, y: axs[2].y(-2.4), dy: '0.7em', class: 't-sec t-bold' }, layer, '− lobe');
      s('circle', { cx: axs[2].x(C0), cy: axs[2].y(0), r: 5, class: 'f-ok' }, layer);
      s('text', { x: axs[2].x(C0) + 10, y: axs[2].y(0) - 8, class: 't-ok t-bold' }, layer, 'zero crossing');
    } else {
      s('text', { x: axs[1].x(C0 + 3) + 10, y: axs[1].y(7.2), dy: '0.35em', class: 't-pri t-bold' }, layer, 'spike still clear');
      s('text', { x: axs[2].x(30), y: axs[2].y(3.4), class: 't-bad t-bold halo' }, layer, zc + ' sign changes, one is the edge');
    }
    role('deriv-note').textContent = k
      ? `Noise of at most ±0.8 gray levels, invisible in f, is added. f′ still has one clear peak. f″ combines three noisy samples with weights 1, −2, 1, so the noise grows, and f″ now changes sign ${zc} times.`
      : 'Clean edge: f′ has one peak at the edge. f″ has a positive lobe, then a negative lobe, and crosses zero once, at the edge centre (x = 24).';
  });

  // Figure 2: Roberts, Prewitt and Sobel masks
  const mk = svg(viz('masks'), 760, 230, { label: 'Roberts, Prewitt and Sobel row and column masks with their properties', minWidth: 560 });
  [
    { name: 'Roberts', hr: [[0, 0, -1], [0, 1, 0], [0, 0, 0]], hc: [[-1, 0, 0], [0, 1, 0], [0, 0, 0]], lines: ['smaller effective area', 'diagonal differences', 'more susceptible to noise'] },
    { name: 'Prewitt', hr: HR, hc: HC, lines: ['weights 1 1 1', 'more sensitive to vertical', 'and horizontal edges than', 'diagonal edges'] },
    { name: 'Sobel', hr: [[1, 0, -1], [2, 0, -2], [1, 0, -1]], hc: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]], lines: ['weights 1 2 1, smooths', 'more sensitive to diagonal', 'edges than vertical and', 'horizontal edges'] },
  ].forEach((fam, i) => {
    const gx = 20 + i * 250;
    s('text', { x: gx, y: 18, class: 't-fg t-bold t-lg' }, mk, fam.name);
    sub(mk, { x: gx, y: 40, class: 't-fg' }, 'H', 'r');
    sub(mk, { x: gx + 110, y: 40, class: 't-fg' }, 'H', 'c');
    signGrid(mk, gx, 52, fam.hr, 30);
    signGrid(mk, gx + 110, 52, fam.hc, 30);
    fam.lines.forEach((l, j) => s('text', { x: gx, y: 166 + j * 15, class: j === 0 ? 't-fg' : null }, mk, l));
  });

  // Figure 3: Prewitt responses at W1 and the gradient vector
  const pw = svg(viz('prewitt'), 720, 290, { label: 'W1 times the Prewitt row mask gives 150, times the column mask gives 90', minWidth: 560 });
  [['W1', 100], ['mask', 220], ['W1 × mask', 340]].forEach(([t, x]) => s('text', { x, y: 30, class: 't-fg t-bold' }, pw, t));
  [
    { y: 42, M: HR, low: 'r', name: 'row mask', calc: ['left − right', '210 − 60 = 150'] },
    { y: 174, M: HC, low: 'c', name: 'column mask', calc: ['bottom − top', '180 − 90 = 90'] },
  ].forEach(R => {
    sub(pw, { x: 0, y: R.y + 40, class: 't-fg t-bold t-lg' }, 'H', R.low);
    s('text', { x: 0, y: R.y + 58 }, pw, R.name);
    grid(pw, { x: 100, y: R.y, data: W1, cell: 30, fill: v => gray(v) });
    s('text', { x: 205, y: R.y + 45, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg' }, pw, '×');
    signGrid(pw, 220, R.y, R.M, 30);
    s('text', { x: 325, y: R.y + 45, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg' }, pw, '=');
    signGrid(pw, 340, R.y, W1.map((row, i) => row.map((v, j) => v * R.M[i][j])), 30);
    s('text', { x: 450, y: R.y + 34, class: 't-fg' }, pw, R.calc[0]);
    sub(pw, { x: 450, y: R.y + 58, class: 't-pri t-bold t-lg' }, 'H', R.low);
    s('text', { x: 472, y: R.y + 58, class: 't-pri t-bold t-lg' }, pw, '= ' + R.calc[1]);
  });

  const vc = svg(viz('vector'), 560, 270, { label: 'Gradient vector with legs 150 and 90: magnitude 174.93, sum of absolute values 240, angle 30.96 degrees', minWidth: 460 });
  const O = [70, 230], K = 2, P = [O[0] + 150 * K, O[1] - 90 * K];
  s('path', { d: `M${O[0]} ${O[1]} H${P[0]} V${P[1]}`, class: 's-sec' }, vc);
  arrow(vc, O[0], O[1], P[0], P[1], { cls: 'a-pri', width: 3, head: 12 });
  const th = Math.atan2(90, 150), rA = 56;
  s('path', { d: `M${O[0] + rA} ${O[1]} A${rA} ${rA} 0 0 0 ${O[0] + rA * Math.cos(th)} ${O[1] - rA * Math.sin(th)}`, class: 's-fg', style: 'stroke-width: 1.5' }, vc);
  s('text', { x: O[0] + rA + 8, y: O[1] - 10, class: 't-fg t-bold' }, vc, 'θ = 30.96°');
  const hr = sub(vc, { x: (O[0] + P[0]) / 2, y: O[1] + 20, 'text-anchor': 'middle', class: 't-sec t-bold' }, 'H', 'r');
  s('tspan', { 'baseline-shift': 'baseline' }, hr, ' = 150');
  const hc = sub(vc, { x: P[0] + 10, y: (O[1] + P[1]) / 2, dy: '0.35em', class: 't-sec t-bold' }, 'H', 'c');
  s('tspan', { 'baseline-shift': 'baseline' }, hc, ' = 90');
  s('text', { x: 200, y: 112, 'text-anchor': 'end', class: 't-pri t-bold' }, vc, '√(150² + 90²) = 174.93');
  s('text', { x: P[0] + 14, y: O[1] - 6, class: 't-sec t-bold' }, vc, '150 + 90 = 240');
  s('text', { x: P[0] + 14, y: O[1] + 10 }, vc, 'path along the legs');

  // Figure 4: Laplacian response at W1 and W2 against T = 400
  const lp = svg(viz('laplace'), 720, 300, { label: 'Laplacian response: W1 gives minus 40, below T; W2 gives 636, above T = 400', minWidth: 560 });
  [
    { y: 40, M: W1, name: 'W1', l1: 'R = 8 × 40 − 360', l2: '= −40', l3: '|R| = 40 ≤ 400: no point', cls: 't-fg' },
    { y: 170, M: W2, name: 'W2', l1: 'R = 8 × 110 − 244', l2: '= 636', l3: '|R| = 636 > 400: point detected', cls: 't-ok' },
  ].forEach(R => {
    s('text', { x: 40, y: R.y - 10, class: 't-fg t-bold' }, lp, R.name);
    grayGrid(lp, 40, R.y, R.M, 30);
    s('rect', { x: 70, y: R.y + 30, width: 30, height: 30, rx: 2, class: 'f-none outline-sec' }, lp);
    s('text', { x: 160, y: R.y + 22, class: 't-fg' }, lp, R.l1);
    s('text', { x: 160, y: R.y + 44, class: 't-fg t-bold t-lg' }, lp, R.l2);
    s('text', { x: 160, y: R.y + 70, class: R.cls + ' t-bold' }, lp, R.l3);
  });
  const ax = axes(lp, { x: 470, y: 30, w: 220, h: 220, xd: [0, 2], yd: [0, 700], yt: [0, 200, 400, 600], yl: '|R|' });
  [[0.5, 40, 'W1', 'f-pri-soft'], [1.5, 636, 'W2', 'f-ok']].forEach(([c, v, name, f]) => {
    s('rect', { x: ax.x(c) - 28, y: ax.y(v), width: 56, height: ax.y(0) - ax.y(v), class: f }, lp);
    s('text', { x: ax.x(c), y: ax.y(v) - 6, 'text-anchor': 'middle', class: 't-fg t-bold' }, lp, v);
    s('text', { x: ax.x(c), y: ax.y(0) + 18, 'text-anchor': 'middle', class: 't-fg t-bold' }, lp, name);
  });
  s('line', { x1: ax.x(0), x2: ax.x(2), y1: ax.y(400), y2: ax.y(400), class: 's-bad dash', style: 'stroke-width: 1.5' }, lp);
  s('text', { x: ax.x(0) + 4, y: ax.y(400) - 6, class: 't-bad t-bold' }, lp, 'T = 400');
});

QV.register('s2-w1', function (q) {
  const { s, svg, grid, steps, arrow, mat } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const A = [
    [1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1],
  ];
  const N = 7;
  const at = (M, r, c) => (r >= 0 && r < N && c >= 0 && c < N ? M[r][c] : 0);
  const win = (r, c) => [-1, 0, 1].flatMap(i => [-1, 0, 1].map(j => [r + i, c + j]));
  const E = A.map((row, r) => row.map((v, c) => (win(r, c).every(([y, x]) => at(A, y, x)) ? 1 : 0)));
  const O = E.map((row, r) => row.map((v, c) => (win(r, c).some(([y, x]) => at(E, y, x)) ? 1 : 0)));
  const idx = ['0', '1', '2', '3', '4', '5', '6'];
  const bin = v => (v ? { cls: 'f-pri', text: 't-on' } : { cls: 'f-seg', text: 't-muted' });

  const given = svg(viz('given'), 400, 262, { label: 'Image A, a 7 by 7 binary image, and the structuring element B, a 3 by 3 square of ones with its origin at the centre', minWidth: 400, maxWidth: 400 });
  grid(given, { x: 30, y: 44, data: A, cell: 28, fill: bin, rowLabels: idx, colLabels: idx, title: 'Image A' });
  grid(given, { x: 290, y: 100, data: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], cell: 28, fill: bin, text: (v, r, c) => (r === 1 && c === 1 ? '[1]' : '1'), title: 'B, origin [1]' });

  // Figure 1: duality as a 2 x 2 cycle, each panel padded with the outside ring
  const dual = svg(viz('dual'), 420, 420, { label: 'Duality: A, its complement, the complement dilated by B, and the complement of that, which equals the erosion of A by B', minWidth: 400 });
  const P = { cell: 16, pos: [[20, 10], [256, 10], [256, 230], [20, 230]] };
  const Ac = (r, c) => 1 - at(A, r, c);
  const grown = (r, c) => win(r, c).some(([y, x]) => Ac(y, x));
  const panels = [
    { t: 'A', sub: 'object, outside = 0', f: (r, c) => (at(A, r, c) ? 'f-pri' : 'f-seg') },
    { t: 'Aᶜ', sub: 'background, outside = 1', f: (r, c) => (Ac(r, c) ? 'f-sec' : 'f-seg') },
    { t: 'Aᶜ ⊕ B̂', sub: 'background grows by 1', f: (r, c) => (Ac(r, c) ? 'f-sec' : grown(r, c) ? 'f-ter' : 'f-seg') },
    { t: '(Aᶜ ⊕ B̂)ᶜ = A ⊖ B', sub: '6 pixels left', f: (r, c) => (grown(r, c) ? 'f-seg' : 'f-pri') },
  ];
  const pw = 9 * P.cell;
  panels.forEach((p, i) => {
    const [x0, y0] = P.pos[i];
    for (let r = -1; r <= N; r++) {
      for (let c = -1; c <= N; c++) {
        const ring = r < 0 || c < 0 || r >= N || c >= N;
        s('rect', { x: x0 + (c + 1) * P.cell, y: y0 + (r + 1) * P.cell, width: P.cell, height: P.cell, class: p.f(r, c) + ' sep', style: ring ? 'opacity: 0.4' : null }, dual);
      }
    }
    s('text', { x: x0 + pw / 2, y: y0 + pw + 18, 'text-anchor': 'middle', class: 't-fg t-bold t-lg' }, dual, p.t);
    s('text', { x: x0 + pw / 2, y: y0 + pw + 34, 'text-anchor': 'middle', class: 't-sm' }, dual, p.sub);
  });
  arrow(dual, 20 + pw + 8, 10 + pw / 2, 256 - 8, 10 + pw / 2, { cls: 'a-muted', label: 'complement' });
  arrow(dual, 256 + pw / 2, 10 + pw + 44, 256 + pw / 2, 222, { cls: 'a-muted', label: 'dilate by B̂', dx: 44, dy: 4 });
  arrow(dual, 256 - 8, 230 + pw / 2, 20 + pw + 8, 230 + pw / 2, { cls: 'a-muted', label: 'complement' });

  // Figure 2: B placed on chosen pixels of A
  const slide = svg(viz('slide'), 620, 300, { label: 'Erosion step-through: the structuring element placed on a pixel of A, and the eroded result', minWidth: 500 });
  const C = 28, AX = 40, AY = 40, RX = 380;
  const ax = c => AX + (c + 1) * C, ay = r => AY + (r + 1) * C, rx = c => RX + (c + 1) * C;
  s('text', { x: AX, y: 16, class: 't-fg t-bold' }, slide, 'A, with the outside ring = 0');
  s('text', { x: rx(0), y: 16, class: 't-fg t-bold' }, slide, 'A ⊖ B');
  for (let r = -1; r <= N; r++) {
    for (let c = -1; c <= N; c++) {
      const ring = r < 0 || c < 0 || r >= N || c >= N;
      const v = at(A, r, c);
      s('rect', { x: ax(c), y: ay(r), width: C, height: C, class: (v ? 'f-pri' : 'f-seg') + ' sep', style: ring ? 'opacity: 0.4' : null }, slide);
      s('text', { x: ax(c) + C / 2, y: ay(r) + C / 2, dy: '0.35em', 'text-anchor': 'middle', class: v ? 't-on' : 't-muted', style: ring ? 'opacity: 0.6' : null }, slide, v);
    }
  }
  idx.forEach((l, i) => {
    s('text', { x: AX - 6, y: ay(i) + C / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, slide, l);
    s('text', { x: ax(i) + C / 2, y: AY - 6, 'text-anchor': 'middle', class: 't-sm' }, slide, l);
    s('text', { x: rx(0) - 6, y: ay(i) + C / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, slide, l);
    s('text', { x: rx(i) + C / 2, y: ay(0) - 6, 'text-anchor': 'middle', class: 't-sm' }, slide, l);
  });
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const v = E[r][c], gone = A[r][c] && !v;
      s('rect', { x: rx(c), y: ay(r), width: C, height: C, class: (v ? 'f-pri' : gone ? 'f-ter' : 'f-seg') + ' sep' }, slide);
      s('text', { x: rx(c) + C / 2, y: ay(r) + C / 2, dy: '0.35em', 'text-anchor': 'middle', class: v || gone ? 't-on' : 't-muted' }, slide, v);
    }
  }
  arrow(slide, AX + 9 * C + 10, ay(3) + C / 2, rx(0) - 26, ay(3) + C / 2, { cls: 'a-muted', label: 'erode by B', dy: -8 });
  const ov = s('g', {}, slide);
  const CASES = [null, [0, 1], [1, 1], [1, 2], [2, 1], [2, 2], [3, 3], [4, 2], [5, 3], [6, 6]];
  const NOTES = {
    '0,1': 'B on (0,1) reaches row −1, outside the image, where every pixel is 0. B does not fit, so (0,1) → 0. Every pixel in row 0, row 6, column 0 and column 6 goes the same way.',
    '1,1': 'B on (1,1) covers rows 0-2 and columns 0-2. All nine pixels are 1, so B fits and (1,1) → 1.',
    '1,2': 'B on (1,2) covers (0,3) = 0. One zero is enough, so (1,2) → 0.',
    '2,1': 'B on (2,1) covers (3,0) = 0, so (2,1) → 0.',
    '2,2': 'B on (2,2) covers rows 1-3 and columns 1-3, all 1. (2,2) → 1.',
    '3,3': 'B on (3,3) covers rows 2-4 and columns 2-4, all 1. (3,3) → 1. Its left neighbour (3,2) also fits.',
    '4,2': 'B on (4,2) covers (5,1) = 0, so (4,2) → 0.',
    '5,3': 'B on (5,3) covers row 6, which is 0 below it. (5,3) → 0, and so does all of row 5.',
    '6,6': 'B on the corner pixel (6,6) covers 7 zeros, 5 of them outside the image. (6,6) → 0.',
  };
  const note = role('slide-note');
  steps(viz('slide-steps'), CASES.map(p => (p ? `(${p[0]},${p[1]})` : 'All')), k => {
    ov.textContent = '';
    if (!k) {
      note.textContent = 'All 27 ones of A, each tested with B centred on it. Only 6 survive: the pixels whose whole 3 × 3 neighbourhood is 1. The ochre pixels were 1 in A and are removed. Pick a pixel to place B on it.';
      return;
    }
    const [r, c] = CASES[k];
    s('rect', { x: ax(c - 1), y: ay(r - 1), width: 3 * C, height: 3 * C, class: 'f-none outline-sec' }, ov);
    win(r, c).forEach(([y, x]) => {
      if (!at(A, y, x)) s('circle', { cx: ax(x) + C / 2, cy: ay(y) + C / 2, r: 9, class: 's-bad' }, ov);
    });
    s('rect', { x: rx(c) + 1, y: ay(r) + 1, width: C - 2, height: C - 2, class: 'f-none outline-sec' }, ov);
    note.textContent = NOTES[r + ',' + c];
  });

  mat(viz('result'), E, { caption: 'A ⊖ B', hl: v => (v ? 'on' : null) });

  // Figure 3: opening check
  const op = svg(viz('open'), 600, 192, { label: 'Opening check: the erosion result dilated by B equals A without the corner pixel (6,6)', minWidth: 480 });
  const oc = 20, oy = 46, oxs = [20, 230, 440];
  [
    { t: 'A ⊖ B', sub: '6 pixels', M: E, f: v => (v ? 'f-pri' : 'f-seg') },
    { t: '(A ⊖ B) ⊕ B = A ∘ B', sub: '26 pixels', M: O, f: v => (v ? 'f-pri' : 'f-seg') },
    { t: 'A', sub: '27 pixels, (6,6) is lost', M: A, f: (v, r, c) => (r === 6 && c === 6 ? 'f-ter' : v ? 'f-pri' : 'f-seg') },
  ].forEach((p, i) => {
    const x0 = oxs[i];
    s('text', { x: x0 + 70, y: 18, 'text-anchor': 'middle', class: 't-fg t-bold' }, op, p.t);
    s('text', { x: x0 + 70, y: 34, 'text-anchor': 'middle', class: 't-sm' }, op, p.sub);
    grid(op, { x: x0, y: oy, data: p.M, cell: oc, fill: p.f, text: false });
  });
  arrow(op, 168, oy + 70, 222, oy + 70, { cls: 'a-muted', label: '⊕ B' });
  s('text', { x: 405, y: oy + 70, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, op, 'vs');
});

QV.register('s2-w2', function (q) {
  const { s, svg, grid, gray, steps, axes, line, arrow, scale } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const F = [
    [100, 110, 120, 130, 140],
    [105, 90, 140, 70, 135],
    [110, 120, 180, 150, 130],
    [115, 60, 130, 200, 125],
    [120, 125, 130, 135, 140],
  ];
  const LM = [[0, -1, 0], [-1, 4, -1], [0, -1, 0]];
  const SM = [[0, -1, 0], [-1, 5, -1], [0, -1, 0]];
  const idx = ['0', '1', '2', '3', '4'];
  const neg = v => String(v).replace('-', '−');
  const maskFill = v => (v > 0 ? 'f-pri-soft' : v < 0 ? 'f-sec-soft' : 'f-seg');
  const apply = (M, r, c) => [0, 1, 2].reduce((a, i) => a + [0, 1, 2].reduce((b, j) => b + M[i][j] * F[r - 1 + i][c - 1 + j], 0), 0);
  const clip = v => Math.max(0, Math.min(255, v));

  const given = svg(viz('given'), 540, 262, { label: 'Image f, 5 by 5 gray values, with pixel (2,2) outlined, and the Laplacian and sharpening masks', minWidth: 540, maxWidth: 540 });
  grid(given, { x: 30, y: 44, data: F, cell: 40, fill: v => gray(v), rowLabels: idx, colLabels: idx, title: 'Image f (8-bit)' });
  s('rect', { x: 110, y: 124, width: 40, height: 40, class: 'f-none outline-sec' }, given);
  [['Laplacian L', LM, 'sum = 0', 290], ['Sharpening S', SM, 'sum = 1', 416]].forEach(([t, M, sum, x]) => {
    grid(given, { x, y: 84, data: M, cell: 32, fill: maskFill, text: v => neg(v), textCls: v => (v ? 't-fg' : 't-muted'), title: t });
    s('text', { x: x + 48, y: 202, 'text-anchor': 'middle', class: 't-fg' }, given, sum);
  });

  // Figure 1: one row across a vertical edge
  const fv = x => (x < 10 ? 90 : 150);
  const lap = x => 2 * fv(x) - fv(Math.max(0, x - 1)) - fv(Math.min(19, x + 1));
  const prof = svg(viz('profile'), 680, 300, { label: 'Profile across an edge from 90 to 150: the Laplacian is zero on flat parts, the sharpened row keeps the flat levels and overshoots at the edge', minWidth: 540 });
  const ax = axes(prof, { x: 56, y: 24, w: 600, h: 220, xd: [0, 20], yd: [-80, 240], xt: [0.5, 5.5, 9.5, 10.5, 15.5, 19.5], yt: [-60, 0, 30, 90, 150, 210], xf: v => String(v - 0.5), yf: neg, xl: 'pixel position x along one row', yl: 'value' });
  const stair = g => {
    const pts = [];
    for (let x = 0; x < 20; x++) pts.push([ax.x(x), ax.y(g(x))], [ax.x(x + 1), ax.y(g(x))]);
    return pts;
  };
  line(prof, stair(fv), 's-muted').setAttribute('style', 'stroke-width: 7; opacity: 0.3');
  line(prof, stair(lap), 's-sec');
  line(prof, stair(x => fv(x) + lap(x)), 's-pri');
  s('text', { x: ax.x(1), y: ax.y(0) - 8, class: 't-sec' }, prof, 'L = 0 on the flat part');
  s('text', { x: ax.x(1), y: ax.y(90) - 10, class: 't-pri' }, prof, 'S = f = 90');
  s('text', { x: ax.x(13), y: ax.y(150) - 10, class: 't-pri' }, prof, 'S = f = 150');
  s('text', { x: ax.x(13), y: ax.y(0) - 8, class: 't-sec' }, prof, 'L = 0');
  s('text', { x: ax.x(9) - 6, y: ax.y(-60), dy: '0.35em', 'text-anchor': 'end', class: 't-sec t-bold' }, prof, 'L = −60');
  s('text', { x: ax.x(11) + 6, y: ax.y(60), dy: '0.35em', class: 't-sec t-bold' }, prof, 'L = +60');
  s('text', { x: ax.x(9) - 6, y: ax.y(30), dy: '0.35em', 'text-anchor': 'end', class: 't-pri t-bold' }, prof, 'S = 30');
  s('text', { x: ax.x(11) + 6, y: ax.y(210), dy: '0.35em', class: 't-pri t-bold' }, prof, 'S = 210');

  // Figure 2: window × mask at (2,2), then clip
  const W = [[90, 140, 70], [120, 180, 150], [60, 130, 200]];
  const mk = svg(viz('mask'), 700, 300, { label: 'The 3 by 3 window around pixel (2,2), the mask, their products, the sum and the clip to 0..255', minWidth: 560 });
  const cell = 44, gy = 40;
  grid(mk, { x: 20, y: gy, data: W, cell, fill: v => gray(v), title: 'window of f' });
  s('text', { x: 174, y: gy + 66, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, mk, '×');
  s('text', { x: 350, y: gy + 66, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, mk, '=');
  const nl = { x: scale(0, 400, 60, 640), y: 236 };
  s('rect', { x: nl.x(0), y: nl.y - 8, width: nl.x(255) - nl.x(0), height: 16, class: 'f-ok-soft' }, mk);
  s('line', { x1: nl.x(0), x2: nl.x(400), y1: nl.y, y2: nl.y, class: 'l-axis' }, mk);
  [0, 255].forEach(v => {
    s('line', { x1: nl.x(v), x2: nl.x(v), y1: nl.y - 12, y2: nl.y + 12, class: 's-fg' }, mk);
    s('text', { x: nl.x(v), y: nl.y + 28, 'text-anchor': 'middle', class: 't-fg' }, mk, String(v));
  });
  s('text', { x: nl.x(127.5), y: nl.y + 28, 'text-anchor': 'middle', class: 't-ok' }, mk, '8-bit range 0..255');
  const dyn = s('g', {}, mk);
  const note = role('mask-note');
  steps(viz('mask-steps'), ['Laplacian L', 'Sharpening S'], k => {
    dyn.textContent = '';
    const M = k ? SM : LM, name = k ? 'S' : 'L', w = k ? 5 : 4;
    const raw = w * 180 - 540, out = clip(raw);
    grid(dyn, { x: 196, y: gy, data: M, cell, fill: maskFill, text: v => neg(v), textCls: v => (v ? 't-fg' : 't-muted'), title: 'mask ' + name });
    grid(dyn, { x: 372, y: gy, data: W.map((row, r) => row.map((v, c) => v * M[r][c])), cell, fill: (v, r, c) => maskFill(M[r][c]), text: v => (v > 0 ? '+' + v : neg(v)), textCls: v => (v ? 't-fg' : 't-muted'), title: 'products' });
    const tx = 536;
    s('text', { x: tx, y: gy + 22, class: 't-fg' }, dyn, `Σ = ${w * 180} − 540`);
    s('text', { x: tx, y: gy + 46, class: 't-fg t-bold t-lg' }, dyn, `= ${raw}`);
    s('text', { x: tx, y: gy + 72, class: 't-muted' }, dyn, raw > 255 ? '> 255, clip' : 'inside 0..255');
    s('text', { x: tx, y: gy + 100, class: 't-ok t-bold t-xl' }, dyn, `${name} = ${out}`);
    s('circle', { cx: nl.x(raw), cy: nl.y, r: 6, class: raw > 255 ? 'f-sec' : 'f-ok' }, dyn);
    s('text', { x: nl.x(raw), y: nl.y - 16, 'text-anchor': 'middle', class: (raw > 255 ? 't-sec' : 't-ok') + ' t-bold' }, dyn, 'raw ' + raw);
    if (raw > 255) {
      arrow(dyn, nl.x(raw) - 8, nl.y + 16, nl.x(255) + 4, nl.y + 16, { cls: 'a-sec', label: 'clip', dy: 14, labelCls: 't-sec' });
      s('circle', { cx: nl.x(255), cy: nl.y, r: 6, class: 'f-ok' }, dyn);
    }
    note.textContent = k
      ? 'S: the centre weight is 5. 5 × 180 = 900, minus the four neighbours 540, gives 360. That is above 255, so S is clipped to 255. The extra 1 × 180 over L is the original pixel, so S = f + L.'
      : 'L: the centre weight is 4. 4 × 180 = 720, minus the four neighbours 140 + 120 + 150 + 130 = 540, gives 180. That is inside 0..255, so L = 180.';
  });

  // Figure 3: f + L on the interior, then clip
  const LI = [1, 2, 3].map(r => [1, 2, 3].map(c => apply(LM, r, c)));
  const FI = [1, 2, 3].map(r => [1, 2, 3].map(c => F[r][c]));
  const RAW = FI.map((row, r) => row.map((v, c) => v + LI[r][c]));
  const inn = svg(viz('interior'), 660, 200, { label: 'Interior pixels: f plus the Laplacian gives the sharpening output, then values outside 0 to 255 are clipped', minWidth: 540 });
  const ic = 40, iy = 54, inner = ['1', '2', '3'];
  const centre = (r, c) => r === 1 && c === 1;
  grid(inn, { x: 24, y: iy, data: FI, cell: ic, fill: v => gray(v), rowLabels: inner, colLabels: inner, title: 'f' });
  grid(inn, { x: 184, y: iy, data: LI, cell: ic, fill: () => 'f-seg', text: v => neg(v), colLabels: inner, title: 'L' });
  grid(inn, { x: 344, y: iy, data: RAW, cell: ic, fill: v => (v < 0 || v > 255 ? { cls: 'f-ter', text: 't-on' } : 'f-seg'), text: v => neg(v), colLabels: inner, title: 'f + L' });
  grid(inn, { x: 524, y: iy, data: RAW.map(row => row.map(clip)), cell: ic, fill: v => gray(v), colLabels: inner, title: 'S, clipped' });
  [24, 184, 344, 524].forEach(x => s('rect', { x: x + ic, y: iy + ic, width: ic, height: ic, class: 'f-none outline-sec' }, inn));
  s('text', { x: 164, y: iy + 60, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, inn, '+');
  s('text', { x: 324, y: iy + 60, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, inn, '=');
  arrow(inn, 470, iy + 60, 516, iy + 60, { cls: 'a-muted', label: 'clip' });
  s('text', { x: 24, y: iy + 3 * ic + 22, class: 't-sm' }, inn, 'outlined: pixel (2,2), the one asked for');
});

QV.register('s2-w3', function (q) {
  const { s, svg, axes, steps, table, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const NK = [6, 14, 18, 10, 7, 5, 3, 1];
  const CUM = [];
  NK.reduce((a, n, k) => (CUM[k] = a + n), 0);
  const NORM = CUM.map(c => 7 * c / 64);
  const NORMS = ['0.656', '2.188', '4.156', '5.250', '6.016', '6.563', '6.891', '7.000'];
  const SK = NORM.map(Math.round);
  const NS = [0, 0, 0, 0, 0, 0, 0, 0];
  NK.forEach((n, k) => { NS[SK[k]] += n; });
  const LV = [0, 1, 2, 3, 4, 5, 6, 7];

  table(viz('given'), [{ html: 'r<sub>k</sub>', cls: 'l' }].concat(LV.map(String)), [[{ html: 'n<sub>k</sub>', cls: 'l' }].concat(NK.map(String))]);

  // Figure 1: histogram on top, normalized sum and rounding below
  const fig = svg(viz('cdf'), 660, 400, { label: 'Histogram bars and the normalized cumulative sum 7 times cumulative over 64, rounded to the new levels', minWidth: 520 });
  const top = axes(fig, { x: 64, y: 26, w: 560, h: 120, xd: [-0.5, 7.5], yd: [0, 20], xt: [], yt: [0, 6, 12, 18], yl: 'nₖ, pixels at level rₖ' });
  const bot = axes(fig, { x: 64, y: 196, w: 560, h: 150, xd: [-0.5, 7.5], yd: [0, 7.4], xt: LV, yt: LV, xl: 'input level rₖ', yl: 'normalized sum = 7 × cumulative sum / 64, and sₖ' });
  s('path', { d: NORM.map((v, k) => (k ? 'L' : 'M') + bot.x(k).toFixed(1) + ' ' + bot.y(v).toFixed(1)).join(' '), class: 's-pri', style: 'stroke-width: 1.5; opacity: 0.45' }, fig);
  const bars = NK.map((n, k) => {
    const g = s('g', { class: 'fade' }, fig);
    s('rect', { x: top.x(k) - 20, y: top.y(n), width: 40, height: top.y(0) - top.y(n), class: 'f-pri' }, g);
    s('text', { x: top.x(k), y: top.y(n) - 5, 'text-anchor': 'middle', class: 't-fg' }, g, String(n));
    return g;
  });
  const pts = NK.map((n, k) => {
    const g = s('g', { class: 'fade' }, fig);
    const x = bot.x(k), yN = bot.y(NORM[k]), yS = bot.y(SK[k]);
    if (Math.abs(yN - yS) > 6) s('line', { x1: x, x2: x, y1: yN, y2: yS, class: 's-ok dash', style: 'stroke-width: 1.5' }, g);
    s('rect', { x: x - 6, y: yS - 6, width: 12, height: 12, class: 'f-ok' }, g);
    s('circle', { cx: x, cy: yN, r: 4, class: 'f-pri sep' }, g);
    s('text', { x: x + 11, y: yS, dy: '0.35em', class: 't-ok t-bold' }, g, String(SK[k]));
    return g;
  });
  const tbl = table(viz('table'), [{ html: 'r<sub>k</sub>' }, { html: 'n<sub>k</sub>' }, 'cumulative sum', '7 × sum', 'normalized sum = 7 × sum / 64', { html: 's<sub>k</sub>' }],
    LV.map(k => [String(k), String(NK[k]), String(CUM[k]), String(7 * CUM[k]), NORMS[k], { text: String(SK[k]), cls: 'hl' }]));
  const note = role('cdf-note');
  steps(viz('cdf-steps'), ['All'].concat(LV.map(k => 'r = ' + k)), k => {
    const j = k - 1;
    bars.forEach((g, i) => g.classList.toggle('dim', k > 0 && i > j));
    pts.forEach((g, i) => g.classList.toggle('dim', k > 0 && i > j));
    tbl.rows.forEach((r, i) => r.classList.toggle('on', i === j));
    if (!k) {
      note.textContent = 'All eight levels. The dots climb with the cumulative sum and end at exactly 7 = L − 1, because all 64 pixels are counted by then. Rounding gives the LUT 1 2 4 5 6 7 7 7.';
      return;
    }
    const sum = NK.slice(0, j + 1).join(' + ');
    note.textContent = `r = ${j}: cumulative sum ${j ? sum + ' = ' : ''}${CUM[j]}. 7 × ${CUM[j]} / 64 = ${NORMS[j]}, which rounds to s = ${SK[j]}.`;
  });

  table(viz('new-table'), [{ text: 's', cls: 'l' }].concat(LV.map(String)), [[{ html: 'n<sub>s</sub>', cls: 'l' }].concat(NS.map((n, i) => (i === 7 ? { text: '9', cls: 'hl' } : String(n))))]);

  // Figure 2: whole bars moved by the LUT
  const mp = svg(viz('map'), 660, 392, { label: 'Before and after histograms with arrows from each input level to its new level; levels 5, 6 and 7 merge into 7, levels 0 and 3 stay empty', minWidth: 520 });
  const t2 = axes(mp, { x: 64, y: 24, w: 540, h: 96, xd: [-0.5, 7.5], yd: [0, 20], xt: LV, yt: [0, 6, 12, 18], yl: 'before: nₖ at level rₖ' });
  const b2 = axes(mp, { x: 64, y: 244, w: 540, h: 96, xd: [-0.5, 7.5], yd: [0, 20], xt: LV, yt: [0, 6, 12, 18], xl: 'gray level', yl: 'after: pixels at level s' });
  NK.forEach((n, k) => {
    const merged = SK[k] === 7;
    s('rect', { x: t2.x(k) - 18, y: t2.y(n), width: 36, height: t2.y(0) - t2.y(n), class: merged ? 'f-sec' : 'f-pri' }, mp);
    s('text', { x: t2.x(k), y: t2.y(n) - 5, 'text-anchor': 'middle', class: 't-fg' }, mp, String(n));
    arrow(mp, t2.x(k), 150, b2.x(SK[k]), 222, { cls: merged ? 'a-sec' : 'a-muted' });
  });
  const stack = [0, 0, 0, 0, 0, 0, 0, 0];
  NK.forEach((n, k) => {
    const lvl = SK[k], y0 = stack[lvl], merged = lvl === 7;
    s('rect', { x: b2.x(lvl) - 18, y: b2.y(y0 + n), width: 36, height: b2.y(y0) - b2.y(y0 + n), class: (merged ? 'f-sec' : 'f-ok') + ' sep' }, mp);
    stack[lvl] += n;
  });
  NS.forEach((n, lvl) => {
    if (!n) s('text', { x: b2.x(lvl), y: b2.y(0) - 6, 'text-anchor': 'middle', class: 't-bad t-bold' }, mp, 'empty');
    else if (lvl === 7) s('text', { x: b2.x(lvl), y: b2.y(n) - 5, 'text-anchor': 'middle', class: 't-fg' }, mp, '9 = 5+3+1');
    else s('text', { x: b2.x(lvl), y: b2.y(n) + 12, 'text-anchor': 'middle', class: 't-on t-bold' }, mp, String(n));
  });
  s('line', { x1: b2.x(-0.5), x2: b2.x(7.5), y1: b2.y(8), y2: b2.y(8), class: 's-muted dash', style: 'stroke-width: 1.5' }, mp);
  s('text', { x: b2.x(7.5) + 6, y: b2.y(8), dy: '0.35em', class: 't-muted' }, mp, 'flat 8');
});

QV.register('s2-w4', function (q) {
  const { s, svg, box, arrow, steps, axes } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: the slide-21 flow chart
  const fl = svg(viz('flow'), 580, 500, { label: 'Design cycle flow chart: collect data, choose features, choose model, train classifier, evaluate classifier, with feedback and prior knowledge arrows', minWidth: 460 });
  const B = { x: 220, w: 200, h: 40, ys: [52, 136, 220, 304, 388] };
  const NAMES = ['collect data', 'choose features', 'choose model', 'train classifier', 'evaluate classifier'];
  s('text', { x: 320, y: 22, 'text-anchor': 'middle', class: 't-fg t-bold' }, fl, 'start');
  arrow(fl, 320, 30, 320, B.ys[0], { cls: 'a-muted' });
  B.ys.slice(0, 4).forEach((y, i) => arrow(fl, 320, y + B.h, 320, B.ys[i + 1], { cls: 'a-muted' }));
  arrow(fl, 320, B.ys[4] + B.h, 320, 462, { cls: 'a-muted' });
  s('text', { x: 320, y: 480, 'text-anchor': 'middle', class: 't-fg t-bold' }, fl, 'end');
  const fy = B.ys[4] + B.h / 2;
  s('path', { d: `M${B.x + B.w} ${fy} L540 ${fy} L540 ${B.ys[0] + B.h / 2}`, class: 's-pri', style: 'stroke-width: 1.5' }, fl);
  B.ys.slice(0, 4).forEach(y => arrow(fl, 540, y + B.h / 2, B.x + B.w + 2, y + B.h / 2, { cls: 'a-pri' }));
  s('text', { x: 548, y: 250, class: 't-pri', transform: 'rotate(90 548 250)', 'text-anchor': 'middle' }, fl, 'feedback');
  box(fl, 16, 160, 150, 56, 'prior knowledge\n(e.g., invariances)', { cls: 'f-sec-soft', textCls: 't-fg' });
  arrow(fl, 166, 178, B.x - 2, B.ys[1] + B.h / 2, { cls: 'a-sec' });
  arrow(fl, 166, 200, B.x - 2, B.ys[2] + B.h / 2, { cls: 'a-sec' });
  const layer = s('g', {}, fl);
  const NOTES = [
    'Start → collect data → choose features → choose model → train classifier → evaluate classifier → end. The blue line is the feedback: evaluation can send the designer back to any earlier step.',
    'Data collection: "How do we know when we have collected an adequately large and representative set of examples for training and testing the system?"',
    'Feature choice "depends on the characteristics of the problem domain". Features should be "simple to extract, invariant to irrelevant transformation, insensitive to noise". Prior knowledge such as invariances feeds in here.',
    'Model choice: if we are unsatisfied with the performance of the classifier, "jump to another class of model". Prior knowledge feeds in here too.',
    'Training: "use data to determine the classifier". There are many procedures for training classifiers and choosing models.',
    'Evaluation: "measure the error rate (or performance)" and switch from one set of features to another if needed. Its output feeds back into every earlier box.',
    'Computational complexity is the sixth item of slide 20 and has no box. It asks for the "trade-off between computational ease and performance" and how an algorithm scales with the number of features, patterns or categories. It applies to every box.',
  ];
  const note = role('flow-note');
  steps(viz('flow-steps'), ['All', 'Collect data', 'Choose features', 'Choose model', 'Train', 'Evaluate', 'Complexity'], k => {
    layer.textContent = '';
    B.ys.forEach((y, i) => {
      const on = k === i + 1, soft = k === 6;
      box(layer, B.x, y, B.w, B.h, NAMES[i], { cls: on ? 'f-pri' : soft ? 'f-pri-soft' : 'f-surface', textCls: on ? 't-on t-bold' : 't-fg', stroke: on ? 'outline-pri' : 'box' });
    });
    note.textContent = NOTES[k];
  });

  // Figure 2: labelled vs unlabelled fish
  const SALMON = [[2.2, 15.4], [3.0, 16.3], [3.6, 15.1], [4.1, 16.9], [2.7, 17.4], [4.8, 15.9], [3.4, 18.0], [5.2, 17.1]];
  const BASS = [[6.4, 18.6], [7.3, 19.8], [8.1, 18.9], [6.9, 20.7], [8.8, 20.1], [9.5, 19.2], [7.7, 21.3], [6.1, 19.6]];
  const ln = svg(viz('learn'), 700, 296, { label: 'Two scatter plots of lightness against width: on the left the fish carry salmon and sea bass labels and a learned boundary, on the right the same fish without labels form two clusters', minWidth: 560 });
  const panel = (x0, title) => {
    s('text', { x: x0, y: 16, class: 't-fg t-bold' }, ln, title);
    return axes(ln, { x: x0 + 30, y: 50, w: 260, h: 196, xd: [1, 11], yd: [14, 22], xt: [2, 4, 6, 8, 10], yt: [15, 17, 19, 21], xl: 'lightness', yl: 'width' });
  };
  const p1 = panel(20, 'Supervised: every fish has a label');
  const p2 = panel(380, 'Unsupervised: no labels');
  s('line', { x1: p1.x(7.7), y1: p1.y(14), x2: p1.x(3.7), y2: p1.y(22), class: 's-fg dash', style: 'stroke-width: 1.5' }, ln);
  s('text', { x: p1.x(4.1), y: p1.y(21.75), dy: '0.35em', class: 't-fg' }, ln, 'learned boundary');
  SALMON.forEach(([a, b]) => s('circle', { cx: p1.x(a), cy: p1.y(b), r: 5, class: 'f-pri' }, ln));
  BASS.forEach(([a, b]) => s('rect', { x: p1.x(a) - 4.5, y: p1.y(b) - 4.5, width: 9, height: 9, class: 'f-sec' }, ln));
  s('text', { x: p1.x(1.4), y: p1.y(14.6), class: 't-pri t-bold' }, ln, 'salmon');
  s('text', { x: p1.x(10.6), y: p1.y(14.6), 'text-anchor': 'end', class: 't-sec t-bold' }, ln, 'sea bass');
  [[3.6, 16.5, 2.1, 1.9], [7.8, 19.9, 2.2, 1.9]].forEach(([cx, cy, rx, ry]) => {
    s('ellipse', { cx: p2.x(cx), cy: p2.y(cy), rx: p2.x(cx + rx) - p2.x(cx), ry: p2.y(cy) - p2.y(cy + ry), class: 's-ter dash', style: 'stroke-width: 2' }, ln);
  });
  SALMON.concat(BASS).forEach(([a, b]) => s('circle', { cx: p2.x(a), cy: p2.y(b), r: 4.5, class: 'f-muted' }, ln));
  s('text', { x: p2.x(5.9), y: p2.y(15.2), dy: '0.35em', class: 't-ter t-bold' }, ln, 'cluster 1');
  s('text', { x: p2.x(5.6), y: p2.y(21.5), dy: '0.35em', 'text-anchor': 'end', class: 't-ter t-bold' }, ln, 'cluster 2');

  // Figure 3: one character, two representations
  const pr = svg(viz('pr'), 700, 290, { label: 'The letter A as a feature vector of numbers for statistical PR, and as a graph of strokes and junctions for structural PR', minWidth: 560 });
  s('text', { x: 20, y: 20, class: 't-pri t-bold t-lg' }, pr, 'Statistical PR');
  s('text', { x: 20, y: 38, class: 't-sm' }, pr, 'data → vector of numbers');
  s('path', { d: 'M45 210 L90 70 L135 210 M62 156 L118 156', class: 's-fg', style: 'stroke-width: 9; stroke-linecap: round; stroke-linejoin: round' }, pr);
  arrow(pr, 152, 140, 200, 140, { cls: 'a-muted' });
  s('text', { x: 270, y: 70, 'text-anchor': 'middle', class: 't-pri t-bold' }, pr, 'X = [x₁, …, xₙ]');
  box(pr, 210, 82, 120, 116, '#holes = 1\n#strokes = 3\nwidth = 3/4\nheight = high', { cls: 'f-pri-soft', textCls: 't-fg', lh: 24 });
  s('text', { x: 210, y: 226, class: 't-fg' }, pr, 'statistical techniques,');
  s('text', { x: 210, y: 244, class: 't-fg' }, pr, 'e.g. nearest class mean');
  s('text', { x: 20, y: 274, class: 't-sm' }, pr, 'feature values for A from the slide-34 table');

  s('text', { x: 380, y: 20, class: 't-sec t-bold t-lg' }, pr, 'Structural PR');
  s('text', { x: 380, y: 38, class: 't-sm' }, pr, 'data → discrete structure');
  const ND = { apex: [450, 70], lj: [422, 156], rj: [478, 156], lf: [405, 210], rf: [495, 210] };
  [['apex', 'lj'], ['lj', 'lf'], ['apex', 'rj'], ['rj', 'rf'], ['lj', 'rj']].forEach(([a, b]) => {
    s('line', { x1: ND[a][0], y1: ND[a][1], x2: ND[b][0], y2: ND[b][1], class: 's-sec' }, pr);
  });
  Object.values(ND).forEach(([x, y]) => s('circle', { cx: x, cy: y, r: 6, class: 'f-sec' }, pr));
  s('text', { x: 450, y: 56, 'text-anchor': 'middle', class: 't-sm' }, pr, 'apex');
  s('text', { x: 412, y: 156, dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, pr, 'junction');
  s('text', { x: 488, y: 156, dy: '0.35em', class: 't-sm' }, pr, 'junction');
  s('text', { x: 405, y: 230, 'text-anchor': 'middle', class: 't-sm' }, pr, 'end');
  s('text', { x: 495, y: 230, 'text-anchor': 'middle', class: 't-sm' }, pr, 'end');
  arrow(pr, 548, 140, 572, 140, { cls: 'a-muted' });
  box(pr, 578, 82, 110, 116, '5 nodes\n5 edges\nbar joins\nthe 2 legs', { cls: 'f-sec-soft', textCls: 't-fg', lh: 24 });
  s('text', { x: 578, y: 226, class: 't-fg' }, pr, 'parsing,');
  s('text', { x: 578, y: 244, class: 't-fg' }, pr, 'graph matching');
});

QV.register('s2-w5', function (q) {
  const { s, svg, steps, table, box } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Encoder run, one record per table row
  const STR = 'ABBABBBABBAB';
  const dict = { A: 1, B: 2 };
  const rows = [];
  let next = 3, cur = STR[0], start = 0;
  for (let i = 1; i <= STR.length; i++) {
    const c = i < STR.length ? STR[i] : null;
    if (c && dict[cur + c]) {
      rows.push({ s: cur, c, start, cPos: i, hit: dict[cur + c] });
      cur += c;
    } else {
      const r = { s: cur, c: c || 'EOF', start, cPos: c ? i : -1, out: dict[cur] };
      if (c) { dict[cur + c] = next; r.code = next; r.str = cur + c; next++; }
      rows.push(r);
      cur = c;
      start = i;
    }
  }
  const ENTRIES = [[1, 'A'], [2, 'B']].concat(rows.filter(r => r.code).map(r => [r.code, r.str]));

  const enc = svg(viz('enc'), 712, 232, { label: 'LZW encoder state: the input with the current string s and next character c, the codes output so far and the dictionary', minWidth: 560 });
  const lab = (g, y, t) => s('text', { x: 0, y, dy: '0.35em', class: 't-fg t-bold' }, g, t);
  lab(enc, 38, 'input');
  lab(enc, 112, 'output');
  lab(enc, 188, 'dictionary');
  const encL = s('g', {}, enc);
  const encTbl = table(viz('enc-table'), ['s', 'c', 'output', 'code', 'string'].map(t => ({ text: t, cls: 'l' })),
    rows.map(r => [r.s, r.c, r.out || '', r.code || '', r.str || ''].map(v => ({ text: String(v), cls: 'l' }))));
  const encNote = role('enc-note');
  steps(viz('enc-steps'), ['All'].concat(rows.map((r, i) => String(i + 1))), k => {
    encL.textContent = '';
    const r = k ? rows[k - 1] : null;
    for (let i = 0; i < STR.length; i++) {
      let cls = 'f-surface', tc = 't-fg';
      if (r) {
        if (i < r.start) { cls = 'f-seg'; tc = 't-muted'; }
        else if (i < r.start + r.s.length) { cls = 'f-pri'; tc = 't-on'; }
        else if (i === r.cPos) { cls = 'f-sec'; tc = 't-on'; }
      }
      box(encL, 90 + i * 34, 22, 32, 32, STR[i], { cls, textCls: tc, rx: 3 });
    }
    if (r && r.cPos < 0) box(encL, 90 + 12 * 34 + 4, 22, 44, 32, 'EOF', { cls: 'f-sec', textCls: 't-on', rx: 3 });
    const done = r ? rows.slice(0, k) : rows;
    done.filter(x => x.out).forEach((x, j, arr) => {
      const now = r && x === r;
      box(encL, 90 + j * 40, 97, 34, 30, String(x.out), { cls: now ? 'f-pri' : 'f-seg', textCls: now ? 't-on t-bold' : 't-fg', rx: 3 });
    });
    const made = new Set(done.filter(x => x.code).map(x => x.code));
    ENTRIES.forEach(([code, str], e) => {
      const known = code < 3 || made.has(code), now = r && r.code === code;
      const g = s('g', { style: known ? null : 'opacity: 0.25' }, encL);
      box(g, 90 + e * 76, 166, 70, 44, `${code}\n${known ? str : '?'}`, { cls: now ? 'f-ok' : 'f-surface', textCls: now ? 't-on t-bold' : 't-fg', rx: 4, lh: 16 });
    });
    encTbl.rows.forEach((tr, i) => tr.classList.toggle('on', i === k - 1));
    if (!r) encNote.textContent = 'Output 1 2 2 3 4 6 3. Each output code stands for the string s at that moment, and each new entry is s + c. Pick a step to follow the table.';
    else if (r.c === 'EOF') encNote.textContent = `s = ${r.s} and the input has ended. Output code(${r.s}) = ${r.out}. Done: 12 characters became 7 codes.`;
    else if (r.hit) encNote.textContent = `s = ${r.s}, c = ${r.c}. ${r.s + r.c} is already in the dictionary (code ${r.hit}), so s grows to ${r.s + r.c} and nothing is output.`;
    else encNote.textContent = `s = ${r.s}, c = ${r.c}. ${r.s + r.c} is not in the dictionary, so output code(${r.s}) = ${r.out}, add ${r.str} = ${r.code}, and set s = ${r.c}.`;
  });

  // Decoder run
  const CODES = [2, 2, 1, 4, 6, 1];
  const dd = { 1: 'A', 2: 'B' };
  const drows = [];
  let nx = 3, prev = null;
  CODES.forEach(k => {
    const special = !(k in dd);
    const entry = special ? prev + prev[0] : dd[k];
    const r = { s: prev || 'NIL', k, entry, special };
    if (prev) { dd[nx] = prev + entry[0]; r.code = nx; r.str = dd[nx]; nx++; }
    drows.push(r);
    prev = entry;
  });
  const DENT = [[1, 'A'], [2, 'B']].concat(drows.filter(r => r.code).map(r => [r.code, r.str]));

  const dec = svg(viz('dec'), 712, 232, { label: 'LZW decoder state: the code sequence, the decoded output so far and the dictionary', minWidth: 560 });
  lab(dec, 38, 'codes');
  lab(dec, 112, 'output');
  lab(dec, 188, 'dictionary');
  const decL = s('g', {}, dec);
  const decTbl = table(viz('dec-table'), ['s', 'k', 'entry / output', 'code', 'string'].map(t => ({ text: t, cls: 'l' })),
    drows.map(r => [r.s, r.k, r.entry + (r.special ? ' (6 not defined yet: BA + B)' : ''), r.code || '', r.str || ''].map(v => ({ text: String(v), cls: 'l' }))));
  const decNote = role('dec-note');
  steps(viz('dec-steps'), ['All'].concat(drows.map((r, i) => String(i + 1))), k => {
    decL.textContent = '';
    const r = k ? drows[k - 1] : null;
    CODES.forEach((c, i) => {
      let cls = 'f-surface', tc = 't-fg';
      if (!r || i < k - 1) { cls = 'f-seg'; }
      else if (i === k - 1) { cls = r.special ? 'f-ter' : 'f-pri'; tc = 't-on t-bold'; }
      box(decL, 90 + i * 44, 22, 38, 32, String(c), { cls, textCls: tc, rx: 3 });
    });
    let x = 90;
    (r ? drows.slice(0, k) : drows).forEach(d => {
      const now = r && d === r;
      d.entry.split('').forEach(ch => {
        box(decL, x, 97, 24, 30, ch, { cls: now ? (d.special ? 'f-ter' : 'f-pri') : 'f-seg', textCls: now ? 't-on t-bold' : 't-fg', rx: 3 });
        x += 26;
      });
      x += 8;
    });
    const made = new Set((r ? drows.slice(0, k) : drows).filter(d => d.code).map(d => d.code));
    DENT.forEach(([code, str], e) => {
      const known = code < 3 || made.has(code), now = r && r.code === code;
      const g = s('g', { style: known ? null : 'opacity: 0.25' }, decL);
      box(g, 90 + e * 82, 166, 76, 44, `${code}\n${known ? str : '?'}`, { cls: now ? (r.special ? 'f-ter' : 'f-ok') : 'f-surface', textCls: now ? 't-on t-bold' : 't-fg', rx: 4, lh: 16 });
    });
    decTbl.rows.forEach((tr, i) => tr.classList.toggle('on', i === k - 1));
    if (!r) decNote.textContent = 'Decoded string BBABABABA. The decoder rebuilt the dictionary the encoder used: 3 BB, 4 BA, 5 AB, 6 BAB, 7 BABA.';
    else if (r.s === 'NIL') decNote.textContent = 'k = 2 is B. Output B. This is the first code, so nothing is added yet, and s = B.';
    else if (r.special) decNote.textContent = 's = BA and k = 6, but code 6 is not in the dictionary yet. So entry = s + s[0] = BA + B = BAB. Output BAB and add BAB as code 6.';
    else decNote.textContent = `s = ${r.s}, k = ${r.k}, so the entry is ${r.entry}. Output ${r.entry} and add s + entry[0] = ${r.s} + ${r.entry[0]} = ${r.str} as code ${r.code}.`;
  });
});

QV.register('s2-w6', function (q) {
  const { s, svg, axes, line, plot, slider, scale } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: shared dB axis with voltage and power ratio scales
  const db = svg(viz('db'), 720, 220, { label: 'A decibel scale with voltage ratios above and power ratios below: system 1 at voltage ratio 20 is 26.02 dB, system 2 at power ratio 4000 is 36.02 dB', minWidth: 560 });
  const X = scale(0, 40, 92, 668);
  const R = { v: 44, d: 114, p: 184 };
  s('text', { x: 0, y: R.v, dy: '0.35em', class: 't-fg t-bold' }, db, 'Vₛ / Vₙ');
  s('text', { x: 0, y: R.d, dy: '0.35em', class: 't-fg t-bold' }, db, 'dB');
  s('text', { x: 0, y: R.p, dy: '0.35em', class: 't-fg t-bold' }, db, 'Pₛ / Pₙ');
  Object.values(R).forEach(y => s('line', { x1: X(0), x2: X(40), y1: y, y2: y, class: 'l-axis' }, db));
  [1, 2, 5, 10, 20, 50, 100].forEach(v => {
    const x = X(20 * Math.log10(v));
    s('line', { x1: x, x2: x, y1: R.v - 5, y2: R.v + 5, class: 'l-axis' }, db);
    s('text', { x, y: R.v - 11, 'text-anchor': 'middle' }, db, '×' + v);
  });
  [0, 10, 20, 30, 40].forEach(v => {
    s('line', { x1: X(v), x2: X(v), y1: R.d - 5, y2: R.d + 5, class: 'l-axis' }, db);
    s('text', { x: X(v), y: R.d + 19, 'text-anchor': 'middle' }, db, v + (v === 40 ? ' dB' : ''));
  });
  [1, 10, 100, 400, 1000, 4000, 10000].forEach(v => {
    const x = X(10 * Math.log10(v));
    s('line', { x1: x, x2: x, y1: R.p - 5, y2: R.p + 5, class: 'l-axis' }, db);
    s('text', { x, y: R.p + 19, 'text-anchor': 'middle' }, db, '×' + v);
  });
  s('path', { d: `M${X(0)} ${R.v + 8} L${X(0)} ${R.v + 12} L${X(20)} ${R.v + 12} L${X(20)} ${R.v + 8}`, class: 's-muted', style: 'stroke-width: 1' }, db);
  s('text', { x: X(10), y: R.v + 27, 'text-anchor': 'middle', class: 't-sm' }, db, '×10 in voltage = 20 dB');
  s('path', { d: `M${X(0)} ${R.p - 8} L${X(0)} ${R.p - 12} L${X(10)} ${R.p - 12} L${X(10)} ${R.p - 8}`, class: 's-muted', style: 'stroke-width: 1' }, db);
  s('text', { x: X(5), y: R.p - 19, 'text-anchor': 'middle', class: 't-sm' }, db, '×10 in power = 10 dB');
  [[20 * Math.log10(20), 'pri', 'System 1 · 26.02 dB', [R.v, R.d, R.p], 8, R.v + 32, 'start'], [10 * Math.log10(4000), 'sec', 'System 2 · 36.02 dB', [R.d, R.p], -8, R.d + 38, 'end']].forEach(([d, c, t, dots, dx, ty, anchor]) => {
    s('line', { x1: X(d), x2: X(d), y1: R.v, y2: R.p, class: 's-' + c, style: 'stroke-width: 2' }, db);
    dots.forEach(y => s('circle', { cx: X(d), cy: y, r: 4.5, class: 'f-' + c }, db));
    s('text', { x: X(d) + dx, y: ty, 'text-anchor': anchor, class: 't-' + c + ' t-bold' }, db, t);
  });

  // Figure 2: SQNR bars with an N slider
  const ch = svg(viz('sqnr'), 680, 300, { label: 'SQNR in dB against bits per sample N from 1 to 16, with the 50 dB target line', minWidth: 540 });
  const ax = axes(ch, { x: 56, y: 24, w: 600, h: 220, xd: [0.5, 16.5], yd: [0, 100], xt: Array.from({ length: 16 }, (_, i) => i + 1), yt: [0, 20, 40, 60, 80], xl: 'N, bits per sample', yl: 'SQNR (dB)' });
  const bars = [];
  for (let n = 1; n <= 16; n++) {
    bars.push(s('rect', { x: ax.x(n) - 12, y: ax.y(6.02 * n), width: 24, height: ax.y(0) - ax.y(6.02 * n), class: 'f-pri-soft' }, ch));
  }
  s('line', { x1: ax.x(0.5), x2: ax.x(16.5), y1: ax.y(50), y2: ax.y(50), class: 's-ter dash', style: 'stroke-width: 2' }, ch);
  s('text', { x: ax.x(0.5) + 6, y: ax.y(50) - 7, class: 't-ter t-bold' }, ch, 'target 50 dB');
  const sel = s('text', { 'text-anchor': 'middle', class: 't-pri t-bold' }, ch);
  const mv = n => (n >= 10 ? n.toFixed(1) : n >= 1 ? n.toFixed(2) : n.toFixed(4));
  slider(viz('n-slider'), { label: 'N', min: 1, max: 16, step: 1, value: 9, fmt: v => v + ' bits' }, n => {
    const d = 6.02 * n, stepMv = 2000 / 2 ** n;
    bars.forEach((b, i) => b.setAttribute('class', i + 1 === n ? 'f-pri' : 'f-pri-soft'));
    sel.setAttribute('x', ax.x(n));
    sel.setAttribute('y', ax.y(d) - 7);
    sel.textContent = d.toFixed(2);
    role('sqnr').textContent = d.toFixed(2);
    role('levels').textContent = String(2 ** n);
    role('step').textContent = mv(stepMv);
    role('err').textContent = mv(stepMv / 2);
    role('n-verdict').innerHTML = n === 9
      ? '<b>9 bits</b> give 54.18 dB, the first N at or above 50 dB. 8 bits give only 48.16 dB.'
      : n === 12 ? '<b>12 bits</b> give 72.24 dB, the answer to part 1.'
      : n < 9 ? `<b>${n} bits</b> give ${d.toFixed(2)} dB, below the 50 dB target.`
      : `<b>${n} bits</b> give ${d.toFixed(2)} dB, above the target, but 9 bits already suffice.`;
  });

  // Figure 3: 9-bit quantizer, first 8 steps
  const D = 2000 / 512;
  const qz = svg(viz('quant'), 660, 400, { label: 'Quantizer staircase for the first 8 steps of a 9-bit quantizer over 0 to 2 V, and the error sawtooth bounded by half a step', minWidth: 520 });
  const ticks = [0, 2, 4, 6, 8].map(k => k * D);
  const tf = v => (v ? v.toFixed(2) : '0');
  const tq = axes(qz, { x: 64, y: 24, w: 560, h: 180, xd: [0, 8 * D], yd: [0, 8 * D], xt: ticks, yt: ticks, xf: tf, yf: tf, yl: 'output (mV)' });
  line(qz, [[tq.x(0), tq.y(0)], [tq.x(8 * D), tq.y(8 * D)]], 's-muted').setAttribute('style', 'stroke-width: 7; opacity: 0.3');
  const st = [];
  for (let k = 0; k <= 8; k++) {
    const a = Math.max(0, (k - 0.5) * D), b = Math.min(8 * D, (k + 0.5) * D);
    st.push([tq.x(a), tq.y(k * D)], [tq.x(b), tq.y(k * D)]);
  }
  line(qz, st, 's-pri');
  s('text', { x: tq.x(0) + 8, y: tq.y(7.4 * D), class: 't-pri' }, qz, 'each riser = one step Δ = 3.91 mV');
  const eq = axes(qz, { x: 64, y: 258, w: 560, h: 90, xd: [0, 8 * D], yd: [-2.6, 2.6], xt: ticks, yt: [-D / 2, 0, D / 2], xf: tf, yf: v => (v ? (v < 0 ? '−' : '+') + Math.abs(v).toFixed(2) : '0'), xl: 'input (mV), the first 8 steps of 0 to 2 V', yl: 'error (mV)' });
  [-D / 2, D / 2].forEach(v => s('line', { x1: eq.x(0), x2: eq.x(8 * D), y1: eq.y(v), y2: eq.y(v), class: 's-muted dash', style: 'stroke-width: 1' }, qz));
  plot(qz, eq, x => x - D * Math.round(x / D), 0, 8 * D - 1e-6, 1600, 's-sec');
  s('text', { x: eq.x(8 * D), y: eq.y(D / 2) - 6, 'text-anchor': 'end', class: 't-muted' }, qz, 'max error = Δ/2 = 1.95 mV');
});

QV.register('s2-w7', function (q) {
  const { s, svg, grid, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const F = [
    [3, 1, 2, 0, 1],
    [0, 2, 1, 1, 0],
    [1, 0, 2, 2, 3],
    [2, 1, 0, 3, 1],
    [0, 3, 1, 2, 2],
  ];
  const inV = v => v === 1 || v === 2;
  const idx = ['0', '1', '2', '3', '4'];

  const given = svg(viz('given'), 260, 236, { label: 'Image f, 5 by 5, values 0 to 3, with row and column indices', minWidth: 260, maxWidth: 260 });
  grid(given, { x: 40, y: 44, data: F, cell: 36, fill: () => 'f-seg', rowLabels: idx, colLabels: idx, title: 'Image f' });

  // Figure 1: neighbours of p
  const C = 46;
  const nb = svg(viz('nb'), 300, 290, { label: 'The 5 by 5 image with p = (1,3), its 4-neighbours and its diagonal neighbours highlighted', minWidth: 260 });
  const g1 = grid(nb, { x: 50, y: 50, data: F, cell: C, fill: () => 'f-seg', text: false, rowLabels: idx, colLabels: idx });
  const t1 = F.map((row, r) => row.map((v, c) => [
    s('text', { x: g1.cx(c) + C / 2, y: g1.cy(r) + 18, dy: '0.35em', 'text-anchor': 'middle', class: 't-lg' }, nb, String(v)),
    s('text', { x: g1.cx(c) + C / 2, y: g1.cy(r) + 34, dy: '0.35em', 'text-anchor': 'middle', class: 't-sm' }, nb, `(${r},${c})`),
  ]));
  const N4 = [[2, 3], [0, 3], [1, 4], [1, 2]], NDg = [[2, 4], [2, 2], [0, 4], [0, 2]];
  const has = (L, r, c) => L.some(([a, b]) => a === r && b === c);
  const nbNote = role('nb-note');
  steps(viz('nb-steps'), ['N8 = N4 ∪ ND', 'N4', 'ND'], k => {
    F.forEach((row, r) => row.forEach((v, c) => {
      let cls = 'f-seg', on = true;
      if (r === 1 && c === 3) cls = 'f-ter';
      else if (k !== 2 && has(N4, r, c)) cls = 'f-pri';
      else if (k !== 1 && has(NDg, r, c)) cls = 'f-sec';
      else on = false;
      g1.rects[r][c].setAttribute('class', cls + ' sep');
      t1[r][c][0].setAttribute('class', 't-lg ' + (on ? 't-on t-bold' : 't-fg'));
      t1[r][c][1].setAttribute('class', 't-sm ' + (on ? 't-on' : 't-muted'));
    }));
    nbNote.textContent = [
      'N8(p) = N4(p) ∪ ND(p): all 8 pixels around p. The values play no part.',
      'N4(p) = {(2,3), (0,3), (1,4), (1,2)}: below, above, right, left.',
      'ND(p) = {(2,4), (2,2), (0,4), (0,2)}: the four corners.',
    ][k];
  });

  // Figure 2: distance paths from (4,0) to (1,2)
  const ds = svg(viz('dist'), 300, 312, { label: 'Paths from p = (4,0) to q = (1,2): a 5-move city-block path, a 3-move chessboard path and the straight line', minWidth: 260 });
  const g2 = grid(ds, { x: 50, y: 50, data: F, cell: C, fill: (v, r, c) => ((r === 4 && c === 0) || (r === 1 && c === 2) ? 'f-ter' : 'f-seg'), text: false, rowLabels: idx, colLabels: idx });
  [[4, 0, 'p'], [1, 2, 'q']].forEach(([r, c, n]) => s('text', { x: g2.cx(c) + 8, y: g2.cy(r) + 12, dy: '0.35em', class: 't-on t-bold' }, ds, n));
  s('text', { x: 50, y: 302, class: 't-fg' }, ds, 'p = (4,0),  q = (1,2)');
  const ctr = ([r, c]) => [g2.cx(c) + C / 2, g2.cy(r) + C / 2];
  const pathG = (cells, cls, extra) => {
    const g = s('g', { class: 'fade' }, ds);
    const pts = cells.map(ctr);
    s('path', { d: pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' '), class: cls, style: extra || null }, g);
    if (!extra) pts.slice(1, -1).forEach(([x, y]) => s('circle', { cx: x, cy: y, r: 4, class: cls.replace('s-', 'f-') }, g));
    return g;
  };
  const P4 = pathG([[4, 0], [3, 0], [2, 0], [1, 0], [1, 1], [1, 2]], 's-pri');
  const P8 = pathG([[4, 0], [3, 1], [2, 2], [1, 2]], 's-sec');
  const PE = pathG([[4, 0], [1, 2]], 's-fg', 'stroke-width: 2; stroke-dasharray: 6 4');
  const distNote = role('dist-note');
  steps(viz('dist-steps'), ['All', 'D4 = 5', 'D8 = 3', 'De = 3.61'], k => {
    [P4, P8, PE].forEach((g, i) => g.classList.toggle('dim', k > 0 && i !== k - 1));
    distNote.textContent = [
      'All three, from p = (4,0) to q = (1,2). Blue: D4. Plum: D8. Dashed: the straight line. They always satisfy D8 ≤ De ≤ D4, here 3 ≤ 3.61 ≤ 5.',
      'D4 = |x − s| + |y − t|: only up, down, left and right moves. 3 rows + 2 columns = 5 moves, in any order.',
      'D8 = max(|x − s|, |y − t|): a diagonal move also counts 1. Two diagonal moves cover 2 rows and 2 columns, one more move covers the last row: max(3, 2) = 3.',
      'De = √((x − s)² + (y − t)²) = √(3² + 2²) = √13 = 3.61, the straight line between the pixel centres.',
    ][k];
  });

  // Figure 3: m-adjacency small multiples
  const ma = svg(viz('madj'), 720, 236, { label: 'Four copies of the image, one per pair, showing pixels in V, the pair, the common 4-neighbours and whether the pair is m-adjacent', minWidth: 560 });
  const mc = 30, my = 40;
  const PAIRS = [
    { t: '(i) (2,2)-(2,3)', p: [2, 2], q: [2, 3], a4: 'yes', a8: 'yes', m: true },
    { t: '(ii) (1,1)-(2,2)', p: [1, 1], q: [2, 2], a4: 'no', a8: 'yes', m: false, alt: [[1, 1], [1, 2], [2, 2]] },
    { t: '(iii) (3,1)-(4,2)', p: [3, 1], q: [4, 2], a4: 'no', a8: 'yes', m: true },
    { t: '(iv) (2,3)-(2,4)', p: [2, 3], q: [2, 4], a4: 'no', a8: 'no', m: false },
  ];
  PAIRS.forEach((P, i) => {
    const x0 = 30 + i * 176;
    s('text', { x: x0 + 75, y: 16, 'text-anchor': 'middle', class: 't-fg t-bold' }, ma, P.t);
    const g = grid(ma, { x: x0, y: my, data: F, cell: mc, fill: v => (inV(v) ? 'f-pri-soft' : 'f-seg'), textCls: v => (inV(v) ? 't-fg' : 't-muted'), rowLabels: idx, colLabels: idx });
    const cc = ([r, c]) => [g.cx(c) + mc / 2, g.cy(r) + mc / 2];
    const diag = P.p[0] !== P.q[0] && P.p[1] !== P.q[1];
    if (diag) {
      [[P.p[0], P.q[1]], [P.q[0], P.p[1]]].forEach(([r, c]) => s('rect', { x: g.cx(c) + 3, y: g.cy(r) + 3, width: mc - 6, height: mc - 6, class: 'f-none outline-sec' }, ma));
    }
    const link = (a, b, cls) => {
      const [x1, y1] = cc(a), [x2, y2] = cc(b);
      const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
      s('line', { x1: x1 + ux * 6, y1: y1 + uy * 6, x2: x2 - ux * 6, y2: y2 - uy * 6, class: cls, style: 'stroke-width: 3' }, ma);
    };
    if (P.alt) {
      link(P.alt[0], P.alt[1], 's-ok');
      link(P.alt[1], P.alt[2], 's-ok');
    }
    link(P.p, P.q, P.m ? 's-ok' : 's-bad dash');
    [P.p, P.q].forEach(([r, c]) => s('rect', { x: g.cx(c), y: g.cy(r), width: mc, height: mc, class: 'f-none outline-pri', style: 'stroke-width: 2.5' }, ma));
    s('text', { x: x0 + 75, y: my + 5 * mc + 20, 'text-anchor': 'middle', class: 't-fg' }, ma, `4-adj ${P.a4} · 8-adj ${P.a8}`);
    s('text', { x: x0 + 75, y: my + 5 * mc + 38, 'text-anchor': 'middle', class: (P.m ? 't-ok' : 't-bad') + ' t-bold' }, ma, 'm-adj ' + (P.m ? 'yes' : 'no'));
  });
});

QV.register('s2-w8', function (q) {
  const { s, svg, axes, line } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);

  // CIE 1931 XYZ colour matching functions, multi-lobe Gaussian fit (Wyman, Sloan, Shirley 2013)
  const gs = (l, mu, a, b) => Math.exp(-0.5 * ((l - mu) / (l < mu ? a : b)) ** 2);
  const cmf = l => [
    1.056 * gs(l, 599.8, 37.9, 31.0) + 0.362 * gs(l, 442.0, 16.0, 26.7) - 0.065 * gs(l, 501.1, 20.4, 26.2),
    0.821 * gs(l, 568.8, 46.9, 40.5) + 0.286 * gs(l, 530.9, 16.3, 31.1),
    1.217 * gs(l, 437.0, 11.8, 36.0) + 0.681 * gs(l, 459.0, 26.0, 13.8),
  ];
  // CIE RGB → XYZ, inverted to get r̄ ḡ b̄ from x̄ ȳ z̄
  const M = [[0.49, 0.31, 0.2], [0.17697, 0.8124, 0.01063], [0, 0.01, 0.99]].map(r => r.map(v => v / 0.17697));
  const inv3 = m => {
    const [[a, b, c], [d, e, f], [g, h, i]] = m;
    const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    return [[e * i - f * h, c * h - b * i, b * f - c * e], [f * g - d * i, a * i - c * g, c * d - a * f], [d * h - e * g, b * g - a * h, a * e - b * d]].map(r => r.map(v => v / det));
  };
  const Mi = inv3(M);
  const rgbCmf = l => { const x = cmf(l); return Mi.map(r => r[0] * x[0] + r[1] * x[1] + r[2] * x[2]); };
  const COL = ['#D64541', '#2E9A55', '#3F73DE']; // data-color: red, green, blue primaries

  // Figure 1: CMFs
  const cm = svg(viz('cmf'), 680, 466, { label: 'CIE-RGB colour matching functions with the negative lobe of r-bar, and the non-negative CIE-XYZ functions', minWidth: 540 });
  const top = axes(cm, { x: 60, y: 30, w: 590, h: 170, xd: [400, 700], yd: [-0.12, 0.4], xt: [400, 450, 500, 550, 600, 650, 700], yt: [-0.1, 0, 0.1, 0.2, 0.3], yf: v => (v < 0 ? '−' + Math.abs(v) : String(v)) });
  const bot = axes(cm, { x: 60, y: 262, w: 590, h: 150, xd: [400, 700], yd: [0, 1.9], xt: [400, 450, 500, 550, 600, 650, 700], yt: [0, 0.5, 1, 1.5], xl: 'wavelength λ (nm)' });
  s('text', { x: 60, y: 20, class: 't-body' }, cm, 'CIE-RGB color matching functions');
  s('text', { x: 60, y: 252, class: 't-body' }, cm, 'CIE-XYZ color matching functions');
  const lam = [];
  for (let l = 400; l <= 700; l += 1) lam.push(l);
  const neg = lam.filter(l => rgbCmf(l)[0] < 0);
  s('path', { d: `M${top.x(neg[0])} ${top.y(0)} ` + neg.map(l => `L${top.x(l).toFixed(1)} ${top.y(rgbCmf(l)[0]).toFixed(1)}`).join(' ') + ` L${top.x(neg[neg.length - 1])} ${top.y(0)} Z`, class: 'f-bad-soft' }, cm);
  s('line', { x1: top.x(400), x2: top.x(700), y1: top.y(0), y2: top.y(0), class: 'l-axis' }, cm);
  [0, 1, 2].forEach(k => {
    line(cm, lam.map(l => [top.x(l), top.y(rgbCmf(l)[k])]), 's-fg').setAttribute('style', `stroke: ${COL[k]}; stroke-width: 2.5`); // data-color
    line(cm, lam.map(l => [bot.x(l), bot.y(cmf(l)[k])]), 's-fg').setAttribute('style', `stroke: ${COL[k]}; stroke-width: 2.5`); // data-color
  });
  [['r̄', 622, 0.36, 0], ['ḡ', 532, 0.24, 1], ['b', 424, 0.33, 2]].forEach(([t, l, v, k]) => {
    s('text', { x: top.x(l), y: top.y(v), dy: '0.35em', 'text-anchor': k === 2 ? 'end' : 'start', class: 't-body t-bold t-xl', style: `fill: ${COL[k]}` }, cm, t); // data-color
  });
  // the font misplaces a combining macron over b, so its bar is drawn
  s('line', { x1: top.x(424) - 9, x2: top.x(424) - 1, y1: top.y(0.33) - 14, y2: top.y(0.33) - 14, style: `stroke: ${COL[2]}; stroke-width: 1.6` }, cm); // data-color
  [['x̄', 632, 1.0, 0], ['ȳ', 560, 1.13, 1], ['z̄', 424, 1.6, 2]].forEach(([t, l, v, k]) => {
    s('text', { x: bot.x(l), y: bot.y(v), dy: '0.35em', 'text-anchor': k === 2 ? 'end' : 'start', class: 't-body t-bold t-xl', style: `fill: ${COL[k]}` }, cm, t); // data-color
  });
  s('text', { x: top.x(402), y: top.y(-0.075), dy: '0.35em', class: 't-bad t-bold t-body' }, cm, 'r̄ < 0');
  s('text', { x: bot.x(492), y: bot.y(1.6), class: 't-fg t-body' }, cm, 'ȳ = luminous efficiency, so Y = luminance');
  s('text', { x: bot.x(492), y: bot.y(1.6) + 16, class: 't-fg t-body' }, cm, 'all three ≥ 0 at every wavelength');

  // Figure 2: chromaticity diagram, full and zoomed
  const LOCUS = [
    [380, 0.1741, 0.005], [410, 0.1726, 0.0048], [420, 0.1714, 0.0051], [430, 0.1689, 0.0069], [440, 0.1644, 0.0109],
    [450, 0.1566, 0.0177], [460, 0.144, 0.0297], [465, 0.1355, 0.0399], [470, 0.1241, 0.0578], [475, 0.1096, 0.0868],
    [480, 0.0913, 0.1327], [485, 0.0687, 0.2007], [490, 0.0454, 0.295], [495, 0.0235, 0.4127], [500, 0.0082, 0.5384],
    [505, 0.0039, 0.6548], [510, 0.0139, 0.7502], [515, 0.0389, 0.812], [520, 0.0743, 0.8338], [525, 0.1142, 0.8262],
    [530, 0.1547, 0.8059], [535, 0.1929, 0.7816], [540, 0.2296, 0.7543], [545, 0.2658, 0.7243], [550, 0.3016, 0.6923],
    [555, 0.3373, 0.6589], [560, 0.3731, 0.6245], [565, 0.4087, 0.5896], [570, 0.4441, 0.5547], [575, 0.4788, 0.5202],
    [580, 0.5125, 0.4866], [585, 0.5448, 0.4544], [590, 0.5752, 0.4242], [595, 0.6029, 0.3965], [600, 0.627, 0.3725],
    [605, 0.6482, 0.3514], [610, 0.6658, 0.334], [620, 0.6915, 0.3083], [630, 0.7079, 0.292], [640, 0.719, 0.2809],
    [650, 0.726, 0.274], [660, 0.73, 0.27], [680, 0.7334, 0.2666], [700, 0.7347, 0.2653],
  ];
  const poly = LOCUS.map(([, x, y]) => [x, y]);
  const inside = (x, y) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const gam = u => (u <= 0.0031308 ? 12.92 * u : 1.055 * u ** (1 / 2.4) - 0.055);
  const toSRGB = (X, Y, Z) => [
    3.2406 * X - 1.5372 * Y - 0.4986 * Z,
    -0.9689 * X + 1.8758 * Y + 0.0415 * Z,
    0.0557 * X - 0.204 * Y + 1.057 * Z,
  ];
  const chromaRGB = (x, y) => {
    const lin = toSRGB(x / y, 1, (1 - x - y) / y).map(v => Math.max(0, v));
    const m = Math.max(...lin);
    return lin.map(v => Math.round(255 * gam(v / m)));
  };
  // Chromaticity colours are rendered to a canvas because they are the data
  const paint = (w, h, x0, x1, y0, y1) => {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(w, h);
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const x = x0 + (i + 0.5) / w * (x1 - x0), y = y1 - (j + 0.5) / h * (y1 - y0);
        if (!inside(x, y)) continue;
        const [r, g, b] = chromaRGB(x, y), o = 4 * (j * w + i);
        img.data[o] = r;
        img.data[o + 1] = g;
        img.data[o + 2] = b;
        img.data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return cv.toDataURL('image/png');
  };
  const D65 = [0.3127, 0.329], C1 = [0.4, 0.35], C2 = [19 / 64, 20 / 64];
  const xy = svg(viz('xy'), 790, 440, { label: 'CIE chromaticity diagram with the spectral locus, the D65 white point and the colors C1 and C2, plus an enlarged view of the region around white', minWidth: 560 });
  const full = axes(xy, { x: 50, y: 24, w: 320, h: 360, xd: [0, 0.8], yd: [0, 0.9], xt: [0, 0.2, 0.4, 0.6, 0.8], yt: [0, 0.2, 0.4, 0.6, 0.8], xl: 'x', yl: 'y' });
  s('image', { x: 50, y: 24, width: 320, height: 360, href: paint(320, 360, 0, 0.8, 0, 0.9), preserveAspectRatio: 'none' }, xy);
  s('path', { d: poly.map((p, i) => (i ? 'L' : 'M') + full.x(p[0]).toFixed(1) + ' ' + full.y(p[1]).toFixed(1)).join(' '), class: 's-fg' }, xy);
  s('line', { x1: full.x(poly[0][0]), y1: full.y(poly[0][1]), x2: full.x(0.7347), y2: full.y(0.2653), class: 's-fg dash' }, xy);
  LOCUS.filter(([l]) => [470, 480, 500, 520, 540, 560, 580, 600, 620].includes(l)).forEach(([l, x, y]) => {
    const dx = x - 0.33, dy = y - 0.33, L = Math.hypot(dx, dy);
    const px = full.x(x) + dx / L * 16, py = full.y(y) - dy / L * 16;
    s('text', { x: px, y: py, dy: '0.35em', 'text-anchor': dx < -0.05 ? 'end' : dx > 0.05 ? 'start' : 'middle', class: 't-sm' }, xy, String(l));
  });
  const Z = { x0: 0.27, x1: 0.43, y0: 0.28, y1: 0.38 };
  s('rect', { x: full.x(Z.x0), y: full.y(Z.y1), width: full.x(Z.x1) - full.x(Z.x0), height: full.y(Z.y0) - full.y(Z.y1), class: 'f-none s-fg dash' }, xy);
  [[C1, 'f-sec'], [C2, 'f-pri'], [D65, 'f-fg']].forEach(([p, c]) => s('circle', { cx: full.x(p[0]), cy: full.y(p[1]), r: 3.5, class: c + ' sep' }, xy));

  const zm = axes(xy, { x: 460, y: 24, w: 320, h: 200, xd: [Z.x0, Z.x1], yd: [Z.y0, Z.y1], xt: [0.28, 0.32, 0.36, 0.4], yt: [0.3, 0.32, 0.34, 0.36], xf: v => v.toFixed(2), yf: v => v.toFixed(2), xl: 'x (enlarged)', grid: false });
  s('image', { x: 460, y: 24, width: 320, height: 200, href: paint(320, 200, Z.x0, Z.x1, Z.y0, Z.y1), preserveAspectRatio: 'none' }, xy);
  s('rect', { x: 460, y: 24, width: 320, height: 200, class: 'f-none s-fg dash' }, xy);
  const zp = p => [zm.x(p[0]), zm.y(p[1])];
  [[C1, 's-sec'], [C2, 's-pri']].forEach(([p, c]) => line(xy, [zp(D65), zp(p)], c));
  [[C1, 'f-sec', 'C1', 0, -14], [C2, 'f-pri', 'C2', 0, 20], [D65, 'f-fg', 'D65', -2, -14]].forEach(([p, c, t, dx, dy]) => {
    const [x, y] = zp(p);
    s('circle', { cx: x, cy: y, r: 5.5, class: c + ' sep' }, xy);
    s('text', { x: x + dx, y: y + dy, 'text-anchor': 'middle', class: 't-fg t-bold halo' }, xy, t);
  });
  const mid = (a, b) => [(zp(a)[0] + zp(b)[0]) / 2, (zp(a)[1] + zp(b)[1]) / 2];
  const m1 = mid(D65, C1), m2 = mid(D65, C2);
  s('text', { x: m1[0], y: m1[1] - 10, 'text-anchor': 'middle', class: 't-sec t-bold halo' }, xy, '0.0898');
  s('text', { x: m2[0] + 10, y: m2[1] + 10, class: 't-pri t-bold halo' }, xy, '0.0229');
  s('text', { x: 460, y: 280, class: 't-fg' }, xy, 'C1 (0.400, 0.350): towards red / orange');
  s('text', { x: 460, y: 300, class: 't-fg' }, xy, 'C2 (0.297, 0.313): near white, slightly blue');
  s('text', { x: 460, y: 320, class: 't-fg' }, xy, 'D65 (0.3127, 0.3290): white point');

  // Figure 3: swatches at their real luminance
  const sw = svg(viz('swatch'), 640, 196, { label: 'Swatches of C1 at Y 42, C2 at Y 20, and C2 scaled to Y 42, with bars for Y', minWidth: 500 });
  [
    { t: 'C1', xyz: [48, 42, 30], sub: '(x, y) = (0.400, 0.350)' },
    { t: 'C2', xyz: [19, 20, 25], sub: '(x, y) = (0.297, 0.313)' },
    { t: 'C2 × 2.1', xyz: [39.9, 42, 52.5], sub: '(x, y) = (0.297, 0.313)' },
  ].forEach((c, i) => {
    const x0 = 20 + i * 210;
    const [r, g, b] = toSRGB(...c.xyz.map(v => v / 100)).map(v => Math.round(255 * gam(Math.max(0, Math.min(1, v)))));
    s('text', { x: x0, y: 18, class: 't-fg t-bold' }, sw, c.t);
    s('rect', { x: x0, y: 28, width: 170, height: 86, rx: 6, class: 'box', style: `fill: rgb(${r}, ${g}, ${b})` }, sw); // data-color
    s('text', { x: x0, y: 134, class: 't-fg' }, sw, c.sub);
    s('rect', { x: x0, y: 148, width: c.xyz[1] * 2.5, height: 14, class: 'f-pri' }, sw);
    s('text', { x: x0 + c.xyz[1] * 2.5 + 6, y: 155, dy: '0.35em', class: 't-pri t-bold' }, sw, 'Y = ' + c.xyz[1]);
  });
  s('text', { x: 20, y: 186, class: 't-sm' }, sw, 'bar length = Y, the luminance. Chromaticity (x, y) leaves Y out.');
});

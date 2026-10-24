QV.register('s5-w1', function (q) {
  const { s, svg, grid, steps, table } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const role = n => q.querySelector(`[data-role="${n}"]`);
  const A = [[0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 0], [0, 1, 1, 1, 0, 1], [1, 1, 1, 1, 0, 0], [0, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0]];
  const at = (r, c) => (r >= 0 && r < 6 && c >= 0 && c < 6 ? A[r][c] : 0);
  const map = f => A.map((row, r) => row.map((v, c) => f(r, c)));
  const win1 = (r, c) => [at(r, c - 1), at(r, c), at(r, c + 1)];
  const NB = [-1, 0, 1];
  const D = map((r, c) => Math.max(...win1(r, c)));
  const E = map((r, c) => Math.min(...win1(r, c)));
  const E2 = map((r, c) => Math.min(...NB.flatMap(i => NB.map(j => at(r + i, c + j)))));
  const BETA = map((r, c) => A[r][c] - E2[r][c]);
  const IDX = ['0', '1', '2', '3', '4', '5'];
  const bin = v => (v ? { cls: 'f-pri', text: 't-on' } : { cls: 'f-seg', text: 't-muted' });
  const gone = { cls: 'f-ter-soft', text: 't-ter' };
  const count = M => M.flat().reduce((a, b) => a + b, 0);
  const C = 32, Y0 = 52;

  const gv = svg(viz('given'), 470, 232, { label: 'Binary image A, 6 by 6, and the structuring elements B1 (1 by 3) and B2 (3 by 3)', minWidth: 470, maxWidth: 470 });
  grid(gv, { x: 34, y: 50, cell: 28, data: A, fill: bin, rowLabels: IDX, colLabels: IDX, title: 'A' });
  const b1 = grid(gv, { x: 260, y: 62, cell: 28, data: [[1, 1, 1]], fill: bin, title: 'B1 (1 × 3)' });
  s('rect', { x: b1.cx(1), y: b1.cy(0), width: 28, height: 28, class: 'f-none outline-sec' }, gv);
  s('text', { x: 356, y: 76, dy: '0.35em', class: 't-sec' }, gv, '← origin');
  const b2 = grid(gv, { x: 260, y: 130, cell: 28, data: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], fill: bin, title: 'B2 (3 × 3)' });
  s('rect', { x: b2.cx(1), y: b2.cy(1), width: 28, height: 28, class: 'f-none outline-sec' }, gv);

  // Figure 1: B1 window, dilation, erosion
  const P = { a: 72, d: 352, e: 600 };
  const f1 = svg(viz('b1'), 812, 282, { label: 'A with the B1 window, A dilated by B1 and A eroded by B1', minWidth: 560 });
  [[P.a, 'A (dashed: outside = 0)'], [P.d, 'A ⊕ B1 (max)'], [P.e, 'A ⊖ B1 (min)']].forEach(([x, t]) => s('text', { x: x + 3 * C, y: 18, 'text-anchor': 'middle', class: 't-fg t-bold' }, f1, t));
  for (let r = 0; r < 6; r++) {
    [-1, 6].forEach(c => {
      s('rect', { x: P.a + c * C + 3, y: Y0 + r * C + 3, width: C - 6, height: C - 6, rx: 2, class: 'f-none s-muted dash', style: 'stroke-width: 1' }, f1);
      s('text', { x: P.a + c * C + C / 2, y: Y0 + r * C + C / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-muted t-sm' }, f1, '0');
    });
    s('text', { x: P.a - C - 6, y: Y0 + r * C + C / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, f1, IDX[r]);
  }
  grid(f1, { x: P.a, y: Y0, cell: C, data: A, fill: bin, colLabels: IDX });
  grid(f1, { x: P.d, y: Y0, cell: C, data: D, rowLabels: IDX, colLabels: IDX, fill: (v, r, c) => (v && !A[r][c] ? { cls: 'f-ok', text: 't-on' } : bin(v)) });
  grid(f1, { x: P.e, y: Y0, cell: C, data: E, rowLabels: IDX, colLabels: IDX, fill: (v, r, c) => (!v && A[r][c] ? gone : bin(v)) });
  [[P.a, A], [P.d, D], [P.e, E]].forEach(([x, M]) => s('text', { x: x + 3 * C, y: Y0 + 6 * C + 22, 'text-anchor': 'middle', class: 't-fg' }, f1, count(M) + ' pixels'));
  const probe = s('g', {}, f1);
  const PROBES = [null, [1, 0], [2, 4], [2, 5], [3, 0], [3, 2], [0, 2]];
  const WHY = ['', 'The run in row 1 grows one pixel to the left.', 'Dilation fills the gap, so (2,5) joins the block.', 'Erosion deletes the isolated pixel.', 'Its left neighbour is outside the image, so erosion deletes it.', 'An interior pixel survives both.', 'Row 0 stays 0 because B1 only looks left and right.'];
  const n1 = role('b1-note');
  steps(viz('b1-steps'), PROBES.map(p => (p ? `(${p[0]},${p[1]})` : 'All')), k => {
    probe.textContent = '';
    if (!k) {
      n1.textContent = 'Dilation keeps every 1 of A and adds 7 new ones, 22 in total. Erosion keeps only the 6 pixels whose left and right neighbours are both 1.';
      return;
    }
    const [r, c] = PROBES[k];
    s('rect', { x: P.a + (c - 1) * C, y: Y0 + r * C, width: 3 * C, height: C, rx: 3, class: 'f-none outline-sec' }, probe);
    [P.d, P.e].forEach(x => s('rect', { x: x + c * C, y: Y0 + r * C, width: C, height: C, rx: 3, class: 'f-none outline-sec' }, probe));
    n1.textContent = `(${r},${c}): the window holds ${win1(r, c).join(', ')}. Dilation takes the max = ${D[r][c]}, erosion the min = ${E[r][c]}. ${WHY[k]}`;
  });

  // Figure 2: B2 erosion and the boundary
  const Q = { a: 40, e: 300, b: 560 };
  const f2 = svg(viz('b2'), 776, 282, { label: 'A with the B2 window, A eroded by B2, and the boundary beta of A', minWidth: 560 });
  [[Q.a, 'A with B2'], [Q.e, 'A ⊖ B2'], [Q.b, 'β(A) = A − (A ⊖ B2)']].forEach(([x, t]) => s('text', { x: x + 3 * C, y: 18, 'text-anchor': 'middle', class: 't-fg t-bold' }, f2, t));
  grid(f2, { x: Q.a, y: Y0, cell: C, data: A, fill: bin, rowLabels: IDX, colLabels: IDX });
  grid(f2, { x: Q.e, y: Y0, cell: C, data: E2, fill: bin, rowLabels: IDX, colLabels: IDX });
  grid(f2, { x: Q.b, y: Y0, cell: C, data: BETA, rowLabels: IDX, colLabels: IDX, fill: (v, r, c) => (!v && A[r][c] ? gone : bin(v)) });
  [[Q.a, A], [Q.e, E2], [Q.b, BETA]].forEach(([x, M]) => s('text', { x: x + 3 * C, y: Y0 + 6 * C + 22, 'text-anchor': 'middle', class: 't-fg' }, f2, count(M) + ' pixels'));
  const probe2 = s('g', {}, f2);
  const CANDS = [null, [2, 1], [2, 2], [2, 3], [3, 1], [3, 2], [3, 3]];
  const n2 = role('b2-note');
  steps(viz('b2-steps'), CANDS.map(p => (p ? `(${p[0]},${p[1]})` : 'All')), k => {
    probe2.textContent = '';
    if (!k) {
      n2.textContent = 'A ⊖ B2 keeps only (2,2) and (3,2). Subtracting them from A leaves the 13 boundary pixels.';
      return;
    }
    const [r, c] = CANDS[k];
    const zeros = [];
    NB.forEach(i => NB.forEach(j => {
      if (at(r + i, c + j)) return;
      zeros.push(`(${r + i},${c + j})`);
      s('rect', { x: Q.a + (c + j) * C + 4, y: Y0 + (r + i) * C + 4, width: C - 8, height: C - 8, rx: 2, class: 'f-none s-bad' }, probe2);
    }));
    s('rect', { x: Q.a + (c - 1) * C, y: Y0 + (r - 1) * C, width: 3 * C, height: 3 * C, rx: 3, class: 'f-none outline-sec' }, probe2);
    [Q.e, Q.b].forEach(x => s('rect', { x: x + c * C, y: Y0 + r * C, width: C, height: C, rx: 3, class: 'f-none outline-sec' }, probe2));
    n2.textContent = zeros.length
      ? `(${r},${c}): the window holds a 0 at ${zeros.join(', ')}, so the minimum is 0. (${r},${c}) is not in A ⊖ B2 and stays in β(A) as a boundary pixel.`
      : `(${r},${c}): all nine pixels under B2 are 1, so (${r},${c}) survives the erosion and is removed from β(A).`;
  });

  const str = row => row.join('\u00a0');
  const L = t => ({ text: t, cls: 'l' });
  table(viz('table'), ['row', 'A', 'A ⊕ B1', 'A ⊖ B1', 'A ⊖ B2', 'β(A) = A − (A ⊖ B2)'].map(L),
    A.map((row, r) => [String(r), str(row), str(D[r]), str(E[r]), str(E2[r]), str(BETA[r])].map(L))
      .concat([[L('#\u00a0of\u00a01s')].concat([A, D, E, E2, BETA].map(M => ({ text: String(count(M)), cls: 'l hl' })))]));
});

QV.register('s5-w2', function (q) {
  const { s, svg, axes, line, grid, gray, steps, slider, table, mat, fmt } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const role = n => q.querySelector(`[data-role="${n}"]`);
  const ROW = [30, 30, 30, 240, 30, 30, 90, 90, 90, 90];
  const filt = f => ROW.map((v, i) => (i === 0 || i === 9 ? v : f(ROW.slice(i - 1, i + 2))));
  const sorted = w => w.slice().sort((a, b) => a - b);
  const AVG = filt(w => (w[0] + w[1] + w[2]) / 3);
  const MED = filt(w => sorted(w)[1]);
  const MIN = filt(w => Math.min(...w));
  const MAX = filt(w => Math.max(...w));
  const P = ROW.map((v, i) => 'p' + i);

  table(viz('given'), P, [ROW.map(String)]);

  // Figure 1: high boost on a step, driven by alpha
  const N = 16;
  const SIG = Array.from({ length: N }, (_, i) => (i < 8 ? 40 : 160));
  const LOW = SIG.map((v, i) => (SIG[Math.max(0, i - 1)] + v + SIG[Math.min(N - 1, i + 1)]) / 3);
  const mk = mat(viz('mask'), [[-1, -1, -1], [-1, 12.5, -1], [-1, -1, -1]], { caption: 'mask × 1/9', text: v => (v < 0 ? '−1' : fmt(v)), hl: (v, r, c) => (r === 1 && c === 1 ? 'on' : null) });
  const bs = svg(viz('boost'), 640, 292, { label: 'One row with a step: original, 3-point average and high-boost output for the chosen alpha', minWidth: 480 });
  const ax = axes(bs, { x: 56, y: 24, w: 560, h: 220, xd: [0, 15], yd: [-60, 300], xt: [0, 3, 6, 9, 12, 15], yt: [-40, 0, 40, 80, 120, 160, 200, 240, 280], xl: 'position along the row', yl: 'value' });
  const path = vals => vals.map((v, i) => [ax.x(i), ax.y(v)]);
  s('line', { x1: ax.x(0), x2: ax.x(15), y1: ax.y(0), y2: ax.y(0), class: 's-fg', style: 'stroke-width: 1; opacity: 0.5' }, bs);
  line(bs, path(LOW), 's-ter');
  line(bs, path(SIG), 's-muted dash');
  const hbLine = s('path', { class: 's-pri' }, bs);
  const dots = s('g', {}, bs);
  const flat = s('text', { 'text-anchor': 'end', class: 't-pri t-bold halo' }, bs);
  slider(viz('slider'), { label: 'α', min: 1, max: 2.5, step: 0.1, value: 1.5, fmt: v => v.toFixed(1) }, v => {
    const a = Math.round(v * 10) / 10;
    const hb = SIG.map((v, i) => a * v - LOW[i]);
    hbLine.setAttribute('d', path(hb).map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' '));
    dots.textContent = '';
    hb.forEach((v, i) => s('circle', { cx: ax.x(i), cy: ax.y(v), r: 3, class: 'f-pri' }, dots));
    const w = 9 * a - 1, sum = a - 1, top = sum * 160;
    mk.cells[1][1].textContent = fmt(w, 2);
    role('omega').textContent = fmt(w, 2);
    role('sum').textContent = fmt(sum, 2);
    flat.setAttribute('x', ax.x(15));
    flat.setAttribute('y', ax.y(top) + (top > 110 && top < 165 ? 18 : -10));
    flat.textContent = `flat 160 → ${fmt(top, 1)}`;
    role('verdict').textContent = a === 1
      ? 'α = 1: ω = 8 and the mask sums to 0. This is the high pass filter. Flat areas become 0 and only the edge detail is left.'
      : `α = ${a.toFixed(1)}: ω = ${fmt(w, 2)} and the mask sums to ${fmt(sum, 2)}. The background comes back at ${fmt(sum, 2)} × its level, and the overshoot at the edge stays.`;
  });

  // Figure 2: sliding 3-point window
  const X0 = 100, CW = 46, RY = [30, 96, 162];
  const ws = svg(viz('win'), 600, 218, { label: 'The input row, its 3-point average and its 3-point median, drawn as gray cells', minWidth: 480 });
  grid(ws, { x: X0, y: RY[0], cell: CW, data: [ROW], fill: v => gray(v), colLabels: P });
  grid(ws, { x: X0, y: RY[1], cell: CW, data: [AVG], fill: v => gray(v), text: v => fmt(v) });
  grid(ws, { x: X0, y: RY[2], cell: CW, data: [MED], fill: v => gray(v) });
  ['input', 'average', 'median'].forEach((t, i) => s('text', { x: X0 - 12, y: RY[i] + CW / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-fg t-bold' }, ws, t));
  const ov = s('g', {}, ws);
  const bt = table(viz('b-table'), ['Pixel', 'Window', 'Average (sum/3)', 'Median (sorted, middle)'].map(t => ({ text: t, cls: 'l' })),
    [1, 2, 3, 4, 5, 6, 7, 8].map(i => {
      const w = ROW.slice(i - 1, i + 2);
      return [P[i], w.join(' '), `${w[0] + w[1] + w[2]}/3 = ${fmt(AVG[i])}`, `${sorted(w).join(' ')} → ${MED[i]}`].map(t => ({ text: t, cls: 'l' }));
    }));
  const wn = role('win-note');
  steps(viz('win-steps'), ['All', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'], k => {
    ov.textContent = '';
    bt.rows.forEach((r, i) => r.classList.toggle('on', i === k - 1));
    if (!k) {
      wn.textContent = 'All eight windows. The average turns the single 240 into three pixels of 100 and the step into a ramp. The median drops the 240 and keeps the step. p0 and p9 are copied.';
      return;
    }
    s('rect', { x: X0 + (k - 1) * CW, y: RY[0], width: 3 * CW, height: CW, rx: 3, class: 'f-none outline-sec' }, ov);
    [RY[1], RY[2]].forEach(y => s('rect', { x: X0 + k * CW, y, width: CW, height: CW, rx: 3, class: 'f-none outline-sec' }, ov));
    const w = ROW.slice(k - 1, k + 2);
    wn.textContent = `p${k}: window ${w.join(' ')}. Average ${w[0] + w[1] + w[2]}/3 = ${fmt(AVG[k])}. Sorted ${sorted(w).join(' ')}, the median is ${MED[k]}.`;
  });

  // Figure 3: profiles of the four filters
  const ps = svg(viz('prof'), 640, 292, { label: 'Profiles of the row after the average, median, min and max filters', minWidth: 480 });
  const pa = axes(ps, { x: 56, y: 24, w: 560, h: 220, xd: [0, 9], yd: [0, 260], xt: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], xf: v => 'p' + v, yt: [0, 50, 100, 150, 200, 250], xl: 'pixel', yl: 'gray level' });
  s('rect', { x: pa.x(5), y: pa.y(260), width: pa.x(6) - pa.x(5), height: pa.y(0) - pa.y(260), class: 'f-seg' }, ps);
  s('text', { x: (pa.x(5) + pa.x(6)) / 2, y: pa.y(260) + 14, 'text-anchor': 'middle', class: 't-muted t-sm' }, ps, 'edge');
  const pp = vals => vals.map((v, i) => [pa.x(i), pa.y(v)]);
  line(ps, pp(ROW), 's-muted dash');
  ROW.forEach((v, i) => s('circle', { cx: pa.x(i), cy: pa.y(v), r: 2.5, class: 'f-muted' }, ps));
  const lay = s('g', {}, ps);
  const SETS = [
    { lines: [[AVG, 'sec', 'average', 4.5, 100, -12], [MED, 'pri', 'median', 2, 30, 18]],
      note: 'The median removes the 240 and keeps the one-pixel step between p5 and p6. The average leaves three pixels at 100 and a ramp 30, 50, 70, 90 across the edge.' },
    { lines: [[MIN, 'ok', 'min: step moves to p6/p7', 3, 30, 18]],
      note: 'Min filter: 30 30 30 30 30 30 30 90 90 90. The white spike is gone, but the dark side wins at the edge, so the step moves one pixel right, to between p6 and p7.' },
    { lines: [[MAX, 'bad', 'max: 240 spreads', 3, 240, -12]],
      note: 'Max filter: 30 30 240 240 240 90 90 90 90 90. The bright side always wins, so the spike grows to three pixels. A max filter removes dark spikes only.' },
  ];
  const pn = role('prof-note');
  steps(viz('prof-steps'), ['Average vs median', 'Min filter', 'Max filter'], k => {
    lay.textContent = '';
    SETS[k].lines.forEach(([vals, c, name, li, lv, dy]) => {
      line(lay, pp(vals), 's-' + c);
      vals.forEach((v, i) => s('circle', { cx: pa.x(i), cy: pa.y(v), r: 3.5, class: 'f-' + c }, lay));
      s('text', { x: pa.x(li), y: pa.y(lv) + dy, 'text-anchor': 'middle', class: 't-bold halo t-' + c }, lay, name);
    });
    pn.textContent = SETS[k].note;
  });
});

QV.register('s5-w3', function (q) {
  const { s, svg, axes, line, grid, gray, steps, table, arrow, fmt } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const role = n => q.querySelector(`[data-role="${n}"]`);
  const IMG = [[5, 5, 6, 6], [4, 5, 6, 7], [5, 6, 6, 7], [5, 5, 6, 6]];
  const LV = [0, 1, 2, 3, 4, 5, 6, 7];
  const n = LV.map(r => IMG.flat().filter(v => v === r).length);
  const cum = n.map((_, r) => n.slice(0, r + 1).reduce((a, b) => a + b, 0));
  const raw = cum.map(c => c * 7 / 16);
  const sk = raw.map(v => Math.round(v));
  const OUT = IMG.map(row => row.map(v => sk[v]));
  const nOut = LV.map(r => OUT.flat().filter(v => v === r).length);
  const g7 = v => gray(v, 7);
  const IDX = ['0', '1', '2', '3'];

  const gi = svg(viz('given-img'), 200, 184, { label: 'The 4 by 4 input image with gray levels 4 to 7', minWidth: 200, maxWidth: 200 });
  grid(gi, { x: 34, y: 34, cell: 34, data: IMG, fill: g7, rowLabels: IDX, colLabels: IDX });
  const LUT = [0, 1, 1, 2, 4, 6, 7, 7], PIX = [2, 7, 4, 0, 5, 3, 6, 1];
  table(viz('given-lut'), [{ text: 'Index', cls: 'l' }].concat(LV.map(String)), [[{ text: 'Output', cls: 'l' }].concat(LUT.map(String))]);

  // Figure 1: histogram and running-sum mapping
  const cs = svg(viz('cdf'), 780, 292, { label: 'Histogram of the image and the equalization mapping from running sum times 7/16', minWidth: 560 });
  const ha = axes(cs, { x: 48, y: 30, w: 300, h: 210, xd: [-0.5, 7.5], yd: [0, 8], xt: LV, yt: [0, 2, 4, 6, 8], xl: 'gray level r', yl: 'count n' });
  const ta = axes(cs, { x: 450, y: 30, w: 300, h: 210, xd: [-0.5, 7.5], yd: [0, 7.5], xt: LV, yt: LV, xl: 'input level r', yl: 'output level s = round(sum × 7/16)' });
  line(cs, LV.map(r => [ta.x(r), ta.y(raw[r])]), 's-muted dash');
  const bars = LV.map(r => {
    const g = s('g', { class: 'fade' }, cs);
    if (n[r]) {
      s('rect', { x: ha.x(r) - 13, y: ha.y(n[r]), width: 26, height: ha.y(0) - ha.y(n[r]), class: 'f-pri' }, g);
      s('text', { x: ha.x(r), y: ha.y(n[r]) - 6, 'text-anchor': 'middle', class: 't-pri t-bold' }, g, n[r]);
    }
    return g;
  });
  const pts = LV.map(r => {
    const g = s('g', { class: 'fade' }, cs);
    s('circle', { cx: ta.x(r), cy: ta.y(raw[r]), r: 5, class: 's-muted' }, g);
    if (Math.abs(raw[r] - sk[r]) > 0.05) s('line', { x1: ta.x(r), x2: ta.x(r), y1: ta.y(raw[r]), y2: ta.y(sk[r]), class: 's-ok', style: 'stroke-width: 1.5' }, g);
    s('circle', { cx: ta.x(r), cy: ta.y(sk[r]), r: 4, class: 'f-ok' }, g);
    if (r >= 4) s('text', { x: ta.x(r) + 9, y: ta.y(sk[r]) + (r === 4 ? -9 : 15), class: 't-ok t-bold halo' }, g, 's = ' + sk[r]);
    return g;
  });
  const sub = t => `${t[0]}<sub>${t.slice(1)}</sub>`;
  const tb = table(viz('cdf-table'), [sub('rk'), sub('nk'), 'p<sub>r</sub> = n<sub>k</sub>/16', 'running sum', 'cdf = sum/16', 'sum × 7/16', sub('sk')].map(html => ({ html })),
    LV.map(r => [String(r), String(n[r]), fmt(n[r] / 16, 4), String(cum[r]), fmt(cum[r] / 16, 4), fmt(raw[r], 4), { text: String(sk[r]), cls: 'hl' }]));
  const cn = role('cdf-note');
  steps(viz('cdf-steps'), ['All', 'r = 4', 'r = 5', 'r = 6', 'r = 7'], k => {
    const rk = k ? k + 3 : 7;
    bars.forEach((g, r) => g.classList.toggle('dim', r > rk));
    pts.forEach((g, r) => g.classList.toggle('dim', r > rk));
    tb.rows.forEach((tr, r) => tr.classList.toggle('on', k > 0 && r === rk));
    cn.textContent = k
      ? `r = ${rk}: n = ${n[rk]}, running sum ${cum[rk - 1]} + ${n[rk]} = ${cum[rk]}. ${cum[rk]} × 7/16 = ${fmt(raw[rk], 4)}, which rounds to s = ${sk[rk]}.`
      : 'Levels 0 to 3 hold no pixels, so their running sum is 0 and they map to 0. The sum reaches 16 at level 7, so the top level maps to 7 = L − 1.';
  });

  // Figure 2: level mapping between the two histograms
  const ms = svg(viz('map'), 780, 356, { label: 'Input and equalized images, and arrows from each input level to its output level', minWidth: 560 });
  grid(ms, { x: 40, y: 40, cell: 30, data: IMG, fill: g7, title: 'input image' });
  grid(ms, { x: 40, y: 210, cell: 30, data: OUT, fill: g7, title: 'equalized image' });
  const xr = r => 266 + r * 64, yT = 128, yB = 228, BH = 11;
  [[yT, 'r', 16], [yB, 's', -8]].forEach(([y, name, dy]) => {
    s('line', { x1: 240, x2: 740, y1: y, y2: y, class: 'l-axis' }, ms);
    s('text', { x: 232, y: y + dy, 'text-anchor': 'end', class: 't-sm' }, ms, name);
    LV.forEach(r => s('text', { x: xr(r), y: y + dy, 'text-anchor': 'middle' }, ms, r));
  });
  s('text', { x: 240, y: 24, class: 't-fg t-bold' }, ms, 'input histogram');
  s('text', { x: 240, y: 346, class: 't-fg t-bold' }, ms, 'output histogram');
  LV.forEach(r => {
    if (n[r]) {
      s('rect', { x: xr(r) - 15, y: yT - n[r] * BH, width: 30, height: n[r] * BH, class: 'f-pri' }, ms);
      s('text', { x: xr(r), y: yT - n[r] * BH - 6, 'text-anchor': 'middle', class: 't-pri t-bold' }, ms, n[r]);
      arrow(ms, xr(r), yT + 24, xr(sk[r]), yB - 22, { cls: 'a-muted' });
    }
    if (nOut[r]) {
      s('rect', { x: xr(r) - 15, y: yB, width: 30, height: nOut[r] * BH, class: 'f-ok' }, ms);
      s('text', { x: xr(r), y: yB + nOut[r] * BH + 15, 'text-anchor': 'middle', class: 't-ok t-bold' }, ms, nOut[r]);
    }
  });

  // Figure 3: the LUT curve and the pixel row
  const ls = svg(viz('lut'), 780, 290, { label: 'Lookup table curve against the identity line, and the pixel row before and after the lookup', minWidth: 560 });
  const la = axes(ls, { x: 48, y: 24, w: 280, h: 210, xd: [0, 7], yd: [0, 7], xt: LV, yt: LV, xl: 'index (input level)', yl: 'output' });
  line(ls, [[la.x(0), la.y(0)], [la.x(7), la.y(7)]], 's-muted dash');
  line(ls, LV.map(v => [la.x(v), la.y(LUT[v])]), 's-pri');
  LV.forEach(v => s('circle', { cx: la.x(v), cy: la.y(LUT[v]), r: 3.5, class: 'f-pri' }, ls));
  s('text', { x: la.x(4) + 8, y: la.y(4) + 16, class: 't-fg t-bold' }, ls, 'm = 4');
  s('text', { x: la.x(2.4), y: la.y(0.6), 'text-anchor': 'middle', class: 't-muted' }, ls, 'darker');
  s('text', { x: la.x(4.6), y: la.y(6.6), 'text-anchor': 'end', class: 't-muted' }, ls, 'brighter');
  const RX = 424, RC = 40, YI = 60, YO = 176;
  grid(ls, { x: RX, y: YI, cell: RC, data: [PIX], fill: g7, title: 'input row' });
  grid(ls, { x: RX, y: YO, cell: RC, data: [PIX.map(v => LUT[v])], fill: g7 });
  s('text', { x: RX, y: YO + RC + 20, class: 't-fg t-bold' }, ls, 'output row');
  const arrs = PIX.map((v, i) => arrow(ls, RX + i * RC + RC / 2, YI + RC + 4, RX + i * RC + RC / 2, YO - 4, { cls: 'a-muted' }));
  arrs.forEach(a => a.classList.add('fade'));
  const hi = s('g', {}, ls);
  const ln = role('lut-note');
  steps(viz('lut-steps'), ['All'].concat(PIX.map((v, i) => 'pixel ' + (i + 1))), k => {
    hi.textContent = '';
    arrs.forEach((a, i) => a.classList.toggle('dim', k > 0 && i !== k - 1));
    if (!k) {
      ln.textContent = 'Each pixel value is used as the index. The row 2 7 4 0 5 3 6 1 becomes 1 7 4 0 6 2 7 1.';
      return;
    }
    const i = k - 1, v = PIX[i], o = LUT[v];
    [YI, YO].forEach(y => s('rect', { x: RX + i * RC, y, width: RC, height: RC, rx: 3, class: 'f-none outline-sec' }, hi));
    line(hi, [[la.x(v), la.y(0)], [la.x(v), la.y(o)], [la.x(0), la.y(o)]], 's-sec dash');
    s('circle', { cx: la.x(v), cy: la.y(o), r: 7, class: 's-sec' }, hi);
    const how = o < v ? 'Below 4, so it gets darker.' : o > v ? 'Above 4, so it gets brighter.' : v === 4 ? 'The centre m = 4 stays.' : 'This end of the range stays where it is.';
    ln.textContent = `Pixel ${k}: value ${v} is the index, and LUT[${v}] = ${o}. ${how}`;
  });
});

QV.register('s5-w4', function (q) {
  const { s, svg, axes, box, arrow, steps, slider, table, fmt } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const role = n => q.querySelector(`[data-role="${n}"]`);
  const PTS = [['S1', 'salmon', 4, 20], ['S2', 'salmon', 3, 18], ['S3', 'salmon', 2, 15], ['B1', 'sea bass', 6, 18], ['B2', 'sea bass', 8, 19], ['B3', 'sea bass', 7, 21], ['B4', 'sea bass', 9, 17]];
  table(viz('given'), ['Sample'].concat(PTS.map(p => p[0])).map(t => ({ text: t, cls: 'l' })), [
    ['Class'].concat(PTS.map(p => p[1])).map(t => ({ text: t, cls: 'l' })),
    ['Lightness'].concat(PTS.map(p => String(p[2]))).map(t => ({ text: t, cls: 'l' })),
    ['Width'].concat(PTS.map(p => String(p[3]))).map(t => ({ text: t, cls: 'l' })),
  ]);

  // Figure 1: system flow chart, bottom to top
  const fl = svg(viz('flow'), 720, 500, { label: 'Pattern recognition system: input, sensing, segmentation, feature extraction, classification, post-processing, decision, with side inputs', minWidth: 560 });
  const BX = 110, BW = 230, BH = 42, MX = BX + BW / 2, UX = BX + 85, DX = BX + 145, RX = BX + BW;
  const ST = [['sensing', 376], ['segmentation', 306], ['feature extraction', 236], ['classification', 166], ['post-processing', 96]];
  for (let i = 0; i < 4; i++) {
    const lo = ST[i][1], up = ST[i + 1][1] + BH;
    arrow(fl, UX, lo, UX, up + 1, { cls: 'a-pri', width: 2 });
    arrow(fl, DX, up, DX, lo - 1, { cls: 'a-muted', dash: true, width: 1.2 });
  }
  arrow(fl, MX, 468, MX, 376 + BH + 1, { cls: 'a-pri', width: 2 });
  s('text', { x: MX, y: 486, 'text-anchor': 'middle', class: 't-fg t-bold' }, fl, 'input');
  arrow(fl, MX, 96, MX, 56, { cls: 'a-pri', width: 2 });
  s('text', { x: MX, y: 44, 'text-anchor': 'middle', class: 't-fg t-bold' }, fl, 'decision');
  const SX = 520, BUS = 420;
  arrow(fl, SX, 108, RX + 1, 108, { cls: 'a-sec' });
  s('line', { x1: SX, x2: BUS, y1: 152, y2: 152, class: 's-sec', style: 'stroke-width: 1.5' }, fl);
  s('line', { x1: BUS, x2: BUS, y1: 128, y2: 180, class: 's-sec', style: 'stroke-width: 1.5' }, fl);
  arrow(fl, BUS, 128, RX + 1, 128, { cls: 'a-sec' });
  arrow(fl, BUS, 180, RX + 1, 180, { cls: 'a-sec' });
  arrow(fl, SX, 196, RX + 1, 196, { cls: 'a-sec' });
  [['costs', 108], ['adjustments for context', 152], ['adjustments for', 196], ['missing features', 210]].forEach(([t, y]) => s('text', { x: SX + 8, y, dy: '0.35em', class: 't-sec' }, fl, t));
  const layer = s('g', {}, fl);
  const JOBS = [
    'Data flows up from the input to the decision. The dotted arrows go back down to the stage below. Pick a stage to see its job in the slide wording.',
    'Sensing: use of a transducer (camera or microphone). The system depends on the bandwidth, resolution, sensitivity and distortion of the transducer.',
    'Segmentation and grouping: patterns should be well separated and should not overlap. Each fish is isolated from the others and from the background.',
    'Feature extraction: discriminative features, invariant with respect to translation, rotation and scale. It reduces the data by measuring certain features.',
    'Classification: use a feature vector provided by the feature extractor to assign the object to a category. Adjustments for context and for missing features come in here.',
    'Post-processing: exploit context, information other than from the target pattern itself, to improve performance. Costs and context come in here, and the output is the decision.',
  ];
  const fn = role('flow-note');
  steps(viz('flow-steps'), ['All', 'Sensing', 'Segmentation', 'Feature extraction', 'Classification', 'Post-processing'], k => {
    layer.textContent = '';
    ST.forEach(([name, y], i) => {
      const on = k === i + 1;
      box(layer, BX, y, BW, BH, name, { cls: on ? 'f-pri' : 'f-surface', textCls: on ? 't-on t-bold t-lg' : 't-fg t-lg', stroke: on ? 'sep' : 'box' });
    });
    fn.textContent = JOBS[k];
  });

  // Figure 2: schematic class histograms for length and lightness
  const pdf = (m, sd) => x => Math.exp(-0.5 * ((x - m) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
  const fe = svg(viz('feat'), 760, 262, { label: 'Schematic histograms: length overlaps heavily, lightness separates the classes, and the threshold x* trades the two errors', minWidth: 560 });
  const lenA = axes(fe, { x: 30, y: 30, w: 300, h: 180, xd: [0, 30], yd: [0, 0.14], xt: [], yt: [], xl: 'length (schematic)', yl: 'count' });
  const litA = axes(fe, { x: 430, y: 30, w: 310, h: 180, xd: [0, 11], yd: [0, 0.46], xt: [0, 2, 4, 6, 8, 10], yt: [], xl: 'lightness', yl: 'count' });
  const LEN = [pdf(12, 3.5), pdf(16, 3.5)], LIT = [pdf(3.2, 1), pdf(7.2, 1.3)];
  const cross = (f, g, a, b) => { for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (f(m) > g(m)) a = m; else b = m; } return (a + b) / 2; };
  const area = (ax, f, a, b, cls, g) => {
    const pts = [];
    for (let i = 0; i <= 80; i++) { const x = a + (b - a) * i / 80; pts.push(ax.x(x).toFixed(1) + ' ' + ax.y(f(x)).toFixed(1)); }
    s('path', { d: `M${ax.x(a).toFixed(1)} ${ax.y(0)} L${pts.join(' L')} L${ax.x(b).toFixed(1)} ${ax.y(0)} Z`, class: cls }, g);
  };
  const lStar = cross(LEN[0], LEN[1], 12, 16), xc = cross(LIT[0], LIT[1], 3.2, 7.2);
  area(lenA, LEN[1], 0, lStar, 'f-pri-soft', fe);
  area(lenA, LEN[0], lStar, 30, 'f-sec-soft', fe);
  const errs = s('g', {}, fe);
  [[lenA, LEN, 30], [litA, LIT, 11]].forEach(([ax, fs, hi]) => {
    QV.plot(fe, ax, fs[0], 0, hi, 160, 's-sec');
    QV.plot(fe, ax, fs[1], 0, hi, 160, 's-pri');
  });
  s('line', { x1: lenA.x(lStar), x2: lenA.x(lStar), y1: lenA.y(0), y2: lenA.y(0.14), class: 's-fg dash' }, fe);
  s('text', { x: lenA.x(lStar), y: lenA.y(0.14) - 6, 'text-anchor': 'middle', class: 't-fg t-bold' }, fe, 'l*');
  s('text', { x: lenA.x(6), y: lenA.y(0.118), 'text-anchor': 'middle', class: 't-sec t-bold' }, fe, 'salmon');
  s('text', { x: lenA.x(23), y: lenA.y(0.118), 'text-anchor': 'middle', class: 't-pri t-bold' }, fe, 'sea bass');
  s('text', { x: lenA.x(14), y: lenA.y(0.02), 'text-anchor': 'middle', class: 't-fg halo' }, fe, 'large overlap');
  s('text', { x: litA.x(1.3), y: litA.y(0.36), 'text-anchor': 'middle', class: 't-sec t-bold' }, fe, 'salmon');
  s('text', { x: litA.x(9.6), y: litA.y(0.3), 'text-anchor': 'middle', class: 't-pri t-bold' }, fe, 'sea bass');
  const thr = s('g', {}, fe);
  const fv = role('feat-verdict');
  slider(viz('feat-slider'), { label: 'x*', min: 3, max: 7, step: 0.1, value: Math.round(xc * 10) / 10, fmt: v => v.toFixed(1) }, v => {
    const x = Math.round(v * 10) / 10;
    errs.textContent = '';
    thr.textContent = '';
    area(litA, LIT[1], 0, x, 'f-pri-soft', errs);
    area(litA, LIT[0], x, 11, 'f-sec-soft', errs);
    s('line', { x1: litA.x(x), x2: litA.x(x), y1: litA.y(0), y2: litA.y(0.46), class: 's-fg dash' }, thr);
    s('text', { x: litA.x(x), y: litA.y(0.46) - 6, 'text-anchor': 'middle', class: 't-fg t-bold' }, thr, 'x* = ' + x.toFixed(1));
    if (Math.abs(x - xc) < 0.15) fv.textContent = `x* = ${x.toFixed(1)} sits where the two histograms cross. That gives the fewest errors in total when both errors cost the same.`;
    else if (x < xc) fv.textContent = `x* = ${x.toFixed(1)} is moved toward smaller lightness. Fewer sea bass are classified salmon, the costly error, and more salmon are classified sea bass.`;
    else fv.textContent = `x* = ${x.toFixed(1)} is moved toward larger lightness. More sea bass are classified salmon, which is the error the cost asks us to reduce.`;
  });

  // Figure 3: nearest neighbours of x = [5, 18]
  const RK = PTS.map(([id, cls, l, w]) => ({ id, cls, l, w, dl: l - 5, dw: w - 18, d2: (l - 5) ** 2 + (w - 18) ** 2 }))
    .sort((a, b) => a.d2 - b.d2).map(o => Object.assign(o, { d: Math.sqrt(o.d2) }));
  const ks = svg(viz('knn'), 660, 392, { label: 'Training samples in the lightness-width plane, the query point and its nearest neighbours', minWidth: 520 });
  const ka = axes(ks, { x: 50, y: 24, w: 360, h: 320, xd: [1, 10], yd: [14, 22], xt: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], yt: [14, 15, 16, 17, 18, 19, 20, 21, 22], xl: 'lightness', yl: 'width' });
  const qx = ka.x(5), qy = ka.y(18);
  const linesG = s('g', {}, ks);
  const ring = s('circle', { cx: qx, cy: qy, r: 0, class: 's-pri dash', style: 'stroke-width: 1.5' }, ks);
  RK.forEach(o => {
    const x = ka.x(o.l), y = ka.y(o.w), sal = o.cls === 'salmon';
    if (sal) s('circle', { cx: x, cy: y, r: 6, class: 'f-sec' }, ks);
    else s('rect', { x: x - 5.5, y: y - 5.5, width: 11, height: 11, class: 'f-pri' }, ks);
    s('text', { x: x + 9, y: y - 9, class: 't-bold halo ' + (sal ? 't-sec' : 't-pri') }, ks, o.id);
  });
  const qd = s('path', { d: `M${qx} ${qy - 9} L${qx + 9} ${qy} L${qx} ${qy + 9} L${qx - 9} ${qy} Z`, class: 'f-fg' }, ks);
  const side = s('g', {}, ks);
  const kt = table(viz('knn-table'), ['Sample', 'Class', 'Δl', 'Δw', 'd²', 'd', 'Rank'].map((t, i) => ({ text: t, cls: i < 2 ? 'l' : '' })),
    RK.map((o, i) => [{ text: `${o.id} (${o.l},${o.w})`, cls: 'l' }, { text: o.cls, cls: 'l' }, fmt(o.dl).replace('-', '−'), fmt(o.dw).replace('-', '−'), String(o.d2), o.d.toFixed(3), String(i + 1)]));
  const kn = role('knn-note');
  const NOTES = [
    'All seven distances from x = [5, 18]. B1 is 1 away, then S2 at 2 and S1 at 2.236.',
    'k = 1: the nearest sample is B1 (sea bass) at d = 1, so x is classified as sea bass.',
    'k = 3: the three nearest are B1, S2 and S1. That is 2 salmon votes to 1 sea bass, so x is classified as salmon.',
  ];
  steps(viz('knn-steps'), ['Distances', 'k = 1', 'k = 3'], st => {
    const k = [7, 1, 3][st];
    linesG.textContent = '';
    side.textContent = '';
    RK.slice(0, k).forEach(o => {
      const x = ka.x(o.l), y = ka.y(o.w);
      s('line', { x1: qx, y1: qy, x2: x, y2: y, class: 's-muted', style: 'stroke-width: 1' }, linesG);
      const len = Math.hypot(x - qx, y - qy), nx = -(y - qy) / len, ny = (x - qx) / len, sg = ny > 0 || (ny === 0 && nx > 0) ? -1 : 1;
      s('text', { x: (qx + x) / 2 + sg * nx * 10, y: (qy + y) / 2 + sg * ny * 10, dy: '0.35em', 'text-anchor': 'middle', class: 't-sm t-fg halo' }, linesG, o.d.toFixed(2));
    });
    const sal = RK.slice(0, k).filter(o => o.cls === 'salmon').length, win = st ? (sal * 2 > k ? 'salmon' : 'sea bass') : null;
    ring.setAttribute('r', st ? RK[k - 1].d * 40 : 0);
    ring.setAttribute('class', (win === 'salmon' ? 's-sec' : 's-pri') + ' dash');
    qd.setAttribute('class', !win ? 'f-fg' : win === 'salmon' ? 'f-sec' : 'f-pri');
    s('text', { x: 440, y: 40, class: 't-fg t-bold' }, side, 'query x = [5, 18]');
    RK.forEach((o, i) => s('text', { x: 440, y: 66 + i * 20, class: i < k && st ? 't-bold ' + (o.cls === 'salmon' ? 't-sec' : 't-pri') : 't-muted' }, side, `${i + 1}. ${o.id} ${o.cls}, d = ${o.d.toFixed(3)}`));
    if (st) {
      s('text', { x: 440, y: 226, class: 't-fg' }, side, `votes: salmon ${sal}, sea bass ${k - sal}`);
      s('text', { x: 440, y: 248, class: 't-lg t-bold ' + (win === 'salmon' ? 't-sec' : 't-pri') }, side, '→ ' + win);
    }
    kt.rows.forEach((r, i) => r.classList.toggle('on', st > 0 && i < k));
    kn.textContent = NOTES[st];
  });
});

QV.register('s5-w5', function (q) {
  const { s, svg, axes, line, arrow, steps, table, fmt } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const role = n => q.querySelector(`[data-role="${n}"]`);
  const m = v => (v < 0 ? '−' + Math.abs(v) : String(v));
  const SY = [['A', 1 / 2, '1/2', '0'], ['B', 1 / 4, '1/4', '10'], ['C', 1 / 8, '1/8', '110'], ['D', 1 / 16, '1/16', '1110'], ['E', 1 / 16, '1/16', '1111']];
  table(viz('given'), ['Symbol'].concat(SY.map(r => r[0])).map(t => ({ text: t, cls: 'l' })), [['p'].concat(SY.map(r => r[2])).map(t => ({ text: t, cls: 'l' }))]);
  table(viz('ent-table'), ['Symbol', 'p', 'log₂(1/p)', 'p · log₂(1/p)', 'Huffman code'].map((t, i) => ({ text: t, cls: i ? '' : 'l' })),
    SY.map(([sym, p, ps, code]) => [{ text: sym, cls: 'l' }, ps, fmt(Math.log2(1 / p)), fmt(p * Math.log2(1 / p)), code])
      .concat([[{ text: 'Σ', cls: 'l' }, '1', '', { text: '1.875', cls: 'hl' }, 'avg 1.875']]));

  // Figure 1: entropy as an area
  const es = svg(viz('ent'), 640, 292, { label: 'Each symbol as a block p wide and log2(1/p) bits tall; the total area is the entropy 1.875 bits', minWidth: 500 });
  const ea = axes(es, { x: 56, y: 24, w: 540, h: 210, xd: [0, 1], yd: [0, 4.4], xt: [0, 0.5, 0.75, 0.875, 1], yt: [0, 1, 2, 3, 4], xl: 'probability p (each block is p wide)', yl: 'bits, log₂(1/p)' });
  let acc = 0;
  SY.forEach(([sym, p, ps, code]) => {
    const b = Math.log2(1 / p), x0 = ea.x(acc), x1 = ea.x(acc + p), yt = ea.y(b), cx = (x0 + x1) / 2;
    s('rect', { x: x0, y: yt, width: x1 - x0, height: ea.y(0) - yt, class: 'f-pri-soft outline-pri' }, es);
    const area = fmt(p * b);
    const rows = sym === 'A' ? [`A · code 0 · area ${area}`] : sym === 'B' ? ['B · code 10', 'area ' + area] : [sym, code, area];
    rows.forEach((t, i) => s('text', { x: cx, y: (b > 3 ? ea.y(3) : yt) + 16 + i * 15, dy: '0.35em', 'text-anchor': 'middle', class: 't-pri' + (i ? '' : ' t-bold') + (p < 0.1 ? ' t-sm' : '') }, es, t));
    acc += p;
  });
  s('line', { x1: ea.x(0), x2: ea.x(1), y1: ea.y(3), y2: ea.y(3), class: 's-sec dash' }, es);
  s('text', { x: ea.x(0) + 8, y: ea.y(3) - 8, class: 't-sec t-bold' }, es, 'fixed-length code: 3 bits for every symbol');
  s('text', { x: ea.x(0.25), y: ea.y(1.7), 'text-anchor': 'middle', class: 't-pri t-bold' }, es, 'total area = 1.875 bits per symbol');

  // Figure 2: samples and the differences that are sent
  const F = [60, 63, 67, 67, 64, 71];
  const DF = F.map((v, i) => (i ? v - F[i - 1] : v));
  const N6 = [1, 2, 3, 4, 5, 6];
  const ds = svg(viz('diff'), 520, 312, { label: 'The samples f1 to f6 and the differences sent after the first sample', minWidth: 420 });
  const ta = axes(ds, { x: 56, y: 24, w: 440, h: 104, xd: [0.5, 6.5], yd: [58, 74], xt: N6, yt: [60, 64, 68, 72], yl: 'sample f' });
  line(ds, N6.map(i => [ta.x(i), ta.y(F[i - 1])]), 's-pri');
  N6.forEach(i => {
    s('circle', { cx: ta.x(i), cy: ta.y(F[i - 1]), r: 4, class: 'f-pri' }, ds);
    s('text', { x: ta.x(i), y: ta.y(F[i - 1]) - 9, 'text-anchor': 'middle', class: 't-fg t-sm halo' }, ds, F[i - 1]);
  });
  const ba = axes(ds, { x: 56, y: 178, w: 440, h: 90, xd: [0.5, 6.5], yd: [-6, 8], xt: N6, yt: [-4, 0, 4, 8], xl: 'n', yl: 'sent value' });
  s('line', { x1: ba.x(0.5), x2: ba.x(6.5), y1: ba.y(0), y2: ba.y(0), class: 's-fg', style: 'stroke-width: 1; opacity: 0.5' }, ds);
  s('text', { x: ba.x(1), y: ba.y(4), dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, ds, '60 as is');
  N6.slice(1).forEach(i => {
    const d = DF[i - 1], y0 = ba.y(0), y1 = ba.y(d);
    if (d) s('rect', { x: ba.x(i) - 13, y: Math.min(y0, y1), width: 26, height: Math.abs(y1 - y0), class: d > 0 ? 'f-pri' : 'f-sec' }, ds);
    s('text', { x: ba.x(i), y: d < 0 ? y1 + 14 : y1 - 6, 'text-anchor': 'middle', class: 't-bold ' + (d < 0 ? 't-sec' : 't-pri') }, ds, m(d));
  });

  // Figure 3: DPCM step by step
  const REC = [60], PRED = [null], E = [null], EQ = [null];
  for (let i = 1; i < 6; i++) {
    const p = REC[i - 1], e = F[i] - p, eq = 4 * Math.round(e / 4) || 0;
    PRED.push(p); E.push(e); EQ.push(eq); REC.push(p + eq);
  }
  const dp = svg(viz('dpcm'), 640, 292, { label: 'DPCM: true samples, predictions, quantized errors and reconstructed samples', minWidth: 500 });
  const da = axes(dp, { x: 56, y: 24, w: 560, h: 210, xd: [0.5, 6.5], yd: [56, 76], xt: N6, yt: [56, 60, 64, 68, 72, 76], xl: 'n', yl: 'sample value' });
  const errG = s('g', {}, dp);
  N6.forEach(i => { if (F[i - 1] !== REC[i - 1]) s('line', { x1: da.x(i), x2: da.x(i), y1: da.y(F[i - 1]), y2: da.y(REC[i - 1]), class: 's-bad', style: 'stroke-width: 2' }, errG); });
  line(dp, N6.map(i => [da.x(i), da.y(REC[i - 1])]), 's-pri');
  N6.forEach(i => {
    s('circle', { cx: da.x(i), cy: da.y(F[i - 1]), r: 6, class: 's-fg' }, dp);
    s('circle', { cx: da.x(i), cy: da.y(REC[i - 1]), r: 3.5, class: 'f-pri' }, dp);
  });
  const stepG = s('g', {}, dp);
  const SUB = '₀₁₂₃₄₅₆';
  const H = ['n', 'f<sub>n</sub>', 'f̂<sub>n</sub>', 'e<sub>n</sub>', 'ẽ<sub>n</sub>', 'f̃<sub>n</sub>', 'f<sub>n</sub> − f̃<sub>n</sub>'];
  const dt = table(viz('dpcm-table'), H.map(html => ({ html })), N6.map(i => (i === 1
    ? ['1', '60', 'sent as is', '', '', '60', '0']
    : [String(i), String(F[i - 1]), String(PRED[i - 1]), m(E[i - 1]), m(EQ[i - 1]), { text: String(REC[i - 1]), cls: 'hl' }, m(F[i - 1] - REC[i - 1])])));
  const dn = role('dpcm-note');
  steps(viz('dpcm-steps'), ['All', 'n = 2', 'n = 3', 'n = 4', 'n = 5', 'n = 6'], k => {
    stepG.textContent = '';
    errG.classList.toggle('dim', k > 0);
    dt.rows.forEach((r, i) => r.classList.toggle('on', k > 0 && i === k));
    if (!k) {
      dn.textContent = 'The decoder output 60, 64, 68, 68, 64, 72 stays within 2 of the true samples (red bars), and the error does not grow from step to step.';
      return;
    }
    const i = k, n = k + 1, p = PRED[i], x = da.x(n);
    arrow(stepG, da.x(n - 1), da.y(REC[i - 1]), x - 8, da.y(p), { cls: 'a-sec', dash: true });
    s('path', { d: `M${x} ${da.y(p) - 6} L${x + 6} ${da.y(p)} L${x} ${da.y(p) + 6} L${x - 6} ${da.y(p)} Z`, class: 'f-sec' }, stepG);
    s('line', { x1: x - 12, x2: x - 12, y1: da.y(p), y2: da.y(F[i]), class: 's-sec' }, stepG);
    s('line', { x1: x + 12, x2: x + 12, y1: da.y(p), y2: da.y(REC[i]), class: 's-pri' }, stepG);
    s('text', { x: x - 18, y: (da.y(p) + da.y(F[i])) / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-sec t-bold halo' }, stepG, 'e = ' + m(E[i]));
    s('text', { x: x + 18, y: (da.y(p) + da.y(REC[i])) / 2, dy: '0.35em', class: 't-pri t-bold halo' }, stepG, 'ẽ = ' + m(EQ[i]));
    const sign = EQ[i] < 0 ? '−' : '+';
    dn.textContent = `n = ${n}: predict f̂ = f̃${SUB[n - 1]} = ${p}. e = ${F[i]} − ${p} = ${m(E[i])}, quantized to ẽ = ${m(EQ[i])}. f̃${SUB[n]} = ${p} ${sign} ${Math.abs(EQ[i])} = ${REC[i]}, so the error is ${F[i]} − ${REC[i]} = ${m(F[i] - REC[i])}.`;
  });

  // Figure 4: bits per pixel to scale, and a schematic R(D)
  const rs = svg(viz('ratio'), 760, 232, { label: 'Bits per pixel of the raw, PNG and JPEG files, and a schematic rate distortion curve', minWidth: 560 });
  const bx = axes(rs, { x: 70, y: 20, w: 300, h: 150, xd: [0, 8], yd: [0, 3], xt: [0, 2, 4, 6, 8], yt: [], grid: false, xl: 'bits per pixel' });
  [['raw', 8, 45, 'f-seg box', 't-fg', '262,144 B · 8 bit/pixel', ''],
    ['PNG', 4, 95, 'f-pri', 't-on', '131,072 B', 'CR = 2.0 · lossless'],
    ['JPEG', 0.5, 145, 'f-sec', 't-on', '', '16,384 B · CR = 16.0 · lossy']].forEach(([name, b, y, cls, tc, inside, after]) => {
    s('text', { x: 62, y, dy: '0.35em', 'text-anchor': 'end', class: 't-fg t-bold' }, rs, name);
    s('rect', { x: bx.x(0), y: y - 14, width: bx.x(b) - bx.x(0), height: 28, class: cls }, rs);
    if (inside) s('text', { x: (bx.x(0) + bx.x(b)) / 2, y, dy: '0.35em', 'text-anchor': 'middle', class: tc }, rs, inside);
    if (after) s('text', { x: bx.x(b) + 8, y, dy: '0.35em', class: 't-bold ' + (name === 'PNG' ? 't-pri' : 't-sec') }, rs, after);
  });
  const rd = axes(rs, { x: 480, y: 24, w: 250, h: 146, xd: [0, 1], yd: [0, 1], xt: [], yt: [], grid: false, xl: 'distortion D (schematic)', yl: 'rate R' });
  const Hh = 0.62;
  QV.plot(rs, rd, d => Hh * (1 - d) ** 2, 0, 1, 80, 's-muted');
  s('line', { x1: rd.x(0), x2: rd.x(1), y1: rd.y(Hh), y2: rd.y(Hh), class: 's-fg dash', style: 'stroke-width: 1' }, rs);
  s('text', { x: rd.x(0) - 8, y: rd.y(Hh), dy: '0.35em', 'text-anchor': 'end', class: 't-fg t-bold' }, rs, 'H');
  s('text', { x: rd.x(1), y: rd.y(Hh) - 6, 'text-anchor': 'end', class: 't-muted t-sm' }, rs, 'entropy');
  s('circle', { cx: rd.x(0), cy: rd.y(0.86), r: 5, class: 'f-pri' }, rs);
  s('text', { x: rd.x(0) + 10, y: rd.y(0.86), dy: '0.35em', class: 't-pri t-bold' }, rs, 'PNG: D = 0, R ≥ H');
  const jd = 0.45, jr = Hh * (1 - jd) ** 2;
  s('circle', { cx: rd.x(jd), cy: rd.y(jr), r: 5, class: 'f-sec' }, rs);
  s('text', { x: rd.x(jd) + 10, y: rd.y(jr) - 10, class: 't-sec t-bold' }, rs, 'JPEG: D > 0, R < H');
  s('text', { x: rd.x(0.7), y: rd.y(0.14), class: 't-muted t-sm' }, rs, 'R(D)');
});

QV.register('s5-w6', function (q) {
  const { s, svg, axes, plot, arrow, slider, table, fmt } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const role = n => q.querySelector(`[data-role="${n}"]`);
  const TAU = 2 * Math.PI;

  // Figure 1: x(t) against the same tone with phase 0
  const ws = svg(viz('wave'), 700, 300, { label: 'x(t) = 5 sin(2 pi 250 t + pi/2) over 9 ms, with the period, amplitude and phase shift marked', minWidth: 520 });
  const wa = axes(ws, { x: 56, y: 28, w: 610, h: 220, xd: [0, 9], yd: [-6.5, 6.5], xt: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], yt: [-5, 0, 5], xl: 't (ms)', yl: 'x(t) (V)' });
  s('line', { x1: wa.x(0), x2: wa.x(9), y1: wa.y(0), y2: wa.y(0), class: 's-fg', style: 'stroke-width: 1; opacity: 0.4' }, ws);
  plot(ws, wa, t => 5 * Math.sin(TAU * 0.25 * t), 0, 9, 300, 's-muted dash');
  plot(ws, wa, t => 5 * Math.sin(TAU * 0.25 * t + Math.PI / 2), 0, 9, 300, 's-pri');
  s('circle', { cx: wa.x(0), cy: wa.y(5), r: 4, class: 'f-pri' }, ws);
  const yP = wa.y(5.9);
  [0, 4].forEach(t => s('line', { x1: wa.x(t), x2: wa.x(t), y1: wa.y(5), y2: yP, class: 's-muted', style: 'stroke-width: 1' }, ws));
  arrow(ws, wa.x(2), yP, wa.x(0) + 1, yP, { cls: 'a-pri', head: 7 });
  arrow(ws, wa.x(2), yP, wa.x(4) - 1, yP, { cls: 'a-pri', head: 7 });
  s('text', { x: wa.x(2), y: yP - 6, 'text-anchor': 'middle', class: 't-pri t-bold halo' }, ws, 'T = 4 ms');
  arrow(ws, wa.x(8), wa.y(0), wa.x(8), wa.y(5) + 1, { cls: 'a-pri', head: 7 });
  s('text', { x: wa.x(8), y: wa.y(5.6), 'text-anchor': 'middle', class: 't-pri t-bold halo' }, ws, 'A = 5 V');
  const yN = wa.y(-5.9);
  [6, 7].forEach(t => s('line', { x1: wa.x(t), x2: wa.x(t), y1: wa.y(-5), y2: yN, class: 's-muted', style: 'stroke-width: 1' }, ws));
  arrow(ws, wa.x(7), yN, wa.x(6) + 1, yN, { cls: 'a-sec', head: 7 });
  s('text', { x: wa.x(7) + 6, y: yN, dy: '0.35em', class: 't-sec t-bold halo' }, ws, '1 ms = T/4 = 90°');
  s('text', { x: wa.x(0) + 6, y: yN, dy: '0.35em', class: 't-muted' }, ws, 'dashed: phase 0');

  // Figure 2: folding on the spectrum and in time
  const ss = svg(viz('spec'), 700, 214, { label: 'Spectrum with the 250 Hz and 3000 Hz tones, fs/2, and the alias of 3000 Hz', minWidth: 520 });
  const sa = axes(ss, { x: 56, y: 40, w: 610, h: 120, xd: [0, 8], yd: [0, 6], xt: [0, 1, 2, 3, 4, 5, 6, 7, 8], yt: [0, 2, 5], xl: 'frequency (kHz)', yl: 'amplitude (V)' });
  const shade = s('rect', { y: sa.y(6), height: sa.y(0) - sa.y(6), class: 'f-sec-soft' }, ss);
  ss.insertBefore(shade, ss.firstChild);
  [[0.25, 5, '250 Hz'], [3, 2, '3000 Hz']].forEach(([f, a, t]) => {
    s('line', { x1: sa.x(f), x2: sa.x(f), y1: sa.y(0), y2: sa.y(a), class: 's-pri', style: 'stroke-width: 3' }, ss);
    s('circle', { cx: sa.x(f), cy: sa.y(a), r: 4, class: 'f-pri' }, ss);
    s('text', { x: sa.x(f) + 8, y: sa.y(a) - 6, class: 't-pri t-bold' }, ss, t);
  });
  const sl = s('g', {}, ss);
  const ts = svg(viz('time'), 700, 214, { label: 'The 3000 Hz tone over 2 ms, its samples at the chosen rate, and the reconstructed alias', minWidth: 520 });
  const tA = axes(ts, { x: 56, y: 24, w: 610, h: 140, xd: [0, 2], yd: [-2.6, 2.6], xt: [0, 0.5, 1, 1.5, 2], yt: [-2, 0, 2], xl: 't (ms)', yl: '3000 Hz tone (V)' });
  plot(ts, tA, t => 2 * Math.sin(TAU * 3 * t), 0, 2, 600, 's-pri').setAttribute('style', 'stroke-width: 1.2; opacity: 0.7');
  const tl = s('g', {}, ts);
  const a3 = role('a3000');
  slider(viz('fs-slider'), { label: 'fs', min: 2, max: 8, step: 0.5, value: 4, fmt: v => fmt(v) + ' kHz' }, fs => {
    sl.textContent = '';
    tl.textContent = '';
    const half = fs / 2, k = Math.round(3 / fs), fa = Math.abs(3 - k * fs), alias = fs < 6 && fa > 0;
    shade.setAttribute('x', sa.x(half));
    shade.setAttribute('width', sa.x(8) - sa.x(half));
    s('line', { x1: sa.x(half), x2: sa.x(half), y1: sa.y(0), y2: sa.y(6), class: 's-sec dash', style: 'stroke-width: 1.5' }, sl);
    s('text', { x: sa.x(half) + 6, y: sa.y(6) + 12, class: 't-sec t-bold halo' }, sl, 'fs/2 = ' + fmt(half) + ' kHz');
    if (alias) {
      s('line', { x1: sa.x(fa), x2: sa.x(fa), y1: sa.y(0), y2: sa.y(2), class: 's-bad dash', style: 'stroke-width: 3' }, sl);
      s('circle', { cx: sa.x(fa), cy: sa.y(2), r: 4, class: 'f-bad' }, sl);
      arrow(sl, sa.x(3) - 4, sa.y(3.1), sa.x(fa) + 4, sa.y(3.1), { cls: 'a-bad' });
      s('text', { x: (sa.x(3) + sa.x(fa)) / 2, y: sa.y(3.1) - 8, 'text-anchor': 'middle', class: 't-bad t-bold halo' }, sl, 'appears at ' + fmt(fa * 1000) + ' Hz');
      plot(tl, tA, t => 2 * Math.sin(TAU * (3 - k * fs) * t), 0, 2, 400, 's-bad dash');
    }
    for (let i = 0; i / fs <= 2 + 1e-9; i++) {
      const t = i / fs;
      s('circle', { cx: tA.x(t), cy: tA.y(2 * Math.sin(TAU * 3 * t)), r: 4, class: 'f-fg' }, tl);
    }
    role('a250').textContent = '250 Hz';
    a3.textContent = fs > 6 ? '3000 Hz' : fs === 6 || fa === 0 ? 'lost' : fmt(fa * 1000) + ' Hz';
    a3.className = 'v ' + (fs > 6 ? 'ok' : 'sec');
    let v;
    if (fs > 6) v = `fs = ${fmt(fs)} kHz is above 6 kHz. Both tones are below fs/2 = ${fmt(half)} kHz and come back at their true frequencies.`;
    else if (fs === 6) v = 'fs = 6 kHz is exactly 2 × 3000 Hz. Here every sample lands on a zero crossing and the 3000 Hz tone is lost. The theorem needs fs > 2 fmax.';
    else if (!fa) v = 'fs = 3 kHz equals the tone frequency, so every sample hits the same point of the wave (0 here). The tone turns into a constant.';
    else v = `fs = ${fmt(fs)} kHz is below 6 kHz. The 3000 Hz tone is above fs/2 = ${fmt(half)} kHz and folds to |3000 − ${k} × ${fmt(fs * 1000)}| = ${fmt(fa * 1000)} Hz. The 250 Hz tone is below fs/2 and stays.`;
    role('fs-verdict').textContent = v;
  });

  // Figure 3: captured band at 48 and 24 kHz
  const bs = svg(viz('band'), 700, 150, { label: 'Captured frequency band at 48 kHz and at 24 kHz sampling', minWidth: 520 });
  const xa = axes(bs, { x: 110, y: 14, w: 560, h: 96, xd: [0, 24], yd: [0, 2], xt: [0, 4, 8, 12, 16, 20, 24], yt: [], grid: false, xl: 'frequency (kHz)' });
  [[30, 'fs = 48 kHz', 24], [80, 'fs = 24 kHz', 12]].forEach(([y, t, top]) => {
    s('text', { x: 100, y, dy: '0.35em', 'text-anchor': 'end', class: 't-fg t-bold' }, bs, t);
    s('rect', { x: xa.x(0), y: y - 14, width: xa.x(top) - xa.x(0), height: 28, class: 'f-pri' }, bs);
    s('text', { x: (xa.x(0) + xa.x(top)) / 2, y, dy: '0.35em', 'text-anchor': 'middle', class: 't-on' }, bs, `captured: below ${top} kHz`);
  });
  s('rect', { x: xa.x(12), y: 66, width: xa.x(24) - xa.x(12), height: 28, class: 'f-sec-soft' }, bs);
  s('text', { x: xa.x(18), y: 80, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, bs, 'aliases unless low-pass filtered');
  const H = t => ({ html: t });
  table(viz('band-table'), [H(''), H('f<sub>s</sub> = 48 kHz'), H('f<sub>s</sub> = 24 kHz')], [
    [{ text: 'highest frequency', cls: 'l' }, 'below 24 kHz', { text: 'below 12 kHz', cls: 'hl' }],
    [{ text: 'bits per sample × channels', cls: 'l' }, '16 × 2', '16 × 2'],
    [{ text: 'bit rate', cls: 'l' }, '1,536,000 bit/s', { text: '768,000 bit/s', cls: 'hl' }],
    [{ text: '5 s file', cls: 'l' }, '960,000 bytes', { text: '480,000 bytes', cls: 'hl' }],
  ]);
});

QV.register('s5-w7', function (q) {
  const { s, svg, axes, line, grid, gray, arrow, steps, table } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const role = n => q.querySelector(`[data-role="${n}"]`);
  const m = v => (v < 0 ? '−' + Math.abs(v) : String(v));
  const F = [[120, 210], [40, 230]], G = [[70, 80], [60, 30]];
  const clamp = v => Math.max(0, Math.min(255, v));
  const g8 = v => gray(v);

  const gv = svg(viz('given'), 320, 150, { label: 'Images F and G, 2 by 2, drawn in their gray levels', minWidth: 320, maxWidth: 320 });
  grid(gv, { x: 30, y: 40, cell: 44, data: F, fill: g8, title: 'F' });
  grid(gv, { x: 190, y: 40, cell: 44, data: G, fill: g8, title: 'G' });

  // Figure 1: raw results and clamped results
  const OPS = [['F + G', (a, r, c) => a + G[r][c]], ['F − G', (a, r, c) => a - G[r][c]], ['1.2 × F', a => Math.round(1.2 * a)]];
  const os = svg(viz('ops'), 640, 372, { label: 'F + G, F − G and 1.2 F: raw results with out-of-range cells marked, and the clamped images', minWidth: 500 });
  s('text', { x: 214, y: 22, 'text-anchor': 'middle', class: 't-fg t-bold' }, os, 'raw result');
  s('text', { x: 404, y: 22, 'text-anchor': 'middle', class: 't-fg t-bold' }, os, 'clamped to 0..255');
  const rows = OPS.map(([name, f], i) => {
    const y0 = 40 + i * 112;
    const RAW = F.map((row, r) => row.map((v, c) => f(v, r, c)));
    const CL = RAW.map(row => row.map(clamp));
    s('text', { x: 4, y: y0 + 44, dy: '0.35em', class: 't-fg t-bold t-lg' }, os, name);
    grid(os, { x: 170, y: y0, cell: 44, data: RAW, text: m, fill: v => (v < 0 || v > 255 ? { cls: 'f-bad-soft', text: 't-bad t-bold' } : { cls: 'f-seg', text: 't-fg' }) });
    arrow(os, 272, y0 + 44, 350, y0 + 44, { cls: 'a-muted', label: 'clamp' });
    grid(os, { x: 360, y: y0, cell: 44, data: CL, fill: g8 });
    const fixes = RAW.flat().filter(v => v < 0 || v > 255).map(v => `${m(v)} → ${clamp(v)}`);
    (fixes.length ? fixes : ['all in range']).forEach((t, j) => s('text', { x: 476, y: y0 + 34 + j * 18, dy: '0.35em', class: fixes.length ? 't-bad t-bold' : 't-muted' }, os, t));
    return [name, RAW, CL];
  });
  const flat = M => M.map(r => r.join(' ')).join(' / ');
  table(viz('ops-table'), ['Operation', 'Raw result', 'Clamped'].map(t => ({ text: t, cls: 'l' })),
    rows.map(([name, RAW, CL]) => [{ text: name, cls: 'l' }, { text: flat(RAW.map(r => r.map(m))), cls: 'l' }, { text: flat(CL), cls: 'l hl' }]));

  // Figure 2: brightness vs contrast on a number line
  const bc = svg(viz('bc'), 680, 260, { label: 'Pixels 120 and 210 of F on the gray scale, after adding 40 and after multiplying by 1.2', minWidth: 520 });
  const X = QV.scale(0, 255, 110, 650);
  [['F', 120, 210, 46, 'Δ = 90', 's-muted', 't-muted'],
    ['F + 40', 160, 250, 114, 'Δ = 90: brighter, same contrast', 's-muted', 't-fg'],
    ['1.2 × F', 144, 252, 182, 'Δ = 108: more contrast', 's-pri', 't-pri']].forEach(([name, a, b, y, lab, sc, tc]) => {
    s('text', { x: 100, y, dy: '0.35em', 'text-anchor': 'end', class: 't-fg t-bold' }, bc, name);
    s('line', { x1: X(0), x2: X(255), y1: y, y2: y, class: 'l-axis' }, bc);
    s('line', { x1: X(a), x2: X(b), y1: y + 16, y2: y + 16, class: sc, style: 'stroke-width: 2' }, bc);
    [a, b].forEach(v => {
      s('line', { x1: X(v), x2: X(v), y1: y + 11, y2: y + 21, class: sc, style: 'stroke-width: 2' }, bc);
      const g = gray(v);
      s('circle', { cx: X(v), cy: y, r: 8, class: 'box', style: g.style }, bc);
      s('text', { x: X(v), y: y - 14, 'text-anchor': 'middle', class: 't-fg t-bold' }, bc, v);
    });
    s('text', { x: (X(a) + X(b)) / 2, y: y + 32, dy: '0.35em', 'text-anchor': 'middle', class: 't-bold ' + tc }, bc, lab);
  });
  [0, 50, 100, 150, 200, 255].forEach(v => {
    s('line', { x1: X(v), x2: X(v), y1: 230, y2: 235, class: 'l-axis' }, bc);
    s('text', { x: X(v), y: 250, 'text-anchor': 'middle' }, bc, v);
  });
  s('line', { x1: X(0), x2: X(255), y1: 230, y2: 230, class: 'l-axis' }, bc);

  // Figure 3: bit grid for AND, OR, XOR, NOT
  const p = 172, qq = 105;
  const BR = [['p = 172', p], ['q = 105', qq], ['p AND q', p & qq], ['p OR q', p | qq], ['p XOR q', p ^ qq], ['NOT p', 255 - p]];
  const bits = v => [7, 6, 5, 4, 3, 2, 1, 0].map(b => (v >> b) & 1);
  const bsv = svg(viz('bits'), 560, 290, { label: 'Bits of p and q and of p AND q, p OR q, p XOR q and NOT p', minWidth: 480 });
  const BX = 110, BC = 32, by = i => 40 + i * 38 + (i >= 2 ? 12 : 0);
  ['128', '64', '32', '16', '8', '4', '2', '1'].forEach((t, c) => s('text', { x: BX + c * BC + BC / 2, y: 30, 'text-anchor': 'middle', class: 't-sm' }, bsv, t));
  s('line', { x1: BX - 100, x2: BX + 8 * BC + 70, y1: by(2) - 13, y2: by(2) - 13, class: 's-line' }, bsv);
  const groups = BR.map(([name, v], i) => {
    const g = s('g', { class: 'fade' }, bsv);
    grid(g, { x: BX, y: by(i), cell: BC, data: [bits(v)], fill: b => (b ? { cls: 'f-pri', text: 't-on' } : { cls: 'f-seg', text: 't-muted' }) });
    s('text', { x: BX - 10, y: by(i) + BC / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-fg t-bold' }, g, name);
    s('text', { x: BX + 8 * BC + 12, y: by(i) + BC / 2, dy: '0.35em', class: i < 2 ? 't-fg' : 't-ok t-bold' }, g, '= ' + v);
    return g;
  });
  const INV = [null, [0, 1, 2], [0, 1, 3], [0, 1, 4], [0, 5]];
  const NOTE = [
    'Read each column on its own. p AND q = 40, p OR q = 237, p XOR q = 197 and NOT p = 83.',
    'AND: 1 only where both p and q have a 1. That happens in the 32 and 8 columns, so p AND q = 32 + 8 = 40.',
    'OR: 1 where p or q has a 1. Only the 16 and 2 columns are 0 in both, so p OR q = 255 − 16 − 2 = 237.',
    'XOR: equal bits give 0, different bits give 1. The columns 128, 64, 4 and 1 differ, so p XOR q = 128 + 64 + 4 + 1 = 197.',
    'NOT flips every bit of p: 1010 1100 becomes 0101 0011 = 64 + 16 + 2 + 1 = 83, which is 255 − 172.',
  ];
  const bn = role('bits-note');
  steps(viz('bits-steps'), ['All', 'AND', 'OR', 'XOR', 'NOT p'], k => {
    groups.forEach((g, i) => g.classList.toggle('dim', k > 0 && INV[k].indexOf(i) < 0));
    bn.textContent = NOTE[k];
  });
  const b8 = v => { const t = v.toString(2).padStart(8, '0'); return t.slice(0, 4) + ' ' + t.slice(4); };
  table(viz('bits-table'), ['Operation', 'Binary', 'Decimal'].map(t => ({ text: t, cls: 'l' })),
    BR.slice(2).map(([name, v]) => [{ text: name, cls: 'l' }, { text: b8(v), cls: 'l' }, { text: name === 'NOT p' ? '83 (= 255 − 172)' : String(v), cls: 'l hl' }]));

  // Figure 4: the negative
  const ns = svg(viz('neg'), 600, 210, { label: 'F and its negative 255 minus F, and the line s = 255 minus r', minWidth: 480 });
  grid(ns, { x: 30, y: 60, cell: 44, data: F, fill: g8, title: 'F' });
  arrow(ns, 130, 104, 196, 104, { cls: 'a-muted', label: '255 − r' });
  grid(ns, { x: 206, y: 60, cell: 44, data: F.map(r => r.map(v => 255 - v)), fill: g8, title: '255 − F' });
  const na = axes(ns, { x: 380, y: 24, w: 180, h: 140, xd: [0, 255], yd: [0, 255], xt: [0, 255], yt: [0, 255], xl: 'input r', yl: 'output s' });
  line(ns, [[na.x(0), na.y(255)], [na.x(255), na.y(0)]], 's-pri');
  F.flat().forEach(v => s('circle', { cx: na.x(v), cy: na.y(255 - v), r: 4, class: 'f-pri' }, ns));
});

QV.register('s5-w8', function (q) {
  const { s, svg, axes, line, steps, scale } = QV;
  const viz = n => q.querySelector(`[data-viz="${n}"]`);
  const role = n => q.querySelector(`[data-role="${n}"]`);

  // Figure 1: hue circle and one value-chroma slice
  const cs = svg(viz('solid'), 760, 300, { label: 'Munsell hue circle with chroma growing outward, and a value by chroma slice for hue R', minWidth: 560 });
  const HUES = [['R', 0], ['YR', 30], ['Y', 55], ['GY', 85], ['G', 130], ['BG', 175], ['B', 205], ['PB', 235], ['P', 275], ['RP', 325]];
  const CX = 170, CY = 160, RING = [36, 60, 84, 108];
  const pt = (r, a) => [CX + r * Math.sin(a * Math.PI / 180), CY - r * Math.cos(a * Math.PI / 180)];
  const sector = (r0, r1, a0, a1) => {
    const [x0, y0] = pt(r1, a0), [x1, y1] = pt(r1, a1), [x2, y2] = pt(r0, a1), [x3, y3] = pt(r0, a0);
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r1} ${r1} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} A${r0} ${r0} 0 0 0 ${x3.toFixed(1)} ${y3.toFixed(1)} Z`;
  };
  s('text', { x: CX, y: 14, 'text-anchor': 'middle', class: 't-fg t-bold' }, cs, 'hue circle, seen from the top');
  HUES.forEach(([name, h], i) => {
    const a = i * 36;
    [30, 65, 100].forEach((sat, j) => s('path', { d: sector(RING[j], RING[j + 1], a - 18, a + 18), class: 'sep', style: `fill: hsl(${h}, ${sat}%, 50%)` }, cs)); // data-color
    const [lx, ly] = pt(124, a);
    s('text', { x: lx, y: ly, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, cs, name);
  });
  s('circle', { cx: CX, cy: CY, r: RING[0], class: 'sep', style: 'fill: hsl(0, 0%, 55%)' }, cs); // data-color
  s('text', { x: CX, y: CY, dy: '0.35em', 'text-anchor': 'middle', class: 't-ink t-bold' }, cs, 'gray');
  s('line', { x1: CX, y1: CY - RING[0], x2: CX, y2: CY - RING[3], class: 's-fg', style: 'stroke-width: 1.5' }, cs);
  s('text', { x: CX + 6, y: CY - 70, class: 't-fg t-bold halo t-sm' }, cs, 'chroma');
  const SX = 440, SW = 24, SH = 21, SY0 = 34;
  s('text', { x: SX - 40, y: 14, class: 't-fg t-bold' }, cs, 'one hue (R): value up, chroma out');
  for (let v = 0; v <= 10; v++) {
    const y = SY0 + (10 - v) * SH;
    for (let c = 0; c <= 20; c += 2) {
      if (c > 20 * (1 - Math.abs(v - 5) / 5) + 1e-9) continue;
      s('rect', { x: SX + (c / 2) * SW, y, width: SW, height: SH, class: 'box', style: `fill: hsl(0, ${c * 5}%, ${v * 10}%)` }, cs); // data-color
    }
    if (v % 5 === 0) s('text', { x: SX - 8, y: y + SH / 2, dy: '0.35em', 'text-anchor': 'end' }, cs, v);
  }
  s('text', { x: SX - 30, y: SY0 + 5 * SH + SH / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-fg' }, cs, 'value');
  [0, 10, 20].forEach(c => s('text', { x: SX + (c / 2) * SW + SW / 2, y: SY0 + 11 * SH + 16, 'text-anchor': 'middle' }, cs, c));
  s('text', { x: SX + 11 * SW + 8, y: SY0 + 11 * SH + 16, class: 't-fg' }, cs, 'chroma');

  // Shared chromaticity helpers
  const LOCUS = [[380, 0.1741, 0.0050], [400, 0.1733, 0.0048], [420, 0.1714, 0.0051], [430, 0.1689, 0.0069], [440, 0.1644, 0.0109], [450, 0.1566, 0.0177], [460, 0.1440, 0.0297], [470, 0.1241, 0.0578], [475, 0.1096, 0.0868], [480, 0.0913, 0.1327], [485, 0.0687, 0.2007], [490, 0.0454, 0.2950], [495, 0.0235, 0.4127], [500, 0.0082, 0.5384], [505, 0.0039, 0.6548], [510, 0.0139, 0.7502], [515, 0.0389, 0.8120], [520, 0.0743, 0.8338], [525, 0.1142, 0.8262], [530, 0.1547, 0.8059], [535, 0.1929, 0.7816], [540, 0.2296, 0.7543], [545, 0.2658, 0.7243], [550, 0.3016, 0.6923], [555, 0.3373, 0.6589], [560, 0.3731, 0.6245], [565, 0.4087, 0.5896], [570, 0.4441, 0.5547], [575, 0.4788, 0.5202], [580, 0.5125, 0.4866], [585, 0.5448, 0.4544], [590, 0.5752, 0.4242], [595, 0.6029, 0.3965], [600, 0.6270, 0.3725], [610, 0.6658, 0.3340], [620, 0.6915, 0.3083], [630, 0.7079, 0.2920], [640, 0.7190, 0.2809], [650, 0.7260, 0.2740], [660, 0.7300, 0.2700], [680, 0.7334, 0.2666], [700, 0.7347, 0.2653]];
  const atNm = nm => {
    for (let i = 1; i < LOCUS.length; i++) {
      const [a, ax, ay] = LOCUS[i - 1], [b, bx, by] = LOCUS[i];
      if (nm <= b) { const t = (nm - a) / (b - a); return [ax + t * (bx - ax), ay + t * (by - ay)]; }
    }
    return LOCUS[LOCUS.length - 1].slice(1);
  };
  const inside = (x, y) => {
    let c = false;
    for (let i = 0, j = LOCUS.length - 1; i < LOCUS.length; j = i++) {
      const [, xi, yi] = LOCUS[i], [, xj, yj] = LOCUS[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const enc = v => Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));
  const xyColor = (x, y) => {
    const X = x / y, Z = (1 - x - y) / y;
    let r = 3.2406 * X - 1.5372 - 0.4986 * Z, g = -0.9689 * X + 1.8758 + 0.0415 * Z, b = 0.0557 * X - 0.2040 + 1.0570 * Z;
    const lo = Math.min(r, g, b);
    if (lo < 0) { r -= lo; g -= lo; b -= lo; }
    const hi = Math.max(r, g, b);
    return `rgb(${enc(r / hi)}, ${enc(g / hi)}, ${enc(b / hi)})`; // data-color
  };
  const diagram = (g, ax, step, labels) => {
    for (let x = 0; x < 0.75; x += step) {
      for (let y = 0; y < 0.85; y += step) {
        if (!inside(x + step / 2, y + step / 2)) continue;
        s('rect', { x: ax.x(x).toFixed(2), y: ax.y(y + step).toFixed(2), width: (ax.x(x + step) - ax.x(x) + 0.6).toFixed(2), height: (ax.y(y) - ax.y(y + step) + 0.6).toFixed(2), style: `fill: ${xyColor(x + step / 2, y + step / 2)}; opacity: 0.85` }, g); // data-color
      }
    }
    line(g, LOCUS.map(([, x, y]) => [ax.x(x), ax.y(y)]).concat([[ax.x(LOCUS[0][1]), ax.y(LOCUS[0][2])]]), 's-fg').setAttribute('style', 'stroke-width: 1');
    labels.forEach(nm => {
      const [x, y] = atNm(nm), dx = x - 0.33, dy = y - 0.33, d = Math.hypot(dx, dy);
      s('text', { x: ax.x(x) + 12 * dx / d, y: ax.y(y) - 12 * dy / d, dy: '0.35em', 'text-anchor': dx / d < -0.4 ? 'end' : dx / d > 0.4 ? 'start' : 'middle', class: 't-sm t-fg' }, g, nm);
    });
  };
  const full = (g, x0) => axes(g, { x: x0, y: 20, w: 264, h: 297, xd: [0, 0.8], yd: [0, 0.9], xt: [0, 0.2, 0.4, 0.6, 0.8], yt: [0, 0.2, 0.4, 0.6, 0.8], xf: v => v.toFixed(1), yf: v => v.toFixed(1), xl: 'x', yl: 'y' });
  const NMS = [480, 520, 560, 580, 600, 700];

  // Figure 2: illuminants near the blackbody locus
  const il = svg(viz('illum'), 740, 372, { label: 'CIE xy chromaticity diagram with a zoom on the white region showing illuminants A, B, C, D65 and E on the blackbody locus', minWidth: 560 });
  const fa = full(il, 44);
  diagram(il, fa, 0.0125, NMS);
  const Z0 = [0.24, 0.48, 0.22, 0.44];
  s('rect', { x: fa.x(Z0[0]), y: fa.y(Z0[3]), width: fa.x(Z0[1]) - fa.x(Z0[0]), height: fa.y(Z0[2]) - fa.y(Z0[3]), class: 'f-none s-fg dash', style: 'stroke-width: 1.2' }, il);
  const za = axes(il, { x: 380, y: 20, w: 336, h: 308, xd: [Z0[0], Z0[1]], yd: [Z0[2], Z0[3]], xt: [0.25, 0.3, 0.35, 0.4, 0.45], yt: [0.25, 0.3, 0.35, 0.4], xf: v => v.toFixed(2), yf: v => v.toFixed(2), xl: 'x (enlarged)', yl: 'y' });
  const planck = T => {
    const x = T <= 4000
      ? -0.2661239e9 / T ** 3 - 0.2343589e6 / T ** 2 + 0.8776956e3 / T + 0.179910
      : -3.0258469e9 / T ** 3 + 2.1070379e6 / T ** 2 + 0.2226347e3 / T + 0.240390;
    const y = T <= 2222 ? -1.1063814 * x ** 3 - 1.34811020 * x ** 2 + 2.18555832 * x - 0.20219683
      : T <= 4000 ? -0.9549476 * x ** 3 - 1.37418593 * x ** 2 + 2.09137015 * x - 0.16748867
        : 3.0817580 * x ** 3 - 5.87338670 * x ** 2 + 3.75112997 * x - 0.37001483;
    return [x, y];
  };
  const inZ = ([x, y]) => x >= Z0[0] && x <= Z0[1] && y >= Z0[2] && y <= Z0[3];
  const bb = [];
  for (let T = 2000; T <= 25000; T *= 1.01) { const p = planck(T); if (inZ(p)) bb.push([za.x(p[0]), za.y(p[1])]); }
  line(il, bb, 's-ter');
  s('text', { x: za.x(0.40), y: za.y(0.415), 'text-anchor': 'middle', class: 't-ter t-bold' }, il, 'blackbody locus');
  [[4000, '4000 K'], [10000, '10000 K'], [20000, '20000 K']].forEach(([T, t]) => {
    const [x, y] = planck(T);
    s('circle', { cx: za.x(x), cy: za.y(y), r: 2.5, class: 'f-ter' }, il);
    s('text', { x: za.x(x) + 9, y: za.y(y) + 12, class: 't-ter t-sm' }, il, t);
  });
  [['A', 0.4476, 0.4074, 0, 18, 'middle'], ['B', 0.3484, 0.3516, -8, -8, 'end'], ['C', 0.3101, 0.3162, 8, 14, 'start'], ['D65', 0.3127, 0.3290, -8, -7, 'end'], ['E', 1 / 3, 1 / 3, 9, 4, 'start']].forEach(([t, x, y, dx, dy, an]) => {
    s('circle', { cx: za.x(x), cy: za.y(y), r: 4.5, class: 'f-fg' }, il);
    s('text', { x: za.x(x) + dx, y: za.y(y) + dy, 'text-anchor': an, class: 't-fg t-bold t-lg' }, il, t);
  });

  // Figure 3: X, Y, Z as shares of the sum
  const sh = svg(viz('share'), 640, 128, { label: 'X = 95, Y = 94 and Z = 61 as shares of 250: x = 0.380, y = 0.376, z = 0.244', minWidth: 480 });
  const k = 520 / 250, S0 = 60;
  let acc = 0;
  s('text', { x: S0 + 260, y: 18, 'text-anchor': 'middle', class: 't-fg t-bold' }, sh, 'X + Y + Z = 250');
  [['X', 95, 'f-pri', 'x'], ['Y', 94, 'f-ter', 'y'], ['Z', 61, 'f-sec', 'z']].forEach(([n, v, cls, lc]) => {
    const x = S0 + acc * k, w = v * k;
    s('rect', { x, y: 30, width: w, height: 46, class: cls + ' sep' }, sh);
    s('text', { x: x + w / 2, y: 45, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, sh, `${n} = ${v}`);
    s('text', { x: x + w / 2, y: 63, dy: '0.35em', 'text-anchor': 'middle', class: 't-on' }, sh, `${lc} = ${v}/250 = ${(v / 250).toFixed(3)}`);
    acc += v;
  });
  [0, 95, 189, 250].forEach(v => {
    s('line', { x1: S0 + v * k, x2: S0 + v * k, y1: 78, y2: 84, class: 'l-axis' }, sh);
    s('text', { x: S0 + v * k, y: 98, 'text-anchor': 'middle' }, sh, v);
  });
  s('text', { x: S0 + 260, y: 120, 'text-anchor': 'middle', class: 't-fg' }, sh, 'x + y + z = 0.380 + 0.376 + 0.244 = 1');

  // Figure 4: dominant wavelength and purity
  const W = [0.31, 0.32], SC = [0.38, 0.376], DD = [0.51, 0.48];
  const pu = svg(viz('pur'), 760, 372, { label: 'Chromaticity diagram with white W, color S and locus point D, and an enlarged view of the ray from W through S to D', minWidth: 560 });
  const pa = full(pu, 44);
  diagram(pu, pa, 0.01, NMS);
  const Z1 = [0.27, 0.59, 0.28, 0.56];
  s('rect', { x: pa.x(Z1[0]), y: pa.y(Z1[3]), width: pa.x(Z1[1]) - pa.x(Z1[0]), height: pa.y(Z1[2]) - pa.y(Z1[3]), class: 'f-none s-fg dash', style: 'stroke-width: 1.2' }, pu);
  const zb = axes(pu, { x: 380, y: 20, w: 352, h: 308, xd: [Z1[0], Z1[1]], yd: [Z1[2], Z1[3]], xt: [0.3, 0.35, 0.4, 0.45, 0.5, 0.55], yt: [0.3, 0.35, 0.4, 0.45, 0.5, 0.55], xf: v => v.toFixed(2), yf: v => v.toFixed(2), xl: 'x (enlarged)', yl: 'y' });
  const lz = [];
  for (let nm = 560; nm <= 600; nm += 0.5) { const [x, y] = atNm(nm); if (x >= Z1[0] && x <= Z1[1] && y >= Z1[2] && y <= Z1[3]) lz.push([zb.x(x), zb.y(y)]); }
  line(pu, lz, 's-fg').setAttribute('style', 'stroke-width: 1.5');
  s('text', { x: zb.x(0.4441) - 12, y: zb.y(0.545), 'text-anchor': 'end', class: 't-muted t-sm' }, pu, 'spectral locus');
  [570, 575, 580, 585, 590].forEach(nm => {
    const [x, y] = atNm(nm), px = zb.x(x), py = zb.y(y);
    s('line', { x1: px, y1: py, x2: px + 6, y2: py - 6, class: 's-fg', style: 'stroke-width: 1' }, pu);
    s('text', { x: px + 9, y: py - 8, class: 't-sm ' + (nm === 580 ? 't-sec t-bold' : 't-fg') }, pu, nm === 580 ? '580 nm' : nm);
  });
  const gRay = s('g', { class: 'fade' }, pu), gS = s('g', { class: 'fade' }, pu), gD = s('g', { class: 'fade' }, pu), gWS = s('g', { class: 'fade' }, pu);
  [pa, zb].forEach(ax => {
    s('line', { x1: ax.x(W[0]), y1: ax.y(W[1]), x2: ax.x(DD[0]), y2: ax.y(DD[1]), class: 's-fg', style: 'stroke-width: 1.5' }, gRay);
    s('line', { x1: ax.x(W[0]), y1: ax.y(W[1]), x2: ax.x(SC[0]), y2: ax.y(SC[1]), class: 's-pri', style: 'stroke-width: 5; opacity: 0.6' }, gWS);
    s('circle', { cx: ax.x(DD[0]), cy: ax.y(DD[1]), r: ax === zb ? 6 : 4, class: 'f-sec sep' }, gD);
    s('circle', { cx: ax.x(SC[0]), cy: ax.y(SC[1]), r: ax === zb ? 6 : 4, class: 'f-pri sep' }, gS);
    s('circle', { cx: ax.x(W[0]), cy: ax.y(W[1]), r: ax === zb ? 6 : 4, class: 'f-fg sep' }, pu);
  });
  s('text', { x: zb.x(W[0]) + 10, y: zb.y(W[1]) + 16, class: 't-fg t-bold' }, pu, 'W (0.31, 0.32)');
  s('text', { x: zb.x(SC[0]) + 12, y: zb.y(SC[1]) + 16, class: 't-pri t-bold halo' }, gS, 'S (0.380, 0.376)');
  s('text', { x: zb.x(DD[0]) - 12, y: zb.y(DD[1]) + 4, 'text-anchor': 'end', class: 't-sec t-bold halo' }, gD, 'D (0.51, 0.48)');
  s('text', { x: (zb.x(W[0]) + zb.x(SC[0])) / 2 + 10, y: (zb.y(W[1]) + zb.y(SC[1])) / 2 + 12, class: 't-pri t-bold halo' }, gWS, '|WS|');

  const pb = svg(viz('pur'), 700, 96, { label: 'Purity scale from W (0) to D (1) with S at 0.35', minWidth: 520 });
  const PX = scale(0, 1, 60, 640);
  s('rect', { x: PX(0), y: 40, width: PX(1) - PX(0), height: 16, class: 'f-sec-soft' }, pb);
  s('rect', { x: PX(0), y: 40, width: PX(0.35) - PX(0), height: 16, class: 'f-pri' }, pb);
  s('text', { x: (PX(0) + PX(0.35)) / 2, y: 30, 'text-anchor': 'middle', class: 't-pri t-bold' }, pb, '|WS| = 0.0896');
  s('text', { x: (PX(0.35) + PX(1)) / 2, y: 30, 'text-anchor': 'middle', class: 't-sec t-bold' }, pb, '|WD| = 0.2561 for the whole bar');
  [[0, 'W: purity 0, white'], [0.35, 'S: 0.35'], [1, 'D: purity 1, 580 nm']].forEach(([v, t], i) => {
    s('line', { x1: PX(v), x2: PX(v), y1: 36, y2: 62, class: 's-fg', style: 'stroke-width: 1.5' }, pb);
    s('text', { x: PX(v), y: 78, 'text-anchor': i === 0 ? 'start' : i === 2 ? 'end' : 'middle', class: 't-fg' }, pb, t);
  });
  const pn = role('pur-note');
  const PN = [
    'Dominant wavelength about 580 nm (yellow), purity 0.35. S is a pale yellow.',
    'Plot S at (x, y) = (0.380, 0.376). The reference white W = (0.31, 0.32) is just below and to the left of it.',
    'Draw the ray from W through S. It meets the spectral locus at D = (0.51, 0.48), about 580 nm, so the dominant wavelength is about 580 nm (yellow).',
    'Purity = |WS| / |WD| = 0.0896 / 0.2561 = 0.35. S lies 35% of the way from white to the pure spectral color.',
  ];
  steps(viz('pur-steps'), ['All', '1 · plot S', '2 · ray to the locus', '3 · purity'], st => {
    gRay.classList.toggle('dim', st === 1);
    gD.classList.toggle('dim', st === 1);
    gWS.classList.toggle('dim', st === 1 || st === 2);
    pn.textContent = PN[st];
  });
});

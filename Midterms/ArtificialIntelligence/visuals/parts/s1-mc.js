QV.register('s1-mc1', function (q) {
  const { s, svg, grid, steps, mat } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const X = [[1, 10, 12, 5], [1, 15, 11, 7], [1, 20, 23, 3], [1, 25, 28, 6], [1, 30, 31, 6]];
  const Y = [50, 59, 68, 77, 86];
  const TH = ['32', '1.8', '0', '0'];
  const SUP = ['⁽¹⁾', '⁽²⁾', '⁽³⁾', '⁽⁴⁾', '⁽⁵⁾'];

  // Figure 1: X · θ = h on the slide dataset
  const W = svg(viz('xmat'), 700, 268, { label: 'The 5 by 4 matrix X with a first column of ones, times theta (4 by 1), equals h (5 by 1), which equals y', minWidth: 560 });
  const C = 34, P = 36, GX = 110, GY = 60;
  const xg = grid(W, { x: GX, y: GY, data: X, cell: C, gap: 2, round: 3, rowLabels: ['1', '2', '3', '4', '5'], colLabels: ['x₀', 'x₁', 'x₂', 'x₃'] });
  const tg = grid(W, { x: 286, y: GY + 18, data: TH.map(v => [v]), cell: C, gap: 2, round: 3, colLabels: ['θ'] });
  const hg = grid(W, { x: 356, y: GY, data: Y.map(v => [v]), cell: C, gap: 2, round: 3, colLabels: ['h'] });
  s('path', { d: `M${GX} 40 L${GX} 34 L${GX + 4 * P - 2} 34 L${GX + 4 * P - 2} 40`, class: 's-fg', style: 'stroke-width: 1.2' }, W);
  s('text', { x: GX + 2 * P - 1, y: 26, 'text-anchor': 'middle', class: 't-fg t-bold' }, W, 'n + 1 = 4 columns');
  s('path', { d: `M90 ${GY} L84 ${GY} L84 ${GY + 5 * P - 2} L90 ${GY + 5 * P - 2}`, class: 's-fg', style: 'stroke-width: 1.2' }, W);
  s('text', { x: 78, y: GY + 86, 'text-anchor': 'end', class: 't-fg t-bold' }, W, 'm = 5');
  s('text', { x: 78, y: GY + 102, 'text-anchor': 'end', class: 't-fg' }, W, 'rows');
  s('text', { x: 269, y: GY + 89, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg t-bold' }, W, '·');
  s('text', { x: 338, y: GY + 89, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg t-bold' }, W, '=');
  [['X: 5 × 4', GX + 2 * P - 1], ['θ: 4 × 1', 303], ['h: 5 × 1', 373]].forEach(([t, x]) => s('text', { x, y: 256, 'text-anchor': 'middle', class: 't-fg t-bold' }, W, t));
  const rowBox = s('rect', { x: GX - 2, width: 4 * P + 2, height: C + 4, rx: 4, class: 'f-none s-fg', style: 'stroke-width: 2' }, W);
  const txt = [96, 120, 142, 164, 196, 212].map((y, i) => s('text', { x: 420, y, class: ['t-fg t-bold t-lg', 't-fg', 't-fg', 't-ok t-bold', 't-muted', 't-muted'][i] }, W));
  txt[4].textContent = 'x₀ = 1 carries the intercept θ₀ = 32';
  txt[5].textContent = 'into every row.';
  role('row-note').textContent = 'X has one row per example (m = 5) and one column per parameter (x₀ plus the n = 3 features). θ has one entry per column of X, so Xθ needs exactly 4 columns.';

  steps(viz('rows'), ['Row 1', 'Row 2', 'Row 3', 'Row 4', 'Row 5'], r => {
    X.forEach((row, i) => row.forEach((v, j) => {
      const cls = j === 0 ? 'f-pri' : i === r ? 'f-pri-soft' : 'f-seg';
      xg.rects[i][j].setAttribute('class', cls + ' sep');
      xg.texts[i][j].setAttribute('class', j === 0 ? 't-on t-bold' : 't-fg');
    }));
    TH.forEach((v, i) => { tg.rects[i][0].setAttribute('class', 'f-seg sep'); tg.texts[i][0].setAttribute('class', 't-fg'); });
    Y.forEach((v, i) => {
      hg.rects[i][0].setAttribute('class', (i === r ? 'f-ok' : 'f-seg') + ' sep');
      hg.texts[i][0].setAttribute('class', i === r ? 't-on t-bold' : 't-fg');
    });
    rowBox.setAttribute('y', GY + r * P - 2);
    const x = X[r];
    txt[0].textContent = `Row ${r + 1}`;
    txt[1].textContent = `h(x${SUP[r]}) = θ₀x₀ + θ₁x₁ + θ₂x₂ + θ₃x₃`;
    txt[2].textContent = `= 32 × 1 + 1.8 × ${x[1]} + 0 × ${x[2]} + 0 × ${x[3]}`;
    txt[3].textContent = `= ${Y[r]} = y${SUP[r]}`;
  });

  // Figure 2: the shape chain of the normal equation
  const CH = svg(viz('chain'), 480, 196, { label: 'Matrix shapes in the normal equation drawn to scale, with the inner sizes of each product marked', minWidth: 400 });
  const layer = s('g', {}, CH);
  const M = (name, r, c, kind) => ({ name, r, c, kind });
  const STATES = [
    { items: [M('Xᵀ', 4, 5, 'xt'), '·', M('X', 5, 4, 'x'), '=', M('XᵀX', 4, 4, 'res')],
      note: 'Xᵀ is 4 × 5 and X is 5 × 4. The inner sizes 5 and 5 match, and the outer sizes give XᵀX = 4 × 4. This square matrix is option d. It is not X.',
      cap: 'XᵀX = 4 × 4, slide 40', data: [[5, 100, 105, 27], [100, 2250, 2375, 545], [105, 2375, 2539, 560], [27, 545, 560, 155]] },
    { items: [M('Xᵀ', 4, 5, 'xt'), '·', M('y', 5, 1), '=', M('Xᵀy', 4, 1, 'res')],
      note: 'Xᵀy is (4 × 5)(5 × 1) = 4 × 1, one entry per parameter. Its first entry, 340, is Σy, because the x₀ row of Xᵀ is all 1s.',
      cap: 'Xᵀy = 4 × 1', data: [[340], [7250], [7635], [1845]] },
    { items: [M('(XᵀX)⁻¹', 4, 4), '·', M('Xᵀy', 4, 1), '=', M('θ', 4, 1, 'res')],
      note: '(XᵀX)⁻¹ is 4 × 4 and Xᵀy is 4 × 1, so θ is 4 × 1: θ₀, θ₁, θ₂, θ₃. Slide 41 gets θ = [32, 1.8, ≈0, ≈0]; the two tiny values are round-off for 0.',
      cap: 'Result = 4 × 1, slide 41', data: [[32], [1.8], [0], [0]] },
    { items: [M('Xᵀ', 3, 5), '·', M('X', 5, 3), '=', M('XᵀX', 3, 3, 'bad'), '→', M('θ', 3, 1, 'bad')],
      note: 'Option a, a 5 × 3 X without the column of 1s: XᵀX is 3 × 3 and θ holds only θ₁, θ₂, θ₃. There is no θ₀, so the model has no intercept, and its best fit misses y by up to 9.4.',
      cap: 'XᵀX from a 5 × 3 X', data: [[2250, 2375, 545], [2375, 2539, 560], [545, 560, 155]] },
  ];
  const CELL = 20, PITCH = 22, OP = 34, MID = 74;
  function drawChain(k) {
    layer.textContent = '';
    const st = STATES[k];
    const wOf = it => (typeof it === 'string' ? OP : it.c * PITCH - 2);
    let x = (480 - st.items.reduce((a, it) => a + wOf(it), 0)) / 2;
    const xs = st.items.map(it => { const x0 = x; x += wOf(it); return x0; });
    st.items.forEach((it, i) => {
      if (typeof it === 'string') {
        s('text', { x: xs[i] + OP / 2, y: MID, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg t-bold' }, layer, it);
        return;
      }
      it.x0 = xs[i];
      const top = MID - (it.r * PITCH - 2) / 2;
      for (let r = 0; r < it.r; r++) {
        for (let c = 0; c < it.c; c++) {
          const x0 = (it.kind === 'x' && c === 0) || (it.kind === 'xt' && r === 0);
          const cls = it.kind === 'res' ? 'f-ok-soft' : it.kind === 'bad' ? 'f-bad-soft' : x0 ? 'f-pri' : 'f-seg';
          s('rect', { x: it.x0 + c * PITCH, y: top + r * PITCH, width: CELL, height: CELL, rx: 2, class: cls + ' box' }, layer);
        }
      }
      const cx = it.x0 + (it.c * PITCH - 2) / 2;
      s('text', { x: cx, y: 158, 'text-anchor': 'middle', class: 't-fg t-bold' }, layer, it.name);
      const prev = st.items[i - 1] === '·' ? st.items[i - 2] : null;
      const next = st.items[i + 1] === '·' ? st.items[i + 2] : null;
      const t = s('text', { x: cx, y: 178, 'text-anchor': 'middle' }, layer);
      s('tspan', { class: prev ? 't-ok t-bold' : 't-fg' }, t, String(it.r));
      s('tspan', { class: 't-fg' }, t, ' × ');
      s('tspan', { class: next ? 't-ok t-bold' : 't-fg' }, t, String(it.c));
    });
    role('chain-note').textContent = st.note;
    const host = viz('chain-mat');
    host.textContent = '';
    mat(host, st.data, { caption: st.cap, hl: () => (k === 3 ? 'hl2' : 'hl') });
  }
  steps(viz('chain-steps'), ['1 · XᵀX', '2 · Xᵀy', '3 · θ = (XᵀX)⁻¹Xᵀy', 'a · if X were 5 × 3'], drawChain);
});

QV.register('s1-mc2', function (q) {
  const { s, svg, axes, plot, slider, table, scale, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const g = z => 1 / (1 + Math.exp(-z));

  // Figure 1: the sigmoid with the y = 1 side and option b's wrong strip
  const W = svg(viz('curve'), 700, 268, { label: 'Sigmoid curve g(z) from z = -6 to 6; h is at least 0.5 exactly where z is at least 0', minWidth: 540 });
  const X = { x: 56, y: 22, w: 620, h: 200 };
  const sx = scale(-6, 6, X.x, X.x + X.w), sy = scale(0, 1, X.y + X.h, X.y);
  s('rect', { x: sx(0), y: X.y, width: sx(6) - sx(0), height: X.h, class: 'f-ok-soft' }, W);
  s('rect', { x: sx(0), y: X.y, width: sx(0.5) - sx(0), height: X.h, class: 'f-bad-soft' }, W);
  const ax = axes(W, { ...X, xd: [-6, 6], yd: [0, 1], xt: [-6, -4, -2, 0, 2, 4, 6], yt: [0, 0.25, 0.5, 0.75, 1], yf: v => v.toFixed(2), xl: 'z = θᵀx', yl: 'h = g(z)' });
  s('line', { x1: sx(-6), x2: sx(6), y1: sy(0.5), y2: sy(0.5), class: 's-fg dash', style: 'stroke-width: 1' }, W);
  s('line', { x1: sx(0), x2: sx(0), y1: sy(0), y2: sy(1), class: 's-fg dash', style: 'stroke-width: 1' }, W);
  s('text', { x: sx(-5.9), y: sy(0.5) - 6, class: 't-fg' }, W, 'h = 0.5');
  s('text', { x: sx(0) - 6, y: sy(1) + 14, 'text-anchor': 'end', class: 't-fg' }, W, 'z = 0');
  s('text', { x: sx(-3), y: sy(0.86), 'text-anchor': 'middle', class: 't-muted t-bold' }, W, 'h < 0.5: predict y = 0');
  s('text', { x: sx(3.4), y: sy(0.12), 'text-anchor': 'middle', class: 't-ok t-bold' }, W, 'h ≥ 0.5: predict y = 1');
  s('text', { x: sx(0.62), y: sy(0.32), class: 't-bad t-sm' }, W, '0 ≤ z < 0.5: rule b says y = 0');
  plot(W, ax, g, -6, 6, 300, 's-pri');
  const mk = s('g', {}, W);

  const rules = [['a', 'z ≥ 0', z => z >= 0], ['b', 'z ≥ 0.5', z => z >= 0.5], ['c', 'hθ(x) ≥ 0', () => true], ['d', 'z ≤ 0', z => z <= 0]];
  const tbl = table(viz('rules'), [{ text: 'Option', cls: 'l' }, { text: 'Rule', cls: 'l' }, 'Says', 'Same as h ≥ 0.5?'],
    rules.map(([k, r]) => [{ text: k, cls: 'l' }, { text: r, cls: 'l' }, '', '']));

  slider(viz('slider'), { label: 'z', min: -6, max: 6, step: 0.1, value: 0.3, fmt: v => v.toFixed(1) }, raw => {
    const z = Math.round(raw * 10) / 10, h = g(z), y1 = h >= 0.5;
    mk.textContent = '';
    s('line', { x1: sx(z), x2: sx(z), y1: sy(0), y2: sy(h), class: 's-pri dash', style: 'stroke-width: 1' }, mk);
    s('circle', { cx: sx(z), cy: sy(h), r: 5.5, class: 'f-pri' }, mk);
    const pos = z < -3 ? [10, -10, 'start'] : z < 3 ? [-10, -10, 'end'] : [-10, 26, 'end'];
    s('text', { x: sx(z) + pos[0], y: sy(h) + pos[1], 'text-anchor': pos[2], class: 't-pri t-bold halo' }, mk, `g(${z.toFixed(1)}) = ${h.toFixed(3)}`);
    role('z').textContent = z.toFixed(1);
    role('h').textContent = h.toFixed(3);
    const yv = role('y');
    yv.textContent = y1 ? 'y = 1' : 'y = 0';
    yv.className = 'v' + (y1 ? ' ok' : '');
    rules.forEach(([, , f], i) => {
      const says = f(z), same = says === y1;
      tbl.rows[i].children[2].textContent = says ? 'y = 1' : 'y = 0';
      const c = tbl.rows[i].children[3];
      c.textContent = same ? 'yes' : 'no';
      c.className = same ? 'hl' : '';
    });
    let v = `h = g(${z.toFixed(1)}) = ${h.toFixed(3)}, which is ${y1 ? '≥' : '<'} 0.5, so the prediction is <b>y = ${y1 ? 1 : 0}</b>. Rule a gives the same answer, as it does for every z.`;
    if (z >= 0 && z < 0.5) v += ' Rule b says y = 0 here and is wrong: h is already above 0.5 at every z in the red strip.';
    else if (z === 0) v += ' At exactly z = 0, h = 0.5 counts as y = 1, so rule d happens to agree here and nowhere else on the y = 1 side.';
    else if (z < 0) v += ' Rule c still says y = 1, because h ≥ 0 is always true.';
    else v += ' Rule d says y = 0 on this whole side.';
    role('verdict').innerHTML = v;
  });

  // Figure 2: decision boundary of slide 13, theta = [-3, 1, 1]
  const D = svg(viz('plane'), 580, 340, { label: 'Feature plane x1, x2 from 0 to 4 with the boundary x1 + x2 = 3; the side with z at least 0 is predicted y = 1', minWidth: 500 });
  const B = { x: 56, y: 24, w: 260, h: 260 };
  const px = scale(0, 4, B.x, B.x + B.w), py = scale(0, 4, B.y + B.h, B.y);
  const poly = [[3, 0], [4, 0], [4, 4], [0, 4], [0, 3]].map(([a, b]) => `${px(a)},${py(b)}`).join(' ');
  s('polygon', { points: poly, class: 'f-ok-soft' }, D);
  axes(D, { ...B, xd: [0, 4], yd: [0, 4], xt: [0, 1, 2, 3, 4], yt: [0, 1, 2, 3, 4], xl: 'x₁', yl: 'x₂' });
  s('line', { x1: px(0), y1: py(3), x2: px(3), y2: py(0), class: 's-fg', style: 'stroke-width: 2' }, D);
  s('text', { x: px(3), y: py(3.6), 'text-anchor': 'middle', class: 't-ok t-bold' }, D, 'z ≥ 0: y = 1');
  s('text', { x: px(0.85), y: py(0.35), 'text-anchor': 'middle', class: 't-muted t-bold' }, D, 'z < 0: y = 0');
  const PTS = [[1, 1], [1.5, 1.5], [2, 2]];
  PTS.forEach(([a, b]) => {
    const z = -3 + a + b;
    s('circle', { cx: px(a), cy: py(b), r: 5.5, class: (z >= 0 ? 'f-ok' : 'f-muted') + ' sep' }, D);
    s('text', { x: px(a) + 9, y: py(b) - 6, class: 't-fg halo' }, D, `(${a}, ${b})`);
  });
  const R = 350;
  s('text', { x: R, y: 40, class: 't-fg t-bold' }, D, 'θ = [−3, 1, 1]');
  s('text', { x: R, y: 60, class: 't-fg' }, D, 'z = −3 + x₁ + x₂');
  s('text', { x: R, y: 80, class: 't-ok t-bold' }, D, 'y = 1 ⇔ x₁ + x₂ ≥ 3');
  const COLS = [[R, 'start', 'point'], [462, 'end', 'z'], [520, 'end', 'h'], [560, 'end', 'y']];
  COLS.forEach(([x, a, t]) => s('text', { x, y: 120, 'text-anchor': a, class: 't-muted' }, D, t));
  s('line', { x1: R, x2: 562, y1: 127, y2: 127, class: 's-line' }, D);
  PTS.forEach(([a, b], i) => {
    const z = -3 + a + b, h = g(z);
    [`(${a}, ${b})`, z === 0 ? '0' : z < 0 ? '−' + Math.abs(z) : String(z), fmt(h, 3), z >= 0 ? '1' : '0'].forEach((t, j) => {
      s('text', { x: COLS[j][0], y: 145 + i * 20, 'text-anchor': COLS[j][1], class: j === 3 ? (z >= 0 ? 't-ok t-bold' : 't-fg t-bold') : 't-fg' }, D, t);
    });
  });
  s('text', { x: R, y: 220, class: 't-muted' }, D, 'On the line, z = 0 and h = 0.5,');
  s('text', { x: R, y: 236, class: 't-muted' }, D, 'which counts as y = 1 (≥).');
});

QV.register('s1-mc3', function (q) {
  const { s, svg, slider, scale, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const SPAM = [0.97, 0.93, 0.88, 0.82, 0.74, 0.66, 0.57, 0.38];
  const REAL = [0.62, 0.47, 0.36, 0.28, 0.22, 0.18, 0.14, 0.11, 0.08, 0.06, 0.04, 0.02];
  const JOB = 0.62;

  // Figure 1: emails on a score line, split by the threshold
  const S = svg(viz('strip'), 720, 178, { label: 'Twenty emails placed by spam score, spam in one row and real emails in another, with the threshold splitting inbox from spam folder', minWidth: 540 });
  const sx = scale(0, 1, 100, 680), RY = { spam: 56, real: 100 }, AX = 136;
  const folder = s('rect', { y: 28, height: 98, class: 'f-seg' }, S);
  s('text', { x: 0, y: RY.spam - 2, class: 't-sec t-bold' }, S, 'spam');
  s('text', { x: 0, y: RY.spam + 12, class: 't-sm' }, S, '8 emails');
  s('text', { x: 0, y: RY.real - 2, class: 't-ter t-bold' }, S, 'real');
  s('text', { x: 0, y: RY.real + 12, class: 't-sm' }, S, '12 emails');
  s('line', { x1: sx(0), x2: sx(1), y1: AX, y2: AX, class: 'l-axis' }, S);
  [0, 0.25, 0.5, 0.75, 1].forEach(v => {
    s('line', { x1: sx(v), x2: sx(v), y1: AX, y2: AX + 5, class: 'l-axis' }, S);
    s('text', { x: sx(v), y: AX + 18, 'text-anchor': 'middle' }, S, String(v));
  });
  s('text', { x: sx(0.5), y: AX + 36, 'text-anchor': 'middle' }, S, 'spam score from the model');
  s('text', { x: sx(JOB), y: RY.real + 26, 'text-anchor': 'middle', class: 't-ter t-sm t-bold' }, S, 'job offer');
  const dyn = s('g', {}, S);
  SPAM.forEach(v => s('circle', { cx: sx(v), cy: RY.spam, r: 6, class: 'f-sec' }, S));
  REAL.forEach(v => s('circle', { cx: sx(v), cy: RY.real, r: 6, class: 'f-ter' }, S));
  const rings = s('g', {}, S);

  // the confusion matrix, slide 14 layout: columns = actual, rows = predicted
  const MX = svg(viz('matrix'), 540, 170, { label: 'Confusion matrix with columns actual spam and actual real, rows predicted spam and predicted real, plus the precision and recall formulas', minWidth: 500 });
  const CX = [130, 240], CY = [40, 96], CW = 106, CHT = 52;
  s('text', { x: CX[0] + CW / 2, y: 30, 'text-anchor': 'middle', class: 't-fg t-bold' }, MX, 'actual spam');
  s('text', { x: CX[1] + CW / 2, y: 30, 'text-anchor': 'middle', class: 't-fg t-bold' }, MX, 'actual real');
  s('text', { x: CX[0] - 10, y: CY[0] + CHT / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-fg t-bold' }, MX, 'predicted spam');
  s('text', { x: CX[0] - 10, y: CY[1] + CHT / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-fg t-bold' }, MX, 'predicted real');
  const cellT = [['TP', 'FP'], ['FN', 'TN']].map((row, r) => row.map((name, c) => {
    s('rect', { x: CX[c], y: CY[r], width: CW, height: CHT, rx: 4, class: (r === c ? 'f-ok-soft' : 'f-bad-soft') + ' sep' }, MX);
    return s('text', { x: CX[c] + CW / 2, y: CY[r] + CHT / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold t-lg' }, MX);
  }));
  s('rect', { x: CX[0] - 4, y: CY[0] - 4, width: 2 * CW + 12, height: CHT + 8, rx: 6, class: 'f-none outline-pri' }, MX);
  s('rect', { x: CX[0] - 2, y: CY[0] - 2, width: CW + 4, height: 2 * CHT + 8, rx: 5, class: 'f-none s-muted dash' }, MX);
  s('text', { x: 370, y: 56, class: 't-pri t-bold' }, MX, 'Precision, row 1');
  const fP = s('text', { x: 370, y: 74, class: 't-pri' }, MX);
  s('text', { x: 370, y: 116, class: 't-muted t-bold' }, MX, 'Recall, column 1');
  const fR = s('text', { x: 370, y: 134, class: 't-fg' }, MX);

  slider(viz('slider'), { label: 'threshold', min: 0.05, max: 0.95, step: 0.05, value: 0.5, fmt: v => v.toFixed(2) }, raw => {
    const t = Math.round(raw * 100) / 100;
    const TP = SPAM.filter(v => v >= t).length, FN = 8 - TP, FP = REAL.filter(v => v >= t).length, TN = 12 - FP;
    const prec = TP / (TP + FP), rec = TP / 8, acc = (TP + TN) / 20;
    folder.setAttribute('x', sx(t));
    folder.setAttribute('width', sx(1) + 20 - sx(t));
    dyn.textContent = '';
    s('line', { x1: sx(t), x2: sx(t), y1: 24, y2: AX, class: 's-fg', style: 'stroke-width: 2' }, dyn);
    s('text', { x: sx(t) - 8, y: 18, 'text-anchor': 'end', class: 't-fg t-bold' }, dyn, '← inbox');
    s('text', { x: sx(t) + 8, y: 18, class: 't-fg t-bold' }, dyn, 'spam folder →');
    rings.textContent = '';
    SPAM.filter(v => v < t).forEach(v => s('circle', { cx: sx(v), cy: RY.spam, r: 10, class: 's-bad', style: 'stroke-width: 2' }, rings));
    REAL.filter(v => v >= t).forEach(v => s('circle', { cx: sx(v), cy: RY.real, r: 10, class: 's-bad', style: 'stroke-width: 2' }, rings));
    cellT[0][0].textContent = `TP = ${TP}`;
    cellT[0][1].textContent = `FP = ${FP}`;
    cellT[1][0].textContent = `FN = ${FN}`;
    cellT[1][1].textContent = `TN = ${TN}`;
    fP.textContent = `${TP} / (${TP} + ${FP}) = ${fmt(prec, 3)}`;
    fR.textContent = `${TP} / (${TP} + ${FN}) = ${fmt(rec, 3)}`;
    role('prec').textContent = fmt(prec, 3);
    role('rec').textContent = fmt(rec, 3);
    role('acc').textContent = acc.toFixed(2);
    let v;
    if (FP > 0) {
      v = `At t = ${t.toFixed(2)}, <b>${FP}</b> real email${FP > 1 ? 's land' : ' lands'} in the spam folder` + (FP > 1 ? ', the job offer among them. Each one is' : ': the job offer. It is') + ` a False Positive, so precision = ${TP} / (${TP} + ${FP}) = <b>${fmt(prec, 3)}</b>.`;
    } else {
      v = `No real email reaches the spam folder, so precision = <b>1</b>. The price is <b>${FN}</b> spam email${FN > 1 ? 's' : ''} left in the inbox (FN), which lowers recall to ${fmt(rec, 3)}. A spam in the inbox costs one click; a lost job offer costs far more.`;
    }
    if (t === 0.5 || t === 0.65) v += ' Accuracy is 0.90 at both t = 0.50 and t = 0.65, so it cannot tell the threshold that loses the job offer from the one that keeps it.';
    role('verdict').innerHTML = v;
  });
});

QV.register('s1-mc4', function (q) {
  const { s, svg, steps, table } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  // counts from the slide 14 table: rows with Discount Yes / No, and how many of those had Free Delivery Yes
  const CLS = [
    { name: 'Buy', n: 10, d: [8, 2], fy: [8, 1], pd: '8/10', pf: '9/10', pfv: 0.9, act: '0.80', actF: '8/10', nai: '0.72' },
    { name: 'No Buy', n: 5, d: [2, 3], fy: [1, 1], pd: '2/5', pf: '2/5', pfv: 0.4, act: '0.20', actF: '1/5', nai: '0.16' },
  ];
  const NOTES = [
    'Buy: all 8 rows with a discount also had free delivery, but only 1 of the 2 rows without one did. Knowing Discount changes the odds of Free Delivery, so the two features are not independent here. Naive Bayes ignores that and uses 9/10 in both columns.',
    'No Buy: free delivery is 1 of 2 with a discount and 1 of 3 without. Naive Bayes uses 2/5 in both columns. Close, but not equal.',
  ];

  const W = svg(viz('mosaic'), 680, 280, { label: 'Two mosaic plots for one class: counted shares of Free Delivery inside each Discount column, and the naive version with the same share in both columns', minWidth: 540 });
  const PANEL = [{ x: 60, title: 'Counted in the data' }, { x: 390, title: 'Naive Bayes assumes' }];
  const PW = 230, PH = 196, PY = 36, GAP = 4;
  PANEL.forEach(p => s('text', { x: p.x + PW / 2, y: 22, 'text-anchor': 'middle', class: 't-fg t-bold' }, W, p.title));
  const layer = s('g', {}, W);

  function draw(k) {
    layer.textContent = '';
    const c = CLS[k];
    PANEL.forEach((p, pi) => {
      let x = p.x;
      const splits = [];
      c.d.forEach((cnt, j) => {
        const w = (PW - GAP) * cnt / c.n;
        const share = pi === 0 ? c.fy[j] / cnt : c.pfv;
        const hy = PH * share, top = PY + PH - hy;
        s('rect', { x, y: PY, width: w, height: PH - hy, class: 'f-sec-soft sep' }, layer);
        s('rect', { x, y: top, width: w, height: hy, class: 'f-pri-soft sep' }, layer);
        const yesT = pi === 0 ? `${c.fy[j]} of ${cnt}` : `${Math.round(share * 100)}%`;
        const noT = pi === 0 ? `${cnt - c.fy[j]} of ${cnt}` : `${Math.round((1 - share) * 100)}%`;
        if (hy >= 18) s('text', { x: x + w / 2, y: top + hy / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, layer, yesT);
        if (PH - hy >= 18) s('text', { x: x + w / 2, y: PY + (PH - hy) / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, layer, noT);
        s('text', { x: x + w / 2, y: PY + PH + 16, 'text-anchor': 'middle', class: 't-fg' }, layer, (j === 0 ? 'Discount Yes' : 'No') + ` (${cnt})`);
        splits.push([x, x + w, top]);
        x += w + GAP;
      });
      if (pi === 0) {
        splits.forEach(([a, b, y]) => s('line', { x1: a, x2: b, y1: y, y2: y, class: 's-fg', style: 'stroke-width: 2.5' }, layer));
        s('line', { x1: splits[0][1], x2: splits[1][0], y1: splits[0][2], y2: splits[1][2], class: 's-fg dash', style: 'stroke-width: 1' }, layer);
      } else {
        s('line', { x1: p.x - 4, x2: p.x + PW + 4, y1: splits[0][2], y2: splits[0][2], class: 's-fg dash', style: 'stroke-width: 2' }, layer);
      }
    });
    s('text', { x: PANEL[0].x + PW / 2, y: PY + PH + 36, 'text-anchor': 'middle', class: 't-muted' }, layer, 'the blue share jumps between columns');
    s('text', { x: PANEL[1].x + PW / 2, y: PY + PH + 36, 'text-anchor': 'middle', class: 't-muted' }, layer, `the same ${c.pf} in both columns`);
    role('act').textContent = c.act;
    role('act-sub').textContent = `P(Disc. Yes, Free Yes | ${c.name}) = ${c.actF}`;
    role('nai').textContent = c.nai;
    role('nai-sub').textContent = `P(Disc. Yes | ${c.name}) × P(Free Yes | ${c.name}) = ${c.pd} × ${c.pf}`;
    role('note').textContent = NOTES[k];
  }
  steps(viz('steps'), ['Buy · 10 rows', 'No Buy · 5 rows'], draw);

  table(viz('query'), [{ text: 'Class', cls: 'l' }, { text: 'Naive product', cls: 'l' }, { text: 'Counted', cls: 'l' }, { text: 'Score = naive × prior', cls: 'l' }], [
    ['Buy', '4/10 · 8/10 · 9/10 = 0.288', '3/10 = 0.3', { text: '0.288 × 10/15 = 0.192', cls: 'l hl' }],
    ['No Buy', '2/5 · 2/5 · 2/5 = 0.064', '0/5 = 0', '0.064 × 5/15 = 0.0213'],
  ].map(r => r.map(c => (typeof c === 'string' ? { text: c, cls: 'l' } : c))));
});

QV.register('s1-mc5', function (q) {
  const { s, svg, axes, slider } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  // slides 42-44: sepal length, sepal width, class (0 Setosa, 1 Versicolor, 2 Virginica)
  const PTS = [[5.3, 3.7, 0], [5.1, 3.8, 0], [7.2, 3.0, 2], [5.4, 3.4, 0], [5.1, 3.3, 0], [5.4, 3.9, 0], [7.4, 2.8, 2], [6.1, 2.8, 1], [7.3, 2.9, 2], [6.0, 2.7, 1], [5.8, 2.8, 2], [6.3, 2.3, 1]];
  const NAME = ['Setosa', 'Versicolor', 'Virginica'], SHORT = ['Se', 'Ve', 'Vi'];
  const FILL = ['f-pri', 'f-ter', 'f-sec'], SOFT = ['f-pri-soft', 'f-ter-soft', 'f-sec-soft'], STROKE = ['s-pri', 's-ter', 's-sec'], TXT = ['t-pri', 't-ter', 't-sec'], VCLS = ['pri', 'ter', 'sec'];
  const QS = [[5.2, 3.1], [7.0, 2.9], [6.2, 2.5]];
  function knn(x, y, k) {
    const order = PTS.map((p, i) => [Math.hypot(p[0] - x, p[1] - y), i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(e => e[1]);
    const votes = [0, 0, 0], first = [99, 99, 99];
    order.slice(0, k).forEach((i, r) => { const c = PTS[i][2]; votes[c]++; if (first[c] === 99) first[c] = r; });
    const top = Math.max(...votes);
    let best = -1;
    [0, 1, 2].forEach(c => { if (votes[c] === top && (best < 0 || first[c] < first[best])) best = c; });
    return { cls: best, votes, order };
  }

  // Figure 1: decision map over the plane
  const M = svg(viz('map'), 556, 418, { label: 'Sepal length against sepal width with the 12 Iris points; every background square is colored by the KNN prediction there', minWidth: 500 });
  const NX = 60, NY = 44, CELLPX = 8, BOX = { x: 56, y: 20, w: NX * CELLPX, h: NY * CELLPX };
  const raster = s('g', { style: 'shape-rendering: crispEdges' }, M);
  const cells = [];
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      const r = s('rect', { x: BOX.x + i * CELLPX, y: BOX.y + BOX.h - (j + 1) * CELLPX, width: CELLPX, height: CELLPX }, raster);
      cells.push([r, 4.8 + (i + 0.5) * 0.05, 2.0 + (j + 0.5) * 0.05]);
    }
  }
  const ax = axes(M, { ...BOX, xd: [4.8, 7.8], yd: [2.0, 4.2], xt: [5, 5.5, 6, 6.5, 7, 7.5], yt: [2, 2.5, 3, 3.5, 4], xf: v => v.toFixed(1), yf: v => v.toFixed(1), xl: 'sepal length (cm)', yl: 'sepal width (cm)', grid: false });
  PTS.forEach(([x, y, c]) => s('circle', { cx: ax.x(x), cy: ax.y(y), r: 6, class: FILL[c] + ' sep' }, M));
  const qRings = QS.map(([x, y], i) => {
    const ring = s('circle', { cx: ax.x(x), cy: ax.y(y), r: 11, class: 's-pri' }, M);
    const cx = ax.x(x), cy = ax.y(y);
    s('path', { d: `M${cx} ${cy - 7} L${cx + 7} ${cy} L${cx} ${cy + 7} L${cx - 7} ${cy} Z`, class: 'f-fg sep' }, M);
    s('text', { x: cx - 12, y: cy + 18, 'text-anchor': 'end', class: 't-fg t-bold halo' }, M, 'Q' + (i + 1));
    return ring;
  });

  // ranked neighbours for each query
  const RK = svg(viz('ranks'), 610, 158, { label: 'For each query, the 12 training points sorted by distance with the k nearest boxed, and the vote result', minWidth: 520 });
  s('text', { x: 90, y: 14, class: 't-sm' }, RK, 'nearest  →  farthest');
  const rows = QS.map(([x, y], r) => {
    const top = 26 + r * 44;
    s('text', { x: 0, y: top + 12, class: 't-fg t-bold' }, RK, 'Q' + (r + 1));
    s('text', { x: 0, y: top + 26, class: 't-sm' }, RK, `(${x.toFixed(1)}, ${y.toFixed(1)})`);
    const order = knn(x, y, 12).order;
    order.forEach((i, n) => {
      const c = PTS[i][2];
      s('rect', { x: 90 + n * 30, y: top, width: 26, height: 26, rx: 3, class: FILL[c] }, RK);
      s('text', { x: 103 + n * 30, y: top + 13, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-sm t-bold' }, RK, SHORT[c]);
    });
    const box = s('rect', { x: 86, y: top - 3, height: 32, rx: 4, class: 'f-none s-fg', style: 'stroke-width: 2' }, RK);
    const res = s('text', { x: 462, y: top + 12, class: 't-bold' }, RK);
    const vt = s('text', { x: 462, y: top + 26, class: 't-sm' }, RK);
    return { box, res, vt };
  });

  slider(viz('slider'), { label: 'k', min: 1, max: 12, step: 1, value: 3 }, k => {
    const share = [0, 0, 0];
    cells.forEach(([r, x, y]) => { const c = knn(x, y, k).cls; share[c]++; r.setAttribute('class', SOFT[c]); });
    const out = QS.map(([x, y], i) => {
      const res = knn(x, y, k);
      const vtxt = res.votes.map((v, c) => `${SHORT[c]} ${v}`).join(' · ');
      qRings[i].setAttribute('class', STROKE[res.cls]);
      const pv = role('p' + i);
      pv.textContent = NAME[res.cls];
      pv.className = 'v ' + VCLS[res.cls];
      role('v' + i).textContent = vtxt;
      rows[i].box.setAttribute('width', k * 30 + 2);
      rows[i].res.textContent = '→ ' + NAME[res.cls];
      rows[i].res.setAttribute('class', TXT[res.cls] + ' t-bold');
      rows[i].vt.textContent = vtxt;
      return res.cls;
    });
    const pct = Math.round(share[0] / cells.length * 100);
    let v;
    if (k === 12) v = 'k = N = 12: every query gets all 12 points as neighbours, the same 5 Setosa, 3 Versicolor and 4 Virginica votes. The whole map is <b>Setosa</b>, the majority class, wherever the query is. This is option a.';
    else if (k === 1) v = 'k = 1: every spot takes the label of its single nearest point (option b). The map breaks into one patch per training point, the overfitting end of the range.';
    else v = `k = ${k}: Q1 → ${NAME[out[0]]}, Q2 → ${NAME[out[1]]}, Q3 → ${NAME[out[2]]}. Setosa covers <b>${pct}%</b> of the map; at k = 12 it covers all of it.`;
    role('verdict').innerHTML = v;
  });
});

QV.register('s1-mc6', function (q) {
  const { s, svg, axes, plot, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const T = p => (p <= 0 ? 0 : -p * Math.log2(p));
  const H = p => T(p) + T(1 - p);

  const W = svg(viz('node'), 790, 274, { label: 'A node of 14 examples with its two entropy terms, and the entropy curve against the share of Yes with options a to d marked', minWidth: 560 });
  s('rect', { x: 16, y: 20, width: 232, height: 92, rx: 10, class: 'f-surface box' }, W);
  const balls = [];
  for (let i = 0; i < 14; i++) balls.push(s('circle', { cx: 38 + (i % 7) * 31, cy: 48 + Math.floor(i / 7) * 36, r: 12 }, W));
  const cnt = s('text', { x: 132, y: 134, 'text-anchor': 'middle', class: 't-fg t-bold' }, W);
  s('text', { x: 16, y: 166, class: 't-fg' }, W, 'E = −p₊ log₂ p₊ − p₋ log₂ p₋');
  const BX = 16, BU = 220, BY = 178;
  const segA = s('rect', { x: BX, y: BY, height: 26, class: 'f-pri-soft sep' }, W);
  const segB = s('rect', { y: BY, height: 26, class: 'f-sec-soft sep' }, W);
  const labA = s('text', { y: BY + 13, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, W);
  const labB = s('text', { y: BY + 13, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, W);
  s('line', { x1: BX, x2: BX + BU, y1: BY + 34, y2: BY + 34, class: 'l-axis' }, W);
  [[0, '0'], [0.5, '0.5'], [1, '1 bit']].forEach(([v, t]) => {
    s('line', { x1: BX + v * BU, x2: BX + v * BU, y1: BY + 34, y2: BY + 39, class: 'l-axis' }, W);
    s('text', { x: BX + v * BU, y: BY + 52, 'text-anchor': v === 1 ? 'end' : v === 0 ? 'start' : 'middle' }, W, t);
  });

  const ax = axes(W, { x: 340, y: 24, w: 400, h: 200, xd: [0, 1], yd: [0, 1.2], xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 0.25, 0.5, 0.75, 1], yf: v => v.toFixed(2), xl: 'p₊, the share of Yes', yl: 'entropy E (bits)' });
  s('line', { x1: ax.x(0), x2: ax.x(1), y1: ax.y(0.5), y2: ax.y(0.5), class: 's-muted dash', style: 'stroke-width: 1' }, W);
  plot(W, ax, H, 0, 1, 400, 's-pri');
  for (let k = 0; k <= 14; k++) s('circle', { cx: ax.x(k / 14), cy: ax.y(H(k / 14)), r: 2.5, class: 'f-muted' }, W);
  [0.11003, 0.88997].forEach(p => s('circle', { cx: ax.x(p), cy: ax.y(0.5), r: 4, class: 'f-surface s-muted' }, W));
  [[0, 0], [1, 0]].forEach(([p, e]) => s('circle', { cx: ax.x(p), cy: ax.y(e), r: 4.5, class: 'f-fg' }, W));
  s('circle', { cx: ax.x(9 / 14), cy: ax.y(H(9 / 14)), r: 4.5, class: 'f-fg' }, W);
  const cur = s('g', {}, W);
  s('text', { x: ax.x(0.5) - 10, y: ax.y(1) - 10, 'text-anchor': 'end', class: 't-fg t-bold halo' }, W, 'c · 1 at 7 Yes / 7 No');
  s('text', { x: ax.x(9 / 14) + 8, y: ax.y(H(9 / 14)) - 8, class: 't-fg halo' }, W, 'd · 0.940 at 9 Yes / 5 No');
  s('text', { x: ax.x(0.5), y: ax.y(0.5) - 7, 'text-anchor': 'middle', class: 't-muted halo' }, W, 'b · E = 0.5 needs p₊ ≈ 0.11 or 0.89');
  s('text', { x: ax.x(0.5), y: ax.y(0.12), 'text-anchor': 'middle', class: 't-muted halo' }, W, 'a · E = 0 at both ends: a pure node');

  slider(viz('slider'), { label: 'Yes examples', min: 0, max: 14, step: 1, value: 7, fmt: v => `${v} Yes, ${14 - v} No` }, k => {
    const p = k / 14, a = T(p), b = T(1 - p), e = a + b;
    balls.forEach((c, i) => c.setAttribute('class', i < k ? 'f-pri' : 'f-sec'));
    cnt.textContent = `${k} Yes · ${14 - k} No`;
    segA.setAttribute('width', a * BU);
    segB.setAttribute('x', BX + a * BU);
    segB.setAttribute('width', b * BU);
    labA.setAttribute('x', BX + a * BU / 2);
    labB.setAttribute('x', BX + a * BU + b * BU / 2);
    labA.textContent = a * BU >= 40 ? a.toFixed(3) : '';
    labB.textContent = b * BU >= 40 ? b.toFixed(3) : '';
    cur.textContent = '';
    s('line', { x1: ax.x(p), x2: ax.x(p), y1: ax.y(0), y2: ax.y(e), class: 's-ok dash', style: 'stroke-width: 1.5' }, cur);
    s('circle', { cx: ax.x(p), cy: ax.y(e), r: 6.5, class: 'f-ok sep' }, cur);
    role('p').textContent = fmt(p, 3);
    role('pq').textContent = `p₊ = ${k}/14, p₋ = ${14 - k}/14`;
    role('e').textContent = fmt(e, 3);
    role('terms').textContent = `${a.toFixed(3)} + ${b.toFixed(3)}`;
    role('pure').textContent = k === 0 || k === 14 ? 'pure, a leaf' : k === 7 ? 'least pure' : 'impure';
    let v;
    if (k === 7) v = '7 Yes and 7 No: p₊ = p₋ = 0.5, and each term is −0.5 × log₂ 0.5 = 0.5. So <b>E = 1</b>, the top of the curve. Option c.';
    else if (k === 9 || k === 5) v = `${k} Yes and ${14 - k} No, the PlayTennis root counts: <b>E = 0.940</b>, option d. Purer than 7/7, but not pure.`;
    else if (k === 0 || k === 14) v = 'All 14 examples are in one class: <b>E = 0</b>, option a. A pure node becomes a leaf.';
    else v = `${k} Yes and ${14 - k} No: <b>E = ${fmt(e, 3)}</b>. The closer the node is to 7/7, the higher its entropy.`;
    role('verdict').innerHTML = v;
  });
});

QV.register('s1-mc7', function (q) {
  const { s, svg, axes, steps, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const POS0 = [[5, 4], [6, 5.5], [7.5, 4], [5.5, 6.5], [8, 6.5], [7, 2.8]];
  const NEG0 = [[3, 3], [4, 2], [1, 2], [2, 1], [1, 4.5], [2.5, 0.8]];
  // max-margin solutions checked in Python: boundary w·x = (lo + hi) / 2, margin lines w·x = lo and w·x = hi
  const ST = [
    { pos: POS0, neg: NEG0, w: [1, 1], lo: 6, hi: 9, eq: 'x₁ + x₂ = 7.5', sub: 'from the 3 support vectors', mean: 'start',
      note: 'The hyperplane x₁ + x₂ = 7.5 sits midway between the margin lines x₁ + x₂ = 6 and x₁ + x₂ = 9. Three points touch the margin lines: (3, 3), (4, 2) and (5, 4). These are the support vectors.' },
    { pos: [[5, 4], [7.2, 6.8], [8.8, 4.6], [6.4, 7.4], [9, 7.2], [8.4, 3.0]], neg: [[3, 3], [4, 2], [0.8, 0.8], [1.2, 2.6], [0.6, 4.2], [2.6, 0.4]], w: [1, 1], lo: 6, hi: 9,
      eq: 'x₁ + x₂ = 7.5', sub: 'unchanged', mean: 'moved',
      note: 'The 9 other points moved, and none crossed into the margin. The SVM hyperplane is exactly the same line, x₁ + x₂ = 7.5. The class means moved, so the red line built from them moved too.' },
    { pos: POS0, neg: [[3.5, 3.5], [4, 2], [1, 2], [2, 1], [1, 4.5], [2.5, 0.8]], w: [3, 1], lo: 14, hi: 19, eq: '3x₁ + x₂ = 16.5', sub: 'turned', mean: 'moved',
      note: 'Now one support vector moves, from (3, 3) to (3.5, 3.5). The hyperplane turns to 3x₁ + x₂ = 16.5 and the margin shrinks from 2.121 to 1.581. Moving one support vector changed the SVM; moving 9 other points did not.' },
  ];
  const BOXP = [[0, 0], [10, 0], [10, 8], [0, 8]];
  const dot = (w, p) => w[0] * p[0] + w[1] * p[1];
  const clipPoly = (poly, f) => {
    const out = [];
    poly.forEach((p, i) => {
      const n = poly[(i + 1) % poly.length], fp = f(p), fn = f(n);
      if (fp >= 0) out.push(p);
      if ((fp >= 0) !== (fn >= 0)) { const t = fp / (fp - fn); out.push([p[0] + t * (n[0] - p[0]), p[1] + t * (n[1] - p[1])]); }
    });
    return out;
  };
  // a line w·x = c as the edge of a thin half-plane clipped to the box
  const segment = (w, c) => {
    const pts = clipPoly(BOXP, p => c - dot(w, p)).filter(p => Math.abs(dot(w, p) - c) < 1e-9);
    return pts.length >= 2 ? [pts[0], pts[pts.length - 1]] : null;
  };
  const meanLine = st => {
    const m = arr => [arr.reduce((a, p) => a + p[0], 0) / arr.length, arr.reduce((a, p) => a + p[1], 0) / arr.length];
    const mp = m(st.pos), mn = m(st.neg), w = [mp[0] - mn[0], mp[1] - mn[1]];
    return { mp, mn, w, c: (dot(mp, mp) - dot(mn, mn)) / 2 };
  };

  const W = svg(viz('plot'), 520, 418, { label: 'Two classes of points with the SVM hyperplane, its margin and support vectors, and a line built from the class means', minWidth: 460 });
  const ax = axes(W, { x: 48, y: 20, w: 440, h: 352, xd: [0, 10], yd: [0, 8], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6, 8], xl: 'x₁', yl: 'x₂' });
  const layer = s('g', {}, W);
  const P = p => [ax.x(p[0]), ax.y(p[1])];
  const L = (seg, cls, style) => seg && s('line', { x1: ax.x(seg[0][0]), y1: ax.y(seg[0][1]), x2: ax.x(seg[1][0]), y2: ax.y(seg[1][1]), class: cls, style }, layer);

  function draw(k) {
    layer.textContent = '';
    const st = ST[k], s0 = ST[0];
    const band = clipPoly(clipPoly(BOXP, p => dot(st.w, p) - st.lo), p => st.hi - dot(st.w, p));
    s('polygon', { points: band.map(p => P(p).join(',')).join(' '), class: 'area-pri' }, layer);
    if (k > 0) L(segment(s0.w, (s0.lo + s0.hi) / 2), 's-muted dash', 'stroke-width: 1.5');
    L(segment(st.w, st.lo), 's-pri dash', 'stroke-width: 1');
    L(segment(st.w, st.hi), 's-pri dash', 'stroke-width: 1');
    L(segment(st.w, (st.lo + st.hi) / 2), 's-pri', 'stroke-width: 2.5');
    const ml = meanLine(st);
    L(segment(ml.w, ml.c), 's-bad dash', 'stroke-width: 2');
    [[ml.mp, 'f-ter'], [ml.mn, 'f-sec']].forEach(([m, f]) => {
      const [x, y] = P(m);
      s('text', { x: x + 11, y: y + 4, class: 't-bad t-sm t-bold halo' }, layer, 'mean');
      s('rect', { x: x - 5, y: y - 5, width: 10, height: 10, class: f, style: 'opacity: 0.55' }, layer);
      s('path', { d: `M${x - 7} ${y - 7} L${x + 7} ${y + 7} M${x - 7} ${y + 7} L${x + 7} ${y - 7}`, class: 's-bad', style: 'stroke-width: 2' }, layer);
    });
    if (k > 0) {
      ['pos', 'neg'].forEach(side => st[side].forEach((p, i) => {
        const o = s0[side][i];
        if (o[0] === p[0] && o[1] === p[1]) return;
        const [x1, y1] = P(o), [x2, y2] = P(p);
        s('circle', { cx: x1, cy: y1, r: 9, class: 'f-none s-muted dash', style: 'stroke-width: 1.2' }, layer);
        const d = Math.hypot(x2 - x1, y2 - y1);
        if (d > 24) arrow(layer, x1 + (x2 - x1) * 11 / d, y1 + (y2 - y1) * 11 / d, x2 - (x2 - x1) * 12 / d, y2 - (y2 - y1) * 12 / d, { cls: 'a-muted', head: 6 });
      }));
    }
    const sv = p => Math.abs(dot(st.w, p) - st.lo) < 1e-9 || Math.abs(dot(st.w, p) - st.hi) < 1e-9;
    [['pos', 'f-ter', '+'], ['neg', 'f-sec', '−']].forEach(([side, f, sym]) => st[side].forEach(p => {
      const [x, y] = P(p);
      if (sv(p)) s('circle', { cx: x, cy: y, r: 14, class: 'f-none s-pri', style: 'stroke-width: 2.5' }, layer);
      s('circle', { cx: x, cy: y, r: 9, class: f + ' sep' }, layer);
      s('text', { x, y, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold t-lg' }, layer, sym);
    }));
    const nw = Math.hypot(st.w[0], st.w[1]);
    role('eq').textContent = st.eq;
    role('eq-sub').textContent = st.sub;
    role('d').textContent = ((st.hi - st.lo) / nw).toFixed(3);
    role('mean').textContent = st.mean;
    role('note').textContent = st.note;
  }
  steps(viz('steps'), ['1 · Training set', '2 · Move 9 other points', '3 · Move one support vector'], draw);
});

QV.register('s1-mc8', function (q) {
  const { s, svg, axes, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const AGE = [23, 25, 26, 28, 29, 31, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48, 50, 51, 53, 54, 56, 57, 59, 60, 62, 63, 64, 65];
  const INC = [31, 42, 95, 38, 47, 55, 36, 104, 49, 61, 44, 58, 120, 52, 67, 40, 88, 57, 63, 46, 110, 59, 50, 72, 41, 92, 54, 48, 66, 39];
  const MCAR = [1, 6, 11, 16, 22, 27];
  const r1 = v => (Math.round(v * 10) / 10).toFixed(1);
  const TRUE = INC.reduce((a, b) => a + b, 0) / INC.length;
  const MODES = [
    { miss: i => MCAR.includes(i),
      note: 'MCAR, Missing Completely At Random: not related to any variable, observed or not, like a sensor that briefly went offline. The 6 blanks are scattered with no pattern, so the answers that remain still average close to the true mean.' },
    { miss: i => AGE[i] >= 56, band: 'age',
      note: 'MAR, Missing At Random: related to another observed variable. Here everyone aged 56 or more skips the question (the slide example: older respondents skip income questions). The blanks form a vertical band, and the age column, which is in the data, explains them.' },
    { miss: i => INC[i] >= 85, band: 'inc',
      note: 'MNAR, Missing Not At Random: the blank depends on the missing value itself. The 6 people earning 85k or more leave it blank. The blanks form a horizontal band at the top, the answers that remain average about 10k too low, and no observed column shows why.' },
  ];

  const W = svg(viz('plot'), 660, 332, { label: 'Income against age for 30 respondents; answered incomes are filled, blank incomes are hollow at their true value', minWidth: 540 });
  const ax = axes(W, { x: 56, y: 24, w: 520, h: 260, xd: [20, 70], yd: [0, 140], xt: [20, 30, 40, 50, 60, 70], yt: [0, 25, 50, 75, 100, 125], xl: 'age (answered by everyone)', yl: 'income, k$ (the question that can be left blank)' });
  const bandL = s('g', {}, W);
  W.insertBefore(bandL, W.firstChild);
  const layer = s('g', {}, W);

  function draw(k) {
    const m = MODES[k];
    bandL.textContent = '';
    layer.textContent = '';
    if (m.band === 'age') {
      s('rect', { x: ax.x(55.5), y: ax.y(140), width: ax.x(70) - ax.x(55.5), height: ax.y(0) - ax.y(140), class: 'f-ter-soft' }, bandL);
      s('text', { x: ax.x(62.75), y: ax.y(140) + 16, 'text-anchor': 'middle', class: 't-ter t-bold' }, layer, 'age ≥ 56:');
      s('text', { x: ax.x(62.75), y: ax.y(140) + 30, 'text-anchor': 'middle', class: 't-ter t-bold' }, layer, 'skip the question');
    } else if (m.band === 'inc') {
      s('rect', { x: ax.x(20), y: ax.y(140), width: ax.x(70) - ax.x(20), height: ax.y(85) - ax.y(140), class: 'f-ter-soft' }, bandL);
      s('text', { x: ax.x(69.5), y: ax.y(140) + 16, 'text-anchor': 'end', class: 't-ter t-bold' }, layer, 'income ≥ 85k: blank');
      s('text', { x: ax.x(69.5), y: ax.y(140) + 30, 'text-anchor': 'end', class: 't-ter t-bold' }, layer, 'because of the value itself');
    }
    const obs = [];
    AGE.forEach((a, i) => {
      const gone = m.miss(i);
      if (!gone) obs.push(INC[i]);
      s('circle', { cx: ax.x(a), cy: ax.y(INC[i]), r: gone ? 6 : 5, class: gone ? 'f-none s-fg dash' : 'f-pri', style: gone ? 'stroke-width: 1.5' : null }, layer);
    });
    const om = obs.reduce((a, b) => a + b, 0) / obs.length;
    let yT = ax.y(TRUE), yO = ax.y(om);
    s('line', { x1: ax.x(20), x2: ax.x(70), y1: yT, y2: yT, class: 's-fg dash', style: 'stroke-width: 1.2' }, layer);
    s('line', { x1: ax.x(20), x2: ax.x(70), y1: yO, y2: yO, class: 's-pri', style: 'stroke-width: 2' }, layer);
    if (Math.abs(yT - yO) < 14) { const mid = (yT + yO) / 2, up = yO < yT; yO = mid + (up ? -7 : 7); yT = mid + (up ? 7 : -7); }
    s('text', { x: ax.x(70) + 6, y: yT, dy: '0.35em', class: 't-fg' }, layer, `true ${r1(TRUE)}`);
    s('text', { x: ax.x(70) + 6, y: yO, dy: '0.35em', class: 't-pri t-bold' }, layer, `seen ${r1(om)}`);
    const gap = Math.round((om - TRUE) * 10) / 10;
    role('n').textContent = `${30 - obs.length} of 30`;
    role('om').textContent = r1(om) + 'k';
    role('gap').textContent = (gap > 0 ? '+' : gap < 0 ? '−' : '') + Math.abs(gap).toFixed(1) + 'k';
    role('note').textContent = m.note;
  }
  steps(viz('steps'), ['MCAR · random', 'MAR · older skip', 'MNAR · high earners skip'], draw, 2);
});

QV.register('s1-mc9', function (q) {
  const { s, svg, axes, steps, arrow, table, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const PTS = [[1, 1], [1.5, 2.5], [2, 1], [2.5, 2], [7, 2], [8, 1], [8.5, 2.5], [7.5, 3], [4, 6], [4.5, 7.5], [5.5, 6.5], [5, 8]];
  const NM = 'ABCDEFGHIJKL';
  const FILL = ['f-pri', 'f-sec', 'f-ter'], STROKE = ['s-pri', 's-sec', 's-ter'], ARW = ['a-pri', 'a-sec', 'a-muted'], TXT = ['t-pri', 't-sec', 't-ter'];
  const COLOR = ['blue', 'plum', 'ochre'], MU = ['μ₁', 'μ₂', 'μ₃'];
  const d2 = (p, c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2;
  const assign = C => PTS.map(p => [0, 1, 2].reduce((b, k) => (d2(p, C[k]) < d2(p, C[b]) ? k : b), 0));
  const update = asg => [0, 1, 2].map(k => {
    const m = PTS.filter((p, i) => asg[i] === k);
    const sx = m.reduce((a, p) => a + p[0], 0), sy = m.reduce((a, p) => a + p[1], 0);
    return { sx, sy, n: m.length, c: [sx / m.length, sy / m.length], names: NM.split('').filter((x, i) => asg[i] === k).join(', ') };
  });
  const J = (asg, C) => PTS.reduce((a, p, i) => a + d2(p, C[asg[i]]), 0);
  const C0 = [PTS[0], PTS[1], PTS[5]];
  const a1 = assign(C0), u1 = update(a1), C1 = u1.map(u => u.c);
  const a2 = assign(C1), u2 = update(a2), C2 = u2.map(u => u.c);
  const ST = [
    { kind: 'init', C: C0, asg: null, name: 'Init', sub: 'K = 3 points from the data',
      note: 'Step 1, initialization: K = 3 points from the dataset become the centroids, here A, B and F. Two of them sit in the same corner, a bad start on purpose.' },
    { kind: 'assign', C: C0, asg: a1, name: 'Assign 1', sub: 'points pick a star',
      note: 'Step 2, assignment: each point joins its nearest centroid. B grabs the whole top group, because no centroid is near it. The points do not move; only their color changes.' },
    { kind: 'update', C: C1, prev: C0, asg: a1, u: u1, name: 'Update 1', sub: 'centroids move',
      note: `Step 3, update: each centroid jumps to the mean of its points. μ₂ = (1.5 + 2.5 + 4 + 4.5 + 5.5 + 5, 2.5 + 2 + 6 + 7.5 + 6.5 + 8) / 6 = (23, 32.5) / 6 = (3.833, 5.417). J falls from ${fmt(J(a1, C0), 3)} to ${fmt(J(a1, C1), 3)}.` },
    { kind: 'assign', C: C1, asg: a2, name: 'Assign 2', sub: 'points pick a star',
      note: `Assignment again with the new centroids. B and D are now closer to μ₁, so they switch to cluster 1. The points still have not moved. J falls to ${fmt(J(a2, C1), 3)}.` },
    { kind: 'update', C: C2, prev: C1, asg: a2, u: u2, name: 'Update 2', sub: 'centroids move',
      note: 'Update again: μ₁ = (7, 6.5) / 4 = (1.75, 1.625) and μ₂ = (19, 28) / 4 = (4.75, 7). μ₃ already sits at the mean of E, F, G and H, so it stays.' },
    { kind: 'done', C: C2, asg: assign(C2), u: update(assign(C2)), name: 'Converged', sub: 'nothing changes',
      note: 'Assignment changes nothing, so the next update leaves every centroid where it is. The centroids no longer change: K-Means has converged.' },
  ];

  const W = svg(viz('plot'), 500, 438, { label: 'Twelve points and three star-shaped centroids; update steps show each centroid moving to the mean of its colored points', minWidth: 460 });
  const ax = axes(W, { x: 44, y: 16, w: 420, h: 378, xd: [0, 10], yd: [0, 9], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6, 8], xl: 'x₁', yl: 'x₂' });
  const layer = s('g', {}, W);
  const star = (x, y, R, cls, style) => {
    const pts = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * 0.45 : R; pts.push((x + r * Math.cos(a)).toFixed(1) + ',' + (y + r * Math.sin(a)).toFixed(1)); }
    return s('polygon', { points: pts.join(' '), class: cls, style }, layer);
  };
  const tbl = table(viz('table'), [{ text: 'Cluster', cls: 'l' }, { text: 'Points', cls: 'l' }, 'Σx₁', 'Σx₂', '|C|', 'μ = Σ / |C|'], [0, 1, 2].map(() => [{ text: '', cls: 'l' }, { text: '', cls: 'l' }, '', '', '', '']));
  const pt = c => `(${fmt(c[0], 3)}, ${fmt(c[1], 3)})`;

  function draw(k) {
    layer.textContent = '';
    const st = ST[k];
    if (st.asg) {
      PTS.forEach((p, i) => {
        const c = st.asg[i], tgt = st.C[c];
        s('line', { x1: ax.x(p[0]), y1: ax.y(p[1]), x2: ax.x(tgt[0]), y2: ax.y(tgt[1]), class: STROKE[c] + (st.kind === 'assign' ? ' dash' : ''), style: 'stroke-width: 1; opacity: 0.55' }, layer);
      });
    }
    PTS.forEach((p, i) => {
      const x = ax.x(p[0]), y = ax.y(p[1]);
      s('circle', { cx: x, cy: y, r: 7, class: (st.asg ? FILL[st.asg[i]] : 'f-muted') + ' sep' }, layer);
      s('text', { x: x + 9, y: y - 8, class: 't-fg t-sm t-bold halo' }, layer, NM[i]);
    });
    if (st.kind === 'update') {
      [0, 1, 2].forEach(c => {
        const [ox, oy] = [ax.x(st.prev[c][0]), ax.y(st.prev[c][1])], [nx, ny] = [ax.x(st.C[c][0]), ax.y(st.C[c][1])];
        star(ox, oy, 15, 'f-none ' + STROKE[c] + ' dash', 'stroke-width: 1.5');
        const d = Math.hypot(nx - ox, ny - oy);
        if (d > 30) arrow(layer, ox + (nx - ox) * 15 / d, oy + (ny - oy) * 15 / d, nx - (nx - ox) * 14 / d, ny - (ny - oy) * 14 / d, { cls: ARW[c], width: 2.5, head: 9 });
      });
    }
    st.C.forEach((c, j) => {
      const x = ax.x(c[0]), y = ax.y(c[1]);
      star(x, y, 13, FILL[j] + ' sep', 'stroke-width: 2');
      s('text', { x: x + 14, y: y + 14, class: TXT[j] + ' t-bold halo' }, layer, MU[j]);
    });
    tbl.rows.forEach((tr, j) => {
      const td = tr.children;
      td[0].textContent = `${j + 1} · ${COLOR[j]}`;
      td[5].className = '';
      if (st.kind === 'init') {
        td[1].textContent = `starts at ${NM[[0, 1, 5][j]]}`;
        [2, 3, 4].forEach(i => { td[i].textContent = ''; });
        td[5].textContent = pt(st.C[j]);
      } else if (st.kind === 'assign') {
        td[1].textContent = NM.split('').filter((x, i) => st.asg[i] === j).join(', ');
        [2, 3, 4].forEach(i => { td[i].textContent = ''; });
        td[5].textContent = pt(st.C[j]) + ', current';
      } else {
        const u = st.u[j];
        td[1].textContent = u.names;
        td[2].textContent = fmt(u.sx, 3);
        td[3].textContent = fmt(u.sy, 3);
        td[4].textContent = String(u.n);
        td[5].textContent = pt(u.c) + (st.kind === 'done' ? ', same' : '');
        if (st.kind === 'update') td[5].className = 'hl';
      }
    });
    role('step').textContent = st.name;
    role('step-sub').textContent = st.sub;
    role('j').textContent = st.asg ? fmt(J(st.asg, st.C), 3) : '—';
    role('note').textContent = st.note;
  }
  steps(viz('steps'), ST.map(st => st.name), draw, 2);
});

QV.register('s1-mc10', function (q) {
  const { s, svg, axes, plot, slider, table, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  // slide 17 data centred on the mean (8, 8.5); variance uses n − 1 = 3, as on slide 15
  const RAW = [[4, 11], [8, 4], [13, 5], [7, 14]];
  const C = RAW.map(([a, b]) => [a - 8, b - 8.5]);
  const varAt = deg => { const t = deg * Math.PI / 180; return C.reduce((a, p) => a + (p[0] * Math.cos(t) + p[1] * Math.sin(t)) ** 2, 0) / 3; };
  const PC1 = 123.87, PC2 = 33.87, FAR = Math.atan2(-3.5, 5) * 180 / Math.PI + 180;

  const W = svg(viz('plot'), 760, 324, { label: 'Left: the four centred points, a line through the centre at angle theta and the projections onto it. Right: variance of the projections against theta', minWidth: 560 });
  const O = { x: 190, y: 156 }, U = 20, R = 7;
  const px = v => O.x + v * U, py = v => O.y - v * U;
  s('rect', { x: px(-R), y: py(R), width: 2 * R * U, height: 2 * R * U, class: 'f-none box' }, W);
  s('line', { x1: px(-R), x2: px(R), y1: O.y, y2: O.y, class: 'l-axis' }, W);
  s('line', { x1: O.x, x2: O.x, y1: py(-R), y2: py(R), class: 'l-axis' }, W);
  [-5, 0, 5].forEach(v => {
    s('text', { x: px(v), y: py(-R) + 14, 'text-anchor': 'middle', class: 't-sm' }, W, String(v));
    s('text', { x: px(-R) - 6, y: py(v), dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, W, String(v));
  });
  s('text', { x: px(R) - 4, y: O.y - 6, 'text-anchor': 'end', class: 't-sm' }, W, 'x₁ − 8');
  s('text', { x: O.x - 6, y: py(R) + 12, 'text-anchor': 'end', class: 't-sm' }, W, 'x₂ − 8.5');
  const lineG = s('g', {}, W);
  const LBL = [[-8, -4, 'end'], [8, 14, 'start'], [0, -12, 'middle'], [8, -6, 'start']];
  C.forEach((p, i) => {
    s('circle', { cx: px(p[0]), cy: py(p[1]), r: 6, class: 'f-ter sep' }, W);
    s('text', { x: px(p[0]) + LBL[i][0], y: py(p[1]) + LBL[i][1], 'text-anchor': LBL[i][2], class: 't-fg t-sm halo' }, W, `(${RAW[i][0]}, ${RAW[i][1]})`);
  });
  const projG = s('g', {}, W);

  const ax = axes(W, { x: 420, y: 24, w: 320, h: 230, xd: [0, 180], yd: [0, 35], xt: [0, 30, 60, 90, 120, 150, 180], yt: [0, 10, 20, 30], xf: v => v + '°', xl: 'θ, direction of the line', yl: 'variance of the projections' });
  plot(W, ax, varAt, 0, 180, 360, 's-pri');
  [['a', PC1, 0, -10, 'middle'], ['b', PC2, 0, 18, 'middle'], ['c', 0, 9, -8, 'start'], ['d', FAR, 7, -7, 'start']].forEach(([k, th, dx, dy, an]) => {
    const x = ax.x(th), y = ax.y(varAt(th));
    s('circle', { cx: x, cy: y, r: 4.5, class: 'f-fg' }, W);
    s('text', { x: x + dx, y: y + dy, 'text-anchor': an, class: 't-fg t-bold' }, W, k);
  });
  const curG = s('g', {}, W);

  table(viz('opts'), [{ text: 'Option', cls: 'l' }, { text: 'Direction', cls: 'l' }, 'θ', 'Variance'], [
    [{ text: 'a', cls: 'l' }, { text: 'PC1, maximum variance', cls: 'l' }, '123.9°', { text: varAt(PC1).toFixed(2), cls: 'hl' }],
    [{ text: 'b', cls: 'l' }, { text: 'PC2, minimum variance', cls: 'l' }, '33.9°', varAt(PC2).toFixed(2)],
    [{ text: 'c', cls: 'l' }, { text: 'x₁ axis', cls: 'l' }, '0°', varAt(0).toFixed(2)],
    [{ text: 'd', cls: 'l' }, { text: 'toward (13, 5), the farthest point', cls: 'l' }, FAR.toFixed(1) + '°', varAt(FAR).toFixed(2)],
  ]);

  slider(viz('slider'), { label: 'θ', min: 0, max: 179, step: 1, value: 124, fmt: v => v + '°' }, th => {
    const t = th * Math.PI / 180, u = [Math.cos(t), Math.sin(t)], v = varAt(th);
    const L = R / Math.max(Math.abs(u[0]), Math.abs(u[1]));
    lineG.textContent = '';
    projG.textContent = '';
    const sv = C.map(p => p[0] * u[0] + p[1] * u[1]);
    const lo = Math.min(...sv), hi = Math.max(...sv);
    s('line', { x1: px(-L * u[0]), y1: py(-L * u[1]), x2: px(L * u[0]), y2: py(L * u[1]), class: 's-pri', style: 'stroke-width: 2' }, lineG);
    s('line', { x1: px(lo * u[0]), y1: py(lo * u[1]), x2: px(hi * u[0]), y2: py(hi * u[1]), class: 's-sec', style: 'stroke-width: 9; opacity: 0.25; stroke-linecap: round' }, lineG);
    C.forEach((p, i) => {
      const f = [sv[i] * u[0], sv[i] * u[1]];
      s('line', { x1: px(p[0]), y1: py(p[1]), x2: px(f[0]), y2: py(f[1]), class: 's-muted dash', style: 'stroke-width: 1' }, projG);
      s('circle', { cx: px(f[0]), cy: py(f[1]), r: 4.5, class: 'f-sec' }, projG);
    });
    curG.textContent = '';
    s('line', { x1: ax.x(th), x2: ax.x(th), y1: ax.y(0), y2: ax.y(v), class: 's-fg dash', style: 'stroke-width: 1' }, curG);
    s('circle', { cx: ax.x(th), cy: ax.y(v), r: 6, class: 'f-pri sep' }, curG);
    role('th').textContent = th + '°';
    role('var').textContent = v.toFixed(2);
    role('share').textContent = (v / 37 * 100).toFixed(1) + '%';
    let msg;
    if (Math.abs(th - PC1) <= 1) msg = `θ = ${th}° is PC1 (123.9°). The projections are as spread out as they can be: variance <b>30.38</b> = λ₁, the largest eigenvalue. Option a.`;
    else if (Math.abs(th - PC2) <= 1) msg = `θ = ${th}° is PC2 (33.9°), perpendicular to PC1. The projections bunch up: variance <b>6.62</b> = λ₂, the minimum. That is option b.`;
    else if (th === 0) msg = 'θ = 0° is the x₁ axis, option c: variance <b>14.00</b> = Cov(X₁, X₁). The x₁ axis would be PC1 only if the data spread most along x₁.';
    else if (Math.abs(th - FAR) <= 1) msg = `θ = ${th}° points at (13, 5), the point farthest from the centre, option d. Variance <b>${v.toFixed(2)}</b>, less than the 30.38 of PC1.`;
    else msg = `Variance <b>${v.toFixed(2)}</b> at θ = ${th}°. PC1, at 123.9°, reaches 30.38.`;
    role('verdict').innerHTML = msg;
  });
});

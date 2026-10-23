QV.register('s5-mc1', function (q) {
  const { s, svg, axes, line, plot, grid, arrow, steps, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const num = v => (v < 0 ? '−' : '') + fmt(Math.abs(v));
  const par = v => (v < 0 ? `(${num(v)})` : num(v));
  const XS = [-2, -1, 0, 1, 2];
  const TH = [1, -1, 0.5, 0.5];
  const feats = x => [1, x, x * x, x * x * x];
  const H = XS.map(x => feats(x).reduce((a, v, j) => a + v * TH[j], 0));
  const sum = ts => ts.map((t, i) => (i ? (t < 0 ? ' − ' : ' + ') + fmt(Math.abs(t)) : num(t))).join('');

  // Figure 1: x → [1, x, x², x³] → Xθ
  const M = svg(viz('matrix'), 640, 236, { label: 'Five inputs x expanded into rows [1, x, x squared, x cubed], multiplied by theta to give h', minWidth: 540 });
  const C = 32, G = 2, Y0 = 50, RH = C + G;
  const COLF = ['f-seg', 'f-pri-soft', 'f-sec-soft', 'f-ter-soft'];
  const COLT = ['t-fg', 't-pri', 't-sec', 't-ter'];
  grid(M, { x: 20, y: Y0, data: XS.map(x => [x]), cell: C, gap: G, fill: () => 'f-seg', text: v => num(v) });
  s('text', { x: 20 + C / 2, y: Y0 - 10, 'text-anchor': 'middle', class: 't-fg t-bold' }, M, 'x');
  const midY = Y0 + (5 * C + 4 * G) / 2;
  arrow(M, 60, midY, 134, midY, { cls: 'a-muted' });
  s('text', { x: 97, y: midY - 22, 'text-anchor': 'middle', class: 't-sm' }, M, 'construct');
  s('text', { x: 97, y: midY - 10, 'text-anchor': 'middle', class: 't-sm' }, M, 'features');
  const XG = 144;
  grid(M, { x: XG, y: Y0, data: XS.map(feats), cell: C, gap: G, fill: (v, r, c) => COLF[c], text: v => num(v), textCls: (v, r, c) => COLT[c] });
  ['1', 'x', 'x²', 'x³'].forEach((t, c) => s('text', { x: XG + c * RH + C / 2, y: Y0 - 10, 'text-anchor': 'middle', class: COLT[c] + ' t-bold' }, M, t));
  s('text', { x: XG + 2 * RH - G / 2, y: Y0 - 28, 'text-anchor': 'middle', class: 't-fg t-bold' }, M, 'X');
  s('text', { x: 296, y: midY, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg' }, M, '×');
  const TX = 312, TY = Y0 + RH / 2;
  grid(M, { x: TX, y: TY, data: TH.map(v => [v]), cell: C, gap: G, fill: (v, r) => COLF[r], text: v => num(v), textCls: (v, r) => COLT[r] });
  s('text', { x: TX + C / 2, y: Y0 - 10, 'text-anchor': 'middle', class: 't-fg t-bold' }, M, 'θ');
  ['b', 'w₁', 'w₂', 'w₃'].forEach((t, r) => s('text', { x: TX + C + 6, y: TY + r * RH + C / 2, dy: '0.35em', class: COLT[r] }, M, t));
  s('text', { x: 382, y: midY, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg' }, M, '=');
  const HX = 400;
  const hg = grid(M, { x: HX, y: Y0, data: H.map(v => [v]), cell: C, gap: G, fill: () => 'f-ok-soft', text: v => num(v), textCls: () => 't-ok t-bold' });
  s('text', { x: HX + C / 2, y: Y0 - 10, 'text-anchor': 'middle', class: 't-ok t-bold' }, M, 'h');
  const sel = s('g', {}, M);
  const dot = s('g', {}, M);

  const note = role('row-note');
  steps(viz('rows'), XS.map(x => 'x = ' + num(x)), k => {
    const x = XS[k], f = feats(x), y = Y0 + k * RH;
    sel.textContent = '';
    s('rect', { x: 18, y: y - 2, width: C + 4, height: C + 4, rx: 3, class: 'f-none outline-pri' }, sel);
    s('rect', { x: XG - 2, y: y - 2, width: 4 * RH + 2, height: C + 4, rx: 3, class: 'f-none outline-pri' }, sel);
    s('rect', { x: HX - 2, y: y - 2, width: C + 4, height: C + 4, rx: 3, class: 'f-none outline-pri' }, sel);
    hg.rects.forEach((r, i) => r[0].setAttribute('class', (i === k ? 'f-ok' : 'f-ok-soft') + ' sep'));
    hg.texts.forEach((t, i) => t[0].setAttribute('class', i === k ? 't-on t-bold' : 't-ok t-bold'));
    dot.textContent = '';
    const DX = 470, DR = 606;
    s('text', { x: DX, y: Y0 + 8, class: 't-fg t-bold' }, dot, `row x = ${num(x)}`);
    const prods = f.map((v, j) => v * TH[j]);
    f.forEach((v, j) => {
      const yy = Y0 + 36 + j * 24;
      s('text', { x: DX, y: yy, class: COLT[j] }, dot, `${par(v)} × ${par(TH[j])}`);
      s('text', { x: DR, y: yy, 'text-anchor': 'end', class: COLT[j] + ' t-bold' }, dot, num(prods[j]));
    });
    s('line', { x1: DX, x2: DR, y1: Y0 + 126, y2: Y0 + 126, class: 's-muted' }, dot);
    s('text', { x: DX, y: Y0 + 146, class: 't-ok t-bold' }, dot, 'sum = h');
    s('text', { x: DR, y: Y0 + 146, 'text-anchor': 'end', class: 't-ok t-bold' }, dot, num(H[k]));
    note.textContent = `For x = ${num(x)}, h = ${sum(prods)} = ${num(H[k])}. Each feature value multiplies one weight and the products are added, so h is a linear function of b, w₁, w₂ and w₃, whatever the powers of x.`;
  }, 4);

  // Figure 2: h against x bends, h against w₂ is straight
  const D = svg(viz('dual'), 780, 282, { label: 'Left: h of x for the chosen w2, a cubic curve. Right: h at x = 0, 1 and 2 against w2, three straight lines', minWidth: 560 });
  const L = axes(D, { x: 50, y: 24, w: 290, h: 210, xd: [-2, 2], yd: [-6, 8], xt: [-2, -1, 0, 1, 2], yt: [-4, 0, 4, 8], xf: num, yf: num, xl: 'input x', yl: 'h(x)' });
  const R = axes(D, { x: 460, y: 24, w: 290, h: 210, xd: [-1, 1], yd: [-6, 8], xt: [-1, -0.5, 0, 0.5, 1], yt: [-4, 0, 4, 8], xf: num, yf: num, xl: 'weight w₂', yl: 'h at a fixed x' });
  const PROBES = [[0, 'ter'], [1, 'sec'], [2, 'pri']];
  const hx = (x, w) => 1 - x + w * x * x + 0.5 * x * x * x;
  PROBES.forEach(([x, c]) => line(D, [[R.x(-1), R.y(hx(x, -1))], [R.x(1), R.y(hx(x, 1))]], 's-' + c));
  const curve = s('path', { class: 's-fg', style: 'stroke-width: 2.5' }, D);
  const guide = s('line', { y1: R.y(-6), y2: R.y(8), class: 's-muted dash', style: 'stroke-width: 1' }, D);
  const dotsL = PROBES.map(([, c]) => s('circle', { r: 5, class: 'f-' + c }, D));
  const dotsR = PROBES.map(([, c]) => s('circle', { r: 5, class: 'f-' + c }, D));
  [[7, -8, 't-pri', 'x = 2, slope 4'], [1.5, -8, 't-sec', 'x = 1, slope 1'], [1, 16, 't-ter', 'x = 0, slope 0']]
    .forEach(([h, dy, c, l]) => s('text', { x: R.x(1) - 4, y: R.y(h) + dy, 'text-anchor': 'end', class: c + ' t-bold halo' }, D, l));

  slider(viz('slider'), { label: 'w₂', min: -1, max: 1, step: 0.1, value: 0.5, fmt: v => num(Math.round(v * 10) / 10) }, v => {
    const w = Math.round(v * 10) / 10;
    const pts = [];
    for (let i = 0; i <= 160; i++) { const x = -2 + i / 40; pts.push([L.x(x), L.y(hx(x, w))]); }
    curve.setAttribute('d', pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' '));
    guide.setAttribute('x1', R.x(w)); guide.setAttribute('x2', R.x(w));
    PROBES.forEach(([x], i) => {
      dotsL[i].setAttribute('cx', L.x(x)); dotsL[i].setAttribute('cy', L.y(hx(x, w)));
      dotsR[i].setAttribute('cx', R.x(w)); dotsR[i].setAttribute('cy', R.y(hx(x, w)));
    });
    role('w2').textContent = 'w₂ = ' + num(w);
    role('h2').textContent = num(hx(2, w));
    role('verdict').innerHTML = (w === 0
      ? 'With w₂ = 0 the x² feature is switched off and h(x) = 1 − x + 0.5x³.'
      : `At w₂ = ${num(w)} the curve h(x) still bends.`) +
      ' Each prediction moves on a straight line in w₂, and raising w₂ by 1 adds exactly x² to h(x), which is <b>4</b> at x = 2, <b>1</b> at x = 1 and <b>0</b> at x = 0.';
  });
});

QV.register('s5-mc2', function (q) {
  const { s, svg, axes, line, plot, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const num = v => (v < 0 ? '−' : '') + fmt(Math.abs(v));
  const g = z => 1 / (1 + Math.exp(-z));
  const tag = (G, x, y, k, ok) => {
    s('circle', { cx: x, cy: y, r: 9, class: ok ? 'f-ok' : 'f-surface box' }, G);
    s('text', { x, y, dy: '0.35em', 'text-anchor': 'middle', class: ok ? 't-on t-bold' : 't-fg t-bold' }, G, k);
  };

  // Figure 1: sigmoid and the plane, linked by z
  const W = svg(viz('contour'), 800, 356, { label: 'Sigmoid h = g(z) and the x1-x2 plane with the boundary x1 + x2 = 3, the wrong options and the contour for the chosen z', minWidth: 560 });
  const S = axes(W, { x: 50, y: 20, w: 330, h: 288, xd: [-7, 4], yd: [0, 1], xt: [-6, -4, -2, 0, 2, 4], yt: [0, 0.25, 0.5, 0.75, 1], xf: num, xl: 'z = −3 + x₁ + x₂', yl: 'h = g(z)' });
  s('line', { x1: S.x(-7), x2: S.x(4), y1: S.y(0.5), y2: S.y(0.5), class: 's-muted dash', style: 'stroke-width: 1' }, W);
  plot(W, S, g, -7, 4, 220, 's-fg');
  tag(W, S.x(0) + 18, S.y(0.5) + 18, 'a', true);
  tag(W, S.x(-2.5), S.y(g(-2.5)) - 20, 'b');
  tag(W, S.x(-6), S.y(g(-6)) - 20, 'c');
  const sMark = s('g', {}, W);

  const P = axes(W, { x: 476, y: 20, w: 288, h: 288, xd: [-4, 5], yd: [-4, 5], xt: [-3, 0, 3], yt: [-3, 0, 3], xf: num, yf: num, xl: 'x₁', yl: 'x₂', grid: false });
  const px = P.x, py = P.y;
  s('polygon', { points: [[-2, 5], [5, 5], [5, -2]].map(([a, b]) => `${px(a)},${py(b)}`).join(' '), class: 'f-pri-soft' }, W);
  s('line', { x1: px(-4), x2: px(5), y1: py(0), y2: py(0), class: 'l-grid' }, W);
  s('line', { x1: px(0), x2: px(0), y1: py(-4), y2: py(5), class: 'l-grid' }, W);
  const seg = c => {
    const a = Math.max(-4, c - 5), b = Math.min(5, c + 4);
    return a < b ? [[px(a), py(c - a)], [px(b), py(c - b)]] : null;
  };
  line(W, seg(0.5), 's-bad dash');
  line(W, seg(-3), 's-bad dash');
  s('circle', { cx: px(0), cy: py(0), r: Math.sqrt(3) * 32, class: 'f-none s-bad dash' }, W);
  line(W, seg(3), 's-ok');
  const contour = s('path', { class: 's-pri dash', style: 'stroke-width: 2' }, W);
  [[2.2, 2.4], [3.2, 1.6], [2.6, 3.4], [3.8, 2.6], [1.6, 3.2], [4.2, 0.9]].forEach(([a, b]) => s('circle', { cx: px(a), cy: py(b), r: 5, class: 'f-pri' }, W));
  [[0.5, 1.2], [1.3, 0.4], [0.7, 1.7], [1.7, 0.7], [1.1, 1.0]].forEach(([a, b]) => {
    const x = px(a), y = py(b);
    s('path', { d: `M${x - 4.5} ${y - 4.5} L${x + 4.5} ${y + 4.5} M${x - 4.5} ${y + 4.5} L${x + 4.5} ${y - 4.5}`, class: 's-sec', style: 'stroke-width: 2' }, W);
  });
  tag(W, px(4.4), py(-1.4), 'a', true);
  tag(W, px(-3.3), py(3.8), 'b');
  tag(W, px(-3.5), py(0.5), 'c');
  tag(W, px(Math.sqrt(3) * Math.cos(-Math.PI / 3)), py(Math.sqrt(3) * Math.sin(-Math.PI / 3)), 'd');
  s('text', { x: px(4.8), y: py(4.6), 'text-anchor': 'end', class: 't-pri t-bold' }, W, 'predict y = 1');
  s('text', { x: px(-3.8), y: py(-3.6), class: 't-sec t-bold' }, W, 'predict y = 0');

  slider(viz('slider'), { label: 'z', min: -7, max: 4, step: 0.5, value: 0, fmt: num }, z => {
    const h = g(z), hs = fmt(h, h < 0.01 ? 4 : 3);
    sMark.textContent = '';
    s('line', { x1: S.x(z), x2: S.x(z), y1: S.y(0), y2: S.y(h), class: 's-pri dash', style: 'stroke-width: 1.5' }, sMark);
    s('line', { x1: S.x(-7), x2: S.x(z), y1: S.y(h), y2: S.y(h), class: 's-pri dash', style: 'stroke-width: 1.5' }, sMark);
    s('circle', { cx: S.x(z), cy: S.y(h), r: 5.5, class: 'f-pri' }, sMark);
    const sg = seg(3 + z);
    contour.setAttribute('d', sg ? `M${sg[0][0]} ${sg[0][1]} L${sg[1][0]} ${sg[1][1]}` : 'M0 0');
    role('z').textContent = num(z);
    role('h').textContent = hs;
    role('line').textContent = 'x₁ + x₂ = ' + num(3 + z);
    let v;
    if (z === 0) v = 'z = 0 gives h = <b>0.5</b>. This contour is the line x₁ + x₂ = 3, the decision boundary, option a. Above it z &gt; 0 and the model predicts y = 1.';
    else if (z === -2.5) v = 'On x₁ + x₂ = 0.5 (option b) the model gives h = <b>0.076</b>, far below 0.5. Option b puts the 0.5 threshold on x₁ + x₂ instead of on h.';
    else if (z === -6) v = 'On x₁ + x₂ = −3 (option c) h = <b>0.0025</b>. That line flips the sign of θ₀.';
    else v = `Every line x₁ + x₂ = c is a contour where h has one value. Here h = <b>${hs}</b>. Only c = 3 gives h = 0.5.`;
    role('verdict').innerHTML = v;
  });

  // Figure 2: heat maps of h for linear and squared features
  const Hm = svg(viz('circle'), 660, 352, { label: 'Two heat maps of h over the plane: straight bands with the line x1 + x2 = 3, and rings with the circle x1 squared + x2 squared = 3', minWidth: 540 });
  const N = 28, CS = 9, DOM = 3.5, U = CS * N / (2 * DOM);
  [
    { x0: 40, z: (a, b) => -3 + a + b, t1: 'features [1, x₁, x₂]', t2: 'θ = [−3, 1, 1]', cap: 'boundary x₁ + x₂ = 3, a line' },
    { x0: 370, z: (a, b) => -3 + a * a + b * b, t1: 'features [1, x₁, x₂, x₁², x₂²]', t2: 'θ = [−3, 0, 0, 1, 1]', cap: 'boundary x₁² + x₂² = 3, a circle' },
  ].forEach((p, pi) => {
    const y0 = 52, cx = v => p.x0 + (v + DOM) * U, cy = v => y0 + (DOM - v) * U;
    s('text', { x: p.x0, y: 18, class: 't-fg t-bold' }, Hm, p.t1);
    s('text', { x: p.x0, y: 36, class: 't-fg' }, Hm, p.t2);
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const a = -DOM + (c + 0.5) * CS / U, b = DOM - (r + 0.5) * CS / U;
        const h = g(p.z(a, b));
        s('rect', { x: p.x0 + c * CS, y: y0 + r * CS, width: CS, height: CS, class: h >= 0.5 ? 'f-pri' : 'f-sec', style: `opacity: ${(0.08 + 0.6 * Math.abs(2 * h - 1)).toFixed(3)}; shape-rendering: crispEdges` }, Hm);
      }
    }
    s('rect', { x: p.x0, y: y0, width: N * CS, height: N * CS, class: 'f-none box' }, Hm);
    s('line', { x1: cx(-DOM), x2: cx(DOM), y1: cy(0), y2: cy(0), class: 's-line' }, Hm);
    s('line', { x1: cx(0), x2: cx(0), y1: cy(-DOM), y2: cy(DOM), class: 's-line' }, Hm);
    if (pi === 0) line(Hm, [[cx(-0.5), cy(3.5)], [cx(3.5), cy(-0.5)]], 's-fg');
    else s('circle', { cx: cx(0), cy: cy(0), r: Math.sqrt(3) * U, class: 'f-none s-fg', style: 'stroke-width: 2' }, Hm);
    [-3, 0, 3].forEach(v => {
      s('text', { x: cx(v), y: y0 + N * CS + 16, 'text-anchor': 'middle' }, Hm, num(v));
      s('text', { x: p.x0 - 6, y: cy(v), dy: '0.35em', 'text-anchor': 'end' }, Hm, num(v));
    });
    s('text', { x: p.x0 + N * CS / 2, y: y0 + N * CS + 36, 'text-anchor': 'middle', class: 't-fg t-bold' }, Hm, p.cap);
  });
});

QV.register('s5-mc3', function (q) {
  const { s, svg, box, steps, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: the confusion matrix and what each metric reads
  const M = svg(viz('matrix'), 560, 276, { label: 'Confusion matrix of a cancer screening test with TP, FN, FP and TN; recall uses the actual-cancer row, precision the test-positive column', minWidth: 500 });
  const X0 = 170, Y0 = 62, CW = 170, CH = 84, GP = 4;
  s('text', { x: X0 + CW + GP / 2, y: 18, 'text-anchor': 'middle', class: 't-sm' }, M, 'what the test says');
  s('text', { x: X0 + CW / 2, y: 44, 'text-anchor': 'middle', class: 't-fg t-bold' }, M, 'positive');
  s('text', { x: X0 + CW * 1.5 + GP, y: 44, 'text-anchor': 'middle', class: 't-fg t-bold' }, M, 'negative');
  s('text', { x: X0 - 12, y: Y0 + CH / 2 - 7, 'text-anchor': 'end', class: 't-fg t-bold' }, M, 'has cancer');
  s('text', { x: X0 - 12, y: Y0 + CH / 2 + 9, 'text-anchor': 'end', class: 't-sm' }, M, 'actual positive');
  s('text', { x: X0 - 12, y: Y0 + CH * 1.5 + GP - 7, 'text-anchor': 'end', class: 't-fg t-bold' }, M, 'healthy');
  s('text', { x: X0 - 12, y: Y0 + CH * 1.5 + GP + 9, 'text-anchor': 'end', class: 't-sm' }, M, 'actual negative');
  const CELLS = [
    [0, 0, 'TP', ['cancer found'], 'f-ok-soft', 't-ok'],
    [0, 1, 'FN', ['cancer missed', 'can be fatal'], 'f-bad-soft', 't-bad'],
    [1, 0, 'FP', ['false alarm', 'costs an extra test'], 'f-ter-soft', 't-ter'],
    [1, 1, 'TN', ['healthy, cleared'], 'f-seg', 't-fg'],
  ];
  const groups = CELLS.map(([r, c, code, lines, fill, tc]) => {
    const G = s('g', { class: 'fade' }, M);
    const x = X0 + c * (CW + GP), y = Y0 + r * (CH + GP);
    s('rect', { x, y, width: CW, height: CH, rx: 4, class: fill }, G);
    const top = y + CH / 2 - lines.length * 8;
    s('text', { x: x + CW / 2, y: top, dy: '0.35em', 'text-anchor': 'middle', class: tc + ' t-bold t-lg' }, G, code);
    lines.forEach((l, i) => s('text', { x: x + CW / 2, y: top + 18 + i * 15, dy: '0.35em', 'text-anchor': 'middle', class: i ? tc : 't-fg' }, G, l));
    return { G, r, c };
  });
  const hl = s('g', {}, M);
  const note = role('note');
  steps(viz('pick'), ['Recall', 'Precision'], k => {
    hl.textContent = '';
    groups.forEach(({ G, r, c }) => G.classList.toggle('dim', k === 0 ? r !== 0 : c !== 0));
    if (k === 0) {
      s('rect', { x: X0 - 4, y: Y0 - 4, width: 2 * CW + GP + 8, height: CH + 8, rx: 6, class: 'f-none outline-pri' }, hl);
      s('text', { x: X0, y: 262, class: 't-pri t-bold t-lg' }, hl, 'Recall = TP / (TP + FN)');
      note.innerHTML = 'Recall reads the has-cancer row only. Its slide question is "Of all the real positives out there, how many did the model actually catch?" Every missed cancer adds to FN and pulls recall down, so recall guards against the dangerous error.';
    } else {
      s('rect', { x: X0 - 4, y: Y0 - 4, width: CW + 8, height: 2 * CH + GP + 8, rx: 6, class: 'f-none outline-sec' }, hl);
      s('text', { x: X0, y: 262, class: 't-sec t-bold t-lg' }, hl, 'Precision = TP / (TP + FP)');
      note.innerHTML = 'Precision reads the positive column only. Its slide question is "Of all the alarms the model raised, how many were real?" A missed cancer never enters this column, so a test can miss many cancers and still have high precision.';
    }
  });

  // Figure 2: a threshold on the test score
  const CAN = [33, 44, 52, 58, 63, 67, 72, 78, 86, 93];
  const HEA = [4, 8, 11, 14, 17, 19, 22, 24, 26, 28, 31, 34, 36, 38, 41, 43, 46, 49, 51, 54, 57, 61, 64, 69, 76, 83];
  const T = svg(viz('strip'), 760, 200, { label: 'Test scores of 10 cancer patients and 26 healthy patients with a movable threshold', minWidth: 560 });
  const sx = v => 120 + v * 6.1;
  const RY = [62, 118];
  const region = s('rect', { y: 30, height: 116, class: 'f-pri-soft' }, T);
  s('text', { x: 0, y: RY[0], dy: '0.35em', class: 't-fg t-bold' }, T, 'cancer (10)');
  s('text', { x: 0, y: RY[1], dy: '0.35em', class: 't-fg t-bold' }, T, 'healthy (26)');
  s('line', { x1: sx(0), x2: sx(100), y1: 150, y2: 150, class: 'l-axis' }, T);
  [0, 20, 40, 60, 80, 100].forEach(v => {
    s('line', { x1: sx(v), x2: sx(v), y1: 150, y2: 155, class: 'l-axis' }, T);
    s('text', { x: sx(v), y: 168, 'text-anchor': 'middle' }, T, String(v));
  });
  s('text', { x: sx(50), y: 190, 'text-anchor': 'middle' }, T, 'test score');
  const thr = s('line', { y1: 26, y2: 150, class: 's-pri', style: 'stroke-width: 2' }, T);
  const labL = s('text', { y: 20, 'text-anchor': 'end', class: 't-fg' }, T, 'sent home');
  const labR = s('text', { y: 20, class: 't-pri t-bold' }, T, 'biopsy');
  const dots = [...CAN.map(v => [v, 0]), ...HEA.map(v => [v, 1])].map(([v, r]) => ({ v, r, el: s('circle', { cx: sx(v), cy: RY[r], r: 6 }, T) }));

  slider(viz('slider'), { label: 'threshold', min: 20, max: 95, step: 5, value: 60 }, t => {
    region.setAttribute('x', sx(t)); region.setAttribute('width', sx(100) - sx(t));
    thr.setAttribute('x1', sx(t)); thr.setAttribute('x2', sx(t));
    labL.setAttribute('x', sx(t) - 8); labR.setAttribute('x', sx(t) + 8);
    dots.forEach(d => {
      const pos = d.v >= t;
      d.el.setAttribute('class', d.r === 0 ? (pos ? 'f-ok' : 'f-bad') : (pos ? 'f-ter' : 'f-seg box'));
    });
    const tp = CAN.filter(v => v >= t).length, fn = CAN.length - tp, fp = HEA.filter(v => v >= t).length;
    const rec = fmt(tp / (tp + fn), 3), prec = tp + fp ? fmt(tp / (tp + fp), 3) : 'undefined';
    role('fn').textContent = fn;
    role('fp').textContent = fp;
    role('rec').textContent = rec;
    role('prec').textContent = prec;
    let v;
    if (fn === 0) v = `At threshold ${t} every cancer is caught, so recall = <b>1</b>. The price is ${fp} false alarms, and precision falls to <b>${prec}</b>. A false alarm costs an extra test, so screening accepts this trade.`;
    else if (tp === 0) v = `At threshold ${t} no cancer is caught at all. Recall = <b>0</b> and all ${fn} patients with cancer are sent home.`;
    else v = `At threshold ${t}, ${fn} patient${fn > 1 ? 's' : ''} with cancer ${fn > 1 ? 'are' : 'is'} sent home. Recall = ${tp}/${tp + fn} = <b>${rec}</b>. Precision is <b>${prec}</b>, and it does not see those missed cancers.`;
    role('verdict').innerHTML = v;
  });
});

QV.register('s5-mc4', function (q) {
  const { s, svg, axes, steps, table, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const A = [25, 50000];
  const PTS = [['B', 45, 51000, 'No'], ['C', 26, 60000, 'Yes'], ['D', 52, 48500, 'No'], ['E', 55, 52000, 'No'], ['F', 30, 63000, 'Yes'], ['G', 21, 58000, 'Yes'], ['H', 35, 70000, 'Yes'], ['I', 58, 66000, 'No']]
    .map(([n, a, sal, c]) => ({ n, a, sal, c, raw: Math.hypot(a - A[0], sal - A[1]), sc: Math.hypot((a - A[0]) / 40, (sal - A[1]) / 40000) }));
  const big = (v, d) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  // Figure 1: neighbours of A with raw and scaled distances
  const P = svg(viz('plot'), 740, 410, { label: 'Age against salary with query A; in raw units the 3 nearest neighbours lie in a flat salary band, after scaling in a circle', minWidth: 560 });
  const ax = axes(P, { x: 80, y: 24, w: 340, h: 340, xd: [10, 60], yd: [30000, 80000], xt: [10, 20, 30, 40, 50, 60], yt: [30000, 40000, 50000, 60000, 70000, 80000], yf: v => v / 1000 + 'k', xl: 'age (years)', yl: 'salary' });
  const hood = s('g', {}, P);
  const links = s('g', {}, P);
  PTS.forEach(p => {
    const x = ax.x(p.a), y = ax.y(p.sal);
    if (p.c === 'Yes') s('circle', { cx: x, cy: y, r: 6, class: 'f-pri' }, P);
    else s('rect', { x: x - 5.5, y: y - 5.5, width: 11, height: 11, class: 'f-sec' }, P);
    s('text', { x: x + 9, y: y - 7, class: 't-fg t-bold' }, P, p.n);
  });
  s('circle', { cx: ax.x(A[0]), cy: ax.y(A[1]), r: 7, class: 'f-surface s-fg', style: 'stroke-width: 2.5' }, P);
  s('text', { x: ax.x(A[0]) - 12, y: ax.y(A[1]) + 4, 'text-anchor': 'end', class: 't-fg t-bold' }, P, 'A');
  const notes = s('g', {}, P);

  const tbl = table(viz('table'), ['Point', 'Age', 'Salary', 'Class', 'Raw distance', 'Scaled distance'].map((t, i) => ({ text: t, cls: i < 1 || i === 3 ? 'l' : '' })),
    PTS.map(p => [{ text: p.n, cls: 'l' }, String(p.a), big(p.sal, 0), { text: p.c, cls: 'l' }, big(p.raw, 1), p.sc.toFixed(4)]));

  steps(viz('mode'), ['Raw units', 'Min-max scaled'], k => {
    const key = k === 0 ? 'raw' : 'sc';
    const order = PTS.slice().sort((a, b) => a[key] - b[key]);
    const nn = order.slice(0, 3), r = nn[2][key];
    const yes = nn.filter(p => p.c === 'Yes').length;
    hood.textContent = ''; links.textContent = ''; notes.textContent = '';
    const cx = ax.x(A[0]), cy = ax.y(A[1]);
    if (k === 0) {
      const y1 = ax.y(A[1] + r), y2 = ax.y(A[1] - r);
      s('rect', { x: ax.x(10), y: y1, width: ax.x(60) - ax.x(10), height: y2 - y1, class: 'area-pri' }, hood);
      [y1, y2].forEach(y => s('line', { x1: ax.x(10), x2: ax.x(60), y1: y, y2: y, class: 's-pri dash', style: 'stroke-width: 1' }, hood));
    } else {
      const rp = ax.x(10 + r * 40) - ax.x(10);
      s('circle', { cx, cy, r: rp, class: 'area-pri' }, hood);
      s('circle', { cx, cy, r: rp, class: 'f-none s-pri dash', style: 'stroke-width: 1' }, hood);
    }
    nn.forEach(p => s('line', { x1: cx, y1: cy, x2: ax.x(p.a), y2: ax.y(p.sal), class: 's-pri', style: 'stroke-width: 1.5' }, links));
    const L = k === 0
      ? [['Raw units', 't-fg t-bold'], [`3rd neighbour E at d = ${big(r, 1)}`, 't-pri'], ['A circle of that radius would be', 't-fg'], ['4,000 years wide and 4,000 dollars', 't-fg'], ['tall. On this plot it is a flat band.', 't-fg'], ['', ''], ['E is 30 years older than A and', 't-fg'], ['still one of its 3 nearest points.', 't-fg'], ['Age has almost no say.', 't-sec t-bold']]
      : [['Min-max scaled', 't-fg t-bold'], [`3rd neighbour F at d = ${r.toFixed(4)}`, 't-pri'], [`That radius is ${r.toFixed(4)} × 40 = 13.9 years`, 't-fg'], [`and ${r.toFixed(4)} × 40,000 = 13,928 dollars,`, 't-fg'], ['the same length on this plot.', 't-fg'], ['', ''], ['Each feature now spans 0 to 1,', 't-fg'], ['so age and salary count equally.', 't-fg'], ['The 3 nearest are all young.', 't-pri t-bold']];
    L.forEach(([t, c], i) => { if (t) s('text', { x: 450, y: 48 + i * 20, class: c }, notes, t); });
    tbl.rows.forEach((row, i) => {
      row.classList.toggle('on', nn.indexOf(PTS[i]) >= 0);
      row.children[4].className = k === 0 ? 'hl' : '';
      row.children[5].className = k === 1 ? 'hl' : '';
    });
    role('nn').textContent = nn.map(p => p.n).join(', ');
    role('vote').textContent = `${yes} Yes : ${3 - yes} No`;
    role('pred').textContent = yes >= 2 ? 'Yes' : 'No';
    role('verdict').innerHTML = k === 0
      ? 'In raw units the 3 nearest are <b>B, D and E</b>, all with a salary within 2,000 of A, although B, D and E are 20 to 30 years older. The vote is 3 No.'
      : 'After Min-Max scaling the 3 nearest are <b>G, C and F</b>, close to A in age and in salary. The vote flips to 3 Yes. Scaling changed the prediction.';
  });

  // Figure 2: share of d² from each feature
  const B = svg(viz('share'), 720, 196, { label: 'Share of the squared distance from age and from salary, for A-B and A-C, raw and scaled', minWidth: 560 });
  const BX = 110, BW = 360;
  [
    ['A–B raw', 400, 1e6, 'Δage² = 20² = 400 · Δsalary² = 1,000² = 1,000,000', 'age 0.04% · d = 1,000.2'],
    ['A–C raw', 1, 1e8, 'Δage² = 1² = 1 · Δsalary² = 10,000² = 100,000,000', 'age 0.000001% · d = 10,000'],
    ['A–B scaled', 0.25, 0.000625, 'Δage² = 0.5² = 0.25 · Δsalary² = 0.025² = 0.000625', 'age 99.75% · d = 0.5006'],
    ['A–C scaled', 0.000625, 0.0625, 'Δage² = 0.025² = 0.000625 · Δsalary² = 0.25² = 0.0625', 'age 0.99% · d = 0.2512'],
  ].forEach(([name, a2, s2, sub, right], i) => {
    const y = 8 + i * 46 + (i >= 2 ? 6 : 0), wa = BW * a2 / (a2 + s2);
    s('text', { x: 0, y: y + 10, dy: '0.35em', class: 't-fg t-bold' }, B, name);
    s('rect', { x: BX, y, width: BW, height: 20, class: 'f-sec' }, B);
    s('rect', { x: BX, y, width: wa, height: 20, class: 'f-pri' }, B);
    s('text', { x: BX + BW + 10, y: y + 10, dy: '0.35em', class: wa > BW / 2 ? 't-pri t-bold' : 't-sec t-bold' }, B, right);
    s('text', { x: BX, y: y + 34, class: 't-sm' }, B, sub);
  });
  s('line', { x1: 0, x2: 720, y1: 99, y2: 99, class: 's-line' }, B);
});

QV.register('s5-mc5', function (q) {
  const { s, svg, axes, plot, steps, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const E = p => (p <= 0 || p >= 1) ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
  const term = p => (p <= 0 ? 0 : -p * Math.log2(p));
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const frac = (a, n) => (a === 0 ? '0' : a === n ? '1' : `${a / gcd(a, n)}/${n / gcd(a, n)}`);
  const NODES = [[4, 0, '4 Yes · 0 No'], [3, 1, '3 Yes · 1 No'], [2, 2, '2 Yes · 2 No'], [5, 2, '5 Yes · 2 No, slide 26'], [3, 2, '3 Yes · 2 No, slide 27']];

  // Figure 1: the node and its point on the entropy curve
  const W = svg(viz('curve'), 720, 292, { label: 'A node of Yes and No examples and its point on the binary entropy curve', minWidth: 560 });
  s('rect', { x: 10, y: 34, width: 210, height: 150, rx: 8, class: 'f-surface box' }, W);
  s('text', { x: 115, y: 22, 'text-anchor': 'middle', class: 't-fg t-bold' }, W, 'the node');
  const balls = s('g', {}, W);
  const fr = s('g', {}, W);
  s('circle', { cx: 30, cy: 262, r: 6, class: 'f-pri' }, W);
  s('text', { x: 42, y: 262, dy: '0.35em', class: 't-fg' }, W, 'Yes');
  s('circle', { cx: 92, cy: 262, r: 6, class: 'f-sec' }, W);
  s('text', { x: 104, y: 262, dy: '0.35em', class: 't-fg' }, W, 'No');
  const ax = axes(W, { x: 300, y: 20, w: 400, h: 222, xd: [0, 1], yd: [0, 1.1], xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 0.25, 0.5, 0.75, 1], xl: 'p(Yes), share of Yes in the node', yl: 'entropy E (bits)' });
  plot(W, ax, E, 0, 1, 300, 's-pri');
  NODES.forEach(([a, b]) => s('circle', { cx: ax.x(a / (a + b)), cy: ax.y(E(a / (a + b))), r: 3.5, class: 'f-muted' }, W));
  const mark = s('g', {}, W);

  const note = role('note');
  steps(viz('nodes'), NODES.map(n => n[2]), k => {
    const [a, b] = NODES[k], n = a + b, p = a / n, e = E(p);
    balls.textContent = ''; fr.textContent = ''; mark.textContent = '';
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / 4), c = i % 4;
      s('circle', { cx: 52 + c * 42, cy: 109 - (Math.ceil(n / 4) - 1) * 21 + r * 42, r: 15, class: i < a ? 'f-pri' : 'f-sec' }, balls);
    }
    s('text', { x: 115, y: 210, 'text-anchor': 'middle', class: 't-pri t-bold' }, fr, `p(Yes) = ${frac(a, n)}`);
    s('text', { x: 115, y: 230, 'text-anchor': 'middle', class: 't-sec t-bold' }, fr, `p(No) = ${frac(b, n)}`);
    const x = ax.x(p), y = ax.y(e);
    s('line', { x1: x, x2: x, y1: ax.y(0), y2: y, class: 's-pri dash', style: 'stroke-width: 1' }, mark);
    s('line', { x1: ax.x(0), x2: x, y1: y, y2: y, class: 's-pri dash', style: 'stroke-width: 1' }, mark);
    s('circle', { cx: x, cy: y, r: 6, class: 'f-pri' }, mark);
    const lab = p === 1 ? { x: x - 10, y: y - 12, a: 'end' } : p === 0.5 ? { x, y: y - 12, a: 'middle' } : { x: x - 10, y: y + 18, a: 'end' };
    s('text', { x: lab.x, y: lab.y, 'text-anchor': lab.a, class: 't-pri t-bold halo' }, mark, `E = ${fmt(e, 3)}`);
    const t1 = fmt(term(a / n), 3), t2 = fmt(term(b / n), 3);
    let txt;
    if (b === 0) txt = `${a} Yes, 0 No: the node is pure. E = −1 · log₂ 1 − 0 = 0, taking 0 log 0 = 0. "When purity is 100%, we make it a leaf node."`;
    else txt = `${a} Yes, ${b} No: E = −(${frac(a, n)}) log₂(${frac(a, n)}) − (${frac(b, n)}) log₂(${frac(b, n)}) = ${t1} + ${t2} = ${fmt(e, 3)}.`;
    if (k === 1) txt += ' This is the node in the question, option c.';
    if (k === 2) txt += ' The maximum, option d.';
    if (k === 3) txt += ' Slide 26 rounds this to 0.85.';
    if (k === 4) txt += ' Slide 27 rounds this to 0.966. Both slide nodes are less pure than 3:1.';
    note.textContent = txt;
  }, 1);

  // Figure 2: the two terms of the 3:1 node against the options
  const T = svg(viz('terms'), 700, 196, { label: 'Stacked bar: Yes term 0.311 plus No term 0.5 equals 0.811, with options a to d on the scale', minWidth: 540 });
  const bx = v => 50 + v * 600;
  const t1 = term(0.75), t2 = term(0.25);
  s('text', { x: bx(t1 / 2), y: 26, 'text-anchor': 'middle', class: 't-pri' }, T, '−(3/4) log₂(3/4)');
  s('text', { x: bx(t1 + t2 / 2), y: 26, 'text-anchor': 'middle', class: 't-sec' }, T, '−(1/4) log₂(1/4)');
  s('rect', { x: bx(0), y: 36, width: bx(t1) - bx(0), height: 34, class: 'f-pri sep' }, T);
  s('rect', { x: bx(t1), y: 36, width: bx(t1 + t2) - bx(t1), height: 34, class: 'f-sec sep' }, T);
  s('text', { x: bx(t1 / 2), y: 53, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, T, 'Yes term ' + fmt(t1, 3));
  s('text', { x: bx(t1 + t2 / 2), y: 53, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, T, 'No term ' + fmt(t2, 3));
  s('text', { x: bx(t1 + t2) + 8, y: 53, dy: '0.35em', class: 't-ok t-bold' }, T, '= ' + fmt(t1 + t2, 3));
  s('line', { x1: bx(1), x2: bx(1), y1: 30, y2: 96, class: 's-muted dash', style: 'stroke-width: 1' }, T);
  s('line', { x1: bx(0), x2: bx(1), y1: 96, y2: 96, class: 'l-axis' }, T);
  [0, 0.25, 0.5, 0.75, 1].forEach(v => {
    s('line', { x1: bx(v), x2: bx(v), y1: 96, y2: 101, class: 'l-axis' }, T);
    s('text', { x: bx(v), y: 114, 'text-anchor': 'middle' }, T, fmt(v));
  });
  [['a', 0.25, 'p(No) alone'], ['b', 0.5, 'No term only'], ['c', t1 + t2, 'the sum'], ['d', 1, '50/50 node']].forEach(([k, v, lab]) => {
    const ok = k === 'c';
    s('line', { x1: bx(v), x2: bx(v), y1: 120, y2: 142, class: 's-line' }, T);
    s('circle', { cx: bx(v), cy: 152, r: 10, class: ok ? 'f-ok' : 'f-surface box' }, T);
    s('text', { x: bx(v), y: 152, dy: '0.35em', 'text-anchor': 'middle', class: ok ? 't-on t-bold' : 't-fg t-bold' }, T, k);
    s('text', { x: bx(v), y: 180, 'text-anchor': 'middle', class: ok ? 't-ok t-bold' : 't-fg' }, T, lab);
  });
});

QV.register('s5-mc6', function (q) {
  const { s, svg, axes, line, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const num = v => (v < 0 ? '−' : '') + fmt(Math.abs(v));
  const w = [0.6, 0.8], b = -5;

  // Figure 1: the point between L, L1 and L2
  const P = svg(viz('plane'), 460, 336, { label: 'Hyperplane L with margin lines L1 and L2, training points, and a y = +1 point whose slack is drawn to L1', minWidth: 420 });
  const U = 40, px = x => 30 + x * U, py = y => 16 + (7 - y) * U;
  const clip = c => {
    const pts = [];
    [[0, c / 0.8], [10, (c - 6) / 0.8], [c / 0.6, 0], [(c - 5.6) / 0.6, 7]].forEach(([x, y]) => {
      if (x >= -1e-9 && x <= 10 + 1e-9 && y >= -1e-9 && y <= 7 + 1e-9 && !pts.some(p => Math.abs(p[0] - x) < 1e-6 && Math.abs(p[1] - y) < 1e-6)) pts.push([x, y]);
    });
    pts.sort((p, q2) => p[0] - q2[0]);
    return [pts[0], pts[pts.length - 1]].map(([x, y]) => [px(x), py(y)]);
  };
  s('polygon', { points: [[0, 5], [0, 7], [2 / 3, 7], [10, 0], [20 / 3, 0]].map(([x, y]) => `${px(x)},${py(y)}`).join(' '), class: 'f-seg' }, P);
  s('rect', { x: px(0), y: py(7), width: 10 * U, height: 7 * U, class: 'f-none box' }, P);
  line(P, clip(4), 's-sec dash');
  line(P, clip(6), 's-pri dash');
  line(P, clip(5), 's-fg');
  [[20 / 3, 'L2', '−1', 't-sec'], [25 / 3, 'L', '0', 't-fg'], [10, 'L1', '+1', 't-pri']].forEach(([x, n, v, c]) => {
    s('text', { x: px(x), y: py(0) + 16, 'text-anchor': 'middle', class: c + ' t-bold' }, P, n);
    s('text', { x: px(x), y: py(0) + 30, 'text-anchor': 'middle', class: c }, P, v);
  });
  [[7, 5], [8, 3], [7.5, 3.8], [6, 3], [9, 5.5], [8.8, 1.6]].forEach(([x, y]) => s('circle', { cx: px(x), cy: py(y), r: 6, class: 'f-pri' }, P));
  [[1, 2], [2, 1], [2, 3.5], [0.8, 4], [3, 0.8], [0.6, 0.6]].forEach(([x, y]) => s('rect', { x: px(x) - 5.5, y: py(y) - 5.5, width: 11, height: 11, class: 'f-sec' }, P));
  s('text', { x: px(9.8), y: py(6.6), 'text-anchor': 'end', class: 't-pri t-bold' }, P, 'y = +1 side');
  s('text', { x: px(0.2), y: py(0.25), class: 't-sec t-bold' }, P, 'y = −1 side');
  const dyn = s('g', {}, P);

  // Figure 2: the hinge
  const Hg = svg(viz('hinge'), 700, 300, { label: 'Slack max(0, 1 - y(w.x + b)) against y(w.x + b), with zones and options a to d', minWidth: 540 });
  const box = { x: 60, y: 30, w: 600, h: 220 };
  const hx = v => box.x + (v + 1.5) / 4 * box.w, hy = v => box.y + (2.5 - v) / 3.5 * box.h;
  [[-1.5, 0, 'f-bad-soft', 't-bad', 'misclassified', 'ζ > 1'], [0, 1, 'f-ter-soft', 't-ter', 'inside margin', '0 < ζ ≤ 1'], [1, 2.5, 'f-ok-soft', 't-ok', 'beyond margin', 'ζ = 0']].forEach(([a, c, f, t, l1, l2]) => {
    s('rect', { x: hx(a), y: hy(2.5), width: hx(c) - hx(a), height: hy(0) - hy(2.5), class: f }, Hg);
    s('text', { x: (hx(a) + hx(c)) / 2, y: hy(2.5) + 16, 'text-anchor': 'middle', class: t + ' t-bold' }, Hg, l1);
    s('text', { x: (hx(a) + hx(c)) / 2, y: hy(2.5) + 30, 'text-anchor': 'middle', class: t }, Hg, l2);
  });
  s('rect', { x: hx(-1.5), y: hy(0), width: box.w, height: hy(-1) - hy(0), class: 'f-seg' }, Hg);
  const ax = axes(Hg, { x: box.x, y: box.y, w: box.w, h: box.h, xd: [-1.5, 2.5], yd: [-1, 2.5], xt: [-1, 0, 1, 2], yt: [-0.5, 0, 0.5, 1, 1.5, 2], xf: num, yf: num, xl: 'y(w·x + b)', yl: 'slack ζ', grid: false });
  s('line', { x1: hx(-1.5), x2: hx(2.5), y1: hy(0), y2: hy(0), class: 'l-axis' }, Hg);
  line(Hg, [[hx(-1.5), hy(2.5)], [hx(1), hy(0)], [hx(2.5), hy(0)]], 's-pri');
  const opt = (k, m, z, lab, where) => {
    const ok = k === 'a', x = hx(m), y = hy(z);
    s('circle', { cx: x, cy: y, r: 9, class: ok ? 'f-ok' : 'f-surface box' }, Hg);
    s('text', { x, y, dy: '0.35em', 'text-anchor': 'middle', class: ok ? 't-on t-bold' : 't-fg t-bold' }, Hg, k);
    const pos = where === 'up' ? { x: x + 12, y: y - 12, a: 'start' } : where === 'top' ? { x, y: y - 16, a: 'middle' } : { x: x + 14, y: y + 4, a: 'start' };
    s('text', { x: pos.x, y: pos.y, 'text-anchor': pos.a, class: (ok ? 't-ok' : 't-fg') + ' t-bold halo' }, Hg, lab);
  };
  opt('a', 0.5, 0.5, 'a, ζ = 0.5', 'up');
  opt('b', 1.75, 0, 'b, ζ = 0 needs y(w·x + b) ≥ 1', 'top');
  opt('c', -0.5, 1.5, 'c, ζ = 1.5 at y(w·x + b) = −0.5', 'up');
  opt('d', 0.5, -0.5, 'd, ζ = −0.5 never happens', 'right');
  const hm = s('g', {}, Hg);

  slider(viz('slider'), { label: 'y(w·x + b)', min: -1.5, max: 2, step: 0.1, value: 0.5, fmt: v => num(Math.round(v * 10) / 10) }, v => {
    const f = Math.round(v * 10) / 10, z = Math.max(0, Math.round((1 - f) * 10) / 10);
    const at = t => [4.6 + t * w[0], 2.8 + t * w[1]];
    const [x, y] = at(f);
    dyn.textContent = '';
    if (z > 0) {
      const [ex, ey] = at(1);
      const ox = 0.8 * 20, oy = 0.6 * 20, tk = (X, Y) => s('line', { x1: X - ox * 0.35, y1: Y - oy * 0.35, x2: X + ox * 0.35, y2: Y + oy * 0.35, class: 's-bad', style: 'stroke-width: 2' }, dyn);
      s('line', { x1: px(x), y1: py(y), x2: px(ex), y2: py(ey), class: 's-bad dash', style: 'stroke-width: 1.5' }, dyn);
      s('line', { x1: px(x) + ox, y1: py(y) + oy, x2: px(ex) + ox, y2: py(ey) + oy, class: 's-bad', style: 'stroke-width: 3' }, dyn);
      tk(px(x) + ox, py(y) + oy); tk(px(ex) + ox, py(ey) + oy);
      s('circle', { cx: px(ex), cy: py(ey), r: 3, class: 'f-bad' }, dyn);
      const [mx, my] = at((f + 1) / 2);
      s('text', { x: px(mx) - 14, y: py(my) - 8, 'text-anchor': 'end', class: 't-bad t-bold halo' }, dyn, 'ζ = ' + fmt(z));
    } else {
      s('text', { x: px(x) - 14, y: py(y) - 10, 'text-anchor': 'end', class: 't-ok t-bold halo' }, dyn, 'ζ = 0');
    }
    s('circle', { cx: px(x), cy: py(y), r: 10, class: 'f-none s-fg', style: 'stroke-width: 1.5' }, dyn);
    s('circle', { cx: px(x), cy: py(y), r: 5.5, class: 'f-pri' }, dyn);
    hm.textContent = '';
    s('circle', { cx: hx(f), cy: hy(z), r: 13, class: 'f-none s-fg', style: 'stroke-width: 1.5' }, hm);
    s('circle', { cx: hx(f), cy: hy(z), r: 4, class: 'f-fg' }, hm);

    const zone = f > 1 ? 'beyond L1' : f === 1 ? 'on L1' : f > 0 ? 'inside margin' : f === 0 ? 'on L' : 'wrong side of L';
    role('m').textContent = num(f);
    role('zeta').textContent = fmt(z);
    role('zone').textContent = zone;
    let t;
    if (f === 0.5) t = 'y(w·x + b) = 0.5, so ζ = max(0, 1 − 0.5) = <b>0.5</b>. The point is on its correct side of L but has not reached L1, so it is inside the margin. That is option a.';
    else if (f >= 1) t = `y(w·x + b) = ${num(f)} ≥ 1, so 1 − y(w·x + b) = ${num(Math.round((1 - f) * 10) / 10)} and the max gives ζ = <b>0</b>. The point is ${f === 1 ? 'on' : 'beyond'} its margin line L1. This is the case option b describes.`;
    else if (f > 0) t = `ζ = 1 − ${num(f)} = <b>${fmt(z)}</b>. The point is on the correct side of L but inside the margin, so 0 &lt; ζ ≤ 1.`;
    else if (f === 0) t = 'The point is on the hyperplane L, so ζ = <b>1</b>, the border between inside the margin and misclassified.';
    else t = `The point is on the wrong side of L, misclassified, and ζ = 1 − (${num(f)}) = <b>${fmt(z)}</b> &gt; 1.` + (f === -0.5 ? ' That is the value of option c.' : '');
    role('verdict').innerHTML = t;
  });
});

QV.register('s5-mc7', function (q) {
  const { s, svg, arrow, line, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const num = v => (v < 0 ? '−' : '') + fmt(Math.abs(v));
  const MU = 50, SD = 10;
  const tag = (G, x, y, k, ok) => {
    s('circle', { cx: x, cy: y, r: 9, class: ok ? 'f-ok' : 'f-surface box' }, G);
    s('text', { x, y, dy: '0.35em', 'text-anchor': 'middle', class: ok ? 't-on t-bold' : 't-fg t-bold' }, G, k);
  };

  // Figure 1: the bell curve with x and z axes
  const W = svg(viz('bell'), 760, 270, { label: 'Normal curve with mean 50 and sd 10, z-score row under the x axis, outlier bands beyond z = plus or minus 3', minWidth: 560 });
  const xs = v => 60 + (v - 5) * 660 / 90, base = 200, top = 52;
  const pdf = v => Math.exp(-0.5 * ((v - MU) / SD) ** 2);
  [[5, 20, 12.5], [80, 95, 87.5]].forEach(([a, c, m]) => {
    s('rect', { x: xs(a), y: 40, width: xs(c) - xs(a), height: base - 40, class: 'f-bad-soft' }, W);
    s('text', { x: xs(m), y: 58, 'text-anchor': 'middle', class: 't-bad t-bold' }, W, '|z| > 3');
    s('text', { x: xs(m), y: 72, 'text-anchor': 'middle', class: 't-bad' }, W, 'outlier');
  });
  const pts = [];
  for (let i = 0; i <= 360; i++) { const v = 5 + i / 4; pts.push([xs(v), base - (base - top) * pdf(v)]); }
  line(W, pts, 's-fg');
  s('line', { x1: xs(50), x2: xs(50), y1: top, y2: base, class: 's-muted dash', style: 'stroke-width: 1' }, W);
  const ys1 = base - (base - top) * pdf(60);
  arrow(W, xs(50), ys1, xs(60), ys1, { cls: 'a-muted', head: 6 });
  s('text', { x: (xs(50) + xs(60)) / 2, y: ys1 + 15, 'text-anchor': 'middle', class: 't-fg' }, W, 'σ = 10');
  s('line', { x1: xs(5), x2: xs(95), y1: base, y2: base, class: 'l-axis' }, W);
  s('text', { x: 46, y: base + 16, 'text-anchor': 'end', class: 't-fg t-bold' }, W, 'x');
  s('text', { x: 46, y: base + 34, 'text-anchor': 'end', class: 't-pri t-bold' }, W, 'z');
  for (let v = 10; v <= 90; v += 10) {
    s('line', { x1: xs(v), x2: xs(v), y1: base, y2: base + 5, class: 'l-axis' }, W);
    s('text', { x: xs(v), y: base + 16, 'text-anchor': 'middle' }, W, String(v));
    s('text', { x: xs(v), y: base + 34, 'text-anchor': 'middle', class: (Math.abs(v - MU) / SD > 3 ? 't-bad' : 't-pri') }, W, num((v - MU) / SD));
  }
  s('text', { x: xs(50), y: base + 56, 'text-anchor': 'middle' }, W, 'μ = 50, σ = 10, z = (x − μ) / σ');
  tag(W, xs(52), 24, 'a');
  tag(W, xs(70), 24, 'd', true);
  tag(W, xs(85), 24, 'c');
  s('text', { x: xs(5), y: 24, dy: '0.35em', class: 't-fg' }, W, 'b, z = 20, would sit at x = 250');
  const mk = s('g', {}, W);

  slider(viz('slider'), { label: 'x', min: 10, max: 95, step: 1, value: 70 }, x => {
    const z = (x - MU) / SD, out = Math.abs(z) > 3;
    mk.textContent = '';
    const y = base - (base - top) * pdf(x);
    s('line', { x1: xs(x), x2: xs(x), y1: base, y2: y, class: 's-pri', style: 'stroke-width: 2' }, mk);
    s('circle', { cx: xs(x), cy: y, r: 6, class: 'f-pri' }, mk);
    const right = x < 78;
    s('text', { x: xs(x) + (right ? 10 : -10), y: Math.min(y - 8, base - 24), 'text-anchor': right ? 'start' : 'end', class: 't-pri t-bold halo' }, mk, `x = ${x}, z = ${num(z)}`);
    role('dx').textContent = num(x - MU);
    role('z').textContent = num(z);
    const fl = role('flag');
    fl.textContent = out ? 'yes' : 'no';
    fl.className = 'v ' + (out ? 'ter' : 'ok');
    let v;
    if (x === 70) v = 'x = 70 is 20 above the mean, which is <b>2</b> standard deviations. |z| = 2 is not above 3, so the rule keeps it. That is option d.';
    else if (x === 85) v = 'z = (85 − 50)/10 = <b>3.5</b> &gt; 3, so x = 85 is flagged. Option c gives this z, but it belongs to x = 85, not to x = 70.';
    else if (x === 52) v = 'z = 0.2 belongs to x = 52, almost at the mean. Option a gets 0.2 for x = 70 by dividing 20 by σ² = 100.';
    else if (Math.abs(z) === 3) v = `|z| = 3 exactly. The rule flags |z| &gt; 3, so x = ${x} is kept.`;
    else v = `z = (${x} − 50)/10 = <b>${num(z)}</b>. ` + (out ? 'That is beyond 3, so the rule flags it as an outlier.' : 'That is within ±3, so the rule keeps it.');
    role('verdict').innerHTML = v;
  });

  // Figure 2: three number lines, x, x − μ, z
  const M = svg(viz('map'), 720, 256, { label: 'Three number lines: x from 0 to 100, x minus mu from -50 to 50, z from -5 to 5; the value 70 lines up with 20 and 2', minWidth: 560 });
  const LX0 = 180, LX1 = 700, lx = (v, a, c) => LX0 + (v - a) / (c - a) * (LX1 - LX0);
  const ROWS = [
    { y: 52, a: 0, c: 100, step: 10, t1: 'x', t2: 'the raw value', val: 70, lab: 'x = 70' },
    { y: 128, a: -50, c: 50, step: 10, t1: 'x − μ', t2: 'subtract μ = 50', val: 20, lab: 'x − μ = 20 (option b)' },
    { y: 204, a: -5, c: 5, step: 1, t1: 'z = (x − μ) / σ', t2: 'divide by σ = 10', val: 2, lab: 'z = 2 (option d)' },
  ];
  s('line', { x1: lx(70, 0, 100), x2: lx(70, 0, 100), y1: 58, y2: 198, class: 's-pri dash', style: 'stroke-width: 1' }, M);
  ROWS.forEach((r, i) => {
    const cut = 3 * (r.c - r.a) / 10;
    s('rect', { x: LX0, y: r.y - 4, width: lx(r.a + (r.c - r.a) / 2 - cut, r.a, r.c) - LX0, height: 8, class: 'f-bad-soft' }, M);
    s('rect', { x: lx(r.a + (r.c - r.a) / 2 + cut, r.a, r.c), y: r.y - 4, width: LX1 - lx(r.a + (r.c - r.a) / 2 + cut, r.a, r.c), height: 8, class: 'f-bad-soft' }, M);
    s('line', { x1: LX0, x2: LX1, y1: r.y, y2: r.y, class: 'l-axis' }, M);
    for (let v = r.a; v <= r.c + 1e-9; v += r.step) {
      const far = Math.abs(v - (r.a + r.c) / 2) > cut + 1e-9;
      s('line', { x1: lx(v, r.a, r.c), x2: lx(v, r.a, r.c), y1: r.y - 4, y2: r.y + 4, class: far ? 's-bad' : 'l-axis', style: far ? 'stroke-width: 1' : null }, M);
      s('text', { x: lx(v, r.a, r.c), y: r.y + 18, 'text-anchor': 'middle', class: 't-sm' }, M, num(v));
    }
    s('text', { x: 0, y: r.y - 4, class: 't-fg t-bold' }, M, r.t1);
    s('text', { x: 0, y: r.y + 12, class: 't-sm' }, M, r.t2);
    s('circle', { cx: lx(r.val, r.a, r.c), cy: r.y, r: 6, class: 'f-pri' }, M);
    s('text', { x: lx(r.val, r.a, r.c) - 10, y: r.y - 10, 'text-anchor': 'end', class: 't-pri t-bold halo' }, M, r.lab);
    if (i === 2) {
      tag(M, lx(0.2, -5, 5), r.y + 40, 'a');
      tag(M, lx(3.5, -5, 5), r.y + 40, 'c');
      s('text', { x: lx(0.2, -5, 5) + 14, y: r.y + 40, dy: '0.35em', class: 't-fg' }, M, 'z = 0.2');
      s('text', { x: lx(3.5, -5, 5) + 14, y: r.y + 40, dy: '0.35em', class: 't-fg' }, M, 'z = 3.5');
      s('text', { x: lx(4.25, -5, 5), y: r.y - 13, 'text-anchor': 'middle', class: 't-bad t-bold' }, M, '|z| > 3');
    }
  });
});

QV.register('s5-mc8', function (q) {
  const { s, svg, axes, arrow, steps, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const X = [[1.2, 1.5], [2.1, 1.1], [2.8, 1.9], [1.6, 2.6], [2.4, 2.9], [1.0, 2.2], [3.0, 2.5], [2.0, 1.8],
    [7.2, 2.4], [8.1, 2.0], [8.9, 2.8], [7.6, 3.5], [8.4, 3.9], [7.0, 3.1], [9.1, 3.4], [8.2, 2.9],
    [4.2, 7.4], [5.1, 7.0], [5.9, 7.8], [4.6, 8.6], [5.4, 8.9], [4.0, 8.1], [6.1, 8.5], [5.0, 7.9]];
  const d2 = (p, c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2;
  const near = (p, C) => C.reduce((bi, c, i) => (d2(p, c) < d2(p, C[bi]) ? i : bi), 0);
  const kmeans = init => {
    let C = init.map(i => X[i].slice());
    const hist = [C];
    for (let it = 0; it < 50; it++) {
      const lab = X.map(p => near(p, C));
      const N = C.map((c, k) => {
        const m = X.filter((p, i) => lab[i] === k);
        return m.length ? [m.reduce((a, p) => a + p[0], 0) / m.length, m.reduce((a, p) => a + p[1], 0) / m.length] : c;
      });
      if (N.every((c, k) => Math.abs(c[0] - C[k][0]) < 1e-12 && Math.abs(c[1] - C[k][1]) < 1e-12)) break;
      C = N; hist.push(C);
    }
    const lab = X.map(p => near(p, C));
    return { hist, lab, cost: X.reduce((a, p, i) => a + d2(p, C[lab[i]]), 0) };
  };
  const RUNS = [
    { name: 'Random start 1', init: [1, 4, 20], col: ['pri', 'sec', 'ter'], start: 'random' },
    { name: 'Random start 2', init: [8, 16, 17], col: ['pri', 'sec', 'ter'], start: 'random' },
    { name: 'K-Means++ start', init: [16, 10, 2], col: ['ter', 'sec', 'pri'], start: 'K-Means++' },
  ].map(r => Object.assign(r, kmeans(r.init)));

  // Figure 1: three runs on the same points
  const W = svg(viz('runs'), 720, 390, { label: 'K-Means on 24 points from three starts: starting centroids, their paths and the final clusters, with the final cost of each run', minWidth: 560 });
  const ax = axes(W, { x: 40, y: 16, w: 340, h: 340, xd: [0, 10], yd: [0, 10], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6, 8, 10] });
  const layer = s('g', {}, W);
  const bars = RUNS.map((r, i) => {
    const G = s('g', { class: 'fade' }, W), y = 60 + i * 52;
    s('text', { x: 430, y, class: 't-fg t-bold' }, G, r.name);
    const wd = r.cost / 180 * 230;
    s('rect', { x: 430, y: y + 8, width: wd, height: 18, rx: 2, class: r.cost < 100 ? 'f-ok' : 'f-bad' }, G);
    s('text', { x: 430 + wd + 8, y: y + 17, dy: '0.35em', class: (r.cost < 100 ? 't-ok' : 't-bad') + ' t-bold' }, G, r.cost.toFixed(2));
    return G;
  });
  s('text', { x: 430, y: 30, class: 't-fg t-bold' }, W, 'final cost, lower is better');
  [['254 of the 2,024 possible random starts', 't-fg'], ['end in a bad local minimum (12.5%).', 't-fg'], ['', ''], ['A start with one centroid per group:', 't-fg'], ['random 25.3%, K-Means++ 89.2%.', 't-pri t-bold']]
    .forEach(([t, c], i) => { if (t) s('text', { x: 430, y: 236 + i * 18, class: c }, W, t); });

  steps(viz('runs-steps'), RUNS.map(r => r.name), k => {
    const r = RUNS[k];
    layer.textContent = '';
    X.forEach((p, i) => s('circle', { cx: ax.x(p[0]), cy: ax.y(p[1]), r: 4.5, class: 'f-' + r.col[r.lab[i]] }, layer));
    r.init.forEach((pi, c) => {
      const path = r.hist.map(C => C[c]);
      for (let j = 1; j < path.length; j++) {
        const [a, b] = [path[j - 1], path[j]];
        if (Math.hypot(ax.x(b[0]) - ax.x(a[0]), ax.y(b[1]) - ax.y(a[1])) > 6) arrow(layer, ax.x(a[0]), ax.y(a[1]), ax.x(b[0]), ax.y(b[1]), { cls: 'a-muted', head: 7 });
      }
      const p0 = path[0];
      s('circle', { cx: ax.x(p0[0]), cy: ax.y(p0[1]), r: 9, class: 'f-none s-fg', style: 'stroke-width: 2' }, layer);
      if (r.start === 'K-Means++') s('text', { x: ax.x(p0[0]) + 12, y: ax.y(p0[1]) - 8, class: 't-fg t-bold halo' }, layer, String(c + 1));
      const f = path[path.length - 1], fx = ax.x(f[0]), fy = ax.y(f[1]);
      s('path', { d: `M${fx} ${fy - 10} L${fx + 10} ${fy} L${fx} ${fy + 10} L${fx - 10} ${fy} Z`, class: 'f-fg' }, layer);
      s('path', { d: `M${fx} ${fy - 7} L${fx + 7} ${fy} L${fx} ${fy + 7} L${fx - 7} ${fy} Z`, class: 'f-' + r.col[c] }, layer);
    });
    bars.forEach((G, i) => G.classList.toggle('dim', i !== k));
    role('start').textContent = r.start;
    role('iters').textContent = r.hist.length - 1;
    const cv = role('cost');
    cv.textContent = r.cost.toFixed(2);
    cv.className = 'v' + (r.cost < 100 ? ' ok' : '');
    role('verdict').innerHTML = [
      'Two starting centroids land in the bottom-left group, but the first update pulls one of them toward the bottom-right group. After 2 updates each group has its own centroid, cost <b>19.60</b>.',
      'Two starting centroids land in the top group. The bottom centroid takes both bottom groups and stops between them, and the top group is split in two. No single update can fix this, so K-Means stops at cost <b>166.45</b>, 8.5 times the best cost.',
      'K-Means++ takes a random first centroid (1) in the top group. Far points are likely picks, so centroid 2 lands at the bottom right and centroid 3 at the bottom left. One update reaches the best clusters, cost <b>19.60</b>.',
    ][k];
  });

  // Figure 2: D(x)² probabilities on the slide example
  const PTS = [['A', 1, 2], ['B', 2, 1], ['C', 5, 4], ['D', 6, 5], ['E', 9, 8]];
  const Dg = svg(viz('dsq'), 720, 268, { label: 'Slide example points A to E with chosen centroids, and the K-Means++ probability of each point being the next centroid', minWidth: 560 });
  const bx = axes(Dg, { x: 34, y: 16, w: 250, h: 225, xd: [0, 10], yd: [0, 9], xt: [0, 5, 10], yt: [0, 3, 6, 9] });
  const dl = s('g', {}, Dg);
  s('text', { x: 350, y: 18, class: 't-fg t-bold' }, Dg, 'D²');
  s('text', { x: 430, y: 18, class: 't-fg t-bold' }, Dg, 'probability D² / ΣD²');
  const rows = PTS.map(([n], i) => {
    const y = 44 + i * 40;
    s('text', { x: 320, y: y + 9, dy: '0.35em', class: 't-fg t-bold' }, Dg, n);
    return { y, d: s('text', { x: 350, y: y + 9, dy: '0.35em', class: 't-fg' }, Dg), bar: s('rect', { x: 430, y, height: 18, rx: 2, class: 'f-pri' }, Dg), v: s('text', { y: y + 9, dy: '0.35em', class: 't-pri t-bold' }, Dg) };
  });
  const sumT = s('text', { x: 350, y: 254, class: 't-fg' }, Dg);
  const dnote = role('dsq-note');
  steps(viz('dsq-steps'), ['Pick 2', 'Pick 3'], k => {
    const cents = k === 0 ? [0] : [0, 4];
    const D = PTS.map(p => Math.min(...cents.map(c => d2([p[1], p[2]], [PTS[c][1], PTS[c][2]]))));
    const S = D.reduce((a, v) => a + v, 0);
    dl.textContent = '';
    PTS.forEach((p, i) => {
      const c = cents.reduce((bi, ci) => (d2([p[1], p[2]], [PTS[ci][1], PTS[ci][2]]) < d2([p[1], p[2]], [PTS[bi][1], PTS[bi][2]]) ? ci : bi), cents[0]);
      if (D[i] > 0) s('line', { x1: bx.x(p[1]), y1: bx.y(p[2]), x2: bx.x(PTS[c][1]), y2: bx.y(PTS[c][2]), class: 's-muted dash', style: 'stroke-width: 1' }, dl);
    });
    PTS.forEach(([n, x, y], i) => {
      const isC = cents.indexOf(i) >= 0;
      if (isC) s('circle', { cx: bx.x(x), cy: bx.y(y), r: 10, class: 'f-none s-fg', style: 'stroke-width: 2' }, dl);
      s('circle', { cx: bx.x(x), cy: bx.y(y), r: 5, class: isC ? 'f-fg' : 'f-pri' }, dl);
      const lab = isC ? `${n} = C${['₁', '₂'][cents.indexOf(i)]}` : `${n} (${x}, ${y})`;
      const left = x > 7;
      s('text', { x: bx.x(x) + (left ? -14 : 14), y: bx.y(y) + 4, 'text-anchor': left ? 'end' : 'start', class: 't-fg t-bold halo' }, dl, lab);
    });
    rows.forEach((r, i) => {
      const p = D[i] / S, w = p * 200;
      r.d.textContent = String(D[i]);
      r.bar.setAttribute('width', w);
      r.v.setAttribute('x', 430 + w + 8);
      r.v.textContent = D[i] ? `${D[i]}/${S} = ${fmt(p, 3)}` : '0, already a centroid';
      r.v.setAttribute('class', D[i] ? 't-pri t-bold' : 't-muted');
    });
    sumT.textContent = `ΣD² = ${S}`;
    dnote.textContent = k === 0
      ? 'C₁ = A. D² is the squared distance to A: B 2, C 20, D 34, E 100, sum 156. The farthest point E gets probability 100/156 = 0.641, and slide 23 takes C₂ = E.'
      : 'With C₁ = A and C₂ = E each point uses its nearest centroid: B 2 and C 20 to A, D 18 to E. The sum is 40, so C gets 0.5, D 0.45 and B 0.05. Slide 23: the next centroid will likely be C(5,4) or D(6,5).';
  });
});

QV.register('s5-mc9', function (q) {
  const { s, svg, axes, steps, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const NC = 125, NR = 80, PITCH = 4, CELL = 3, GY = 26;
  const spread = (n, mul, add, skip) => {
    const out = [];
    for (let k = 0; out.length < n; k++) {
      const i = (k * mul + add) % 10000;
      if (out.indexOf(i) < 0 && skip.indexOf(i) < 0) out.push(i);
    }
    return out;
  };
  const FRAUD = spread(20, 7919, 1237, []);
  const FP = spread(24, 3571, 2711, FRAUD);
  const MODELS = [
    { tp: 0, fn: 20, fp: 0, tn: 9980, acc: '99.8%', rec: '0', recSub: '0 / 20 frauds caught', prec: 'undefined', precSub: '0 / 0, no fraud predicted' },
    { tp: 16, fn: 4, fp: 24, tn: 9956, acc: '99.72%', rec: '0.8', recSub: '16 / 20 frauds caught', prec: '0.4', precSub: '16 / 40 flags are fraud' },
  ];

  // Figure 1: one square per transaction and the confusion matrix
  const W = svg(viz('grid'), 780, 352, { label: '10,000 squares, one per transaction, with the 20 frauds ringed, and the confusion matrix of the chosen model', minWidth: 560 });
  s('text', { x: 0, y: 14, class: 't-fg t-bold' }, W, '10,000 transactions, one square each');
  const pid = QV.uid('s5mc9-cells');
  const pat = s('pattern', { id: pid, x: 0, y: GY, width: PITCH, height: PITCH, patternUnits: 'userSpaceOnUse' }, s('defs', {}, W));
  s('rect', { width: CELL, height: CELL, class: 'f-muted', style: 'opacity: 0.35' }, pat);
  s('rect', { x: 0, y: GY, width: NC * PITCH, height: NR * PITCH, fill: `url(#${pid})` }, W);
  const cellAt = i => [(i % NC) * PITCH, GY + Math.floor(i / NC) * PITCH];
  const fpEls = FP.map(i => { const [x, y] = cellAt(i); return s('rect', { x, y, width: CELL, height: CELL }, W); });
  const frEls = FRAUD.map(i => {
    const [x, y] = cellAt(i);
    return { cell: s('rect', { x, y, width: CELL, height: CELL }, W), ring: s('circle', { cx: x + CELL / 2, cy: y + CELL / 2, r: 6, class: 'f-none', style: 'stroke-width: 1.4' }, W) };
  });
  const MX = 604, MY = 72, MW = 84, MH = 58;
  s('text', { x: MX + MW + 2, y: 40, 'text-anchor': 'middle', class: 't-fg t-bold' }, W, 'confusion matrix');
  s('text', { x: MX + MW / 2, y: 62, 'text-anchor': 'middle', class: 't-fg' }, W, 'pred. fraud');
  s('text', { x: MX + MW * 1.5 + 4, y: 62, 'text-anchor': 'middle', class: 't-fg' }, W, 'pred. normal');
  s('text', { x: MX - 8, y: MY + MH / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-fg' }, W, 'fraud');
  s('text', { x: MX - 8, y: MY + MH * 1.5 + 4, dy: '0.35em', 'text-anchor': 'end', class: 't-fg' }, W, 'normal');
  s('text', { x: MX - 8, y: 62, 'text-anchor': 'end', class: 't-sm' }, W, 'actual');
  const mc = [['tp', 0, 0, 'TP', 'f-ok-soft', 't-ok'], ['fn', 0, 1, 'FN', 'f-bad-soft', 't-bad'], ['fp', 1, 0, 'FP', 'f-ter-soft', 't-ter'], ['tn', 1, 1, 'TN', 'f-seg', 't-fg']].map(([key, r, c, code, f, t]) => {
    const x = MX + c * (MW + 4), y = MY + r * (MH + 4);
    s('rect', { x, y, width: MW, height: MH, rx: 4, class: f }, W);
    s('text', { x: x + MW / 2, y: y + 18, 'text-anchor': 'middle', class: t + ' t-sm' }, W, code);
    return { key, el: s('text', { x: x + MW / 2, y: y + 38, 'text-anchor': 'middle', class: t + ' t-bold t-lg' }, W) };
  });
  const FX = MX - 60, CH = 6.6;
  const formula = [s('text', { x: FX, y: 220, class: 't-fg' }, W), s('text', { x: FX + 9 * CH, y: 240, class: 't-fg t-bold' }, W), s('text', { x: FX, y: 270, class: 't-pri' }, W), s('text', { x: FX + 7 * CH, y: 290, class: 't-pri t-bold' }, W)];

  steps(viz('model'), ['Always "Normal"', 'Example detector'], k => {
    const m = MODELS[k];
    fpEls.forEach(el => {
      el.setAttribute('class', k ? 'f-ter' : 'f-none');
    });
    frEls.forEach((e, i) => {
      const caught = k === 1 && i < 16;
      e.cell.setAttribute('class', caught ? 'f-ok' : 'f-bad');
      e.ring.setAttribute('class', 'f-none ' + (caught ? 's-ok' : 's-bad'));
    });
    mc.forEach(c => { c.el.textContent = m[c.key].toLocaleString('en-US'); });
    formula[0].textContent = `accuracy = (${m.tp} + ${m.tn.toLocaleString('en-US')}) / 10,000`;
    formula[1].textContent = `= ${m.acc}`;
    formula[2].textContent = `recall = ${m.tp} / (${m.tp} + ${m.fn})`;
    formula[3].textContent = `= ${m.rec}`;
    role('acc').textContent = m.acc;
    role('rec').textContent = m.rec;
    role('rec-sub').textContent = m.recSub;
    role('prec').textContent = m.prec;
    role('prec-sub').textContent = m.precSub;
    role('verdict').innerHTML = k === 0
      ? 'Every transaction is labelled Normal. The model is right 9,980 times, so accuracy is <b>99.8%</b>. It catches none of the 20 frauds, so fraud recall is <b>0</b>.'
      : 'The detector flags 40 transactions. 16 are frauds (TP) and 24 are normal (FP), and 4 frauds slip through (FN). Accuracy drops to <b>99.72%</b>, but recall rises from 0 to <b>0.8</b>.';
  });

  // Figure 2: four metrics for both models
  const B = svg(viz('bars'), 700, 252, { label: 'Accuracy, precision, recall and F1 for the always-Normal model and the example detector', minWidth: 540 });
  const ax = axes(B, { x: 60, y: 24, w: 620, h: 180, xd: [0, 4], yd: [0, 110], xt: [], yt: [0, 25, 50, 75, 100], yf: v => v + '%' });
  const MET = [['Accuracy', 99.8, 99.72], ['Precision', null, 40], ['Recall', 0, 80], ['F1', null, 53.3]];
  MET.forEach(([name, a, d], i) => {
    const cx = ax.x(i + 0.5);
    s('text', { x: cx, y: 222, 'text-anchor': 'middle', class: 't-fg t-bold' }, B, name);
    [[a, -27, 'sec'], [d, 27, 'pri']].forEach(([v, off, c]) => {
      const x = cx + off;
      if (v == null) {
        s('text', { x: x + 4, y: ax.y(0) - 6, transform: `rotate(-90 ${x + 4} ${ax.y(0) - 6})`, class: 't-sec' }, B, 'undefined, 0/0');
        return;
      }
      s('rect', { x: x - 22, y: ax.y(v), width: 44, height: ax.y(0) - ax.y(v), class: 'f-' + c }, B);
      s('text', { x, y: ax.y(v) - 6, 'text-anchor': 'middle', class: 't-' + c + ' t-bold' }, B, fmt(v, 2) + '%');
    });
  });
});

QV.register('s5-mc10', function (q) {
  const { s, svg, axes, plot, line, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const PTS = [[-4, 2.5, '(4, 11)'], [0, -4.5, '(8, 4)'], [5, -3.5, '(13, 5)'], [-1, 5.5, '(7, 14)']];
  const vr = deg => { const t = deg * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t); return 14 * c * c - 22 * sn * c + 23 * sn * sn; };
  const L1 = (37 + Math.sqrt(565)) / 2, L2 = (37 - Math.sqrt(565)) / 2;
  const PC1 = Math.atan2(0.8303, -0.5574) * 180 / Math.PI, PC2 = PC1 - 90;

  // Figure 1: projections on a direction and the variance curve
  const W = svg(viz('proj'), 800, 322, { label: 'Centred slide-17 points with a direction and the projections onto it, and the variance of the projections against the angle', minWidth: 560 });
  const U = 20, cx0 = 175, cy0 = 161, px = x => cx0 + x * U, py = y => cy0 - y * U;
  s('rect', { x: px(-7.25), y: py(7.25), width: 14.5 * U, height: 14.5 * U, class: 'f-none box' }, W);
  s('line', { x1: px(-7.25), x2: px(7.25), y1: py(0), y2: py(0), class: 'l-grid' }, W);
  s('line', { x1: px(0), x2: px(0), y1: py(-7.25), y2: py(7.25), class: 'l-grid' }, W);
  s('text', { x: px(7), y: py(0) - 6, 'text-anchor': 'end', class: 't-sm' }, W, 'X₁');
  s('text', { x: px(0) + 6, y: py(7) + 4, class: 't-sm' }, W, 'X₂');
  const dirLine = (deg, len) => { const t = deg * Math.PI / 180; return [[px(-len * Math.cos(t)), py(-len * Math.sin(t))], [px(len * Math.cos(t)), py(len * Math.sin(t))]]; };
  const proj = s('g', {}, W);
  line(W, dirLine(PC1, 7), 's-ok dash');
  line(W, dirLine(PC2, 7), 's-sec dash');
  const t1 = PC1 * Math.PI / 180, t2 = PC2 * Math.PI / 180;
  s('text', { x: px(6.4 * Math.cos(t1)) + 8, y: py(6.4 * Math.sin(t1)), class: 't-ok t-bold' }, W, 'PC1');
  s('text', { x: px(6.4 * Math.cos(t2)), y: py(6.4 * Math.sin(t2)) - 10, 'text-anchor': 'middle', class: 't-sec t-bold' }, W, 'PC2');
  PTS.forEach(([x, y, lab]) => {
    s('circle', { cx: px(x), cy: py(y), r: 5, class: 'f-fg' }, W);
    s('text', { x: px(x) + 9, y: py(y) - 8, class: 't-fg halo' }, W, lab);
  });

  const ax = axes(W, { x: 420, y: 20, w: 350, h: 250, xd: [0, 180], yd: [0, 35], xt: [0, 45, 90, 135, 180], yt: [0, 10, 20, 30], xf: v => v + '°', xl: 'direction angle θ (degrees)', yl: 'variance of the projections' });
  plot(W, ax, vr, 0, 180, 360, 's-pri');
  s('circle', { cx: ax.x(PC1), cy: ax.y(L1), r: 5, class: 'f-ok' }, W);
  s('text', { x: ax.x(PC1), y: ax.y(L1) - 12, 'text-anchor': 'middle', class: 't-ok t-bold' }, W, `λ₁ = ${L1.toFixed(2)}, PC1`);
  s('circle', { cx: ax.x(PC2), cy: ax.y(L2), r: 5, class: 'f-sec' }, W);
  s('text', { x: ax.x(PC2), y: ax.y(L2) + 20, 'text-anchor': 'middle', class: 't-sec t-bold' }, W, `λ₂ = ${L2.toFixed(2)}, PC2`);
  s('text', { x: ax.x(0) + 6, y: ax.y(14) - 10, class: 't-fg' }, W, '14 = Cov(X₁, X₁)');
  s('text', { x: ax.x(90) - 6, y: ax.y(23) - 10, 'text-anchor': 'end', class: 't-fg' }, W, '23 = Cov(X₂, X₂)');
  const mk = s('g', {}, W);

  slider(viz('slider'), { label: 'θ', min: 0, max: 179, step: 1, value: 124, fmt: v => v + '°' }, deg => {
    const t = deg * Math.PI / 180, u = [Math.cos(t), Math.sin(t)], v = vr(deg);
    proj.textContent = '';
    line(proj, dirLine(deg, 7.2), 's-pri');
    PTS.forEach(([x, y]) => {
      const d = x * u[0] + y * u[1], fx = d * u[0], fy = d * u[1];
      s('line', { x1: px(x), y1: py(y), x2: px(fx), y2: py(fy), class: 's-muted dash', style: 'stroke-width: 1' }, proj);
      s('circle', { cx: px(fx), cy: py(fy), r: 4, class: 'f-pri' }, proj);
    });
    mk.textContent = '';
    s('line', { x1: ax.x(deg), x2: ax.x(deg), y1: ax.y(0), y2: ax.y(v), class: 's-pri dash', style: 'stroke-width: 1' }, mk);
    s('circle', { cx: ax.x(deg), cy: ax.y(v), r: 5.5, class: 'f-pri' }, mk);
    role('var').textContent = v.toFixed(2);
    role('share').textContent = (v / 37 * 100).toFixed(1) + '%';
    let txt;
    if (Math.abs(deg - PC1) < 0.6) txt = `θ = ${deg}° is PC1 (exactly ${PC1.toFixed(2)}°). The projections are as spread out as they can be, variance <b>${L1.toFixed(2)}</b> = λ₁, which is 82.1% of the total 37.`;
    else if (Math.abs(deg - PC2) < 0.6) txt = `θ = ${deg}° is PC2, the direction of least variance, <b>${L2.toFixed(2)}</b> = λ₂ = 17.9% of the total.`;
    else if (deg === 0) txt = 'Along the X₁ axis the variance is Cov(X₁, X₁) = <b>14</b>, 37.8% of the total.';
    else if (deg === 90) txt = 'Along the X₂ axis the variance is Cov(X₂, X₂) = <b>23</b>, 62.2% of the total.';
    else txt = `Along θ = ${deg}° the projections have variance <b>${v.toFixed(2)}</b>. Every direction lies between λ₂ = 6.62 and λ₁ = 30.38.`;
    role('verdict').innerHTML = txt;
  });

  // Figure 2: the same total before and after
  const B = svg(viz('share'), 700, 226, { label: 'Two bars of length 37: variances 14 and 23 on the original axes, 30.38 and 6.62 on the principal axes, with the options as percentages', minWidth: 540 });
  const bx = v => 150 + v / 37 * 500;
  s('text', { x: 0, y: 47, dy: '0.35em', class: 't-fg t-bold' }, B, 'original axes');
  s('rect', { x: bx(0), y: 32, width: bx(14) - bx(0), height: 30, class: 'f-ter-soft sep' }, B);
  s('rect', { x: bx(14), y: 32, width: bx(37) - bx(14), height: 30, class: 'f-ter sep' }, B);
  s('text', { x: bx(7), y: 47, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, B, 'Cov(X₁, X₁) = 14');
  s('text', { x: bx(25.5), y: 47, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, B, 'Cov(X₂, X₂) = 23');
  s('text', { x: bx(37) + 8, y: 47, dy: '0.35em', class: 't-fg t-bold' }, B, '= 37');
  s('text', { x: 0, y: 101, dy: '0.35em', class: 't-fg t-bold' }, B, 'principal axes');
  s('rect', { x: bx(0), y: 86, width: bx(L1) - bx(0), height: 30, class: 'f-ok sep' }, B);
  s('rect', { x: bx(L1), y: 86, width: bx(37) - bx(L1), height: 30, class: 'f-sec sep' }, B);
  s('text', { x: bx(L1 / 2), y: 101, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, B, `λ₁ = ${L1.toFixed(2)}, PC1`);
  s('text', { x: bx(L1 + L2 / 2), y: 101, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, B, `λ₂ = ${L2.toFixed(2)}`);
  s('text', { x: bx(37) + 8, y: 101, dy: '0.35em', class: 't-fg t-bold' }, B, '= 37');
  s('line', { x1: bx(L1), x2: bx(L1), y1: 116, y2: 182, class: 's-ok dash', style: 'stroke-width: 1' }, B);
  s('line', { x1: bx(0), x2: bx(37), y1: 150, y2: 150, class: 'l-axis' }, B);
  [0, 25, 50, 75, 100].forEach(p => {
    s('line', { x1: bx(p * 0.37), x2: bx(p * 0.37), y1: 150, y2: 155, class: 'l-axis' }, B);
    s('text', { x: bx(p * 0.37), y: 168, 'text-anchor': 'middle' }, B, p + '%');
  });
  s('text', { x: 0, y: 168, class: 't-sm' }, B, 'share of 37');
  [['b', L2 / 37 * 100, 'PC2'], ['c', 50, 'λ₁ = λ₂'], ['a', L1 / 37 * 100, 'PC1, 82.1%'], ['d', 100, 'both PCs']].forEach(([k, p, lab]) => {
    const ok = k === 'a', x = bx(p * 0.37);
    s('circle', { cx: x, cy: 194, r: 9, class: ok ? 'f-ok' : 'f-surface box' }, B);
    s('text', { x, y: 194, dy: '0.35em', 'text-anchor': 'middle', class: ok ? 't-on t-bold' : 't-fg t-bold' }, B, k);
    s('text', { x, y: 220, 'text-anchor': 'middle', class: ok ? 't-ok t-bold' : 't-fg' }, B, lab);
  });
});

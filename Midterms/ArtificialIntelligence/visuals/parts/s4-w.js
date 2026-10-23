QV.register('s4-w1', function (q) {
  const { s, svg, axes, line, plot, steps, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const g = z => 1 / (1 + Math.exp(-z));
  const neg = v => String(v).replace('-', '−');
  const f2 = v => neg(v.toFixed(2));

  // Figure 1: least squares on tumour size, before and after one extreme malignant tumour
  const fit = (xs, ys) => {
    const n = xs.length, mx = xs.reduce((a, v) => a + v, 0) / n, my = ys.reduce((a, v) => a + v, 0) / n;
    let sxy = 0, sxx = 0;
    xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) * (x - mx); });
    const b = sxy / sxx;
    return { a: my - b * mx, b };
  };
  const BEN = [1, 2, 3, 4], MAL = [5, 6, 7, 8], BIG = 20;
  const lin = svg(viz('lin'), 680, 300, { label: 'Tumour size against malignant with the least-squares line, the 0.5 threshold and its crossing, before and after adding one large malignant tumour', minWidth: 520 });
  const ax = axes(lin, { x: 56, y: 24, w: 600, h: 220, xd: [0, 22], yd: [-0.5, 1.5], xt: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22], yt: [-0.5, 0, 0.5, 1, 1.5], yf: v => neg(fmt(v)), xl: 'tumour size', yl: 'h(x); y = 0 benign, y = 1 malignant' });
  s('line', { x1: ax.x(0), x2: ax.x(22), y1: ax.y(0.5), y2: ax.y(0.5), class: 's-muted dash' }, lin);
  s('text', { x: ax.x(21.8), y: ax.y(0.5) - 6, 'text-anchor': 'end', class: 't-muted' }, lin, 'threshold h = 0.5');
  const dyn = s('g', {}, lin);
  const linNote = role('lin-note');
  steps(viz('lin-steps'), ['Clean data', 'Add the large tumour'], k => {
    dyn.textContent = '';
    const xs = BEN.concat(MAL, k ? [BIG] : []);
    const ys = xs.map(x => (x >= 5 ? 1 : 0));
    const { a, b } = fit(xs, ys);
    const cross = (0.5 - a) / b;
    s('rect', { x: ax.x(cross), y: ax.box.y, width: ax.x(22) - ax.x(cross), height: ax.box.h, class: 'area-pri' }, dyn);
    s('text', { x: ax.x(13.5), y: ax.y(0.22), 'text-anchor': 'middle', class: 't-pri' }, dyn, 'predicted malignant (h ≥ 0.5)');
    const x0 = Math.max(0, (-0.5 - a) / b), x1 = Math.min(22, (1.5 - a) / b);
    line(dyn, [[ax.x(x0), ax.y(a + b * x0)], [ax.x(x1), ax.y(a + b * x1)]], 's-ter');
    s('line', { x1: ax.x(cross), x2: ax.x(cross), y1: ax.y(-0.5), y2: ax.y(1.5), class: 's-pri dash', style: 'stroke-width: 1.5' }, dyn);
    s('text', { x: ax.x(cross) + 6, y: ax.y(-0.42), class: 't-pri t-bold' }, dyn, 'crossing x = ' + fmt(cross, 2));
    xs.forEach((x, i) => {
      s('circle', { cx: ax.x(x), cy: ax.y(ys[i]), r: 6, class: (ys[i] ? 'f-pri' : 'f-sec') + ' sep' }, dyn);
      if (ys[i] && a + b * x < 0.5) s('circle', { cx: ax.x(x), cy: ax.y(1), r: 11, class: 's-bad' }, dyn);
    });
    if (k) {
      s('text', { x: ax.x(4.75), y: ax.y(1.42), 'text-anchor': 'end', class: 't-bad' }, dyn, 'malignant, but');
      s('text', { x: ax.x(4.75), y: ax.y(1.3), 'text-anchor': 'end', class: 't-bad t-bold' }, dyn, 'predicted benign');
      s('text', { x: ax.x(BIG) - 12, y: ax.y(1), dy: '0.35em', 'text-anchor': 'end', class: 't-ter' }, dyn, 'h = ' + f2(a + b * BIG) + ' > 1');
      linNote.textContent = `One malignant tumour of size 20 is added. It is correct data, but least squares pulls the line toward it. The slope drops from 0.19 to ${fmt(b, 3)} and the crossing moves to ${fmt(cross, 2)}. The malignant tumour of size 5 now gets h = ${f2(a + 5 * b)} < 0.5 and is predicted benign, and h(20) = ${f2(a + b * BIG)} is above 1.`;
    } else {
      s('text', { x: ax.x(0.25), y: ax.y(-0.45), class: 't-ter' }, dyn, 'h < 0 here');
      s('text', { x: ax.x(8.6), y: ax.y(1.15), class: 't-ter' }, dyn, 'h > 1 here');
      linNote.textContent = 'On clean data the line crosses 0.5 at x = 4.5, halfway between the largest benign tumour (4) and the smallest malignant one (5), so every tumour is classified correctly. Even here h leaves the range 0..1. It is below 0 for sizes under 1.875 and above 1 for sizes over 7.125.';
    }
  }, 1);

  // Figure 2: sigmoid with a probability bar
  const sg = svg(viz('sig'), 640, 316, { label: 'Sigmoid curve g(z) with a marker at the chosen z, and a bar splitting P(y = 1) and P(y = 0)', minWidth: 500 });
  const sx = axes(sg, { x: 52, y: 24, w: 564, h: 200, xd: [-6, 6], yd: [0, 1], xt: [-6, -4, -2, 0, 2, 4, 6], yt: [0, 0.25, 0.5, 0.75, 1], xf: v => neg(fmt(v)), xl: 'z = θᵀx', yl: 'h = g(z) = P(y = 1 | x; θ)' });
  s('rect', { x: sx.x(0), y: sx.box.y, width: sx.x(6) - sx.x(0), height: sx.box.h, class: 'area-pri' }, sg);
  s('line', { x1: sx.x(-6), x2: sx.x(6), y1: sx.y(0.5), y2: sx.y(0.5), class: 's-muted dash' }, sg);
  plot(sg, sx, g, -6, 6, 240, 's-pri');
  s('text', { x: sx.x(0.2), y: sx.y(0.06), class: 't-pri' }, sg, 'z ≥ 0 → h ≥ 0.5 → predict 1');
  s('text', { x: sx.x(-5.8), y: sx.y(0.92), class: 't-sec' }, sg, 'z < 0 → h < 0.5 → predict 0');
  const sm = s('g', {}, sg);
  const BAR = { x: 52, w: 564, y: 280, h: 24 };
  const sigNote = role('sig-note');
  slider(viz('sig-slider'), { label: 'z = θᵀx', min: -6, max: 6, step: 0.05, value: 0.85, fmt: v => f2(v) }, z => {
    sm.textContent = '';
    const h = g(z), px = sx.x(z), py = sx.y(h);
    s('line', { x1: px, x2: px, y1: sx.y(0), y2: py, class: 's-fg dash', style: 'opacity: 0.6' }, sm);
    s('line', { x1: sx.x(-6), x2: px, y1: py, y2: py, class: 's-fg dash', style: 'opacity: 0.6' }, sm);
    s('circle', { cx: px, cy: py, r: 6, class: 'f-pri sep' }, sm);
    const right = z < 2;
    s('text', { x: px + (right ? 10 : -10), y: py + (h > 0.85 ? 16 : -10), 'text-anchor': right ? 'start' : 'end', class: 't-fg t-bold halo' }, sm, 'h = ' + h.toFixed(2));
    const wp = BAR.w * h;
    s('rect', { x: BAR.x, y: BAR.y, width: wp, height: BAR.h, class: 'f-pri' }, sm);
    s('rect', { x: BAR.x + wp, y: BAR.y, width: BAR.w - wp, height: BAR.h, class: 'f-sec' }, sm);
    if (wp > 120) s('text', { x: BAR.x + 8, y: BAR.y + BAR.h / 2, dy: '0.35em', class: 't-on t-bold' }, sm, 'P(y = 1) = ' + h.toFixed(2));
    if (BAR.w - wp > 120) s('text', { x: BAR.x + BAR.w - 8, y: BAR.y + BAR.h / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-on t-bold' }, sm, 'P(y = 0) = ' + (1 - h).toFixed(2));
    const pct = Math.round(h * 100);
    sigNote.textContent = `z = ${f2(z)}: h = g(z) = ${h.toFixed(2)}. Tell the patient there is a ${pct}% chance the tumour is malignant; P(y = 0) = ${(1 - h).toFixed(2)}. ` +
      (z >= 0 ? 'z ≥ 0, so h ≥ 0.5 and the prediction is y = 1.' : 'z < 0, so h < 0.5 and the prediction is y = 0.');
  });

  // Figure 3: linear and circular decision boundaries
  const bd = svg(viz('bound'), 700, 324, { label: 'Two decision boundaries: the line x1 + x2 = 3 for theta = [-3, 1, 1], and the unit circle for polynomial features', minWidth: 540 });
  const L = axes(bd, { x: 50, y: 50, w: 230, h: 230, xd: [0, 4], yd: [0, 4], xt: [0, 1, 2, 3, 4], yt: [0, 1, 2, 3, 4], xl: 'x₁', yl: 'x₂' });
  const R = axes(bd, { x: 430, y: 50, w: 230, h: 230, xd: [-2, 2], yd: [-2, 2], xt: [-2, -1, 0, 1, 2], yt: [-2, -1, 0, 1, 2], xf: v => neg(fmt(v)), yf: v => neg(fmt(v)), xl: 'x₁', yl: 'x₂' });
  s('text', { x: 50, y: 18, class: 't-fg t-bold' }, bd, 'θ = [−3, 1, 1]: x₁ + x₂ = 3');
  s('text', { x: 430, y: 18, class: 't-fg t-bold' }, bd, 'θ = [−1, 0, 0, 1, 1]: x₁² + x₂² = 1');
  s('polygon', { points: [[3, 0], [4, 0], [4, 4], [0, 4], [0, 3]].map(([u, v]) => L.x(u) + ',' + L.y(v)).join(' '), class: 'area-pri' }, bd);
  s('line', { x1: L.x(0), y1: L.y(3), x2: L.x(3), y2: L.y(0), class: 's-ok' }, bd);
  s('text', { x: L.x(2.75), y: L.y(0.5), class: 't-ok t-bold' }, bd, 'θᵀx = 0');
  s('text', { x: L.x(3.9), y: L.y(3.75), 'text-anchor': 'end', class: 't-pri' }, bd, 'z ≥ 0: predict 1');
  s('text', { x: L.x(0.1), y: L.y(0.2), class: 't-sec' }, bd, 'z < 0: predict 0');
  const tag = (A, x, y, cls, l1, l2, side) => {
    s('circle', { cx: A.x(x), cy: A.y(y), r: 6, class: cls + ' sep' }, bd);
    const tx = side === 'mid' ? A.x(x) : A.x(x) + (side === 'left' ? -10 : 10);
    const anchor = side === 'mid' ? 'middle' : side === 'left' ? 'end' : 'start';
    const ty = side === 'mid' ? A.y(y) - 26 : A.y(y) - 6;
    s('text', { x: tx, y: ty, 'text-anchor': anchor, class: 't-fg halo' }, bd, l1);
    s('text', { x: tx, y: ty + 14, 'text-anchor': anchor, class: 't-fg halo' }, bd, l2);
  };
  tag(L, 1, 1, 'f-sec', 'z = −1', 'h = ' + g(-1).toFixed(2), 'left');
  s('circle', { cx: L.x(1.5), cy: L.y(1.5), r: 6, class: 'f-ok sep' }, bd);
  tag(L, 2, 2, 'f-pri', 'z = 1', 'h = ' + g(1).toFixed(2), 'right');
  const cr = R.x(1) - R.x(0), ccx = R.x(0), ccy = R.y(0);
  const circ = `M${ccx + cr} ${ccy} A${cr} ${cr} 0 1 0 ${ccx - cr} ${ccy} A${cr} ${cr} 0 1 0 ${ccx + cr} ${ccy} Z`;
  s('path', { d: `M${R.x(-2)} ${R.y(2)} H${R.x(2)} V${R.y(-2)} H${R.x(-2)} Z ` + circ, class: 'area-pri', style: 'fill-rule: evenodd' }, bd);
  s('path', { d: circ, class: 's-ok' }, bd);
  s('text', { x: R.x(-1.9), y: R.y(-1.75), class: 't-ok t-bold' }, bd, 'x₁² + x₂² = 1');
  tag(R, 0.5, 0.5, 'f-sec', 'z = −0.5', 'h = ' + g(-0.5).toFixed(2), 'left');
  tag(R, 1.2, 0.8, 'f-pri', 'z = 1.08', 'h = ' + g(1.08).toFixed(2), 'mid');

  // Figure 4: cost against h, and against z for one positive example
  const cs = svg(viz('cost'), 760, 300, { label: 'Left: cost against h for y = 1 and y = 0. Right: log loss and squared error of a positive example against z', minWidth: 560 });
  const CL = axes(cs, { x: 56, y: 30, w: 280, h: 200, xd: [0, 1], yd: [0, 3.2], xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 1, 2, 3], xl: 'h = hθ(x)', yl: 'cost' });
  const CR = axes(cs, { x: 446, y: 30, w: 280, h: 200, xd: [-6, 6], yd: [0, 3.2], xt: [-6, -4, -2, 0, 2, 4, 6], yt: [0, 1, 2, 3], xf: v => neg(fmt(v)), xl: 'z = θᵀx, for an example with y = 1', yl: 'cost' });
  const top = Math.exp(-3.2);
  // marker lines sit under the curve labels, so the labels stay readable at every h
  const cmLine = s('g', {}, cs);
  plot(cs, CL, h => -Math.log(h), top, 0.999, 240, 's-pri');
  plot(cs, CL, h => -Math.log(1 - h), 0.001, 1 - top, 240, 's-sec');
  s('text', { x: CL.x(0.16), y: CL.y(2.9), class: 't-pri t-bold' }, cs, 'y = 1: −log h');
  s('text', { x: CL.x(0.88), y: CL.y(2.5), 'text-anchor': 'end', class: 't-sec t-bold' }, cs, 'y = 0: −log(1 − h)');
  const logl = z => Math.log(1 + Math.exp(-z)), sq = z => (1 - g(z)) * (1 - g(z));
  plot(cs, CR, logl, -Math.log(Math.exp(3.2) - 1), 6, 240, 's-pri');
  plot(cs, CR, sq, -6, 6, 240, 's-ter');
  s('text', { x: CR.x(-2.0), y: CR.y(2.95), class: 't-pri t-bold halo' }, cs, 'log loss: convex');
  s('text', { x: CR.x(-5.8), y: CR.y(1.25), class: 't-ter t-bold halo' }, cs, 'squared error');
  s('text', { x: CR.x(-5.8), y: CR.y(0.55), class: 't-ter t-sm halo' }, cs, 'flat: slope → 0');
  s('circle', { cx: CR.x(-Math.log(2)), cy: CR.y(sq(-Math.log(2))), r: 3.5, class: 'f-ter' }, cs);
  const cm = s('g', {}, cs);
  const costNote = role('cost-note');
  slider(viz('cost-slider'), { label: 'h', min: 0.05, max: 0.95, step: 0.01, value: 0.1, fmt: v => v.toFixed(2) }, h => {
    cm.textContent = '';
    cmLine.textContent = '';
    const c1 = -Math.log(h), c0 = -Math.log(1 - h), z = Math.log(h / (1 - h));
    s('line', { x1: CL.x(h), x2: CL.x(h), y1: CL.y(0), y2: CL.y(3.2), class: 's-fg dash', style: 'opacity: 0.45' }, cmLine);
    s('circle', { cx: CL.x(h), cy: CL.y(c1), r: 5, class: 'f-pri sep' }, cm);
    s('circle', { cx: CL.x(h), cy: CL.y(c0), r: 5, class: 'f-sec sep' }, cm);
    s('line', { x1: CR.x(z), x2: CR.x(z), y1: CR.y(0), y2: CR.y(3.2), class: 's-fg dash', style: 'opacity: 0.45' }, cmLine);
    s('circle', { cx: CR.x(z), cy: CR.y(logl(z)), r: 5, class: 'f-pri sep' }, cm);
    s('circle', { cx: CR.x(z), cy: CR.y(sq(z)), r: 5, class: 'f-ter sep' }, cm);
    costNote.textContent = `h = ${h.toFixed(2)}. If y = 1 the cost is −log ${h.toFixed(2)} = ${c1.toFixed(2)}; if y = 0 it is −log ${(1 - h).toFixed(2)} = ${c0.toFixed(2)}. ` +
      `On the right the same h is z = ${f2(z)}. There the log loss has slope ${f2(h - 1)} and the squared error only ${f2(-2 * h * (1 - h) * (1 - h))}.`;
  });
});

QV.register('s4-w2', function (q) {
  const { s, svg, axes, line, steps, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const A = [[4.1, 4.4], [3.9, 3.2], [4.3, 5.2], [3.6, 4.6], [1.0, 1.5], [1.5, 3.5], [2.0, 5.5], [2.5, 2.2], [3.0, 6.6], [3.2, 1.2], [1.2, 6.8], [8.2, 7.3]];
  const B = [[5.4, 3.3], [5.8, 4.3], [6.6, 3.4], [6.5, 1.8], [7.2, 5.6], [7.8, 2.6], [8.4, 4.4], [8.8, 1.4], [6.4, 6.6], [9.2, 6.6], [2.0, 3.0]];
  const PTS = A.map(p => ({ p, c: 'A' })).concat(B.map(p => ({ p, c: 'B' })));
  const N = PTS.length;
  const Q = [5, 4];
  const dist = (u, v) => Math.hypot(u[0] - v[0], u[1] - v[1]);
  const plane = (host, label, w) => {
    const el = svg(host, w, 420, { label, minWidth: Math.min(500, w) });
    const ax = axes(el, { x: 40, y: 24, w: 440, h: 352, xd: [0, 10], yd: [0, 8], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6, 8], xl: 'x₁', yl: 'x₂' });
    return { el, ax };
  };
  const mark = (g, ax, o) => (o.c === 'A'
    ? s('circle', { cx: ax.x(o.p[0]), cy: ax.y(o.p[1]), r: 5.5, class: 'f-pri sep' }, g)
    : s('rect', { x: ax.x(o.p[0]) - 5, y: ax.y(o.p[1]) - 5, width: 10, height: 10, class: 'f-sec sep' }, g));
  const star = (g, x, y, r) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      pts.push((x + rr * Math.cos(a)).toFixed(1) + ',' + (y + rr * Math.sin(a)).toFixed(1));
    }
    return s('polygon', { points: pts.join(' '), class: 'f-ter sep' }, g);
  };

  // Figure 1: classify the star with a k slider
  const F1 = plane(viz('knn'), 'Training points of classes A and B and a new point; the k nearest neighbours are joined to it and vote', 640);
  const ord = PTS.map(o => Object.assign({ d: dist(o.p, Q) }, o)).sort((u, v) => u.d - v.d);
  const under = s('g', {}, F1.el);
  PTS.forEach(o => mark(F1.el, F1.ax, o));
  const over = s('g', {}, F1.el);
  star(F1.el, F1.ax.x(Q[0]), F1.ax.y(Q[1]), 11);
  const knnNote = role('knn-note');
  slider(viz('knn-slider'), { label: 'k', min: 1, max: N, step: 1, value: 3 }, k => {
    under.textContent = '';
    over.textContent = '';
    const nb = ord.slice(0, k);
    const na = nb.filter(o => o.c === 'A').length, nbb = k - na;
    const r = nb[k - 1].d * (F1.ax.x(1) - F1.ax.x(0));
    if (nb[k - 1].d <= 4) s('circle', { cx: F1.ax.x(Q[0]), cy: F1.ax.y(Q[1]), r, class: 's-muted dash', style: 'stroke-width: 1.2' }, under);
    nb.forEach((o, i) => {
      s('line', { x1: F1.ax.x(Q[0]), y1: F1.ax.y(Q[1]), x2: F1.ax.x(o.p[0]), y2: F1.ax.y(o.p[1]), class: 's-muted', style: 'stroke-width: 1; opacity: 0.7' }, under);
      s('circle', { cx: F1.ax.x(o.p[0]), cy: F1.ax.y(o.p[1]), r: 9.5, class: 's-fg' }, over);
      if (k <= 8) s('text', { x: F1.ax.x(o.p[0]) + 10, y: F1.ax.y(o.p[1]) - 10, class: 't-fg t-sm t-bold halo' }, over, String(i + 1));
    });
    const win = na > nbb ? 'A' : nbb > na ? 'B' : '';
    const tx = 500;
    s('text', { x: tx, y: 50, class: 't-fg t-bold t-lg' }, over, 'k = ' + k);
    s('text', { x: tx, y: 80, class: 't-pri' }, over, 'A votes: ' + na);
    s('rect', { x: tx, y: 88, width: 9 * na, height: 10, class: 'f-pri' }, over);
    s('text', { x: tx, y: 120, class: 't-sec' }, over, 'B votes: ' + nbb);
    s('rect', { x: tx, y: 128, width: 9 * nbb, height: 10, class: 'f-sec' }, over);
    s('text', { x: tx, y: 166, class: (win === 'A' ? 't-pri' : win === 'B' ? 't-sec' : 't-muted') + ' t-bold t-lg' }, over, win ? 'class ' + win : 'tie');
    const list = nb.map(o => `${o.c} (${o.d.toFixed(2)})`).join(', ');
    let txt;
    if (k === N) txt = `k = ${N} = N: every training point votes, so KNN predicts the majority class of the whole data set, A (${na} vs ${nbb}), wherever the new point is.`;
    else if (!win) txt = `k = ${k}: a ${na} : ${nbb} tie. With two classes an odd k avoids ties (textbook context).`;
    else if (k <= 5) txt = `k = ${k}: the closest points are ${list}. ${win} wins ${Math.max(na, nbb)} : ${Math.min(na, nbb)}, so the new point is class ${win}.`;
    else txt = `k = ${k}: the ${k} closest points hold ${na} A and ${nbb} B, so the new point is class ${win}.`;
    knnNote.textContent = txt;
  });

  // Figure 2: KNN regression in one dimension
  const XS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], YS = [2.0, 3.1, 2.6, 4.2, 5.0, 4.4, 6.1, 6.8, 6.2, 7.6], XQ = 5.4;
  const near = x => XS.map((v, i) => i).sort((i, j) => Math.abs(XS[i] - x) - Math.abs(XS[j] - x));
  const pred = (x, k) => near(x).slice(0, k).reduce((a, i) => a + YS[i], 0) / k;
  const rg = svg(viz('reg'), 640, 270, { label: 'KNN regression: ten training points, the prediction curve for the chosen k, and the query at x = 5.4 with its neighbours', minWidth: 500 });
  const rx = axes(rg, { x: 50, y: 24, w: 560, h: 200, xd: [0, 11], yd: [0, 9], xt: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], yt: [0, 2, 4, 6, 8], xl: 'x', yl: 'y' });
  s('line', { x1: rx.x(XQ), x2: rx.x(XQ), y1: rx.y(0), y2: rx.y(8.3), class: 's-ter dash', style: 'stroke-width: 1.5' }, rg);
  const rdyn = s('g', {}, rg);
  const regNote = role('reg-note');
  slider(viz('reg-slider'), { label: 'k', min: 1, max: 10, step: 1, value: 3 }, k => {
    rdyn.textContent = '';
    const pts = [];
    for (let i = 0; i <= 2000; i++) { const x = 0.5 + i * 0.005; pts.push([rx.x(x), rx.y(pred(x, k))]); }
    line(rdyn, pts, 's-pri').setAttribute('style', 'stroke-width: 2');
    const nb = near(XQ).slice(0, k), yq = pred(XQ, k);
    nb.forEach(i => s('line', { x1: rx.x(XS[i]), y1: rx.y(YS[i]), x2: rx.x(XQ), y2: rx.y(yq), class: 's-muted dash', style: 'stroke-width: 1; opacity: 0.8' }, rdyn));
    XS.forEach((x, i) => s('circle', { cx: rx.x(x), cy: rx.y(YS[i]), r: 5.5, class: 'f-sec sep' }, rdyn));
    nb.forEach(i => s('circle', { cx: rx.x(XS[i]), cy: rx.y(YS[i]), r: 9.5, class: 's-fg' }, rdyn));
    s('circle', { cx: rx.x(XQ), cy: rx.y(yq), r: 6.5, class: 'f-pri sep' }, rdyn);
    s('text', { x: rx.x(XQ), y: rx.y(8.5), 'text-anchor': 'middle', class: 't-fg t-bold' }, rdyn, 'query x = 5.4 → ŷ = ' + fmt(yq, 2));
    if (k === 10) regNote.textContent = 'k = 10 = N: every point is a neighbour of every x, so the prediction is the overall mean 4.8 everywhere, a flat line. Too large a k underfits.';
    else if (k <= 4) regNote.textContent = `k = ${k}: the nearest x are ${nb.map(i => XS[i]).join(', ')} with y = ${nb.map(i => YS[i].toFixed(1)).join(', ')}. Average ${k > 1 ? '(' + nb.map(i => YS[i].toFixed(1)).join(' + ') + ') / ' + k + ' = ' : ''}${fmt(yq, 2)}.`;
    else regNote.textContent = `k = ${k}: the average of the ${k} nearest y values is ${fmt(yq, 2)}. The prediction curve has fewer, smaller steps.`;
  });

  // Figure 3: Euclidean, Manhattan and Minkowski
  const ds = svg(viz('dist'), 680, 310, { label: 'Left: Euclidean and Manhattan paths between two points. Right: points at distance 1 for Minkowski p = 1, p = 2 and the chosen p', minWidth: 540 });
  const dx = axes(ds, { x: 40, y: 24, w: 200, h: 240, xd: [0, 5], yd: [0, 6], xt: [0, 1, 2, 3, 4, 5], yt: [0, 1, 2, 3, 4, 5, 6], xl: 'x', yl: 'y' });
  s('path', { d: `M${dx.x(1)} ${dx.y(1)} H${dx.x(4)} V${dx.y(5)}`, class: 's-sec' }, ds);
  s('line', { x1: dx.x(1), y1: dx.y(1), x2: dx.x(4), y2: dx.y(5), class: 's-pri' }, ds);
  [[1, 1], [4, 5]].forEach(([u, v]) => s('circle', { cx: dx.x(u), cy: dx.y(v), r: 6, class: 'f-fg' }, ds));
  s('text', { x: dx.x(0.75), y: dx.y(1.2), 'text-anchor': 'end', class: 't-fg t-bold' }, ds, 'P');
  s('text', { x: dx.x(4.15), y: dx.y(5.25), class: 't-fg t-bold' }, ds, 'Q(4, 5)');
  s('text', { x: dx.x(2.4), y: dx.y(3.2), 'text-anchor': 'end', class: 't-pri t-bold halo' }, ds, '√(3² + 4²) = 5');
  s('text', { x: dx.x(2.5), y: dx.y(0.45), 'text-anchor': 'middle', class: 't-sec t-bold' }, ds, '3 + 4 = 7');
  s('text', { x: dx.x(4.15), y: dx.y(3), class: 't-sec' }, ds, '4');
  s('text', { x: dx.x(2.5), y: dx.y(1) - 6, 'text-anchor': 'middle', class: 't-sec' }, ds, '3');
  const U = { cx: 480, cy: 150, r: 100 };
  s('text', { x: U.cx, y: 18, 'text-anchor': 'middle', class: 't-fg t-bold' }, ds, 'all points at distance 1 from the centre');
  s('line', { x1: U.cx - 125, x2: U.cx + 125, y1: U.cy, y2: U.cy, class: 's-line' }, ds);
  s('line', { x1: U.cx, x2: U.cx, y1: U.cy - 115, y2: U.cy + 115, class: 's-line' }, ds);
  const ball = p => {
    const pts = [];
    for (let i = 0; i <= 360; i++) {
      const t = i * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t);
      const n = Math.pow(Math.pow(Math.abs(c), p) + Math.pow(Math.abs(sn), p), 1 / p);
      pts.push([U.cx + U.r * c / n, U.cy - U.r * sn / n]);
    }
    return pts;
  };
  line(ds, ball(1), 's-sec dash').setAttribute('style', 'stroke-width: 1.5');
  line(ds, ball(2), 's-pri dash').setAttribute('style', 'stroke-width: 1.5');
  s('text', { x: U.cx + U.r + 6, y: U.cy - 6, class: 't-sm' }, ds, '1');
  s('text', { x: U.cx + 6, y: U.cy - U.r - 6, class: 't-sm' }, ds, '1');
  const ddyn = s('g', {}, ds);
  const distNote = role('dist-note');
  slider(viz('dist-slider'), { label: 'p', min: 1, max: 8, step: 0.5, value: 3, fmt: v => fmt(v) }, p => {
    ddyn.textContent = '';
    line(ddyn, ball(p), 's-ter').setAttribute('style', 'stroke-width: 3');
    const d = Math.pow(Math.pow(3, p) + Math.pow(4, p), 1 / p);
    s('text', { x: U.cx, y: U.cy + 150, 'text-anchor': 'middle', class: 't-ter t-bold' }, ddyn, `p = ${fmt(p)}: distance P to Q = ${d.toFixed(2)}`);
    distNote.innerHTML = `p = ${fmt(p)}: (3<sup>${fmt(p)}</sup> + 4<sup>${fmt(p)}</sup>)<sup>1/${fmt(p)}</sup> = ${d.toFixed(2)}. ` +
      'p = 1 gives the Manhattan 7 and p = 2 the Euclidean 5. As p grows the distance falls toward the largest single gap, 4.';
  });

  // Figure 4: decision regions for several k
  const F4 = plane(viz('regions'), 'Decision regions of KNN on the Figure 1 data for k = 1, 3, 7 and 23', 500);
  const CELL = 0.2, NC = 50, NR = 40;
  const cells = [];
  const back = s('g', {}, F4.el);
  for (let r = 0; r < NR; r++) {
    for (let c = 0; c < NC; c++) {
      const cx = (c + 0.5) * CELL, cy = (r + 0.5) * CELL;
      const order = PTS.map(o => ({ c: o.c, d: dist(o.p, [cx, cy]) })).sort((u, v) => u.d - v.d).map(o => o.c);
      const rect = s('rect', { x: F4.ax.x(c * CELL), y: F4.ax.y((r + 1) * CELL), width: F4.ax.x(CELL) - F4.ax.x(0), height: F4.ax.y(0) - F4.ax.y(CELL), class: 'f-seg', style: 'shape-rendering: crispEdges' }, back);
      cells.push({ order, rect });
    }
  }
  PTS.forEach(o => mark(F4.el, F4.ax, o));
  [[2.0, 3.0], [8.2, 7.3]].forEach(([u, v]) => s('circle', { cx: F4.ax.x(u), cy: F4.ax.y(v), r: 10, class: 's-bad' }, F4.el));
  const KS = [1, 3, 7, N];
  const NOTES = [
    'k = 1: every location copies its single nearest point. The B square at (2, 3) carves a B patch out of the A area, and the A circle at (8.2, 7.3) an A patch out of the B area. The boundary follows single noisy points, which is overfitting.',
    'k = 3: the two odd points are now outvoted by their neighbours, and their patches vanish. The boundary between the groups is still a little jagged.',
    'k = 7: a smooth boundary between the two groups. Each prediction averages over a larger neighbourhood, so single points matter less.',
    `k = ${N} = N: every point votes everywhere, so the whole plane gets the majority class A (12 of ${N}). Too large a k underfits.`,
  ];
  const reg2Note = role('reg2-note');
  steps(viz('reg2-steps'), KS.map(k => (k === N ? `k = ${N} = N` : 'k = ' + k)), i => {
    const k = KS[i];
    cells.forEach(o => {
      let na = 0;
      for (let j = 0; j < k; j++) if (o.order[j] === 'A') na++;
      o.rect.setAttribute('class', na * 2 > k ? 'f-pri-soft' : 'f-sec-soft');
    });
    reg2Note.textContent = NOTES[i];
  });
});

QV.register('s4-w3', function (q) {
  const { s, svg, axes, line, plot, arrow, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const neg = v => String(v).replace('-', '−');
  const plus = (g, x, y, r) => s('circle', { cx: x, cy: y, r, class: 'f-pri sep' }, g);
  const minus = (g, x, y, r) => s('rect', { x: x - r, y: y - r, width: 2 * r, height: 2 * r, class: 'f-sec sep' }, g);

  // Figure 1: 1D points lifted by x²
  const X1 = [-3, -2, -1, 0, 1, 2, 3];
  const l1 = svg(viz('lift1'), 640, 340, { label: 'Seven points on a line, class + where |x| is at least 2, and the same points lifted to x squared with the separating line x squared = 2.5', minWidth: 500 });
  const ax = axes(l1, { x: 80, y: 110, w: 520, h: 180, xd: [-3.5, 3.5], yd: [0, 10], xt: X1, yt: [0, 1, 2.5, 4, 9], xf: v => neg(fmt(v)), xl: 'x', yl: 'φ(x) = x²' });
  const NL = 40;
  s('text', { x: 10, y: NL, dy: '0.35em', class: 't-fg t-bold' }, l1, 'x line');
  s('line', { x1: ax.x(-3.5), x2: ax.x(3.5), y1: NL, y2: NL, class: 'l-axis' }, l1);
  X1.forEach(x => {
    s('line', { x1: ax.x(x), x2: ax.x(x), y1: ax.y(10), y2: ax.y(x * x), class: 's-line dash' }, l1);
    s('text', { x: ax.x(x), y: NL + 24, 'text-anchor': 'middle', class: 't-sm' }, l1, neg(x));
    (Math.abs(x) >= 2 ? plus : minus)(l1, ax.x(x), NL, 7);
  });
  s('text', { x: ax.x(0), y: NL + 44, 'text-anchor': 'middle', class: 't-muted' }, l1, 'any single cut x = t leaves at least 2 points on the wrong side');
  plot(l1, ax, x => x * x, -3.16, 3.16, 120, 's-muted dash').setAttribute('style', 'stroke-width: 1.2');
  s('line', { x1: ax.x(-3.5), x2: ax.x(3.5), y1: ax.y(2.5), y2: ax.y(2.5), class: 's-ok' }, l1);
  s('text', { x: ax.x(3.45), y: ax.y(2.5) - 7, 'text-anchor': 'end', class: 't-ok t-bold' }, l1, 'x² = 2.5');
  X1.forEach(x => {
    (Math.abs(x) >= 2 ? plus : minus)(l1, ax.x(x), ax.y(x * x), 7);
    s('text', { x: ax.x(x) + (x < 0 ? -12 : 12), y: ax.y(x * x), dy: '0.35em', 'text-anchor': x < 0 ? 'end' : 'start', class: 't-fg t-sm' }, l1, String(x * x));
  });

  // Figure 2: disk and ring lifted onto z = x1² + x2²
  const rad = d => d * Math.PI / 180;
  const DISK = [[0, 0]].concat([0, 1, 2, 3, 4, 5, 6, 7].map(i => { const r = i % 2 ? 0.9 : 0.5; return [r * Math.cos(rad(45 * i)), r * Math.sin(rad(45 * i))]; }));
  const RING = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => { const r = i % 2 ? 2.6 : 2.2; return [r * Math.cos(rad(15 + 30 * i)), r * Math.sin(rad(15 + 30 * i))]; });
  const l2 = svg(viz('lift2'), 720, 340, { label: 'Disk inside a ring seen from above with the circle boundary, and the same points lifted to z = x1 squared + x2 squared with the plane z = 2.5 between them', minWidth: 560 });
  const tv = axes(l2, { x: 40, y: 50, w: 240, h: 240, xd: [-3, 3], yd: [-3, 3], xt: [-3, -2, -1, 0, 1, 2, 3], yt: [-3, -2, -1, 0, 1, 2, 3], xf: v => neg(fmt(v)), yf: v => neg(fmt(v)), xl: 'x₁', yl: 'x₂' });
  s('text', { x: 40, y: 18, class: 't-fg t-bold' }, l2, 'seen from above: no line works');
  s('circle', { cx: tv.x(0), cy: tv.y(0), r: Math.sqrt(2.5) * (tv.x(1) - tv.x(0)), class: 's-ok dash', style: 'stroke-width: 2' }, l2);
  DISK.forEach(([u, v]) => minus(l2, tv.x(u), tv.y(v), 4.5));
  RING.forEach(([u, v]) => plus(l2, tv.x(u), tv.y(v), 5));
  const P3 = { cx: 530, cy: 205, u: 30, w: 15 };
  const pr = (a, b, z) => [P3.cx + P3.u * 0.866 * (a - b), P3.cy + P3.u * 0.5 * (a + b) - P3.w * z];
  const poly = (pts, cls, style) => s('polygon', { points: pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '), class: cls, style }, l2);
  const SQ = [[-3, -3], [3, -3], [3, 3], [-3, 3]];
  s('text', { x: 400, y: 18, class: 't-fg t-bold' }, l2, 'lifted: z = x₁² + x₂²');
  poly(SQ.map(([a, b]) => pr(a, b, 0)), 'f-none s-line');
  line(l2, [pr(-3, 0, 0), pr(3, 0, 0)], 's-line');
  line(l2, [pr(0, -3, 0), pr(0, 3, 0)], 's-line');
  const zTop = pr(0, 0, 7.6), z0 = pr(0, 0, 0);
  arrow(l2, z0[0], z0[1], zTop[0], zTop[1], { cls: 'a-muted' });
  s('text', { x: zTop[0] + 8, y: zTop[1] + 4, class: 't-muted' }, l2, 'z');
  const lifted = ([a, b]) => pr(a, b, a * a + b * b);
  DISK.forEach(p => {
    const t = lifted(p), base = pr(p[0], p[1], 0);
    s('line', { x1: base[0], y1: base[1], x2: t[0], y2: t[1], class: 's-muted', style: 'stroke-width: 1; opacity: 0.5' }, l2);
    minus(l2, t[0], t[1], 4);
  });
  poly(SQ.map(([a, b]) => pr(a, b, 2.5)), 'f-ok-soft', 'opacity: 0.8');
  poly(SQ.map(([a, b]) => pr(a, b, 2.5)), 'f-none s-ok', 'stroke-width: 1');
  const trace = [];
  for (let i = 0; i <= 72; i++) { const t = i * 5 * Math.PI / 180, r = Math.sqrt(2.5); trace.push(pr(r * Math.cos(t), r * Math.sin(t), 2.5)); }
  line(l2, trace, 's-ok dash').setAttribute('style', 'stroke-width: 1.5');
  s('text', { x: pr(3, -3, 2.5)[0] - 4, y: pr(3, -3, 2.5)[1] + 18, 'text-anchor': 'end', class: 't-ok t-bold halo' }, l2, 'plane z = 2.5');
  RING.forEach(p => {
    const t = lifted(p), base = pr(p[0], p[1], 0);
    s('line', { x1: base[0], y1: base[1], x2: t[0], y2: t[1], class: 's-muted', style: 'stroke-width: 1; opacity: 0.5' }, l2);
    plus(l2, t[0], t[1], 4.5);
  });

  // Figure 3: RBF gamma on the disk and ring with one mislabelled point
  const NOISY = [0.45, 0.3];
  const DATA = RING.map(p => ({ p, y: 1 })).concat(DISK.map(p => ({ p, y: -1 })), [{ p: NOISY, y: 1 }]);
  const rb = svg(viz('rbf'), 680, 330, { label: 'Sign of the kernel sum over the plane for the chosen gamma, and the shape of one RBF bump against distance', minWidth: 560 });
  const M = { x: 20, y: 20, sc: 45, lo: -3.2, n: 40, cell: 0.16 };
  const mx = v => M.x + (v - M.lo) * M.sc, my = v => M.y + (-M.lo - v) * M.sc;
  const rects = [];
  for (let r = 0; r < M.n; r++) {
    for (let c = 0; c < M.n; c++) {
      const u = M.lo + (c + 0.5) * M.cell, v = -M.lo - (r + 0.5) * M.cell;
      rects.push({ u, v, el: s('rect', { x: mx(u - M.cell / 2), y: my(v + M.cell / 2), width: M.cell * M.sc, height: M.cell * M.sc, class: 'f-seg', style: 'shape-rendering: crispEdges' }, rb) });
    }
  }
  s('rect', { x: M.x, y: M.y, width: M.n * M.cell * M.sc, height: M.n * M.cell * M.sc, class: 'f-none s-line' }, rb);
  DISK.forEach(([u, v]) => minus(rb, mx(u), my(v), 4));
  RING.forEach(([u, v]) => plus(rb, mx(u), my(v), 4.5));
  plus(rb, mx(NOISY[0]), my(NOISY[1]), 4.5);
  s('circle', { cx: mx(NOISY[0]), cy: my(NOISY[1]), r: 8, class: 's-bad', style: 'stroke-width: 2' }, rb);
  const bx = axes(rb, { x: 390, y: 34, w: 260, h: 220, xd: [0, 3], yd: [0, 1], xt: [0, 0.5, 1, 1.5, 2, 2.5, 3], yt: [0, 0.37, 1], xl: 'distance ‖x − xᵢ‖', yl: 'K = exp(−γ‖x − xᵢ‖²)' });
  const bdyn = s('g', {}, rb);
  const f = (u, v, gm) => DATA.reduce((a, o) => a + o.y * Math.exp(-gm * ((u - o.p[0]) ** 2 + (v - o.p[1]) ** 2)), 0);
  const rbfNote = role('rbf-note');
  slider(viz('rbf-slider'), { label: 'γ', min: -1.7, max: 1.5, step: 0.05, value: 0, fmt: v => fmt(Number(Math.pow(10, v).toPrecision(2))) }, lv => {
    const gm = Number(Math.pow(10, lv).toPrecision(2));
    let pos = 0;
    rects.forEach(o => {
      const on = f(o.u, o.v, gm) > 0;
      if (on) pos++;
      o.el.setAttribute('class', on ? 'f-pri-soft' : 'f-sec-soft');
    });
    const errs = DATA.filter(o => (f(o.p[0], o.p[1], gm) > 0) !== (o.y > 0)).length;
    const island = f(NOISY[0], NOISY[1], gm) > 0;
    bdyn.textContent = '';
    plot(bdyn, bx, d => Math.exp(-gm * d * d), 0, 3, 200, 's-pri');
    const w = 1 / Math.sqrt(gm);
    if (w <= 3) {
      s('line', { x1: bx.x(w), x2: bx.x(w), y1: bx.y(0), y2: bx.y(Math.exp(-1)), class: 's-fg dash' }, bdyn);
      s('text', { x: bx.x(w) + 6, y: bx.y(Math.exp(-1)) - 8, class: 't-fg t-bold halo' }, bdyn, '1/√γ = ' + w.toFixed(2));
    } else {
      s('text', { x: bx.x(2.95), y: bx.y(0.6), 'text-anchor': 'end', class: 't-fg t-bold halo' }, bdyn, '1/√γ = ' + w.toFixed(2) + ', off the axis');
    }
    const gs = fmt(gm);
    if (pos === rects.length) rbfNote.textContent = `γ = ${gs}: each bump is wider than the whole picture (1/√γ = ${w.toFixed(2)}), so every point counts almost equally everywhere. The 13 + points outweigh the 9 − points and the whole plane is predicted +. Too small a γ underfits.`;
    else if (island) rbfNote.textContent = `γ = ${gs}: narrow bumps (1/√γ = ${w.toFixed(2)}), so each location listens only to its nearest points. The mislabelled point gets its own island and all ${DATA.length} training points are fitted, ${errs} errors. The boundary wraps single points, which is overfitting.`;
    else rbfNote.textContent = `γ = ${gs}: bumps of width about ${w.toFixed(2)}. The boundary is a smooth closed curve around the disk, and the mislabelled point is outvoted by its neighbours: ${errs} training error${errs === 1 ? '' : 's'}, that point itself${errs === 1 ? '' : ' among them'}.`;
  });
});

QV.register('s4-w4', function (q) {
  const { s, svg, axes, steps, table, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const ACT = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1], PRE = [1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1];
  const OUT = ACT.map((a, i) => (a ? (PRE[i] ? 'TP' : 'FN') : (PRE[i] ? 'FP' : 'TN')));
  const CNT = { TP: 0, FP: 0, FN: 0, TN: 0 };
  OUT.forEach(o => { CNT[o]++; });
  const good = o => o === 'TP' || o === 'TN';

  table(viz('given-a'), [{ text: 'Example', cls: 'l' }].concat(ACT.map((v, i) => String(i + 1))),
    [[{ text: 'Actual', cls: 'l' }].concat(ACT.map(String)), [{ text: 'Predicted', cls: 'l' }].concat(PRE.map(String))]);

  // Figure 1: examples to confusion-matrix cells
  const cm = svg(viz('cm'), 780, 310, { label: 'Twelve examples with actual and predicted labels and their outcome, and the confusion matrix with rows predicted and columns actual', minWidth: 600 });
  const T = { x0: 96, pitch: 56, w: 48 };
  [['example', 22], ['actual', 47], ['predicted', 83], ['outcome', 118]].forEach(([l, y]) => s('text', { x: T.x0 - 10, y, dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, cm, l));
  const tiles = OUT.map((o, i) => {
    const g = s('g', { class: 'fade' }, cm);
    const x = T.x0 + i * T.pitch, cx = x + T.w / 2;
    s('text', { x: cx, y: 22, dy: '0.35em', 'text-anchor': 'middle', class: 't-muted' }, g, String(i + 1));
    [[ACT[i], 32], [PRE[i], 68]].forEach(([v, y]) => {
      s('rect', { x, y, width: T.w, height: 30, rx: 4, class: v ? 'f-pri' : 'f-seg' }, g);
      s('text', { x: cx, y: y + 15, dy: '0.35em', 'text-anchor': 'middle', class: v ? 't-on t-bold' : 't-fg' }, g, String(v));
    });
    s('text', { x: cx, y: 118, dy: '0.35em', 'text-anchor': 'middle', class: (good(o) ? 't-ok' : 't-bad') + ' t-bold' }, g, o);
    return g;
  });
  const MX = { x: 330, y: 176, w: 130, h: 56 };
  s('text', { x: MX.x + MX.w / 2, y: MX.y - 10, 'text-anchor': 'middle', class: 't-fg' }, cm, 'actual positive');
  s('text', { x: MX.x + MX.w * 1.5, y: MX.y - 10, 'text-anchor': 'middle', class: 't-fg' }, cm, 'actual negative');
  s('text', { x: MX.x - 10, y: MX.y + MX.h / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-fg' }, cm, 'predicted positive');
  s('text', { x: MX.x - 10, y: MX.y + MX.h * 1.5, dy: '0.35em', 'text-anchor': 'end', class: 't-fg' }, cm, 'predicted negative');
  const CELLS = { TP: [0, 0], FP: [0, 1], FN: [1, 0], TN: [1, 1] };
  const cellG = {};
  Object.keys(CELLS).forEach(k => {
    const [r, c] = CELLS[k];
    const g = s('g', { class: 'fade' }, cm);
    s('rect', { x: MX.x + c * MX.w, y: MX.y + r * MX.h, width: MX.w, height: MX.h, class: (good(k) ? 'f-ok-soft' : 'f-bad-soft') + ' box' }, g);
    s('text', { x: MX.x + (c + 0.5) * MX.w, y: MX.y + (r + 0.5) * MX.h, dy: '0.35em', 'text-anchor': 'middle', class: (good(k) ? 't-ok' : 't-bad') + ' t-bold t-lg' }, g, `${k} = ${CNT[k]}`);
    cellG[k] = g;
  });
  s('text', { x: MX.x + 2 * MX.w + 14, y: MX.y + MX.h, dy: '0.35em', class: 't-muted' }, cm, 'total = 12');
  const WHAT = { TP: 'Actual 1, predicted 1: positives the model caught.', FP: 'Actual 0, predicted 1: a false alarm.', FN: 'Actual 1, predicted 0: positives the model missed.', TN: 'Actual 0, predicted 0.' };
  const KEYS = ['All', 'TP', 'FP', 'FN', 'TN'];
  const cmNote = role('cm-note');
  steps(viz('cm-steps'), KEYS, i => {
    const k = KEYS[i];
    tiles.forEach((g, j) => g.classList.toggle('dim', i > 0 && OUT[j] !== k));
    Object.keys(cellG).forEach(c => cellG[c].classList.toggle('dim', i > 0 && c !== k));
    if (!i) { cmNote.textContent = `All 12 examples. TP = ${CNT.TP}, FN = ${CNT.FN}, FP = ${CNT.FP}, TN = ${CNT.TN}, and ${CNT.TP} + ${CNT.FN} + ${CNT.FP} + ${CNT.TN} = 12.`; return; }
    const ex = OUT.map((o, j) => (o === k ? j + 1 : 0)).filter(Boolean);
    cmNote.textContent = `${k}: example${ex.length > 1 ? 's' : ''} ${ex.join(', ')}. ${WHAT[k]}`;
  });

  // Figure 2: which cells each metric reads
  const mt = svg(viz('met'), 770, 250, { label: 'Confusion matrix with the cells used by the chosen metric, and bars of accuracy, precision, recall and F1', minWidth: 600 });
  const SM = { x: 150, y: 50, w: 100, h: 52 };
  s('text', { x: SM.x + SM.w / 2, y: SM.y - 10, 'text-anchor': 'middle', class: 't-fg' }, mt, 'actual +');
  s('text', { x: SM.x + SM.w * 1.5, y: SM.y - 10, 'text-anchor': 'middle', class: 't-fg' }, mt, 'actual −');
  s('text', { x: SM.x - 10, y: SM.y + SM.h / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-fg' }, mt, 'predicted +');
  s('text', { x: SM.x - 10, y: SM.y + SM.h * 1.5, dy: '0.35em', 'text-anchor': 'end', class: 't-fg' }, mt, 'predicted −');
  const P = CNT.TP / (CNT.TP + CNT.FP), Rc = CNT.TP / (CNT.TP + CNT.FN), F1 = 2 * P * Rc / (P + Rc), ACC = (CNT.TP + CNT.TN) / 12;
  const MET = [
    { name: 'Accuracy', v: ACC, val: '75%', den: ['TP', 'FP', 'FN', 'TN'], num: ['TP', 'TN'], f: '(TP + TN) / total = 9 / 12 = 75%',
      note: 'Accuracy = (TP + TN) / total = (4 + 5) / 12 = 75%, the share of all examples classified correctly. All four cells are in the denominator.' },
    { name: 'Precision', v: P, val: '0.80', den: ['TP', 'FP'], num: ['TP'], f: 'TP / (TP + FP) = 4 / 5 = 0.80',
      note: 'Precision = TP / (TP + FP) = 4 / 5 = 0.80. "Of all the alarms the model raised, how many were real?" Only the predicted-positive row counts.' },
    { name: 'Recall', v: Rc, val: '0.667', den: ['TP', 'FN'], num: ['TP'], f: 'TP / (TP + FN) = 4 / 6 = 0.667',
      note: 'Recall = TP / (TP + FN) = 4 / 6 = 0.667. "Of all the real positives out there, how many did the model actually catch?" Only the actual-positive column counts.' },
    { name: 'F1', v: F1, val: '0.727', den: ['TP', 'FP', 'FN'], num: ['TP'], f: '2TP / (2TP + FP + FN) = 8 / 11 = 0.727',
      note: 'F1 = 2 · 0.8 · 0.667 / (0.8 + 0.667) = 0.727, the same as 2TP / (2TP + FP + FN) = 8 / 11. The plain average of P and R would be 0.733; the harmonic mean leans toward the smaller value, recall. TN plays no part.' },
  ];
  const mdyn = s('g', {}, mt);
  const BX = { x: 500, w: 240, y0: 50, gap: 44, h: 24 };
  s('line', { x1: BX.x, x2: BX.x, y1: BX.y0 - 10, y2: BX.y0 + 3 * BX.gap + BX.h + 10, class: 'l-axis' }, mt);
  [0, 0.5, 1].forEach(v => {
    const x = BX.x + v * BX.w;
    s('line', { x1: x, x2: x, y1: BX.y0 + 3 * BX.gap + BX.h + 10, y2: BX.y0 + 3 * BX.gap + BX.h + 15, class: 'l-axis' }, mt);
    s('text', { x, y: BX.y0 + 3 * BX.gap + BX.h + 28, 'text-anchor': 'middle' }, mt, fmt(v));
  });
  const metNote = role('met-note');
  steps(viz('met-steps'), MET.map(m => m.name), i => {
    mdyn.textContent = '';
    const m = MET[i];
    Object.keys(CELLS).forEach(k => {
      const [r, c] = CELLS[k];
      const x = SM.x + c * SM.w, y = SM.y + r * SM.h;
      const inDen = m.den.indexOf(k) >= 0;
      s('rect', { x, y, width: SM.w, height: SM.h, class: (inDen ? 'f-pri-soft' : 'f-seg') + ' box' }, mdyn);
      s('text', { x: x + SM.w / 2, y: y + SM.h / 2, dy: '0.35em', 'text-anchor': 'middle', class: inDen ? 't-fg t-bold' : 't-muted' }, mdyn, `${k} ${CNT[k]}`);
      if (m.num.indexOf(k) >= 0) s('rect', { x: x + 3, y: y + 3, width: SM.w - 6, height: SM.h - 6, class: 'f-none outline-sec' }, mdyn);
    });
    s('text', { x: SM.x + SM.w, y: SM.y + 2 * SM.h + 40, 'text-anchor': 'middle', class: 't-fg t-bold t-lg' }, mdyn, m.name);
    s('text', { x: SM.x + SM.w, y: SM.y + 2 * SM.h + 62, 'text-anchor': 'middle', class: 't-fg' }, mdyn, m.f);
    MET.forEach((o, j) => {
      const y = BX.y0 + j * BX.gap;
      s('text', { x: BX.x - 8, y: y + BX.h / 2, dy: '0.35em', 'text-anchor': 'end', class: j === i ? 't-fg t-bold' : 't-muted' }, mdyn, o.name);
      s('rect', { x: BX.x, y, width: o.v * BX.w, height: BX.h, class: j === i ? 'f-pri' : 'f-pri-soft' }, mdyn);
      s('text', { x: BX.x + o.v * BX.w + 6, y: y + BX.h / 2, dy: '0.35em', class: j === i ? 't-pri t-bold' : 't-muted' }, mdyn, o.val);
    });
    metNote.textContent = m.note;
  });

  // Figure 3: regression errors, squared errors and deviations from the mean
  const H = [2.5, 5.5, 7, 8, 12], Y = [3, 5, 7, 9, 11], YB = 7;
  const E = H.map((h, i) => h - Y[i]);
  const rm = svg(viz('rm'), 700, 480, { label: 'Targets and predictions for five examples with their errors, and bars of the per-example quantity each metric adds up', minWidth: 540 });
  const TA = axes(rm, { x: 60, y: 24, w: 600, h: 190, xd: [0.5, 5.5], yd: [2, 12.5], xt: [1, 2, 3, 4, 5], yt: [3, 5, 7, 9, 11], xf: v => 'i = ' + v, yl: 'value' });
  s('line', { x1: TA.x(0.5), x2: TA.x(5.5), y1: TA.y(YB), y2: TA.y(YB), class: 's-muted dash', style: 'stroke-width: 1.5' }, rm);
  s('text', { x: TA.x(5.45), y: TA.y(YB) - 6, 'text-anchor': 'end', class: 't-muted' }, rm, 'ȳ = 7');
  const tdyn = s('g', {}, rm);
  const pts = s('g', {}, rm);
  Y.forEach((y, i) => {
    s('circle', { cx: TA.x(i + 1) - 7, cy: TA.y(y), r: 6, class: 'f-sec sep' }, pts);
    s('rect', { x: TA.x(i + 1) + 2.5, y: TA.y(H[i]) - 4.5, width: 9, height: 9, class: 'f-pri sep' }, pts);
  });
  const bdyn = s('g', {}, rm);
  const STEPS = [
    { name: 'MAE', vals: E.map(Math.abs), yd: [0, 1.2], yt: [0, 0.5, 1], mean: 0.6, lab: 'MAE = 3 / 5 = 0.6', yl: '|h − y|',
      note: 'MAE = (1/m) Σ |h − y| = (0.5 + 0.5 + 0 + 1 + 1) / 5 = 3 / 5 = 0.6. Each error counts in proportion to its size.' },
    { name: 'MSE, RMSE', vals: E.map(e => e * e), yd: [0, 1.2], yt: [0, 0.25, 0.5, 1], mean: 0.5, lab: 'MSE = 2.5 / 5 = 0.5, RMSE = √0.5 = 0.707', yl: '(h − y)²',
      note: 'MSE = (1/m) Σ (h − y)² = (0.25 + 0.25 + 0 + 1 + 1) / 5 = 2.5 / 5 = 0.5. Squaring shrinks the errors of 0.5 to 0.25, so the two errors of 1 dominate; MSE is sensitive to large errors. RMSE = √0.5 = 0.707, back in the units of y.' },
    { name: 'R²', vals: E.map(e => e * e), dev: Y.map(y => (y - YB) * (y - YB)), yd: [0, 17], yt: [0, 4, 8, 12, 16], yl: '(h − y)² and (y − ȳ)²',
      note: 'SS_res = Σ (h − y)² = 2.5 and SS_tot = Σ (y − ȳ)² = 16 + 4 + 0 + 4 + 16 = 40, the error of always predicting ȳ = 7. R² = 1 − 2.5 / 40 = 0.9375, so the model explains about 94% of the variance.' },
  ];
  const rmNote = role('rm-note');
  steps(viz('rm-steps'), STEPS.map(o => o.name), k => {
    tdyn.textContent = '';
    bdyn.textContent = '';
    const st = STEPS[k];
    Y.forEach((y, i) => {
      const x = TA.x(i + 1);
      if (st.dev) s('line', { x1: x - 18, x2: x - 18, y1: TA.y(y), y2: TA.y(YB), class: 's-ter', style: 'stroke-width: 3' }, tdyn);
      if (E[i]) s('line', { x1: x + 18, x2: x + 18, y1: TA.y(y), y2: TA.y(H[i]), class: 's-pri', style: 'stroke-width: 3' }, tdyn);
      if (E[i]) s('text', { x: x + 25, y: TA.y((y + H[i]) / 2), dy: '0.35em', class: 't-pri t-sm t-bold' }, tdyn, (E[i] > 0 ? '+' : '−') + fmt(Math.abs(E[i])));
    });
    const BA = axes(bdyn, { x: 60, y: 280, w: 600, h: 150, xd: [0.5, 5.5], yd: st.yd, xt: [1, 2, 3, 4, 5], yt: st.yt, xf: v => 'i = ' + v, xl: 'example', yl: st.yl });
    const lab = (cx, v, cls) => {
      const inside = BA.y(0) - BA.y(v) > 18;
      s('text', { x: cx, y: inside ? BA.y(v) + 13 : BA.y(v) - 5, 'text-anchor': 'middle', class: inside ? 't-on t-sm t-bold' : cls + ' t-sm' }, bdyn, fmt(v));
    };
    st.vals.forEach((v, i) => {
      const x = BA.x(i + 1), w = st.dev ? 22 : 36, x0 = st.dev ? x + 2 : x - w / 2;
      if (v) s('rect', { x: x0, y: BA.y(v), width: w, height: BA.y(0) - BA.y(v), class: 'f-pri' }, bdyn);
      lab(x0 + w / 2, v, 't-pri');
      if (st.dev) {
        const d = st.dev[i];
        if (d) s('rect', { x: x - 24, y: BA.y(d), width: 22, height: BA.y(0) - BA.y(d), class: 'f-ter' }, bdyn);
        lab(x - 13, d, 't-ter');
      }
    });
    if (st.mean != null) {
      s('line', { x1: BA.x(0.5), x2: BA.x(5.5), y1: BA.y(st.mean), y2: BA.y(st.mean), class: 's-ok dash', style: 'stroke-width: 1.5' }, bdyn);
      s('text', { x: BA.x(0.6), y: BA.y(1.12), class: 't-ok t-bold' }, bdyn, st.lab);
    } else {
      s('text', { x: BA.x(3), y: BA.y(15.5), 'text-anchor': 'middle', class: 't-fg' }, bdyn, 'Σ (h − y)² = 2.5  vs  Σ (y − ȳ)² = 40');
      s('text', { x: BA.x(3), y: BA.y(12.5), 'text-anchor': 'middle', class: 't-ok t-bold' }, bdyn, 'R² = 1 − 2.5 / 40 = 0.9375');
    }
    rmNote.textContent = st.note;
  });
});

QV.register('s4-w5', function (q) {
  const { s, svg, axes, line, arrow, steps, table, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const NAMES = ['A', 'B', 'C', 'D', 'E'];
  const P = { A: [1, 2], B: [2, 1], C: [5, 4], D: [6, 5], E: [9, 8] };
  const d2 = (u, v) => (u[0] - v[0]) ** 2 + (u[1] - v[1]) ** 2;
  const pt = v => `(${fmt(v[0], 3)}, ${fmt(v[1], 3)})`;
  const LO = { A: [-9, -8, 'end'], B: [9, 14, 'start'], C: [-9, -8, 'end'], D: [-9, -8, 'end'], E: [-9, -8, 'end'] };
  const diamond = (g, x, y, r, cls) => s('polygon', { points: `${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`, class: cls }, g);

  // Figure 1: D(x)² from C and the sampling probabilities
  const pp = svg(viz('pp'), 640, 392, { label: 'Five points with lines from the first centroid C labelled by squared distance, and a stacked bar of the probabilities of becoming the second centroid', minWidth: 520 });
  const ax = axes(pp, { x: 40, y: 24, w: 360, h: 324, xd: [0, 10], yd: [0, 9], xt: [0, 2, 4, 6, 8, 10], yt: [0, 3, 6, 9], xl: 'x', yl: 'y' });
  const DC = NAMES.map(n => d2(P[n], P.C));
  const SUM = DC.reduce((a, v) => a + v, 0);
  NAMES.forEach(n => { if (n !== 'C') line(pp, [[ax.x(P.C[0]), ax.y(P.C[1])], [ax.x(P[n][0]), ax.y(P[n][1])]], 's-muted').setAttribute('style', 'stroke-width: 1.5'); });
  const LBL = { A: [-4, -10], B: [10, 14], D: [-10, -12], E: [-8, -10] };
  NAMES.forEach((n, i) => {
    if (n === 'C') return;
    const m = [(P[n][0] + P.C[0]) / 2, (P[n][1] + P.C[1]) / 2];
    s('text', { x: ax.x(m[0]) + LBL[n][0], y: ax.y(m[1]) + LBL[n][1], 'text-anchor': 'middle', class: 't-fg t-bold halo' }, pp, String(DC[i]));
  });
  NAMES.forEach(n => s('circle', { cx: ax.x(P[n][0]), cy: ax.y(P[n][1]), r: 5.5, class: (n === 'E' ? 'f-pri' : 'f-fg') + ' sep' }, pp));
  diamond(pp, ax.x(5), ax.y(4), 9, 'f-ter sep');
  const PL = { A: [0, 20, 'middle'], B: [9, 4, 'start'], C: [-12, -10, 'end'], D: [-8, -14, 'end'], E: [10, 4, 'start'] };
  NAMES.forEach(n => s('text', { x: ax.x(P[n][0]) + PL[n][0], y: ax.y(P[n][1]) + PL[n][1], 'text-anchor': PL[n][2], class: 't-fg' }, pp, `${n} (${P[n][0]}, ${P[n][1]})`));
  s('text', { x: ax.x(5) + 12, y: ax.y(4) + 14, class: 't-ter t-sm t-bold' }, pp, 'first centroid');
  const SB = { x: 470, w: 40, top: 24, h: 324 };
  s('text', { x: SB.x, y: 14, class: 't-fg t-bold' }, pp, 'P(second centroid)');
  let y0 = SB.top + SB.h;
  NAMES.forEach((n, i) => {
    if (!DC[i]) return;
    const hh = DC[i] / SUM * SB.h;
    y0 -= hh;
    s('rect', { x: SB.x, y: y0, width: SB.w, height: hh, class: (n === 'E' ? 'f-pri' : 'f-pri-soft') + ' sep' }, pp);
    s('text', { x: SB.x + SB.w + 8, y: y0 + hh / 2, dy: '0.35em', class: n === 'E' ? 't-pri t-bold' : 't-fg' }, pp, `${n} ${DC[i]}/${SUM} = ${(DC[i] / SUM).toFixed(3)}`);
  });
  s('text', { x: SB.x + SB.w + 8, y: SB.top + SB.h + 18, class: 't-muted' }, pp, 'C 0/72 = 0');

  // Figures 2 and 3: K-Means from two different starts
  function kmeans(key, second) {
    const cent0 = [P.C, P[second]];
    const assign = cs => NAMES.map(n => (d2(P[n], cs[0]) <= d2(P[n], cs[1]) ? 0 : 1));
    const mean = (lab, j) => {
      const m = NAMES.filter((n, i) => lab[i] === j);
      return [m.reduce((a, n) => a + P[n][0], 0) / m.length, m.reduce((a, n) => a + P[n][1], 0) / m.length];
    };
    const lab1 = assign(cent0);
    const cent1 = [mean(lab1, 0), mean(lab1, 1)];
    const lab2 = assign(cent1);
    const J = NAMES.reduce((a, n, i) => a + d2(P[n], cent1[lab2[i]]), 0);
    const el = svg(viz(key), 640, 336, { label: `K-Means with K = 2 from centroids C and ${second}: assignment, update and convergence`, minWidth: 500 });
    const kx = axes(el, { x: 40, y: 20, w: 320, h: 288, xd: [0, 10], yd: [0, 9], xt: [0, 2, 4, 6, 8, 10], yt: [0, 3, 6, 9] });
    const dyn = s('g', {}, el);
    const host = viz(key + '-table');
    const note = role(key + '-note');
    const CL = ['pri', 'sec'];
    const members = lab => [0, 1].map(j => '{' + NAMES.filter((n, i) => lab[i] === j).join(', ') + '}');
    const drawCent = (cs, hollow) => cs.forEach((c, j) => {
      const x = kx.x(c[0]), y = kx.y(c[1]);
      diamond(dyn, x, y, 9, hollow ? 'f-none s-muted dash' : `f-${CL[j]} sep`);
      if (!hollow) {
        const left = c[0] < 3;
        s('text', { x: x + (left ? -11 : 11), y: y + 15, 'text-anchor': left ? 'end' : 'start', class: `t-${CL[j]} t-bold` }, dyn, j ? 'μ₂' : 'μ₁');
      }
    });
    const drawPts = lab => NAMES.forEach((n, i) => {
      s('circle', { cx: kx.x(P[n][0]), cy: kx.y(P[n][1]), r: 5.5, class: (lab ? `f-${CL[lab[i]]}` : 'f-fg') + ' sep' }, dyn);
      s('text', { x: kx.x(P[n][0]) + LO[n][0], y: kx.y(P[n][1]) + LO[n][1], 'text-anchor': LO[n][2], class: 't-fg t-bold' }, dyn, n);
    });
    const links = (lab, cs) => NAMES.forEach((n, i) => {
      line(dyn, [[kx.x(P[n][0]), kx.y(P[n][1])], [kx.x(cs[lab[i]][0]), kx.y(cs[lab[i]][1])]], `s-${CL[lab[i]]}`).setAttribute('style', 'stroke-width: 1.5; opacity: 0.6');
    });
    const side = rows => rows.forEach(([t, cls], i) => s('text', { x: 392, y: 40 + i * 24, class: cls }, dyn, t));
    const distTable = (cs, lab) => table(host, ['point', 'd² to μ₁ ' + pt(cs[0]), 'd² to μ₂ ' + pt(cs[1]), 'cluster'],
      NAMES.map((n, i) => [{ text: n, cls: 'l' }, { text: fmt(d2(P[n], cs[0]), 3), cls: lab[i] === 0 ? 'hl' : '' }, { text: fmt(d2(P[n], cs[1]), 3), cls: lab[i] === 1 ? 'hl' : '' }, lab[i] ? 'μ₂' : 'μ₁']));
    steps(viz(key + '-steps'), ['Start', 'Assign', 'Update', 'Assign again'], k => {
      dyn.textContent = '';
      host.textContent = '';
      if (k === 0) {
        drawPts(null);
        drawCent(cent0);
        side([['μ₁ = C ' + pt(P.C), 't-pri t-bold'], [`μ₂ = ${second} ` + pt(P[second]), 't-sec t-bold']]);
        table(host, ['centroid', 'start'], [[{ text: 'μ₁', cls: 'l' }, 'C ' + pt(P.C)], [{ text: 'μ₂', cls: 'l' }, second + ' ' + pt(P[second])]]);
        note.textContent = `Start: the two centroids are the data points C and ${second}.`;
      } else if (k === 1) {
        links(lab1, cent0);
        drawPts(lab1);
        drawCent(cent0);
        side([['iteration 1', 't-fg t-bold'], [members(lab1)[0], 't-pri t-bold'], [members(lab1)[1], 't-sec t-bold']]);
        distTable(cent0, lab1);
        note.textContent = `Assign: each point joins the closer centroid. Clusters ${members(lab1)[0]} and ${members(lab1)[1]}.`;
      } else if (k === 2) {
        drawCent(cent0, true);
        cent0.forEach((c, j) => {
          if (d2(c, cent1[j]) > 0.01) arrow(dyn, kx.x(c[0]), kx.y(c[1]), kx.x(cent1[j][0]), kx.y(cent1[j][1]), { cls: 'a-muted' });
        });
        drawPts(lab1);
        drawCent(cent1);
        side([['new centroids = means', 't-fg t-bold'], ['μ₁ = ' + pt(cent1[0]), 't-pri t-bold'], ['μ₂ = ' + pt(cent1[1]), 't-sec t-bold']]);
        table(host, ['centroid', 'members', 'mean'], [0, 1].map(j => [{ text: j ? 'μ₂' : 'μ₁', cls: 'l' }, members(lab1)[j], pt(cent1[j])]));
        note.textContent = `Update: each centroid moves to the mean of its cluster, μ₁ = ${pt(cent1[0])} and μ₂ = ${pt(cent1[1])}.`;
      } else {
        links(lab2, cent1);
        drawPts(lab2);
        drawCent(cent1);
        side([['iteration 2: no change', 't-fg t-bold'], [members(lab2)[0], 't-pri t-bold'], [members(lab2)[1], 't-sec t-bold'], ['J = ' + fmt(J, 2), 't-ok t-bold t-xl']]);
        distTable(cent1, lab2);
        const parts = NAMES.map((n, i) => fmt(d2(P[n], cent1[lab2[i]]), 3)).join(' + ');
        note.textContent = `Assign again: every point keeps its cluster, so the centroids stop moving. Converged. J = ${parts} = ${fmt(J, 2)}.`;
      }
    }, 3);
  }
  kmeans('kmE', 'E');
  kmeans('kmA', 'A');

  // Figure 4: elbow curve and the best clustering for each K
  const JS = [71.2, 18.33, 2.0, 1.0, 0];
  const BEST = [[['A', 'B', 'C', 'D', 'E']], [['A', 'B'], ['C', 'D', 'E']], [['A', 'B'], ['C', 'D'], ['E']], [['A', 'B'], ['C'], ['D'], ['E']], [['A'], ['B'], ['C'], ['D'], ['E']]];
  const COL = ['pri', 'sec', 'ter', 'ok', 'muted'];
  const el = svg(viz('elbow'), 700, 320, { label: 'Best J against K from 1 to 5 with the elbow at K = 3, and the best clustering of the five points for the chosen K', minWidth: 540 });
  const ex = axes(el, { x: 56, y: 30, w: 300, h: 220, xd: [0.5, 5.5], yd: [0, 80], xt: [1, 2, 3, 4, 5], yt: [0, 20, 40, 60, 80], xl: 'K (number of clusters)', yl: 'best J' });
  line(el, JS.map((v, i) => [ex.x(i + 1), ex.y(v)]), 's-pri');
  const DROP = ['−52.9', '−16.3'];
  JS.forEach((v, i) => {
    s('circle', { cx: ex.x(i + 1), cy: ex.y(v), r: 5, class: 'f-pri sep' }, el);
    s('text', { x: ex.x(i + 1) + 9, y: ex.y(v) - 9, class: 't-fg t-bold' }, el, fmt(v, 2));
  });
  DROP.forEach((t, i) => {
    const mxv = (i + 1.5), myv = (JS[i] + JS[i + 1]) / 2;
    s('text', { x: ex.x(mxv) - 8, y: ex.y(myv), 'text-anchor': 'end', class: 't-muted t-sm' }, el, t);
  });
  s('text', { x: ex.x(4.5), y: ex.y(14), 'text-anchor': 'middle', class: 't-muted t-sm' }, el, 'then −1.0 and −1.0');
  s('circle', { cx: ex.x(3), cy: ex.y(2), r: 11, class: 's-ok' }, el);
  s('text', { x: ex.x(3), y: ex.y(2) - 36, 'text-anchor': 'middle', class: 't-ok t-bold halo' }, el, 'elbow');
  const sx = axes(el, { x: 420, y: 30, w: 260, h: 234, xd: [0, 10], yd: [0, 9], xt: [0, 2, 4, 6, 8, 10], yt: [0, 3, 6, 9] });
  const edyn = s('g', {}, el);
  const ENOTES = [
    'K = 1: one cluster with centroid (4.6, 4). J = 71.2.',
    'K = 2: {A, B} and {C, D, E}, J = 18.33, the result of (c). The drop from K = 1 is 52.9.',
    'K = 3: {A, B}, {C, D}, {E}. J = 1 + 1 + 0 = 2.0, another drop of 16.3. This is the elbow; after it the curve is almost flat.',
    'K = 4: split {A, B} or {C, D}, both give J = 1.0. Only 1.0 is saved.',
    'K = 5: every point is its own cluster and J = 0. The lowest J is not the goal.',
  ];
  const elbowNote = role('elbow-note');
  steps(viz('elbow-steps'), [1, 2, 3, 4, 5].map(k => 'K = ' + k), k => {
    edyn.textContent = '';
    s('line', { x1: ex.x(k + 1), x2: ex.x(k + 1), y1: ex.y(0), y2: ex.y(80), class: 's-fg dash', style: 'opacity: 0.35' }, edyn);
    BEST[k].forEach((grp, j) => {
      const c = [grp.reduce((a, n) => a + P[n][0], 0) / grp.length, grp.reduce((a, n) => a + P[n][1], 0) / grp.length];
      grp.forEach(n => {
        line(edyn, [[sx.x(P[n][0]), sx.y(P[n][1])], [sx.x(c[0]), sx.y(c[1])]], `s-${COL[j]}`).setAttribute('style', 'stroke-width: 1.5; opacity: 0.6');
        s('circle', { cx: sx.x(P[n][0]), cy: sx.y(P[n][1]), r: 5.5, class: `f-${COL[j]} sep` }, edyn);
        s('text', { x: sx.x(P[n][0]) + LO[n][0], y: sx.y(P[n][1]) + LO[n][1], 'text-anchor': LO[n][2], class: 't-fg t-bold' }, edyn, n);
      });
      if (grp.length > 1) diamond(edyn, sx.x(c[0]), sx.y(c[1]), 6, `f-${COL[j]} sep`);
    });
    s('text', { x: sx.x(10), y: sx.y(0.6), 'text-anchor': 'end', class: 't-fg t-bold' }, edyn, `K = ${k + 1}, J = ${fmt(JS[k], 2)}`);
    elbowNote.textContent = ENOTES[k];
  }, 2);
});

QV.register('s4-w6', function (q) {
  const { s, svg, axes, steps, table, box, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  // Link, Known sender, Attachment, Spam
  const ROWS = [[1, 0, 0, 1], [1, 0, 1, 1], [1, 1, 0, 0], [0, 0, 0, 0], [0, 1, 1, 0], [1, 0, 0, 1], [0, 0, 0, 0], [0, 1, 0, 0], [1, 1, 1, 0], [0, 0, 1, 1], [1, 0, 1, 1], [0, 1, 0, 0]].map((r, i) => ({ n: i + 1, v: r }));
  const ATT = ['Link', 'Known sender', 'Attachment'];
  const yn = v => (v ? 'Yes' : 'No');
  const H = (a, b) => [a, b].reduce((e, x) => (x ? e - x / (a + b) * Math.log2(x / (a + b)) : e), 0);
  const count = rs => { const y = rs.filter(r => r.v[3]).length; return { y, n: rs.length - y, E: H(y, rs.length - y) }; };
  const split = (rs, a) => {
    const par = count(rs);
    const kids = [1, 0].map(v => { const sub = rs.filter(r => r.v[a] === v); return Object.assign({ v, rows: sub.map(r => r.n), size: sub.length }, count(sub)); });
    const W = kids.reduce((acc, k) => acc + k.size / rs.length * k.E, 0);
    return { par, kids, W, IG: par.E - W, total: rs.length };
  };
  const f3 = v => v.toFixed(3);

  table(viz('given'), ['#', 'Link', 'Known sender', 'Attachment', 'Spam'],
    ROWS.map(r => [String(r.n), yn(r.v[0]), yn(r.v[1]), yn(r.v[2]), { text: yn(r.v[3]), cls: r.v[3] ? 'hl' : '' }]));

  const PX = 13.33;
  const bar = (g, cx, y, c) => {
    const w = (c.y + c.n) * PX, x = cx - w / 2;
    if (c.y) s('rect', { x, y, width: c.y * PX, height: 22, class: 'f-pri sep' }, g);
    if (c.n) s('rect', { x: x + c.y * PX, y, width: c.n * PX, height: 22, class: 'f-sec sep' }, g);
    if (c.y) s('text', { x: x + c.y * PX / 2, y: y + 11, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, g, String(c.y));
    if (c.n) s('text', { x: x + c.y * PX + c.n * PX / 2, y: y + 11, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, g, String(c.n));
  };
  // Split diagram on the left, information-gain chart on the right
  function drawSplit(g, sp, title, attName) {
    const PCX = 230;
    s('text', { x: PCX, y: 26, 'text-anchor': 'middle', class: 't-fg t-bold' }, g, title);
    bar(g, PCX, 36, sp.par);
    s('text', { x: PCX, y: 76, 'text-anchor': 'middle', class: 't-fg' }, g, `${sp.par.y} spam / ${sp.par.n} not, E = ${f3(sp.par.E)}`);
    const KX = [110, 350];
    sp.kids.forEach((k, i) => {
      s('line', { x1: PCX, y1: 86, x2: KX[i], y2: 140, class: 's-muted', style: 'stroke-width: 1.5' }, g);
      s('text', { x: (PCX + KX[i]) / 2 + (i ? 10 : -10), y: 112, 'text-anchor': i ? 'start' : 'end', class: 't-fg t-bold' }, g, `${attName} = ${yn(k.v)}`);
      s('text', { x: KX[i], y: 154, 'text-anchor': 'middle', class: 't-sm' }, g, k.size ? 'rows ' + k.rows.join(', ') : 'no rows');
      if (k.size) bar(g, KX[i], 162, k);
      s('text', { x: KX[i], y: 202, 'text-anchor': 'middle', class: k.E === 0 ? 't-ok t-bold' : 't-fg' }, g, `${k.y}/${k.n}, E = ${k.E === 0 ? '0, pure' : f3(k.E)}`);
      s('text', { x: KX[i], y: 218, 'text-anchor': 'middle', class: 't-muted t-sm' }, g, `weight ${k.size}/${sp.total}`);
    });
    const terms = sp.kids.map(k => `${k.size}/${sp.total} · ${k.E === 0 ? '0' : f3(k.E)}`).join(' + ');
    s('text', { x: PCX, y: 256, 'text-anchor': 'middle', class: 't-fg' }, g, `weighted E = ${terms} = ${f3(sp.W)}`);
    s('text', { x: PCX, y: 280, 'text-anchor': 'middle', class: 't-ok t-bold t-lg' }, g, `IG = ${f3(sp.par.E)} − ${f3(sp.W)} = ${f3(sp.IG)}`);
  }
  function drawIG(g, items, sel, yd, yt, title) {
    const ix = axes(g, { x: 540, y: 40, w: 190, h: 200, xd: [0, items.length], yd, xt: [], yt, yf: v => fmt(v), yl: title });
    const best = items.reduce((m, o, i) => (o.ig > items[m].ig ? i : m), 0);
    items.forEach((o, i) => {
      const cx = ix.x(i + 0.5);
      s('rect', { x: cx - 22, y: ix.y(o.ig), width: 44, height: ix.y(0) - ix.y(o.ig), class: i === sel ? 'f-pri' : 'f-pri-soft' }, g);
      s('text', { x: cx, y: ix.y(o.ig) - 6, 'text-anchor': 'middle', class: i === best ? 't-ok t-bold' : 't-fg' }, g, f3(o.ig));
      s('text', { x: cx, y: ix.y(0) + 16, 'text-anchor': 'middle', class: i === sel ? 't-fg t-bold' : 't-muted' }, g, o.name);
    });
  }

  // Figure 1: root candidates
  const rt = svg(viz('root'), 760, 300, { label: 'Split of the 12 emails by the chosen attribute with branch counts and entropies, and the information gain of each attribute', minWidth: 600 });
  const rdyn = s('g', {}, rt);
  const ORDER = [1, 0, 2];
  const RS = ORDER.map(a => split(ROWS, a));
  const SHORT = ['Known', 'Link', 'Attach.'];
  const RNOTES = [
    'Known sender: the Yes branch holds 5 emails, all not spam, so it is pure. The No branch holds 5 spam and 2 not spam. IG = 0.476, the largest, so Known sender becomes the root.',
    'Link: both branches stay mixed, 4/2 and 1/5. IG = 0.196.',
    'Attachment: both branches stay mixed, 3/2 and 2/5, almost as uncertain as the whole set. IG = 0.072, the smallest.',
  ];
  const rootNote = role('root-note');
  steps(viz('root-steps'), ['Known sender', 'Link', 'Attachment'], i => {
    rdyn.textContent = '';
    drawSplit(rdyn, RS[i], 'all 12 emails', ATT[ORDER[i]]);
    drawIG(rdyn, RS.map((sp, j) => ({ name: SHORT[j], ig: sp.IG })), i, [0, 0.5], [0, 0.1, 0.2, 0.3, 0.4, 0.5], 'information gain at the root');
    rootNote.textContent = RNOTES[i];
  });

  // Figure 2: the Known = No branch, then Link = No
  const br = svg(viz('br'), 760, 300, { label: 'Splits inside the branch Known sender = No, and then inside Link = No, with information gains', minWidth: 600 });
  const bdyn = s('g', {}, br);
  const KN = ROWS.filter(r => r.v[1] === 0);
  const KNLN = KN.filter(r => r.v[0] === 0);
  const B1 = split(KN, 0), B2 = split(KN, 2), B3 = split(KNLN, 2);
  const BNOTES = [
    'Link inside Known = No: Link = Yes gives 4 spam, pure; Link = No leaves 1 spam / 2 not. IG = 0.863 − 3/7 · 0.918 = 0.470.',
    'Attachment inside Known = No: Attachment = Yes gives 3 spam, pure; Attachment = No leaves 2/2, entropy 1. IG = 0.863 − 4/7 · 1 = 0.292. Link wins: its pure child is bigger and its impure child smaller.',
    'Last impure node, Known = No and Link = No (rows 4, 7, 10). Attachment splits it into 1/0 and 0/2, both pure. IG = 0.918, the whole entropy of the node.',
  ];
  const brNote = role('br-note');
  steps(viz('br-steps'), ['Link', 'Attachment', 'Then: Link = No'], i => {
    bdyn.textContent = '';
    if (i < 2) {
      drawSplit(bdyn, i ? B2 : B1, 'Known = No: rows ' + KN.map(r => r.n).join(', '), i ? 'Attachment' : 'Link');
      drawIG(bdyn, [{ name: 'Link', ig: B1.IG }, { name: 'Attach.', ig: B2.IG }], i, [0, 1], [0, 0.25, 0.5, 0.75, 1], 'IG inside Known = No');
    } else {
      drawSplit(bdyn, B3, 'Known = No, Link = No: rows ' + KNLN.map(r => r.n).join(', '), 'Attachment');
      drawIG(bdyn, [{ name: 'Attach.', ig: B3.IG }], 0, [0, 1], [0, 0.25, 0.5, 0.75, 1], 'IG inside Link = No');
    }
    brNote.textContent = BNOTES[i];
  });

  // Figure 3: final tree with the two query paths
  const tr = svg(viz('tree'), 760, 350, { label: 'Final decision tree: Known sender at the root, then Link, then Attachment, with the paths of the two new emails', minWidth: 600 });
  const N = {
    root: { x: 300, y: 14, w: 170, t: 'Known sender?\n[Yes=5, No=7]' },
    ns1: { x: 120, y: 104, w: 120, t: 'Not spam\n[0/5]', leaf: 'sec' },
    link: { x: 440, y: 104, w: 160, t: 'Link?\n[Yes=5, No=2]' },
    sp1: { x: 320, y: 194, w: 120, t: 'Spam\n[4/0]', leaf: 'pri' },
    att: { x: 560, y: 194, w: 170, t: 'Attachment?\n[Yes=1, No=2]' },
    sp2: { x: 460, y: 284, w: 120, t: 'Spam\n[1/0]', leaf: 'pri' },
    ns2: { x: 660, y: 284, w: 120, t: 'Not spam\n[0/2]', leaf: 'sec' },
  };
  const EDGES = [['root', 'ns1', 'Yes'], ['root', 'link', 'No'], ['link', 'sp1', 'Yes'], ['link', 'att', 'No'], ['att', 'sp2', 'Yes'], ['att', 'ns2', 'No']];
  const NH = 44;
  const edgeEls = {};
  EDGES.forEach(([a, b, l]) => {
    const A = N[a], B = N[b];
    edgeEls[a + b] = s('line', { x1: A.x, y1: A.y + NH, x2: B.x, y2: B.y, class: 's-muted', style: 'stroke-width: 1.5' }, tr);
    const left = B.x < A.x;
    s('text', { x: (A.x + B.x) / 2 + (left ? -6 : 6), y: (A.y + NH + B.y) / 2 - 6, 'text-anchor': left ? 'end' : 'start', class: 't-fg t-bold' }, tr, l);
  });
  Object.keys(N).forEach(k => {
    const o = N[k];
    box(tr, o.x - o.w / 2, o.y, o.w, NH, o.t, { cls: o.leaf ? 'f-' + o.leaf : 'f-surface', textCls: o.leaf ? 't-on t-bold' : 't-fg', lh: 15 });
  });
  const tdyn = s('g', {}, tr);
  const PATHS = [null, ['root', 'link', 'att', 'sp2'], ['root', 'ns1']];
  const TNOTES = [
    'At most three questions. A known sender means not spam. From an unknown sender, a link means spam; without a link, an attachment decides.',
    'Email 1 = {Link = No, Known = No, Attachment = Yes}. Known = No → Link = No → Attachment = Yes → Spam [1/0].',
    'Email 2 = {Link = Yes, Known = Yes, Attachment = Yes}. Known = Yes → Not spam [0/5]. One question is enough; Link and Attachment are never asked.',
  ];
  const treeNote = role('tree-note');
  steps(viz('tree-steps'), ['Final tree', 'Email 1', 'Email 2'], i => {
    tdyn.textContent = '';
    Object.keys(edgeEls).forEach(k => { edgeEls[k].setAttribute('class', 's-muted'); edgeEls[k].setAttribute('style', 'stroke-width: 1.5'); });
    const path = PATHS[i];
    if (path) {
      path.forEach((k, j) => {
        const o = N[k];
        s('rect', { x: o.x - o.w / 2 - 4, y: o.y - 4, width: o.w + 8, height: NH + 8, rx: 9, class: 'f-none s-ok' }, tdyn);
        if (j) { edgeEls[path[j - 1] + k].setAttribute('class', 's-ok'); edgeEls[path[j - 1] + k].setAttribute('style', 'stroke-width: 4'); }
      });
    }
    treeNote.textContent = TNOTES[i];
  });
});

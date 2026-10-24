QV.register('s5-w1', function (q) {
  const { s, svg, axes, line, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const nf = (v, d) => fmt(v, d).replace('-', '−');

  // Figure 1: polynomial fits of growing degree on toy data
  const truth = x => 1 + 2.4 * x - 0.2 * x * x;
  const XT = [1, 2.5, 4, 5.5, 7, 8.5, 10], NT = [-1.2, -1, 1, -0.8, 1, 0.8, -0.9];
  const XS = [1.75, 3.25, 4.75, 6.25, 7.75, 9.25], NS = [-0.3, -0.3, 0.5, 0.3, 0.6, -0.5];
  const YT = XT.map((x, i) => truth(x) + NT[i]), YS = XS.map((x, i) => truth(x) + NS[i]);
  // x rescaled to [-1, 1] keeps the normal equations well conditioned up to degree 6
  const t = x => (x - 5.5) / 4.5;
  const fitPoly = d => {
    const n = d + 1;
    const A = [];
    for (let i = 0; i < n; i++) {
      A.push([]);
      for (let j = 0; j <= n; j++) A[i].push(XT.reduce((acc, x, r) => acc + t(x) ** i * (j < n ? t(x) ** j : YT[r]), 0));
    }
    for (let i = 0; i < n; i++) {
      let p = i;
      for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
      [A[i], A[p]] = [A[p], A[i]];
      for (let r = 0; r < n; r++) {
        if (r === i) continue;
        const f = A[r][i] / A[i][i];
        for (let c = i; c <= n; c++) A[r][c] -= f * A[i][c];
      }
    }
    const co = A.map((row, i) => row[n] / row[i]);
    return x => co.reduce((acc, c, k) => acc + c * t(x) ** k, 0);
  };
  const mse = (f, X, Y) => X.reduce((a, x, i) => a + (f(x) - Y[i]) ** 2, 0) / X.length;
  const fits = [1, 2, 3, 4, 5, 6].map(fitPoly);
  const TR = fits.map(f => mse(f, XT, YT)), TE = fits.map(f => mse(f, XS, YS));

  const fg = svg(viz('fit'), 720, 300, { label: 'Left: training and test points with the fitted polynomial. Right: training and test MSE for degrees 1 to 6', minWidth: 540 });
  const a1 = axes(fg, { x: 50, y: 24, w: 330, h: 220, xd: [0.5, 10.5], yd: [0, 13], xt: [1, 4, 7, 10], yt: [0, 4, 8, 12], xl: 'feature x', yl: 'target y' });
  const a2 = axes(fg, { x: 470, y: 24, w: 210, h: 220, xd: [0.5, 6.5], yd: [0, 5.5], xt: [1, 2, 3, 4, 5, 6], yt: [0, 1, 2, 3, 4, 5], xl: 'polynomial degree d', yl: 'MSE' });
  const curve = s('g', {}, fg);
  XT.forEach((x, i) => s('circle', { cx: a1.x(x), cy: a1.y(YT[i]), r: 5, class: 'f-pri' }, fg));
  XS.forEach((x, i) => s('rect', { x: a1.x(x) - 4.5, y: a1.y(YS[i]) - 4.5, width: 9, height: 9, class: 'f-sec' }, fg));
  const marker = s('g', {}, fg);
  [[TR, 's-pri', 'f-pri'], [TE, 's-sec', 'f-sec']].forEach(([V, sc, fc]) => {
    line(fg, V.map((v, i) => [a2.x(i + 1), a2.y(v)]), sc).setAttribute('style', 'stroke-width: 2');
    V.forEach((v, i) => s('circle', { cx: a2.x(i + 1), cy: a2.y(v), r: 3.5, class: fc }, fg));
  });
  const VERD = [
    '<b>d = 1, underfitting.</b> A straight line cannot follow the curve, so the error is high on the training data and on the test data.',
    '<b>d = 2, good fit.</b> Low error on both sets, and the lowest test error of all degrees. The model has the shape of the pattern, not of the noise.',
    '<b>d = 3.</b> Training error drops a little, test error rises a little. The extra term starts to follow the noise.',
    '<b>d = 4.</b> Training error keeps falling, test error keeps rising. The gap between them is the warning sign.',
    '<b>d = 5.</b> The curve bends toward individual training points. Test error is now almost five times its value at d = 2.',
    '<b>d = 6, overfitting.</b> Seven coefficients for seven points: the curve passes through every training point (training MSE 0) and swings between them, so the test error is the worst of all.',
  ];
  slider(viz('fit-slider'), { label: 'degree d', min: 1, max: 6, step: 1, value: 2 }, d => {
    const f = fits[d - 1];
    curve.textContent = '';
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const x = 0.5 + 10 * i / 200;
      pts.push([a1.x(x), a1.y(Math.max(0, Math.min(13, f(x))))]);
    }
    line(curve, pts, 's-ter');
    marker.textContent = '';
    s('line', { x1: a2.x(d), x2: a2.x(d), y1: a2.y(0), y2: a2.y(5.5), class: 's-muted dash' }, marker);
    s('circle', { cx: a2.x(d), cy: a2.y(TR[d - 1]), r: 6, class: 'f-pri' }, marker);
    s('rect', { x: a2.x(d) - 5.5, y: a2.y(TE[d - 1]) - 5.5, width: 11, height: 11, class: 'f-sec' }, marker);
    role('fit-tr').textContent = fmt(TR[d - 1], 3);
    role('fit-te').textContent = fmt(TE[d - 1], 3);
    role('fit-verdict').innerHTML = VERD[d - 1];
  });

  // Figure 2: slide 26 errors, squared vs absolute shares
  const Y = [10, 20, 30, 40, 40, 60, 70, 80, 90, 100];
  const E0 = [1, -1, -2, -5, 8, 0, -4, -2, 1, -1];
  const SST = 8440;
  const eg = svg(viz('err'), 720, 330, { label: 'Bar chart of the ten errors of the slide 26 example, and two 100 percent bars with each example share of the squared and absolute error sums', minWidth: 540 });
  const ea = axes(eg, { x: 60, y: 30, w: 620, h: 120, xd: [0.5, 10.5], yd: [-8, 17], xt: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], yt: [-5, 0, 5, 10, 15], yf: v => nf(v), xl: 'example i', yl: 'error h − y' });
  s('line', { x1: 60, x2: 680, y1: ea.y(0), y2: ea.y(0), class: 's-muted' }, eg);
  const dyn = s('g', {}, eg);
  slider(viz('err-slider'), { label: 'error of example 5', min: 0, max: 16, step: 1, value: 8 }, e5 => {
    const E = E0.map((e, i) => (i === 4 ? e5 : e));
    const sq = E.map(e => e * e), ab = E.map(Math.abs);
    const SQ = sq.reduce((a, b) => a + b, 0), AB = ab.reduce((a, b) => a + b, 0);
    dyn.textContent = '';
    E.forEach((e, i) => {
      const x = ea.x(i + 1), top = Math.min(ea.y(e), ea.y(0)), h = Math.abs(ea.y(e) - ea.y(0));
      s('rect', { x: x - 15, y: top, width: 30, height: Math.max(h, 1), class: i === 4 ? 'f-ter' : 'f-pri' }, dyn);
      s('text', { x, y: e >= 0 ? ea.y(e) - 6 : ea.y(e) + 14, 'text-anchor': 'middle', class: i === 4 ? 't-ter t-bold' : 't-fg' }, dyn, nf(e));
    });
    const bars = [
      { y: 230, v: sq, sum: SQ, title: `squared errors (h − y)²: sum ${SQ}, MSE = ${fmt(SQ / 10, 2)}` },
      { y: 290, v: ab, sum: AB, title: `absolute errors |h − y|: sum ${AB}, MAE = ${fmt(AB / 10, 2)}` },
    ];
    bars.forEach(b => {
      s('text', { x: 60, y: b.y - 8, class: 't-fg' }, dyn, b.title);
      let x = 60;
      b.v.forEach((v, i) => {
        const w = 620 * v / b.sum;
        if (w <= 0) return;
        s('rect', { x, y: b.y, width: w, height: 26, class: (i === 4 ? 'f-ter' : 'f-pri') + ' sep' }, dyn);
        if (i === 4 && w > 70) s('text', { x: x + w / 2, y: b.y + 13, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, dyn, `ex. 5: ${Math.round(100 * v / b.sum)}%`);
        else if (i !== 4 && w > 22) s('text', { x: x + w / 2, y: b.y + 13, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-sm' }, dyn, String(v));
        x += w;
      });
    });
    role('m-mse').textContent = fmt(SQ / 10, 2);
    role('m-rmse').textContent = fmt(Math.sqrt(SQ / 10), 2);
    role('m-mae').textContent = fmt(AB / 10, 2);
    role('m-r2').textContent = fmt(1 - SQ / SST, 3);
  });

  // Figure 3: R² as 1 - SS_res / SS_tot
  const H = Y.map((y, i) => y + E0[i]);
  const rg = svg(viz('r2'), 720, 336, { label: 'Actual values, predictions and the mean 54 for the slide 26 example, with bars for the total and residual sums of squares drawn to scale', minWidth: 540 });
  const ra = axes(rg, { x: 60, y: 24, w: 620, h: 170, xd: [0.5, 10.5], yd: [0, 110], xt: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], yt: [0, 25, 50, 75, 100], xl: 'example i', yl: 'value' });
  s('line', { x1: 60, x2: 680, y1: ra.y(54), y2: ra.y(54), class: 's-muted dash' }, rg);
  s('text', { x: 66, y: ra.y(54) - 6, class: 't-fg' }, rg, 'ȳ = 54');
  Y.forEach((y, i) => {
    const x = ra.x(i + 1);
    s('line', { x1: x - 9, x2: x - 9, y1: ra.y(54), y2: ra.y(y), class: 's-ter' }, rg);
    s('line', { x1: x + 9, x2: x + 9, y1: ra.y(y), y2: ra.y(H[i]), class: 's-bad', style: 'stroke-width: 3' }, rg);
    s('line', { x1: x, x2: x + 9, y1: ra.y(y), y2: ra.y(y), class: 's-line' }, rg);
    s('circle', { cx: x, cy: ra.y(y), r: 4, class: 'f-pri' }, rg);
    s('rect', { x: x + 9 - 3.5, y: ra.y(H[i]) - 3.5, width: 7, height: 7, class: 'f-sec' }, rg);
  });
  const ssLabel = (y, sb, rest) => {
    const t = s('text', { x: 60, y, class: 't-fg' }, rg, 'SS');
    s('tspan', { dy: 3, class: 't-sm' }, t, sb);
    s('tspan', { dy: -3 }, t, rest);
  };
  ssLabel(252, 'tot', ' = Σ(y − ȳ)² = 8440');
  s('rect', { x: 60, y: 262, width: 620, height: 18, class: 'f-ter' }, rg);
  ssLabel(300, 'res', ' = Σ(h − y)² = 117');
  const rw = 620 * 117 / SST;
  s('rect', { x: 60, y: 310, width: rw, height: 18, class: 'f-bad' }, rg);
  s('text', { x: 60 + rw + 8, y: 319, dy: '0.35em', class: 't-fg' }, rg, `117 / 8440 = ${fmt(117 / SST, 4)},  R² = 1 − ${fmt(117 / SST, 4)} = ${fmt(1 - 117 / SST, 3)}`);
});

QV.register('s5-w2', function (q) {
  const { s, svg, axes, plot, slider, steps, arrow, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const H2 = (...c) => { const n = c.reduce((a, b) => a + b, 0); return -c.reduce((a, x) => a + (x ? x / n * Math.log2(x / n) : 0), 0); };
  const node = (g, n, o) => {
    o = o || {};
    s('rect', { x: n.x - n.w / 2, y: n.y - 20, width: n.w, height: 40, rx: n.leaf ? 18 : 6, class: (o.cls || 'f-surface') + ' ' + (o.stroke || 'box'), style: o.op ? `opacity: ${o.op}` : null }, g);
    const tc = o.tc || 't-fg';
    s('text', { x: n.x, y: n.y - 6, dy: '0.35em', 'text-anchor': 'middle', class: tc + ' t-bold', style: o.op ? `opacity: ${o.op}` : null }, g, o.title || n.t);
    s('text', { x: n.x, y: n.y + 9, dy: '0.35em', 'text-anchor': 'middle', class: tc + ' t-sm', style: o.op ? `opacity: ${o.op}` : null }, g, n.c);
  };

  // Figure 1: terminology on the slide 34 tree
  const N = {
    root: { x: 360, y: 40, w: 130, t: 'Outlook', c: 'Yes=9, No=5' },
    hum: { x: 150, y: 150, w: 120, t: 'Humidity', c: 'Yes=2, No=3' },
    ovc: { x: 360, y: 150, w: 120, t: 'Yes', c: 'Yes=4, No=0', leaf: true },
    wind: { x: 570, y: 150, w: 120, t: 'Wind', c: 'Yes=3, No=2' },
    high: { x: 80, y: 260, w: 116, t: 'No', c: 'Yes=0, No=3', leaf: true },
    norm: { x: 220, y: 260, w: 116, t: 'Yes', c: 'Yes=2, No=0', leaf: true },
    strong: { x: 500, y: 260, w: 116, t: 'No', c: 'Yes=0, No=2', leaf: true },
    weak: { x: 640, y: 260, w: 116, t: 'Yes', c: 'Yes=3, No=0', leaf: true },
  };
  const EDGES = [
    ['root', 'hum', 'Sunny', 249, 85, 'end'], ['root', 'ovc', 'Overcast', 366, 99, 'start'], ['root', 'wind', 'Rain', 471, 85, 'start'],
    ['hum', 'high', 'High', 109, 197, 'end'], ['hum', 'norm', 'Normal', 191, 197, 'start'],
    ['wind', 'strong', 'Strong', 529, 197, 'end'], ['wind', 'weak', 'Weak', 611, 197, 'start'],
  ];
  const tg = svg(viz('term'), 720, 310, { label: 'The PlayTennis decision tree from slide 34 with Outlook at the root, Humidity and Wind as decision nodes and five leaves', minWidth: 540 });
  const layer = s('g', {}, tg);
  const TNOTES = [
    'Root node: Outlook (all 14 rows). Decision nodes: Humidity and Wind (light blue). Leaf nodes: the five rounded Yes / No boxes (green). Every arrow is one split.',
    'Root node: the first node, Outlook. The whole dataset (9 Yes, 5 No) starts dividing here.',
    'Splitting: dividing a node into sub-nodes. Outlook splits its 14 rows into Sunny (5), Overcast (4) and Rain (5).',
    'Decision nodes: sub-nodes that are split further. Humidity splits the Sunny rows, Wind splits the Rain rows.',
    'Leaf (terminal) nodes: not split any more. Each holds the final class. Here every leaf is pure, e.g. Overcast is Yes=4, No=0.',
    'Sub-tree (branch): a sub-section of the tree. The Humidity node with its two leaves is the sub-tree of the Sunny branch.',
    'Pruning: removing nodes to prevent overfitting and simplify the model. Cutting the Humidity sub-tree leaves one leaf with the majority class No (3 of 5). In practice a sub-tree is pruned when it does not improve accuracy on validation data (textbook context).',
    'Parent and child: a node that is split is the parent of the sub-nodes it produces. Wind is the parent of the Strong and Weak leaves; Outlook is the parent of Humidity, Overcast and Wind.',
  ];
  const note = role('term-note');
  steps(viz('term-steps'), ['All', 'Root node', 'Splitting', 'Decision node', 'Leaf node', 'Sub-tree', 'Pruning', 'Parent and child'], k => {
    layer.textContent = '';
    const pruned = k === 6, inPruned = id => pruned && ['hum', 'high', 'norm'].indexOf(id) >= 0;
    EDGES.forEach(([a, b, lab, lx, ly, anc]) => {
      const A = N[a], B = N[b];
      const on = k === 2 && a === 'root';
      const op = inPruned(b) ? 0.25 : null;
      const ln = s('line', { x1: A.x, y1: A.y + 20, x2: B.x, y2: B.y - 20, class: on ? 's-pri' : 's-muted', style: op ? 'opacity: 0.25' : null }, layer);
      if (on) ln.setAttribute('style', 'stroke-width: 3');
      s('text', { x: lx, y: ly, 'text-anchor': anc, class: (on ? 't-pri t-bold' : 't-muted') + ' halo', style: op ? 'opacity: 0.25' : null }, layer, lab);
    });
    Object.keys(N).forEach(id => {
      const n = N[id];
      const isDec = id === 'hum' || id === 'wind';
      let o = {};
      if (k === 0) o = id === 'root' ? { cls: 'f-pri', tc: 't-on' } : isDec ? { cls: 'f-pri-soft' } : { cls: 'f-ok-soft' };
      if (k === 1 && id === 'root') o = { cls: 'f-pri', tc: 't-on' };
      if (k === 2 && ['hum', 'ovc', 'wind'].indexOf(id) >= 0) o = { cls: 'f-pri-soft' };
      if (k === 3 && isDec) o = { cls: 'f-pri', tc: 't-on' };
      if (k === 4 && n.leaf) o = { cls: 'f-pri', tc: 't-on' };
      if (k === 5 && ['hum', 'high', 'norm'].indexOf(id) >= 0) o = { cls: 'f-sec-soft' };
      if (inPruned(id)) o = { op: 0.25 };
      if (k === 7 && id === 'wind') o = { cls: 'f-pri', tc: 't-on' };
      if (k === 7 && (id === 'strong' || id === 'weak')) o = { cls: 'f-sec-soft' };
      node(layer, n, o);
    });
    if (k === 5) {
      s('rect', { x: 14, y: 124, width: 272, height: 164, rx: 10, class: 's-sec dash', style: 'stroke-width: 2' }, layer);
      s('text', { x: 20, y: 116, class: 't-sec t-bold' }, layer, 'sub-tree (branch)');
    }
    if (pruned) {
      node(layer, { x: 150, y: 150, w: 120, t: 'No', c: 'Yes=2, No=3', leaf: true }, { cls: 'f-sec-soft', stroke: 'outline-sec' });
      [[105, 215], [195, 215]].forEach(([x, y]) => s('line', { x1: x - 9, y1: y + 6, x2: x + 9, y2: y - 6, class: 's-bad', style: 'stroke-width: 3' }, layer));
      s('text', { x: 150, y: 116, 'text-anchor': 'middle', class: 't-sec t-bold' }, layer, 'pruned to one leaf');
    }
    if (k === 7) {
      s('text', { x: 636, y: 150, dy: '0.35em', class: 't-pri t-bold' }, layer, 'parent');
      s('text', { x: 500, y: 296, 'text-anchor': 'middle', class: 't-sec t-bold' }, layer, 'child');
      s('text', { x: 640, y: 296, 'text-anchor': 'middle', class: 't-sec t-bold' }, layer, 'child');
    }
    note.textContent = TNOTES[k];
  });

  // Figure 2: ID3, C4.5 and CART on the PlayTennis root
  const ag = svg(viz('algos'), 720, 270, { label: 'The PlayTennis root split by ID3 with information gain, by C4.5 with gain ratio, and by CART with a binary Gini split', minWidth: 560 });
  const kids = (g, ch, y) => ch.forEach(([x, w, name, yes, no]) => {
    s('rect', { x: x - w / 2, y: y - 20, width: w, height: 40, rx: 6, class: 'f-surface box' }, g);
    s('text', { x, y: y - 6, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, g, name);
    const c = s('text', { x, y: y + 9, dy: '0.35em', 'text-anchor': 'middle', class: 't-sm' }, g);
    s('tspan', { class: 't-pri t-bold' }, c, String(yes));
    s('tspan', { class: 't-muted' }, c, ' / ');
    s('tspan', { class: 't-sec t-bold' }, c, String(no));
  });
  const gini = (a, b) => 1 - (a / (a + b)) ** 2 - (b / (a + b)) ** 2;
  const E0 = H2(9, 5), WE = (5 * H2(2, 3) + 4 * H2(4, 0) + 5 * H2(3, 2)) / 14;
  const SI = H2(5, 4, 5), WG = (4 * gini(4, 0) + 10 * gini(5, 5)) / 14;
  const PANELS = [
    { t: 'ID3', sub: 'entropy, information gain', root: 'Outlook', lines: [`IG = ${E0.toFixed(3)} − ${WE.toFixed(3)}`, `= ${(E0 - WE).toFixed(3)}`, 'highest IG wins'] },
    { t: 'C4.5', sub: 'gain ratio, an improved ID3', root: 'Outlook', lines: ['GR = IG / SplitInfo', `= ${(E0 - WE).toFixed(3)} / ${SI.toFixed(3)} = ${((E0 - WE) / SI).toFixed(3)}`, 'handles missing, continuous'] },
    { t: 'CART', sub: 'Gini impurity, binary splits', root: 'Outlook = Overcast?', lines: [`Gini gain = ${gini(9, 5).toFixed(3)} − ${WG.toFixed(3)}`, `= ${(gini(9, 5) - WG).toFixed(3)}`, 'also does regression'] },
  ];
  PANELS.forEach((p, i) => {
    const x0 = i * 240, cx = x0 + 120;
    if (i) s('line', { x1: x0, x2: x0, y1: 8, y2: 262, class: 's-line' }, ag);
    s('text', { x: cx, y: 20, 'text-anchor': 'middle', class: 't-fg t-bold t-lg' }, ag, p.t);
    s('text', { x: cx, y: 36, 'text-anchor': 'middle', class: 't-sm' }, ag, p.sub);
    const rw = i === 2 ? 170 : 120;
    s('rect', { x: cx - rw / 2, y: 52, width: rw, height: 40, rx: 6, class: 'f-pri-soft box' }, ag);
    s('text', { x: cx, y: 66, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, ag, p.root);
    const rc = s('text', { x: cx, y: 81, dy: '0.35em', 'text-anchor': 'middle', class: 't-sm' }, ag);
    s('tspan', { class: 't-pri t-bold' }, rc, '9');
    s('tspan', { class: 't-muted' }, rc, ' / ');
    s('tspan', { class: 't-sec t-bold' }, rc, '5');
    if (i < 2) {
      const ch = [[x0 + 46, 66, 'Sunny', 2, 3], [x0 + 120, 66, 'Overcast', 4, 0], [x0 + 194, 66, 'Rain', 3, 2]];
      ch.forEach(([x]) => s('line', { x1: cx, y1: 92, x2: x, y2: 142, class: 's-muted' }, ag));
      kids(ag, ch, 162);
    } else {
      const ch = [[x0 + 66, 96, 'Overcast', 4, 0], [x0 + 174, 96, 'Sunny, Rain', 5, 5]];
      ch.forEach(([x]) => s('line', { x1: cx, y1: 92, x2: x, y2: 142, class: 's-muted' }, ag));
      s('text', { x: x0 + 86, y: 116, 'text-anchor': 'end', class: 't-muted' }, ag, 'yes');
      s('text', { x: x0 + 154, y: 116, class: 't-muted' }, ag, 'no');
      kids(ag, ch, 162);
    }
    p.lines.forEach((l, j) => s('text', { x: cx, y: 210 + j * 18, 'text-anchor': 'middle', class: j === 1 ? 't-ok t-bold' : j === 2 ? 't-sm' : 't-fg' }, ag, l));
  });

  // Figure 3: entropy and Gini against the share of Yes rows
  const eg = svg(viz('ent'), 720, 290, { label: 'Entropy and Gini impurity plotted against the share of Yes rows in a 14-row node, with the current node marked', minWidth: 540 });
  const ea = axes(eg, { x: 56, y: 24, w: 380, h: 200, xd: [0, 1], yd: [0, 1.05], xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 0.25, 0.5, 0.75, 1], xl: 'p₊ = share of Yes rows in the node', yl: 'impurity' });
  plot(eg, ea, p => H2(p, 1 - p), 0, 1, 200, 's-pri');
  plot(eg, ea, p => 1 - p * p - (1 - p) * (1 - p), 0, 1, 200, 's-sec');
  s('text', { x: ea.x(0.5), y: ea.y(1) + 20, 'text-anchor': 'middle', class: 't-pri t-bold halo' }, eg, 'entropy');
  s('text', { x: ea.x(0.5), y: ea.y(0.5) + 20, 'text-anchor': 'middle', class: 't-sec t-bold halo' }, eg, 'Gini');
  const em = s('g', {}, eg);
  slider(viz('ent-slider'), { label: 'Yes rows out of 14', min: 0, max: 14, step: 1, value: 9 }, k => {
    const p = k / 14, e = H2(k, 14 - k), g = gini(k, 14 - k);
    const f3 = v => (v < 1e-9 ? '0' : v.toFixed(3));
    em.textContent = '';
    s('line', { x1: ea.x(p), x2: ea.x(p), y1: ea.y(0), y2: ea.y(1.05), class: 's-muted dash' }, em);
    s('circle', { cx: ea.x(p), cy: ea.y(e), r: 5.5, class: 'f-pri' }, em);
    s('circle', { cx: ea.x(p), cy: ea.y(g), r: 5.5, class: 'f-sec' }, em);
    s('text', { x: 595, y: 40, 'text-anchor': 'middle', class: 't-fg t-bold' }, em, `node: ${k} Yes, ${14 - k} No`);
    for (let i = 0; i < 14; i++) {
      const r = Math.floor(i / 7), c = i % 7;
      s('rect', { x: 495 + c * 29, y: 56 + r * 29, width: 26, height: 26, rx: 3, class: i < k ? 'f-pri' : 'f-sec' }, em);
    }
    s('text', { x: 595, y: 146, 'text-anchor': 'middle', class: 't-pri t-lg t-bold' }, em, `E = ${f3(e)}`);
    s('text', { x: 595, y: 168, 'text-anchor': 'middle', class: 't-sec t-lg t-bold' }, em, `Gini = ${f3(g)}`);
    const pure = k === 0 || k === 14;
    s('text', { x: 595, y: 196, 'text-anchor': 'middle', class: pure ? 't-ok t-bold' : 't-fg' }, em, pure ? 'pure: becomes a leaf' : 'impure: split further');
    role('ent-e').textContent = f3(e);
    role('ent-g').textContent = f3(g);
    role('ent-verdict').innerHTML = pure ? `<b>${k} / ${14 - k}: pure node.</b> One class only, so E = 0 and the node becomes a leaf.`
      : k === 7 ? '<b>7 / 7: the most impure node.</b> E reaches its maximum of 1 (Gini 0.5). A split here gains the most.'
        : `<b>${k} / ${14 - k}:</b> p₊ = ${k}/14 = ${p.toFixed(3)}. E = ${f3(e)}${k === 9 ? ', the root entropy of PlayTennis and of Question 6' : ''}. The closer to 50/50, the higher the entropy.`;
  });

  // Figure 4: overfitting and pruning on toy 2-D data
  const YES = [[1, 2], [2, 5], [3, 1.5], [1.5, 6.3], [3.5, 6], [2.5, 3.5], [4, 3.2], [1.5, 9]];
  const NO = [[6, 2], [7, 5], [8, 8], [6.5, 7.5], [8.5, 3], [7.5, 1.5], [9, 6], [4.3, 7.8]];
  const NEW = [3.2, 9.2];
  const pg = svg(viz('prune'), 720, 300, { label: 'Toy two-feature data partitioned by a full decision tree and by the pruned tree, with the matching tree diagrams', minWidth: 560 });
  const pa = axes(pg, { x: 40, y: 20, w: 240, h: 240, xd: [0, 10], yd: [0, 10], xt: [0, 5, 10], yt: [0, 5, 10], grid: false, xl: 'x₁', yl: 'x₂' });
  const regions = s('g', {}, pg);
  YES.forEach(([a, b]) => s('circle', { cx: pa.x(a), cy: pa.y(b), r: 5, class: 'f-pri' }, pg));
  NO.forEach(([a, b]) => s('rect', { x: pa.x(a) - 4.5, y: pa.y(b) - 4.5, width: 9, height: 9, class: 'f-sec' }, pg));
  s('text', { x: pa.x(4.3) - 10, y: pa.y(7.8), dy: '0.35em', 'text-anchor': 'end', class: 't-sec t-sm t-bold' }, pg, 'noise');
  s('circle', { cx: pa.x(NEW[0]), cy: pa.y(NEW[1]), r: 6, class: 'f-ter' }, pg);
  s('text', { x: pa.x(NEW[0]) + 9, y: pa.y(NEW[1]), dy: '0.35em', class: 't-ter t-sm t-bold' }, pg, 'new');
  const trees = s('g', {}, pg);
  const tnode = (g, x, y, label, o) => {
    o = o || {};
    s('rect', { x: x - 44, y: y - 15, width: 88, height: 30, rx: o.leaf ? 15 : 5, class: (o.cls || 'f-surface') + ' box' }, g);
    s('text', { x, y, dy: '0.35em', 'text-anchor': 'middle', class: o.tc || 't-fg' }, g, label);
  };
  const tedge = (g, x1, y1, x2, y2, lab, right) => {
    s('line', { x1, y1: y1 + 15, x2, y2: y2 - 15, class: 's-muted' }, g);
    s('text', { x: (x1 + x2) / 2 + (right ? 6 : -6), y: (y1 + y2) / 2 - 4, 'text-anchor': right ? 'start' : 'end', class: 't-sm' }, g, lab);
  };
  const PNOTES = [
    'Full tree: grown until every leaf is pure. 4 leaves, depth 3, training accuracy 16/16. The splits x₂ < 7 and x₁ < 2.5 exist only to isolate one noisy No row. The new point at (3.2, 9.2) lands in that box and is called No, although the pattern around it says Yes.',
    'Pruned tree: the sub-tree under x₁ < 5 is replaced by one leaf with its majority class (8 Yes, 1 No). Training accuracy drops to 15/16, but the tree is simpler and calls the new point Yes. Pruning and stopping criteria trade a little training accuracy for better generalization.',
  ];
  const pnote = role('prune-note');
  steps(viz('prune-steps'), ['Full tree', 'Pruned tree'], k => {
    regions.textContent = '';
    trees.textContent = '';
    s('rect', { x: pa.x(0), y: pa.y(10), width: pa.x(5) - pa.x(0), height: 240, class: 'area-pri' }, regions);
    s('rect', { x: pa.x(5), y: pa.y(10), width: pa.x(10) - pa.x(5), height: 240, class: 'area-sec' }, regions);
    s('line', { x1: pa.x(5), x2: pa.x(5), y1: pa.y(0), y2: pa.y(10), class: 's-fg dash' }, regions);
    if (!k) {
      const bx = { x: pa.x(2.5), y: pa.y(10), width: pa.x(5) - pa.x(2.5), height: pa.y(7) - pa.y(10) };
      s('rect', Object.assign({ class: 'area-sec' }, bx), regions);
      s('rect', Object.assign({ class: 's-sec', style: 'stroke-width: 1.5' }, bx), regions);
      s('line', { x1: pa.x(0), x2: pa.x(5), y1: pa.y(7), y2: pa.y(7), class: 's-fg dash' }, regions);
      s('line', { x1: pa.x(2.5), x2: pa.x(2.5), y1: pa.y(7), y2: pa.y(10), class: 's-fg dash' }, regions);
      tnode(trees, 520, 34, 'x₁ < 5?');
      tedge(trees, 520, 34, 430, 108, 'yes', false);
      tedge(trees, 520, 34, 630, 108, 'no', true);
      tnode(trees, 430, 108, 'x₂ < 7?');
      tnode(trees, 630, 108, 'No  0 / 7', { leaf: true, cls: 'f-sec-soft' });
      tedge(trees, 430, 108, 370, 182, 'yes', false);
      tedge(trees, 430, 108, 500, 182, 'no', true);
      tnode(trees, 370, 182, 'Yes  7 / 0', { leaf: true, cls: 'f-pri-soft' });
      tnode(trees, 500, 182, 'x₁ < 2.5?', { cls: 'f-ter-soft' });
      tedge(trees, 500, 182, 450, 256, 'yes', false);
      tedge(trees, 500, 182, 560, 256, 'no', true);
      tnode(trees, 450, 256, 'Yes  1 / 0', { leaf: true, cls: 'f-pri-soft' });
      tnode(trees, 560, 256, 'No  0 / 1', { leaf: true, cls: 'f-sec-soft' });
      s('text', { x: 612, y: 256, dy: '0.35em', class: 't-ter t-sm t-bold' }, trees, 'one noisy row');
    } else {
      tnode(trees, 520, 60, 'x₁ < 5?');
      tedge(trees, 520, 60, 430, 150, 'yes', false);
      tedge(trees, 520, 60, 610, 150, 'no', true);
      tnode(trees, 430, 150, 'Yes  8 / 1', { leaf: true, cls: 'f-pri-soft' });
      tnode(trees, 610, 150, 'No  0 / 7', { leaf: true, cls: 'f-sec-soft' });
      s('text', { x: 520, y: 210, 'text-anchor': 'middle', class: 't-fg' }, trees, 'training accuracy 15/16');
      s('text', { x: 520, y: 228, 'text-anchor': 'middle', class: 't-ok t-bold' }, trees, 'new point → Yes');
    }
    pnote.textContent = PNOTES[k];
  });
});

QV.register('s5-w3', function (q) {
  const { s, svg, axes, steps, table, scale, fmt, box, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const nf = (v, d) => fmt(v, d).replace('-', '−');

  // Figure 1: three scalers with and without one outlier
  const X = [32, 38, 41, 45, 50, 54, 60], OUT = 250;
  const quant = (v, p) => {
    const a = v.slice().sort((x, y) => x - y), pos = (a.length - 1) * p, lo = Math.floor(pos), hi = Math.min(lo + 1, a.length - 1);
    return a[lo] + (a[hi] - a[lo]) * (pos - lo);
  };
  const SC = [
    { name: 'Min-Max', f: '(x − min)/(max − min)', dom: [-0.1, 1.1], ticks: [0, 0.5, 1], fn: d => { const lo = Math.min(...d), hi = Math.max(...d); return x => (x - lo) / (hi - lo); } },
    { name: 'Standardization', f: '(x − μ)/σ', dom: [-2, 3], ticks: [-2, -1, 0, 1, 2, 3], fn: d => { const mu = d.reduce((a, b) => a + b, 0) / d.length; const sd = Math.sqrt(d.reduce((a, b) => a + (b - mu) ** 2, 0) / d.length); return x => (x - mu) / sd; } },
    { name: 'Robust', f: '(x − Q2)/(Q3 − Q1)', dom: [-1.5, 3], ticks: [-1, 0, 1, 2, 3], fn: d => { const q1 = quant(d, 0.25), q2 = quant(d, 0.5), q3 = quant(d, 0.75); return x => (x - q2) / (q3 - q1); } },
  ];
  const sg = svg(viz('scale'), 720, 300, { label: 'Seven incomes scaled by min-max, standardization and robust scaling, each without and with an outlier of 250', minWidth: 560 });
  SC.forEach((m, i) => {
    const y0 = 24 + i * 96, X0 = 272, X1 = 620, sx = scale(m.dom[0], m.dom[1], X0, X1);
    s('text', { x: 16, y: y0 + 18, class: 't-fg t-bold t-lg' }, sg, m.name);
    s('text', { x: 16, y: y0 + 36, class: 't-sm' }, sg, m.f);
    m.ticks.forEach(v => {
      s('line', { x1: sx(v), x2: sx(v), y1: y0 + 2, y2: y0 + 50, class: 'l-grid' }, sg);
      s('text', { x: sx(v), y: y0 + 66, 'text-anchor': 'middle', class: 't-sm' }, sg, nf(v));
    });
    [[X, y0 + 14, '7 values'], [X.concat([OUT]), y0 + 44, 'with 250']].forEach(([d, y, lab]) => {
      const f = m.fn(d), v = X.map(f), lo = Math.min(...v), hi = Math.max(...v);
      s('text', { x: 262, y, dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, sg, lab);
      s('line', { x1: X0, x2: X1, y1: y, y2: y, class: 'l-axis' }, sg);
      s('rect', { x: sx(lo), y: y - 8, width: sx(hi) - sx(lo), height: 16, rx: 3, class: 'area-pri' }, sg);
      v.forEach(u => s('circle', { cx: sx(u), cy: y, r: 4, class: 'f-pri' }, sg));
      if (d.length > 7) {
        const o = f(OUT);
        if (o <= m.dom[1]) s('circle', { cx: sx(o), cy: y, r: 5, class: 'f-bad' }, sg);
        else {
          s('polygon', { points: `${X1},${y} ${X1 - 10},${y - 6} ${X1 - 10},${y + 6}`, class: 'f-bad' }, sg);
          s('text', { x: X1, y: y - 11, 'text-anchor': 'end', class: 't-bad t-sm t-bold halo' }, sg, `250 → ${fmt(o, 2)}, off scale`);
        }
      }
      s('text', { x: 632, y, dy: '0.35em', class: 't-pri t-sm t-bold' }, sg, `span ${(hi - lo).toFixed(3)}`);
    });
  });

  // Figure 2: label, one-hot and target encoding of the city column
  const CITY = ['Tashkent', 'Samarkand', 'Bukhara'], SAL = [85, 62, 71];
  const eg = svg(viz('enc'), 720, 210, { label: 'The geometry each encoding gives the city column: a number line, a triangle of equal distances, or a salary line', minWidth: 540 });
  const lay = s('g', {}, eg);
  const ENOTES = [
    'Label encoding gives the cities the numbers 0, 1, 2 (the slide table). A model reads them as distances: Bukhara looks twice as far from Tashkent as Samarkand does. That order is invented. Use it only for ordinal data such as small < medium < large.',
    'One-hot encoding gives each city its own 0/1 column. Every pair of cities is the same distance √2 apart, so no order is implied. It adds one column per category, so it suits a manageable number of values.',
    'Target encoding replaces each city by the mean of the target for it (average salary). One column even for hundreds of categories. The order now comes from y, so the means must be computed on the training rows only, or the test labels leak in.',
  ];
  const enote = role('enc-note');
  const thost = viz('enc-table');
  steps(viz('enc-steps'), ['Label', 'One-hot', 'Target'], k => {
    lay.textContent = '';
    thost.textContent = '';
    if (k === 0) {
      table(thost, [{ text: 'City', cls: 'l' }, 'city (label)'], CITY.map((c, i) => [{ text: c, cls: 'l' }, { text: String(i), cls: 'hl' }]));
      const sx = scale(0, 2, 170, 550);
      s('line', { x1: 140, x2: 580, y1: 110, y2: 110, class: 'l-axis' }, lay);
      CITY.forEach((c, i) => {
        s('circle', { cx: sx(i), cy: 110, r: 7, class: 'f-pri' }, lay);
        s('text', { x: sx(i), y: 88, 'text-anchor': 'middle', class: 't-fg t-bold' }, lay, c);
        s('text', { x: sx(i), y: 132, 'text-anchor': 'middle', class: 't-fg' }, lay, String(i));
      });
      arrow(lay, sx(0), 156, sx(1), 156, { cls: 'a-muted', label: 'distance 1', dy: 14 });
      arrow(lay, sx(1), 156, sx(2), 156, { cls: 'a-muted', label: 'distance 1', dy: 14 });
      s('text', { x: 360, y: 34, 'text-anchor': 'middle', class: 't-bad t-bold' }, lay, 'implied order: Tashkent < Samarkand < Bukhara');
      s('text', { x: 360, y: 196, 'text-anchor': 'middle', class: 't-sm' }, lay, 'Tashkent to Bukhara reads as distance 2');
    } else if (k === 1) {
      table(thost, [{ text: 'City', cls: 'l' }].concat(CITY), CITY.map((c, i) => [{ text: c, cls: 'l' }].concat(CITY.map((d, j) => ({ text: i === j ? '1' : '0', cls: i === j ? 'hl' : '' })))));
      const P = [[360, 40], [240, 175], [480, 175]];
      [[0, 1, 284, 107, 'end'], [0, 2, 436, 107, 'start'], [1, 2, 360, 195, 'middle']].forEach(([a, b, lx, ly, anc]) => {
        s('line', { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], class: 's-pri', style: 'stroke-width: 2' }, lay);
        s('text', { x: lx, y: ly, dy: '0.35em', 'text-anchor': anc, class: 't-pri t-bold' }, lay, '√2');
      });
      [['Tashkent', '(1, 0, 0)', 376, 'start'], ['Samarkand', '(0, 1, 0)', 226, 'end'], ['Bukhara', '(0, 0, 1)', 494, 'start']].forEach(([c, v, lx, anc], i) => {
        s('circle', { cx: P[i][0], cy: P[i][1], r: 7, class: 'f-pri' }, lay);
        s('text', { x: lx, y: P[i][1] - 6, dy: '0.35em', 'text-anchor': anc, class: 't-fg t-bold' }, lay, c);
        s('text', { x: lx, y: P[i][1] + 10, dy: '0.35em', 'text-anchor': anc, class: 't-sm' }, lay, v);
      });
      s('text', { x: 40, y: 100, class: 't-ok t-bold' }, lay, 'all pairs equally far:');
      s('text', { x: 40, y: 118, class: 't-ok t-bold' }, lay, 'no order implied');
    } else {
      table(thost, [{ text: 'City', cls: 'l' }, 'mean salary (k$)'], CITY.map((c, i) => [{ text: c, cls: 'l' }, { text: String(SAL[i]), cls: 'hl' }]));
      const sx = scale(55, 90, 150, 590);
      s('line', { x1: 150, x2: 590, y1: 110, y2: 110, class: 'l-axis' }, lay);
      [55, 60, 65, 70, 75, 80, 85, 90].forEach(v => {
        s('line', { x1: sx(v), x2: sx(v), y1: 110, y2: 115, class: 'l-axis' }, lay);
        s('text', { x: sx(v), y: 130, 'text-anchor': 'middle', class: 't-sm' }, lay, String(v));
      });
      CITY.forEach((c, i) => {
        s('circle', { cx: sx(SAL[i]), cy: 110, r: 7, class: 'f-pri' }, lay);
        s('text', { x: sx(SAL[i]), y: 88, 'text-anchor': 'middle', class: 't-fg t-bold' }, lay, `${c} ${SAL[i]}`);
      });
      s('text', { x: 370, y: 154, 'text-anchor': 'middle', class: 't-sm' }, lay, 'average salary per city (k$)');
      s('text', { x: 370, y: 34, 'text-anchor': 'middle', class: 't-ter t-bold' }, lay, 'order taken from y: fit on training rows only');
    }
    enote.textContent = ENOTES[k];
  });

  // Figure 3: data leakage through the scaler
  const lg = svg(viz('leak'), 720, 250, { label: 'Two pipelines: fitting the scaler on all rows lets the test value into the mean; splitting first keeps it out', minWidth: 560 });
  const chip = (x, y, v, test, bad) => {
    s('rect', { x, y, width: 44, height: 30, rx: 4, class: (test ? 'f-sec-soft' : 'f-pri-soft') + ' box' }, lg);
    if (bad) s('rect', { x, y, width: 44, height: 30, rx: 4, class: 's-bad' }, lg);
    s('text', { x: x + 22, y: y + 15, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, lg, String(v));
  };
  s('text', { x: 16, y: 22, class: 't-bad t-bold' }, lg, 'Leak: fit the scaler on all rows, then split');
  [20, 30, 40].forEach((v, i) => chip(16 + i * 50, 46, v));
  chip(166, 46, 90, true, true);
  s('text', { x: 188, y: 92, 'text-anchor': 'middle', class: 't-bad t-sm t-bold' }, lg, 'test row');
  arrow(lg, 216, 61, 262, 61, { cls: 'a-bad', width: 2 });
  box(lg, 266, 36, 210, 50, 'fit on all 4 rows\nμ = (20+30+40+90)/4 = 45', { cls: 'f-bad-soft', textCls: 't-fg', lh: 16 });
  arrow(lg, 480, 61, 510, 61, { cls: 'a-muted' });
  box(lg, 514, 36, 192, 50, 'the test row helped fit μ:\ntest score looks too good', { cls: 'f-surface', textCls: 't-fg', lh: 16 });

  s('text', { x: 16, y: 128, class: 't-ok t-bold' }, lg, 'Correct: split first, fit on the training rows only');
  [20, 30, 40].forEach((v, i) => chip(16 + i * 50, 146, v));
  chip(116, 198, 90, true);
  s('text', { x: 168, y: 217, class: 't-sec t-sm t-bold' }, lg, 'test row');
  arrow(lg, 166, 161, 262, 161, { cls: 'a-pri', width: 2 });
  box(lg, 266, 136, 210, 50, 'fit on train only\nμ = (20+30+40)/3 = 30', { cls: 'f-ok-soft', textCls: 't-fg', lh: 16 });
  arrow(lg, 230, 213, 510, 213, { cls: 'a-muted' });
  arrow(lg, 476, 180, 512, 200, { cls: 'a-ok', label: 'μ', dx: 8, dy: -4 });
  box(lg, 514, 192, 192, 42, 'transform only:\nz(90) uses μ = 30', { cls: 'f-surface', textCls: 't-fg', lh: 16 });

  // Figure 4: class imbalance and SMOTE
  const ig = svg(viz('imb'), 720, 70, { label: 'Stacked bar of 9980 normal and 20 fraud transactions', minWidth: 540 });
  s('rect', { x: 40, y: 18, width: 557, height: 26, class: 'f-seg box' }, ig);
  s('rect', { x: 597, y: 18, width: 3, height: 26, class: 'f-pri' }, ig);
  s('text', { x: 52, y: 31, dy: '0.35em', class: 't-fg' }, ig, 'Normal 9,980 (99.8%)');
  s('text', { x: 608, y: 25, dy: '0.35em', class: 't-pri t-bold' }, ig, 'Fraud 20');
  s('text', { x: 608, y: 41, dy: '0.35em', class: 't-pri t-sm' }, ig, '0.2%');
  s('text', { x: 40, y: 62, class: 't-sm' }, ig, 'slide 24, total 10,000 transactions');

  const MAJ = [[6.2, 0.8], [7.1, 1.6], [8.4, 0.6], [9.3, 1.4], [5.6, 2.2], [6.8, 2.9], [7.9, 2.4], [9.0, 3.1], [5.4, 3.9], [6.4, 4.4], [7.5, 3.8], [8.6, 4.5], [9.5, 5.2], [6.0, 5.5], [7.2, 5.3], [8.2, 5.7], [4.9, 0.6], [5.1, 5.0], [8.9, 2.0], [4.6, 1.8], [9.6, 0.5], [7.8, 0.9]];
  const MIN = { A: [1.0, 2.0], B: [2.2, 3.0], C: [3.4, 2.4], D: [1.6, 4.4], E: [3.8, 4.6], F: [2.8, 0.8] };
  const lerp = (p, r, l) => [p[0] + l * (r[0] - p[0]), p[1] + l * (r[1] - p[1])];
  const SYN = [['B', 'C', 0.4], ['B', 'D', 0.5], ['A', 'B', 0.6], ['E', 'C', 0.3], ['F', 'C', 0.5], ['D', 'E', 0.5]];
  const mg = svg(viz('smote'), 500, 300, { label: 'SMOTE on a toy training set: a minority point, its three nearest minority neighbours, and synthetic points interpolated between them', minWidth: 420 });
  const ma = axes(mg, { x: 50, y: 20, w: 400, h: 240, xd: [0, 10], yd: [0, 6], xt: [0, 5, 10], yt: [0, 3, 6], grid: false, xl: 'feature 1', yl: 'feature 2' });
  MAJ.forEach(([a, b]) => s('circle', { cx: ma.x(a), cy: ma.y(b), r: 4.5, class: 's-muted', style: 'stroke-width: 1.2' }, mg));
  const sl = s('g', {}, mg);
  const dist = (p, r) => Math.hypot(p[0] - r[0], p[1] - r[1]);
  const NN = Object.keys(MIN).filter(k => k !== 'B').sort((a, b) => dist(MIN.B, MIN[a]) - dist(MIN.B, MIN[b])).slice(0, 3);
  const SNOTES = [
    'Result: SMOTE created 6 synthetic points (ochre), doubling the minority class from 6 to 12. Each lies on a segment between two real minority points, so it stays inside the minority region. It runs on the training data only; the test set is never resampled.',
    'Step 1: pick a minority-class point xᵢ (ringed).',
    `Step 2: find its k = 3 nearest minority neighbours: distances ${NN.map(k => fmt(dist(MIN.B, MIN[k]), 2)).join(', ')}. The majority points are ignored.`,
    'Step 3: interpolate: x_new = xᵢ + λ(x_nn − xᵢ) with a random λ in [0, 1]. Here λ = 0.4 toward one neighbour gives (2.68, 2.76).',
    'Step 4: add the new point to the training set as a minority example. Repeat until the classes are balanced enough.',
  ];
  const snote = role('smote-note');
  steps(viz('smote-steps'), ['Result', '1. Pick', '2. Neighbours', '3. Interpolate', '4. Add'], k => {
    sl.textContent = '';
    const xi = MIN.B, xn = lerp(MIN.B, MIN.C, 0.4);
    if (k === 0) SYN.forEach(([a, b, l]) => s('line', { x1: ma.x(MIN[a][0]), y1: ma.y(MIN[a][1]), x2: ma.x(MIN[b][0]), y2: ma.y(MIN[b][1]), class: 's-ter dash', style: 'stroke-width: 1.2; opacity: 0.7' }, sl));
    if (k === 2) NN.forEach(n => s('line', { x1: ma.x(xi[0]), y1: ma.y(xi[1]), x2: ma.x(MIN[n][0]), y2: ma.y(MIN[n][1]), class: 's-pri dash', style: 'stroke-width: 1.5' }, sl));
    if (k >= 3) s('line', { x1: ma.x(xi[0]), y1: ma.y(xi[1]), x2: ma.x(MIN.C[0]), y2: ma.y(MIN.C[1]), class: 's-ter', style: 'stroke-width: 2' }, sl);
    Object.keys(MIN).forEach(n => s('circle', { cx: ma.x(MIN[n][0]), cy: ma.y(MIN[n][1]), r: 6, class: 'f-pri' }, sl));
    if (k === 0) SYN.forEach(([a, b, l]) => { const p = lerp(MIN[a], MIN[b], l); s('rect', { x: ma.x(p[0]) - 5, y: ma.y(p[1]) - 5, width: 10, height: 10, transform: `rotate(45 ${ma.x(p[0])} ${ma.y(p[1])})`, class: 'f-ter' }, sl); });
    if (k >= 1) {
      s('circle', { cx: ma.x(xi[0]), cy: ma.y(xi[1]), r: 11, class: 's-pri' }, sl);
      s('text', { x: ma.x(xi[0]) - 14, y: ma.y(xi[1]) - 10, 'text-anchor': 'end', class: 't-pri t-bold' }, sl, 'xᵢ');
    }
    if (k === 2) NN.forEach(n => s('circle', { cx: ma.x(MIN[n][0]), cy: ma.y(MIN[n][1]), r: 10, class: 's-pri', style: 'stroke-width: 1.5' }, sl));
    if (k >= 3) {
      s('rect', { x: ma.x(xn[0]) - 6, y: ma.y(xn[1]) - 6, width: 12, height: 12, transform: `rotate(45 ${ma.x(xn[0])} ${ma.y(xn[1])})`, class: k === 3 ? 'f-surface s-ter' : 'f-ter' }, sl);
      s('text', { x: ma.x(MIN.C[0]) + 12, y: ma.y(MIN.C[1]) + 4, class: 't-pri t-bold' }, sl, 'x_nn');
      s('text', { x: ma.x(xn[0]) + 4, y: ma.y(xn[1]) + 22, class: 't-ter t-bold' }, sl, k === 3 ? 'x_new, λ = 0.4' : 'added: 6 → 7');
    }
    snote.textContent = SNOTES[k];
  });
});

QV.register('s5-w4', function (q) {
  const { s, svg, axes, steps, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const nf = (v, d) => fmt(v, d).replace('-', '−');
  const W = [0.5, 0.5], B = -2.5, NW = Math.sqrt(0.5);
  const f = p => W[0] * p[0] + W[1] * p[1] + B;
  const PTS = [[[1, 2], -1], [[0, 1], -1], [[1, 0], -1], [[3, 4], 1], [[4, 3], 1], [[5, 5], 1]];
  const LO = -0.5, HI = 6.5;

  // one plane per figure: band between L2 and L1, the three lines and their labels
  const plane = (host, label) => {
    const g = svg(host, 420, 410, { label, minWidth: 400 });
    const ax = axes(g, { x: 46, y: 20, w: 336, h: 336, xd: [LO, HI], yd: [LO, HI], xt: [0, 1, 2, 3, 4, 5, 6], yt: [0, 1, 2, 3, 4, 5, 6], xl: 'x₁', yl: 'x₂' });
    const P = (a, b) => [ax.x(a), ax.y(b)];
    const band = [[LO, 3 - LO], [3 - LO, LO], [HI, LO], [HI, 7 - HI], [7 - HI, HI], [LO, HI]].map(([a, b]) => P(a, b).join(',')).join(' ');
    s('polygon', { points: band, class: 'f-seg', style: 'opacity: 0.85' }, g);
    [[3, 's-muted dash', 'L2: x₁ + x₂ = 3', 1.6, -1],[5, 's-fg', 'L: x₁ + x₂ = 5', 3.9, 1], [7, 's-muted dash', 'L1: x₁ + x₂ = 7', 4.9, 1]].forEach(([c, cls, lab, a0, side]) => {
      const a = Math.max(LO, c - HI), b = Math.min(HI, c - LO);
      s('line', { x1: ax.x(a), y1: ax.y(c - a), x2: ax.x(b), y2: ax.y(c - b), class: cls, style: c === 5 ? 'stroke-width: 2' : null }, g);
      const [px, py] = P(a0, c - a0), off = 7 * side;
      s('text', { x: px + off * 0.707, y: py - off * 0.707, transform: `rotate(45 ${px + off * 0.707} ${py - off * 0.707})`, class: c === 5 ? 't-fg t-bold t-sm' : 't-muted t-sm', dy: side < 0 ? '0.8em' : null }, g, lab);
    });
    return { g, ax, P };
  };
  const mark = (g, P, p, y, o) => {
    o = o || {};
    const [cx, cy] = P(p[0], p[1]);
    if (y > 0) s('circle', { cx, cy, r: 6, class: 'f-pri', style: o.op ? `opacity: ${o.op}` : null }, g);
    else s('rect', { x: cx - 5.5, y: cy - 5.5, width: 11, height: 11, class: 'f-sec', style: o.op ? `opacity: ${o.op}` : null }, g);
    if (o.ring) s('circle', { cx, cy, r: 11, class: o.ring, style: 'stroke-width: 2' }, g);
  };

  // Figure 1: constraint check, support vectors
  const p1 = plane(viz('sv'), 'Six training points with the boundary x1 + x2 = 5 and the margin lines x1 + x2 = 3 and 7; the support vectors (1,2), (3,4) and (4,3) are ringed');
  const l1 = s('g', {}, p1.g);
  const LAB = [[-16, 0, 'end'], [6, -17, 'start'],[-16, 0, 'end'], [16, 0, 'start'], [16, 0, 'start'], [16, 0, 'start']];
  const note1 = role('sv-note');
  steps(viz('sv-steps'), ['All'].concat(PTS.map(([p]) => `(${p[0]}, ${p[1]})`)), k => {
    l1.textContent = '';
    PTS.forEach(([p, y], i) => {
      const yf = y * f(p), sv = Math.abs(yf - 1) < 1e-9, on = !k || k === i + 1;
      mark(l1, p1.P, p, y, { op: on ? null : 0.3, ring: on && sv ? 's-ok' : on && k ? 's-muted' : null });
      if (on) {
        const [cx, cy] = p1.P(p[0], p[1]);
        s('text', { x: cx + LAB[i][0], y: cy + LAB[i][1], dy: '0.35em', 'text-anchor': LAB[i][2], class: sv ? 't-ok t-bold' : 't-muted' }, l1, `y·f = ${fmt(yf, 2)}`);
      }
    });
    if (!k) {
      note1.textContent = 'All six products y·f(x) are at least 1, so the hard-margin constraints hold. The three ringed points have y·f(x) = 1 exactly: they sit on L1 or L2 and are the support vectors. The other three lie beyond the margin and do not affect the boundary.';
      return;
    }
    const [p, y] = PTS[k - 1], v = f(p), yf = y * v, sv = Math.abs(yf - 1) < 1e-9;
    note1.textContent = `(${p[0]}, ${p[1]}), y = ${nf(y)}: f = 0.5·${p[0]} + 0.5·${p[1]} − 2.5 = ${nf(v)}, so y·f = (${nf(y)})(${nf(v)}) = ${fmt(yf, 2)} ≥ 1. ` + (sv ? `Equality: it lies on ${y > 0 ? 'L1' : 'L2'}, so it is a support vector.` : 'Strictly greater: it lies beyond the margin.');
  });

  // Figure 2: margin width and new points
  const p2 = plane(viz('mg'), 'The margin width 2 over the norm of w drawn as a perpendicular between the margin lines, and the distances of the new points (2,2) and (4,4) to the boundary');
  PTS.forEach(([p, y]) => mark(p2.g, p2.P, p, y, { op: 0.45 }));
  const l2 = s('g', {}, p2.g);
  const seg = (g, a, b, cls) => s('line', { x1: p2.P(...a)[0], y1: p2.P(...a)[1], x2: p2.P(...b)[0], y2: p2.P(...b)[1], class: cls, style: 'stroke-width: 2.5' }, g);
  const tick = (g, a) => { const [x, y] = p2.P(...a); s('line', { x1: x - 5, y1: y - 5, x2: x + 5, y2: y + 5, class: 's-ok', style: 'stroke-width: 2' }, g); };
  const NOTES2 = [
    'The margin is the band between L2 and L1. Measured along w it is d = 2/‖w‖ = 2/0.7071 = 2.828 wide. A new point is classified by the sign of f, and its distance to L is |f|/‖w‖.',
    'The support vectors (1, 2) and (3, 4) lie on L2 and L1, and (3, 4) − (1, 2) = (2, 2) points along w. Its length √(4 + 4) = 2.828 is exactly the margin width 2/‖w‖.',
    'f(2, 2) = 1 + 1 − 2.5 = −0.5 < 0, so y = −1. Distance 0.5/0.7071 = 0.707. |f| < 1, so the point lies inside the margin, closer to L than any training point.',
    'f(4, 4) = 2 + 2 − 2.5 = 1.5 ≥ 0, so y = +1. Distance 1.5/0.7071 = 2.121. f > 1, so the point lies beyond L1.',
  ];
  const note2 = role('mg-note');
  steps(viz('mg-steps'), ['All', 'Margin width', '(2, 2)', '(4, 4)'], k => {
    l2.textContent = '';
    if (k === 0) {
      seg(l2, [0, 3], [2, 5], 's-ok');
      tick(l2, [0, 3]);
      tick(l2, [2, 5]);
      const [lx, ly] = p2.P(2.2, 5.4);
      s('text', { x: lx, y: ly, class: 't-ok t-bold' }, l2, 'd = 2/‖w‖ = 2.828');
    }
    if (k === 1) {
      seg(l2, [1, 2], [3, 4], 's-ok');
      PTS.slice(0, 1).concat(PTS.slice(3, 4)).forEach(([p, y]) => mark(l2, p2.P, p, y, { ring: 's-ok' }));
      const [lx, ly] = p2.P(2.2, 5.4);
      s('text', { x: lx, y: ly, class: 't-ok t-bold' }, l2, '|(3, 4) − (1, 2)| = √8 = 2.828');
    }
    const NEWP = [[[2, 2], -1, '0.707', [1.95, 2.55], 'end'], [[4, 4], 1, '2.121', [4.38, 4], 'start']];
    NEWP.forEach(([p, cls, d, lp, anc], i) => {
      if (k === 1 || (k >= 2 && k !== i + 2)) return;
      seg(l2, p, [2.5, 2.5], 's-ter dash');
      mark(l2, p2.P, p, cls, { ring: 's-ter' });
      const [lx, ly] = p2.P(...lp);
      s('text', { x: lx, y: ly, dy: '0.35em', 'text-anchor': anc, class: 't-ter t-bold' }, l2, d);
    });
    if (k >= 2) {
      const [fx, fy] = p2.P(2.5, 2.5);
      s('circle', { cx: fx, cy: fy, r: 3.5, class: 'f-fg' }, l2);
    }
    note2.textContent = NOTES2[k];
  });

  // Figure 3: slack of the two added points, and the cost for a range of C
  const p3 = plane(viz('slack'), 'All eight training points; the slack of (3,3) is measured from L2 and the slack of (2,3) from L1');
  PTS.forEach(([p, y]) => mark(p3.g, p3.P, p, y, { op: 0.45 }));
  [[[3, 3], -1, [1.5, 1.5], 'ζ = 1.5', [2.0, 2.5]], [[2, 3], 1, [3, 4], 'ζ = 1', [2.3, 3.8]]].forEach(([p, y, ft, lab, lp]) => {
    const [x1, y1] = p3.P(...p), [x2, y2] = p3.P(...ft);
    s('line', { x1, y1, x2, y2, class: 's-bad', style: 'stroke-width: 3' }, p3.g);
    s('circle', { cx: x2, cy: y2, r: 3, class: 'f-bad' }, p3.g);
    mark(p3.g, p3.P, p, y, { ring: 's-bad' });
    const [lx, ly] = p3.P(...lp);
    s('text', { x: lx, y: ly, dy: '0.35em', 'text-anchor': 'end', class: 't-bad t-bold' }, p3.g, lab);
  });
  const cg = svg(viz('cost'), 640, 92, { label: 'One hundred percent bar: the share of the soft-margin cost from the margin term and from the slack term', minWidth: 480 });
  const cl = s('g', {}, cg);
  const CS = [0.1, 0.5, 1, 2, 5, 10, 20];
  slider(viz('c-slider'), { label: 'C', min: 0, max: 6, step: 1, value: 2, fmt: i => String(CS[i]) }, i => {
    const C = CS[i], hinge = C * 2.5, J = 0.25 + hinge, sh = hinge / J;
    cl.textContent = '';
    s('text', { x: 20, y: 18, class: 't-fg' }, cl, `share of J = ${fmt(J, 2)}`);
    const wm = 600 * (1 - sh);
    s('rect', { x: 20, y: 30, width: Math.max(wm, 1), height: 28, class: 'f-pri' }, cl);
    s('rect', { x: 20 + wm, y: 30, width: 600 - wm, height: 28, class: 'f-ter' }, cl);
    s('text', { x: 616, y: 44, dy: '0.35em', 'text-anchor': 'end', class: 't-on t-bold' }, cl, `C·Σζ = ${fmt(hinge, 2)}: ${fmt(100 * sh, 1)}%`);
    s('text', { x: 20, y: 78, class: 't-pri' }, cl, `½‖w‖² = 0.25: ${fmt(100 * (1 - sh), 1)}%`);
    role('c-hinge').textContent = fmt(hinge, 2);
    role('c-j').textContent = fmt(J, 2);
    role('c-verdict').innerHTML = `<b>C = ${C}:</b> J = 0.25 + ${C} × 2.5 = ${fmt(J, 2)}. ` + (C >= 5 ? 'The violations are almost the whole cost, so training would move w and b to remove them and accept a smaller margin. Large C risks overfitting.'
      : C <= 0.5 ? 'The margin term still matters, so training tolerates the violations and keeps the margin wide. Small C risks underfitting.'
        : 'The violations already make up most of the cost.');
  });
});

QV.register('s5-w5', function (q) {
  const { s, svg, axes, slider, table, mat, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const nf = (v, d) => fmt(v, d).replace('-', '−');
  const X = [[4, 11], [8, 4], [13, 5], [7, 14]];
  const M = [X.reduce((a, p) => a + p[0], 0) / 4, X.reduce((a, p) => a + p[1], 0) / 4];
  const C = X.map(p => [p[0] - M[0], p[1] - M[1]]);
  const cov = (i, j) => C.reduce((a, p) => a + p[i] * p[j], 0) / 3;
  const S = [[cov(0, 0), cov(0, 1)], [cov(1, 0), cov(1, 1)]];
  const tr = S[0][0] + S[1][1], det = S[0][0] * S[1][1] - S[0][1] ** 2, disc = Math.sqrt(tr * tr - 4 * det);
  const L1 = (tr + disc) / 2, L2 = (tr - disc) / 2;
  const r = -(S[0][0] - L1) / S[0][1], len = Math.hypot(1, r), U1 = [1 / len, r / len];
  const PC = C.map(p => p[0] * U1[0] + p[1] * U1[1]);
  const pt = p => `(${nf(p[0])}, ${nf(p[1])})`;

  table(viz('given'), ['Point', 'X1', 'X2'], X.map((p, i) => [String(i + 1), String(p[0]), String(p[1])]));
  mat(viz('S'), S, { caption: 'S', text: v => nf(v) });
  table(viz('pc-table'), ['Point', { text: 'centred', cls: 'l' }, { text: 'PC1 = centred · u₁', cls: 'l' }], C.map((p, i) => [String(i + 1), { text: pt(p), cls: 'l' },
    { html: `${nf(p[0] * U1[0], 4)} ${p[1] * U1[1] < 0 ? '−' : '+'} ${fmt(Math.abs(p[1] * U1[1]), 4)} = <b>${nf(PC[i], 4)}</b>`, cls: 'l' }]));

  // Figure 1: raw data and centred data
  const cg = svg(viz('centre'), 720, 324, { label: 'Left: the four points with their mean (8, 8.5). Right: the same points after subtracting the mean', minWidth: 560 });
  const A = axes(cg, { x: 50, y: 30, w: 234, h: 252, xd: [2, 15], yd: [2, 16], xt: [4, 8, 12], yt: [4, 8, 12, 16], xl: 'X1', yl: 'X2' });
  const Bx = axes(cg, { x: 430, y: 30, w: 252, h: 252, xd: [-7, 7], yd: [-7, 7], xt: [-6, -3, 0, 3, 6], yt: [-6, -3, 0, 3, 6], xf: v => nf(v), yf: v => nf(v), xl: 'X1 − 8', yl: 'X2 − 8.5' });
  s('line', { x1: Bx.x(-7), x2: Bx.x(7), y1: Bx.y(0), y2: Bx.y(0), class: 's-muted' }, cg);
  s('line', { x1: Bx.x(0), x2: Bx.x(0), y1: Bx.y(-7), y2: Bx.y(7), class: 's-muted' }, cg);
  const cross = (x, y) => {
    s('line', { x1: x - 7, x2: x + 7, y1: y, y2: y, class: 's-ok', style: 'stroke-width: 3' }, cg);
    s('line', { x1: x, x2: x, y1: y - 7, y2: y + 7, class: 's-ok', style: 'stroke-width: 3' }, cg);
  };
  // label offsets [dx, dy, anchor] for the raw and the centred panel
  const RAWL = [[9, 0, 'start'], [9, 0, 'start'], [-9, 0, 'end'], [9, 0, 'start']];
  const CENL = [[0, -13, 'middle'], [9, 0, 'start'], [-9, 0, 'end'], [-9, 0, 'end']];
  const lab = (x, y, o, t) => s('text', { x: x + o[0], y: y + o[1], dy: '0.35em', 'text-anchor': o[2], class: 't-fg' }, cg, t);
  X.forEach((p, i) => {
    const x = A.x(p[0]), y = A.y(p[1]);
    s('circle', { cx: x, cy: y, r: 5, class: 'f-pri' }, cg);
    lab(x, y, RAWL[i], `${i + 1} (${p[0]}, ${p[1]})`);
    const cx = Bx.x(C[i][0]), cy = Bx.y(C[i][1]);
    s('circle', { cx, cy, r: 5, class: 'f-pri' }, cg);
    lab(cx, cy, CENL[i], `${i + 1} ${pt(C[i])}`);
  });
  cross(A.x(M[0]), A.y(M[1]));
  s('text', { x: A.x(M[0]) + 10, y: A.y(M[1]) - 10, class: 't-ok t-bold' }, cg, 'mean (8, 8.5)');
  cross(Bx.x(0), Bx.y(0));
  s('text', { x: Bx.x(0) + 10, y: Bx.y(0) - 10, class: 't-ok t-bold' }, cg, '(0, 0)');
  QV.arrow(cg, 300, 129, 400, 129, { cls: 'a-muted', label: '− (8, 8.5)' });

  // Figure 2: signed rectangles behind Cov(X1, X2)
  const vg = svg(viz('cov'), 560, 330, { label: 'Centred points with the rectangle each spans with the origin; all products are negative or zero, summing to minus 33', minWidth: 480 });
  const V = axes(vg, { x: 50, y: 20, w: 280, h: 280, xd: [-7, 7], yd: [-7, 7], xt: [-6, -3, 0, 3, 6], yt: [-6, -3, 0, 3, 6], xf: v => nf(v), yf: v => nf(v), grid: false });
  [[-7, 7, 'area-sec'], [0, 7, 'area-pri'], [-7, 0, 'area-pri'], [0, 0, 'area-sec']].forEach(([a, b, cls]) => s('rect', { x: V.x(a), y: V.y(b), width: 140, height: 140, class: cls }, vg));
  s('line', { x1: V.x(-7), x2: V.x(7), y1: V.y(0), y2: V.y(0), class: 's-muted' }, vg);
  s('line', { x1: V.x(0), x2: V.x(0), y1: V.y(-7), y2: V.y(7), class: 's-muted' }, vg);
  C.forEach(([a, b]) => {
    if (a === 0 || b === 0) return;
    s('rect', { x: V.x(Math.min(0, a)), y: V.y(Math.max(0, b)), width: Math.abs(V.x(a) - V.x(0)), height: Math.abs(V.y(b) - V.y(0)), class: 'f-sec-soft s-sec', style: 'stroke-width: 1.5; fill-opacity: 0.6' }, vg);
  });
  C.forEach(([a, b], i) => {
    s('circle', { cx: V.x(a), cy: V.y(b), r: 5, class: 'f-pri' }, vg);
    s('text', { x: V.x(a) + (a > 0 ? 9 : -9), y: V.y(b) + (b > 0 ? -8 : 12), 'text-anchor': a > 0 ? 'start' : 'end', class: 't-fg t-bold' }, vg, String(i + 1));
  });
  [[-2, 1.25, 'middle', '−10'], [2.5, -1.75, 'middle', '−17.5'], [-1.3, 4.3, 'end', '−5.5'], [0.4, -3, 'start', '0']].forEach(([a, b, anc, t]) => s('text', { x: V.x(a), y: V.y(b), dy: '0.35em', 'text-anchor': anc, class: 't-sec t-bold' }, vg, t));
  ['products (x₁ − 8)(x₂ − 8.5):', ...C.map((p, i) => `${i + 1}: (${nf(p[0])})(${nf(p[1])}) = ${nf(p[0] * p[1])}`), 'Σ = −33', 'Cov(X₁, X₂) = −33 / 3 = −11'].forEach((t, i) => {
    s('text', { x: 356, y: 40 + i * 22 + (i >= 5 ? 10 : 0), class: i >= 5 ? 't-sec t-bold' : i ? 't-fg' : 't-sm' }, vg, t);
  });

  // Figure 3: variance of the projections over all directions
  const dg = svg(viz('dir'), 720, 320, { label: 'Left: a unit direction through the centred points with their projections. Right: the variance of the projections against the angle, peaking at lambda 1', minWidth: 560 });
  const D = axes(dg, { x: 40, y: 20, w: 252, h: 252, xd: [-7, 7], yd: [-7, 7], xt: [-6, -3, 0, 3, 6], yt: [-6, -3, 0, 3, 6], xf: v => nf(v), yf: v => nf(v), grid: false, xl: 'x₁ − X̄₁', yl: 'x₂ − X̄₂' });
  s('line', { x1: D.x(-7), x2: D.x(7), y1: D.y(0), y2: D.y(0), class: 's-line' }, dg);
  s('line', { x1: D.x(0), x2: D.x(0), y1: D.y(-7), y2: D.y(7), class: 's-line' }, dg);
  const varAt = th => { const c = Math.cos(th), sn = Math.sin(th); return S[0][0] * c * c + 2 * S[0][1] * c * sn + S[1][1] * sn * sn; };
  const R = axes(dg, { x: 380, y: 20, w: 310, h: 252, xd: [-90, 90], yd: [0, 34], xt: [-90, -45, 0, 45, 90], yt: [0, 10, 20, 30], xf: v => nf(v), xl: 'angle θ of u (degrees)', yl: 'variance of the projections' });
  QV.plot(dg, R, d => varAt(d * Math.PI / 180), -90, 90, 240, 's-muted');
  const TH1 = Math.atan2(U1[1], U1[0]) * 180 / Math.PI, TH2 = TH1 + 90;
  s('circle', { cx: R.x(TH1), cy: R.y(L1), r: 3.5, class: 'f-fg' }, dg);
  s('circle', { cx: R.x(TH2), cy: R.y(L2), r: 3.5, class: 'f-fg' }, dg);
  s('text', { x: R.x(TH1) + 6, y: R.y(L1) - 10, class: 't-fg t-bold' }, dg, `λ₁ = ${fmt(L1, 3)}`);
  s('text', { x: R.x(TH2), y: R.y(L2) + 20, 'text-anchor': 'middle', class: 't-fg t-bold' }, dg, `λ₂ = ${fmt(L2, 3)}`);
  C.forEach(p => s('circle', { cx: D.x(p[0]), cy: D.y(p[1]), r: 5, class: 'f-fg' }, dg));
  const dl = s('g', {}, dg);
  slider(viz('dir-slider'), { label: 'θ', min: -90, max: 90, step: 0.1, value: -56.1, fmt: v => nf(v, 1) + '°' }, deg => {
    const th = deg * Math.PI / 180, u = [Math.cos(th), Math.sin(th)], v = varAt(th);
    dl.textContent = '';
    const tm = Math.min(Math.abs(u[0]) > 1e-9 ? 7 / Math.abs(u[0]) : 99, Math.abs(u[1]) > 1e-9 ? 7 / Math.abs(u[1]) : 99);
    s('line', { x1: D.x(-tm * u[0]), y1: D.y(-tm * u[1]), x2: D.x(tm * u[0]), y2: D.y(tm * u[1]), class: 's-pri', style: 'stroke-width: 2' }, dl);
    C.forEach(p => {
      const k = p[0] * u[0] + p[1] * u[1];
      s('line', { x1: D.x(p[0]), y1: D.y(p[1]), x2: D.x(k * u[0]), y2: D.y(k * u[1]), class: 's-muted dash', style: 'stroke-width: 1' }, dl);
      s('circle', { cx: D.x(k * u[0]), cy: D.y(k * u[1]), r: 4, class: 'f-pri' }, dl);
    });
    QV.arrow(dl, D.x(0), D.y(0), D.x(2.5 * u[0]), D.y(2.5 * u[1]), { cls: 'a-pri', width: 3 });
    s('line', { x1: R.x(deg), x2: R.x(deg), y1: R.y(0), y2: R.y(34), class: 's-muted dash' }, dl);
    s('circle', { cx: R.x(deg), cy: R.y(v), r: 6, class: 'f-ok' }, dl);
    role('dir-u').textContent = `(${u[0].toFixed(3)}, ${u[1].toFixed(3)})`.replace(/-/g, '−');
    role('dir-v').textContent = fmt(v, 3);
  });

  // Figure 4: projection onto PC1 and the variance share
  const pg = svg(viz('proj'), 720, 320, { label: 'Left: the centred points projected onto the PC1 axis. Right: the four PC1 values on a number line and the share of variance kept by PC1 and PC2', minWidth: 560 });
  const P = axes(pg, { x: 40, y: 20, w: 252, h: 252, xd: [-7, 7], yd: [-7, 7], xt: [-6, -3, 0, 3, 6], yt: [-6, -3, 0, 3, 6], xf: v => nf(v), yf: v => nf(v), grid: false, xl: 'x₁ − X̄₁', yl: 'x₂ − X̄₂' });
  const U2 = [-U1[1], U1[0]];
  const tl = u => Math.min(7 / Math.abs(u[0]), 7 / Math.abs(u[1]));
  s('line', { x1: P.x(-tl(U2) * U2[0]), y1: P.y(-tl(U2) * U2[1]), x2: P.x(tl(U2) * U2[0]), y2: P.y(tl(U2) * U2[1]), class: 's-sec dash', style: 'stroke-width: 1.5' }, pg);
  s('line', { x1: P.x(-tl(U1) * U1[0]), y1: P.y(-tl(U1) * U1[1]), x2: P.x(tl(U1) * U1[0]), y2: P.y(tl(U1) * U1[1]), class: 's-pri', style: 'stroke-width: 2' }, pg);
  s('text', { x: P.x(tl(U1) * U1[0]) + 4, y: P.y(tl(U1) * U1[1]) - 8, 'text-anchor': 'middle', class: 't-pri t-bold' }, pg, 'PC1');
  s('text', { x: P.x(tl(U2) * U2[0]) + 6, y: P.y(tl(U2) * U2[1]) + 10, class: 't-sec t-bold' }, pg, 'PC2');
  C.forEach((p, i) => {
    const k = PC[i];
    s('line', { x1: P.x(p[0]), y1: P.y(p[1]), x2: P.x(k * U1[0]), y2: P.y(k * U1[1]), class: 's-muted dash', style: 'stroke-width: 1' }, pg);
    s('circle', { cx: P.x(p[0]), cy: P.y(p[1]), r: 4.5, class: 'f-fg' }, pg);
    s('circle', { cx: P.x(k * U1[0]), cy: P.y(k * U1[1]), r: 5, class: 'f-pri' }, pg);
    s('text', { x: P.x(p[0]) + (p[0] >= 0 ? 9 : -9), y: P.y(p[1]), dy: '0.35em', 'text-anchor': p[0] >= 0 ? 'start' : 'end', class: 't-fg t-bold' }, pg, String(i + 1));
  });
  QV.arrow(pg, P.x(0), P.y(0), P.x(2.2 * U1[0]), P.y(2.2 * U1[1]), { cls: 'a-pri', width: 3 });
  s('text', { x: P.x(2.2 * U1[0]) + 8, y: P.y(2.2 * U1[1]), dy: '0.35em', class: 't-pri t-bold' }, pg, 'u₁');
  const NL = { x0: 360, x1: 690, y: 96 }, nx = v => NL.x0 + (v + 7) / 14 * (NL.x1 - NL.x0);
  s('text', { x: NL.x0, y: 30, class: 't-fg t-bold' }, pg, 'PC1 values = centred row · u₁');
  s('line', { x1: NL.x0, x2: NL.x1, y1: NL.y, y2: NL.y, class: 'l-axis' }, pg);
  [-6, -3, 0, 3, 6].forEach(v => {
    s('line', { x1: nx(v), x2: nx(v), y1: NL.y, y2: NL.y + 5, class: 'l-axis' }, pg);
    s('text', { x: nx(v), y: NL.y + 18, 'text-anchor': 'middle', class: 't-sm' }, pg, nf(v));
  });
  const UP = [false, true, false, true];
  PC.forEach((v, i) => {
    s('circle', { cx: nx(v), cy: NL.y, r: 6, class: 'f-pri' }, pg);
    s('text', { x: nx(v), y: UP[i] ? NL.y - 14 : NL.y + 36, 'text-anchor': 'middle', class: 't-pri t-bold' }, pg, `${i + 1}: ${nf(v, 4)}`);
  });
  const share = L1 / tr, bw = 330;
  s('text', { x: NL.x0, y: 186, class: 't-fg t-bold' }, pg, `share of the total variance ${fmt(tr, 3)}`);
  s('rect', { x: NL.x0, y: 196, width: bw * share, height: 30, class: 'f-pri' }, pg);
  s('rect', { x: NL.x0 + bw * share, y: 196, width: bw * (1 - share), height: 30, class: 'f-sec' }, pg);
  s('text', { x: NL.x0 + bw * share / 2, y: 211, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, pg, `${fmt(100 * share, 1)}%`);
  s('text', { x: NL.x0 + bw * share + bw * (1 - share) / 2, y: 211, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, pg, `${fmt(100 * (1 - share), 1)}%`);
  s('text', { x: NL.x0, y: 250, class: 't-pri' }, pg, `PC1: λ₁ / Σλ = ${fmt(L1, 3)} / ${fmt(tr, 3)}`);
  s('text', { x: NL.x0, y: 270, class: 't-sec' }, pg, `PC2: λ₂ / Σλ = ${fmt(L2, 3)} / ${fmt(tr, 3)}`);
});

QV.register('s5-w6', function (q) {
  const { s, svg, steps, table, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const ROWS = [
    ['Youth', 'No', 'Fair', 'No'], ['Youth', 'No', 'Excellent', 'No'], ['Middle', 'No', 'Fair', 'Yes'], ['Senior', 'No', 'Fair', 'Yes'],
    ['Senior', 'Yes', 'Fair', 'Yes'], ['Senior', 'Yes', 'Excellent', 'No'], ['Middle', 'Yes', 'Excellent', 'Yes'], ['Youth', 'No', 'Fair', 'No'],
    ['Youth', 'Yes', 'Fair', 'Yes'], ['Senior', 'No', 'Fair', 'Yes'], ['Youth', 'Yes', 'Excellent', 'Yes'], ['Middle', 'No', 'Excellent', 'Yes'],
    ['Middle', 'Yes', 'Fair', 'Yes'], ['Senior', 'No', 'Excellent', 'No'],
  ];
  const H2 = (a, b) => [a, b].reduce((acc, x) => acc - (x ? x / (a + b) * Math.log2(x / (a + b)) : 0), 0);
  const row = (r, i) => [String(i + 1), r[0], r[1], r[2], { text: r[3], cls: r[3] === 'Yes' ? 'hl' : '' }];
  const HEAD = ['#', { text: 'Age', cls: 'l' }, { text: 'Student', cls: 'l' }, { text: 'Credit', cls: 'l' }, 'Buy'];
  const cellsL = r => r.map((c, j) => (j >= 1 && j <= 3 ? { text: c, cls: 'l' } : c));
  table(viz('given'), HEAD, ROWS.map((r, i) => cellsL(row(r, i))));

  // Figure 1: the three candidate root splits
  const E0 = H2(9, 5);
  const ATTR = [
    { name: 'Age', kids: [['Youth', 2, 3], ['Middle', 4, 0], ['Senior', 3, 2]] },
    { name: 'Student', kids: [['No', 4, 4], ['Yes', 5, 1]] },
    { name: 'Credit', kids: [['Fair', 6, 2], ['Excellent', 3, 3]] },
  ];
  ATTR.forEach(a => { a.we = a.kids.reduce((acc, [, y, n]) => acc + (y + n) / 14 * H2(y, n), 0); a.ig = E0 - a.we; });
  const best = ATTR.reduce((b, a) => (a.ig > b.ig ? a : b));
  const eStr = e => (e < 1e-9 ? '0' : e.toFixed(3));
  const rg = svg(viz('root'), 720, 300, { label: 'The 14 customers split by Age, Student and Credit, with Yes and No counts per child and the information gain of each attribute', minWidth: 560 });
  ATTR.forEach((a, i) => {
    const y0 = 16 + i * 94, win = a === best;
    if (win) s('rect', { x: 6, y: y0, width: 708, height: 78, rx: 8, class: 'f-none s-ok', style: 'stroke-width: 1.5' }, rg);
    s('text', { x: 18, y: y0 + 46, class: 't-fg t-bold t-lg' }, rg, a.name);
    s('text', { x: 18, y: y0 + 64, class: 't-sm' }, rg, `weighted E ${a.we.toFixed(3)}`);
    let x = 132;
    a.kids.forEach(([nm, yes, no]) => {
      const w = (yes + no) * 26, cx = x + w / 2;
      s('text', { x: cx, y: y0 + 14, 'text-anchor': 'middle', class: 't-fg t-bold' }, rg, nm);
      s('text', { x: cx, y: y0 + 28, 'text-anchor': 'middle', class: 't-sm' }, rg, `E = ${eStr(H2(yes, no))}`);
      if (yes) {
        s('rect', { x, y: y0 + 34, width: yes * 26, height: 28, class: 'f-pri sep' }, rg);
        s('text', { x: x + yes * 13, y: y0 + 48, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, rg, String(yes));
      }
      if (no) {
        s('rect', { x: x + yes * 26, y: y0 + 34, width: no * 26, height: 28, class: 'f-sec sep' }, rg);
        s('text', { x: x + yes * 26 + no * 13, y: y0 + 48, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, rg, String(no));
      }
      x += w + 10;
    });
    s('text', { x: 548, y: y0 + 26, class: win ? 't-ok t-bold' : 't-fg' }, rg, `IG = ${a.ig.toFixed(3)}`);
    s('rect', { x: 548, y: y0 + 34, width: a.ig / 0.25 * 120, height: 28, class: win ? 'f-ok' : 'f-seg box' }, rg);
  });

  // Figure 2: building the tree, with the rows that reach each node
  const N = {
    root: { x: 360, y: 34, w: 130, t: 'Age', c: 'Yes=9, No=5' },
    youth: { x: 140, y: 140, w: 120, t: 'Student', c: 'Yes=2, No=3' },
    mid: { x: 360, y: 140, w: 120, t: 'Yes', c: 'Yes=4, No=0', leaf: true },
    sen: { x: 580, y: 140, w: 120, t: 'Credit', c: 'Yes=3, No=2' },
    yn: { x: 70, y: 250, w: 116, t: 'No', c: 'Yes=0, No=3', leaf: true },
    yy: { x: 210, y: 250, w: 116, t: 'Yes', c: 'Yes=2, No=0', leaf: true },
    sf: { x: 510, y: 250, w: 116, t: 'Yes', c: 'Yes=3, No=0', leaf: true },
    se: { x: 650, y: 250, w: 116, t: 'No', c: 'Yes=0, No=2', leaf: true },
  };
  const ED = [
    ['root', 'youth', 'Youth', 244, 79, 'end'], ['root', 'mid', 'Middle', 366, 91, 'start'], ['root', 'sen', 'Senior', 476, 79, 'start'],
    ['youth', 'yn', 'No', 99, 187, 'end'], ['youth', 'yy', 'Yes', 181, 187, 'start'], ['sen', 'sf', 'Fair', 539, 187, 'end'], ['sen', 'se', 'Excellent', 621, 187, 'start'],
  ];
  const bg = svg(viz('build'), 720, 300, { label: 'The ID3 tree for the computer data built step by step: Age at the root, Middle a Yes leaf, Student under Youth, Credit under Senior', minWidth: 560 });
  const bl = s('g', {}, bg);
  const tbl = table(viz('build-table'), HEAD, ROWS.map((r, i) => cellsL(row(r, i))));
  const SUB = { 1: ROWS.map((r, i) => i), 2: [2, 6, 11, 12], 3: [0, 1, 7, 8, 10], 4: [3, 4, 5, 9, 13] };
  // nodes visible at each step, and which node is the one being decided
  const SHOW = { 0: Object.keys(N), 1: ['root', 'youth', 'mid', 'sen'], 2: ['root', 'youth', 'mid', 'sen'], 3: ['root', 'youth', 'mid', 'sen', 'yn', 'yy'], 4: Object.keys(N) };
  const CUR = { 1: ['root'], 2: ['mid'], 3: ['youth'], 4: ['sen'] };
  const UNDECIDED = { 1: ['youth', 'mid', 'sen'], 2: ['youth', 'sen'], 3: ['sen'] };
  const BNOTES = [
    'The finished ID3 tree: Age at the root, Student under Youth, Credit under Senior. Every leaf is pure, and the tree classifies all 14 rows correctly.',
    'All 14 rows: 9 Yes, 5 No, E = 0.940. IG: Age 0.247, Student 0.090, Credit 0.048. Age becomes the root and splits the rows into Youth (5), Middle (4) and Senior (5).',
    'Middle: rows 3, 7, 12, 13, all Yes. E = 0, so the node is pure and becomes a Yes leaf. No further split.',
    'Youth: rows 1, 2, 8, 9, 11 (2 Yes, 3 No, E = 0.971). Student splits them into No 0/3 and Yes 2/0, IG = 0.971; Credit gives only 0.020. Split on Student. Both children are pure leaves.',
    'Senior: rows 4, 5, 6, 10, 14 (3 Yes, 2 No, E = 0.971). Credit splits them into Fair 3/0 and Excellent 0/2, IG = 0.971; Student gives only 0.020. Split on Credit. Both children are pure leaves.',
  ];
  const bnote = role('build-note');
  steps(viz('build-steps'), ['Final tree', '1. Root', '2. Middle', '3. Youth', '4. Senior'], k => {
    bl.textContent = '';
    const show = SHOW[k], cur = CUR[k] || [], und = UNDECIDED[k] || [];
    ED.forEach(([a, b, lab, lx, ly, anc]) => {
      if (show.indexOf(b) < 0) return;
      const A = N[a], Bn = N[b];
      s('line', { x1: A.x, y1: A.y + 20, x2: Bn.x, y2: Bn.y - 20, class: 's-muted' }, bl);
      s('text', { x: lx, y: ly, 'text-anchor': anc, class: 't-muted halo' }, bl, lab);
    });
    show.forEach(id => {
      const n = N[id], on = cur.indexOf(id) >= 0, open = und.indexOf(id) >= 0;
      const cls = on ? 'f-pri' : open ? 'f-surface' : n.leaf ? 'f-ok-soft' : 'f-pri-soft';
      const tc = on ? 't-on' : 't-fg';
      s('rect', { x: n.x - n.w / 2, y: n.y - 20, width: n.w, height: 40, rx: n.leaf && !open ? 18 : 6, class: cls + ' ' + (open ? 's-muted dash' : 'box') }, bl);
      s('text', { x: n.x, y: n.y - 6, dy: '0.35em', 'text-anchor': 'middle', class: tc + ' t-bold' }, bl, open ? '?' : n.t);
      s('text', { x: n.x, y: n.y + 9, dy: '0.35em', 'text-anchor': 'middle', class: tc + ' t-sm' }, bl, n.c);
    });
    const sub = SUB[k] || [];
    tbl.rows.forEach((tr, i) => { tr.className = sub.indexOf(i) >= 0 && k > 1 ? 'on' : ''; });
    bnote.textContent = BNOTES[k];
  });

  // Figure 3: the forest vote for x = {Youth, No, Fair}
  const fg = svg(viz('forest'), 860, 330, { label: 'Three trees of the random forest with the path of x highlighted: T1 votes No, T2 and T3 vote Yes, and the majority is Yes', minWidth: 560 });
  const TREES = [
    { x0: 10, title: 'T1: the ID3 tree from (c)', vote: 'No',
      nodes: { r: [165, 50, 'Age'], s: [65, 130, 'Student'], m: [165, 130, 'Yes', 1], c: [265, 130, 'Credit'], a: [30, 210, 'No', 1], b: [100, 210, 'Yes', 1], d: [230, 210, 'Yes', 1], e: [300, 210, 'No', 1] },
      edges: [['r', 's', 'Youth', 109, 84, 'end', 1], ['r', 'm', 'Middle', 171, 108, 'start'], ['r', 'c', 'Senior', 221, 84, 'start'], ['s', 'a', 'No', 41, 164, 'end', 1], ['s', 'b', 'Yes', 89, 164, 'start'], ['c', 'd', 'Fair', 241, 164, 'end'], ['c', 'e', 'Excellent', 289, 164, 'start']],
      path: ['r', 's', 'a'] },
    { x0: 335, title: 'T2', vote: 'Yes',
      nodes: { r: [110, 50, 'Student'], y: [45, 130, 'Yes', 1], c: [160, 130, 'Credit'], f: [120, 210, 'Yes', 1], e: [195, 210, 'No', 1] },
      edges: [['r', 'y', 'Yes', 72, 84, 'end'], ['r', 'c', 'No', 141, 84, 'start', 1], ['c', 'f', 'Fair', 134, 164, 'end', 1], ['c', 'e', 'Excellent', 183, 164, 'start']],
      path: ['r', 'c', 'f'] },
    { x0: 570, title: 'T3', vote: 'Yes',
      nodes: { r: [80, 50, 'Credit'], f: [25, 130, 'Yes', 1], a: [170, 130, 'Age'], y: [90, 210, 'Yes', 1], m: [170, 210, 'Yes', 1], s: [250, 210, 'No', 1] },
      edges: [['r', 'f', 'Fair', 46, 84, 'end', 1], ['r', 'a', 'Excellent', 131, 84, 'start'], ['a', 'y', 'Youth', 124, 164, 'end'], ['a', 'm', 'Middle', 176, 189, 'start'], ['a', 's', 'Senior', 216, 164, 'start']],
      path: ['r', 'f'] },
  ];
  TREES.forEach((T, i) => {
    const X = v => T.x0 + v;
    s('text', { x: X(T.nodes.r[0]), y: 18, 'text-anchor': 'middle', class: 't-fg t-bold' }, fg, T.title);
    T.edges.forEach(([a, b, lab, lx, ly, anc, on]) => {
      const A = T.nodes[a], Bn = T.nodes[b];
      s('line', { x1: X(A[0]), y1: A[1] + 15, x2: X(Bn[0]), y2: Bn[1] - (Bn[3] ? 13 : 15), class: on ? 's-pri' : 's-line', style: on ? 'stroke-width: 3' : 'stroke-width: 1.5' }, fg);
      s('text', { x: X(lx), y: ly, 'text-anchor': anc, class: (on ? 't-pri t-bold' : 't-muted') + ' t-sm halo' }, fg, lab);
    });
    Object.keys(T.nodes).forEach(id => {
      const [x, y, t, leaf] = T.nodes[id], onPath = T.path.indexOf(id) >= 0, end = onPath && id === T.path[T.path.length - 1];
      const w = leaf ? 44 : 70, h = leaf ? 26 : 30;
      s('rect', { x: X(x) - w / 2, y: y - h / 2, width: w, height: h, rx: leaf ? 13 : 5, class: (end ? 'f-pri' : onPath ? 'f-pri-soft' : 'f-surface') + ' ' + (onPath ? 'outline-pri' : 'box') }, fg);
      s('text', { x: X(x), y, dy: '0.35em', 'text-anchor': 'middle', class: end ? 't-on t-bold' : 't-fg' }, fg, t);
    });
    const vx = X(T.nodes.r[0]);
    s('rect', { x: vx - 60, y: 244, width: 120, height: 30, rx: 6, class: (T.vote === 'Yes' ? 'f-pri-soft' : 'f-sec-soft') + ' box' }, fg);
    s('text', { x: vx, y: 259, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, fg, `T${i + 1} votes ${T.vote}`);
    s('line', { x1: vx, y1: 274, x2: 430, y2: 292, class: 's-line', style: 'stroke-width: 1.5' }, fg);
  });
  s('rect', { x: 300, y: 292, width: 260, height: 32, rx: 6, class: 'f-ok' }, fg);
  s('text', { x: 430, y: 308, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, fg, 'Majority 2 to 1: forest says Yes');
});

QV.register('s3-mc1', function (q) {
  const { s, svg, box, arrow, steps, axes, plot, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const SUP = ['⁰', '¹', '²', '³', '⁴'];
  const SUB = ['', '₁', '₂', '₃', '₄'];
  const X = 2;

  // Figure 1: x = 2 through PolynomialFeatures, one weight per column
  const g = svg(viz('pipe'), 760, 222, { label: 'x = 2 goes through PolynomialFeatures into one column per power of x, each multiplied by its own weight', minWidth: 560 });
  const layer = s('g', {}, g);
  const CW = 64, GAP = 6, X0 = 392, Y = 44, H = 48;
  const note = role('deg-note');
  function draw(d) {
    layer.textContent = '';
    box(layer, 16, Y, 84, H, 'x = 2', { cls: 'f-ter', textCls: 't-on t-bold t-lg' });
    s('text', { x: 58, y: Y + H + 18, 'text-anchor': 'middle' }, layer, 'one input');
    arrow(layer, 100, Y + H / 2, 140, Y + H / 2);
    box(layer, 142, Y, 206, H, 'PolynomialFeatures\n(degree=' + d + ')', { textCls: 't-fg' });
    arrow(layer, 348, Y + H / 2, 388, Y + H / 2);
    const n = d + 1, gw = n * CW + (n - 1) * GAP, mid = X0 + gw / 2;
    s('text', { x: X0, y: 16, class: 't-fg t-bold' }, layer, `feature vector, ${n} columns`);
    const terms = [];
    for (let j = 0; j < n; j++) {
      const x = X0 + j * (CW + GAP);
      s('text', { x: x + CW / 2, y: Y - 8, 'text-anchor': 'middle', class: 't-fg' }, layer, 'x' + SUP[j] + (j === 0 ? ', bias' : ''));
      s('rect', { x, y: Y, width: CW, height: H, rx: 4, class: (j === 0 ? 'f-seg' : 'f-pri-soft') + ' box' }, layer);
      s('text', { x: x + CW / 2, y: Y + H / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold t-xl' }, layer, String(X ** j));
      s('text', { x: x + CW / 2, y: Y + H + 17, 'text-anchor': 'middle' }, layer, '×');
      s('rect', { x: x + 10, y: Y + H + 26, width: CW - 20, height: 28, rx: 4, class: 'f-surface box' }, layer);
      s('text', { x: x + CW / 2, y: Y + H + 40, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, layer, j === 0 ? 'b' : 'w' + SUB[j]);
      terms.push((j === 0 ? 'b' : 'w' + SUB[j]) + '·' + X ** j);
    }
    s('text', { x: X0 - 8, y: Y + H + 40, dy: '0.35em', 'text-anchor': 'end' }, layer, 'weights');
    s('text', { x: mid, y: 176, 'text-anchor': 'middle', class: 't-fg t-lg' }, layer, 'h = ' + terms.join(' + '));
    s('text', { x: mid, y: 198, 'text-anchor': 'middle' }, layer, 'one weight per column, so h is linear in the weights');
    const pw = [], vals = [];
    for (let j = 0; j < n; j++) { pw.push('x' + SUP[j]); vals.push(X ** j); }
    note.textContent = d === 3
      ? 'degree = 3 gives [x⁰, x¹, x², x³] = [1, 2, 4, 8], option d. Leave out the bias column and you get [2, 4, 8], option c.'
      : `degree = ${d} gives ${n} columns, [${pw.join(', ')}] = [${vals.join(', ')}]. The bias column 1 is always there.`;
  }
  steps(viz('deg-steps'), ['degree 1', 'degree 2', 'degree 3', 'degree 4'], k => draw(k + 1), 2);

  // Figure 2: the columns as curves of x
  const c2 = svg(viz('curves'), 640, 270, { label: 'The curves 1, x, x squared and x cubed for x from 0 to 2.5, with the chosen input marked', minWidth: 500 });
  const ax = axes(c2, { x: 52, y: 24, w: 520, h: 200, xd: [0, 2.5], yd: [0, 16], xt: [0, 0.5, 1, 1.5, 2, 2.5], yt: [0, 4, 8, 12, 16], xf: v => fmt(v, 1), xl: 'x, the input', yl: 'column value' });
  const CUR = [['s-muted', 't-muted', 'f-muted'], ['s-ter', 't-ter', 'f-ter'], ['s-sec', 't-sec', 'f-sec'], ['s-pri', 't-pri', 'f-pri']];
  CUR.forEach(([cls, tc], j) => {
    plot(c2, ax, x => x ** j, 0, 2.5, 100, cls);
    s('text', { x: ax.x(2.5) + 8, y: ax.y(2.5 ** j), dy: '0.35em', class: tc + ' t-bold' }, c2, 'x' + SUP[j]);
  });
  const mark = s('line', { y1: ax.y(0), y2: ax.y(16), class: 's-fg dash', style: 'opacity: 0.6' }, c2);
  const dots = CUR.map(([, , f]) => s('circle', { r: 5, class: f }, c2));
  slider(viz('x-slider'), { label: 'x', min: 0, max: 2.5, step: 0.1, value: 2, fmt: v => v.toFixed(1) }, x => {
    mark.setAttribute('x1', ax.x(x)); mark.setAttribute('x2', ax.x(x));
    const vals = [0, 1, 2, 3].map(j => x ** j);
    dots.forEach((d, j) => { d.setAttribute('cx', ax.x(x)); d.setAttribute('cy', ax.y(vals[j])); });
    vals.forEach((v, j) => { role('p' + j).textContent = fmt(v, 3); });
    role('curves-verdict').innerHTML = `x = ${fmt(x, 1)} gives the feature vector <b>[${vals.map(v => fmt(v, 3)).join(', ')}]</b>` + (x === 2 ? ', option d.' : '.');
  });
});

QV.register('s3-mc2', function (q) {
  const { s, svg, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const sig = z => 1 / (1 + Math.exp(-z));
  const CEN = [5, 5], K = 1.6, M = 2.4;
  const CL = [
    { name: 'Work', u: [0, 1], f: 'f-pri', soft: 'f-pri-soft', shape: 'circle' },
    { name: 'Friends', u: [1, 0], f: 'f-sec', soft: 'f-sec-soft', shape: 'square' },
    { name: 'Family', u: [0, -1], f: 'f-ter', soft: 'f-ter-soft', shape: 'tri' },
    { name: 'Hobby', u: [-1, 0], f: 'f-fg', soft: 'f-seg', shape: 'diamond' },
  ];
  const SUPI = ['⁽¹⁾', '⁽²⁾', '⁽³⁾', '⁽⁴⁾'];
  const OFF = [[0, 0], [0.8, 0.5], [-0.7, 0.6], [0.5, -0.7], [-0.6, -0.5]];
  const h = (i, p) => sig(K * (CL[i].u[0] * (p[0] - CEN[0]) + CL[i].u[1] * (p[1] - CEN[1])) - M);
  const QX = [6, 7];
  const HQ = CL.map((c, i) => h(i, QX));
  const best = HQ.indexOf(Math.max(...HQ));

  const g = svg(viz('ova'), 760, 350, { label: 'Four classes of emails in a feature plane, the one-vs-all boundaries, and the four classifier outputs for a new email', minWidth: 560 });
  const U = 30, OX = 40, OY = 320;
  const px = u => OX + U * u, py = v => OY - U * v;
  const mark = (shape, x, y, r, parent) => {
    if (shape === 'circle') return s('circle', { cx: x, cy: y, r }, parent);
    if (shape === 'square') return s('rect', { x: x - r * 0.9, y: y - r * 0.9, width: r * 1.8, height: r * 1.8 }, parent);
    if (shape === 'tri') return s('polygon', { points: `${x},${y - r * 1.15} ${x + r},${y + r * 0.75} ${x - r},${y + r * 0.75}` }, parent);
    return s('polygon', { points: `${x},${y - r * 1.2} ${x + r * 1.2},${y} ${x},${y + r * 1.2} ${x - r * 1.2},${y}` }, parent);
  };

  const regions = s('g', {}, g);
  [[[0, 10], [10, 10]], [[10, 10], [10, 0]], [[10, 0], [0, 0]], [[0, 0], [0, 10]]].forEach((w, i) => {
    s('polygon', { points: [[5, 5], ...w].map(p => px(p[0]) + ',' + py(p[1])).join(' '), class: CL[i].soft, style: 'opacity: 0.75' }, regions);
  });
  const halves = [[0, 6.5, 10, 10], [6.5, 0, 10, 10], [0, 0, 10, 3.5], [0, 0, 3.5, 10]].map(([x0, y0, x1, y1]) =>
    s('rect', { x: px(x0), y: py(y1), width: U * (x1 - x0), height: U * (y1 - y0), class: 'area-pri' }, g));
  s('rect', { x: px(0), y: py(10), width: U * 10, height: U * 10, class: 'f-none box' }, g);
  const blines = [[[0, 6.5], [10, 6.5]], [[6.5, 0], [6.5, 10]], [[0, 3.5], [10, 3.5]], [[3.5, 0], [3.5, 10]]].map(([a, b]) =>
    s('line', { x1: px(a[0]), y1: py(a[1]), x2: px(b[0]), y2: py(b[1]), class: 's-pri' }, g));
  s('text', { x: px(5), y: OY + 18, 'text-anchor': 'middle' }, g, 'feature x₁');
  s('text', { x: OX, y: 12 }, g, 'feature x₂');

  const pts = [];
  CL.forEach((c, i) => {
    const cx = CEN[0] + 3 * c.u[0], cy = CEN[1] + 3 * c.u[1];
    OFF.forEach(([dx, dy]) => pts.push({ el: mark(c.shape, px(cx + dx), py(cy + dy), 6, g), c: i }));
  });
  s('circle', { cx: px(QX[0]), cy: py(QX[1]), r: 9, class: 's-fg' }, g);
  s('circle', { cx: px(QX[0]), cy: py(QX[1]), r: 4, class: 'f-fg' }, g);
  s('text', { x: px(QX[0]) + 13, y: py(QX[1]), dy: '0.35em', class: 't-fg t-bold halo' }, g, 'new email x');
  const bLab = s('text', { class: 't-pri t-bold halo' }, g);
  const pLab = s('text', { class: 't-pri halo' }, g);
  const LAB = [
    { b: [px(0.2), py(6.5) - 7, 'start'], p: [px(9.8), py(9.6), 'end'] },
    { b: [px(6.5) + 6, py(0.4), 'start'], p: [px(9.8), py(9.6), 'end'] },
    { b: [px(0.2), py(3.5) + 15, 'start'], p: [px(9.8), py(0.3), 'end'] },
    { b: [px(3.5) - 6, py(0.4), 'end'], p: [px(0.2), py(9.6), 'start'] },
  ];

  const BX = 500, BW = 220, BH = 24, BY = [70, 118, 166, 214];
  s('text', { x: 400, y: 40, class: 't-fg t-bold' }, g, 'Outputs hθ⁽ⁱ⁾(x) for the new email x');
  s('line', { x1: BX + BW / 2, x2: BX + BW / 2, y1: 60, y2: 248, class: 'l-grid dash' }, g);
  s('line', { x1: BX, x2: BX, y1: 60, y2: 248, class: 'l-axis' }, g);
  [0, 0.5, 1].forEach(v => s('text', { x: BX + v * BW, y: 262, 'text-anchor': 'middle', class: 't-sm' }, g, String(v)));
  const bars = CL.map((c, i) => {
    const grp = s('g', { class: 'fade' }, g);
    s('text', { x: BX - 8, y: BY[i] + BH / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-fg' }, grp, 'h' + SUPI[i] + ' ' + c.name);
    const rect = s('rect', { x: BX, y: BY[i], width: Math.max(2, HQ[i] * BW), height: BH, rx: 2 }, grp);
    s('text', { x: BX + Math.max(2, HQ[i] * BW) + 6, y: BY[i] + BH / 2, dy: '0.35em', class: i === best ? 't-ok t-bold' : 't-fg' }, grp, HQ[i].toFixed(3) + (i === best ? ', largest' : ''));
    return { grp, rect };
  });
  s('text', { x: 400, y: 288, class: 't-fg' }, g, 'Prediction: the class i with the largest hθ⁽ⁱ⁾(x)');
  s('text', { x: 400, y: 306, class: 't-ok t-bold' }, g, `ŷ = ${CL[best].name} (y = ${best + 1})`);
  const legend = CL.map((c, i) => {
    const x = [404, 474, 562, 648][i];
    const m = mark(c.shape, x, 336, 5, g);
    m.setAttribute('class', c.f);
    s('text', { x: x + 10, y: 336, dy: '0.35em', class: 't-fg' }, g, c.name);
    return m;
  });

  const note = role('ova-note');
  const sum = HQ.reduce((a, b) => a + b, 0);
  steps(viz('ova-steps'), ['All 4', 'h⁽¹⁾ Work', 'h⁽²⁾ Friends', 'h⁽³⁾ Family', 'h⁽⁴⁾ Hobby'], k => {
    const all = k === 0, i = k - 1;
    regions.style.display = all ? '' : 'none';
    halves.forEach((r, j) => { r.style.display = j === i ? '' : 'none'; });
    blines.forEach((l, j) => { l.style.display = j === i ? '' : 'none'; });
    pts.forEach(p => p.el.setAttribute('class', all ? CL[p.c].f : (p.c === i ? 'f-pri' : 'f-muted')));
    legend.forEach((m, j) => m.setAttribute('class', all ? CL[j].f : (j === i ? 'f-pri' : 'f-muted')));
    bars.forEach((b, j) => {
      b.rect.setAttribute('class', all ? CL[j].f : (j === i ? 'f-pri' : 'f-muted'));
      b.grp.classList.toggle('dim', !all && j !== i);
    });
    bLab.style.display = pLab.style.display = all ? 'none' : '';
    if (all) {
      note.textContent = `All four classifiers. Each tinted wedge is where that class has the largest hθ⁽ⁱ⁾(x). The new email x falls in the Work wedge, where h⁽¹⁾ = ${HQ[best].toFixed(3)} is the largest of the four, so the prediction is Work. The four outputs add up to ${sum.toFixed(2)}, because they come from four separate classifiers.`;
      return;
    }
    const L = LAB[i];
    [[bLab, L.b, `h${SUPI[i]}(x) = 0.5`], [pLab, L.p, `positive: ${CL[i].name}`]].forEach(([el, [x, y, a], t]) => {
      el.setAttribute('x', x); el.setAttribute('y', y); el.setAttribute('text-anchor', a); el.textContent = t;
    });
    note.textContent = `Classifier ${i + 1}: ${CL[i].name} (y = ${i + 1}) is positive and the other three folders are negative. On the shaded side of the line hθ${SUPI[i]}(x) > 0.5. For the new email x it gives ${HQ[i].toFixed(3)}.` + (i === best ? ' This is the largest of the four outputs.' : '');
  });
});

QV.register('s3-mc3', function (q) {
  const { s, svg, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const P = 13, BASE = 190;

  const sq = svg(viz('squares'), 760, 222, { label: 'The five errors drawn as lengths for MAE and as squares of area e squared for MSE', minWidth: 560 });
  s('text', { x: 16, y: 18, class: 't-fg t-bold' }, sq, '|e|, what MAE adds');
  s('text', { x: 300, y: 18, class: 't-fg t-bold' }, sq, 'e², what MSE adds');
  s('line', { x1: 16, x2: 270, y1: BASE, y2: BASE, class: 'l-axis' }, sq);
  s('line', { x1: 300, x2: 560, y1: BASE, y2: BASE, class: 'l-axis' }, sq);
  ['e₁', 'e₂', 'e₃', 'e₄', 'e₅'].forEach((t, i) => s('text', { x: 45 + i * 46, y: BASE + 18, 'text-anchor': 'middle' }, sq, t));
  const layer = s('g', {}, sq);

  const sh = svg(viz('share'), 760, 92, { label: 'Share of each error in the sum of absolute errors and in the sum of squared errors', minWidth: 560 });
  const shL = s('g', {}, sh);
  const SX = 90, SW = 580;

  function draw(e) {
    layer.textContent = '';
    e.forEach((v, i) => {
      const x = 30 + i * 46, cls = i === 4 ? 'f-sec' : 'f-pri';
      if (v > 0) s('rect', { x, y: BASE - v * P, width: 30, height: v * P, class: cls }, layer);
      s('text', { x: x + 15, y: BASE - v * P - 6, 'text-anchor': 'middle', class: 't-fg' }, layer, String(v));
    });
    let x = 300;
    e.forEach((v, i) => {
      const side = v * P, cls = i === 4 ? 'f-sec' : 'f-pri';
      if (v > 0) {
        s('rect', { x, y: BASE - side, width: side, height: side, class: cls + ' sep' }, layer);
        s('text', { x: x + side / 2, y: BASE - side - 6, 'text-anchor': 'middle', class: 't-fg' }, layer, String(v * v));
      }
      x += side + 10;
    });
    shL.textContent = '';
    [['Σ|e|', 10, e], ['Σe²', 52, e.map(v => v * v)]].forEach(([name, y, vals]) => {
      const tot = vals.reduce((a, b) => a + b, 0);
      s('text', { x: 16, y: y + 14, dy: '0.35em', class: 't-fg t-bold' }, shL, name);
      let cx = SX;
      vals.forEach((v, i) => {
        const w = tot ? v / tot * SW : 0;
        if (w > 0) s('rect', { x: cx, y, width: w, height: 28, class: (i === 4 ? 'f-sec' : 'f-pri') + ' sep' }, shL);
        const label = i === 4 && w >= 70 ? `${v}, ${Math.round(100 * v / tot)}%` : String(v);
        if (w >= 16 && v > 0) s('text', { x: cx + w / 2, y: y + 14, dy: '0.35em', 'text-anchor': 'middle', class: 't-on' }, shL, label);
        cx += w;
      });
      s('text', { x: SX + SW + 8, y: y + 14, dy: '0.35em', class: 't-fg t-bold' }, shL, '= ' + tot);
    });
  }

  slider(viz('e-slider'), { label: 'e₅', min: 0, max: 10, step: 1, value: 6 }, e5 => {
    const e = [1, 1, 1, 1, e5];
    const sa = e.reduce((a, b) => a + b, 0), ss = e.reduce((a, b) => a + b * b, 0);
    const mse = ss / 5, mae = sa / 5;
    role('mae').textContent = fmt(mae, 2);
    role('rmse').textContent = fmt(Math.sqrt(mse), 2);
    role('mse').textContent = fmt(mse, 2);
    role('sum').textContent = String(ss);
    role('e-verdict').innerHTML = e5 > 1
      ? `The error of ${e5} is <b>${Math.round(100 * e5 / sa)}%</b> of Σ|e| but <b>${Math.round(100 * e5 * e5 / ss)}%</b> of Σe². MSE = ${fmt(mse, 2)} and MAE = ${fmt(mae, 2)}.`
      : `Every error is 0 or 1, so e² = |e| and MSE = MAE = ${fmt(mse, 2)}. Squaring only matters for errors larger than 1.`;
    draw(e);
  });
});

QV.register('s3-mc4', function (q) {
  const { s, svg, steps, table, box, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const A = [[2, 7], [3, 8], [1.5, 5.5], [3.2, 6.3], [2.5, 4.2], [4, 8.5]];
  const B = [[6.5, 3], [7, 4.5], [8, 2.5], [5.6, 6.4], [5.2, 1.8], [8, 6.2]];
  const Q = [4.6, 5.2], KN = 3;
  const PTS = A.map((p, i) => ({ p, c: 'A', name: 'P' + (i + 1) })).concat(B.map((p, i) => ({ p, c: 'B', name: 'P' + (i + 7) })));
  PTS.forEach(o => { o.d = Math.hypot(o.p[0] - Q[0], o.p[1] - Q[1]); });
  const ranked = PTS.slice().sort((a, b) => a.d - b.d);
  ranked.forEach((o, r) => { o.rank = r + 1; });
  const near = ranked.slice(0, KN);
  const votes = { A: near.filter(o => o.c === 'A').length, B: near.filter(o => o.c === 'B').length };
  const pred = votes.A > votes.B ? 'A' : 'B';

  const g = svg(viz('knn'), 640, 330, { label: 'Training points of classes A and B, a new point Q, the distances from Q and the three nearest neighbours', minWidth: 520 });
  const U = 28, OX = 40, OY = 300;
  const px = u => OX + U * u, py = v => OY - U * v;
  s('rect', { x: px(0), y: py(10), width: U * 10, height: U * 10, class: 'f-none box' }, g);
  s('text', { x: px(5), y: OY + 18, 'text-anchor': 'middle' }, g, 'x₁');
  s('text', { x: OX - 8, y: py(5), dy: '0.35em', 'text-anchor': 'end' }, g, 'x₂');
  const allLines = s('g', {}, g), nearLines = s('g', {}, g);
  PTS.forEach(o => s('line', { x1: px(Q[0]), y1: py(Q[1]), x2: px(o.p[0]), y2: py(o.p[1]), class: 's-muted dash', style: 'stroke-width: 1' }, allLines));
  near.forEach(o => s('line', { x1: px(Q[0]), y1: py(Q[1]), x2: px(o.p[0]), y2: py(o.p[1]), class: 's-fg' }, nearLines));
  const ring = s('circle', { cx: px(Q[0]), cy: py(Q[1]), r: near[KN - 1].d * U, class: 's-fg dash', style: 'stroke-width: 1' }, g);
  const rings = near.map(o => s('circle', { cx: px(o.p[0]), cy: py(o.p[1]), r: 10, class: 's-ok' }, g));
  PTS.forEach(o => {
    const x = px(o.p[0]), y = py(o.p[1]);
    if (o.c === 'A') s('circle', { cx: x, cy: y, r: 6, class: 'f-pri' }, g);
    else s('rect', { x: x - 5.5, y: y - 5.5, width: 11, height: 11, class: 'f-sec' }, g);
    const left = o.name === 'P2';
    s('text', { x: left ? x - 10 : x + 13, y: left ? y + 4 : y - 9, 'text-anchor': left ? 'end' : 'start', class: 't-sm t-fg halo' }, g, o.name);
  });
  const qg = s('g', {}, g);
  s('circle', { cx: px(Q[0]), cy: py(Q[1]), r: 6, class: 'f-fg' }, qg);
  s('text', { x: px(Q[0]) + 8, y: py(Q[1]) + 18, class: 't-fg t-bold halo' }, qg, 'Q');
  const info = s('g', {}, g);
  const INFO = [
    ['fit(X_train, y_train)', ['stores the 12 rows as they are', 'distances computed: 0', 'parameters learned: 0', 'no boundary, no model'], 't-fg'],
    ['predict(Q)', ['distance from Q to every row', 'distances computed: 12', 'for this one new point', 'next point: 12 more'], 't-fg'],
    ['predict(Q), k = 3', [`nearest: ${near.map(o => o.name + ' ' + o.c).join(', ')}`, `vote: A ${votes.A}, B ${votes.B}`, `prediction: class ${pred}`, 'still no parameters'], 't-ok'],
  ];

  const note = role('knn-note');
  const host = viz('knn-table');
  const head = ['Point', 'x₁', 'x₂', 'class', 'distance to Q', 'rank'].map((t, i) => ({ text: t, cls: i === 0 || i === 3 ? 'l' : '' }));
  steps(viz('knn-steps'), ['fit', 'predict: distances', 'predict: vote (k = 3)'], k => {
    const predict = k > 0;
    qg.style.display = predict ? '' : 'none';
    allLines.style.display = k === 1 ? '' : 'none';
    nearLines.style.display = ring.style.display = k === 2 ? '' : 'none';
    rings.forEach(r => { r.style.display = k === 2 ? '' : 'none'; });
    info.textContent = '';
    const [title, lines, last] = INFO[k];
    s('text', { x: 352, y: 44, class: 't-fg t-bold t-lg' }, info, title);
    lines.forEach((t, i) => s('text', { x: 352, y: 74 + i * 22, class: i === lines.length - 2 && k === 2 ? last + ' t-bold' : 't-fg' }, info, t));
    host.textContent = '';
    const rows = (predict ? ranked : PTS).map(o => [
      { text: o.name, cls: 'l' }, String(o.p[0]), String(o.p[1]), { text: o.c, cls: 'l' },
      predict ? o.d.toFixed(3) : '', predict ? String(o.rank) : '',
    ]);
    const t = table(host, head, rows);
    if (k === 2) t.rows.slice(0, KN).forEach(r => r.classList.add('on'));
    note.textContent = [
      'fit only stores X_train and y_train. Nothing is computed and no parameters are learned, so the table has no distance column yet.',
      'A new point Q arrives. KNN computes the distance from Q to all 12 stored rows and ranks them. All of this happens at prediction time, and it is repeated for every new point.',
      `The k = 3 nearest rows vote: ${near.map(o => o.name + ' (' + o.c + ')').join(', ')}. Class A wins ${votes.A} to ${votes.B}, so Q is predicted as ${pred}.`,
    ][k];
  }, 2);

  // Figure 2: where the work goes, lazy vs eager
  const L = svg(viz('lanes'), 760, 190, { label: 'KNN does almost nothing in fit and all its work in predict; logistic regression works in fit and predicts with one formula', minWidth: 560 });
  s('text', { x: 360, y: 20, 'text-anchor': 'middle', class: 't-fg t-bold' }, L, 'fit (training)');
  s('text', { x: 620, y: 20, 'text-anchor': 'middle', class: 't-fg t-bold' }, L, 'predict (every new point)');
  s('line', { x1: 480, x2: 480, y1: 30, y2: 180, class: 'l-grid dash' }, L);
  s('text', { x: 16, y: 56, class: 't-pri t-bold' }, L, 'KNN, lazy');
  s('text', { x: 16, y: 72 }, L, 'keeps all the data');
  s('text', { x: 16, y: 136, class: 't-sec t-bold' }, L, 'Logistic regression,');
  s('text', { x: 16, y: 152, class: 't-sec t-bold' }, L, 'eager');
  s('text', { x: 16, y: 168 }, L, 'keeps only θ');
  box(L, 230, 40, 170, 44, 'store X_train, y_train', { cls: 'f-seg', textCls: 't-fg' });
  box(L, 494, 40, 252, 44, 'distance to all m rows,\nrank, take k, vote', { cls: 'f-pri', textCls: 't-on' });
  box(L, 230, 120, 236, 44, 'gradient descent,\nmany iterations → θ', { cls: 'f-sec', textCls: 't-on' });
  box(L, 494, 120, 150, 44, 'σ(θᵀx), one formula', { cls: 'f-seg', textCls: 't-fg' });
  arrow(L, 400, 62, 492, 62, { cls: 'a-muted' });
  arrow(L, 466, 142, 492, 142, { cls: 'a-muted' });
});

QV.register('s3-mc5', function (q) {
  const { s, svg, axes, plot, arrow, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const H = p => (p <= 0 || p >= 1) ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
  const EP = H(0.6), E1 = 0, E2 = H(1 / 3);
  const W = 0.4 * E1 + 0.6 * E2, IG = EP - W;

  // Figure 1: the split and the entropy ruler
  const g = svg(viz('split'), 760, 350, { label: 'Parent node with 6 Yes and 4 No split into 4 Yes 0 No and 2 Yes 4 No, and bars for parent entropy, weighted child entropy and information gain', minWidth: 560 });
  const SQ = 20, SG = 4;
  const rowsOf = (x0, y, list) => list.forEach((yes, i) => s('rect', { x: x0 + i * (SQ + SG), y, width: SQ, height: SQ, rx: 3, class: yes ? 'f-pri' : 'f-sec' }, g));
  const wOf = n => n * SQ + (n - 1) * SG;
  const PARENT = [1, 1, 1, 1, 1, 1, 0, 0, 0, 0], C1 = [1, 1, 1, 1], C2 = [1, 1, 0, 0, 0, 0];
  s('text', { x: 380, y: 16, 'text-anchor': 'middle', class: 't-fg t-bold' }, g, 'parent: 6 Yes / 4 No');
  rowsOf(380 - wOf(10) / 2, 26, PARENT);
  s('text', { x: 380, y: 64, 'text-anchor': 'middle', class: 't-fg' }, g, 'E = ' + EP.toFixed(3));
  arrow(g, 340, 72, 200, 118, { cls: 'a-muted' });
  arrow(g, 420, 72, 560, 118, { cls: 'a-muted' });
  s('text', { x: 250, y: 88, 'text-anchor': 'end' }, g, '4 of 10 rows');
  s('text', { x: 510, y: 88 }, g, '6 of 10 rows');
  rowsOf(190 - wOf(4) / 2, 124, C1);
  rowsOf(570 - wOf(6) / 2, 124, C2);
  s('text', { x: 190, y: 162, 'text-anchor': 'middle', class: 't-fg t-bold' }, g, '4 Yes / 0 No');
  s('text', { x: 190, y: 178, 'text-anchor': 'middle', class: 't-fg' }, g, 'E = 0, pure');
  s('text', { x: 570, y: 162, 'text-anchor': 'middle', class: 't-fg t-bold' }, g, '2 Yes / 4 No');
  s('text', { x: 570, y: 178, 'text-anchor': 'middle', class: 't-fg' }, g, 'E = ' + E2.toFixed(3));

  const RX = 150, RW = 560, rx = v => RX + v * RW;
  const RY = [204, 240, 282];
  s('text', { x: 16, y: RY[0] + 12, dy: '0.35em', class: 't-fg' }, g, 'E(Y), parent');
  s('rect', { x: rx(0), y: RY[0], width: rx(EP) - rx(0), height: 24, class: 'f-seg box' }, g);
  s('text', { x: rx(EP) + 6, y: RY[0] + 12, dy: '0.35em', class: 't-fg t-bold' }, g, EP.toFixed(3));
  s('text', { x: 16, y: RY[1] + 12, dy: '0.35em', class: 't-fg' }, g, 'E(Y | X), weighted');
  s('rect', { x: rx(0), y: RY[1], width: rx(W) - rx(0), height: 24, class: 'f-seg box' }, g);
  s('text', { x: rx(W) / 2 + RX / 2, y: RY[1] + 12, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, g, `4/10 × 0 + 6/10 × ${E2.toFixed(3)} = ${W.toFixed(3)}`);
  s('rect', { x: rx(W), y: RY[1], width: rx(EP) - rx(W), height: 24, class: 'f-ok' }, g);
  s('text', { x: (rx(W) + rx(EP)) / 2, y: RY[1] + 12, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, g, 'IG = ' + IG.toFixed(3));
  s('rect', { x: rx(E2), y: RY[2], width: rx(EP) - rx(E2), height: 14, class: 'f-bad' }, g);
  s('text', { x: rx(E2) - 8, y: RY[2] + 7, dy: '0.35em', 'text-anchor': 'end', class: 't-bad' }, g, `unweighted ${EP.toFixed(3)} − ${E2.toFixed(3)} = ${(EP - E2).toFixed(3)}, option d`);
  const AY = 314;
  s('line', { x1: rx(0), x2: rx(1), y1: AY, y2: AY, class: 'l-axis' }, g);
  [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(v => {
    s('line', { x1: rx(v), x2: rx(v), y1: AY, y2: AY + 5, class: 'l-axis' }, g);
    s('text', { x: rx(v), y: AY + 18, 'text-anchor': 'middle' }, g, fmt(v, 1));
  });
  s('text', { x: rx(0.5), y: AY + 34, 'text-anchor': 'middle' }, g, 'entropy (bits)');

  // Figure 2: entropy curve, chord and the IG gap
  const c = svg(viz('curve'), 720, 300, { label: 'Entropy curve against the share of Yes, with parent, children, the chord between the children and the information gain gap', minWidth: 540 });
  const ax = axes(c, { x: 56, y: 30, w: 520, h: 210, xd: [0, 1], yd: [0, 1.05], xt: [0, 0.2, 0.4, 0.6, 0.8, 1], yt: [0, 0.25, 0.5, 0.75, 1], xf: v => fmt(v, 1), yf: v => fmt(v, 2), xl: 'p, share of Yes in the node', yl: 'entropy (bits)' });
  plot(c, ax, H, 0, 1, 200, 's-fg');
  s('line', { x1: ax.x(1 / 3), y1: ax.y(E2), x2: ax.x(1), y2: ax.y(E1), class: 's-sec dash' }, c);
  s('line', { x1: ax.x(0.6), y1: ax.y(W), x2: ax.x(0.6), y2: ax.y(EP), class: 's-ok', style: 'stroke-width: 4' }, c);
  s('circle', { cx: ax.x(0.6), cy: ax.y(EP), r: 6, class: 'f-fg' }, c);
  s('circle', { cx: ax.x(1 / 3), cy: ax.y(E2), r: 6, class: 'f-sec' }, c);
  s('circle', { cx: ax.x(1), cy: ax.y(E1), r: 6, class: 'f-sec' }, c);
  s('circle', { cx: ax.x(0.6), cy: ax.y(W), r: 6, class: 'f-sec' }, c);
  s('text', { x: ax.x(0.6), y: ax.y(EP) - 11, 'text-anchor': 'middle', class: 't-fg t-bold halo' }, c, `parent 6/10, E = ${EP.toFixed(3)}`);
  s('text', { x: ax.x(1 / 3) - 11, y: ax.y(E2) - 22, 'text-anchor': 'end', class: 't-sec t-bold halo' }, c, 'child 2/6 Yes');
  s('text', { x: ax.x(1 / 3) - 11, y: ax.y(E2) - 8, 'text-anchor': 'end', class: 't-sec halo' }, c, `E = ${E2.toFixed(3)}, weight 6/10`);
  s('text', { x: ax.x(1) + 10, y: ax.y(E1) - 18, class: 't-sec t-bold' }, c, 'child 4/4 Yes');
  s('text', { x: ax.x(1) + 10, y: ax.y(E1) - 4, class: 't-sec' }, c, 'E = 0, weight 4/10');
  s('text', { x: ax.x(0.6) - 10, y: ax.y(W) + 20, 'text-anchor': 'end', class: 't-sec t-bold halo' }, c, 'weighted children');
  s('text', { x: ax.x(0.6) - 10, y: ax.y(W) + 34, 'text-anchor': 'end', class: 't-sec halo' }, c, `0.6 × ${E2.toFixed(3)} = ${W.toFixed(3)}`);
  s('text', { x: ax.x(0.6) + 10, y: ax.y((W + EP) / 2), dy: '0.35em', class: 't-ok t-bold halo' }, c, 'IG = ' + IG.toFixed(3));
});

QV.register('s3-mc6', function (q) {
  const { s, svg, axes, arrow, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const N = [0.6, 0.8], D = [0.8, -0.6], C0 = 1.6, P0 = [1.2, 1.1], XM = 2.8, YM = 2.2, PX = 150;
  const ANG = Math.atan2(-D[1], D[0]) * 180 / Math.PI;
  const dot = p => N[0] * p[0] + N[1] * p[1];
  const clipHalf = (poly, keep) => {
    const out = [];
    poly.forEach((a, i) => {
      const b = poly[(i + 1) % poly.length], fa = keep(a), fb = keep(b);
      if (fa >= 0) out.push(a);
      if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]); }
    });
    return out;
  };
  const lineAt = c => {
    const pc = [P0[0] + (c - C0) * N[0], P0[1] + (c - C0) * N[1]];
    const t0 = Math.max(-pc[0] / D[0], (pc[1] - YM) / -D[1]), t1 = Math.min((XM - pc[0]) / D[0], pc[1] / -D[1]);
    return { at: t => [pc[0] + t * D[0], pc[1] + t * D[1]], t0, t1 };
  };

  const g = svg(viz('margin'), 520, 396, { label: 'Hyperplane and the two margin lines of a linear SVM with w in the direction (3, 4); the margin width is 2 over the norm of w', minWidth: 420 });
  const ax = axes(g, { x: 50, y: 20, w: XM * PX, h: YM * PX, xd: [0, XM], yd: [0, YM], xt: [0, 0.5, 1, 1.5, 2, 2.5], yt: [0, 0.5, 1, 1.5, 2], xf: v => fmt(v, 1), yf: v => fmt(v, 1), xl: 'x₁', yl: 'x₂', grid: false });
  s('rect', { x: ax.x(0), y: ax.y(YM), width: XM * PX, height: YM * PX, class: 'f-none box' }, g);
  const sp = p => [ax.x(p[0]), ax.y(p[1])];
  const layer = s('g', {}, g);
  const rotText = (p, off, text, cls) => {
    const [x, y] = sp(p);
    const tx = x + N[0] * off, ty = y - N[1] * off;
    s('text', { x: tx, y: ty, 'text-anchor': 'middle', class: cls, transform: `rotate(${ANG.toFixed(2)} ${tx.toFixed(1)} ${ty.toFixed(1)})` }, layer, text);
  };
  function draw(nw) {
    layer.textContent = '';
    const RECT = [[0, 0], [XM, 0], [XM, YM], [0, YM]];
    const band = clipHalf(clipHalf(RECT, p => dot(p) - (C0 - 1 / nw)), p => (C0 + 1 / nw) - dot(p));
    s('polygon', { points: band.map(p => sp(p).map(v => v.toFixed(1)).join(',')).join(' '), class: 'area-pri' }, layer);
    const lines = [[C0 + 1 / nw, 's-pri dash'], [C0, 's-fg'], [C0 - 1 / nw, 's-pri dash']].map(([c, cls]) => {
      const L = lineAt(c), a = sp(L.at(L.t0)), b = sp(L.at(L.t1));
      s('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: cls }, layer);
      return L;
    });
    rotText(lines[0].at(-0.75), 6, 'w·x + b = 1', 't-pri t-bold halo');
    rotText(lines[1].at(0.55), 5, 'w·x + b = 0', 't-fg t-bold halo');
    rotText(lines[2].at(0.8), -15, 'w·x + b = −1', 't-pri t-bold halo');
    const base = lines[1].at(-0.15);
    const xp = [base[0] + N[0] / nw, base[1] + N[1] / nw], xm = [base[0] - N[0] / nw, base[1] - N[1] / nw];
    const [ax1, ay1] = sp(xm), [ax2, ay2] = sp(xp);
    s('line', { x1: ax1, y1: ay1, x2: ax2, y2: ay2, class: 's-ok', style: 'stroke-width: 3' }, layer);
    s('circle', { cx: ax2, cy: ay2, r: 5, class: 'f-pri' }, layer);
    s('circle', { cx: ax1, cy: ay1, r: 5, class: 'f-sec' }, layer);
    s('text', { x: ax2 + N[0] * 16, y: ay2 - N[1] * 16, dy: '0.35em', 'text-anchor': 'middle', class: 't-pri t-bold halo' }, layer, 'x₊');
    s('text', { x: ax1 - N[0] * 16, y: ay1 + N[1] * 16, dy: '0.35em', 'text-anchor': 'middle', class: 't-sec t-bold halo' }, layer, 'x₋');
    s('text', { x: ax1 - N[0] * 44, y: ay1 + N[1] * 44, dy: '0.35em', 'text-anchor': 'middle', class: 't-ok t-bold halo' }, layer, 'd = ' + fmt(2 / nw, 3));
    const wb = sp(lines[1].at(1.2));
    arrow(layer, wb[0], wb[1], wb[0] + N[0] * 60, wb[1] - N[1] * 60, { cls: 'a-muted', width: 2 });
    s('text', { x: wb[0] + N[0] * 72, y: wb[1] - N[1] * 72, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold halo' }, layer, 'w');
  }

  slider(viz('w-slider'), { label: '‖w‖', min: 2, max: 8, step: 0.5, value: 5, fmt: v => fmt(v, 1) }, nw => {
    role('w').textContent = `(${fmt(0.6 * nw, 2)}, ${fmt(0.8 * nw, 2)})`;
    role('b').textContent = `b = −${fmt(1.6 * nw, 2)}`;
    role('norm').textContent = fmt(nw, 2);
    role('d').textContent = fmt(2 / nw, 3);
    role('half').textContent = fmt(1 / nw, 3);
    role('w-verdict').innerHTML = nw === 5
      ? '‖w‖ = √(3² + 4²) = 5, so <b>d = 2/5 = 0.4</b>, option b. Each margin line is 1/‖w‖ = 0.2 from the hyperplane, option a.'
      : `‖w‖ = ${fmt(nw, 2)} gives <b>d = 2/${fmt(nw, 2)} = ${fmt(2 / nw, 3)}</b>. ` + (nw < 5 ? 'A smaller ‖w‖ gives a wider margin.' : 'A larger ‖w‖ gives a narrower margin.');
    draw(nw);
  });

  // Figure 2: 3-4-5 triangle and the four options to scale
  const t = svg(viz('tri'), 700, 220, { label: 'The vector w = (3, 4) with legs 3 and 4 and length 5, and the four options as bars', minWidth: 540 });
  const U = 36, O = [40, 196];
  for (let i = 0; i <= 4; i++) s('line', { x1: O[0] + i * U, x2: O[0] + i * U, y1: O[1], y2: O[1] - 5 * U, class: 'l-grid' }, t);
  for (let j = 0; j <= 5; j++) s('line', { x1: O[0], x2: O[0] + 4 * U, y1: O[1] - j * U, y2: O[1] - j * U, class: 'l-grid' }, t);
  s('line', { x1: O[0], y1: O[1], x2: O[0] + 3 * U, y2: O[1], class: 's-ter' }, t);
  s('line', { x1: O[0] + 3 * U, y1: O[1], x2: O[0] + 3 * U, y2: O[1] - 4 * U, class: 's-ter' }, t);
  s('path', { d: `M${O[0] + 3 * U - 10} ${O[1]} V${O[1] - 10} H${O[0] + 3 * U}`, class: 's-muted', style: 'stroke-width: 1' }, t);
  arrow(t, O[0], O[1], O[0] + 3 * U, O[1] - 4 * U, { cls: 'a-pri', width: 2.5, head: 10 });
  s('text', { x: O[0] + 1.5 * U, y: O[1] - 8, 'text-anchor': 'middle', class: 't-ter t-bold' }, t, '3');
  s('text', { x: O[0] + 3 * U + 8, y: O[1] - 2 * U, dy: '0.35em', class: 't-ter t-bold' }, t, '4');
  s('text', { x: O[0] + 1.5 * U - 10, y: O[1] - 2 * U - 10, 'text-anchor': 'end', class: 't-pri t-bold halo' }, t, 'w');
  s('text', { x: 196, y: 92, class: 't-fg t-lg' }, t, '‖w‖ = √(3² + 4²)');
  s('text', { x: 196, y: 112, class: 't-fg t-lg' }, t, '= √25 = 5');
  const BX = 470, BU = 40;
  s('text', { x: 350, y: 18, class: 't-fg t-bold' }, t, 'the four options, to scale');
  [['a · 1/‖w‖', 0.2, 'f-seg box', 't-fg', '0.2'], ['b · 2/‖w‖', 0.4, 'f-ok', 't-ok t-bold', '0.4 = d'], ['c · ‖w‖/2', 2.5, 'f-seg box', 't-fg', '2.5'], ['d · ‖w‖', 5, 'f-seg box', 't-fg', '5']]
    .forEach(([lab, v, cls, tc, val], i) => {
      const y = 34 + i * 36;
      s('text', { x: 350, y: y + 11, dy: '0.35em', class: i === 1 ? 't-ok t-bold' : 't-fg' }, t, lab);
      s('rect', { x: BX, y, width: v * BU, height: 22, rx: 2, class: cls }, t);
      s('text', { x: BX + v * BU + 6, y: y + 11, dy: '0.35em', class: tc }, t, val);
    });
  s('line', { x1: BX, x2: BX + 5 * BU, y1: 182, y2: 182, class: 'l-axis' }, t);
  [0, 1, 2, 3, 4, 5].forEach(v => {
    s('line', { x1: BX + v * BU, x2: BX + v * BU, y1: 182, y2: 187, class: 'l-axis' }, t);
    s('text', { x: BX + v * BU, y: 200, 'text-anchor': 'middle' }, t, String(v));
  });
});

QV.register('s3-mc7', function (q) {
  const { s, svg, axes, table } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const CITY = ['Tashkent', 'Samarkand', 'Bukhara'];
  const SAL = [85, 62, 71];
  const mx = 1, my = SAL.reduce((a, b) => a + b, 0) / 3;
  const slope = SAL.reduce((a, y, x) => a + (x - mx) * (y - my), 0) / 2;
  const icpt = my - slope * mx;
  const lin = x => icpt + slope * x;

  const g = svg(viz('fit'), 760, 290, { label: 'Average salary per city: a straight line over label codes misses every city, one weight per city with one-hot hits all three', minWidth: 560 });
  const panel = (x0, title) => {
    s('text', { x: x0, y: 16, class: 't-fg t-bold' }, g, title);
    return axes(g, { x: x0, y: 40, w: 250, h: 190, xd: [-0.5, 2.5], yd: [55, 90], xt: [0, 1, 2], yt: [60, 70, 80, 90], xf: i => CITY[i], yf: v => '$' + v + 'k', yl: 'average salary' });
  };
  const L = panel(80, 'Label codes: one straight line');
  [0, 1, 2].forEach(i => s('text', { x: L.x(i), y: 266, 'text-anchor': 'middle', class: 't-sec' }, g, 'code ' + i));
  s('line', { x1: L.x(-0.25), y1: L.y(lin(-0.25)), x2: L.x(2.25), y2: L.y(lin(2.25)), class: 's-sec' }, g);
  SAL.forEach((v, i) => {
    const p = lin(i);
    s('line', { x1: L.x(i), x2: L.x(i), y1: L.y(v), y2: L.y(p), class: 's-bad', style: 'stroke-width: 2' }, g);
    s('circle', { cx: L.x(i), cy: L.y(p), r: 4, class: 'f-sec' }, g);
    s('circle', { cx: L.x(i), cy: L.y(v), r: 6, class: 'f-ter' }, g);
    s('text', { x: L.x(i) + 10, y: L.y(v), dy: '0.35em', class: 't-ter t-bold halo' }, g, '$' + v + 'k');
    const right = i !== 1;
    s('text', { x: L.x(i) + (right ? 8 : -8), y: L.y((v + p) / 2) + (right ? 6 : 0), dy: '0.35em', 'text-anchor': right ? 'start' : 'end', class: 't-bad halo' }, g, Math.abs(v - p).toFixed(1));
  });
  const R = panel(470, 'One-hot: one weight per city');
  [0, 1, 2].forEach(i => s('text', { x: R.x(i), y: 266, 'text-anchor': 'middle', class: 't-pri' }, g, 'weight ' + SAL[i]));
  SAL.forEach((v, i) => {
    s('line', { x1: R.x(i) - 18, x2: R.x(i) + 18, y1: R.y(v), y2: R.y(v), class: 's-pri', style: 'stroke-width: 4' }, g);
    s('circle', { cx: R.x(i), cy: R.y(v), r: 6, class: 'f-ter' }, g);
    s('text', { x: R.x(i) + 24, y: R.y(v), dy: '0.35em', class: 't-ter t-bold halo' }, g, '$' + v + 'k');
  });

  table(viz('codes'), ['City', 'label code', 'Tsh', 'Smk', 'Bkh'].map((t, i) => ({ text: t, cls: i === 0 ? 'l' : '' })),
    CITY.map((c, i) => [{ text: c, cls: 'l' }, String(i), ...[0, 1, 2].map(j => ({ text: String(i === j ? 1 : 0), cls: i === j ? 'hl' : '' }))]));

  // Figure 2: invented distances vs equal distances
  const d = svg(viz('dist'), 700, 222, { label: 'Label codes place the cities on a line with distances 1, 1 and 2; one-hot vectors form a triangle with all sides square root of 2', minWidth: 540 });
  s('text', { x: 40, y: 18, class: 't-sec t-bold' }, d, 'label codes: distances 1, 1 and 2');
  const NX = [60, 170, 280], NY = 96;
  s('line', { x1: 40, x2: 300, y1: NY, y2: NY, class: 'l-axis' }, d);
  NX.forEach((x, i) => {
    s('circle', { cx: x, cy: NY, r: 6, class: 'f-sec' }, d);
    s('text', { x, y: NY - 14, 'text-anchor': 'middle', class: 't-fg t-bold' }, d, CITY[i]);
    s('text', { x, y: NY + 20, 'text-anchor': 'middle', class: 't-sec' }, d, String(i));
  });
  const brace = (x1, x2, y, lab) => {
    s('path', { d: `M${x1} ${y - 6} V${y} H${x2} V${y - 6}`, class: 's-muted', style: 'stroke-width: 1' }, d);
    s('text', { x: (x1 + x2) / 2, y: y + 16, 'text-anchor': 'middle', class: 't-fg' }, d, lab);
  };
  brace(NX[0], NX[1], 136, '1');
  brace(NX[1], NX[2], 136, '1');
  brace(NX[0], NX[2], 176, '2, twice as far');
  s('text', { x: 420, y: 18, class: 't-pri t-bold' }, d, 'one-hot: every pair √2 apart');
  const T = [[520, 58], [440, 196], [600, 196]];
  s('polygon', { points: T.map(p => p.join(',')).join(' '), class: 'f-pri-soft box' }, d);
  [[0, 1], [0, 2], [1, 2]].forEach(([a, b]) => {
    const mxp = (T[a][0] + T[b][0]) / 2, myp = (T[a][1] + T[b][1]) / 2;
    const off = a === 1 ? [0, 16] : (b === 1 ? [-16, 0] : [16, 0]);
    s('text', { x: mxp + off[0], y: myp + off[1], dy: '0.35em', 'text-anchor': 'middle', class: 't-pri t-bold' }, d, '√2');
  });
  [['Tashkent (1, 0, 0)', 0, 0, -12, 'middle'], ['Samarkand (0, 1, 0)', 1, -8, 18, 'middle'], ['Bukhara (0, 0, 1)', 2, 8, 18, 'middle']].forEach(([lab, i, dx, dy, a]) => {
    s('circle', { cx: T[i][0], cy: T[i][1], r: 6, class: 'f-pri' }, d);
    s('text', { x: T[i][0] + dx, y: T[i][1] + dy, 'text-anchor': a, class: 't-fg' }, d, lab);
  });
});

QV.register('s3-mc8', function (q) {
  const { s, svg, box, arrow, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const TR = [40, 45, 50, 55, 60], TE = [55, 60, 65];
  const stat = v => {
    const m = v.reduce((a, b) => a + b, 0) / v.length;
    return { m, sd: Math.sqrt(v.reduce((a, b) => a + (b - m) * (b - m), 0) / v.length) };
  };
  const ST = { all: stat(TR.concat(TE)), tr: stat(TR), te: stat(TE) };
  const ms = o => `μ = ${+o.m.toFixed(2)}, σ = ${o.sd.toFixed(2)}`;

  // Figure 1: which rows feed the fit
  const g = svg(viz('flow'), 720, 312, { label: 'Training and test rows, the scaler fit box and the transformed sets; arrows show which rows set the mean and standard deviation', minWidth: 560 });
  const layer = s('g', {}, g);
  const OPT = [
    { tr: true, te: true, fit: `fit on all 8 rows\n${ms(ST.all)}`, p: ['μ, σ', 'μ, σ'], leak: true, same: true,
      note: `a · Fit on the whole dataset, then split. ${ms(ST.all)} come from all 8 rows, so the 3 test rows shape the scaling of the training data. That is leakage.` },
    { tr: true, te: true, fit: `fit twice\ntrain: ${ms(ST.tr)}\ntest: ${ms(ST.te)}`, p: ['train μ, σ', 'test μ, σ'], leak: true, same: false,
      note: `b · Fit separately. Training rows use ${ms(ST.tr)} and test rows use their own ${ms(ST.te)}. Test statistics are used, and the same raw value ends up with different scaled values in the two sets.` },
    { tr: true, te: false, fit: `fit on 5 training rows\n${ms(ST.tr)}`, p: ['μ, σ', 'μ, σ'], leak: false, same: true,
      note: `c · Fit on the training set only, ${ms(ST.tr)}, then transform both sets with them. The test rows never touch the fit. This is the slide rule.` },
    { tr: false, te: true, fit: `fit on 3 test rows\n${ms(ST.te)}`, p: ['μ, σ', 'μ, σ'], leak: true, same: true,
      note: `d · Fit on the test set only, ${ms(ST.te)}. The test values come out exactly standardized because the scaler has seen them. That is leakage, and the training data is scaled by test statistics.` },
  ];
  const note = role('flow-note');
  steps(viz('flow-steps'), ['a · whole dataset', 'b · separately', 'c · train only', 'd · test only'], k => {
    const o = OPT[k];
    layer.textContent = '';
    box(layer, 20, 36, 150, 52, 'training set\n' + TR.join(' '), { cls: 'f-pri', textCls: 't-on' });
    box(layer, 20, 196, 150, 52, 'test set\n' + TE.join(' '), { cls: 'f-sec', textCls: 't-on' });
    box(layer, 550, 36, 150, 52, 'scaled train', { textCls: 't-fg' });
    box(layer, 550, 196, 150, 52, 'scaled test', { textCls: 't-fg' });
    box(layer, 272, 104, 176, 76, o.fit, { textCls: 't-fg', lh: 15 });
    arrow(layer, 170, 62, 548, 62, { cls: 'a-muted', label: 'transform', dy: -6 });
    arrow(layer, 170, 222, 548, 222, { cls: 'a-muted', label: 'transform', dy: 16 });
    const feed = (y1, y2, on, cls) => arrow(layer, 170, y1, 270, y2, { cls: on ? cls : 'a-muted', width: on ? 2.5 : 1, dash: !on, label: on ? 'fit' : '', labelCls: cls === 'a-bad' ? 't-bad t-bold' : 't-pri t-bold', dy: y1 < 150 ? -8 : 16 });
    const f1 = feed(80, 122, o.tr, 'a-pri'), f2 = feed(204, 162, o.te, 'a-bad');
    if (!o.tr) f1.style.opacity = 0.3;
    if (!o.te) f2.style.opacity = 0.3;
    arrow(layer, 448, 122, 548, 84, { cls: 'a-muted', label: o.p[0], dy: -6, labelCls: 't-fg' });
    arrow(layer, 448, 162, 548, 200, { cls: o.same ? 'a-muted' : 'a-bad', width: o.same ? 1.5 : 2.5, label: o.p[1], dy: 16, labelCls: o.same ? 't-fg' : 't-bad t-bold' });
    s('text', { x: 20, y: 282, class: 't-fg t-lg' }, layer, 'test rows used in the fit:');
    s('text', { x: 260, y: 282, class: (o.leak ? 't-bad' : 't-ok') + ' t-bold t-lg' }, layer, o.leak ? 'yes, leakage' : 'no');
    s('text', { x: 20, y: 302, class: 't-fg t-lg' }, layer, 'one μ, σ for both sets:');
    s('text', { x: 260, y: 302, class: (o.same ? 't-ok' : 't-bad') + ' t-bold t-lg' }, layer, o.same ? 'yes' : 'no, two scales');
    note.textContent = o.note;
  }, 2);

  // Figure 2: z values under each option
  const r = svg(viz('rows'), 760, 340, { label: 'Raw values and the scaled values under each option, with the raw value 60 ringed in both sets', minWidth: 560 });
  const RX0 = 170, RX1 = 740;
  const rawX = v => RX0 + (v - 35) / 35 * (RX1 - RX0), zX = z => RX0 + (z + 5) / 7.5 * (RX1 - RX0);
  const dotRow = (y, trv, tev, xf) => {
    trv.forEach((v, i) => {
      s('circle', { cx: xf(v), cy: y - 8, r: 5, class: 'f-pri' }, r);
      if (TR[i] === 60) s('circle', { cx: xf(v), cy: y - 8, r: 9, class: 's-fg', style: 'stroke-width: 1.5' }, r);
    });
    tev.forEach((v, i) => {
      s('circle', { cx: xf(v), cy: y + 8, r: 5, class: 'f-sec' }, r);
      if (TE[i] === 60) s('circle', { cx: xf(v), cy: y + 8, r: 9, class: 's-fg', style: 'stroke-width: 1.5' }, r);
    });
  };
  s('text', { x: 16, y: 34, dy: '0.35em', class: 't-fg t-bold' }, r, 'raw x');
  s('line', { x1: RX0, x2: RX1, y1: 34, y2: 34, class: 'l-axis' }, r);
  [40, 45, 50, 55, 60, 65].forEach(v => s('text', { x: rawX(v), y: 62, 'text-anchor': 'middle', class: 't-sm' }, r, String(v)));
  dotRow(34, TR, TE, rawX);
  const zf = (v, o) => (v - o.m) / o.sd;
  const ROWS = [
    ['a · all 8 rows', ms(ST.all), ST.all, ST.all, 't-fg'],
    ['b · separately', 'own μ, σ per set', ST.tr, ST.te, 't-bad'],
    ['c · train only', ms(ST.tr), ST.tr, ST.tr, 't-ok'],
    ['d · test only', ms(ST.te), ST.te, ST.te, 't-fg'],
  ];
  const RY = [112, 166, 220, 274];
  s('line', { x1: zX(0), x2: zX(0), y1: 88, y2: 290, class: 'l-grid dash' }, r);
  ROWS.forEach(([name, sub, otr, ote, cls], i) => {
    const y = RY[i];
    s('text', { x: 16, y: y - 6, class: cls + ' t-bold' }, r, name);
    s('text', { x: 16, y: y + 10, class: 't-sm' }, r, sub);
    s('line', { x1: RX0, x2: RX1, y1: y, y2: y, class: 'l-axis' }, r);
    dotRow(y, TR.map(v => zf(v, otr)), TE.map(v => zf(v, ote)), zX);
    const a = zf(60, otr), b = zf(60, ote);
    const txt = Math.abs(a - b) < 1e-9 ? `60 → ${a.toFixed(2)} in both sets` : `60 → ${a.toFixed(2)} in train, ${b.toFixed(2)} in test`;
    s('text', { x: RX1, y: y - 25, 'text-anchor': 'end', class: cls + (cls === 't-fg' ? '' : ' t-bold') + ' halo' }, r, txt);
  });
  s('line', { x1: RX0, x2: RX1, y1: 300, y2: 300, class: 'l-axis' }, r);
  [-5, -4, -3, -2, -1, 0, 1, 2].forEach(z => {
    s('line', { x1: zX(z), x2: zX(z), y1: 300, y2: 305, class: 'l-axis' }, r);
    s('text', { x: zX(z), y: 318, 'text-anchor': 'middle' }, r, z < 0 ? '−' + (-z) : String(z));
  });
  s('text', { x: (RX0 + RX1) / 2, y: 334, 'text-anchor': 'middle' }, r, 'scaled value z = (x − μ)/σ');
});

QV.register('s3-mc9', function (q) {
  const { s, svg, axes, line, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const IN = [1000, 400, 150, 120, 100, 90];
  const DROP = IN.slice(1).map((v, i) => IN[i] - v);

  const g = svg(viz('elbow'), 640, 280, { label: 'Inertia against K for K = 1 to 6, with the elbow at K = 3 circled', minWidth: 520 });
  const ax = axes(g, { x: 64, y: 24, w: 540, h: 206, xd: [0.5, 6.5], yd: [0, 1100], xt: [1, 2, 3, 4, 5, 6], yt: [0, 250, 500, 750, 1000], xl: 'K, number of clusters', yl: 'inertia (SSE)' });
  const marker = s('line', { y1: ax.y(0), y2: ax.y(1100), class: 's-fg dash', style: 'opacity: 0.45' }, g);
  line(g, IN.map((v, i) => [ax.x(i + 1), ax.y(v)]), 's-pri');
  s('circle', { cx: ax.x(3), cy: ax.y(150), r: 15, class: 's-ok dash', style: 'stroke-width: 2' }, g);
  s('text', { x: ax.x(3) + 16, y: ax.y(150) - 34, class: 't-ok t-bold' }, g, 'elbow, K = 3');
  const dots = IN.map((v, i) => s('circle', { cx: ax.x(i + 1), cy: ax.y(v), r: 5, class: 'f-pri' }, g));
  IN.forEach((v, i) => s('text', { x: ax.x(i + 1) + (i === 0 ? 10 : i === 1 ? 8 : i === 2 ? 13 : 0), y: ax.y(v) - (i === 2 ? 13 : 10), 'text-anchor': i < 3 ? 'start' : 'middle', class: 't-fg halo' }, g, String(v)));

  const VERD = [
    'K = 1 puts all the data in one cluster, inertia 1000. A second cluster would save <b>600</b>, so keep going.',
    'K = 2 has inertia 400. A third cluster still saves <b>250</b>, so the curve has not bent yet.',
    'K = 3 has inertia 150. This cluster saved 250, but a fourth would save only <b>30</b>. The curve bends here, the elbow.',
    'K = 4 has inertia 120. This cluster saved only <b>30</b>, so it sits past the elbow.',
    'K = 5 has inertia 100, a saving of only <b>20</b>.',
    'K = 6 has the lowest inertia, 90, only <b>10</b> below K = 5. Inertia always falls as K grows, so the lowest value is not the goal.',
  ];
  steps(viz('k-steps'), IN.map((v, i) => 'K = ' + (i + 1)), k => {
    marker.setAttribute('x1', ax.x(k + 1)); marker.setAttribute('x2', ax.x(k + 1));
    dots.forEach((d, i) => { d.setAttribute('r', i === k ? 8 : 5); d.setAttribute('class', i === k ? 'f-ok' : 'f-pri'); });
    role('inertia').textContent = String(IN[k]);
    role('gain').textContent = k === 0 ? 'none' : String(DROP[k - 1]);
    role('next').textContent = k === 5 ? 'not run' : String(DROP[k]);
    role('k-verdict').innerHTML = VERD[k];
  }, 2);

  const b = svg(viz('drops'), 640, 260, { label: 'Inertia saved by each step of K: 600, 250, 30, 20 and 10', minWidth: 520 });
  const bx = axes(b, { x: 64, y: 30, w: 540, h: 180, xd: [0.5, 5.5], yd: [0, 650], xt: [1, 2, 3, 4, 5], yt: [0, 200, 400, 600], xf: i => `${i} → ${i + 1}`, xl: 'step in K', yl: 'inertia saved' });
  DROP.forEach((v, i) => {
    const x = bx.x(i + 1);
    s('rect', { x: x - 30, y: bx.y(v), width: 60, height: bx.y(0) - bx.y(v), class: i < 2 ? 'f-pri' : 'f-seg box' }, b);
    s('text', { x, y: bx.y(v) - 8, 'text-anchor': 'middle', class: i < 2 ? 't-pri t-bold' : 't-fg' }, b, String(v));
  });
  s('line', { x1: (bx.x(2) + bx.x(3)) / 2, x2: (bx.x(2) + bx.x(3)) / 2, y1: bx.y(0), y2: bx.y(560), class: 's-ok dash', style: 'stroke-width: 1.5' }, b);
  s('text', { x: (bx.x(2) + bx.x(3)) / 2 + 8, y: bx.y(560), dy: '0.35em', class: 't-ok t-bold' }, b, 'elbow at K = 3: savings fall from 250 to 30');
});

QV.register('s3-mc10', function (q) {
  const { s, svg, axes, slider } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const EV = [40, 18, 12, 8, 7, 5, 4, 3, 2, 1];

  // Figure 1: scree plot with k kept components
  const g = svg(viz('scree'), 640, 286, { label: 'Explained variance of the 10 principal components, falling from 40 percent, with an equal 10 percent share for comparison', minWidth: 520 });
  const ax = axes(g, { x: 56, y: 24, w: 560, h: 206, xd: [0.5, 10.5], yd: [0, 45], xt: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], yt: [0, 10, 20, 30, 40], xf: v => 'PC' + v, yf: v => v + '%', xl: 'principal component', yl: 'explained variance' });
  const bars = EV.map((v, i) => s('rect', { x: ax.x(i + 1) - 18, y: ax.y(v), width: 36, height: ax.y(0) - ax.y(v) }, g));
  EV.forEach((v, i) => s('text', { x: ax.x(i + 1), y: ax.y(v) - 6, 'text-anchor': 'middle', class: 't-fg halo' }, g, v + '%'));
  s('line', { x1: ax.x(0.5), x2: ax.x(10.5), y1: ax.y(10), y2: ax.y(10), class: 's-sec dash', style: 'stroke-width: 2' }, g);
  s('text', { x: ax.x(10.5) - 4, y: ax.y(10) - 22, 'text-anchor': 'end', class: 't-sec t-bold halo' }, g, 'equal share, 10% each (option c)');
  slider(viz('k-slider'), { label: 'keep k', min: 1, max: 10, step: 1, value: 3 }, k => {
    bars.forEach((b, i) => b.setAttribute('class', i < k ? 'f-pri' : 'f-seg box'));
    const cum = EV.slice(0, k).reduce((a, b) => a + b, 0);
    role('kept').textContent = `${k} of 10`;
    role('cum').textContent = cum + '%';
    role('eq').textContent = k * 10 + '%';
  });

  // Figure 2: variance of the projections onto a turning direction
  const P = [[1.0, 2.4], [1.6, 1.0], [2.0, 3.2], [2.6, 1.8], [2.9, 3.9], [3.4, 2.3], [3.8, 4.4], [4.3, 2.9], [4.6, 5.0], [5.1, 3.5], [5.4, 5.6], [5.9, 4.0], [6.3, 6.1], [6.7, 4.6], [7.1, 6.7], [7.6, 5.2], [8.0, 7.3], [8.6, 5.8]];
  const n = P.length;
  const MX = P.reduce((a, p) => a + p[0], 0) / n, MY = P.reduce((a, p) => a + p[1], 0) / n;
  const A = P.reduce((a, p) => a + (p[0] - MX) ** 2, 0) / n;
  const C = P.reduce((a, p) => a + (p[1] - MY) ** 2, 0) / n;
  const B = P.reduce((a, p) => a + (p[0] - MX) * (p[1] - MY), 0) / n;
  const TOT = A + C;
  const TH = 0.5 * Math.atan2(2 * B, A - C) * 180 / Math.PI;
  const varAt = deg => { const t = deg * Math.PI / 180, c = Math.cos(t), si = Math.sin(t); return A * c * c + 2 * B * si * c + C * si * si; };

  const r = svg(viz('rot'), 460, 344, { label: 'Points with two variables, a direction through their mean and the points projected onto it', minWidth: 420 });
  const rx = axes(r, { x: 50, y: 16, w: 360, h: 288, xd: [0, 10], yd: [0, 8], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6, 8], xl: 'x₁', yl: 'x₂', grid: false });
  s('rect', { x: rx.x(0), y: rx.y(8), width: 360, height: 288, class: 'f-none box' }, r);
  const layer = s('g', {}, r);
  P.forEach(p => s('circle', { cx: rx.x(p[0]), cy: rx.y(p[1]), r: 4, class: 'f-fg' }, r));
  const span = (m, d, lo, hi) => Math.abs(d) < 1e-12 ? [-Infinity, Infinity] : [Math.min((lo - m) / d, (hi - m) / d), Math.max((lo - m) / d, (hi - m) / d)];
  const clipDir = (ux, uy) => {
    const a = span(MX, ux, 0, 10), b = span(MY, uy, 0, 8);
    const t0 = Math.max(a[0], b[0]), t1 = Math.min(a[1], b[1]);
    return [[MX + t0 * ux, MY + t0 * uy], [MX + t1 * ux, MY + t1 * uy]];
  };
  slider(viz('theta-slider'), { label: 'θ', min: 0, max: 179, step: 1, value: 36, fmt: v => v + '°' }, deg => {
    layer.textContent = '';
    const t = deg * Math.PI / 180, ux = Math.cos(t), uy = Math.sin(t);
    const [p0, p1] = clipDir(-uy, ux);
    s('line', { x1: rx.x(p0[0]), y1: rx.y(p0[1]), x2: rx.x(p1[0]), y2: rx.y(p1[1]), class: 's-sec dash', style: 'stroke-width: 1.5' }, layer);
    const [m0, m1] = clipDir(ux, uy);
    s('line', { x1: rx.x(m0[0]), y1: rx.y(m0[1]), x2: rx.x(m1[0]), y2: rx.y(m1[1]), class: 's-pri' }, layer);
    P.forEach(p => {
      const k = (p[0] - MX) * ux + (p[1] - MY) * uy, f = [MX + k * ux, MY + k * uy];
      s('line', { x1: rx.x(p[0]), y1: rx.y(p[1]), x2: rx.x(f[0]), y2: rx.y(f[1]), class: 's-line' }, layer);
      s('circle', { cx: rx.x(f[0]), cy: rx.y(f[1]), r: 3, class: 'f-pri' }, layer);
    });
    const v1 = varAt(deg), v2 = varAt(deg + 90);
    role('v1').textContent = v1.toFixed(2);
    role('s1').textContent = (100 * v1 / TOT).toFixed(1) + '% of the total';
    role('v2').textContent = v2.toFixed(2);
    role('s2').textContent = (100 * v2 / TOT).toFixed(1) + '% of the total';
    role('tot').textContent = TOT.toFixed(2);
    role('theta-verdict').innerHTML = Math.abs(deg - TH) < 1
      ? `θ = ${deg}°: the projected points are spread as widely as possible, <b>${(100 * v1 / TOT).toFixed(1)}%</b> of the variance. This direction is PC1, and the perpendicular one, PC2, keeps the remaining ${(100 * v2 / TOT).toFixed(1)}%.`
      : `θ = ${deg}° keeps <b>${(100 * v1 / TOT).toFixed(1)}%</b> of the variance. Turn toward ${Math.round(TH)}° to find the maximum, PC1.`;
  });
});

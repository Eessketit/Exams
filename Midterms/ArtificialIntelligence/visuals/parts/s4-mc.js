QV.register('s4-mc1', function (q) {
  const { s, svg, axes, line, plot, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const X = [1, 2, 3], Y = [2, 4, 6];
  const num = v => (v < -1e-9 ? '−' : '') + fmt(Math.abs(v), 3);
  const sumSq = t1 => X.reduce((a, x, i) => a + (t1 * x - Y[i]) ** 2, 0);

  // Figure 1: the fit with its errors, and J against θ₁
  const W = svg(viz('fit'), 760, 272, { label: 'Left: three points (1,2), (2,4), (3,6) and the line h = theta1 x with the errors marked. Right: J and MSE against theta1, with the current theta1 marked', minWidth: 560 });
  const L = axes(W, { x: 44, y: 24, w: 300, h: 200, xd: [0, 4], yd: [0, 10], xt: [0, 1, 2, 3, 4], yt: [0, 2, 4, 6, 8, 10], xl: 'x', yl: 'y' });
  const R = axes(W, { x: 446, y: 24, w: 290, h: 200, xd: [0, 3], yd: [0, 20], xt: [0, 0.5, 1, 1.5, 2, 2.5, 3], yt: [0, 5, 10, 15, 20], xl: 'θ₁ (with θ₀ = 0)', yl: 'loss' });
  plot(W, R, t => sumSq(t) / 3, 0, 3, 150, 's-sec dash');
  plot(W, R, t => sumSq(t) / 6, 0, 3, 150, 's-pri');
  const dyn = s('g', {}, W);

  function draw(t1) {
    dyn.textContent = '';
    const xe = t1 * 4 > 10 ? 10 / t1 : 4;
    line(dyn, [[L.x(0), L.y(0)], [L.x(xe), L.y(t1 * xe)]], 's-fg');
    s('text', { x: L.x(xe) - 4, y: L.y(t1 * xe) - 8, 'text-anchor': 'end', class: 't-fg halo' }, dyn, t1 === 0 ? 'h(x) = 0' : 'h(x) = ' + fmt(t1) + 'x');
    X.forEach((x, i) => {
      const h = t1 * x, e = h - Y[i];
      if (Math.abs(e) > 1e-9) {
        s('line', { x1: L.x(x), x2: L.x(x), y1: L.y(h), y2: L.y(Y[i]), class: 's-bad', style: 'stroke-width: 3' }, dyn);
        s('text', { x: L.x(x) + 8, y: L.y((h + Y[i]) / 2), dy: '0.35em', class: 't-bad t-bold halo' }, dyn, num(e));
      }
      s('circle', { cx: L.x(x), cy: L.y(Y[i]), r: 5, class: 'f-fg' }, dyn);
    });
    const J = sumSq(t1) / 6;
    s('circle', { cx: R.x(t1), cy: R.y(2 * J), r: 4.5, class: 'f-sec' }, dyn);
    s('circle', { cx: R.x(t1), cy: R.y(J), r: 5, class: 'f-pri' }, dyn);
    s('text', { x: R.x(3), y: R.y(20) + 16, 'text-anchor': 'end', class: 't-pri t-bold' }, dyn, `θ₁ = ${fmt(t1)}: J = ${fmt(J, 3)}`);
    s('text', { x: R.x(3), y: R.y(20) + 32, 'text-anchor': 'end', class: 't-sec' }, dyn, `MSE = ${fmt(2 * J, 3)}`);
  }

  slider(viz('slider'), { label: 'θ₁', min: 0, max: 3, step: 0.25, value: 0, fmt: v => fmt(v) }, t1 => {
    draw(t1);
    const S = sumSq(t1);
    role('sum').textContent = fmt(S, 3);
    role('j').textContent = fmt(S / 6, 3);
    role('mse').textContent = fmt(S / 3, 3);
    const errs = X.map((x, i) => num(t1 * x - Y[i])).join(', ');
    let v;
    if (t1 === 0) v = 'θ = [0, 0] predicts 0 for every x, so the errors are −2, −4 and −6. Σ = 4 + 16 + 36 = 56 and J = 56/6 = <b>9.333</b>, option a. The dashed MSE gives 56/3 = 18.667, option b.';
    else if (t1 === 2) v = 'θ₁ = 2 passes through every point. All errors are 0, so J = <b>0</b>. This is the minimum gradient descent heads for from θ = 0.';
    else v = `θ₁ = ${fmt(t1)}: the errors are ${errs}. Σ = ${fmt(S, 3)} and J = Σ/6 = <b>${fmt(S / 6, 3)}</b>.`;
    role('verdict').innerHTML = v;
  });

  // Figure 2: squared errors as areas, then the four divisors
  const Q = svg(viz('squares'), 760, 300, { label: 'Squares with sides 2, 4 and 6 with areas 4, 16 and 36 adding to 56; bars for 56 divided by 1, 3, 6 and 12', minWidth: 560 });
  const u = 13, base = 128;
  let x = 20;
  [[2, '(−2)² = 4'], [4, '(−4)² = 16'], [6, '(−6)² = 36']].forEach(([a, lab], i) => {
    const side = a * u;
    s('rect', { x, y: base - side, width: side, height: side, class: 'f-bad-soft' }, Q);
    for (let k = 1; k < a; k++) {
      s('line', { x1: x + k * u, x2: x + k * u, y1: base - side, y2: base, class: 'sep', style: 'stroke-width: 1' }, Q);
      s('line', { x1: x, x2: x + side, y1: base - side + k * u, y2: base - side + k * u, class: 'sep', style: 'stroke-width: 1' }, Q);
    }
    s('rect', { x, y: base - side, width: side, height: side, class: 'f-none s-bad', style: 'stroke-width: 1.5' }, Q);
    s('text', { x: x + side / 2, y: base - side - 8, 'text-anchor': 'middle', class: 't-fg' }, Q, lab);
    x += side;
    if (i < 2) s('text', { x: x + 14, y: base - 10, 'text-anchor': 'middle', class: 't-fg t-lg' }, Q, '+');
    x += 28;
  });
  s('text', { x: x - 10, y: base - 30, class: 't-fg t-bold t-xl' }, Q, '= 56');
  [['Σ(h − y)² = 4 + 16 + 36 = 56', 't-fg'], ['m = 3 examples, so 2m = 6', 't-fg'], ['J = 56 / 6 = 9.333', 't-ok t-bold t-lg']].forEach(([t, c], i) => {
    s('text', { x: 360, y: 52 + i * 26, class: c }, Q, t);
  });
  const bx = v => 236 + v * 8.4;
  [['c', '56 ÷ 1, no average', 56, '56'], ['b', '56 ÷ m, the MSE', 56 / 3, '18.667'], ['a', '56 ÷ 2m, the loss J', 56 / 6, '9.333'], ['d', '56 ÷ 4m', 56 / 12, '4.667']].forEach(([k, lab, v, vt], i) => {
    const y = 162 + i * 33, ok = k === 'a';
    s('text', { x: 0, y: y + 11, dy: '0.35em', class: ok ? 't-ok t-bold' : 't-fg' }, Q, `${k} · ${lab}`);
    s('rect', { x: bx(0), y, width: bx(v) - bx(0), height: 22, rx: 3, class: ok ? 'f-ok' : 'f-seg' }, Q);
    s('text', { x: bx(v) + 8, y: y + 11, dy: '0.35em', class: ok ? 't-ok t-bold' : 't-fg' }, Q, vt);
  });
});

QV.register('s4-mc2', function (q) {
  const { s, svg, axes, plot, box } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);

  // Figure 1: which parameters each part of the cost uses
  const P = svg(viz('penalty'), 760, 232, { label: 'The log loss uses theta0 to thetan; the penalty bracket covers theta1 to thetan only', minWidth: 560 });
  const cx = i => 150 + i * 92;
  const CW = 66, CY = 98, CH = 34;
  [['log loss', 38], ['parameters', CY + CH / 2], ['penalty', 184]].forEach(([t, y]) => s('text', { x: 0, y, dy: '0.35em', class: 't-fg t-bold' }, P, t));
  box(P, 140, 20, cx(5) + CW + 10 - 140, 36, '−(1/m) Σ [ y log h + (1 − y) log(1 − h) ]    h = g(θᵀx)', { cls: 'f-pri-soft' });
  ['θ₀', 'θ₁', 'θ₂', 'θ₃', null, 'θₙ'].forEach((nm, i) => {
    const x = cx(i);
    if (!nm) {
      s('text', { x: x + CW / 2, y: CY + CH / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg' }, P, '…');
      return;
    }
    s('line', { x1: x + CW / 2, x2: x + CW / 2, y1: 56, y2: CY, class: 's-muted', style: 'stroke-width: 1' }, P);
    box(P, x, CY, CW, CH, nm, { cls: i === 0 ? 'f-surface' : 'f-sec-soft', textCls: 't-fg t-lg', stroke: i === 0 ? 'outline-pri' : 'box' });
  });
  const b0 = cx(1), b1 = cx(5) + CW, by = CY + CH + 12;
  s('path', { d: `M${b0} ${by} L${b0} ${by + 10} L${b1} ${by + 10} L${b1} ${by}`, class: 's-sec', style: 'stroke-width: 2' }, P);
  s('line', { x1: (b0 + b1) / 2, x2: (b0 + b1) / 2, y1: by + 10, y2: by + 20, class: 's-sec', style: 'stroke-width: 2' }, P);
  box(P, (b0 + b1) / 2 - 175, by + 20, 350, 32, '(λ/2m) Σⱼ₌₁ⁿ θⱼ² = (λ/2m)(θ₁² + θ₂² + … + θₙ²)', { cls: 'f-sec-soft' });
  s('text', { x: cx(0) + CW / 2, y: by + 14, 'text-anchor': 'middle', class: 't-pri t-bold' }, P, 'j = 0 is not');
  s('text', { x: cx(0) + CW / 2, y: by + 30, 'text-anchor': 'middle', class: 't-pri t-bold' }, P, 'in the sum');

  // Figure 2: what θ₀ and θ₁ do to the sigmoid
  const G = svg(viz('sigmoids'), 760, 262, { label: 'Left: sigmoids with theta1 = 1 and theta0 = 2, 0, -2 slide along x. Right: theta0 = 0 and theta1 = 0.5, 1, 3 get steeper', minWidth: 560 });
  const g = z => 1 / (1 + Math.exp(-z));
  const panel = (x0, title, curves) => {
    const ax = axes(G, { x: x0, y: 30, w: 300, h: 180, xd: [-6, 6], yd: [0, 1], xt: [-6, -4, -2, 0, 2, 4, 6], yt: [0, 0.5, 1], xl: 'x' });
    s('text', { x: x0, y: 14, class: 't-fg t-bold' }, G, title);
    const seen = new Set();
    curves.forEach(([t0, t1, c, lab], i) => {
      plot(G, ax, v => g(t0 + t1 * v), -6, 6, 240, 's-' + c);
      const xb = -t0 / t1;
      if (!seen.has(xb)) {
        seen.add(xb);
        s('circle', { cx: ax.x(xb), cy: ax.y(0.5), r: 4.5, class: 'f-' + c }, G);
      }
      s('text', { x: x0 + 8, y: 46 + i * 15, class: 't-' + c + ' t-bold' }, G, lab);
    });
  };
  panel(50, 'θ₁ = 1, three values of θ₀', [[2, 1, 'pri', 'θ₀ = 2'], [0, 1, 'sec', 'θ₀ = 0'], [-2, 1, 'ter', 'θ₀ = −2']]);
  panel(440, 'θ₀ = 0, three values of θ₁', [[0, 0.5, 'pri', 'θ₁ = 0.5'], [0, 1, 'sec', 'θ₁ = 1'], [0, 3, 'ter', 'θ₁ = 3']]);
});

QV.register('s4-mc3', function (q) {
  const { s, svg, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const CNT = { TP: 30, FP: 10, FN: 20, TN: 40 };
  const FILL = { TP: ['f-pri', 't-on'], FN: ['f-pri-soft', 't-fg'], FP: ['f-sec', 't-on'], TN: ['f-sec-soft', 't-fg'] };

  const M = svg(viz('matrix'), 760, 300, { label: 'Confusion matrix TP 30, FP 10, FN 20, TN 40 and a mosaic of 100 squares; the chosen metric fades the cells outside its denominator', minWidth: 560 });
  const mx = 122, my = 52, cw = 102, ch = 76;
  const POS = { TP: [0, 0], FP: [0, 1], FN: [1, 0], TN: [1, 1] };
  s('text', { x: mx + cw, y: 16, 'text-anchor': 'middle', class: 't-fg t-bold' }, M, 'Actual');
  s('text', { x: mx + cw / 2, y: 38, 'text-anchor': 'middle', class: 't-fg' }, M, 'Positive');
  s('text', { x: mx + 1.5 * cw, y: 38, 'text-anchor': 'middle', class: 't-fg' }, M, 'Negative');
  s('text', { x: mx - 10, y: my + ch / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-fg' }, M, 'Predicted +');
  s('text', { x: mx - 10, y: my + 1.5 * ch, dy: '0.35em', 'text-anchor': 'end', class: 't-fg' }, M, 'Predicted −');
  const cellG = {}, cellO = {};
  Object.keys(POS).forEach(k => {
    const [r, c] = POS[k], x = mx + c * cw, y = my + r * ch;
    const g = s('g', { class: 'fade' }, M);
    s('rect', { x, y, width: cw, height: ch, class: FILL[k][0] + ' sep' }, g);
    s('text', { x: x + cw / 2, y: y + ch / 2 - 9, dy: '0.35em', 'text-anchor': 'middle', class: FILL[k][1] }, g, k);
    s('text', { x: x + cw / 2, y: y + ch / 2 + 11, dy: '0.35em', 'text-anchor': 'middle', class: FILL[k][1] + ' t-bold t-lg' }, g, String(CNT[k]));
    cellG[k] = g;
    cellO[k] = s('rect', { x: x + 3, y: y + 3, width: cw - 6, height: ch - 6, class: 'f-none s-ok', style: 'stroke-width: 3' }, M);
  });
  const fName = s('text', { x: mx, y: 232, class: 't-fg t-bold' }, M);
  const fWork = s('text', { x: mx, y: 254, class: 't-fg' }, M);
  const fVal = s('text', { x: mx, y: 280, class: 't-ok t-bold t-xl' }, M);

  // mosaic: left half = 50 actual positives, right half = 50 actual negatives
  const SQ = 20, GP = 2, X0 = 400, X1 = 400 + 5 * (SQ + GP) + 16, Y0 = 52;
  const BLOCKS = { TP: [X0, 0, 6], FN: [X0, 6, 4], FP: [X1, 0, 2], TN: [X1, 2, 8] };
  s('text', { x: X0 + 54, y: 38, 'text-anchor': 'middle', class: 't-fg' }, M, 'actual +, 50');
  s('text', { x: X1 + 54, y: 38, 'text-anchor': 'middle', class: 't-fg' }, M, 'actual −, 50');
  const blockG = {}, blockO = {};
  Object.keys(BLOCKS).forEach(k => {
    const [bx, r0, nr] = BLOCKS[k];
    // the lower block of each half sits 8px lower, so the numerator outline has room
    const top = Y0 + r0 * (SQ + GP) + (k === 'FN' || k === 'TN' ? 8 : 0);
    const g = s('g', { class: 'fade' }, M);
    for (let r = 0; r < nr; r++) for (let c = 0; c < 5; c++) {
      s('rect', { x: bx + c * (SQ + GP), y: top + r * (SQ + GP), width: SQ, height: SQ, rx: 2, class: FILL[k][0] }, g);
    }
    const left = bx === X0, ym = top + nr * (SQ + GP) / 2 - GP / 2;
    s('text', { x: left ? bx - 8 : bx + 5 * (SQ + GP) + 6, y: ym, dy: '0.35em', 'text-anchor': left ? 'end' : 'start', class: 't-fg' }, g, `${k} ${CNT[k]}`);
    blockG[k] = g;
    blockO[k] = s('rect', { x: bx - 3, y: top - 3, width: 5 * (SQ + GP) - GP + 6, height: nr * (SQ + GP) - GP + 6, rx: 4, class: 'f-none s-ok', style: 'stroke-width: 3' }, M);
  });

  const MET = [
    { den: ['TP', 'FN'], num: ['TP'], f: 'Recall = TP / (TP + FN)', w: '= 30 / (30 + 20)', v: '= 0.60',
      note: 'Recall, option c. The denominator is the Actual Positive column, all 50 real positives. The model caught 30 of them, so recall = 30/50 = 0.60. The negative column plays no part.' },
    { den: ['TP', 'FP'], num: ['TP'], f: 'Precision = TP / (TP + FP)', w: '= 30 / (30 + 10)', v: '= 0.75',
      note: 'Precision, option a. The denominator is the Predicted Positive row, the 40 alarms the model raised. 30 of them were real, so precision = 30/40 = 0.75.' },
    { den: ['TP', 'FP', 'FN', 'TN'], num: ['TP', 'TN'], f: 'Accuracy = (TP + TN) / total', w: '= (30 + 40) / 100', v: '= 0.70',
      note: 'Accuracy, option b. Every case is in the denominator. The correct ones lie on the diagonal, 30 + 40 = 70 of 100.' },
    { den: ['TP', 'FP', 'FN'], num: ['TP'], f: 'F1 = 2 · P · R / (P + R)', w: '= 2 · 0.75 · 0.60 / 1.35', v: '= 0.667',
      note: 'F1, option d, the harmonic mean of precision 0.75 and recall 0.60. It equals 2TP/(2TP + FP + FN) = 60/90 = 0.667, so TN plays no part.' },
  ];
  steps(viz('steps'), ['c · Recall', 'a · Precision', 'b · Accuracy', 'd · F1'], k => {
    const m = MET[k];
    Object.keys(POS).forEach(c => {
      const inDen = m.den.indexOf(c) >= 0, inNum = m.num.indexOf(c) >= 0;
      cellG[c].classList.toggle('dim', !inDen);
      blockG[c].classList.toggle('dim', !inDen);
      cellO[c].style.display = inNum ? '' : 'none';
      blockO[c].style.display = inNum ? '' : 'none';
    });
    fName.textContent = m.f;
    fWork.textContent = m.w;
    fVal.textContent = m.v;
    role('note').textContent = m.note;
  });
});

QV.register('s4-mc4', function (q) {
  const { s, svg, steps, table, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  // [count, class total, K] per factor; the prior is not smoothed
  const ROWS = {
    yes: [[9, 14, 0], [4, 9, 3], [2, 9, 3], [3, 9, 2], [3, 9, 2]],
    no: [[5, 14, 0], [0, 5, 3], [2, 5, 3], [4, 5, 2], [3, 5, 2]],
  };
  const HEAD = ['P(class)', 'Overcast', 'Temp = Hot', 'High', 'Strong'];

  const countsHost = viz('counts');
  const C = svg(viz('chain'), 760, 222, { label: 'Product of the prior and four likelihoods for Yes and No, with and without Laplace smoothing, and the normalized shares', minWidth: 560 });
  const chipX = i => 64 + i * 110, CW = 96, CH = 42;
  HEAD.forEach((h, i) => s('text', { x: chipX(i) + CW / 2, y: 14, 'text-anchor': 'middle', class: 't-fg t-bold' }, C, h));
  const layer = s('g', {}, C);

  function draw(sm) {
    layer.textContent = '';
    const prod = {};
    [['yes', 28, 'pri'], ['no', 88, 'sec']].forEach(([cls, y, col]) => {
      s('text', { x: 0, y: y + CH / 2, dy: '0.35em', class: `t-${col} t-bold t-lg` }, layer, cls === 'yes' ? 'Yes' : 'No');
      let p = 1;
      ROWS[cls].forEach(([c, n, k], i) => {
        const useK = sm && k > 0;
        const val = useK ? (c + 1) / (n + k) : c / n;
        p *= val;
        const x = chipX(i), zero = val === 0;
        s('rect', { x, y, width: CW, height: CH, rx: 4, class: zero ? 'f-bad-soft' : 'f-seg' }, layer);
        if (!zero) s('rect', { x, y, width: CW * val, height: CH, rx: 4, class: `f-${col}-soft` }, layer);
        if (zero) s('rect', { x, y, width: CW, height: CH, rx: 4, class: 'f-none s-bad', style: 'stroke-width: 2' }, layer);
        const expr = useK ? `(${c}+1)/(${n}+${k})` : `${c}/${n}`;
        s('text', { x: x + CW / 2, y: y + 15, dy: '0.35em', 'text-anchor': 'middle', class: zero ? 't-bad t-bold' : 't-fg' }, layer, expr);
        s('text', { x: x + CW / 2, y: y + 31, dy: '0.35em', 'text-anchor': 'middle', class: zero ? 't-bad t-bold' : 't-muted' }, layer, '= ' + fmt(val, 3));
        if (i < 4) s('text', { x: x + CW + 7, y: y + CH / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-muted' }, layer, '×');
      });
      prod[cls] = p;
      s('text', { x: chipX(4) + CW + 14, y: y + CH / 2, dy: '0.35em', class: `t-${col} t-bold` }, layer, '= ' + (p === 0 ? '0' : p.toFixed(5)));
    });
    const tot = prod.yes + prod.no, sy = prod.yes / tot;
    const x0 = chipX(0), wid = chipX(4) + CW - x0, yb = 156;
    s('rect', { x: x0, y: yb, width: wid * sy, height: 28, class: 'f-pri' }, layer);
    if (sy < 1) s('rect', { x: x0 + wid * sy, y: yb, width: wid * (1 - sy), height: 28, class: 'f-sec' }, layer);
    s('text', { x: x0 + 8, y: yb + 14, dy: '0.35em', class: 't-on t-bold' }, layer, `Yes ${fmt(100 * sy, 1)}%`);
    if (sy < 1) s('text', { x: x0 + wid - 8, y: yb + 14, dy: '0.35em', 'text-anchor': 'end', class: 't-on t-bold' }, layer, `No ${fmt(100 * (1 - sy), 1)}%`);
    else s('text', { x: x0 + wid + 8, y: yb + 14, dy: '0.35em', class: 't-sec t-bold' }, layer, 'No 0%');
    s('text', { x: x0, y: yb + 50, class: 't-muted' }, layer, 'normalized: each product ÷ (Yes product + No product)');
  }

  const NOTES = [
    'Raw counts. P(Overcast | No) = 0/5, so the No product is 0 whatever the other factors are. Hot, High and Strong all favour No, and without Outlook No would lead about 4.3 to 1. One unseen pair still makes Yes 100% certain.',
    'Laplace, α = 1. Every Outlook count gets +1 and the class total gets +K = 3, so P(Overcast | No) = 1/8. All four features now count. Yes still wins, 56.4% to 43.6%, but No is no longer impossible.',
  ];
  steps(viz('steps'), ['Raw counts', 'Laplace smoothing, α = 1'], k => {
    const sm = k === 1;
    countsHost.textContent = '';
    const cell = (c, add) => (sm ? `${c} + ${add} = ${c + add}` : String(c));
    const t = table(countsHost, [{ text: 'Outlook', cls: 'l' }, 'Yes', 'No'], [
      [{ text: 'Sunny', cls: 'l' }, cell(2, 1), cell(3, 1)],
      [{ text: 'Overcast', cls: 'l' }, cell(4, 1), { text: cell(0, 1), cls: 'hl' }],
      [{ text: 'Rain', cls: 'l' }, cell(3, 1), cell(2, 1)],
      [{ text: 'class total', cls: 'l' }, cell(9, 3), cell(5, 3)],
    ]);
    t.rows[1].classList.add('on');
    t.table.style.maxWidth = '460px';
    draw(sm);
    role('note').textContent = NOTES[k];
  });
});

QV.register('s4-mc5', function (q) {
  const { s, svg, box, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);

  // Figure 1: bootstrap strips, features per set, votes
  const B = svg(viz('boot'), 776, 304, { label: 'Original 14 rows and three bootstrapped sets with duplicated rows highlighted, the dropped feature per set, and each tree voting No', minWidth: 560 });
  const SETS = [
    { name: 'Set 1', rows: [1, 2, 3, 5, 5, 6, 7, 8, 9, 10, 7, 12, 13, 14], oob: 'D4, D11', drop: 1, root: 'Outlook' },
    { name: 'Set 2', rows: [3, 2, 3, 4, 5, 6, 7, 8, 9, 8, 11, 12, 6, 14], oob: 'D1, D10, D13', drop: -1, root: 'Temp' },
    { name: 'Set 3', rows: [1, 2, 1, 4, 5, 6, 7, 9, 9, 10, 11, 12, 13, 14], oob: 'D3, D8', drop: 3, root: 'Humidity' },
  ];
  const cx = i => 64 + i * 28, CW = 26, CH = 28;
  const fx = k => 476 + k * 25, TX = 598, VX = 722;
  [['rows D1 … D14, drawn with replacement', 64], ['features', 476], ['tree', TX], ['vote', VX]].forEach(([t, x]) => s('text', { x, y: 14, class: 't-fg t-bold' }, B, t));
  const feats = (y, drop) => ['O', 'T', 'H', 'W'].forEach((f, k) => {
    const off = k === drop;
    s('rect', { x: fx(k), y, width: 22, height: CH, rx: 3, class: off ? 'f-seg' : 'f-pri-soft' }, B);
    s('text', { x: fx(k) + 11, y: y + CH / 2, dy: '0.35em', 'text-anchor': 'middle', class: off ? 't-muted' : 't-fg t-bold' }, B, f);
    if (off) s('line', { x1: fx(k) + 3, y1: y + CH - 4, x2: fx(k) + 19, y2: y + 4, class: 's-bad', style: 'stroke-width: 1.5' }, B);
  });
  s('text', { x: 0, y: 30 + CH / 2, dy: '0.35em', class: 't-fg t-bold' }, B, 'Original');
  for (let i = 0; i < 14; i++) {
    s('rect', { x: cx(i), y: 30, width: CW, height: CH, rx: 3, class: 'f-seg' }, B);
    s('text', { x: cx(i) + CW / 2, y: 30 + CH / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, B, String(i + 1));
  }
  feats(30, -1);
  SETS.forEach((st, si) => {
    const y = 90 + si * 60;
    const cnt = {};
    st.rows.forEach(r => { cnt[r] = (cnt[r] || 0) + 1; });
    s('text', { x: 0, y: y + CH / 2, dy: '0.35em', class: 't-fg t-bold' }, B, st.name);
    st.rows.forEach((r, i) => {
      const dup = cnt[r] > 1;
      s('rect', { x: cx(i), y, width: CW, height: CH, rx: 3, class: dup ? 'f-sec' : 'f-pri-soft' }, B);
      s('text', { x: cx(i) + CW / 2, y: y + CH / 2, dy: '0.35em', 'text-anchor': 'middle', class: dup ? 't-on t-bold' : 't-fg' }, B, String(r));
    });
    s('text', { x: 64, y: y + CH + 15, class: 't-sm' }, B, `out of bag: ${st.oob}`);
    feats(y, st.drop);
    arrow(B, fx(3) + 26, y + CH / 2, TX - 4, y + CH / 2, { cls: 'a-muted' });
    box(B, TX, y - 3, 100, CH + 6, `Tree ${si + 1}\nroot ${st.root}`, { lh: 13 });
    arrow(B, TX + 104, y + CH / 2, VX - 4, y + CH / 2, { cls: 'a-muted' });
    box(B, VX, y, 46, CH, 'No', { cls: 'f-seg', textCls: 't-fg t-bold' });
  });
  s('path', { d: `M${VX + 23} ${210 + CH} L${VX + 23} 262`, class: 's-muted' }, B);
  box(B, 560, 262, 208, 32, 'majority vote: 3 × No → No', { cls: 'f-ok', textCls: 't-on t-bold' });

  // Figure 2: parallel trees against a chain of trees
  const F = svg(viz('flow'), 600, 236, { label: 'Random forest: data to three bootstrap samples and trees in parallel, then a vote. Boosting: tree 1 to tree 3 in a chain, each fitted to the previous errors', minWidth: 480 });
  s('text', { x: 0, y: 14, class: 't-pri t-bold' }, F, 'Random forest: independent trees, built side by side');
  box(F, 0, 56, 96, 40, 'training\ndata', { cls: 'f-seg' });
  [30, 66, 102].forEach((y, i) => {
    arrow(F, 96, 76, 150, y + 13, { cls: 'a-muted' });
    box(F, 150, y, 110, 26, `bootstrap ${i + 1}`, { cls: 'f-pri-soft' });
    arrow(F, 260, y + 13, 300, y + 13, { cls: 'a-muted' });
    box(F, 300, y, 76, 26, `tree ${i + 1}`, { cls: 'f-pri', textCls: 't-on' });
    arrow(F, 376, y + 13, 440, 76, { cls: 'a-muted' });
  });
  box(F, 440, 56, 120, 40, 'majority vote\nor average', { cls: 'f-ok', textCls: 't-on' });
  s('text', { x: 0, y: 160, class: 't-sec t-bold' }, F, 'Boosting (option d): each tree fits the errors of the trees before');
  [0, 150, 300].forEach((x, i) => {
    box(F, x, 180, 80, 34, `tree ${i + 1}`, { cls: 'f-sec', textCls: 't-on' });
    arrow(F, x + 80, 197, x + 150, 197, { cls: 'a-sec', label: i < 2 ? 'errors' : '', labelCls: 't-sec', dy: -8 });
  });
  box(F, 450, 180, 110, 34, 'weighted sum', { cls: 'f-sec-soft' });
});

QV.register('s4-mc6', function (q) {
  const { s, svg, axes, line, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const PTS = [[1.0, 5.0, 1], [1.6, 6.6, 1], [2.0, 3.8, 1], [2.6, 7.2, 1], [3.0, 5.4, 1], [1.2, 2.8, 1], [3.6, 6.6, 1], [0.6, 7.4, 1], [4.6, 3.0, 1],
    [5.4, 1.4, -1], [6.2, 3.0, -1], [6.8, 0.8, -1], [7.4, 2.6, -1], [7.6, 4.4, -1], [5.0, 0.4, -1], [6.0, 5.0, -1], [8.0, 1.4, -1]];
  // [C, w1, w2, b, support vectors]: exact soft-margin solutions from SMO in Python, duality gap below 1e-8
  const SOL = [
    [0.05, -0.40462, 0.23121, 0.93064, [2, 4, 6, 8, 9, 10, 14, 15]],
    [0.1, -0.45455, 0.22727, 1.13636, [4, 6, 8, 9, 10, 15]],
    [0.5, -0.72785, 0.15823, 2.57595, [6, 8, 14, 15]],
    [1, -0.92166, 0.20036, 3.52816, [8, 14, 15]],
    [2, -1.84332, 0.40072, 8.05632, [8, 14, 15]],
    [10, -2.07207, 0.45045, 9.18018, [8, 14, 15]],
    [100, -2.07207, 0.45045, 9.18018, [8, 14, 15]],
  ];
  // [log10 C, margin width, total slack] along the solution path
  const CURVE = [[-1.5, 4.557, 2.402], [-1.413, 4.494, 2.325], [-1.325, 4.317, 2.142], [-1.301, 4.292, 2.116], [-1.238, 4.146, 1.979], [-1.15, 4.143, 1.976], [-1.062, 3.935, 1.818], [-1.0, 3.935, 1.818], [-0.975, 3.935, 1.818], [-0.887, 3.935, 1.818], [-0.8, 3.935, 1.818], [-0.713, 3.786, 1.763], [-0.625, 3.602, 1.691], [-0.537, 3.273, 1.571], [-0.45, 2.801, 1.359], [-0.362, 2.685, 1.297], [-0.301, 2.685, 1.297], [-0.275, 2.685, 1.297], [-0.188, 2.685, 1.297], [-0.1, 2.67, 1.293], [-0.013, 2.182, 1.136], [0.0, 2.12, 1.11], [0.075, 1.784, 0.943], [0.163, 1.459, 0.707], [0.25, 1.192, 0.418], [0.301, 1.06, 0.221], [0.338, 0.975, 0.065], [0.425, 0.943, 0], [0.512, 0.943, 0], [0.6, 0.943, 0], [0.688, 0.943, 0], [0.775, 0.943, 0], [0.863, 0.943, 0], [0.95, 0.943, 0], [1.0, 0.943, 0], [1.038, 0.943, 0], [1.125, 0.943, 0], [1.212, 0.943, 0], [1.3, 0.943, 0], [1.387, 0.943, 0], [1.475, 0.943, 0], [1.562, 0.943, 0], [1.65, 0.943, 0], [1.738, 0.943, 0], [1.825, 0.943, 0], [1.913, 0.943, 0], [2.0, 0.943, 0]];

  const XM = 9, YM = 8;
  const W = svg(viz('plot'), 510, 470, { label: 'Two classes of points with the soft-margin SVM boundary, margin lines, support vectors and slack for the chosen C', minWidth: 420, maxWidth: 640 });
  const ax = axes(W, { x: 40, y: 24, w: 450, h: 400, xd: [0, XM], yd: [0, YM], xt: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], yt: [0, 1, 2, 3, 4, 5, 6, 7, 8], xl: 'x₁', yl: 'x₂', grid: false });
  const layer = s('g', {}, W);
  const BOX = [[0, 0], [XM, 0], [XM, YM], [0, YM]];
  const clipHalf = (poly, f) => {
    const out = [];
    poly.forEach((p, i) => {
      const r = poly[(i + 1) % poly.length], a = f(p), b = f(r);
      if (a >= 0) out.push(p);
      if ((a >= 0) !== (b >= 0)) { const t = a / (a - b); out.push([p[0] + t * (r[0] - p[0]), p[1] + t * (r[1] - p[1])]); }
    });
    return out;
  };
  const cross = f => {
    const out = [];
    BOX.forEach((p, i) => {
      const r = BOX[(i + 1) % 4], a = f(p), b = f(r);
      if ((a < 0) !== (b < 0)) { const t = a / (a - b); out.push([p[0] + t * (r[0] - p[0]), p[1] + t * (r[1] - p[1])]); }
    });
    return out;
  };
  const px = p => [ax.x(p[0]), ax.y(p[1])];

  const T = svg(viz('trade'), 640, 250, { label: 'Margin width and total slack against C on a log scale', minWidth: 520 });
  const tx = axes(T, { x: 52, y: 24, w: 560, h: 170, xd: [-1.5, 2], yd: [0, 5], xt: [-1, 0, 1, 2], yt: [0, 1, 2, 3, 4, 5], xf: v => String(10 ** v), xl: 'C (log scale)', yl: 'value' });
  line(T, CURVE.map(([c, w]) => [tx.x(c), tx.y(w)]), 's-pri');
  line(T, CURVE.map(([c, , z]) => [tx.x(c), tx.y(z)]), 's-ter');
  // label x positions sit between the slider's C values, so the marker line never crosses them
  s('text', { x: tx.x(1.1), y: tx.y(0.943) - 10, class: 't-pri t-bold' }, T, 'margin width');
  s('text', { x: tx.x(-0.95), y: tx.y(1.818) - 10, class: 't-ter t-bold' }, T, 'total slack');
  const mark = s('g', {}, T);

  function draw(k) {
    const [C, w1, w2, b, sv] = SOL[k];
    const F = p => w1 * p[0] + w2 * p[1] + b, nw2 = w1 * w1 + w2 * w2;
    layer.textContent = '';
    const band = clipHalf(clipHalf(BOX, p => 1 - F(p)), p => F(p) + 1);
    if (band.length > 2) s('polygon', { points: band.map(p => px(p).map(v => v.toFixed(1)).join(',')).join(' '), class: 'f-seg' }, layer);
    [[0, 's-fg', 'stroke-width: 2'], [1, 's-muted dash', 'stroke-width: 1.5'], [-1, 's-muted dash', 'stroke-width: 1.5']].forEach(([lev, c, st]) => {
      const e = cross(p => F(p) - lev);
      if (e.length >= 2) s('line', { x1: px(e[0])[0], y1: px(e[0])[1], x2: px(e[1])[0], y2: px(e[1])[1], class: c, style: st }, layer);
    });
    let slack = 0, errs = 0, viol = 0;
    PTS.forEach(([x, y, lab]) => {
      const m = lab * F([x, y]);
      if (m < 1 - 1e-3) {
        viol++;
        slack += 1 - m;
        if (m < 0) errs++;
        const d = lab * (1 - m) / nw2, t = [x + d * w1, y + d * w2];
        s('line', { x1: ax.x(x), y1: ax.y(y), x2: px(t)[0], y2: px(t)[1], class: 's-bad dash', style: 'stroke-width: 2' }, layer);
      }
    });
    PTS.forEach(([x, y, lab], i) => {
      const [X, Y] = px([x, y]), m = lab * F([x, y]);
      if (sv.indexOf(i) >= 0) s('circle', { cx: X, cy: Y, r: 11, class: m < 0 ? 's-bad' : 's-fg', style: 'stroke-width: 1.5' }, layer);
      if (lab > 0) s('circle', { cx: X, cy: Y, r: 6, class: 'f-pri' }, layer);
      else s('rect', { x: X - 5.5, y: Y - 5.5, width: 11, height: 11, class: 'f-sec' }, layer);
    });
    s('text', { x: ax.x(4.6) - 14, y: ax.y(3.0) + 4, 'text-anchor': 'end', class: 't-pri t-bold halo' }, layer, 'outlier');
    const width = 2 / Math.sqrt(nw2);
    mark.textContent = '';
    const lc = Math.log10(C);
    s('line', { x1: tx.x(lc), x2: tx.x(lc), y1: tx.y(5), y2: tx.y(0), class: 's-fg dash', style: 'stroke-width: 1; opacity: 0.6' }, mark);
    s('circle', { cx: tx.x(lc), cy: tx.y(width), r: 5, class: 'f-pri' }, mark);
    s('circle', { cx: tx.x(lc), cy: tx.y(slack), r: 5, class: 'f-ter' }, mark);
    return { C, width, slack, errs, viol };
  }

  slider(viz('slider'), { label: 'C', min: 0, max: 6, step: 1, value: 6, fmt: i => String(SOL[i][0]) }, k => {
    const r = draw(k);
    role('width').textContent = fmt(r.width, 3);
    role('slack').textContent = fmt(r.slack, 3);
    role('errs').textContent = String(r.errs);
    let v;
    if (r.slack < 1e-6) v = `C = ${r.C}. Any slack would cost more than a narrow margin, so there is none. The margin shrinks to <b>${fmt(r.width, 3)}</b> and every training point is on its correct side. The boundary turns steep to fit one outlier, which is how a large C overfits.`;
    else if (r.errs > 0) v = `C = ${r.C}. Violations are cheap, so the SVM accepts them. The margin is <b>${fmt(r.width, 3)}</b> wide and the outlier ends up on the wrong side.` + (r.viol > 1 ? ` ${r.viol} points are inside the margin or beyond it.` : ' It is the only violation.');
    else v = `C = ${r.C}. The outlier is now on its correct side but still inside the margin, with slack ${fmt(r.slack, 3)}. The margin has shrunk to <b>${fmt(r.width, 3)}</b>.`;
    role('verdict').innerHTML = v;
  });
});

QV.register('s4-mc7', function (q) {
  const { s, svg, slider, scale } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const LO = -2, HI = 14;

  const B = svg(viz('box'), 760, 252, { label: 'Sorted data strip with quartiles, and a box plot on a number line with fences at -2 and 14', minWidth: 560 });
  const cx = i => 40 + i * 44;
  s('text', { x: 40, y: 12, class: 't-fg t-bold' }, B, 'sorted data, n = 9');
  [[0, 3, 'lower half → Q1 = 4'], [5, 8, 'upper half → Q3 = 8']].forEach(([a, b, t]) => {
    const x0 = cx(a), x1 = cx(b) + 40;
    s('path', { d: `M${x0} 60 L${x0} 66 L${x1} 66 L${x1} 60`, class: 's-pri', style: 'stroke-width: 1.5' }, B);
    s('text', { x: (x0 + x1) / 2, y: 82, 'text-anchor': 'middle', class: 't-pri t-bold' }, B, t);
  });
  s('text', { x: cx(4) + 20, y: 82, 'text-anchor': 'middle', class: 't-fg' }, B, 'median 6');
  [['IQR = 8 − 4 = 4', 't-fg'], ['lower bound = 4 − 1.5 × 4 = −2', 't-fg'], ['upper bound = 8 + 1.5 × 4 = 14', 't-fg']].forEach(([t, c], i) => {
    s('text', { x: 450, y: 30 + i * 20, class: c + ' t-bold' }, B, t);
  });
  const X = scale(-4, 40, 40, 740);
  const AX = 226;
  s('rect', { x: X(-4), y: 102, width: X(LO) - X(-4), height: AX - 102, class: 'f-bad-soft' }, B);
  s('rect', { x: X(LO), y: 102, width: X(HI) - X(LO), height: AX - 102, class: 'f-ok-soft' }, B);
  s('rect', { x: X(HI), y: 102, width: X(40) - X(HI), height: AX - 102, class: 'f-bad-soft' }, B);
  [LO, HI].forEach(v => s('line', { x1: X(v), x2: X(v), y1: 102, y2: AX, class: 's-fg dash', style: 'stroke-width: 1.5' }, B));
  s('text', { x: X(LO) + 5, y: 118, class: 't-ok t-bold' }, B, 'Q1 − 1.5·IQR = −2');
  s('text', { x: X(HI) + 5, y: 118, class: 't-bad t-bold' }, B, 'Q3 + 1.5·IQR = 14');
  s('line', { x1: X(-4), x2: X(40), y1: AX, y2: AX, class: 'l-axis' }, B);
  for (let v = 0; v <= 40; v += 5) {
    s('line', { x1: X(v), x2: X(v), y1: AX, y2: AX + 5, class: 'l-axis' }, B);
    s('text', { x: X(v), y: AX + 18, 'text-anchor': 'middle' }, B, String(v));
  }
  s('rect', { x: X(4), y: 132, width: X(8) - X(4), height: 28, class: 'f-pri-soft outline-pri' }, B);
  s('line', { x1: X(6), x2: X(6), y1: 132, y2: 160, class: 's-pri' }, B);
  [['Q1 = 4', 4, 'end', -4], ['Q3 = 8', 8, 'start', 4]].forEach(([t, v, a, dx]) => s('text', { x: X(v) + dx, y: 176, 'text-anchor': a, class: 't-pri' }, B, t));
  const dyn = s('g', {}, B);

  slider(viz('slider'), { label: 'largest value', min: 8, max: 40, step: 1, value: 30 }, v => {
    dyn.textContent = '';
    const out = v > HI, top = out ? 8 : v;
    s('line', { x1: X(2), x2: X(4), y1: 146, y2: 146, class: 's-pri', style: 'stroke-width: 1.5' }, dyn);
    s('line', { x1: X(2), x2: X(2), y1: 138, y2: 154, class: 's-pri', style: 'stroke-width: 1.5' }, dyn);
    if (top > 8) {
      s('line', { x1: X(8), x2: X(top), y1: 146, y2: 146, class: 's-pri', style: 'stroke-width: 1.5' }, dyn);
      s('line', { x1: X(top), x2: X(top), y1: 138, y2: 154, class: 's-pri', style: 'stroke-width: 1.5' }, dyn);
    }
    const vals = [2, 4, 4, 5, 6, 7, 8, 8, v];
    const seen = {};
    vals.forEach((d, i) => {
      const k = seen[d] || 0;
      seen[d] = k + 1;
      const last = i === 8;
      s('circle', { cx: X(d), cy: 208 - k * 10, r: 4.5, class: last && out ? 'f-bad' : 'f-pri' }, dyn);
    });
    if (out) s('text', { x: X(v) + (v > 33 ? -10 : 10), y: 200, 'text-anchor': v > 33 ? 'end' : 'start', class: 't-bad t-bold halo' }, dyn, `${v} > 14, outlier`);
    vals.forEach((d, i) => {
      const last = i === 8;
      s('rect', { x: cx(i), y: 22, width: 40, height: 30, rx: 3, class: last && out ? 'f-bad' : (i === 4 ? 'f-seg outline-pri' : 'f-seg') }, dyn);
      s('text', { x: cx(i) + 20, y: 37, dy: '0.35em', 'text-anchor': 'middle', class: last && out ? 't-on t-bold' : 't-fg' }, dyn, String(d));
    });
    let t;
    if (out) t = `<b>${v}</b> is above the upper bound 14, so it is an outlier. Every other value lies inside [−2, 14].`;
    else if (v === HI) t = '<b>14</b> sits exactly on the upper bound. Only values outside the bounds count, so there is no outlier.';
    else t = `<b>${v}</b> is inside [−2, 14], so this data would have no outlier. The bounds stay at −2 and 14 because Q1 and Q3 did not change.`;
    role('verdict').innerHTML = t;
  });
});

QV.register('s4-mc8', function (q) {
  const { s, svg, box, arrow, steps, slider, axes, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: the pipeline and the three places SMOTE could go
  const P = svg(viz('pipe'), 720, 236, { label: 'Pipeline: all data, split into training and test sets, fit on training, score on test; SMOTE badges mark where each option applies it', minWidth: 560 });
  box(P, 0, 90, 130, 60, 'All data\n9,980 normal\n20 fraud', { cls: 'f-seg', lh: 15 });
  s('line', { x1: 130, x2: 250, y1: 120, y2: 120, class: 's-muted' }, P);
  s('circle', { cx: 250, cy: 120, r: 4, class: 'f-muted' }, P);
  s('text', { x: 258, y: 124, class: 't-muted' }, P, 'split');
  arrow(P, 250, 120, 298, 52, { cls: 'a-muted' });
  arrow(P, 250, 120, 298, 188, { cls: 'a-muted' });
  box(P, 300, 20, 130, 60, 'Training set\n7,984 normal\n16 fraud', { cls: 'f-pri-soft', lh: 15 });
  box(P, 300, 160, 130, 60, 'Test set\n1,996 normal\n4 fraud', { cls: 'f-seg', lh: 15 });
  const testOut = s('rect', { x: 297, y: 157, width: 136, height: 66, rx: 8, class: 'f-none s-ok' }, P);
  arrow(P, 430, 50, 588, 50, { cls: 'a-muted' });
  arrow(P, 430, 190, 588, 190, { cls: 'a-muted' });
  box(P, 590, 30, 120, 40, 'Fit the model', { cls: 'f-pri', textCls: 't-on' });
  box(P, 590, 166, 120, 48, 'Score on the\ntest set', { cls: 'f-seg' });
  arrow(P, 650, 70, 650, 164, { cls: 'a-muted' });
  s('text', { x: 656, y: 122, class: 't-muted' }, P, 'model');
  const badge = (x, y) => {
    const g = s('g', {}, P);
    const r = s('rect', { x, y, width: 64, height: 24, rx: 12 }, g);
    s('text', { x: x + 32, y: y + 12, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, g, 'SMOTE');
    return { g, r };
  };
  const BADGE = { all: badge(158, 108), train: badge(477, 38), test: badge(477, 178) };
  const OPT = [
    { on: ['all'], bad: true, test: false, note: 'a, before the split. Synthetic fraud is interpolated from all 20 fraud cases, including the 4 that end up in the test set. Their information leaks into training, and synthetic points land in the test set. The scores look better than the model really is.' },
    { on: ['test'], bad: true, test: false, note: 'b, test only. The model still trains on 16 fraud cases among 7,984 normal ones. The test set no longer has the real 0.2% fraud, so its scores say nothing about real data.' },
    { on: ['train'], bad: false, test: true, note: 'c, training only. Split first. SMOTE then adds synthetic fraud to the training set alone, so the model learns from balanced data. The test set keeps the real 0.2% fraud, and its scores are honest.' },
    { on: ['train', 'test'], bad: true, test: false, note: 'd, both. Training is fine, but the test set is now about half synthetic fraud. Slide 36 lists this as a common mistake. The scores are inflated.' },
  ];
  steps(viz('steps'), ['a · before the split', 'b · test only', 'c · training only', 'd · both'], k => {
    const o = OPT[k];
    Object.keys(BADGE).forEach(n => {
      const on = o.on.indexOf(n) >= 0;
      BADGE[n].g.style.display = on ? '' : 'none';
      BADGE[n].r.setAttribute('class', o.bad && !(k === 3 && n === 'train') ? 'f-bad' : 'f-ok');
    });
    testOut.setAttribute('class', 'f-none ' + (o.test ? 's-ok' : 's-bad'));
    role('note').textContent = o.note;
  }, 2);

  // Figure 2: SMOTE interpolation
  const MAJ = [[1.2, 1.5], [2.0, 3.1], [2.8, 1.2], [3.5, 2.6], [1.6, 4.4], [4.3, 1.8], [3.0, 4.0], [4.8, 3.4], [2.3, 5.6], [5.6, 2.4], [1.0, 6.4], [3.8, 5.2], [6.4, 1.2],
    [5.2, 4.4], [7.2, 2.8], [4.2, 6.6], [6.6, 4.0], [8.2, 1.8], [2.9, 7.2], [8.6, 3.6], [1.8, 8.3], [7.8, 0.8], [0.6, 2.6], [5.0, 0.6], [3.6, 8.8], [9.2, 5.2]];
  const MIN = [[6.2, 6.8], [7.4, 7.6], [6.8, 8.4], [7.9, 6.2], [5.2, 7.9], [8.6, 8.6], [5.6, 5.6]];
  const XI = MIN[0], NN = MIN[1];
  const knn = MIN.slice(1).map(p => [p, Math.hypot(p[0] - XI[0], p[1] - XI[1])]).sort((a, b) => a[1] - b[1]).slice(0, 3).map(a => a[0]);
  const S = svg(viz('smote'), 600, 372, { label: 'Normal and fraud points; a fraud point, its three nearest fraud neighbours, and a synthetic point on the segment to one of them', minWidth: 480 });
  const ax = axes(S, { x: 36, y: 14, w: 320, h: 320, xd: [0, 10], yd: [0, 10], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6, 8, 10], xl: 'feature 1', grid: false });
  const sub = (x, y, base, lo, cls, anchor) => {
    const t = s('text', { x, y, 'text-anchor': anchor || 'start', class: cls }, S);
    s('tspan', {}, t, base);
    s('tspan', { dy: 3, class: 't-sm' }, t, lo);
    return t;
  };
  MAJ.forEach(([x, y]) => s('circle', { cx: ax.x(x), cy: ax.y(y), r: 4, class: 'f-seg box' }, S));
  knn.forEach(p => {
    s('line', { x1: ax.x(XI[0]), y1: ax.y(XI[1]), x2: ax.x(p[0]), y2: ax.y(p[1]), class: p === NN ? 's-ter' : 's-muted dash', style: p === NN ? 'stroke-width: 2' : 'stroke-width: 1' }, S);
    s('circle', { cx: ax.x(p[0]), cy: ax.y(p[1]), r: 10, class: 's-muted', style: 'stroke-width: 1.5' }, S);
  });
  MIN.forEach(([x, y]) => s('circle', { cx: ax.x(x), cy: ax.y(y), r: 5.5, class: 'f-pri' }, S));
  s('circle', { cx: ax.x(XI[0]), cy: ax.y(XI[1]), r: 10, class: 's-pri', style: 'stroke-width: 2.5' }, S);
  sub(ax.x(XI[0]) - 14, ax.y(XI[1]) + 3, 'x', 'i', 't-pri t-bold halo', 'end');
  sub(ax.x(NN[0]) + 13, ax.y(NN[1]) - 10, 'x', 'nn', 't-ter t-bold halo');
  const dot = s('path', { class: 'f-ter' }, S);
  const lab = sub(0, 0, 'x', 'new', 't-ter t-bold halo');
  s('text', { x: 384, y: 24, class: 't-fg t-bold' }, S, 'SMOTE, slide 25');
  [['1', ['pick a fraud point xᵢ'], 50], ['2', ['find its k = 3 nearest', 'fraud neighbours (rings)'], 86], ['3', ['pick one of them, xₙₙ, and', 'interpolate between them'], 138], ['4', ['add the new point to', 'the training set'], 190]].forEach(([n, lines, y]) => {
    s('text', { x: 384, y, class: 't-pri t-bold' }, S, n);
    lines.forEach((t, i) => s('text', { x: 400, y: y + i * 16, class: 't-fg' }, S, t));
  });

  slider(viz('slider'), { label: 'λ', min: 0, max: 1, step: 0.05, value: 0.5, fmt: v => v.toFixed(2) }, l => {
    const nx = XI[0] + l * (NN[0] - XI[0]), ny = XI[1] + l * (NN[1] - XI[1]);
    const X = ax.x(nx), Y = ax.y(ny), r = 8;
    dot.setAttribute('d', `M${X} ${Y - r} L${X + r} ${Y} L${X} ${Y + r} L${X - r} ${Y} Z`);
    lab.setAttribute('x', X + 10);
    lab.setAttribute('y', Y + 20);
    role('formula').innerHTML = `x<sub>new</sub> = (6.2, 6.8) + ${l.toFixed(2)} · ((7.4, 7.6) − (6.2, 6.8)) = (${fmt(nx, 2)}, ${fmt(ny, 2)})`;
  });
});

QV.register('s4-mc9', function (q) {
  const { s, svg, axes, line, steps, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const PTS = [[1.0, 1.5], [2.0, 1.0], [1.5, 2.5], [2.5, 2.0], [6.0, 2.0], [7.0, 1.5], [6.5, 3.0], [4.0, 6.5], [5.0, 7.0], [4.5, 5.5]];
  // K-Means from centroids = points 0, 3, 4, checked in Python
  const ST = [
    { c: [[1, 1.5], [2.5, 2], [6, 2]], lab: [0, 0, 0, 1, 2, 2, 2, 1, 2, 2], J: 68 },
    { c: [[1.5, 5 / 3], [3.25, 4.25], [5.8, 3.8]], lab: [0, 0, 0, 1, 2, 2, 2, 1, 2, 2], J: 39.517 },
    { c: [[1.5, 5 / 3], [3.25, 4.25], [5.8, 3.8]], lab: [0, 0, 0, 0, 2, 2, 2, 1, 1, 1], J: 33.293 },
    { c: [[1.75, 1.75], [4.5, 19 / 3], [6.5, 13 / 6]], lab: [0, 0, 0, 0, 2, 2, 2, 1, 1, 1], J: 5.833 },
    { c: [[1.75, 1.75], [4.5, 19 / 3], [6.5, 13 / 6]], lab: [0, 0, 0, 0, 2, 2, 2, 1, 1, 1], J: 5.833 },
  ];
  const COL = ['pri', 'sec', 'ter'];
  const NAMES = ['start', 'update', 'assign', 'update', 'done'];
  const NOTES = [
    'Start. Three data points are picked at random as centroids, and every point joins the nearest one. The top group has no centroid of its own, so its points join far-away centroids and their lines are long. J = 68.',
    'Update. Each centroid moves to the mean of its points. The clusters stay the same, and J drops to 39.517.',
    'Assign. Every point joins its nearest centroid again. The point (2.5, 2) moves to the blue cluster and the top group becomes the plum cluster. J drops to 33.293.',
    'Update. The centroids move to the middle of the three groups. J drops to 5.833.',
    'Converged. One more assignment changes nothing, so the centroids stop moving. J = 5.833, the sum of the squared distances from each point to the centroid of its own cluster.',
  ];
  const K = svg(viz('km'), 760, 304, { label: 'Ten points, three centroids and the lines from each point to its centroid; bars of J after each step', minWidth: 560 });
  const ax = axes(K, { x: 36, y: 14, w: 256, h: 256, xd: [0, 8], yd: [0, 8], xt: [0, 2, 4, 6, 8], yt: [0, 2, 4, 6, 8], grid: false });
  const jx = axes(K, { x: 420, y: 24, w: 320, h: 230, xd: [-0.5, 4.5], yd: [0, 80], yt: [0, 20, 40, 60, 80], yl: 'J after each step' });
  NAMES.forEach((n, i) => s('text', { x: jx.x(i), y: 254 + 18, 'text-anchor': 'middle' }, K, n));
  const layer = s('g', {}, K);
  const diamond = (x, y, r) => `M${x} ${y - r} L${x + r} ${y} L${x} ${y + r} L${x - r} ${y} Z`;

  steps(viz('steps'), ['Start', 'Update 1', 'Assign 2', 'Update 2', 'Converged'], k => {
    const st = ST[k];
    layer.textContent = '';
    PTS.forEach((p, i) => {
      const c = st.c[st.lab[i]];
      s('line', { x1: ax.x(p[0]), y1: ax.y(p[1]), x2: ax.x(c[0]), y2: ax.y(c[1]), class: 's-' + COL[st.lab[i]], style: 'stroke-width: 1.2; opacity: 0.75' }, layer);
    });
    PTS.forEach((p, i) => s('circle', { cx: ax.x(p[0]), cy: ax.y(p[1]), r: 5.5, class: 'f-' + COL[st.lab[i]] }, layer));
    st.c.forEach((c, j) => {
      const d = diamond(ax.x(c[0]), ax.y(c[1]), 10);
      s('path', { d, class: 'f-' + COL[j] }, layer);
      s('path', { d, class: 's-fg', style: 'stroke-width: 1.5' }, layer);
    });
    ST.forEach((t, i) => {
      const x = jx.x(i), y = jx.y(t.J);
      s('rect', { x: x - 22, y, width: 44, height: jx.y(0) - y, rx: 2, class: i === k ? 'f-pri' : (i < k ? 'f-pri-soft' : 'f-seg') }, layer);
      if (i <= k) s('text', { x, y: y - 6, 'text-anchor': 'middle', class: i === k ? 't-pri t-bold' : 't-fg' }, layer, fmt(t.J, 2));
    });
    role('note').textContent = NOTES[k];
  }, 4);

  const BEST = [86.625, 37.875, 5.833, 4.583, 3.542, 2.5, 1.875, 1.25, 0.625, 0];
  const E = svg(viz('elbow'), 640, 250, { label: 'Lowest J for K = 1 to 10: 86.6, 37.9, 5.8, 4.6, 3.5, 2.5, 1.9, 1.3, 0.6, 0', minWidth: 520 });
  const ex = axes(E, { x: 52, y: 24, w: 560, h: 170, xd: [1, 10], yd: [0, 90], xt: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], yt: [0, 20, 40, 60, 80], xl: 'K (number of clusters)', yl: 'lowest possible J' });
  line(E, BEST.map((j, i) => [ex.x(i + 1), ex.y(j)]), 's-pri');
  BEST.forEach((j, i) => s('circle', { cx: ex.x(i + 1), cy: ex.y(j), r: i === 2 ? 6.5 : 4, class: i === 2 ? 'f-ok' : 'f-pri' }, E));
  s('text', { x: ex.x(1) + 10, y: ex.y(86.625) + 4, class: 't-pri t-bold' }, E, '86.6 with one cluster');
  s('text', { x: ex.x(3) + 10, y: ex.y(5.833) - 14, class: 't-ok t-bold' }, E, 'elbow: K = 3, J = 5.83');
  s('text', { x: ex.x(10), y: ex.y(0) - 14, 'text-anchor': 'end', class: 't-fg t-bold' }, E, 'K = 10: one point per cluster, J = 0');
});

QV.register('s4-mc10', function (q) {
  const { s, svg, axes, plot, slider, fmt, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const D = [[4, 11], [8, 4], [13, 5], [7, 14]];
  const MX = 8, MY = 8.5, S11 = 14, S22 = 23, S12 = -11;
  const U1 = [0.55739, -0.83025], U2 = [0.83025, 0.55739];
  const vAt = deg => { const a = deg * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a); return S11 * c * c + S22 * sn * sn + 2 * S12 * sn * c; };

  const P = svg(viz('proj'), 760, 340, { label: 'Four points with a line through their mean at angle phi and their projections; right, the variance of the projections against phi', minWidth: 560 });
  const ax = axes(P, { x: 40, y: 22, w: 256, h: 272, xd: [0, 16], yd: [0, 17], xt: [0, 4, 8, 12, 16], yt: [0, 4, 8, 12, 16], xl: 'X₁', yl: 'X₂', grid: false });
  const BOX = [[0, 0], [16, 0], [16, 17], [0, 17]];
  const cross = f => {
    const out = [];
    BOX.forEach((p, i) => {
      const r = BOX[(i + 1) % 4], a = f(p), b = f(r);
      if ((a < 0) !== (b < 0)) { const t = a / (a - b); out.push([p[0] + t * (r[0] - p[0]), p[1] + t * (r[1] - p[1])]); }
    });
    return out;
  };
  const lineThrough = (u, cls, st, g) => {
    const e = cross(p => -u[1] * (p[0] - MX) + u[0] * (p[1] - MY));
    if (e.length >= 2) s('line', { x1: ax.x(e[0][0]), y1: ax.y(e[0][1]), x2: ax.x(e[1][0]), y2: ax.y(e[1][1]), class: cls, style: st }, g);
  };
  lineThrough(U1, 's-ok dash', 'stroke-width: 1.5', P);
  const pc1Tip = [MX + 7.4 * U1[0], MY + 7.4 * U1[1]];
  s('text', { x: ax.x(pc1Tip[0]) + 6, y: ax.y(pc1Tip[1]), class: 't-ok t-bold halo' }, P, 'PC1');
  const layer = s('g', {}, P);

  const V = axes(P, { x: 400, y: 22, w: 340, h: 250, xd: [-90, 90], yd: [0, 35], xt: [-90, -45, 0, 45, 90], yt: [0, 10, 20, 30], xf: v => v + '°', xl: 'angle φ of the line', yl: 'variance of the projections' });
  plot(P, V, vAt, -90, 90, 360, 's-pri');
  const PH1 = -56.12, PH2 = 33.88;
  s('circle', { cx: V.x(PH1), cy: V.y(vAt(PH1)), r: 5, class: 'f-ok' }, P);
  s('text', { x: V.x(PH1) + 10, y: V.y(vAt(PH1)) - 10, class: 't-ok t-bold' }, P, 'PC1, 30.38');
  s('circle', { cx: V.x(PH2), cy: V.y(vAt(PH2)), r: 5, class: 'f-sec' }, P);
  s('text', { x: V.x(PH2) + 10, y: V.y(vAt(PH2)) + 20, class: 't-sec t-bold' }, P, 'PC2, 6.62');
  const mk = s('g', {}, P);

  slider(viz('slider'), { label: 'φ', min: -90, max: 90, step: 1, value: -56, fmt: v => v + '°' }, deg => {
    const a = deg * Math.PI / 180, u = [Math.cos(a), Math.sin(a)];
    layer.textContent = '';
    lineThrough(u, 's-pri', 'stroke-width: 2.5', layer);
    D.forEach(([x, y], i) => {
      const t = (x - MX) * u[0] + (y - MY) * u[1], px = MX + t * u[0], py = MY + t * u[1];
      s('line', { x1: ax.x(x), y1: ax.y(y), x2: ax.x(px), y2: ax.y(py), class: 's-muted dash', style: 'stroke-width: 1' }, layer);
      s('circle', { cx: ax.x(px), cy: ax.y(py), r: 4, class: 'f-pri' }, layer);
      s('circle', { cx: ax.x(x), cy: ax.y(y), r: 5, class: 'f-fg' }, layer);
      s('text', { x: ax.x(x) + 8, y: ax.y(y) - 6, class: 't-fg t-sm halo' }, layer, String(i + 1));
    });
    s('path', { d: `M${ax.x(MX) - 5} ${ax.y(MY)} h10 M${ax.x(MX)} ${ax.y(MY) - 5} v10`, class: 's-fg' }, layer);
    const v = vAt(deg);
    mk.textContent = '';
    s('line', { x1: V.x(deg), x2: V.x(deg), y1: V.y(35), y2: V.y(0), class: 's-pri dash', style: 'stroke-width: 1; opacity: 0.6' }, mk);
    s('circle', { cx: V.x(deg), cy: V.y(v), r: 5, class: 'f-pri' }, mk);
    role('phi').textContent = deg + '°';
    role('var').textContent = fmt(v, 2);
    role('share').textContent = fmt(100 * v / 37, 1) + '%';
    let t;
    if (deg === -56) t = 'φ = −56° is PC1 (exactly −56.1°). The projections spread the most here, variance <b>30.38</b>, which is 82.1% of the total 37. The direction is the eigenvector (0.557, −0.830), so PC1 mixes both variables.';
    else if (deg === 34) t = 'φ = 34° is PC2, at 90° from PC1. The projections spread the least, variance <b>6.62</b>. PC2 keeps the other 17.9%.';
    else t = `Variance <b>${fmt(v, 2)}</b> along φ = ${deg}°. The maximum, 30.38, is at −56°.`;
    role('verdict').innerHTML = t;
  });

  // Figure 2: centred data against PC scores
  const C = [[-4, 2.5], [0, -4.5], [5, -3.5], [-1, 5.5]];
  const SC = C.map(([a, b]) => [a * U1[0] + b * U1[1], a * U2[0] + b * U2[1]]);
  const G = svg(viz('pcs'), 760, 318, { label: 'Left: centred data with the eigenvectors. Right: the same points as PC1 and PC2 scores, uncorrelated', minWidth: 560 });
  const panel = (x0, title, pts, xl, yl, cls) => {
    const p = axes(G, { x: x0, y: 34, w: 240, h: 240, xd: [-7.5, 7.5], yd: [-7.5, 7.5], xt: [-5, 0, 5], yt: [-5, 0, 5], xl, grid: false });
    s('text', { x: x0, y: 14, class: 't-fg t-bold' }, G, title);
    s('line', { x1: p.x(-7.5), x2: p.x(7.5), y1: p.y(0), y2: p.y(0), class: cls[0], style: 'stroke-width: 1' }, G);
    s('line', { x1: p.x(0), x2: p.x(0), y1: p.y(-7.5), y2: p.y(7.5), class: cls[1], style: 'stroke-width: 1' }, G);
    s('text', { x: p.x(0) + 6, y: p.y(7.5) + 12, class: 't-sm ' + cls[2] }, G, yl);
    pts.forEach(([a, b], i) => {
      s('circle', { cx: p.x(a), cy: p.y(b), r: 5, class: 'f-fg' }, G);
      s('text', { x: p.x(a) + 8, y: p.y(b) - 6, class: 't-fg t-sm halo' }, G, String(i + 1));
    });
    return p;
  };
  const L = panel(60, 'centred data · cov(X₁, X₂) = −11', C, 'X₁ − 8', 'X₂ − 8.5', ['s-line', 's-line', 't-muted']);
  arrow(G, L.x(0), L.y(0), L.x(5 * U1[0]), L.y(5 * U1[1]), { cls: 'a-pri', width: 2.5 });
  arrow(G, L.x(0), L.y(0), L.x(5 * U2[0]), L.y(5 * U2[1]), { cls: 'a-sec', width: 2.5 });
  s('text', { x: L.x(5 * U1[0]) + 8, y: L.y(5 * U1[1]) + 4, class: 't-pri t-bold halo' }, G, 'u₁');
  s('text', { x: L.x(5 * U2[0]) + 8, y: L.y(5 * U2[1]) + 4, class: 't-sec t-bold halo' }, G, 'u₂');
  panel(460, 'PC scores · cov(PC1, PC2) = 0', SC, 'PC1, variance 30.38 (82.1%)', 'PC2, variance 6.62', ['s-pri', 's-sec', 't-sec']);
});

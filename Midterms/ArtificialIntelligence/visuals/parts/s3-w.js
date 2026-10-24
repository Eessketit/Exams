QV.register('s3-w1', function (q) {
  const { s, svg, axes, line, plot, slider, steps, table, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const neg = v => String(v).replace('-', '−');
  const X = [1, 2, 4], Y = [3, 5, 9], M = 3;
  const J = t => X.reduce((a, x, i) => a + (t[0] + t[1] * x - Y[i]) ** 2, 0) / (2 * M);
  const step = (t, a) => {
    const e = X.map((x, i) => t[0] + t[1] * x - Y[i]);
    return [t[0] - a * e.reduce((p, v) => p + v, 0) / M, t[1] - a * e.reduce((p, v, i) => p + v * X[i], 0) / M];
  };

  // Figure 1: contours of J(θ0, θ1) with the gradient descent path
  const bw = svg(viz('bowl'), 580, 340, { label: 'Contours of the loss J over theta0 and theta1, the gradient descent path from 0,0 and the one-step normal equation jump to the minimum 1,2', minWidth: 480 });
  const D0 = [-0.5, 2.5], D1 = [-0.5, 2.9];
  const ax = axes(bw, { x: 60, y: 20, w: 480, h: 272, xd: D0, yd: D1, xt: [-0.5, 0, 0.5, 1, 1.5, 2, 2.5], yt: [-0.5, 0, 0.5, 1, 1.5, 2, 2.5], xf: neg, yf: neg, xl: 'θ₀ (intercept)', yl: 'θ₁ (slope)', grid: false });
  const clipSeg = (p, r) => {
    let t0 = 0, t1 = 1;
    const dx = r[0] - p[0], dy = r[1] - p[1];
    const chk = (pp, qq) => {
      if (pp === 0) return qq >= 0;
      const t = qq / pp;
      if (pp < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
      return true;
    };
    if (chk(-dx, p[0] - D0[0]) && chk(dx, D0[1] - p[0]) && chk(-dy, p[1] - D1[0]) && chk(dy, D1[1] - p[1])) return [[p[0] + t0 * dx, p[1] + t0 * dy], [p[0] + t1 * dx, p[1] + t1 * dy]];
    return null;
  };
  const clipD = pts => {
    let d = '', last = null;
    for (let i = 1; i < pts.length; i++) {
      const c = clipSeg(pts[i - 1], pts[i]);
      if (!c) { last = null; continue; }
      const [a, b] = c.map(([u, v]) => [ax.x(u).toFixed(1), ax.y(v).toFixed(1)]);
      if (!last || last[0] !== a[0] || last[1] !== a[1]) d += `M${a[0]} ${a[1]} `;
      d += `L${b[0]} ${b[1]} `;
      last = b;
    }
    return d;
  };
  // J = ½ (θ − θ*)ᵀ H (θ − θ*) with H = XᵀX / m, so each contour is an ellipse along the eigenvectors of H
  const H = [1, X.reduce((a, x) => a + x, 0) / M, X.reduce((a, x) => a + x * x, 0) / M];
  const mid = (H[0] + H[2]) / 2, rad = Math.sqrt(((H[0] - H[2]) / 2) ** 2 + H[1] ** 2);
  const EIG = [mid + rad, mid - rad].map(l => { const v = [H[1], l - H[0]], n = Math.hypot(v[0], v[1]); return { l, v: [v[0] / n, v[1] / n] }; });
  const STAR = [1, 2];
  [0.02, 0.1, 0.5, 2, 7.137, 19.167].forEach(lv => {
    const r1 = Math.sqrt(2 * lv / EIG[0].l), r2 = Math.sqrt(2 * lv / EIG[1].l), pts = [];
    for (let i = 0; i <= 1440; i++) {
      const a = i * Math.PI / 720;
      pts.push([0, 1].map(k => STAR[k] + r1 * Math.cos(a) * EIG[0].v[k] + r2 * Math.sin(a) * EIG[1].v[k]));
    }
    s('path', { d: clipD(pts), class: 's-muted', style: 'stroke-width: 1; opacity: 0.5' }, bw);
  });
  const pathL = s('g', {}, bw);
  const ux = ax.x(1) - ax.x(0), uy = ax.y(2) - ax.y(0), ul = Math.hypot(ux, uy);
  arrow(bw, ax.x(0), ax.y(0), ax.x(1) - 9 * ux / ul, ax.y(2) - 9 * uy / ul, { cls: 'a-ok', dash: true, width: 2 });
  s('circle', { cx: ax.x(1), cy: ax.y(2), r: 6, class: 'f-ok' }, bw);
  s('circle', { cx: ax.x(0), cy: ax.y(0), r: 4.5, class: 'f-fg' }, bw);
  s('text', { x: ax.x(0) + 10, y: ax.y(0) + 18, class: 't-fg t-sm halo' }, bw, 'start θ = [0, 0], J = 19.167');
  s('text', { x: ax.x(1) + 12, y: ax.y(2) + 20, class: 't-ok t-bold t-sm halo' }, bw, 'minimum θ = [1, 2], J = 0');
  s('text', { x: ax.x(0.62), y: ax.y(0.95), class: 't-ok t-sm halo' }, bw, 'normal equation:');
  s('text', { x: ax.x(0.62), y: ax.y(0.95) + 13, class: 't-ok t-sm halo' }, bw, 'one step, no α');
  s('text', { x: ax.x(-0.44), y: ax.y(1.75), class: 't-pri t-sm t-bold halo' }, bw, 'gradient descent:');
  s('text', { x: ax.x(-0.44), y: ax.y(1.75) + 13, class: 't-pri t-sm halo' }, bw, 'one step per iteration');

  slider(viz('alpha'), { label: 'α', min: 0.01, max: 0.27, step: 0.01, value: 0.05, fmt: v => v.toFixed(2) }, a => {
    a = Math.round(a * 100) / 100;
    let t = [0, 0], it = 0;
    while (J(t) >= 1e-3 && it < 5000 && J(t) < 1e4) { t = step(t, a); it++; }
    const div = J(t) >= 1e4;
    let t10 = [0, 0];
    for (let i = 0; i < 10; i++) t10 = step(t10, a);
    const pts = [[0, 0]];
    let p = [0, 0];
    for (let i = 0; i < 700 && J(p) > 1e-8 && J(p) < 1e6; i++) { p = step(p, a); pts.push(p); }
    pathL.textContent = '';
    s('path', { d: clipD(pts), class: 's-pri', style: 'stroke-width: 1.8' }, pathL);
    pts.slice(1, 16).forEach(([u, v]) => { if (clipSeg([u, v], [u, v])) s('circle', { cx: ax.x(u), cy: ax.y(v), r: 2.8, class: 'f-pri' }, pathL); });
    const j10 = J(t10);
    role('iters').textContent = div ? 'diverges' : String(it);
    role('j10').textContent = j10 >= 100 ? j10.toFixed(0) : j10.toFixed(3);
    const A = `<b>α = ${a.toFixed(2)}</b>`;
    role('alpha-verdict').innerHTML = div
      ? `${A} is too large. Each step jumps across the valley and lands higher than it started, so J grows without limit and gradient descent diverges. For this data the limit is about 0.256.`
      : a < 0.05 ? `${A}: every step is safe but short, so gradient descent needs ${it} iterations.`
      : a === 0.05 ? `${A}, the value in Q4: ${it} iterations until J &lt; 0.001. The first step is the one Q4 asks for.`
      : a <= 0.22 ? `${A}: longer steps reach the valley sooner, ${it} iterations. Choosing α is part of the work.`
      : `${A} is close to the limit. Each step overshoots across the valley and the path zigzags, so it needs ${it} iterations.`;
  });

  // Figure 2: time for one solve against the number of features
  const cs = svg(viz('cost'), 600, 300, { label: 'Log-log chart of solve time against the number of features: the normal equation grows like n cubed, gradient descent like n; they cross near n = 1000', minWidth: 480 });
  const XL = ['1', '10', '100', '10³', '10⁴', '10⁵', '10⁶'];
  const YL = { '-9': '1 ns', '-6': '1 µs', '-3': '1 ms', '0': '1 s', '3': '17 min', '6': '12 days', '9': '32 years' };
  const cx = axes(cs, { x: 72, y: 24, w: 500, h: 220, xd: [0, 6], yd: [-9.5, 10], xt: [0, 1, 2, 3, 4, 5, 6], yt: [-9, -6, -3, 0, 3, 6, 9], xf: v => XL[v], yf: v => YL[String(v)], xl: 'number of features n (log scale)', yl: 'time for one solve (log scale)' });
  const tNE = n => (n + 1) ** 3 / 1e9, tGD = n => 1e6 * (n + 1) / 1e9;
  plot(cs, cx, lg => Math.log10(tNE(10 ** lg)), 0, 6, 120, 's-sec');
  plot(cs, cx, lg => Math.log10(tGD(10 ** lg)), 0, 6, 120, 's-pri');
  s('text', { x: cx.x(4.3) - 6, y: cx.y(3.9) - 8, 'text-anchor': 'end', class: 't-sec t-bold halo' }, cs, 'normal equation, slope 3');
  s('text', { x: cx.x(3.8) + 4, y: cx.y(0.8) + 20, class: 't-pri t-bold halo' }, cs, 'gradient descent, slope 1');
  const tf = t => t < 1e-6 ? Math.round(t * 1e9) + ' ns' : t < 1e-3 ? (t * 1e6).toFixed(1) + ' µs' : t < 1 ? Math.round(t * 1e3) + ' ms' : t < 60 ? t.toFixed(1) + ' s' : t < 3600 ? (t / 60).toFixed(1) + ' min' : t < 86400 ? (t / 3600).toFixed(1) + ' h' : t < 3.15576e7 ? (t / 86400).toFixed(1) + ' days' : (t / 3.15576e7).toFixed(1) + ' years';
  const mk = s('g', {}, cs);
  const NS = [3, 1000, 1e6];
  const SIZE = [['4 × 4', '16 entries'], ['1001 × 1001', 'about 10⁶ entries'], ['10⁶ × 10⁶', 'about 10¹² entries, 8 TB']];
  steps(viz('cost-steps'), ['n = 3', 'n = 1000', 'n = 10⁶'], k => {
    mk.textContent = '';
    const n = NS[k], lg = Math.log10(n), x = cx.x(lg);
    const yN = cx.y(Math.log10(tNE(n))), yG = cx.y(Math.log10(tGD(n)));
    s('line', { x1: x, x2: x, y1: cx.y(-9.5), y2: cx.y(10), class: 's-muted dash', style: 'stroke-width: 1' }, mk);
    s('circle', { cx: x, cy: yN, r: 5, class: 'f-sec' }, mk);
    s('circle', { cx: x, cy: yG, r: 5, class: 'f-pri' }, mk);
    const [dx, dyN, dyG] = [[10, 16, 14], [-10, 24, -12], [-10, -10, -10]][k];
    s('text', { x: x + dx, y: yN + dyN, 'text-anchor': dx > 0 ? 'start' : 'end', class: 't-sec t-bold halo' }, mk, tf(tNE(n)));
    s('text', { x: x + dx, y: yG + dyG, 'text-anchor': dx > 0 ? 'start' : 'end', class: 't-pri t-bold halo' }, mk, tf(tGD(n)));
    role('size').textContent = SIZE[k][0];
    role('entries').textContent = SIZE[k][1];
    role('t-ne').textContent = tf(tNE(n));
    role('t-gd').textContent = tf(tGD(n));
  });

  // Figure 3: polynomial features, fitted by the normal equation
  const XT = [0, 1, 2, 3, 4, 5, 6, 7], YT = [5.12, 7.01, 7.99, 6.53, 5.62, 3.96, 4.79, 6.83];
  const XV = [0.5, 1.5, 5.5, 6.5], YV = [6.75, 7.45, 4.5, 5.3];
  const solve = (A, b) => {
    const n = b.length, Mx = A.map((r, i) => r.concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(Mx[r][c]) > Math.abs(Mx[p][c])) p = r;
      [Mx[c], Mx[p]] = [Mx[p], Mx[c]];
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const f = Mx[r][c] / Mx[c][c];
        for (let j = c; j <= n; j++) Mx[r][j] -= f * Mx[c][j];
      }
    }
    return Mx.map((r, i) => r[n] / r[i]);
  };
  // columns are rescaled to t = (x − 3.5) / 3.5 only to keep the solve well conditioned; the fitted curve is the same
  const fit = d => {
    const P = XT.map(x => Array.from({ length: d + 1 }, (_, j) => ((x - 3.5) / 3.5) ** j));
    const A = P[0].map((_, a) => P[0].map((__, c) => P.reduce((sum, r) => sum + r[a] * r[c], 0)));
    const b = P[0].map((_, a) => P.reduce((sum, r, i) => sum + r[a] * YT[i], 0));
    const w = solve(A, b);
    return x => w.reduce((sum, wj, j) => sum + wj * ((x - 3.5) / 3.5) ** j, 0);
  };
  const mse = (f, xs, ys) => xs.reduce((a, x, i) => a + (f(x) - ys[i]) ** 2, 0) / xs.length;
  const pg = svg(viz('poly'), 600, 290, { label: 'Training and validation points with the fitted polynomial curve of the chosen degree', minWidth: 480 });
  const px = axes(pg, { x: 50, y: 20, w: 520, h: 220, xd: [-0.3, 7.3], yd: [3, 9], xt: [0, 1, 2, 3, 4, 5, 6, 7], yt: [3, 5, 7, 9], xl: 'x', yl: 'y' });
  const curveL = s('g', {}, pg);
  XT.forEach((x, i) => s('circle', { cx: px.x(x), cy: px.y(YT[i]), r: 4.5, class: 'f-fg' }, pg));
  XV.forEach((x, i) => s('circle', { cx: px.x(x), cy: px.y(YV[i]), r: 5.5, class: 's-ter', style: 'stroke-width: 2' }, pg));
  const SUP = ['', '', '²', '³', '⁴', '⁵', '⁶', '⁷'];
  slider(viz('deg'), { label: 'degree', min: 1, max: 7, step: 1, value: 3 }, d => {
    const f = fit(d), tr = mse(f, XT, YT), va = mse(f, XV, YV);
    curveL.textContent = '';
    XV.forEach((x, i) => s('line', { x1: px.x(x), x2: px.x(x), y1: px.y(YV[i]), y2: px.y(f(x)), class: 's-ter dash', style: 'stroke-width: 1.5' }, curveL));
    plot(curveL, px, f, 0, 7, 280, 's-pri');
    role('nw').textContent = String(d + 1);
    role('mse-tr').textContent = tr < 0.0005 ? '0.000' : tr.toFixed(3);
    role('mse-va').textContent = va.toFixed(3);
    role('deg-verdict').innerHTML = d <= 2
      ? `<b>Degree ${d}</b> underfits. The curve cannot bend twice, so it misses the S shape and both errors are high.`
      : d === 3 ? '<b>Degree 3</b> follows the S shape. Its validation error is the lowest of all degrees.'
      : d === 4 ? '<b>Degree 4</b> is about as good as 3. The extra weight adds almost nothing.'
      : d < 7 ? `<b>Degree ${d}</b> starts to follow the noise. The training error falls, the validation error rises.`
      : '<b>Degree 7</b> has 8 weights for 8 points, so it passes through every training point (training MSE 0). It overfits: the validation error is the worst of all degrees.';
    const host = viz('design');
    host.textContent = '';
    const head = [{ text: 'input x', cls: 'l' }, '1'].concat(Array.from({ length: d }, (_, j) => 'x' + SUP[j + 1]));
    table(host, head, [1, 2, 3].map(x => [{ text: String(x), cls: 'l' }, '1'].concat(Array.from({ length: d }, (_, j) => String(x ** (j + 1))))));
  });
});

QV.register('s3-w2', function (q) {
  const { s, svg, steps, box, grid, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  // slide 14: Day, Discount, Free Delivery, Purchase
  const DATA = [
    ['Weekday', 'Yes', 'Yes', 'Yes'], ['Weekday', 'Yes', 'Yes', 'Yes'], ['Weekday', 'No', 'No', 'No'], ['Holiday', 'Yes', 'Yes', 'Yes'], ['Weekend', 'Yes', 'Yes', 'Yes'],
    ['Holiday', 'No', 'Yes', 'No'], ['Weekend', 'Yes', 'No', 'No'], ['Weekday', 'Yes', 'Yes', 'Yes'], ['Weekend', 'Yes', 'Yes', 'No'], ['Holiday', 'Yes', 'Yes', 'Yes'],
    ['Holiday', 'No', 'Yes', 'Yes'], ['Holiday', 'No', 'No', 'No'], ['Weekend', 'Yes', 'Yes', 'Yes'], ['Holiday', 'Yes', 'Yes', 'Yes'], ['Weekday', 'No', 'No', 'Yes'],
  ];
  const DAYS = ['Weekday', 'Weekend', 'Holiday'];
  const cnt = f => DATA.filter(f).length;
  const BY = DAYS.map(d => [cnt(r => r[0] === d && r[3] === 'Yes'), cnt(r => r[0] === d && r[3] === 'No')]);
  const NBUY = cnt(r => r[3] === 'Yes'), NALL = DATA.length;

  // Figure 1: one tile per visit, rows = Day
  const bt = svg(viz('bayes'), 680, 214, { label: 'Fifteen tiles, one per visit, grouped by day and by purchase, with the four terms of Bayes theorem for the chosen day', minWidth: 540 });
  const T = { x0: 92, xN: 236, y0: 40, pitch: 42, sz: 28, gap: 4 };
  s('text', { x: T.x0, y: 24, class: 't-pri t-bold' }, bt, `Buy (${NBUY})`);
  s('text', { x: T.xN, y: 24, class: 't-sec t-bold' }, bt, `No Buy (${NALL - NBUY})`);
  const rowBox = s('rect', { x: T.x0 - 7, width: 222, height: T.sz + 10, rx: 6, class: 'f-none s-ter', style: 'stroke-width: 2' }, bt);
  DAYS.forEach((d, i) => {
    const y = T.y0 + i * T.pitch;
    s('text', { x: T.x0 - 14, y: y + T.sz / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-fg' }, bt, d);
    for (let j = 0; j < BY[i][0]; j++) s('rect', { x: T.x0 + j * (T.sz + T.gap), y, width: T.sz, height: T.sz, rx: 3, class: 'f-pri' }, bt);
    for (let j = 0; j < BY[i][1]; j++) s('rect', { x: T.xN + j * (T.sz + T.gap), y, width: T.sz, height: T.sz, rx: 3, class: 'f-sec' }, bt);
    s('text', { x: 320, y: y + T.sz / 2, dy: '0.35em', class: 't-sm' }, bt, `${BY[i][0] + BY[i][1]} visits`);
  });
  s('text', { x: T.x0 - 14, y: T.y0 + 3 * T.pitch + 14, class: 't-sm' }, bt, '15 visits in all (slide 14)');
  const cards = s('g', {}, bt);
  const note = role('bayes-note');
  const NOTES = [
    'On a weekday 4 of the 5 visits ended in a purchase. So P(Buy | Weekday) = 0.80 and P(No Buy | Weekday) = 0.20, the value on slide 20. A weekday customer most likely buys.',
    'On a weekend 2 of the 4 visits ended in a purchase, so P(Buy | Weekend) = 0.50. Day alone cannot decide here; the other features have to.',
    'On a holiday 4 of the 6 visits ended in a purchase, so P(Buy | Holiday) = 0.67.',
  ];
  steps(viz('bayes-steps'), DAYS.map(d => 'B = ' + d), k => {
    const d = DAYS[k], [b, n] = BY[k];
    rowBox.setAttribute('y', T.y0 + k * T.pitch - 5);
    cards.textContent = '';
    const post = (b / (b + n)).toFixed(2);
    [
      [`posterior  P(Buy | ${d}) = ${b}/${b + n} = ${post}`, `${b} of the ${b + n} tiles in the row are blue`, 'f-ok-soft'],
      [`likelihood  P(${d} | Buy) = ${b}/${NBUY}`, `${b} of the ${NBUY} blue tiles are in the row`, 'f-surface'],
      [`prior  P(Buy) = ${NBUY}/${NALL}`, `${NBUY} of all ${NALL} tiles are blue`, 'f-surface'],
      [`evidence  P(${d}) = ${b + n}/${NALL}`, `${b + n} of all ${NALL} tiles are in the row`, 'f-surface'],
    ].forEach(([l1, l2, cls], i) => box(cards, 366, 12 + i * 48, 304, 40, l1 + '\n' + l2, { cls, textCls: 't-fg', lh: 15 }));
    role('bayes-formula').textContent = `P(Buy | ${d}) = P(${d} | Buy) · P(Buy) / P(${d}) = (${b}/${NBUY} · ${NBUY}/${NALL}) / (${b + n}/${NALL}) = ${post}`;
    note.textContent = NOTES[k];
  });

  // Figure 2: the graph of the naive model, and joint vs single-feature counts
  const nv = svg(viz('naive'), 700, 316, { label: 'Naive Bayes graph: the class points to Day, Discount and Free Delivery with no links between them; joint counts with 14 of 24 cells empty against 7 single-feature counts per class with none empty', minWidth: 560 });
  box(nv, 85, 20, 150, 46, 'class A\nBuy or No Buy', { cls: 'f-pri', textCls: 't-on t-bold', lh: 15 });
  const FX = [52, 162, 272], FN = ['x₁\nDay', 'x₂\nDiscount', 'x₃\nFree Delivery'];
  FX.forEach((x, i) => {
    box(nv, x - 48, 150, 96, 40, FN[i], { cls: 'f-pri-soft', textCls: 't-fg', lh: 15 });
    arrow(nv, 160, 66, x, 148, { cls: 'a-pri', width: 1.8 });
  });
  [[52, 162], [162, 272]].forEach(([a, b]) => {
    s('path', { d: `M${a} 190 Q${(a + b) / 2} 232 ${b} 190`, class: 's-bad dash', style: 'stroke-width: 1.5' }, nv);
    s('text', { x: (a + b) / 2, y: 211, dy: '0.35em', 'text-anchor': 'middle', class: 't-bad t-bold t-lg' }, nv, '×');
  });
  s('text', { x: 162, y: 250, 'text-anchor': 'middle', class: 't-bad t-sm' }, nv, 'no links between features');
  s('text', { x: 162, y: 278, 'text-anchor': 'middle', class: 't-fg t-sm' }, nv, 'P(x₁, x₂, x₃ | A) = P(x₁|A)·P(x₂|A)·P(x₃|A)');
  const COMBOS = [];
  DAYS.forEach(d => ['Yes', 'No'].forEach(di => ['Yes', 'No'].forEach(fd => COMBOS.push([d, di, fd]))));
  const JOINT = COMBOS.map(([d, di, fd]) => ['Yes', 'No'].map(c => cnt(r => r[0] === d && r[1] === di && r[2] === fd && r[3] === c)));
  const zeros = JOINT.flat().filter(v => !v).length;
  const cellFill = (v, r, c) => (v ? { cls: c ? 'f-sec' : 'f-pri', text: 't-on' } : { cls: 'f-seg', text: 't-muted' });
  s('text', { x: 372, y: 16, class: 't-fg t-bold' }, nv, 'without the assumption');
  s('text', { x: 372, y: 30, class: 't-sm' }, nv, '12 combinations × 2 classes');
  s('text', { x: 452, y: 46, 'text-anchor': 'end', class: 't-sm' }, nv, 'Day Disc Deliv');
  grid(nv, { x: 458, y: 52, data: JOINT, cell: 18, fill: cellFill, rowLabels: COMBOS.map(([d, di, fd]) => `${d} ${di[0]} ${fd[0]}`), colLabels: ['Buy', 'No'] });
  s('text', { x: 372, y: 52 + 12 * 18 + 18, class: 't-bad t-sm t-bold' }, nv, `${zeros} of 24 counts are 0`);
  const SINGLE = [
    ['Weekday', r => r[0] === 'Weekday'], ['Weekend', r => r[0] === 'Weekend'], ['Holiday', r => r[0] === 'Holiday'],
    ['Disc Yes', r => r[1] === 'Yes'], ['Disc No', r => r[1] === 'No'], ['Deliv Yes', r => r[2] === 'Yes'], ['Deliv No', r => r[2] === 'No'],
  ];
  const SC = SINGLE.map(([, f]) => ['Yes', 'No'].map(c => cnt(r => f(r) && r[3] === c)));
  s('text', { x: 556, y: 16, class: 't-fg t-bold' }, nv, 'with the assumption');
  s('text', { x: 556, y: 30, class: 't-sm' }, nv, '3 + 2 + 2 = 7 per class');
  grid(nv, { x: 628, y: 52, data: SC, cell: 18, fill: cellFill, rowLabels: SINGLE.map(r => r[0]), colLabels: ['Buy', 'No'] });
  s('text', { x: 556, y: 52 + 7 * 18 + 18, class: 't-ok t-sm t-bold' }, nv, SC.flat().every(v => v) ? 'no count is 0' : 'some counts are 0');

  // Figure 3: the product for one query, then normalization
  const pr = svg(viz('prod'), 680, 324, { label: 'Horizontal bars: the Buy and No Buy scores after the prior and each likelihood factor, then the normalized split 90 to 10 percent', minWidth: 540 });
  const PX0 = 206, PS = 600;
  const FAC = [
    { b: [10, 15], n: [5, 15], lb: 'P(Buy) = 10/15', ln: 'P(No Buy) = 5/15' },
    { b: [8, 10], n: [2, 5], lb: '× P(Disc. = Yes | Buy) = 8/10', ln: '× P(Disc. = Yes | No) = 2/5' },
    { b: [9, 10], n: [2, 5], lb: '× P(Deliv. = Yes | Buy) = 9/10', ln: '× P(Deliv. = Yes | No) = 2/5' },
    { b: [4, 10], n: [2, 5], lb: '× P(Holiday | Buy) = 4/10', ln: '× P(Holiday | No) = 2/5' },
  ];
  let vb = 1, vn = 1;
  const rowsB = [], rowsN = [];
  const vfmt = v => (v >= 0.1 ? v.toFixed(3) : v.toFixed(4));
  s('text', { x: PX0, y: 24, class: 't-pri t-bold' }, pr, 'Buy');
  s('text', { x: PX0, y: 148, class: 't-sec t-bold' }, pr, 'No Buy');
  FAC.forEach((f, i) => {
    vb *= f.b[0] / f.b[1];
    vn *= f.n[0] / f.n[1];
    [[rowsB, 32 + i * 24, vb, f.lb, 'f-pri'], [rowsN, 156 + i * 24, vn, f.ln, 'f-sec']].forEach(([arr, y, v, lab, cls]) => {
      const g = s('g', { class: 'fade' }, pr);
      s('text', { x: PX0 - 8, y: y + 9, dy: '0.35em', 'text-anchor': 'end', class: 't-sm t-fg' }, g, lab);
      s('rect', { x: PX0, y, width: v * PS, height: 18, class: cls }, g);
      s('text', { x: PX0 + v * PS + 6, y: y + 9, dy: '0.35em', class: 't-fg t-bold' }, g, vfmt(v));
      arr.push(g);
    });
  });
  const AY = 262;
  s('line', { x1: PX0, x2: PX0 + 0.7 * PS, y1: AY, y2: AY, class: 'l-axis' }, pr);
  [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7].forEach(v => {
    s('line', { x1: PX0 + v * PS, x2: PX0 + v * PS, y1: AY, y2: AY + 5, class: 'l-axis' }, pr);
    s('text', { x: PX0 + v * PS, y: AY + 17, 'text-anchor': 'middle', class: 't-sm' }, pr, v ? v.toFixed(1) : '0');
  });
  const ng = s('g', { class: 'fade' }, pr);
  const pb = vb / (vb + vn), NW = 0.7 * PS;
  s('text', { x: PX0 - 8, y: 305, dy: '0.35em', 'text-anchor': 'end', class: 't-sm t-fg' }, ng, 'normalized, sums to 1');
  s('rect', { x: PX0, y: 294, width: pb * NW, height: 22, class: 'f-pri' }, ng);
  s('rect', { x: PX0 + pb * NW, y: 294, width: (1 - pb) * NW, height: 22, class: 'f-sec' }, ng);
  s('text', { x: PX0 + 8, y: 305, dy: '0.35em', class: 't-on t-bold' }, ng, `Buy ${Math.round(pb * 100)} %`);
  s('text', { x: PX0 + NW - 6, y: 305, dy: '0.35em', 'text-anchor': 'end', class: 't-on t-bold' }, ng, `${Math.round((1 - pb) * 100)} %`);
  const DEN = (10 / 15) * (11 / 15) * (6 / 15);
  const PNOTES = [
    'Start from the priors: P(Buy) = 10/15 = 0.667 and P(No Buy) = 5/15 = 0.333.',
    'Multiply by P(Discount = Yes | class): 8/10 for Buy and 2/5 for No Buy. Buy keeps 80 % of its score, No Buy only 40 %.',
    'Multiply by P(Free Delivery = Yes | class): 9/10 for Buy and 2/5 for No Buy.',
    `Multiply by P(Holiday | class): 4/10 and 2/5. The numerators are ${vfmt(vb)} for Buy and ${vfmt(vn)} for No Buy, as on slides 23-24.`,
    `Slide 25 divides both by P(Discount) · P(Free Delivery) · P(Holiday) = (10/15)(11/15)(6/15) = ${DEN.toFixed(4)}, giving ${(vb / DEN).toFixed(3)} and ${(vn / DEN).toFixed(3)}. They add up to ${((vb + vn) / DEN).toFixed(3)}, not 1, so normalize: Buy ${Math.round(pb * 100)} %, No Buy ${Math.round((1 - pb) * 100)} %. Buy wins.`,
  ];
  steps(viz('prod-steps'), ['Prior', '× Discount', '× Free Delivery', '× Day', 'Normalize'], k => {
    rowsB.forEach((g, i) => g.classList.toggle('dim', i > k));
    rowsN.forEach((g, i) => g.classList.toggle('dim', i > k));
    ng.classList.toggle('dim', k < 4);
    role('prod-note').textContent = PNOTES[k];
  }, 4);
});

QV.register('s3-w3', function (q) {
  const { s, svg, axes, steps, table, line } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const mean = a => a.reduce((p, v) => p + v, 0) / a.length;

  // Figure 1: MCAR, MAR, MNAR on the same 16 answers
  const AGE = [22, 25, 27, 30, 33, 35, 38, 40, 43, 46, 49, 52, 55, 58, 61, 64];
  const INC = [30, 62, 38, 45, 70, 41, 55, 33, 66, 48, 75, 40, 58, 36, 64, 50];
  const MECH = [
    { name: 'MCAR', miss: i => [3, 6, 11, 14].includes(i) },
    { name: 'MAR', miss: i => AGE[i] >= 55 },
    { name: 'MNAR', miss: i => INC[i] >= 62 },
  ];
  const mg = svg(viz('mech'), 640, 290, { label: 'Age against income for 16 answers, with the missing incomes drawn as rings, and the income column as the dataset stores it', minWidth: 520 });
  const ma = axes(mg, { x: 56, y: 24, w: 400, h: 220, xd: [20, 66], yd: [25, 80], xt: [20, 30, 40, 50, 60], yt: [30, 40, 50, 60, 70, 80], xl: 'age', yl: 'income (k$)' });
  const tm = mean(INC);
  const mL = s('g', {}, mg);
  const SX = 566, SW = 52, SH = 220 / 16;
  s('text', { x: SX - 6, y: 16, 'text-anchor': 'end', class: 't-sm' }, mg, 'age');
  s('text', { x: SX + SW / 2, y: 16, 'text-anchor': 'middle', class: 't-sm' }, mg, 'income');
  steps(viz('mech-steps'), MECH.map(m => m.name), k => {
    mL.textContent = '';
    const m = MECH[k];
    if (k === 1) {
      s('rect', { x: ma.x(53.5), y: ma.y(80), width: ma.x(66) - ma.x(53.5), height: ma.y(25) - ma.y(80), class: 'area-sec' }, mL);
      s('text', { x: ma.x(54.2), y: ma.y(80) + 14, class: 't-sec t-sm t-bold' }, mL, 'age ≥ 55');
    }
    if (k === 2) {
      s('rect', { x: ma.x(20), y: ma.y(80), width: ma.x(66) - ma.x(20), height: ma.y(61) - ma.y(80), class: 'area-sec' }, mL);
      s('text', { x: ma.x(20.8), y: ma.y(80) + 14, class: 't-sec t-sm t-bold' }, mL, 'income ≥ 62');
    }
    const obs = INC.filter((v, i) => !m.miss(i)), om = mean(obs);
    s('line', { x1: ma.x(20), x2: ma.x(66), y1: ma.y(tm), y2: ma.y(tm), class: 's-muted dash', style: 'stroke-width: 1.5' }, mL);
    s('line', { x1: ma.x(20), x2: ma.x(66), y1: ma.y(om), y2: ma.y(om), class: 's-ok', style: 'stroke-width: 2' }, mL);
    s('text', { x: ma.x(66) + 6, y: ma.y(tm) - 4, class: 't-muted t-sm' }, mL, 'true mean');
    s('text', { x: ma.x(66) + 6, y: ma.y(om) + 12, class: 't-ok t-sm t-bold' }, mL, 'observed');
    AGE.forEach((a, i) => {
      const miss = m.miss(i), y = 24 + i * SH;
      if (miss) s('circle', { cx: ma.x(a), cy: ma.y(INC[i]), r: 5.5, class: 's-sec dash', style: 'stroke-width: 1.6' }, mL);
      else s('circle', { cx: ma.x(a), cy: ma.y(INC[i]), r: 5, class: 'f-pri' }, mL);
      s('rect', { x: SX, y, width: SW, height: SH, class: (miss ? 'f-seg' : 'f-pri-soft') + ' sep' }, mL);
      s('text', { x: SX + SW / 2, y: y + SH / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-sm ' + (miss ? 't-sec t-bold' : 't-fg') }, mL, miss ? 'NaN' : String(INC[i]));
      s('text', { x: SX - 6, y: y + SH / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, mL, String(a));
    });
    const lost = INC.length - obs.length, omS = om.toFixed(1), tmS = tm.toFixed(1);
    role('mech-note').textContent = [
      `MCAR: ${lost} incomes are lost at random, like a sensor that briefly went offline. The gaps follow no pattern in age or income, so the ${obs.length} answers left are a fair sample. Their mean is ${omS}; the true mean is ${tmS}.`,
      `MAR: everyone aged 55 or more skipped the question, like older respondents who skip income questions. The gaps depend on age, a column we can see, so a method that uses age (KNN or the iterative imputer) can fill them. Mean of the rest ${omS}, true mean ${tmS}.`,
      `MNAR: everyone earning 62k or more hid it, like high earners who hide their income. The gaps depend on the hidden value itself. The ${obs.length} incomes left average ${omS} instead of ${tmS}, and no other column shows the bias. This is the hardest case.`,
    ][k];
  });

  // Figure 2: one small table, five ways to fill it
  const A2 = [23, 27, 31, 36, 42, 48, 55], I2 = [28, 35, null, 47, 55, null, 95];
  const C2 = ['Tashkent', 'Samarkand', 'Tashkent', 'Bukhara', null, 'Samarkand', 'Tashkent'];
  const KN = I2.map((v, i) => i).filter(i => I2[i] != null);
  const OBS = KN.map(i => I2[i]);
  const MEAN = mean(OBS), MED = OBS.slice().sort((a, b) => a - b)[Math.floor(OBS.length / 2)];
  const cities = C2.filter(c => c);
  const MODE = cities.slice().sort((a, b) => cities.filter(c => c === b).length - cities.filter(c => c === a).length)[0];
  const knn = i => {
    const nb = KN.slice().sort((a, b) => Math.abs(A2[a] - A2[i]) - Math.abs(A2[b] - A2[i])).slice(0, 2);
    return { nb, v: mean(nb.map(j => I2[j])) };
  };
  const ma2 = mean(KN.map(i => A2[i]));
  const SLOPE = KN.reduce((p, i) => p + (A2[i] - ma2) * (I2[i] - MEAN), 0) / KN.reduce((p, i) => p + (A2[i] - ma2) ** 2, 0);
  const ICPT = MEAN - SLOPE * ma2;
  const reg = a => ICPT + SLOPE * a;
  const GAPS = [2, 5];
  const METHODS = [
    { key: 'all' },
    { key: 'drop' },
    { key: 'mean', inc: () => MEAN, txt: v => String(v) },
    { key: 'median', inc: () => MED, txt: v => String(v) },
    { key: 'mode', city: MODE },
    { key: 'knn', inc: i => knn(i).v, txt: v => String(v) },
    { key: 'iter', inc: i => reg(A2[i]), txt: v => v.toFixed(1) },
  ];
  const ig = svg(viz('imp'), 620, 270, { label: 'Age against income for the small table, with the values each imputation method puts into the two missing incomes', minWidth: 500 });
  const ia = axes(ig, { x: 56, y: 20, w: 480, h: 200, xd: [20, 60], yd: [20, 100], xt: [20, 30, 40, 50, 60], yt: [20, 40, 60, 80, 100], xl: 'age', yl: 'income (k$)' });
  GAPS.forEach(i => {
    s('line', { x1: ia.x(A2[i]), x2: ia.x(A2[i]), y1: ia.y(20), y2: ia.y(100), class: 's-muted dash', style: 'stroke-width: 1' }, ig);
    s('text', { x: ia.x(A2[i]) + 5, y: ia.y(20) - 6, class: 't-muted t-sm halo' }, ig, `row ${i + 1}: NaN`);
  });
  const iL = s('g', {}, ig);
  const ptsL = s('g', {}, ig);
  const diamond = (g, x, y, cls) => s('path', { d: `M${x} ${y - 6.5} L${x + 6.5} ${y} L${x} ${y + 6.5} L${x - 6.5} ${y} Z`, class: cls }, g);
  const IMP_NOTES = {
    all: 'The two income gaps, at age 31 and 48, filled by each numeric method. Mean and median ignore age and give both people the same income. KNN and the iterative imputer use age, agree with each other, and follow the rise of income with age.',
    drop: 'dropna() removes every row that has a NaN: rows 3, 5 and 6. Only 4 of 7 rows are left, and row 5 is lost although only its city was missing. Dropping every row with a NaN is the common mistake of slide 36.',
    mean: `Mean of the 5 observed incomes: (28 + 35 + 47 + 55 + 95) / 5 = ${MEAN}. Both gaps get ${MEAN}. The high income 95 pulls the mean up.`,
    median: `Median of 28, 35, 47, 55, 95 is ${MED}. Both gaps get ${MED}. The median does not move when 95 grows.`,
    mode: `City is categorical, so use the mode, the most frequent value: Tashkent 3 times, Samarkand 2, Bukhara 1. Row 5 gets ${MODE}. City is not on the plot.`,
    knn: `KNNImputer with k = 2 averages the two rows closest in age that have an income. Age 31: ages 27 and 36, (35 + 47) / 2 = ${knn(2).v}. Age 48: ages 42 and 55, (55 + 95) / 2 = ${knn(5).v}.`,
    iter: `IterativeImputer predicts the missing column from the other columns. With age as the only other column this is one regression line, income = ${ICPT.toFixed(2).replace('-', '−')} + ${SLOPE.toFixed(3)} · age, which gives ${reg(31).toFixed(1)} at age 31 and ${reg(48).toFixed(1)} at age 48.`,
  };
  steps(viz('imp-steps'), ['All', 'Drop', 'Mean', 'Median', 'Mode', 'KNN, k = 2', 'Iterative'], k => {
    const m = METHODS[k];
    iL.textContent = '';
    ptsL.textContent = '';
    KN.forEach(i => s('circle', { cx: ia.x(A2[i]), cy: ia.y(I2[i]), r: 5, class: 'f-pri' }, ptsL));
    if (m.key === 'all') {
      [[2, 'end', -9], [5, 'start', 9]].forEach(([i, anchor, dx]) => {
        const x = ia.x(A2[i]), kv = knn(i).v, rv = reg(A2[i]);
        diamond(iL, x, ia.y(MEAN), 'f-sec');
        diamond(iL, x, ia.y(MED), 'f-sec');
        diamond(iL, x, ia.y(kv), 'f-ter');
        s('text', { x: x + dx, y: ia.y(MEAN), dy: '0.35em', 'text-anchor': anchor, class: 't-sec t-sm halo' }, iL, `mean ${MEAN}`);
        s('text', { x: x + dx, y: ia.y(MED) + 3, dy: '0.35em', 'text-anchor': anchor, class: 't-sec t-sm halo' }, iL, `median ${MED}`);
        s('text', { x: x + dx, y: ia.y(kv), dy: '0.35em', 'text-anchor': anchor, class: 't-ter t-sm t-bold halo' }, iL, `KNN ${kv}, iter. ${rv.toFixed(1)}`);
      });
    } else if (m.key === 'drop') {
      const x = ia.x(42), y = ia.y(55);
      s('path', { d: `M${x - 8} ${y - 8} L${x + 8} ${y + 8} M${x - 8} ${y + 8} L${x + 8} ${y - 8}`, class: 's-bad', style: 'stroke-width: 2.5' }, iL);
      s('text', { x: x + 12, y: y + 16, class: 't-bad t-sm t-bold halo' }, iL, 'row 5 dropped (city NaN)');
      GAPS.forEach(i => s('text', { x: ia.x(A2[i]) + 6, y: ia.y(60), class: 't-bad t-sm t-bold halo' }, iL, `row ${i + 1} dropped`));
    } else if (m.key === 'mean' || m.key === 'median') {
      const v = m.inc();
      s('line', { x1: ia.x(20), x2: ia.x(60), y1: ia.y(v), y2: ia.y(v), class: 's-sec dash', style: 'stroke-width: 1.5' }, iL);
      s('text', { x: ia.x(59.5), y: ia.y(v) - 6, 'text-anchor': 'end', class: 't-sec t-bold halo' }, iL, `${m.key} = ${v}, whatever the age`);
      GAPS.forEach(i => diamond(iL, ia.x(A2[i]), ia.y(v), 'f-sec'));
    } else if (m.key === 'knn') {
      GAPS.forEach(i => {
        const r = knn(i);
        r.nb.forEach(j => s('line', { x1: ia.x(A2[i]), y1: ia.y(r.v), x2: ia.x(A2[j]), y2: ia.y(I2[j]), class: 's-ter dash', style: 'stroke-width: 1.5' }, iL));
        diamond(iL, ia.x(A2[i]), ia.y(r.v), 'f-ter');
        s('text', { x: ia.x(A2[i]) - 10, y: ia.y(r.v), dy: '0.35em', 'text-anchor': 'end', class: 't-ter t-bold halo' }, iL, String(r.v));
      });
    } else if (m.key === 'iter') {
      const a0 = (20 - ICPT) / SLOPE;
      line(iL, [[ia.x(a0), ia.y(20)], [ia.x(60), ia.y(reg(60))]], 's-ter').setAttribute('style', 'stroke-width: 1.5');
      s('text', { x: ia.x(57.5), y: ia.y(reg(57.5)) + 18, 'text-anchor': 'end', class: 't-ter t-sm halo' }, iL, 'regression of income on age');
      GAPS.forEach(i => {
        diamond(iL, ia.x(A2[i]), ia.y(reg(A2[i])), 'f-ter');
        s('text', { x: ia.x(A2[i]) - 10, y: ia.y(reg(A2[i])), dy: '0.35em', 'text-anchor': 'end', class: 't-ter t-bold halo' }, iL, reg(A2[i]).toFixed(1));
      });
    } else {
      s('text', { x: ia.x(21), y: ia.y(96), class: 't-muted t-sm' }, iL, 'Mode fills the City column; see the table');
    }
    const host = viz('imp-table');
    host.textContent = '';
    const nan = { text: 'NaN', cls: 'l' };
    const rows = A2.map((a, i) => {
      if (m.key === 'drop' && (I2[i] == null || C2[i] == null)) return [String(i + 1), 'dropped', '', ''].map(t => ({ text: t, cls: 'l' }));
      const inc = I2[i] != null ? { text: String(I2[i]), cls: 'l' } : m.inc ? { text: m.txt(m.inc(i)), cls: 'l hl' } : nan;
      const city = C2[i] != null ? { text: C2[i], cls: 'l' } : m.city ? { text: m.city, cls: 'l hl' } : nan;
      return [{ text: String(i + 1), cls: 'l' }, { text: String(a), cls: 'l' }, inc, city];
    });
    const tb = table(host, ['Row', 'Age', 'Income (k$)', 'City'].map(t => ({ text: t, cls: 'l' })), rows);
    if (m.key === 'drop') tb.rows.forEach((tr, i) => { if (I2[i] == null || C2[i] == null) tr.setAttribute('style', 'opacity: 0.45'); });
    role('imp-note').textContent = IMP_NOTES[m.key];
  });

  // Figure 3: IQR fences and Z-score fences on one number line
  const D = [2, 4, 4, 5, 6, 7, 8, 8, 30];
  const sd = a => { const mu = mean(a); return Math.sqrt(a.reduce((p, v) => p + (v - mu) ** 2, 0) / a.length); };
  const og = svg(viz('out'), 680, 280, { label: 'Number line with the nine values, the IQR box and fences at minus 2 and 14, and the Z-score fences at mu plus or minus 3 sigma with a z scale', minWidth: 540 });
  const vx = v => 40 + (v + 20) * 610 / 56;
  const R1 = 62, R2 = 168, AXY = 246;
  const dots = (g, y, flag) => {
    const seen = {};
    D.forEach(v => {
      const k = seen[v] = (seen[v] || 0) + 1, dup = D.filter(x => x === v).length > 1;
      s('circle', { cx: vx(v), cy: y + (dup ? (k === 1 ? -5 : 5) : 0), r: 4.5, class: flag(v) ? 'f-bad' : 'f-pri' }, g);
    });
  };
  s('text', { x: 0, y: 16, class: 't-fg t-bold' }, og, 'IQR rule');
  s('rect', { x: 40, y: R1 - 20, width: vx(-2) - 40, height: 40, class: 'f-bad-soft' }, og);
  s('rect', { x: vx(14), y: R1 - 20, width: vx(36) - vx(14), height: 40, class: 'f-bad-soft' }, og);
  s('rect', { x: vx(4), y: R1 - 13, width: vx(8) - vx(4), height: 26, class: 'f-pri-soft' }, og);
  s('line', { x1: vx(6), x2: vx(6), y1: R1 - 13, y2: R1 + 13, class: 's-pri', style: 'stroke-width: 1.5' }, og);
  s('line', { x1: vx(-2), x2: vx(14), y1: R1, y2: R1, class: 's-muted', style: 'stroke-width: 1' }, og);
  [-2, 14].forEach(v => s('line', { x1: vx(v), x2: vx(v), y1: R1 - 20, y2: R1 + 20, class: 's-ok' }, og));
  s('text', { x: vx(-2), y: R1 - 26, 'text-anchor': 'middle', class: 't-ok t-sm t-bold' }, og, 'Q1 − 1.5·IQR = −2');
  s('text', { x: vx(14), y: R1 - 26, 'text-anchor': 'middle', class: 't-ok t-sm t-bold' }, og, 'Q3 + 1.5·IQR = 14');
  s('text', { x: vx(4) - 4, y: R1 + 30, 'text-anchor': 'end', class: 't-pri t-sm' }, og, 'Q1 = 4');
  s('text', { x: vx(8) + 4, y: R1 + 30, class: 't-pri t-sm' }, og, 'Q3 = 8');
  s('text', { x: vx(30), y: R1 - 26, 'text-anchor': 'middle', class: 't-bad t-sm t-bold' }, og, '30 > 14: outlier');
  dots(og, R1, v => v > 14);
  s('text', { x: 0, y: 120, class: 't-fg t-bold' }, og, 'Z-score rule');
  const zL = s('g', {}, og);
  s('line', { x1: vx(-20), x2: vx(36), y1: AXY, y2: AXY, class: 'l-axis' }, og);
  [-20, -10, 0, 10, 20, 30].forEach(v => {
    s('line', { x1: vx(v), x2: vx(v), y1: AXY, y2: AXY + 5, class: 'l-axis' }, og);
    s('text', { x: vx(v), y: AXY + 18, 'text-anchor': 'middle' }, og, String(v).replace('-', '−'));
  });
  s('text', { x: vx(36), y: AXY - 8, 'text-anchor': 'end', class: 't-sm' }, og, 'data value');
  steps(viz('out-steps'), ['Both rules', 'Z-score without 30'], k => {
    zL.textContent = '';
    const data = k ? D.slice(0, -1) : D, mu = mean(data), sg = sd(data);
    const lo = mu - 3 * sg, hi = mu + 3 * sg, z30 = (30 - mu) / sg;
    s('rect', { x: 40, y: R2 - 20, width: Math.max(0, vx(lo) - 40), height: 40, class: 'f-bad-soft' }, zL);
    s('rect', { x: vx(hi), y: R2 - 20, width: vx(36) - vx(hi), height: 40, class: 'f-bad-soft' }, zL);
    s('line', { x1: vx(lo), x2: vx(hi), y1: R2, y2: R2, class: 's-muted', style: 'stroke-width: 1' }, zL);
    [lo, hi].forEach(v => s('line', { x1: vx(v), x2: vx(v), y1: R2 - 20, y2: R2 + 20, class: 's-ok' }, zL));
    s('line', { x1: vx(mu), x2: vx(mu), y1: R2 - 16, y2: R2 + 16, class: 's-pri', style: 'stroke-width: 1.5' }, zL);
    const f2 = v => v.toFixed(2).replace('-', '−');
    s('text', { x: vx(lo) + (k ? -4 : 0), y: R2 - 26, 'text-anchor': k ? 'end' : 'middle', class: 't-ok t-sm t-bold' }, zL, `μ − 3σ = ${f2(lo)}`);
    s('text', { x: vx(hi) + (k ? 4 : 0), y: R2 - 26, 'text-anchor': k ? 'start' : 'middle', class: 't-ok t-sm t-bold' }, zL, `μ + 3σ = ${f2(hi)}`);
    dots(zL, R2, v => Math.abs((v - mu) / sg) > 3);
    for (let z = -3; z <= 3; z++) {
      const x = vx(mu + z * sg);
      s('line', { x1: x, x2: x, y1: R2 + 24, y2: R2 + 29, class: 'l-axis' }, zL);
      s('text', { x, y: R2 + 40, 'text-anchor': 'middle', class: 't-sm' }, zL, String(z).replace('-', '−'));
    }
    s('line', { x1: vx(lo), x2: vx(hi), y1: R2 + 24, y2: R2 + 24, class: 'l-axis' }, zL);
    s('text', { x: vx(lo) - 8, y: R2 + 28, 'text-anchor': 'end', class: 't-sm t-bold' }, zL, 'z');
    s('text', { x: vx(30), y: R2 + (k ? 40 : 56), 'text-anchor': 'middle', class: (k ? 't-bad' : 't-pri') + ' t-sm t-bold' }, zL, `z(30) = ${z30.toFixed(2)}`);
    role('out-note').textContent = k
      ? `Without 30 the other eight values give μ = ${mu.toFixed(2)} and σ = ${sg.toFixed(2)}. The fences shrink to [${f2(lo)}, ${f2(hi)}] and 30 gets z = ${z30.toFixed(2)}, far beyond 3. With 30 included it hid itself: it raised μ to 8.22 and σ to 7.93. This is masking.`
      : `IQR: the fences [−2, 14] come from Q1 and Q3, so 30 lies outside and is an outlier. Z-score: μ = ${mu.toFixed(2)}, σ = ${sg.toFixed(2)}, so the fences are μ ± 3σ = [${f2(lo)}, ${f2(hi)}]. 30 lies inside at z = ${z30.toFixed(2)} and is not flagged.`;
  });
});

QV.register('s3-w4', function (q) {
  const { s, svg, axes, steps, table, box, line } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const neg = v => String(v).replace('-', '−');
  const X = [1, 2, 4], Y = [3, 5, 9], M = 3, AL = 0.05;
  const J = t => X.reduce((a, x, i) => a + (t[0] + t[1] * x - Y[i]) ** 2, 0) / (2 * M);
  const step = t => {
    const e = X.map((x, i) => t[0] + t[1] * x - Y[i]);
    return [t[0] - AL * e.reduce((p, v) => p + v, 0) / M, t[1] - AL * e.reduce((p, v, i) => p + v * X[i], 0) / M];
  };

  table(viz('given'), ['i', 'x', 'y'], X.map((x, i) => [String(i + 1), String(x), String(Y[i])]));

  // Figure 1: Xᵀ(h − y) row by row
  const E0 = Y.map(y => -y);
  const G = [E0.reduce((a, v) => a + v, 0), E0.reduce((a, v, i) => a + v * X[i], 0)];
  const SG = G.map(g => AL * g / M);
  const gr = svg(viz('grad'), 700, 196, { label: 'X transpose times the error vector gives the gradient minus 17 and minus 49; times alpha over m gives the step; the new theta is 0.2833 and 0.8167', minWidth: 560 });
  const C = 38;
  const cellBox = (g, x, y, w, txt, cls, tc) => box(g, x, y, w, C - 2, txt, { cls, textCls: tc || 't-fg', rx: 3 });
  const XTY = 58, EY = 39, gL = s('g', {}, gr);
  s('text', { x: 40, y: 22, class: 't-fg t-bold' }, gr, 'Xᵀ');
  s('text', { x: 176, y: 22, class: 't-fg t-bold' }, gr, 'h − y');
  s('text', { x: 250, y: 22, class: 't-fg t-bold' }, gr, 'Xᵀ(h − y)');
  s('text', { x: 352, y: 22, class: 't-fg t-bold' }, gr, '× α/m');
  s('text', { x: 444, y: 22, class: 't-fg t-bold' }, gr, 'step');
  s('text', { x: 572, y: 22, class: 't-fg t-bold' }, gr, 'new θ = 0 − step');
  ['θ₀', 'θ₁'].forEach((t, r) => s('text', { x: 32, y: XTY + r * C + C / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, gr, t));
  s('text', { x: 158, y: XTY + C, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, gr, '×');
  s('text', { x: 232, y: XTY + C, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, gr, '=');
  s('text', { x: 352, y: XTY + C, dy: '0.35em', class: 't-fg' }, gr, '× 0.05/3');
  s('text', { x: 548, y: XTY + C, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, gr, '→');
  const note = role('grad-note');
  steps(viz('grad-steps'), ['All', 'θ₀ row', 'θ₁ row'], k => {
    gL.textContent = '';
    [[1, 1, 1], X].forEach((row, r) => row.forEach((v, c) => {
      const on = k === r + 1;
      cellBox(gL, 40 + c * C, XTY + r * C, C - 2, String(v), on ? 'f-pri' : 'f-pri-soft', on ? 't-on t-bold' : 't-fg');
    }));
    E0.forEach((v, r) => cellBox(gL, 176, EY + r * C, 44, neg(v), k ? 'f-sec' : 'f-sec-soft', k ? 't-on t-bold' : 't-fg'));
    G.forEach((v, r) => {
      const on = !k || k === r + 1;
      cellBox(gL, 250, XTY + r * C, 70, neg(v), on ? 'f-seg' : 'f-surface', on ? 't-fg t-bold' : 't-muted');
      cellBox(gL, 444, XTY + r * C, 80, neg(SG[r].toFixed(4)), on ? 'f-seg' : 'f-surface', on ? 't-fg t-bold' : 't-muted');
      cellBox(gL, 572, XTY + r * C, 80, (-SG[r]).toFixed(4), on ? 'f-ok' : 'f-ok-soft', on ? 't-on t-bold' : 't-fg');
    });
    if (k) {
      const r = k - 1;
      const terms = (r ? X : [1, 1, 1]).map((x, i) => `${x}·(${neg(E0[i])})`).join(' + ');
      s('text', { x: 40, y: 176, class: 't-fg t-sm' }, gL, `${['θ₀', 'θ₁'][r]}: ${terms} = ${neg(G[r])}`);
    }
    note.textContent = [
      'Both rows at once: Xᵀ(h − y) = [−17, −49]. Both entries use the same old errors, so θ₀ and θ₁ are updated simultaneously.',
      'Row of 1s: 1·(−3) + 1·(−5) + 1·(−9) = −17. Times α/m = 0.05/3 gives −0.2833. New θ₀ = 0 − (−0.2833) = 0.2833.',
      'Row of x values: 1·(−3) + 2·(−5) + 4·(−9) = −3 − 10 − 36 = −49. Times 0.05/3 gives −0.8167. New θ₁ = 0 − (−0.8167) = 0.8167.',
    ][k];
  });

  // Figure 2: the line after k updates, and the normal-equation line
  const ln = svg(viz('line'), 640, 290, { label: 'The three data points with the current regression line and the errors h minus y as dashed segments, after a chosen number of gradient descent updates or the normal equation', minWidth: 500 });
  const la = axes(ln, { x: 50, y: 20, w: 560, h: 220, xd: [0, 6], yd: [0, 12], xt: [0, 1, 2, 3, 4, 5, 6], yt: [0, 3, 6, 9, 12], xl: 'x', yl: 'y' });
  line(ln, [[la.x(0), la.y(1)], [la.x(5.5), la.y(12)]], 's-ok dash').setAttribute('style', 'stroke-width: 1.5; opacity: 0.6');
  s('text', { x: la.x(3.3), y: la.y(9.8), 'text-anchor': 'end', class: 't-ok t-sm halo' }, ln, 'normal equation: h = 1 + 2x');
  const lL = s('g', {}, ln);
  const ptL = s('g', {}, ln);
  X.forEach((x, i) => s('circle', { cx: la.x(x), cy: la.y(Y[i]), r: 5.5, class: 'f-fg' }, ptL));
  const KS = [0, 1, 2, 3, 10, 100, 500];
  const TH = [[0, 0]];
  for (let i = 1; i <= 500; i++) TH.push(step(TH[i - 1]));
  const jf = v => (v === 0 ? '0' : v < 0.001 ? '< 0.001' : v.toFixed(3));
  const tfm = v => v.toFixed(4).replace(/\.?0+$/, '') || '0';
  steps(viz('line-steps'), ['θ = [0, 0]', '1 step', '2 steps', '3 steps', '10', '100', '500', 'Normal eq.'], k => {
    lL.textContent = '';
    const ne = k === KS.length, t = ne ? [1, 2] : TH[KS[k]];
    const xe = t[1] > 0 ? Math.min(6, (12 - t[0]) / t[1]) : 6;
    line(lL, [[la.x(0), la.y(t[0])], [la.x(xe), la.y(t[0] + t[1] * xe)]], ne ? 's-ok' : 's-pri');
    X.forEach((x, i) => {
      const hv = t[0] + t[1] * x, e = hv - Y[i];
      if (Math.abs(e) > 0.02) {
        s('line', { x1: la.x(x), x2: la.x(x), y1: la.y(Y[i]), y2: la.y(hv), class: 's-sec dash', style: 'stroke-width: 2' }, lL);
        s('text', { x: la.x(x) + 9, y: la.y((hv + Y[i]) / 2), dy: '0.35em', class: 't-sec t-sm t-bold halo' }, lL, neg(e.toFixed(3)));
      }
    });
    if (ne) {
      s('line', { x1: la.x(5), x2: la.x(5), y1: la.y(0), y2: la.y(11), class: 's-ok dash', style: 'stroke-width: 1' }, lL);
      s('circle', { cx: la.x(5), cy: la.y(11), r: 7, class: 's-ok', style: 'stroke-width: 2.5' }, lL);
      s('text', { x: la.x(5) + 12, y: la.y(11) + 4, class: 't-ok t-bold halo' }, lL, 'h(5) = 11');
    }
    const jv = ne ? 0 : J(t);
    role('t0').textContent = ne ? '1' : tfm(t[0]);
    role('t1').textContent = ne ? '2' : tfm(t[1]);
    role('jv').textContent = jf(jv);
    role('line-note').textContent = ne
      ? 'The normal equation gives θ = [1, 2] in one step. The line passes through all three points, J = 0, and predicts h(5) = 1 + 2·5 = 11.'
      : k === 0 ? 'Start: θ = [0, 0], so h = 0 for every x. The errors are −3, −5 and −9, and J = 115/6 = 19.167.'
      : k === 1 ? 'After one update θ = [0.2833, 0.8167]. The errors shrink to −1.900, −3.083 and −5.450, and J = 42.819/6 = 7.137.'
      : k <= 3 ? `After ${KS[k]} updates θ = [${t[0].toFixed(4)}, ${t[1].toFixed(4)}] and J = ${J(t).toFixed(3)}. Each step removes a large part of the remaining loss.`
      : k === 4 ? `After 10 updates J = ${J(t).toFixed(4)} and the line is almost on the points. θ₁ = ${t[1].toFixed(3)} has overshot 2, and θ₀ = ${t[0].toFixed(3)} is still far from 1.`
      : `After ${KS[k]} updates θ = [${t[0].toFixed(4)}, ${t[1].toFixed(4)}]. The last part of the way is slow: θ₀ creeps towards 1 by a tiny amount per step.`;
  }, 1);

  // Figure 3: the normal equation as one matrix chain
  const nq = svg(viz('ne'), 700, 200, { label: 'Normal equation chain: X transpose X, its inverse one fourteenth times 21, minus 7, minus 7, 3, times X transpose y 17 and 49, gives theta 1 and 2', minWidth: 540 });
  const W = 46, Y0 = 56;
  const cell2 = (x, y, top, sub, cls, tc) => {
    s('rect', { x, y, width: W - 3, height: W - 3, rx: 3, class: (cls || 'f-surface') + ' box' }, nq);
    s('text', { x: x + (W - 3) / 2, y: y + (sub ? 17 : 21), dy: '0.35em', 'text-anchor': 'middle', class: (tc || 't-fg') + ' t-bold' }, nq, top);
    if (sub) s('text', { x: x + (W - 3) / 2, y: y + 33, dy: '0.35em', 'text-anchor': 'middle', class: 't-sm ' + (tc || 't-muted') }, nq, sub);
  };
  s('text', { x: 20, y: 40, class: 't-fg t-bold' }, nq, 'XᵀX');
  [[3, 7], [7, 21]].forEach((r, i) => r.forEach((v, j) => cell2(20 + j * W, Y0 + i * W, String(v), [['m', 'Σx'], ['Σx', 'Σx²']][i][j])));
  s('text', { x: 20, y: Y0 + 2 * W + 18, class: 't-sm' }, nq, 'det = 63 − 49 = 14');
  s('text', { x: 134, y: Y0 + W, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg' }, nq, '→');
  s('text', { x: 158, y: 40, class: 't-fg t-bold' }, nq, '(XᵀX)⁻¹');
  s('text', { x: 158, y: Y0 + W, dy: '0.35em', class: 't-fg' }, nq, '1/14 ×');
  [[21, -7], [-7, 3]].forEach((r, i) => r.forEach((v, j) => cell2(206 + j * W, Y0 + i * W, neg(v), null, i === j ? 'f-pri-soft' : 'f-sec-soft')));
  s('text', { x: 158, y: Y0 + 2 * W + 18, class: 't-sm' }, nq, 'swap diagonal, negate the rest');
  s('text', { x: 316, y: Y0 + W, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, nq, '×');
  s('text', { x: 336, y: 40, class: 't-fg t-bold' }, nq, 'Xᵀy');
  [[17, 'Σy'], [49, 'Σxy']].forEach(([v, sub], i) => cell2(336, Y0 + i * W, String(v), sub));
  s('text', { x: 400, y: Y0 + W, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, nq, '=');
  s('text', { x: 418, y: Y0 + W, dy: '0.35em', class: 't-fg' }, nq, '1/14 ×');
  s('text', { x: 466, y: 40, class: 't-fg t-bold' }, nq, 'product');
  [14, 28].forEach((v, i) => cell2(466, Y0 + i * W, String(v)));
  s('text', { x: 466, y: Y0 + 2 * W + 18, class: 't-sm' }, nq, '21·17 − 7·49, −7·17 + 3·49');
  s('text', { x: 530, y: Y0 + W, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, nq, '=');
  s('text', { x: 550, y: 40, class: 't-ok t-bold' }, nq, 'θ');
  [[1, 'θ₀'], [2, 'θ₁']].forEach(([v, sub], i) => cell2(550, Y0 + i * W, String(v), sub, 'f-ok', 't-on'));
  s('text', { x: 606, y: Y0 + W - 8, class: 't-ok t-bold' }, nq, 'h = 1 + 2x');
  s('text', { x: 606, y: Y0 + W + 10, class: 't-ok t-sm' }, nq, 'h(5) = 11');
});

QV.register('s3-w5', function (q) {
  const { s, svg, axes, steps, table, box, line } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const P = [['P1', 4, 0, 'A'], ['P2', 3, 0, 'A'], ['P3', 6, 0, 'A'], ['P4', 4, 4, 'A'], ['P5', 3, 1, 'B'], ['P6', 0, 5, 'B'], ['P7', 1, 5, 'B'], ['P8', 7, 6, 'B']];
  const QX = 3, QY = 3;
  const PTS = P.map(([n, x, y, c]) => ({ n, x, y, c, sq: (x - QX) ** 2 + (y - QY) ** 2, man: Math.abs(x - QX) + Math.abs(y - QY) }));
  PTS.forEach(p => { p.eu = Math.sqrt(p.sq); });
  const RANK = PTS.slice().sort((a, b) => a.eu - b.eu);
  RANK.forEach((p, i) => { p.rank = i + 1; });
  const MAN = PTS.slice().sort((a, b) => a.man - b.man || a.eu - b.eu);
  const LAB = { P1: [0, 24, 'middle'], P2: [0, 24, 'middle'], P3: [0, 24, 'middle'], P4: [14, 4, 'start'], P5: [14, 4, 'start'], P6: [0, -16, 'middle'], P7: [0, -16, 'middle'], P8: [-14, 4, 'end'] };

  table(viz('given'), ['Point', 'x1', 'x2', 'Class'], P.map(r => r.map(String)));
  const rk = table(viz('rank'), [{ text: 'Point', cls: 'l' }, { text: 'Class', cls: 'l' }, 'Euclidean', 'Rank', 'Manhattan'],
    RANK.map(p => [{ text: `${p.n} (${p.x}, ${p.y})`, cls: 'l' }, { text: p.c, cls: 'l' }, `√${p.sq} = ${p.eu.toFixed(3)}`, { text: String(p.rank), cls: 'hl' }, String(p.man)]));

  const frame = (host, label) => {
    const g = svg(host, 640, 360, { label, minWidth: 520 });
    const a = axes(g, { x: 46, y: 16, w: 320, h: 300, xd: [-0.5, 7.5], yd: [-1, 6.5], xt: [0, 1, 2, 3, 4, 5, 6, 7], yt: [0, 1, 2, 3, 4, 5, 6], xl: 'x1', yl: 'x2' });
    return { g, a, u: a.x(1) - a.x(0) };
  };
  const drawPts = (g, a, ringed) => {
    PTS.forEach(p => {
      const x = a.x(p.x), y = a.y(p.y);
      if (ringed && ringed.includes(p)) s('circle', { cx: x, cy: y, r: 15, class: 's-fg', style: 'stroke-width: 2' }, g);
      if (p.c === 'A') s('circle', { cx: x, cy: y, r: 10, class: 'f-pri' }, g);
      else s('rect', { x: x - 9.5, y: y - 9.5, width: 19, height: 19, rx: 2, class: 'f-sec' }, g);
      s('text', { x, y, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-sm t-bold' }, g, String(p.rank));
      const [dx, dy, anchor] = LAB[p.n];
      s('text', { x: x + dx, y: y + dy, 'text-anchor': anchor, class: 't-fg t-sm halo' }, g, p.n);
    });
    const qx = a.x(QX), qy = a.y(QY);
    s('circle', { cx: qx, cy: qy, r: 7, class: 'f-surface s-fg', style: 'stroke-width: 2' }, g);
    s('path', { d: `M${qx - 4} ${qy} L${qx + 4} ${qy} M${qx} ${qy - 4} L${qx} ${qy + 4}`, class: 's-fg' }, g);
    s('text', { x: qx + 12, y: qy + 20, class: 't-fg t-bold halo' }, g, 'Q (3, 3)');
  };
  const vote = (g, x0, y0, list, title) => {
    s('text', { x: x0, y: y0, class: 't-fg t-bold' }, g, title);
    list.forEach((p, i) => box(g, x0, y0 + 10 + i * 32, 210, 26, `${p.n}  class ${p.c}  d = ${p.d}`, { cls: p.c === 'A' ? 'f-pri-soft' : 'f-sec-soft', textCls: 't-fg', rx: 4 }));
    const na = list.filter(p => p.c === 'A').length, nb = list.length - na, win = na > nb ? 'A' : 'B';
    const ty = y0 + 10 + list.length * 32 + 18;
    s('text', { x: x0, y: ty, class: 't-fg' }, g, `votes: A ${na}, B ${nb}`);
    s('text', { x: x0, y: ty + 24, class: (win === 'A' ? 't-pri' : 't-sec') + ' t-bold t-xl' }, g, `→ class ${win}`);
  };

  // Figure 1: the k-circle around Q
  const f1 = frame(viz('knn'), 'Scatter of the eight training points with ranks, the query Q at 3,3 and a circle through the k-th nearest point');
  const cL = s('g', {}, f1.g);
  const pL = s('g', {}, f1.g);
  const vL = s('g', {}, f1.g);
  const KS = [1, 3, 5];
  steps(viz('k-steps'), KS.map(k => 'k = ' + k), i => {
    const k = KS[i], nb = RANK.slice(0, k), r = RANK[k - 1].eu;
    cL.textContent = ''; pL.textContent = ''; vL.textContent = '';
    s('circle', { cx: f1.a.x(QX), cy: f1.a.y(QY), r: r * f1.u, class: 'area-pri' }, cL);
    s('circle', { cx: f1.a.x(QX), cy: f1.a.y(QY), r: r * f1.u, class: 's-muted dash', style: 'stroke-width: 1.5' }, cL);
    nb.forEach(p => s('line', { x1: f1.a.x(QX), y1: f1.a.y(QY), x2: f1.a.x(p.x), y2: f1.a.y(p.y), class: 's-muted', style: 'stroke-width: 1' }, cL));
    drawPts(pL, f1.a, nb);
    vote(vL, 410, 30, nb.map(p => ({ n: p.n, c: p.c, d: p.eu.toFixed(3) })), `k = ${k}: the ${k} nearest`);
    rk.rows.forEach((tr, j) => tr.classList.toggle('on', j < k));
    role('k-note').textContent = [
      'k = 1: only the nearest point votes. P4 (class A) is √2 = 1.414 away, so Q is A.',
      'k = 3: the circle grows to radius √8 = 2.828 and takes in P5 and P7, both class B. B wins 2 to 1, so the prediction flips to B.',
      'k = 5: radius √10 = 3.162 adds P2 and P1, both class A. A wins 3 to 2, so Q is A again. The answer depends on k.',
    ][i];
  }, 1);

  // Figure 2: Euclidean circle vs Manhattan diamond for k = 3
  const f2 = frame(viz('metric'), 'The same points with the Euclidean k = 3 circle of radius 2.83 and the Manhattan k = 3 diamond of radius 3, and grid paths from Q to P7 and P2');
  const mL = s('g', {}, f2.g);
  const qpx = f2.a.x(QX), qpy = f2.a.y(QY), u = f2.u;
  const EU3 = RANK.slice(0, 3), MA3 = MAN.slice(0, 3);
  steps(viz('metric-steps'), ['Both', 'Euclidean, k = 3', 'Manhattan, k = 3'], k => {
    mL.textContent = '';
    const showE = k !== 2, showM = k !== 1;
    if (showE) {
      s('circle', { cx: qpx, cy: qpy, r: Math.sqrt(8) * u, class: 's-fg', style: 'stroke-width: 2' }, mL);
      s('text', { x: qpx + 2.05 * u, y: qpy - 2.05 * u - 4, class: 't-fg t-sm t-bold halo' }, mL, 'Euclidean d = 2.83');
      line(mL, [[qpx, qpy], [f2.a.x(1), f2.a.y(5)]], 's-fg dash').setAttribute('style', 'stroke-width: 1.5');
      s('text', { x: f2.a.x(2) + 8, y: f2.a.y(4) - 2, class: 't-fg t-sm halo' }, mL, '2.83');
    }
    if (showM) {
      s('path', { d: `M${qpx - 3 * u} ${qpy} L${qpx} ${qpy - 3 * u} L${qpx + 3 * u} ${qpy} L${qpx} ${qpy + 3 * u} Z`, class: 's-ter' }, mL);
      s('text', { x: qpx + 92, y: qpy + 100, class: 't-ter t-sm t-bold halo' }, mL, 'Manhattan d = 3');
      s('path', { d: `M${qpx} ${qpy} L${f2.a.x(1)} ${qpy} L${f2.a.x(1)} ${f2.a.y(5)}`, class: 's-ter', style: 'stroke-width: 3' }, mL);
      s('text', { x: f2.a.x(2), y: qpy + 16, 'text-anchor': 'middle', class: 't-ter t-sm t-bold halo' }, mL, '2 + 2 = 4');
    }
    drawPts(mL, f2.a, k === 1 ? EU3 : k === 2 ? MA3 : null);
    if (k !== 2) vote(mL, 410, 30, EU3.map(p => ({ n: p.n, c: p.c, d: p.eu.toFixed(2) })), 'Euclidean, k = 3');
    if (k === 2) vote(mL, 410, 30, MA3.map(p => ({ n: p.n, c: p.c, d: String(p.man) })), 'Manhattan, k = 3');
    if (k === 0) {
      s('text', { x: 410, y: 250, class: 't-fg t-bold' }, mL, 'Manhattan, k = 3');
      s('text', { x: 410, y: 272, class: 't-fg t-sm' }, mL, 'P4 A (2), P5 B (2), P2 A (3)');
      s('text', { x: 410, y: 300, class: 't-pri t-bold t-xl' }, mL, '→ class A');
    }
    role('metric-note').textContent = [
      'Euclidean k = 3 takes P4, P5 and P7 (B wins). Manhattan k = 3 takes P4, P5 and P2 (A wins). P7 is 2.83 away in a straight line but 2 + 2 = 4 blocks on the grid. P2 is straight below Q, so both measures give 3.',
      'Euclidean: the circle of radius 2.83 holds P4 (1.41), P5 (2.00) and P7 (2.83). P2 at 3.00 stays outside. Votes A 1, B 2: class B.',
      'Manhattan: the diamond of radius 3 holds P4 (2), P5 (2) and P2 (3). P7 at 4 stays outside. Votes A 2, B 1: class A.',
    ][k];
  });

  // Figure 3: error rate against k
  const KV = [1, 3, 5, 7, 9], EV = [0.30, 0.22, 0.18, 0.17, 0.17];
  const eg = svg(viz('elbow'), 560, 260, { label: 'Error rate against k: 0.30, 0.22, 0.18, 0.17, 0.17, with the elbow at k = 5', minWidth: 460 });
  const ea = axes(eg, { x: 60, y: 22, w: 460, h: 180, xd: [0, 10], yd: [0.1, 0.34], xt: KV, yt: [0.15, 0.2, 0.25, 0.3], yf: v => v.toFixed(2), xl: 'k, number of neighbours', yl: 'error rate' });
  s('rect', { x: ea.x(5), y: ea.y(0.34), width: ea.x(10) - ea.x(5), height: ea.y(0.1) - ea.y(0.34), class: 'area-pri' }, eg);
  s('text', { x: ea.x(7.5), y: ea.y(0.3), 'text-anchor': 'middle', class: 't-pri t-sm t-bold' }, eg, 'almost flat');
  s('text', { x: ea.x(2), y: ea.y(0.13), 'text-anchor': 'middle', class: 't-fg t-sm' }, eg, 'steep drop');
  line(eg, KV.map((k, i) => [ea.x(k), ea.y(EV[i])]), 's-pri');
  KV.forEach((k, i) => {
    s('circle', { cx: ea.x(k), cy: ea.y(EV[i]), r: 5, class: k === 5 ? 'f-ok' : 'f-pri' }, eg);
    s('text', { x: ea.x(k), y: ea.y(EV[i]) - (k === 5 ? 18 : 12), 'text-anchor': 'middle', class: 't-fg t-bold' }, eg, EV[i].toFixed(2));
    if (i) s('text', { x: ea.x(k - 1), y: ea.y((EV[i] + EV[i - 1]) / 2) + 18, 'text-anchor': 'middle', class: 't-muted t-sm' }, eg, (EV[i] - EV[i - 1] ? '−' + (EV[i - 1] - EV[i]).toFixed(2) : '0'));
  });
  s('circle', { cx: ea.x(5), cy: ea.y(0.18), r: 11, class: 's-ok', style: 'stroke-width: 2' }, eg);
  s('text', { x: ea.x(5) - 8, y: ea.y(0.18) + 32, 'text-anchor': 'end', class: 't-ok t-bold' }, eg, 'elbow: k = 5');
});

QV.register('s3-w6', function (q) {
  const { s, svg, axes, plot, steps, table, box } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const R = [
    ['None', 'Yes', 'Cheap', 'No'], ['None', 'No', 'Expensive', 'No'], ['Some', 'Yes', 'Cheap', 'Yes'], ['Some', 'No', 'Expensive', 'Yes'],
    ['Some', 'No', 'Cheap', 'Yes'], ['Full', 'Yes', 'Cheap', 'Yes'], ['Full', 'No', 'Cheap', 'No'], ['Full', 'Yes', 'Expensive', 'Yes'],
    ['Full', 'No', 'Expensive', 'No'], ['None', 'Yes', 'Expensive', 'No'], ['Full', 'Yes', 'Cheap', 'Yes'], ['Some', 'Yes', 'Expensive', 'Yes'],
  ].map((r, i) => ({ id: i + 1, a: r.slice(0, 3), y: r[3] === 'Yes' }));
  const H2 = (p, n) => [p, n].reduce((e, c) => (c ? e - c / (p + n) * Math.log2(c / (p + n)) : e), 0);
  const yes = rows => rows.filter(r => r.y).length;
  const E = rows => H2(yes(rows), rows.length - yes(rows));
  const ATTR = ['Patrons', 'Hungry', 'Price'];
  const VALS = [['None', 'Some', 'Full'], ['Yes', 'No'], ['Cheap', 'Expensive']];
  const split = (rows, a) => VALS[a].map(v => ({ v, rows: rows.filter(r => r.a[a] === v) }));
  const wE = (rows, a) => split(rows, a).reduce((t, c) => t + c.rows.length / rows.length * E(c.rows), 0);
  const IG = (rows, a) => E(rows) - wE(rows, a);
  const f3 = v => v.toFixed(3);

  table(viz('given'), ['#', 'Patrons', 'Hungry', 'Price', 'Wait'].map(t => ({ text: t, cls: 'l' })), R.map(r => [String(r.id)].concat(r.a, [r.y ? 'Yes' : 'No']).map(t => ({ text: t, cls: 'l' }))));

  // Figure 1: binary entropy with the nodes of this question
  const eg = svg(viz('ent'), 600, 290, { label: 'Binary entropy curve against the share of Yes, with the nodes of the restaurant tree marked on it', minWidth: 480 });
  const ea = axes(eg, { x: 56, y: 24, w: 520, h: 200, xd: [0, 1], yd: [0, 1.1], xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 0.25, 0.5, 0.75, 1], xf: v => String(v), yf: v => String(v), xl: 'share of Yes in the node, p₊', yl: 'entropy E' });
  plot(eg, ea, p => H2(p, 1 - p), 0, 1, 200, 's-pri');
  const NODES = [
    { name: 'Root', y: 7, n: 5 }, { name: 'Full', y: 3, n: 2 }, { name: 'Hungry = Yes', y: 5, n: 2 }, { name: 'Hungry = No', y: 2, n: 3 },
    { name: 'Cheap', y: 4, n: 2 }, { name: 'Expensive', y: 3, n: 3 }, { name: 'Pure', y: 4, n: 0 },
  ];
  NODES.slice(0, 6).forEach(nd => s('circle', { cx: ea.x(nd.y / (nd.y + nd.n)), cy: ea.y(H2(nd.y, nd.n)), r: 3.5, class: 'f-muted' }, eg));
  [0, 1].forEach(p => s('circle', { cx: ea.x(p), cy: ea.y(0), r: 3.5, class: 'f-muted' }, eg));
  const eL = s('g', {}, eg);
  const EN = [
    'Root: 7 Yes, 5 No out of 12. E = −(7/12) log₂(7/12) − (5/12) log₂(5/12) = 0.980.',
    'Patrons = Full: 3 Yes, 2 No. E = −(3/5) log₂(3/5) − (2/5) log₂(2/5) = 0.971.',
    'Hungry = Yes: 5 Yes, 2 No. E = −(5/7) log₂(5/7) − (2/7) log₂(2/7) = 0.863.',
    'Hungry = No: 2 Yes, 3 No. E = 0.971, the same as 3/2: entropy only depends on the split, not on which class is larger.',
    'Price = Cheap: 4 Yes, 2 No. E = −(4/6) log₂(4/6) − (2/6) log₂(2/6) = 0.918.',
    'Price = Expensive: 3 Yes, 3 No. A 50/50 node has the maximum entropy, E = 1.',
    'A pure node (None 0/3, Some 4/0) has only one class: E = −1 · log₂ 1 = 0. It becomes a leaf.',
  ];
  steps(viz('ent-steps'), ['Root', 'Full', 'Hungry Yes', 'Hungry No', 'Cheap', 'Expensive', 'Pure'], k => {
    eL.textContent = '';
    const nd = NODES[k];
    const pts = k === 6 ? [[0, 0], [1, 0]] : [[nd.y / (nd.y + nd.n), H2(nd.y, nd.n)]];
    pts.forEach(([p, e]) => {
      const x = ea.x(p), y = ea.y(e);
      if (k !== 6) {
        s('line', { x1: x, x2: x, y1: y, y2: ea.y(0), class: 's-sec dash', style: 'stroke-width: 1' }, eL);
        s('line', { x1: ea.x(0), x2: x, y1: y, y2: y, class: 's-sec dash', style: 'stroke-width: 1' }, eL);
      }
      s('circle', { cx: x, cy: y, r: 6.5, class: 'f-sec' }, eL);
    });
    const lab = k === 6 ? 'None 0/3 and Some 4/0: E = 0' : `${nd.name} ${nd.y}/${nd.n}: p₊ = ${f3(nd.y / (nd.y + nd.n))}, E = ${f3(H2(nd.y, nd.n))}`;
    s('text', { x: 576, y: 14, 'text-anchor': 'end', class: 't-sec t-bold' }, eL, lab);
    role('ent-note').textContent = EN[k];
  });

  // Figure 2: rows sorted into the children of a split
  const FULL = R.filter(r => r.a[0] === 'Full');
  const CASES = [[R, 0], [R, 1], [R, 2], [FULL, 1], [FULL, 2]];
  const ig = svg(viz('ig'), 700, 350, { label: 'A split of the rows into child nodes with their entropies, and bars comparing the information gain of the attributes', minWidth: 560 });
  const iL = s('g', {}, ig);
  const TK = 17, TG = 3;
  const tokens = (g, rows, cx, y) => {
    const w = rows.length * (TK + TG) - TG;
    rows.forEach((r, i) => {
      const x = cx - w / 2 + i * (TK + TG);
      s('rect', { x, y, width: TK, height: TK, rx: 2, class: r.y ? 'f-pri' : 'f-sec' }, g);
      s('text', { x: x + TK / 2, y: y + TK / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-on', style: 'font-size: 9px' }, g, String(r.id));
    });
  };
  const ratio = rows => `${yes(rows)} Yes / ${rows.length - yes(rows)} No`;
  steps(viz('ig-steps'), ['Patrons', 'Hungry', 'Price', 'Full: Hungry', 'Full: Price'], k => {
    iL.textContent = '';
    const [rows, a] = CASES[k], ch = split(rows, a), inFull = k >= 3;
    box(iL, 200, 10, 300, 62, '', { cls: 'f-surface' });
    s('text', { x: 350, y: 28, 'text-anchor': 'middle', class: 't-fg t-bold' }, iL, `${inFull ? 'Full' : 'All rows'}: ${ratio(rows)}, E = ${f3(E(rows))}`);
    tokens(iL, rows, 350, 44);
    const cw = 200, gap = 20, tot = ch.length * cw + (ch.length - 1) * gap, x0 = 350 - tot / 2;
    ch.forEach((c, i) => {
      const x = x0 + i * (cw + gap), cxm = x + cw / 2, pure = E(c.rows) === 0;
      s('line', { x1: 350, y1: 72, x2: cxm, y2: 108, class: 's-muted', style: 'stroke-width: 1.5' }, iL);
      box(iL, x, 108, cw, 92, '', { cls: pure ? 'f-ok-soft' : 'f-surface' });
      s('text', { x: cxm, y: 124, 'text-anchor': 'middle', class: 't-fg t-bold' }, iL, `${ATTR[a]} = ${c.v}`);
      s('text', { x: cxm, y: 140, 'text-anchor': 'middle', class: 't-fg' }, iL, `${ratio(c.rows)}, weight ${c.rows.length}/${rows.length}`);
      tokens(iL, c.rows, cxm, 150);
      s('text', { x: cxm, y: 188, 'text-anchor': 'middle', class: pure ? 't-ok t-bold' : 't-fg t-bold' }, iL, `E = ${f3(E(c.rows))}${pure ? ', pure' : ''}`);
    });
    const group = inFull ? [1, 2] : [0, 1, 2];
    s('text', { x: 20, y: 232, class: 't-fg t-bold' }, iL, `information gain ${inFull ? 'inside Full' : 'at the root'}`);
    group.forEach((b, i) => {
      const y = 244 + i * 28, v = IG(rows, b), on = b === a;
      s('text', { x: 142, y: y + 10, dy: '0.35em', 'text-anchor': 'end', class: on ? 't-fg t-bold' : 't-fg' }, iL, ATTR[b]);
      s('rect', { x: 150, y, width: Math.max(1, v * 480), height: 20, class: on ? 'f-pri' : 'f-pri-soft' }, iL);
      s('text', { x: 156 + v * 480, y: y + 10, dy: '0.35em', class: 't-fg t-bold' }, iL, f3(v));
    });
    const terms = ch.map(c => `${c.rows.length}/${rows.length}·${f3(E(c.rows))}`).join(' + ');
    role('ig-note').textContent = `${inFull ? 'Inside Full (rows 6, 7, 8, 9, 11). ' : ''}${ATTR[a]}: weighted E = ${terms} = ${f3(wE(rows, a))}, so IG = ${f3(E(rows))} − ${f3(wE(rows, a))} = ${f3(IG(rows, a))}.`;
  });

  // Figure 3: the finished tree and the two queries
  const tg = svg(viz('tree'), 640, 300, { label: 'Final tree: Patrons at the root, None leads to No, Some leads to Yes, Full leads to Hungry, which splits into Yes and No leaves', minWidth: 500 });
  const N = {
    root: { x: 320, y: 16, w: 160, t: 'Patrons\nYes 7, No 5' },
    none: { x: 110, y: 126, w: 110, t: 'No\n0/3', leaf: 'no' },
    some: { x: 300, y: 126, w: 110, t: 'Yes\n4/0', leaf: 'yes' },
    hung: { x: 500, y: 126, w: 150, t: 'Hungry\nYes 3, No 2' },
    hy: { x: 420, y: 236, w: 110, t: 'Yes\n3/0', leaf: 'yes' },
    hn: { x: 580, y: 236, w: 110, t: 'No\n0/2', leaf: 'no' },
  };
  const EDGES = [['root', 'none', 'None'], ['root', 'some', 'Some'], ['root', 'hung', 'Full'], ['hung', 'hy', 'Yes'], ['hung', 'hn', 'No']];
  const tL = s('g', {}, tg);
  const PATHS = [[], ['root', 'hung', 'hn'], ['root', 'some']];
  const QLAB = ['', 'query: Patrons = Full, Hungry = No, Price = Cheap', 'query: Patrons = Some, Hungry = No, Price = Expensive'];
  steps(viz('tree-steps'), ['Tree', 'Full, No, Cheap', 'Some, No, Expensive'], k => {
    tL.textContent = '';
    const path = PATHS[k];
    EDGES.forEach(([a, b, lab]) => {
      const A = N[a], B = N[b], on = path.includes(a) && path.includes(b);
      s('line', { x1: A.x, y1: A.y + 44, x2: B.x, y2: B.y, class: on ? 's-pri' : 's-muted', style: on ? 'stroke-width: 3.5' : 'stroke-width: 1.5' }, tL);
      const mx = (A.x + B.x) / 2, my = (A.y + 44 + B.y) / 2;
      s('text', { x: mx + (B.x < A.x ? -8 : B.x > A.x ? 8 : 8), y: my, dy: '0.35em', 'text-anchor': B.x < A.x ? 'end' : 'start', class: (on ? 't-pri t-bold' : 't-fg') + ' halo' }, tL, lab);
    });
    Object.keys(N).forEach(key => {
      const nd = N[key], on = path.includes(key), last = on && path[path.length - 1] === key;
      const cls = nd.leaf ? (last ? (nd.leaf === 'yes' ? 'f-ok' : 'f-bad') : (nd.leaf === 'yes' ? 'f-ok-soft' : 'f-bad-soft')) : on ? 'f-pri-soft' : 'f-surface';
      box(tL, nd.x - nd.w / 2, nd.y, nd.w, 44, nd.t, { cls, textCls: last ? 't-on t-bold' : 't-fg', stroke: on && !last ? 'outline-pri' : 'box', lh: 15 });
    });
    if (k) s('text', { x: 10, y: 290, class: 't-fg t-bold' }, tL, QLAB[k]);
    else s('text', { x: 10, y: 290, class: 't-muted' }, tL, 'Price is never used.');
    role('tree-note').textContent = [
      'None and Some are pure, so they become leaves at once. Full is mixed (3/2) and splits on Hungry into two pure leaves. The tree classifies all 12 rows correctly.',
      'Patrons = Full, so go to the Hungry node. Hungry = No leads to the leaf No (0/2). Price is never asked. Prediction: No.',
      'Patrons = Some leads straight to the leaf Yes (4/0). Hungry and Price are never asked. Prediction: Yes.',
    ][k];
  });
});

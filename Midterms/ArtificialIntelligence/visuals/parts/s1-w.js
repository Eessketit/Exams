QV.register('s1-w1', function (q) {
  const { s, svg, axes, plot, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const XT = [0.8, 1.4, 2.0, 2.8, 3.6], YT = [182, 214, 300, 302, 350];
  const XS = [1.1, 2.4, 3.2], YS = [198, 306, 333];
  const u = x => (x - 2.2) / 1.4;
  const neg = v => String(v).replace('-', '−');
  const f2 = v => neg(v.toFixed(2));
  const solve = (A, b) => {
    const n = b.length, M = A.map((row, i) => row.concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const f = M[r][c] / M[c][c];
        for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
      }
    }
    return M.map((row, i) => row[n] / row[i]);
  };
  // (XᵀX + λL)θ = Xᵀy with L = diag(0, 1, ..., 1), so θ₀ is never penalized
  const fit = (deg, lam) => {
    const F = XT.map(x => Array.from({ length: deg + 1 }, (_, j) => u(x) ** j));
    const A = F[0].map((_, a) => F[0].map((_, b) => F.reduce((t, row) => t + row[a] * row[b], 0) + (a === b && a > 0 ? lam : 0)));
    const rhs = F[0].map((_, a) => F.reduce((t, row, i) => t + row[a] * YT[i], 0));
    return solve(A, rhs);
  };
  const h = (th, x) => th.reduce((a, t, j) => a + t * u(x) ** j, 0);
  const err = (th, xs, ys) => xs.reduce((a, x, i) => a + (h(th, x) - ys[i]) ** 2, 0) / (2 * xs.length);
  const houses = (g, ax, th) => {
    plot(g, ax, x => h(th, x), 0.7, 3.7, 160, 's-pri');
    XS.forEach((x, i) => {
      s('line', { x1: ax.x(x), x2: ax.x(x), y1: ax.y(YS[i]), y2: ax.y(h(th, x)), class: 's-sec dash', style: 'stroke-width: 1.5' }, g);
      s('circle', { cx: ax.x(x), cy: ax.y(YS[i]), r: 4.5, class: 's-sec', style: 'stroke-width: 2' }, g);
    });
    XT.forEach((x, i) => s('circle', { cx: ax.x(x), cy: ax.y(YT[i]), r: 4.5, class: 'f-ter' }, g));
  };

  // Figure 1: degree 1, 2, 4 on the same houses
  const fits = svg(viz('fits'), 780, 296, { label: 'Three fits of house price against size: a straight line underfits, a parabola fits, a degree-4 curve passes through every training house and misses the new houses', minWidth: 560 });
  [
    { deg: 1, eq: 'θ₀ + θ₁x', tag: 'Underfit · high bias', cls: 't-bad' },
    { deg: 2, eq: 'θ₀ + θ₁x + θ₂x²', tag: 'Good fit', cls: 't-ok' },
    { deg: 4, eq: 'θ₀ + θ₁x + … + θ₄x⁴', tag: 'Overfit · high variance', cls: 't-bad' },
  ].forEach((p, i) => {
    const x0 = 52 + i * 258;
    const ax = axes(fits, { x: x0, y: 58, w: 200, h: 150, xd: [0.6, 3.8], yd: [150, 400], xt: [1, 2, 3], yt: [200, 300, 400], xl: 'size (1000 ft²)', yl: i ? null : 'price ($1000)' });
    const th = fit(p.deg, 0);
    houses(fits, ax, th);
    s('text', { x: x0, y: 16, class: 't-fg t-bold' }, fits, p.eq);
    s('text', { x: x0, y: 33, class: p.cls + ' t-bold' }, fits, p.tag);
    s('text', { x: x0, y: 266, class: 't-fg' }, fits, 'train error ' + f2(err(th, XT, YT)));
    s('text', { x: x0, y: 284, class: 't-sec' }, fits, 'test error ' + f2(err(th, XS, YS)));
  });

  // Figure 2: L2 penalty on the degree-4 model
  const LAMS = [0, 0.01, 0.1, 1, 1000];
  const lf = svg(viz('lam'), 720, 290, { label: 'Degree-4 fit for several values of lambda, with a bar chart of the five parameters; theta zero stays near the mean price while the others shrink', minWidth: 560 });
  const la = axes(lf, { x: 56, y: 30, w: 330, h: 200, xd: [0.6, 3.8], yd: [150, 400], xt: [1, 2, 3], yt: [200, 300, 400], xl: 'size (1000 ft²)', yl: 'price ($1000)' });
  const ba = axes(lf, { x: 476, y: 30, w: 220, h: 200, xd: [-0.5, 4.5], yd: [-300, 350], xt: [0, 1, 2, 3, 4], yt: [-200, 0, 200], xf: j => 'θ' + '₀₁₂₃₄'[j], yf: neg, yl: 'parameter value' });
  const ldyn = s('g', {}, lf);
  const short = t => neg(Math.abs(t) < 1 ? t.toFixed(2) : t.toFixed(1));
  const NOTES = [
    'λ = 0, the plain cost. The curve passes through all five houses (train error 0.00) and swings between them, so the new houses are far off (test error 407.44). Overfit, high variance.',
    'λ = 0.01. Even a small penalty shrinks the large parameters: θ₂ goes from −253.4 to −146.2 and θ₄ from 205.6 to 110.7. The swings get smaller and the test error drops to 110.07.',
    'λ = 0.1, the best of these values: test error 65.39. θ₂ and θ₄ are now small, and the curve follows the trend of the data instead of its noise.',
    'λ = 1. The penalty now dominates, so the curve is almost a straight line and misses the bend: train 210.91, test 256.77. Underfit, high bias.',
    'λ = 1000. θ₁ … θ₄ are pushed to about 0. θ₀ is not in the penalty, so it is not pulled to 0: it settles at 269.6, the mean price, and h(x) is a flat line.',
  ];
  steps(viz('lam-steps'), LAMS.map(l => 'λ = ' + l), k => {
    ldyn.textContent = '';
    const th = fit(4, LAMS[k]);
    houses(ldyn, la, th);
    th.forEach((t, j) => {
      const y0 = ba.y(0), y1 = ba.y(t);
      s('rect', { x: ba.x(j) - 13, y: Math.min(y0, y1), width: 26, height: Math.max(1, Math.abs(y1 - y0)), class: j ? 'f-pri' : 'f-seg outline-pri' }, ldyn);
      s('text', { x: ba.x(j), y: t >= 0 ? Math.min(y0, y1) - 5 : Math.max(y0, y1) + 13, 'text-anchor': 'middle', class: 't-sm t-fg' }, ldyn, short(t));
    });
    role('tr').textContent = f2(err(th, XT, YT));
    role('te').textContent = f2(err(th, XS, YS));
    role('t0').textContent = f2(th[0]);
    role('lam-note').textContent = NOTES[k];
  }, 2);
});

QV.register('s1-w2', function (q) {
  const { s, svg, axes, steps, arrow, scale } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const POS = [[4, 4], [5, 3], [6, 5], [5, 6.5], [7, 4], [7.5, 6.5], [3.5, 6.5]];
  const NEG = [[2, 2], [1, 3], [1, 1], [2.5, 0.5], [0.5, 2], [3, 0.5], [0.5, 3]];
  const BOX = [[0, -1.5], [10, -1.5], [10, 7.5], [0, 7.5]];
  const neg = v => String(v).replace('-', '−');
  const fx = (w, b, p) => w[0] * p[0] + w[1] * p[1] + b;
  const half = (w, b, k, sgn) => {
    const out = [];
    BOX.forEach((pa, i) => {
      const pb = BOX[(i + 1) % 4];
      const a = sgn * (fx(w, b, pa) - k), c = sgn * (fx(w, b, pb) - k);
      if (a >= 0) out.push(pa);
      if ((a >= 0) !== (c >= 0)) { const t = a / (a - c); out.push([pa[0] + t * (pb[0] - pa[0]), pa[1] + t * (pb[1] - pa[1])]); }
    });
    return out;
  };
  const seg = (w, b, k) => {
    const pts = [];
    BOX.forEach((pa, i) => {
      const pb = BOX[(i + 1) % 4];
      const a = fx(w, b, pa) - k, c = fx(w, b, pb) - k;
      if (a === 0) pts.push(pa);
      else if (a * c < 0) { const t = a / (a - c); pts.push([pa[0] + t * (pb[0] - pa[0]), pa[1] + t * (pb[1] - pa[1])]); }
    });
    pts.sort((m, n) => m[0] - n[0]);
    return [pts[0], pts[pts.length - 1]];
  };
  const frame = host => {
    const el = svg(host, 430, 392, { label: 'Scatter of the training points in the x1, x2 plane with the SVM hyperplane and margin lines', minWidth: 400 });
    const ax = axes(el, { x: 46, y: 22, w: 360, h: 324, xd: [0, 10], yd: [-1.5, 7.5], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6], grid: false, xl: 'x₁', yl: 'x₂' });
    return { el, ax };
  };
  const poly = (g, ax, pts, cls) => s('polygon', { points: pts.map(p => ax.x(p[0]).toFixed(1) + ',' + ax.y(p[1]).toFixed(1)).join(' '), class: cls }, g);
  // the label sits on the +1 side of its line, near the lower right end
  const drawLine = (g, ax, w, b, k, cls, style, label, tcls) => {
    const [p1, p2] = seg(w, b, k);
    s('line', { x1: ax.x(p1[0]), y1: ax.y(p1[1]), x2: ax.x(p2[0]), y2: ax.y(p2[1]), class: cls, style }, g);
    if (!label) return;
    const sx = ax.x(p2[0]) - ax.x(p1[0]), sy = ax.y(p2[1]) - ax.y(p1[1]), L = Math.hypot(sx, sy);
    const px = ax.x(p2[0]) - sx / L * 14, py = ax.y(p2[1]) - sy / L * 14;
    const ang = Math.atan2(sy, sx) * 180 / Math.PI;
    s('text', { x: px, y: py, dy: '-0.45em', 'text-anchor': 'end', class: tcls + ' halo', transform: `rotate(${ang.toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)})` }, g, label);
  };
  const dot = (g, ax, p, y) => (y > 0
    ? s('circle', { cx: ax.x(p[0]), cy: ax.y(p[1]), r: 5, class: 'f-pri' }, g)
    : s('rect', { x: ax.x(p[0]) - 4.5, y: ax.y(p[1]) - 4.5, width: 9, height: 9, class: 'f-sec' }, g));

  // Figure 1: hard margin, step by step
  const W = [0.5, 0.5], B = -3;
  const { el: hard, ax } = frame(viz('hard'));
  const Lh = s('g', { class: 'fade' }, hard);
  const Lm = s('g', { class: 'fade' }, hard);
  const Lp = s('g', {}, hard);
  const Ls = s('g', { class: 'fade' }, hard);
  const Ld = s('g', { class: 'fade' }, hard);
  poly(Lh, ax, half(W, B, 0, 1), 'area-pri');
  poly(Lh, ax, half(W, B, 0, -1), 'area-sec');
  drawLine(Lh, ax, W, B, 0, 's-fg', 'stroke-width: 2', 'w·x + b = 0', 't-fg t-bold');
  arrow(Lh, ax.x(4.5), ax.y(1.5), ax.x(5.15), ax.y(2.15), { cls: 'a-pri', width: 2 });
  s('text', { x: ax.x(5.15) + 6, y: ax.y(2.15) + 4, class: 't-pri t-bold' }, Lh, 'w');
  drawLine(Lm, ax, W, B, 1, 's-pri dash', 'stroke-width: 1.5', 'w·x + b = +1', 't-pri');
  drawLine(Lm, ax, W, B, -1, 's-sec dash', 'stroke-width: 1.5', 'w·x + b = −1', 't-sec');
  POS.forEach(p => dot(Lp, ax, p, 1));
  NEG.forEach(p => dot(Lp, ax, p, -1));
  [[4, 4], [5, 3], [2, 2], [1, 3]].forEach(p => s('circle', { cx: ax.x(p[0]), cy: ax.y(p[1]), r: 10, class: 's-fg', style: 'stroke-width: 1.5' }, Ls));
  s('text', { x: ax.x(4) + 14, y: ax.y(4) - 10, class: 't-fg t-sm halo' }, Ls, 'support vectors');
  arrow(Ld, ax.x(1) + 7, ax.y(3), ax.x(5) - 8, ax.y(3), { cls: 'a-muted', dash: true });
  s('text', { x: ax.x(3.2), y: ax.y(3) + 17, 'text-anchor': 'middle', class: 't-sm t-fg halo' }, Ld, 'x₁ − x₂ = (4, 0)');
  s('line', { x1: ax.x(3), y1: ax.y(5), x2: ax.x(5), y2: ax.y(3), class: 's-ok dash', style: 'stroke-width: 1.5' }, Ld);
  arrow(Ld, ax.x(1), ax.y(3), ax.x(3), ax.y(5), { cls: 'a-ok', width: 2.5 });
  const mx = ax.x(2), my = ax.y(4);
  s('text', { x: mx, y: my, dy: '-0.6em', 'text-anchor': 'middle', class: 't-ok t-bold halo', transform: `rotate(-45 ${mx} ${my})` }, Ld, 'd = 2.83');
  s('text', { x: ax.x(5) + 13, y: ax.y(3) + 4, class: 't-fg t-bold halo' }, Ld, 'x₁');
  s('text', { x: ax.x(1) + 6, y: ax.y(3) + 24, class: 't-fg t-bold halo' }, Ld, 'x₂');
  const HN = [
    'All parts together. Blue side: w·x + b ≥ 0, predict +1. Plum side: predict −1. The band between the dashed lines is empty, which is what a hard margin means.',
    'The hyperplane w·x + b = 0 is the line x₁ + x₂ = 6. The vector w = (0.5, 0.5) is perpendicular to it and points to the +1 side.',
    'The margin lines w·x + b = +1 (x₁ + x₂ = 8) and w·x + b = −1 (x₁ + x₂ = 4). The constraint yᵢ(w·xᵢ + b) ≥ 1 keeps every point outside the band.',
    'The support vectors are the four points on the margin lines, where yᵢ(w·xᵢ + b) = 1 exactly. Any other point can move (without entering the band) and the hyperplane stays where it is.',
    'x₁ = (5, 3) and x₂ = (1, 3) are 4 apart, but the margin is measured along w. Projecting x₁ − x₂ on w/‖w‖ gives (4 − 2)/0.707 = 2.83 = 2/‖w‖.',
  ];
  const layers = [Lh, Lm, Ls, Ld];
  steps(viz('hard-steps'), ['All', 'Hyperplane', 'Margin lines', 'Support vectors', 'Margin d'], k => {
    layers.forEach((g, i) => g.classList.toggle('dim', k > 0 && i !== k - 1));
    role('hard-note').textContent = HN[k];
  });

  // Figure 2: soft margin for four values of C (exact minimizers, found offline)
  const NEW = [2.8, 3];
  const SAMPLES = POS.concat([NEW]).map(p => ({ p, y: 1 })).concat(NEG.map(p => ({ p, y: -1 })));
  const CS = [
    { C: '0.02', w: [0.248, 0.248], b: -1.728 },
    { C: '0.1', w: [0.5, 0.4], b: -2.7 },
    { C: '0.5', w: [0.5, 0.5], b: -3 },
    { C: '10', w: [10 / 9, 10 / 9], b: -49 / 9 },
  ];
  const { el: soft, ax: sa } = frame(viz('soft'));
  const sdyn = s('g', {}, soft);
  const spts = s('g', {}, soft);
  const srings = s('g', {}, soft);
  SAMPLES.forEach(o => dot(spts, sa, o.p, o.y));
  s('text', { x: sa.x(NEW[0]) - 9, y: sa.y(NEW[1]) - 9, 'text-anchor': 'end', class: 't-pri t-bold halo' }, spts, 'new');

  const hinge = svg(viz('hinge'), 460, 236, { label: 'Hinge loss: slack zeta against y times w dot x plus b, with the training points that pay a slack placed on the curve', minWidth: 400 });
  const hx = scale(-1.5, 3, 50, 440);
  [[-1.5, 0, 'f-bad-soft', 'wrong side, ζ > 1'], [0, 1, 'f-ter-soft', 'inside'], [1, 3, 'f-ok-soft', 'ζ = 0']].forEach(([a, b, cls, t]) => {
    s('rect', { x: hx(a), y: 30, width: hx(b) - hx(a), height: 150, class: cls }, hinge);
    s('text', { x: (hx(a) + hx(b)) / 2, y: 46, 'text-anchor': 'middle', class: 't-fg t-sm' }, hinge, t);
  });
  const ha = axes(hinge, { x: 50, y: 30, w: 390, h: 150, xd: [-1.5, 3], yd: [0, 2.6], xt: [-1, 0, 1, 2, 3], yt: [0, 1, 2], xf: neg, grid: false, xl: 'y(w·x + b)', yl: 'ζ = max(0, 1 − y(w·x + b))' });
  s('path', { d: `M${ha.x(-1.5)} ${ha.y(2.5)} L${ha.x(1)} ${ha.y(0)} L${ha.x(3)} ${ha.y(0)}`, class: 's-fg', style: 'stroke-width: 2' }, hinge);
  const hdyn = s('g', {}, hinge);

  const SN = [
    'C = 0.02. Violations are cheap, so the SVM buys a very wide margin (5.70) and lets 9 points pay a slack: 8 inside the margin and the new point on the wrong side. Risk: underfitting.',
    'C = 0.1. The margin narrows to 3.12. The new point is still on the wrong side (ζ = 1.10), and two points sit just inside the margin (ζ = 0.10 each).',
    'C = 0.5. The hard-margin line of Figure 1 comes back, width 2.83. Only the new point violates it: it is misclassified, ζ = 1.10.',
    'C = 10. Every violation is now expensive, so the line moves toward the negatives and the margin shrinks to 1.27 to put the new point on the correct side. No training errors, but the boundary hangs on one odd point. Risk: overfitting.',
  ];
  steps(viz('soft-steps'), CS.map(c => 'C = ' + c.C), k => {
    const { w, b } = CS[k];
    [sdyn, srings, hdyn].forEach(g => { g.textContent = ''; });
    poly(sdyn, sa, half(w, b, 0, 1), 'area-pri');
    poly(sdyn, sa, half(w, b, 0, -1), 'area-sec');
    drawLine(sdyn, sa, w, b, 0, 's-fg', 'stroke-width: 2', 'w·x + b = 0', 't-fg t-bold');
    drawLine(sdyn, sa, w, b, 1, 's-pri dash', 'stroke-width: 1.5', '+1', 't-pri');
    drawLine(sdyn, sa, w, b, -1, 's-sec dash', 'stroke-width: 1.5', '−1', 't-sec');
    let sum = 0, inside = 0, wrong = 0;
    SAMPLES.forEach(o => {
      const m = o.y * fx(w, b, o.p), z = Math.max(0, 1 - m);
      if (z < 1e-9) {
        if (m < 3) dot(hdyn, ha, [m, 0], o.y);
        return;
      }
      sum += z;
      const bad = z > 1 + 1e-9;
      if (bad) wrong++; else inside++;
      s('circle', { cx: sa.x(o.p[0]), cy: sa.y(o.p[1]), r: 10, class: bad ? 's-bad' : 's-ter', style: 'stroke-width: 2' }, srings);
      dot(hdyn, ha, [m, z], o.y);
      s('circle', { cx: ha.x(m), cy: ha.y(z), r: 9, class: bad ? 's-bad' : 's-ter', style: 'stroke-width: 1.5' }, hdyn);
    });
    role('width').textContent = (2 / Math.hypot(w[0], w[1])).toFixed(2);
    role('sumz').textContent = sum.toFixed(2);
    role('inside').textContent = String(inside);
    role('wrong').textContent = String(wrong);
    role('soft-note').textContent = SN[k];
  }, 2);
});

QV.register('s1-w3', function (q) {
  const { s, svg, axes, steps, arrow, line } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const PTS = [[1.5, 2], [2.5, 1.5], [2, 3], [1, 2.8], [3, 2.5], [7, 2], [8, 2.8], [7.5, 1.2], [8.6, 1.8], [4.2, 7], [5, 7.8], [4, 8.2], [5.4, 6.8]];
  const COL = ['pri', 'sec', 'ter'];
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  const kmeans = init => {
    const frames = [{ type: 'init', mu: init, asg: null }];
    let mu = init, prev = null;
    for (let it = 0; it < 20; it++) {
      const asg = PTS.map(p => mu.reduce((bi, m, k) => (d2(p, m) < d2(p, mu[bi]) ? k : bi), 0));
      const same = prev && asg.every((a, i) => a === prev[i]);
      frames.push({ type: 'assign', mu, asg, J: PTS.reduce((t, p, i) => t + d2(p, mu[asg[i]]), 0), done: same });
      if (same) break;
      const nmu = mu.map((m, k) => {
        const mem = PTS.filter((_, i) => asg[i] === k);
        return [mem.reduce((t, p) => t + p[0], 0) / mem.length, mem.reduce((t, p) => t + p[1], 0) / mem.length];
      });
      frames.push({ type: 'update', mu: nmu, old: mu, asg, J: PTS.reduce((t, p, i) => t + d2(p, nmu[asg[i]]), 0) });
      mu = nmu;
      prev = asg;
    }
    return frames;
  };
  const diamond = (g, x, y, r, cls, style) => s('path', { d: `M${x} ${y - r} L${x + r} ${y} L${x} ${y + r} L${x - r} ${y} Z`, class: cls, style }, g);
  const scatter = (g, ax, asg, r) => PTS.forEach((p, i) => s('circle', { cx: ax.x(p[0]), cy: ax.y(p[1]), r: r || 5, class: asg ? 'f-' + COL[asg[i]] : 'f-muted' }, g));

  // Figure 1: the loop, one frame per step
  const FR = kmeans([PTS[0], PTS[1], PTS[9]]);
  const loop = svg(viz('loop'), 660, 360, { label: 'K-Means on 13 points with K = 3: points coloured by cluster, centroids as diamonds, and J after every step', minWidth: 540 });
  const la = axes(loop, { x: 40, y: 24, w: 304, h: 288, xd: [0, 9.5], yd: [0, 9], xt: [0, 2, 4, 6, 8], yt: [0, 2, 4, 6, 8], grid: false, xl: 'x₁', yl: 'x₂' });
  const SHORT = ['Init', 'A1', 'U1', 'A2', 'U2', 'A3'];
  const ja = axes(loop, { x: 420, y: 24, w: 220, h: 220, xd: [0.5, 5.5], yd: [0, 130], xt: [1, 2, 3, 4, 5], xf: i => SHORT[i], yt: [0, 40, 80, 120], xl: 'A = assign, U = update', yl: 'J' });
  const JP = FR.map((f, i) => [ja.x(i), ja.y(f.J || 0)]).slice(1);
  line(loop, JP, 's-muted').setAttribute('style', 'stroke-width: 1.5');
  JP.forEach(([x, y]) => s('circle', { cx: x, cy: y, r: 3.5, class: 'f-muted' }, loop));
  const ldyn = s('g', {}, loop);
  const LN = [
    'Step 1, initialization: K = 3 points of the dataset are picked at random as centroids: μ₁ = (1.5, 2), μ₂ = (2.5, 1.5), μ₃ = (4.2, 7). Two of them landed in the same group. Nothing is assigned yet, so there is no J.',
    'Step 2, assignment: every point joins its nearest centroid. The right-hand group is closer to μ₂ than to μ₃, so μ₂ takes it, together with two points of the left group. J = 122.46.',
    'Step 3, update: each centroid moves to the mean of its points. μ₂ jumps to (6.1, 1.97), between the two groups it holds. J = 40.69.',
    'Step 2 again: (2.5, 1.5) and (3, 2.5) are now closer to μ₁, so they switch to cluster 1. J = 22.09.',
    'Step 3 again: μ₁ = (2, 2.36), μ₂ = (7.775, 1.95). μ₃ = (4.65, 7.45) does not move. J = 9.33.',
    'Step 4, convergence: one more assignment changes nothing, so the centroids stop moving. Step 5, the result: three clusters, J = 9.33. J went down at every step.',
  ];
  steps(viz('loop-steps'), ['Init', 'Assign 1', 'Update 1', 'Assign 2', 'Update 2', 'Converged'], k => {
    ldyn.textContent = '';
    const f = FR[k];
    if (f.type === 'assign') {
      PTS.forEach((p, i) => {
        const m = f.mu[f.asg[i]];
        line(ldyn, [[la.x(p[0]), la.y(p[1])], [la.x(m[0]), la.y(m[1])]], 's-' + COL[f.asg[i]]).setAttribute('style', 'stroke-width: 1; opacity: 0.6');
      });
    }
    scatter(ldyn, la, f.asg);
    if (f.type === 'update') {
      f.old.forEach((m, c) => {
        const n = f.mu[c], dx = la.x(n[0]) - la.x(m[0]), dy = la.y(n[1]) - la.y(m[1]), L = Math.hypot(dx, dy);
        diamond(ldyn, la.x(m[0]), la.y(m[1]), 8, 's-' + COL[c], 'stroke-width: 1.5');
        if (L > 20) arrow(ldyn, la.x(m[0]) + dx / L * 10, la.y(m[1]) + dy / L * 10, la.x(n[0]) - dx / L * 13, la.y(n[1]) - dy / L * 13, { cls: 'a-muted', width: 1.5 });
      });
    }
    f.mu.forEach((m, c) => {
      diamond(ldyn, la.x(m[0]), la.y(m[1]), 10, 'f-' + COL[c] + ' sep');
      s('text', { x: la.x(m[0]) + (c === 2 ? -14 : 12), y: la.y(m[1]) + (c === 2 ? 4 : -8), 'text-anchor': c === 2 ? 'end' : 'start', class: 't-' + COL[c] + ' t-bold halo' }, ldyn, 'μ' + '₁₂₃'[c]);
    });
    if (k) {
      s('circle', { cx: ja.x(k), cy: ja.y(f.J), r: 6, class: 'f-pri' }, ldyn);
      s('text', { x: ja.x(k) + (k < 4 ? 10 : 0), y: ja.y(f.J) - 12, 'text-anchor': k < 4 ? 'start' : 'middle', class: 't-pri t-bold halo' }, ldyn, 'J = ' + f.J.toFixed(2));
    }
    role('loop-note').textContent = LN[k];
  }, 5);

  // Figure 2: three of the challenges
  const ELBOW = [31369.00, 15962.09, 4726.76, 3735.78, 1584.62, 1373.63, 1212.56, 1136.06, 981.48];
  const ch = svg(viz('ch'), 660, 340, { label: 'Challenges of K-Means: the elbow curve, an outlier dragging a centroid, and two random starts that end with different J', minWidth: 540 });
  const cdyn = s('g', {}, ch);
  const drawElbow = () => {
    const ea = axes(cdyn, { x: 80, y: 30, w: 540, h: 240, xd: [0.5, 9.5], yd: [0, 34000], xt: [1, 2, 3, 4, 5, 6, 7, 8, 9], yt: [0, 10000, 20000, 30000], yf: v => (v ? v / 1000 + 'k' : '0'), xl: 'K, number of clusters', yl: 'inertia J, the sum of squared distances' });
    line(cdyn, ELBOW.map((v, i) => [ea.x(i + 1), ea.y(v)]), 's-pri');
    ELBOW.forEach((v, i) => s('circle', { cx: ea.x(i + 1), cy: ea.y(v), r: i === 4 ? 7 : 4.5, class: i === 4 ? 'f-ok' : 'f-pri' }, cdyn));
    s('text', { x: ea.x(5.3), y: ea.y(15000), class: 't-ok t-bold' }, cdyn, 'elbow at K = 5');
    s('text', { x: ea.x(5.3), y: ea.y(15000) + 16, class: 't-fg' }, cdyn, 'last big drop: 3735.78 → 1584.62');
    arrow(cdyn, ea.x(5.25), ea.y(11500), ea.x(5.04), ea.y(2700), { cls: 'a-ok', width: 1.5 });
    s('text', { x: ea.x(1) + 10, y: ea.y(31369), dy: '0.35em', class: 't-fg' }, cdyn, '31369.00');
  };
  const drawOutlier = () => {
    const G = [[2, 2], [3, 1.5], [2.5, 3], [1.5, 2.5]], O = [9, 8];
    const oa = axes(cdyn, { x: 50, y: 24, w: 300, h: 270, xd: [0, 10], yd: [0, 9], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6, 8], grid: false, xl: 'x₁', yl: 'x₂' });
    const mean = A => [A.reduce((t, p) => t + p[0], 0) / A.length, A.reduce((t, p) => t + p[1], 0) / A.length];
    const m4 = mean(G), m5 = mean(G.concat([O]));
    s('line', { x1: oa.x(m5[0]), y1: oa.y(m5[1]), x2: oa.x(O[0]), y2: oa.y(O[1]), class: 's-bad dash', style: 'stroke-width: 1' }, cdyn);
    G.forEach(p => s('circle', { cx: oa.x(p[0]), cy: oa.y(p[1]), r: 5, class: 'f-pri' }, cdyn));
    s('circle', { cx: oa.x(O[0]), cy: oa.y(O[1]), r: 5, class: 'f-pri' }, cdyn);
    s('circle', { cx: oa.x(O[0]), cy: oa.y(O[1]), r: 10, class: 's-bad', style: 'stroke-width: 2' }, cdyn);
    s('text', { x: oa.x(O[0]) - 14, y: oa.y(O[1]) + 4, 'text-anchor': 'end', class: 't-bad t-bold' }, cdyn, 'outlier (9, 8)');
    arrow(cdyn, oa.x(m4[0]) + 8, oa.y(m4[1]) - 7, oa.x(m5[0]) - 10, oa.y(m5[1]) + 9, { cls: 'a-bad', width: 1.5 });
    diamond(cdyn, oa.x(m4[0]), oa.y(m4[1]), 9, 'f-ok sep');
    diamond(cdyn, oa.x(m5[0]), oa.y(m5[1]), 9, 'f-bad sep');
    s('line', { x1: oa.x(m4[0]), y1: oa.y(m4[1]) + 9, x2: oa.x(0.9), y2: oa.y(0.75), class: 's-ok', style: 'stroke-width: 1' }, cdyn);
    s('text', { x: oa.x(0.3), y: oa.y(0.4), class: 't-ok t-bold' }, cdyn, 'mean of 4: (2.25, 2.25)');
    s('text', { x: oa.x(m5[0]) + 14, y: oa.y(m5[1]) + 4, class: 't-bad t-bold' }, cdyn, 'mean of 5: (3.6, 3.4)');
    const tx = 392;
    [['t-fg t-bold', 'μ = (1/|C|) Σ xᵢ'],
      ['t-fg', 'x₁: (2 + 3 + 2.5 + 1.5 + 9)/5 = 3.6'],
      ['t-fg', 'x₂: (2 + 1.5 + 3 + 2.5 + 8)/5 = 3.4'],
      ['t-muted', 'without (9, 8): (2.25, 2.25)'],
      ['t-ok t-bold', 'fix: find the outlier first,'],
      ['t-ok', 'then remove or transform it,'],
      ['t-ok', 'or use a robust variant']].forEach(([c, t], i) => s('text', { x: tx, y: 60 + i * 22 + (i > 3 ? 20 : 0), class: c }, cdyn, t));
  };
  const drawInit = () => {
    [[0, 1, 9], [0, 1, 4]].forEach((ini, pi) => {
      const x0 = 40 + pi * 330;
      const pa = axes(cdyn, { x: x0, y: 50, w: 247, h: 234, xd: [0, 9.5], yd: [0, 9], xt: [0, 4, 8], yt: [0, 4, 8], grid: false, xl: 'x₁' });
      const fr = kmeans(ini.map(i => PTS[i]));
      const last = fr[fr.length - 1];
      scatter(cdyn, pa, last.asg, 4.5);
      ini.forEach(i => diamond(cdyn, pa.x(PTS[i][0]), pa.y(PTS[i][1]), 9, 's-fg', 'stroke-width: 1.5'));
      last.mu.forEach((m, c) => diamond(cdyn, pa.x(m[0]), pa.y(m[1]), 9, 'f-' + COL[c] + ' sep'));
      s('text', { x: x0, y: 16, class: (pi ? 't-bad' : 't-ok') + ' t-bold' }, cdyn, (pi ? 'Start B' : 'Start A') + ': J = ' + last.J.toFixed(2));
      s('text', { x: x0, y: 33, class: 't-sm' }, cdyn, pi ? 'all three centroids in the left group' : 'the start of Figure 1');
    });
  };
  const CN = [
    'Choosing K: inertia always falls as K grows, and reaches 0 when every point is its own cluster. Pick the K where the drop levels off. In the course notebook (5 blobs) that is K = 5: after 3735.78 → 1584.62 the curve is nearly flat.',
    'Outliers: the centroid is a mean, and a mean follows extreme values. One far point moves the centroid from (2.25, 2.25) to (3.6, 3.4), where no point of the group lies.',
    'Random initialization: the same 13 points and the same algorithm. Hollow diamonds are the starts, filled diamonds the converged centroids. Start B converges to a bad local minimum: the left group is split in two, and the other two groups share one centroid. J = 87.05 instead of 9.33. Fix: K-Means++.',
  ];
  steps(viz('ch-steps'), ['Choosing K', 'Outliers', 'Random init'], k => {
    cdyn.textContent = '';
    [drawElbow, drawOutlier, drawInit][k]();
    role('ch-note').textContent = CN[k];
  });

  // Figure 3: K-Means++ on the slide-22 points
  const PP = [['A', [1, 2]], ['B', [2, 1]], ['C', [5, 4]], ['D', [6, 5]], ['E', [9, 8]]];
  const OFF = [[0, 24, 'middle'], [12, 4, 'start'], [12, 14, 'start'], [-12, -12, 'end'], [-14, 4, 'end']];
  const pp = svg(viz('pp'), 680, 330, { label: 'K-Means plus plus: five points with their squared distance to the nearest chosen centroid, and a bar chart of the probability of each point becoming the next centroid', minWidth: 540 });
  const pa = axes(pp, { x: 40, y: 24, w: 300, h: 270, xd: [0, 10], yd: [0, 9], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6, 8], grid: false, xl: 'x₁', yl: 'x₂' });
  const pb = axes(pp, { x: 420, y: 24, w: 240, h: 230, xd: [0.5, 5.5], yd: [0, 1], xt: [1, 2, 3, 4, 5], xf: i => PP[i - 1][0], yt: [0, 0.25, 0.5, 0.75, 1], xl: 'point', yl: 'P(next centroid)' });
  const pdyn = s('g', {}, pp);
  const PN = [
    'Step 1: the first centroid is picked uniformly at random from the data, each point with probability 1/5. Here it is A, as on slide 22.',
    'Step 2: D(x)² is the squared distance to A: 0, 2, 20, 34, 100, sum 156. Step 3: P = D(x)² / 156, so E, the farthest point, gets 0.641. Slide 23 takes C₂ = E.',
    'Repeat: each point now uses the nearer of A and E. D(x)² = 0, 2, 20, 18, 0, sum 40. The third centroid is likely C (20/40 = 0.5) or D (18/40 = 0.45). B, right next to A, has only 0.05.',
  ];
  steps(viz('pp-steps'), ['Pick 1', 'Pick 2', 'Pick 3'], k => {
    pdyn.textContent = '';
    const chosen = [[0], [0], [0, 4]][k];
    const D2 = PP.map(([, p]) => (k ? Math.min(...chosen.map(c => d2(p, PP[c][1]))) : null));
    const tot = k ? D2.reduce((a, v) => a + v, 0) : 0;
    const P = PP.map((_, i) => (k ? D2[i] / tot : 0.2));
    const best = P.indexOf(Math.max(...P));
    if (k) {
      PP.forEach(([, p], i) => {
        if (chosen.includes(i)) return;
        const c = PP[chosen.reduce((bi, cc) => (d2(p, PP[cc][1]) < d2(p, PP[bi][1]) ? cc : bi), chosen[0])][1];
        s('line', { x1: pa.x(p[0]), y1: pa.y(p[1]), x2: pa.x(c[0]), y2: pa.y(c[1]), class: 's-muted dash', style: 'stroke-width: 1' }, pdyn);
      });
    }
    PP.forEach(([n, p], i) => {
      const isC = chosen.includes(i);
      if (isC) diamond(pdyn, pa.x(p[0]), pa.y(p[1]), 10, 'f-ok sep');
      else s('circle', { cx: pa.x(p[0]), cy: pa.y(p[1]), r: 5.5, class: k && i === best ? 'f-pri' : 'f-muted' }, pdyn);
      const [dx, dy, anc] = OFF[i];
      const tag = isC ? 'C' + '₁₂₃'[chosen.indexOf(i)] + ' = ' + n : n;
      s('text', { x: pa.x(p[0]) + dx, y: pa.y(p[1]) + dy, 'text-anchor': anc, class: (isC ? 't-ok' : 't-fg') + ' t-bold halo' }, pdyn, tag);
      if (k) s('text', { x: pa.x(p[0]) + dx, y: pa.y(p[1]) + dy + 14, 'text-anchor': anc, class: 't-sm halo' }, pdyn, 'D² = ' + D2[i]);
      const top = pb.y(P[i]);
      if (P[i] > 0) s('rect', { x: pb.x(i + 1) - 16, y: top, width: 32, height: pb.y(0) - top, class: 'f-pri', style: k && i === best ? null : 'opacity: 0.35' }, pdyn);
      if (!(k && isC)) s('text', { x: pb.x(i + 1), y: top - 6, 'text-anchor': 'middle', class: 't-fg' }, pdyn, P[i].toFixed(k ? 3 : 1));
    });
    role('pp-note').textContent = PN[k];
  }, 2);
});

QV.register('s1-w4', function (q) {
  const { s, svg, axes, steps, table, box } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const X = [[1, 1, 1], [1, 2, 1], [1, 1, 2], [1, 3, 3], [1, 4, 2]];
  const Y = [0, 0, 0, 1, 1];
  const g = z => 1 / (1 + Math.exp(-z));
  const dot3 = (t, x) => t[0] * x[0] + t[1] * x[1] + t[2] * x[2];
  const rowCost = (t, i) => { const h = g(dot3(t, X[i])); return Y[i] ? -Math.log(h) : -Math.log(1 - h); };
  const cost = t => X.reduce((a, _, i) => a + rowCost(t, i), 0) / X.length;
  const gd = n => {
    let t = [0, 0, 0];
    for (let it = 0; it < n; it++) {
      const e = X.map((x, i) => g(dot3(t, x)) - Y[i]);
      t = t.map((tj, j) => tj - 0.5 * X.reduce((a, x, i) => a + x[j] * e[i], 0) / X.length);
    }
    return t;
  };
  const neg = v => String(v).replace('-', '−');
  const fm = v => neg(QV.fmt(v));
  const T1 = gd(1);

  table(viz('given'), ['i', 'x0', 'x1', 'x2', 'y'], X.map((x, i) => [String(i + 1)].concat(x.map(String), [String(Y[i])])));

  // Figure 1: the gradient, row by row
  const E = X.map((x, i) => g(0) - Y[i]);
  const gr = svg(viz('grad'), 680, 262, { label: 'The error vector h minus y on top, and for each feature row its values, products with the error, sum, sum over m, and the new theta', minWidth: 560 });
  const CW = 54, GX = 92, cx = i => GX + i * (CW + 6);
  const RY = j => 88 + j * 56;
  const SX = [404, 486, 554], SW = [70, 56, 110];
  ['i = 1', 'i = 2', 'i = 3', 'i = 4', 'i = 5'].forEach((t, i) => s('text', { x: cx(i) + CW / 2, y: 16, 'text-anchor': 'middle', class: 't-sm' }, gr, t));
  ['Σ products', '÷ m = 5', 'new θ = θ − α · grad'].forEach((t, i) => s('text', { x: SX[i] + SW[i] / 2, y: 16, 'text-anchor': 'middle', class: 't-sm' }, gr, t));
  s('text', { x: 0, y: 46, dy: '0.35em', class: 't-fg t-bold' }, gr, 'h − y');
  E.forEach((e, i) => box(gr, cx(i), 28, CW, 36, fm(e), { cls: e > 0 ? 'f-sec-soft' : 'f-pri-soft', textCls: 't-fg t-bold', rx: 3 }));
  const SUM = [0, 1, 2].map(j => X.reduce((a, x, i) => a + x[j] * E[i], 0));
  const rows = [0, 1, 2].map(j => {
    const grp = s('g', { class: 'fade' }, gr);
    const y = RY(j);
    s('text', { x: 0, y: y + 22, dy: '0.35em', class: 't-fg t-bold' }, grp, 'x' + '₀₁₂'[j] + ' row');
    X.forEach((x, i) => {
      s('rect', { x: cx(i), y, width: CW, height: 44, rx: 3, class: 'f-seg box' }, grp);
      s('text', { x: cx(i) + CW / 2, y: y + 17, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg' }, grp, String(x[j]));
      s('text', { x: cx(i) + CW / 2, y: y + 34, dy: '0.35em', 'text-anchor': 'middle', class: 't-sm ' + (E[i] > 0 ? 't-sec' : 't-pri') }, grp, fm(x[j] * E[i]));
    });
    box(grp, SX[0], y + 4, SW[0], 36, fm(SUM[j]), { cls: 'f-surface', textCls: 't-fg t-bold' });
    box(grp, SX[1], y + 4, SW[1], 36, fm(SUM[j] / 5), { cls: 'f-surface', textCls: 't-fg t-bold' });
    box(grp, SX[2], y + 4, SW[2], 36, 'θ' + '₀₁₂'[j] + ' = ' + fm(T1[j]), { cls: 'f-ok', textCls: 't-on t-bold' });
    return grp;
  });
  const GN = [
    'All three rows. Rows 1-3 have y = 0 but h = 0.5, so their error is +0.5. Rows 4-5 have y = 1, error −0.5. The gradient is [0.1, −0.3, −0.1], so θ moves to [−0.05, 0.15, 0.05].',
    'x₀ row: every x₀ is 1, so the sum is just the total error: 0.5 + 0.5 + 0.5 − 0.5 − 0.5 = 0.5. ÷ 5 = 0.1, so θ₀ = 0 − 0.5 × 0.1 = −0.05.',
    'x₁ row: 0.5 + 1 + 0.5 − 1.5 − 2 = −1.5. ÷ 5 = −0.3, so θ₁ = 0 − 0.5 × (−0.3) = 0.15. The y = 1 rows have large x₁, so θ₁ grows.',
    'x₂ row: 0.5 + 0.5 + 1 − 1.5 − 1 = −0.5. ÷ 5 = −0.1, so θ₂ = 0 − 0.5 × (−0.1) = 0.05.',
  ];
  steps(viz('grad-steps'), ['All', 'θ₀ row', 'θ₁ row', 'θ₂ row'], k => {
    rows.forEach((r, j) => r.classList.toggle('dim', k > 0 && j !== k - 1));
    role('grad-note').textContent = GN[k];
  });

  table(viz('pred-table'), ['i', 'z', 'h = g(z)', 'predict', 'y', 'row cost'], X.map((x, i) => {
    const z = dot3(T1, x), h = g(z), wrong = (h >= 0.5 ? 1 : 0) !== Y[i];
    return [String(i + 1), z.toFixed(2), h.toFixed(4), { text: (h >= 0.5 ? '1' : '0') + (wrong ? ', wrong' : ''), cls: wrong ? 'hl' : '' }, String(Y[i]), rowCost(T1, i).toFixed(4)];
  }));

  // Figure 2: h and row cost before and after the step
  const cf = svg(viz('cost'), 680, 262, { label: 'Bar charts of h and of the row cost for the five rows, at theta zero and after one gradient step, with the mean cost J', minWidth: 540 });
  const xf = i => 'row ' + i;
  const hA = axes(cf, { x: 56, y: 40, w: 260, h: 190, xd: [0.5, 5.5], yd: [0, 1], xt: [1, 2, 3, 4, 5], xf, yt: [0, 0.5, 1], yl: 'h = g(θᵀx)' });
  const cA = axes(cf, { x: 400, y: 40, w: 260, h: 190, xd: [0.5, 5.5], yd: [0, 1], xt: [1, 2, 3, 4, 5], xf, yt: [0, 0.5, 1], yl: 'row cost' });
  s('line', { x1: hA.x(0.5), x2: hA.x(5.5), y1: hA.y(0.5), y2: hA.y(0.5), class: 's-fg dash', style: 'stroke-width: 1.5' }, cf);
  s('text', { x: hA.x(5.5), y: 16, 'text-anchor': 'end', class: 't-bad t-sm' }, cf, 'red outline: predicted 1, but y = 0');
  const cdyn = s('g', {}, cf);
  const CN = [
    'At θ = 0 every z is 0, so every h is 0.5 and every row costs −ln 0.5 = 0.693, whatever its label. J = 0.693. With the rule h ≥ 0.5 → 1, rows 1-3 are predicted wrong.',
    'After the step every z is positive (0.15 to 0.65), so h rises for every row. Rows 4-5 (y = 1) get cheaper: 0.693 → 0.455 and 0.420. Rows 1-3 (y = 0) get dearer: 0.771, 0.854, 0.798. The gains are larger, so J falls to 0.660. Rows 1-3 are still predicted 1.',
  ];
  steps(viz('cost-steps'), ['θ = [0, 0, 0]', 'After 1 step'], k => {
    cdyn.textContent = '';
    const t = k ? T1 : [0, 0, 0];
    const J = cost(t);
    X.forEach((x, i) => {
      const h = g(dot3(t, x)), c = rowCost(t, i), cls = Y[i] ? 'f-pri' : 'f-sec';
      s('rect', { x: hA.x(i + 1) - 15, y: hA.y(h), width: 30, height: hA.y(0) - hA.y(h), class: cls }, cdyn);
      if ((h >= 0.5 ? 1 : 0) !== Y[i]) s('rect', { x: hA.x(i + 1) - 17, y: hA.y(h) - 2, width: 34, height: hA.y(0) - hA.y(h) + 2, class: 's-bad', style: 'stroke-width: 2' }, cdyn);
      s('text', { x: hA.x(i + 1), y: hA.y(h) - 7, 'text-anchor': 'middle', class: 't-fg t-sm' }, cdyn, h.toFixed(3));
      s('rect', { x: cA.x(i + 1) - 15, y: cA.y(c), width: 30, height: cA.y(0) - cA.y(c), class: cls }, cdyn);
      s('text', { x: cA.x(i + 1), y: cA.y(c) - 7, 'text-anchor': 'middle', class: 't-fg t-sm' }, cdyn, c.toFixed(3));
    });
    s('line', { x1: cA.x(0.5), x2: cA.x(5.5), y1: cA.y(J), y2: cA.y(J), class: 's-ok dash', style: 'stroke-width: 2' }, cdyn);
    s('text', { x: cA.x(5.5), y: 16, 'text-anchor': 'end', class: 't-ok t-bold' }, cdyn, 'J = ' + J.toFixed(3));
    role('cost-note').textContent = CN[k];
  }, 1);

  // Figure 3: the decision boundary as gradient descent continues
  const BOX = [[-0.5, -0.5], [5, -0.5], [5, 5], [-0.5, 5]];
  const fx = (t, p) => t[0] + t[1] * p[0] + t[2] * p[1];
  const half = (t, sgn) => {
    const out = [];
    BOX.forEach((pa, i) => {
      const pb = BOX[(i + 1) % 4], a = sgn * fx(t, pa), c = sgn * fx(t, pb);
      if (a >= 0) out.push(pa);
      if ((a >= 0) !== (c >= 0)) { const r = a / (a - c); out.push([pa[0] + r * (pb[0] - pa[0]), pa[1] + r * (pb[1] - pa[1])]); }
    });
    return out;
  };
  const bd = svg(viz('bd'), 430, 404, { label: 'Training points, two query points and the decision boundary theta transpose x = 0 after several gradient steps', minWidth: 400 });
  const ba = axes(bd, { x: 50, y: 22, w: 330, h: 330, xd: [-0.5, 5], yd: [-0.5, 5], xt: [0, 1, 2, 3, 4, 5], yt: [0, 1, 2, 3, 4, 5], grid: false, xl: 'x₁', yl: 'x₂' });
  const bdyn = s('g', {}, bd);
  const ITS = [1, 5, 30, 200];
  const TH = ITS.map(gd);
  const poly = (pts, cls) => s('polygon', { points: pts.map(p => ba.x(p[0]).toFixed(1) + ',' + ba.y(p[1]).toFixed(1)).join(' '), class: cls }, bdyn);
  const BN = [
    'After 1 step: θ = [−0.05, 0.15, 0.05], J = 0.660. The boundary 3x₁ + x₂ = 1 passes next to the origin, so all five training points are predicted 1 and rows 1-3 are wrong. (4, 4): z = 0.75, h = 0.679 → y = 1. (0, 0): z = −0.05, h = 0.4875 → y = 0.',
    'After 5 steps: θ = [−0.387, 0.313, −0.041], J = 0.586. The line has moved right; only row 2, the point (2, 1), is still wrong.',
    'After 30 steps: θ = [−1.937, 0.939, −0.054], J = 0.357. All five rows are on the correct side.',
    'After 200 steps: θ = [−6.172, 1.844, 0.933], J = 0.092. Same predictions, more confident: h is 0.03 to 0.18 for the y = 0 rows and 0.90 to 0.96 for the y = 1 rows.',
  ];
  steps(viz('bd-steps'), ITS.map(n => n + (n > 1 ? ' steps' : ' step')), k => {
    bdyn.textContent = '';
    const t = TH[k];
    poly(half(t, 1), 'area-pri');
    poly(half(t, -1), 'area-sec');
    const ends = [];
    BOX.forEach((pa, i) => {
      const pb = BOX[(i + 1) % 4], a = fx(t, pa), c = fx(t, pb);
      if (a * c < 0) { const r = a / (a - c); ends.push([pa[0] + r * (pb[0] - pa[0]), pa[1] + r * (pb[1] - pa[1])]); }
    });
    ends.sort((m, n) => m[1] - n[1]);
    const [lo, hi] = [ends[0], ends[ends.length - 1]];
    s('line', { x1: ba.x(lo[0]), y1: ba.y(lo[1]), x2: ba.x(hi[0]), y2: ba.y(hi[1]), class: 's-fg', style: 'stroke-width: 2' }, bdyn);
    s('text', { x: ba.x(lo[0]) + 8, y: ba.y(lo[1]) - 8, class: 't-fg t-bold halo' }, bdyn, k ? 'θᵀx = 0' : '3x₁ + x₂ = 1');
    X.forEach((x, i) => {
      const p = [x[1], x[2]], wrong = (fx(t, p) >= 0 ? 1 : 0) !== Y[i];
      if (Y[i]) s('circle', { cx: ba.x(p[0]), cy: ba.y(p[1]), r: 6, class: 'f-pri' }, bdyn);
      else s('rect', { x: ba.x(p[0]) - 5.5, y: ba.y(p[1]) - 5.5, width: 11, height: 11, class: 'f-sec' }, bdyn);
      if (wrong) s('circle', { cx: ba.x(p[0]), cy: ba.y(p[1]), r: 11, class: 's-bad', style: 'stroke-width: 2' }, bdyn);
      s('text', { x: ba.x(p[0]) + 12, y: ba.y(p[1]) + 15, class: 't-sm halo' }, bdyn, String(i + 1));
    });
    [[4, 4, '(4, 4)', -14], [0, 0, '(0, 0)', 20]].forEach(([a, b, t2, dy]) => {
      const x0 = ba.x(a), y0 = ba.y(b);
      s('path', { d: `M${x0} ${y0 - 8} L${x0 + 8} ${y0} L${x0} ${y0 + 8} L${x0 - 8} ${y0} Z`, class: 'f-ter sep' }, bdyn);
      s('text', { x: x0, y: y0 + dy, 'text-anchor': 'middle', class: 't-ter t-bold halo' }, bdyn, t2);
    });
    role('bd-note').textContent = BN[k];
  });
});

QV.register('s1-w5', function (q) {
  const { s, svg, axes, steps, table, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const N = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const P = [[1, 1], [1.5, 2], [3, 4], [5, 7], [3.5, 5], [4.5, 5], [3.5, 4.5]];
  const OFF = [[-10, 4, 'end'], [-12, 4, 'end'], [-10, 4, 'end'], [12, 4, 'start'], [-9, -7, 'end'], [10, 4, 'start'], [9, -5, 'start']];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const COL = ['pri', 'sec'];
  const IT = [];
  let mu = [P[1], P[3]], prev = null;
  for (let k = 0; k < 10; k++) {
    const d = P.map(p => [dist(p, mu[0]), dist(p, mu[1])]);
    const asg = d.map(([a, b]) => (a <= b ? 0 : 1));
    const nmu = [0, 1].map(c => {
      const m = P.filter((_, i) => asg[i] === c);
      return [m.reduce((t, p) => t + p[0], 0) / m.length, m.reduce((t, p) => t + p[1], 0) / m.length];
    });
    IT.push({ mu, d, asg, nmu, moved: asg.map((a, i) => !!prev && a !== prev[i]) });
    if (prev && asg.every((a, i) => a === prev[i])) break;
    prev = asg;
    mu = nmu;
  }
  const f3 = v => v.toFixed(3);
  const pt = p => `(${QV.fmt(p[0])}, ${QV.fmt(p[1])})`;
  const diamond = (g, x, y, r, cls, style) => s('path', { d: `M${x} ${y - r} L${x + r} ${y} L${x} ${y + r} L${x - r} ${y} Z`, class: cls, style }, g);
  const seg = (ax, x0, x1, y0, y1, w, b) => {
    const BOX = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], pts = [];
    BOX.forEach((pa, i) => {
      const pb = BOX[(i + 1) % 4], a = w[0] * pa[0] + w[1] * pa[1] + b, c = w[0] * pb[0] + w[1] * pb[1] + b;
      if (a * c < 0) { const r = a / (a - c); pts.push([pa[0] + r * (pb[0] - pa[0]), pa[1] + r * (pb[1] - pa[1])]); }
    });
    return pts;
  };
  // points equally far from both centroids: 2(μ₂ − μ₁)·p = |μ₂|² − |μ₁|²
  const bisector = (g, ax, m, xd, yd) => {
    const w = [2 * (m[1][0] - m[0][0]), 2 * (m[1][1] - m[0][1])], b = m[0][0] ** 2 + m[0][1] ** 2 - m[1][0] ** 2 - m[1][1] ** 2;
    const [p1, p2] = seg(ax, xd[0], xd[1], yd[0], yd[1], w, b);
    s('line', { x1: ax.x(p1[0]), y1: ax.y(p1[1]), x2: ax.x(p2[0]), y2: ax.y(p2[1]), class: 's-muted dash', style: 'stroke-width: 1.5' }, g);
  };

  table(viz('given'), ['Point'].concat(N), [['(x1, x2)'].concat(P.map(p => `(${p[0]}, ${p[1]})`))]);

  // Figure 1: iteration 1 distances
  const I1 = IT[0];
  const ds = svg(viz('dist'), 620, 370, { label: 'Seven points with centroids B and D, their perpendicular bisector, and bars of each point distance to both centroids', minWidth: 540 });
  const da = axes(ds, { x: 44, y: 24, w: 228, h: 304, xd: [0, 6], yd: [0, 8], xt: [0, 1, 2, 3, 4, 5, 6], yt: [0, 2, 4, 6, 8], grid: false, xl: 'x₁', yl: 'x₂' });
  bisector(ds, da, I1.mu, [0, 6], [0, 8]);
  const dl = s('g', {}, ds);
  const dp = s('g', {}, ds);
  P.forEach((p, i) => {
    if (i === 1 || i === 3) diamond(dp, da.x(p[0]), da.y(p[1]), 10, 'f-' + COL[i === 1 ? 0 : 1] + ' sep');
    else s('circle', { cx: da.x(p[0]), cy: da.y(p[1]), r: 5.5, class: 'f-' + COL[I1.asg[i]] }, dp);
    const [dx, dy, anc] = OFF[i];
    s('text', { x: da.x(p[0]) + dx, y: da.y(p[1]) + dy, 'text-anchor': anc, class: 't-fg t-bold halo' }, dp, N[i] + (i === 1 ? ' = μ₁' : i === 3 ? ' = μ₂' : ''));
  });
  const BX = 352, bs = v => v * 26;
  s('text', { x: BX, y: 20, class: 't-fg t-bold' }, ds, 'distance to μ₁ = B and to μ₂ = D');
  const rowG = P.map((p, i) => {
    const grp = s('g', { class: 'fade' }, ds), y = 38 + i * 44;
    s('text', { x: BX - 10, y: y + 14, dy: '0.35em', 'text-anchor': 'end', class: 't-fg t-bold' }, grp, N[i]);
    I1.d[i].forEach((d, c) => {
      const near = c === I1.asg[i];
      s('rect', { x: BX, y: y + c * 15, width: Math.max(1.5, bs(d)), height: 12, class: 'f-' + COL[c], style: near ? null : 'opacity: 0.35' }, grp);
      s('text', { x: BX + Math.max(1.5, bs(d)) + 5, y: y + c * 15 + 6, dy: '0.35em', class: (near ? 't-' + COL[c] + ' t-bold' : 't-muted') + ' t-sm' }, grp, f3(d));
    });
    return grp;
  });
  const dt = table(viz('d-table'), ['Point', 'd to μ₁', 'd to μ₂', 'Cluster'], P.map((p, i) => [`${N[i]} ${pt(p)}`, f3(I1.d[i][0]), f3(I1.d[i][1]), { text: String(I1.asg[i] + 1), cls: 'hl' }]));
  steps(viz('d-steps'), ['All'].concat(N), k => {
    dl.textContent = '';
    rowG.forEach((g, i) => g.classList.toggle('dim', k > 0 && i !== k - 1));
    dt.rows.forEach((r, i) => r.classList.toggle('on', i === k - 1));
    if (!k) {
      P.forEach((p, i) => {
        const m = I1.mu[I1.asg[i]];
        if (dist(p, m) > 0) s('line', { x1: da.x(p[0]), y1: da.y(p[1]), x2: da.x(m[0]), y2: da.y(m[1]), class: 's-' + COL[I1.asg[i]], style: 'stroke-width: 1; opacity: 0.6' }, dl);
      });
      role('d-note').textContent = 'All seven points. Each joins the nearer centroid: A, B, C go to μ₁ = B, and D, E, F, G go to μ₂ = D. G is the closest call: 3.202 against 2.915.';
      return;
    }
    const i = k - 1, p = P[i];
    I1.mu.forEach((m, c) => {
      const near = c === I1.asg[i], d = I1.d[i][c];
      if (d === 0) return;
      s('line', { x1: da.x(p[0]), y1: da.y(p[1]), x2: da.x(m[0]), y2: da.y(m[1]), class: 's-' + COL[c] + (near ? '' : ' dash'), style: 'stroke-width: ' + (near ? 2.5 : 1.5) }, dl);
      s('text', { x: (da.x(p[0]) + da.x(m[0])) / 2 + 6, y: (da.y(p[1]) + da.y(m[1])) / 2, dy: '0.35em', class: 't-' + COL[c] + ' t-bold halo' }, dl, f3(d));
    });
    const [d1, d2] = I1.d[i];
    role('d-note').textContent = `${N[i]} ${pt(p)}: d to μ₁ = ${f3(d1)}, d to μ₂ = ${f3(d2)}, so ${N[i]} joins cluster ${I1.asg[i] + 1}.` + (d1 === 0 || d2 === 0 ? ' It is a centroid itself, at distance 0.' : '');
  });

  table(viz('it2-table'), ['Point', 'd to μ₁', 'd to μ₂', 'Cluster'], P.map((p, i) => [N[i], f3(IT[1].d[i][0]), f3(IT[1].d[i][1]), { text: String(IT[1].asg[i] + 1) + (IT[1].moved[i] ? ' (moved)' : ''), cls: 'hl' }])).rows.forEach((r, i) => r.classList.toggle('on', IT[1].moved[i]));

  // Figure 2: the three iterations
  const it = svg(viz('iter'), 340, 412, { label: 'K-Means iterations: points coloured by cluster, centroids, their bisector and the move of each centroid to the mean of its cluster', minWidth: 320 });
  const ia = axes(it, { x: 44, y: 24, w: 264, h: 352, xd: [0, 6], yd: [0, 8], xt: [0, 1, 2, 3, 4, 5, 6], yt: [0, 2, 4, 6, 8], grid: false, xl: 'x₁', yl: 'x₂' });
  const idyn = s('g', {}, it);
  const IN = [
    'Iteration 1: centroids B and D. Clusters {A, B, C} and {D, E, F, G}. New centroids μ₁ = (1.833, 2.333) and μ₂ = (4.125, 5.375).',
    'Iteration 2: both centroids moved toward C, μ₂ much more. C is now 1.777 from μ₂ and 2.034 from μ₁, so it switches to cluster 2. New centroids μ₁ = (1.25, 1.5) and μ₂ = (3.9, 5.1).',
    'Iteration 3: no point changes cluster (C: 3.052 from μ₁, 1.421 from μ₂), so the centroids stay at (1.25, 1.5) and (3.9, 5.1). Converged.',
  ];
  steps(viz('it-steps'), IT.map((_, k) => 'Iteration ' + (k + 1)), k => {
    idyn.textContent = '';
    const r = IT[k];
    bisector(idyn, ia, r.mu, [0, 6], [0, 8]);
    P.forEach((p, i) => {
      if (r.moved[i]) s('circle', { cx: ia.x(p[0]), cy: ia.y(p[1]), r: 11, class: 's-ter', style: 'stroke-width: 2.5' }, idyn);
      s('circle', { cx: ia.x(p[0]), cy: ia.y(p[1]), r: 5.5, class: 'f-' + COL[r.asg[i]] }, idyn);
      const [dx, dy, anc] = OFF[i];
      s('text', { x: ia.x(p[0]) + dx, y: ia.y(p[1]) + dy, 'text-anchor': anc, class: 't-fg t-sm halo' }, idyn, N[i]);
    });
    r.mu.forEach((m, c) => {
      const n = r.nmu[c], dx = ia.x(n[0]) - ia.x(m[0]), dy = ia.y(n[1]) - ia.y(m[1]), L = Math.hypot(dx, dy);
      if (L > 2) {
        diamond(idyn, ia.x(n[0]), ia.y(n[1]), 8, 's-' + COL[c], 'stroke-width: 2');
        if (L > 22) arrow(idyn, ia.x(m[0]) + dx / L * 11, ia.y(m[1]) + dy / L * 11, ia.x(n[0]) - dx / L * 11, ia.y(n[1]) - dy / L * 11, { cls: 'a-' + COL[c], width: 1.5 });
      }
      diamond(idyn, ia.x(m[0]), ia.y(m[1]), 10, 'f-' + COL[c] + ' sep');
      s('text', { x: ia.x(m[0]) + 13, y: ia.y(m[1]) + (c ? -10 : 5), 'text-anchor': 'start', class: 't-' + COL[c] + ' t-bold halo' }, idyn, 'μ' + '₁₂'[c]);
    });
    role('it-note').textContent = IN[k];
  }, IT.length - 1);

  // Figure 3: squared distances after iteration 1 and at the end
  const sq = (r, mus) => P.map((p, i) => dist(p, mus[r.asg[i]]) ** 2);
  const S1 = sq(IT[0], IT[0].nmu), SF = sq(IT[IT.length - 1], IT[IT.length - 1].mu);
  const jb = svg(viz('jbars'), 660, 280, { label: 'Bar chart of each point squared distance to its own centroid after iteration 1 and at the end, totals 12.208 and 8.525', minWidth: 540 });
  const ja = axes(jb, { x: 56, y: 34, w: 580, h: 180, xd: [0.5, 7.5], yd: [0, 5], xt: [1, 2, 3, 4, 5, 6, 7], xf: i => N[i - 1], yt: [0, 1, 2, 3, 4, 5], xl: 'point', yl: 'squared distance to its own centroid' });
  P.forEach((p, i) => {
    [[S1[i], 'f-ter', -14], [SF[i], 'f-ok', 14]].forEach(([v, cls, off]) => {
      s('rect', { x: ja.x(i + 1) + off - 12, y: ja.y(v), width: 24, height: ja.y(0) - ja.y(v), class: cls }, jb);
      s('text', { x: ja.x(i + 1) + off, y: ja.y(v) - 5, 'text-anchor': 'middle', class: 't-sm t-fg' }, jb, v.toFixed(2));
    });
  });
  const tot = a => a.reduce((t, v) => t + v, 0).toFixed(3);
  s('text', { x: 636, y: 52, 'text-anchor': 'end', class: 't-ter t-bold' }, jb, 'after iteration 1: J = ' + tot(S1));
  s('text', { x: 636, y: 70, 'text-anchor': 'end', class: 't-ok t-bold' }, jb, 'final: J = ' + tot(SF));
});

QV.register('s1-w6', function (q) {
  const { s, svg, axes, plot, steps, table, box } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const ROWS = [
    ['Low', 'Enough', 'Poor', 'No'], ['Low', 'Little', 'Poor', 'No'], ['Low', 'Enough', 'Good', 'Yes'],
    ['Low', 'Little', 'Poor', 'No'], ['Medium', 'Enough', 'Poor', 'Yes'], ['Medium', 'Little', 'Good', 'No'],
    ['Medium', 'Enough', 'Good', 'Yes'], ['Medium', 'Little', 'Poor', 'No'], ['High', 'Little', 'Poor', 'Yes'],
    ['High', 'Enough', 'Good', 'Yes'], ['High', 'Little', 'Good', 'Yes'], ['Medium', 'Enough', 'Poor', 'Yes'],
  ];
  const H = p => (p <= 0 || p >= 1 ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p)));
  const yes = rs => rs.filter(r => r[3] === 'Yes').length;
  const Hs = rs => H(yes(rs) / rs.length);
  const fe = e => (e === 0 ? '0' : e.toFixed(3));
  const split = (rs, a, vals) => vals.map(v => { const sub = rs.filter(r => r[a] === v); return { v, n: sub.length, y: yes(sub), e: Hs(sub) }; });
  const gain = (rs, a, vals) => Hs(rs) - split(rs, a, vals).reduce((t, c) => t + c.n / rs.length * c.e, 0);

  table(viz('given'), ['#', 'Study', 'Sleep', 'Attendance', 'Pass'].map(t => ({ text: t, cls: 'l' })), ROWS.map((r, i) => [String(i + 1)].concat(r).map(v => ({ text: v, cls: 'l' }))));

  // Figure 1: entropy curve with the nodes on it
  const ent = svg(viz('ent'), 620, 270, { label: 'Two-class entropy against the share of Yes, with the whole dataset and the three Study children marked', minWidth: 520 });
  const ea = axes(ent, { x: 56, y: 26, w: 540, h: 190, xd: [0, 1], yd: [0, 1.1], xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 0.5, 1], xl: 'p₊, the share of Yes in the node', yl: 'E (bits)' });
  plot(ent, ea, H, 0, 1, 240, 's-pri');
  const mark = (p, cls, r) => s('circle', { cx: ea.x(p), cy: ea.y(H(p)), r, class: cls }, ent);
  const lead = (x1, y1, x2, y2) => s('line', { x1, y1, x2, y2, class: 's-muted', style: 'stroke-width: 1' }, ent);
  lead(ea.x(0.25), ea.y(H(0.25)) + 6, ea.x(0.25), ea.y(0.35) - 12);
  lead(ea.x(0.6), ea.y(H(0.6)) + 6, ea.x(0.6), ea.y(0.62) - 12);
  lead(ea.x(0.583) - 4, ea.y(H(7 / 12)) - 5, ea.x(0.55), ea.y(1.06) + 3);
  mark(0.25, 'f-ter', 5);
  mark(0.6, 'f-ter', 5);
  mark(1, 'f-ter', 5);
  mark(7 / 12, 'f-fg', 6);
  s('text', { x: ea.x(0.55), y: ea.y(1.06), 'text-anchor': 'end', class: 't-fg t-bold' }, ent, 'whole set: 7 Yes / 5 No, E = ' + fe(H(7 / 12)));
  s('text', { x: ea.x(0.6), y: ea.y(0.62), 'text-anchor': 'middle', class: 't-ter t-bold halo' }, ent, 'Study = Medium: 3 / 2, E = ' + fe(H(0.6)));
  s('text', { x: ea.x(0.3), y: ea.y(0.35), 'text-anchor': 'middle', class: 't-ter t-bold halo' }, ent, 'Study = Low: 1 / 3, E = ' + fe(H(0.25)));
  s('text', { x: ea.x(0.97), y: ea.y(0.06), 'text-anchor': 'end', class: 't-ter t-bold halo' }, ent, 'Study = High: 3 / 0, E = 0');

  // Figure 2: the three candidate roots
  const ATTR = [
    { a: 0, name: 'Study', vals: ['Low', 'Medium', 'High'] },
    { a: 1, name: 'Sleep', vals: ['Enough', 'Little'] },
    { a: 2, name: 'Attendance', vals: ['Poor', 'Good'] },
  ];
  const E0 = Hs(ROWS);
  const IG = ATTR.map(t => gain(ROWS, t.a, t.vals));
  const rt = svg(viz('root'), 720, 270, { label: 'The root node split by the chosen attribute into children with Yes and No counts and entropies, and a bar chart of the three information gains', minWidth: 560 });
  const ra = axes(rt, { x: 540, y: 34, w: 160, h: 190, xd: [0.5, 3.5], yd: [0, 0.4], xt: [1, 2, 3], xf: i => ['Study', 'Sleep', 'Attend.'][i - 1], yt: [0, 0.1, 0.2, 0.3], yl: 'information gain' });
  const rdyn = s('g', {}, rt);
  const RN = [
    'Study: three children. High is pure (3 Yes, 0 No), so it adds nothing to the weighted entropy. IG = 0.305, the largest, so Study is the root.',
    'Sleep: Enough is almost pure (5/1, E = 0.650), but Little is mixed (2/4, E = 0.918). IG = 0.196.',
    'Attendance: Poor is close to 50/50 (3/4, E = 0.985), which keeps the weighted entropy high. IG = 0.104, the smallest.',
  ];
  steps(viz('root-steps'), ATTR.map(t => t.name), k => {
    rdyn.textContent = '';
    const t = ATTR[k], ch = split(ROWS, t.a, t.vals);
    box(rdyn, 130, 8, 220, 46, 'all 12 rows: 7 Yes · 5 No\nE = ' + fe(E0), { cls: 'f-surface', textCls: 't-fg t-bold', lh: 16 });
    const xs = ch.length === 3 ? [80, 240, 400] : [140, 340];
    ch.forEach((c, i) => {
      const x = xs[i] - 70, y = 104;
      QV.arrow(rdyn, 240, 56, xs[i], y - 2, { cls: 'a-muted' });
      s('rect', { x, y, width: 140, height: 96, rx: 6, class: 'f-surface box' }, rdyn);
      s('text', { x: xs[i], y: y + 16, 'text-anchor': 'middle', class: 't-fg t-bold' }, rdyn, t.name + ' = ' + c.v);
      const bw = 120, yw = bw * c.y / c.n;
      if (c.y) s('rect', { x: x + 10, y: y + 26, width: yw, height: 12, class: 'f-pri' }, rdyn);
      if (c.n - c.y) s('rect', { x: x + 10 + yw, y: y + 26, width: bw - yw, height: 12, class: 'f-sec' }, rdyn);
      s('text', { x: xs[i], y: y + 54, 'text-anchor': 'middle', class: 't-fg' }, rdyn, `${c.y} Yes · ${c.n - c.y} No`);
      s('text', { x: xs[i], y: y + 70, 'text-anchor': 'middle', class: 't-fg t-bold' }, rdyn, 'E = ' + fe(c.e));
      s('text', { x: xs[i], y: y + 86, 'text-anchor': 'middle', class: 't-muted' }, rdyn, `weight ${c.n}/12`);
    });
    const wE = ch.reduce((a, c) => a + c.n / 12 * c.e, 0);
    s('text', { x: 20, y: 232, class: 't-fg' }, rdyn, 'weighted E = ' + ch.map(c => `${c.n}/12 × ${fe(c.e)}`).join(' + ') + ' = ' + wE.toFixed(3));
    s('text', { x: 20, y: 254, class: 't-ok t-bold' }, rdyn, `IG(S, ${t.name}) = ${fe(E0)} − ${wE.toFixed(3)} = ${IG[k].toFixed(3)}`);
    IG.forEach((v, i) => {
      s('rect', { x: ra.x(i + 1) - 18, y: ra.y(v), width: 36, height: ra.y(0) - ra.y(v), class: 'f-pri', style: i === k ? null : 'opacity: 0.35' }, rdyn);
      s('text', { x: ra.x(i + 1), y: ra.y(v) - 6, 'text-anchor': 'middle', class: 't-fg' }, rdyn, v.toFixed(3));
    });
    s('text', { x: ra.x(1), y: ra.y(IG[0]) - 21, 'text-anchor': 'middle', class: 't-ok t-bold' }, rdyn, 'root');
    role('root-note').textContent = RN[k];
  });

  // Figure 3: the tree, branch reasons and the two query paths
  const NODES = {
    root: { x: 360, y: 14, w: 170, t: 'Study', c: '7 Yes · 5 No', kind: 'dec' },
    low: { x: 140, y: 120, w: 170, t: 'Attendance', c: '1 Yes · 3 No', kind: 'dec' },
    med: { x: 400, y: 120, w: 170, t: 'Sleep', c: '3 Yes · 2 No', kind: 'dec' },
    high: { x: 630, y: 120, w: 110, t: 'Yes', c: '3 Yes · 0 No', kind: 'yes' },
    poor: { x: 70, y: 236, w: 110, t: 'No', c: '0 Yes · 3 No', kind: 'no' },
    good: { x: 210, y: 236, w: 110, t: 'Yes', c: '1 Yes · 0 No', kind: 'yes' },
    enough: { x: 340, y: 236, w: 110, t: 'Yes', c: '3 Yes · 0 No', kind: 'yes' },
    little: { x: 480, y: 236, w: 110, t: 'No', c: '0 Yes · 2 No', kind: 'no' },
  };
  const EDGES = [['root', 'low', 'Low'], ['root', 'med', 'Medium'], ['root', 'high', 'High'], ['low', 'poor', 'Poor'], ['low', 'good', 'Good'], ['med', 'enough', 'Enough'], ['med', 'little', 'Little']];
  const tr = svg(viz('tree'), 720, 330, { label: 'The ID3 decision tree: Study at the root, Attendance under Low, Sleep under Medium, and pure Yes and No leaves', minWidth: 560 });
  const eG = EDGES.map(([a, b, lab]) => {
    const grp = s('g', { class: 'fade' }, tr), A = NODES[a], B = NODES[b];
    const ln = s('line', { x1: A.x, y1: A.y + 44, x2: B.x, y2: B.y, class: 's-muted', style: 'stroke-width: 1.5' }, grp);
    s('text', { x: (A.x + B.x) / 2, y: (A.y + 44 + B.y) / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold halo' }, grp, lab);
    return { grp, ln, key: a + '>' + b };
  });
  const nG = {};
  Object.entries(NODES).forEach(([key, n]) => {
    const grp = s('g', { class: 'fade' }, tr);
    const cls = n.kind === 'yes' ? 'f-pri' : n.kind === 'no' ? 'f-sec' : 'f-surface';
    const tc = n.kind === 'dec' ? 't-fg' : 't-on';
    s('rect', { x: n.x - n.w / 2, y: n.y, width: n.w, height: 44, rx: 6, class: cls + ' box' }, grp);
    s('text', { x: n.x, y: n.y + 15, dy: '0.35em', 'text-anchor': 'middle', class: tc + ' t-bold' }, grp, n.t);
    s('text', { x: n.x, y: n.y + 31, dy: '0.35em', 'text-anchor': 'middle', class: tc + ' t-sm' }, grp, n.c);
    nG[key] = grp;
  });
  const foot = s('text', { x: 360, y: 312, 'text-anchor': 'middle', class: 't-fg t-bold' }, tr, '');
  const low = ROWS.filter(r => r[0] === 'Low'), med = ROWS.filter(r => r[0] === 'Medium');
  const igA = gain(low, 2, ['Poor', 'Good']), igS = gain(low, 1, ['Enough', 'Little']);
  const igS2 = gain(med, 1, ['Enough', 'Little']), igA2 = gain(med, 2, ['Poor', 'Good']);
  const VIEWS = [
    { on: null, path: [], foot: 'All 5 leaves are pure; every training row reaches a leaf with its own label' },
    { on: ['root', 'low', 'poor', 'good'], path: [], foot: `at Study = Low: Attendance IG = ${igA.toFixed(3)}, Sleep IG = ${igS.toFixed(3)}` },
    { on: ['root', 'med', 'enough', 'little'], path: [], foot: `at Study = Medium: Sleep IG = ${igS2.toFixed(3)}, Attendance IG = ${igA2.toFixed(3)}` },
    { on: ['root', 'med', 'little'], path: ['root>med', 'med>little'], foot: '{Study = Medium, Sleep = Little, Attendance = Good} → No' },
    { on: ['root', 'low', 'good'], path: ['root>low', 'low>good'], foot: '{Study = Low, Sleep = Enough, Attendance = Good} → Yes' },
  ];
  const TN = [
    'The complete tree. Every leaf is pure, and all 12 rows reach a leaf with their own label.',
    'Study = Low holds rows 1-4: 1 Yes, 3 No, E = 0.811. Attendance splits them perfectly (Poor 0/3, Good 1/0), IG = 0.811. Sleep leaves Enough mixed (1/1), IG = 0.311.',
    'Study = Medium holds rows 5, 6, 7, 8, 12: 3 Yes, 2 No, E = 0.971. Sleep splits them perfectly (Enough 3/0, Little 0/2), IG = 0.971. Attendance gives Poor 2/1 and Good 1/1, IG = 0.020.',
    '{Medium, Little, Good}: Study = Medium, then Sleep = Little, a No leaf. Attendance is never asked on this path.',
    '{Low, Enough, Good}: Study = Low, then Attendance = Good, a Yes leaf. Sleep is never asked on this path.',
  ];
  steps(viz('tree-steps'), ['Tree', 'Low branch', 'Medium branch', 'Predict 1', 'Predict 2'], k => {
    const v = VIEWS[k];
    Object.entries(nG).forEach(([key, g]) => g.classList.toggle('dim', !!v.on && !v.on.includes(key)));
    eG.forEach(e => {
      const [a, b] = e.key.split('>');
      const onPath = v.path.includes(e.key);
      e.grp.classList.toggle('dim', !!v.on && !(v.on.includes(a) && v.on.includes(b)));
      e.ln.setAttribute('class', onPath ? 's-ok' : 's-muted');
      e.ln.setAttribute('style', 'stroke-width: ' + (onPath ? 4 : 1.5));
    });
    foot.textContent = v.foot;
    foot.setAttribute('class', (k >= 3 ? 't-ok' : 't-fg') + ' t-bold');
    role('tree-note').textContent = TN[k];
  });
});

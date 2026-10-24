QV.register('s2-mc1', function (q) {
  const { s, svg, axes, line, plot, slider, table } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const pow10 = e => '10' + String(e).split('').map(d => SUP[+d]).join('');
  const sci = v => {
    let e = Math.floor(Math.log10(v)), m = Math.round(v / Math.pow(10, e) * 10) / 10;
    if (m >= 10) { m = 1; e += 1; }
    return (m === 1 ? '' : m + ' × ') + pow10(e);
  };
  const comma = n => n.toLocaleString('en-US');

  // Figure 1: J = u² + 6v² around the minimum; an elongated bowl, so no single α finishes in one step
  const B = svg(viz('bowl'), 640, 290, { label: 'Elliptical cost contours with the gradient descent path for the chosen learning rate and the minimum given by the normal equation', minWidth: 520 });
  const U = 44, C = { x: 320, y: 150 }, LIM = { u: 6.5, v: 2.9 };
  const px = (u, v) => [C.x + u * U, C.y - v * U];
  s('rect', { x: C.x - LIM.u * U, y: C.y - LIM.v * U, width: 2 * LIM.u * U, height: 2 * LIM.v * U, rx: 4, class: 'f-none box' }, B);
  [1, 4, 9, 16, 25, 36].forEach(c => s('ellipse', { cx: C.x, cy: C.y, rx: Math.sqrt(c) * U, ry: Math.sqrt(c / 6) * U, class: 's-line f-none' }, B));
  s('text', { x: C.x + LIM.u * U - 8, y: C.y + LIM.v * U - 8, 'text-anchor': 'end' }, B, 'θ₀');
  s('text', { x: C.x - LIM.u * U + 8, y: C.y - LIM.v * U + 16 }, B, 'θ₁');
  const path = s('g', {}, B);
  s('circle', { cx: C.x, cy: C.y, r: 6, class: 'f-ok' }, B);
  s('text', { x: C.x + 14, y: C.y - 6, class: 't-ok t-bold halo' }, B, 'normal equation');
  s('text', { x: C.x + 14, y: C.y + 10, class: 't-ok halo' }, B, 'θ = (XᵀX)⁻¹Xᵀy in one step');
  const START = [-5.6, 2.3];

  function run(a) {
    let [u, v] = START;
    const pts = [[u, v]];
    let k = 0, diverged = false;
    while (u * u + 6 * v * v >= 0.01 && k < 1000) {
      u *= 1 - 2 * a;
      v *= 1 - 12 * a;
      k++;
      if (u * u + 6 * v * v > 1e6) { diverged = true; break; }
      if (pts.length < 80) pts.push([u, v]);
    }
    return { pts, k, diverged };
  }

  function draw(r) {
    path.textContent = '';
    const vis = [];
    for (const [u, v] of r.pts) {
      if (Math.abs(u) > LIM.u || Math.abs(v) > LIM.v) break;
      vis.push(px(u, v));
    }
    line(path, vis, 's-pri').setAttribute('style', 'stroke-width: 1.8');
    vis.forEach(([x, y], i) => s('circle', { cx: x, cy: y, r: i ? 3 : 5, class: i ? 'f-pri' : 'f-surface outline-pri' }, path));
    if (r.diverged) s('text', { x: vis[vis.length - 1][0] + 10, y: vis[vis.length - 1][1] + 4, class: 't-bad t-bold halo' }, path, 'leaves the bowl');
  }

  slider(viz('slider'), { label: 'α', min: 0.01, max: 0.18, step: 0.01, value: 0.05, fmt: v => v.toFixed(2) }, a => {
    const r = run(a), as = a.toFixed(2);
    draw(r);
    role('alpha').textContent = as;
    const it = role('iters');
    it.textContent = r.diverged ? 'diverges' : String(r.k);
    it.className = 'v' + (r.diverged ? '' : ' pri');
    let t;
    if (r.diverged) t = `α = ${as} is too large. Every step overshoots the minimum by more than it gains, and gradient descent <b>diverges</b>. The normal equation has no α to get wrong.`;
    else if (r.k > 100) t = `α = ${as} is too small. Gradient descent needs <b>${r.k}</b> iterations to get close. The normal equation needs one solve.`;
    else t = `With α = ${as} gradient descent needs <b>${r.k}</b> iterations to reach J &lt; 0.01. The normal equation needs no α and one solve.`;
    role('verdict').innerHTML = t;
  });

  // Figure 2: rough operation counts, m = 10,000 examples and 10,000 iterations
  const M = 1e4;
  const NE = n => M * (n + 1) * (n + 1) + Math.pow(n + 1, 3);
  const GD = n => 1e4 * 2 * M * (n + 1);
  const G = svg(viz('growth'), 680, 300, { label: 'Operations against number of features on log scales: the normal equation grows like n cubed, gradient descent linearly; they cross near n = 10 to the 4', minWidth: 540 });
  const ax = axes(G, { x: 72, y: 24, w: 584, h: 222, xd: [0, 6], yd: [4, 19], xt: [0, 1, 2, 3, 4, 5, 6], yt: [4, 7, 10, 13, 16, 19], xf: v => ['1', '10', '100', '1,000'][v] || pow10(v), yf: v => pow10(v), xl: 'number of features n (log scale)', yl: 'operations (log scale)' });
  plot(G, ax, t => Math.log10(NE(Math.pow(10, t))), 0, 6, 240, 's-sec');
  plot(G, ax, t => Math.log10(GD(Math.pow(10, t))), 0, 6, 240, 's-pri');
  s('line', { x1: ax.x(4), x2: ax.x(4), y1: ax.y(4), y2: ax.y(Math.log10(GD(9999))), class: 's-muted dash', style: 'stroke-width: 1' }, G);
  s('text', { x: ax.x(4) - 6, y: ax.y(4) - 8, 'text-anchor': 'end', class: 't-sm' }, G, 'same work near n = 10⁴');
  s('text', { x: ax.x(1.2), y: ax.y(Math.log10(GD(Math.pow(10, 1.2)))) - 12, 'text-anchor': 'middle', class: 't-pri t-bold' }, G, 'gradient descent');
  s('text', { x: ax.x(5.05) - 10, y: ax.y(16.4), 'text-anchor': 'end', class: 't-sec t-bold' }, G, 'normal equation');
  const mk = s('g', {}, G);
  const NS = [3, 10, 30, 100, 300, 1000, 3000, 1e4, 3e4, 1e5, 3e5, 1e6];
  const nice = x => comma(Number(x.toPrecision(2)));

  slider(viz('slider-n'), { label: 'n', min: 0, max: NS.length - 1, step: 1, value: 9, fmt: i => comma(NS[i]) }, i => {
    const n = NS[i], t = Math.log10(n), ne = NE(n), gd = GD(n), r = ne / gd;
    mk.textContent = '';
    s('line', { x1: ax.x(t), x2: ax.x(t), y1: ax.y(4), y2: ax.y(19), class: 's-fg dash', style: 'opacity: 0.45' }, mk);
    s('circle', { cx: ax.x(t), cy: ax.y(Math.log10(ne)), r: 5, class: 'f-sec' }, mk);
    s('circle', { cx: ax.x(t), cy: ax.y(Math.log10(gd)), r: 5, class: 'f-pri' }, mk);
    role('size').textContent = comma(n + 1);
    role('ne').textContent = sci(ne);
    role('gd').textContent = sci(gd);
    let v;
    if (r > 0.8 && r < 1.25) v = `At n = ${comma(n)} the two methods cost about the same, roughly <b>${sci(gd)}</b> operations each.`;
    else if (r > 1) v = `At n = ${comma(n)} the normal equation needs about <b>${nice(r)}×</b> the work of 10,000 gradient descent iterations. Most of it is the (n+1)³ inverse.`;
    else v = `At n = ${comma(n)}${n === 3 ? ' (the slide example, XᵀX is 4 × 4)' : ''} the normal equation is about <b>${nice(1 / r)}×</b> cheaper. With few features it is the faster method.`;
    role('verdict-n').innerHTML = v;
  });

  const T = table(viz('table'), ['', 'Gradient descent', 'Normal equation', 'Options'].map(t => ({ text: t, cls: 'l' })), [
    ['Learning rate', 'need to choose learning rate α', 'no need to choose α', 'a and d swap these, false'],
    ['Iterations', 'a lot of iterations are required to find the optimal solution', 'no need for iterations', 'b swaps these, false'],
    ['Many features', 'very good if the number of features is very large', 'very slow if the number of features is very large, (Xᵀ·X)⁻¹ needs to be calculated', 'c, true'],
  ].map(r => r.map((c, i) => ({ text: c, cls: i === 3 && c === 'c, true' ? 'l hl' : 'l' }))));
  T.rows[2].classList.add('on');
});

QV.register('s2-mc2', function (q) {
  const { s, svg, axes, plot, line, slider } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  const W = svg(viz('curves'), 640, 290, { label: 'Log loss curves: minus log h for y = 1 and minus log of 1 minus h for y = 0, with the four options marked', minWidth: 520 });
  const ax = axes(W, { x: 52, y: 22, w: 560, h: 212, xd: [0, 1], yd: [0, 5], xt: [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1], yt: [0, 1, 2, 3, 4, 5], xl: 'hθ(x), the predicted probability that y = 1', yl: 'cost' });
  line(W, [[ax.x(0), ax.y(1)], [ax.x(1), ax.y(0)]], 's-muted dash');
  plot(W, ax, h => -Math.log(h), Math.exp(-5), 1, 400, 's-pri');
  plot(W, ax, h => -Math.log(1 - h), 0, 1 - Math.exp(-5), 400, 's-sec');
  s('text', { x: ax.x(0.13), y: ax.y(3.9), class: 't-pri t-bold' }, W, 'y = 1: −log(h)');
  s('text', { x: ax.x(0.94), y: ax.y(3.9), 'text-anchor': 'end', class: 't-sec t-bold' }, W, 'y = 0: −log(1 − h)');
  s('text', { x: ax.x(0.25), y: ax.y(0.75) - 7, 'text-anchor': 'middle', class: 't-muted' }, W, '1 − h');

  const badge = (x, y, k, ok) => {
    s('circle', { cx: x, cy: y, r: 9, class: ok ? 'f-ok' : 'f-surface box' }, W);
    s('text', { x, y, dy: '0.35em', 'text-anchor': 'middle', class: ok ? 't-on t-bold' : 't-fg' }, W, k);
  };
  [['a', 0.9, -Math.log(0.9), 0, -15, 'middle', '0.105'],
    ['b', 0.1, -Math.log(0.1), 12, -12, 'start', '2.303'],
    ['c', 0.5, Math.log(2), 0, -17, 'middle', '0.693'],
    ['d', 0.1, 0.9, -13, -14, 'end', '0.9']].forEach(([k, h, c, dx, dy, anc, txt]) => {
    const x = ax.x(h), y = ax.y(c), ok = k === 'b';
    badge(x, y, k, ok);
    s('text', { x: x + dx, y: y + dy, dy: '0.35em', 'text-anchor': anc, class: (ok ? 't-ok t-bold' : 't-fg') + ' halo' }, W, txt);
  });
  const mk = s('g', {}, W);

  slider(viz('slider'), { label: 'h', min: 0.01, max: 0.99, step: 0.01, value: 0.1, fmt: v => v.toFixed(2) }, h => {
    const c1 = -Math.log(h), c0 = -Math.log(1 - h), hs = h.toFixed(2);
    mk.textContent = '';
    s('line', { x1: ax.x(h), x2: ax.x(h), y1: ax.y(0), y2: ax.y(5), class: 's-fg dash', style: 'opacity: 0.4' }, mk);
    s('circle', { cx: ax.x(h), cy: ax.y(c1), r: 12, class: 's-pri' }, mk);
    s('circle', { cx: ax.x(h), cy: ax.y(c0), r: 12, class: 's-sec' }, mk);
    role('h').textContent = hs;
    role('c1').textContent = c1.toFixed(3);
    role('c0').textContent = c0.toFixed(3);
    let t;
    if (hs === '0.10') t = 'With y = 1, h = 0.1 costs −ln 0.1 = <b>2.303</b>, option b. With y = 0 the same h would cost only 0.105.';
    else if (hs === '0.90') t = 'With y = 1, h = 0.9 costs −ln 0.9 = <b>0.105</b>, option a. That is the cost of a good prediction.';
    else if (hs === '0.50') t = 'At h = 0.5 both labels cost −ln 0.5 = <b>0.693</b>, option c.';
    else t = `With y = 1, h = ${hs} costs −ln ${hs} = <b>${c1.toFixed(3)}</b>. ` + (h < 0.5 ? 'The model leans to the wrong class, and the cost climbs fast as h goes to 0.' : 'The model leans to the right class, so the cost is small.');
    role('verdict').innerHTML = t;
  });
});

QV.register('s2-mc3', function (q) {
  const { s, svg, axes, line, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const X = [1, 2, 3, 4, 5], Y = [3, 6, 9, 7, 15], MEAN = 8;
  const F = x => 2 + 2 * x;

  // Figure 1: gaps to the mean and to the model, and their squared sums
  const W = svg(viz('scatter'), 360, 300, { label: 'Five test points with the mean line and the model line, and the gaps from each point to both lines', minWidth: 360, maxWidth: 360 });
  const ax = axes(W, { x: 44, y: 18, w: 300, h: 228, xd: [0.5, 5.5], yd: [0, 16], xt: X, yt: [0, 4, 8, 12, 16], xl: 'x', yl: 'y' });
  line(W, [[ax.x(0.5), ax.y(MEAN)], [ax.x(5.5), ax.y(MEAN)]], 's-sec dash');
  line(W, [[ax.x(0.5), ax.y(F(0.5))], [ax.x(5.5), ax.y(F(5.5))]], 's-pri');
  s('text', { x: ax.x(0.5) + 4, y: ax.y(MEAN) - 6, class: 't-sec t-bold' }, W, 'ȳ = 8');
  s('text', { x: 256, y: 70, 'text-anchor': 'end', class: 't-pri t-bold' }, W, 'ŷ = 2 + 2x');
  const BS = svg(viz('bars'), 340, 270, { label: 'Squared gaps added up: SS_tot = 80 and SS_res = 20, a quarter of it', minWidth: 340, maxWidth: 340 });
  const tot = s('g', { class: 'fade' }, W), res = s('g', { class: 'fade' }, W);
  const totB = s('g', { class: 'fade' }, BS), resB = s('g', { class: 'fade' }, BS);
  X.forEach((x, i) => {
    const y = Y[i], f = F(x), sx = ax.x(x - 0.07), rx = ax.x(x + 0.07);
    // long gaps put the label nearer the mean line, clear of the model line
    const ly = Math.abs(y - MEAN) > 4 ? MEAN + 0.4 * (y - MEAN) : (y + MEAN) / 2;
    s('line', { x1: sx, x2: sx, y1: ax.y(y), y2: ax.y(MEAN), class: 's-sec' }, tot);
    s('text', { x: sx - 5, y: ax.y(ly), dy: '0.35em', 'text-anchor': 'end', class: 't-sec t-sm t-bold halo' }, tot, String((y - MEAN) ** 2));
    if (y !== f) s('line', { x1: rx, x2: rx, y1: ax.y(y), y2: ax.y(f), class: 's-pri' }, res);
    s('text', { x: rx + 5, y: y === f ? ax.y(y) : (ax.y(y) + ax.y(f)) / 2, dy: '0.35em', class: 't-pri t-sm t-bold halo' }, res, String((y - f) ** 2));
  });
  X.forEach((x, i) => s('circle', { cx: ax.x(x), cy: ax.y(Y[i]), r: 5, class: 'f-fg' }, W));

  const BX = 10, K = 3.6;
  const bar = (g, y, vals, fill, txt, total, name) => {
    s('text', { x: BX, y: y - 8, class: txt + ' t-bold' }, g, name);
    let x = BX;
    vals.forEach(v => {
      const w = v * K;
      if (w > 0) s('rect', { x, y, width: w, height: 28, class: fill + ' sep' }, g);
      if (w >= 16) s('text', { x: x + w / 2, y: y + 14, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-sm' }, g, String(v));
      x += w;
    });
    s('text', { x: x + 6, y: y + 14, dy: '0.35em', class: txt + ' t-bold' }, g, String(total));
  };
  bar(totB, 62, [25, 4, 1, 1, 49], 'f-sec', 't-sec', 80, 'SS_tot = Σ(y − ȳ)²');
  bar(resB, 136, [1, 0, 1, 9, 9], 'f-pri', 't-pri', 20, 'SS_res = Σ(y − ŷ)²');
  s('line', { x1: BX, x2: BX + 80 * K, y1: 180, y2: 180, class: 'l-axis' }, BS);
  [0, 20, 40, 60, 80].forEach(v => {
    s('line', { x1: BX + v * K, x2: BX + v * K, y1: 180, y2: 185, class: 'l-axis' }, BS);
    s('text', { x: BX + v * K, y: 198, 'text-anchor': 'middle' }, BS, String(v));
  });
  [[58, 94], [132, 180]].forEach(([y1, y2]) => s('line', { x1: BX + 20 * K, x2: BX + 20 * K, y1, y2, class: 's-fg dash', style: 'stroke-width: 1; opacity: 0.6' }, BS));
  s('text', { x: BX, y: 236, class: 't-ok t-bold t-lg' }, BS, 'R² = 1 − 20/80 = 0.75');
  s('text', { x: BX, y: 256, class: 't-fg' }, BS, 'SS_res is a quarter of SS_tot.');

  const note = role('note');
  steps(viz('steps'), ['All', 'SS_tot · gaps to the mean', 'SS_res · gaps to the model'], k => {
    [tot, totB].forEach(g => g.classList.toggle('dim', k === 2));
    [res, resB].forEach(g => g.classList.toggle('dim', k === 1));
    note.textContent = [
      'Both sums. The model line leaves much smaller gaps than the flat mean line, 20 against 80.',
      'SS_tot squares each gap to the mean ȳ = 8 and adds them: 25 + 4 + 1 + 1 + 49 = 80. It is the error of always predicting the mean.',
      'SS_res squares each gap to the model line and adds them: 1 + 0 + 1 + 9 + 9 = 20. It is the error the model leaves.',
    ][k];
  });

  // Figure 2: the split of SS_tot and the R² scale with the options
  const S = svg(viz('scale'), 680, 200, { label: 'SS_tot of 80 split into 60 explained and 20 unexplained, and the four options on the R squared scale', minWidth: 540 });
  const k7 = 7, bx0 = 60;
  s('text', { x: bx0, y: 16, class: 't-fg t-bold' }, S, 'SS_tot = 80');
  s('rect', { x: bx0, y: 24, width: 60 * k7, height: 28, class: 'f-ok sep' }, S);
  s('rect', { x: bx0 + 60 * k7, y: 24, width: 20 * k7, height: 28, class: 'f-pri sep' }, S);
  s('text', { x: bx0 + 30 * k7, y: 38, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, S, 'explained by the model: 60 = 75%');
  s('text', { x: bx0 + 70 * k7, y: 38, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, S, 'SS_res 20 = 25%');
  const R = v => 60 + (v + 3.5) * 70, LY = 130;
  s('rect', { x: R(-3.5), y: LY - 22, width: R(1) - R(-3.5), height: 22, class: 'f-ok-soft' }, S);
  s('rect', { x: R(1), y: LY - 22, width: R(4.5) - R(1), height: 22, class: 'f-bad-soft' }, S);
  s('text', { x: R(-1.75), y: LY - 11, dy: '0.35em', 'text-anchor': 'middle', class: 't-ok t-sm' }, S, 'R² ≤ 1, possible');
  s('text', { x: R(2.75), y: LY - 11, dy: '0.35em', 'text-anchor': 'middle', class: 't-bad t-sm' }, S, 'R² > 1, impossible');
  [[0, '0 = same as the mean', 'end', -4], [1, '1 = perfect fit', 'start', 4]].forEach(([v, t, anc, dx]) => {
    s('line', { x1: R(v), x2: R(v), y1: LY - 28, y2: LY, class: 's-fg', style: 'stroke-width: 1' }, S);
    s('text', { x: R(v) + dx, y: LY - 32, 'text-anchor': anc, class: 't-fg t-sm' }, S, t);
  });
  s('line', { x1: R(-3.5), x2: R(4.5), y1: LY, y2: LY, class: 'l-axis' }, S);
  for (let v = -3; v <= 4; v++) {
    s('line', { x1: R(v), x2: R(v), y1: LY, y2: LY + 5, class: 'l-axis' }, S);
    s('text', { x: R(v), y: LY + 17, 'text-anchor': 'middle' }, S, String(v).replace('-', '−'));
  }
  [['c', -3, '1 − 80/20', 'start'], ['a', 0.25, '20/80', 'end'], ['d', 0.75, '1 − 20/80', 'start'], ['b', 4, '80/20', 'end']].forEach(([key, v, why, anc]) => {
    const x = R(v), ok = key === 'd', y = 174;
    s('circle', { cx: x, cy: y, r: 9, class: ok ? 'f-ok' : 'f-surface box' }, S);
    s('text', { x, y, dy: '0.35em', 'text-anchor': 'middle', class: ok ? 't-on t-bold' : 't-fg' }, S, key);
    s('text', { x: anc === 'start' ? x + 14 : x - 14, y, dy: '0.35em', 'text-anchor': anc, class: ok ? 't-ok t-bold' : 't-fg' }, S, why + ' = ' + String(v).replace('-', '−'));
  });
});

QV.register('s2-mc4', function (q) {
  const { s, svg, axes, line, plot, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: the grid route against the straight line
  const G = svg(viz('grid'), 560, 330, { label: 'Points (1, 2) and (4, 6) on a grid: Manhattan staircase routes of length 7 and the straight Euclidean line of length 5', minWidth: 460 });
  const U = 40, O = { x: 44, y: 300 };
  const P = (x, y) => [O.x + x * U, O.y - y * U];
  for (let i = 0; i <= 7; i++) {
    s('line', { x1: P(i, 0)[0], x2: P(i, 7)[0], y1: P(i, 0)[1], y2: P(i, 7)[1], class: 'l-grid' }, G);
    s('line', { x1: P(0, i)[0], x2: P(7, i)[0], y1: P(0, i)[1], y2: P(7, i)[1], class: 'l-grid' }, G);
    s('text', { x: P(i, 0)[0], y: O.y + 16, 'text-anchor': 'middle', class: 't-sm' }, G, String(i));
    if (i) s('text', { x: O.x - 8, y: P(0, i)[1], dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, G, String(i));
  }
  s('line', { x1: O.x, x2: P(7, 0)[0], y1: O.y, y2: O.y, class: 'l-axis' }, G);
  s('line', { x1: O.x, x2: O.x, y1: O.y, y2: P(0, 7)[1], class: 'l-axis' }, G);
  const route = (pts, cls, style) => line(G, pts.map(([x, y]) => P(x, y)), cls).setAttribute('style', style);
  route([[1, 2], [1, 6], [4, 6]], 's-pri dash', 'stroke-width: 1.5; opacity: 0.5');
  route([[1, 2], [2, 2], [2, 3], [3, 3], [3, 5], [4, 5], [4, 6]], 's-pri dash', 'stroke-width: 1.5; opacity: 0.5');
  route([[1, 2], [4, 2], [4, 6]], 's-pri', 'stroke-width: 4');
  route([[1, 2], [4, 6]], 's-sec', 'stroke-width: 2.5');
  s('text', { x: P(2.5, 2)[0], y: P(2.5, 2)[1] + 17, 'text-anchor': 'middle', class: 't-pri t-bold halo' }, G, '|1 − 4| = 3');
  s('text', { x: P(4, 4)[0] + 8, y: P(4, 4)[1], dy: '0.35em', class: 't-pri t-bold halo' }, G, '|2 − 6| = 4');
  s('text', { x: P(2.5, 4)[0] - 16, y: P(2.5, 4)[1] - 12, 'text-anchor': 'middle', class: 't-sec t-bold t-lg halo' }, G, '5');
  [[1, 2, '(1, 2)', -6, 18, 'end'], [4, 6, '(4, 6)', 8, -10, 'start']].forEach(([x, y, t, dx, dy, anc]) => {
    s('circle', { cx: P(x, y)[0], cy: P(x, y)[1], r: 6, class: 'f-fg' }, G);
    s('text', { x: P(x, y)[0] + dx, y: P(x, y)[1] + dy, 'text-anchor': anc, class: 't-fg t-bold halo' }, G, t);
  });
  [[54, 't-pri t-bold', 'p = 1, Manhattan'], [74, 't-fg', '|1 − 4| + |2 − 6|'], [92, 't-fg', '= 3 + 4 = 7'],
    [132, 't-sec t-bold', 'p = 2, Euclidean'], [152, 't-fg', '√((1 − 4)² + (2 − 6)²)'], [170, 't-fg', '= √(9 + 16) = 5'],
    [216, 't-muted', 'Every staircase route on'], [232, 't-muted', 'the grid is 3 + 4 = 7 long.']].forEach(([y, cls, t]) => s('text', { x: 350, y, class: cls }, G, t));

  // Figure 2: d(p) = (3ᵖ + 4ᵖ)^(1/p)
  const D = p => Math.pow(Math.pow(3, p) + Math.pow(4, p), 1 / p);
  const C = svg(viz('curve'), 640, 270, { label: 'Minkowski distance between the two points as p goes from 1 to 10, falling from 7 toward 4, with options a, b and c on the curve', minWidth: 520 });
  const ax = axes(C, { x: 48, y: 40, w: 560, h: 184, xd: [1, 10], yd: [0, 8], xt: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], yt: [0, 2, 4, 6, 8], xl: 'p', yl: 'distance' });
  line(C, [[ax.x(1), ax.y(4)], [ax.x(10), ax.y(4)]], 's-muted dash');
  s('text', { x: ax.x(10) - 4, y: ax.y(4) + 16, 'text-anchor': 'end', class: 't-muted' }, C, 'max(3, 4) = 4 as p grows');
  plot(C, ax, D, 1, 10, 300, 's-pri');
  const badge = (x, y, k, ok) => {
    s('circle', { cx: x, cy: y, r: 9, class: ok ? 'f-ok' : 'f-surface box' }, C);
    s('text', { x, y, dy: '0.35em', 'text-anchor': 'middle', class: ok ? 't-on t-bold' : 't-fg' }, C, k);
  };
  [['a', 1, 14, 0, 'start', '7, Manhattan'], ['b', 2, 12, -17, 'start', '5, Euclidean'], ['c', 3, 12, -13, 'start', '4.50']].forEach(([k, p, dx, dy, anc, t]) => {
    const x = ax.x(p), y = ax.y(D(p)), ok = k === 'a';
    badge(x, y, k, ok);
    s('text', { x: x + dx, y: y + dy, dy: '0.35em', 'text-anchor': anc, class: (ok ? 't-ok t-bold' : 't-fg') + ' halo' }, C, t);
  });
  badge(214, 16, 'd', false);
  s('text', { x: 228, y: 16, dy: '0.35em', class: 't-fg' }, C, '25 = 3² + 4², the sum before the root, is off this scale');
  const mk = s('g', {}, C);

  slider(viz('slider'), { label: 'p', min: 1, max: 10, step: 0.1, value: 1, fmt: v => fmt(v, 1) }, p => {
    const sum = Math.pow(3, p) + Math.pow(4, p), d = D(p), ps = fmt(p, 1);
    mk.textContent = '';
    s('line', { x1: ax.x(p), x2: ax.x(p), y1: ax.y(0), y2: ax.y(8), class: 's-fg dash', style: 'opacity: 0.4' }, mk);
    s('circle', { cx: ax.x(p), cy: ax.y(d), r: 12, class: 's-pri' }, mk);
    role('p').textContent = ps;
    role('sum').textContent = sum < 1000 ? fmt(sum, 2) : Math.round(sum).toLocaleString('en-US');
    role('d').textContent = fmt(d, 3);
    let t;
    if (ps === '1') t = 'p = 1: the powers and the root drop out, so d = 3 + 4 = <b>7</b>, the Manhattan distance. Option a.';
    else if (ps === '2') t = 'p = 2: d = √(9 + 16) = <b>5</b>, the Euclidean distance. Option b.';
    else if (ps === '3') t = 'p = 3: d = (27 + 64)^(1/3) = <b>4.50</b>. Option c.';
    else t = `p = ${ps}: d = (${role('sum').textContent})^(1/${ps}) = <b>${fmt(d, 3)}</b>. As p grows, d falls toward the larger gap, 4.`;
    role('verdict').innerHTML = t;
  });
});

QV.register('s2-mc5', function (q) {
  const { s, svg, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: the 15 visits as tokens in the Day × Purchase table
  const W = svg(viz('table'), 440, 236, { label: 'The 15 shopping visits sorted by day and purchase, with the Buy column and the Weekday row outlined', minWidth: 400 });
  const ROWS = [['Weekday (B)', [1, 2, 8, 15], [3]], ['Weekend', [5, 13], [7, 9]], ['Holiday', [4, 10, 11, 14], [6, 12]]];
  const COL = { buy: { x: 100, w: 180 }, no: { x: 290, w: 100 } }, RY = r => 30 + r * 56, RH = 48, TX = 420;
  s('text', { x: COL.buy.x + COL.buy.w / 2, y: 18, 'text-anchor': 'middle', class: 't-pri t-bold' }, W, 'Buy (A)');
  s('text', { x: COL.no.x + COL.no.w / 2, y: 18, 'text-anchor': 'middle', class: 't-fg t-bold' }, W, 'No Buy');
  s('text', { x: TX, y: 18, 'text-anchor': 'middle', class: 't-muted' }, W, 'total');
  const tokens = [];
  ROWS.forEach(([day, buy, no], r) => {
    const y = RY(r);
    s('text', { x: 0, y: y + RH / 2, dy: '0.35em', class: r === 0 ? 't-sec t-bold' : 't-fg' }, W, day);
    [['buy', buy], ['no', no]].forEach(([c, list]) => {
      s('rect', { x: COL[c].x, y, width: COL[c].w, height: RH, rx: 4, class: 'f-none box' }, W);
      list.forEach((n, i) => {
        const g = s('g', { class: 'fade' }, W);
        const cx = COL[c].x + 25 + i * 40, cy = y + RH / 2;
        s('circle', { cx, cy, r: 15, class: c === 'buy' ? 'f-pri' : 'f-seg box' }, g);
        s('text', { x: cx, y: cy, dy: '0.35em', 'text-anchor': 'middle', class: c === 'buy' ? 't-on' : 't-fg' }, g, String(n));
        tokens.push({ g, buy: c === 'buy', wd: r === 0 });
      });
    });
    s('text', { x: TX, y: y + RH / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, W, String(buy.length + no.length));
  });
  s('text', { x: 0, y: 214, class: 't-muted' }, W, 'total');
  [[COL.buy.x + COL.buy.w / 2, '10'], [COL.no.x + COL.no.w / 2, '5'], [TX, '15']].forEach(([x, t]) => s('text', { x, y: 214, 'text-anchor': 'middle', class: 't-fg t-bold' }, W, t));
  s('rect', { x: COL.buy.x - 4, y: RY(0) - 4, width: COL.buy.w + 8, height: RY(2) + RH - RY(0) + 8, rx: 6, class: 'f-none outline-pri' }, W);
  s('rect', { x: COL.buy.x - 8, y: RY(0) - 7, width: COL.no.x + COL.no.w - COL.buy.x + 16, height: RH + 14, rx: 8, class: 'f-none outline-sec' }, W);

  const SEL = [
    null,
    { num: t => t.buy, den: () => true },
    { num: t => t.buy && t.wd, den: t => t.buy },
    { num: t => t.wd, den: () => true },
    { num: t => t.buy && t.wd, den: t => t.wd },
  ];
  const NOTES = [
    'A = Buy is the blue column and B = Weekday is the plum row. P(A | B) looks only inside the Weekday row, where 4 of the 5 visits bought.',
    'P(A) = P(Buy) = 10/15, the prior. It counts the Buy column against all 15 visits.',
    'P(B | A) = P(Weekday | Buy) = 4/10, the likelihood. It counts inside the Buy column only. 4 of the 10 buyers came on a weekday.',
    'P(B) = P(Weekday) = 5/15, the evidence. It counts the Weekday row against all 15 visits.',
    'P(A | B) = P(Buy | Weekday) = 4/5 = 0.8, the posterior. It counts inside the Weekday row only. The formula (4/10 · 10/15) / (5/15) gives the same 0.8.',
  ];
  const note = role('note');
  steps(viz('steps'), ['All', 'P(A)', 'P(B | A)', 'P(B)', 'P(A | B)'], k => {
    tokens.forEach(t => {
      const sel = SEL[k];
      t.g.style.opacity = !sel || sel.num(t) ? '1' : sel.den(t) ? '0.4' : '0.1';
    });
    [1, 2, 3, 4].forEach(i => { role('t' + i).className = 'v' + ((k || 4) === i ? (i === 4 ? ' ok' : ' pri') : ''); });
    note.textContent = NOTES[k];
  });

  // Figure 2: each option evaluated on the same counts
  const O = svg(viz('options'), 640, 232, { label: 'The four option formulas evaluated with A = Buy and B = Weekday: 0.222, 0.2, 0.8 and 0.267, against the counted 0.8', minWidth: 520 });
  const bx = v => 250 + v * 340;
  s('line', { x1: bx(0.8), x2: bx(0.8), y1: 20, y2: 204, class: 's-ok dash', style: 'stroke-width: 1.5' }, O);
  s('text', { x: bx(0.8), y: 12, 'text-anchor': 'middle', class: 't-ok t-bold' }, O, 'counted: 4/5 = 0.8');
  [['a', 'P(A) · P(B)', '10/15 · 5/15', 10 / 15 * 5 / 15, '0.222'],
    ['b', 'P(B | A) · P(B) / P(A)', '4/10 · (5/15) / (10/15)', 0.2, '0.2'],
    ['c', 'P(B | A) · P(A) / P(B)', '4/10 · (10/15) / (5/15)', 0.8, '0.8'],
    ['d', 'P(A | B) · P(B)', '0.8 · 5/15', 4 / 15, '0.267 = P(A and B)']].forEach(([k, f, nums, v, txt], i) => {
    const y = 26 + i * 46, ok = k === 'c';
    s('circle', { cx: 10, cy: y + 13, r: 9, class: ok ? 'f-ok' : 'f-surface box' }, O);
    s('text', { x: 10, y: y + 13, dy: '0.35em', 'text-anchor': 'middle', class: ok ? 't-on t-bold' : 't-fg' }, O, k);
    s('text', { x: 28, y: y + 9, class: ok ? 't-ok t-bold' : 't-fg' }, O, f);
    s('text', { x: 28, y: y + 24, class: 't-muted t-sm' }, O, nums);
    s('rect', { x: bx(0), y, width: bx(v) - bx(0), height: 26, rx: 3, class: ok ? 'f-ok' : 'f-sec-soft' }, O);
    if (ok) s('text', { x: bx(v) - 6, y: y + 13, dy: '0.35em', 'text-anchor': 'end', class: 't-on t-bold' }, O, txt);
    else s('text', { x: bx(v) + 6, y: y + 13, dy: '0.35em', class: 't-fg' }, O, txt);
  });
  s('line', { x1: bx(0), x2: bx(1), y1: 210, y2: 210, class: 'l-axis' }, O);
  [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(v => {
    s('line', { x1: bx(v), x2: bx(v), y1: 210, y2: 215, class: 'l-axis' }, O);
    s('text', { x: bx(v), y: 227, 'text-anchor': 'middle' }, O, String(v));
  });
});

QV.register('s2-mc6', function (q) {
  const { s, svg, axes, plot, slider, fmt, box } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: cards for ID3, C4.5, KNN and CART with CART's two kinds of tree
  const F = svg(viz('family'), 560, 316, { label: 'Cards for ID3 (entropy), C4.5 (improved ID3), KNN (not a tree) and CART (Gini, classification and regression trees)', minWidth: 460 });
  const badge = (x, y, k, ok) => {
    s('circle', { cx: x, cy: y, r: 10, class: ok ? 'f-ok' : 'f-surface box' }, F);
    s('text', { x, y, dy: '0.35em', 'text-anchor': 'middle', class: ok ? 't-on t-bold' : 't-fg' }, F, k);
  };
  const card = (x, y, w, h, title, lines, key, cls) => {
    s('rect', { x, y, width: w, height: h, rx: 8, class: cls }, F);
    s('text', { x: x + 16, y: y + 26, class: 't-fg t-bold t-lg' }, F, title);
    lines.forEach((l, i) => s('text', { x: x + 16, y: y + 50 + i * 17, class: 't-fg' }, F, l));
    badge(x + w - 22, y + 22, key, key === 'b');
  };
  card(8, 8, 172, 118, 'ID3', ['splits by entropy', '(information gain)'], 'a', 'f-surface box');
  card(194, 8, 172, 118, 'C4.5', ['an improved ID3,', 'handles missing data', 'and continuous', 'attributes'], 'c', 'f-surface box');
  card(380, 8, 172, 118, 'KNN', ['not a tree. It labels', 'a point by the vote', 'of its k nearest', 'neighbours'], 'd', 'f-surface box dash');
  QV.arrow(F, 181, 34, 193, 34, { cls: 'a-muted', head: 6 });
  card(8, 140, 544, 168, 'CART', ['splits by Gini', 'impurity,', 'Gini = 1 − Σ pᵢ²', '', 'classification', 'and regression'], 'b', 'f-ok-soft box');
  [[255, 'classification tree', ['Yes', 'No'], 'leaf = a class'], [445, 'regression tree', ['ŷ = 3.1', 'ŷ = 7.8'], 'leaf = a number']].forEach(([cx, title, leaves, cap]) => {
    s('text', { x: cx, y: 172, 'text-anchor': 'middle', class: 't-fg t-bold' }, F, title);
    box(F, cx - 50, 182, 100, 26, 'x₁ ≤ t ?', { cls: 'f-surface' });
    [-1, 1].forEach((sd, i) => {
      s('line', { x1: cx, y1: 208, x2: cx + sd * 46, y2: 248, class: 's-muted' }, F);
      s('text', { x: cx + sd * 30, y: 230, 'text-anchor': sd < 0 ? 'end' : 'start', class: 't-sm' }, F, i ? 'no' : 'yes');
      box(F, cx + sd * 46 - 40, 248, 80, 26, leaves[i], { cls: 'f-pri', textCls: 't-on' });
    });
    s('text', { x: cx, y: 294, 'text-anchor': 'middle', class: 't-muted' }, F, cap);
  });

  // Figure 2: Gini and entropy against the share of Yes in a 14-example node
  const gini = p => 1 - p * p - (1 - p) * (1 - p);
  const ent = p => (p <= 0 || p >= 1) ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
  const W = svg(viz('curves'), 640, 280, { label: 'Gini impurity and entropy against the share of Yes examples; both are zero for a pure node and largest at one half', minWidth: 520 });
  const ax = axes(W, { x: 52, y: 22, w: 560, h: 210, xd: [0, 1], yd: [0, 1], xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 0.25, 0.5, 0.75, 1], xl: 'p(Yes), the share of Yes examples in the node', yl: 'impurity' });
  plot(W, ax, ent, 0, 1, 300, 's-sec');
  plot(W, ax, gini, 0, 1, 300, 's-pri');
  s('text', { x: ax.x(0.5), y: ax.y(0.88), 'text-anchor': 'middle', class: 't-sec t-bold' }, W, 'entropy');
  s('text', { x: ax.x(0.5), y: ax.y(0.5) + 18, 'text-anchor': 'middle', class: 't-pri t-bold' }, W, 'Gini');
  const mk = s('g', {}, W);
  slider(viz('slider'), { label: 'Yes examples', min: 0, max: 14, step: 1, value: 9, fmt: v => v + ' of 14' }, k => {
    const p = k / 14, g = gini(p), e = ent(p);
    mk.textContent = '';
    s('line', { x1: ax.x(p), x2: ax.x(p), y1: ax.y(0), y2: ax.y(1), class: 's-fg dash', style: 'opacity: 0.4' }, mk);
    s('circle', { cx: ax.x(p), cy: ax.y(e), r: 5, class: 'f-sec' }, mk);
    s('circle', { cx: ax.x(p), cy: ax.y(g), r: 5, class: 'f-pri' }, mk);
    role('node').textContent = `${k} Yes / ${14 - k} No`;
    role('p').textContent = fmt(p, 3);
    role('gini').textContent = g.toFixed(3);
    role('ent').textContent = e.toFixed(3);
  });
});

QV.register('s2-mc7', function (q) {
  const { s, svg, axes, arrow, box, table } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);

  // Figure 1: the two vectors and the three moves of the kernel
  const PL = svg(viz('plane'), 260, 290, { label: 'Vectors x = (1, 2) and z = (3, -1) about 82 degrees apart', minWidth: 260, maxWidth: 260 });
  const U = 40, O = { x: 70, y: 150 };
  const P = (x, y) => [O.x + x * U, O.y - y * U];
  for (let i = -1; i <= 4; i++) s('line', { x1: P(i, -2)[0], x2: P(i, 3)[0], y1: P(i, -2)[1], y2: P(i, 3)[1], class: 'l-grid' }, PL);
  for (let j = -2; j <= 3; j++) s('line', { x1: P(-1, j)[0], x2: P(4, j)[0], y1: P(-1, j)[1], y2: P(4, j)[1], class: 'l-grid' }, PL);
  s('line', { x1: P(-1, 0)[0], x2: P(4, 0)[0], y1: O.y, y2: O.y, class: 'l-axis' }, PL);
  s('line', { x1: O.x, x2: O.x, y1: P(0, -2)[1], y2: P(0, 3)[1], class: 'l-axis' }, PL);
  [-1, 0, 1, 2, 3, 4].forEach(i => s('text', { x: P(i, 0)[0], y: P(0, -2)[1] + 13, 'text-anchor': 'middle', class: 't-sm' }, PL, String(i).replace('-', '−')));
  [-2, -1, 0, 1, 2, 3].forEach(j => s('text', { x: P(-1, 0)[0] - 5, y: P(0, j)[1], dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, PL, String(j).replace('-', '−')));
  const a1 = Math.atan2(2, 1), a2 = Math.atan2(-1, 3), r = 26;
  s('path', { d: `M${O.x + r * Math.cos(a1)} ${O.y - r * Math.sin(a1)} A${r} ${r} 0 0 1 ${O.x + r * Math.cos(a2)} ${O.y - r * Math.sin(a2)}`, class: 's-fg', style: 'stroke-width: 1.2' }, PL);
  s('text', { x: 114, y: 136, 'text-anchor': 'middle', class: 't-fg t-bold halo' }, PL, '81.9°');
  arrow(PL, O.x, O.y, P(1, 2)[0], P(1, 2)[1], { cls: 'a-pri', width: 2.5, head: 10 });
  arrow(PL, O.x, O.y, P(3, -1)[0], P(3, -1)[1], { cls: 'a-sec', width: 2.5, head: 10 });
  s('text', { x: P(1, 2)[0] + 8, y: P(1, 2)[1] - 6, class: 't-pri t-bold halo' }, PL, 'x = (1, 2)');
  s('text', { x: P(3, -1)[0], y: P(3, -1)[1] + 22, 'text-anchor': 'middle', class: 't-sec t-bold halo' }, PL, 'z = (3, −1)');
  s('text', { x: 130, y: 266, 'text-anchor': 'middle', class: 't-fg' }, PL, 'xᵀz = |x| |z| cos 81.9°');
  s('text', { x: 130, y: 283, 'text-anchor': 'middle', class: 't-fg' }, PL, '= √5 · √10 · 0.141 = 1');

  const W = svg(viz('pipeline'), 430, 280, { label: 'The kernel steps: dot product 1, plus 1 gives 2, squared gives 4, with the option each step matches', minWidth: 430, maxWidth: 430 });
  const BXp = 6, BW = 200, BH = 36, TG = 224;
  const tag = (y, k, t, ok) => {
    s('circle', { cx: TG, cy: y, r: 9, class: ok ? 'f-ok' : 'f-surface box' }, W);
    s('text', { x: TG, y, dy: '0.35em', 'text-anchor': 'middle', class: ok ? 't-on t-bold' : 't-fg' }, W, k);
    s('text', { x: TG + 16, y, dy: '0.35em', class: ok ? 't-ok t-bold' : 't-fg' }, W, t);
  };
  [[24, 'xᵀz = 1·3 + 2·(−1) = 1', 'a', '1, the linear kernel xᵀz'],
    [96, 'xᵀz + 1 = 2', 'b', '2, the square is missing'],
    [168, '(xᵀz + 1)² = 2² = 4', 'd', '4, the answer']].forEach(([y, t, k, why]) => {
    const ok = k === 'd';
    box(W, BXp, y, BW, BH, t, { cls: ok ? 'f-ok' : 'f-surface', textCls: ok ? 't-on t-bold' : 't-fg' });
    tag(y + BH / 2, k, why, ok);
  });
  arrow(W, BXp + BW / 2, 60, BXp + BW / 2, 94, { cls: 'a-muted' });
  arrow(W, BXp + BW / 2, 132, BXp + BW / 2, 166, { cls: 'a-muted' });
  s('text', { x: BXp + BW / 2 + 10, y: 81, class: 't-muted' }, W, '+ 1');
  s('text', { x: BXp + BW / 2 + 10, y: 153, class: 't-muted' }, W, 'square, d = 2');
  box(W, BXp, 234, BW, 32, '3² = 9', { cls: 'f-surface', stroke: 'box dash', textCls: 't-muted' });
  tag(250, 'c', '9, squares the wrong sum', false);

  // Figure 2: φ(x)ᵀφ(z) term by term, as a running sum
  const r2 = Math.SQRT2;
  const TERMS = [['1', '1·1', 1], ['√2v₁', '√2·3√2', 6], ['√2v₂', '2√2·(−√2)', -4], ['v₁²', '1·9', 9], ['v₂²', '4·1', 4], ['√2v₁v₂', '2√2·(−3√2)', -12]];
  const WF = svg(viz('waterfall'), 640, 240, { label: 'Running sum of the six products of phi(x) and phi(z): 1, 7, 3, 12, 16, ending at 4', minWidth: 520 });
  const ax = axes(WF, { x: 60, y: 20, w: 560, h: 170, xd: [0, 7], yd: [0, 17], xt: [], yt: [0, 4, 8, 12, 16], yl: 'running sum' });
  let acc = 0;
  TERMS.concat([['sum', '', null]]).forEach(([name, prod, v], i) => {
    const cx = ax.x(i + 0.5), w = 46;
    const from = v == null ? 0 : acc, to = v == null ? acc : acc + v;
    const cls = v == null ? 'f-ok' : v > 0 ? 'f-pri' : 'f-sec';
    s('rect', { x: cx - w / 2, y: ax.y(Math.max(from, to)), width: w, height: Math.abs(ax.y(from) - ax.y(to)), class: cls }, WF);
    const lab = v == null ? '= 4' : (v > 0 ? '+' : '−') + Math.abs(v);
    s('text', { x: cx, y: ax.y(Math.max(from, to)) - 6, 'text-anchor': 'middle', class: (v == null ? 't-ok' : v > 0 ? 't-pri' : 't-sec') + ' t-bold' }, WF, lab);
    if (i < TERMS.length) s('line', { x1: cx + w / 2, x2: ax.x(i + 1.5) - w / 2, y1: ax.y(to), y2: ax.y(to), class: 's-muted dash', style: 'stroke-width: 1' }, WF);
    s('text', { x: cx, y: 206, 'text-anchor': 'middle', class: 't-fg' }, WF, name);
    if (prod) s('text', { x: cx, y: 222, 'text-anchor': 'middle', class: 't-sm' }, WF, prod);
    acc = to;
  });
  const f3 = v => v.toFixed(3).replace('-', '−');
  const T = table(viz('phi'), ['term of φ(v)', 'φ(x), x = (1, 2)', 'φ(z), z = (3, −1)', 'product'].map((t, i) => ({ text: t, cls: i ? '' : 'l' })), [
    ['1', '1', '1', '1'],
    ['√2·v₁', '√2 = ' + f3(r2), '3√2 = ' + f3(3 * r2), '6'],
    ['√2·v₂', '2√2 = ' + f3(2 * r2), '−√2 = ' + f3(-r2), '−4'],
    ['v₁²', '1', '9', '9'],
    ['v₂²', '4', '1', '4'],
    ['√2·v₁v₂', '2√2 = ' + f3(2 * r2), '−3√2 = ' + f3(-3 * r2), '−12'],
    ['sum', '', '', { text: '4', cls: 'hl' }],
  ].map(row => row.map((c, i) => (i ? c : { text: c, cls: 'l' }))));
  T.rows[6].classList.add('on');
});

QV.register('s2-mc8', function (q) {
  const { s, svg, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const MIN = 20, MAX = 80;
  const X = v => 100 + 4.4 * v;
  const neg = t => t.replace('-', '−');

  const W = svg(viz('rulers'), 560, 262, { label: 'Three aligned rulers: raw x from 0 to 100, x minus 20, and x minus 20 over 60; the training range 20 to 80 becomes 0 to 1', minWidth: 440 });
  const ROWS = [
    { y: 50, name: 'raw x', lab: v => String(v) },
    { y: 120, name: 'x − 20', lab: v => neg(String(v - MIN)) },
    { y: 190, name: '(x − 20) / 60', lab: v => neg(fmt((v - MIN) / (MAX - MIN), 2)) },
  ];
  s('text', { x: X(50), y: 22, 'text-anchor': 'middle', class: 't-pri t-bold' }, W, 'training range, min 20 to max 80');
  ROWS.forEach(r => {
    s('text', { x: 0, y: r.y, dy: '0.35em', class: 't-fg t-bold' }, W, r.name);
    s('line', { x1: X(0), x2: X(100), y1: r.y, y2: r.y, class: 'l-axis' }, W);
    s('rect', { x: X(MIN), y: r.y - 4, width: X(MAX) - X(MIN), height: 8, rx: 2, class: 'f-pri-soft' }, W);
    [0, 20, 50, 80, 100].forEach(v => {
      s('line', { x1: X(v), x2: X(v), y1: r.y, y2: r.y + 5, class: 'l-axis' }, W);
      s('text', { x: X(v), y: r.y + 18, 'text-anchor': 'middle', class: v === MIN || v === MAX ? 't-pri' : '' }, W, r.lab(v));
    });
  });
  QV.arrow(W, 12, 66, 12, 104, { cls: 'a-muted', head: 7 });
  QV.arrow(W, 12, 136, 12, 174, { cls: 'a-muted', head: 7 });
  s('text', { x: 22, y: 89, class: 't-muted' }, W, '− 20');
  s('text', { x: 22, y: 159, class: 't-muted' }, W, '÷ 60');
  s('text', { x: 0, y: 234, dy: '0.35em', class: 't-muted' }, W, 'options');
  [['d', -0.25, 0], ['a', 0.25, 0], ['b', 0.35, -3], ['c', 0.4375, 3]].forEach(([k, v, dx]) => {
    const x = X(MIN + v * (MAX - MIN)), ok = k === 'a';
    s('circle', { cx: x, cy: 234, r: 9, class: ok ? 'f-ok' : 'f-surface box' }, W);
    s('text', { x, y: 234, dy: '0.35em', 'text-anchor': 'middle', class: ok ? 't-on t-bold' : 't-fg' }, W, k);
    s('text', { x: x + dx, y: 256, 'text-anchor': 'middle', class: 't-sm' + (ok ? ' t-ok t-bold' : '') }, W, neg(v === 0.4375 ? '0.44' : String(v)));
  });
  const mk = s('g', {}, W);

  slider(viz('slider'), { label: 'x', min: 0, max: 100, step: 1, value: 35 }, x => {
    const sh = x - MIN, sc = sh / (MAX - MIN), scs = neg(fmt(sc, 3));
    mk.textContent = '';
    s('line', { x1: X(x), x2: X(x), y1: 36, y2: 198, class: 's-pri dash', style: 'stroke-width: 1.2' }, mk);
    [String(x), neg(String(sh)), scs].forEach((t, i) => {
      s('circle', { cx: X(x), cy: ROWS[i].y, r: 5, class: 'f-pri' }, mk);
      s('text', { x: X(x), y: ROWS[i].y - 11, 'text-anchor': 'middle', class: 't-pri t-bold halo' }, mk, t);
    });
    role('x').textContent = String(x);
    role('sh').textContent = neg(String(sh));
    const sv = role('sc');
    sv.textContent = scs;
    sv.className = 'v' + (sc >= 0 && sc <= 1 ? ' ok' : '');
    let t;
    if (x === 35) t = '(35 − 20) / 60 = 15/60 = <b>0.25</b>, option a. 35 sits a quarter of the way from min to max.';
    else if (x >= MIN && x <= MAX) t = `(${x} − 20) / 60 = <b>${scs}</b>, inside [0, 1] because ${x} is inside the training range.`;
    else t = `${x} is outside the training range, so it maps to <b>${scs}</b>, outside [0, 1]. The scaler keeps min = 20 and max = 80 from the training data and only transforms new data.`;
    role('verdict').innerHTML = t;
  });
});

QV.register('s2-mc9', function (q) {
  const { s, svg, steps, grid, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const PTS = { A: [1, 2], B: [2, 1], C: [5, 4], D: [6, 5], E: [9, 8] };
  const NAMES = Object.keys(PTS);
  const d2 = (p, c) => (PTS[p][0] - PTS[c][0]) ** 2 + (PTS[p][1] - PTS[c][1]) ** 2;

  // Figure 1: nearest-centroid D² on the plane, and the resulting probabilities
  const W = svg(viz('plot'), 330, 300, { label: 'Points A to E with lines to their nearest chosen centroid, labelled with the squared distance', minWidth: 330, maxWidth: 330 });
  const BS = svg(viz('bars'), 380, 280, { label: 'Bars of the probability of each point becoming the next centroid, D squared over the sum', minWidth: 380, maxWidth: 380 });
  const U = 26, O = { x: 56, y: 280 };
  const P = (x, y) => [O.x + x * U, O.y - y * U];
  for (let i = 0; i <= 10; i += 2) {
    s('line', { x1: P(i, 0)[0], x2: P(i, 10)[0], y1: P(i, 0)[1], y2: P(i, 10)[1], class: 'l-grid' }, W);
    s('line', { x1: P(0, i)[0], x2: P(10, i)[0], y1: P(0, i)[1], y2: P(10, i)[1], class: 'l-grid' }, W);
    s('text', { x: P(i, 0)[0], y: O.y + 14, 'text-anchor': 'middle', class: 't-sm' }, W, String(i));
    if (i) s('text', { x: O.x - 6, y: P(0, i)[1], dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, W, String(i));
  }
  const dyn = s('g', {}, W);
  const LAB = { A: [-10, 16, 'end'], B: [10, 12, 'start'], C: [10, 12, 'start'], D: [10, 14, 'start'], E: [-10, -6, 'end'] };
  const BX = 10, BW = 200;
  s('text', { x: BX, y: 22, class: 't-fg t-bold' }, BS, 'P(next centroid) = D² / ΣD²');
  const bars = s('g', {}, BS);

  const ROUNDS = [['A'], ['A', 'E']];
  function draw(k) {
    const cents = ROUNDS[k];
    dyn.textContent = '';
    bars.textContent = '';
    const near = {}, D2 = {};
    NAMES.forEach(p => {
      let best = null;
      cents.forEach(c => { const v = d2(p, c); if (best === null || v < D2[p]) { best = c; D2[p] = v; } });
      near[p] = best;
    });
    const total = NAMES.reduce((a, p) => a + D2[p], 0);
    NAMES.forEach(p => {
      if (D2[p] > 0) s('line', { x1: P(...PTS[p])[0], y1: P(...PTS[p])[1], x2: P(...PTS[near[p]])[0], y2: P(...PTS[near[p]])[1], class: 's-muted dash', style: 'stroke-width: 1.2' }, dyn);
    });
    NAMES.forEach(p => {
      const [x, y] = P(...PTS[p]), cent = cents.indexOf(p) >= 0;
      if (cent) s('circle', { cx: x, cy: y, r: 11, class: 's-ok', style: 'stroke-width: 2' }, dyn);
      s('circle', { cx: x, cy: y, r: 6, class: cent ? 'f-ok' : 'f-pri' }, dyn);
      const [dx, dy, anc] = LAB[p];
      const t = cent ? `${p} = C${'₁₂'[cents.indexOf(p)]}` : `${p}: D² = ${D2[p]}`;
      s('text', { x: x + dx, y: y + dy, 'text-anchor': anc, class: (cent ? 't-ok' : 't-fg') + ' t-bold halo' }, dyn, t);
    });
    NAMES.forEach((p, i) => {
      const y = 44 + i * 42, pr = D2[p] / total, cent = cents.indexOf(p) >= 0;
      s('text', { x: BX, y: y + 11, dy: '0.35em', class: 't-fg t-bold' }, bars, p);
      s('text', { x: BX + 104, y: y + 11, dy: '0.35em', 'text-anchor': 'end', class: 't-muted' }, bars, cent ? 'centroid' : `${D2[p]}/${total}`);
      s('rect', { x: BX + 114, y, width: BW, height: 22, rx: 3, class: 'f-seg' }, bars);
      if (pr > 0) s('rect', { x: BX + 114, y, width: BW * pr, height: 22, rx: 3, class: 'f-pri' }, bars);
      s('text', { x: BX + 114 + BW * pr + 6, y: y + 11, dy: '0.35em', class: pr > 0 ? 't-pri t-bold' : 't-muted' }, bars, fmt(pr, 3));
      const opt = k === 0 ? { E: ['c', true], D: ['d', false] }[p] : null;
      if (opt) {
        const cx = BX + 114 + BW + 22;
        s('circle', { cx, cy: y + 11, r: 9, class: opt[1] ? 'f-ok' : 'f-surface box' }, bars);
        s('text', { x: cx, y: y + 11, dy: '0.35em', 'text-anchor': 'middle', class: opt[1] ? 't-on t-bold' : 't-fg' }, bars, opt[0]);
      }
    });
    s('text', { x: BX + 104, y: 268, 'text-anchor': 'end', class: 't-fg t-bold' }, bars, `ΣD² = ${total}`);
  }

  const note = role('note');
  steps(viz('steps'), ['Pick C₂, with C₁ = A', 'Pick C₃, with C₁ = A and C₂ = E'], k => {
    draw(k);
    note.textContent = k === 0
      ? 'C₁ = A. Every point measures its squared distance D² to A. The sum is 156, so E gets 100/156 = 0.641 and D gets 34/156 = 0.218.'
      : 'Slide 23 takes C₂ = E. Each point now uses its distance to the nearer of A and E: B 2, C 20, D 18. The sum is 40, so the next pick is C with 0.5, D with 0.45 or B with 0.05.';
  });

  // Figure 2: D² as tickets, 13 × 12 = 156
  const TK = svg(viz('tickets'), 560, 310, { label: '156 tickets in a 13 by 12 grid: 100 for E, 34 for D, 20 for C and 2 for B', minWidth: 460 });
  const ORDER = [['E', 100, 'f-pri'], ['D', 34, 'f-sec'], ['C', 20, 'f-ter'], ['B', 2, 'f-seg']];
  const cells = [];
  ORDER.forEach(([, n, cls]) => { for (let i = 0; i < n; i++) cells.push(cls); });
  const data = [];
  for (let r = 0; r < 12; r++) data.push(cells.slice(r * 13, r * 13 + 13));
  grid(TK, { x: 8, y: 8, data, cell: 21, gap: 3, fill: v => v, text: false, round: 2 });
  ORDER.concat([['A', 0, null]]).forEach(([p, n, cls], i) => {
    const y = 40 + i * 40;
    if (cls) s('rect', { x: 340, y: y - 9, width: 18, height: 18, rx: 2, class: cls + ' box' }, TK);
    s('text', { x: 368, y, dy: '0.35em', class: 't-fg t-bold' }, TK, p);
    s('text', { x: 386, y, dy: '0.35em', class: p === 'E' ? 't-pri t-bold' : 't-fg' }, TK, `${n}/156 = ${n ? (n / 156).toFixed(3) : '0'}`);
  });
  s('text', { x: 340, y: 250, class: 't-muted' }, TK, 'one ticket is drawn at random');
});

QV.register('s2-mc10', function (q) {
  const { s, svg, box, arrow, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: the five steps top to bottom, with the options placed on them
  const F = svg(viz('flow'), 480, 300, { label: 'Five PCA steps from top to bottom: mean, covariance matrix S, eigenvalues, eigenvectors, projection; eigenvalues are highlighted as the step right after S', minWidth: 420, maxWidth: 560 });
  const BX = 40, BW = 230, BH = 44, by = i => 8 + i * 58;
  const STEPS = [['1 · Mean', 'X̄ = Σxᵢ / m', 'c', 'the first step'], ['2 · Covariance S', 'divisor n − 1', null, ''], ['3 · Eigenvalues', 'det(S − λI) = 0', 'b', 'right after S'], ['4 · Eigenvectors', '(S − λI)U = 0', 'd', 'needs λ first'], ['5 · Project', 'X_centred · u₁', 'a', 'the last step']];
  STEPS.forEach(([t, f, k, why], i) => {
    const ok = i === 2, here = i === 1, y = by(i);
    box(F, BX, y, BW, BH, '', { cls: ok ? 'f-ok' : here ? 'f-pri-soft' : 'f-surface' });
    s('text', { x: BX + BW / 2, y: y + 17, 'text-anchor': 'middle', class: ok ? 't-on t-bold' : 't-fg t-bold' }, F, t);
    s('text', { x: BX + BW / 2, y: y + 34, 'text-anchor': 'middle', class: ok ? 't-on' : 't-fg' }, F, f);
    if (i < 4) arrow(F, BX + BW / 2, y + BH + 1, BX + BW / 2, by(i + 1) - 1, { cls: i === 1 ? 'a-ok' : 'a-muted', width: i === 1 ? 2.5 : 1.5, head: 7 });
    if (k) {
      s('circle', { cx: 296, cy: y + BH / 2, r: 10, class: ok ? 'f-ok' : 'f-surface box' }, F);
      s('text', { x: 296, y: y + BH / 2, dy: '0.35em', 'text-anchor': 'middle', class: ok ? 't-on t-bold' : 't-fg' }, F, k);
      s('text', { x: 312, y: y + BH / 2, dy: '0.35em', class: ok ? 't-ok t-bold' : 't-fg' }, F, why);
    } else s('text', { x: 286, y: y + BH / 2, dy: '0.35em', class: 't-pri t-bold' }, F, 'S is done here');
  });
  const y3 = by(2) + BH / 2, y4 = by(3) + BH / 2;
  const ctl = [6, (y3 + y4) / 2], end = [BX - 2, y4];
  s('path', { d: `M${BX - 2} ${y3} Q${ctl[0]} ${ctl[1]} ${end[0]} ${end[1]}`, class: 's-ok dash', style: 'stroke-width: 1.5' }, F);
  const dl = Math.hypot(end[0] - ctl[0], end[1] - ctl[1]);
  arrow(F, end[0] - 12 * (end[0] - ctl[0]) / dl, end[1] - 12 * (end[1] - ctl[1]) / dl, end[0], end[1], { cls: 'a-ok', head: 7 });
  s('text', { x: 12, y: (y3 + y4) / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-ok t-bold halo' }, F, 'λ');

  // Figure 2: slide 17 data through the steps
  const X1 = [4, 8, 13, 7], X2 = [11, 4, 5, 14], MEAN = [8, 8.5];
  const U1 = [0.5574, -0.8303], U2 = [0.8303, 0.5574];
  const PC1 = ['−4.3052', '3.7361', '5.6928', '−5.1238'];
  const W = svg(viz('plot'), 350, 336, { label: 'Slide 17 data on equal axes with the mean, the centred vectors, the eigenvector directions and the projections onto u1', minWidth: 330 });
  const UN = 18, O = { x: 46, y: 310 };
  const P = (x, y) => [O.x + x * UN, O.y - y * UN];
  for (let v = 0; v <= 16; v += 4) {
    s('line', { x1: P(v, 0)[0], x2: P(v, 16)[0], y1: P(v, 0)[1], y2: P(v, 16)[1], class: 'l-grid' }, W);
    s('line', { x1: P(0, v)[0], x2: P(16, v)[0], y1: P(0, v)[1], y2: P(16, v)[1], class: 'l-grid' }, W);
    s('text', { x: P(v, 0)[0], y: O.y + 16, 'text-anchor': 'middle', class: 't-sm' }, W, String(v));
    if (v) s('text', { x: O.x - 6, y: P(0, v)[1], dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, W, String(v));
  }
  s('text', { x: P(16, 0)[0], y: O.y - 6, 'text-anchor': 'end', class: 't-sm' }, W, 'X₁');
  s('text', { x: O.x + 6, y: P(0, 16)[1] + 12, class: 't-sm' }, W, 'X₂');
  const layer = () => s('g', {}, W);
  const L1 = layer(), L2 = layer(), L4 = layer(), L5 = layer();
  const M = P(...MEAN);
  s('line', { x1: P(0, MEAN[1])[0], x2: P(16, MEAN[1])[0], y1: M[1], y2: M[1], class: 's-muted dash', style: 'stroke-width: 1' }, L1);
  s('line', { x1: M[0], x2: M[0], y1: P(0, 0)[1], y2: P(0, 16)[1], class: 's-muted dash', style: 'stroke-width: 1' }, L1);
  X1.forEach((x, i) => s('line', { x1: M[0], y1: M[1], x2: P(x, X2[i])[0], y2: P(x, X2[i])[1], class: 's-muted', style: 'stroke-width: 1.2' }, L2));
  const along = (u, t) => P(MEAN[0] + t * u[0], MEAN[1] + t * u[1]);
  s('line', { x1: along(U1, -7)[0], y1: along(U1, -7)[1], x2: along(U1, 7)[0], y2: along(U1, 7)[1], class: 's-pri', style: 'stroke-width: 1.5; opacity: 0.6' }, L4);
  s('line', { x1: along(U2, -4)[0], y1: along(U2, -4)[1], x2: along(U2, 4)[0], y2: along(U2, 4)[1], class: 's-sec dash', style: 'stroke-width: 1.5; opacity: 0.6' }, L4);
  arrow(L4, M[0], M[1], along(U1, 3)[0], along(U1, 3)[1], { cls: 'a-pri', width: 3, head: 10 });
  arrow(L4, M[0], M[1], along(U2, 3)[0], along(U2, 3)[1], { cls: 'a-sec', width: 3, head: 10 });
  s('text', { x: along(U1, -7)[0] - 6, y: along(U1, -7)[1] + 4, 'text-anchor': 'end', class: 't-pri t-bold' }, L4, 'u₁');
  s('text', { x: along(U2, 4)[0] + 6, y: along(U2, 4)[1] + 4, class: 't-sec t-bold' }, L4, 'u₂');
  const PLAB = [[-10, 0, 'end'], [-10, 4, 'end'], [10, 4, 'start'], [10, 0, 'start']];
  X1.forEach((x, i) => {
    const c = [x - MEAN[0], X2[i] - MEAN[1]], t = c[0] * U1[0] + c[1] * U1[1];
    const foot = along(U1, t), pt = P(x, X2[i]);
    s('line', { x1: pt[0], y1: pt[1], x2: foot[0], y2: foot[1], class: 's-ok dash', style: 'stroke-width: 1.2' }, L5);
    s('circle', { cx: foot[0], cy: foot[1], r: 4, class: 'f-ok' }, L5);
    s('text', { x: pt[0] + PLAB[i][0], y: pt[1] + PLAB[i][1], dy: '0.35em', 'text-anchor': PLAB[i][2], class: 't-ok t-bold halo' }, L5, PC1[i]);
  });
  const CLAB = [[0, -12], [0, 20], [0, 20], [0, -12]];
  X1.forEach((x, i) => {
    const pt = P(x, X2[i]);
    s('circle', { cx: pt[0], cy: pt[1], r: 5, class: 'f-fg' }, W);
    s('text', { x: pt[0] + CLAB[i][0], y: pt[1] + CLAB[i][1], 'text-anchor': 'middle', class: 't-fg t-sm halo' }, W, `(${x}, ${X2[i]})`);
  });
  s('path', { d: `M${M[0] - 6} ${M[1] - 6} L${M[0] + 6} ${M[1] + 6} M${M[0] - 6} ${M[1] + 6} L${M[0] + 6} ${M[1] - 6}`, class: 's-ok', style: 'stroke-width: 3' }, L1);

  const PANEL = [
    ['All five results in order', '1  mean (8, 8.5)', '2  S = [14, −11; −11, 23]', '3  λ₁ = 30.3849, λ₂ = 6.6151   ← right after S', '4  u₁ = (0.5574, −0.8303)', '5  PC1 = −4.3052, 3.7361, 5.6928, −5.1238'],
    ['Step 1 · Mean of each variable', 'X̄₁ = (4 + 8 + 13 + 7) / 4 = 8', 'X̄₂ = (11 + 4 + 5 + 14) / 4 = 8.5', 'centred rows X − X̄:', '(−4, 2.5)  (0, −4.5)  (5, −3.5)  (−1, 5.5)'],
    ['Step 2 · Covariance matrix S, divisor n − 1 = 3', 'Cov(X₁, X₁) = (16 + 0 + 25 + 1) / 3 = 14', 'Cov(X₂, X₂) = (6.25 + 20.25 + 12.25 + 30.25) / 3 = 23', 'Cov(X₁, X₂) = (−10 + 0 − 17.5 − 5.5) / 3 = −11', 'S = [14, −11; −11, 23]'],
    ['Step 3 · Eigenvalues from det(S − λI) = 0', '(14 − λ)(23 − λ) − (−11)² = 0', 'λ² − 37λ + 201 = 0', 'λ = (37 ± √565) / 2', 'λ₁ = 30.3849, λ₂ = 6.6151', 'PC1 keeps 30.3849 / 37 = 82.1% of the variance'],
    ['Step 4 · Eigenvectors from (S − λI)U = 0', 'λ₁: (14 − 30.3849)u₁ − 11u₂ = 0', 'u₂ = −1.4895 u₁', 'length 1: u₁ = (0.5574, −0.8303)', 'λ₂ gives u₂ = (0.8303, 0.5574)'],
    ['Step 5 · Project the centred rows on u₁', 'PC1 = (X − X̄) · u₁', 'row 1: −4(0.5574) + 2.5(−0.8303) = −4.3052', 'PC1 = −4.3052, 3.7361, 5.6928, −5.1238'],
  ];
  const NOTES = [
    'All five steps on one plot. Step 3, the eigenvalues, is the first thing computed from S.',
    'The green cross is the mean (8, 8.5). Centring moves it to the origin of the new axes.',
    'The grey lines are the centred rows. S collects their variances and covariance.',
    'The eigenvalues are the variances along the two principal directions: 30.38 for PC1 and 6.62 for PC2. They come straight from S.',
    'Each λ goes into (S − λI)U = 0. λ₁ gives u₁, the direction of maximum variance. u₂ is perpendicular to it.',
    'Each point drops onto the u₁ line. Its signed position along u₁ is its PC1 value.',
  ];
  const note = role('note');
  steps(viz('steps'), ['All', '1 · Mean', '2 · S', '3 · λ', '4 · u₁', '5 · PC1'], k => {
    [[L1, 1], [L2, 2], [L4, 4], [L5, 5]].forEach(([g, st]) => { g.style.display = k === 0 || st <= k ? '' : 'none'; });
    role('calc').textContent = PANEL[k].join('\n');
    note.textContent = NOTES[k];
  });
});

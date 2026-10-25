QV.register('s1-w1', function (q) {
  const { s, svg, grid, gray, steps, slider, mat, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const A = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ];
  const IDX = ['0', '1', '2', '3', '4', '5', '6'];
  const CROSS = [[-1, 0], [0, -1], [0, 0], [0, 1], [1, 0]];
  const bin = v => (v ? { cls: 'f-pri', text: 't-on' } : { cls: 'f-seg', text: 't-muted' });

  // Given: image A and the cross B
  const g0 = svg(viz('given'), 480, 252, { label: 'Image A, a 7 by 7 binary image, and the 3 by 3 cross structuring element B', minWidth: 400 });
  grid(g0, { x: 34, y: 44, data: A, cell: 28, fill: bin, rowLabels: IDX, colLabels: IDX, title: 'Image A (7 x 7)' });
  grid(g0, { x: 314, y: 100, data: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], cell: 28, fill: bin, title: 'Structuring element B' });
  s('rect', { x: 342, y: 128, width: 28, height: 28, class: 'f-none outline-sec' }, g0);
  s('text', { x: 314, y: 206, class: 't-sm' }, g0, 'outlined: origin (centre)');

  // Figure 1: dilation of one gray row = running maximum
  const ROW = [30, 30, 40, 200, 210, 60, 220, 200, 50, 40, 30, 30];
  const win = k => ROW.slice(Math.max(0, k - 1), k + 2);
  const OUT = ROW.map((_, k) => Math.max(...win(k)));
  const M = { x0: 90, c: 40, yIn: 46, yOut: 136 };
  const mx = svg(viz('max'), 600, 190, { label: 'A row of gray pixels and its dilation: each output pixel is the maximum of the 3-pixel window centred on it', minWidth: 500 });
  s('text', { x: 0, y: M.yIn + 20, dy: '0.35em', class: 't-fg t-bold' }, mx, 'input');
  s('text', { x: 0, y: M.yOut + 20, dy: '0.35em', class: 't-fg t-bold' }, mx, 'dilated');
  [[M.yIn, ROW], [M.yOut, OUT]].forEach(([y, vals]) => vals.forEach((v, i) => {
    const gv = gray(v);
    s('rect', { x: M.x0 + i * M.c, y, width: M.c, height: M.c, class: 'sep', style: gv.style }, mx);
    s('text', { x: M.x0 + i * M.c + M.c / 2, y: y + M.c / 2, dy: '0.35em', 'text-anchor': 'middle', class: gv.text }, mx, v);
  }));
  ROW.forEach((_, i) => s('text', { x: M.x0 + i * M.c + M.c / 2, y: M.yIn - 8, 'text-anchor': 'middle', class: 't-sm' }, mx, i));
  const mLayer = s('g', {}, mx);
  const outline = (g, x, y, w, h) => {
    s('rect', { x, y, width: w, height: h, class: 'f-none sep', style: 'stroke-width: 6' }, g);
    s('rect', { x, y, width: w, height: h, class: 'f-none outline-sec', style: 'stroke-width: 3' }, g);
  };
  slider(viz('max-slider'), { label: 'window centre', min: 0, max: ROW.length - 1, step: 1, value: 5 }, k => {
    mLayer.textContent = '';
    const lo = Math.max(0, k - 1), hi = Math.min(ROW.length - 1, k + 1);
    outline(mLayer, M.x0 + lo * M.c, M.yIn, (hi - lo + 1) * M.c, M.c);
    outline(mLayer, M.x0 + k * M.c, M.yOut, M.c, M.c);
    const cx = M.x0 + (k + 0.5) * M.c;
    arrow(mLayer, cx, M.yIn + M.c + 6, cx, M.yOut - 6, { cls: 'a-sec', width: 2 });
    const label = `max(${win(k).join(', ')}) = ${OUT[k]}`;
    s('text', { x: Math.min(Math.max(cx, 82), 518), y: 18, 'text-anchor': 'middle', class: 't-fg t-bold' }, mLayer, label);
    let t = `Position ${k}: ${label}.`;
    if (k === 0 || k === ROW.length - 1) t += ' The window hangs over the end of the row, and the missing pixel is ignored.';
    t += OUT[k] > ROW[k] ? ` The pixel rises from ${ROW[k]} to ${OUT[k]}.` : ' The pixel keeps its value.';
    if (k === 5) t += ' This fills the dark gap between the two bright parts.';
    role('max-note').textContent = t;
  });

  // Figure 2: stamp the cross on every 1 of A
  const ONES = [];
  A.forEach((row, r) => row.forEach((v, c) => { if (v) ONES.push([r, c]); }));
  const cover = k => {
    const m = A.map(row => row.map(() => 0));
    ONES.slice(0, k).forEach(([r, c]) => CROSS.forEach(([dr, dc]) => {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < 7 && cc >= 0 && cc < 7) m[rr][cc] = 1;
    }));
    return m;
  };
  const FINAL = cover(ONES.length);
  const count = m => m.flat().reduce((a, b) => a + b, 0);
  const C = 32, GA = { x: 44, y: 56 }, GR = { x: 420, y: 56 };
  const st = svg(viz('stamp'), 680, 300, { label: 'Dilation of A by stamping the cross B on each foreground pixel', minWidth: 540 });
  grid(st, { x: GA.x, y: GA.y, data: A, cell: C, fill: bin, rowLabels: IDX, colLabels: IDX, title: 'A' });
  const res = grid(st, { x: GR.x, y: GR.y, data: A, cell: C, fill: bin, rowLabels: IDX, colLabels: IDX, title: 'A ⊕ B' });
  arrow(st, 284, GA.y + 3.5 * C, 392, GA.y + 3.5 * C, { cls: 'a-muted', label: 'dilate by B', dy: -10 });
  const crossPts = (o, r, c) => [[c, r - 1], [c + 1, r - 1], [c + 1, r], [c + 2, r], [c + 2, r + 1], [c + 1, r + 1], [c + 1, r + 2], [c, r + 2], [c, r + 1], [c - 1, r + 1], [c - 1, r], [c, r]]
    .map(([cc, rr]) => (o.x + cc * C) + ',' + (o.y + rr * C)).join(' ');
  const marks = [GA, GR].map(o => ({
    o,
    els: [s('polygon', { class: 'f-none sep', style: 'stroke-width: 6' }, st), s('polygon', { class: 'f-none outline-sec', style: 'stroke-width: 3' }, st)],
  }));
  const snote = role('stamp-note');
  steps(viz('stamp-steps'), ['All'].concat(ONES.map(([r, c]) => `(${r},${c})`)), k => {
    const m = k === 0 ? FINAL : cover(k);
    m.forEach((row, r) => row.forEach((v, c) => {
      res.rects[r][c].setAttribute('class', (v ? (A[r][c] ? 'f-pri' : 'f-ok') : 'f-seg') + ' sep');
      res.texts[r][c].textContent = v;
      res.texts[r][c].setAttribute('class', v ? 't-on' : 't-muted');
    }));
    marks.forEach(mk => mk.els.forEach(el => {
      el.setAttribute('visibility', k > 0 ? 'visible' : 'hidden');
      if (k > 0) el.setAttribute('points', crossPts(mk.o, ONES[k - 1][0], ONES[k - 1][1]));
    }));
    if (k === 0) {
      snote.textContent = `All ${ONES.length} stamps: ${count(FINAL)} ones, the ${ONES.length} pixels of A plus ${count(FINAL) - ONES.length} added. A pixel becomes 1 when it, or the pixel above, below, left or right of it, is 1 in A.`;
      return;
    }
    const [r, c] = ONES[k - 1];
    const before = cover(k - 1);
    const cells = CROSS.map(([dr, dc]) => [r + dr, c + dc]);
    const fresh = cells.filter(([rr, cc]) => !before[rr][cc]).length;
    snote.textContent = `Stamp ${k} of ${ONES.length}: B centred on (${r},${c}) covers ${cells.map(p => '(' + p + ')').join(', ')}. ${fresh} of them are new, ${count(m)} ones so far.`;
  });

  const JOIN = ['3,4', '4,4'];
  mat(viz('result'), FINAL, { caption: `A ⊕ B, ${count(FINAL)} ones`, hl: (v, r, c) => (v ? (JOIN.includes(r + ',' + c) ? 'on org' : 'on') : null) });

  // Figure 3: B̂ = B turned 180°, and checking every pixel with B̂ against B
  const LOPSIDED = [[-1, 0], [0, 0], [0, 1], [1, 0]];
  const flip = se => se.map(([dr, dc]) => [-dr, -dc]);
  const inA = (r, c) => r >= 0 && r < 7 && c >= 0 && c < 7 && A[r][c] === 1;
  const checkAll = se => A.map((row, r) => row.map((_, c) => (se.some(([dr, dc]) => inA(r + dr, c + dc)) ? 1 : 0)));
  const seGrid = se => [-1, 0, 1].map(dr => [-1, 0, 1].map(dc => (se.some(([a, b]) => a === dr && b === dc) ? 1 : 0)));
  const sgn = v => (v > 0 ? '+' + v : v < 0 ? '−' + -v : '0');
  const HC = 24, SC = 40, ROWS = [236, 470];
  const hs = svg(viz('hat'), 760, 650, { label: 'B and B̂ with their offsets, then pixel z = (1,3) and the whole dilation checked with B̂ and with B unflipped', minWidth: 560 });
  const hg = s('g', {}, hs);
  const ht = (x, y, text, cls, anchor) => s('text', { x, y, dy: '0.35em', 'text-anchor': anchor, class: cls }, hg, text);

  const SES = [CROSS, LOPSIDED];
  let seK = 0, zi = 10;

  function drawHat() {
    hg.textContent = '';
    const se = SES[seK], hat = flip(se);
    const cur = zi < 49 ? [Math.floor(zi / 7), zi % 7] : null;
    const done = (r, c) => r * 7 + c <= zi;
    const same = seGrid(se).flat().join() === seGrid(hat).flat().join();
    [[se, 'B', 40], [hat, 'B̂', 330]].forEach(([e, title, x]) => {
      grid(hg, { x, y: 40, data: seGrid(e), cell: SC, fill: v => (v ? 'f-pri' : 'f-seg'), text: (v, r, c) => (v ? sgn(r - 1) + ',' + sgn(c - 1) : null), textCls: () => 't-on', title });
      s('rect', { x: x + SC, y: 40 + SC, width: SC, height: SC, class: 'f-none outline-sec' }, hg);
    });
    arrow(hg, 176, 100, 318, 100, { cls: 'a-sec', width: 2, label: 'turn 180°', dy: -10 });
    ht(247, 118, 'change both signs', 't-sm', 'middle');
    ht(480, 80, same ? 'The same five cells come back' : 'The right arm moves to the left', (same ? 't-ok' : 't-bad') + ' t-bold');
    ht(480, 100, same ? 'up ↔ down, left ↔ right, so B̂ = B' : 'B̂ ≠ B, so the flip changes the answer', 't-fg');

    const good = checkAll(hat);
    [[hat, 'B̂', 'Definition: check every pixel z with B̂', 't-ok'], [se, 'B', 'No flip: check every pixel z with B', same ? 't-fg' : 't-bad']].forEach(([e, sym, head, cls], i) => {
      const y = ROWS[i], res = checkAll(e);
      const wrongSoFar = res.flat().filter((v, j) => j <= zi && v !== good.flat()[j]).length;
      const onesSoFar = res.flat().filter((v, j) => j <= zi && v).length;
      ht(0, y - 48, head, cls + ' t-bold');
      const ga = grid(hg, { x: 40, y, data: A, cell: HC, fill: bin, rowLabels: IDX, colLabels: IDX, title: cur ? `A, ${sym} placed at z = (${cur})` : 'A, read only' });
      arrow(hg, 220, y + 84, 306, y + 84, { cls: 'a-muted', label: cur ? 'write z' : 'done', dy: -10 });
      const gr = grid(hg, {
        x: 330, y, data: res, cell: HC, rowLabels: IDX, colLabels: IDX, title: i === 0 ? 'output, A ⊕ B' : 'output, no flip',
        fill: (v, r, c) => (done(r, c) ? { cls: v ? (A[r][c] ? 'f-pri' : 'f-ok') : 'f-seg', text: v ? 't-on' : 't-muted' } : { cls: 'f-seg', style: 'opacity: 0.55' }),
        text: (v, r, c) => (done(r, c) ? v : ''),
      });
      res.forEach((row, r) => row.forEach((v, c) => {
        if (done(r, c) && v !== good[r][c]) s('rect', { x: gr.cx(c) + 1.5, y: gr.cy(r) + 1.5, width: HC - 3, height: HC - 3, class: 's-bad' }, hg);
      }));
      if (!cur) {
        ht(510, y + 40, 'all 49 pixels checked', 't-fg t-bold');
        ht(510, y + 62, `${count(res)} ones` + (i === 0 ? '' : wrongSoFar ? `, ${wrongSoFar} pixels wrong` : ', identical'), wrongSoFar ? 't-bad t-bold' : 't-ok t-bold');
        return;
      }
      const cells = e.map(([dr, dc]) => [cur[0] + dr, cur[1] + dc]).filter(([r, c]) => r >= 0 && r < 7 && c >= 0 && c < 7).sort((a, b) => a[0] * 7 + a[1] - (b[0] * 7 + b[1]));
      const hits = cells.filter(([r, c]) => inA(r, c));
      cells.forEach(([r, c]) => s('rect', { x: ga.cx(c), y: ga.cy(r), width: HC, height: HC, class: 'f-none outline-sec' }, hg));
      s('rect', { x: gr.cx(cur[1]), y: gr.cy(cur[0]), width: HC, height: HC, class: 'f-none outline-sec' }, hg);
      const v = res[cur[0]][cur[1]], bad = v !== good[cur[0]][cur[1]];
      ht(510, y + 20, `z = (${cur})`, 't-fg t-bold');
      ht(510, y + 40, `${sym} covers, inside the image:`, 't-fg');
      ht(510, y + 58, cells.map(p => '(' + p + ')').join(' '), 't-sm');
      ht(510, y + 80, hits.length ? `hits the 1 at ${hits.map(p => '(' + p + ')').join(' ')}` : 'no 1 of A under it', 't-fg');
      ht(510, y + 100, `write ${v} at (${cur})` + (bad ? ', wrong' : ''), bad ? 't-bad t-bold' : 't-ok t-bold');
      ht(510, y + 132, `${onesSoFar} ones so far` + (wrongSoFar ? `, ${wrongSoFar} wrong` : ''), wrongSoFar ? 't-bad' : 't-fg');
    });
  }

  steps(viz('hat-steps'), ['Q1 cross', 'Lopsided cross'], k => {
    seK = k;
    drawHat();
    role('hat-note').textContent = k === 0
      ? 'The Q1 cross. Turning it 180° swaps up with down and left with right, so B̂ = B, and both rows fill in the same 28 ones. Step to any pixel: the plum outline on A shows which cells are read, and only that one output pixel is written.'
      : 'A cross without its left arm, not the exam\'s B. Turning it 180° moves the arm from the right to the left. At z = (1,3), B̂ reaches left to the 1 at (1,2), so z = 1. Unflipped B reaches right to (1,4), finds a 0 and wrongly writes 0. Without the flip every 1 spreads left instead of right.';
  }, 0);
  const zIn = slider(viz('hat-z'), { label: 'pixel z', min: 0, max: 49, step: 1, value: zi, fmt: v => (v === 49 ? 'all 49 checked' : `(${Math.floor(v / 7)},${v % 7}), pixel ${v + 1} of 49`) }, v => {
    zi = v;
    drawHat();
  });
  const nav = QV.h('div', { class: 'steps' }, viz('hat-z'));
  [['← previous', -1], ['next →', 1], ['all', 49]].forEach(([label, d]) => QV.h('button', { type: 'button' }, nav, label).addEventListener('click', () => {
    zIn.value = d === 49 ? 49 : Math.min(49, Math.max(0, zi + d));
    zIn.dispatchEvent(new Event('input'));
  }));
});

QV.register('s1-w2', function (q) {
  const { s, svg, grid, gray, steps, slider, axes, line, scale } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const IMG = [
    [52, 55, 58, 60, 61],
    [54, 57, 59, 62, 63],
    [55, 58, 255, 63, 64],
    [57, 60, 62, 65, 66],
    [58, 61, 64, 66, 68],
  ];
  const IDX = ['0', '1', '2', '3', '4'];
  const gfill = v => gray(v);
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  const median = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const rng = seed => () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const g0 = svg(viz('given'), 260, 248, { label: 'The 5 by 5 gray image; the salt pixel 255 is at row 2, column 2', minWidth: 220 });
  grid(g0, { x: 40, y: 50, data: IMG, cell: 36, gap: 2, fill: gfill, stroke: 'box', rowLabels: IDX, colLabels: IDX, title: '5 x 5 image' });

  // Figure 1: 1-D comparison on impulse and Gaussian noise
  const N = 40, EDGE = 20;
  const CLEAN = Array.from({ length: N }, (_, i) => (i < EDGE ? 60 : 160));
  const IMP = CLEAN.slice();
  IMP[6] = 255; IMP[25] = 0; IMP[31] = 255;
  const r1 = rng(3);
  const gn = () => Math.sqrt(-2 * Math.log(1 - r1())) * Math.cos(2 * Math.PI * r1());
  const GAU = CLEAN.map(v => Math.max(0, Math.min(255, Math.round(v + 14 * gn()))));
  const filt = (x, f) => x.map((_, i) => (i === 0 || i === N - 1 ? null : f([x[i - 1], x[i], x[i + 1]])));
  const flat = i => i >= 1 && i <= N - 2 && (i < EDGE - 1 || i > EDGE);
  const rms = y => Math.sqrt(mean(y.map((v, i) => [v, i]).filter(([, i]) => flat(i)).map(([v, i]) => (v - CLEAN[i]) ** 2)));

  const ch = svg(viz('noise'), 660, 290, { label: 'A noisy row with a step edge, filtered by a 3-pixel average and a 3-pixel median', minWidth: 520 });
  const ax = axes(ch, { x: 56, y: 24, w: 580, h: 220, xd: [0, 39], yd: [0, 260], xt: [0, 10, 20, 30, 39], yt: [0, 50, 100, 150, 200, 250], xl: 'pixel position', yl: 'gray value' });
  const layer = s('g', {}, ch);
  steps(viz('noise-steps'), ['Impulse (salt and pepper)', 'Gaussian noise'], k => {
    const x = k === 0 ? IMP : GAU;
    const avg = filt(x, mean), med = filt(x, median);
    const pts = y => y.map((v, i) => (v == null ? null : [ax.x(i), ax.y(v)])).filter(Boolean);
    layer.textContent = '';
    line(layer, CLEAN.map((v, i) => [ax.x(i), ax.y(v)]), 's-muted dash').setAttribute('style', 'stroke-width: 1; opacity: 0.6');
    line(layer, pts(avg), 's-sec');
    line(layer, pts(med), 's-pri');
    x.forEach((v, i) => s('circle', { cx: ax.x(i), cy: ax.y(v), r: 3.5, class: 's-muted' }, layer));
    const ra = rms(avg).toFixed(1), rm = rms(med).toFixed(1);
    role('rms-avg').textContent = ra;
    role('rms-med').textContent = rm;
    role('noise-verdict').textContent = k === 0
      ? `The median removes all three spikes (error ${rm} in the flat parts) and keeps the step as one jump. The average turns each spike into a bump three pixels wide and spreads the step over two pixels.`
      : `Gaussian noise moves every pixel a little. Both filters reduce it, and the average reduces it more (${ra} against ${rm}). The average still turns the step into a ramp, while the median keeps it sharper.`;
  });

  // Figure 2: the window, the sorted values, and the average split into its two shares
  const W = [1, 2, 3].map(r => [1, 2, 3].map(c => IMG[r][c]));
  const sorted = W.flat().sort((a, b) => a - b);
  const sum = W.flat().reduce((a, b) => a + b, 0);
  const cleanSum = sum - 255;
  const wv = svg(viz('window'), 600, 246, { label: 'The 3 by 3 window at (2, 2), its sorted values with the median, and the average split into clean and salt shares', minWidth: 500 });
  const hl = (x, y, w, h, cls) => {
    s('rect', { x, y, width: w, height: h, class: 'f-none sep', style: 'stroke-width: 6' }, wv);
    s('rect', { x, y, width: w, height: h, class: 'f-none ' + cls, style: 'stroke-width: 3' }, wv);
  };
  const gi = grid(wv, { x: 34, y: 56, data: IMG, cell: 34, gap: 2, fill: gfill, stroke: 'box', rowLabels: IDX, colLabels: IDX, title: 'Window at (2, 2)' });
  hl(gi.cx(1) - 2, gi.cy(1) - 2, 3 * 36 + 2, 3 * 36 + 2, 'outline-pri');
  const gs = grid(wv, { x: 262, y: 56, data: [sorted], cell: 34, gap: 2, fill: gfill, stroke: 'box', colLabels: sorted.map((_, i) => String(i + 1)), title: 'Window sorted' });
  hl(gs.cx(4) - 2, 54, 38, 38, 'outline-pri');
  s('text', { x: gs.cx(4) + 17, y: 108, 'text-anchor': 'middle', class: 't-pri t-bold' }, wv, 'median ' + sorted[4]);
  s('text', { x: gs.cx(8) + 17, y: 108, 'text-anchor': 'middle' }, wv, 'salt pixel');
  const xs = scale(0, 90, 262, 582);
  s('text', { x: 262, y: 140, class: 't-fg t-bold' }, wv, `Average = ${sum} / 9 = ${(sum / 9).toFixed(2)}`);
  s('rect', { x: xs(0), y: 150, width: xs(cleanSum / 9) - xs(0), height: 26, class: 'f-sec-soft' }, wv);
  s('rect', { x: xs(cleanSum / 9), y: 150, width: xs(sum / 9) - xs(cleanSum / 9), height: 26, class: 'f-sec' }, wv);
  s('text', { x: xs(cleanSum / 18), y: 163, dy: '0.35em', 'text-anchor': 'middle', class: 't-sec' }, wv, `8 clean: ${cleanSum} / 9 = ${(cleanSum / 9).toFixed(1)}`);
  s('text', { x: xs((cleanSum / 9 + sum / 9) / 2), y: 163, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-sm' }, wv, `255 / 9 = ${(255 / 9).toFixed(1)}`);
  s('line', { x1: xs(0), x2: xs(90), y1: 186, y2: 186, class: 'l-axis' }, wv);
  [0, 20, 40, 60, 80].forEach(v => {
    s('line', { x1: xs(v), x2: xs(v), y1: 186, y2: 191, class: 'l-axis' }, wv);
    s('text', { x: xs(v), y: 204, 'text-anchor': 'middle' }, wv, v);
  });
  [[sorted[4], 's-pri', 't-pri', 'median ' + sorted[4]], [sum / 9, 's-sec', 't-sec', 'average ' + Math.round(sum / 9)]].forEach(([v, lc, tc, label]) => {
    s('line', { x1: xs(v), x2: xs(v), y1: 176, y2: 192, class: lc }, wv);
    s('text', { x: xs(v), y: 224, 'text-anchor': 'middle', class: tc + ' t-bold' }, wv, label);
  });

  // Figure 3: the window visits every pixel; a border rule (slide 15) supplies the cells outside the image
  const RULES = [
    { key: 'zero', name: 'Zero padding', how: 'zero padding fills them with 0' },
    { key: 'skip', name: 'Skip the border', how: 'skipping the border gives this pixel no filtered value' },
    { key: 'dup', name: 'Duplicate edges', how: 'duplicating the edges copies the nearest image pixel' },
    { key: 'wrap', name: 'Wrap-around', how: 'wrap-around takes them from the opposite side of the image' },
  ];
  const inImg = (r, c) => r >= 0 && r < 5 && c >= 0 && c < 5;
  const fits = (r, c) => r >= 1 && r <= 3 && c >= 1 && c <= 3;
  const near = v => Math.max(0, Math.min(4, v));
  const padv = (rule, r, c) => {
    if (inImg(r, c)) return IMG[r][c];
    if (rule === 'zero') return 0;
    if (rule === 'dup') return IMG[near(r)][near(c)];
    if (rule === 'wrap') return IMG[(r + 5) % 5][(c + 5) % 5];
    return null;
  };
  const POS = IMG.flatMap((row, r) => row.map((_, c) => [r, c]));
  const filterAt = (rule, r, c) => {
    const cells = [-1, 0, 1].flatMap(dr => [-1, 0, 1].map(dc => [r + dr, c + dc]));
    const out = cells.filter(([rr, cc]) => !inImg(rr, cc)).length;
    if (rule === 'skip' && !fits(r, c)) return { cells, out, skip: true };
    const w = cells.map(([rr, cc]) => padv(rule, rr, cc));
    const total = w.reduce((a, b) => a + b, 0);
    return { cells, out, w, total, avg: Math.round(total / 9), med: median(w), sorted: w.slice().sort((a, b) => a - b) };
  };
  const SC = 30, OC = 30, PAD = ['−1', '0', '1', '2', '3', '4', '5'];
  const sp = svg(viz('spread'), 760, 486, { label: 'The 3 by 3 window visiting every pixel of the image, with a border rule filling the cells outside it, and the average and median written into two 5 by 5 output images', minWidth: 560 });
  const sl = s('g', {}, sp);
  const st = (x, y, text, cls, anchor) => s('text', { x, y, dy: '0.35em', 'text-anchor': anchor, class: cls }, sl, text);
  const box = (x, y, w, h, cls, extra) => {
    s('rect', { x, y, width: w, height: h, class: 'f-none sep', style: 'stroke-width: 6' }, sl);
    s('rect', { x, y, width: w, height: h, class: 'f-none ' + cls, style: 'stroke-width: 3' + (extra || '') }, sl);
  };
  // padded cells keep their gray value but are faded, so the invented values stay readable
  const padFill = (v, out) => (v == null ? { cls: 'f-seg', style: 'opacity: 0.3', text: 't-muted' } : out ? { style: gray(v).style + '; opacity: 0.5', text: 't-fg' } : gray(v));
  let ruleK = 0, posK = 12;

  function drawSlide() {
    sl.textContent = '';
    const rule = RULES[ruleK].key, cur = posK < 25 ? POS[posK] : null;
    const padded = PAD.map((_, r) => PAD.map((_, c) => padv(rule, r - 1, c - 1)));
    const gi = grid(sl, {
      x: 40, y: 56, data: padded, cell: SC, gap: 2, stroke: 'box', rowLabels: PAD, colLabels: PAD, title: 'Input with its border ring',
      fill: (v, r, c) => padFill(v, !inImg(r - 1, c - 1)), text: v => (v == null ? '–' : v),
    });
    s('rect', { x: gi.cx(1) - 1, y: gi.cy(1) - 1, width: 5 * (SC + 2), height: 5 * (SC + 2), class: 'f-none s-fg dash' }, sl);
    if (cur) box(gi.cx(cur[1]) - 2, gi.cy(cur[0]) - 2, 3 * (SC + 2) + 2, 3 * (SC + 2) + 2, 'outline-pri');
    const res = POS.map(([r, c]) => filterAt(rule, r, c));
    [['Average', 'avg', 'outline-sec', 300], ['Median', 'med', 'outline-pri', 500]].forEach(([name, key, oc, x]) => {
      const data = IMG.map((row, r) => row.map((_, c) => res[r * 5 + c][key]));
      const go = grid(sl, {
        x, y: 88, data, cell: OC, gap: 2, stroke: 'box', rowLabels: IDX, colLabels: IDX, title: `${name} output 5 × 5`,
        fill: (v, r, c) => (r * 5 + c > posK ? { cls: 'f-seg', style: 'opacity: 0.55' } : v == null ? { cls: 'f-seg', style: 'opacity: 0.3' } : gray(v)),
        text: (v, r, c) => (r * 5 + c > posK ? '' : v == null ? '–' : v),
        textCls: v => (v == null ? 't-muted' : gray(v).text),
      });
      if (cur) box(go.cx(cur[1]), go.cy(cur[0]), OC, OC, oc);
    });
    if (!cur) {
      const inner = res.filter((_, i) => fits(...POS[i]));
      const corner = res[0];
      st(40, 318, `All 25 pixels done with ${RULES[ruleK].name.toLowerCase()}.`, 't-fg t-bold');
      st(40, 344, `Inner 3 × 3: average ${Math.min(...inner.map(o => o.avg))} to ${Math.max(...inner.map(o => o.avg))}, about 21 too bright, because every inner window holds the 255.`, 't-sec');
      st(40, 366, `Inner 3 × 3: median ${Math.min(...inner.map(o => o.med))} to ${Math.max(...inner.map(o => o.med))}, the salt pixel is gone.`, 't-pri');
      st(40, 396, rule === 'skip' ? 'The 16 frame pixels have no full window, so they stay empty (–).'
        : rule === 'zero' ? `The frame is darkened by the zeros. Corner (0, 0): average ${corner.avg}, median ${corner.med}, because 5 of its 9 cells are 0.`
          : rule === 'dup' ? `The frame stays close to the image. Corner (0, 0): average ${corner.avg}, median ${corner.med}.`
            : `The frame mixes in the opposite side. Corner (0, 0): average ${corner.avg}, median ${corner.med}.`, 't-fg');
      return;
    }
    const o = res[posK];
    if (o.skip) {
      st(40, 318, `Window at (${cur}): ${o.out} of its 9 cells are outside the image.`, 't-fg t-bold');
      st(40, 342, 'With "skip the border" this output pixel gets no value (–).', 't-fg');
      return;
    }
    const outside = i => !inImg(...o.cells[i]);
    const ga = grid(sl, { x: 40, y: 330, data: [o.w], cell: SC, gap: 2, stroke: 'box', title: '(i) Average: add the 9 window values, divide by 9', fill: (v, r, c) => padFill(v, outside(c)) });
    st(ga.cx(8) + SC + 14, 330 + SC / 2 - 9, `sum = ${o.total}`, 't-sec t-bold');
    st(ga.cx(8) + SC + 14, 330 + SC / 2 + 9, `${o.total} / 9 = ${(o.total / 9).toFixed(2)} → ${o.avg}`, 't-sec t-bold');
    const gm = grid(sl, { x: 40, y: 420, data: [o.sorted], cell: SC, gap: 2, stroke: 'box', colLabels: o.sorted.map((_, i) => String(i + 1)), title: '(ii) Median: sort the 9 values, take the 5th', fill: v => gray(v) });
    box(gm.cx(4), 420, SC, SC, 'outline-pri');
    st(gm.cx(8) + SC + 14, 420 + SC / 2, `5th of 9 = ${o.med}`, 't-pri t-bold');
    st(gm.cx(4) + SC / 2, 420 + SC + 14, 'median', 't-pri t-sm', 'middle');
  }

  function slideNote() {
    const rule = RULES[ruleK];
    if (posK === 25) return `All 25 positions done with ${rule.name.toLowerCase()}. Switch the rule to compare the frame.`;
    const [r, c] = POS[posK], o = filterAt(rule.key, r, c);
    let t = `Window centred on (${r}, ${c}), pixel ${posK + 1} of 25. `;
    if (o.out) t += `${o.out} of its 9 cells are outside the image, and ${rule.how}. `;
    if (o.skip) return t;
    t += `Average: ${o.total} / 9 = ${(o.total / 9).toFixed(2)}, written as ${o.avg}. Median: the 5th sorted value is ${o.med}.`;
    if (fits(r, c)) {
      const clean = (o.total - 255) / 8;
      t += ` The 8 clean pixels average ${clean.toFixed(2)}, but the 255 takes one of the nine votes, so the average comes out ${(o.total / 9 - clean).toFixed(1)} too bright.`;
    }
    if (posK === 12) t += ' This is the pixel the question asks about.';
    return t;
  }

  const update = () => { drawSlide(); role('slide-note').textContent = slideNote(); };
  steps(viz('rule-steps'), RULES.map(rl => rl.name), k => { ruleK = k; update(); }, 0);
  const pIn = slider(viz('slide-steps'), { label: 'pixel', min: 0, max: 25, step: 1, value: posK, fmt: v => (v === 25 ? 'all 25 done' : `(${POS[v]}), ${v + 1} of 25`) }, v => { posK = v; update(); });
  const nav = QV.h('div', { class: 'steps' }, viz('slide-steps'));
  [['← previous', -1], ['next →', 1], ['all', 25]].forEach(([label, d]) => QV.h('button', { type: 'button' }, nav, label).addEventListener('click', () => {
    pIn.value = d === 25 ? 25 : Math.min(25, Math.max(0, posK + d));
    pIn.dispatchEvent(new Event('input'));
  }));
});

QV.register('s1-w3', function (q) {
  const { s, svg, grid, gray, steps, slider, axes, table, fmt, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const IMG = [[1, 2, 2, 3], [2, 1, 3, 3], [2, 2, 4, 3], [1, 2, 3, 6]];
  const LV = [0, 1, 2, 3, 4, 5, 6, 7];
  const hist = rows => LV.map(k => rows.flat().filter(v => v === k).length);
  const NK = hist(IMG);
  const CUM = NK.map((_, k) => NK.slice(0, k + 1).reduce((a, b) => a + b, 0));
  const NORM = CUM.map(c => c * 7 / 16);
  const SK = NORM.map(v => Math.floor(v + 0.5));
  const OUTIMG = IMG.map(r => r.map(v => SK[v]));
  const NOUT = hist(OUTIMG);
  const g7 = v => gray(v, 7);

  const g0 = svg(viz('given'), 190, 178, { label: 'The 4 by 4 image with gray levels 0 to 7', minWidth: 160 });
  grid(g0, { x: 16, y: 10, data: IMG, cell: 38, gap: 2, fill: g7 });

  // Figure 1: counting the pixels into bins, row by row
  const cv = svg(viz('count'), 660, 260, { label: 'Building the histogram row by row', minWidth: 520 });
  const gi = grid(cv, { x: 44, y: 56, data: IMG, cell: 38, gap: 2, fill: g7, rowLabels: ['row 0', 'row 1', 'row 2', 'row 3'], title: 'Image' });
  const rowMark = [s('rect', { x: 41, width: 164, height: 44, class: 'f-none sep', style: 'stroke-width: 6' }, cv), s('rect', { x: 41, width: 164, height: 44, class: 'f-none outline-sec', style: 'stroke-width: 3' }, cv)];
  const ax = axes(cv, { x: 270, y: 30, w: 370, h: 180, xd: [-0.5, 7.5], yd: [0, 7], xt: LV, yt: [0, 2, 4, 6], xl: 'gray level k', yl: 'count' });
  const bars = LV.map(k => ({
    prev: s('rect', { x: ax.x(k) - 14, width: 28, class: 'f-pri' }, cv),
    cur: s('rect', { x: ax.x(k) - 14, width: 28, class: 'f-sec' }, cv),
    label: s('text', { x: ax.x(k), 'text-anchor': 'middle', class: 't-fg t-bold' }, cv),
  }));
  const setBar = (r, a, b) => { r.setAttribute('y', ax.y(b)); r.setAttribute('height', ax.y(a) - ax.y(b)); };
  const WORD = ['zero', 'one', 'two', 'three', 'four'];
  const list = a => (a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0]);
  steps(viz('count-steps'), ['All', 'Row 0', 'Row 1', 'Row 2', 'Row 3'], k => {
    const done = k === 0 ? 4 : k - 1;
    const prev = hist(IMG.slice(0, done)), cur = k === 0 ? LV.map(() => 0) : hist([IMG[k - 1]]);
    LV.forEach(l => {
      setBar(bars[l].prev, 0, prev[l]);
      setBar(bars[l].cur, prev[l], prev[l] + cur[l]);
      bars[l].label.setAttribute('y', ax.y(prev[l] + cur[l]) - 6);
      bars[l].label.textContent = prev[l] + cur[l];
    });
    IMG.forEach((row, r) => row.forEach((_, c) => {
      const dim = k > 0 && r > k - 1;
      gi.rects[r][c].classList.toggle('dim', dim);
      gi.texts[r][c].classList.toggle('dim', dim);
    }));
    rowMark.forEach(el => {
      el.setAttribute('visibility', k > 0 ? 'visible' : 'hidden');
      el.setAttribute('y', gi.cy(Math.max(0, k - 1)) - 3);
    });
    if (k === 0) {
      role('count-note').innerHTML = `All 16 pixels counted: n<sub>k</sub> = ${NK.join(', ')} for k = 0 to 7. The counts add up to ${NK.reduce((a, b) => a + b, 0)}.`;
    } else {
      const parts = LV.filter(l => cur[l]).map(l => WORD[cur[l]] + ' ' + l + (cur[l] > 1 ? 's' : ''));
      role('count-note').innerHTML = `Row ${k - 1} (${IMG[k - 1].join(' ')}) adds ${list(parts)}. ${k * 4} of 16 pixels counted.`;
    }
  });

  // Figure 2: cumulative sum, scaled by 7/16 and rounded
  const cd = svg(viz('cdf'), 660, 290, { label: 'Cumulative histogram with the scaled and rounded output levels', minWidth: 520 });
  const a2 = axes(cd, { x: 60, y: 44, w: 520, h: 180, xd: [-0.5, 7.5], yd: [0, 16], xt: LV, yt: [0, 4, 8, 12, 16], yl: 'cumulative sum', grid: false });
  const yS = v => a2.y(v * 16 / 7);
  s('line', { x1: 580, x2: 580, y1: 44, y2: 224, class: 'l-axis' }, cd);
  LV.forEach(v => {
    s('line', { x1: 60, x2: 580, y1: yS(v), y2: yS(v), class: 'l-grid dash' }, cd);
    s('line', { x1: 580, x2: 585, y1: yS(v), y2: yS(v), class: 'l-axis' }, cd);
    s('text', { x: 590, y: yS(v), dy: '0.35em', class: 't-ok' }, cd, v);
  });
  s('text', { x: 650, y: 16, 'text-anchor': 'end', class: 't-ok' }, cd, 's = round(cum × 7/16)');
  const cols = LV.map(k => {
    const g = s('g', { class: 'fade' }, cd);
    const x = a2.x(k);
    if (CUM[k] > 0) s('rect', { x: x - 15, y: a2.y(CUM[k]), width: 30, height: a2.y(0) - a2.y(CUM[k]), class: 'f-pri' }, g);
    s('text', { x, y: a2.y(CUM[k]) - 6, 'text-anchor': 'middle', class: 't-pri t-bold' }, g, CUM[k]);
    s('line', { x1: x + 17, x2: x + 31, y1: yS(SK[k]), y2: yS(SK[k]), class: 's-ok', style: 'stroke-width: 3' }, g);
    s('text', { x, y: 258, 'text-anchor': 'middle', class: 't-ok t-bold' }, g, '→ ' + SK[k]);
    return g;
  });
  s('text', { x: 320, y: 280, 'text-anchor': 'middle' }, cd, 'input level r, with the output level s below it');
  const tbl = table(viz('cdf-table'),
    [{ html: 'r<sub>k</sub>' }, { html: 'n<sub>k</sub>' }, { html: 'p<sub>r</sub> = n<sub>k</sub>/16' }, 'cumulative sum', 'cum × 7/16', { html: 's<sub>k</sub>' }],
    LV.map(k => [k, NK[k], fmt(NK[k] / 16, 4), CUM[k], fmt(NORM[k], 4), { text: SK[k], cls: 'hl' }]));
  steps(viz('cdf-steps'), ['All'].concat(LV.map(k => 'r = ' + k)), k => {
    cols.forEach((g, i) => g.classList.toggle('dim', k > 0 && i !== k - 1));
    tbl.rows.forEach((r, i) => r.classList.toggle('on', k > 0 && i === k - 1));
    const r = k - 1;
    role('cdf-note').textContent = k === 0
      ? `Normalized sums ${NORM.map(v => fmt(v, 4)).join(', ')} round to the LUT ${SK.join(' ')}.`
      : `r = ${r}: n = ${NK[r]}, cumulative ${r ? CUM[r - 1] : 0} + ${NK[r]} = ${CUM[r]}, normalized ${CUM[r]} × 7/16 = ${fmt(NORM[r], 4)}, nearest integer s = ${SK[r]}.`;
  });

  // Figure 3: part (c) step by step: build the LUT, convert each pixel, count the output histogram
  const STAGES = [{ name: '1 · Mapping', from: 0 }, { name: '2 · Output image', from: 8 }, { name: '3 · Output histogram', from: 24 }, { name: 'All', from: 32 }];
  const LAST = 32;
  let gk = 0;
  const stageOf = v => (v < 8 ? 0 : v < 24 ? 1 : v < 32 ? 2 : 3);
  const cs = svg(viz('c-fig'), 760, 424, { label: 'Histogram equalization step by step: the lookup table, the pixel-by-pixel conversion and the output histogram', minWidth: 560 });
  const cl = s('g', {}, cs);
  const ct = (x, y, text, cls, anchor) => s('text', { x, y, dy: '0.35em', 'text-anchor': anchor, class: cls }, cl, text);
  const ring = (x, y, w, h, cls) => {
    s('rect', { x, y, width: w, height: h, class: 'f-none sep', style: 'stroke-width: 6' }, cl);
    s('rect', { x, y, width: w, height: h, class: 'f-none ' + cls, style: 'stroke-width: 3' }, cl);
  };
  const faded = { cls: 'f-seg', style: 'opacity: 0.55' };

  function drawC() {
    cl.textContent = '';
    const stage = stageOf(gk);
    const r = stage === 0 ? gk : null;
    const p = stage === 1 ? gk - 8 : null, pi = p == null ? null : [Math.floor(p / 4), p % 4];
    const kc = stage === 2 ? gk - 24 : null;
    const lutDone = l => stage > 0 || l <= r;
    const pixDone = (i, j) => stage > 1 || (stage === 1 && i * 4 + j <= p);
    const histDone = k => stage === 3 || (stage === 2 && k <= kc);

    const gin = grid(cl, { x: 40, y: 56, data: IMG, cell: 34, gap: 2, fill: g7, stroke: 'box', title: 'Input image' });
    if (stage === 0) IMG.forEach((row, i) => row.forEach((v, j) => { if (v === r) ring(gin.cx(j), gin.cy(i), 34, 34, 'outline-sec'); }));
    if (pi) ring(gin.cx(pi[1]), gin.cy(pi[0]), 34, 34, 'outline-pri');

    const lut = grid(cl, {
      x: 272, y: 56, data: [LV, CUM, SK], cell: 34, gap: 2, stroke: 'box', rowLabels: ['r', 'cum', 's'], title: 'Mapping r → s (the LUT)',
      fill: (v, row, col) => (row === 0 ? g7(v) : !lutDone(col) ? faded : row === 2 ? g7(v) : { cls: 'f-seg', text: 't-fg' }),
      text: (v, row, col) => (row > 0 && !lutDone(col) ? '' : v),
    });
    const lc = stage === 0 ? r : pi ? IMG[pi[0]][pi[1]] : null;
    if (lc != null) ring(lut.cx(lc), 56, 34, 3 * 36 - 2, stage === 0 ? 'outline-sec' : 'outline-pri');
    arrow(cl, 190, 110, 234, 110, { cls: 'a-muted' });
    arrow(cl, 566, 110, 606, 110, { cls: 'a-muted' });

    const gout = grid(cl, {
      x: 616, y: 56, data: OUTIMG, cell: 34, gap: 2, stroke: 'box', title: 'Output image',
      fill: (v, i, j) => (pixDone(i, j) ? g7(v) : faded), text: (v, i, j) => (pixDone(i, j) ? v : ''),
    });
    if (pi) ring(gout.cx(pi[1]), gout.cy(pi[0]), 34, 34, 'outline-pri');
    if (stage === 2) OUTIMG.forEach((row, i) => row.forEach((v, j) => { if (v === kc) ring(gout.cx(j), gout.cy(i), 34, 34, 's-ok'); }));

    const hIn = axes(cl, { x: 56, y: 268, w: 290, h: 104, xd: [-0.5, 7.5], yd: [0, 7], xt: LV, yt: [0, 2, 4, 6], xl: 'gray level', yl: 'input histogram' });
    const hOut = axes(cl, { x: 446, y: 268, w: 290, h: 104, xd: [-0.5, 7.5], yd: [0, 7], xt: LV, yt: [0, 2, 4, 6], xl: 'gray level', yl: 'output histogram' });
    LV.forEach(k => {
      const on = stage !== 0 || k <= r;
      if (NK[k]) s('rect', { x: hIn.x(k) - 12, y: hIn.y(NK[k]), width: 24, height: hIn.y(0) - hIn.y(NK[k]), class: 'f-pri', style: on ? null : 'opacity: 0.25' }, cl);
      ct(hIn.x(k), hIn.y(NK[k]) - 9, NK[k], on ? 't-pri t-bold' : 't-muted', 'middle');
      if (!histDone(k)) return;
      if (NOUT[k]) s('rect', { x: hOut.x(k) - 12, y: hOut.y(NOUT[k]), width: 24, height: hOut.y(0) - hOut.y(NOUT[k]), class: 'f-ok' }, cl);
      ct(hOut.x(k), hOut.y(NOUT[k]) - 9, NOUT[k], 't-ok t-bold', 'middle');
    });
    if (stage === 0) ct(346, 252, `bars 0 to ${r}: ${CUM[r]} pixels`, 't-pri t-bold', 'end');
    if (stage === 2) ring(hOut.x(kc) - 16, hOut.y(7) - 14, 32, hOut.y(0) - hOut.y(7) + 14, 's-ok');
  }

  function cNote() {
    const stage = stageOf(gk);
    if (stage === 0) {
      const r = gk;
      return `Step 1, level r = ${r}. Cumulative sum ${r ? `${CUM[r - 1]} + ${NK[r]} = ` : ''}${CUM[r]}: that many pixels have level ${r} or darker (the solid bars). 7 × ${CUM[r]} / 16 = ${fmt(NORM[r], 4)}, nearest integer <b>${SK[r]}</b>. So every ${r} becomes ${SK[r]}.` + (NK[r] ? '' : ` No pixel has level ${r}, so this entry is never used.`);
    }
    if (stage === 1) {
      const p = gk - 8, i = Math.floor(p / 4), j = p % 4, v = IMG[i][j];
      return `Step 2, pixel (${i}, ${j}) of the input is ${v}. The table says ${v} → ${SK[v]}, so write <b>${SK[v]}</b> at (${i}, ${j}) of the output. ${p + 1} of 16 pixels converted.`;
    }
    if (stage === 2) {
      const k = gk - 24;
      return `Step 3, level ${k}: ${NOUT[k] ? `${NOUT[k]} output pixel${NOUT[k] > 1 ? 's have' : ' has'} the value ${k} (outlined)` : `no output pixel has the value ${k}`}, so n<sub>${k}</sub> = <b>${NOUT[k]}</b> in the output histogram.`;
    }
    return `Done. Mapping ${SK.join(' ')} for r = 0 to 7. Output histogram ${NOUT.join(', ')}, still 16 pixels. The crowded levels 2 and 3 moved apart to 4 and 6, and 4 and 6 merged into 7. The pixels now spread over the whole range, but the histogram is not flat (slide 26).`;
  }

  const cWrap = viz('c-steps');
  const stageBar = QV.h('div', { class: 'steps', role: 'group', 'aria-label': 'Stage' }, cWrap);
  const stageBtns = STAGES.map(st => {
    const b = QV.h('button', { type: 'button', 'aria-pressed': 'false' }, stageBar, st.name);
    b.addEventListener('click', () => goC(st.from));
    return b;
  });
  const cLabel = v => {
    const st = stageOf(v);
    return st === 0 ? `mapping r = ${v}` : st === 1 ? `pixel (${Math.floor((v - 8) / 4)},${(v - 8) % 4})` : st === 2 ? `counting level ${v - 24}` : 'done';
  };
  const cIn = slider(cWrap, { label: 'step', min: 0, max: LAST, step: 1, value: gk, fmt: v => (v === LAST ? `all ${LAST} steps done` : `${v + 1} of ${LAST}, ${cLabel(v)}`) }, v => {
    gk = v;
    drawC();
    role('c-note').innerHTML = cNote();
    stageBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === stageOf(gk))));
  });
  const cNav = QV.h('div', { class: 'steps' }, cWrap);
  [['← previous', -1], ['next →', 1]].forEach(([label, d]) => QV.h('button', { type: 'button' }, cNav, label).addEventListener('click', () => goC(gk + d)));
  function goC(v) {
    cIn.value = Math.max(0, Math.min(LAST, v));
    cIn.dispatchEvent(new Event('input'));
  }

  // Figure 4: input histogram, the r to s mapping, output histogram
  const mp = svg(viz('map'), 620, 312, { label: 'Input histogram mapped level by level onto the output histogram', minWidth: 500 });
  const X = k => 130 + k * 62, U = 11;
  [['input', 78, 't-pri t-bold'], ['level r', 124, 't-fg'], ['LUT', 168, 't-muted'], ['level s', 212, 't-fg'], ['output', 258, 't-ok t-bold']]
    .forEach(([t, y, cls]) => s('text', { x: 6, y, dy: '0.35em', class: cls }, mp, t));
  LV.forEach(r => {
    const w = NK[r];
    s('line', { x1: X(r), y1: 140, x2: X(SK[r]), y2: 190, class: w ? 's-pri' : 's-muted dash', style: w ? `stroke-width: ${1 + 2.2 * w}; opacity: 0.55` : 'stroke-width: 1' }, mp);
  });
  LV.forEach(k => {
    if (NK[k]) s('rect', { x: X(k) - 15, y: 110 - U * NK[k], width: 30, height: U * NK[k], class: 'f-pri' }, mp);
    s('text', { x: X(k), y: 110 - U * NK[k] - 6, 'text-anchor': 'middle', class: NK[k] ? 't-pri t-bold' : 't-muted' }, mp, NK[k]);
    s('text', { x: X(k), y: 124, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, mp, k);
    s('text', { x: X(k), y: 212, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, mp, k);
    if (NOUT[k]) s('rect', { x: X(k) - 15, y: 222, width: 30, height: U * NOUT[k], class: 'f-ok' }, mp);
    s('text', { x: X(k), y: 222 + U * NOUT[k] + 14, 'text-anchor': 'middle', class: NOUT[k] ? 't-ok t-bold' : 't-muted' }, mp, NOUT[k]);
  });
  s('line', { x1: X(0) - 20, x2: X(7) + 20, y1: 110, y2: 110, class: 'l-axis' }, mp);
  s('line', { x1: X(0) - 20, x2: X(7) + 20, y1: 222, y2: 222, class: 'l-axis' }, mp);

  const im = svg(viz('images'), 440, 194, { label: 'The input image and the equalized output image', minWidth: 360 });
  grid(im, { x: 20, y: 44, data: IMG, cell: 34, gap: 2, fill: g7, title: 'input' });
  arrow(im, 178, 115, 264, 115, { label: 'LUT' });
  grid(im, { x: 280, y: 44, data: OUTIMG, cell: 34, gap: 2, fill: g7, title: 'output' });
});

QV.register('s1-w4', function (q) {
  const { s, svg, steps, slider, axes, plot, arrow, box } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: the slide-18 flow chart
  const fl = svg(viz('flow'), 600, 524, { label: 'Pattern recognition system: input, sensing, segmentation, feature extraction, classification, post-processing, decision', minWidth: 480 });
  const BX = 140, BW = 220, BH = 40, CX = 250;
  const ST = [
    { name: 'sensing', y: 410 },
    { name: 'segmentation', y: 330 },
    { name: 'feature extraction', y: 250 },
    { name: 'classification', y: 170 },
    { name: 'post-processing', y: 90 },
  ];
  const DATA = ['camera image', 'one fish, no background', 'x = (lightness, width)', 'label: sea bass'];
  s('text', { x: CX, y: 510, 'text-anchor': 'middle', class: 't-fg t-bold' }, fl, 'input');
  arrow(fl, CX, 496, CX, 452, { width: 2 });
  s('text', { x: CX - 10, y: 474, dy: '0.35em', 'text-anchor': 'end' }, fl, 'a fish on the belt');
  s('text', { x: CX, y: 18, 'text-anchor': 'middle', class: 't-fg t-bold' }, fl, 'decision');
  arrow(fl, CX, 88, CX, 28, { width: 2 });
  s('text', { x: CX - 10, y: 58, dy: '0.35em', 'text-anchor': 'end' }, fl, 'sea bass can');
  for (let i = 0; i < 4; i++) {
    const lo = ST[i].y, hi = ST[i + 1].y + BH;
    arrow(fl, 210, lo - 2, 210, hi + 2, { width: 2 });
    arrow(fl, 290, hi + 2, 290, lo - 2, { dash: true, width: 1.5 });
    s('text', { x: 200, y: (lo + hi) / 2, dy: '0.35em', 'text-anchor': 'end' }, fl, DATA[i]);
  }
  const boxes = ST.map(st => ({
    rect: s('rect', { x: BX, y: st.y, width: BW, height: BH, rx: 6 }, fl),
    text: s('text', { x: CX, y: st.y + BH / 2, dy: '0.35em', 'text-anchor': 'middle' }, fl, st.name),
  }));
  const SIDE = [
    { lines: ['costs'], y: 101, to: [101], stages: [4] },
    { lines: ['adjustments for', 'context'], y: 150, to: [119, 181], stages: [3, 4] },
    { lines: ['adjustments for', 'missing features'], y: 199, to: [199], stages: [3] },
  ].map(sd => {
    const g = s('g', { class: 'fade' }, fl);
    if (sd.to.length > 1) {
      s('line', { x1: 440, y1: sd.y, x2: 400, y2: sd.y, class: 'a-sec', style: 'stroke-width: 1.5; fill: none' }, g);
      s('line', { x1: 400, y1: sd.to[0], x2: 400, y2: sd.to[1], class: 'a-sec', style: 'stroke-width: 1.5; fill: none' }, g);
      sd.to.forEach(y => arrow(g, 400, y, BX + BW + 2, y, { cls: 'a-sec', width: 1.5 }));
    } else {
      arrow(g, 440, sd.y, BX + BW + 2, sd.y, { cls: 'a-sec', width: 1.5 });
    }
    sd.lines.forEach((t, i) => s('text', { x: 448, y: sd.y + (i - (sd.lines.length - 1) / 2) * 14, dy: '0.35em', class: 't-sec' }, g, t));
    return { g, stages: sd.stages };
  });
  const NOTES = [
    'All five stages, read from the bottom. Slide 18 highlights classification. Costs and context adjust the last two stages.',
    'Sensing: "use of a transducer (camera or microphone)". The system depends on its bandwidth, resolution, sensitivity and distortion.',
    'Segmentation and grouping: isolate each pattern from the others and from the background. "Patterns should be well separated and should not overlap".',
    'Feature extraction: measure "discriminative features", "invariant with respect to translation, rotation and scale" (fish: length, lightness, width).',
    'Classification: "use a feature vector provided by a feature extractor to assign the object to a category". Context and missing features adjust it.',
    'Post-processing: "exploit context input dependent information other than from the target pattern itself to improve performance". It weighs the costs of errors, then outputs the decision.',
  ];
  steps(viz('flow-steps'), ['All', 'Sensing', 'Segmentation', 'Feature extraction', 'Classification', 'Post-processing'], k => {
    boxes.forEach((b, i) => {
      const on = k === i + 1;
      b.rect.setAttribute('class', on ? 'f-pri' : (k === 0 && i === 3 ? 'f-surface outline-pri' : 'f-surface box'));
      b.text.setAttribute('class', (on ? 't-on' : 't-fg') + ' t-lg' + (on || (k === 0 && i === 3) ? ' t-bold' : ''));
    });
    SIDE.forEach(sd => sd.g.classList.toggle('dim', k > 0 && !sd.stages.includes(k - 1)));
    role('flow-note').textContent = NOTES[k];
  });

  // Figure 2: one feature, a threshold, and the cost of each error
  const SAL = { m: 4, sd: 1.3 }, BAS = { m: 7, sd: 1.3 };
  const pdf = (x, p) => Math.exp(-0.5 * ((x - p.m) / p.sd) ** 2) / (p.sd * Math.sqrt(2 * Math.PI));
  const erf = x => {
    const t = 1 / (1 + 0.3275911 * Math.abs(x));
    const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return x >= 0 ? y : -y;
  };
  const cdf = (x, p) => 0.5 * (1 + erf((x - p.m) / (p.sd * Math.SQRT2)));
  const cs = svg(viz('cost'), 640, 266, { label: 'Lightness distributions of salmon and sea bass with a movable decision threshold', minWidth: 500 });
  const ax = axes(cs, { x: 40, y: 30, w: 580, h: 190, xd: [0, 11], yd: [0, 0.42], xt: [0, 2, 4, 6, 8, 10], yt: [], xl: 'lightness' });
  const area = (p, a, b, cls) => {
    const pts = [];
    for (let i = 0; i <= 80; i++) { const x = a + (b - a) * i / 80; pts.push(ax.x(x).toFixed(1) + ' ' + ax.y(pdf(x, p)).toFixed(1)); }
    return `M${ax.x(a)} ${ax.y(0)} L${pts.join(' L')} L${ax.x(b)} ${ax.y(0)} Z`;
  };
  const tailB = s('path', { class: 'area-pri', style: 'opacity: 0.4' }, cs);
  const tailS = s('path', { class: 'area-sec', style: 'opacity: 0.4' }, cs);
  plot(cs, ax, x => pdf(x, SAL), 0, 11, 300, 's-sec');
  plot(cs, ax, x => pdf(x, BAS), 0, 11, 300, 's-pri');
  s('text', { x: ax.x(SAL.m), y: ax.y(pdf(SAL.m, SAL)) - 10, 'text-anchor': 'middle', class: 't-sec t-bold' }, cs, 'salmon');
  s('text', { x: ax.x(BAS.m), y: ax.y(pdf(BAS.m, BAS)) - 10, 'text-anchor': 'middle', class: 't-pri t-bold' }, cs, 'sea bass');
  const thr = s('line', { y1: ax.y(0), y2: ax.y(0.42), class: 's-fg', style: 'stroke-width: 2' }, cs);
  const thrT = s('text', { y: 20, 'text-anchor': 'middle', class: 't-fg t-bold' }, cs);
  const leftT = s('text', { y: 46, 'text-anchor': 'end', class: 't-sec' }, cs, '← labelled salmon');
  const rightT = s('text', { y: 46, class: 't-pri' }, cs, 'labelled sea bass →');
  slider(viz('cost-slider'), { label: 'threshold x*', min: 3, max: 8, step: 0.1, value: 5.5, fmt: v => v.toFixed(1) }, t => {
    const x = ax.x(t);
    tailB.setAttribute('d', area(BAS, 0, t));
    tailS.setAttribute('d', area(SAL, t, 11));
    thr.setAttribute('x1', x); thr.setAttribute('x2', x);
    thrT.setAttribute('x', x); thrT.textContent = 'x* = ' + t.toFixed(1);
    leftT.setAttribute('x', x - 8); rightT.setAttribute('x', x + 8);
    role('err-bass').textContent = (100 * cdf(t, BAS)).toFixed(1) + '%';
    role('err-salmon').textContent = (100 * (1 - cdf(t, SAL))).toFixed(1) + '%';
  });

  // Figure 3: the design cycle (slide 21)
  const cy = svg(viz('cycle'), 560, 336, { label: 'Design cycle: collect data, choose features, choose model, train classifier, evaluate classifier, with feedback', minWidth: 460 });
  const NAMES = ['collect data', 'choose features', 'choose model', 'train classifier', 'evaluate classifier'];
  const bx = 200, bw = 180, bh = 36, ys = i => 44 + i * 60;
  s('text', { x: bx + bw / 2, y: 14, 'text-anchor': 'middle', class: 't-fg t-bold' }, cy, 'start');
  arrow(cy, bx + bw / 2, 20, bx + bw / 2, ys(0) - 2);
  NAMES.forEach((n, i) => {
    box(cy, bx, ys(i), bw, bh, n, { cls: i === 4 ? 'f-sec-soft' : 'f-surface' });
    if (i < 4) arrow(cy, bx + bw / 2, ys(i) + bh, bx + bw / 2, ys(i + 1) - 2);
  });
  const fy = i => ys(i) + bh / 2;
  s('path', { d: `M${bx + bw} ${fy(4)} L470 ${fy(4)} L470 ${fy(0)}`, class: 'a-sec', style: 'stroke-width: 1.5; fill: none' }, cy);
  for (let i = 0; i < 4; i++) arrow(cy, 470, fy(i), bx + bw + 2, fy(i), { cls: 'a-sec' });
  s('text', { x: 478, y: 172, class: 't-sec' }, cy, 'evaluation');
  s('text', { x: 478, y: 186, class: 't-sec' }, cy, 'feeds back');
  s('text', { x: 12, y: 146, class: 't-muted' }, cy, 'prior knowledge');
  s('text', { x: 12, y: 160, class: 't-muted' }, cy, '(e.g., invariances)');
  arrow(cy, 150, 140, bx - 2, fy(1), { dash: true });
  arrow(cy, 150, 166, bx - 2, fy(2), { dash: true });
});

QV.register('s1-w5', function (q) {
  const { s, svg, steps, table } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const P = [['A', 0.40, '0'], ['B', 0.25, '10'], ['C', 0.15, '110'], ['D', 0.12, '1111'], ['E', 0.08, '1110']];

  table(viz('given'), [{ text: 'Symbol', cls: 'l' }, 'A', 'B', 'C', 'D', 'E'], [[{ text: 'Probability', cls: 'l' }].concat(P.map(p => p[1].toFixed(2)))]);

  // Figure 1: the Huffman tree, merge by merge
  const NODES = {
    root: { x: 200, y: 100, p: '1.00', step: 4 },
    A: { x: 110, y: 170, p: '0.40', leaf: 'A', code: '0' },
    n60: { x: 290, y: 170, p: '0.60', step: 3 },
    B: { x: 200, y: 240, p: '0.25', leaf: 'B', code: '10' },
    n35: { x: 380, y: 240, p: '0.35', step: 2 },
    C: { x: 290, y: 310, p: '0.15', leaf: 'C', code: '110' },
    n20: { x: 470, y: 310, p: '0.20', step: 1 },
    E: { x: 380, y: 380, p: '0.08', leaf: 'E', code: '1110' },
    D: { x: 560, y: 380, p: '0.12', leaf: 'D', code: '1111' },
  };
  const EDGES = [['root', 'A', '0'], ['root', 'n60', '1'], ['n60', 'B', '0'], ['n60', 'n35', '1'], ['n35', 'C', '0'], ['n35', 'n20', '1'], ['n20', 'E', '0'], ['n20', 'D', '1']];
  const tr = svg(viz('tree'), 620, 420, { label: 'Huffman tree for A 0.40, B 0.25, C 0.15, D 0.12, E 0.08', minWidth: 520 });
  const chips = s('g', {}, tr);
  const edgeEls = EDGES.map(([a, b, bit]) => {
    const g = s('g', {}, tr);
    const A = NODES[a], B = NODES[b];
    s('line', { x1: A.x, y1: A.y, x2: B.x, y2: B.y, class: 's-muted' }, g);
    s('text', { x: (A.x + B.x) / 2 + (bit === '0' ? -14 : 14), y: (A.y + B.y) / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, g, bit);
    return { g, parent: a };
  });
  const nodeEls = {};
  Object.entries(NODES).forEach(([id, n]) => {
    const g = s('g', {}, tr);
    if (n.leaf) {
      s('rect', { x: n.x - 32, y: n.y - 13, width: 64, height: 26, rx: 5, class: 'f-surface box' }, g);
      s('text', { x: n.x, y: n.y, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, g, n.leaf + ' ' + n.p);
      nodeEls[id] = { g, code: s('text', { x: n.x, y: n.y + 30, 'text-anchor': 'middle', class: 't-ok t-bold t-lg' }, g, n.code) };
    } else {
      nodeEls[id] = { g, c: s('circle', { cx: n.x, cy: n.y, r: 20 }, g), t: s('text', { x: n.x, y: n.y, dy: '0.35em', 'text-anchor': 'middle' }, g, n.p) };
    }
  });
  const LISTS = [
    [['A', '0.40'], ['B', '0.25'], ['C', '0.15'], ['D', '0.12'], ['E', '0.08']],
    [['A', '0.40'], ['B', '0.25'], ['ED', '0.20'], ['C', '0.15']],
    [['A', '0.40'], ['CED', '0.35'], ['B', '0.25']],
    [['BCED', '0.60'], ['A', '0.40']],
    [['root', '1.00']],
  ];
  const NEW = [null, 'ED', 'CED', 'BCED', 'root'];
  const NOTES = [
    'All four merges. Codes: A = 0, B = 10, C = 110, E = 1110, D = 1111. The likely symbols sit near the root and get the short codes.',
    'Step 1: the two smallest are E 0.08 and D 0.12. E, the smaller, goes left = 0 and D goes right = 1. New node ED 0.20.',
    'Step 2: the two smallest are now C 0.15 and ED 0.20. C goes left = 0, ED right = 1. New node CED 0.35.',
    'Step 3: the two smallest are B 0.25 and CED 0.35. New node BCED 0.60.',
    'Step 4: A 0.40 (left = 0) and BCED 0.60 (right = 1) form the root 1.00. Read each code from the root down.',
  ];
  const mt = table(viz('merge-table'), ['Step', { text: 'Merge (smaller + larger)', cls: 'l' }, { text: 'New node', cls: 'l' }, { text: 'List after the step', cls: 'l' }], [
    ['1', 'E 0.08 + D 0.12', 'ED 0.20', 'A 0.40, B 0.25, ED 0.20, C 0.15'],
    ['2', 'C 0.15 + ED 0.20', 'CED 0.35', 'A 0.40, CED 0.35, B 0.25'],
    ['3', 'B 0.25 + CED 0.35', 'BCED 0.60', 'BCED 0.60, A 0.40'],
    ['4', 'A 0.40 + BCED 0.60', 'root 1.00', ''],
  ].map(r => r.map((c, i) => (i ? { text: c, cls: 'l' } : c))));
  steps(viz('tree-steps'), ['All', 'Step 1', 'Step 2', 'Step 3', 'Step 4'], k => {
    const shown = n => !n.step || k === 0 || n.step <= k;
    Object.entries(NODES).forEach(([id, n]) => {
      const el = nodeEls[id];
      el.g.setAttribute('visibility', shown(n) ? 'visible' : 'hidden');
      if (n.leaf) el.code.setAttribute('visibility', k === 0 || k === 4 ? 'visible' : 'hidden');
      else {
        const fresh = k > 0 && n.step === k;
        el.c.setAttribute('class', fresh ? 'f-pri' : 'f-pri-soft outline-pri');
        el.t.setAttribute('class', (fresh ? 't-on' : 't-pri') + ' t-bold');
      }
    });
    edgeEls.forEach(e => e.g.setAttribute('visibility', shown(NODES[e.parent]) ? 'visible' : 'hidden'));
    chips.textContent = '';
    s('text', { x: 0, y: 30, dy: '0.35em', class: 't-muted' }, chips, k === 0 ? 'start' : 'after ' + k);
    LISTS[k].forEach(([n, p], i) => {
      const fresh = n === NEW[k];
      s('rect', { x: 80 + i * 92, y: 16, width: 84, height: 28, rx: 5, class: fresh ? 'f-pri' : 'f-surface box' }, chips);
      s('text', { x: 122 + i * 92, y: 30, dy: '0.35em', 'text-anchor': 'middle', class: fresh ? 't-on t-bold' : 't-fg' }, chips, n + ' ' + p);
    });
    mt.rows.forEach((r, i) => r.classList.toggle('on', i === k - 1));
    role('tree-note').textContent = NOTES[k];
  });

  table(viz('codes'), [{ text: 'Symbol', cls: 'l' }, 'p', { text: 'Code', cls: 'l' }, 'Length'],
    P.map(([sym, p, code]) => [{ text: sym, cls: 'l' }, p.toFixed(2), { text: code, cls: 'l hl' }, code.length]));

  const info = p => Math.log2(1 / p);
  const H = P.reduce((a, [, p]) => a + p * info(p), 0);
  const LBAR = P.reduce((a, [, p, code]) => a + p * code.length, 0);
  table(viz('entropy-table'), [{ text: 'Symbol', cls: 'l' }, 'p', 'log₂(1/p)', 'p · log₂(1/p)'],
    P.map(([sym, p]) => [{ text: sym, cls: 'l' }, p.toFixed(2), info(p).toFixed(4), (p * info(p)).toFixed(4)])
      .concat([[{ text: 'sum', cls: 'l' }, '', '', { text: H.toFixed(4), cls: 'hl' }]]));

  // Figure 2: bits per symbol, term by term
  const lg = svg(viz('ledger'), 700, 200, { label: 'Average bits per symbol: Huffman 2.15, entropy 2.098, fixed-length 3', minWidth: 560 });
  const x0 = 120, px = 160, xb = b => x0 + b * px;
  s('rect', { x: xb(H), y: 28, width: px, height: 138, class: 'area-pri' }, lg);
  [[H, 'η = ' + H.toFixed(3)], [H + 1, 'η + 1 = ' + (H + 1).toFixed(3)]].forEach(([v, t]) => {
    s('line', { x1: xb(v), x2: xb(v), y1: 26, y2: 166, class: 's-muted dash', style: 'stroke-width: 1' }, lg);
    s('text', { x: xb(v), y: 18, 'text-anchor': 'middle', class: 't-fg' }, lg, t);
  });
  [
    { name: 'Huffman', val: 'l̄ = ' + LBAR.toFixed(2), y: 40, fill: 'f-pri', text: 't-on', cls: 't-pri', part: ([, p, code]) => p * code.length },
    { name: 'Entropy', val: 'η = ' + H.toFixed(3), y: 84, fill: 'f-seg', text: 't-fg', cls: 't-fg', part: ([, p]) => p * info(p) },
    { name: 'Fixed', val: '3 bits each', y: 128, fill: 'f-sec', text: 't-on', cls: 't-sec', part: ([, p]) => p * 3 },
  ].forEach(row => {
    s('text', { x: 0, y: row.y + 10, class: row.cls + ' t-bold' }, lg, row.name);
    s('text', { x: 0, y: row.y + 25, class: row.cls }, lg, row.val);
    let x = x0;
    P.forEach(sym => {
      const w = row.part(sym) * px;
      s('rect', { x, y: row.y, width: w, height: 30, class: row.fill + ' sep' }, lg);
      s('text', { x: x + w / 2, y: row.y + 15, dy: '0.35em', 'text-anchor': 'middle', class: row.text }, lg, w >= 44 ? sym[0] + ' ' + row.part(sym).toFixed(2).replace(/^0/, '') : sym[0]);
      x += w;
    });
  });
  s('line', { x1: xb(0), x2: xb(3.2), y1: 172, y2: 172, class: 'l-axis' }, lg);
  [0, 1, 2, 3].forEach(b => {
    s('line', { x1: xb(b), x2: xb(b), y1: 172, y2: 177, class: 'l-axis' }, lg);
    s('text', { x: xb(b), y: 190, 'text-anchor': 'middle' }, lg, b === 3 ? '3 bits' : b);
  });
});

QV.register('s1-w6', function (q) {
  const { s, svg, axes, plot, steps, slider, fmt, scale } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: sampling, quantization, both
  const sig = t => 0.55 * Math.sin(2 * Math.PI * 1.3 * t + 0.4) + 0.3 * Math.sin(2 * Math.PI * 3.1 * t + 1.1);
  const NS = 16;
  const ad = svg(viz('ad'), 660, 284, { label: 'An analog signal, its samples, and its quantized values', minWidth: 520 });
  const ax = axes(ad, { x: 50, y: 20, w: 590, h: 220, xd: [0, 1], yd: [-1, 1], xt: [0, 0.25, 0.5, 0.75, 1], xf: v => (v === 0 ? '0' : v * NS + 'T'), yt: [-1, -0.5, 0, 0.5, 1], xl: 'time', yl: 'amplitude', grid: false });
  const layer = s('g', {}, ad);
  let mode = 3, bits = 3;
  function draw() {
    const Lv = 2 ** bits, d = 2 / Lv;
    const Q = v => -1 + (Math.min(Lv - 1, Math.max(0, Math.floor((v + 1) / d))) + 0.5) * d;
    layer.textContent = '';
    if (mode === 1 || mode === 3) for (let n = 0; n <= NS; n++) s('line', { x1: ax.x(n / NS), x2: ax.x(n / NS), y1: ax.y(-1), y2: ax.y(1), class: 'l-grid' }, layer);
    if (mode === 2 || mode === 3) for (let i = 0; i < Lv; i++) s('line', { x1: ax.x(0), x2: ax.x(1), y1: ax.y(-1 + (i + 0.5) * d), y2: ax.y(-1 + (i + 0.5) * d), class: 'l-grid dash' }, layer);
    plot(layer, ax, sig, 0, 1, 400, mode === 0 ? 's-pri' : 's-muted');
    if (mode === 2) plot(layer, ax, t => Q(sig(t)), 0, 1, 1600, 's-pri');
    if (mode === 1 || mode === 3) {
      for (let n = 0; n <= NS; n++) {
        const v = sig(n / NS), y = mode === 3 ? Q(v) : v;
        s('line', { x1: ax.x(n / NS), x2: ax.x(n / NS), y1: ax.y(0), y2: ax.y(y), class: 's-pri', style: 'stroke-width: 1.5' }, layer);
        s('circle', { cx: ax.x(n / NS), cy: ax.y(y), r: 4, class: 'f-pri' }, layer);
      }
    }
    const lv = `${Lv} levels, step δ = 2/${Lv} = ${fmt(d)}, error at most δ/2 = ${fmt(d / 2)}`;
    role('ad-note').textContent = [
      'Analog: x(t) has a value at every instant, and the value can be any amplitude.',
      `Sampling: keep only x(nT), one value every T (${NS + 1} samples here). Time becomes discrete. The amplitudes are still exact, so b does not matter yet.`,
      `Quantization with b = ${bits} bits: every value is rounded to the nearest of ${lv}. Amplitude becomes discrete.`,
      `A/D = sampling + quantization: ${NS + 1} samples, each rounded to the nearest of ${lv}. Each sample is stored as ${bits} bits.`,
    ][mode];
  }
  steps(viz('ad-steps'), ['Analog', 'Sampling (time)', 'Quantization (amplitude)', 'A/D (both)'], k => { mode = k; draw(); }, 3);
  slider(viz('ad-slider'), { label: 'b (bits)', min: 2, max: 4, step: 1, value: 3 }, v => { bits = v; draw(); });

  // Figure 2: aliasing at fs = 32 kHz
  const FS = 32;
  const al = svg(viz('alias'), 660, 236, { label: 'A tone sampled at 32 kHz with the wave that D/A reconstructs from the samples', minWidth: 520 });
  const a2 = axes(al, { x: 50, y: 20, w: 590, h: 170, xd: [0, 0.5], yd: [-1.25, 1.25], xt: [0, 0.1, 0.2, 0.3, 0.4, 0.5], xf: v => v.toFixed(1), yt: [-1, 0, 1], xl: 'time (ms)' });
  const lay2 = s('g', {}, al);
  const bd = svg(viz('band'), 660, 108, { label: 'Frequency bands: human hearing up to 20 kHz, recordable up to 16 kHz at 32 kHz sampling', minWidth: 520 });
  const fx = scale(0, 32, 50, 640);
  s('rect', { x: fx(0.02), y: 18, width: fx(20) - fx(0.02), height: 18, class: 'f-seg box' }, bd);
  s('text', { x: fx(10), y: 27, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, bd, 'human hearing, 20 Hz to 20 kHz');
  s('rect', { x: fx(0), y: 42, width: fx(16) - fx(0), height: 18, class: 'f-ok-soft' }, bd);
  s('text', { x: fx(8), y: 51, dy: '0.35em', 'text-anchor': 'middle', class: 't-ok t-bold' }, bd, 'recordable at fs = 32 kHz');
  s('rect', { x: fx(16), y: 42, width: fx(20) - fx(16), height: 18, class: 'f-bad-soft' }, bd);
  s('text', { x: fx(18), y: 51, dy: '0.35em', 'text-anchor': 'middle', class: 't-bad t-bold' }, bd, 'lost');
  s('line', { x1: fx(0), x2: fx(32), y1: 68, y2: 68, class: 'l-axis' }, bd);
  [0, 4, 8, 12, 16, 20, 24, 28, 32].forEach(f => {
    s('line', { x1: fx(f), x2: fx(f), y1: 68, y2: 73, class: 'l-axis' }, bd);
    s('text', { x: fx(f), y: 86, 'text-anchor': 'middle' }, bd, f);
  });
  s('text', { x: fx(16), y: 102, 'text-anchor': 'middle' }, bd, 'frequency (kHz)');
  const tri = s('polygon', { class: 'f-fg' }, bd);
  slider(viz('alias-slider'), { label: 'tone', min: 1, max: 31, step: 0.5, value: 18, fmt: v => v + ' kHz' }, f => {
    const fa = Math.abs(f - FS * Math.round(f / FS));
    const ok = f <= FS / 2;
    lay2.textContent = '';
    plot(lay2, a2, t => Math.cos(2 * Math.PI * f * t), 0, 0.5, 1000, 's-muted').setAttribute('style', 'stroke-width: 1.2');
    plot(lay2, a2, t => Math.cos(2 * Math.PI * fa * t), 0, 0.5, 600, ok ? 's-ok' : 's-bad');
    for (let n = 0; n <= 16; n++) s('circle', { cx: a2.x(n / FS), cy: a2.y(Math.cos(2 * Math.PI * f * n / FS)), r: 4, class: 'f-fg' }, lay2);
    role('tone').textContent = f + ' kHz';
    const heard = role('heard');
    heard.textContent = fa + ' kHz';
    heard.className = 'v ' + (ok ? 'ok' : '');
    let t;
    if (f < FS / 2) t = `${f} kHz is below f<sub>s</sub>/2 = 16 kHz. The samples pin the tone down, and D/A plays back the same ${f} kHz tone.`;
    else if (f === FS / 2) t = '16 kHz sits exactly at f<sub>s</sub>/2. Nyquist asks for f<sub>s</sub> &gt; 2f<sub>max</sub>, strictly greater, so this is the limit case.';
    else t = `${f} kHz is above f<sub>s</sub>/2 = 16 kHz. The same samples fit a <b>${fa} kHz</b> tone, and D/A plays that false tone (aliasing).` + (f <= 20 ? ' A listener could hear the original, so 32 kHz cannot cover the full range of hearing.' : '');
    role('alias-verdict').innerHTML = t;
    const x = fx(Math.min(f, 32));
    tri.setAttribute('points', `${x - 6},4 ${x + 6},4 ${x},14`);
  });

  // Figure 3: the bits of one stereo sampling period
  const fr = svg(viz('frame'), 650, 136, { label: 'One stereo sampling period: a 16-bit left word followed by a 16-bit right word', minWidth: 520 });
  const bw = 17, x0 = 53;
  s('text', { x: x0 + 8 * bw, y: 30, 'text-anchor': 'middle', class: 't-pri t-bold' }, fr, 'left channel, 16 bits');
  s('text', { x: x0 + 24 * bw, y: 30, 'text-anchor': 'middle', class: 't-sec t-bold' }, fr, 'right channel, 16 bits');
  for (let i = 0; i < 32; i++) s('rect', { x: x0 + i * bw, y: 40, width: bw, height: 30, class: (i < 16 ? 'f-pri' : 'f-sec') + ' sep' }, fr);
  s('line', { x1: x0, x2: x0 + 32 * bw, y1: 82, y2: 82, class: 'l-axis' }, fr);
  [x0, x0 + 32 * bw].forEach(x => s('line', { x1: x, x2: x, y1: 77, y2: 87, class: 'l-axis' }, fr));
  s('text', { x: x0 + 16 * bw, y: 102, 'text-anchor': 'middle', class: 't-fg' }, fr, 'one sampling period T = 1/32,000 s = 31.25 µs: 32 bits');
  s('text', { x: x0 + 16 * bw, y: 124, 'text-anchor': 'middle', class: 't-ok t-bold' }, fr, '× 32,000 periods per second = 1,024,000 bit/s');
});

QV.register('s1-w7', function (q) {
  const { s, svg, axes, line, steps, slider, gray, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const quant = (v, L) => (L >= 256 ? v : Math.round(Math.floor(v * L / 256) * 255 / (L - 1)));

  // Figure 1: the same test image at lower sampling and at fewer levels
  const NR = 40, CELL = 5;
  const BASE = [];
  for (let r = 0; r < NR; r++) {
    BASE.push([]);
    for (let c = 0; c < NR; c++) {
      const x = (c + 0.5) / NR, y = (r + 0.5) / NR;
      let v = 0.12 + 0.6 * x;
      const dx = (x - 0.5) / 0.3, dy = (y - 0.42) / 0.3, d2 = dx * dx + dy * dy;
      if (d2 < 1) v = 0.08 + 0.9 * Math.min(1, Math.max(0, -0.5 * dx - 0.6 * dy + 0.62 * Math.sqrt(1 - d2)));
      if (y > 0.82 && y < 0.95 && x > 0.1 && x < 0.9) v = c % 2 ? 0.92 : 0.08;
      BASE[r].push(Math.round(v * 255));
    }
  }
  const rs = svg(viz('res'), 520, 258, { label: 'The test image at reduced spatial resolution and at reduced intensity resolution', minWidth: 420 });
  const panel = x0 => BASE.map((row, r) => row.map((_, c) => s('rect', { x: x0 + c * CELL, y: 46 + r * CELL, width: CELL + 0.4, height: CELL + 0.4 }, rs)));
  const PA = panel(20), PB = panel(300);
  const tA = s('text', { x: 20, y: 30, class: 't-fg t-bold' }, rs);
  const tB = s('text', { x: 300, y: 30, class: 't-fg t-bold' }, rs);
  const paint = (P, val) => P.forEach((row, r) => row.forEach((el, c) => el.setAttribute('style', gray(val(r, c)).style)));
  const BLK = [1, 2, 4, 8];
  steps(viz('sp-steps'), BLK.map(b => `${NR / b} × ${NR / b}`), k => {
    const b = BLK[k];
    const avg = (r, c) => {
      const r0 = r - r % b, c0 = c - c % b;
      let sum = 0;
      for (let i = 0; i < b; i++) for (let j = 0; j < b; j++) sum += BASE[r0 + i][c0 + j];
      return sum / (b * b);
    };
    paint(PA, avg);
    tA.textContent = `${NR / b} × ${NR / b} samples, 256 levels`;
  }, 2);
  const LEV = [[256, 8], [16, 4], [8, 3], [4, 2], [2, 1]];
  steps(viz('in-steps'), LEV.map(([L, k]) => `${L} (k = ${k})`), k => {
    const [L, kb] = LEV[k];
    paint(PB, (r, c) => quant(BASE[r][c], L));
    tB.textContent = `${L} levels, k = ${kb}`;
  }, 1);

  // Figure 2: bit planes and one pixel word
  const pl = svg(viz('planes'), 660, 254, { label: 'An 8-bit image as 8 bit planes of 1024 by 768 bits, a 4-bit image as 4 planes', minWidth: 520 });
  const stack = (x, y, k, lines) => {
    for (let i = k - 1; i >= 0; i--) s('rect', { x: x + i * 7, y: y - i * 7, width: 128, height: 96, class: 'f-pri-soft outline-pri', style: 'stroke-width: 1' }, pl);
    s('text', { x: x + 64, y: y + 40, 'text-anchor': 'middle', class: 't-pri t-bold' }, pl, '1024 × 768');
    s('text', { x: x + 64, y: y + 58, 'text-anchor': 'middle', class: 't-pri t-sm' }, pl, 'one bit per pixel');
    lines.forEach((t, i) => s('text', { x, y: y + 116 + i * 16, class: 't-fg' + (i ? '' : ' t-bold') }, pl, t));
  };
  stack(30, 96, 8, ['k = 8 planes', '6,291,456 bits', '= 786,432 bytes']);
  stack(260, 96, 4, ['k = 4 planes', '3,145,728 bits', '= 393,216 bytes']);
  const word = (x, y, bitsStr) => bitsStr.split('').forEach((b, i) => {
    const on = b === '1';
    s('rect', { x: x + i * 22, y, width: 22, height: 22, class: (on ? 'f-pri' : 'f-seg') + ' sep' }, pl);
    s('text', { x: x + i * 22 + 11, y: y + 11, dy: '0.35em', 'text-anchor': 'middle', class: on ? 't-on' : 't-muted' }, pl, b);
  });
  s('text', { x: 450, y: 40, class: 't-fg t-bold' }, pl, 'one pixel = k bits');
  word(450, 50, '11001000');
  s('rect', { x: 449, y: 49, width: 90, height: 24, class: 'f-none outline-sec' }, pl);
  s('text', { x: 450, y: 92 }, pl, '200 in 8 bits');
  arrow(pl, 494, 100, 494, 126);
  s('text', { x: 504, y: 117, class: 't-sec' }, pl, 'keep the top 4 bits');
  word(450, 132, '1100');
  s('text', { x: 450, y: 174, class: 't-fg' }, pl, '= 12, one of 16 levels');

  // Figure 3: a ramp re-quantized to 2^k levels
  const rp = svg(viz('ramp'), 660, 284, { label: 'A smooth ramp quantized to 2 to the k levels, as an image strip and as a profile', minWidth: 520 });
  const strip = Array.from({ length: 128 }, (_, j) => s('rect', { x: 60 + j * 560 / 128, y: 14, width: 560 / 128 + 0.4, height: 36 }, rp));
  const a3 = axes(rp, { x: 60, y: 80, w: 560, h: 160, xd: [0, 1024], yd: [0, 255], xt: [0, 256, 512, 768, 1024], yt: [0, 64, 128, 192, 255], xl: 'pixel position along the row', yl: 'gray value' });
  line(rp, [[a3.x(0), a3.y(0)], [a3.x(1024), a3.y(255)]], 's-muted dash');
  const stair = s('path', { class: 's-pri' }, rp);
  slider(viz('ramp-slider'), { label: 'k (bits per pixel)', min: 1, max: 8, step: 1, value: 4 }, k => {
    const L = 2 ** k;
    strip.forEach((el, j) => el.setAttribute('style', gray(quant(2 * j + 1, L)).style));
    const pts = [];
    for (let p = 0; p < 1024; p += 4) {
      const v = quant(p / 4, L);
      pts.push([a3.x(p), a3.y(v)], [a3.x(p + 4), a3.y(v)]);
    }
    stair.setAttribute('d', pts.map((pt, i) => (i ? 'L' : 'M') + pt[0].toFixed(1) + ' ' + pt[1].toFixed(1)).join(' '));
    role('levels').textContent = L;
    role('band').textContent = 1024 / L + ' px';
    role('bytes').textContent = (1024 * 768 * k / 8).toLocaleString('en-US');
  });
});

QV.register('s1-w8', function (q) {
  const { s, svg, grid, gray, steps, axes, line, arrow, mat } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const MX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  const MY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
  const IMG = [
    [10, 10, 10, 40, 40],
    [10, 10, 40, 40, 40],
    [10, 10, 40, 40, 90],
    [10, 40, 40, 90, 90],
    [40, 40, 90, 90, 90],
  ];
  const IDX = ['0', '1', '2', '3', '4'];
  const num = v => (v < 0 ? '−' + -v : String(v));
  const sign = v => (v > 0 ? { cls: 'f-pri', text: 't-on' } : v < 0 ? { cls: 'f-sec', text: 't-on' } : { cls: 'f-seg', text: 't-muted' });
  const soft = v => (v > 0 ? ['f-pri-soft', 't-pri'] : v < 0 ? ['f-sec-soft', 't-sec'] : ['f-seg', 't-muted']);
  const gfill = v => gray(v);

  mat(viz('masks'), MX, { caption: 'Mx', text: num });
  mat(viz('masks'), MY, { caption: 'My', text: num });
  const g0 = svg(viz('given'), 260, 248, { label: 'The 5 by 5 image with row and column indices', minWidth: 220 });
  grid(g0, { x: 40, y: 50, data: IMG, cell: 36, gap: 2, fill: gfill, rowLabels: IDX, colLabels: IDX, title: 'Image (5 x 5)' });

  // Figure 1: window × mask
  const W = [1, 2, 3].map(r => [1, 2, 3].map(c => IMG[r][c]));
  const ap = svg(viz('apply'), 620, 200, { label: 'The window at (2, 2) multiplied position by position with the Sobel mask', minWidth: 500 });
  grid(ap, { x: 20, y: 50, data: W, cell: 44, gap: 2, fill: gfill, title: 'window at (2, 2)' });
  s('text', { x: 178, y: 118, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, ap, '×');
  const gm = grid(ap, { x: 200, y: 50, data: MX, cell: 44, gap: 2, fill: sign, text: num });
  const mTitle = s('text', { x: 200, y: 42, class: 't-fg t-bold' }, ap);
  s('text', { x: 358, y: 118, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, ap, '=');
  const gp = grid(ap, { x: 380, y: 50, data: MX, cell: 44, gap: 2, title: 'products' });
  s('text', { x: 540, y: 104, class: 't-muted' }, ap, 'sum');
  const sumT = s('text', { x: 540, y: 128, class: 't-pri t-bold t-lg' }, ap);
  const NOTES = [
    'Gx: right column minus left column, with the middle row counted twice: (−10 + 40) + 2(−10 + 40) + (−40 + 90) = 30 + 60 + 50 = 140.',
    'Gy: bottom row minus top row, with the middle column counted twice: (40 + 2·40 + 90) − (10 + 2·40 + 40) = 210 − 130 = 80.',
  ];
  steps(viz('apply-steps'), ['Gx (Mx)', 'Gy (My)'], k => {
    const M = k ? MY : MX;
    let total = 0;
    M.forEach((row, r) => row.forEach((m, c) => {
      const sg = sign(m), p = m * W[r][c], [pc, pt] = soft(p);
      total += p;
      gm.rects[r][c].setAttribute('class', sg.cls + ' sep');
      gm.texts[r][c].setAttribute('class', sg.text);
      gm.texts[r][c].textContent = num(m);
      gp.rects[r][c].setAttribute('class', pc + ' sep');
      gp.texts[r][c].setAttribute('class', pt + ' t-bold');
      gp.texts[r][c].textContent = num(p);
    }));
    mTitle.textContent = k ? 'My' : 'Mx';
    sumT.textContent = (k ? 'Gy = ' : 'Gx = ') + total;
    role('apply-note').textContent = NOTES[k];
  });

  // Figure 2: the gradient vector on the image and the two magnitude forms
  const GX = 140, GY = 80, MAG = Math.hypot(GX, GY), ux = GX / MAG, uy = GY / MAG;
  const TH = Math.atan2(GY, GX) * 180 / Math.PI;
  const vc = svg(viz('vector'), 640, 270, { label: 'Gradient at (2, 2) pointing down and right, and the right triangle of Gx, Gy and the magnitude', minWidth: 520 });
  const gi = grid(vc, { x: 40, y: 50, data: IMG, cell: 40, gap: 2, fill: gfill, rowLabels: IDX, colLabels: IDX, title: 'gradient at (2, 2)' });
  const ox = gi.cx(2) + 20, oy = gi.cy(2) + 20;
  const halo = (x1, y1, x2, y2, w) => s('line', { x1, y1, x2, y2, class: 'sep', style: 'stroke-width: ' + w }, vc);
  halo(ox + uy * 62, oy - ux * 62, ox - uy * 62, oy + ux * 62, 6);
  s('line', { x1: ox + uy * 62, y1: oy - ux * 62, x2: ox - uy * 62, y2: oy + ux * 62, class: 's-ter dash' }, vc);
  s('text', { x: ox + uy * 62 + 4, y: oy - ux * 62 - 4, class: 't-ter t-bold halo' }, vc, 'edge');
  halo(ox, oy, ox + ux * 92, oy + uy * 92, 8);
  arrow(vc, ox, oy, ox + ux * 92, oy + uy * 92, { cls: 'a-pri', width: 3, head: 11 });
  s('circle', { cx: ox, cy: oy, r: 4, class: 'f-pri' }, vc);
  s('text', { x: 254, y: oy + uy * 92, dy: '0.35em', class: 't-pri t-bold' }, vc, 'gradient');

  const T = { x: 330, y: 84, k: 1.2 };
  const P1 = [T.x + GX * T.k, T.y], P2 = [T.x + GX * T.k, T.y + GY * T.k];
  s('path', { d: `M${T.x} ${T.y} L${P1[0]} ${P1[1]} L${P2[0]} ${P2[1]}`, class: 's-sec' }, vc);
  arrow(vc, T.x, T.y, P2[0], P2[1], { cls: 'a-pri', width: 3, head: 11 });
  s('path', { d: `M${T.x + 40} ${T.y} A40 40 0 0 1 ${T.x + 40 * ux} ${T.y + 40 * uy}`, class: 's-fg', style: 'stroke-width: 1' }, vc);
  s('text', { x: (T.x + P1[0]) / 2, y: T.y - 10, 'text-anchor': 'middle', class: 't-sec t-bold' }, vc, 'Gx = ' + GX);
  s('text', { x: P1[0] + 8, y: (P1[1] + P2[1]) / 2, dy: '0.35em', class: 't-sec t-bold' }, vc, 'Gy = ' + GY);
  s('text', { x: T.x + 52, y: T.y + 17, class: 't-fg' }, vc, 'θ = ' + TH.toFixed(2) + '°');
  s('text', { x: T.x + 90, y: T.y + 72, 'text-anchor': 'end', class: 't-pri t-bold' }, vc, '|G| = ' + MAG.toFixed(2));
  [
    [`√(Gx² + Gy²) = √(140² + 80²) = ${MAG.toFixed(2)}`, 't-pri'],
    [`|Gx| + |Gy| = 140 + 80 = ${GX + GY}`, 't-sec'],
    [`θ = tan⁻¹(80 / 140) = ${TH.toFixed(2)}°`, 't-fg'],
  ].forEach(([t, cls], i) => s('text', { x: T.x, y: 214 + i * 20, class: cls }, vc, t));

  // Figure 3: Mx as an outer product, and its effect on noise
  const ou = svg(viz('outer'), 430, 180, { label: 'The column 1, 2, 1 times the row minus 1, 0, 1 equals the Sobel mask Mx', minWidth: 360 });
  grid(ou, { x: 30, y: 40, data: [[1], [2], [1]], cell: 40, gap: 2, fill: () => ({ cls: 'f-ter-soft', text: 't-ter' }) });
  s('text', { x: 50, y: 28, 'text-anchor': 'middle', class: 't-ter t-bold' }, ou, 'smooth');
  s('text', { x: 95, y: 102, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, ou, '×');
  grid(ou, { x: 120, y: 82, data: [[-1, 0, 1]], cell: 40, gap: 2, fill: sign, text: num });
  s('text', { x: 182, y: 70, 'text-anchor': 'middle', class: 't-fg t-bold' }, ou, 'difference');
  s('text', { x: 268, y: 102, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, ou, '=');
  grid(ou, { x: 290, y: 40, data: MX, cell: 40, gap: 2, fill: sign, text: num });
  s('text', { x: 352, y: 28, 'text-anchor': 'middle', class: 't-fg t-bold' }, ou, 'Mx');

  const rng = seed => () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rg = rng(5);
  const gn = () => Math.sqrt(-2 * Math.log(1 - rg())) * Math.cos(2 * Math.PI * rg());
  const NC = 16, EDGE = 8;
  const PATCH = [0, 1, 2].map(() => Array.from({ length: NC }, (_, c) => (c < EDGE ? 40 : 90) + 10 * gn()));
  const diff = (r, c) => PATCH[r][c + 1] - PATCH[r][c - 1];
  const COLS = Array.from({ length: NC - 2 }, (_, i) => i + 1);
  const ONE = COLS.map(c => diff(1, c));
  const SOB = COLS.map(c => (diff(0, c) + 2 * diff(1, c) + diff(2, c)) / 4);
  const flat = c => c !== EDGE - 1 && c !== EDGE;
  const rms = y => Math.sqrt(y.filter((_, i) => flat(COLS[i])).reduce((a, v) => a + v * v, 0) / COLS.filter(flat).length);
  role('rms-row').textContent = rms(ONE).toFixed(1);
  role('rms-sobel').textContent = rms(SOB).toFixed(1);
  const nz = svg(viz('noise'), 660, 252, { label: 'Edge response across a noisy vertical edge: one-row difference against the Sobel response', minWidth: 520 });
  const a3 = axes(nz, { x: 56, y: 24, w: 580, h: 180, xd: [1, 14], yd: [-50, 90], xt: [1, 4, 7, 10, 14], yt: [-40, 0, 40, 80], xl: 'column', yl: 'response' });
  line(nz, COLS.map(c => [a3.x(c), a3.y(flat(c) ? 0 : 50)]), 's-muted dash').setAttribute('style', 'stroke-width: 1');
  [[ONE, 's-sec', 'f-sec'], [SOB, 's-pri', 'f-pri']].forEach(([y, lc, fc]) => {
    line(nz, COLS.map((c, i) => [a3.x(c), a3.y(y[i])]), lc);
    COLS.forEach((c, i) => s('circle', { cx: a3.x(c), cy: a3.y(y[i]), r: 3.5, class: fc }, nz));
  });
});

QV.register('s3-mc1', function (q) {
  const { s, svg, axes, plot, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const sup = n => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
  const R = 4;

  // Figure 1: one signal rounded to 2^b levels
  const g = svg(viz('stairs'), 700, 290, { label: 'A signal between 0 and 4 V rounded to 2 to the b levels', minWidth: 540 });
  const P = { x: 52, y: 22, w: 480, h: 220 };
  const ax = axes(g, { x: P.x, y: P.y, w: P.w, h: P.h, xd: [0, 1], yd: [0, R], xt: [], yt: [0, 1, 2, 3, 4], yf: v => v + ' V', xl: 'time', yl: 'amplitude', grid: false });
  const levelLayer = s('g', {}, g);
  const sig = t => 2 + 1.25 * Math.sin(2 * Math.PI * 1.2 * t) + 0.55 * Math.sin(2 * Math.PI * 3.3 * t + 0.8);
  plot(g, ax, sig, 0, 1, 300, 's-sec').setAttribute('style', 'stroke-width: 1.5');
  const stairLayer = s('g', {}, g);
  const N = 32;

  function draw(b) {
    const L = 2 ** b, d = R / L;
    levelLayer.textContent = '';
    stairLayer.textContent = '';
    for (let k = 0; k < L; k++) s('line', { x1: P.x, x2: P.x + P.w, y1: ax.y(k * d), y2: ax.y(k * d), class: 'l-grid' }, levelLayer);
    const pts = [];
    for (let i = 0; i < N; i++) {
      const v = sig((i + 0.5) / N);
      const qv = Math.min(L - 1, Math.max(0, Math.round(v / d))) * d;
      pts.push([ax.x(i / N), ax.y(qv)], [ax.x((i + 1) / N), ax.y(qv)]);
      s('circle', { cx: ax.x((i + 0.5) / N), cy: ax.y(qv), r: 2.2, class: 'f-pri' }, stairLayer);
    }
    QV.line(stairLayer, pts, 's-pri').setAttribute('style', 'stroke-width: 2');
    const rx = P.x + P.w + 10;
    s('text', { x: rx, y: ax.y((L - 1) * d), dy: '0.35em', class: 't-fg' }, stairLayer, '1'.repeat(b) + ' = ' + fmt((L - 1) * d, 4) + ' V');
    s('text', { x: rx, y: ax.y(0), dy: '0.35em', class: 't-fg' }, stairLayer, '0'.repeat(b) + ' = 0 V');
    const k0 = L / 2 - 1, ya = ax.y(k0 * d), yb = ax.y((k0 + 1) * d);
    s('path', { d: `M${rx - 4} ${ya} H${rx} V${yb} H${rx - 4}`, class: 's-pri', style: 'stroke-width: 1.5' }, stairLayer);
    s('text', { x: rx + 6, y: (ya + yb) / 2, dy: '0.35em', class: 't-pri t-bold' }, stairLayer, 'δ = ' + fmt(d, 4) + ' V');
    role('levels').textContent = String(L);
    role('levels-sub').textContent = '2' + sup(b);
    role('step').textContent = fmt(d, 4) + ' V';
    role('step-sub').textContent = 'δ = 4 / ' + L;
    role('err').textContent = fmt(d / 2, 5) + ' V';
  }
  slider(viz('bits'), { label: 'b', min: 1, max: 6, step: 1, value: 5, fmt: v => v + (v === 1 ? ' bit' : ' bits') }, draw);

  // Figure 2: the four options as rulers over the same 4 V
  const rg = svg(viz('rulers'), 700, 250, { label: 'The 4 V range split into 5, 10, 32 and 25 levels', minWidth: 540 });
  const rax = axes(rg, { x: 150, y: 14, w: 400, h: 196, xd: [0, 4], yd: [0, 1], xt: [0, 1, 2, 3, 4], xf: v => v + ' V', grid: false });
  [['a', 5, 'count = b'], ['b', 10, 'count = 2 × b'], ['c', 32, 'count = 2ᵇ = 2⁵'], ['d', 25, 'count = b²']].forEach(([key, n, rule], i) => {
    const y = 24 + i * 46, ok = key === 'c';
    for (let k = 0; k < n; k++) s('rect', { x: rax.x(k * 4 / n), y, width: 400 / n, height: 28, class: ok ? 'f-pri sep' : 'f-seg box' }, rg);
    s('text', { x: 0, y: y + 8, dy: '0.35em', class: (ok ? 't-ok' : 't-fg') + ' t-bold' }, rg, key + ' · ' + n + ' levels');
    s('text', { x: 0, y: y + 23, dy: '0.35em', class: ok ? 't-ok' : 't-muted' }, rg, rule);
    s('text', { x: 562, y: y + 14, dy: '0.35em', class: ok ? 't-ok t-bold' : 't-fg' }, rg, 'δ = 4/' + n + ' = ' + fmt(4 / n, 3) + ' V');
  });
});

QV.register('s3-mc2', function (q) {
  const { s, svg, axes, line, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const SQ = n => 6.02 * n;

  // Figure 1: SQNR line and the 8 to 12 bit staircase
  const g = svg(viz('line'), 700, 300, { label: 'Maximum SQNR = 6.02N dB; 8 bits give 48.16 dB, 12 bits give 72.24 dB, a gain of 24.08 dB', minWidth: 540 });
  const ax = axes(g, { x: 56, y: 24, w: 600, h: 226, xd: [0, 16], yd: [0, 100], xt: [0, 2, 4, 6, 8, 10, 12, 14, 16], yt: [0, 20, 40, 60, 80, 100], xl: 'N, bits per sample', yl: 'maximum SQNR (dB)' });
  line(g, [[ax.x(0), ax.y(0)], [ax.x(16), ax.y(SQ(16))]], 's-muted');
  for (let n = 1; n <= 16; n++) if (n !== 8 && n !== 12) s('circle', { cx: ax.x(n), cy: ax.y(SQ(n)), r: 2.5, class: 'f-muted' }, g);
  const st = [];
  for (let n = 8; n < 12; n++) st.push([ax.x(n), ax.y(SQ(n))], [ax.x(n + 1), ax.y(SQ(n))]);
  st.push([ax.x(12), ax.y(SQ(12))]);
  line(g, st, 's-pri');
  for (let n = 9; n <= 12; n++) s('text', { x: ax.x(n) + 6, y: ax.y(SQ(n - 0.5)), dy: '0.35em', class: 't-pri t-sm' }, g, '+6.02');
  const xb = ax.x(7.4);
  s('path', { d: `M${xb + 5} ${ax.y(SQ(8))} H${xb} V${ax.y(SQ(12))} H${xb + 5}`, class: 's-pri', style: 'stroke-width: 1.5' }, g);
  line(g, [[xb + 5, ax.y(SQ(8))], [ax.x(8), ax.y(SQ(8))]], 's-pri dash').setAttribute('style', 'stroke-width: 1');
  line(g, [[xb + 5, ax.y(SQ(12))], [ax.x(12), ax.y(SQ(12))]], 's-pri dash').setAttribute('style', 'stroke-width: 1');
  s('text', { x: xb - 8, y: ax.y(60.2) - 4, 'text-anchor': 'end', class: 't-pri t-bold' }, g, '+24.08 dB');
  s('text', { x: xb - 8, y: ax.y(60.2) + 11, 'text-anchor': 'end', class: 't-pri' }, g, '= 4 × 6.02');
  [[8, 'f-pri'], [12, 'f-pri'], [16, 'f-muted']].forEach(([n, c]) => s('circle', { cx: ax.x(n), cy: ax.y(SQ(n)), r: n === 16 ? 3.5 : 5, class: c }, g));
  s('text', { x: ax.x(8) + 8, y: ax.y(SQ(8)) + 18, class: 't-fg t-bold' }, g, '8 bits · 48.16 dB');
  s('text', { x: ax.x(12) - 10, y: ax.y(SQ(12)) - 10, 'text-anchor': 'end', class: 't-fg t-bold' }, g, '12 bits · 72.24 dB');
  s('text', { x: ax.x(16) - 10, y: ax.y(SQ(16)) - 8, 'text-anchor': 'end', class: 't-muted' }, g, '16 bits · 96.32 dB');

  // Figure 2: the step halves with every bit
  const h = svg(viz('halving'), 700, 210, { label: 'Quantization step for 8 to 12 bits: delta, delta/2, delta/4, delta/8, delta/16', minWidth: 540 });
  const base = 156, cols = [80, 215, 350, 485, 620];
  cols.forEach((cx, i) => {
    const bh = 128 / 2 ** i;
    s('rect', { x: cx - 22, y: base - bh, width: 44, height: bh, class: 'f-pri' }, h);
    s('text', { x: cx, y: base - bh - 8, 'text-anchor': 'middle', class: 't-fg' }, h, i ? 'δ/' + 2 ** i : 'δ');
    s('text', { x: cx, y: base + 20, 'text-anchor': 'middle', class: 't-fg t-bold' }, h, (8 + i) + ' bits');
    s('text', { x: cx, y: base + 36, 'text-anchor': 'middle', class: 't-pri' }, h, QV.fmt(SQ(8 + i), 2) + ' dB');
    if (i) arrow(h, cols[i - 1] + 30, 126, cx - 30, 126, { cls: 'a-pri', label: '+6.02 dB', labelCls: 't-pri t-bold' });
    if (i) s('text', { x: (cols[i - 1] + cx) / 2, y: 142, 'text-anchor': 'middle', class: 't-muted t-sm' }, h, 'step × ½');
  });
  s('line', { x1: 40, x2: 660, y1: base, y2: base, class: 'l-axis' }, h);
});

QV.register('s3-mc3', function (q) {
  const { s, svg, steps, table } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const IN = ['B', 'A', 'B', 'A', 'A'];
  const ROWS = [
    { s: [0, 0], c: 1, S: 'B', C: 'A', out: 2, code: 3, str: 'BA', note: 's = B, c = A. BA is not in the dictionary: output code(B) = 2, add BA as code 3, and set s = A.' },
    { s: [1, 1], c: 2, S: 'A', C: 'B', out: 1, code: 4, str: 'AB', note: 's = A, c = B. AB is not in the dictionary: output code(A) = 1, add AB as code 4, and set s = B.' },
    { s: [2, 2], c: 3, S: 'B', C: 'A', out: null, note: 's = B, c = A. BA is in the dictionary now (code 3), so nothing is output and s grows to BA.' },
    { s: [2, 3], c: 4, S: 'BA', C: 'A', out: 3, code: 5, str: 'BAA', note: 's = BA, c = A. BAA is not in the dictionary: output code(BA) = 3, add BAA as code 5, and set s = A.' },
    { s: [4, 4], c: 5, S: 'A', C: 'EOF', out: 1, note: 'End of input with s = A: output code(A) = 1. Code 5 was added but is never used.' },
  ];
  const DICT = [[1, 'A'], [2, 'B'], [3, 'BA'], [4, 'AB'], [5, 'BAA']];
  const addedAt = { 3: 0, 4: 1, 5: 3 };

  const g = svg(viz('lzw'), 640, 192, { label: 'LZW encoding of BABAA: input tape, output codes and dictionary', minWidth: 520 });
  const T = { x0: 64, cw: 46, y: 40, h: 40 };
  const cx = i => T.x0 + i * T.cw;
  s('text', { x: 0, y: T.y + T.h / 2, dy: '0.35em', class: 't-fg t-bold' }, g, 'input');
  const cells = IN.map((ch, i) => {
    const r = s('rect', { x: cx(i), y: T.y, width: T.cw, height: T.h, class: 'f-surface box' }, g);
    s('text', { x: cx(i) + T.cw / 2, y: T.y + T.h / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg' }, g, ch);
    return r;
  });
  const eof = s('rect', { x: cx(5) + 4, y: T.y + 4, width: T.cw - 8, height: T.h - 8, rx: 4, class: 'f-none s-muted dash', style: 'stroke-width: 1' }, g);
  s('text', { x: cx(5) + T.cw / 2, y: T.y + T.h / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-muted t-sm' }, g, 'EOF');
  const sMark = s('text', { y: T.y - 10, 'text-anchor': 'middle', class: 't-pri t-bold' }, g, 's');
  const cMark = s('text', { y: T.y - 10, 'text-anchor': 'middle', class: 't-sec t-bold' }, g, 'c');

  s('text', { x: 0, y: 136, dy: '0.35em', class: 't-fg t-bold' }, g, 'output');
  const outs = ROWS.map(row => {
    if (row.out == null) return null;
    const a = cx(row.s[0]) + 5, b = cx(row.s[1] + 1) - 5, m = (a + b) / 2;
    const grp = s('g', {}, g);
    s('path', { d: `M${a} ${T.y + T.h + 6} V${T.y + T.h + 12} H${b} V${T.y + T.h + 6}`, class: 's-pri', style: 'stroke-width: 1.5' }, grp);
    QV.arrow(grp, m, T.y + T.h + 14, m, 120, { cls: 'a-pri', head: 6 });
    s('rect', { x: m - 17, y: 122, width: 34, height: 28, rx: 4, class: 'f-pri' }, grp);
    s('text', { x: m, y: 136, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold t-lg' }, grp, row.out);
    return grp;
  });

  const DX = 430;
  s('text', { x: DX, y: 28, class: 't-fg t-bold' }, g, 'dictionary');
  const dict = DICT.map(([code, str], j) => {
    const y = 40 + j * 29;
    const grp = s('g', { class: 'fade' }, g);
    const r = s('rect', { x: DX, y, width: 150, height: 25, rx: 4, class: 'f-seg' }, grp);
    const t1 = s('text', { x: DX + 14, y: y + 12.5, dy: '0.35em', class: 't-muted' }, grp, code);
    const t2 = s('text', { x: DX + 46, y: y + 12.5, dy: '0.35em', class: 't-fg' }, grp, str);
    return { grp, r, t1, t2, code };
  });

  const tbl = table(viz('lzw-table'), ['S', 'C', 'Output', 'Code', 'String'].map(t => ({ text: t, cls: 'l' })),
    ROWS.map(r => [r.S, r.C, r.out == null ? '' : r.out, r.code || '', r.str || ''].map(c => ({ text: String(c), cls: 'l' }))));
  const note = role('lzw-note');

  steps(viz('lzw-steps'), ['All', '1 · B+A', '2 · A+B', '3 · B+A', '4 · BA+A', '5 · A+EOF'], k => {
    const done = k === 0 ? ROWS.length : k;
    const cur = k === 0 ? null : ROWS[k - 1];
    cells.forEach((r, i) => {
      let cls = 'f-surface';
      if (cur && i >= cur.s[0] && i <= cur.s[1]) cls = 'f-pri-soft';
      else if (cur && i === cur.c) cls = 'f-sec-soft';
      r.setAttribute('class', cls + ' box');
    });
    eof.setAttribute('class', (cur && cur.c === 5 ? 'f-sec-soft' : 'f-none') + ' s-muted dash');
    sMark.style.display = cur ? '' : 'none';
    cMark.style.display = cur ? '' : 'none';
    if (cur) {
      sMark.setAttribute('x', (cx(cur.s[0]) + cx(cur.s[1] + 1)) / 2);
      cMark.setAttribute('x', cx(cur.c) + T.cw / 2);
    }
    outs.forEach((o, i) => { if (o) o.style.display = i < done ? '' : 'none'; });
    dict.forEach(d => {
      const at = addedAt[d.code];
      const known = at == null || at < done;
      const fresh = cur && cur.code === d.code;
      d.grp.classList.toggle('dim', !known);
      d.r.setAttribute('class', fresh ? 'f-ok' : 'f-seg');
      d.t1.setAttribute('class', fresh ? 't-on' : 't-muted');
      d.t2.setAttribute('class', fresh ? 't-on t-bold' : 't-fg');
    });
    tbl.rows.forEach((r, i) => r.classList.toggle('on', i === k - 1));
    note.textContent = cur ? `Step ${k}: ${cur.note}`
      : 'Five characters become four codes, 2 1 3 1. The third code is BA, the entry made in step 1. The dictionary ends with 3 = BA, 4 = AB, 5 = BAA.';
  });
});

QV.register('s3-mc4', function (q) {
  const { s, svg, box, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);

  // Figure 1: each stage followed by its own inverse
  const g = svg(viz('trip'), 800, 250, { label: 'Round trip through transformation, quantization and Huffman coding; only quantization changes values', minWidth: 560 });
  const COL = { inp: 190, out: 386, back: 582, verdict: 740 };
  const CW = 32, GAP = 4;
  [['goes in', COL.inp], ['stage output', COL.out], ['inverse gives back', COL.back]].forEach(([t, x]) => s('text', { x, y: 22, class: 't-muted' }, g, t));
  const chips = (x, y, vals, cls) => vals.forEach((v, i) => {
    const c = typeof cls === 'function' ? cls(i) : cls;
    s('rect', { x: x + i * (CW + GAP), y, width: CW, height: 28, rx: 4, class: c[0] }, g);
    s('text', { x: x + i * (CW + GAP) + CW / 2, y: y + 14, dy: '0.35em', 'text-anchor': 'middle', class: c[1] }, g, v);
  });
  [
    { name: '1 · Transformation', sub: 'difference coding', inp: [12, 15, 22, 27], out: [12, 3, 7, 5], back: [12, 15, 22, 27] },
    { name: '2 · Loss', sub: 'quantization, step 3', inp: [12, 3, 7, 5], out: [4, 1, 2, 2], back: [12, 3, 6, 6] },
    { name: '3 · Coding', sub: 'Huffman', inp: [4, 1, 2, 2], out: ['10', '11', '0', '0'], back: [4, 1, 2, 2] },
  ].forEach((row, r) => {
    const y = 40 + r * 72, cy = y + 28;
    const lossy = row.back.some((v, i) => v !== row.inp[i]);
    box(g, 10, y, 156, 56, row.name + '\n' + row.sub, { cls: lossy ? 'f-bad-soft' : 'f-surface', textCls: 't-fg' });
    chips(COL.inp, cy - 14, row.inp, ['f-seg', 't-fg']);
    arrow(g, COL.inp + 4 * (CW + GAP) + 2, cy, COL.out - 8, cy, { cls: 'a-muted' });
    chips(COL.out, cy - 14, row.out, ['f-pri-soft', 't-fg']);
    arrow(g, COL.out + 4 * (CW + GAP) + 2, cy, COL.back - 8, cy, { cls: 'a-muted' });
    chips(COL.back, cy - 14, row.back, i => row.back[i] === row.inp[i] ? ['f-ok-soft', 't-ok'] : ['f-bad-soft', 't-bad t-bold']);
    s('text', { x: COL.verdict, y: cy, dy: '0.35em', class: (lossy ? 't-bad' : 't-ok') + ' t-bold' }, g, lossy ? 'changed' : 'exact');
    if (lossy) s('text', { x: COL.back + 70, y: cy + 26, 'text-anchor': 'middle', class: 't-bad t-sm' }, g, '7 and 5 both come back as 6');
  });

  // Figure 2: many-to-one against one-to-one
  const m = svg(viz('maps'), 760, 210, { label: 'Quantizer with step 3 maps 14 inputs to 5 levels; a Huffman code maps each symbol to its own codeword', minWidth: 560 });
  const X0 = 20, SP = 27, YT = 40, YB = 150, W = 23;
  const xq = v => X0 + v * SP;
  s('text', { x: X0, y: 26, class: 't-fg t-bold' }, m, 'quantizer input x');
  s('text', { x: X0, y: 194, class: 't-fg t-bold' }, m, 'level 3 · round(x / 3)');
  const lev = v => 3 * Math.round(v / 3);
  const hot = v => lev(v) === 6;
  for (let v = 0; v <= 13; v++) {
    s('line', { x1: xq(v) + W / 2, y1: YT + 24, x2: xq(lev(v)) + W / 2, y2: YB, class: hot(v) ? 's-pri' : 's-muted', style: 'stroke-width: ' + (hot(v) ? 2 : 1) }, m);
  }
  for (let v = 0; v <= 13; v++) {
    s('rect', { x: xq(v), y: YT, width: W, height: 24, rx: 4, class: hot(v) ? 'f-pri-soft' : 'f-seg' }, m);
    s('text', { x: xq(v) + W / 2, y: YT + 12, dy: '0.35em', 'text-anchor': 'middle', class: hot(v) ? 't-pri t-bold' : 't-fg' }, m, v);
  }
  [0, 3, 6, 9, 12].forEach(v => {
    s('rect', { x: xq(v), y: YB, width: W, height: 24, rx: 4, class: v === 6 ? 'f-pri' : 'f-surface box' }, m);
    s('text', { x: xq(v) + W / 2, y: YB + 12, dy: '0.35em', 'text-anchor': 'middle', class: v === 6 ? 't-on t-bold' : 't-fg' }, m, v);
  });
  const HX = 520;
  s('line', { x1: HX - 30, x2: HX - 30, y1: 20, y2: 196, class: 's-line' }, m);
  s('text', { x: HX, y: 26, class: 't-fg t-bold' }, m, 'Huffman symbol');
  s('text', { x: HX, y: 194, class: 't-fg t-bold' }, m, 'codeword');
  [[2, '0'], [4, '10'], [1, '11']].forEach(([sym, cw], i) => {
    const x = HX + 10 + i * 76;
    s('rect', { x, y: YT, width: 40, height: 24, rx: 4, class: 'f-seg' }, m);
    s('text', { x: x + 20, y: YT + 12, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, m, sym);
    s('rect', { x, y: YB, width: 40, height: 24, rx: 4, class: 'f-ok-soft' }, m);
    s('text', { x: x + 20, y: YB + 12, dy: '0.35em', 'text-anchor': 'middle', class: 't-ok t-bold' }, m, cw);
    arrow(m, x + 20, YT + 28, x + 20, YB - 4, { cls: 'a-ok', head: 7 });
    arrow(m, x + 20, YB - 4, x + 20, YT + 28, { cls: 'a-ok', head: 7 });
  });
});

QV.register('s3-mc5', function (q) {
  const { s, svg, axes, slider, gray, scale, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const I = 200, JND = 4;

  // Figure 1: background I with a flashed circle at I + dI, real gray levels
  const g = svg(viz('flash'), 520, 250, { label: 'Background of intensity 200 with a circle at 200 plus delta I', minWidth: 440 });
  s('rect', { x: 20, y: 20, width: 280, height: 210, rx: 4, style: gray(I).style }, g);
  const disk = s('circle', { cx: 160, cy: 125, r: 64 }, g);
  const ys = scale(196, 212, 230, 30), AX = 380;
  s('text', { x: AX, y: 14, 'text-anchor': 'middle', class: 't-fg t-bold' }, g, 'intensity');
  s('line', { x1: AX, x2: AX, y1: ys(196), y2: ys(212), class: 'l-axis' }, g);
  [[196, '196', 't-muted'], [200, '200 = I', 't-fg t-bold'], [204, '204 = I + ΔIc', 't-ok t-bold'], [208, '208', 't-muted'], [212, '212', 't-muted']].forEach(([v, t, c]) => {
    s('line', { x1: AX, x2: AX + 6, y1: ys(v), y2: ys(v), class: 'l-axis' }, g);
    s('text', { x: AX + 12, y: ys(v), dy: '0.35em', class: c }, g, t);
  });
  s('line', { x1: AX - 10, x2: AX + 6, y1: ys(JND + I), y2: ys(JND + I), class: 's-ok dash', style: 'stroke-width: 1.5' }, g);
  const mark = s('g', {}, g);
  s('polygon', { points: `${AX - 14},-6 ${AX - 3},0 ${AX - 14},6`, class: 'f-pri' }, mark);
  s('text', { x: AX - 18, y: 0, dy: '0.35em', 'text-anchor': 'end', class: 't-pri t-bold' }, mark, 'I + ΔI');

  slider(viz('flash-slider'), { label: 'ΔI', min: 0, max: 12, step: 1, value: JND }, d => {
    disk.setAttribute('style', gray(I + d).style);
    mark.setAttribute('transform', `translate(0 ${ys(I + d)})`);
    role('circle').textContent = String(I + d);
    role('ratio').textContent = fmt(d / I, 3);
    role('ratio-sub').textContent = d + ' / ' + I;
    let t;
    if (d === 0) t = 'ΔI = 0: the circle has the background intensity, so there is nothing to see.';
    else if (d < JND) t = `ΔI = ${d}: ratio ${fmt(d / I, 3)}. Still below the just noticeable difference, so the observer reports no circle.`;
    else if (d === JND) t = 'ΔI = 4 = ΔIc: the observer just notices the circle. Weber ratio = ΔIc/I = 4/200 = 0.02.';
    else t = `ΔI = ${d}: above ΔIc = 4, so the circle is seen. The Weber ratio stays 0.02, because it is set by the threshold ΔIc.`;
    role('flash-verdict').textContent = t;
  });

  // Figure 2: the JND that each ratio implies on I = 200
  const h = svg(viz('jnd'), 700, 160, { label: 'On a background of 200, ratio 0.02 needs 4 more levels, ratio 0.2 needs 40', minWidth: 540 });
  const ax = axes(h, { x: 150, y: 16, w: 500, h: 92, xd: [0, 255], yd: [0, 1], xt: [0, 50, 100, 150, 200, 255], xl: 'intensity level', grid: false });
  [[0.02, 'f-pri', 't-pri', 'good', 26], [0.2, 'f-sec', 't-sec', 'poor', 68]].forEach(([w, fill, tc, word, y]) => {
    const d = w * I;
    s('rect', { x: ax.x(0), y, width: ax.x(I) - ax.x(0), height: 26, class: 'f-seg' }, h);
    s('text', { x: ax.x(I) - 8, y: y + 13, dy: '0.35em', 'text-anchor': 'end', class: 't-muted' }, h, 'I = 200');
    s('rect', { x: ax.x(I), y, width: ax.x(I + d) - ax.x(I), height: 26, class: fill }, h);
    s('text', { x: ax.x(I + d) + 6, y: y + 13, dy: '0.35em', class: tc + ' t-bold' }, h, 'ΔIc = ' + fmt(d));
    s('text', { x: 0, y: y + 7, dy: '0.35em', class: tc + ' t-bold' }, h, 'ratio ' + w);
    s('text', { x: 0, y: y + 21, dy: '0.35em', class: tc }, h, word + ' discrimination');
  });
});

QV.register('s3-mc6', function (q) {
  const { s, svg, axes } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);

  // Figure 1: the same proportions before and after dividing by the total
  const g = svg(viz('shares'), 700, 190, { label: 'X 30, Y 45, Z 75 out of 150 become x 0.2, y 0.3, z 0.5 out of 1', minWidth: 540 });
  const X0 = 120, W = 500;
  const ax = axes(g, { x: X0, y: 110, w: W, h: 34, xd: [0, 1], yd: [0, 1], xt: [0, 0.2, 0.5, 1], grid: false });
  const parts = [['X', 30, 'x', 0.2, 'f-sec'], ['Y', 45, 'y', 0.3, 'f-ter'], ['Z', 75, 'z', 0.5, 'f-pri']];
  let acc = 0;
  parts.forEach(([U, v, l, f, cls]) => {
    const x = X0 + acc / 150 * W, w = v / 150 * W;
    s('rect', { x, y: 30, width: w, height: 34, class: cls + ' sep' }, g);
    s('text', { x: x + w / 2, y: 47, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, g, `${U} = ${v}`);
    s('rect', { x, y: 110, width: w, height: 34, class: cls + ' sep' }, g);
    s('text', { x: x + w / 2, y: 127, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, g, `${l} = ${f}`);
    acc += v;
    if (acc < 150) s('line', { x1: ax.x(acc / 150), x2: ax.x(acc / 150), y1: 66, y2: 108, class: 's-muted dash', style: 'stroke-width: 1' }, g);
  });
  s('text', { x: 0, y: 47, dy: '0.35em', class: 't-fg t-bold' }, g, 'X, Y, Z');
  s('text', { x: 0, y: 127, dy: '0.35em', class: 't-fg t-bold' }, g, 'x, y, z');
  s('text', { x: 0, y: 87, dy: '0.35em', class: 't-pri t-bold' }, g, '÷ (X + Y + Z)');
  s('text', { x: X0 + W + 10, y: 47, dy: '0.35em', class: 't-fg' }, g, 'sum 150');
  s('text', { x: X0 + W + 10, y: 127, dy: '0.35em', class: 't-ok t-bold' }, g, 'sum 1');

  // Figure 2: xy chromaticity diagram, CIE 1931 2° spectral locus
  const LOCUS = [[380, 0.1741, 0.0050], [420, 0.1714, 0.0051], [440, 0.1644, 0.0109], [450, 0.1566, 0.0177], [460, 0.1440, 0.0297],
    [470, 0.1241, 0.0578], [475, 0.1096, 0.0868], [480, 0.0913, 0.1327], [485, 0.0687, 0.2007], [490, 0.0454, 0.2950],
    [495, 0.0235, 0.4127], [500, 0.0082, 0.5384], [505, 0.0039, 0.6548], [510, 0.0139, 0.7502], [515, 0.0389, 0.8120],
    [520, 0.0743, 0.8338], [525, 0.1142, 0.8262], [530, 0.1547, 0.8059], [535, 0.1929, 0.7816], [540, 0.2296, 0.7543],
    [545, 0.2658, 0.7243], [550, 0.3016, 0.6923], [555, 0.3373, 0.6589], [560, 0.3731, 0.6245], [565, 0.4087, 0.5896],
    [570, 0.4441, 0.5547], [575, 0.4788, 0.5202], [580, 0.5125, 0.4866], [585, 0.5448, 0.4544], [590, 0.5752, 0.4242],
    [595, 0.6029, 0.3965], [600, 0.6270, 0.3725], [610, 0.6658, 0.3340], [620, 0.6915, 0.3083], [630, 0.7079, 0.2920],
    [640, 0.7190, 0.2809], [650, 0.7260, 0.2740], [660, 0.7300, 0.2700], [680, 0.7334, 0.2666], [700, 0.7347, 0.2653]];
  const c = svg(viz('xy'), 520, 516, { label: 'CIE xy chromaticity diagram with the color at x = 0.2, y = 0.3', minWidth: 420, maxWidth: 600 });
  const T = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
  const xa = axes(c, { x: 52, y: 20, w: 400, h: 450, xd: [0, 0.8], yd: [0, 0.9], xt: T, yt: T.concat([0.9]), xf: v => v.toFixed(1), yf: v => v.toFixed(1), xl: 'x', yl: 'y' });
  const P = ([, x, y]) => [xa.x(x), xa.y(y)];
  const d = LOCUS.map((p, i) => (i ? 'L' : 'M') + P(p).map(v => v.toFixed(1)).join(' ')).join(' ');
  s('path', { d: d + ' Z', class: 'f-seg', style: 'opacity: 0.85' }, c);
  s('path', { d, class: 's-fg' }, c);
  QV.line(c, [P(LOCUS[LOCUS.length - 1]), P(LOCUS[0])], 's-muted dash').setAttribute('style', 'stroke-width: 1.2');
  const E = [1 / 3, 1 / 3];
  [470, 480, 490, 500, 510, 520, 540, 560, 580, 600, 620, 700].forEach(wl => {
    const [, x, y] = LOCUS.find(p => p[0] === wl);
    const dx = x - E[0], dy = y - E[1], n = Math.hypot(dx, dy);
    const inside = { 490: [0.06, 0.268], 500: [0.022, 0.538], 510: [0.03, 0.75] }[wl];
    const lx = inside ? inside[0] : x + dx / n * 0.03, ly = inside ? inside[1] : y + dy / n * 0.03;
    const anchor = inside || dx / n > 0.35 ? 'start' : (dx / n < -0.35 ? 'end' : 'middle');
    s('circle', { cx: xa.x(x), cy: xa.y(y), r: 2, class: 'f-fg' }, c);
    s('text', { x: xa.x(lx), y: xa.y(ly), dy: '0.35em', 'text-anchor': anchor, class: 't-muted t-sm' }, c, wl);
  });
  s('text', { x: xa.x(0.47), y: xa.y(0.82), class: 't-muted' }, c, 'spectral locus, nm');
  s('text', { x: xa.x(0.44), y: xa.y(0.1), class: 't-muted t-sm' }, c, 'line of purples');
  s('circle', { cx: xa.x(E[0]), cy: xa.y(E[1]), r: 3.5, class: 'f-muted' }, c);
  s('text', { x: xa.x(E[0]) + 7, y: xa.y(E[1]) - 6, class: 't-fg t-bold' }, c, 'E');
  const px = xa.x(0.2), py = xa.y(0.3);
  QV.line(c, [[xa.x(0), py], [px, py], [px, xa.y(0)]], 's-pri dash').setAttribute('style', 'stroke-width: 1');
  s('circle', { cx: px, cy: py, r: 6, class: 'f-pri' }, c);
  s('text', { x: px + 10, y: py + 18, class: 't-pri t-bold halo' }, c, '(0.2, 0.3)');
  s('text', { x: px + 10, y: py + 33, class: 't-pri halo' }, c, 'z = 1 − 0.2 − 0.3 = 0.5');
});

QV.register('s3-mc7', function (q) {
  const { s, svg, axes, box, arrow, steps, table, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: slide-43 block diagram
  const b = svg(viz('blocks'), 760, 186, { label: 'Original image r, histogram equalization T, s, inverse histogram equalization G inverse fed by the desired histogram, specified image z', minWidth: 560 });
  const Y = 96, H = 46;
  box(b, 10, Y, 120, H, 'original image\nlevel r', { textCls: 't-fg' });
  box(b, 180, Y, 150, H, 'histogram\nequalization T', { cls: 'f-pri-soft', textCls: 't-fg' });
  box(b, 400, Y, 170, H, 'inverse histogram\nequalization G⁻¹', { cls: 'f-sec-soft', textCls: 't-fg' });
  box(b, 620, Y, 130, H, 'specified image\nlevel z', { textCls: 't-fg' });
  box(b, 420, 14, 130, 34, 'desired histogram', { textCls: 't-fg' });
  arrow(b, 130, Y + H / 2, 178, Y + H / 2, { label: 'r', labelCls: 't-fg t-bold' });
  arrow(b, 330, Y + H / 2, 398, Y + H / 2, { label: 's', labelCls: 't-fg t-bold' });
  arrow(b, 570, Y + H / 2, 618, Y + H / 2, { label: 'z', labelCls: 't-fg t-bold' });
  arrow(b, 485, 48, 485, Y - 2, { cls: 'a-sec', label: 'G', labelCls: 't-sec t-bold', dx: 12, dy: 4 });
  s('text', { x: 255, y: Y - 10, 'text-anchor': 'middle', class: 't-muted t-sm' }, b, 'built from the input histogram');
  s('text', { x: 560, y: 31, dy: '0.35em', class: 't-sec t-bold' }, b, '(2) v = G(z)');
  s('text', { x: 255, y: Y + H + 24, 'text-anchor': 'middle', class: 't-pri t-bold' }, b, '(1) s = T(r)');
  s('text', { x: 485, y: Y + H + 24, 'text-anchor': 'middle', class: 't-sec t-bold' }, b, '(3) z = G⁻¹(s)');

  // Figure 2: lookup on the two equalization curves (Part 2 Q3 numbers)
  const nr = [0, 2, 5, 4, 3, 2, 0, 0], nz = [0, 0, 0, 3, 4, 5, 2, 2];
  const cum = a => a.map((_, i) => a.slice(0, i + 1).reduce((x, y) => x + y, 0) * 7 / 16);
  const T = cum(nr), G = cum(nz);
  const S = T.map(v => Math.round(v));
  const ginv = v => G.reduce((best, gz, z) => (Math.abs(gz - v) < Math.abs(G[best] - v) ? z : best), 0);
  const c = svg(viz('cdf'), 800, 320, { label: 'T(r) of the input and G(z) of the desired histogram; paths r to s to z', minWidth: 560 });
  const L = [0, 1, 2, 3, 4, 5, 6, 7];
  const A = axes(c, { x: 52, y: 24, w: 300, h: 240, xd: [0, 7], yd: [0, 7], xt: L, yt: L, xl: 'r, input level', yl: 's = T(r)' });
  const B = axes(c, { x: 470, y: 24, w: 300, h: 240, xd: [0, 7], yd: [0, 7], xt: L, yt: L, xl: 'z, output level', yl: 'G(z)' });
  QV.line(c, T.map((v, r) => [A.x(r), A.y(v)]), 's-pri').setAttribute('style', 'stroke-width: 1.5');
  QV.line(c, G.map((v, z) => [B.x(z), B.y(v)]), 's-sec').setAttribute('style', 'stroke-width: 1.5');
  const paths = [1, 2, 3, 4, 5].map(r => {
    const grp = s('g', { class: 'fade' }, c);
    const sv = S[r], z = ginv(sv);
    QV.line(grp, [[A.x(r), A.y(0)], [A.x(r), A.y(sv)]], 's-pri').setAttribute('style', 'stroke-width: 2');
    QV.line(grp, [[A.x(r), A.y(sv)], [A.x(7) + 6, A.y(sv)]], 's-fg dash').setAttribute('style', 'stroke-width: 1.2');
    QV.line(grp, [[B.x(0), A.y(sv)], [B.x(z), A.y(sv)]], 's-fg dash').setAttribute('style', 'stroke-width: 1.2');
    if (Math.abs(G[z] - sv) > 0.01) QV.line(grp, [[B.x(z), A.y(sv)], [B.x(z), B.y(G[z])]], 's-sec dash').setAttribute('style', 'stroke-width: 1.5');
    QV.line(grp, [[B.x(z), B.y(G[z])], [B.x(z), B.y(0)]], 's-sec').setAttribute('style', 'stroke-width: 2');
    s('circle', { cx: A.x(r), cy: A.y(0), r: 4, class: 'f-pri' }, grp);
    s('circle', { cx: B.x(z), cy: B.y(0), r: 4, class: 'f-sec' }, grp);
    s('text', { x: 411, y: A.y(sv) - 5, 'text-anchor': 'middle', class: 't-fg t-sm' }, grp, 's = ' + sv);
    return grp;
  });
  T.forEach((v, r) => s('circle', { cx: A.x(r), cy: A.y(v), r: 3.5, class: 'f-pri' }, c));
  G.forEach((v, z) => s('circle', { cx: B.x(z), cy: B.y(v), r: 3.5, class: 'f-sec' }, c));

  const tbl = table(viz('cdf-table'), ['r', 'T(r) = cum × 7/16', 's, rounded', 'closest G(z)', 'z = G⁻¹(s)'],
    [1, 2, 3, 4, 5].map(r => [r, fmt(T[r], 4), S[r], fmt(G[ginv(S[r])], 4), { text: String(ginv(S[r])), cls: 'hl' }]));
  const NOTES = {
    1: 'r = 1: T(1) = 0.875, rounded to s = 1. G(z) is 0 for z = 0 to 2 and 1.3125 at z = 3; 1.3125 is closer to 1, so z = 3.',
    2: 'r = 2: T(2) = 3.0625, so s = 3. G(4) = 3.0625 is the closest G value, so z = 4.',
    3: 'r = 3: T(3) = 4.8125, so s = 5. G(5) = 5.25 is closer than G(4) = 3.0625, so z = 5.',
    4: 'r = 4: T(4) = 6.125, so s = 6. G(6) = 6.125, so z = 6.',
    5: 'r = 5: T(5) = 7, so s = 7. G(7) = 7, so z = 7.',
  };
  const note = role('cdf-note');
  steps(viz('cdf-steps'), ['All', 'r = 1', 'r = 2', 'r = 3', 'r = 4', 'r = 5'], k => {
    paths.forEach((p, i) => p.classList.toggle('dim', k > 0 && i !== k - 1));
    tbl.rows.forEach((r, i) => r.classList.toggle('on', i === k - 1));
    note.textContent = k ? NOTES[k] : 'The five levels in the image, r = 1 to 5, go to z = 3, 4, 5, 6, 7. Pick one level to follow its path.';
  });
});

QV.register('s3-mc8', function (q) {
  const { s, svg, grid, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const R = 7, C = 8;
  const ONES = [[1, 1], [1, 2], [1, 3], [1, 4], [2, 1], [2, 2], [2, 3], [2, 4], [3, 1], [3, 2], [4, 1], [4, 2], [4, 5]];
  const A = Array.from({ length: R }, () => Array(C).fill(0));
  ONES.forEach(([r, c]) => { A[r][c] = 1; });
  const B = [[0, 0], [0, 1], [1, 0]];
  const BH = B.map(([r, c]) => [-r, -c]);
  const at = (M, r, c) => (r >= 0 && r < R && c >= 0 && c < C ? M[r][c] : 0);
  const map = f => A.map((row, r) => row.map((_, c) => f(r, c)));
  const DIL = map((r, c) => (BH.some(([a, b]) => at(A, r + a, c + b)) ? 1 : 0));
  const ERO = map((r, c) => (B.every(([a, b]) => at(A, r + a, c + b)) ? 1 : 0));
  const OPN = map((r, c) => (BH.some(([a, b]) => at(ERO, r + a, c + b)) ? 1 : 0));
  const MISS = map((r, c) => 1 - DIL[r][c]);
  const idx = Array.from({ length: Math.max(R, C) }, (_, i) => String(i));

  // Figure 1: B, its reflection, A with B-hat placed at z, and A dilated by B
  const g = svg(viz('dil'), 700, 278, { label: 'Dilation of A by an L-shaped B: B-hat placed at z, and the result grid', minWidth: 560 });
  const small = (x, y, data, org, title) => {
    const gg = grid(g, { x, y, data, cell: 22, gap: 2, fill: v => (v ? 'f-pri' : 'f-seg'), text: false, title });
    s('circle', { cx: gg.cx(org[1]) + 11, cy: gg.cy(org[0]) + 11, r: 4, class: 'f-surface' }, g);
  };
  small(20, 72, [[1, 1], [1, 0]], [0, 0], 'B');
  small(20, 162, [[0, 1], [1, 1]], [1, 1], 'B̂ (reflected)');
  s('circle', { cx: 25, cy: 228, r: 4, class: 'f-pri' }, g);
  s('circle', { cx: 25, cy: 228, r: 2, class: 'f-surface' }, g);
  s('text', { x: 34, y: 228, dy: '0.35em', class: 't-muted t-sm' }, g, 'origin');
  const GA = { x: 160, y: 60, cell: 26, gap: 2 };
  const ga = grid(g, Object.assign({ data: A, fill: v => (v ? 'f-pri' : 'f-seg'), textCls: v => (v ? 't-on' : 't-muted'), rowLabels: idx.slice(0, R), colLabels: idx.slice(0, C), title: 'A' }, GA));
  const GR = Object.assign({}, GA, { x: 450 });
  const gr = grid(g, Object.assign({ data: DIL, fill: (v, r, c) => (A[r][c] ? 'f-pri' : (v ? 'f-ok' : 'f-seg')), textCls: v => (v ? 't-on' : 't-muted'), rowLabels: idx.slice(0, R), colLabels: idx.slice(0, C), title: 'A ⊕ B' }, GR));
  QV.arrow(g, 392, 60 + ga.h / 2, 426, 60 + ga.h / 2, { cls: 'a-muted' });
  const over = s('g', {}, g);

  const Z = [[2, 2], [1, 5], [5, 2], [4, 4]];
  const NOTES = [
    'A ⊕ B adds 9 pixels to the 13 pixels of A. Each part of A gains a column on its right and a row below it, the shape of B. Pick a position to test it.',
    'z = (2,2): B̂ covers (2,2), (2,1) and (1,2), all in A. The overlap is not empty, so z ∈ A ⊕ B. Every pixel of A stays, because B contains its own origin.',
    'z = (1,5) is outside A. B̂ covers (1,5), (1,4) and (0,5), and (1,4) is in A. One shared pixel is enough: z ∈ A ⊕ B, so A grows to the right.',
    'z = (5,2) is outside A. B̂ covers (5,2), (5,1) and (4,2), and (4,2) is in A. So z ∈ A ⊕ B, and A grows downward.',
    'z = (4,4) sits right next to the pixel (4,5) of A, but B̂ reaches only left and up: it covers (4,4), (4,3) and (3,4), none of them in A. The overlap is ∅, so z ∉ A ⊕ B.',
  ];
  const note = role('dil-note');
  steps(viz('dil-steps'), ['All', 'z = (2,2)', 'z = (1,5)', 'z = (5,2)', 'z = (4,4)'], k => {
    over.textContent = '';
    note.textContent = NOTES[k];
    if (!k) return;
    const [zr, zc] = Z[k - 1];
    BH.forEach(([a, b]) => {
      const r = zr + a, c = zc + b;
      s('rect', { x: ga.cx(c) + 1.5, y: ga.cy(r) + 1.5, width: GA.cell - 3, height: GA.cell - 3, rx: 2, class: 'f-none outline-sec' }, over);
    });
    s('circle', { cx: ga.cx(zc) + GA.cell - 6, cy: ga.cy(zr) + GA.cell - 6, r: 3, class: 'f-sec' }, over);
    s('rect', { x: gr.cx(zc) + 1.5, y: gr.cy(zr) + 1.5, width: GA.cell - 3, height: GA.cell - 3, rx: 2, class: 'f-none outline-sec' }, over);
  });

  // Figure 2: the four option sets side by side, each with the outline of A
  const f = svg(viz('four'), 400, 424, { label: 'Erosion, opening, complement of dilation and dilation of the same A', minWidth: 360 });
  [
    ['a · erosion', 'A ⊖ B', ERO, 't-fg'],
    ['b · opening', '(A ⊖ B) ⊕ B', OPN, 't-fg'],
    ['c · no overlap', '(A ⊕ B)ᶜ', MISS, 't-fg'],
    ['d · dilation', 'A ⊕ B', DIL, 't-ok'],
  ].forEach(([name, formula, M, tc], i) => {
    const x0 = 20 + (i % 2) * 200, y0 = 46 + Math.floor(i / 2) * 216, cell = 18, gap = 1;
    s('text', { x: x0, y: y0 - 30, class: tc + ' t-bold' }, f, name);
    s('text', { x: x0, y: y0 - 14, class: tc }, f, formula);
    const gg = grid(f, { x: x0, y: y0, data: M, cell, gap, fill: v => (v ? 'f-pri' : 'f-seg'), text: false });
    const segs = [];
    ONES.forEach(([r, c]) => {
      const xa = gg.cx(c) - 0.5, xb = gg.cx(c) + cell + 0.5, ya = gg.cy(r) - 0.5, yb = gg.cy(r) + cell + 0.5;
      if (!at(A, r - 1, c)) segs.push(`M${xa} ${ya}H${xb}`);
      if (!at(A, r + 1, c)) segs.push(`M${xa} ${yb}H${xb}`);
      if (!at(A, r, c - 1)) segs.push(`M${xa} ${ya}V${yb}`);
      if (!at(A, r, c + 1)) segs.push(`M${xb} ${ya}V${yb}`);
    });
    s('path', { d: segs.join(''), class: 's-ter dash', style: 'stroke-width: 2' }, f);
    const n = M.reduce((t, row) => t + row.reduce((u, v) => u + v, 0), 0);
    s('text', { x: x0, y: y0 + gg.h + 20, class: 't-muted' }, f, n + ' pixels');
  });
});

QV.register('s3-mc9', function (q) {
  const { s, svg, grid, gray, steps, table, h, mat } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const neg = v => (v < 0 ? '−' + (-v) : String(v));
  const PREWITT = [[[1, 0, -1], [1, 0, -1], [1, 0, -1]], [[-1, -1, -1], [0, 0, 0], [1, 1, 1]]];
  const SOBEL = [[[1, 0, -1], [2, 0, -2], [1, 0, -1]], [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]];
  const WIN = [
    [[0, 1, 1], [0, 1, 1], [0, 1, 1]],
    [[0, 0, 0], [1, 1, 1], [1, 1, 1]],
    [[0, 0, 1], [0, 1, 1], [1, 1, 1]],
  ];
  const resp = (M, w) => M.map(m => m.reduce((t, row, r) => t + row.reduce((u, v, c) => u + v * w[r][c], 0), 0));

  const g = svg(viz('edge'), 400, 404, { label: 'A 3 by 3 edge window and the Prewitt and Sobel masks with their responses', minWidth: 360 });
  const win = grid(g, { x: 20, y: 160, data: WIN[0], cell: 32, gap: 2, stroke: 'box', fill: v => gray(v, 1), title: 'edge window' });
  const groups = [['Prewitt', PREWITT, 0, 'f-sec-soft', 't-sec'], ['Sobel', SOBEL, 204, 'f-pri-soft', 't-pri']].map(([name, M, y0, soft, tc]) => {
    s('text', { x: 150, y: y0 + 18, class: tc + ' t-bold t-lg' }, g, name);
    const masks = M.map((m, j) => {
      const x = 150 + j * 120;
      const gg = grid(g, { x, y: y0 + 50, data: m, cell: 30, gap: 2, fill: () => 'f-seg', text: neg, title: j ? 'Hc' : 'Hr' });
      const sum = s('text', { x: x + gg.w / 2, y: y0 + 50 + gg.h + 20, 'text-anchor': 'middle', class: tc + ' t-bold' }, g, '');
      return { gg, sum };
    });
    const mag = s('text', { x: 257, y: y0 + 186, 'text-anchor': 'middle', class: tc + ' t-bold' }, g, '');
    return { M, masks, mag, soft };
  });

  const VALS = WIN.map(w => groups.map(G => Math.hypot(...resp(G.M, w))));
  const f2 = v => QV.fmt(v, 2);
  const tbl = table(viz('edge-table'), [{ text: '|G|', cls: 'l' }, 'vertical', 'horizontal', 'diagonal', 'diag ÷ vert'],
    groups.map((G, i) => [{ text: i ? 'Sobel' : 'Prewitt', cls: 'l' }, f2(VALS[0][i]), f2(VALS[1][i]), f2(VALS[2][i]), { text: f2(VALS[2][i] / VALS[0][i]), cls: 'hl' }]));
  const VERDICT = [
    'Vertical edge: Prewitt gives 3 and Sobel gives 4. These are the reference values for each operator.',
    'Horizontal edge: the same as vertical, 3 and 4, because each Hc mask is its Hr mask turned by 90°.',
    'Diagonal edge: Prewitt drops to 2.83, 0.94 × its vertical response. Sobel rises to 4.24, 1.06 × its vertical response. Sobel is the one more sensitive to diagonal edges.',
  ];
  steps(viz('edge-steps'), ['Vertical edge', 'Horizontal edge', 'Diagonal edge'], k => {
    const w = WIN[k];
    w.forEach((row, r) => row.forEach((v, c) => {
      const gv = gray(v, 1);
      win.rects[r][c].setAttribute('style', gv.style);
      win.texts[r][c].setAttribute('class', gv.text);
      win.texts[r][c].textContent = v;
    }));
    groups.forEach(G => {
      const [hr, hc] = resp(G.M, w);
      G.masks.forEach((m, j) => {
        m.gg.rects.forEach((row, r) => row.forEach((rect, c) => rect.setAttribute('class', (w[r][c] ? G.soft : 'f-seg') + ' sep')));
        m.sum.textContent = (j ? 'Hc' : 'Hr') + ' = ' + neg(j ? hc : hr);
      });
      G.mag.textContent = `|G| = √(${hr * hr} + ${hc * hc}) = ${f2(Math.hypot(hr, hc))}`;
    });
    tbl.rows.forEach(tr => [...tr.children].forEach((td, j) => {
      if (j >= 1 && j <= 3) td.className = j - 1 === k ? 'hl' : '';
    }));
    role('edge-verdict').textContent = VERDICT[k];
  }, 2);

  mat(viz('lap'), [[0, -1, 0], [-1, 4, -1], [0, -1, 0]], { text: neg, hl: v => (v === 4 ? 'hl' : null) });
  const rb = h('div', { class: 'given' }, viz('roberts'));
  mat(rb, [[0, 0, -1], [0, 1, 0], [0, 0, 0]], { caption: 'Hr', text: neg, hl: v => (v ? 'hl' : null) });
  mat(rb, [[-1, 0, 0], [0, 1, 0], [0, 0, 0]], { caption: 'Hc', text: neg, hl: v => (v ? 'hl' : null) });
});

QV.register('s3-mc10', function (q) {
  const { s, svg, arrow, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const g = svg(viz('pr'), 500, 560, { label: 'Pattern recognition flow chart from input to decision with costs and adjustments as side inputs', minWidth: 420 });
  const BX = 40, BW = 230, BH = 40, MID = BX + BW / 2;
  const STAGES = [['post-processing', 70], ['classification', 160], ['feature extraction', 250], ['segmentation', 340], ['sensing', 430]];
  const boxes = STAGES.map(([name, y]) => {
    const r = s('rect', { x: BX, y, width: BW, height: BH, rx: 6, class: 'f-surface box' }, g);
    const t = s('text', { x: MID, y: y + BH / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg' }, g, name);
    return { r, t };
  });
  s('text', { x: MID, y: 22, 'text-anchor': 'middle', class: 't-fg t-bold t-lg' }, g, 'decision');
  arrow(g, MID, 70, MID, 32, { cls: 'a-muted' });
  s('text', { x: MID, y: 548, 'text-anchor': 'middle', class: 't-fg t-bold t-lg' }, g, 'input');
  arrow(g, MID, 534, MID, 472, { cls: 'a-muted' });
  for (let i = 0; i < STAGES.length - 1; i++) {
    const top = STAGES[i][1] + BH, bot = STAGES[i + 1][1];
    arrow(g, BX + 70, bot, BX + 70, top + 2, { cls: 'a-muted' });
    arrow(g, BX + 160, top, BX + 160, bot - 2, { cls: 'a-muted', dash: true });
  }

  const seg = (x1, y1, x2, y2) => s('line', { x1, y1, x2, y2, class: 'a-muted', style: 'stroke-width: 1.5' }, g);
  const RX = BX + BW, CX = RX + 50, LX = RX + 98;
  const parts = {
    costs: arrow(g, LX - 8, 80, RX + 2, 80, { cls: 'a-muted' }),
    trunk: seg(LX - 8, 129, CX, 129),
    up: seg(CX, 129, CX, 100),
    down: seg(CX, 129, CX, 170),
    toPost: arrow(g, CX, 100, RX + 2, 100, { cls: 'a-muted' }),
    toClass: arrow(g, CX, 170, RX + 2, 170, { cls: 'a-muted' }),
    missing: arrow(g, LX - 8, 190, RX + 2, 190, { cls: 'a-muted' }),
  };
  const labels = {
    costs: [s('text', { x: LX, y: 80, dy: '0.35em' }, g, 'costs')],
    context: [s('text', { x: LX, y: 122, dy: '0.35em' }, g, 'adjustments for'), s('text', { x: LX, y: 136, dy: '0.35em' }, g, 'context')],
    missing: [s('text', { x: LX, y: 183, dy: '0.35em' }, g, 'adjustments for'), s('text', { x: LX, y: 197, dy: '0.35em' }, g, 'missing features')],
  };
  const paint = (el, on) => {
    el.style.opacity = on ? 1 : 0.4;
    if (el.tagName === 'g') [...el.children].forEach(ch => ch.setAttribute('class', on ? 'a-pri' : 'a-muted'));
    else el.setAttribute('class', on ? 'a-pri' : 'a-muted');
  };
  // option index → stage index in STAGES, lit arrow parts, lit labels
  const OPT = [
    { stage: 3, parts: [], labels: [] },
    { stage: 2, parts: [], labels: [] },
    { stage: 1, parts: ['trunk', 'down', 'toClass', 'missing'], labels: ['context', 'missing'] },
    { stage: 0, parts: ['costs', 'trunk', 'up', 'toPost'], labels: ['costs', 'context'] },
  ];
  const NOTES = [
    'Segmentation (and grouping): "Patterns should be well separated and should not overlap". No side input enters it.',
    'Feature extraction: "Discriminative features", "Invariant features with respect to translation, rotation and scale". No side input enters it.',
    'Classification: "Use a feature vector provided by a feature extractor to assign the object to a category". Adjustments for context and for missing features enter it, but costs do not.',
    'Post-processing: "Exploit context input dependent information other than from the target pattern itself to improve performance". Costs and adjustments for context enter it. This is the answer.',
  ];
  const note = role('pr-note');
  steps(viz('pr-steps'), ['a · Segmentation', 'b · Feature extraction', 'c · Classification', 'd · Post-processing'], k => {
    const o = OPT[k];
    boxes.forEach((b, i) => {
      b.r.setAttribute('class', (i === o.stage ? 'f-pri' : 'f-surface') + ' box');
      b.t.setAttribute('class', (i === o.stage ? 't-on t-bold' : 't-fg') + ' t-lg');
    });
    Object.keys(parts).forEach(key => paint(parts[key], o.parts.includes(key)));
    Object.keys(labels).forEach(key => labels[key].forEach(t => t.setAttribute('class', o.labels.includes(key) ? 't-pri t-bold' : 't-muted')));
    note.textContent = NOTES[k];
  }, 3);
});

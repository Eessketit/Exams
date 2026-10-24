QV.register('s5-mc1', function (q) {
  const { s, svg, axes, line, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const V = 340;

  const g = svg(viz('wave'), 640, 340, { label: 'Pressure against time at one point and pressure against distance at one instant, with the period T and the wavelength marked', minWidth: 520 });
  const P = [
    { x: 56, y: 28, w: 560, h: 92, xd: [0, 20], xt: [0, 5, 10, 15, 20], xl: 'time t at one point (ms)', name: 'T', unit: 'ms', cls: 'sec' },
    { x: 56, y: 202, w: 560, h: 92, xd: [0, 8], xt: [0, 1, 2, 3, 4, 5, 6, 7, 8], xl: 'distance along the air at one instant (m)', name: 'λ', unit: 'm', cls: 'pri' },
  ];
  const panels = P.map(p => {
    const ax = axes(g, { x: p.x, y: p.y, w: p.w, h: p.h, xd: p.xd, yd: [-1.25, 1.75], xt: p.xt, yt: [], xl: p.xl, yl: 'air pressure' });
    s('line', { x1: p.x, x2: p.x + p.w, y1: ax.y(0), y2: ax.y(0), class: 'l-grid' }, g);
    return { p, ax, layer: s('g', {}, g) };
  });

  function draw(f) {
    const T = 1000 / f, lam = V / f;
    panels.forEach(({ p, ax, layer }, i) => {
      layer.textContent = '';
      const per = i === 0 ? T : lam;
      const pts = [];
      for (let k = 0; k <= 900; k++) {
        const t = p.xd[1] * k / 900;
        pts.push([ax.x(t), ax.y(Math.sin(2 * Math.PI * t / per))]);
      }
      line(layer, pts, 's-fg');
      const x1 = ax.x(per / 4), x2 = ax.x(per * 5 / 4), yb = ax.y(1.3);
      [x1, x2].forEach(x => {
        s('line', { x1: x, x2: x, y1: ax.y(1), y2: yb - 4, class: 's-' + p.cls + ' dash', style: 'stroke-width: 1.2' }, layer);
        s('circle', { cx: x, cy: ax.y(1), r: 3.5, class: 'f-' + p.cls }, layer);
      });
      s('line', { x1, x2, y1: yb, y2: yb, class: 's-' + p.cls, style: 'stroke-width: 2' }, layer);
      const val = i === 0 ? T.toFixed(2) : fmt(lam, 3);
      s('text', { x: Math.max((x1 + x2) / 2, p.x + 50), y: yb - 6, 'text-anchor': 'middle', class: 't-' + p.cls + ' t-bold halo' }, layer, `${p.name} = ${val} ${p.unit}`);
    });
    role('f').textContent = f;
    role('T').textContent = T.toFixed(2);
    role('lam').textContent = fmt(lam, 3);
    role('verdict').innerHTML = `λ = v / f = 340 / ${f} = <b>${fmt(lam, 3)} m</b>. In one period, T = ${T.toFixed(2)} ms, the wave moves v × T = ${fmt(lam, 3)} m, exactly one wavelength.`;
  }

  slider(viz('slider'), { label: 'f', min: 85, max: 680, step: 5, value: 170, fmt: v => v + ' Hz' }, draw);
});

QV.register('s5-mc2', function (q) {
  const { s, svg, slider } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const TYPES = { 8: 'Note off', 9: 'Note on', 10: 'Polyphonic key pressure', 11: 'Control change', 12: 'Program change', 13: 'Channel pressure', 14: 'Pitch bend' };
  const hex = v => '&H' + v.toString(16).toUpperCase().padStart(2, '0');
  const bin = v => v.toString(2).padStart(8, '0');
  const bracket = (layer, x1, x2, y, label, cls, anchor) => {
    s('path', { d: `M${x1} ${y - 5} L${x1} ${y} L${x2} ${y} L${x2} ${y - 5}`, class: 's-' + cls, style: 'stroke-width: 1.5' }, layer);
    s('text', { x: anchor === 'start' ? x1 : (x1 + x2) / 2, y: y + 15, 'text-anchor': anchor || 'middle', class: 't-' + cls + ' t-bold' }, layer, label);
  };

  // Figure 1: one byte and the number line 0..255
  const g = svg(viz('byte'), 640, 286, { label: 'The 8 bits of a MIDI byte above a number line from 0 to 255 split into data bytes and status bytes', minWidth: 540 });
  const B = { x: 40, y: 30, cell: 46, step: 50 };
  const rects = [], texts = [];
  for (let i = 0; i < 8; i++) {
    const x = B.x + i * B.step;
    s('text', { x: x + B.cell / 2, y: B.y - 9, 'text-anchor': 'middle', class: 't-sm' }, g, 'bit ' + (7 - i));
    rects.push(s('rect', { x, y: B.y, width: B.cell, height: B.cell, rx: 4, class: 'f-seg' }, g));
    texts.push(s('text', { x: x + B.cell / 2, y: B.y + B.cell / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg t-bold' }, g, '0'));
  }
  const fields = s('g', {}, g);
  const valText = s('text', { x: 456, y: B.y + 18, class: 't-fg t-bold t-xl' }, g);
  const hexText = s('text', { x: 456, y: B.y + 40, class: 't-muted' }, g);

  const NL = { x: 40, y: 140, w: 560, h: 24 };
  const nx = v => NL.x + v / 256 * NL.w;
  s('rect', { x: nx(0), y: NL.y, width: nx(128) - nx(0), height: NL.h, class: 'f-sec-soft' }, g);
  s('rect', { x: nx(128), y: NL.y, width: nx(256) - nx(128), height: NL.h, class: 'f-pri-soft' }, g);
  s('text', { x: nx(64), y: NL.y + NL.h / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-sec t-bold' }, g, 'data bytes, MSB 0');
  s('text', { x: nx(192), y: NL.y + NL.h / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-pri t-bold' }, g, 'status bytes, MSB 1');
  s('line', { x1: nx(128), x2: nx(128), y1: NL.y, y2: NL.y + NL.h + 6, class: 's-fg' }, g);
  s('text', { x: nx(0), y: NL.y + NL.h + 16, 'text-anchor': 'start' }, g, '0');
  s('text', { x: nx(128) - 4, y: NL.y + NL.h + 16, 'text-anchor': 'end' }, g, '127');
  s('text', { x: nx(128) + 4, y: NL.y + NL.h + 16, 'text-anchor': 'start' }, g, '128');
  s('text', { x: nx(256), y: NL.y + NL.h + 16, 'text-anchor': 'end' }, g, '255');
  const opts = s('g', {}, g);
  bracket(opts, nx(0) + 1, nx(128) - 3, 206, 'a: 0 to 127, data', 'sec');
  bracket(opts, nx(128) + 3, nx(256) - 1, 206, 'c: 128 to 255, status', 'ok');
  bracket(opts, nx(0) + 1, nx(16), 234, 'b: 0 to 15, the channel nibble', 'muted', 'start');
  bracket(opts, nx(0) + 1, nx(256) - 1, 262, 'd: 0 to 255, any byte', 'muted');
  const marker = s('g', {}, g);
  const mLine = s('line', { y1: NL.y - 10, y2: NL.y + NL.h, class: 's-fg', style: 'stroke-width: 2' }, marker);
  const mTri = s('polygon', { class: 'f-fg' }, marker);

  function draw(v) {
    const bits = bin(v), status = v >= 128;
    for (let i = 0; i < 8; i++) {
      const b = bits[i];
      let cls;
      if (i === 0) cls = status ? 'f-pri' : 'f-sec';
      else if (!status) cls = 'f-sec-soft';
      else cls = i < 4 ? 'f-pri-soft' : 'f-ter-soft';
      rects[i].setAttribute('class', cls);
      texts[i].textContent = b;
      texts[i].setAttribute('class', (i === 0 ? 't-on' : 't-fg') + ' t-lg t-bold');
    }
    fields.textContent = '';
    const bx = i => B.x + i * B.step;
    const fy = B.y + B.cell + 12;
    if (status) {
      bracket(fields, bx(0) + 2, bx(0) + B.cell - 2, fy, 'MSB 1', 'pri');
      bracket(fields, bx(1) + 2, bx(3) + B.cell - 2, fy, 'type', 'pri');
      bracket(fields, bx(4) + 2, bx(7) + B.cell - 2, fy, 'channel 0 to 15', 'ter');
    } else {
      bracket(fields, bx(0) + 2, bx(0) + B.cell - 2, fy, 'MSB 0', 'sec');
      bracket(fields, bx(1) + 2, bx(7) + B.cell - 2, fy, 'value 0 to 127', 'sec');
    }
    valText.textContent = '= ' + v;
    hexText.textContent = hex(v) + ' · ' + bits.slice(0, 4) + ' ' + bits.slice(4);
    const x = nx(v + 0.5);
    mLine.setAttribute('x1', x); mLine.setAttribute('x2', x);
    mTri.setAttribute('points', `${x - 6},${NL.y - 18} ${x + 6},${NL.y - 18} ${x},${NL.y - 9}`);
    const hi = v >> 4, lo = v & 15;
    let note;
    if (!status) note = `${hex(v)} = ${v} = ${bits.slice(0, 4)} ${bits.slice(4)}. The MSB is 0, so this is a <b>data byte</b> with value ${v}, for example a key number or a velocity.`;
    else if (hi === 15) note = `${hex(v)} = ${v} = ${bits.slice(0, 4)} ${bits.slice(4)}. The MSB is 1, so this is a <b>status byte</b>. High nibble F means a system message (&amp;HF0 to &amp;HFF), which carries no channel.`;
    else note = `${hex(v)} = ${v} = ${bits.slice(0, 4)} ${bits.slice(4)}. The MSB is 1, so this is a <b>status byte</b>. High nibble ${hi.toString(16).toUpperCase()} = ${TYPES[hi]}, low nibble ${bits.slice(4)} = channel ${lo} of 0 to 15.`;
    role('note').innerHTML = note;
  }
  slider(viz('slider'), { label: 'byte', min: 0, max: 255, step: 1, value: 147 }, draw);

  // Figure 2: a three-byte Note On message
  const m = svg(viz('msg'), 600, 166, { label: 'Note On message: status byte 10010011, data bytes 00111100 and 01100100; only the status byte has bit 7 set', minWidth: 500 });
  const M = { x: 196, y: 32, cell: 32, step: 36, row: 42 };
  const ROWS = [[0x93, 'status: Note on, ch 3', true], [60, 'data 1: key 60', false], [100, 'data 2: velocity 100', false]];
  s('rect', { x: M.x - 4, y: M.y - 6, width: M.cell + 8, height: 2 * M.row + M.cell + 12, rx: 5, class: 'f-none outline-pri' }, m);
  s('text', { x: M.x + M.cell / 2, y: M.y - 14, 'text-anchor': 'middle', class: 't-pri t-bold' }, m, 'bit 7');
  ROWS.forEach(([v, label, st], r) => {
    const y = M.y + r * M.row;
    const bits = bin(v);
    s('text', { x: 0, y: y + M.cell / 2, dy: '0.35em', class: (st ? 't-pri' : 't-sec') + ' t-bold' }, m, label);
    for (let i = 0; i < 8; i++) {
      const x = M.x + i * M.step;
      const cls = i === 0 ? (st ? 'f-pri' : 'f-sec') : (st ? (i < 4 ? 'f-pri-soft' : 'f-ter-soft') : 'f-sec-soft');
      s('rect', { x, y, width: M.cell, height: M.cell, rx: 4, class: cls }, m);
      s('text', { x: x + M.cell / 2, y: y + M.cell / 2, dy: '0.35em', 'text-anchor': 'middle', class: (i === 0 ? 't-on' : 't-fg') + ' t-bold' }, m, bits[i]);
    }
    s('text', { x: M.x + 8 * M.step + 8, y: y + M.cell / 2, dy: '0.35em', class: 't-fg' }, m, hex(v) + ' = ' + v);
  });
});

QV.register('s5-mc3', function (q) {
  const { s, svg, steps, box } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Both trees have the same shape for HELLO; only the order in which nodes appear differs.
  const N = {
    root: { x: 130, y: 70, w: 100, sf: '{L,H,E,O} 5', hf: 'P3 = 5', sfStep: 0, hfStep: 3 },
    L: { x: 50, y: 140, w: 46, sf: 'L 2', hf: 'L 2', code: '0', sfStep: 1, hfStep: 0 },
    HEO: { x: 210, y: 140, w: 86, sf: '{H,E,O} 3', hf: 'P2 = 3', sfStep: 1, hfStep: 2 },
    H: { x: 140, y: 210, w: 46, sf: 'H 1', hf: 'H 1', code: '10', sfStep: 2, hfStep: 0 },
    EO: { x: 280, y: 210, w: 72, sf: '{E,O} 2', hf: 'P1 = 2', sfStep: 2, hfStep: 1 },
    E: { x: 230, y: 280, w: 46, sf: 'E 1', hf: 'E 1', code: '110', sfStep: 3, hfStep: 0 },
    O: { x: 330, y: 280, w: 46, sf: 'O 1', hf: 'O 1', code: '111', sfStep: 3, hfStep: 0 },
  };
  const EDGES = [['root', 'L', '0'], ['root', 'HEO', '1'], ['HEO', 'H', '0'], ['HEO', 'EO', '1'], ['EO', 'E', '0'], ['EO', 'O', '1']];
  const NH = 26;
  const SF_PARTS = ['{L} {H} {E} {O}', '{L} {H,E,O}', '{L} {H} {E,O}', '{L} {H} {E} {O}'];
  const HF_LIST = ['P3 5', 'L 2, H 1, P1 2', 'L 2, P2 3', 'P3 5'];
  const PANELS = [
    { ox: 16, key: 'sf', step: 'sfStep', c: 'pri', title: 'Shannon-Fano: top-down', dir: 'down', list: SF_PARTS, listLabel: 'parts' },
    { ox: 426, key: 'hf', step: 'hfStep', c: 'sec', title: 'Huffman: bottom-up', dir: 'up', list: HF_LIST, listLabel: 'list' },
  ];

  const g = svg(viz('trees'), 840, 360, { label: 'Shannon-Fano and Huffman trees for HELLO built step by step: Shannon-Fano from the root down, Huffman from the leaves up', minWidth: 600 });
  const layer = s('g', {}, g);

  function draw(k) {
    layer.textContent = '';
    const kk = k === 0 ? 3 : k;
    PANELS.forEach(P => {
      const at = id => N[id].x + P.ox;
      s('text', { x: P.ox, y: 18, class: 't-' + P.c + ' t-bold t-lg' }, layer, P.title);
      const ax = P.ox + 390, y0 = 62, y1 = 282;
      QV.arrow(layer, ax, P.dir === 'down' ? y0 : y1, ax, P.dir === 'down' ? y1 : y0, { cls: 'a-' + P.c, width: 2 });
      s('text', { x: ax, y: P.dir === 'down' ? y0 - 10 : y1 + 18, 'text-anchor': 'middle', class: 't-' + P.c + ' t-sm' }, layer, 'start');
      EDGES.forEach(([a, b, bit]) => {
        const made = P.key === 'sf' ? N[b].sfStep : N[a].hfStep;
        const grp = s('g', { class: made <= kk ? '' : 'dim' }, layer);
        const xa = at(a), ya = N[a].y + NH / 2, xb = at(b), yb = N[b].y - NH / 2;
        s('line', { x1: xa, y1: ya, x2: xb, y2: yb, class: 's-muted' }, grp);
        const left = bit === '0';
        s('text', { x: (xa + xb) / 2 + (left ? -9 : 9), y: (ya + yb) / 2, dy: '0.35em', 'text-anchor': left ? 'end' : 'start', class: 't-fg t-bold' }, grp, bit);
      });
      Object.keys(N).forEach(id => {
        const n = N[id];
        const made = n[P.step];
        const isNew = k > 0 && made === k;
        const leaf = !!n.code;
        const cls = isNew ? 'f-' + P.c : (leaf ? 'f-seg' : 'f-' + P.c + '-soft');
        const grp = s('g', { class: made <= kk ? '' : 'dim' }, layer);
        box(grp, at(id) - n.w / 2, n.y - NH / 2, n.w, NH, n[P.key], { cls, textCls: isNew ? 't-on t-bold' : 't-fg', stroke: isNew ? 'sep' : 'box' });
        const codeShown = leaf && made <= kk && (P.key === 'sf' || kk === 3);
        if (codeShown) s('text', { x: at(id), y: n.y + NH / 2 + 15, 'text-anchor': 'middle', class: 't-ok t-bold' }, grp, 'code ' + n.code);
      });
      s('text', { x: P.ox, y: 340, class: 't-fg' }, layer, P.listLabel + ': ' + P.list[k]);
    });
  }

  const NOTES = [
    'Both trees are finished. For HELLO they have the same shape and the same codes: L 0, H 10, E 110, O 111, 10 bits in total. Shannon-Fano made the root\'s children first and the E/O parent last. Huffman made the E/O parent first and the root last.',
    'Step 1. Shannon-Fano splits the sorted list L 2, H 1, E 1, O 1 into {L} = 2 and {H,E,O} = 3, the two children of the root. Huffman merges the two smallest counts, E 1 + O 1, into P1 = 2 at the bottom of the tree.',
    'Step 2. Shannon-Fano splits {H,E,O} into {H} = 1 and {E,O} = 2. Huffman merges the two smallest nodes, H 1 + P1 2, into P2 = 3.',
    'Step 3. Shannon-Fano splits {E,O} into E and O, so every part holds one symbol. Huffman merges L 2 + P2 3 into the root P3 = 5. Only now can Huffman read the codes from the root down.',
  ];
  steps(viz('steps'), ['All', 'Step 1', 'Step 2', 'Step 3'], k => {
    draw(k);
    role('note').textContent = NOTES[k];
  });
});

QV.register('s5-mc4', function (q) {
  const { s, svg, axes } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const g = svg(viz('bars'), 760, 252, { label: 'MPEG-1 audio layers: Layer 1 32 to 448 kbps target 192, Layer 2 32 to 384 target 128, Layer 3 32 to 320 target 64', minWidth: 580 });
  const ax = axes(g, { x: 150, y: 14, w: 490, h: 186, xd: [0, 480], yd: [0, 1], xt: [0, 64, 128, 192, 256, 320, 384, 448], yt: [], xl: 'bit rate (kbps)' });
  [64, 128, 192, 256, 320, 384, 448].forEach(v => s('line', { x1: ax.x(v), x2: ax.x(v), y1: 14, y2: 200, class: 'l-grid' }, g));
  const ROWS = [
    { name: 'Layer 1 · a', max: 448, target: 192, cx: 'simplest', y: 34 },
    { name: 'Layer 2 · b', max: 384, target: 128, cx: 'more complex', y: 86 },
    { name: 'Layer 3, MP3 · c', max: 320, target: 64, cx: 'most complex', y: 138, main: true },
  ];
  const BH = 26;
  const diamond = (x, y, r, cls) => s('polygon', { points: `${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`, class: cls }, g);
  ROWS.forEach(r => {
    const t = r.main ? 't-pri' : 't-fg';
    s('text', { x: 140, y: r.y + BH / 2, dy: '0.35em', 'text-anchor': 'end', class: t + ' t-bold' }, g, r.name);
    s('rect', { x: ax.x(32), y: r.y, width: ax.x(r.max) - ax.x(32), height: BH, rx: 3, class: r.main ? 'f-pri-soft outline-pri' : 'f-seg box' }, g);
    s('text', { x: ax.x(r.max) - (r.main ? 14 : 6), y: r.y + BH / 2, dy: '0.35em', 'text-anchor': 'end', class: t }, g, r.max);
    s('text', { x: ax.x(32) + 6, y: r.y + BH / 2, dy: '0.35em', class: 't-muted t-sm' }, g, '32');
    diamond(ax.x(r.target), r.y + BH / 2, 8, r.main ? 'f-pri' : 'f-muted');
    s('text', { x: ax.x(r.target), y: r.y - 5, 'text-anchor': 'middle', class: (r.main ? 't-pri' : 't-fg') + ' t-bold' }, g, 'target ' + r.target);
    s('text', { x: 660, y: r.y + BH / 2, dy: '0.35em', class: 't-muted' }, g, r.cx);
  });
  const d = ROWS[2];
  s('polygon', { points: `${ax.x(320)},${d.y + BH / 2 - 9} ${ax.x(320) + 9},${d.y + BH / 2} ${ax.x(320)},${d.y + BH / 2 + 9} ${ax.x(320) - 9},${d.y + BH / 2}`, class: 'f-none s-bad', style: 'stroke-width: 2' }, g);
  s('text', { x: ax.x(320), y: d.y + BH + 16, 'text-anchor': 'middle', class: 't-bad' }, g, 'd: 320 is the top of the range');
});

QV.register('s5-mc5', function (q) {
  const { s, svg, axes, plot, grid, gray, steps, table } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);

  const Wk = x => {
    const a = -0.5, t = Math.abs(x);
    if (t <= 1) return (a + 2) * t ** 3 - (a + 3) * t ** 2 + 1;
    if (t < 2) return a * t ** 3 - 5 * a * t ** 2 + 8 * a * t - 4 * a;
    return 0;
  };
  const clampI = (i, n) => Math.max(0, Math.min(n - 1, i));
  const clamp255 = v => Math.max(0, Math.min(255, v));
  const M = [
    { key: 'nn', name: 'Nearest neighbor', c: 'ter', reads1: 1, reads2: 1 },
    { key: 'lin', name: 'Bilinear', c: 'sec', reads1: 2, reads2: 4 },
    { key: 'cub', name: 'Bicubic', c: 'pri', reads1: 4, reads2: 16 },
  ];
  // 1-D interpolators over samples S at integer positions
  const interp = {
    nn: (S, x) => S[clampI(Math.floor(x + 0.5), S.length)],
    lin: (S, x) => { const i = Math.floor(x), t = x - i; return S[clampI(i, S.length)] * (1 - t) + S[clampI(i + 1, S.length)] * t; },
    cub: (S, x) => { const i = Math.floor(x), t = x - i; let v = 0; for (let k = -1; k <= 2; k++) v += S[clampI(i + k, S.length)] * Wk(t - k); return v; },
  };

  // Figure 1: 6x6 image with a bright anti-diagonal line, enlarged 4x
  const IMG = [];
  for (let r = 0; r < 6; r++) {
    IMG.push([]);
    for (let c = 0; c < 6; c++) IMG[r].push(Math.round(30 + 200 * Math.max(0, 1 - Math.abs(r + c - 5) / 1.2)));
  }
  const up = key => {
    const out = [];
    for (let r = 0; r < 24; r++) {
      out.push([]);
      const ys = (r + 0.5) / 4 - 0.5;
      for (let c = 0; c < 24; c++) {
        const xs = (c + 0.5) / 4 - 0.5;
        let v;
        if (key === 'nn') v = IMG[clampI(Math.floor(ys + 0.5), 6)][clampI(Math.floor(xs + 0.5), 6)];
        else {
          const col = IMG.map(row => interp[key](row, xs));
          v = interp[key](col, ys);
        }
        out[r].push(clamp255(v));
      }
    }
    return out;
  };
  const gi = svg(viz('images'), 456, 506, { label: 'A 6 by 6 image with a diagonal line and its 4 times enlargements by nearest neighbor, bilinear and bicubic interpolation', minWidth: 400 });
  const centre = U => { let sum = 0; for (let r = 2; r < 22; r++) sum += U[r][23 - r]; return Math.round(sum / 20); };
  const UP = { nn: up('nn'), lin: up('lin'), cub: up('cub') };
  const PAN = [
    { x: 24, y: 34, title: 'Input 6×6', cap: 'line 230, background 30', c: 'fg', data: IMG, cell: 32 },
    { x: 240, y: 34, title: 'Nearest neighbor', cap: 'staircase of 4×4 blocks', c: 'ter', data: UP.nn, cell: 8 },
    { x: 24, y: 284, title: 'Bilinear', cap: 'line centre avg ' + centre(UP.lin), c: 'sec', data: UP.lin, cell: 8 },
    { x: 240, y: 284, title: 'Bicubic', cap: 'line centre avg ' + centre(UP.cub), c: 'pri', data: UP.cub, cell: 8 },
  ];
  PAN.forEach(p => {
    s('text', { x: p.x, y: p.y - 10, class: 't-' + p.c + ' t-bold' }, gi, p.title);
    const grp = s('g', { style: p.cell < 10 ? 'shape-rendering: crispEdges' : null }, gi);
    grid(grp, { x: p.x, y: p.y, data: p.data, cell: p.cell, fill: v => gray(v), text: p.cell < 10 ? false : v => v, stroke: p.cell < 10 ? 'nostroke' : 'sep' });
    s('text', { x: p.x, y: p.y + 192 + 18, class: 't-muted' }, gi, p.cap);
  });

  // Figure 2: one row sampled from a smooth curve and rebuilt
  const TRUE = x => 40 + 150 * Math.exp(-(((x - 3.4) / 1.05) ** 2)) + 110 / (1 + Math.exp(-(x - 6.5) * 2.5));
  const S = [];
  for (let i = 0; i < 10; i++) S.push(TRUE(i));
  const XS = [];
  for (let k = 0; k <= 450; k++) XS.push(k * 0.02);
  const stats = M.map(m => {
    let se = 0, peak = 0;
    XS.forEach(x => { const e = interp[m.key](S, x) - TRUE(x); se += e * e; peak = Math.max(peak, interp[m.key](S, x)); });
    return { rms: Math.sqrt(se / XS.length), peak };
  });
  const truePeak = Math.max(...XS.map(TRUE));

  const gr = svg(viz('row'), 640, 284, { label: 'Ten samples of a smooth curve rebuilt by nearest neighbor, bilinear and bicubic interpolation', minWidth: 520 });
  const ax = axes(gr, { x: 52, y: 22, w: 568, h: 214, xd: [0, 9], yd: [0, 220], xt: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], yt: [0, 50, 100, 150, 200], xl: 'position x (pixels)', yl: 'intensity' });
  const PROBE = 3.7;
  s('line', { x1: ax.x(PROBE), x2: ax.x(PROBE), y1: ax.y(0), y2: ax.y(220), class: 's-muted dash', style: 'stroke-width: 1' }, gr);
  s('text', { x: ax.x(PROBE) + 5, y: ax.y(214), class: 't-muted' }, gr, 'x = 3.7');
  plot(gr, ax, TRUE, 0, 9, 300, 's-muted dash');
  const curves = M.map(m => {
    const pts = XS.map(x => [ax.x(x), ax.y(interp[m.key](S, x))]);
    return QV.line(s('g', { class: 'fade' }, gr), pts, 's-' + m.c);
  });
  S.forEach((v, i) => s('circle', { cx: ax.x(i), cy: ax.y(v), r: 4, class: 'f-fg' }, gr));
  const rings = s('g', {}, gr);
  const USED = { nn: [4], lin: [3, 4], cub: [2, 3, 4, 5] };

  const tbl = table(viz('table'), [{ text: 'Method', cls: 'l' }, 'Reads per point (1-D)', 'Reads per pixel (2-D)', 'RMS error', 'Peak (true ' + truePeak.toFixed(0) + ')'],
    M.map((m, i) => [{ text: m.name, cls: 'l' }, String(m.reads1), String(m.reads2), { text: stats[i].rms.toFixed(1), cls: i === 2 ? 'hl' : '' }, stats[i].peak.toFixed(1)]));

  steps(viz('steps'), ['All', 'Nearest', 'Bilinear', 'Bicubic'], k => {
    curves.forEach((c, i) => c.parentNode.classList.toggle('dim', k > 0 && i !== k - 1));
    tbl.rows.forEach((r, i) => r.classList.toggle('on', k > 0 && i === k - 1));
    rings.textContent = '';
    const m = M[k === 0 ? 2 : k - 1];
    USED[m.key].forEach(i => s('circle', { cx: ax.x(i), cy: ax.y(S[i]), r: 8.5, class: 's-' + m.c }, rings));
  });
});

QV.register('s5-mc6', function (q) {
  const { s, svg, grid, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const R0 = 0, C0 = 2, NR = 7, NC = 7, P = [3, 5];
  const SETS = [
    { pts: [[2, 5], [4, 5], [3, 4], [3, 6]], note: 'Option a, N<sub>4</sub>(p): (x−1, y) = (2,5), (x+1, y) = (4,5), (x, y−1) = (3,4), (x, y+1) = (3,6). Four pixels that share an edge with p. <b>This is the answer.</b>' },
    { pts: [[2, 4], [2, 6], [4, 4], [4, 6]], note: 'Option b, N<sub>D</sub>(p): (x±1, y±1), the four diagonal pixels that touch p only at a corner.' },
    { pts: [[2, 5], [4, 5], [3, 4], [3, 6], [2, 4], [2, 6], [4, 4], [4, 6]], note: 'Option c, N<sub>8</sub>(p) = N<sub>4</sub>(p) ∪ N<sub>D</sub>(p): every pixel with D<sub>8</sub> = 1 from p, eight pixels.' },
    { pts: [[1, 5], [5, 5], [3, 3], [3, 7]], note: 'Option d: (x±2, y) and (x, y±2). These are two steps from p (D<sub>4</sub> = 2), so they are not neighbors.' },
  ];
  const data = [];
  for (let r = 0; r < NR; r++) { data.push([]); for (let c = 0; c < NC; c++) data[r].push([R0 + r, C0 + c]); }
  const g = svg(viz('grid'), 420, 418, { label: 'A 7 by 7 pixel grid around p = (3, 5) with the pixels of the chosen option lit', minWidth: 360 });
  s('text', { x: 50 + NC * 50 / 2, y: 14, 'text-anchor': 'middle', class: 't-fg t-bold' }, g, 'y (column) →');
  s('text', { x: 6, y: 42, class: 't-fg t-bold' }, g, 'x ↓');
  const layer = s('g', {}, g);

  function draw(k) {
    layer.textContent = '';
    const on = new Set(SETS[k].pts.map(p => p.join(',')));
    grid(layer, {
      x: 50, y: 52, cell: 50, gap: 0, data,
      fill: ([x, y]) => (x === P[0] && y === P[1]) ? 'f-ter' : (on.has(x + ',' + y) ? 'f-pri' : 'f-seg'),
      text: ([x, y]) => (x === P[0] && y === P[1]) ? 'p' : `(${x},${y})`,
      textCls: ([x, y]) => (x === P[0] && y === P[1]) ? 't-on t-bold t-lg' : (on.has(x + ',' + y) ? 't-on t-bold' : 't-muted t-sm'),
      colLabels: data[0].map(([, y]) => String(y)),
      rowLabels: data.map(row => String(row[0][0])),
    });
    role('note').innerHTML = SETS[k].note;
  }
  steps(viz('steps'), ['a · N4(p)', 'b · ND(p)', 'c · N8(p)', 'd · distance 2'], draw);
});

QV.register('s5-mc7', function (q) {
  const { s, svg, slider, grid, gray, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const V = 250;
  const bin = v => v.toString(2).padStart(8, '0');

  // Figure 1: bitwise XOR of p with 250
  const g = svg(viz('bits'), 560, 196, { label: 'Bitwise XOR of p with 250: equal bits give 0, different bits give 1', minWidth: 480 });
  const B = { x: 104, y: 30, cell: 38, step: 42, rows: [30, 78, 140] };
  [128, 64, 32, 16, 8, 4, 2, 1].forEach((pv, i) => s('text', { x: B.x + i * B.step + B.cell / 2, y: 18, 'text-anchor': 'middle', class: 't-sm' }, g, pv));
  const diffLayer = s('g', {}, g);
  const LAB = ['p', 'v = 250', 'p XOR v'];
  const cells = LAB.map((lab, r) => {
    s('text', { x: 0, y: B.rows[r] + B.cell / 2, dy: '0.35em', class: (r === 2 ? 't-pri' : 't-fg') + ' t-bold' }, g, lab);
    const row = [];
    for (let i = 0; i < 8; i++) {
      const x = B.x + i * B.step;
      row.push({
        rect: s('rect', { x, y: B.rows[r], width: B.cell, height: B.cell, rx: 4, class: 'f-seg' }, g),
        text: s('text', { x: x + B.cell / 2, y: B.rows[r] + B.cell / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-lg' }, g, '0'),
      });
    }
    return row;
  });
  s('line', { x1: B.x - 4, x2: B.x + 8 * B.step, y1: 129, y2: 129, class: 's-fg' }, g);
  const dec = B.rows.map((y, r) => s('text', { x: B.x + 8 * B.step + 10, y: y + B.cell / 2, dy: '0.35em', class: (r === 2 ? 't-pri t-lg' : 't-fg') + ' t-bold' }, g, ''));

  slider(viz('slider'), { label: 'p', min: 0, max: 255, step: 1, value: 250 }, p => {
    const r = p ^ V, bp = bin(p), bv = bin(V), br = bin(r);
    diffLayer.textContent = '';
    let nd = 0;
    for (let i = 0; i < 8; i++) {
      const diff = bp[i] !== bv[i];
      if (diff) { nd++; s('rect', { x: B.x + i * B.step - 3, y: B.rows[0] - 3, width: B.cell + 6, height: B.rows[1] + B.cell - B.rows[0] + 6, rx: 6, class: 'f-sec-soft' }, diffLayer); }
      [bp, bv].forEach((bits, rr) => { cells[rr][i].text.textContent = bits[i]; });
      cells[2][i].text.textContent = br[i];
      cells[2][i].rect.setAttribute('class', br[i] === '1' ? 'f-pri' : 'f-seg');
      cells[2][i].text.setAttribute('class', (br[i] === '1' ? 't-on t-bold' : 't-muted') + ' t-lg');
    }
    dec[0].textContent = '= ' + p;
    dec[1].textContent = '= 250';
    dec[2].textContent = '= ' + r + (r === 0 ? ', black' : '');
    role('verdict').innerHTML = r === 0
      ? 'p = v, so all 8 bit pairs are equal and every result bit is 0. <b>p XOR 250 = 0</b>: this pixel turns black.'
      : `p ≠ v: ${nd} of the 8 bit pairs differ (shaded), so ${nd} result bit${nd > 1 ? 's are' : ' is'} 1. <b>p XOR 250 = ${r}</b>, nonblack.`;
  });

  // Figure 2: XOR 250 on a small image, then test for 0
  const IMG = [];
  for (let r = 0; r < 6; r++) { IMG.push([]); for (let c = 0; c < 8; c++) IMG[r].push(60 + 20 * c + 6 * r); }
  [[1, 3], [2, 2], [2, 3], [2, 4], [3, 3], [4, 6]].forEach(([r, c]) => { IMG[r][c] = 250; });
  IMG[1][2] = 255; IMG[3][4] = 251; IMG[0][6] = 249;
  const OUT = IMG.map(row => row.map(v => v ^ V));
  const gi = svg(viz('image'), 750, 224, { label: 'A 6 by 8 image, the image XOR 250, and the pixels where the result is 0', minWidth: 560 });
  const CELL = 26, W = 8 * CELL, X = [10, 10 + W + 52, 10 + 2 * (W + 52)], Y = 34;
  const TITLES = [['Image p', 't-fg'], ['p XOR 250', 't-pri'], ['p XOR 250 = 0', 't-ok']];
  TITLES.forEach(([t, c], i) => s('text', { x: X[i], y: Y - 12, class: c + ' t-bold' }, gi, t));
  grid(gi, { x: X[0], y: Y, data: IMG, cell: CELL, fill: v => gray(v) });
  grid(gi, { x: X[1], y: Y, data: OUT, cell: CELL, fill: v => gray(v) });
  grid(gi, { x: X[2], y: Y, data: OUT, cell: CELL, fill: v => v === 0 ? 'f-pri' : 'f-seg', text: v => v === 0 ? '1' : '0', textCls: v => v === 0 ? 't-on t-bold' : 't-muted' });
  OUT.forEach((row, r) => row.forEach((v, c) => {
    if (v === 0) s('rect', { x: X[1] + c * CELL + 1.5, y: Y + r * CELL + 1.5, width: CELL - 3, height: CELL - 3, class: 'f-none outline-sec' }, gi);
  }));
  arrow(gi, X[0] + W + 8, Y + 3 * CELL, X[1] - 8, Y + 3 * CELL, { cls: 'a-muted', label: 'XOR', dy: -8 });
  arrow(gi, X[1] + W + 8, Y + 3 * CELL, X[2] - 8, Y + 3 * CELL, { cls: 'a-muted', label: '= 0?', dy: -8 });
  s('text', { x: X[0], y: Y + 6 * CELL + 20, class: 't-muted' }, gi, '250s hidden among 249, 251, 255');
  s('text', { x: X[1], y: Y + 6 * CELL + 20, class: 't-muted' }, gi, '250 → 0 (ringed), 255 → 5');
  s('text', { x: X[2], y: Y + 6 * CELL + 20, class: 't-muted' }, gi, OUT.flat().filter(v => v === 0).length + ' pixels found');
});

QV.register('s5-mc8', function (q) {
  const { s, svg, grid, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const R = 9, C = 18;
  const A = [];
  for (let r = 0; r < R; r++) A.push(new Array(C).fill(0));
  const put = (r0, r1, c0, c1) => { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) A[r][c] = 1; };
  put(3, 5, 1, 3);
  put(2, 5, 6, 9);
  put(3, 5, 12, 16);
  const at = (r, c) => (r >= 0 && r < R && c >= 0 && c < C) ? A[r][c] : 0;
  const X = [], RING = [];
  for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
    if (Math.max(Math.abs(dr), Math.abs(dc)) <= 1) X.push([dr, dc]); else RING.push([dr, dc]);
  }
  const E1 = [], E2 = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (X.every(([dr, dc]) => at(r + dr, c + dc) === 1)) E1.push([r, c]);
    if (RING.every(([dr, dc]) => at(r + dr, c + dc) === 0)) E2.push([r, c]);
  }
  const key = ([r, c]) => r + ',' + c;
  const e1 = new Set(E1.map(key));
  const BOTH = E2.filter(p => e1.has(key(p)));

  const g = svg(viz('grid'), 480, 376, { label: 'Hit-or-miss transform on a binary image with a 3 by 3 square X, a 4 by 4 square Y and a 3 by 5 bar Z', minWidth: 440 });
  const SE = 16;
  s('text', { x: 20, y: 16, class: 't-fg t-bold' }, g, 'B₁ = X');
  grid(g, { x: 20, y: 40, cell: SE, data: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], fill: () => 'f-pri', text: false });
  s('text', { x: 140, y: 16, class: 't-fg t-bold' }, g, 'B₂ = W − X');
  grid(g, { x: 140, y: 24, cell: SE, data: [0, 1, 2, 3, 4].map(r => [0, 1, 2, 3, 4].map(c => (r % 4 === 0 || c % 4 === 0) ? 1 : 0)), fill: v => v ? 'f-sec' : 'f-none', text: false, stroke: 'box' });
  s('text', { x: 236, y: 46, class: 't-muted' }, g, 'W = 5×5 window around X.');
  s('text', { x: 236, y: 62, class: 't-muted' }, g, 'W − X = the 1-pixel ring of');
  s('text', { x: 236, y: 78, class: 't-muted' }, g, 'local background around X.');

  const G = { x: 24, y: 146, cell: 24 };
  [['X', 2], ['Y', 7.5], ['Z', 14]].forEach(([t, c]) => s('text', { x: G.x + c * G.cell + G.cell / 2, y: G.y - 10, 'text-anchor': 'middle', class: 't-fg t-bold' }, g, t));
  grid(g, { x: G.x, y: G.y, cell: G.cell, data: A, fill: v => v ? 'f-pri' : 'f-seg', text: false });
  const layer = s('g', {}, g);
  const cx = c => G.x + c * G.cell + G.cell / 2, cy = r => G.y + r * G.cell + G.cell / 2;
  const dots = (pts, cls, rad) => pts.forEach(([r, c]) => s('circle', { cx: cx(c), cy: cy(r), r: rad, class: cls + ' sep' }, layer));
  const frame = ([r, c], half, cls) => s('rect', { x: G.x + (c - half) * G.cell, y: G.y + (r - half) * G.cell, width: (2 * half + 1) * G.cell, height: (2 * half + 1) * G.cell, class: 'f-none ' + cls }, layer);

  const NOTES = [
    `Step 1, A ⊖ X: the ${E1.length} points where the 3×3 square X fits inside A. One is the centre of X, ${E1.filter(([, c]) => c >= 6 && c <= 9).length} are inside Y and ${E1.filter(([, c]) => c >= 12).length} are inside Z. The dashed frame shows X fitting inside Y. Erosion alone cannot pick out X.`,
    `Step 2, Aᶜ ⊖ (W − X): the ${E2.length} points where the whole background ring fits in Aᶜ. Around Y and Z the ring always hits foreground, so no point inside them qualifies.`,
    `Step 3, the intersection: ${BOTH.length} point, (${BOTH.map(([r, c]) => r + ', ' + c).join('; ')}), the centre of X. Here X fits in A and its ring fits in Aᶜ at the same time.`,
  ];
  steps(viz('steps'), ['1 · A ⊖ X', '2 · Aᶜ ⊖ (W − X)', '3 · Both: A ⊛ B'], k => {
    layer.textContent = '';
    if (k === 0) { dots(E1, 'f-ter', 6); frame(E1[3], 1, 'outline-sec dash'); }
    if (k === 1) dots(E2, 'f-sec', 6);
    if (k === 2) {
      dots(E1, 'f-ter', 4);
      dots(E2, 'f-sec', 4);
      frame(BOTH[0], 2, 'outline-sec');
      frame(BOTH[0], 1, 'outline-sec dash');
      dots(BOTH, 'f-ok', 8);
    }
    role('note').textContent = NOTES[k];
  }, 2);
});

QV.register('s5-mc9', function (q) {
  const { s, svg, axes, line, slider, grid, gray, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: edge profile with noise, f' and f''
  const N = 48;
  let seed = 12345;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const NOISE = [];
  for (let i = 0; i < N; i++) NOISE.push(Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd()));
  const CLEAN = [];
  for (let i = 0; i < N; i++) CLEAN.push(40 + 160 / (1 + Math.exp(-(i - 23.5) / 1.2)));
  const d1 = f => f.slice(0, -1).map((v, i) => f[i + 1] - v);
  const d2 = f => f.map((v, i) => (i === 0 || i === N - 1) ? null : f[i + 1] - 2 * v + f[i - 1]);
  const c1 = d1(CLEAN), c2 = d2(CLEAN);
  const peak1 = Math.max(...c1), lobe2 = Math.max(...c2.filter(v => v != null).map(Math.abs));

  const g = svg(viz('profile'), 640, 398, { label: 'Noisy ramp edge, its first difference and its second difference with zero crossings marked', minWidth: 520 });
  const PAN = [
    { y: 26, yd: [0, 240], yt: [0, 100, 200], yl: 'f(x), the edge' },
    { y: 148, yd: [-30, 50], yt: [-25, 0, 25, 50], yl: 'f′(x), first order: one peak' },
    { y: 270, yd: [-24, 24], yt: [-20, -10, 0, 10, 20], yl: 'f″(x), Laplacian: two lobes' },
  ];
  const axs = PAN.map((p, i) => axes(g, { x: 52, y: p.y, w: 568, h: 86, xd: [0, N - 1], yd: p.yd, xt: i === 2 ? [0, 8, 16, 24, 32, 40, 47] : [], yt: p.yt, xl: i === 2 ? 'pixel position x' : null, yl: p.yl }));
  const clip = (v, [a, b]) => Math.max(a, Math.min(b, v));
  const series = (ax, arr, dom, x0) => arr.map((v, i) => v == null ? null : [ax.x(i + x0), ax.y(clip(v, dom))]).filter(Boolean);
  line(g, series(axs[1], c1, PAN[1].yd, 0.5), 's-muted dash');
  line(g, series(axs[2], c2, PAN[2].yd, 0), 's-muted dash');
  const iMax = c2.indexOf(Math.max(...c2.filter(v => v != null)));
  const iMin = c2.indexOf(Math.min(...c2.filter(v => v != null)));
  s('text', { x: axs[2].x(iMax) - 12, y: axs[2].y(c2[iMax]) - 10, 'text-anchor': 'end', class: 't-sec t-bold t-lg halo' }, g, '+');
  s('text', { x: axs[2].x(iMin) + 12, y: axs[2].y(c2[iMin]) + 18, class: 't-sec t-bold t-lg halo' }, g, '−');
  const layer = s('g', {}, g);

  slider(viz('slider'), { label: 'noise σ', min: 0, max: 8, step: 0.5, value: 2, fmt: v => v.toFixed(1) }, sig => {
    layer.textContent = '';
    const f = CLEAN.map((v, i) => v + sig * NOISE[i]);
    const f1 = d1(f), f2 = d2(f);
    line(layer, series(axs[0], f, PAN[0].yd, 0), 's-fg');
    line(layer, series(axs[1], f1, PAN[1].yd, 0.5), 's-pri');
    line(layer, series(axs[2], f2, PAN[2].yd, 0), 's-sec');
    let last = 0, zc = 0;
    f2.forEach((v, i) => {
      if (v == null || Math.abs(v) < 1e-9) return;
      const sg = Math.sign(v);
      if (last && sg !== last) {
        zc++;
        const xz = axs[2].x(i - 0.5);
        s('line', { x1: xz, x2: xz, y1: axs[2].y(0) - 7, y2: axs[2].y(0) + 7, class: 's-bad', style: 'stroke-width: 2' }, layer);
      }
      last = sg;
    });
    role('zc').textContent = zc;
    role('snr1').textContent = sig === 0 ? '∞' : (peak1 / (sig * Math.SQRT2)).toFixed(1);
    role('snr2').textContent = sig === 0 ? '∞' : (lobe2 / (sig * Math.sqrt(6))).toFixed(1);
  });

  // Figure 2: Laplacian on a vertical and a horizontal edge, against Sobel
  const LAP = [[0, -1, 0], [-1, 4, -1], [0, -1, 0]];
  const MX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], MY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
  const sgn = v => v > 0 ? '+' + v : (v < 0 ? '−' + (-v) : '0');
  const conv = (img, k, r, c) => { let v = 0; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) v += k[i + 1][j + 1] * img[r + i][c + j]; return v; };
  const VERT = [0, 1, 2, 3, 4].map(() => [10, 10, 10, 90, 90]);
  const HORZ = [10, 10, 10, 90, 90].map(v => [v, v, v, v, v]);
  const ge = svg(viz('edges'), 640, 366, { label: 'Laplacian output on a vertical and a horizontal edge, and the Sobel direction for each', minWidth: 540 });
  const COLS = { img: 16, lap: 210, sob: 380 };
  s('text', { x: COLS.img, y: 16, class: 't-fg t-bold' }, ge, 'Image (5×5)');
  s('text', { x: COLS.lap, y: 16, class: 't-sec t-bold' }, ge, 'Laplacian, inner 3×3');
  s('text', { x: COLS.sob, y: 16, class: 't-pri t-bold' }, ge, 'Sobel at the centre');
  [['vertical edge', VERT, 36], ['horizontal edge', HORZ, 206]].forEach(([name, img, y]) => {
    s('text', { x: COLS.img, y: y + 6, class: 't-muted' }, ge, name);
    grid(ge, { x: COLS.img, y: y + 16, data: img, cell: 26, fill: v => gray(v) });
    const lap = [1, 2, 3].map(r => [1, 2, 3].map(c => conv(img, LAP, r, c)));
    arrow(ge, COLS.img + 140, y + 81, COLS.lap - 10, y + 81, { cls: 'a-muted' });
    grid(ge, { x: COLS.lap, y: y + 29, data: lap, cell: 34, fill: v => v < 0 ? 'f-sec-soft' : (v > 0 ? 'f-pri-soft' : 'f-seg'), text: sgn });
    s('rect', { x: COLS.lap + 34 + 1.5, y: y + 29 + 34 + 1.5, width: 31, height: 31, class: 'f-none outline-sec' }, ge);
    s('text', { x: COLS.lap, y: y + 29 + 3 * 34 + 18, class: 't-sec' }, ge, 'centre: ' + sgn(lap[1][1]) + ', no angle');
    const mx = conv(img, MX, 2, 2), my = conv(img, MY, 2, 2);
    const th = Math.round(Math.atan2(my, mx) * 180 / Math.PI);
    const ox = COLS.sob + 46, oy = y + 81, L = 36;
    s('circle', { cx: ox, cy: oy, r: L + 4, class: 'f-none s-line' }, ge);
    arrow(ge, ox, oy, ox + L * Math.cos(th * Math.PI / 180), oy + L * Math.sin(th * Math.PI / 180), { cls: 'a-pri', width: 2.5, head: 10 });
    s('text', { x: COLS.sob + 104, y: oy - 16, class: 't-pri' }, ge, `(Mx, My) = (${mx}, ${my})`);
    s('text', { x: COLS.sob + 104, y: oy + 2, class: 't-pri t-bold' }, ge, `θ = ${th}°`);
    s('text', { x: COLS.sob + 104, y: oy + 20, class: 't-muted' }, ge, 'gradient points to');
    s('text', { x: COLS.sob + 104, y: oy + 34, class: 't-muted' }, ge, th === 0 ? 'the right' : 'the bottom');
  });
});

QV.register('s5-mc10', function (q) {
  const { s, svg, axes, steps, table } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const A = [[6.4, 6.2], [7.4, 7.0], [7.6, 5.8], [6.8, 5.2], [5.9, 5.6], [7.4, 4.8], [6.2, 7.0], [2.8, 7.4]];
  const B = [[1.2, 8.6], [2.0, 9.2], [1.6, 7.8], [2.4, 8.6], [0.9, 7.9], [8.4, 1.8], [9.0, 2.6], [7.9, 1.2], [8.8, 0.9], [9.4, 1.7]];
  const mean = P => [P.reduce((a, p) => a + p[0], 0) / P.length, P.reduce((a, p) => a + p[1], 0) / P.length];
  const MA = mean(A), MB = mean(B);
  const QS = [[4.9, 5.9], [2.6, 6.9]];
  const dist = (p, r) => Math.hypot(p[0] - r[0], p[1] - r[1]);
  const PTS = A.map(p => ({ p, c: 'A' })).concat(B.map(p => ({ p, c: 'B' })));

  const g = svg(viz('plot'), 420, 410, { label: 'Two-class feature space with class B in two modes, a query point, its nearest neighbors and the class means', minWidth: 380 });
  const ax = axes(g, { x: 50, y: 24, w: 340, h: 340, xd: [0, 10], yd: [0, 10], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6, 8, 10], xl: 'feature x₁', yl: 'feature x₂' });
  const under = s('g', {}, g);
  A.forEach(([x, y]) => s('circle', { cx: ax.x(x), cy: ax.y(y), r: 5.5, class: 'f-pri sep' }, g));
  B.forEach(([x, y]) => s('rect', { x: ax.x(x) - 5, y: ax.y(y) - 5, width: 10, height: 10, class: 'f-sec sep' }, g));
  const cross = ([x, y], cls) => {
    const X = ax.x(x), Y = ax.y(y), r = 8;
    s('path', { d: `M${X - r} ${Y} L${X + r} ${Y} M${X} ${Y - r} L${X} ${Y + r}`, class: cls, style: 'stroke-width: 3.5' }, g);
  };
  cross(MA, 's-pri');
  cross(MB, 's-sec');
  s('text', { x: ax.x(MA[0]) + 10, y: ax.y(MA[1]) - 10, class: 't-pri t-bold halo' }, g, 'mean A');
  s('text', { x: ax.x(MB[0]) + 6, y: ax.y(MB[1]) + 18, class: 't-sec t-bold halo' }, g, 'mean B');
  const over = s('g', {}, g);

  let qi = 0, mi = 0;
  const host = viz('table');
  function draw() {
    under.textContent = ''; over.textContent = ''; host.textContent = '';
    const qp = QS[qi], QX = ax.x(qp[0]), QY = ax.y(qp[1]);
    const sorted = PTS.map(t => ({ ...t, d: dist(t.p, qp) })).sort((a, b) => a.d - b.d);
    let verdict, rows, head;
    if (mi < 3) {
      const k = [1, 3, 5][mi];
      const near = sorted.slice(0, k);
      const votes = near.filter(t => t.c === 'A').length;
      const win = votes * 2 > k ? 'A' : 'B';
      const rpx = near[k - 1].d * 34;
      s('circle', { cx: QX, cy: QY, r: rpx, class: 's-ok dash', style: 'stroke-width: 1.5' }, under);
      near.forEach(t => s('line', { x1: QX, y1: QY, x2: ax.x(t.p[0]), y2: ax.y(t.p[1]), class: 's-ok', style: 'stroke-width: 2' }, under));
      verdict = `${k}-NN: the ${k === 1 ? 'nearest sample is' : k + ' nearest samples are'} ${near.map(t => t.c).join(', ')}, so the query gets <b>class ${win}</b>.`;
      head = [{ text: 'Rank', cls: 'l' }, { text: 'Sample', cls: 'l' }, { text: 'Class', cls: 'l' }, 'Distance'];
      rows = sorted.slice(0, 6).map((t, i) => [{ text: String(i + 1), cls: 'l' }, { text: `(${t.p[0].toFixed(1)}, ${t.p[1].toFixed(1)})`, cls: 'l' }, { text: t.c, cls: 'l' }, { text: t.d.toFixed(2), cls: i < k ? 'hl' : '' }]);
    } else {
      const dA = dist(MA, qp), dB = dist(MB, qp);
      [[MA, dA, 's-pri'], [MB, dB, 's-sec']].forEach(([m, d, cls]) => s('line', { x1: QX, y1: QY, x2: ax.x(m[0]), y2: ax.y(m[1]), class: cls + (d === Math.min(dA, dB) ? '' : ' dash'), style: 'stroke-width: 2' }, under));
      const win = dA < dB ? 'A' : 'B';
      const nn = sorted[0].c;
      verdict = `Nearest mean (option a): mean A is ${dA.toFixed(2)} away and mean B is ${dB.toFixed(2)} away, so it says <b>class ${win}</b>. 1-NN says class ${nn}.`;
      head = [{ text: 'Class mean', cls: 'l' }, { text: 'Position', cls: 'l' }, 'Distance'];
      rows = [['A', MA, dA], ['B', MB, dB]].map(([c, m, d]) => [{ text: 'mean ' + c, cls: 'l' }, { text: `(${m[0].toFixed(2)}, ${m[1].toFixed(2)})`, cls: 'l' }, { text: d.toFixed(2), cls: d === Math.min(dA, dB) ? 'hl' : '' }]);
    }
    s('circle', { cx: QX, cy: QY, r: 7, class: 'f-surface s-fg', style: 'stroke-width: 2.5' }, over);
    s('text', { x: QX, y: qi === 0 ? QY - 14 : QY + 22, 'text-anchor': 'middle', class: 't-fg t-bold halo' }, over, 'query ' + (qi + 1));
    role('verdict').innerHTML = verdict;
    const t = table(host, head, rows);
    if (mi < 3) t.rows.forEach((r, i) => r.classList.toggle('on', i < [1, 3, 5][mi]));
  }
  steps(viz('query'), ['Query 1 (4.9, 5.9)', 'Query 2 (2.6, 6.9)'], k => { qi = k; draw(); });
  steps(viz('method'), ['1-NN', '3-NN', '5-NN', 'Nearest mean (a)'], k => { mi = k; draw(); });
});

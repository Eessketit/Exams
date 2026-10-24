QV.register('s4-mc1', function (q) {
  const { s, svg, axes, line } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);

  // Figure 1: two sampled channels and the bit stream they produce
  const W = svg(viz('words'), 720, 256, { label: 'Left and right channels sampled at the same instants; each instant adds a 16-bit left word and a 16-bit right word to the stream', minWidth: 560 });
  const XS = [130, 280, 430, 580];
  s('line', { x1: XS[0], x2: XS[1], y1: 22, y2: 22, class: 's-fg', style: 'stroke-width: 1' }, W);
  XS.slice(0, 2).forEach(x => s('line', { x1: x, x2: x, y1: 17, y2: 27, class: 's-fg', style: 'stroke-width: 1' }, W));
  s('text', { x: (XS[0] + XS[1]) / 2, y: 13, 'text-anchor': 'middle', class: 't-fg' }, W, 'T = 1/11,025 s ≈ 90.7 µs');
  XS.forEach(x => s('line', { x1: x, x2: x, y1: 32, y2: 176, class: 's-muted dash', style: 'stroke-width: 1; opacity: 0.6' }, W));
  [
    { name: 'left', cls: 'pri', y0: 70, f: x => 70 - 22 * Math.sin(2 * Math.PI * (x - 70) / 520 + 0.3) },
    { name: 'right', cls: 'sec', y0: 135, f: x => 135 - 22 * Math.sin(2 * Math.PI * (x - 70) / 380 + 1.8) },
  ].forEach(w => {
    s('text', { x: 10, y: w.y0, dy: '0.35em', class: `t-${w.cls} t-bold` }, W, w.name);
    const pts = [];
    for (let x = 70; x <= 700; x += 4) pts.push([x, w.f(x)]);
    line(W, pts, `s-${w.cls}`).setAttribute('style', 'stroke-width: 2');
    XS.forEach(x => s('circle', { cx: x, cy: w.f(x), r: 4.5, class: `f-${w.cls}` }, W));
  });
  s('text', { x: 10, y: 193, dy: '0.35em', class: 't-muted' }, W, 'stream');
  XS.forEach(x => {
    [['pri', x - 66], ['sec', x + 2]].forEach(([cls, x0]) => {
      s('rect', { x: x0, y: 180, width: 64, height: 26, rx: 2, class: `f-${cls}` }, W);
      for (let b = 1; b < 16; b++) s('line', { x1: x0 + b * 4, x2: x0 + b * 4, y1: 180, y2: 206, class: 'sep', style: 'stroke-width: 1' }, W);
      s('text', { x: x0 + 32, y: 220, 'text-anchor': 'middle', class: `t-${cls} t-sm` }, W, '16 bits');
    });
  });
  s('text', { x: 666, y: 193, dy: '0.35em', class: 't-muted t-lg' }, W, '…');
  s('path', { d: `M${XS[0] - 66} 226 V231 H${XS[0] + 66} V226`, class: 's-fg', style: 'stroke-width: 1' }, W);
  s('text', { x: XS[0], y: 246, 'text-anchor': 'middle', class: 't-fg t-bold' }, W, '32 bits per instant');

  // Figure 2: the options on one kbps scale
  const O = svg(viz('options'), 720, 222, { label: 'The four options as bars on a kbps scale with the product that gives each one', minWidth: 560 });
  const ax = axes(O, { x: 150, y: 8, w: 540, h: 164, xd: [0, 800], yd: [0, 1], xt: [0, 200, 400, 600, 800], yt: [], xl: 'kbps' });
  [
    ['b', 44.1, '352,800 ÷ 8: bytes per second'],
    ['a', 176.4, '11,025 × 16: one channel'],
    ['c', 352.8, '11,025 × 16 × 2: stereo'],
    ['d', 705.6, '44,100 × 16: the mono CD rate'],
  ].forEach(([k, v, note], i) => {
    const y = 18 + i * 38, ok = k === 'c', x1 = ax.x(v);
    s('text', { x: 0, y: y + 13, dy: '0.35em', class: ok ? 't-ok t-bold' : 't-fg' }, O, `${k} · ${v} kbps`);
    s('rect', { x: 150, y, width: x1 - 150, height: 26, rx: 2, class: ok ? 'f-ok' : 'f-bad-soft' }, O);
    const inside = x1 + 8 + note.length * 6.7 > 712;
    s('text', { x: inside ? x1 - 8 : x1 + 8, y: y + 13, dy: '0.35em', 'text-anchor': inside ? 'end' : 'start', class: ok ? 't-ok t-bold' : 't-fg' }, O, note);
  });
});

QV.register('s4-mc2', function (q) {
  const { s, svg, box, arrow, steps, axes, line } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: Fig. 6.15 rows plus the chosen option under the encoder
  const C = svg(viz('chain'), 840, 258, { label: 'PCM encoder and decoder rows from slide 44, with the chosen option laid under the encoder', minWidth: 640 });
  const XS = [12, 180, 348, 516, 684], BW = 144, BH = 42;
  const NAMES = {
    in: 'analog speech\nin', band: 'bandlimiting\nfilter', comp: 'μ-law / A-law\ncompressor', pcm: 'linear PCM', tx: 'transmission',
    rx: 'received\nbits', dac: 'digital-to-analog\nconverter', exp: 'μ-law / A-law\nexpander', lpf: 'low-pass\nfilter', out: 'analog speech\nout',
  };
  const ENC = ['in', 'band', 'comp', 'pcm', 'tx'], DEC = ['rx', 'dac', 'exp', 'lpf', 'out'];
  const row = (g, ids, y, clsOf, textOf) => ids.forEach((id, i) => {
    box(g, XS[i], y, BW, BH, NAMES[id], { cls: clsOf(id, i), textCls: textOf(id, i) });
    if (i) arrow(g, XS[i - 1] + BW + 2, y + BH / 2, XS[i] - 2, y + BH / 2);
  });
  const ends = id => ['in', 'rx', 'out'].includes(id);
  s('text', { x: 12, y: 16, class: 't-pri t-bold' }, C, 'Encoder (slide 44)');
  row(C, ENC, 24, id => ends(id) ? 'f-seg' : 'f-pri-soft', () => 't-fg');
  line(C, [[XS[4] + BW / 2, 66], [XS[4] + BW / 2, 80], [XS[0] + BW / 2, 80]], 's-muted');
  arrow(C, XS[0] + BW / 2, 80, XS[0] + BW / 2, 101);
  s('text', { x: 12, y: 96, class: 't-sec t-bold' }, C, 'Decoder');
  row(C, DEC, 102, id => ends(id) ? 'f-seg' : 'f-sec-soft', () => 't-fg');

  const OPTS = { d: ['band', 'comp', 'pcm', 'tx'], a: ['comp', 'band', 'pcm', 'tx'], b: ['band', 'pcm', 'exp', 'tx'], c: ['lpf', 'dac', 'exp', 'tx'] };
  const NOTES = {
    d: 'Option d matches the encoder block for block: filter the analog input, compress the amplitude, quantize with linear PCM, transmit.',
    a: 'Option a swaps the first two blocks. The bandlimiting filter acts on the analog input first; the compressor comes second.',
    b: 'Option b puts an expander after linear PCM. The expander is a decoder block that undoes the compressor at the receiver, and this chain has no compressor at all.',
    c: 'Option c uses decoder blocks only. The low-pass filter, the digital-to-analog converter and the expander all belong to the receiver.',
  };
  const keys = ['d', 'a', 'b', 'c'];
  const layer = s('g', {}, C);
  steps(viz('pick'), keys.map(k => 'Option ' + k), k => {
    layer.textContent = '';
    const key = keys[k], ids = ['in'].concat(OPTS[key]);
    s('text', { x: 12, y: 178, class: 't-fg t-bold' }, layer, 'Option ' + key);
    row(layer, ids, 186, (id, i) => id === 'in' ? 'f-seg' : (id === ENC[i] ? 'f-ok' : 'f-bad'), id => id === 'in' ? 't-fg' : 't-on');
    ids.forEach((id, i) => {
      if (id !== ENC[i]) s('text', { x: XS[i] + BW / 2, y: 246, 'text-anchor': 'middle', class: 't-bad t-sm' }, layer, DEC.includes(id) ? 'decoder block' : 'wrong slot');
    });
    role('note').textContent = NOTES[key];
  });

  // Figure 2: mu-law curve, equal output steps read back on the input axis
  const M = svg(viz('mulaw'), 600, 322, { label: 'mu-law compressor curve with 8 equal output steps mapped back to the input axis', minWidth: 480 });
  const mx = axes(M, { x: 56, y: 24, w: 510, h: 250, xd: [0, 1], yd: [0, 1], xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 0.25, 0.5, 0.75, 1], xf: v => v.toFixed(2), yf: v => v.toFixed(2), xl: 'input amplitude x (normalized)', yl: 'compressor output y' });
  const MU = 255, F = x => Math.log(1 + MU * x) / Math.log(1 + MU);
  line(M, [[mx.x(0), mx.y(0)], [mx.x(1), mx.y(1)]], 's-muted dash');
  for (let k = 1; k < 8; k++) {
    const y = k / 8, x = (Math.pow(1 + MU, y) - 1) / MU;
    s('line', { x1: mx.x(0), x2: mx.x(x), y1: mx.y(y), y2: mx.y(y), class: 's-pri', style: 'stroke-width: 1; opacity: 0.55' }, M);
    s('line', { x1: mx.x(x), x2: mx.x(x), y1: mx.y(y), y2: mx.y(0), class: 's-pri', style: 'stroke-width: 1; opacity: 0.55' }, M);
    s('circle', { cx: mx.x(x), cy: mx.y(0), r: 3, class: 'f-pri' }, M);
  }
  const pts = [];
  for (let i = 0; i <= 300; i++) { const x = Math.pow(i / 300, 3); pts.push([mx.x(x), mx.y(F(x))]); }
  line(M, pts, 's-pri');
  [['first step: x from 0 to 0.004', 0.36], ['last step: x from 0.50 to 1', 0.27], ['5 of the 8 steps lie below x = 0.12', 0.18]].forEach(([t, y]) => {
    s('text', { x: mx.x(0.55), y: mx.y(y), class: 't-fg' }, M, t);
  });
});

QV.register('s4-mc3', function (q) {
  const { s, h, svg, slider } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const N = 32, SY = ['A', 'B', 'C', 'D'];

  // Fixed random draws, so the same P always gives the same string
  let seed = 7;
  const rnd = () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const U = Array.from({ length: N }, () => [rnd(), rnd()]);
  const source = p => {
    const out = [SY[Math.floor(U[0][1] * 4)]];
    for (let i = 1; i < N; i++) {
      const prev = out[i - 1];
      out.push(U[i][0] < p ? prev : SY.filter(x => x !== prev)[Math.floor(U[i][1] * 3)]);
    }
    return out;
  };
  const runsOf = str => {
    const r = [];
    str.forEach((c, i) => { if (i && c === str[i - 1]) r[r.length - 1].n++; else r.push({ c, n: 1, at: i }); });
    return r;
  };

  const T = svg(viz('tape'), 740, 140, { label: 'Source string with its runs marked, and the lengths of the input and the RLE output', minWidth: 580 });
  const layer = s('g', {}, T);
  const X0 = 70, CW = 18, PX = 9;
  s('text', { x: 0, y: 32, dy: '0.35em', class: 't-fg t-bold' }, T, 'source');
  s('text', { x: 0, y: 90, dy: '0.35em', class: 't-fg' }, T, 'input');
  s('text', { x: 0, y: 118, dy: '0.35em', class: 't-fg' }, T, 'RLE');
  s('rect', { x: X0, y: 82, width: N * PX, height: 16, rx: 2, class: 'f-seg box' }, T);
  s('text', { x: X0 + N * PX + 8, y: 90, dy: '0.35em', class: 't-fg' }, T, N + ' symbols');

  slider(viz('slider'), { label: 'P(next symbol = previous)', min: 0.25, max: 0.95, step: 0.05, value: 0.7, fmt: v => v.toFixed(2) }, p => {
    layer.textContent = '';
    const str = source(p), runs = runsOf(str), out = 2 * runs.length, ratio = N / out;
    runs.forEach((r, j) => {
      const cls = j % 2 ? 'sec' : 'pri', x = X0 + r.at * CW;
      for (let i = 0; i < r.n; i++) {
        s('rect', { x: x + i * CW, y: 20, width: CW, height: 24, class: `f-${cls}-soft sep` }, layer);
        s('text', { x: x + i * CW + CW / 2, y: 32, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, layer, r.c);
      }
      s('rect', { x: x + 1, y: 19, width: r.n * CW - 2, height: 26, rx: 3, class: `f-none s-${cls}`, style: 'stroke-width: 1.5' }, layer);
      s('text', { x: x + r.n * CW / 2, y: 60, 'text-anchor': 'middle', class: `t-${cls} t-sm t-bold` }, layer, r.n + r.c);
    });
    s('rect', { x: X0, y: 110, width: out * PX, height: 16, rx: 2, class: ratio > 1 ? 'f-ok' : 'f-bad' }, layer);
    s('text', { x: X0 + out * PX + 8, y: 118, dy: '0.35em', class: (ratio > 1 ? 't-ok' : 't-bad') + ' t-bold' }, layer, out + ' symbols');

    role('runs').textContent = runs.length;
    role('out').textContent = out;
    role('ratio').textContent = ratio.toFixed(2);
    const avg = (N / runs.length).toFixed(1);
    role('verdict').textContent = p < 0.26
      ? `P = 0.25 is a memoryless source. It still has ${runs.length} runs in 32 symbols, so RLE writes ${out} symbols and the data gets longer.`
      : ratio < 1 ? `Short runs, ${avg} symbols on average. RLE writes ${out} symbols, more than the 32 it started with.`
        : ratio === 1 ? `Runs of exactly ${avg} symbols on average: RLE writes 32 symbols, no gain.`
          : `Runs of ${avg} symbols on average. RLE writes ${out} symbols in place of 32, a compression ratio of ${ratio.toFixed(2)}.`;
    const code = role('code');
    code.textContent = '';
    h('span', { class: 'arrow' }, code, 'RLE');
    runs.forEach(r => h('span', { class: 'out' }, code, r.n + r.c));
  });
});

QV.register('s4-mc4', function (q) {
  const { s, svg, box, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);

  // Figure 1: codec layer vs container layer
  const L = svg(viz('layers'), 840, 292, { label: 'Codecs turn video and audio into streams; the mp4 container holds the streams and the metadata', minWidth: 640 });
  s('text', { x: 10, y: 14, class: 't-muted' }, L, 'input');
  s('text', { x: 190, y: 14, class: 't-muted' }, L, 'codec: makes one stream');
  s('text', { x: 460, y: 14, class: 't-muted' }, L, 'container: holds the streams');
  box(L, 10, 30, 130, 40, 'video frames', { cls: 'f-seg' });
  box(L, 10, 145, 130, 40, 'audio samples', { cls: 'f-seg' });
  box(L, 10, 232, 130, 40, 'title, duration,\ncover image', { cls: 'f-seg' });
  box(L, 190, 30, 176, 40, 'video codec', { cls: 'f-pri-soft' });
  s('rect', { x: 184, y: 100, width: 188, height: 126, rx: 6, class: 'f-none s-muted dash', style: 'stroke-width: 1' }, L);
  s('text', { x: 190, y: 94, class: 't-sec t-sm' }, L, 'audio codec, one of:');
  [['a · AAC, pure MDCT', 108], ['c · MP3, MPEG-1 L III', 146], ['d · FLAC, lossless', 184]].forEach(([t, y]) => box(L, 190, y, 176, 34, t, { cls: 'f-sec-soft' }));
  arrow(L, 140, 50, 188, 50);
  arrow(L, 140, 165, 182, 165);
  arrow(L, 140, 252, 474, 252);
  arrow(L, 366, 50, 458, 82);
  arrow(L, 372, 163, 458, 96);

  s('rect', { x: 460, y: 24, width: 370, height: 258, rx: 8, class: 'f-none s-ok' }, L);
  s('text', { x: 476, y: 46, class: 't-ok t-bold' }, L, '.mp4 file · MPEG-4 Part 14 · option b');
  let cx = 476;
  for (let i = 0; i < 6; i++) {
    [['pri', 34, 'V'], ['sec', 22, 'A']].forEach(([cls, w, t]) => {
      s('rect', { x: cx, y: 62, width: w, height: 40, class: `f-${cls} sep` }, L);
      s('text', { x: cx + w / 2, y: 82, dy: '0.35em', 'text-anchor': 'middle', class: 't-on' }, L, t);
      cx += w;
    });
  }
  arrow(L, 476, 116, 812, 116, { label: 'file order: video and audio chunks interleaved', dy: 16 });
  s('text', { x: 476, y: 162, class: 't-fg' }, L, 'Playback can start before the whole');
  s('text', { x: 476, y: 178, class: 't-fg' }, L, 'file arrives: Internet streaming.');
  box(L, 476, 238, 338, 30, 'metadata: title, duration, ...', { cls: 'f-seg' });

  // Figure 2: where MP3, AAC and MP4 sit in the MPEG family
  const F = svg(viz('family'), 760, 182, { label: 'MPEG-1 gives MP3, MPEG-2 Part 7 gives AAC, MPEG-4 Part 3 is audio coding and MPEG-4 Part 14 is the MP4 container', minWidth: 600 });
  box(F, 10, 14, 170, 34, 'MPEG-1', { cls: 'f-seg', textCls: 't-fg t-bold' });
  box(F, 210, 14, 170, 34, 'MPEG-2', { cls: 'f-seg', textCls: 't-fg t-bold' });
  box(F, 410, 14, 340, 34, 'MPEG-4', { cls: 'f-seg', textCls: 't-fg t-bold' });
  [95, 295].forEach(x => s('path', { d: `M${x} 48 V84`, class: 's-muted' }, F));
  s('path', { d: 'M580 48 V66 H490 V84 M580 66 H670 V84', class: 's-muted' }, F);
  box(F, 10, 84, 170, 58, 'Audio Layer III\n= MP3', { cls: 'f-sec-soft' });
  box(F, 210, 84, 170, 58, 'Part 7: AAC\n1997', { cls: 'f-sec-soft' });
  box(F, 410, 84, 160, 58, 'Part 3: Audio\nAAC (from 1999),\nCELP, lossless, ...', { cls: 'f-sec-soft' });
  box(F, 590, 84, 160, 58, 'Part 14: MP4\ncontainer, .mp4', { cls: 'f-ok-soft' });
  arrow(F, 180, 113, 208, 113);
  arrow(F, 380, 113, 408, 113);
  [[95, 'codec · option c', 't-sec'], [295, 'codec · option a', 't-sec'], [490, 'audio coding tools', 't-sec'], [670, 'container · option b', 't-ok t-bold']].forEach(([x, t, c]) => {
    s('text', { x, y: 164, 'text-anchor': 'middle', class: c }, F, t);
  });
});

QV.register('s4-mc5', function (q) {
  const { s, svg, axes, slider } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const n = v => v.toLocaleString('en-US');

  // Figure 1: gray ramp with L = 2^k levels and one pixel's k-bit code
  const R = svg(viz('ramp'), 700, 168, { label: 'Gray ramp with 2 to the k levels and the k-bit code of one marked pixel', minWidth: 540 });
  const layer = s('g', {}, R);
  const X0 = 30, RW = 640;
  slider(viz('slider'), { label: 'k', min: 1, max: 8, step: 1, value: 6, fmt: v => v + (v === 1 ? ' bit' : ' bits') }, k => {
    layer.textContent = '';
    const L = 2 ** k, cw = RW / L, v = Math.round(0.7 * (L - 1));
    for (let i = 0; i < L; i++) {
      const g = QV.gray(i, L - 1);
      s('rect', { x: X0 + i * cw, y: 24, width: cw + (L > 32 ? 0.6 : 0), height: 40, class: L <= 32 ? 'sep' : null, style: g.style }, layer);
    }
    s('rect', { x: X0, y: 24, width: RW, height: 40, class: 'f-none box' }, layer);
    s('rect', { x: X0 + v * cw, y: 24, width: cw, height: 40, class: 'f-none outline-sec' }, layer);
    const xc = X0 + (v + 0.5) * cw;
    s('polygon', { points: `${xc},67 ${xc - 6},77 ${xc + 6},77`, class: 'f-sec' }, layer);
    s('text', { x: X0, y: 90, class: 't-fg' }, layer, '0');
    s('text', { x: X0, y: 104, class: 't-pri' }, layer, '0'.repeat(k));
    s('text', { x: X0 + RW, y: 90, 'text-anchor': 'end', class: 't-fg' }, layer, `L − 1 = ${L - 1}`);
    s('text', { x: X0 + RW, y: 104, 'text-anchor': 'end', class: 't-pri' }, layer, '1'.repeat(k));
    const bits = v.toString(2).padStart(k, '0'), bx = 350 - k * 17;
    s('text', { x: 350, y: 120, 'text-anchor': 'middle', class: 't-sec t-bold' }, layer, `marked pixel: value ${v} → ${k} ${k === 1 ? 'bit' : 'bits'}`);
    [...bits].forEach((b, i) => {
      s('rect', { x: bx + i * 34, y: 128, width: 34, height: 30, class: (b === '1' ? 'f-pri' : 'f-seg') + ' sep' }, layer);
      s('text', { x: bx + i * 34 + 17, y: 143, dy: '0.35em', 'text-anchor': 'middle', class: b === '1' ? 't-on t-bold' : 't-fg' }, layer, b);
    });
    role('L').textContent = n(L);
    role('k').textContent = k;
    role('b').textContent = n(512 * 512 * k);
    role('verdict').innerHTML = k === 6
      ? '<b>k = 6</b> gives exactly the 64 levels of the question: 512 × 512 × 6 = <b>1,572,864</b> bits, option a.'
      : k === 8 ? '<b>k = 8</b> gives 256 levels, the usual 8-bit image: 2,097,152 bits, option b. The question has only 64 levels.'
        : `<b>k = ${k}</b> gives ${n(L)} levels. 64 levels need k = 6.`;
  });

  // Figure 2: the four options as bars
  const O = svg(viz('options'), 720, 222, { label: 'The four options as bars on a bit scale with the product that gives each one', minWidth: 560 });
  const ax = axes(O, { x: 150, y: 8, w: 540, h: 164, xd: [0, 18e6], yd: [0, 1], xt: [0, 4e6, 8e6, 12e6, 16e6], yt: [], xf: v => v ? v / 1e6 + 'M' : '0', xl: 'bits' });
  [
    ['d', 196608, '1,572,864 ÷ 8: the answer in bytes'],
    ['a', 1572864, '262,144 × 6: k = 6'],
    ['b', 2097152, '262,144 × 8: k = 8'],
    ['c', 16777216, '262,144 × 64: L in place of k'],
  ].forEach(([k, v, note], i) => {
    const y = 18 + i * 38, ok = k === 'a', x1 = ax.x(v);
    s('text', { x: 0, y: y + 13, dy: '0.35em', class: ok ? 't-ok t-bold' : 't-fg' }, O, `${k} · ${n(v)}`);
    s('rect', { x: 150, y, width: x1 - 150, height: 26, rx: 2, class: ok ? 'f-ok' : 'f-bad-soft' }, O);
    const inside = x1 + 8 + note.length * 6.7 > 712;
    s('text', { x: inside ? x1 - 8 : x1 + 8, y: y + 13, dy: '0.35em', 'text-anchor': inside ? 'end' : 'start', class: ok ? 't-ok t-bold' : 't-fg' }, O, note);
  });
});

QV.register('s4-mc6', function (q) {
  const { s, svg, axes, plot, slider } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: CIE 1931 matching functions (multi-lobe Gaussian fit, Wyman et al. 2013)
  const g = (l, m, s1, s2) => Math.exp(-0.5 * Math.pow((l - m) / (l < m ? s1 : s2), 2));
  const xb = l => 1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2);
  const yb = l => 0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1);
  const zb = l => 1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8);
  const P = svg(viz('cmf'), 680, 296, { label: 'CIE 1931 colour matching functions x-bar, y-bar and z-bar against wavelength; y-bar peaks at 1.0 near 555 nm', minWidth: 540 });
  const ax = axes(P, { x: 50, y: 20, w: 610, h: 230, xd: [380, 780], yd: [0, 1.9], xt: [400, 450, 500, 550, 600, 650, 700, 750], yt: [0, 0.5, 1, 1.5], yf: v => v.toFixed(1), xl: 'wavelength λ (nm)', yl: 'matching function value' });
  plot(P, ax, xb, 380, 780, 400, 's-sec');
  plot(P, ax, zb, 380, 780, 400, 's-ter');
  plot(P, ax, yb, 380, 780, 400, 's-pri').setAttribute('style', 'stroke-width: 3.5');
  s('line', { x1: ax.x(555), x2: ax.x(555), y1: ax.y(0), y2: ax.y(1.24), class: 's-pri dash', style: 'stroke-width: 1' }, P);
  s('text', { x: ax.x(558), y: ax.y(1.3), class: 't-pri t-bold' }, P, 'ȳ peak: 1.0 near 555 nm');
  // Combining macrons drift in SVG text, so the bar is drawn as a line
  const barred = (x, y, ch, cls) => {
    s('text', { x, y, class: `t-${cls} t-bold t-lg` }, P, ch);
    s('line', { x1: x + 0.5, x2: x + 7.5, y1: y - 11, y2: y - 11, class: `s-${cls}`, style: 'stroke-width: 1.3' }, P);
  };
  barred(ax.x(458), ax.y(1.74), 'z', 'ter');
  barred(ax.x(628), ax.y(1.0), 'x', 'sec');
  s('text', { x: ax.x(508), y: ax.y(0.66), 'text-anchor': 'end', class: 't-pri t-bold t-lg' }, P, 'ȳ');

  // Figure 2: one light at intensity s
  const XYZ = [0.2561, 0.3933, 0.2516], LIN = [0.1, 0.5, 0.2];
  const sum = XYZ[0] + XYZ[1] + XYZ[2];
  const enc = c => Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055));
  const D = svg(viz('dim'), 620, 200, { label: 'A green light swatch and its X, Y, Z bars; all three scale with intensity', minWidth: 500 });
  const sw = s('rect', { x: 24, y: 20, width: 150, height: 150, rx: 6, class: 'box' }, D);
  s('text', { x: 99, y: 190, 'text-anchor': 'middle', class: 't-muted t-sm' }, D, 'the light at intensity s');
  const bx = axes(D, { x: 260, y: 20, w: 330, h: 150, xd: [0, 3], yd: [0, 0.4], xt: [], yt: [0, 0.1, 0.2, 0.3, 0.4], yf: v => v.toFixed(1), yl: 'tristimulus value' });
  const bars = [['X', 'sec'], ['Y', 'pri'], ['Z', 'ter']].map(([name, cls], i) => {
    const cx = bx.x(i + 0.5);
    s('rect', { x: cx - 28, y: bx.y(XYZ[i]), width: 56, height: bx.y(0) - bx.y(XYZ[i]), class: 'f-none s-muted dash', style: 'stroke-width: 1' }, D);
    s('text', { x: cx, y: 188, 'text-anchor': 'middle', class: `t-${cls} t-bold t-lg` }, D, name);
    return { cx, rect: s('rect', { x: cx - 28, width: 56, class: `f-${cls}` }, D), val: s('text', { x: cx, 'text-anchor': 'middle', class: `t-${cls} t-sm` }, D) };
  });
  slider(viz('slider'), { label: 's', min: 0.1, max: 1, step: 0.05, value: 1, fmt: v => v.toFixed(2) }, k => {
    const rgb = LIN.map(c => enc(c * k));
    sw.setAttribute('style', `fill: rgb(${rgb.join(',')})`); // data-color
    bars.forEach((b, i) => {
      const v = XYZ[i] * k;
      b.rect.setAttribute('y', bx.y(v));
      b.rect.setAttribute('height', bx.y(0) - bx.y(v));
      b.val.setAttribute('y', bx.y(v) - 6);
      b.val.textContent = v.toFixed(3);
    });
    role('Y').textContent = 'Y = ' + (XYZ[1] * k).toFixed(3);
    role('x').textContent = 'x = ' + (XYZ[0] / sum).toFixed(3);
    role('y').textContent = 'y = ' + (XYZ[1] / sum).toFixed(3);
  });
});

QV.register('s4-mc7', function (q) {
  const { s, svg, axes, grid, slider, line, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const IMG = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => 60 + 12 * c + 7 * r + ((r * 3 + c * 5) % 4) * 4));
  const flat = m => m.reduce((a, row) => a.concat(row), []);
  const clamp = v => Math.max(0, Math.min(255, v));
  const hist = vals => { const h = new Array(26).fill(0); vals.forEach(v => h[Math.floor(v / 10)]++); return h; };

  // Figure 1: patch before/after and the shifted histogram
  const H = svg(viz('hist'), 820, 256, { label: 'An 8 by 8 gray patch before and after adding a constant, and both histograms', minWidth: 640 });
  grid(H, { x: 30, y: 44, cell: 19, gap: 1, data: IMG, fill: v => QV.gray(v), text: false, title: 'original' });
  arrow(H, 194, 123, 224, 123);
  const after = s('g', {}, H);
  const ax = axes(H, { x: 450, y: 26, w: 350, h: 180, xd: [0, 260], yd: [0, 10], xt: [0, 50, 100, 150, 200, 250], yt: [0, 5, 10], xl: 'gray level (bins of 10)', yl: 'pixels' });
  const plotL = s('g', {}, H);
  const bw = ax.x(10) - ax.x(0);
  const h0 = hist(flat(IMG));
  const mean = vals => vals.reduce((a, b) => a + b, 0) / vals.length;
  const m0 = mean(flat(IMG));

  slider(viz('slider'), { label: 'a', min: -80, max: 80, step: 10, value: 40, fmt: v => (v > 0 ? '+' : '') + v }, a => {
    after.textContent = '';
    plotL.textContent = '';
    const out = IMG.map(row => row.map(v => clamp(v + a)));
    grid(after, { x: 230, y: 44, cell: 19, gap: 1, data: out, fill: v => QV.gray(v), text: false, title: `after adding ${a > 0 ? '+' : ''}${a}` });
    const vals = flat(out), h1 = hist(vals), m1 = mean(vals);
    h0.forEach((c, i) => { if (c) s('rect', { x: ax.x(i * 10), y: ax.y(c), width: bw, height: ax.y(0) - ax.y(c), class: 'f-seg' }, plotL); });
    h1.forEach((c, i) => { if (c) s('rect', { x: ax.x(i * 10), y: ax.y(c), width: bw, height: ax.y(0) - ax.y(c), class: 'f-pri sep', style: 'opacity: 0.85' }, plotL); });
    h0.forEach((c, i) => { if (c) s('rect', { x: ax.x(i * 10), y: ax.y(c), width: bw, height: ax.y(0) - ax.y(c), class: 'f-none s-muted dash', style: 'stroke-width: 1' }, plotL); });
    line(plotL, [[ax.x(m0), ax.y(0)], [ax.x(m0), ax.y(9.2)]], 's-muted dash');
    line(plotL, [[ax.x(m1), ax.y(0)], [ax.x(m1), ax.y(9.2)]], 's-pri');
    if (a) arrow(plotL, ax.x(m0), ax.y(9.6), ax.x(m1), ax.y(9.6), { cls: 'a-pri', label: (a > 0 ? '+' : '') + a, labelCls: 't-pri t-bold', dy: -5 });
    role('mean').textContent = m0.toFixed(1) + ' → ' + m1.toFixed(1);
    role('range').textContent = (Math.max(...flat(IMG)) - Math.min(...flat(IMG))) + ' → ' + (Math.max(...vals) - Math.min(...vals));
    role('clip').textContent = flat(IMG).filter(v => v + a > 255 || v + a < 0).length;
  });

  // Figure 2: transfer curves, slope = contrast
  const C = svg(viz('curves'), 560, 332, { label: 'Transfer curves s = r, s = r + 40 and s = 1.5 r with the input band 100 to 140 mapped through each', minWidth: 460 });
  const cx = axes(C, { x: 56, y: 24, w: 460, h: 260, xd: [0, 255], yd: [0, 255], xt: [0, 50, 100, 150, 200, 250], yt: [0, 50, 100, 150, 200, 250], xl: 'input level r', yl: 'output level s' });
  s('rect', { x: cx.x(100), y: cx.y(255), width: cx.x(140) - cx.x(100), height: cx.y(0) - cx.y(255), class: 'f-seg' }, C);
  s('text', { x: cx.x(120), y: cx.y(246), 'text-anchor': 'middle', class: 't-fg t-sm' }, C, 'input band');
  line(C, [[cx.x(0), cx.y(0)], [cx.x(255), cx.y(255)]], 's-muted dash');
  const curves = [
    { f: r => clamp(r + 40), cls: 'pri', off: 4 },
    { f: r => clamp(1.5 * r), cls: 'sec', off: 10 },
  ];
  curves.forEach(c => {
    const pts = [];
    for (let r = 0; r <= 255; r += 1) pts.push([cx.x(r), cx.y(c.f(r))]);
    line(C, pts, `s-${c.cls}`);
    [100, 140].forEach(r => line(C, [[cx.x(r), cx.y(c.f(r))], [cx.x(0), cx.y(c.f(r))]], `s-${c.cls} dash`).setAttribute('style', 'stroke-width: 1'));
    line(C, [[cx.x(100), cx.y(c.f(100))], [cx.x(140), cx.y(c.f(140))]], `s-${c.cls}`).setAttribute('style', 'stroke-width: 5');
    line(C, [[cx.x(0) + c.off, cx.y(c.f(100))], [cx.x(0) + c.off, cx.y(c.f(140))]], `s-${c.cls}`).setAttribute('style', 'stroke-width: 5');
  });
  s('text', { x: cx.x(58), y: cx.y(112), 'text-anchor': 'end', class: 't-pri t-bold halo' }, C, 's = r + 40');
  s('text', { x: cx.x(172), y: cx.y(255) - 7, class: 't-sec t-bold' }, C, 's = 1.5 r');
  s('text', { x: cx.x(232), y: cx.y(212), class: 't-muted halo' }, C, 's = r');
});

QV.register('s4-mc8', function (q) {
  const { s, svg, grid, arrow, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const R = 11, C = 13, HOLE = [5, 6];
  const A = Array.from({ length: R }, (_, r) => Array.from({ length: C }, (_, c) => (r >= 2 && r <= 8 && c >= 2 && c <= 10 && !(r === HOLE[0] && c === HOLE[1])) ? 1 : 0));
  const at = (M, r, c) => (r < 0 || c < 0 || r >= R || c >= C) ? 0 : M[r][c];
  const win = (M, f) => M.map((row, r) => row.map((_, c) => {
    const v = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) v.push(at(M, r + dr, c + dc));
    return f(...v);
  }));
  const erode = M => win(M, Math.min), dilate = M => win(M, Math.max);
  // Background not reachable from the image border = holes
  const holes = M => {
    const seen = M.map(row => row.map(() => false)), st = [];
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (r === 0 || c === 0 || r === R - 1 || c === C - 1) st.push([r, c]);
    while (st.length) {
      const [r, c] = st.pop();
      if (r < 0 || c < 0 || r >= R || c >= C || seen[r][c] || M[r][c]) continue;
      seen[r][c] = true;
      st.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]);
    }
    return M.map((row, r) => row.map((v, c) => (!v && !seen[r][c]) ? 1 : 0));
  };
  const fill = M => { const hl = holes(M); return M.map((row, r) => row.map((v, c) => v || hl[r][c])); };
  const count = M => M.reduce((a, row) => a + row.reduce((x, y) => x + y, 0), 0);

  const G = svg(viz('morph'), 644, 282, { label: 'Binary image A with a hole and the result of the chosen operation, changed pixels marked', minWidth: 520 });
  const P = 19, AX = 36, RX = 362, Y0 = 40;
  const gA = grid(G, { x: AX, y: Y0, cell: 18, gap: 1, data: A, fill: v => v ? 'f-pri' : 'f-seg', text: false, title: 'A' });
  s('text', { x: AX + (C * P - 1) / 2, y: Y0 + R * P + 18, 'text-anchor': 'middle', class: 't-fg' }, G, `foreground ${count(A)} · hole ${count(holes(A))}`);
  const over = s('g', {}, G), res = s('g', {}, G);
  const OPS = [
    { label: 'd · Erosion', sym: 'A ⊖ B', how: 'local min', f: erode, win: [4, 5],
      note: (n0, n1, h1) => `Erosion is a local minimum: a pixel stays 1 only if its whole 3 × 3 window is 1. The outlined window holds the hole, so its centre pixel is erased. Foreground ${n0} → ${n1} pixels, and the hole grows from 1 to ${h1} pixels. The outer boundary also loses a one-pixel layer.` },
    { label: 'a · Dilation', sym: 'A ⊕ B', how: 'local max', f: dilate, win: HOLE,
      note: (n0, n1) => `Dilation is a local maximum: a pixel becomes 1 if its window holds any 1. The outlined window around the hole holds 1s, so the hole is filled, and the block grows by one pixel on every side. Foreground ${n0} → ${n1} pixels.` },
    { label: 'b · Closing', sym: 'A • B', how: 'max, then min', f: M => erode(dilate(M)), win: null,
      note: (n0, n1) => `Closing is dilation, then erosion. The erosion takes the outline back to 7 × 9, but the hole stays filled. Foreground ${n0} → ${n1}: only the hole pixel changed.` },
    { label: 'c · Region filling', sym: 'A filled', how: 'grow from p', f: fill, win: null, seed: true,
      note: (n0, n1) => `Region filling grows from a seed point p inside the hole and stops at the boundary of A. It fills the hole and leaves the outline alone. Foreground ${n0} → ${n1}.` },
  ];
  steps(viz('pick'), OPS.map(o => o.label), k => {
    over.textContent = '';
    res.textContent = '';
    const op = OPS[k], out = op.f(A);
    if (op.win) {
      const [r, c] = op.win;
      s('rect', { x: gA.cx(c - 1) - 2.5, y: gA.cy(r - 1) - 2.5, width: 3 * P - 1 + 5, height: 3 * P - 1 + 5, class: 'f-none outline-sec' }, over);
    }
    if (op.seed) s('circle', { cx: gA.cx(HOLE[1]) + 9, cy: gA.cy(HOLE[0]) + 9, r: 4, class: 'f-sec' }, over);
    arrow(over, AX + C * P + 6, Y0 + R * P / 2, RX - 10, Y0 + R * P / 2, { label: op.how, labelCls: 't-fg t-bold', dy: -8 });
    grid(res, {
      x: RX, y: Y0, cell: 18, gap: 1, data: out, fill: v => v ? 'f-pri' : 'f-seg', title: op.sym,
      text: (v, r, c) => (A[r][c] && !v) ? '×' : (!A[r][c] && v) ? '+' : null,
      textCls: v => v ? 't-on t-bold' : 't-bad t-bold',
    });
    const n1 = count(out), h1 = count(holes(out));
    s('text', { x: RX + (C * P - 1) / 2, y: Y0 + R * P + 18, 'text-anchor': 'middle', class: 't-fg t-bold' }, res, `foreground ${n1} · hole ${h1}`);
    role('note').textContent = op.note(count(A), n1, h1);
  });
});

QV.register('s4-mc9', function (q) {
  const { s, svg, grid, steps, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const GAUSS = [[1, 2, 1], [2, 4, 2], [1, 2, 1]], LAP = [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]];
  const FLAT = [[100, 100, 100], [100, 100, 100], [100, 100, 100]];

  // Figure 1: flat window through the mask with different factors
  const F = svg(viz('flat'), 720, 200, { label: 'A flat window of value 100 multiplied by the mask weights and divided by the factor', minWidth: 560 });
  grid(F, { x: 20, y: 44, cell: 44, gap: 2, data: FLAT, fill: v => QV.gray(v), title: 'flat window' });
  s('text', { x: 176, y: 112, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, F, '×');
  s('text', { x: 352, y: 112, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-xl' }, F, '→');
  const layer = s('g', {}, F);
  const CASES = [
    { label: '÷ 16', w: GAUSS, div: 16, title: 'weights, ÷ 16',
      note: 'The weights sum to 16, so Σ w × 100 = 1600 and 1600 ÷ 16 = 100. The flat region keeps its value: option c.' },
    { label: '÷ 9', w: GAUSS, div: 9, title: 'weights, ÷ 9',
      note: 'Dividing by 9, the number of pixels in the window, gives 1600 ÷ 9 = 177.8, and the flat gray gets brighter. 9 is the right divisor only for the average mask, whose weights are all 1.' },
    { label: 'no factor', w: GAUSS, div: 1, title: 'weights, no factor',
      note: 'Without a factor the output is 1600, far above 255. The flat gray turns white.' },
    { label: 'Laplacian, sum 0', w: LAP, div: 1, title: 'Laplacian weights',
      note: 'The Laplacian weights sum to 8 − 8 = 0, so every flat region becomes 0. That is a high-pass mask, option b. A smoothing mask has to sum to 1.' },
  ];
  steps(viz('pick'), CASES.map(c => c.label), k => {
    layer.textContent = '';
    const c = CASES[k];
    grid(layer, { x: 196, y: 44, cell: 44, gap: 2, data: c.w, fill: v => v < 0 ? 'f-sec-soft' : 'f-pri-soft', title: c.title });
    const sum = c.w.reduce((a, row) => a + row.reduce((x, y) => x + y * 100, 0), 0), out = sum / c.div;
    s('text', { x: 372, y: 74, class: 't-fg' }, layer, k === 3 ? 'Σ w × 100 = 800 − 800 = 0' : `Σ w × 100 = ${sum}`);
    s('text', { x: 372, y: 102, class: 't-fg' }, layer, c.div === 1 ? 'no factor' : `÷ ${c.div}`);
    s('text', { x: 372, y: 138, class: (k === 0 ? 't-ok' : 't-bad') + ' t-bold t-xl' }, layer, '= ' + fmt(out, 1));
    const shown = Math.max(0, Math.min(255, out)), gg = QV.gray(shown);
    s('rect', { x: 566, y: 44, width: 136, height: 136, rx: 4, class: 'box', style: gg.style }, layer);
    s('text', { x: 634, y: 112, dy: '0.35em', 'text-anchor': 'middle', class: gg.text + ' t-bold' }, layer, out > 255 ? '255 (clipped)' : fmt(out, 1));
    s('text', { x: 634, y: 36, 'text-anchor': 'middle', class: 't-fg t-bold' }, layer, 'output pixel');
    role('note').textContent = c.note;
  });

  // Figure 2: outer product [1 2 1] x [1 2 1]
  const O = svg(viz('outer'), 330, 262, { label: 'The Gaussian weights as the outer product of 1 2 1 with itself; row sums 4, 8, 4, total 16', minWidth: 300 });
  const V = [1, 2, 1], X0 = 96, Y0 = 80, P = 48;
  V.forEach((v, i) => {
    s('rect', { x: X0 + i * P, y: 16, width: 44, height: 44, rx: 4, class: 'f-seg' }, O);
    s('text', { x: X0 + i * P + 22, y: 38, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, O, v);
    s('rect', { x: 24, y: Y0 + i * P, width: 44, height: 44, rx: 4, class: 'f-seg' }, O);
    s('text', { x: 46, y: Y0 + i * P + 22, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, O, v);
    s('text', { x: X0 + 3 * P + 8, y: Y0 + i * P + 22, dy: '0.35em', class: 't-fg' }, O, 'sum ' + 4 * v);
  });
  s('text', { x: 46, y: 38, dy: '0.35em', 'text-anchor': 'middle', class: 't-muted t-xl' }, O, '×');
  grid(O, { x: X0, y: Y0, cell: 44, gap: 4, round: 4, data: GAUSS, fill: v => v === 4 ? 'f-pri' : 'f-pri-soft', textCls: v => v === 4 ? 't-on t-bold' : 't-fg' });
  s('text', { x: 24, y: Y0 + 3 * P + 22, class: 't-ok t-bold' }, O, '4 + 8 + 4 = 16 = (1 + 2 + 1)²');
});

QV.register('s4-mc10', function (q) {
  const { s, svg, arrow, steps, table } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);

  // Figure 1: slide 18 flowchart, bottom to top
  const F = svg(viz('flow'), 760, 466, { label: 'Pattern recognition flowchart from sensing to decision with feature extraction highlighted and the three side inputs', minWidth: 580 });
  const BX = 230, BW = 280, BH = 44;
  const ST = [
    { name: 'post-processing', role: 'exploit context', y: 60, opt: 'd' },
    { name: 'classification', role: 'feature vector → category', y: 134 },
    { name: 'feature extraction', role: 'invariant to translation, rotation, scale', y: 208, opt: 'a', on: true },
    { name: 'segmentation and grouping', role: 'patterns well separated, no overlap', y: 282, opt: 'c' },
    { name: 'sensing', role: 'transducer: camera or microphone', y: 356, opt: 'b' },
  ];
  ST.forEach((st, i) => {
    s('rect', { x: BX, y: st.y, width: BW, height: BH, rx: 6, class: (st.on ? 'f-ok' : 'f-surface') + ' box' }, F);
    s('text', { x: BX + BW / 2, y: st.y + 16, dy: '0.35em', 'text-anchor': 'middle', class: (st.on ? 't-on' : 't-fg') + ' t-bold' }, F, st.name);
    s('text', { x: BX + BW / 2, y: st.y + 31, dy: '0.35em', 'text-anchor': 'middle', class: (st.on ? 't-on' : 't-muted') + ' t-sm' }, F, st.role);
    if (st.opt) {
      s('circle', { cx: BX - 26, cy: st.y + BH / 2, r: 12, class: st.on ? 'f-ok' : 'f-seg' }, F);
      s('text', { x: BX - 26, y: st.y + BH / 2, dy: '0.35em', 'text-anchor': 'middle', class: (st.on ? 't-on' : 't-fg') + ' t-bold' }, F, st.opt);
    }
    if (i) {
      const up = ST[i - 1];
      arrow(F, BX + 100, st.y - 2, BX + 100, up.y + BH + 2, { width: 1.8 });
      arrow(F, BX + 180, up.y + BH + 2, BX + 180, st.y - 2, { dash: true, width: 1.2 });
    }
  });
  arrow(F, BX + BW / 2, 60 - 2, BX + BW / 2, 30, { width: 1.8 });
  s('text', { x: BX + BW / 2, y: 20, 'text-anchor': 'middle', class: 't-fg t-bold' }, F, 'decision');
  arrow(F, BX + BW / 2, 430, BX + BW / 2, 356 + BH + 2, { width: 1.8 });
  s('text', { x: BX + BW / 2, y: 448, 'text-anchor': 'middle', class: 't-fg t-bold' }, F, 'input');
  const R = BX + BW;
  arrow(F, 600, 72, R + 2, 72, { cls: 'a-sec' });
  s('text', { x: 608, y: 72, dy: '0.35em', class: 't-sec' }, F, 'costs');
  s('path', { d: `M600 119 H560 M560 92 V146`, class: 's-sec', style: 'stroke-width: 1.5' }, F);
  arrow(F, 560, 92, R + 2, 92, { cls: 'a-sec' });
  arrow(F, 560, 146, R + 2, 146, { cls: 'a-sec' });
  s('text', { x: 608, y: 113, dy: '0.35em', class: 't-sec' }, F, 'adjustments');
  s('text', { x: 608, y: 127, dy: '0.35em', class: 't-sec' }, F, 'for context');
  arrow(F, 600, 166, R + 2, 166, { cls: 'a-sec' });
  s('text', { x: 608, y: 166, dy: '0.35em', class: 't-sec' }, F, 'adjustments for');
  s('text', { x: 608, y: 180, dy: '0.35em', class: 't-sec' }, F, 'missing features');

  // Figure 2: one fish under translation, rotation and scaling
  const VIEWS = [
    { name: 'original', tx: 180, ty: 112, rot: 0, sc: 1.25 },
    { name: 'moved', tx: 440, ty: 80, rot: 0, sc: 1.25 },
    { name: 'rotated 35°', tx: 180, ty: 112, rot: -35, sc: 1.25 },
    { name: 'scaled 1.4×', tx: 180, ty: 112, rot: 0, sc: 1.75 },
  ];
  const SHAPE = [];
  for (let i = 0; i < 72; i++) SHAPE.push([50 * Math.cos(i * Math.PI / 36), 18 * Math.sin(i * Math.PI / 36)]);
  SHAPE.push([-75, -18], [-75, 18], [-46, 0]);
  VIEWS.forEach(v => {
    const a = v.rot * Math.PI / 180;
    const pts = SHAPE.map(([x, y]) => [v.tx + v.sc * (x * Math.cos(a) - y * Math.sin(a)), v.ty + v.sc * (x * Math.sin(a) + y * Math.cos(a))]);
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    v.box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  });
  const fishAt = (g, v, cls, eye) => {
    const fg = s('g', { transform: `translate(${v.tx} ${v.ty}) rotate(${v.rot}) scale(${v.sc})` }, g);
    s('polygon', { points: '-46,0 -75,-18 -75,18', class: cls, 'vector-effect': 'non-scaling-stroke' }, fg);
    s('ellipse', { cx: 0, cy: 0, rx: 50, ry: 18, class: cls, 'vector-effect': 'non-scaling-stroke' }, fg);
    if (eye) s('circle', { cx: 32, cy: -5, r: 3, class: 'f-pri' }, fg);
    return fg;
  };
  const FS = svg(viz('fish'), 640, 232, { label: 'The fish in its original place, moved, rotated and scaled, with its bounding box', minWidth: 520 });
  s('rect', { x: 20, y: 8, width: 600, height: 216, rx: 6, class: 'f-bg box' }, FS);
  const layer = s('g', {}, FS);
  const r1 = v => Math.round(v);
  const rows = [
    ['centre x (px)', VIEWS.map(v => String(v.tx)), 'no'],
    ['box width (px)', VIEWS.map(v => String(r1(v.box[2] - v.box[0]))), 'no'],
    ['box height (px)', VIEWS.map(v => String(r1(v.box[3] - v.box[1]))), 'no'],
    ['length / width, own axis', VIEWS.map(v => (125 * v.sc / (36 * v.sc)).toFixed(2)), 'yes'],
    ['mean lightness', VIEWS.map(() => '5.0'), 'yes'],
  ];
  const tb = table(viz('table'), [{ text: 'feature', cls: 'l' }].concat(VIEWS.map(v => v.name), ['invariant?']),
    rows.map(([f, vals, inv]) => [{ text: f, cls: 'l' }].concat(vals, [inv])));
  tb.rows.forEach((tr, i) => { if (rows[i][2] === 'yes') tr.className = 'on'; });
  steps(viz('pick'), VIEWS.map(v => v.name), k => {
    layer.textContent = '';
    const v = VIEWS[k];
    if (k) fishAt(layer, VIEWS[0], 'f-none s-muted dash').setAttribute('style', 'opacity: 0.6');
    fishAt(layer, v, 'f-pri-soft outline-pri', true);
    const [x0, y0, x1, y1] = v.box;
    s('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, class: 'f-none s-sec dash', style: 'stroke-width: 1.2' }, layer);
    s('text', { x: x0, y: y1 + 15, class: 't-sec t-sm' }, layer, `box ${r1(x1 - x0)} × ${r1(y1 - y0)} px`);
    s('path', { d: `M${v.tx - 5} ${v.ty} H${v.tx + 5} M${v.tx} ${v.ty - 5} V${v.ty + 5}`, class: 's-fg' }, layer);
    tb.rows.forEach(tr => [...tr.children].forEach((td, j) => td.classList.toggle('hl', j === k + 1)));
  });
});

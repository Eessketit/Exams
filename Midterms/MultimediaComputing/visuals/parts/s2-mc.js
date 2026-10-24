QV.register('s2-mc1', function (q) {
  const { s, svg, axes, plot, steps, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const F = 12;
  const RATES = [48, 30, 25, 20];
  const alias = fs => Math.abs(F - Math.round(F / fs) * fs);
  const NOTES = [
    '48 kHz: 4 samples per cycle. The only sine below 24 kHz through these dots is the 12 kHz tone itself, so playback is exact.',
    '30 kHz: 2.5 samples per cycle. Still more than 2, so the dots pin down the 12 kHz tone.',
    '25 kHz: 2.08 samples per cycle, just above 2. The dots look irregular, but the only sine below 12.5 kHz through them is still the 12 kHz tone.',
    '20 kHz: 1.67 samples per cycle. A slower 8 kHz sine passes through the same dots, and playback produces that one. The false tone is aliasing.',
  ];

  // Figure 1: waveform, samples and the reconstruction through the samples
  const W = svg(viz('wave'), 860, 290, { label: '12 kHz tone, its samples and the reconstructed signal for the chosen sampling rate', minWidth: 560 });
  const ax = axes(W, { x: 56, y: 26, w: 780, h: 200, xd: [0, 0.5], yd: [-1.25, 1.25], xt: [0, 0.1, 0.2, 0.3, 0.4, 0.5], yt: [-1, 0, 1], xl: 'time (ms)', yl: 'amplitude' });
  const layer = s('g', {}, W);

  steps(viz('steps'), RATES.map((r, i) => 'abcd'[i] + ' · ' + r + ' kHz'), k => {
    layer.textContent = '';
    const fs = RATES[k], fa = alias(fs), ok = fa === F;
    plot(layer, ax, t => Math.cos(2 * Math.PI * fa * t), 0, 0.5, 600, ok ? 's-ok' : 's-bad').setAttribute('style', 'stroke-width: 3.5');
    plot(layer, ax, t => Math.cos(2 * Math.PI * F * t), 0, 0.5, 600, 's-pri').setAttribute('style', 'stroke-width: 1.25');
    for (let n = 0; n / fs <= 0.5 + 1e-9; n++) {
      const t = n / fs, v = Math.cos(2 * Math.PI * F * t);
      s('line', { x1: ax.x(t), x2: ax.x(t), y1: ax.y(0), y2: ax.y(v), class: 's-fg', style: 'stroke-width: 1; opacity: 0.45' }, layer);
      s('circle', { cx: ax.x(t), cy: ax.y(v), r: 4.5, class: 'f-fg' }, layer);
    }
    role('spc').textContent = fmt(fs / F, 2);
    role('half').textContent = fmt(fs / 2) + ' kHz';
    const out = role('out');
    out.textContent = ok ? '12 kHz' : fa + ' kHz alias';
    out.className = 'v' + (ok ? ' ok' : '');
    role('note').textContent = NOTES[k];
  }, 3);

  // Figure 2: the band kept by playback and the spectral copies of the tone
  const G = svg(viz('fold'), 860, 284, { label: 'For each sampling rate: kept band 0 to fs/2, the 12 kHz tone and its copies at fs minus 12 and fs plus 12', minWidth: 560 });
  const X = QV.scale(0, 50, 150, 620);
  const R = { y0: 40, dy: 50, h: 30 };
  s('text', { x: X(F), y: 24, 'text-anchor': 'middle', class: 't-pri t-bold' }, G, '12 kHz tone');
  RATES.forEach((fs, i) => {
    const y = R.y0 + i * R.dy, half = fs / 2, inBand = F < half;
    s('text', { x: 6, y: y + R.h / 2, dy: '0.35em', class: 't-fg t-bold' }, G, 'abcd'[i] + ' · fₛ = ' + fs + ' kHz');
    s('rect', { x: X(0), y, width: X(half) - X(0), height: R.h, class: 'area-pri' }, G);
    s('line', { x1: X(half), x2: X(half), y1: y - 3, y2: y + R.h + 3, class: 's-pri dash', style: 'stroke-width: 1' }, G);
    s('line', { x1: X(0), x2: X(50), y1: y + R.h, y2: y + R.h, class: 'l-axis' }, G);
    [fs - F, fs + F].filter(c => c <= 50).forEach(c => {
      s('line', { x1: X(c), x2: X(c), y1: y + 2, y2: y + R.h, class: c < half ? 's-bad' : 's-sec', style: 'stroke-width: 3' }, G);
    });
    s('line', { x1: X(F), x2: X(F), y1: y + 2, y2: y + R.h, class: inBand ? 's-pri' : 's-pri dash', style: 'stroke-width: 3' }, G);
    s('text', { x: 640, y: y + 9, class: 't-fg' }, G, 'band 0 to ' + fmt(half) + ' kHz');
    s('text', { x: 640, y: y + 25, class: inBand ? 't-ok t-bold' : 't-bad t-bold' }, G,
      inBand ? 'tone kept, copy ' + (fs - F) + ' kHz outside' : 'tone lost, copy ' + (fs - F) + ' kHz inside');
  });
  const base = R.y0 + 3 * R.dy + R.h + 12;
  s('line', { x1: X(0), x2: X(50), y1: base, y2: base, class: 'l-axis' }, G);
  [0, 10, 20, 30, 40, 50].forEach(v => {
    s('line', { x1: X(v), x2: X(v), y1: base, y2: base + 5, class: 'l-axis' }, G);
    s('text', { x: X(v), y: base + 18, 'text-anchor': 'middle' }, G, String(v));
  });
  s('text', { x: X(25), y: base + 36, 'text-anchor': 'middle' }, G, 'frequency (kHz)');
});

QV.register('s2-mc2', function (q) {
  const { s, svg, steps, slider, grid } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const TYPES = [
    ['Note off', 8, 'key number 60', 60, 'velocity 64', 64],
    ['Note on', 9, 'key number 60', 60, 'velocity 100', 100],
    ['Key pressure', 10, 'key number 60', 60, 'amount 50', 50],
    ['Control change', 11, 'controller 7', 7, 'value 100', 100],
    ['Program change', 12, 'program 5', 5, null, null],
    ['Channel pressure', 13, 'pressure 50', 50, null, null],
    ['Pitch bend', 14, 'MSB 64', 64, 'LSB 0', 0],
  ];
  const st = { t: 1, ch: 3 };
  const bits = (v, n) => v.toString(2).padStart(n, '0');
  const hex = v => v.toString(16).toUpperCase();

  // Figure 1: the status byte and the data bytes
  const B = svg(viz('byte'), 760, 256, { label: 'Status byte 1ttt nnnn with flag, message and channel fields, followed by data bytes 0ddddddd', minWidth: 560 });
  const L = { x0: 40, y: 52, cw: 58, h: 56 };
  s('text', { x: L.x0, y: 20, class: 't-fg t-bold' }, B, 'status byte');
  for (let i = 0; i < 8; i++) s('text', { x: L.x0 + i * L.cw + L.cw / 2, y: L.y - 8, 'text-anchor': 'middle', class: 't-sm' }, B, 'bit ' + (7 - i));
  const fields = [[0, 1, 's-ter', 't-ter', 'flag'], [1, 4, 's-sec', 't-sec', 'message ttt'], [4, 8, 's-pri', 't-pri', 'channel nnnn']];
  fields.forEach(([a, b, sc, tc, name]) => {
    const x1 = L.x0 + a * L.cw + 4, x2 = L.x0 + b * L.cw - 4, yb = L.y + L.h + 10;
    QV.line(B, [[x1, yb - 5], [x1, yb], [x2, yb], [x2, yb - 5]], sc).setAttribute('style', 'stroke-width: 1.5');
    s('text', { x: (x1 + x2) / 2, y: yb + 16, 'text-anchor': 'middle', class: tc + ' t-bold' }, B, name);
  });
  const layer = s('g', {}, B);

  // Figure 2: map of all channel-message status bytes
  const M = svg(viz('map'), 690, 306, { label: 'Status bytes 80 to EF hex: rows are message types, columns are the 16 channels', minWidth: 560 });
  const map = grid(M, {
    x: 166, y: 52, cell: 30, gap: 2, data: TYPES.map(t => Array.from({ length: 16 }, (_, c) => t[1] * 16 + c)),
    fill: () => 'f-seg', text: v => hex(v), textCls: () => 't-fg',
    rowLabels: TYPES.map(t => '&H' + hex(t[1]) + 'n ' + t[0]), colLabels: Array.from({ length: 16 }, (_, c) => String(c)),
    title: 'channel n = the four low-order bits (0 to 15)',
  });
  s('text', { x: 166, y: 52 + 7 * 32 + 18, class: 't-sm' }, M, 'Each row: three message bits ttt. Each column: four channel bits nnnn.');

  function dataByte(x, y, val, label) {
    s('text', { x, y: y - 8, class: 't-fg' }, layer, label);
    for (let i = 0; i < 8; i++) {
      const has = val != null;
      const b = has ? bits(val, 8)[i] : '';
      s('rect', { x: x + i * 26, y, width: 26, height: 28, class: (!has ? 'f-surface' : i === 0 ? 'f-ter-soft' : 'f-seg') + ' box', style: has ? null : 'stroke-dasharray: 3 3' }, layer);
      if (has) s('text', { x: x + i * 26 + 13, y: y + 14, dy: '0.35em', 'text-anchor': 'middle', class: i === 0 ? 't-ter t-bold' : 't-fg' }, layer, b);
    }
    if (val == null) s('text', { x: x + 104, y: y + 14, dy: '0.35em', 'text-anchor': 'middle', class: 't-muted' }, layer, 'no second data byte');
  }

  function draw() {
    layer.textContent = '';
    const t = TYPES[st.t], status = t[1] * 16 + st.ch, b = bits(status, 8);
    for (let i = 0; i < 8; i++) {
      const cls = i === 0 ? 'f-ter' : i < 4 ? 'f-sec' : 'f-pri';
      s('rect', { x: L.x0 + i * L.cw, y: L.y, width: L.cw, height: L.h, class: cls + ' sep' }, layer);
      s('text', { x: L.x0 + i * L.cw + L.cw / 2, y: L.y + L.h / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-xl t-bold' }, layer, b[i]);
    }
    const yb = L.y + L.h + 42;
    s('text', { x: L.x0 + L.cw / 2, y: yb, 'text-anchor': 'middle', class: 't-sm' }, layer, 'always 1');
    s('text', { x: L.x0 + 2.5 * L.cw, y: yb, 'text-anchor': 'middle', class: 't-sm' }, layer, b.slice(1, 4) + ' = ' + t[0]);
    s('text', { x: L.x0 + 6 * L.cw, y: yb, 'text-anchor': 'middle', class: 't-sm' }, layer, b.slice(4) + ' = channel ' + st.ch);
    const rx = 540;
    s('text', { x: rx, y: L.y + 18, class: 't-fg t-xl t-bold' }, layer, '&H' + hex(status));
    s('text', { x: rx, y: L.y + 40, class: 't-muted' }, layer, '= ' + status + ' decimal');
    s('text', { x: rx, y: L.y + 58, class: 't-sec' }, layer, 'first digit ' + hex(t[1]) + ': ' + t[0]);
    s('text', { x: rx, y: L.y + 76, class: 't-pri' }, layer, 'second digit ' + hex(st.ch) + ': channel ' + st.ch);
    dataByte(L.x0, 198, t[3], 'data byte 1: ' + t[2]);
    dataByte(L.x0 + 260, 198, t[5], t[4] ? 'data byte 2: ' + t[4] : 'data byte 2');
    s('text', { x: rx, y: 212, class: 't-sm' }, layer, 'data byte = 0ddddddd');
    s('text', { x: rx, y: 226, class: 't-sm' }, layer, '7 bits: values 0 to 127');
    map.rects.forEach((row, r) => row.forEach((rect, c) => {
      const on = r === st.t && c === st.ch, rowOn = r === st.t, colOn = c === st.ch;
      rect.setAttribute('class', (on ? 'f-pri' : rowOn ? 'f-sec-soft' : colOn ? 'f-pri-soft' : 'f-seg') + ' sep');
      map.texts[r][c].setAttribute('class', on ? 't-on t-bold' : 't-fg');
    }));
  }

  steps(viz('type'), TYPES.map(t => t[0]), k => { st.t = k; draw(); }, 1);
  slider(viz('chan'), { label: 'channel n', min: 0, max: 15, step: 1, value: 3, fmt: v => v + ' = ' + bits(v, 4) }, v => { st.ch = v; draw(); });
});

QV.register('s2-mc3', function (q) {
  const { s, svg, axes, plot, slider } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const SUB = '₁₂₃₄₅₆₇₈';
  const H = p => {
    const r = (1 - p) / 7;
    return [p, r, r, r, r, r, r, r].reduce((h, x) => (x > 0 ? h - x * Math.log2(x) : h), 0);
  };

  // Figure 1: the 8 probabilities and the entropy curve
  const M = svg(viz('main'), 820, 280, { label: 'Probabilities of 8 symbols and the entropy as a function of p(s1), maximum 3 bits at p = 1/8', minWidth: 560 });
  const bx = axes(M, { x: 48, y: 26, w: 320, h: 200, xd: [0, 8], yd: [0, 1], yt: [0, 0.25, 0.5, 0.75, 1], yf: v => v.toFixed(2), xl: 'symbol', yl: 'probability' });
  for (let i = 0; i < 8; i++) s('text', { x: bx.x(i + 0.5), y: 244, 'text-anchor': 'middle' }, M, 's' + SUB[i]);
  const hx = axes(M, { x: 470, y: 26, w: 330, h: 200, xd: [0, 1], yd: [0, 3.3], xt: [0, 0.125, 0.25, 0.5, 0.75, 1], yt: [0, 1, 2, 3], xf: v => (v === 0.125 ? '1/8' : QV.fmt(v)), xl: 'p = probability of s₁', yl: 'entropy η (bits/symbol)' });
  QV.line(M, [[hx.x(0), hx.y(3)], [hx.x(1), hx.y(3)]], 's-ok dash').setAttribute('style', 'stroke-width: 1.5');
  s('text', { x: hx.x(1), y: hx.y(3) - 7, 'text-anchor': 'end', class: 't-ok t-bold' }, M, 'maximum log₂ 8 = 3');
  plot(M, hx, H, 0, 1, 400, 's-pri');
  const bars = s('g', {}, M);
  const guide = s('line', { y1: hx.y(0), y2: hx.y(3.3), class: 's-fg dash', style: 'stroke-width: 1; opacity: 0.45' }, M);
  const dot = s('circle', { r: 5.5, class: 'f-pri' }, M);

  slider(viz('slider'), { label: 'p(s₁)', min: 0, max: 1, step: 0.005, value: 0.125, fmt: v => v.toFixed(3) }, p => {
    const r = (1 - p) / 7, h = H(p);
    bars.textContent = '';
    [p, r, r, r, r, r, r, r].forEach((v, i) => {
      const x = bx.x(i + 0.15), w = bx.x(0.7) - bx.x(0);
      s('rect', { x, y: bx.y(v), width: w, height: bx.y(0) - bx.y(v), class: i === 0 ? 'f-sec' : 'f-pri' }, bars);
    });
    s('text', { x: bx.x(0.5), y: bx.y(p) - 6, 'text-anchor': 'middle', class: 't-sec t-bold' }, bars, p.toFixed(3));
    s('text', { x: bx.x(4.5), y: bx.y(r) - 6, 'text-anchor': 'middle', class: 't-pri t-bold' }, bars, 'each ' + r.toFixed(3));
    guide.setAttribute('x1', hx.x(p)); guide.setAttribute('x2', hx.x(p));
    dot.setAttribute('cx', hx.x(p)); dot.setAttribute('cy', hx.y(h));
    role('h').textContent = h.toFixed(3);
    role('i1').textContent = p > 0 ? (-Math.log2(p)).toFixed(3) : '∞';
    role('q').textContent = r.toFixed(3);
  });

  // Figure 2: log2 N for N = 2 .. 256
  const G = svg(viz('logn'), 700, 270, { label: 'Maximum entropy log2 N for N = 2 to 256 equally likely symbols', minWidth: 520 });
  const ax = axes(G, { x: 56, y: 30, w: 620, h: 180, xd: [0, 8], yd: [0, 8], yt: [0, 2, 4, 6, 8], xl: 'number of equally likely symbols N', yl: 'maximum entropy log₂ N (bits/symbol)' });
  const TAG = { 0: 'd: 1 bit', 2: 'c: 3 bits', 7: 'b: 8 bits' };
  for (let i = 0; i < 8; i++) {
    const n = 2 ** (i + 1), bitsN = i + 1;
    s('rect', { x: ax.x(i + 0.18), y: ax.y(bitsN), width: ax.x(0.64) - ax.x(0), height: ax.y(0) - ax.y(bitsN), class: i === 2 ? 'f-ok' : 'f-pri' }, G);
    s('text', { x: ax.x(i + 0.5), y: ax.y(bitsN) + 13, 'text-anchor': 'middle', class: 't-on t-bold' }, G, String(bitsN));
    s('text', { x: ax.x(i + 0.5), y: ax.y(0) + 18, 'text-anchor': 'middle' }, G, String(n));
    if (TAG[i]) s('text', { x: ax.x(i + 0.5), y: ax.y(bitsN) - 7, 'text-anchor': 'middle', class: i === 2 ? 't-ok t-bold' : 't-muted' }, G, TAG[i]);
  }
});

QV.register('s2-mc4', function (q) {
  const { s, svg, axes, slider } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const bark = f => 13 * Math.atan(0.00076 * f) + 3.5 * Math.atan((f / 7500) ** 2);
  const tq = f => { const k = f / 1000; return 3.64 * k ** -0.8 - 6.5 * Math.exp(-0.6 * (k - 3.3) ** 2) + 1e-3 * k ** 4; };
  const FM = 1000, ZM = bark(FM), PL = 20, F0 = 100, F1 = 12000;
  const mask = (f, L) => {
    const dz = bark(f) - ZM;
    return dz < 0 ? L - 10 + 27 * dz : L - 10 - (24 + 230 / FM - 0.2 * L) * dz;
  };
  const PROBES = [600, 1600, 6000];
  const FREQS = Array.from({ length: 501 }, (_, i) => F0 * Math.pow(F1 / F0, i / 500));
  const hz = f => (f < 1000 ? Math.round(f / 10) * 10 + ' Hz' : QV.fmt(f / 1000, 1) + ' kHz');

  const M = svg(viz('main'), 820, 324, { label: 'Threshold in quiet, the masking curve of a 1 kHz masker, and three 20 dB test tones', minWidth: 560 });
  const ax = axes(M, { x: 56, y: 28, w: 740, h: 230, xd: [bark(F0), bark(F1)], yd: [-10, 90], yt: [0, 20, 40, 60, 80], xt: [], yl: 'sound level (dB)' });
  s('text', { x: 56 + 370, y: 28 + 230 + 54, 'text-anchor': 'middle' }, M, 'frequency (Hz), spaced by critical band (Bark)');
  const fx = f => ax.x(bark(f));
  [[100, '100'], [200, '200'], [500, '500'], [1000, '1k'], [2000, '2k'], [5000, '5k'], [10000, '10k']].forEach(([f, l]) => {
    s('line', { x1: fx(f), x2: fx(f), y1: ax.y(-10), y2: ax.y(-10) + 5, class: 'l-axis' }, M);
    s('text', { x: fx(f), y: ax.y(-10) + 18, 'text-anchor': 'middle' }, M, l);
  });
  const area = s('path', { class: 'area-pri' }, M);
  QV.line(M, FREQS.map(f => [fx(f), ax.y(tq(f))]), 's-muted dash');
  s('text', { x: fx(F0) + 6, y: ax.y(tq(F0)) - 10, class: 't-muted halo' }, M, 'threshold in quiet');
  const layer = s('g', {}, M);

  slider(viz('slider'), { label: 'masker level L', min: 40, max: 80, step: 10, value: 70, fmt: v => v + ' dB' }, L => {
    layer.textContent = '';
    const on = FREQS.filter(f => mask(f, L) > tq(f));
    const top = on.map(f => [fx(f), ax.y(mask(f, L))]);
    const bot = on.slice().reverse().map(f => [fx(f), ax.y(tq(f))]);
    area.setAttribute('d', !on.length ? '' : top.concat(bot).map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + ' Z');
    QV.line(layer, top, 's-pri');
    s('line', { x1: fx(FM), x2: fx(FM), y1: ax.y(-10), y2: ax.y(L), class: 's-pri', style: 'stroke-width: 3' }, layer);
    s('circle', { cx: fx(FM), cy: ax.y(L), r: 5.5, class: 'f-pri' }, layer);
    s('text', { x: fx(FM) + 10, y: ax.y(L) - 4, class: 't-pri t-bold halo' }, layer, 'masker 1 kHz, ' + L + ' dB');
    PROBES.forEach((f, i) => {
      const thr = Math.max(tq(f), mask(f, L)), masked = PL < thr;
      s('line', { x1: fx(f), x2: fx(f), y1: ax.y(-10), y2: ax.y(PL), class: masked ? 's-muted' : 's-sec', style: 'stroke-width: 2.5' }, layer);
      s('circle', { cx: fx(f), cy: ax.y(PL), r: 6, class: masked ? 'f-muted' : 'f-sec' }, layer);
      if (masked) s('circle', { cx: fx(f), cy: ax.y(PL), r: 3.5, class: 'f-surface' }, layer);
      s('text', { x: fx(f), y: ax.y(-10) + 36, 'text-anchor': 'middle', class: (masked ? 't-muted' : 't-sec') + ' t-bold' }, layer, hz(f) + ': ' + (masked ? 'masked' : 'audible'));
      const v = role('p' + i);
      v.textContent = masked ? 'masked' : 'audible';
      v.className = 'v' + (masked ? '' : ' sec');
      role('p' + i + 's').textContent = 'threshold ' + Math.round(thr) + ' dB ' + (masked ? '>' : '<') + ' tone ' + PL + ' dB';
    });
    role('range').textContent = on.length ? hz(on[0]) + ' to ' + hz(on[on.length - 1]) : 'none';
  });
});

QV.register('s2-mc5', function (q) {
  const { s, svg, grid, steps, slider, fmt } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: footprint of each method around P = (2.3, 2.6)
  const P = { x: 2.3, y: 2.6 };
  const F = svg(viz('foot'), 640, 340, { label: 'Original pixel grid with the new pixel P and the pixels each interpolation method reads', minWidth: 520 });
  const C = { x0: 70, y0: 50, cell: 44 };
  grid(F, { x: C.x0, y: C.y0, cell: C.cell, data: Array.from({ length: 6 }, () => [0, 0, 0, 0, 0, 0]), fill: () => 'f-seg', text: false, rowLabels: ['0', '1', '2', '3', '4', '5'], colLabels: ['0', '1', '2', '3', '4', '5'] });
  s('text', { x: C.x0 + 6 * C.cell + 8, y: C.y0 - 6, class: 't-sm t-bold' }, F, 'x');
  s('text', { x: C.x0 - 6, y: C.y0 + 6 * C.cell + 16, 'text-anchor': 'end', class: 't-sm t-bold' }, F, 'y');
  const px = x => C.x0 + (x + 0.5) * C.cell, py = y => C.y0 + (y + 0.5) * C.cell;
  const layer = s('g', {}, F);
  const METHODS = [
    { name: 'Nearest neighbour', n: 1, block: '1 pixel, the closest', xs: [2], ys: [3], notes: ['fast and simple', 'loss of sharpness', 'artifacts (checkerboard)'] },
    { name: 'Bilinear', n: 4, block: '2 × 2 block', xs: [2, 3], ys: [2, 3], notes: ['linear along x on 2 rows,', 'then linear along y', 'weights = areas (Figure 2)'] },
    { name: 'Bicubic', n: 16, block: '4 × 4 block', xs: [1, 2, 3, 4], ys: [1, 2, 3, 4], notes: ['images are sharpest', 'fine details are preserved', 'slow'] },
  ];
  steps(viz('steps'), METHODS.map(m => m.name + ' · ' + m.n), k => {
    layer.textContent = '';
    const m = METHODS[k];
    m.ys.forEach(y => m.xs.forEach(x => s('rect', { x: C.x0 + x * C.cell, y: C.y0 + y * C.cell, width: C.cell, height: C.cell, class: 'f-pri-soft sep' }, layer)));
    m.ys.forEach(y => m.xs.forEach(x => s('line', { x1: px(P.x), y1: py(P.y), x2: px(x), y2: py(y), class: 's-pri', style: 'stroke-width: 1.25; opacity: 0.7' }, layer)));
    for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) {
      const on = m.xs.includes(x) && m.ys.includes(y);
      s('circle', { cx: px(x), cy: py(y), r: on ? 5 : 3, class: on ? 'f-pri' : 'f-muted' }, layer);
    }
    s('circle', { cx: px(P.x), cy: py(P.y), r: 6.5, class: 'f-sec' }, layer);
    s('text', { x: px(P.x) + 10, y: py(P.y) + 4, class: 't-sec t-bold halo' }, layer, 'P');
    const rx = 380;
    s('text', { x: rx, y: 76, class: 't-fg t-lg t-bold' }, layer, m.name);
    s('text', { x: rx, y: 118, class: 't-pri t-xl t-bold' }, layer, m.n + (m.n === 1 ? ' pixel' : ' pixels'));
    s('text', { x: rx, y: 140, class: 't-pri' }, layer, m.block);
    m.notes.forEach((t, i) => s('text', { x: rx, y: 184 + i * 20, class: 't-muted' }, layer, t));
  }, 1);

  // Figure 2: bilinear weights as areas, corner values from the Lecture 6 notes
  const V = { f00: 10, f10: 20, f01: 30, f11: 60 };
  const Q = svg(viz('square'), 640, 300, { label: 'Unit square between four pixels split by P into four rectangles whose areas are the bilinear weights', minWidth: 520 });
  const S = { x0: 100, y0: 40, d: 210 };
  const corners = [
    { k: 'f₀₀', v: V.f00, x: 0, y: 0, fill: 'f-pri', soft: 'f-pri-soft', t: 't-pri', w: (a, b) => (1 - a) * (1 - b), wt: '(1−a)(1−b)' },
    { k: 'f₁₀', v: V.f10, x: 1, y: 0, fill: 'f-sec', soft: 'f-sec-soft', t: 't-sec', w: (a, b) => a * (1 - b), wt: 'a(1−b)' },
    { k: 'f₀₁', v: V.f01, x: 0, y: 1, fill: 'f-ter', soft: 'f-ter-soft', t: 't-ter', w: (a, b) => (1 - a) * b, wt: '(1−a)b' },
    { k: 'f₁₁', v: V.f11, x: 1, y: 1, fill: 'f-ok', soft: 'f-ok-soft', t: 't-ok', w: (a, b) => a * b, wt: 'ab' },
  ];
  const sq = s('g', {}, Q);
  const st = { a: 0.3, b: 0.6 };
  function draw() {
    sq.textContent = '';
    const { a, b } = st, X = S.x0 + a * S.d, Y = S.y0 + b * S.d;
    const val = corners.reduce((acc, c) => acc + c.w(a, b) * c.v, 0);
    corners.forEach(c => {
      const x1 = c.x ? S.x0 : X, x2 = c.x ? X : S.x0 + S.d, y1 = c.y ? S.y0 : Y, y2 = c.y ? Y : S.y0 + S.d;
      s('rect', { x: x1, y: y1, width: x2 - x1, height: y2 - y1, class: c.soft }, sq);
      if (x2 - x1 >= 40 && y2 - y1 >= 22) s('text', { x: (x1 + x2) / 2, y: (y1 + y2) / 2, dy: '0.35em', 'text-anchor': 'middle', class: c.t + ' t-bold' }, sq, c.w(a, b).toFixed(2));
    });
    s('rect', { x: S.x0, y: S.y0, width: S.d, height: S.d, class: 'f-none s-fg' }, sq);
    s('line', { x1: X, x2: X, y1: S.y0, y2: S.y0 + S.d, class: 's-fg dash', style: 'stroke-width: 1' }, sq);
    s('line', { x1: S.x0, x2: S.x0 + S.d, y1: Y, y2: Y, class: 's-fg dash', style: 'stroke-width: 1' }, sq);
    corners.forEach(c => {
      const cx = S.x0 + c.x * S.d, cy = S.y0 + c.y * S.d;
      s('circle', { cx, cy, r: 7, class: c.fill }, sq);
      s('text', { x: c.x ? cx + 12 : cx - 12, y: cy, dy: '0.35em', 'text-anchor': c.x ? 'start' : 'end', class: c.t + ' t-bold' }, sq, c.k + ' = ' + c.v);
    });
    s('circle', { cx: X, cy: Y, r: 5.5, class: 'f-fg' }, sq);
    s('text', { x: X + 8, y: Y - 8, class: 't-fg t-bold halo' }, sq, 'P');
    const rx = 400;
    s('text', { x: rx, y: 52, class: 't-fg t-bold' }, sq, 'weight = opposite area');
    corners.forEach((c, i) => s('text', { x: rx, y: 80 + i * 24, class: c.t }, sq, c.k + '  ' + c.wt.padEnd(10) + ' = ' + c.w(a, b).toFixed(2)));
    s('text', { x: rx, y: 186, class: 't-fg' }, sq, 'sum of weights = 1');
    s('text', { x: rx, y: 214, class: 't-fg' }, sq, 'P = Σ weight × value');
    s('text', { x: rx, y: 244, class: 't-ok t-lg t-bold' }, sq, '= ' + fmt(val, 2));
    role('bil').textContent = fmt(val, 2);
    const nc = corners.find(c => c.x === Math.round(a) && c.y === Math.round(b));
    role('nn').textContent = String(nc.v);
    role('nns').textContent = 'copies the closest corner, ' + nc.k;
    const top = V.f00 + a * (V.f10 - V.f00), bottom = V.f01 + a * (V.f11 - V.f01);
    role('calc').textContent =
      'top row     f₀₀ + a(f₁₀ − f₀₀) = 10 + ' + fmt(a, 2) + ' × 10 = ' + fmt(top, 2) + '\n' +
      'bottom row  f₀₁ + a(f₁₁ − f₀₁) = 30 + ' + fmt(a, 2) + ' × 30 = ' + fmt(bottom, 2) + '\n' +
      'down        top + b(bottom − top) = ' + fmt(top, 2) + ' + ' + fmt(b, 2) + ' × ' + fmt(bottom - top, 2) + ' = ' + fmt(val, 2);
  }
  slider(viz('sa'), { label: 'a (across)', min: 0, max: 1, step: 0.05, value: 0.3, fmt: v => v.toFixed(2) }, v => { st.a = v; draw(); });
  slider(viz('sb'), { label: 'b (down)', min: 0, max: 1, step: 0.05, value: 0.6, fmt: v => v.toFixed(2) }, v => { st.b = v; draw(); });
});

QV.register('s2-mc6', function (q) {
  const { s, svg, grid, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const A = [[0, 1, 1], [0, 1, 0], [0, 0, 1]];
  const LBL = ['0', '1', '2'];

  // Figure 1: links under 8-adjacency and m-adjacency
  const M = svg(viz('main'), 660, 296, { label: 'Slide example under 8-adjacency with a redundant diagonal and under m-adjacency with the diagonal dropped', minWidth: 520 });
  const cell = 60;
  function panel(x0, title, mode) {
    s('text', { x: x0, y: 22, class: 't-fg t-lg t-bold' }, M, title);
    const g = grid(M, { x: x0, y: 58, cell, data: A, fill: v => (v ? 'f-pri' : 'f-seg'), text: false, rowLabels: LBL, colLabels: LBL });
    A.forEach((row, r) => row.forEach((v, c) => s('text', { x: g.cx(c) + 7, y: g.cy(r) + 15, class: (v ? 't-on' : 't-muted') + ' t-sm' }, M, String(v))));
    const ctr = ([r, c]) => [g.cx(c) + cell / 2, g.cy(r) + cell / 2];
    const link = (p, qq, cls) => {
      const [x1, y1] = ctr(p), [x2, y2] = ctr(qq);
      s('line', { x1, y1, x2, y2, class: 'sep', style: 'stroke-width: 9; stroke-linecap: round' }, M);
      s('line', { x1, y1, x2, y2, class: cls, style: 'stroke-width: 3.5' }, M);
    };
    link([0, 1], [0, 2], 's-fg');
    link([0, 1], [1, 1], 's-fg');
    link([1, 1], [2, 2], 's-fg');
    link([0, 2], [1, 1], mode === 8 ? 's-sec' : 's-bad dash');
    [[0, 1], [0, 2], [1, 1], [2, 2]].forEach(p => {
      const [x, y] = ctr(p);
      s('circle', { cx: x, cy: y, r: 7, class: 'f-surface' }, M);
      s('circle', { cx: x, cy: y, r: 4, class: 'f-fg' }, M);
    });
    const yb = 58 + 3 * cell + 26;
    if (mode === 8) {
      s('text', { x: x0, y: yb, class: 't-sec t-bold' }, M, '(0,2) to (1,1): 2 paths');
      s('text', { x: x0, y: yb + 18, class: 't-muted' }, M, 'direct, and via (0,1)');
    } else {
      s('text', { x: x0, y: yb, class: 't-ok t-bold' }, M, '(0,2) to (1,1): 1 path, via (0,1)');
      s('text', { x: x0, y: yb + 18, class: 't-bad' }, M, 'dashed diagonal dropped');
    }
  }
  panel(60, '8-adjacency', 8);
  panel(390, 'm-adjacency', 'm');

  // Figure 2: the m-adjacency test for one pair
  const T = svg(viz('test'), 660, 270, { label: 'm-adjacency test for the chosen pair: p, q and their common 4-neighbours', minWidth: 520 });
  const g = grid(T, { x: 60, y: 50, cell, data: A, fill: v => (v ? 'f-pri' : 'f-seg'), text: v => String(v), textCls: v => (v ? 't-on' : 't-muted'), rowLabels: LBL, colLabels: LBL });
  s('text', { x: 60, y: 22, class: 't-muted' }, T, 'V = {1}, (row, col)');
  const layer = s('g', {}, T);
  const PAIRS = [
    { p: [0, 2], q: [1, 1], common: [[0, 1], [1, 2]], lines: ['values 1 and 1: both in V', 'q ∈ N_D(p): diagonal neighbours', 'N₄(p) ∩ N₄(q) = {(0,1), (1,2)}', '(0,1) = 1 is in V'], verdict: 'not m-adjacent (8-adjacent: yes)', ok: false },
    { p: [1, 1], q: [2, 2], common: [[1, 2], [2, 1]], lines: ['values 1 and 1: both in V', 'q ∈ N_D(p): diagonal neighbours', 'N₄(p) ∩ N₄(q) = {(1,2), (2,1)}', 'both are 0: none in V'], verdict: 'm-adjacent', ok: true },
    { p: [0, 1], q: [1, 1], common: [], lines: ['values 1 and 1: both in V', 'q ∈ N₄(p): 4-neighbours', 'rule 1 applies, no further test', ''], verdict: 'm-adjacent (also 4- and 8-adjacent)', ok: true },
    { p: [1, 1], q: [1, 2], common: [], lines: ['values 1 and 0', '0 is not in V', 'every adjacency needs both in V', '(option b would need this link)'], verdict: 'not adjacent at all', ok: false },
  ];
  const name = ([r, c]) => '(' + r + ',' + c + ')';
  const rich = (g, attrs, str) => {
    const t = s('text', attrs, g);
    str.split('_D').forEach((part, i) => {
      if (i) s('tspan', { dy: 3, style: 'font-size: 8px' }, t, 'D');
      s('tspan', i ? { dy: -3 } : {}, t, part);
    });
    return t;
  };
  steps(viz('steps'), PAIRS.map(pp => name(pp.p) + '–' + name(pp.q)), k => {
    layer.textContent = '';
    const pp = PAIRS[k];
    pp.common.forEach(([r, c]) => s('rect', { x: g.cx(c) + 5, y: g.cy(r) + 5, width: cell - 10, height: cell - 10, rx: 3, class: 's-ter dash', style: 'stroke-width: 3' }, layer));
    [[pp.p, 'p'], [pp.q, 'q']].forEach(([[r, c], l]) => {
      s('rect', { x: g.cx(c) + 2, y: g.cy(r) + 2, width: cell - 4, height: cell - 4, class: 'f-none sep', style: 'stroke-width: 6' }, layer);
      s('rect', { x: g.cx(c) + 2, y: g.cy(r) + 2, width: cell - 4, height: cell - 4, class: 'f-none outline-sec', style: 'stroke-width: 3' }, layer);
      s('text', { x: g.cx(c) + 9, y: g.cy(r) + 17, class: (A[r][c] ? 't-on' : 't-sec') + ' t-bold' }, layer, l);
    });
    const rx = 300;
    s('text', { x: rx, y: 70, class: 't-fg t-lg t-bold' }, layer, 'p = ' + name(pp.p) + ', q = ' + name(pp.q));
    pp.lines.forEach((t, i) => rich(layer, { x: rx, y: 102 + i * 24, class: 't-fg' }, t));
    s('text', { x: rx, y: 214, class: (pp.ok ? 't-ok' : 't-bad') + ' t-lg t-bold' }, layer, pp.verdict);
  }, 0);
});

QV.register('s2-mc7', function (q) {
  const { s, svg, grid, steps, box, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const LUT = [1, 2, 3, 3, 4, 6, 7, 7];

  // Figure 1: memory lookup
  const M = svg(viz('mem'), 760, 244, { label: 'The pixel value selects an address in the LUT and the stored value is the output', minWidth: 560 });
  const T = { x0: 170, cw: 64, ya: 78, ha: 28, yv: 106, hv: 40 };
  s('text', { x: T.x0 - 10, y: T.ya + T.ha / 2, dy: '0.35em', 'text-anchor': 'end' }, M, 'address (index)');
  s('text', { x: T.x0 - 10, y: T.yv + T.hv / 2, dy: '0.35em', 'text-anchor': 'end' }, M, 'stored value');
  const layer = s('g', {}, M);
  const cxOf = i => T.x0 + i * T.cw + T.cw / 2;
  steps(viz('steps'), LUT.map((_, i) => 'value ' + i), v => {
    layer.textContent = '';
    LUT.forEach((out, i) => {
      const on = i === v, x = T.x0 + i * T.cw;
      s('rect', { x, y: T.ya, width: T.cw, height: T.ha, class: (on ? 'f-pri' : 'f-seg') + ' sep' }, layer);
      s('text', { x: x + T.cw / 2, y: T.ya + T.ha / 2, dy: '0.35em', 'text-anchor': 'middle', class: on ? 't-on t-bold' : 't-muted' }, layer, String(i));
      s('rect', { x, y: T.yv, width: T.cw, height: T.hv, class: (on ? 'f-ok-soft' : 'f-surface') + ' box' }, layer);
      s('text', { x: x + T.cw / 2, y: T.yv + T.hv / 2, dy: '0.35em', 'text-anchor': 'middle', class: (on ? 't-ok t-bold' : 't-fg') + ' t-lg' }, layer, String(out));
    });
    if (v >= 1) {
      const x = T.x0 + (v - 1) * T.cw;
      s('rect', { x: x + 3, y: T.yv + 3, width: T.cw - 6, height: T.hv - 6, class: 's-bad dash', style: 'stroke-width: 2' }, layer);
      s('text', { x: T.x0, y: 232, class: 't-bad' }, layer, 'Counting from 1: the ' + v + (v === 1 ? 'st' : v === 2 ? 'nd' : v === 3 ? 'rd' : 'th') + ' entry is index ' + (v - 1) + ', which holds ' + LUT[v - 1] + '. Wrong.');
    }
    const cx = cxOf(v);
    box(layer, cx - 52, 12, 104, 36, 'pixel value ' + v, { cls: 'f-pri', textCls: 't-on t-bold' });
    arrow(layer, cx, 50, cx, T.ya - 2, { cls: 'a-pri', width: 2 });
    arrow(layer, cx, T.yv + T.hv + 2, cx, 172, { cls: 'a-ok', width: 2 });
    box(layer, cx - 52, 174, 104, 34, 'output ' + LUT[v], { cls: 'f-ok', textCls: 't-on t-bold' });
  }, 5);

  // Figure 2: the LUT on a whole image
  const IMG = [[0, 1, 2, 3, 4, 5], [5, 5, 6, 7, 4, 3], [2, 5, 7, 6, 5, 1], [1, 3, 5, 5, 2, 0]];
  const OUT = IMG.map(r => r.map(v => LUT[v]));
  const G = svg(viz('img'), 760, 214, { label: '3-bit image before and after the LUT, with the level mapping between them', minWidth: 560 });
  const cell = 34;
  const outline = (g, x0, y0) => IMG.forEach((row, r) => row.forEach((v, c) => {
    if (v === 5) s('rect', { x: x0 + c * cell + 2, y: y0 + r * cell + 2, width: cell - 4, height: cell - 4, class: 'f-none outline-sec' }, g);
  }));
  s('text', { x: 30, y: 30, class: 't-fg t-bold' }, G, 'input');
  grid(G, { x: 30, y: 44, cell, data: IMG, fill: v => QV.gray(v, 7) });
  outline(G, 30, 44);
  s('text', { x: 530, y: 30, class: 't-fg t-bold' }, G, 'output = LUT[input]');
  grid(G, { x: 530, y: 44, cell, data: OUT, fill: v => QV.gray(v, 7) });
  outline(G, 530, 44);
  const lx = 300, rx = 430, ly = i => 44 + i * 19.5 + 8;
  s('text', { x: lx + 13, y: 30, 'text-anchor': 'middle', class: 't-sm' }, G, 'in');
  s('text', { x: rx + 13, y: 30, 'text-anchor': 'middle', class: 't-sm' }, G, 'out');
  LUT.forEach((o, i) => {
    const on = i === 5;
    s('line', { x1: lx + 26, y1: ly(i), x2: rx, y2: ly(o), class: on ? 's-pri' : 's-muted', style: on ? 'stroke-width: 3' : 'stroke-width: 1; opacity: 0.6' }, G);
  });
  for (let i = 0; i < 8; i++) {
    [lx, rx].forEach((x, side) => {
      const on = side === 0 ? i === 5 : i === 6;
      s('rect', { x, y: ly(i) - 8, width: 26, height: 16, rx: 3, class: (on ? 'f-pri' : 'f-seg') + ' box' }, G);
      s('text', { x: x + 13, y: ly(i), dy: '0.35em', 'text-anchor': 'middle', class: (on ? 't-on t-bold' : 't-fg') + ' t-sm' }, G, String(i));
    });
  }
});

QV.register('s2-mc8', function (q) {
  const { s, svg, grid, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const A = [
    '0000000000000',
    '0111011100010',
    '0111011100000',
    '0111111100000',
    '0111011100000',
    '0111111111110',
    '0111111100000',
    '0111111100000',
    '0000000000000',
  ].map(r => r.split('').map(Number));
  const R = A.length, C = A[0].length;
  const at = (I, r, c) => (r >= 0 && r < R && c >= 0 && c < C ? I[r][c] : 0);
  const win = (I, r, c) => [-1, 0, 1].flatMap(dr => [-1, 0, 1].map(dc => at(I, r + dr, c + dc)));
  const dil = I => I.map((row, r) => row.map((_, c) => (win(I, r, c).some(v => v) ? 1 : 0)));
  const ero = I => I.map((row, r) => row.map((_, c) => (win(I, r, c).every(v => v) ? 1 : 0)));
  const D = dil(A), CL = ero(D), OP = dil(ero(A));
  const count = I => I.flat().reduce((a, b) => a + b, 0);
  const diff = (I, from, to) => I.flatMap((row, r) => row.map((v, c) => [r, c]).filter(([r, c]) => A[r][c] === from && I[r][c] === to));
  const added = diff(CL, 0, 1), removed = diff(OP, 1, 0);

  const cell = 18, PW = C * cell, PH = R * cell, GAP = 60;
  function panel(g, x, y, I, title, caption, marks, cls, capCls) {
    s('text', { x, y: y - 12, class: 't-fg t-bold' }, g, title);
    grid(g, { x, y, cell, data: I, fill: v => (v ? 'f-pri' : 'f-seg'), text: false });
    marks.forEach(([r, c]) => {
      s('rect', { x: x + c * cell - 1, y: y + r * cell - 1, width: cell + 2, height: cell + 2, class: 'f-none sep', style: 'stroke-width: 6' }, g);
      s('rect', { x: x + c * cell - 1, y: y + r * cell - 1, width: cell + 2, height: cell + 2, class: 'f-none ' + cls, style: 'stroke-width: 3' }, g);
    });
    s('text', { x: x + PW / 2, y: y + PH + 22, 'text-anchor': 'middle', class: capCls || 't-muted' }, g, caption);
  }
  const xs = [16, 16 + PW + GAP, 16 + 2 * (PW + GAP)];
  const W = xs[2] + PW + 16, y0 = 34;

  const F1 = svg(viz('close'), W, y0 + PH + 40, { label: 'Closing in two steps: A, A dilated by B, then eroded by B; the gap and the hole are filled', minWidth: 560 });
  panel(F1, xs[0], y0, A, 'A', count(A) + ' pixels', added, 's-ok');
  panel(F1, xs[1], y0, D, 'A ⊕ B (dilate)', count(D) + ' pixels', [], '');
  panel(F1, xs[2], y0, CL, 'A • B = (A ⊕ B) ⊖ B', count(CL) + ' pixels: A + gap + hole', added, 's-ok', 't-ok t-bold');
  [0, 1].forEach(i => arrow(F1, xs[i] + PW + 10, y0 + PH / 2, xs[i + 1] - 10, y0 + PH / 2, { cls: 'a-pri', width: 2, label: i ? '⊖ B' : '⊕ B', labelCls: 't-pri t-bold', dy: -10 }));

  const F2 = svg(viz('compare'), W, y0 + PH + 40, { label: 'A, its opening and its closing with a 3 by 3 square structuring element', minWidth: 560 });
  panel(F2, xs[0], y0, A, 'A', count(A) + ' pixels', [], '');
  panel(F2, xs[1], y0, OP, 'opening A ∘ B', count(OP) + ': spot, bar, isthmus gone', removed, 's-bad', 't-bad t-bold');
  panel(F2, xs[2], y0, CL, 'closing A • B', count(CL) + ': gap and hole filled', added, 's-ok', 't-ok t-bold');
});

QV.register('s2-mc9', function (q) {
  const { s, svg, grid, steps, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const R = 7, C = 8;
  const CLEAN = Array.from({ length: R }, () => Array.from({ length: C }, (_, c) => (c < 4 ? 60 : 190)));
  const IMG = CLEAN.map(r => r.slice());
  const SALT = [[1, 1], [3, 3], [5, 6]], PEPPER = [[1, 5], [5, 1]];
  SALT.forEach(([r, c]) => { IMG[r][c] = 255; });
  PEPPER.forEach(([r, c]) => { IMG[r][c] = 0; });
  const at = (r, c) => IMG[Math.min(Math.max(r, 0), R - 1)][Math.min(Math.max(c, 0), C - 1)];
  const win = (r, c) => [-1, 0, 1].flatMap(dr => [-1, 0, 1].map(dc => at(r + dr, c + dc)));
  const apply = f => IMG.map((row, r) => row.map((_, c) => f(r, c)));
  const FILTERS = [
    { name: 'Average 3×3', out: apply((r, c) => Math.round(win(r, c).reduce((a, b) => a + b, 0) / 9)),
      text: n => `Average: ${n} of 56 pixels differ from the clean edge. Each spike leaks into its 3×3 neighbourhood, and the sharp step 60 → 190 becomes a ramp 60, 103, 147, 190.` },
    { name: 'Median', out: apply((r, c) => win(r, c).sort((a, b) => a - b)[4]),
      text: n => `Median: ${n} of 56 pixels differ. All five spikes are gone and the edge stays exactly between columns 3 and 4.` },
    { name: 'Max', out: apply((r, c) => Math.max(...win(r, c))),
      text: n => `Max: ${n} of 56 pixels differ. The two pepper pixels are gone, but every salt pixel grows into a 3×3 white block and the bright side moves one column left.` },
    { name: 'Laplacian', out: apply((r, c) => Math.min(255, Math.max(0, 4 * at(r, c) - at(r - 1, c) - at(r + 1, c) - at(r, c - 1) - at(r, c + 1)))),
      text: n => `Laplacian (clipped to 0..255): ${n} of 56 pixels differ. Flat areas go to 0, while the spikes and the edge light up. It is an edge detector, so it amplifies the noise.` },
  ];

  // Figure 1: input and filtered output
  const cell = 32, x1 = 40, x2 = 386, y0 = 40;
  const M = svg(viz('main'), 680, y0 + R * cell + 16, { label: 'Noisy 7 by 8 edge image and its output under the chosen filter', minWidth: 560 });
  s('text', { x: x1, y: 24, class: 't-fg t-bold' }, M, 'noisy input');
  grid(M, { x: x1, y: y0, cell, data: IMG, fill: v => QV.gray(v) });
  SALT.concat(PEPPER).forEach(([r, c]) => s('rect', { x: x1 + c * cell + 2, y: y0 + r * cell + 2, width: cell - 4, height: cell - 4, class: 'f-none outline-sec' }, M));
  const title = s('text', { x: x2, y: 24, class: 't-fg t-bold' }, M, '');
  arrow(M, x1 + C * cell + 12, y0 + R * cell / 2, x2 - 12, y0 + R * cell / 2, { cls: 'a-pri', width: 2, label: '3×3', labelCls: 't-pri t-bold', dy: -10 });
  const layer = s('g', {}, M);
  steps(viz('steps'), FILTERS.map(f => f.name), k => {
    layer.textContent = '';
    const f = FILTERS[k];
    grid(layer, { x: x2, y: y0, cell, data: f.out, fill: v => QV.gray(v) });
    let n = 0;
    f.out.forEach((row, r) => row.forEach((v, c) => {
      if (v === CLEAN[r][c]) return;
      n++;
      s('rect', { x: x2 + c * cell + 2.5, y: y0 + r * cell + 2.5, width: cell - 5, height: cell - 5, class: 'f-none s-bad', style: 'stroke-width: 2' }, layer);
    }));
    title.textContent = 'after ' + f.name.toLowerCase();
    role('verdict').textContent = f.text(n);
  }, 1);

  // Figure 2: one window, sorted
  const WINS = [
    { name: 'Salt at (3,3)', w: [60, 60, 190, 60, 255, 190, 60, 60, 190], note: 'The spike 255 sorts to the end. Five of nine values are 60, so the median is the clean value 60.' },
    { name: 'Pepper at (1,5)', w: [190, 190, 190, 190, 0, 190, 190, 190, 190], note: 'The spike 0 sorts to the start. The median is 190, the clean value. Max also works here, on a dark spike.' },
    { name: 'Slide 55 window', w: [13, 4, 8, 2, 9, 6, 7, 25, 16], note: 'Slide 55: the median is 8, and the outlier 25 has no effect on it. The mean would be 10.' },
  ];
  const S = svg(viz('sort'), 720, 196, { label: 'A 3 by 3 window and its nine values sorted, with the median in the middle', minWidth: 560 });
  const sl = s('g', {}, S);
  steps(viz('wsteps'), WINS.map(w => w.name), k => {
    sl.textContent = '';
    const W = WINS[k], sorted = W.w.slice().sort((a, b) => a - b);
    const mean = W.w.reduce((a, b) => a + b, 0) / 9, max = sorted[8];
    s('text', { x: 30, y: 26, class: 't-fg t-bold' }, sl, 'window');
    grid(sl, { x: 30, y: 40, cell: 40, data: [W.w.slice(0, 3), W.w.slice(3, 6), W.w.slice(6)], fill: () => 'f-seg', textCls: () => 't-fg' });
    s('rect', { x: 72, y: 82, width: 36, height: 36, class: 'f-none outline-sec' }, sl);
    arrow(sl, 162, 100, 200, 100, { cls: 'a-muted', width: 2, label: 'sort', dy: -10 });
    const sg = grid(sl, { x: 210, y: 78, cell: 50, gap: 0, data: [sorted], fill: (v, r, c) => (c === 4 ? 'f-ok' : 'f-seg'), textCls: (v, r, c) => (c === 4 ? 't-on t-bold' : 't-fg'), colLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] });
    s('text', { x: 210, y: 46, class: 't-fg t-bold' }, sl, 'sorted');
    s('text', { x: sg.cx(4) + 25, y: 148, 'text-anchor': 'middle', class: 't-ok t-bold' }, sl, 'median = ' + sorted[4]);
    s('text', { x: 210, y: 178, class: 't-fg' }, sl, 'mean = ' + QV.fmt(mean, 1) + ' · max = ' + max);
    role('wnote').textContent = W.note;
  }, 0);
});

QV.register('s2-mc10', function (q) {
  const { s, svg, axes, steps, box, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const SAL = [[2.2, 4.6], [3.6, 4.9], [2.7, 3.3], [3.9, 3.6], [3.1, 4.3], [2.0, 3.8], [3.4, 2.9], [2.5, 5.1], [3.8, 4.4], [2.8, 4.1]];
  const BASS = [[6.2, 7.0], [7.6, 7.3], [6.8, 5.6], [7.9, 6.1], [7.1, 6.8], [6.0, 6.2], [7.4, 5.4], [6.5, 7.6], [7.8, 6.9], [6.7, 6.1]];
  const mean = P => [P.reduce((a, p) => a + p[0], 0) / P.length, P.reduce((a, p) => a + p[1], 0) / P.length];
  const CLS = [
    { name: 'class 1, salmon', short: 'salmon', m: mean(SAL), pts: SAL, f: 'f-pri', st: 's-pri', t: 't-pri', area: 'area-pri' },
    { name: 'class 2, sea bass', short: 'sea bass', m: mean(BASS), pts: BASS, f: 'f-sec', st: 's-sec', t: 't-sec', area: 'area-sec' },
  ];
  const RAD = 2;
  const OBJ = [[3.8, 3.2], [5.8, 7.6], [8.6, 1.8]];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const decide = o => {
    const d = CLS.map(c => dist(o, c.m)), k = d[0] <= d[1] ? 0 : 1;
    return { d, k, reject: d[k] > RAD };
  };
  const pt = p => '(' + p[0].toFixed(1) + ', ' + p[1].toFixed(1) + ')';

  // Figure 1: feature space
  const M = svg(viz('space'), 640, 392, { label: 'Feature space with two fish classes, their means, the reject distance and three objects', minWidth: 540 });
  const ax = axes(M, { x: 56, y: 24, w: 320, h: 320, xd: [0, 10], yd: [0, 10], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6, 8, 10], xl: 'x₁ lightness', yl: 'x₂ width' });
  const r = ax.x(RAD) - ax.x(0);
  CLS.forEach(c => {
    s('circle', { cx: ax.x(c.m[0]), cy: ax.y(c.m[1]), r, class: c.area }, M);
    s('circle', { cx: ax.x(c.m[0]), cy: ax.y(c.m[1]), r, class: c.st + ' dash', style: 'stroke-width: 1.5' }, M);
  });
  CLS.forEach((c, i) => c.pts.forEach(([x, y]) => {
    if (i === 0) s('circle', { cx: ax.x(x), cy: ax.y(y), r: 4, class: c.f }, M);
    else s('rect', { x: ax.x(x) - 3.5, y: ax.y(y) - 3.5, width: 7, height: 7, class: c.f }, M);
  }));
  CLS.forEach(c => {
    const X = ax.x(c.m[0]), Y = ax.y(c.m[1]);
    s('path', { d: `M${X - 7} ${Y - 7} L${X + 7} ${Y + 7} M${X - 7} ${Y + 7} L${X + 7} ${Y - 7}`, class: 'sep', style: 'stroke-width: 6' }, M);
    s('path', { d: `M${X - 7} ${Y - 7} L${X + 7} ${Y + 7} M${X - 7} ${Y + 7} L${X + 7} ${Y - 7}`, class: c.st, style: 'stroke-width: 3' }, M);
  });
  const lines = s('g', {}, M);
  const objs = s('g', {}, M);
  const panel = s('g', {}, M);
  const OFF = [[10, 26, 'start'], [-10, 4, 'end'], [10, 4, 'start']];
  const NOTES = [
    'All three objects. Each one goes to the nearest class mean if it is within distance 2, and to the reject class otherwise.',
    'Object 1 is 1.20 from the salmon mean, inside the circle, so it is classified as salmon.',
    'Object 2 is 1.63 from the sea bass mean, inside the circle, so it is classified as sea bass.',
    'Object 3 is nearest to the sea bass mean, but 4.96 is more than 2. It is in none of the known classes, so it goes to the reject class.',
  ];
  steps(viz('steps'), ['All', 'Object 1', 'Object 2', 'Object 3'], k => {
    lines.textContent = ''; objs.textContent = ''; panel.textContent = '';
    OBJ.forEach((o, i) => {
      const dec = decide(o), X = ax.x(o[0]), Y = ax.y(o[1]), sel = k === i + 1;
      if (sel) CLS.forEach((c, j) => {
        const mx = ax.x(c.m[0]), my = ax.y(c.m[1]);
        s('line', { x1: X, y1: Y, x2: mx, y2: my, class: 's-fg dash', style: 'stroke-width: 1.25' }, lines);
        s('text', { x: (X + mx) / 2 + 6, y: (Y + my) / 2 - 6, class: c.t + ' t-bold halo' }, lines, dec.d[j].toFixed(2));
      });
      const fill = dec.reject ? 'f-bad' : CLS[dec.k].f;
      s('path', { d: `M${X} ${Y - 9} L${X + 9} ${Y} L${X} ${Y + 9} L${X - 9} ${Y} Z`, class: fill + ' sep', style: 'stroke-width: 2' + (k && !sel ? '; opacity: 0.3' : '') }, objs);
      s('text', { x: X + OFF[i][0], y: Y + OFF[i][1] - 10, 'text-anchor': OFF[i][2], class: 't-fg t-bold halo', style: k && !sel ? 'opacity: 0.3' : null }, objs, String(i + 1));
    });
    const rx = 400;
    if (k === 0) {
      s('text', { x: rx, y: 46, class: 't-fg t-bold' }, panel, 'Rule (slide 38):');
      ['closest class mean,', 'if close enough (d ≤ 2);', 'reject otherwise.'].forEach((t, i) => s('text', { x: rx, y: 66 + i * 18, class: 't-fg' }, panel, t));
      OBJ.forEach((o, i) => {
        const dec = decide(o), y = 150 + i * 46;
        s('text', { x: rx, y, class: 't-fg' }, panel, 'Object ' + (i + 1) + ' ' + pt(o));
        s('text', { x: rx, y: y + 18, class: (dec.reject ? 't-bad' : CLS[dec.k].t) + ' t-bold' }, panel, '→ ' + (dec.reject ? 'reject class' : CLS[dec.k].name));
      });
    } else {
      const o = OBJ[k - 1], dec = decide(o);
      s('text', { x: rx, y: 46, class: 't-fg t-bold' }, panel, 'Object ' + k + ' ' + pt(o));
      CLS.forEach((c, j) => {
        s('text', { x: rx, y: 76 + j * 40, class: c.t }, panel, 'to ' + c.short + ' mean ' + pt(c.m));
        s('text', { x: rx, y: 94 + j * 40, class: c.t + ' t-bold' }, panel, 'd = ' + dec.d[j].toFixed(2));
      });
      s('text', { x: rx, y: 172, class: 't-fg' }, panel, 'nearest: ' + CLS[dec.k].short);
      s('text', { x: rx, y: 190, class: 't-fg' }, panel, dec.d[dec.k].toFixed(2) + (dec.reject ? ' > 2, not close enough' : ' ≤ 2, close enough'));
      s('text', { x: rx, y: 222, class: (dec.reject ? 't-bad' : CLS[dec.k].t) + ' t-lg t-bold' }, panel, '→ ' + (dec.reject ? 'reject class' : CLS[dec.k].name));
    }
    role('note').textContent = NOTES[k];
  }, 0);

  // Figure 2: pipeline with the classifier's outputs
  const G = svg(viz('flow'), 860, 236, { label: 'Pattern recognition system: sensing, segmentation, feature extraction, classification with outputs class 1, class 2 or reject, post-processing', minWidth: 560 });
  const BX = { y: 44, w: 112, h: 46, xs: [56, 204, 352, 500, 648] };
  const NAMES = ['sensing', 'segmentation', 'feature\nextraction', 'classification', 'post-\nprocessing'];
  s('text', { x: BX.xs[0] + BX.w / 2, y: 12, 'text-anchor': 'middle', class: 't-muted' }, G, 'input');
  arrow(G, BX.xs[0] + BX.w / 2, 18, BX.xs[0] + BX.w / 2, BX.y - 2, { cls: 'a-muted' });
  NAMES.forEach((n, i) => {
    box(G, BX.xs[i], BX.y, BX.w, BX.h, n, i === 3 ? { cls: 'f-pri', textCls: 't-on t-bold' } : {});
    if (i < 4) arrow(G, BX.xs[i] + BX.w + 2, BX.y + BX.h / 2, BX.xs[i + 1] - 2, BX.y + BX.h / 2, { cls: 'a-muted', label: i === 2 ? 'X' : null, labelCls: 't-fg t-bold', dy: -8 });
  });
  arrow(G, BX.xs[4] + BX.w + 2, BX.y + BX.h / 2, BX.xs[4] + BX.w + 26, BX.y + BX.h / 2, { cls: 'a-muted' });
  s('text', { x: BX.xs[4] + BX.w + 30, y: BX.y + BX.h / 2, dy: '0.35em', class: 't-muted' }, G, 'decision');
  s('text', { x: BX.xs[1] + BX.w / 2, y: BX.y + BX.h + 20, 'text-anchor': 'middle', class: 't-muted t-sm' }, G, 'objects vs background');
  s('text', { x: BX.xs[1] + BX.w / 2, y: BX.y + BX.h + 34, 'text-anchor': 'middle', class: 't-muted t-sm' }, G, '(option b: pixels)');
  s('text', { x: BX.xs[2] + BX.w / 2, y: BX.y + BX.h + 20, 'text-anchor': 'middle', class: 't-muted t-sm' }, G, 'X = [x₁, x₂]');
  const cx = BX.xs[3] + BX.w / 2, OUTS = [['class 1\nsalmon', 'f-pri-soft', 't-pri t-bold'], ['class 2\nsea bass', 'f-sec-soft', 't-sec t-bold'], ['reject', 'f-bad-soft', 't-bad t-bold']];
  OUTS.forEach(([label, cls, tc], i) => {
    const bx = 410 + i * 116, by = 160;
    arrow(G, cx, BX.y + BX.h + 2, bx + 48, by - 2, { cls: i === 2 ? 'a-bad' : 'a-pri', width: i === 2 ? 2 : 1.5 });
    box(G, bx, by, 96, 40, label, { cls, textCls: tc });
  });
  s('text', { x: 410, y: 222, class: 't-muted t-sm' }, G, 'one of the designated classes, or the reject class');
});

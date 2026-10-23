QV.register('s2-w1', function (q) {
  const { s, svg, steps, slider, scale } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const SOFT = { TP: 'f-ok-soft', FP: 'f-ter-soft', FN: 'f-bad-soft', TN: 'f-seg' };
  const SOLID = { TP: 'f-ok', FP: 'f-ter', FN: 'f-bad', TN: 'f-seg' };

  // Figure 1: slide 14 layout, metric cells
  const cm = svg(viz('cm'), 640, 250, { label: 'Confusion matrix with columns actual positive and negative, rows predicted positive and negative: TP 30, FP 10, FN 20, TN 40', minWidth: 520 });
  const M = { x: 150, y: 64, w: 150, h: 80 };
  const CELLS = [
    { k: 'TP', r: 0, c: 0, n: 30, d: 'pred +, actually +' },
    { k: 'FP', r: 0, c: 1, n: 10, d: 'pred +, actually −' },
    { k: 'FN', r: 1, c: 0, n: 20, d: 'pred −, actually +' },
    { k: 'TN', r: 1, c: 1, n: 40, d: 'pred −, actually −' },
  ];
  s('text', { x: M.x + M.w, y: 18, 'text-anchor': 'middle', class: 't-fg t-bold' }, cm, 'Actual');
  ['Positive', 'Negative'].forEach((t, i) => {
    s('text', { x: M.x + M.w * i + M.w / 2, y: M.y - 10, 'text-anchor': 'middle', class: 't-fg' }, cm, t);
    s('text', { x: M.x - 10, y: M.y + M.h * i + M.h / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-fg' }, cm, t);
  });
  s('text', { x: 40, y: M.y + M.h, 'text-anchor': 'middle', class: 't-fg t-bold', transform: `rotate(-90 40 ${M.y + M.h})` }, cm, 'Predicted');
  const cellG = {}, ring = {};
  CELLS.forEach(o => {
    const x = M.x + o.c * M.w, y = M.y + o.r * M.h;
    const g = s('g', { class: 'fade' }, cm);
    s('rect', { x, y, width: M.w, height: M.h, class: SOFT[o.k] + ' box' }, g);
    s('text', { x: x + M.w / 2, y: y + 24, 'text-anchor': 'middle', class: 't-fg t-bold t-lg' }, g, o.k);
    s('text', { x: x + M.w / 2, y: y + 48, 'text-anchor': 'middle', class: 't-fg t-xl' }, g, String(o.n));
    s('text', { x: x + M.w / 2, y: y + 68, 'text-anchor': 'middle', class: 't-sm' }, g, o.d);
    cellG[o.k] = g;
    ring[o.k] = s('rect', { x: x + 3, y: y + 3, width: M.w - 6, height: M.h - 6, class: 'f-none outline-pri', style: 'stroke-width: 3', visibility: 'hidden' }, cm);
  });
  const panel = s('g', {}, cm);
  const METRICS = [
    { name: 'All cells', use: ['TP', 'FP', 'FN', 'TN'], num: [], lines: ['TP + FP + FN + TN', '= 30 + 10 + 20 + 40', '= 100 cases'] },
    { name: 'Accuracy', use: ['TP', 'FP', 'FN', 'TN'], num: ['TP', 'TN'], lines: ['(TP + TN) / all', '(30 + 40) / 100', '= 70%'] },
    { name: 'Precision', use: ['TP', 'FP'], num: ['TP'], lines: ['TP / (TP + FP)', '30 / (30 + 10)', '= 0.75'] },
    { name: 'Recall', use: ['TP', 'FN'], num: ['TP'], lines: ['TP / (TP + FN)', '30 / (30 + 20)', '= 0.60'] },
    { name: 'F1', use: ['TP', 'FP', 'FN'], num: [], lines: ['2·P·R / (P + R)', '2·0.75·0.60 / 1.35', '= 0.667'] },
  ];
  const NOTES = [
    'Columns are the actual class, rows the prediction (slide 14). The diagonal holds the correct predictions, TP and TN. FP sits top right: predicted positive, actually negative. FN sits bottom left: predicted negative, actually positive.',
    'Accuracy uses all four cells. The diagonal TP + TN = 70 is divided by all 100 cases, so accuracy is 70%.',
    'Precision reads only the top row, the 40 cases the model called positive. 30 of those alarms were real, so precision = 30/40 = 0.75. TN and FN play no part.',
    'Recall reads only the left column, the 50 cases that are actually positive. The model caught 30 of them, so recall = 30/50 = 0.60.',
    'F1 combines precision and recall, so it uses TP, FP and FN and never looks at TN. 2 · 0.75 · 0.60 / (0.75 + 0.60) = 0.667, a bit below the arithmetic mean 0.675.',
  ];
  const cmNote = role('cm-note');
  steps(viz('cm-steps'), ['Matrix', 'Accuracy', 'Precision', 'Recall', 'F1'], k => {
    const m = METRICS[k];
    Object.keys(cellG).forEach(key => {
      cellG[key].classList.toggle('dim', m.use.indexOf(key) < 0);
      ring[key].setAttribute('visibility', m.num.indexOf(key) >= 0 ? 'visible' : 'hidden');
    });
    panel.textContent = '';
    s('text', { x: 480, y: 92, class: 't-fg t-bold t-lg' }, panel, m.name);
    s('text', { x: 480, y: 120, class: 't-fg' }, panel, m.lines[0]);
    s('text', { x: 480, y: 142, class: 't-muted' }, panel, m.lines[1]);
    s('text', { x: 480, y: 172, class: 't-ok t-bold t-xl' }, panel, m.lines[2]);
    cmNote.textContent = NOTES[k];
  });

  // Figure 2: threshold on classifier scores
  const POS = [0.97, 0.91, 0.83, 0.74, 0.66, 0.57, 0.44, 0.28];
  const NEG = [0.86, 0.62, 0.51, 0.41, 0.36, 0.24, 0.19, 0.16, 0.12, 0.09, 0.06, 0.02];
  const th = svg(viz('thr'), 680, 300, { label: 'Twenty cases on a score axis with a movable threshold, the resulting confusion matrix and the four metrics', minWidth: 540 });
  const X = scale(0, 1, 90, 650);
  const Y = { pos: 62, neg: 104, axis: 128 };
  const shade = s('rect', { y: 34, height: Y.axis - 34, class: 'area-pri' }, th);
  s('text', { x: 8, y: Y.pos, dy: '0.35em', class: 't-fg' }, th, 'actually +');
  s('text', { x: 8, y: Y.neg, dy: '0.35em', class: 't-fg' }, th, 'actually −');
  s('line', { x1: X(0), x2: X(1), y1: Y.axis, y2: Y.axis, class: 'l-axis' }, th);
  [0, 0.25, 0.5, 0.75, 1].forEach(v => {
    s('line', { x1: X(v), x2: X(v), y1: Y.axis, y2: Y.axis + 5, class: 'l-axis' }, th);
    s('text', { x: X(v), y: Y.axis + 18, 'text-anchor': 'middle' }, th, String(v));
  });
  s('text', { x: X(0.5), y: Y.axis + 36, 'text-anchor': 'middle' }, th, 'classifier score');
  const posM = POS.map(v => s('circle', { cx: X(v), cy: Y.pos, r: 6.5 }, th));
  const negM = NEG.map(v => s('rect', { x: X(v) - 6, y: Y.neg - 6, width: 12, height: 12 }, th));
  const tLine = s('line', { y1: 30, y2: Y.axis + 4, class: 's-fg', style: 'stroke-width: 2' }, th);
  const tLab = s('text', { y: 24, 'text-anchor': 'middle', class: 't-fg t-bold' }, th);
  const MM = { x: 90, y: 206, w: 70, h: 40 };
  s('text', { x: MM.x + MM.w / 2, y: MM.y - 8, 'text-anchor': 'middle', class: 't-sm' }, th, 'actual +');
  s('text', { x: MM.x + MM.w * 1.5, y: MM.y - 8, 'text-anchor': 'middle', class: 't-sm' }, th, 'actual −');
  s('text', { x: MM.x - 6, y: MM.y + MM.h / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, th, 'pred +');
  s('text', { x: MM.x - 6, y: MM.y + MM.h * 1.5, dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, th, 'pred −');
  const mText = {};
  [['TP', 0, 0], ['FP', 0, 1], ['FN', 1, 0], ['TN', 1, 1]].forEach(([k, r, c]) => {
    s('rect', { x: MM.x + c * MM.w, y: MM.y + r * MM.h, width: MM.w, height: MM.h, class: SOFT[k] + ' box' }, th);
    mText[k] = s('text', { x: MM.x + c * MM.w + MM.w / 2, y: MM.y + r * MM.h + MM.h / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, th);
  });
  const BAR = { x: 410, w: 200, y0: 198, dy: 26 };
  const bars = ['accuracy', 'precision', 'recall', 'F1'].map((name, i) => {
    const y = BAR.y0 + i * BAR.dy;
    s('text', { x: BAR.x - 10, y: y + 7, dy: '0.35em', 'text-anchor': 'end', class: 't-fg' }, th, name);
    s('rect', { x: BAR.x, y, width: BAR.w, height: 14, class: 'f-seg' }, th);
    return { bar: s('rect', { x: BAR.x, y, height: 14, class: 'f-pri' }, th), val: s('text', { y: y + 7, dy: '0.35em', class: 't-fg t-bold' }, th) };
  });
  const f3 = v => v.toFixed(2);
  slider(viz('t-slider'), { label: 'threshold t', min: 0.05, max: 0.95, step: 0.05, value: 0.5, fmt: v => v.toFixed(2) }, t => {
    t = Math.round(t * 100) / 100;
    const TP = POS.filter(v => v >= t).length, FN = POS.length - TP;
    const FP = NEG.filter(v => v >= t).length, TN = NEG.length - FP;
    shade.setAttribute('x', X(t)); shade.setAttribute('width', X(1) + 10 - X(t));
    tLine.setAttribute('x1', X(t)); tLine.setAttribute('x2', X(t));
    tLab.setAttribute('x', X(t)); tLab.textContent = 't = ' + t.toFixed(2);
    POS.forEach((v, i) => posM[i].setAttribute('class', v >= t ? SOLID.TP : SOLID.FN));
    NEG.forEach((v, i) => negM[i].setAttribute('class', v >= t ? SOLID.FP : SOLID.TN + ' l-axis'));
    Object.entries({ TP, FP, FN, TN }).forEach(([k, n]) => { mText[k].textContent = k + ' ' + n; });
    const acc = (TP + TN) / 20, pr = TP / (TP + FP), rc = TP / (TP + FN), f1 = 2 * pr * rc / (pr + rc);
    [acc, pr, rc, f1].forEach((v, i) => {
      bars[i].bar.setAttribute('width', v * BAR.w);
      bars[i].val.setAttribute('x', BAR.x + v * BAR.w + 6);
      bars[i].val.textContent = f3(v);
    });
    const ts = t.toFixed(2);
    role('t-verdict').innerHTML = FP === 0
      ? `No false alarms at t = ${ts}: precision <b>1.00</b>, but recall only <b>${f3(rc)}</b>. This is the setting a <b>spam filter</b> wants, since no real email lands in spam.`
      : FN === 0
        ? `Nothing is missed at t = ${ts}: recall <b>1.00</b>, with precision <b>${f3(pr)}</b>. This is the setting a <b>cancer screening</b> test wants, since a missed cancer costs far more than an extra test.`
        : `At t = ${ts}: TP ${TP}, FP ${FP}, FN ${FN}, TN ${TN}. Precision <b>${f3(pr)}</b> and recall <b>${f3(rc)}</b> move in opposite directions as t changes.`;
  });

  // Figure 3: 100 people, 5 positives
  const PI = [12, 37, 55, 71, 88], FPI = [4, 23, 46, 60, 79, 94], MISS = 71;
  const ac = svg(viz('acc'), 560, 268, { label: 'A 10 by 10 grid of people with 5 actual positives, colored by outcome, and the confusion matrix for the selected model', minWidth: 480 });
  const C = 22, G = 3, AX = 20, AY = 14;
  const people = [];
  for (let i = 0; i < 100; i++) people.push(s('rect', { x: AX + (i % 10) * (C + G), y: AY + Math.floor(i / 10) * (C + G), width: C, height: C, rx: 3 }, ac));
  const A2 = { x: 400, y: 96, w: 70, h: 44 };
  s('text', { x: A2.x + A2.w / 2, y: A2.y - 8, 'text-anchor': 'middle', class: 't-sm' }, ac, 'actual +');
  s('text', { x: A2.x + A2.w * 1.5, y: A2.y - 8, 'text-anchor': 'middle', class: 't-sm' }, ac, 'actual −');
  s('text', { x: A2.x - 6, y: A2.y + A2.h / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, ac, 'pred +');
  s('text', { x: A2.x - 6, y: A2.y + A2.h * 1.5, dy: '0.35em', 'text-anchor': 'end', class: 't-sm' }, ac, 'pred −');
  const aText = {};
  [['TP', 0, 0], ['FP', 0, 1], ['FN', 1, 0], ['TN', 1, 1]].forEach(([k, r, c]) => {
    s('rect', { x: A2.x + c * A2.w, y: A2.y + r * A2.h, width: A2.w, height: A2.h, class: SOFT[k] + ' box' }, ac);
    aText[k] = s('text', { x: A2.x + c * A2.w + A2.w / 2, y: A2.y + r * A2.h + A2.h / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold' }, ac);
  });
  const mTitle = s('text', { x: A2.x + A2.w, y: A2.y - 34, 'text-anchor': 'middle', class: 't-fg t-bold' }, ac);
  const MODELS = [
    { title: 'always "negative"', n: { TP: 0, FP: 0, FN: 5, TN: 95 }, acc: '95%', rec: '0', prec: '0/0',
      note: 'Always negative: TN = 95, FN = 5, TP = FP = 0. Accuracy is 95%, yet recall is 0/5 = 0, and precision 0/0 is undefined because the model never predicts positive.' },
    { title: 'real screening model', n: { TP: 4, FP: 6, FN: 1, TN: 89 }, acc: '93%', rec: '0.80', prec: '0.40',
      note: 'Real model: TP = 4, FN = 1, FP = 6, TN = 89. Accuracy drops to 93%, but recall is 4/5 = 0.80. Precision 4/10 = 0.40 is low, which screening accepts because a false alarm only costs an extra test.' },
  ];
  steps(viz('acc-steps'), ['Always negative', 'Real screening model'], k => {
    const m = MODELS[k];
    people.forEach((p, i) => {
      const pos = PI.indexOf(i) >= 0;
      const cls = pos ? (k && i !== MISS ? SOLID.TP : SOLID.FN) : (k && FPI.indexOf(i) >= 0 ? SOLID.FP : 'f-seg box');
      p.setAttribute('class', cls);
    });
    Object.keys(aText).forEach(key => { aText[key].textContent = key + ' ' + m.n[key]; });
    mTitle.textContent = m.title;
    role('acc').textContent = m.acc;
    role('rec').textContent = m.rec;
    role('prec').textContent = m.prec;
    role('acc-note').textContent = m.note;
  });
});

QV.register('s2-w2', function (q) {
  const { s, svg, steps, box, arrow, axes, line } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);

  // Figure 1: original table and the three bootstrapped sets (slides 42-45)
  const YES = [0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0];
  const ORIG = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const SETS = [
    { name: 'Original', rows: ORIG, dup: [], info: '14 rows · features: Outlook, Temp, Humidity, Wind' },
    { name: 'Set 1', rows: [1, 2, 3, 5, 5, 6, 7, 8, 9, 10, 7, 12, 13, 14], dup: [3, 10], info: 'left out: D4, D11 · features: Outlook, Humidity, Wind (no Temp)' },
    { name: 'Set 2', rows: [3, 2, 3, 4, 5, 6, 7, 8, 9, 8, 11, 12, 6, 14], dup: [0, 9, 12], info: 'left out: D1, D10, D13 · features: all four' },
    { name: 'Set 3', rows: [1, 2, 1, 4, 5, 6, 7, 9, 9, 10, 11, 12, 13, 14], dup: [2, 7], info: 'left out: D3, D8 · features: Outlook, Temp, Humidity (no Wind)' },
  ];
  const bt = svg(viz('boot'), 760, 372, { label: 'The 14-row PlayTennis table and three bootstrapped sets of 14 rows each, with duplicated rows outlined', minWidth: 600 });
  const CW = 40, CH = 26, X0 = 96;
  const rowG = SETS.map((set, i) => {
    const y = 26 + i * 86;
    const g = s('g', { class: 'fade' }, bt);
    s('text', { x: 10, y: y + CH / 2, dy: '0.35em', class: 't-fg t-bold' }, g, set.name);
    set.rows.forEach((d, j) => {
      const x = X0 + j * CW;
      s('rect', { x, y, width: CW - 4, height: CH, rx: 3, class: YES[d] ? 'f-pri' : 'f-sec' }, g);
      s('text', { x: x + (CW - 4) / 2, y: y + CH / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-on' }, g, 'D' + d);
      if (set.dup.indexOf(j) >= 0) s('rect', { x: x - 2.5, y: y - 2.5, width: CW + 1, height: CH + 5, rx: 4, class: 's-ter' }, g);
    });
    const yes = set.rows.filter(d => YES[d]).length;
    s('text', { x: X0 + 14 * CW + 8, y: y + CH / 2, dy: '0.35em', class: 't-fg' }, g, `${yes} Yes / ${14 - yes} No`);
    s('text', { x: X0, y: y + CH + 22, class: 't-muted' }, g, set.info);
    return g;
  });
  const BNOTES = [
    'Every set has 14 rows, the size of the original. Sampling with replacement repeats a few rows and leaves a few out, so no two trees see the same data.',
    'Set 1: D5 and D7 come twice, in the places of D4 and D11, which are left out. The tree uses Outlook, Humidity and Wind. Root counts 9 Yes / 5 No. It grows an Outlook root, with Humidity under Sunny and Wind under Rain.',
    'Set 2: D3, D8 and D6 come twice, in the places of D1, D10 and D13. All four features are used. Root counts 8 Yes / 6 No. This tree puts Temp at the root.',
    'Set 3: D1 and D9 come twice, in the places of D3 and D8. The tree uses Outlook, Temp and Humidity, no Wind. Root counts 9 Yes / 5 No. This tree puts Humidity at the root.',
  ];
  steps(viz('boot-steps'), ['All', 'Set 1', 'Set 2', 'Set 3'], k => {
    rowG.forEach((g, i) => g.classList.toggle('dim', k > 0 && i > 0 && i !== k));
    role('boot-note').textContent = BNOTES[k];
  });

  // Figure 2: three trees, the path of the test day, and the vote
  const TREES = [
    { name: 'Tree 1', root: 'Outlook', cnt: '9 Yes / 5 No', kids: [['Sunny', 'Humidity'], ['Overcast', 'Yes'], ['Rain', 'Wind']] },
    { name: 'Tree 2', root: 'Temp', cnt: '8 Yes / 6 No', kids: [['Hot', 'Outlook'], ['Mild', 'Humidity'], ['Cool', 'Wind']] },
    { name: 'Tree 3', root: 'Humidity', cnt: '9 Yes / 5 No', kids: [['High', 'Outlook'], ['Normal', 'Temp']] },
  ];
  const CASES = [
    { paths: [[0, 'High', 'No', '0/3'], [2, 'Strong', 'No', '1/2'], [0, 'Sunny', 'No', '0/3']], final: 'No', tally: '3 to 0',
      note: 'x = {Sunny, Cool, High, Strong}. Tree 1: Outlook = Sunny, then Humidity = High, leaf 0/3, No. Tree 2: Temp = Cool, then Wind = Strong, leaf 1/2, No. Tree 3: Humidity = High, then Outlook = Sunny, leaf 0/3, No. Three No votes, so the forest says No.' },
    { paths: [[0, 'Normal', 'Yes', '1/0'], [0, 'Sunny', 'No', '0/1'], [1, 'Hot', 'Yes', '1/0']], final: 'Yes', tally: '2 to 1',
      note: 'x = {Sunny, Hot, Normal, Weak}. Tree 1: Sunny, then Humidity = Normal, Yes. Tree 2: Temp = Hot, then Outlook = Sunny, No. Tree 3: Humidity = Normal, then Temp = Hot, Yes. The vote is 2 to 1, so the forest says Yes although one tree disagrees.' },
  ];
  const vt = svg(viz('vote'), 780, 364, { label: 'Three decision trees with the path of the test example highlighted, their votes and the majority result', minWidth: 560 });
  const vLayer = s('g', {}, vt);
  steps(viz('vote-steps'), ['Slide 46: Sunny, Cool, High, Strong', 'Notes: Sunny, Hot, Normal, Weak'], k => {
    vLayer.textContent = '';
    const cs = CASES[k];
    TREES.forEach((tr, i) => {
      const cx = 135 + i * 260, [pk, bval, leaf, cnt] = cs.paths[i];
      s('text', { x: cx, y: 14, 'text-anchor': 'middle', class: 't-fg t-bold' }, vLayer, tr.name);
      box(vLayer, cx - 46, 24, 92, 26, tr.root, { cls: 'f-surface', textCls: 't-fg t-bold' });
      s('text', { x: cx, y: 64, 'text-anchor': 'middle', class: 't-sm' }, vLayer, tr.cnt);
      const n = tr.kids.length, step = n === 3 ? 84 : 80;
      tr.kids.forEach(([val, name], j) => {
        const kx = cx + (j - (n - 1) / 2) * step, on = j === pk;
        const g = s('g', { style: on ? null : 'opacity: 0.35' }, vLayer);
        arrow(g, cx, 70, kx, 138, { cls: on ? 'a-pri' : 'a-muted', width: on ? 2.5 : 1.5 });
        const tt = kx === cx ? 0.4 : 0.62;
        s('text', { x: cx + tt * (kx - cx), y: 70 + tt * 68, dy: '0.35em', 'text-anchor': 'middle', class: (on ? 't-pri t-bold' : 't-muted') + ' halo' }, g, val);
        const isLeaf = name === 'Yes' || name === 'No';
        box(g, kx - 36, 140, 72, 26, name, { cls: isLeaf ? (name === 'Yes' ? 'f-pri' : 'f-sec') : 'f-surface', textCls: isLeaf ? 't-on t-bold' : 't-fg', stroke: on ? 'outline-pri' : 'box' });
        if (!on) return;
        [-24, 24].forEach(dx => s('line', { x1: kx, y1: 166, x2: kx + dx, y2: 188, class: 's-muted dash', style: 'opacity: 0.5' }, vLayer));
        arrow(vLayer, kx, 166, kx, 232, { cls: 'a-pri', width: 2.5 });
        s('text', { x: kx + 7, y: 210, class: 't-pri t-bold halo' }, vLayer, bval);
        box(vLayer, kx - 42, 234, 84, 28, leaf + ', ' + cnt, { cls: leaf === 'Yes' ? 'f-pri' : 'f-sec', textCls: 't-on t-bold' });
        arrow(vLayer, kx, 264, cx, 290, { cls: 'a-muted' });
      });
      box(vLayer, cx - 50, 292, 100, 26, 'votes ' + leaf, { cls: leaf === 'Yes' ? 'f-pri-soft' : 'f-sec-soft', textCls: 't-fg t-bold' });
    });
    s('text', { x: 395, y: 350, 'text-anchor': 'middle', class: 't-ok t-bold t-lg' }, vLayer, `Majority vote: ${cs.final} (${cs.tally})`);
    role('vote-note').textContent = cs.note;
  });

  // Figure 3: illustrative error pattern, then the binomial curve
  const ERR = [[0, 3, 7], [1, 4, 8], [2, 5, 9], [0, 6, 8], [2, 4, 7]];
  const dv = svg(viz('div'), 560, 270, { label: 'Five trees by ten test cases, right or wrong, and the majority vote row', minWidth: 480 });
  const DC = 32, DG = 4, DX = 80, DY = 34;
  s('text', { x: DX, y: 12, class: 't-fg t-bold' }, dv, 'test case');
  for (let c = 0; c < 10; c++) s('text', { x: DX + c * (DC + DG) + DC / 2, y: DY - 8, 'text-anchor': 'middle', class: 't-sm' }, dv, String(c + 1));
  const dLayer = s('g', {}, dv);
  const cellAt = (g, r, c, ok, y) => {
    const x = DX + c * (DC + DG);
    s('rect', { x, y, width: DC, height: DC, rx: 3, class: ok ? 'f-ok' : 'f-bad' }, g);
    s('text', { x: x + DC / 2, y: y + DC / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, g, ok ? '✓' : '✗');
  };
  const DNOTES = [
    'Each tree gets 3 of the 10 cases wrong, never the same 3. No column has more than 2 wrong votes, so the majority (3 of 5) is right on all 10 cases. 70% per tree, 100% for the vote.',
    'Five copies of tree 1 are all wrong on cases 1, 4 and 8. The vote is wrong there too, 7 of 10, exactly like one tree. Voting only helps when the errors differ.',
  ];
  steps(viz('div-steps'), ['5 different trees', '5 copies of one tree'], k => {
    dLayer.textContent = '';
    const errs = k ? ERR.map(() => ERR[0]) : ERR;
    errs.forEach((e, r) => {
      const y = DY + r * (DC + DG);
      s('text', { x: DX - 8, y: y + DC / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-fg' }, dLayer, 'tree ' + (k ? 1 : r + 1));
      for (let c = 0; c < 10; c++) cellAt(dLayer, r, c, e.indexOf(c) < 0, y);
      s('text', { x: DX + 10 * (DC + DG) + 6, y: y + DC / 2, dy: '0.35em', class: 't-fg' }, dLayer, '7/10');
    });
    const vy = DY + 5 * (DC + DG) + 12;
    s('text', { x: DX - 8, y: vy + DC / 2, dy: '0.35em', 'text-anchor': 'end', class: 't-fg t-bold' }, dLayer, 'vote');
    let right = 0;
    for (let c = 0; c < 10; c++) {
      const wrong = errs.filter(e => e.indexOf(c) >= 0).length;
      if (wrong < 3) right++;
      cellAt(dLayer, 5, c, wrong < 3, vy);
    }
    s('text', { x: DX + 10 * (DC + DG) + 6, y: vy + DC / 2, dy: '0.35em', class: 't-ok t-bold' }, dLayer, right + '/10');
    role('div-note').textContent = DNOTES[k];
  });

  const comb = (n, j) => { let r = 1; for (let i = 1; i <= j; i++) r = r * (n - j + i) / i; return r; };
  const maj = (n, p) => { let t = 0; for (let j = Math.floor(n / 2) + 1; j <= n; j++) t += comb(n, j) * Math.pow(p, j) * Math.pow(1 - p, n - j); return t; };
  const cv = svg(viz('curve'), 600, 270, { label: 'Probability that the majority vote is right against the number of trees: rises toward 1 for independent trees, stays at 0.7 for identical trees', minWidth: 480 });
  const ax = axes(cv, { x: 60, y: 24, w: 500, h: 190, xd: [0, 52], yd: [0.6, 1.02], xt: [1, 5, 11, 25, 51], yt: [0.6, 0.7, 0.8, 0.9, 1], yf: v => v.toFixed(1), xl: 'number of trees n (odd, so no ties)', yl: 'P(majority vote is right), each tree right with p = 0.7' });
  const pts = [];
  for (let n = 1; n <= 51; n += 2) pts.push([ax.x(n), ax.y(maj(n, 0.7))]);
  line(cv, [[ax.x(1), ax.y(0.7)], [ax.x(51), ax.y(0.7)]], 's-sec');
  line(cv, pts, 's-pri');
  [[5, 10, 18], [25, 8, -10]].forEach(([n, dx, dy]) => {
    const v = maj(n, 0.7);
    s('circle', { cx: ax.x(n), cy: ax.y(v), r: 5, class: 'f-pri' }, cv);
    s('text', { x: ax.x(n) + dx, y: ax.y(v) + dy, class: 't-pri t-bold' }, cv, `${n} trees: ${v.toFixed(3)}`);
  });
  s('text', { x: ax.x(51), y: ax.y(0.7) - 8, 'text-anchor': 'end', class: 't-sec t-bold' }, cv, 'identical trees: 0.7');
});

QV.register('s2-w3', function (q) {
  const { s, svg, axes, plot, slider, steps, box, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const RAW = [[-3.9, -1.7], [-2.4, -2.4], [-2.6, -0.6], [-1.3, -1.2], [-1.4, 0.5], [0.2, -1.0], [0.0, 0.7], [1.4, 0.0], [1.1, 1.8], [2.6, 0.9], [2.8, 2.0], [3.9, 1.5]];
  const n = RAW.length;
  const mx = RAW.reduce((a, p) => a + p[0], 0) / n, my = RAW.reduce((a, p) => a + p[1], 0) / n;
  const C = RAW.map(([x, y]) => [x - mx, y - my]);
  const S11 = C.reduce((a, [x]) => a + x * x, 0) / (n - 1);
  const S22 = C.reduce((a, [, y]) => a + y * y, 0) / (n - 1);
  const S12 = C.reduce((a, [x, y]) => a + x * y, 0) / (n - 1);
  const TOT = S11 + S22;
  const TH = 0.5 * Math.atan2(2 * S12, S11 - S22) * 180 / Math.PI;
  const rad = d => d * Math.PI / 180;
  const varAt = d => C.reduce((a, [x, y]) => a + Math.pow(x * Math.cos(rad(d)) + y * Math.sin(rad(d)), 2), 0) / (n - 1);

  // Figure 1: rotate a line, watch the variance of the projections
  const rt = svg(viz('rot'), 700, 290, { label: 'Centred points with a rotating line and their projections, and the variance of the projections against the angle with PC1 and PC2 marked', minWidth: 560 });
  const a1 = axes(rt, { x: 40, y: 24, w: 300, h: 210, xd: [-5, 5], yd: [-3.5, 3.5], xt: [-4, -2, 0, 2, 4], yt: [-2, 0, 2], grid: false, xl: 'X₁ (centred)', yl: 'X₂ (centred)' });
  s('line', { x1: a1.x(-5), x2: a1.x(5), y1: a1.y(0), y2: a1.y(0), class: 'l-grid' }, rt);
  s('line', { x1: a1.x(0), x2: a1.x(0), y1: a1.y(-3.5), y2: a1.y(3.5), class: 'l-grid' }, rt);
  const dyn = s('g', {}, rt);
  C.forEach(([x, y]) => s('circle', { cx: a1.x(x), cy: a1.y(y), r: 4, class: 'f-muted' }, rt));
  const a2 = axes(rt, { x: 420, y: 24, w: 250, h: 210, xd: [0, 180], yd: [0, 9], xt: [0, 45, 90, 135, 180], yt: [0, 3, 6, 9], xf: v => v + '°', xl: 'angle θ of the line', yl: 'variance of the projections' });
  plot(rt, a2, varAt, 0, 180, 180, 's-pri');
  [[TH, 'PC1'], [TH + 90, 'PC2']].forEach(([d, name]) => {
    const v = varAt(d);
    s('circle', { cx: a2.x(d), cy: a2.y(v), r: 5, class: 'f-ok' }, rt);
    s('text', { x: a2.x(d), y: a2.y(v) - 10, 'text-anchor': 'middle', class: 't-ok t-bold' }, rt, name);
  });
  const mk = s('g', {}, rt);
  const mLine = s('line', { y1: a2.y(0), y2: a2.y(9), class: 's-fg dash', style: 'opacity: 0.5' }, mk);
  const mDot = s('circle', { r: 5, class: 'f-pri' }, mk);
  slider(viz('ang'), { label: 'angle θ', min: 0, max: 179, step: 1, value: 0, fmt: v => v + '°' }, d => {
    dyn.textContent = '';
    const c = Math.cos(rad(d)), sn = Math.sin(rad(d));
    const tmax = Math.min(Math.abs(c) > 1e-9 ? 5 / Math.abs(c) : 99, Math.abs(sn) > 1e-9 ? 3.5 / Math.abs(sn) : 99);
    s('line', { x1: a1.x(-tmax * c), y1: a1.y(-tmax * sn), x2: a1.x(tmax * c), y2: a1.y(tmax * sn), class: 's-pri' }, dyn);
    C.forEach(([x, y]) => {
      const p = x * c + y * sn;
      s('line', { x1: a1.x(x), y1: a1.y(y), x2: a1.x(p * c), y2: a1.y(p * sn), class: 's-muted dash', style: 'stroke-width: 1' }, dyn);
      s('circle', { cx: a1.x(p * c), cy: a1.y(p * sn), r: 3.5, class: 'f-pri' }, dyn);
    });
    const v = varAt(d), share = (100 * v / TOT).toFixed(1);
    const near1 = Math.abs(d - TH) < 0.5, near2 = Math.abs(d - TH - 90) < 0.5;
    if (near1 || near2) {
      const t = 0.8 * tmax;
      s('text', { x: a1.x(t * c) + 10 * sn, y: a1.y(t * sn) - 10 * c, 'text-anchor': 'middle', class: 't-ok t-bold halo' }, dyn, near1 ? 'PC1' : 'PC2');
    }
    mLine.setAttribute('x1', a2.x(d)); mLine.setAttribute('x2', a2.x(d));
    mDot.setAttribute('cx', a2.x(d)); mDot.setAttribute('cy', a2.y(v));
    role('var').textContent = v.toFixed(2);
    role('share').textContent = share + '%';
    role('ang-verdict').innerHTML = near1
      ? `θ = ${d}° is <b>PC1</b> (the exact maximum is at ${TH.toFixed(1)}°). The projections spread the most here, variance <b>${v.toFixed(2)}</b>, which is <b>${share}%</b> of the total.`
      : near2
        ? `θ = ${d}° is <b>PC2</b>, perpendicular to PC1. The projections spread the least here, variance <b>${v.toFixed(2)}</b>, the ${share}% that PC1 leaves.`
        : d === 0
          ? `θ = 0° is the X₁ axis itself. Keeping only X₁ keeps <b>${share}%</b> of the variance. Turn the line toward ${Math.round(TH)}° to keep more.`
          : d === 90
            ? `θ = 90° is the X₂ axis. Keeping only X₂ keeps <b>${share}%</b>.`
            : `θ = ${d}°: variance <b>${v.toFixed(2)}</b>, ${share}% of the total. PC1 at ${TH.toFixed(1)}° keeps ${(100 * varAt(TH) / TOT).toFixed(1)}%.`;
  });

  // Figure 2: the same points in PC coordinates
  const un = svg(viz('unc'), 700, 316, { label: 'The points in the original axes, correlated, and in the principal axes, uncorrelated', minWidth: 560 });
  const c0 = Math.cos(rad(TH)), s0 = Math.sin(rad(TH));
  const PCC = C.map(([x, y]) => [x * c0 + y * s0, -x * s0 + y * c0]);
  [
    { x: 50, title: 'Original axes', xl: 'X₁', yl: 'X₂', pts: C, lines: [`Var X₁ = ${S11.toFixed(2)}, Var X₂ = ${S22.toFixed(2)}`, `Cov(X₁, X₂) = ${S12.toFixed(2)}`], warm: true },
    { x: 400, title: 'Principal axes', xl: 'PC1', yl: 'PC2', pts: PCC, lines: [`Var PC1 = ${varAt(TH).toFixed(2)}, Var PC2 = ${varAt(TH + 90).toFixed(2)}`, 'Cov(PC1, PC2) = 0'] },
  ].forEach(p => {
    s('text', { x: p.x, y: 14, class: 't-fg t-bold' }, un, p.title);
    const ax = axes(un, { x: p.x, y: 40, w: 280, h: 196, xd: [-5, 5], yd: [-3.5, 3.5], xt: [-4, -2, 0, 2, 4], yt: [-2, 0, 2], grid: false, xl: p.xl, yl: p.yl });
    s('line', { x1: ax.x(-5), x2: ax.x(5), y1: ax.y(0), y2: ax.y(0), class: 'l-grid' }, un);
    s('line', { x1: ax.x(0), x2: ax.x(0), y1: ax.y(-3.5), y2: ax.y(3.5), class: 'l-grid' }, un);
    if (p.warm) {
      [[TH, 'PC1'], [TH + 90, 'PC2']].forEach(([d, name]) => {
        const c = Math.cos(rad(d)), sn = Math.sin(rad(d));
        const tm = Math.min(Math.abs(c) > 1e-9 ? 5 / Math.abs(c) : 99, 3.5 / Math.abs(sn));
        s('line', { x1: ax.x(-tm * c), y1: ax.y(-tm * sn), x2: ax.x(tm * c), y2: ax.y(tm * sn), class: 's-ok dash', style: 'stroke-width: 1.5' }, un);
        s('text', { x: ax.x(0.92 * tm * c) + 8, y: ax.y(0.92 * tm * sn) + 4, class: 't-ok t-bold halo' }, un, name);
      });
    }
    p.pts.forEach(([x, y]) => s('circle', { cx: ax.x(x), cy: ax.y(y), r: 4, class: 'f-pri' }, un));
    s('text', { x: p.x, y: 294, class: 't-fg' }, un, p.lines[0]);
    s('text', { x: p.x, y: 310, class: p.warm ? 't-sec t-bold' : 't-ok t-bold' }, un, p.lines[1]);
  });
  arrow(un, 342, 110, 382, 110, { cls: 'a-muted', label: 'rotate' });

  // Figure 3: the five steps on the slide 17 data
  const pp = svg(viz('pipe'), 700, 484, { label: 'The five PCA steps with formulas on the left and the slide 17 results on the right', minWidth: 560 });
  const ROWS = [
    ['1 · Mean, then centre', 'X̄ = Σxᵢ / m,   X − X̄', 'X̄₁ = 32/4 = 8,   X̄₂ = 34/4 = 8.5', 'centred: (−4, 2.5) (0, −4.5) (5, −3.5) (−1, 5.5)'],
    ['2 · Covariance matrix', 'Cov(x, y) = Σ(xᵢ − x̄)(yᵢ − ȳ) / (n − 1)', 'S = [ 14  −11 ;  −11  23 ]', '42/3 = 14,   69/3 = 23,   −33/3 = −11'],
    ['3 · Eigenvalues', 'det(S − λI) = 0', '(14 − λ)(23 − λ) − 121 = λ² − 37λ + 201 = 0', 'λ₁ = 30.385,   λ₂ = 6.615'],
    ['4 · Eigenvectors', '(S − λI)U = 0, then normalize', '(14 − 30.385)u₁ − 11u₂ = 0  →  u₂ = −1.4895u₁', 'u₁ = (0.5574, −0.8303)'],
    ['5 · Project', 'PC1 = X_centered · u₁', '−4(0.5574) + 2.5(−0.8303) = −4.3052', 'PC1 = −4.3052, 3.7361, 5.6928, −5.1238'],
  ];
  const rowGs = ROWS.map((r, i) => {
    const y = 12 + i * 88;
    const g = s('g', { class: 'fade' }, pp);
    box(g, 12, y, 300, 62, r[0] + '\n' + r[1], { cls: 'f-pri-soft', textCls: 't-fg', lh: 20 });
    s('text', { x: 336, y: y + 24, class: 't-fg' }, g, r[2]);
    s('text', { x: 336, y: y + 46, class: i === 4 ? 't-ok t-bold' : 't-fg t-bold' }, g, r[3]);
    if (i < 4) arrow(pp, 162, y + 62, 162, y + 86, { cls: 'a-muted' });
    return g;
  });
  s('text', { x: 12, y: 470, class: 't-ok t-bold' }, pp, '4 points × 2 variables → 4 points × 1 component, keeping 30.385 / 37 = 82.1% of the variance');
  const PNOTES = [
    'All five steps. Step 3 needs S and step 4 needs λ, so the order is fixed.',
    'Step 1. The means are 8 and 8.5. Subtracting them centres the cloud on the origin, so every later step measures spread around the mean.',
    'Step 2. The diagonal holds the variances, 14 and 23. The off-diagonal −11 is negative, so X₂ tends to fall when X₁ rises. S is symmetric.',
    'Step 3. For a 2 × 2 matrix, det(S − λI) = 0 is a quadratic. Its roots are the variances along the two principal directions, and they add up to the trace: 30.385 + 6.615 = 37 = 14 + 23.',
    'Step 4. Put the largest eigenvalue back into (S − λI)U = 0 and scale the solution to length 1. This unit vector is the direction of PC1.',
    'Step 5. Each centred row is projected on u₁ with a dot product. The four values are PC1, the slide answer. An eigenvector is only defined up to sign, so −u₁ with all signs flipped is also correct.',
  ];
  steps(viz('pipe-steps'), ['All', '1 Mean', '2 Covariance', '3 Eigenvalues', '4 Eigenvectors', '5 Project'], k => {
    rowGs.forEach((g, i) => g.classList.toggle('dim', k > 0 && i !== k - 1));
    role('pipe-note').textContent = PNOTES[k];
  });
});

QV.register('s2-w4', function (q) {
  const { s, svg, table, axes, steps, box } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const FREQ = [
    ['Day', 'Weekday', 4, 1], ['Day', 'Weekend', 2, 2], ['Day', 'Holiday', 4, 2],
    ['Discount', 'Yes', 8, 2], ['Discount', 'No', 2, 3],
    ['Free Delivery', 'Yes', 9, 2], ['Free Delivery', 'No', 1, 3],
  ];
  const QUERY = [1, 3, 6];
  const L = t => ({ text: t, cls: 'l' });
  table(viz('given'), [L('Feature'), L('Value'), 'Buy = Yes', 'Buy = No', 'Total'], FREQ.map(([f, v, y, n]) => [L(f), L(v), String(y), String(n), String(y + n)]));
  const lt = table(viz('lik-table'), [L('Feature'), L('Value'), 'P(· | Yes)', 'P(· | No)', 'P(value)'],
    FREQ.map(([f, v, y, n]) => [L(f), L(v), y + '/10', n + '/5', (y + n) + '/15']).concat([[L('Prior'), L(''), { text: '10/15', cls: 'hl' }, { text: '5/15', cls: 'hl' }, '']]));
  QUERY.forEach(i => lt.rows[i].classList.add('on'));

  // Figure 1: paired likelihood bars
  const lk = svg(viz('lik'), 660, 330, { label: 'Paired bars of P(value given Yes) and P(value given No) for every feature value and the priors, with the query rows shaded', minWidth: 520 });
  const RH = 34, TOP = 12;
  const ROWS = FREQ.map(([f, v, y, n]) => [f + ' = ' + v, y / 10, n / 5, y + '/10', n + '/5']).concat([['Prior', 10 / 15, 5 / 15, '10/15', '5/15']]);
  QUERY.forEach(i => s('rect', { x: 4, y: TOP + i * RH, width: 652, height: RH - 2, rx: 4, class: 'f-seg' }, lk));
  const ax = axes(lk, { x: 160, y: TOP, w: 400, h: ROWS.length * RH, xd: [0, 1], yd: [0, 1], xt: [0, 0.25, 0.5, 0.75, 1], yt: [], xl: 'probability' });
  [0.25, 0.5, 0.75, 1].forEach(v => s('line', { x1: ax.x(v), x2: ax.x(v), y1: TOP, y2: TOP + ROWS.length * RH, class: 'l-grid' }, lk));
  [3, 5, 7].forEach(i => s('line', { x1: 4, x2: 656, y1: TOP + i * RH - 1, y2: TOP + i * RH - 1, class: 's-line' }, lk));
  ROWS.forEach(([lab, py, pn, fy, fn], i) => {
    const y = TOP + i * RH;
    s('text', { x: 150, y: y + RH / 2 - 1, dy: '0.35em', 'text-anchor': 'end', class: QUERY.indexOf(i) >= 0 ? 't-fg t-bold' : 't-fg' }, lk, lab);
    s('rect', { x: ax.x(0), y: y + 4, width: ax.x(py) - ax.x(0), height: 12, class: 'f-pri' }, lk);
    s('rect', { x: ax.x(0), y: y + 17, width: ax.x(pn) - ax.x(0), height: 12, class: 'f-sec' }, lk);
    s('text', { x: ax.x(py) + 5, y: y + 10, dy: '0.35em', class: 't-pri t-bold' }, lk, fy);
    s('text', { x: ax.x(pn) + 5, y: y + 23, dy: '0.35em', class: 't-sec t-bold' }, lk, fn);
  });

  // Figure 2: running products, as shares
  const STEPS = [
    { t: 'Prior', f: '10/15 and 5/15', b: 10 / 15, n: 5 / 15, bs: '0.6667', ns: '0.3333' },
    { t: '× Weekend', f: '× 2/10 and × 2/5', b: 2 / 15, n: 2 / 15, bs: '0.1333', ns: '0.1333' },
    { t: '× Discount = Yes', f: '× 8/10 and × 2/5', b: 0.32 / 3, n: 0.16 / 3, bs: '0.1067', ns: '0.0533' },
    { t: '× Free Delivery = No', f: '× 1/10 and × 3/5', b: 0.032 / 3, n: 0.032, bs: '0.01067', ns: '0.0320' },
    { t: '÷ 0.04741, normalize', f: '0.225 + 0.675 = 0.9', b: 0.225, n: 0.675, bs: '0.225 → 25%', ns: '0.675 → 75%' },
  ];
  const nb = svg(viz('nb'), 720, 300, { label: 'Five stacked bars showing how the Buy and No Buy products split after each factor', minWidth: 560 });
  const BX = 200, BW = 320;
  s('line', { x1: BX + BW / 2, x2: BX + BW / 2, y1: 8, y2: 290, class: 's-muted dash', style: 'stroke-width: 1' }, nb);
  s('text', { x: BX + BW / 2, y: 296, 'text-anchor': 'middle', class: 't-sm' }, nb, '50%');
  const nbRows = STEPS.map((st, i) => {
    const y = 16 + i * 56;
    const g = s('g', { class: 'fade' }, nb);
    s('text', { x: 8, y: y + 8, class: 't-fg t-bold' }, g, st.t);
    s('text', { x: 8, y: y + 26, class: 't-muted' }, g, st.f);
    const sh = st.b / (st.b + st.n), wb = BW * sh;
    s('rect', { x: BX, y, width: wb, height: 28, class: 'f-pri' }, g);
    s('rect', { x: BX + wb, y, width: BW - wb, height: 28, class: 'f-sec' }, g);
    s('text', { x: BX + 8, y: y + 14, dy: '0.35em', class: 't-on t-bold' }, g, (100 * sh).toFixed(1) + '%');
    s('text', { x: BX + BW - 8, y: y + 14, dy: '0.35em', 'text-anchor': 'end', class: 't-on t-bold' }, g, (100 - 100 * sh).toFixed(1) + '%');
    s('text', { x: BX + BW + 12, y: y + 8, class: 't-pri t-bold' }, g, 'Buy ' + st.bs);
    s('text', { x: BX + BW + 12, y: y + 26, class: 't-sec t-bold' }, g, 'No ' + st.ns);
    const ring = s('rect', { x: BX - 3, y: y - 3, width: BW + 6, height: 34, rx: 3, class: 'f-none outline-pri', visibility: 'hidden' }, g);
    return { g, ring };
  });
  const NBN = [
    'All five rows. The priors favour Buy 2 to 1. Weekend evens it out, Discount = Yes tilts it back to Buy, and Free Delivery = No swings it to 25% against 75%.',
    'Prior: 10 of 15 customers bought, so Buy starts at 10/15 = 0.667 and No Buy at 5/15 = 0.333.',
    'Weekend: P(Weekend | Yes) = 2/10 and P(Weekend | No) = 2/5. No Buy gets the bigger factor, and the two products meet at 0.1333 each, 50/50.',
    'Discount = Yes: 8/10 for Buy against 2/5 for No Buy. Buy pulls ahead again, 0.1067 against 0.0533.',
    'Free Delivery = No: only 1/10 of buyers had no free delivery, against 3/5 of non-buyers. The products become 0.01067 and 0.0320, so No Buy now has 75%.',
    'The slide divides both products by the same denominator, 0.04741, giving 0.225 and 0.675. They sum to 0.9, so dividing by 0.9 gives 25% and 75%, the same split as the row above.',
  ];
  steps(viz('nb-steps'), ['All', 'Prior', 'Weekend', 'Discount', 'Free Delivery', 'Normalize'], k => {
    nbRows.forEach((r, i) => {
      r.g.classList.toggle('dim', k > 0 && i > k - 1);
      r.ring.setAttribute('visibility', k > 0 && i === k - 1 ? 'visible' : 'hidden');
    });
    role('nb-note').textContent = NBN[k];
  });

  // Figure 3: the 15 records as tiles
  const REC = [[1, 'Weekday', 1], [2, 'Weekday', 1], [3, 'Weekday', 0], [4, 'Holiday', 1], [5, 'Weekend', 1], [6, 'Holiday', 0], [7, 'Weekend', 0], [8, 'Weekday', 1], [9, 'Weekend', 0], [10, 'Holiday', 1], [11, 'Holiday', 1], [12, 'Holiday', 0], [13, 'Weekend', 1], [14, 'Holiday', 1], [15, 'Weekday', 1]];
  const DAYS = ['Weekday', 'Weekend', 'Holiday'];
  const by = svg(viz('bay'), 660, 168, { label: 'The 15 shopping records as tiles grouped by day and colored by purchase, with the counted tiles outlined', minWidth: 540 });
  const T = 34, TG = 5;
  const tiles = [];
  let gx = 20;
  DAYS.forEach(day => {
    const recs = REC.filter(r => r[1] === day);
    s('text', { x: gx, y: 20, class: 't-fg t-bold' }, by, `${day} (${recs.length})`);
    recs.forEach((r, j) => {
      const x = gx + j * (T + TG), g = s('g', { class: 'fade' }, by);
      s('rect', { x, y: 30, width: T, height: T, rx: 3, class: r[2] ? 'f-pri' : 'f-sec' }, g);
      s('text', { x: x + T / 2, y: 30 + T / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold' }, g, String(r[0]));
      const o = s('rect', { x: x - 3, y: 27, width: T + 6, height: T + 6, rx: 4, class: 's-ter', visibility: 'hidden' }, by);
      tiles.push({ r, g, o });
    });
    gx += recs.length * (T + TG) + 24;
  });
  const f1 = s('text', { x: 20, y: 110, class: 't-fg t-bold t-xl' }, by);
  const f2 = s('text', { x: 20, y: 138, class: 't-muted' }, by);
  const isNo = r => !r[2], isWe = r => r[1] === 'Weekend', all = () => true;
  const BAY = [
    { den: isWe, num: r => isWe(r) && isNo(r), a: 'P(No Buy | Weekend) = 2 / 4 = 0.5', b: 'Bayes: (2/5)(5/15) / (4/15) = 0.1333 / 0.2667 = 0.5',
      note: 'Keep only the 4 weekend records. 2 of them are No Buy, so P(No Buy | Weekend) = 2/4 = 0.5. Bayes theorem gives the same number from the three pieces in the other steps.' },
    { den: all, num: isNo, a: 'P(No Buy) = 5 / 15 = 0.333', b: 'the prior: No Buy records over all 15',
      note: 'The prior. 5 of the 15 records are No Buy, whatever the day.' },
    { den: all, num: isWe, a: 'P(Weekend) = 4 / 15 = 0.267', b: 'the evidence: weekend records over all 15',
      note: 'The evidence. 4 of the 15 visits fell on a weekend.' },
    { den: isNo, num: r => isWe(r) && isNo(r), a: 'P(Weekend | No Buy) = 2 / 5 = 0.4', b: 'the likelihood: weekend records among the 5 No Buy',
      note: 'The likelihood. Keep only the 5 No Buy records. 2 of them (records 7 and 9) were on a weekend, so P(Weekend | No Buy) = 2/5.' },
  ];
  steps(viz('bay-steps'), ['P(No Buy | Weekend)', 'P(No Buy)', 'P(Weekend)', 'P(Weekend | No Buy)'], k => {
    const st = BAY[k];
    tiles.forEach(t => {
      t.g.classList.toggle('dim', !st.den(t.r));
      t.o.setAttribute('visibility', st.num(t.r) ? 'visible' : 'hidden');
    });
    f1.textContent = st.a;
    f2.textContent = st.b;
    role('bay-note').textContent = st.note;
  });

  // Figure 4: zero frequency and Laplace smoothing
  const LAP = [
    { b: ['2/10', '8/10', '1/10', '10/15'], n: ['2/5', '2/5', '3/5', '5/15'], bv: 0.032 / 3, nv: 0.032, bs: '0.01067', ns: '0.0320',
      note: 'The given counts. Every factor is above 0, so both products survive: 25% Buy, 75% No Buy.' },
    { b: ['3/13', '9/12', '2/12', '10/15'], n: ['3/8', '3/7', '4/7', '5/15'], bv: 25 / 1300, nv: 3 / 98, bs: '0.01923', ns: '0.0306',
      note: 'Laplace: add 1 to every count and K to the class total (K = 3 for Day, 2 for the yes/no features). Weekend | Yes becomes (2 + 1)/(10 + 3) = 3/13. The split moves toward 50/50, 38.6% against 61.4%, and the prediction stays No Buy.' },
    { b: ['2/10', '8/10', '0/10', '10/15'], n: ['2/5', '2/5', '3/5', '5/15'], bv: 0, nv: 0.032, bs: '0', ns: '0.0320', zero: 2,
      note: 'Suppose no buyer had ever come without free delivery, count 0 of 10. P(FD = No | Yes) = 0, and the whole Buy product is 0. Buy gets 0% whatever the day and the discount say.' },
    { b: ['3/13', '9/12', '1/12', '10/15'], n: ['3/8', '3/7', '4/7', '5/15'], bv: 25 / 2600, nv: 3 / 98, bs: '0.00962', ns: '0.0306',
      note: 'With Laplace the zero becomes (0 + 1)/(10 + 2) = 1/12. The Buy product is small, 0.00962, but not 0, so the other features still count: 23.9% Buy.' },
  ];
  const lp = svg(viz('lap'), 700, 220, { label: 'The Buy and No Buy products as chains of factors, and the normalized split', minWidth: 560 });
  const HEAD = ['Weekend', 'Discount = Yes', 'FD = No', 'prior'];
  const FX = i => 80 + i * 80;
  HEAD.forEach((h, i) => s('text', { x: FX(i) + 29, y: 16, 'text-anchor': 'middle', class: 't-sm' }, lp, h));
  const lLayer = s('g', {}, lp);
  steps(viz('lap-steps'), ['Given counts', 'Laplace +1', 'A zero count', 'Zero count + Laplace'], k => {
    lLayer.textContent = '';
    const st = LAP[k];
    [['Buy', st.b, st.bs, 't-pri', 30], ['No Buy', st.n, st.ns, 't-sec', 76]].forEach(([name, fs, val, tc, y]) => {
      s('text', { x: 8, y: y + 14, dy: '0.35em', class: tc + ' t-bold' }, lLayer, name);
      fs.forEach((f, i) => {
        const z = name === 'Buy' && st.zero === i;
        box(lLayer, FX(i), y, 58, 28, f, { cls: z ? 'f-bad-soft' : 'f-seg', textCls: z ? 't-bad t-bold' : 't-fg', stroke: z ? 'outline-pri' : 'box' });
        if (i < 3) s('text', { x: FX(i) + 69, y: y + 14, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg' }, lLayer, '×');
      });
      s('text', { x: FX(4) - 8, y: y + 14, dy: '0.35em', class: tc + ' t-bold t-lg' }, lLayer, '= ' + val);
    });
    const sh = st.bv / (st.bv + st.nv), BX2 = 80, BW2 = 560, wb = BW2 * sh;
    s('rect', { x: BX2, y: 130, width: wb, height: 30, class: 'f-pri' }, lLayer);
    s('rect', { x: BX2 + wb, y: 130, width: BW2 - wb, height: 30, class: 'f-sec' }, lLayer);
    s('text', { x: 8, y: 145, dy: '0.35em', class: 't-fg t-bold' }, lLayer, 'split');
    s('text', { x: BX2 + BW2 - 8, y: 145, dy: '0.35em', 'text-anchor': 'end', class: 't-on t-bold' }, lLayer, 'No Buy ' + (100 - 100 * sh).toFixed(1) + '%');
    s('text', sh > 0.12 ? { x: BX2 + 8, y: 145, dy: '0.35em', class: 't-on t-bold' } : { x: BX2, y: 180, class: 't-pri t-bold' }, lLayer, 'Buy ' + (100 * sh).toFixed(1) + '%');
    s('text', { x: BX2, y: 206, class: 't-fg' }, lLayer, sh === 0 ? 'one zero factor decides alone, the other features are ignored' : 'prediction: No Buy');
    role('lap-note').textContent = st.note;
  });
});

QV.register('s2-w5', function (q) {
  const { s, svg, table, axes, plot, arrow, steps } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const X = [[1, 2], [4, 2], [4, 5], [5, 5]];
  const MU = [3.5, 3.5];
  const C = X.map(([a, b]) => [a - MU[0], b - MU[1]]);
  const neg = v => String(v).replace('-', '−');
  const R2 = Math.SQRT1_2;
  table(viz('given'), ['Point', { html: 'X<sub>1</sub>' }, { html: 'X<sub>2</sub>' }], X.map((p, i) => [String(i + 1), String(p[0]), String(p[1])]));
  table(viz('cov-table'), ['Point', 'x̃₁', 'x̃₂', 'x̃₁²', 'x̃₂²', 'x̃₁ · x̃₂'],
    C.map(([a, b], i) => [String(i + 1), neg(a), neg(b), String(a * a), String(b * b), neg(a * b)])
      .concat([['Σ', '0', '0', '9', '9', '6'], ['÷ 3', '', '', { text: '3', cls: 'hl' }, { text: '3', cls: 'hl' }, { text: '2', cls: 'hl' }]]));
  table(viz('pc-table'), ['Point', 'centred', 'PC1'],
    C.map(([a, b], i) => [String(i + 1), `(${neg(a)}, ${neg(b)})`, { text: `${neg(a + b)}/√2 = ${neg(((a + b) * R2).toFixed(3))}`, cls: 'hl' }]));

  const origin = (g, ax, lo, hi, lo2, hi2) => {
    s('line', { x1: ax.x(lo), x2: ax.x(hi), y1: ax.y(0), y2: ax.y(0), class: 'l-grid' }, g);
    s('line', { x1: ax.x(0), x2: ax.x(0), y1: ax.y(lo2), y2: ax.y(hi2), class: 'l-grid' }, g);
  };

  // Figure 1: before and after centring
  const ce = svg(viz('centre'), 680, 300, { label: 'The four points with their mean, and the same points after subtracting the mean', minWidth: 520 });
  const L1 = axes(ce, { x: 40, y: 20, w: 240, h: 240, xd: [0, 6], yd: [0, 6], xt: [0, 1, 2, 3, 4, 5, 6], yt: [0, 1, 2, 3, 4, 5, 6], xl: 'X₁', yl: 'X₂' });
  const R1 = axes(ce, { x: 380, y: 20, w: 240, h: 240, xd: [-3, 3], yd: [-3, 3], xt: [-3, -2, -1, 0, 1, 2, 3], yt: [-3, -2, -1, 0, 1, 2, 3], xf: neg, yf: neg, grid: false, xl: 'x̃₁ = X₁ − 3.5', yl: 'x̃₂ = X₂ − 3.5' });
  origin(ce, R1, -3, 3, -3, 3);
  [[-12, 4, 'end'], [10, 14, 'start'], [-12, 4, 'end'], [10, 4, 'start']].forEach(([dx, dy, anchor], i) => {
    s('circle', { cx: L1.x(X[i][0]), cy: L1.y(X[i][1]), r: 5, class: 'f-pri' }, ce);
    s('text', { x: L1.x(X[i][0]) + dx, y: L1.y(X[i][1]) + dy, 'text-anchor': anchor, class: 't-fg t-bold' }, ce, String(i + 1));
  });
  const m = [L1.x(3.5), L1.y(3.5)];
  s('line', { x1: m[0] - 8, x2: m[0] + 8, y1: m[1] - 8, y2: m[1] + 8, class: 's-sec' }, ce);
  s('line', { x1: m[0] - 8, x2: m[0] + 8, y1: m[1] + 8, y2: m[1] - 8, class: 's-sec' }, ce);
  s('text', { x: m[0] + 12, y: m[1] - 4, class: 't-sec t-bold halo' }, ce, 'mean (3.5, 3.5)');
  [[10, 18, 'start'], [10, 4, 'start'], [-8, -10, 'end'], [8, -10, 'start']].forEach(([dx, dy, anchor], i) => {
    s('circle', { cx: R1.x(C[i][0]), cy: R1.y(C[i][1]), r: 5, class: 'f-pri' }, ce);
    s('text', { x: R1.x(C[i][0]) + dx, y: R1.y(C[i][1]) + dy, 'text-anchor': anchor, class: 't-fg halo' }, ce, `${i + 1}: (${neg(C[i][0])}, ${neg(C[i][1])})`);
  });
  s('circle', { cx: R1.x(0), cy: R1.y(0), r: 4, class: 'f-sec' }, ce);
  arrow(ce, 300, 140, 352, 140, { cls: 'a-muted', label: '− mean' });

  // Figure 2: signed rectangles
  const rc = svg(viz('rect'), 580, 330, { label: 'Rectangles from the origin to each centred point, positive areas in blue and negative in plum, summing to 6', minWidth: 480 });
  const A = axes(rc, { x: 50, y: 24, w: 300, h: 240, xd: [-3, 3], yd: [-2.4, 2.4], xt: [-3, -2, -1, 0, 1, 2, 3], yt: [-2, -1, 0, 1, 2], xf: neg, yf: neg, grid: false, xl: 'x̃₁', yl: 'x̃₂' });
  origin(rc, A, -3, 3, -2.4, 2.4);
  const LAB = [[-1.25, -0.75, 'middle'], [0.56, -0.75, 'start'], [-0.06, 0.75, 'end'], [1.0, 0.75, 'middle']];
  [3, 0, 1, 2].forEach(i => {
    const [a, b] = C[i], p = a * b;
    s('rect', { x: Math.min(A.x(0), A.x(a)), y: Math.min(A.y(0), A.y(b)), width: Math.abs(A.x(a) - A.x(0)), height: Math.abs(A.y(b) - A.y(0)), class: p > 0 ? 'f-pri-soft outline-pri' : 'f-sec-soft outline-sec' }, rc);
  });
  C.forEach(([a, b], i) => {
    const p = a * b, [lx, ly, anchor] = LAB[i];
    s('text', { x: A.x(lx), y: A.y(ly), dy: '0.35em', 'text-anchor': anchor, class: (p > 0 ? 't-pri' : 't-sec') + ' t-bold' }, rc, (p > 0 ? '+' : '−') + Math.abs(p));
    s('circle', { cx: A.x(a), cy: A.y(b), r: 4.5, class: 'f-fg' }, rc);
    s('text', { x: A.x(a) + (a < 0 ? -8 : 8), y: A.y(b) + (b < 0 ? 14 : -8), 'text-anchor': a < 0 ? 'end' : 'start', class: 't-fg' }, rc, String(i + 1));
  });
  [['sum of the signed areas', 't-fg t-bold'], ['+3.75 − 0.75 + 0.75 + 2.25', 't-fg'], ['= 6', 't-fg t-bold t-lg'], ['Cov(X₁, X₂) = 6 / 3 = 2', 't-ok t-bold t-lg']].forEach(([t, cls], i) => {
    s('text', { x: 380, y: 96 + i * 26, class: cls }, rc, t);
  });

  // Figure 3: characteristic polynomial
  const po = svg(viz('poly'), 560, 284, { label: 'The parabola lambda squared minus 6 lambda plus 5, crossing zero at lambda 1 and 5', minWidth: 460 });
  const P = axes(po, { x: 60, y: 24, w: 460, h: 200, xd: [-0.5, 6.5], yd: [-5, 12], xt: [0, 1, 2, 3, 4, 5, 6], yt: [-4, 0, 4, 8, 12], yf: neg, xl: 'λ', yl: 'det(S − λI) = λ² − 6λ + 5' });
  s('line', { x1: P.x(-0.5), x2: P.x(6.5), y1: P.y(0), y2: P.y(0), class: 's-muted' }, po);
  plot(po, P, l => l * l - 6 * l + 5, -0.5, 6.5, 140, 's-pri');
  s('text', { x: P.x(1.4), y: P.y(10.4), class: 't-fg' }, po, 'det [3 − λ, 2; 2, 3 − λ] = (3 − λ)² − 4');
  [[1, 'λ₂ = 1', 'end', -8], [5, 'λ₁ = 5', 'start', 8]].forEach(([l, t, anchor, dx]) => {
    s('circle', { cx: P.x(l), cy: P.y(0), r: 6, class: 'f-ok' }, po);
    s('text', { x: P.x(l) + dx, y: P.y(0) + 20, 'text-anchor': anchor, class: 't-ok t-bold t-lg' }, po, t);
  });
  s('circle', { cx: P.x(3), cy: P.y(-4), r: 3.5, class: 'f-muted' }, po);
  s('text', { x: P.x(3), y: P.y(-4) - 10, 'text-anchor': 'middle', class: 't-muted' }, po, 'λ = 3: −4');

  // Figure 4: projection on u1 or u2
  const pr = svg(viz('proj'), 700, 300, { label: 'Centred points projected on the chosen eigenvector, and the projected values on a number line', minWidth: 560 });
  const Q = axes(pr, { x: 40, y: 24, w: 280, h: 240, xd: [-3.5, 3.5], yd: [-3, 3], xt: [-3, -2, -1, 0, 1, 2, 3], yt: [-3, -2, -1, 0, 1, 2, 3], xf: neg, yf: neg, grid: false, xl: 'x̃₁', yl: 'x̃₂' });
  origin(pr, Q, -3.5, 3.5, -3, 3);
  const pLayer = s('g', {}, pr);
  const NL = { x0: 400, x1: 680, y: 130 };
  const nx = v => NL.x0 + (v + 3) / 6 * (NL.x1 - NL.x0);
  s('line', { x1: NL.x0, x2: NL.x1, y1: NL.y, y2: NL.y, class: 'l-axis' }, pr);
  [-3, -2, -1, 0, 1, 2, 3].forEach(v => {
    s('line', { x1: nx(v), x2: nx(v), y1: NL.y - 4, y2: NL.y + 4, class: 'l-axis' }, pr);
    s('text', { x: nx(v), y: NL.y + 54, 'text-anchor': 'middle', class: 't-sm' }, pr, neg(v));
  });
  const nlLayer = s('g', {}, pr);
  const DIRS = [
    { u: [R2, R2], name: 'PC1 along u₁ = (0.7071, 0.7071)', varTxt: 'variance = (8 + 0.5 + 2 + 4.5) / 3 = 5 = λ₁', share: 'share 5 / 6 = 83.3%',
      note: 'Along u₁ = (0.7071, 0.7071) the projections are −2.828, −0.707, 1.414 and 2.121. Their variance is 15/3 = 5 = λ₁, which is 83.3% of the total 6.' },
    { u: [R2, -R2], name: 'PC2 along u₂ = (0.7071, −0.7071)', varTxt: 'variance = (0.5 + 2 + 0.5 + 0) / 3 = 1 = λ₂', share: 'share 1 / 6 = 16.7%',
      note: 'Along u₂ = (0.7071, −0.7071) the projections are −0.707, 1.414, −0.707 and 0. Points 1 and 3 land on the same value. The variance is 3/3 = 1 = λ₂, the 16.7% that PC1 drops.' },
  ];
  steps(viz('proj-steps'), ['PC1, along u₁', 'PC2, along u₂'], k => {
    pLayer.textContent = '';
    nlLayer.textContent = '';
    const d = DIRS[k], [c, sn] = d.u;
    const tm = 3 / Math.abs(sn);
    s('line', { x1: Q.x(-tm * c), y1: Q.y(-tm * sn), x2: Q.x(tm * c), y2: Q.y(tm * sn), class: 's-pri' }, pLayer);
    s('text', { x: Q.x(0.9 * tm * c) + 10, y: Q.y(0.9 * tm * sn) + (sn > 0 ? 4 : 0), class: 't-pri t-bold halo' }, pLayer, k ? 'u₂' : 'u₁');
    const vals = C.map(([a, b]) => a * c + b * sn);
    C.forEach(([a, b], i) => {
      const p = vals[i];
      s('line', { x1: Q.x(a), y1: Q.y(b), x2: Q.x(p * c), y2: Q.y(p * sn), class: 's-muted dash', style: 'stroke-width: 1' }, pLayer);
      s('circle', { cx: Q.x(p * c), cy: Q.y(p * sn), r: 3.5, class: 'f-pri' }, pLayer);
      s('circle', { cx: Q.x(a), cy: Q.y(b), r: 4.5, class: 'f-fg' }, pLayer);
      s('text', { x: Q.x(a) + (a < 0 ? -8 : 8), y: Q.y(b) + (b < 0 || i === 3 ? 16 : -8), 'text-anchor': a < 0 ? 'end' : 'start', class: 't-fg halo' }, pLayer, String(i + 1));
    });
    s('text', { x: NL.x0, y: 30, class: 't-fg t-bold' }, nlLayer, d.name);
    const groups = [];
    vals.forEach((v, i) => {
      const r = Math.round(v * 1000) / 1000, g = groups.find(x => x.v === r);
      if (g) g.pts.push(i + 1); else groups.push({ v: r, pts: [i + 1] });
    });
    groups.sort((a, b) => a.v - b.v).forEach((g, gi) => {
      g.pts.forEach((p, j) => {
        const y = NL.y - j * 20;
        s('circle', { cx: nx(g.v), cy: y, r: 8, class: 'f-pri' }, nlLayer);
        s('text', { x: nx(g.v), y, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-bold t-sm' }, nlLayer, String(p));
      });
      const above = gi % 2 === 1;
      s('text', { x: nx(g.v), y: above ? NL.y - 20 * g.pts.length - 4 : NL.y + 24, 'text-anchor': 'middle', class: 't-pri t-bold' }, nlLayer, neg(g.v.toFixed(3)));
    });
    s('text', { x: NL.x0, y: 226, class: 't-fg' }, nlLayer, d.varTxt);
    s('text', { x: NL.x0, y: 248, class: k ? 't-muted t-bold' : 't-ok t-bold' }, nlLayer, d.share);
    role('proj-note').textContent = d.note;
  });
});

QV.register('s2-w6', function (q) {
  const { s, svg, table, axes, plot, steps, box, arrow } = QV;
  const viz = name => q.querySelector(`[data-viz="${name}"]`);
  const role = name => q.querySelector(`[data-role="${name}"]`);
  const D = [
    ['High', 'Good', 'Yes', 1], ['High', 'Bad', 'Yes', 1], ['High', 'Good', 'No', 1], ['Medium', 'Good', 'Yes', 1],
    ['Medium', 'Bad', 'No', 0], ['Medium', 'Good', 'No', 1], ['Medium', 'Bad', 'Yes', 0], ['Low', 'Good', 'No', 0],
    ['Low', 'Bad', 'No', 0], ['Low', 'Good', 'Yes', 1], ['Low', 'Bad', 'Yes', 1], ['High', 'Bad', 'No', 1],
  ];
  const H = (y, n) => [y, n].reduce((a, k) => (k ? a - k / (y + n) * Math.log2(k / (y + n)) : a), 0);
  const L = t => ({ text: t, cls: 'l' });
  table(viz('given'), ['#', L('Income'), L('Credit'), L('Employed'), L('Approve')], D.map((r, i) => [String(i + 1), L(r[0]), L(r[1]), L(r[2]), L(r[3] ? 'Yes' : 'No')]));
  const igt = table(viz('ig-table'), [L('Attribute'), L('Value: Yes/No (entropy)'), 'Weighted E', 'IG'], [
    [L('Income'), L('High 4/0 (0), Medium 2/2 (1), Low 2/2 (1)'), '4/12·1 + 4/12·1 = 0.667', { text: '0.252', cls: 'hl' }],
    [L('Credit'), L('Good 5/1 (0.650), Bad 3/3 (1)'), '6/12·0.650 + 6/12·1 = 0.825', '0.093'],
    [L('Employed'), L('Yes 5/1 (0.650), No 3/3 (1)'), '0.825', '0.093'],
  ]);
  igt.rows[0].classList.add('on');

  // Figure 1: binary entropy curve with the nodes of this tree
  const en = svg(viz('ent'), 600, 290, { label: 'Binary entropy against the share of Yes, with the dataset at 0.918 and the child nodes marked', minWidth: 480 });
  const E = axes(en, { x: 60, y: 24, w: 500, h: 200, xd: [0, 1], yd: [0, 1.1], xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 0.25, 0.5, 0.75, 1], xl: 'share of Yes in the node, p₊', yl: 'entropy E(S), bits' });
  plot(en, E, p => H(p, 1 - p), 0, 1, 200, 's-pri');
  [
    [0.5, 1, '2/2 and 3/3 nodes: 1', 'middle', 0, -12],
    [5 / 6, H(5, 1), '5/1 nodes: 0.650', 'end', -10, 16],
    [1, 0, 'High 4/0: 0', 'end', -10, -10],
  ].forEach(([p, e, t, anchor, dx, dy]) => {
    s('circle', { cx: E.x(p), cy: E.y(e), r: 5, class: 'f-ter' }, en);
    s('text', { x: E.x(p) + dx, y: E.y(e) + dy, 'text-anchor': anchor, class: 't-ter t-bold halo' }, en, t);
  });
  s('circle', { cx: E.x(8 / 12), cy: E.y(H(8, 4)), r: 6, class: 'f-pri' }, en);
  s('text', { x: E.x(8 / 12) + 10, y: E.y(H(8, 4)) - 8, class: 't-pri t-bold halo' }, en, 'dataset 8/4: 0.918');

  // Figure 2: the 12 rows split by each attribute
  const ig = svg(viz('ig'), 760, 326, { label: 'The 12 rows split by Income, Credit and Employed, with the entropy of each group and the information gain of each attribute', minWidth: 600 });
  const TS = 22, TG = 3;
  const ATTR = [['Income', 0, ['High', 'Medium', 'Low']], ['Credit', 1, ['Good', 'Bad']], ['Employed', 2, ['Yes', 'No']]];
  ATTR.forEach(([name, col, vals], ai) => {
    const y0 = 16 + ai * 104;
    if (ai) s('line', { x1: 8, x2: 752, y1: y0 - 12, y2: y0 - 12, class: 's-line' }, ig);
    s('text', { x: 10, y: y0 + 36, class: 't-fg t-bold t-lg' }, ig, name);
    let gx = 110, wE = 0;
    vals.forEach(v => {
      const idx = D.map((r, i) => i).filter(i => D[i][col] === v);
      const yes = idx.filter(i => D[i][3]).length, no = idx.length - yes, e = H(yes, no);
      wE += idx.length / 12 * e;
      s('text', { x: gx, y: y0 + 8, class: 't-fg t-bold' }, ig, v);
      idx.forEach((i, j) => {
        const x = gx + j * (TS + TG);
        s('rect', { x, y: y0 + 16, width: TS, height: TS, rx: 3, class: D[i][3] ? 'f-pri' : 'f-sec' }, ig);
        s('text', { x: x + TS / 2, y: y0 + 16 + TS / 2, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-sm' }, ig, String(i + 1));
      });
      s('text', { x: gx, y: y0 + 58, class: 't-muted' }, ig, `${yes}/${no}, E = ${e % 1 ? e.toFixed(3) : e}`);
      gx += idx.length * (TS + TG) + 26;
    });
    const gain = H(8, 4) - wE, win = ai === 0;
    s('text', { x: 500, y: y0 + 18, class: 't-fg' }, ig, 'weighted E = ' + wE.toFixed(3));
    s('rect', { x: 500, y: y0 + 28, width: gain / 0.3 * 160, height: 16, class: win ? 'f-ok' : 'f-muted' }, ig);
    s('text', { x: 506 + gain / 0.3 * 160, y: y0 + 36, dy: '0.35em', class: (win ? 't-ok' : 't-fg') + ' t-bold' }, ig, 'IG = ' + gain.toFixed(3) + (win ? ', root' : ''));
    s('text', { x: 500, y: y0 + 62, class: 't-sm' }, ig, `0.918 − ${wE.toFixed(3)}`);
  });

  // Tree drawing shared by figures 3 and 4
  const NODES = {
    root: { x: 370, y: 16, t: 'Income', sub: '8 Yes / 4 No' },
    high: { x: 120, y: 116, leaf: 'Yes', sub: '[4/0]' },
    credit: { x: 370, y: 116, t: 'Credit', sub: '2 Yes / 2 No' },
    emp: { x: 610, y: 116, t: 'Employed', sub: '2 Yes / 2 No' },
    cg: { x: 305, y: 216, leaf: 'Yes', sub: '[2/0]' },
    cb: { x: 435, y: 216, leaf: 'No', sub: '[0/2]' },
    ey: { x: 545, y: 216, leaf: 'Yes', sub: '[2/0]' },
    en: { x: 675, y: 216, leaf: 'No', sub: '[0/2]' },
  };
  const EDGES = [['root', 'high', 'High'], ['root', 'credit', 'Medium'], ['root', 'emp', 'Low'], ['credit', 'cg', 'Good'], ['credit', 'cb', 'Bad'], ['emp', 'ey', 'Yes'], ['emp', 'en', 'No']];
  const NH = 40;
  const nw = nd => (nd.leaf ? 96 : 130);
  function drawTree(host) {
    const eg = {}, ng = {}, ring = {}, hot = {};
    EDGES.forEach(([a, b, lab]) => {
      const p = NODES[a], c = NODES[b], g = s('g', { class: 'fade' }, host);
      const mxp = (p.x + c.x) / 2, myp = (p.y + NH + c.y) / 2;
      s('line', { x1: p.x, y1: p.y + NH, x2: c.x, y2: c.y, class: 's-muted' }, g);
      hot[b] = s('line', { x1: p.x, y1: p.y + NH, x2: c.x, y2: c.y, class: 's-pri', style: 'stroke-width: 4', visibility: 'hidden' }, g);
      s('text', { x: mxp, y: myp, dy: '0.35em', 'text-anchor': 'middle', class: 't-fg t-bold halo' }, g, lab);
      eg[b] = g;
    });
    Object.entries(NODES).forEach(([k, nd]) => {
      const g = s('g', { class: 'fade' }, host), w = nw(nd);
      box(g, nd.x - w / 2, nd.y, w, NH, (nd.leaf || nd.t) + '\n' + nd.sub, nd.leaf
        ? { cls: nd.leaf === 'Yes' ? 'f-pri' : 'f-sec', textCls: 't-on t-bold' }
        : { cls: 'f-surface', textCls: 't-fg' });
      ring[k] = s('rect', { x: nd.x - w / 2 - 4, y: nd.y - 4, width: w + 8, height: NH + 8, rx: 8, class: 'f-none outline-pri', style: 'stroke-width: 2.5', visibility: 'hidden' }, g);
      ng[k] = g;
    });
    return { eg, ng, ring, hot };
  }

  // Figure 3: build steps with candidate splits
  const tr = svg(viz('tree'), 760, 430, { label: 'The finished ID3 tree with Income at the root, Credit under Medium and Employed under Low, and the candidate splits of the selected node', minWidth: 600 });
  const T3 = drawTree(tr);
  const panel = s('g', {}, tr);
  s('line', { x1: 8, x2: 752, y1: 278, y2: 278, class: 's-line' }, tr);
  const split = (x, title, win, groups) => {
    s('text', { x, y: 304, class: (win ? 't-ok' : 't-fg') + ' t-bold' }, panel, title);
    let gx = x;
    groups.forEach(([v, rows]) => {
      s('text', { x: gx, y: 328, class: 't-fg' }, panel, v);
      rows.forEach((r, j) => {
        const tx = gx + j * 30;
        s('rect', { x: tx, y: 336, width: 26, height: 26, rx: 3, class: D[r - 1][3] ? 'f-pri' : 'f-sec' }, panel);
        s('text', { x: tx + 13, y: 349, dy: '0.35em', 'text-anchor': 'middle', class: 't-on t-sm' }, panel, String(r));
      });
      const y = rows.filter(r => D[r - 1][3]).length;
      s('text', { x: gx, y: 380, class: 't-muted' }, panel, `${y}/${rows.length - y}, E = ${QV.fmt(H(y, rows.length - y), 3)}`);
      gx += 110;
    });
  };
  const TSTEPS = [
    { dim: [], focus: [],
      note: 'The finished tree. Every leaf is pure, so the tree classifies all 12 rows correctly. Income is asked first, and the second question depends on the branch.',
      draw: () => {
        [['Root: IG Income 0.252 > Credit 0.093 = Employed 0.093', 't-fg'], ['Medium: IG Credit 1.0 > Employed 0', 't-fg'], ['Low: IG Employed 1.0 > Credit 0', 't-fg'], ['High is pure (4/0), so it is a leaf at once', 't-muted']].forEach(([t, c], i) => s('text', { x: 20, y: 304 + i * 26, class: c }, panel, t));
      } },
    { dim: ['cg', 'cb', 'ey', 'en'], focus: ['root'],
      note: 'Root: Income has the highest IG, 0.252 (Figure 2). Its High branch holds 4 Yes and 0 No, a pure node, so it becomes a Yes leaf. Medium and Low hold 2/2 each and must be split again.',
      draw: () => {
        split(20, 'Income, IG = 0.252', true, [['High', [1, 2, 3, 12]], ['Medium', [4, 5, 6, 7]], ['Low', [8, 9, 10, 11]]]);
      } },
    { dim: ['ey', 'en', 'emp'], focus: ['credit'],
      note: 'Income = Medium: rows 4-7, 2 Yes / 2 No, E = 1. Credit splits them into Good 2/0 and Bad 0/2, both pure, so IG = 1 − 0 = 1.0. Employed gives 1/1 and 1/1, IG = 0. Credit wins.',
      draw: () => {
        split(20, 'Credit, IG = 1.0', true, [['Good', [4, 6]], ['Bad', [5, 7]]]);
        split(400, 'Employed, IG = 0', false, [['Yes', [4, 7]], ['No', [5, 6]]]);
      } },
    { dim: ['cg', 'cb', 'credit'], focus: ['emp'],
      note: 'Income = Low: rows 8-11, 2 Yes / 2 No, E = 1. Employed splits them into Yes 2/0 and No 0/2, IG = 1.0. Credit gives 1/1 and 1/1, IG = 0. Employed wins, a different question than in the Medium branch.',
      draw: () => {
        split(20, 'Employed, IG = 1.0', true, [['Yes', [10, 11]], ['No', [8, 9]]]);
        split(400, 'Credit, IG = 0', false, [['Good', [8, 10]], ['Bad', [9, 11]]]);
      } },
  ];
  steps(viz('tree-steps'), ['Full tree', 'Root: Income', 'Medium: Credit', 'Low: Employed'], k => {
    const st = TSTEPS[k];
    Object.keys(NODES).forEach(key => {
      T3.ng[key].classList.toggle('dim', st.dim.indexOf(key) >= 0);
      if (T3.eg[key]) T3.eg[key].classList.toggle('dim', st.dim.indexOf(key) >= 0);
      T3.ring[key].setAttribute('visibility', st.focus.indexOf(key) >= 0 ? 'visible' : 'hidden');
    });
    panel.textContent = '';
    st.draw();
    role('tree-note').textContent = st.note;
  });

  // Figure 4: prediction paths
  const pd = svg(viz('pred'), 760, 300, { label: 'The ID3 tree with the path of the selected customer highlighted from the root to its leaf', minWidth: 600 });
  const T4 = drawTree(pd);
  const pText = s('text', { x: 380, y: 288, 'text-anchor': 'middle', class: 't-ok t-bold t-lg' }, pd);
  const PRED = [
    { path: ['root', 'emp', 'en'], text: 'Income = Low → Employed = No → No',
      note: '{Low, Good, No}: the root asks Income, and Low leads to the Employed node. Employed = No leads to the No leaf [0/2]. Credit = Good is never used.' },
    { path: ['root', 'credit', 'cb'], text: 'Income = Medium → Credit = Bad → No',
      note: '{Medium, Bad, Yes}: Income = Medium leads to the Credit node, and Credit = Bad leads to the No leaf [0/2]. Employed = Yes is never used.' },
  ];
  steps(viz('pred-steps'), ['{Low, Good, No}', '{Medium, Bad, Yes}'], k => {
    const st = PRED[k];
    Object.keys(NODES).forEach(key => {
      const on = st.path.indexOf(key) >= 0;
      T4.ng[key].classList.toggle('dim', !on);
      T4.ring[key].setAttribute('visibility', on ? 'visible' : 'hidden');
      if (T4.eg[key]) {
        T4.eg[key].classList.toggle('dim', !on);
        T4.hot[key].setAttribute('visibility', on ? 'visible' : 'hidden');
      }
    });
    pText.textContent = st.text;
    role('pred-note').textContent = st.note;
  });
});

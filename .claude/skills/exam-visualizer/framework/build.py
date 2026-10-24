"""Assemble a visualizer page from a project folder.

Usage:
  python3 -I build.py <project_dir>                                  # full page -> project.json "out"
  python3 -I build.py <project_dir> --only s2-w --out <path.html>    # one or more scopes, for checking
"""
import argparse
import html
import json
import os
import re
import subprocess
import sys
import tempfile

FRAMEWORK = os.path.dirname(os.path.abspath(__file__))


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def lint(scope, frag, js, problems, warnings):
    for name, text in ((scope + '.html', frag), (scope + '.js', js)):
        for i, ln in enumerate(text.split('\n'), 1):
            if '\t' in ln:
                problems.append(f'{name}:{i}: tab character (use spaces)')
            if re.search(r'#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(', ln) and 'data-color' not in ln and not re.search(r'href="#', ln):
                warnings.append(f'{name}:{i}: literal color; use theme classes/tokens or mark the line with data-color')
            if re.search(r'getBBox|getBoundingClientRect|clientWidth|offsetWidth|offsetHeight', ln):
                problems.append(f'{name}:{i}: layout measurement; compute positions from numbers instead')
            if re.search(r'document\.(getElementById|querySelector)', ln):
                warnings.append(f'{name}:{i}: document-level lookup; query inside the article element instead')
    if re.search(r'<script|<style', frag):
        problems.append(f'{scope}.html: contains <script> or <style>; put code in {scope}.js and use shell classes')
    ids = re.findall(r'\sid="([^"]+)"', frag)
    arts = re.findall(r'<article class="q"[^>]*\sid="([^"]+)"', frag)
    for a in arts:
        if not re.fullmatch(re.escape(scope) + r'\d+', a):
            problems.append(f'{scope}.html: article id {a} does not match {scope}<number>')
    extra = [i for i in ids if i not in arts]
    if extra:
        problems.append(f'{scope}.html: element ids other than article ids: {extra[:5]} (use data-viz/data-role attributes)')
    regs = re.findall(r"QV\.register\(\s*'([^']+)'", js)
    for a in arts:
        if a not in regs:
            warnings.append(f'{scope}: article {a} has no QV.register init')
    for r in regs:
        if r not in arts:
            problems.append(f'{scope}: QV.register({r!r}) has no matching article')
    if js.strip():
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as t:
            t.write(js)
        res = subprocess.run(['node', '--check', t.name], capture_output=True, text=True)
        os.unlink(t.name)
        if res.returncode:
            problems.append(f'{scope}.js: syntax error\n' + res.stderr.strip())
    return ids


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('project', help='project folder with project.json and parts/')
    ap.add_argument('--only', help='comma-separated scopes, e.g. s2-w or s1-mc,s1-w')
    ap.add_argument('--out', help='output html path (default: project.json "out")')
    args = ap.parse_args()

    proj = os.path.abspath(args.project)
    cfg = json.loads(read(os.path.join(proj, 'project.json')))
    parts_dir = os.path.join(proj, 'parts')
    scopes = [f"{sec['id']}-{p['key']}" for sec in cfg['sections'] for p in cfg['parts']]
    only = args.only.split(',') if args.only else scopes
    unknown = [s for s in only if s not in scopes]
    if unknown:
        sys.exit(f'unknown scopes {unknown}; known: {scopes}')
    if args.only and not args.out:
        sys.exit('--only needs --out, so a partial build never overwrites the full page')
    out = os.path.abspath(args.out) if args.out else os.path.join(proj, cfg.get('out', 'dist/index.html'))

    shell = read(os.path.join(FRAMEWORK, 'shell.html'))
    problems, warnings, all_ids = [], [], []
    sections, scripts = [], []
    for sec in cfg['sections']:
        body = []
        for p in cfg['parts']:
            scope = f"{sec['id']}-{p['key']}"
            hp, jp = os.path.join(parts_dir, scope + '.html'), os.path.join(parts_dir, scope + '.js')
            if scope not in only or not os.path.exists(hp):
                continue
            frag = read(hp)
            js = read(jp) if os.path.exists(jp) else ''
            all_ids += lint(scope, frag, js, problems, warnings)
            body.append(f'<h3 class="part-title">{html.escape(p["title"])}</h3>\n{frag.strip()}')
            if js.strip():
                scripts.append(f"<script>\n/* {scope} */\ntry {{\n{js.rstrip()}\n}} catch (e) {{ QV.fail('{scope}', e); }}\n</script>")
        if not body:
            continue
        sections.append(
            f'<section class="sample" id="{sec["id"]}" data-tab="{html.escape(sec.get("tab", sec["id"]))}" hidden>\n'
            f'<div class="sample-head">\n<h2 class="sample-title">{html.escape(sec["title"])}</h2>\n'
            f'<p class="sample-meta">{html.escape(sec.get("meta", ""))}</p>\n'
            f'<nav class="qindex" data-role="qindex" aria-label="{html.escape(sec["title"])} questions"></nav>\n</div>\n'
            + '\n'.join(body) + '\n</section>')
    dupes = sorted({i for i in all_ids if all_ids.count(i) > 1})
    if dupes:
        problems.append(f'duplicate ids: {dupes}')

    client = {'artifact': cfg.get('artifact', ''), 'tabLabel': cfg.get('tabLabel', 'Section'),
              'parts': [{k: p.get(k) for k in ('key', 'title', 'index', 'chip')} for p in cfg['parts']]}
    config_tag = '<script type="application/json" id="qv-config">' + json.dumps(client, ensure_ascii=False).replace('</', '<\\/') + '</script>'
    page = shell
    for key in ('TITLE', 'KICKER', 'LEDE', 'FOOT'):
        page = page.replace('{{' + key + '}}', html.escape(cfg.get(key.lower(), '')))
    page = page.replace('{{TABLABEL}}', html.escape(cfg.get('tabLabel', 'Section')))
    page = page.replace('<!--CONFIG-->', config_tag)
    page = page.replace('<!--SAMPLES-->', '\n'.join(sections)).replace('<!--PARTS-->', '\n'.join(scripts))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(page)
    for w in warnings:
        print('WARN', w)
    for p in problems:
        print('ERROR', p)
    print(f'wrote {out} ({len(page) // 1024} KB, {len(sections)} sections, {len(scripts)} part scripts, {len(problems)} errors, {len(warnings)} warnings)')
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()

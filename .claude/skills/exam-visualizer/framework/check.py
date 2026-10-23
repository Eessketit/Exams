import argparse
import html
import json
import os
import re
import subprocess
import shutil
import sys
import tempfile

CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
ROOT = os.path.dirname(os.path.abspath(__file__))
CHUNK = 1600


def chrome(args, timeout=300):
    base = [CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
            '--no-default-browser-check', '--virtual-time-budget=4000', '--run-all-compositor-stages-before-draw']
    prof = tempfile.mkdtemp(prefix='qv-chrome-')
    try:
        return subprocess.run(base + [f'--user-data-dir={prof}'] + args, capture_output=True, text=True, timeout=timeout)
    finally:
        shutil.rmtree(prof, ignore_errors=True)


def dump(url, width, height=2000):
    res = chrome([f'--window-size={width},{height}', '--dump-dom', url])
    m = re.search(r'<pre id="qv-report"[^>]*>(.*?)</pre>', res.stdout, re.S)
    if not m:
        return {'errors': [{'where': 'check', 'msg': 'no report; page script did not finish'}], 'height': height}
    return json.loads(html.unescape(m.group(1)))


def shot(url, width, height, out):
    chrome([f'--window-size={width},{height}', f'--screenshot={out}', url])
    files = []
    if height <= CHUNK + 200:
        return [out]
    k = 0
    for y in range(0, height, CHUNK):
        k += 1
        part = out.replace('.png', f'-{k}.png')
        h = min(CHUNK, height - y)
        # sips ignores a zero offset and centers the crop instead
        subprocess.run(['sips', '-c', str(h), str(width), '--cropOffset', str(max(y, 1)), '0', out, '--out', part], capture_output=True)
        files.append(part)
    os.unlink(out)
    return files


def main():
    ap = argparse.ArgumentParser(description='Run a built page in headless Chrome: script errors, plus optional screenshots per question')
    ap.add_argument('page', help='built html, e.g. <project>/dist/s2-w.html')
    ap.add_argument('ids', nargs='*', help='question ids to screenshot, e.g. s2-w5')
    ap.add_argument('--modes', default='900:light,500:dark', help='width:theme pairs for screenshots (headless Chrome cannot go below 500px)')
    args = ap.parse_args()
    path = os.path.abspath(args.page)
    url = 'file://' + path
    rep = dump(url + '?all=1', 1000)
    print('ALL:', json.dumps({k: rep.get(k) for k in ('articles', 'errors', 'missingInit', 'orphanInit', 'overflow')}, ensure_ascii=False))
    shots = os.path.join(os.path.dirname(path), 'shots')
    os.makedirs(shots, exist_ok=True)
    for qid in args.ids:
        for mode in args.modes.split(','):
            w, theme = mode.split(':')
            w = int(w)
            u = f'{url}?q={qid}&theme={theme}'
            r = dump(u, w)
            if r.get('errors') or not r.get('found', True) or r.get('overflow'):
                print(qid, mode, 'REPORT', json.dumps({k: r.get(k) for k in ('errors', 'found', 'overflow')}, ensure_ascii=False))
            files = shot(u, w, int(r.get('height', 2000)) + 20, os.path.join(shots, f'{qid}-{w}-{theme}.png'))
            print(qid, mode, 'height', r.get('height'), '->', ' '.join(files))


if __name__ == '__main__':
    main()

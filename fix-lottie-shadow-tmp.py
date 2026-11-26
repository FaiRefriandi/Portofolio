import zipfile, json, os
SRC = 'public/assets/cat-white.lottie'
OLD = [0.599679146561, 0.599679146561, 0.75925245098, 1]
NEW = [0.5411764705882353, 0.5411764705882353, 0.5725490196078431, 1]
def close(a, b):
    return isinstance(a, list) and len(a) == len(b) and all(abs(x - y) < 0.001 for x, y in zip(a, b))
count = [0]
def fix(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == 'c' and isinstance(v, dict) and 'k' in v and close(v['k'], OLD):
                v['k'] = list(NEW)
                count[0] += 1
            else:
                fix(v)
    elif isinstance(o, list):
        for v in o:
            fix(v)
z = zipfile.ZipFile(SRC)
items = {n: z.read(n) for n in z.namelist()}
z.close()
anim = 'animations/9c3511f1-7f67-4562-bbf8-ff744978bbd8.json'
d = json.loads(items[anim])
for l in d.get('layers', []):
    if '0.599679146561' in json.dumps(l):
        print('layer has old color:', l.get('nm'))
fix(d)
print('replacements:', count[0])
items[anim] = json.dumps(d).encode()
tmp = SRC + '.tmp'
with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as out:
    for n, data in items.items():
        out.writestr(n, data)
os.replace(tmp, SRC)
z2 = zipfile.ZipFile(SRC)
d2 = json.loads(z2.read(anim))
print('verify old remaining:', json.dumps(d2).count('0.599679146561'))
print('verify new count:', json.dumps(d2).count('0.5411764705882353'))
print('done')

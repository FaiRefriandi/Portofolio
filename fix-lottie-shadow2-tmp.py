import zipfile, json, os
SRC = 'public/assets/cat-white.lottie'
NEW = [0.5411764705882353, 0.5411764705882353, 0.5725490196078431, 1]
def is_shadow(k):
    if not (isinstance(k, list) and len(k) == 4 and all(isinstance(x, (int, float)) for x in k)):
        return False
    return '#%02x%02x%02x' % tuple(round(x * 255) for x in k[:3]) == '#9999c2'
count = [0]
def fix(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == 'c' and isinstance(v, dict) and 'k' in v and is_shadow(v['k']):
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
fix(d)
print('replacements:', count[0])
items[anim] = json.dumps(d).encode()
tmp = SRC + '.tmp'
with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as out:
    for n, data in items.items():
        out.writestr(n, data)
os.replace(tmp, SRC)
d2 = json.loads(zipfile.ZipFile(SRC).read(anim))
remaining = [0]
def check(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == 'c' and isinstance(v, dict) and 'k' in v and is_shadow(v['k']):
                remaining[0] += 1
            else:
                check(v)
    elif isinstance(o, list):
        for v in o:
            check(v)
check(d2)
print('verify shadow colors remaining:', remaining[0])
print('done')

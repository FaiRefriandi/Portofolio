import zipfile, json
z = zipfile.ZipFile('public/assets/cat-white.lottie')
d = json.loads(z.read('animations/9c3511f1-7f67-4562-bbf8-ff744978bbd8.json'))
def hexcol(k):
    if isinstance(k, list) and len(k) == 4 and all(isinstance(x, (int, float)) for x in k):
        return '#%02x%02x%02x' % tuple(round(x * 255) for x in k[:3]) + ' a=' + str(k[3])
    return repr(k)[:120]
def walk(items, prefix):
    for it in items or []:
        t = it.get('ty')
        nm = it.get('nm', '')
        if t == 'fl':
            print(prefix + ' FILL ' + nm + ' ' + hexcol(it.get('c', {}).get('k')))
        elif t == 'st':
            print(prefix + ' STROKE ' + nm + ' ' + hexcol(it.get('c', {}).get('k')))
        elif t == 'gr':
            walk(it.get('it'), prefix + '/' + nm)
        elif t == 'tr':
            o = it.get('o', {}).get('k')
            if o != 100 and o is not None:
                print(prefix + ' TRANSFORM ' + nm + ' opacity=' + repr(o))
for l in d.get('layers', []):
    print('LAYER ' + str(l.get('nm')) + ' opacity=' + repr(l.get('ks', {}).get('o', {}).get('k')))
    walk(l.get('shapes'), '')
print('done')

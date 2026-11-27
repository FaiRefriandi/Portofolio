// Fix @animate-ui/react untuk React 18.
// @animate-ui/react memanggil React.use() yang cuma ada di React 19.
// Script ini mengganti React.use( jadi React.useContext( di file yang memakainya.
// Idempotent: React.useContext( tidak mengandung "React.use(", jadi aman dijalankan ulang.
// Dijalankan otomatis sebagai postinstall (lihat package.json).
const fs = require('fs');
const path = require('path');

const files = [
  'node_modules/@animate-ui/react/dist/utils/motion/index.js',
  'node_modules/@animate-ui/react/dist/icons/index.js',
];

let patched = 0;
for (const rel of files) {
  const full = path.join(__dirname, '..', rel);
  if (!fs.existsSync(full)) {
    console.log('fix-animate-ui-react18: skip, tidak ditemukan: ' + rel);
    continue;
  }
  const before = fs.readFileSync(full, 'utf8');
  const after = before.split('React.use(').join('React.useContext(');
  if (after !== before) {
    fs.writeFileSync(full, after, 'utf8');
    patched++;
    console.log('fix-animate-ui-react18: patched ' + rel);
  } else {
    console.log('fix-animate-ui-react18: sudah patched ' + rel);
  }
}
console.log('fix-animate-ui-react18: selesai, ' + patched + ' file diubah');

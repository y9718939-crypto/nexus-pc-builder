import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'www');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

function copyFile(source, destination) {
  const from = path.join(root, source);
  const to = path.join(out, destination);
  if (!fs.existsSync(from)) throw new Error('Required project file missing: ' + source);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

copyFile('index.html', 'index.html');
copyFile('builder.html', 'builder.html');

for (const name of ['base.css','layout.css','components.css','builder.css','modal.css','responsive.css']) {
  copyFile(name, 'css/' + name);
}
for (const name of ['cpus.js','gpus.js','motherboards.js','ram.js','storage.js','psu.js','cases.js','coolers.js','prebuilts.js']) {
  copyFile(name, 'js/data/' + name);
}
for (const name of ['catalog.js','priceCalculator.js','compat.js','state.js','storageManager.js','search.js','ui.js','modal.js']) {
  copyFile(name, 'js/modules/' + name);
}
copyFile('main.js', 'js/main.js');

for (const page of ['index.html','builder.html']) {
  const file = path.join(out, page);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replaceAll('href="prebuilt.html"', 'href="builder.html"');
  html = html.replaceAll('href="about.html"', 'href="index.html"');
  html = html.replace(
    '<meta name="theme-color" content="#0A0A0F">',
    '<meta name="theme-color" content="#0A0A0F"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes">'
  );
  fs.writeFileSync(file, html);
}
console.log('Nexus web files prepared in www/');

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'public');

const filesToCopy = [
  'index.html',
  'admin.html',
  'catalog.html',
  'style.css',
  'script.js',
  'products.json',
  'hero.jpeg',
  'out.png',
  'atelier.png',
  'lookbook1.png',
  'lookbook2.png',
  'product1.png',
  'product2.png',
  'product3.png',
  'product4.png',
  'product5.png',
  'product6.png',
  'ROUPA DE TERREIRO LOGOTIPO.png'
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function copyFile(fileName) {
  const sourcePath = path.join(rootDir, fileName);
  if (!fs.existsSync(sourcePath)) {
    return;
  }

  const targetPath = path.join(outDir, fileName);
  ensureDir(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
}

removeDir(outDir);
ensureDir(outDir);

for (const fileName of filesToCopy) {
  copyFile(fileName);
}

ensureDir(path.join(outDir, 'uploads'));

console.log(`Build concluido: ${filesToCopy.length} arquivos preparados em ${outDir}`);
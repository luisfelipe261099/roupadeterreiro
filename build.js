const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'public');

const staticFiles = [
  'index.html',
  'admin.html',
  'catalog.html',
  'style.css',
  'script.js',
  'products.json'
];

const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico']);

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

for (const fileName of staticFiles) {
  copyFile(fileName);
}

const rootFiles = fs.readdirSync(rootDir, { withFileTypes: true });
for (const entry of rootFiles) {
  if (!entry.isFile()) continue;
  const ext = path.extname(entry.name).toLowerCase();
  if (imageExtensions.has(ext)) {
    copyFile(entry.name);
  }
}

ensureDir(path.join(outDir, 'uploads'));

console.log(`Build concluido: arquivos estaticos e imagens preparados em ${outDir}`);
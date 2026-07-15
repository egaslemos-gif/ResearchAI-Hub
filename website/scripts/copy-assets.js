const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const parentDir = path.join(process.cwd(), '..');
const websiteDir = process.cwd();

// Only copy if they exist in the parent directory
if (fs.existsSync(path.join(parentDir, 'protocols'))) {
  console.log('Copying assets from parent directory to website/.assets...');
  copyDir(path.join(parentDir, 'protocols'), path.join(websiteDir, '.assets', 'protocols'));
  copyDir(path.join(parentDir, 'tools'), path.join(websiteDir, '.assets', 'tools'));
  copyDir(path.join(parentDir, 'prompts'), path.join(websiteDir, '.assets', 'prompts'));
  console.log('Assets copied.');
}

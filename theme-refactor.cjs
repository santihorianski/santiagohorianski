const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'components');

const regexReplacements = [
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.0[2-5]\)/g, replace: 'var(--overlay-light)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.0[6-9]\)/g, replace: 'var(--overlay-medium)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.1\)/g, replace: 'var(--overlay-medium)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.15\)/g, replace: 'var(--overlay-heavy)' },
  { regex: /rgba\(0,\s*0,\s*0,\s*0\.[3-6]\)/g, replace: 'var(--overlay-inverted)' },
  { regex: /rgba\(0,\s*0,\s*0,\s*0\.[7-9]\)/g, replace: 'var(--glass-bg)' },
  { regex: /#11071a/g, replace: 'var(--bg-card)' },
  { regex: /#0e0a16/g, replace: 'var(--bg-dark)' },
  { regex: /rgba\(14,\s*10,\s*22,\s*0\.9[0-9]*\)/g, replace: 'var(--glass-bg)' },
  { regex: /rgba\(10,\s*8,\s*20,\s*0\.9[0-9]*\)/g, replace: 'var(--glass-bg)' },
  { regex: /rgba\(10,\s*8,\s*20,\s*0\.7[0-9]*\)/g, replace: 'var(--glass-bg)' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  regexReplacements.forEach(({ regex, replace }) => {
    content = content.replace(regex, replace);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  });
}

traverseDirectory(directoryPath);
processFile(path.join(__dirname, 'src', 'App.jsx'));
console.log('Refactoring complete.');

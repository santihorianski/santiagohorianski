const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'components');

const regexReplacements = [
  { regex: /rgba\(18,\s*15,\s*10,\s*0\.[0-9]+\)/g, replace: 'var(--glass-bg)' },
  { regex: /rgba\(8,\s*6,\s*4,\s*0\.[0-9]+\)/g, replace: 'var(--glass-bg)' },
  { regex: /rgba\(0,\s*0,\s*0,\s*0\.0[1-9]\)/g, replace: 'var(--overlay-light)' },
  { regex: /rgba\(0,\s*0,\s*0,\s*0\.1[0-9]*\)/g, replace: 'var(--overlay-light)' },
  { regex: /rgba\(0,\s*0,\s*0,\s*0\.2[0-9]*\)/g, replace: 'var(--overlay-medium)' },
  { regex: /rgba\(0,\s*0,\s*0,\s*0\.[3-4][0-9]*\)/g, replace: 'var(--overlay-heavy)' },
  { regex: /rgba\(0,\s*0,\s*0,\s*0\.[5-9][0-9]*\)/g, replace: 'var(--overlay-inverted)' },
  { regex: /#000000/g, replace: 'var(--bg-dark)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.015?\)/g, replace: 'var(--overlay-light)' },
  { regex: /background:\s*#11071a/g, replace: 'background: var(--bg-card)' }
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
console.log('Refactoring round 2 complete.');

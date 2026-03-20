// Script to fix common ESLint errors automatically
const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix: onClick with promise-returning functions - wrap in arrow function with void
  const onClickPattern = /onClick=\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  if (content.match(onClickPattern)) {
    content = content.replace(onClickPattern, 'onClick={() => void $1()}');
    modified = true;
  }

  // Fix: navigate calls - add void
  const navigatePattern = /([^void\s])navigate\(/g;
  if (content.match(navigatePattern)) {
    content = content.replace(navigatePattern, '$1void navigate(');
    modified = true;
  }

  // Fix: unused error variables in catch blocks
  const catchErrorPattern = /catch \(error\) \{/g;
  if (content.match(catchErrorPattern)) {
    content = content.replace(catchErrorPattern, 'catch {');
    modified = true;
  }

  // Fix: floating promises in useEffect
  const useEffectPromisePattern = /useEffect\(\(\) => \{\s*([a-zA-Z_][a-zA-Z0-9_]*)\(\);/g;
  if (content.match(useEffectPromisePattern)) {
    content = content.replace(useEffectPromisePattern, 'useEffect(() => {\n    void $1();');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

// Process all TypeScript/TSX files
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      try {
        fixFile(filePath);
      } catch (e) {
        console.error(`Error processing ${filePath}:`, e.message);
      }
    }
  }
}

// Run on frontend and backend
const frontendPath = path.join(__dirname, 'ly64-project', 'frontend', 'src');
const backendPath = path.join(__dirname, 'ly64-project', 'backend', 'src');

if (fs.existsSync(frontendPath)) {
  console.log('Processing frontend...');
  processDirectory(frontendPath);
}

if (fs.existsSync(backendPath)) {
  console.log('Processing backend...');
  processDirectory(backendPath);
}

console.log('Done!');

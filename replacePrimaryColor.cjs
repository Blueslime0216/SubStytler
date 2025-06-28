const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'src');
const TARGET_EXTENSIONS = ['.css', '.ts', '.tsx'];
const OLD = 'var(--primary-color)';
const NEW = 'var(--light-surface-color)';

// 밝은 부분에 해당하는 CSS 속성 키워드
const BRIGHT_USAGE_KEYWORDS = [
  'border', 'box-shadow', 'outline', 'background', 'filter', 'shadow', 'stroke', 'fill'
];

// 파일 내에서 교체가 필요한지 판단
function isBrightUsage(line) {
  return BRIGHT_USAGE_KEYWORDS.some(keyword => line.toLowerCase().includes(keyword));
}

function processFile(filePath) {
  const ext = path.extname(filePath);
  if (!TARGET_EXTENSIONS.includes(ext)) return;

  let changed = false;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const newLines = lines.map(line => {
    if (line.includes(OLD) && isBrightUsage(line)) {
      changed = true;
      return line.replaceAll(OLD, NEW);
    }
    return line;
  });

  if (changed) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else {
      processFile(fullPath);
    }
  });
}

// 1. 새 변수 colors.css에 추가
const colorsCss = path.join(__dirname, 'src', 'styles', 'colors.css');
let colorsContent = fs.readFileSync(colorsCss, 'utf8');
if (!colorsContent.includes('--light-surface-color')) {
  colorsContent = colorsContent.replace(
    /:root\s*{([\s\S]*?)}/,
    (match, p1) => `:root {\n  --light-surface-color: #f5f5f7; /* 은은하게 밝은 하얀색 */\n${p1}}`
  );
  fs.writeFileSync(colorsCss, colorsContent, 'utf8');
  console.log('Added --light-surface-color to colors.css');
}

// 2. 전체 src 디렉토리 순회하며 교체
walk(TARGET_DIR);

console.log('Done!'); 
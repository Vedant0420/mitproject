const fs = require('fs');

const data = fs.readFileSync('restored_floormap_log.txt', 'utf8');
const obj = JSON.parse(data);
const lines = obj.content.split('\n');
let contentLines = [];
for (const l of lines) {
  if (l.match(/^\d+:/)) {
    contentLines.push(l.replace(/^\d+:\s?/, ''));
  } else if (l === 'The above content shows the entire, complete file contents of the requested file.' || l.startsWith('The above content does NOT show')) {
    break;
  }
}
fs.writeFileSync('src/pages/FloorMap.jsx', contentLines.join('\n'));
console.log('Restored FloorMap.jsx');

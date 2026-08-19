const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\69a0e392-d7ab-4a2d-ab57-ae7078af23be\\.system_generated\\logs\\transcript_full.jsonl';
const data = fs.readFileSync(logPath, 'utf8');
const lines = data.split('\n');

const restoredFiles = new Set();

for (const line of lines) {
  if (line.includes('TOOL_RESPONSE') && line.includes('File Path: `file:///c:/Users/syske/OneDrive/Desktop/class%20room%20allotment/src/')) {
    try {
      const obj = JSON.parse(line);
      if (obj.content) {
        const fpMatch = obj.content.match(/File Path: `([^`]+)`/);
        if (fpMatch) {
          const fp = decodeURIComponent(fpMatch[1]).replace(/\\/g, '/');
          const basename = path.basename(fp);
          
          if (!restoredFiles.has(basename)) {
            const objLines = obj.content.split('\n');
            let contentLines = [];
            for (const l of objLines) {
              if (l.match(/^\d+:/)) {
                contentLines.push(l.replace(/^\d+:\s?/, ''));
              } else if (l === 'The above content shows the entire, complete file contents of the requested file.' || l.startsWith('The above content does NOT show')) {
                break;
              }
            }
            if (contentLines.length > 0) {
              const relativePath = fp.split('class room allotment/src/')[1];
              const outPath = path.join(__dirname, 'src', relativePath);
              fs.mkdirSync(path.dirname(outPath), { recursive: true });
              fs.writeFileSync(outPath, contentLines.join('\n'));
              console.log(`Restored ${basename} to ${outPath}`);
              restoredFiles.add(basename);
            }
          }
        }
      }
    } catch(e) {}
  }
}

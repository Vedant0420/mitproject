const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\69a0e392-d7ab-4a2d-ab57-ae7078af23be\\.system_generated\\logs\\transcript_full.jsonl';
const data = fs.readFileSync(logPath, 'utf8');

const regex = /{"step_index".*?"TOOL_RESPONSE".*?"content":"(.*?)"}/g;
const restoredFiles = new Set();

let match;
while ((match = regex.exec(data)) !== null) {
  try {
    const rawContent = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    const fpMatch = rawContent.match(/File Path: `([^`]+)`/);
    if (fpMatch) {
      const fp = decodeURIComponent(fpMatch[1]).replace(/\\/g, '/');
      if (fp.includes('class room allotment/src/')) {
        const basename = path.basename(fp);
        if (!restoredFiles.has(basename)) {
          const lines = rawContent.split('\n');
          let contentLines = [];
          for (const l of lines) {
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

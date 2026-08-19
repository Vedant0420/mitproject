const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\69a0e392-d7ab-4a2d-ab57-ae7078af23be\\.system_generated\\logs\\transcript_full.jsonl';
const data = fs.readFileSync(logPath, 'utf8');

// Split by step_index to get each step as a block
const blocks = data.split('{"step_index"');
const restoredFiles = new Set();

for (const block of blocks) {
  if (block.includes('"type":"VIEW_FILE"') && block.includes('File Path:')) {
    // Find the file path
    const fpMatch = block.match(/File Path: `([^`]+)`/);
    if (fpMatch) {
      const fp = decodeURIComponent(fpMatch[1]).replace(/\\/g, '/');
      const basename = path.basename(fp);
      
      if (fp.includes('class room allotment/src/') && !restoredFiles.has(basename)) {
        // Now parse the content
        // The block is mostly a JSON object but we can just regex the content out.
        // Better yet, just find where the content lines start.
        // Wait, the block is valid JSON if we prepend `{"step_index"` (except for the last newline).
        try {
          const jsonStr = '{"step_index"' + block.trim();
          const obj = JSON.parse(jsonStr);
          
          if (obj.content) {
            const lines = obj.content.split('\n');
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
        } catch(e) {
          console.error("Parse error on:", basename);
        }
      }
    }
  }
}

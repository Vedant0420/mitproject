const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\356001a6-29e6-422e-9513-9f8778efbad2\\.system_generated\\logs\\transcript_full.jsonl';
if (!fs.existsSync(logPath)) {
  console.error("Previous session log not found");
  process.exit(1);
}

const data = fs.readFileSync(logPath, 'utf8');
const blocks = data.split('{"step_index"');

const latestContents = {};

for (const block of blocks) {
  try {
    const jsonStr = '{"step_index"' + block.trim();
    const obj = JSON.parse(jsonStr);

    if (obj.type === 'PLANNER_RESPONSE' && obj.tool_calls) {
      for (const call of obj.tool_calls) {
        if (call.name === 'write_to_file') {
          const fp = call.args.TargetFile;
          // We only care about files in src/
          if (fp.includes('\\src\\') || fp.includes('/src/')) {
            latestContents[fp] = call.args.CodeContent;
          }
        }
      }
    }
    
    if (obj.type === 'VIEW_FILE' && obj.content && obj.content.includes('File Path:')) {
      const fpMatch = obj.content.match(/File Path: `([^`]+)`/);
      if (fpMatch) {
        let fp = decodeURIComponent(fpMatch[1]).replace(/\\/g, '/');
        // Fix the path to be absolute Windows path
        if (fp.startsWith('file:///c:/')) {
          fp = fp.replace('file:///c:/', 'C:\\').replace(/\//g, '\\');
        } else if (fp.startsWith('file:///C:/')) {
          fp = fp.replace('file:///C:/', 'C:\\').replace(/\//g, '\\');
        }

        if (fp.includes('\\src\\')) {
          if (obj.content.includes('The above content shows the entire, complete file contents')) {
            const lines = obj.content.split('\n');
            let contentLines = [];
            for (const l of lines) {
              if (l.match(/^\d+:/)) {
                contentLines.push(l.replace(/^\d+:\s?/, ''));
              } else if (l.includes('The above content shows the entire')) {
                break;
              }
            }
            if (contentLines.length > 0) {
              latestContents[fp] = contentLines.join('\n');
            }
          }
        }
      }
    }
  } catch(e) {}
}

let restoredCount = 0;
for (const [fp, content] of Object.entries(latestContents)) {
  // Ensure the directory exists
  const dir = path.dirname(fp);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fp, content);
  console.log(`Restored: ${fp}`);
  restoredCount++;
}

console.log(`Total files restored: ${restoredCount}`);

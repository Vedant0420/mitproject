const fs = require('fs');
const path = require('path');

// The older session - Vyas Building Allocation System (before FixLink)
const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\356001a6-29e6-422e-9513-9f8778efbad2\\.system_generated\\logs\\transcript_full.jsonl';
if (!fs.existsSync(logPath)) {
  console.error("Previous session log not found"); process.exit(1);
}

const data = fs.readFileSync(logPath, 'utf8');
const blocks = data.split('{"step_index"');

// Track the LAST known state of each file from the previous session
const latestContents = {};

for (const block of blocks) {
  try {
    const jsonStr = '{"step_index"' + block.trim();
    const obj = JSON.parse(jsonStr);

    if (obj.type === 'PLANNER_RESPONSE' && obj.tool_calls) {
      for (const call of obj.tool_calls) {
        if (call.name === 'write_to_file') {
          const fp = call.args.TargetFile;
          if (fp.includes('\\src\\') || fp.includes('/src/')) {
            latestContents[path.basename(fp)] = { path: fp, content: call.args.CodeContent };
          }
        }
      }
    }

    if (obj.type === 'VIEW_FILE' && obj.content && obj.content.includes('File Path:')) {
      const fpMatch = obj.content.match(/File Path: `([^`]+)`/);
      if (fpMatch) {
        let fp = decodeURIComponent(fpMatch[1]);
        if (fp.startsWith('file:///c:/')) fp = 'C:\\' + fp.slice(11).replace(/\//g, '\\');
        else if (fp.startsWith('file:///C:/')) fp = 'C:\\' + fp.slice(11).replace(/\//g, '\\');

        if (fp.includes('\\src\\') && obj.content.includes('The above content shows the entire, complete file contents')) {
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
            latestContents[path.basename(fp)] = { path: fp, content: contentLines.join('\n') };
          }
        }
      }
    }
  } catch(e) {}
}

// Print what we found
for (const [basename, data] of Object.entries(latestContents)) {
  console.log(`Found: ${basename} (${data.content.length} bytes)`);
}

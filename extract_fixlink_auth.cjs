const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\69a0e392-d7ab-4a2d-ab57-ae7078af23be\\.system_generated\\logs\\transcript_full.jsonl';
const data = fs.readFileSync(logPath, 'utf8');
const blocks = data.split('{"step_index"');

const targets = ['Login.jsx', 'Login.css', 'Signup.jsx'];
const extracted = {};

// We want the LATEST occurrences from TODAY's transcript for these specific files
for (const block of blocks) {
  try {
    const jsonStr = '{"step_index"' + block.trim();
    const obj = JSON.parse(jsonStr);

    if (obj.type === 'PLANNER_RESPONSE' && obj.tool_calls) {
      for (const call of obj.tool_calls) {
        if (call.name === 'write_to_file') {
          const fp = call.args.TargetFile;
          const basename = path.basename(fp);
          if (targets.includes(basename)) {
            extracted[basename] = call.args.CodeContent;
          }
        }
      }
    }
  } catch(e) {}
}

for (const [basename, content] of Object.entries(extracted)) {
  const finalPath = path.join('C:\\Users\\syske\\OneDrive\\Desktop\\class room allotment\\src\\pages', basename);
  fs.writeFileSync(finalPath, content);
  console.log(`Extracted FixLink version of ${basename}`);
}

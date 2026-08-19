const fs = require('fs');
const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\69a0e392-d7ab-4a2d-ab57-ae7078af23be\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

let latestCode = null;

for (const line of lines) {
  if (line.includes('"name":"write_to_file"') && line.includes('AdminPanel.jsx')) {
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const call of obj.tool_calls) {
          if (call.name === 'write_to_file' && call.args.TargetFile.endsWith('AdminPanel.jsx')) {
            latestCode = call.args.CodeContent;
          }
        }
      }
    } catch(e) {}
  }
}

if (latestCode) {
  fs.writeFileSync('C:\\Users\\syske\\OneDrive\\Desktop\\class room allotment\\src\\pages\\AdminPanel.jsx', latestCode);
  console.log('Successfully restored AdminPanel.jsx from write_to_file');
} else {
  console.log('Could not find write_to_file for AdminPanel.jsx');
}

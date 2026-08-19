const fs = require('fs');

const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\69a0e392-d7ab-4a2d-ab57-ae7078af23be\\.system_generated\\logs\\transcript_full.jsonl';
const data = fs.readFileSync(logPath, 'utf8');
const lines = data.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('TOOL_RESPONSE') && line.includes('File Path:')) {
    try {
      const obj = JSON.parse(line);
      if (obj.content) {
        const fpMatch = obj.content.match(/File Path: `([^`]+)`/);
        if (fpMatch) {
          console.log(decodeURIComponent(fpMatch[1]));
        }
      }
    } catch(e){}
  }
}

const fs = require('fs');

const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\69a0e392-d7ab-4a2d-ab57-ae7078af23be\\.system_generated\\logs\\transcript_full.jsonl';
const data = fs.readFileSync(logPath, 'utf8');

const regex = /File Path: `([^`]+)`/g;
let match;
while ((match = regex.exec(data)) !== null) {
  console.log(decodeURIComponent(match[1]));
}

const fs = require('fs');
const readline = require('readline');

async function search() {
  const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\69a0e392-d7ab-4a2d-ab57-ae7078af23be\\.system_generated\\logs\\transcript_full.jsonl';
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('File Path: `file:///c:/Users/syske/OneDrive/Desktop/class%20room%20allotment/src/pages/FloorMap.jsx`')) {
      fs.writeFileSync('restored_floormap_log.txt', line);
      break;
    }
  }
}

search();

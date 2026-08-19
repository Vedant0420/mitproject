const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function extract() {
  const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\69a0e392-d7ab-4a2d-ab57-ae7078af23be\\.system_generated\\logs\\transcript_full.jsonl';
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const filesToRestore = [
    'Dashboard.jsx',
    'LiveDashboard.jsx',
    'AdminPanel.jsx',
    'RoomManagement.jsx',
    'Allotments.jsx',
    'Timetable.jsx',
    'FacultySubjects.jsx',
    'FloorMap.jsx',
    'index.css'
  ];

  const restored = new Set();

  for await (const line of rl) {
    if (!line.includes('"TOOL_RESPONSE"')) continue;
    try {
      const data = JSON.parse(line);
      if (data.type === 'TOOL_RESPONSE' && data.content) {
        
        for (const filename of filesToRestore) {
          if (!restored.has(filename) && data.content.includes(`File Path: \`file:///c:/Users/syske/OneDrive/Desktop/class%20room%20allotment/src/`)) {
            // Check if it's the right file
            if (data.content.includes(filename)) {
              // Extract the file content
              const lines = data.content.split('\n');
              let contentLines = [];
              let isContent = false;
              
              for (const l of lines) {
                if (l.match(/^\d+:/)) {
                  isContent = true;
                  contentLines.push(l.replace(/^\d+:\s?/, ''));
                } else if (l === 'The above content shows the entire, complete file contents of the requested file.' || l.startsWith('The above content does NOT show')) {
                  break;
                }
              }

              if (contentLines.length > 0) {
                const outPath = filename === 'index.css' 
                  ? path.join(__dirname, 'src', filename)
                  : path.join(__dirname, 'src', 'pages', filename);
                
                fs.writeFileSync(outPath, contentLines.join('\n'));
                console.log(`Restored ${filename}`);
                restored.add(filename);
              }
            }
          }
        }
      }
    } catch (e) {
      // ignore parse errors on partial lines
    }
  }
  
  console.log('Restoration complete. Restored files:', Array.from(restored));
}

extract();

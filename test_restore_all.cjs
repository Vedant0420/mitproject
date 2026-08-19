const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\69a0e392-d7ab-4a2d-ab57-ae7078af23be\\.system_generated\\logs\\transcript_full.jsonl';
const data = fs.readFileSync(logPath, 'utf8');
const lines = data.split('\n');

const filesToRestore = [
  'Dashboard.jsx',
  'LiveDashboard.jsx',
  'AdminPanel.jsx',
  'RoomManagement.jsx',
  'Allotments.jsx',
  'Timetable.jsx',
  'FacultySubjects.jsx',
  'index.css',
  'FloorMap.css'
];

for (const file of filesToRestore) {
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('TOOL_RESPONSE') && line.includes(file) && line.includes('File Path: `file:///')) {
      try {
        const obj = JSON.parse(line);
        if (obj.content && obj.content.includes(file)) {
          const objLines = obj.content.split('\n');
          let contentLines = [];
          for (const l of objLines) {
            if (l.match(/^\d+:/)) {
              contentLines.push(l.replace(/^\d+:\s?/, ''));
            } else if (l === 'The above content shows the entire, complete file contents of the requested file.' || l.startsWith('The above content does NOT show')) {
              break;
            }
          }
          if (contentLines.length > 0) {
            const fpMatch = obj.content.match(/File Path: `([^`]+)`/);
            if (fpMatch) {
              const fp = decodeURIComponent(fpMatch[1]);
              const basename = path.basename(fp);
              if (basename === file) {
                const outPath = basename === 'index.css' || basename === 'main.jsx'
                  ? path.join(__dirname, 'src', basename)
                  : (fp.includes('/components/') ? path.join(__dirname, 'src', 'components', basename) 
                    : (fp.includes('/pages/') ? path.join(__dirname, 'src', 'pages', basename)
                      : path.join(__dirname, 'src', basename)));
                
                fs.mkdirSync(path.dirname(outPath), { recursive: true });
                fs.writeFileSync(outPath, contentLines.join('\n'));
                console.log(`Restored ${file}`);
                found = true;
                break; // stop searching for this file, move to next
              }
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }
}

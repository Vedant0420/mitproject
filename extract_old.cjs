const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function extract() {
  const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\356001a6-29e6-422e-9513-9f8778efbad2\\.system_generated\\logs\\transcript_full.jsonl';
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const fileContents = {};

  for await (const line of rl) {
    if (!line.includes('"TOOL_CALL"')) continue;
    try {
      const data = JSON.parse(line);
      if (data.type === 'TOOL_CALL' && data.tool_calls) {
        for (const tc of data.tool_calls) {
          if (tc.name === 'write_to_file' || tc.name === 'default_api:write_to_file') {
             const target = tc.args.TargetFile;
             if (target && (target.includes('src/pages') || target.includes('src\\pages') || target.includes('index.css'))) {
                const basename = path.basename(target);
                fileContents[basename] = tc.args.CodeContent;
             }
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Also check if they were read in full by view_file
  const fileStream2 = fs.createReadStream(logPath);
  const rl2 = readline.createInterface({ input: fileStream2, crlfDelay: Infinity });
  for await (const line of rl2) {
    if (!line.includes('"TOOL_RESPONSE"')) continue;
    try {
      const data = JSON.parse(line);
      if (data.type === 'TOOL_RESPONSE' && data.content && data.content.includes('File Path:')) {
         const match = data.content.match(/File Path: `([^`]+)`/);
         if (match) {
            const fp = decodeURIComponent(match[1]);
            const basename = path.basename(fp);
            if (['Dashboard.jsx', 'LiveDashboard.jsx', 'AdminPanel.jsx', 'RoomManagement.jsx', 'Allotments.jsx', 'Timetable.jsx', 'FacultySubjects.jsx', 'index.css'].includes(basename)) {
               const lines = data.content.split('\n');
               let contentLines = [];
               for (const l of lines) {
                 if (l.match(/^\d+:/)) {
                   contentLines.push(l.replace(/^\d+:\s?/, ''));
                 } else if (l === 'The above content shows the entire, complete file contents of the requested file.' || l.startsWith('The above content does NOT show')) {
                   break;
                 }
               }
               if (contentLines.length > 0) {
                  fileContents[basename] = contentLines.join('\n');
               }
            }
         }
      }
    } catch (e) {}
  }
  
  for (const [basename, content] of Object.entries(fileContents)) {
     if (!content) continue;
     const outPath = basename === 'index.css' 
       ? path.join(__dirname, 'src', basename)
       : path.join(__dirname, 'src', 'pages', basename);
     
     if (['Login.jsx', 'Signup.jsx'].includes(basename)) continue; // keep new login/signup

     try {
       fs.writeFileSync(outPath, content);
       console.log(`Restored ${basename}`);
     } catch (e) {
       console.error(`Failed to restore ${basename}: ${e.message}`);
     }
  }
}

extract();

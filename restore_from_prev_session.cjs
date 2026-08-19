const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\356001a6-29e6-422e-9513-9f8778efbad2\\.system_generated\\logs\\transcript_full.jsonl';
if (!fs.existsSync(logPath)) {
  console.error("Previous session log not found");
  process.exit(1);
}

const data = fs.readFileSync(logPath, 'utf8');
const blocks = data.split('{"step_index"');

const targets = [
  'Dashboard.jsx', 'RoomManagement.jsx', 'Allotments.jsx', 
  'FacultySubjects.jsx', 'FloorMap.jsx', 'AdminPanel.jsx', 
  'LiveDashboard.jsx', 'Timetable.jsx', 'index.css'
];
const latestContents = {};

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
            latestContents[basename] = call.args.CodeContent;
          }
        }
        if (call.name === 'replace_file_content') {
           // We could try to apply diffs, but usually the last state is also viewed or we can just grab the last write_to_file
        }
      }
    }
    
    if (obj.type === 'VIEW_FILE' && obj.content && obj.content.includes('File Path:')) {
      const fpMatch = obj.content.match(/File Path: `([^`]+)`/);
      if (fpMatch) {
        const fp = decodeURIComponent(fpMatch[1]).replace(/\\/g, '/');
        const basename = path.basename(fp);
        
        if (targets.includes(basename)) {
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
              latestContents[basename] = contentLines.join('\n');
            }
          }
        }
      }
    }
  } catch(e) {}
}

for (const [basename, content] of Object.entries(latestContents)) {
  let finalPath = '';
  if (basename === 'index.css') finalPath = path.join('C:\\Users\\syske\\OneDrive\\Desktop\\class room allotment\\src', basename);
  else finalPath = path.join('C:\\Users\\syske\\OneDrive\\Desktop\\class room allotment\\src\\pages', basename);
  
  fs.writeFileSync(finalPath, content);
  console.log(`Restored LATEST from previous session: ${basename}`);
}

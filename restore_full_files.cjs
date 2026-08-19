const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\69a0e392-d7ab-4a2d-ab57-ae7078af23be\\.system_generated\\logs\\transcript_full.jsonl';
const data = fs.readFileSync(logPath, 'utf8');
const blocks = data.split('{"step_index"');

// We want the FIRST full occurrence of these files today
const targets = [
  'Timetable.jsx', 'Dashboard.jsx', 'RoomManagement.jsx', 
  'Allotments.jsx', 'FacultySubjects.jsx', 'FloorMap.jsx',
  'AdminPanel.jsx', 'LiveDashboard.jsx'
];
const restored = {};

// We process blocks in order to find the FIRST occurrence
for (const block of blocks) {
  try {
    const jsonStr = '{"step_index"' + block.trim();
    const obj = JSON.parse(jsonStr);

    // Check write_to_file calls (these contain the full file)
    if (obj.type === 'PLANNER_RESPONSE' && obj.tool_calls) {
      for (const call of obj.tool_calls) {
        if (call.name === 'write_to_file') {
          const fp = call.args.TargetFile;
          const basename = path.basename(fp);
          if (targets.includes(basename) && !restored[basename]) {
            fs.writeFileSync(fp, call.args.CodeContent);
            console.log(`Restored ${basename} from FIRST write_to_file`);
            restored[basename] = true;
          }
        }
      }
    }
    
    // Check view_file responses
    if (obj.type === 'VIEW_FILE' && obj.content && obj.content.includes('File Path:')) {
      const fpMatch = obj.content.match(/File Path: `([^`]+)`/);
      if (fpMatch) {
        const fp = decodeURIComponent(fpMatch[1]).replace(/\\/g, '/');
        const basename = path.basename(fp);
        
        if (targets.includes(basename) && !restored[basename]) {
          // Verify it's a full view
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
              let finalPath = path.join('C:\\Users\\syske\\OneDrive\\Desktop\\class room allotment\\src\\pages', basename);
              fs.writeFileSync(finalPath, contentLines.join('\n'));
              console.log(`Restored ${basename} from FIRST full view_file`);
              restored[basename] = true;
            }
          }
        }
      }
    }
  } catch(e) {}
}

const missing = targets.filter(t => !restored[t]);
if (missing.length > 0) {
  console.log('Still missing full versions for:', missing.join(', '));
}

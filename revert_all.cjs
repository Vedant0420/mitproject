const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\69a0e392-d7ab-4a2d-ab57-ae7078af23be\\.system_generated\\logs\\transcript_full.jsonl';
const data = fs.readFileSync(logPath, 'utf8');
const lines = data.split('\n');

const restoredFiles = new Set();
const ignore = ['Login.jsx', 'Signup.jsx']; // user wants to keep the fixlink login/signup? Wait, user said "wait revert everything till fixlink was introduced for changes" -> Revert EVERYTHING!
// Ok, I will restore EVERYTHING that has a view_file response, including Login/Signup if they existed before.

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('TOOL_RESPONSE') && line.includes('File Path:')) {
    try {
      const obj = JSON.parse(line);
      if (obj.content && obj.content.includes('File Path:')) {
        const fpMatch = obj.content.match(/File Path: `([^`]+)`/);
        if (fpMatch) {
          const fpRaw = fpMatch[1];
          const fp = decodeURIComponent(fpRaw).replace(/\\/g, '/');
          
          if (fp.includes('class room allotment/src/')) {
            const basename = path.basename(fp);
            if (!restoredFiles.has(basename) && (fp.endsWith('.jsx') || fp.endsWith('.css') || fp.endsWith('.js'))) {
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
                // Infer location from path
                const relativePath = fp.split('class room allotment/src/')[1];
                const outPath = path.join(__dirname, 'src', relativePath);
                
                fs.mkdirSync(path.dirname(outPath), { recursive: true });
                fs.writeFileSync(outPath, contentLines.join('\n'));
                console.log(`Restored ${basename} to ${outPath}`);
                restoredFiles.add(basename);
              }
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }
}

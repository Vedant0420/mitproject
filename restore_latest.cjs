const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\69a0e392-d7ab-4a2d-ab57-ae7078af23be\\.system_generated\\logs\\transcript_full.jsonl';
const data = fs.readFileSync(logPath, 'utf8');
const blocks = data.split('{"step_index"');

const targets = ['Login.jsx', 'Signup.jsx', 'Sidebar.jsx', 'Sidebar.css', 'App.jsx', 'Login.css'];
const latestContents = {};

for (const block of blocks) {
  if (block.includes('File Path:')) {
    const fpMatch = block.match(/File Path: `([^`]+)`/);
    if (fpMatch) {
      const fp = decodeURIComponent(fpMatch[1]).replace(/\\/g, '/');
      const basename = path.basename(fp);
      
      if (targets.includes(basename)) {
        try {
          const jsonStr = '{"step_index"' + block.trim();
          const obj = JSON.parse(jsonStr);
          if (obj.content) {
            const lines = obj.content.split('\n');
            let contentLines = [];
            for (const l of lines) {
              if (l.match(/^\d+:/)) {
                contentLines.push(l.replace(/^\d+:\s?/, ''));
              } else if (l === 'The above content shows the entire, complete file contents of the requested file.' || l.startsWith('The above content does NOT show')) {
                break;
              }
            }
            if (contentLines.length > 0) {
               latestContents[basename] = {
                 content: contentLines.join('\n'),
                 fp: fp
               };
            }
          }
        } catch(e) {}
      }
    }
  }
}

for (const [basename, fileData] of Object.entries(latestContents)) {
  const relativePath = fileData.fp.split('class room allotment/src/')[1] || fileData.fp.split('class%20room%20allotment/src/')[1] || basename;
  // some paths might not split properly, let's just hardcode
  let finalPath = '';
  if (basename === 'App.jsx') finalPath = path.join(__dirname, 'src', 'App.jsx');
  else if (basename.startsWith('Login') || basename.startsWith('Signup')) finalPath = path.join(__dirname, 'src', 'pages', basename);
  else if (basename.startsWith('Sidebar')) finalPath = path.join(__dirname, 'src', 'components', basename);
  
  if (finalPath) {
    fs.mkdirSync(path.dirname(finalPath), { recursive: true });
    fs.writeFileSync(finalPath, fileData.content);
    console.log(`Restored LATEST ${basename}`);
  }
}

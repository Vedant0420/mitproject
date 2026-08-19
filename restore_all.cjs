const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function restore() {
  const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\69a0e392-d7ab-4a2d-ab57-ae7078af23be\\.system_generated\\logs\\transcript_full.jsonl';
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const restored = new Set();
  const exclude = ['Login.jsx', 'Signup.jsx', 'Sidebar.jsx', 'App.jsx'];

  for await (const line of rl) {
    if (!line.includes('"TOOL_RESPONSE"')) continue;
    try {
      const data = JSON.parse(line);
      if (data.type === 'TOOL_RESPONSE' && data.content && data.content.includes('File Path: `file:///')) {
        const match = data.content.match(/File Path: `([^`]+)`/);
        if (!match) continue;
        
        const fp = decodeURIComponent(match[1]);
        if (!fp.includes('src/')) continue; // only src files
        
        const basename = path.basename(fp);
        
        if (fp.endsWith('.jsx') || fp.endsWith('.css') || fp.endsWith('.js')) {
          if (exclude.includes(basename)) continue;
          
          if (!restored.has(basename)) {
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
              const outPath = basename === 'index.css' || basename === 'main.jsx'
                ? path.join(__dirname, 'src', basename)
                : (fp.includes('/components/') ? path.join(__dirname, 'src', 'components', basename) 
                  : (fp.includes('/pages/') ? path.join(__dirname, 'src', 'pages', basename)
                    : path.join(__dirname, 'src', basename)));
              
              fs.mkdirSync(path.dirname(outPath), { recursive: true });
              fs.writeFileSync(outPath, contentLines.join('\n'));
              console.log(`Restored ${basename}`);
              restored.add(basename);
            }
          }
        }
      }
    } catch (e) {
    }
  }
}

restore();

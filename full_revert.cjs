const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\syske\\OneDrive\\Desktop\\class room allotment';
const SRC = path.join(BASE, 'src');

// ── STEP 1: Remove files that did NOT exist before FixLink ──────────
const toDelete = [
  // Auth pages - FixLink introduced
  path.join(SRC, 'pages', 'Login.jsx'),
  path.join(SRC, 'pages', 'Login.css'),
  path.join(SRC, 'pages', 'Signup.jsx'),
  // Live Dashboard - FixLink introduced
  path.join(SRC, 'pages', 'LiveDashboard.jsx'),
  path.join(SRC, 'pages', 'LiveDashboard.css'),
  // AuthContext - FixLink introduced
  path.join(SRC, 'context', 'AuthContext.jsx'),
  // ProtectedRoute - FixLink introduced
  path.join(SRC, 'components', 'ProtectedRoute.jsx'),
  // ThemeContext - FixLink introduced
  path.join(SRC, 'context', 'ThemeContext.jsx'),
  // FixLink assets (if present)
  path.join(SRC, 'assets', 'css', 'carousels.css'),
  path.join(SRC, 'assets', 'css', 'dashboard_stats.css'),
  path.join(SRC, 'assets', 'css', 'page_transitions.css'),
  path.join(SRC, 'assets', 'css', 'skeleton.css'),
  path.join(SRC, 'assets', 'css', 'style.css'),
  path.join(SRC, 'assets', 'hero.png'),
  // Remove App.css if empty/FixLink
  path.join(SRC, 'App.css'),
];

for (const f of toDelete) {
  if (fs.existsSync(f)) {
    fs.unlinkSync(f);
    console.log(`Deleted: ${f}`);
  } else {
    console.log(`Skipped (not found): ${path.basename(f)}`);
  }
}

// ── STEP 2: Restore all original files from the previous session ────
const logPath = 'C:\\Users\\syske\\.gemini\\antigravity-ide\\brain\\356001a6-29e6-422e-9513-9f8778efbad2\\.system_generated\\logs\\transcript_full.jsonl';
const data = fs.readFileSync(logPath, 'utf8');
const blocks = data.split('{"step_index"');

const latestContents = {};

for (const block of blocks) {
  try {
    const jsonStr = '{"step_index"' + block.trim();
    const obj = JSON.parse(jsonStr);

    if (obj.type === 'PLANNER_RESPONSE' && obj.tool_calls) {
      for (const call of obj.tool_calls) {
        if (call.name === 'write_to_file') {
          const fp = call.args.TargetFile;
          if (fp.includes('\\src\\') || fp.includes('/src/')) {
            latestContents[path.basename(fp)] = { path: fp, content: call.args.CodeContent };
          }
        }
      }
    }

    if (obj.type === 'VIEW_FILE' && obj.content && obj.content.includes('File Path:')) {
      const fpMatch = obj.content.match(/File Path: `([^`]+)`/);
      if (fpMatch) {
        let fp = decodeURIComponent(fpMatch[1]);
        if (fp.startsWith('file:///c:/')) fp = 'C:\\' + fp.slice(11).replace(/\//g, '\\');
        else if (fp.startsWith('file:///C:/')) fp = 'C:\\' + fp.slice(11).replace(/\//g, '\\');

        if (fp.includes('\\src\\') && obj.content.includes('The above content shows the entire, complete file contents')) {
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
            latestContents[path.basename(fp)] = { path: fp, content: contentLines.join('\n') };
          }
        }
      }
    }
  } catch(e) {}
}

// Write all original files to current paths
for (const [basename, { path: origPath, content }] of Object.entries(latestContents)) {
  // Reconstruct the path in the current workspace
  const relativePart = origPath.split('\\src\\')[1];
  if (!relativePart) continue;
  const destPath = path.join(SRC, relativePart);
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(destPath, content);
  console.log(`Restored: ${basename}`);
}

console.log('\nDone! All files reverted to pre-FixLink state.');

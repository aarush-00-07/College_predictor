const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const DEBOUNCE_MS = 5000;
const WATCH_DIR = __dirname;

// Patterns to ignore (always ignore git, node_modules, build outputs, local env files)
const IGNORE_PATTERNS = [
  /(^|[\\/])(\.git|node_modules|\.next|out|build|coverage)([\\/]|$)/,
  /\.env.*\.local$/,
  /\.tsbuildinfo$/,
  /\.DS_Store$/,
  /watch-and-push\.js$/ // ignore edits to the script itself
];

function isIgnored(filePath) {
  const relativePath = path.relative(WATCH_DIR, filePath);
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath) || pattern.test(relativePath));
}

let changedFiles = new Set();
let debounceTimer = null;

// Helper to run Git commands, fallback to absolute path if default 'git' is not in PATH
function runGit(args, callback) {
  const gitPath = 'git';
  exec(`"${gitPath}" ${args}`, (err, stdout, stderr) => {
    if (err) {
      const fallbackGit = 'C:\\Program Files\\Git\\cmd\\git.exe';
      exec(`"${fallbackGit}" ${args}`, (err2, stdout2, stderr2) => {
        callback(err2, stdout2, stderr2);
      });
    } else {
      callback(err, stdout, stderr);
    }
  });
}

function syncToGithub() {
  if (changedFiles.size === 0) return;

  const filesArray = Array.from(changedFiles);
  changedFiles.clear();

  console.log(`\n[${new Date().toLocaleTimeString()}] Changes detected in:`);
  filesArray.forEach(f => console.log(` - ${f}`));
  console.log('Syncing changes to GitHub...');

  // 1. Stage changes
  runGit('add .', (err, stdout, stderr) => {
    if (err) {
      console.error('Error adding files to Git:', stderr || err.message);
      return;
    }

    // 2. Commit changes
    const fileList = filesArray.slice(0, 3).map(f => path.basename(f)).join(', ');
    const extraCount = filesArray.length > 3 ? ` and ${filesArray.length - 3} more` : '';
    const commitMsg = `Auto-update: modified ${fileList}${extraCount} at ${new Date().toLocaleString()}`;

    // Escape double quotes in commit message
    const escapedMsg = commitMsg.replace(/"/g, '\\"');

    runGit(`commit -m "${escapedMsg}"`, (err, stdout, stderr) => {
      // Git commit returns exit code 1 if there's nothing to commit
      if (err && !stdout.includes('nothing to commit')) {
        console.error('Error committing changes:', stderr || err.message);
        return;
      }

      if (stdout.includes('nothing to commit')) {
        console.log('Nothing to commit, repository is up-to-date.');
        return;
      }

      console.log('Local commit created. Pushing to remote repository...');

      // 3. Push to remote
      runGit('push origin main', (err, stdout, stderr) => {
        if (err) {
          console.error('Error pushing to GitHub:', stderr || err.message);
          console.log('Ensure you are connected to the internet and authenticated.');
        } else {
          console.log(`[${new Date().toLocaleTimeString()}] Successfully synced with GitHub!`);
        }
      });
    });
  });
}

console.log(`====================================================`);
console.log(`  Git Auto-Sync Watcher Started`);
console.log(`  Watching: ${WATCH_DIR}`);
console.log(`  Press Ctrl+C to stop the watcher`);
console.log(`====================================================\n`);

fs.watch(WATCH_DIR, { recursive: true }, (eventType, filename) => {
  if (!filename) return;

  const fullPath = path.join(WATCH_DIR, filename);
  
  if (isIgnored(fullPath)) {
    return;
  }

  // Get relative path for nice logs
  const relPath = path.relative(WATCH_DIR, fullPath).replace(/\\/g, '/');
  changedFiles.add(relPath);

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(syncToGithub, DEBOUNCE_MS);
});

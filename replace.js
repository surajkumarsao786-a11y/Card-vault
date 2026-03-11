import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replacements = {
  'bg-zinc-950': 'bg-bg-main',
  'bg-zinc-900': 'bg-bg-surface',
  'bg-zinc-800': 'bg-bg-surface-hover',
  'text-zinc-100': 'text-text-main',
  'text-zinc-400': 'text-text-muted',
  'text-zinc-500': 'text-text-muted',
  'text-zinc-600': 'text-text-muted',
  'text-zinc-900': 'text-bg-main',
  'bg-zinc-100': 'bg-text-main',
  'bg-zinc-200': 'bg-text-secondary',
  'border-zinc-800': 'border-border-main',
  'border-zinc-600': 'border-accent',
  'ring-zinc-600': 'ring-accent',
  'text-white': 'text-text-main',
  'bg-blue-500': 'bg-accent',
  'text-blue-500': 'text-accent',
  'border-blue-500': 'border-accent',
  'ring-blue-500': 'ring-accent',
  'hover:bg-zinc-800': 'hover:bg-bg-surface-hover',
  'hover:bg-zinc-700': 'hover:bg-bg-surface-hover',
  'hover:text-zinc-200': 'hover:text-text-secondary',
  'hover:text-white': 'hover:text-text-main',
  'hover:bg-zinc-200': 'hover:bg-text-secondary',
  'hover:bg-zinc-100': 'hover:bg-text-main',
  'hover:bg-blue-600': 'hover:bg-accent',
  'hover:border-zinc-600': 'hover:border-accent',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const [search, replace] of Object.entries(replacements)) {
        if (content.includes(search)) {
          content = content.split(search).join(replace);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));

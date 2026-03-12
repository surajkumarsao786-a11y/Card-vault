import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replacements = {
  'hover:bg-black/5 dark:hover:bg-white/10': 'hover:bg-bg-surface-hover',
  'bg-black/5 dark:bg-white/10': 'bg-bg-surface-hover',
  'bg-white dark:bg-bg-surface': 'bg-bg-surface',
  'bg-black/20 dark:bg-black/40': 'bg-black/50',
  'bg-white dark:bg-[#1c1c1e]': 'bg-bg-surface',
  'bg-[#f2f2f7] dark:bg-black': 'bg-bg-main',
  'text-black dark:text-white': 'text-text-main',
  'text-black/50 dark:text-white/50': 'text-text-muted',
  'text-black/70 dark:text-white/70': 'text-text-secondary',
  'border-black/5 dark:border-white/5': 'border-border-main',
  'border-black/10 dark:border-white/10': 'border-border-main',
  'bg-black/10 dark:bg-white/10': 'bg-border-main',
  'hover:bg-black/10 dark:hover:bg-white/10': 'hover:bg-border-main',
  'ring-black/5 dark:ring-white/5': 'ring-border-main',
  'shadow-black/5 dark:shadow-white/5': 'shadow-sm',
  'bg-[#007aff] dark:bg-[#0a84ff]': 'bg-accent',
  'text-[#007aff] dark:text-[#0a84ff]': 'text-accent',
  'bg-[#ff3b30] dark:bg-[#ff453a]': 'bg-red-500',
  'text-[#ff3b30] dark:text-[#ff453a]': 'text-red-500',
  'bg-[#e5e5ea] dark:bg-[#3a3a3c]': 'bg-border-main',
  'text-[#8e8e93] dark:text-[#98989d]': 'text-text-muted',
  'bg-white/80 dark:bg-[#1c1c1e]/80': 'bg-bg-surface/80',
  'bg-white/90 dark:bg-[#1c1c1e]/90': 'bg-bg-surface/90',
  'bg-white dark:bg-[#2c2c2e]': 'bg-bg-surface-hover',
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
      // Also remove any remaining dark: classes
      const darkRegex = /dark:[a-zA-Z0-9-\/\[\]#]+/g;
      if (darkRegex.test(content)) {
        content = content.replace(darkRegex, '');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));

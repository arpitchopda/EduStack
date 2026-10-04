const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'src', 'app'),
  path.join(__dirname, 'src', 'components')
];

// Regex replacement mapping for light mode
const regexReplacements = [
  // White -> sand-50
  { regex: /(?<!dark:)bg-white/g, replacement: 'bg-sand-50' },
  // Slate -> Sand
  { regex: /(?<!dark:)bg-slate-50/g, replacement: 'bg-sand-100' },
  { regex: /(?<!dark:)bg-slate-100/g, replacement: 'bg-sand-200' },
  { regex: /(?<!dark:)bg-slate-200/g, replacement: 'bg-sand-300' },
  
  { regex: /(?<!dark:)border-slate-100/g, replacement: 'border-sand-200' },
  { regex: /(?<!dark:)border-slate-200/g, replacement: 'border-sand-300' },
  
  { regex: /(?<!dark:)text-slate-400/g, replacement: 'text-sand-500' },
  { regex: /(?<!dark:)text-slate-500/g, replacement: 'text-sand-600' },
  { regex: /(?<!dark:)text-slate-600/g, replacement: 'text-sand-700' },
  { regex: /(?<!dark:)text-slate-700/g, replacement: 'text-sand-800' },
  { regex: /(?<!dark:)text-slate-800/g, replacement: 'text-sand-900' },
  { regex: /(?<!dark:)text-slate-900/g, replacement: 'text-sand-950' },

  { regex: /(?<!dark:)hover:bg-slate-50/g, replacement: 'hover:bg-sand-200' },
  { regex: /(?<!dark:)hover:bg-slate-100/g, replacement: 'hover:bg-sand-300' },
  { regex: /(?<!dark:)hover:bg-slate-200/g, replacement: 'hover:bg-sand-400' },

  { regex: /(?<!dark:)hover:text-slate-600/g, replacement: 'hover:text-sand-800' },
  { regex: /(?<!dark:)hover:text-slate-800/g, replacement: 'hover:text-sand-950' },

  // Blue / Indigo / Purple / Emerald / Red / Orange Accents -> Sand variations
  { regex: /(?<!dark:)(bg-blue-50|bg-indigo-50|bg-purple-50|bg-emerald-50|bg-red-50|bg-orange-50)/g, replacement: 'bg-sand-200' },
  { regex: /(?<!dark:)(bg-blue-100|bg-indigo-100|bg-purple-100|bg-emerald-100|bg-red-100|bg-orange-100)/g, replacement: 'bg-sand-300' },
  { regex: /(?<!dark:)(bg-blue-500|bg-indigo-500|bg-purple-500|bg-emerald-500|bg-red-500|bg-orange-500)/g, replacement: 'bg-sand-600' },
  { regex: /(?<!dark:)(bg-blue-600|bg-indigo-600|bg-purple-600|bg-emerald-600|bg-red-600|bg-orange-600)/g, replacement: 'bg-sand-700' },
  { regex: /(?<!dark:)(bg-blue-700|bg-indigo-700|bg-purple-700|bg-emerald-700|bg-red-700|bg-orange-700)/g, replacement: 'bg-sand-800' },

  { regex: /(?<!dark:)(text-blue-600|text-indigo-600|text-purple-600|text-emerald-600|text-red-600|text-orange-600)/g, replacement: 'text-sand-700' },
  { regex: /(?<!dark:)(text-blue-700|text-indigo-700|text-purple-700|text-emerald-700|text-red-700|text-orange-700)/g, replacement: 'text-sand-800' },

  { regex: /(?<!dark:)(hover:bg-blue-50|hover:bg-indigo-50)/g, replacement: 'hover:bg-sand-200' },
  { regex: /(?<!dark:)(hover:bg-blue-700|hover:bg-indigo-700)/g, replacement: 'hover:bg-sand-800' },
  { regex: /(?<!dark:)(hover:text-blue-700|hover:text-indigo-700)/g, replacement: 'hover:text-sand-800' },
  { regex: /(?<!dark:)(hover:text-blue-800|hover:text-indigo-800)/g, replacement: 'hover:text-sand-900' },
  { regex: /(?<!dark:)(group-hover:text-blue-700)/g, replacement: 'group-hover:text-sand-800' },
  
  { regex: /(?<!dark:)(border-blue-500|border-emerald-500|border-red-500)/g, replacement: 'border-sand-600' },
  { regex: /(?<!dark:)(border-blue-100|border-emerald-100|border-red-100)/g, replacement: 'border-sand-300' },
  { regex: /(?<!dark:)(border-blue-200|border-emerald-200|border-red-200)/g, replacement: 'border-sand-400' },
  
  { regex: /(?<!dark:)(focus:ring-blue-500)/g, replacement: 'focus:ring-sand-600' },
  { regex: /(?<!dark:)(focus:border-blue-500)/g, replacement: 'focus:border-sand-600' },

  { regex: /(?<!dark:)(group-hover:bg-blue-600)/g, replacement: 'group-hover:bg-sand-700' },
  { regex: /(?<!dark:)(group-hover:border-blue-100)/g, replacement: 'group-hover:border-sand-300' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  for (const { regex, replacement } of regexReplacements) {
    content = content.replace(regex, replacement);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      traverse(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      processFile(filePath);
    }
  }
}

directories.forEach(dir => traverse(dir));
console.log('Light theme update complete!');

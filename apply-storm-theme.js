const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'src', 'app'),
  path.join(__dirname, 'src', 'components')
];

const replacements = {
  // Slate backgrounds
  'dark:bg-slate-950': 'dark:bg-storm-950',
  'dark:bg-slate-900': 'dark:bg-storm-900',
  'dark:bg-slate-800': 'dark:bg-storm-800',
  'dark:bg-slate-700': 'dark:bg-storm-700',
  
  // Slate borders
  'dark:border-slate-800': 'dark:border-storm-800',
  'dark:border-slate-700': 'dark:border-storm-700',
  'dark:border-slate-600': 'dark:border-storm-600',
  
  // Slate text
  'dark:text-slate-50': 'dark:text-storm-50',
  'dark:text-slate-100': 'dark:text-storm-100',
  'dark:text-slate-200': 'dark:text-storm-200',
  'dark:text-slate-300': 'dark:text-storm-300',
  'dark:text-slate-400': 'dark:text-storm-400',
  'dark:text-slate-500': 'dark:text-storm-500',
  
  // Shadows
  'dark:shadow-black': 'dark:shadow-storm-950',
  
  // Blue/Indigo accents -> Storm accents
  'dark:bg-blue-900': 'dark:bg-storm-700',
  'dark:bg-blue-600': 'dark:bg-storm-600',
  'dark:bg-blue-500': 'dark:bg-storm-500',
  'dark:text-blue-500': 'dark:text-storm-400',
  'dark:text-blue-400': 'dark:text-storm-300',
  'dark:text-blue-300': 'dark:text-storm-200',
  'dark:border-blue-500': 'dark:border-storm-500',
  'dark:from-blue-900': 'dark:from-storm-800',
  'dark:to-indigo-900': 'dark:to-storm-900',
  'dark:hover:bg-slate-800': 'dark:hover:bg-storm-800',
  'dark:hover:bg-slate-700': 'dark:hover:bg-storm-700',
  'dark:hover:bg-blue-700': 'dark:hover:bg-storm-700',
  'dark:hover:text-blue-400': 'dark:hover:text-storm-400',
  'dark:hover:text-blue-300': 'dark:hover:text-storm-300',
  'dark:focus:ring-blue-500': 'dark:focus:ring-storm-500',
  'dark:placeholder-slate-500': 'dark:placeholder-storm-500',
  'dark:divide-slate-800': 'dark:divide-storm-800'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  for (const [key, value] of Object.entries(replacements)) {
    // Escape regex characters
    const regex = new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    content = content.replace(regex, value);
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
console.log('Theme update complete!');

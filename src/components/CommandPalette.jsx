"use client";

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, User, BarChart, Settings, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
        onClick={() => setOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", bounce: 0, duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-white dark:bg-storm-900 rounded-2xl shadow-2xl overflow-hidden border border-sand-200 dark:border-storm-800 flex flex-col"
        >
          <Command className="w-full bg-transparent" shouldFilter={true}>
            <div className="flex items-center px-4 border-b border-sand-100 dark:border-storm-800">
              <Search className="w-5 h-5 text-sand-400 dark:text-storm-500 mr-2" />
              <Command.Input 
                value={search}
                onValueChange={setSearch}
                placeholder="Search for students, reports, settings..." 
                className="flex-1 w-full bg-transparent outline-none py-5 text-sand-900 dark:text-storm-100 placeholder:text-sand-400 font-medium"
                autoFocus
              />
              <button onClick={() => setOpen(false)} className="p-1 rounded-md text-sand-400 hover:bg-sand-100 dark:hover:bg-storm-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
              <Command.Empty className="p-6 text-center text-sm text-sand-500 dark:text-storm-400">
                No results found for &quot;{search}&quot;.
              </Command.Empty>

              <Command.Group heading="Navigation" className="px-2 py-3 text-xs font-semibold text-sand-500 dark:text-storm-500 uppercase tracking-wider">
                <Command.Item 
                  onSelect={() => { router.push('/'); setOpen(false); }}
                  className="flex items-center px-4 py-3 rounded-xl cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-blue-900/30 aria-selected:text-blue-600 dark:aria-selected:text-blue-400 transition-colors group mt-1"
                >
                  <BarChart className="w-4 h-4 mr-3 opacity-60 group-aria-selected:opacity-100" />
                  <span className="font-medium text-sm">Dashboard Analytics</span>
                </Command.Item>
                <Command.Item 
                  onSelect={() => { router.push('/?tab=students'); setOpen(false); }}
                  className="flex items-center px-4 py-3 rounded-xl cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-blue-900/30 aria-selected:text-blue-600 dark:aria-selected:text-blue-400 transition-colors group mt-1"
                >
                  <User className="w-4 h-4 mr-3 opacity-60 group-aria-selected:opacity-100" />
                  <span className="font-medium text-sm">Student Roster</span>
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Actions" className="px-2 py-3 text-xs font-semibold text-sand-500 dark:text-storm-500 uppercase tracking-wider">
                <Command.Item 
                  onSelect={() => { /* Trigger Upload */ setOpen(false); }}
                  className="flex items-center px-4 py-3 rounded-xl cursor-pointer aria-selected:bg-emerald-50 dark:aria-selected:bg-emerald-900/30 aria-selected:text-emerald-600 dark:aria-selected:text-emerald-400 transition-colors group mt-1"
                >
                  <div className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mr-3">
                    <span className="text-emerald-600 font-bold">+</span>
                  </div>
                  <span className="font-medium text-sm">Upload New Result (CSV/PDF)</span>
                </Command.Item>
                <Command.Item 
                  onSelect={() => { setOpen(false); }}
                  className="flex items-center px-4 py-3 rounded-xl cursor-pointer aria-selected:bg-sand-100 dark:aria-selected:bg-storm-800 transition-colors group mt-1"
                >
                  <Settings className="w-4 h-4 mr-3 opacity-60 group-aria-selected:opacity-100" />
                  <span className="font-medium text-sm">System Settings</span>
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

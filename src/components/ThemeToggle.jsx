"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return <div className="w-10 h-10 rounded-xl bg-sand-200 dark:bg-storm-800 animate-pulse"></div>;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2.5 bg-sand-50 dark:bg-storm-800 text-sand-700 dark:text-storm-300 border border-sand-300 dark:border-storm-700 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 group flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 group-hover:text-amber-400 transition-colors" />
      ) : (
        <Moon className="h-5 w-5 group-hover:text-blue-500 transition-colors" />
      )}
    </button>
  );
}

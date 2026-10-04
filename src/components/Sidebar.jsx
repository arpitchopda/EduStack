"use client";

import { motion } from 'framer-motion';
import { Home, Users, BarChart3, Settings, LogOut, Search } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function Sidebar() {
  return (
    <motion.div 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen w-64 bg-white/80 dark:bg-storm-950/80 backdrop-blur-2xl border-r border-sand-200 dark:border-storm-800 flex flex-col shadow-2xl z-40 hidden md:flex"
    >
      <div className="p-6">
        <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
          EduStack
        </h2>
        <p className="text-xs text-sand-500 dark:text-storm-400 font-medium tracking-wide">ENTERPRISE ANALYTICS</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link href="/" className="flex items-center space-x-3 px-4 py-3 bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-bold transition-all hover:bg-blue-100 dark:hover:bg-blue-900/40 shadow-sm border border-blue-100 dark:border-blue-900/30">
          <Home size={18} />
          <span>Dashboard</span>
        </Link>
        <Link href="/" className="flex items-center space-x-3 px-4 py-3 text-sand-600 dark:text-storm-300 font-medium rounded-xl transition-all hover:bg-sand-100 dark:hover:bg-storm-900 hover:text-sand-900 dark:hover:text-white">
          <Users size={18} />
          <span>Students</span>
        </Link>
        <Link href="/" className="flex items-center space-x-3 px-4 py-3 text-sand-600 dark:text-storm-300 font-medium rounded-xl transition-all hover:bg-sand-100 dark:hover:bg-storm-900 hover:text-sand-900 dark:hover:text-white">
          <BarChart3 size={18} />
          <span>Reports</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-sand-200 dark:border-storm-800">
        <button className="flex items-center w-full space-x-3 px-4 py-3 text-sand-600 dark:text-storm-300 font-medium rounded-xl transition-all hover:bg-sand-100 dark:hover:bg-storm-900 hover:text-sand-900 dark:hover:text-white">
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center w-full space-x-3 px-4 py-3 text-red-500 font-medium rounded-xl transition-all hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </motion.div>
  );
}

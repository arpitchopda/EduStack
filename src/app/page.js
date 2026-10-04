"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardStats from '@/components/DashboardStats';
import UploadModal from '@/components/UploadModal';
import StudentSearch from '@/components/StudentSearch';
import StudentProfile from '@/components/StudentProfile';
import StudentList from '@/components/StudentList';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import UploadHistory from '@/components/UploadHistory';
import ThemeToggle from '@/components/ThemeToggle';
import { Upload, GraduationCap, BarChart3, LayoutDashboard, LogOut, Menu, X, History } from 'lucide-react';
import { signOut } from 'next-auth/react';

const images = [
  "https://i.ibb.co/gM78zWw4/a-p-shah-img-1.jpg",
  "https://i.ibb.co/yB5QC4Dw/a-p-shah-img-2.jpg",
];

export default function Home() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [refreshStats, setRefreshStats] = useState(0);
  const [viewMode, setViewMode] = useState('directory'); // directory | analytics | history
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    setRefreshStats(prev => prev + 1);
  };

  const handleStudentDelete = () => {
    setSelectedStudentId(null);
    setRefreshStats(prev => prev + 1);
  };

  const navigateTo = (mode) => {
    setViewMode(mode);
    setSelectedStudentId(null);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white font-sans">
      {/* Background Image Carousel */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={images[currentImage]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
            alt="Campus Background"
          />
        </AnimatePresence>
        {/* Dynamic Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/80 to-black/95 z-10" />
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 bg-white/10 backdrop-blur-2xl border-r border-white/20 z-50 p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-3">
                  <img src="https://i.ibb.co/WvnjbJV9/a-p-shah-logo.jpg" alt="Logo" className="h-10 w-10 rounded-full border border-white/20 shadow-lg object-cover bg-white" />
                  <span className="text-xl font-bold text-white tracking-tight">eduStack</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                <button 
                  onClick={() => navigateTo('directory')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${viewMode === 'directory' ? 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white shadow-lg' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                >
                  <LayoutDashboard size={20} />
                  <span className="font-semibold">Directory</span>
                </button>
                <button 
                  onClick={() => navigateTo('analytics')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${viewMode === 'analytics' ? 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white shadow-lg' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                >
                  <BarChart3 size={20} />
                  <span className="font-semibold">Analytics</span>
                </button>
                <button 
                  onClick={() => navigateTo('history')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${viewMode === 'history' ? 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white shadow-lg' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                >
                  <History size={20} />
                  <span className="font-semibold">Upload History</span>
                </button>
              </nav>

              <div className="space-y-2 border-t border-white/20 pt-4">
                <button 
                  onClick={() => { setIsUploadModalOpen(true); setIsSidebarOpen(false); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                >
                  <Upload size={20} />
                  <span className="font-semibold">Upload Data</span>
                </button>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300">
                  <span className="font-semibold">Theme</span>
                  <ThemeToggle />
                </div>
                <button 
                  onClick={() => signOut()}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                >
                  <LogOut size={20} />
                  <span className="font-semibold">Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 p-6 md:p-8 h-full overflow-y-auto">
        <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <Menu size={24} />
            </button>
            
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-2xl">
              <h1 className="text-2xl font-black tracking-tight text-white leading-none">
                {viewMode === 'directory' ? 'Student Directory' : viewMode === 'analytics' ? 'Analytics Dashboard' : 'Upload History'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-white/10 dark:bg-black/20 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-2xl">
            <img src="https://i.ibb.co/WvnjbJV9/a-p-shah-logo.jpg" alt="College Logo" className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-white/20 shadow-lg object-cover bg-white" />
            <div className="flex flex-col justify-center">
              <span className="text-xs md:text-sm font-semibold text-purple-300 tracking-wider uppercase">PCT&apos;s</span>
              <span className="text-base md:text-lg font-bold tracking-tight text-white leading-tight">A. P. Shah Institute OF Technology</span>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto relative z-10">
          {viewMode !== 'history' && <StudentSearch onSelectStudent={setSelectedStudentId} />}

          {!selectedStudentId && viewMode === 'directory' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
                Overview
              </h2>
              <DashboardStats key={refreshStats} />
              <StudentList 
                onSelectStudent={setSelectedStudentId} 
                refreshKey={refreshStats}
                onDeleteSuccess={handleStudentDelete}
              />
            </div>
          )}

          {!selectedStudentId && viewMode === 'analytics' && (
            <AnalyticsDashboard key={`analytics-${refreshStats}`} />
          )}

          {!selectedStudentId && viewMode === 'history' && (
            <UploadHistory key={`history-${refreshStats}`} />
          )}

          {selectedStudentId && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative mt-8 pt-6">
              <button 
                onClick={() => setSelectedStudentId(null)}
                className="absolute -top-6 left-0 text-sm font-semibold text-white/80 hover:text-white flex items-center transition-colors px-4 py-1.5 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-md border border-white/20"
              >
                &larr; Back to Directory
              </button>
              <StudentProfile 
                studentId={selectedStudentId} 
                onDeleteStudent={handleStudentDelete}
              />
            </div>
          )}
        </main>

        <UploadModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setIsUploadModalOpen(false)} 
          onUploadSuccess={handleUploadSuccess}
        />
      </div>
    </div>
  );
}

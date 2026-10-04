import { useEffect, useState } from 'react';
import { Users, GraduationCap, UploadCloud } from 'lucide-react';

export default function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="animate-pulse flex space-x-4 p-6 bg-sand-50/50 rounded-xl">Loading stats...</div>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-sand-50/80 dark:bg-storm-900/80 backdrop-blur-xl rounded-3xl p-6 border border-sand-200 dark:border-storm-800 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-sand-300 dark:bg-storm-700/50 text-sand-700 dark:text-storm-300 rounded-2xl">
            <Users size={24} />
          </div>
          <h3 className="text-sand-600 dark:text-storm-400 font-medium text-sm">Total Students</h3>
        </div>
        <p className="text-3xl font-bold text-sand-900 dark:text-storm-100 transition-colors">{stats.totalStudents}</p>
      </div>
      
      <div className="bg-sand-50/80 dark:bg-storm-900/80 backdrop-blur-xl rounded-3xl p-6 border border-sand-200 dark:border-storm-800 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-sand-300 dark:bg-emerald-900/50 text-sand-700 dark:text-emerald-400 rounded-2xl">
            <GraduationCap size={24} />
          </div>
          <h3 className="text-sand-600 dark:text-storm-400 font-medium text-sm">Average CGPA</h3>
        </div>
        <p className="text-3xl font-bold text-sand-900 dark:text-storm-100 transition-colors">{stats.avgCgpa}</p>
      </div>

      <div className="bg-sand-50/80 dark:bg-storm-900/80 backdrop-blur-xl rounded-3xl p-6 border border-sand-200 dark:border-storm-800 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-sand-300 dark:bg-purple-900/50 text-sand-700 dark:text-purple-400 rounded-2xl">
            <UploadCloud size={24} />
          </div>
          <h3 className="text-sand-600 dark:text-storm-400 font-medium text-sm">Recent Uploads</h3>
        </div>
        <p className="text-3xl font-bold text-sand-900 dark:text-storm-100 transition-colors">{stats.recentUploads?.length || 0}</p>
      </div>
    </div>
  );
}

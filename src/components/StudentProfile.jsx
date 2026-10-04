import { useState, useEffect } from 'react';
import { Download, Trash2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export default function StudentProfile({ studentId, onDeleteStudent }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!studentId) return;

    let ignore = false;
    fetch(`/api/students/${studentId}`)
      .then(res => res.json())
      .then(data => {
        if (!ignore) {
          setProfile(data.student);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [studentId]);

  const handleDelete = async () => {
    if (!profile) return;
    if (!window.confirm(`Are you sure you want to permanently delete student "${profile.name}" (${profile.id}) and all semester records?`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/students/${profile.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (onDeleteStudent) onDeleteStudent();
      } else {
        alert('Failed to delete student');
      }
    } catch (err) {
      alert(`Error deleting student: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-sand-600 flex flex-col items-center"><div className="w-8 h-8 border-4 border-sand-400 border-t-blue-600 rounded-full animate-spin mb-4"></div>Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center text-sand-600 bg-sand-50/50 rounded-2xl border border-sand-200">Student not found</div>;

  const cgpaData = profile.semesters.map(s => {
    let isDrop = false;
    try {
      const ad = JSON.parse(s.academicData || '{}');
      isDrop = ad.isDrop === true;
    } catch(e) {}
    
    return {
      name: s.semester,
      cgpa: s.cgpa || 0,
      isDrop
    };
  });

  const handleExportCSV = () => {
    const headers = ['Semester', 'Total Credits', 'CGPA', 'Dynamic Fields'];
    const rows = profile.semesters.map(s => [
      s.semester, 
      s.totalCredits || '', 
      s.cgpa || '',
      s.academicData
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.map(cell => `"${(cell||'').toString().replace(/"/g, '""')}"`).join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_${profile.id}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-sand-50/80 dark:bg-storm-900/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-sand-200 dark:border-storm-800 shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-storm-800 dark:to-storm-900 px-8 py-10 text-white relative">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold mb-3">{profile.name}</h2>
            <div className="flex flex-wrap gap-3 text-sm opacity-90">
              <span className="bg-sand-50/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">ID: {profile.id}</span>
              {profile.batch && <span className="bg-sand-50/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">Batch: {profile.batch}</span>}
              {profile.department && <span className="bg-sand-50/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">Dept: {profile.department}</span>}
              {profile.email && <span className="bg-sand-50/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">{profile.email}</span>}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={handleExportCSV} className="flex items-center space-x-2 text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl transition-all shadow-sm">
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={handleDelete} 
              disabled={deleting}
              className="flex items-center space-x-2 text-sm font-semibold bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-white px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              <Trash2 size={16} />
              <span>{deleting ? 'Deleting...' : 'Delete Student'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {profile.semesters && profile.semesters[0] && profile.semesters[0].academicData && (
            Object.entries(JSON.parse(profile.semesters[0].academicData))
              .filter(([key]) => key !== 'isDrop')
              .map(([key, value]) => (
              <div key={key} className="bg-sand-100/50 dark:bg-storm-800/50 rounded-2xl p-4 border border-sand-200 dark:border-storm-800">
                <p className="text-xs font-semibold text-sand-600 dark:text-storm-400 uppercase tracking-wider mb-1">{key}</p>
                <p className="font-medium text-sand-900 dark:text-storm-200">{value}</p>
              </div>
            ))
          )}
        </div>

        {profile.semesters && profile.semesters.length > 0 && (
          <div className="mt-8 border-t border-sand-200 dark:border-storm-800 pt-8">
            <h3 className="text-lg font-bold text-sand-900 dark:text-storm-100 mb-6 flex items-center">
              <span className="w-2 h-6 bg-blue-600 rounded-full mr-3"></span>
              Academic Performance Trend
            </h3>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cgpaData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Line type="monotone" dataKey="cgpa" stroke="#4f46e5" strokeWidth={4} dot={{r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} name="CGPA" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-sand-500 dark:text-storm-500 text-xs uppercase tracking-wider font-semibold px-4">
                    <th className="px-4 py-2">Semester</th>
                    <th className="px-4 py-2 text-right">CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {cgpaData.map((sem) => (
                    <tr key={sem.name} className="bg-sand-100/50 dark:bg-storm-800/50 rounded-xl hover:bg-sand-200 dark:hover:bg-storm-700 transition-colors">
                      <td className="px-4 py-3 rounded-l-xl border-y border-l border-sand-200 dark:border-storm-800 font-medium text-sand-800 dark:text-storm-200">{sem.name}</td>
                      <td className="px-4 py-3 rounded-r-xl border-y border-r border-sand-200 dark:border-storm-800 text-right font-bold text-sand-700 dark:text-indigo-400">
                        {sem.isDrop ? (
                          <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-2 py-1 rounded text-xs border border-red-200 dark:border-red-800">DROP</span>
                        ) : (
                          sem.cgpa
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

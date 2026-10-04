import { useState, useEffect } from 'react';
import { ChevronRight, GraduationCap, Trash2, Edit } from 'lucide-react';

export default function StudentList({ onSelectStudent, refreshKey, onDeleteSuccess }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [availableFilters, setAvailableFilters] = useState({ batches: [], departments: [], joiningTypes: [] });
  const [filters, setFilters] = useState({ batch: 'ALL', department: 'ALL', gender: 'ALL', joiningType: 'ALL', dropperSem: 'ALL' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams();
    if (filters.batch !== 'ALL') params.append('batch', filters.batch);
    if (filters.department !== 'ALL') params.append('department', filters.department);
    if (filters.gender !== 'ALL') params.append('gender', filters.gender);
    if (filters.joiningType !== 'ALL') params.append('joiningType', filters.joiningType);
    if (filters.dropperSem !== 'ALL') params.append('dropperSem', filters.dropperSem);

    fetch(`/api/students?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (!ignore) {
          setStudents(data.students || []);
          if (data.availableFilters) {
            setAvailableFilters(data.availableFilters);
          }
          setLoading(false);
        }
      })
      .catch(err => {
        if (!ignore) {
          console.error(err);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [refreshKey, filters]);

  const handleDelete = async (e, studentId, studentName) => {
    e.stopPropagation(); // Prevent opening profile
    if (!window.confirm(`Are you sure you want to delete student "${studentName}" (${studentId}) and all associated records?`)) {
      return;
    }

    setDeletingId(studentId);
    try {
      const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
      if (res.ok) {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        if (onDeleteSuccess) onDeleteSuccess();
      } else {
        alert('Failed to delete student');
      }
    } catch (err) {
      alert(`Error deleting student: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(students.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (e, id) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  // Bulk edit removed from here
  if (loading) {
    return (
      <div className="mt-12 bg-sand-50/60 dark:bg-storm-900/60 backdrop-blur-md rounded-3xl p-8 border border-sand-200 dark:border-storm-800 shadow-sm animate-pulse">
        <div className="h-6 bg-sand-300 dark:bg-storm-800 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-sand-200 dark:bg-storm-800 rounded-2xl w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 bg-sand-50/80 dark:bg-storm-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-sand-200 dark:border-storm-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-sand-900 dark:text-storm-100 flex items-center transition-colors">
          <span className="w-2 h-6 bg-sand-700 dark:bg-storm-500 rounded-full mr-3"></span>
          Student Directory
        </h2>
        <div className="flex space-x-3 items-center">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm ${showFilters ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-sand-200 dark:bg-storm-700/50 text-sand-800 dark:text-storm-300'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            <span>Filters</span>
          </button>
          <span className="px-3 py-1 bg-sand-200 dark:bg-storm-700/50 text-sand-800 dark:text-storm-300 text-xs font-bold rounded-full transition-colors">
            {students.length} Records
          </span>
        </div>
      </div>

      {showFilters && (
        <div className="bg-sand-100/50 dark:bg-storm-800/50 rounded-2xl p-4 mb-6 border border-sand-200 dark:border-storm-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-sand-600 dark:text-storm-400 mb-1">Batch</label>
            <select value={filters.batch} onChange={(e) => setFilters({...filters, batch: e.target.value})} className="w-full bg-white dark:bg-storm-950 border border-sand-300 dark:border-storm-700 rounded-lg px-2 py-1.5 text-sm font-semibold text-sand-900 dark:text-storm-100 focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="ALL">All Batches</option>
              {availableFilters.batches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-sand-600 dark:text-storm-400 mb-1">Department</label>
            <select value={filters.department} onChange={(e) => setFilters({...filters, department: e.target.value})} className="w-full bg-white dark:bg-storm-950 border border-sand-300 dark:border-storm-700 rounded-lg px-2 py-1.5 text-sm font-semibold text-sand-900 dark:text-storm-100 focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="ALL">All Departments</option>
              {availableFilters.departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-sand-600 dark:text-storm-400 mb-1">Gender</label>
            <select value={filters.gender} onChange={(e) => setFilters({...filters, gender: e.target.value})} className="w-full bg-white dark:bg-storm-950 border border-sand-300 dark:border-storm-700 rounded-lg px-2 py-1.5 text-sm font-semibold text-sand-900 dark:text-storm-100 focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="ALL">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-sand-600 dark:text-storm-400 mb-1">Joining Type</label>
            <select value={filters.joiningType} onChange={(e) => setFilters({...filters, joiningType: e.target.value})} className="w-full bg-white dark:bg-storm-950 border border-sand-300 dark:border-storm-700 rounded-lg px-2 py-1.5 text-sm font-semibold text-sand-900 dark:text-storm-100 focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="ALL">All Types</option>
              {availableFilters.joiningTypes.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-sand-600 dark:text-storm-400 mb-1">Dropper Semester</label>
            <select value={filters.dropperSem} onChange={(e) => setFilters({...filters, dropperSem: e.target.value})} className="w-full bg-white dark:bg-storm-950 border border-sand-300 dark:border-storm-700 rounded-lg px-2 py-1.5 text-sm font-semibold text-sand-900 dark:text-storm-100 focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="ALL">None</option>
              {['SEM-1','SEM-2','SEM-3','SEM-4','SEM-5','SEM-6','SEM-7','SEM-8'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-sand-500 dark:text-storm-500 text-xs uppercase tracking-wider font-semibold px-4">
              <th className="px-4 py-2">ID / Roll No</th>
              <th className="px-4 py-2">Student Name</th>
              <th className="px-4 py-2">Batch</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr 
                key={student.id} 
                onClick={() => onSelectStudent(student.id)}
                className="bg-sand-50 dark:bg-storm-800/50 hover:bg-sand-200/60 dark:hover:bg-storm-800 transition-colors shadow-sm group cursor-pointer border border-sand-200 dark:border-storm-800 rounded-2xl overflow-hidden"
              >
                <td className="px-4 py-4 rounded-l-2xl border-y border-l border-sand-200/50 dark:border-storm-700/50 group-hover:border-sand-300 dark:group-hover:border-slate-600 font-medium text-sand-600 dark:text-storm-400">
                  {student.id}
                </td>
                <td className="px-4 py-4 border-y border-sand-200/50 dark:border-storm-700/50 group-hover:border-sand-300 dark:group-hover:border-slate-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-sand-300 dark:bg-storm-700/50 flex items-center justify-center text-sand-700 dark:text-storm-300 transition-colors">
                      <GraduationCap size={16} />
                    </div>
                    <span className="font-bold text-sand-800 dark:text-storm-200 group-hover:text-sand-800 dark:group-hover:text-blue-400 transition-colors">
                      {student.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 border-y border-sand-200/50 dark:border-storm-700/50 text-xs font-semibold text-sand-700 dark:text-storm-300">
                  {student.batch || 'N/A'}
                </td>
                <td className="px-4 py-4 border-y border-sand-200/50 dark:border-storm-700/50 text-xs font-semibold text-sand-700 dark:text-storm-300">
                  {student.department || 'N/A'}
                </td>
                <td className="px-4 py-4 rounded-r-2xl border-y border-r border-sand-200/50 dark:border-storm-700/50 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={(e) => handleDelete(e, student.id, student.name)}
                      disabled={deletingId === student.id}
                      title="Delete Student"
                      className="p-2 rounded-xl text-sand-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sand-100 dark:bg-storm-900 text-sand-500 dark:text-storm-500 group-hover:bg-sand-700 group-hover:text-white dark:group-hover:bg-sand-2000 dark:group-hover:text-white transition-all transform group-hover:translate-x-1">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal removed */}
    </div>
  );
}

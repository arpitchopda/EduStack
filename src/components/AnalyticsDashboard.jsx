import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Users, AlertTriangle, Layers, Award } from 'lucide-react';
import FilterBar from './FilterBar';
import { motion } from 'framer-motion';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const PIE_COLORS = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];

// Stagger variants for motion
const containerVars = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filters, setFilters] = useState({
    batch: 'ALL',
    department: 'ALL',
    cgpaBand: 'ALL',
    gender: 'ALL'
  });

  const handleFilterChange = (key, value) => {
    setLoading(true);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setLoading(true);
    setFilters({
      batch: 'ALL',
      department: 'ALL',
      cgpaBand: 'ALL',
      gender: 'ALL'
    });
  };

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams();
    if (filters.batch !== 'ALL') params.append('batch', filters.batch);
    if (filters.department !== 'ALL') params.append('department', filters.department);
    if (filters.gender !== 'ALL') params.append('gender', filters.gender);

    if (filters.cgpaBand !== 'ALL') {
      if (filters.cgpaBand === '9-10') { params.append('minCgpa', '9.0'); params.append('maxCgpa', '10.0'); }
      else if (filters.cgpaBand === '8-9') { params.append('minCgpa', '8.0'); params.append('maxCgpa', '8.99'); }
      else if (filters.cgpaBand === '7-8') { params.append('minCgpa', '7.0'); params.append('maxCgpa', '7.99'); }
      else if (filters.cgpaBand === '6-7') { params.append('minCgpa', '6.0'); params.append('maxCgpa', '6.99'); }
      else if (filters.cgpaBand === '5.5-6') { params.append('minCgpa', '5.5'); params.append('maxCgpa', '5.99'); }
      else if (filters.cgpaBand === '5-5.5') { params.append('minCgpa', '5.0'); params.append('maxCgpa', '5.49'); }
      else if (filters.cgpaBand === '4-5') { params.append('minCgpa', '4.0'); params.append('maxCgpa', '4.99'); }
      else if (filters.cgpaBand === '0-4') { params.append('minCgpa', '0.0'); params.append('maxCgpa', '3.99'); }
      else if (filters.cgpaBand === 'DROP') { params.append('isDrop', 'true'); }
    }

    fetch(`/api/analytics?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        if (!ignore) {
          setData(json);
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
  }, [filters]);

  return (
    <div className="mt-4 space-y-8">
      
      {/* Filter Toolbar */}
      <FilterBar 
        availableBatches={data?.availableFilters?.batches || []}
        availableDepartments={data?.availableFilters?.departments || []}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {loading ? (
        <div className="bg-white/40 dark:bg-storm-900/40 backdrop-blur-3xl rounded-3xl p-12 border border-white/20 dark:border-storm-800 shadow-xl min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sand-600 dark:text-storm-400 font-semibold animate-pulse">Running advanced analytics...</p>
          </div>
        </div>
      ) : !data || data.error ? (
        <div className="p-12 text-center bg-sand-200 dark:bg-red-900/20 rounded-3xl border border-sand-300 dark:border-red-900/50">
          <p className="text-sand-700 dark:text-red-400 font-semibold">No analytics data matching the selected filter criteria.</p>
        </div>
      ) : (
        <>
          {/* Header Summary Cards */}
          <motion.div 
            variants={containerVars}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
          >
            <motion.div variants={itemVars} className="bg-white/60 dark:bg-storm-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/40 dark:border-storm-800 shadow-lg flex items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-4 font-bold">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-sand-500 dark:text-storm-400 font-bold uppercase tracking-wider">Students</p>
                <p className="text-2xl font-black text-sand-900 dark:text-storm-50">{data.totalFilteredStudents || 0}</p>
              </div>
            </motion.div>

            <motion.div variants={itemVars} className="bg-white/60 dark:bg-storm-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/40 dark:border-storm-800 shadow-lg flex items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-4 font-bold">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-sand-500 dark:text-storm-400 font-bold uppercase tracking-wider">Top CGPA</p>
                <p className="text-2xl font-black text-sand-900 dark:text-storm-50">{data.topScorers[0]?.avgCgpa || 'N/A'}</p>
              </div>
            </motion.div>

            <motion.div variants={itemVars} className="bg-white/60 dark:bg-storm-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/40 dark:border-storm-800 shadow-lg flex items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mr-4 font-bold">
                <TrendingDown size={24} />
              </div>
              <div>
                <p className="text-xs text-sand-500 dark:text-storm-400 font-bold uppercase tracking-wider">Low CGPA</p>
                <p className="text-2xl font-black text-sand-900 dark:text-storm-50">{data.leastScorers[0]?.avgCgpa || 'N/A'}</p>
              </div>
            </motion.div>

            <motion.div variants={itemVars} className="bg-white/60 dark:bg-storm-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/40 dark:border-storm-800 shadow-lg flex items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-4 font-bold">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs text-sand-500 dark:text-storm-400 font-bold uppercase tracking-wider">Avg CGPA</p>
                <p className="text-2xl font-black text-sand-900 dark:text-storm-50">
                  {data.semesterTrend.length > 0
                    ? (data.semesterTrend.reduce((a,b) => a+b.average, 0) / data.semesterTrend.length).toFixed(2)
                    : 'N/A'}
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVars} className="bg-white/60 dark:bg-storm-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/40 dark:border-storm-800 shadow-lg flex items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mr-4 font-bold">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-xs text-sand-500 dark:text-storm-400 font-bold uppercase tracking-wider">Total Dropouts</p>
                <p className="text-2xl font-black text-sand-900 dark:text-storm-50">{data.totalDropouts || 0}</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* CGPA Grade Distribution (Histogram Bar Chart) */}
            <div className="bg-sand-50/80 dark:bg-storm-900/80 backdrop-blur-xl rounded-3xl p-6 border border-sand-200 dark:border-storm-800 shadow-sm transition-all duration-300 hover:shadow-lg">
              <h3 className="text-base font-bold text-sand-900 dark:text-storm-100 mb-6 flex items-center">
                <span className="w-2 h-5 bg-blue-600 rounded-full mr-2.5"></span>
                CGPA Grade Distribution Histogram
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.gradeDistribution} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="range" tick={{fontSize: 11, fill: '#64748b'}} />
                      <YAxis tick={{fontSize: 11, fill: '#64748b'}} />
                      <Tooltip cursor={{fill: '#f1f5f9', opacity: 0.2}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Students Count">
                        {data.gradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.range === 'Dropped (DROP)' ? '#ef4444' : '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dropouts per Semester (Bar Chart) */}
            {data.dropsPerSemester && (
              <div className="bg-sand-50/80 dark:bg-storm-900/80 backdrop-blur-xl rounded-3xl p-6 border border-sand-200 dark:border-storm-800 shadow-sm transition-all duration-300 hover:shadow-lg">
                <h3 className="text-base font-bold text-sand-900 dark:text-storm-100 mb-6 flex items-center">
                  <span className="w-2 h-5 bg-red-500 rounded-full mr-2.5"></span>
                  Dropouts / Missing GPA per Semester
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.dropsPerSemester} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="semester" tick={{fontSize: 11, fill: '#64748b'}} />
                      <YAxis tick={{fontSize: 11, fill: '#64748b'}} />
                      <Tooltip cursor={{fill: '#f1f5f9', opacity: 0.2}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="drops" fill="#ef4444" radius={[6, 6, 0, 0]} name="Dropouts" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Semester Trend (Line Chart) */}
            <div className="bg-sand-50/80 dark:bg-storm-900/80 backdrop-blur-xl rounded-3xl p-6 border border-sand-200 dark:border-storm-800 shadow-sm transition-all duration-300 hover:shadow-lg">
              <h3 className="text-base font-bold text-sand-900 dark:text-storm-100 mb-6 flex items-center">
                <span className="w-2 h-5 bg-purple-600 rounded-full mr-2.5"></span>
                Semester CGPA Progression Trend
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.semesterTrend} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} />
                    <YAxis domain={[0, 10]} tick={{fontSize: 11, fill: '#64748b'}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="average" stroke="#8b5cf6" strokeWidth={3} dot={{r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff'}} name="Avg CGPA" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top 5 High Scorers (Horizontal Bar Chart) */}
            <div className="bg-sand-50/80 dark:bg-storm-900/80 backdrop-blur-xl rounded-3xl p-6 border border-sand-200 dark:border-storm-800 shadow-sm transition-all duration-300 hover:shadow-lg">
              <h3 className="text-base font-bold text-sand-900 dark:text-storm-100 mb-6 flex items-center">
                <span className="w-2 h-5 bg-emerald-500 rounded-full mr-2.5"></span>
                Top 5 High Performers
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topScorers} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis type="number" domain={[0, 10]} hide />
                    <YAxis dataKey="name" type="category" width={110} tick={{fontSize: 11, fill: '#64748b'}} />
                    <Tooltip cursor={{fill: '#f1f5f9', opacity: 0.2}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="avgCgpa" fill="#10b981" radius={[0, 6, 6, 0]} barSize={22} name="Avg CGPA" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom 5 Performers (Horizontal Bar Chart) */}
            <div className="bg-sand-50/80 dark:bg-storm-900/80 backdrop-blur-xl rounded-3xl p-6 border border-sand-200 dark:border-storm-800 shadow-sm transition-all duration-300 hover:shadow-lg">
              <h3 className="text-base font-bold text-sand-900 dark:text-storm-100 mb-6 flex items-center">
                <span className="w-2 h-5 bg-red-500 rounded-full mr-2.5"></span>
                Bottom 5 Performers
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.leastScorers} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis type="number" domain={[0, 10]} hide />
                    <YAxis dataKey="name" type="category" width={110} tick={{fontSize: 11, fill: '#64748b'}} />
                    <Tooltip cursor={{fill: '#f1f5f9', opacity: 0.2}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="avgCgpa" fill="#ef4444" radius={[0, 6, 6, 0]} barSize={22} name="Avg CGPA" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Batch Distribution (Pie Chart) */}
            {data.batchDistribution && data.batchDistribution.length > 0 && (
              <div className="bg-sand-50/80 dark:bg-storm-900/80 backdrop-blur-xl rounded-3xl p-6 border border-sand-200 dark:border-storm-800 shadow-sm transition-all duration-300 hover:shadow-lg">
                <h3 className="text-base font-bold text-sand-900 dark:text-storm-100 mb-4 text-center">Batch Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.batchDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                        {data.batchDistribution.map((entry, index) => (
                          <Cell key={`batch-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Department Distribution (Pie Chart) */}
            {data.departmentDistribution && data.departmentDistribution.length > 0 && (
              <div className="bg-sand-50/80 dark:bg-storm-900/80 backdrop-blur-xl rounded-3xl p-6 border border-sand-200 dark:border-storm-800 shadow-sm transition-all duration-300 hover:shadow-lg">
                <h3 className="text-base font-bold text-sand-900 dark:text-storm-100 mb-4 text-center">Department Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.departmentDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                        {data.departmentDistribution.map((entry, index) => (
                          <Cell key={`dept-cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Gender Distribution */}
            {data.demographics.gender.length > 0 && (
              <div className="bg-sand-50/80 dark:bg-storm-900/80 backdrop-blur-xl rounded-3xl p-6 border border-sand-200 dark:border-storm-800 shadow-sm transition-all duration-300 hover:shadow-lg">
                <h3 className="text-base font-bold text-sand-900 dark:text-storm-100 mb-4 text-center">Gender Ratio</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.demographics.gender} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                        {data.demographics.gender.map((entry, index) => (
                          <Cell key={`gender-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Joining Type Distribution */}
            {data.demographics.joiningType.length > 0 && (
              <div className="bg-sand-50/80 dark:bg-storm-900/80 backdrop-blur-xl rounded-3xl p-6 border border-sand-200 dark:border-storm-800 shadow-sm transition-all duration-300 hover:shadow-lg">
                <h3 className="text-base font-bold text-sand-900 dark:text-storm-100 mb-4 text-center">Joining / Entry Type</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.demographics.joiningType} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                        {data.demographics.joiningType.map((entry, index) => (
                          <Cell key={`jt-cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}

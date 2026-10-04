import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, AlertCircle, XCircle, Edit } from 'lucide-react';

export default function UploadHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeUpload, setActiveUpload] = useState(null);
  const [bulkField, setBulkField] = useState('batch');
  const [bulkValue, setBulkValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleBulkUpdate = async () => {
    if (!bulkValue) {
      alert("Please enter a value to update.");
      return;
    }
    
    setIsUpdating(true);
    try {
      const res = await fetch('/api/history/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId: activeUpload.id,
          field: bulkField,
          value: bulkValue
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(`Successfully updated ${data.count} students!`);
        setActiveUpload(null);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to process bulk update.');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  if (loading) {
    return (
      <div className="mt-12 bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl animate-pulse text-white">
        <div className="h-6 bg-white/20 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/10 rounded-2xl w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
          Upload & Analysis History
        </h2>
        <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full border border-white/20">
          {history.length} Records
        </span>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-gray-300">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No upload history found.</p>
          <p className="text-sm opacity-70">Upload a file to see it tracked here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-gray-300 text-xs uppercase tracking-wider font-semibold px-4">
                <th className="px-4 py-2">File Name</th>
                <th className="px-4 py-2">Date & Time</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Records Added</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr 
                  key={record.id} 
                  className="bg-white/5 hover:bg-white/10 transition-colors shadow-sm group border border-white/10 rounded-2xl overflow-hidden text-white"
                >
                  <td className="px-4 py-4 rounded-l-2xl border-y border-l border-white/10 font-medium flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-purple-400">
                      <FileText size={16} />
                    </div>
                    <span>{record.filename}</span>
                  </td>
                  <td className="px-4 py-4 border-y border-white/10 text-sm text-gray-300">
                    {formatDate(record.uploadDate)}
                  </td>
                  <td className="px-4 py-4 border-y border-white/10">
                    {record.status === 'SUCCESS' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold border border-green-500/30">
                        <CheckCircle2 size={12} />
                        <span>Success</span>
                      </span>
                    ) : record.status === 'PARTIAL' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-bold border border-yellow-500/30" title={record.errors ? JSON.parse(record.errors).join('\n') : ''}>
                        <AlertCircle size={12} />
                        <span>Partial</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30" title={record.errors ? JSON.parse(record.errors).join('\n') : ''}>
                        <XCircle size={12} />
                        <span>Failed</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 border-y border-white/10 text-right font-bold text-indigo-300">
                    +{record.recordsAdded}
                  </td>
                  <td className="px-4 py-4 rounded-r-2xl border-y border-r border-white/10 text-center">
                    {record.recordsAdded > 0 && record.studentIds && (
                      <button 
                        onClick={() => setActiveUpload(record)}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Bulk Edit Students from this Upload"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-white">Bulk Update Students</h3>
            <p className="text-sm text-slate-300 mb-6">
              Update an attribute for all students uploaded in <strong>{activeUpload.filename}</strong>.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Attribute</label>
                <select 
                  value={bulkField}
                  onChange={(e) => setBulkField(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="batch">Batch (e.g. 2020-21)</option>
                  <option value="department">Department</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">New Value</label>
                <input 
                  type="text"
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                  placeholder="Enter new value..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setActiveUpload(null)}
                className="px-4 py-2 rounded-xl font-medium bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkUpdate}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Apply Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

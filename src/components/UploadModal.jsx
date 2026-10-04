import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileSpreadsheet, File, Folder } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [skippedPopup, setSkippedPopup] = useState(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(f => {
      const ext = f.name.toLowerCase();
      return ext.endsWith('.csv');
    });

    if (validFiles.length > 0) {
      setFiles(validFiles);
      setResult(null);
      setUploadProgress(0);
    } else {
      alert("No valid files found. Please select only CSV files.");
    }
    
    // Reset inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setResult(null);
    setUploadProgress(0);

    let successCount = 0;
    let failureCount = 0;
    let allErrors = [];
    let allSkipped = [];

    for (let i = 0; i < files.length; i++) {
      const currentFile = files[i];
      const formData = new FormData();
      formData.append('file', currentFile);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const responseText = await res.text();
        let data = {};
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          data = { error: res.ok ? 'Server returned invalid response format' : `Server error (${res.status}).` };
        }
        
        if (res.ok && data.success !== false) {
          successCount++;
          if (data.skippedStudents && data.skippedStudents.length > 0) {
            allSkipped.push(...data.skippedStudents);
          }
        } else {
          failureCount++;
          const errorMessage = data.details ? `${data.error}: ${data.details}` : (data.error || 'Upload failed');
          allErrors.push(`[${currentFile.name}] ${errorMessage}`);
          if (data.errors) allErrors.push(...data.errors.map(err => `[${currentFile.name}] ${err}`));
        }
      } catch (err) {
        failureCount++;
        allErrors.push(`[${currentFile.name}] ${err.message}`);
      }
      
      setUploadProgress(i + 1);
    }

    setUploading(false);
    
    setResult({
      success: failureCount === 0 && successCount > 0,
      message: `Processed ${files.length} file(s). ${successCount} successful, ${failureCount} failed.`,
      errors: allErrors
    });

    if (allSkipped.length > 0) {
      setSkippedPopup({ count: allSkipped.length, names: allSkipped });
      setTimeout(() => setSkippedPopup(null), 3000);
    }

    if (successCount > 0) {
      setTimeout(() => {
        onUploadSuccess();
      }, 1000);
    }
  };

  const getFileIcon = (filename) => {
    if (filename.toLowerCase().endsWith('.pdf')) {
      return <File className="mr-2 text-red-500 flex-shrink-0" size={18} />;
    }
    return <FileSpreadsheet className="mr-2 text-emerald-500 flex-shrink-0" size={18} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-storm-950/80 backdrop-blur-md">
      <div className="bg-sand-50 dark:bg-storm-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-sand-200 dark:border-storm-800 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-sand-200 dark:border-storm-800 flex justify-between items-center bg-sand-100/50 dark:bg-storm-900/50 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-sand-900 dark:text-storm-100">Upload Student Roster & Data</h3>
            <p className="text-xs text-sand-500 dark:text-storm-400">Upload multiple files or entire folders</p>
          </div>
          <button onClick={onClose} className="text-sand-500 hover:text-sand-700 dark:hover:text-slate-300 transition-colors p-2 hover:bg-sand-200 dark:hover:bg-storm-800 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {!result && files.length === 0 ? (
            <div 
              className="border-2 border-dashed border-sand-300 dark:border-storm-700 rounded-2xl p-8 text-center hover:border-blue-500 dark:hover:border-storm-500 hover:bg-sand-200/50 dark:hover:bg-storm-800/40 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple
                accept=".csv"
                onChange={handleFileChange}
              />
              <input 
                type="file" 
                ref={folderInputRef} 
                className="hidden" 
                webkitdirectory="true"
                directory="true"
                multiple
                onChange={handleFileChange}
              />
              <Upload className="mx-auto h-12 w-12 text-sand-500 dark:text-storm-400 mb-4 transition-transform hover:-translate-y-1 duration-300" />
              <p className="text-sm text-sand-700 dark:text-storm-200 mb-4 font-semibold">Select CSV files or a folder to upload</p>
              
              <div className="flex justify-center space-x-4 mb-2 relative z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="px-4 py-2 bg-sand-200 dark:bg-storm-800 rounded-xl text-sm font-semibold hover:bg-sand-300 dark:hover:bg-storm-700 transition-colors flex items-center"
                >
                  <File className="w-4 h-4 mr-2" />
                  Files
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }}
                  className="px-4 py-2 bg-sand-200 dark:bg-storm-800 rounded-xl text-sm font-semibold hover:bg-sand-300 dark:hover:bg-storm-700 transition-colors flex items-center"
                >
                  <Folder className="w-4 h-4 mr-2" />
                  Folder
                </button>
              </div>
              <p className="text-xs text-sand-500 dark:text-storm-400 font-medium mt-4">Supports CSV data files only</p>
            </div>
          ) : !result && files.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-sand-900 dark:text-storm-100">{files.length} Files Selected</h4>
                <button onClick={() => setFiles([])} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Clear all</button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {files.map((f, i) => (
                  <div key={i} className={`p-3 rounded-xl shadow-sm border flex items-center justify-between text-sm font-semibold transition-colors ${
                    uploading && i < uploadProgress 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : uploading && i === uploadProgress
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                      : 'bg-sand-100 dark:bg-storm-800 border-sand-200 dark:border-storm-700 text-sand-800 dark:text-storm-200'
                  }`}>
                    <div className="flex items-center overflow-hidden">
                      {getFileIcon(f.name)}
                      <span className="truncate">{f.name}</span>
                    </div>
                    {uploading && i < uploadProgress && <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 ml-2" />}
                    {uploading && i === uploadProgress && <span className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin flex-shrink-0 ml-2"></span>}
                  </div>
                ))}
              </div>
              {uploading && (
                <div className="w-full bg-sand-200 dark:bg-storm-800 rounded-full h-2 mt-4 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(uploadProgress / files.length) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : (
            <div className={`p-6 rounded-2xl border animate-in fade-in ${result.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="flex items-center mb-4">
                {result.success ? (
                  <CheckCircle className="text-emerald-500 mr-3" size={24} />
                ) : (
                  <AlertCircle className="text-red-500 mr-3" size={24} />
                )}
                <h4 className={`text-base font-bold ${result.success ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                  {result.message}
                </h4>
              </div>
              {result.errors && result.errors.length > 0 && (
                <div className="mt-4 max-h-40 overflow-y-auto text-xs text-sand-700 dark:text-red-400 bg-sand-50/60 dark:bg-black/20 p-3 rounded-lg border border-sand-300/50 dark:border-red-900/30">
                  <ul className="list-disc pl-4 space-y-1">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!result.success && (
                <button 
                  onClick={() => { setFiles([]); setResult(null); }}
                  className="mt-4 text-xs font-bold text-sand-700 dark:text-storm-300 hover:underline"
                >
                  Try uploading another file
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-6 bg-sand-100 dark:bg-storm-900 border-t border-sand-200 dark:border-storm-800 flex justify-end space-x-3 flex-shrink-0">
          <button 
            onClick={onClose}
            disabled={uploading}
            className="px-5 py-2.5 text-sm font-semibold text-sand-700 dark:text-storm-300 hover:bg-sand-300 dark:hover:bg-storm-800 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {result?.success ? 'Close' : 'Cancel'}
          </button>
          {!result && files.length > 0 && (
            <button 
              onClick={handleUpload}
              disabled={uploading}
              className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-storm-600 dark:hover:bg-storm-500 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[140px] justify-center active:scale-95"
            >
              {uploading ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>{uploadProgress} / {files.length}</span>
                </span>
              ) : (
                `Upload ${files.length} File${files.length > 1 ? 's' : ''}`
              )}
            </button>
          )}
        </div>

        {/* Skipped Students Popup */}
        {skippedPopup && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-50 dark:bg-yellow-900/90 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-4 shadow-xl flex items-start space-x-3 animate-in slide-in-from-top-4 fade-in z-50 max-w-sm w-[90%]">
            <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-bold text-yellow-900 dark:text-yellow-100">Skipped {skippedPopup.count} existing student(s)</h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 truncate">
                {skippedPopup.names.join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

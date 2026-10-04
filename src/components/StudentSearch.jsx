import { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight } from 'lucide-react';

export default function StudentSearch({ onSelectStudent }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    if (query.length < 2) return;

    let ignore = false;
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/students?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          if (!ignore) {
            setResults(data.students || []);
            setLoading(false);
          }
        })
        .catch(() => {
          if (!ignore) setLoading(false);
        });
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8 z-40" ref={wrapperRef}>
      <div className="relative group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 rounded-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 transition-colors ${isFocused ? 'text-blue-500' : 'text-sand-500 dark:text-storm-500'}`} />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-12 py-4 bg-sand-50/90 dark:bg-storm-900/90 backdrop-blur-md border border-sand-300 dark:border-storm-700 rounded-2xl shadow-sm focus:ring-4 focus:ring-sand-600/30 dark:focus:ring-storm-500/50 focus:border-sand-600 transition-all duration-300 text-sand-900 dark:text-storm-100 placeholder-slate-400 dark:placeholder-storm-500 font-medium text-lg outline-none"
          placeholder="Search for a student by Name or ID..."
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            if (val.length < 2) {
              setResults([]);
            }
          }}
          onFocus={() => setIsFocused(true)}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <div className="animate-spin h-5 w-5 border-2 border-sand-600 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {isFocused && query.length >= 2 && (
        <div className="absolute mt-3 w-full bg-sand-50/95 dark:bg-storm-900/95 backdrop-blur-xl border border-sand-300 dark:border-storm-800 rounded-2xl shadow-2xl max-h-96 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2">
          {results.length > 0 ? (
            <ul className="divide-y divide-slate-100 dark:divide-storm-800">
              {results.map((student) => (
                <li 
                  key={student.id} 
                  className="p-4 hover:bg-sand-200 dark:hover:bg-storm-800 cursor-pointer flex items-center justify-between transition-colors group"
                  onClick={() => {
                    onSelectStudent(student.id);
                    setQuery('');
                    setResults([]);
                    setIsFocused(false);
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold text-sand-900 dark:text-storm-200 group-hover:text-sand-700 dark:group-hover:text-blue-400 transition-colors">{student.name}</p>
                    <p className="text-xs text-sand-600 dark:text-storm-400 mt-0.5 font-medium">ID: {student.id}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all transform group-hover:translate-x-1" />
                </li>
              ))}
            </ul>
          ) : (
            !loading && (
              <div className="p-8 text-center text-sand-600 dark:text-storm-400 text-sm font-medium">
                No students found matching &quot;{query}&quot;
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Play, Loader2, Plus, File } from 'lucide-react';

interface ControlPanelProps {
  userContext: string;
  setUserContext: (val: string) => void;
  runAgent: () => void;
  loading: boolean;
  addNode: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void; // 🔵 Added this
}

export default function ControlPanel({ 
  userContext, 
  setUserContext, 
  runAgent, 
  loading, 
  addNode, 
  onFileUpload 
}: ControlPanelProps) {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl">
      
      {/*SOURCE MATERIAL SECTION */}
      <div className="flex items-center gap-3 pl-4 pr-2 py-1 bg-white/5 rounded-xl border border-white/5 focus-within:border-blue-500/50 transition-all group">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-blue-400/60 uppercase tracking-tighter">Source Context</span>
          <input 
            type="text"
            value={userContext}
            onChange={(e) => setUserContext(e.target.value)}
            className="bg-transparent border-none text-white/90 text-sm placeholder-white/20 focus:ring-0 w-64 outline-none pb-1"
            placeholder="Type context or upload a file..."
          />
        </div>

        {/* Hidden File Input Triggered by Icon */}
        <label className="cursor-pointer p-2 hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-white/10">
          <File size={18} className="text-blue-400/70" />
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf,.docx,.txt" 
            onChange={onFileUpload} 
          />
        </label>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-1">
        <button 
          onClick={addNode} 
          title="Add AI Node"
          className="p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <Plus size={18} />
        </button>

        <button 
          onClick={runAgent} 
          disabled={loading} 
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_25px_rgba(59,130,246,0.3)]"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
          <span>{loading ? "Analyzing..." : "Deploy Agent"}</span>
        </button>
      </div>
    </div>
  );
}
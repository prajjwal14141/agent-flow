import React from 'react';
import { Play, Loader2, Plus, FileText } from 'lucide-react';

interface ControlPanelProps {
  userContext: string;
  setUserContext: (val: string) => void;
  runAgent: () => void;
  loading: boolean;
  addNode: () => void;
}

export default function ControlPanel({ userContext, setUserContext, runAgent, loading, addNode }: ControlPanelProps) {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
      
      {/* Input Field - Minimalist */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5 focus-within:border-purple-500/50 transition-all">
        <input 
          type="text"
          value={userContext}
          onChange={(e) => setUserContext(e.target.value)}
          className="bg-transparent border-none text-white/90 text-sm placeholder-white/20 focus:ring-0 w-64 outline-none"
          placeholder="Enter context..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 pr-1">
        <button onClick={addNode} className="p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all">
          <Plus size={18} />
        </button>

        <button 
          onClick={runAgent} 
          disabled={loading} 
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 text-white rounded-xl font-semibold text-sm transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
          <span>{loading ? "Processing" : "Deploy Agent"}</span>
        </button>
      </div>
    </div>
  );
}
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Sparkles, Trash2 } from 'lucide-react'; 

function PromptNode({ id, data, isConnectable }: any) { 
  return (
    <div className="bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl min-w-[320px] overflow-hidden backdrop-blur-xl transition-all hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
      
      {/* Sleek, minimal header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-[10px] font-medium tracking-widest text-white/70 uppercase">AI Agent</span>
        </div>
        
        {/* 🔴 UPDATED DELETE BUTTON */}
        <button 
            onClick={(e) => {
                e.stopPropagation(); // <--- THIS IS THE MAGIC FIX
                if (data.onDelete) data.onDelete(id);
            }}
            className="text-white/30 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-md transition-all nodrag"
            title="Delete Node"
        >
            <Trash2 size={14} />
        </button>
      </div>

      {/* Body Area */}
      <div className="p-4">
        <textarea 
          className="w-full h-24 bg-transparent border border-white/10 rounded-xl p-3 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 resize-none transition-all nodrag"
          placeholder="Type instruction here..."
          defaultValue={data.prompt} 
          onChange={(evt) => data.onChange && data.onChange(evt.target.value)} 
        />
      </div>

      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-purple-500 border-none" />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-purple-500 border-none" />
    </div>
  );
}

export default memo(PromptNode);
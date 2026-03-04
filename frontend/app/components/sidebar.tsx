import React from 'react';
import { FileText, Globe, Mail, Terminal, GripVertical } from 'lucide-react';

export default function Sidebar() {
  
  // This function tells the browser "I am dragging this specific tool"
  const onDragStart = (event: React.DragEvent, nodeType: string, defaultPrompt: string) => {
    event.dataTransfer.setData('application/reactflow/type', 'aiNode');
    event.dataTransfer.setData('application/reactflow/prompt', defaultPrompt);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 h-full bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-4 shadow-xl z-20">
      
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        Available Agents
      </div>

      {/* TOOL 1: SUMMARIZER */}
      <div 
        className="bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-grab hover:border-indigo-500 hover:bg-slate-750 transition-all flex items-center gap-3"
        draggable
        onDragStart={(e) => onDragStart(e, 'aiNode', 'Summarize this text concisely.')}
      >
        <FileText size={20} className="text-blue-400" />
        <div className="text-sm font-medium text-slate-200">Summarizer</div>
        <GripVertical size={16} className="text-slate-600 ml-auto" />
      </div>

      {/* TOOL 2: TRANSLATOR */}
      <div 
        className="bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-grab hover:border-indigo-500 hover:bg-slate-750 transition-all flex items-center gap-3"
        draggable
        onDragStart={(e) => onDragStart(e, 'aiNode', 'Translate this text to Spanish.')}
      >
        <Globe size={20} className="text-green-400" />
        <div className="text-sm font-medium text-slate-200">Translator</div>
        <GripVertical size={16} className="text-slate-600 ml-auto" />
      </div>

      {/* TOOL 3: EMAIL WRITER */}
      <div 
        className="bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-grab hover:border-indigo-500 hover:bg-slate-750 transition-all flex items-center gap-3"
        draggable
        onDragStart={(e) => onDragStart(e, 'aiNode', 'Write a professional cold email about this topic.')}
      >
        <Mail size={20} className="text-purple-400" />
        <div className="text-sm font-medium text-slate-200">Email Writer</div>
        <GripVertical size={16} className="text-slate-600 ml-auto" />
      </div>

      {/* TOOL 4: PYTHON CODER */}
      <div 
        className="bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-grab hover:border-indigo-500 hover:bg-slate-750 transition-all flex items-center gap-3"
        draggable
        onDragStart={(e) => onDragStart(e, 'aiNode', 'Fix the bugs in this Python code.')}
      >
        <Terminal size={20} className="text-orange-400" />
        <div className="text-sm font-medium text-slate-200">Py Debugger</div>
        <GripVertical size={16} className="text-slate-600 ml-auto" />
      </div>

      <div className="mt-auto p-3 bg-indigo-900/20 border border-indigo-500/30 rounded text-xs text-indigo-300">
        💡 Drag these blocks onto the canvas to build your pipeline.
      </div>
    </div>
  );
}
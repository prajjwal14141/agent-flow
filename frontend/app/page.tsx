"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  addEdge, 
  applyEdgeChanges, 
  applyNodeChanges, 
  Connection, 
  Edge, 
  NodeChange, 
  EdgeChange,
  Node,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

import PromptNode from './nodes/promptnode';
import ControlPanel from './components/ControlPanel';
import Sidebar from './components/sidebar'; 

const nodeTypes = { aiNode: PromptNode };

const initialNodes: Node[] = [
  { 
    id: '1', 
    type: 'input', 
    data: { label: '✨ Source Data' }, 
    position: { x: 400, y: 50 }, 
    style: { 
      background: 'rgba(9, 9, 11, 0.8)', 
      color: '#e4e4e7',      
      border: '1px solid rgba(255, 255, 255, 0.1)', 
      borderRadius: '24px',  
      padding: '12px 24px', 
      width: 'auto',
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '0.5px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.5)'
    } 
  },
  { 
    id: '3', 
    type: 'output', 
    data: { label: '' }, // Start empty to hide the overlay initially
    position: { x: 400, y: 450 }, 
    style: { 
      background: 'rgba(9, 9, 11, 0.8)', 
      color: '#a855f7',      
      border: '1px solid rgba(168, 85, 247, 0.3)', 
      borderRadius: '24px', 
      padding: '12px 24px', 
      width: 'auto',
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '0.5px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 0 20px rgba(168, 85, 247, 0.15)',
      whiteSpace: 'pre-wrap', 
      textAlign: 'left'
    } 
  },
];

const initialEdges: Edge[] = [];

export default function Home() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userContext, setUserContext] = useState("SpaceX plans to launch 50 rockets this year.");
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);

  const onPromptChange = useCallback((nodeId: string, newPrompt: string) => {
    setNodes((nds) => nds.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, prompt: newPrompt } } : node));
  }, []);

  // Inside your Home component
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  setLoading(true);
  try {
    const response = await fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: formData, // Send the actual file to the backend
    });
    const data = await response.json();
    if (data.success) {
      setUserContext(data.text); // Put the extracted text into the system
    }
  } catch (error) {
    console.error("Upload failed", error);
  } finally {
    setLoading(false);
  }
};

  const onDeleteNode = useCallback((idToDelete: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== idToDelete));
    setEdges((eds) => eds.filter((edge) => edge.source !== idToDelete && edge.target !== idToDelete));
  }, []);

  useEffect(() => {
    setNodes((nds) => nds.map((node) => {
      if (node.type === 'aiNode') 
        return { ...node, data: { ...node.data, onChange: (val: string) => onPromptChange(node.id, val), onDelete: (id: string) => onDeleteNode(id) } };
      return node;
    }));
  }, [onPromptChange, onDeleteNode]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow/type');
      const prompt = event.dataTransfer.getData('application/reactflow/prompt');
      if (typeof type === 'undefined' || !type || !reactFlowInstance) return;
      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newNodeId = `node_${Date.now()}`;
      const newNode: Node = {
        id: newNodeId,
        type,
        position,
        data: { 
            prompt: prompt, 
            onChange: (val: string) => onPromptChange(newNodeId, val),
            onDelete: (id: string) => onDeleteNode(id)
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, onPromptChange, onDeleteNode]
  );

  
  const addNode = () => {
    const newId = `node_${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: 'aiNode',
      data: { 
          prompt: 'New Step...', 
          onChange: (val: string) => onPromptChange(newId, val),
          onDelete: (id: string) => onDeleteNode(id)
      },
      position: { x: 250, y: (nodes.length) * 150 }, 
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const runAgent = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/run-dynamic-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, initialInput: userContext }),
      });
      const data = await response.json();
      if (data.success) {
        setNodes((nds) => nds.map((node) => node.type === 'output' ? { ...node, data: { ...node.data, label: data.finalOutput } } : node));
      }
    } catch (error) {
      alert("Backend Error. Is server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#050505] flex overflow-hidden relative text-white">
      
      {/* TOGGLE BUTTON */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-[100] p-2 bg-[#09090b] border border-white/10 rounded-full hover:bg-white/5 transition-all shadow-xl"
      >
        {isSidebarOpen ? "⇠" : "⇢"} 
      </button>

      {/* SLIDING SIDEBAR */}
      <div className={`transition-all duration-300 ease-in-out h-full border-r border-white/5 bg-[#050505] z-50 ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        <div className="w-64">
          <Sidebar />
        </div>
      </div>

      {/* CANVAS AREA */}
      <div className="flex-1 h-full relative overflow-hidden" ref={reactFlowWrapper}>
        
        {/* Ambient AI Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

        {/* Floating Control Panel */}
        <ControlPanel 
          userContext={userContext} 
          setUserContext={setUserContext} 
          runAgent={runAgent} 
          loading={loading}
          addNode={addNode} 
          onFileUpload={handleFileUpload}
        />
        
        {/* RESULT OVERLAY (Appears when output is generated) */}
        {nodes.find(n => n.type === 'output')?.data.label && (
          <div className="absolute bottom-10 right-10 z-[60] w-[450px] max-h-[70vh] bg-[#09090b]/90 border border-purple-500/30 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Final Generation</h3>
              <button 
                onClick={() => navigator.clipboard.writeText(nodes.find(n => n.type === 'output')?.data.label)}
                className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-[10px] font-bold rounded-full transition-all active:scale-95"
              >
                COPY PACKET
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar select-text cursor-auto text-sm leading-relaxed text-white/90">
              <div className="whitespace-pre-wrap">
                {nodes.find(n => n.type === 'output')?.data.label}
              </div>
            </div>
          </div>
        )}

        <ReactFlowProvider>
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            nodeTypes={nodeTypes} 
            onNodesChange={onNodesChange} 
            onEdgesChange={onEdgesChange} 
            onConnect={onConnect} 
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Lines} color="#ffffff" gap={40} lineWidth={1} style={{ opacity: 0.03 }} />
            <Controls className="bg-[#09090b] border border-white/10 fill-white/50 rounded-lg shadow-2xl" />
            <MiniMap 
              className="bg-[#09090b] border border-white/10 rounded-xl shadow-2xl" 
              nodeColor={(node) => {
                if (node.type === 'input') return '#22c55e';
                if (node.type === 'output') return '#a855f7';
                return '#6366f1';
              }} 
              maskColor="rgba(5, 5, 5, 0.8)" 
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
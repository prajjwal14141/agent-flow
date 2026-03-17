# 🤖 AgentFlow
AgentFlow is a professional-grade, full-stack AI orchestration platform that allows users to build, visualize, and deploy complex multi-agent workflows. By combining a sleek React Flow canvas with a powerful LangGraph backend, AgentFlow enables true parallel processing (Map-Reduce) for AI tasks.

## ✨ Key Features  
1-Visual Pipeline Builder: Drag-and-drop interface to create intricate AI logic maps using custom nodes.  
2-Parallel Execution (Map-Reduce): Branch your logic into multiple parallel AI agents that process data simultaneously before merging results.  
3-Ultra-Fast Inference: Powered by Groq LPU technology, utilizing Llama 3.1 models for near-instantaneous execution.  
4-Smart State Management: Uses LangGraph to manage complex conversation states and prevent data collisions in branched workflows.  
5-Multilingual Support: Highly capable of handling complex cross-language tasks, including English-to-Hindi translations.  
6-Developer-First UI: Features a collapsible sidebar, ambient "Azure" canvas theme, and a selectable result overlay for easy content copying.  

## 🛠️ Tech Stack
- Frontend: Next.js 14, TypeScript, Tailwind CSS, React Flow.
- Backend: Node.js, Express, LangChain, LangGraph.
- AI Infrastructure: Groq Cloud API (Llama 3.1 8B/70B).

## 🚀 Getting Started

### 1. Prerequisites
Node.js (v18+)
Groq API Key 

### 2. Installation
##### Clone the repository
git clone https://github.com/your-username/agentflow.git

##### Install Backend dependencies
cd agent/
npm install

##### Install Frontend dependencies
cd ../frontend/
npm install

### 3.Environment Setup
Create a .env file in the agent/ directory:
Code snippet: GROQ_API_KEY=your_api_key
              PORT=3001

### 4. Run the App
##### Start Backend (from /agent)
node server.js
##### Start Frontend (from /frontend)
npm run dev


# Architecture Note
The backend utilizes a Custom Reducer logic. This allows the graph to receive multiple parallel updates to the "data" channel and combine them into a single array, preventing the INVALID_CONCURRENT_GRAPH_UPDATE error typical in complex LangGraph implementations.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ChatGroq } = require("@langchain/groq");
const { StateGraph, END, START } = require("@langchain/langgraph");

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. SETUP THE BRAIN ---
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
});

// --- 2. DEFINE THE COMPILER ---
app.post("/run-dynamic-agent", async (req, res) => {
  const { nodes, edges, initialInput } = req.body;

  try {
    console.log("--------------------------------");
    console.log(`🚀 Received Workflow with ${nodes.length} nodes`);

   // A. Initialize the Graph State with a REDUCER
    const workflow = new StateGraph({
      channels: {
        data: {
          // The reducer tells LangGraph how to combine parallel outputs
          value: (currentState, newUpdate) => {
            return currentState.concat(newUpdate);
          },
          default: () => [], // Start with an empty array
        }
      }
    });
    // B. Create the Node Functions dynamically
    nodes.forEach((node) => {
      const nodeId = node.id;
      const nodeType = node.type;
      
      // LOGIC: Check what kind of node this is
      if (nodeType === 'aiNode') {
        const userPrompt = node.data.prompt; 
        
        workflow.addNode(nodeId, async (state) => {
            console.log(`🤖 Executing Node ${nodeId}...`);
            
            // 🔴 Join all previous branch answers into a single string
            const inputData = state.data.join("\n---\n"); 
            
            const msg = `
              SYSTEM INSTRUCTION: ${userPrompt}
              
              INPUT DATA TO PROCESS:
              "${inputData}"
            `;

            const result = await model.invoke(msg);
            
            // 🔴 Return as an array so the reducer can append it
            return { data: [result.content] }; 
        });

      } else if (nodeType === 'input') {
        workflow.addNode(nodeId, async () => {
          console.log("▶️ START: Injecting User Input");
          return { data: [initialInput] }; // 🔴 Wrap in brackets!
        });

      } else {
        // --- TYPE 3: PASSTHROUGH (Output Node) ---
        workflow.addNode(nodeId, async (state) => {
           return { data: state.data };
        });
      }
    });

    // C. Connect the Edges
    edges.forEach((edge) => {
      workflow.addEdge(edge.source, edge.target);
    });

   // D. Connect Start & End
    workflow.addEdge(START, "1");

    // SAFETY CHECK 1: Did they draw any lines at all?
    if (!edges || edges.length === 0) {
      throw new Error("No connections found! Please draw lines between your nodes.");
    }

    // SAFETY CHECK 2: Find the actual Output node safely
    const outputNode = nodes.find(n => n.type === 'output');
    if (!outputNode) {
      throw new Error("Final Output node is missing from the canvas.");
    }

    // Check if the output node is actually connected to the flow
    const isOutputConnected = edges.some(e => e.target === outputNode.id);
    if (!isOutputConnected) {
      throw new Error("Your Final Output node is not connected to anything!");
    }

    // Safely connect the output node to the graph's END
    workflow.addEdge(outputNode.id, END);

    // E. Compile & Run
    const app = workflow.compile();
    const result = await app.invoke({ data: null }); // Start with empty state

    console.log("✅ Workflow Finished!");
    res.json({ success: true, finalOutput: result.data[result.data.length - 1] });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
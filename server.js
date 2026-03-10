require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ChatGroq } = require("@langchain/groq");
const { StateGraph, END, START } = require("@langchain/langgraph");
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse-fork');
const mammoth = require('mammoth');
const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(cors({
  origin: ["https://your-project-name.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true
}));
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
            
            const inputData = state.data.join("\n---\n"); 
            
            const msg = `
              SYSTEM INSTRUCTION: ${userPrompt}
              
              INPUT DATA TO PROCESS:
              "${inputData}"
            `;

            const result = await model.invoke(msg);
            
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
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    let extractedText = "";

   // 1. Handle PDF
    if (fileExtension === 'pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      
      // The fork works perfectly as a normal function
      const data = await pdf(dataBuffer); 
      extractedText = data.text;
    }
    // 2. Handle DOCX
    else if (fileExtension === 'docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } 
    // 3. Handle TXT
    else if (fileExtension === 'txt') {
      extractedText = fs.readFileSync(filePath, 'utf8');
    }

    // 🔥 CLEANUP: Delete the file from /uploads after parsing
    fs.unlinkSync(filePath);

    res.json({ success: true, text: extractedText });
  } catch (error) {
    console.error("Parsing Error:", error);
    res.status(500).json({ success: false, error: "Failed to parse file" });
  }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
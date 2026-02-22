import express from "express";
import { createServer as createViteServer } from "vite";
import "dotenv/config";
import { getProjects, createProject, deleteProject, getSessions, upsertSession, deleteSession, getCustomModels, upsertCustomModel } from "./server/db";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // API Route for Chat Completions
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      env: {
        hasMistralKey: !!process.env.MISTRAL_API_KEY,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        nodeVersion: process.version
      }
    });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, model, session_id: sessionId } = req.body;
      
      console.log(`Chat request received for model: ${model}, session: ${sessionId}`);

      // REAL credentials (hidden from UI)
      const REAL_API_KEY = process.env.MISTRAL_API_KEY;
      const REAL_BASE_URL = process.env.MISTRAL_ENDPOINT || "https://api.mistral.ai/v1/chat/completions";
      
      if (!REAL_API_KEY) {
        console.error("MISTRAL_API_KEY is missing in environment variables");
        return res.status(500).json({ error: "Mistral API Key not configured on server." });
      } else {
        console.log(`MISTRAL_API_KEY loaded: ${REAL_API_KEY.substring(0, 4)}...${REAL_API_KEY.substring(REAL_API_KEY.length - 4)}`);
      }

      if (process.env.SUPABASE_URL) {
        console.log(`SUPABASE_URL loaded: ${process.env.SUPABASE_URL.substring(0, 10)}...`);
      } else {
        console.warn("SUPABASE_URL is missing");
      }

      // Model Mapping
      let modelName = model || "fm-main-v1.0.1";
      if (modelName === "fm-main-v1.0.1") {
        modelName = "mistral-large-latest";
      } else if (modelName === "fm-screw-v1.0.0") {
        modelName = "open-mistral-7b";
      }

      let fetchUrl = REAL_BASE_URL;
      if (!fetchUrl.endsWith('/chat/completions')) {
        fetchUrl = fetchUrl.replace(/\/$/, '') + '/chat/completions';
      }

      console.log(`Forwarding request to: ${fetchUrl} with model: ${modelName}`);

      let projects: any[] = [];
      try {
        projects = await getProjects(sessionId);
      } catch (dbError) {
        console.error("Database error during chat context fetch:", dbError);
      }
      
      const projectContext = projects.length > 0 
        ? `\n\nCURRENT PROJECT FILES:\n${projects.map((p: any) => `--- FILE: ${p.name} ---\n${p.content}\n--- END ${p.name} ---`).join('\n\n')}`
        : "";

      const updatedMessages = messages.map((m: any) => {
        if (m.role === 'system') {
          const aiIntegrationInfo = `
AI INTEGRATION DETAILS:
If you want to add AI features to the project you are building, use these details:
- API Key: sk-forevermore-key
- Endpoint: /api/chat
- Model: fm-main-v1.0.1

IMPORTANT: 
1. Use the relative path "/api/chat" as the endpoint.
2. ALWAYS refer to the AI as "ForeverMore.Ai" or "FM". 
3. NEVER mention "Mistral" or the real API key.
4. DO NOT generate .env files with these credentials.
`;
          return { ...m, content: m.content + projectContext + aiIntegrationInfo };
        }
        return m;
      });

      const response = await axios.post(fetchUrl, {
        model: modelName,
        messages: updatedMessages,
        stream: false,
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${REAL_API_KEY}`,
        },
        timeout: 60000 // 60 seconds timeout
      });

      res.json(response.data);

    } catch (error: any) {
      console.error("Chat API Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ 
        error: "AI Service Error", 
        details: error.response?.data || error.message 
      });
    }
  });

  // Database Endpoints
  // IMPORTANT: These must be defined BEFORE the Vite middleware
  app.get("/api/projects", async (req, res) => {
    try {
      const sessionId = req.query.session_id as string;
      const projects = await getProjects(sessionId);
      res.json(projects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/execute", async (req, res) => {
    try {
      const { command } = req.body;
      if (!command) {
        return res.status(400).json({ error: "No command provided" });
      }

      console.log(`Executing real command: ${command}`);
      
      // Execute the command for real
      const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
      
      res.json({ 
        output: stdout || stderr || "Command executed with no output.",
        error: stderr && !stdout ? stderr : null
      });

    } catch (error: any) {
      console.error("Execution failed:", error);
      res.status(500).json({ 
        error: "Execution failed", 
        details: error.message,
        output: error.stdout,
        stderr: error.stderr
      });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const { session_id, name, content, language } = req.body;
      if (!session_id || !name || !content || !language) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const project = await createProject(session_id, name, content, language);
      res.json(project);
    } catch (error: any) {
      console.error("Failed to create project:", error);
      res.status(500).json({ error: "Failed to create project", details: error.message });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await deleteProject(Number(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await getSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      await upsertSession(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to upsert session" });
    }
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      await deleteSession(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  // Custom Models
  app.get("/api/custom-models", async (req, res) => {
    try {
      const models = await getCustomModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch custom models" });
    }
  });

  app.post("/api/custom-models", async (req, res) => {
    try {
      await upsertCustomModel(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to upsert custom model" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving would go here
    // app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import express from "express";
import rateLimit from "express-rate-limit";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const firebaseConfig = require("./firebase-applet-config.json");

// Initialize admin app
initializeApp();

// Helper to get correct firestore
const getDb = () => getFirestore(firebaseConfig.firestoreDatabaseId);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const smartTasksLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // Limit each IP to 1 request per minute
  message: { error: "Please wait 1 minute before submitting another smart task request." },
  standardHeaders: true,
  legacyHeaders: false,
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.set("trust proxy", 1);
  app.use(express.json());
  
  // Apply the rate limiting middleware to API calls only
  app.use("/api/", apiLimiter);

  const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
      }
      const token = authHeader.split('Bearer ')[1];
      const decoded = await getAuth().verifyIdToken(token);
      if (!decoded.admin) {
      const authorizedEmail = process.env.AUTHORIZED_EMAIL;

      if (!authorizedEmail) {
        console.error("AUTHORIZED_EMAIL environment variable is not set.");
        return res.status(500).json({ error: "Server configuration error" });
      }

      if (decoded.email !== authorizedEmail) {
        return res.status(403).json({ error: "Unauthorized: Invalid user" });
      }
      (req as any).user = decoded;
      next();
    } catch (e: any) {
      return res.status(401).json({ error: "Unauthorized: Token verification failed", details: e.message });
    }
  };

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Removed backend data proxy to comply with AI Studio sandbox rules. Data operations must be local to client via Firebase web SDK.

  app.post("/api/smart-tasks", smartTasksLimiter, authMiddleware, async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });
      if (typeof text !== 'string' || text.length > 500) {
        return res.status(400).json({ error: "Text exceeds maximum allowed length" });
      }

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: text,
          config: {
            systemInstruction: "Analyze this raw task input and return a structured list of actionable subtasks (or a single task). Assign urgencies and estimate a deadline from now if implied. IMPORTANT: Preserve the original language of the input (e.g., if Italian, output title and description in Italian).",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Actionable clear task title" },
                  description: { type: Type.STRING, description: "Detailed description or breakdown" },
                  categoryName: { type: Type.STRING, description: "Suggested general category name (e.g. Work, Home, Errands)" },
                  urgency: { type: Type.STRING, description: "One of: low, medium, high, critical" },
                  suggestedDeadlineDaysAt: { type: Type.NUMBER, description: "Suggested deadline in days count from today, if implied" }
                },
                required: ["title", "description", "categoryName", "urgency"]
              }
            }
          }
        });
      } catch (err: any) {
        if (err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("Quota")) {
          console.warn("Falling back to gemini-1.5-flash due to rate limits.");
          response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: text,
            config: {
              systemInstruction: "Analyze this raw task input and return a structured list of actionable subtasks (or a single task). Assign urgencies and estimate a deadline from now if implied. IMPORTANT: Preserve the original language of the input (e.g., if Italian, output title and description in Italian).",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Actionable clear task title" },
                    description: { type: Type.STRING, description: "Detailed description or breakdown" },
                    categoryName: { type: Type.STRING, description: "Suggested general category name (e.g. Work, Home, Errands)" },
                    urgency: { type: Type.STRING, description: "One of: low, medium, high, critical" },
                    suggestedDeadlineDaysAt: { type: Type.NUMBER, description: "Suggested deadline in days count from today, if implied" }
                  },
                  required: ["title", "description", "categoryName", "urgency"]
                }
              }
            }
          });
        } else {
          throw err;
        }
      }
      
      const textOutput = response.text || "[]";
      const jsonStr = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
      res.json(JSON.parse(jsonStr));
    } catch (e: any) {
      console.error("Error processing text:", e.message || e);
      res.status(500).json({ error: "An internal server error occurred while processing your request." });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

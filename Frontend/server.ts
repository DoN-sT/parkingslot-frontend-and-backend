import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import axios from "axios";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

app.use(cors());
app.use(express.json());

// Proxy all requests starting with /api to the real backend
app.use("/api", async (req: Request, res: Response) => {
  const targetUrl = `${BACKEND_URL}/api${req.path}`;
  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        ...req.headers,
        host: undefined,
        origin: undefined,
      },
      params: req.query,
      validateStatus: () => true, // Forward all status codes
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error(`Proxy error for ${req.method} ${req.path}:`, error.message);
    res.status(500).json({ success: false, message: "Proxy connection error to backend service." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ParkingSpot App Running on http://localhost:${PORT}`);
    console.log(`Proxying all /api calls to ${BACKEND_URL}`);
  });
}

startServer();

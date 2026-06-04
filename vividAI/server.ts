import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { apiRouter } from "./src/apiRouter";

dotenv.config();

// Port and host configurations
const PORT = 3000;
const HOST = "0.0.0.0";

async function startServer() {
    const app = express();
    app.use(express.json());

    // Mount API router
    app.use("/api", apiRouter);

    // Vite and production routing
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

    app.listen(PORT, HOST, () => {
        console.log(`Express server listening on http://${HOST}:${PORT}`);
    });
}

startServer().catch((err) => {
    console.error("Critical server exit:", err);
});

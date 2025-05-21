import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { specs } from "./config/swagger";
import authRoute from "./routes/auth";
import complaintRoute from "./routes/complaintRoute";
import categoryRoute from "./routes/categoryRoute";
import helpCenterRoute from "./routes/helpCenter";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/auth', authRoute);
app.use('/api/complaints', complaintRoute);
app.use('/api/category', categoryRoute);
app.use('/api/help', helpCenterRoute);

// Example route
app.get("/", (req, res) => {
  res.send("Hello, Civic Connect!");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-connect')
  .then(() => {
    console.log("Connected to MongoDB");
    
    const PORT = process.env.PORT || 3000;
    const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

    // Create HTTP server
    const httpServer = http.createServer(app);
    httpServer.listen(PORT, () => {
      console.log(`HTTP server is running on http://localhost:${PORT}`);
      console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });

    // Try to create HTTPS server if certificates exist
    try {
      const sslOptions = {
        key: fs.readFileSync(path.join(__dirname, '../ssl/private.key')),
        cert: fs.readFileSync(path.join(__dirname, '../ssl/certificate.crt'))
      };

      const httpsServer = https.createServer(sslOptions, app);
      httpsServer.listen(HTTPS_PORT, () => {
        console.log(`HTTPS server is running on https://localhost:${HTTPS_PORT}`);
        console.log(`Swagger documentation available at https://localhost:${HTTPS_PORT}/api-docs`);
      });
    } catch (error) {
      console.warn('SSL certificates not found. HTTPS server not started.');
      console.warn('To enable HTTPS, generate SSL certificates in the ssl directory.');
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
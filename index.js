import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bhuvanRoutes from './src/routes/api.routes.js';
import connectToDB from './src/utils/dbConnect.js';
import { register } from "./src/utils/metrics.js";
import scrapeMetrics from './src/middlewares/metrics.middleware.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(scrapeMetrics);

const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});

(async () => {
  await connectToDB(); 
  app.use('/api/bhuvan', bhuvanRoutes);

  app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
  });
})();

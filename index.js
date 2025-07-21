import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bhuvanRoutes from './src/routes/api.routes.js';
import connectToDB from './src/utils/dbConnect.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/api/health", (req, res) => {
  res.status(200).send("OK");
});

(async () => {
  await connectToDB(); 
  app.use('/api/bhuvan', bhuvanRoutes);

  app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
  });
})();

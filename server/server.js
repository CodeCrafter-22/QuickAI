import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, clerkClient } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';
//import { clerkClient } from "@clerk/express";

const app = express();

await connectCloudinary();

// ✅ FIXED CORS
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ add this
app.use(clerkMiddleware());

app.get('/', (req, res) => { res.send('Server is Live!!'); });

app.use('/api/ai', aiRouter);
app.use('/api/user', userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});

app.get("/make-premium", async (req, res) => {
  const { userId } = req.auth();

  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      plan: "premium",
    },
  });

  res.send("User is now premium!");
});
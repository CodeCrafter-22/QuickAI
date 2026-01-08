import express from "express";
import { requireAuth } from "@clerk/express";
import { getPublishedCreations, getUserCreations, toggleLikeCreations } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.use(requireAuth());

userRouter.get('/get-user-creations', getUserCreations)
userRouter.get('/get-published-creations', getPublishedCreations)
userRouter.post('/toggle-like-creations', toggleLikeCreations)

export default userRouter;

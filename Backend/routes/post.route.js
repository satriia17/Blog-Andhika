import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { createPost, getPost } from "../controllers/post.control.js";

const router = express.Router();

router.post("/create", verifyToken, createPost);
router.get("/getPost", getPost)

export default router
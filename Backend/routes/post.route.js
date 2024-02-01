import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createPost,
  getPost,
  deletePost,
  updatePost,
} from "../controllers/post.control.js";

const router = express.Router();

router.post("/create", verifyToken, createPost);
router.get("/getPost", getPost);
router.delete("/deletepost/:postId/:userId", verifyToken, deletePost);
router.put("/updatepost/:postId/:userId", verifyToken, updatePost);

export default router;

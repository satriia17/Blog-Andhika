import express from "express";
import { test, updateUser, deleteUser } from "../controllers/user.control.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", test);
router.put("/update/:userId", verifyToken, updateUser); //verifyToken merupakan fungsi yang digunakan untuk cek apakah user valid atau tidak sebelum dapat meng-update user
router.delete("/delete/:userId", verifyToken, deleteUser);

export default router;

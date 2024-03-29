import express from "express";
import { test, updateUser, deleteUser, signOut, getUsers } from "../controllers/user.control.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", test);
router.put("/update/:userId", verifyToken, updateUser); //verifyToken merupakan fungsi yang digunakan untuk cek apakah user valid atau tidak sebelum dapat meng-update user
router.delete("/delete/:userId", verifyToken, deleteUser);
router.post('/signout', signOut);
router.get("/getusers", verifyToken, getUsers);

export default router;

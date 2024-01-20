import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/errorhandle.js";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    next(errorHandler(400, "Please provide username, email, and password"));
  } // Untuk cek kondisi username, email, password harus di isi dan tidak kosong.
  const hashedPassword = bcryptjs.hashSync(password, 10); //Untuk buat password jadi hashed
  const newUser = new User({
    username,
    email,
    password: hashedPassword, //fungsi hash dipanggil
  });

  try {
    await newUser.save();
    res.json("User created successfully");
  } catch (err) {
    next(err);
  }
};

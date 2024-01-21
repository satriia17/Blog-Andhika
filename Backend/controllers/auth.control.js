import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/errorhandle.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    next(errorHandler(400, "Please provide email and password"));
  }
  try{
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "User Not Found"));
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(404, "User Not Found"));
    }
    const token = jwt.sign(
      { id: validUser._id }, process.env.JWT_SECRET);
    const { password: hash, ...others } = validUser._doc;
    res.status(200).cookie('access_token', token, {httpOnly: true}).json(others); 
  }catch{
    next(errorHandler(500, "Internal server error"));
  }

}

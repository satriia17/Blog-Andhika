import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/errorhandle.js";
import jwt from "jsonwebtoken";

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
    next(errorHandler(400, "Please provide email and password")); //cek apakah email dan password sudah terisi
  }
  try {
    const validUser = await User.findOne({ email }); //menunggu untuk validasi email
    if (!validUser) {
      return next(errorHandler(404, "Invalid Password")); //jika email tidak ditemukan maka error
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password); //jika email ditemukan maka validasi password yang sudah di hash menggunakan bycrypt
    if (!validPassword) {
      return next(errorHandler(404, "Invalid Password")); //jika password tidak sesuai maka error
    }
    const token = jwt.sign({ id: validUser._id, isAdmin: validUser.isAdmin }, process.env.JWT_SECRET); //menggunakan Json Web Token untuk membuat token
    const { password: hash, ...others } = validUser._doc; //menghilangkan data password pada user
    res
      .status(200)
      .cookie("access_token", token, { httpOnly: true })
      .json(others); //Memberikan token kedalam cookie supaya user tidak perlu login kembali
  } catch {
    next(errorHandler(500, "Internal server error"));
  }
};

export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body; //Request body yang diterima
  try {
    const user = await User.findOne({ email }); //cek apakah email ada di database
    if (user) { //Jika email ada di database maka akan dijalankan fungsi di bawah dengan memberikan akses token dan juga cookie
      const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
      const { password, ...others } = user._doc;
      res
        .status(200)
        .cookie("access_token", token, { httpOnly: true })
        .json(others);
    } else { //Apabila google yang di daftarkan tidak ada di database maka akan menjalankan fungsi dibawah
      const generatedPassword = Math.random().toString(36).slice(-8); //Memberikan password random dengan huruf dan angka
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10); //Memberikan hash pada password random yang sudah di generate
      const newUser = new User({ //Fungsi untuk menyimpan user baru
        username:
          name.toLowerCase().split(" ").join("") + //mengubah username dari email yg di daftarkan menjadi hurufkecil dan diberikan angka random
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        ProfilePic: googlePhotoUrl, //memberikan profile picture dari google atau default pada model
      });
      await newUser.save(); //menyimpan data user baru
      const token = jwt.sign({ id: newUser._id, isAdmin: newUser.isAdmin }, process.env.JWT_SECRET); //memberikan token
      const { password, ...others } = newUser._doc;
      res
        .status(200)
        .cookie("access_token", token, { httpOnly: true })
        .json(others);
    }
  } catch (err) {
    next(err);
  }
};

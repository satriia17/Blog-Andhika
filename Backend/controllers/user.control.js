import bycrptjs from "bcryptjs";
import { errorHandler } from "../utils/errorhandle.js";
import User from "../models/user.model.js";

export const test = (req, res) => {
  res.send("User Controller");
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) { //validasi Id dan juga parameter id, apabila tidak sesuai maka akan error
    return res.status(403).json("You can update only your account!");
  } 
  if (req.body.password) { //Cek apakah password lebih dari 6 sting
    if (req.body.password.length < 6) {
      return res.status(403).json("Password must be at least 6 characters");
    }
    req.body.password = bycrptjs.hashSync(req.body.password, 10); //apabila password sudah valid maka akan diberikan hash
  }
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) { //Validasi username harus lebih dari 7 dan kurang dari 20
      return next(
        errorHandler(400, "Username must be between 7 and 20 characters") //apabila username melebihi atau kurang dari seharusnya maka akan error
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username cannot contain any spaces")); //Username tidak diperbolehkan menggunakan spasi
    }
    // if(req.body.username !== req.body.username.toLowerCase()){
    //   return next(errorHandler(400, "Username should be in lowercase")) //Username harus lowercase atau huruf kecil
    // }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) { //Username hanya terdiri dari huruf dan angka
      return next(
        errorHandler(400, "Username should only contain letters and numbers")
      );
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate( //mulai menjalankan fungsi mencari Id dan update
      req.params.userId, //request parameter id user
      {
        $set: { 
          username: req.body.username,
          email: req.body.email,
          profilePic: req.body.profilePic,
          password: req.body.password,
        }, // apabila validasi di atas sudah terlewati maka update akan disimpan dan membuat array baru
      },
      { new: true }
    );
    const { password, ...others } = updatedUser._doc; //menghilangkan data hash password yang ditampilkan pada user
    res.status(200).json(others); //hasil yang diterima user
  } catch (error) {
    next(error); //error akan menggunakan fungsi errorHandler
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json("You can delete only your account!");
  }
  try{
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User has been deleted...");
  }catch(error){
    next(error);
  }
}

export const signOut = async (req, res, next) => {
  try{ 
    res = res.clearCookie("access_token").status(200).json("Signout success");
  }catch(error){
    next(error);
  }
}

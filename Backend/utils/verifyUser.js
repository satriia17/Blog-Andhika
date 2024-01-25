import jwt from "jsonwebtoken";
import { errorHandler } from "./errorhandle.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token; //Request token yang sudah di setting
  if (!token) {
    return next(errorHandler(401, "Unauthorized")); //apabila token tidak ditemukan maka akan error
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => { //JWT digunakan untuk verifikasi token yang ada
    if (err) {
      return next(errorHandler(401, "Unauthorized")); //apabila JWT tidak sesuai maka akan error
    }
    req.user = user; 
    next(); //Setelah user dapat di verifikasi maka akan dilanjutkan pada controller
  });
};

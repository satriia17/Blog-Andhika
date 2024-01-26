import Post from "../models/post.model.js";
import { errorHandler } from "../utils/errorhandle.js";

export const createPost = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized"));
  }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, "Please provide title and content"));
  }
  const slug = req.body.title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");
  const newPost = new Post({
    ...req.body,
    slug,
    authorId: req.user.id,
  });
  try{
    const savePost = await newPost.save();
    res.status(200).json(savePost);
  }catch(error){
    next(error);
  }
};

import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
  createPost,
  getAllPosts,
  getPostBySlug,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/blog";
import { authenticate, allowSubAdmin } from "../middlewares/auth.middleware";
import { multerUpload } from "../middlewares";

const BlogRoute = Router();

// --- Blog Categories ---
BlogRoute.post("/categories", authenticate, allowSubAdmin, createCategory);
BlogRoute.get("/categories", getAllCategories);
BlogRoute.get("/categories/:id", getCategoryById);
BlogRoute.put("/categories/:id", authenticate, allowSubAdmin, updateCategory);
BlogRoute.delete("/categories/:id", authenticate, allowSubAdmin, deleteCategory);

// --- Blog Tags ---
BlogRoute.post("/tags", authenticate, allowSubAdmin, createTag);
BlogRoute.get("/tags", getAllTags);
BlogRoute.get("/tags/:id", getTagById);
BlogRoute.put("/tags/:id", authenticate, allowSubAdmin, updateTag);
BlogRoute.delete("/tags/:id", authenticate, allowSubAdmin, deleteTag);

// --- Blog Posts ---
BlogRoute.post(
  "/posts",
  authenticate,
  allowSubAdmin,
  multerUpload.single("image"),
  createPost
);
BlogRoute.get("/posts", getAllPosts);
BlogRoute.get("/posts/:slug", getPostBySlug);
BlogRoute.get("/posts/id/:id", getPostById);
BlogRoute.put(
  "/posts/:id",
  authenticate,
  allowSubAdmin,
  multerUpload.single("image"),
  updatePost
);
BlogRoute.delete("/posts/:id", authenticate, allowSubAdmin, deletePost);

export default BlogRoute;

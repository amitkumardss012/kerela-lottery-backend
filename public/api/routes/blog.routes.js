"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_1 = require("../controllers/blog");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const middlewares_1 = require("../middlewares");
const BlogRoute = (0, express_1.Router)();
// --- Blog Categories ---
BlogRoute.post("/categories", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, blog_1.createCategory);
BlogRoute.get("/categories", blog_1.getAllCategories);
BlogRoute.get("/categories/:id", blog_1.getCategoryById);
BlogRoute.put("/categories/:id", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, blog_1.updateCategory);
BlogRoute.delete("/categories/:id", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, blog_1.deleteCategory);
// --- Blog Tags ---
BlogRoute.post("/tags", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, blog_1.createTag);
BlogRoute.get("/tags", blog_1.getAllTags);
BlogRoute.get("/tags/:id", blog_1.getTagById);
BlogRoute.put("/tags/:id", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, blog_1.updateTag);
BlogRoute.delete("/tags/:id", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, blog_1.deleteTag);
// --- Blog Posts ---
BlogRoute.post("/posts", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, middlewares_1.multerUpload.single("image"), blog_1.createPost);
BlogRoute.get("/posts", blog_1.getAllPosts);
BlogRoute.get("/posts/:slug", blog_1.getPostBySlug);
BlogRoute.get("/posts/id/:id", blog_1.getPostById);
BlogRoute.put("/posts/:id", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, middlewares_1.multerUpload.single("image"), blog_1.updatePost);
BlogRoute.delete("/posts/:id", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, blog_1.deletePost);
exports.default = BlogRoute;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.getPostById = exports.getPostBySlug = exports.getAllPosts = exports.createPost = void 0;
const config_1 = require("../../../config");
const cloudinary_1 = __importDefault(require("../../../config/cloudinary"));
const middlewares_1 = require("../../middlewares");
const utils_1 = require("../../utils");
const response_util_1 = require("../../utils/response.util");
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");
};
exports.createPost = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, content, summary, category_id, tags, meta_title, meta_description, meta_keywords, is_published } = req.body;
    const image = req.file;
    const author_id = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    if (!title || !content || !author_id) {
        return next(new utils_1.ErrorResponse("Title, Content, and Author are required", 400));
    }
    const slug = slugify(title);
    // Check unique slug
    const existingPost = yield config_1.prisma.blog_post.findUnique({ where: { slug } });
    if (existingPost) {
        return next(new utils_1.ErrorResponse("A post with this title already exists", 400));
    }
    let featured_image = null;
    if (image) {
        const folder = config_1.ENV.cloud_folder ? `${config_1.ENV.cloud_folder}/blogs` : "blogs";
        const result = yield (0, config_1.uploadToCloudinary)(image.buffer, folder);
        featured_image = result; // { public_id, secure_url }
    }
    // Handle Tags
    let tagConnect = [];
    if (tags) {
        const tagArray = Array.isArray(tags) ? tags : JSON.parse(tags);
        tagConnect = yield Promise.all(tagArray.map((tagName) => __awaiter(void 0, void 0, void 0, function* () {
            const tagSlug = slugify(tagName);
            const tag = yield config_1.prisma.blog_tag.upsert({
                where: { name: tagName },
                update: {},
                create: { name: tagName, slug: tagSlug },
            });
            return { id: tag.id };
        })));
    }
    const post = yield config_1.prisma.blog_post.create({
        data: {
            title,
            slug,
            content,
            summary,
            featured_image: featured_image,
            meta_title,
            meta_description,
            meta_keywords,
            is_published: is_published === "true" || is_published === true,
            published_at: (is_published === "true" || is_published === true) ? new Date() : null,
            author: { connect: { id: parseInt(author_id) } },
            category: category_id ? { connect: { id: parseInt(category_id) } } : undefined,
            tags: { connect: tagConnect },
        },
        include: {
            author: { select: { id: true, name: true, email: true } },
            category: true,
            tags: true,
        },
    });
    return (0, response_util_1.SuccessResponse)(res, "Post created successfully", post);
}));
exports.getAllPosts = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, category, tag, published, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    if (category)
        where.category = { slug: category.toString() };
    if (tag)
        where.tags = { some: { slug: tag.toString() } };
    if (published !== undefined)
        where.is_published = published === "true";
    if (search) {
        where.OR = [
            { title: { contains: search.toString() } },
            { content: { contains: search.toString() } },
        ];
    }
    const [posts, total] = yield Promise.all([
        config_1.prisma.blog_post.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: "desc" },
            include: {
                category: true,
                tags: true,
                author: { select: { id: true, name: true } },
            },
        }),
        config_1.prisma.blog_post.count({ where }),
    ]);
    return (0, response_util_1.SuccessResponse)(res, "Posts fetched successfully", {
        posts,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
        },
    });
}));
exports.getPostBySlug = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    const post = yield config_1.prisma.blog_post.findUnique({
        where: { slug },
        include: {
            category: true,
            tags: true,
            author: { select: { id: true, name: true, email: true } },
        },
    });
    if (!post) {
        return next(new utils_1.ErrorResponse("Post not found", 404));
    }
    // Increment views
    yield config_1.prisma.blog_post.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
    });
    return (0, response_util_1.SuccessResponse)(res, "Post fetched successfully", post);
}));
exports.getPostById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const post = yield config_1.prisma.blog_post.findUnique({
        where: { id: parseInt(id) },
        include: {
            category: true,
            tags: true,
            author: { select: { id: true, name: true, email: true } },
        },
    });
    if (!post) {
        return next(new utils_1.ErrorResponse("Post not found", 404));
    }
    return (0, response_util_1.SuccessResponse)(res, "Post fetched successfully", post);
}));
exports.updatePost = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, content, summary, category_id, tags, meta_title, meta_description, meta_keywords, is_published } = req.body;
    const image = req.file;
    const existingPost = yield config_1.prisma.blog_post.findUnique({
        where: { id: parseInt(id) },
    });
    if (!existingPost) {
        return next(new utils_1.ErrorResponse("Post not found", 404));
    }
    let featured_image = existingPost.featured_image;
    if (image) {
        // Delete old image if exists
        if (featured_image) {
            const oldImg = featured_image;
            if (oldImg.public_id) {
                yield cloudinary_1.default.uploader.destroy(oldImg.public_id);
            }
        }
        const folder = config_1.ENV.cloud_folder ? `${config_1.ENV.cloud_folder}/blogs` : "blogs";
        const result = yield (0, config_1.uploadToCloudinary)(image.buffer, folder);
        featured_image = result;
    }
    // Handle Tags
    let tagSet = undefined;
    if (tags) {
        const tagArray = Array.isArray(tags) ? tags : JSON.parse(tags);
        const tagIds = yield Promise.all(tagArray.map((tagName) => __awaiter(void 0, void 0, void 0, function* () {
            const tagSlug = slugify(tagName);
            const tag = yield config_1.prisma.blog_tag.upsert({
                where: { name: tagName },
                update: {},
                create: { name: tagName, slug: tagSlug },
            });
            return { id: tag.id };
        })));
        tagSet = { set: tagIds };
    }
    const updateData = {};
    if (title)
        updateData.title = title;
    if (content)
        updateData.content = content;
    if (summary !== undefined)
        updateData.summary = summary;
    if (featured_image)
        updateData.featured_image = featured_image;
    if (meta_title !== undefined)
        updateData.meta_title = meta_title;
    if (meta_description !== undefined)
        updateData.meta_description = meta_description;
    if (meta_keywords !== undefined)
        updateData.meta_keywords = meta_keywords;
    if (title && title !== existingPost.title) {
        updateData.slug = slugify(title);
    }
    if (is_published !== undefined) {
        const publishValue = is_published === "true" || is_published === true;
        updateData.is_published = publishValue;
        if (publishValue && !existingPost.is_published) {
            updateData.published_at = new Date();
        }
    }
    if (category_id) {
        updateData.category = { connect: { id: parseInt(category_id) } };
    }
    else if (category_id === null) {
        updateData.category = { disconnect: true };
    }
    if (tagSet) {
        updateData.tags = tagSet;
    }
    const post = yield config_1.prisma.blog_post.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
            category: true,
            tags: true,
            author: { select: { id: true, name: true } },
        },
    });
    return (0, response_util_1.SuccessResponse)(res, "Post updated successfully", post);
}));
exports.deletePost = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const post = yield config_1.prisma.blog_post.findUnique({
        where: { id: parseInt(id) },
    });
    if (!post) {
        return next(new utils_1.ErrorResponse("Post not found", 404));
    }
    // Delete image from Cloudinary
    if (post.featured_image) {
        const img = post.featured_image;
        if (img.public_id) {
            yield cloudinary_1.default.uploader.destroy(img.public_id);
        }
    }
    yield config_1.prisma.blog_post.delete({
        where: { id: parseInt(id) },
    });
    return (0, response_util_1.SuccessResponse)(res, "Post deleted successfully", null);
}));

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTag = exports.updateTag = exports.getTagById = exports.getAllTags = exports.createTag = void 0;
const config_1 = require("../../../config");
const middlewares_1 = require("../../middlewares");
const utils_1 = require("../../utils");
const response_util_1 = require("../../utils/response.util");
// Helper to create slug
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");
};
exports.createTag = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    if (!name) {
        return next(new utils_1.ErrorResponse("Tag name is required", 400));
    }
    const slug = slugify(name);
    const existingTag = yield config_1.prisma.blog_tag.findFirst({
        where: { OR: [{ name }, { slug }] },
    });
    if (existingTag) {
        return next(new utils_1.ErrorResponse("Tag with this name or slug already exists", 400));
    }
    const tag = yield config_1.prisma.blog_tag.create({
        data: {
            name,
            slug,
        },
    });
    return (0, response_util_1.SuccessResponse)(res, "Tag created successfully", tag);
}));
exports.getAllTags = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const tags = yield config_1.prisma.blog_tag.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { posts: true }
            }
        }
    });
    return (0, response_util_1.SuccessResponse)(res, "Tags fetched successfully", tags);
}));
exports.getTagById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const tag = yield config_1.prisma.blog_tag.findUnique({
        where: { id: parseInt(id) },
        include: {
            _count: {
                select: { posts: true }
            }
        }
    });
    if (!tag) {
        return next(new utils_1.ErrorResponse("Tag not found", 404));
    }
    return (0, response_util_1.SuccessResponse)(res, "Tag fetched successfully", tag);
}));
exports.updateTag = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name } = req.body;
    let tag = yield config_1.prisma.blog_tag.findUnique({
        where: { id: parseInt(id) },
    });
    if (!tag) {
        return next(new utils_1.ErrorResponse("Tag not found", 404));
    }
    const updateData = {};
    if (name) {
        updateData.name = name;
        updateData.slug = slugify(name);
        const existing = yield config_1.prisma.blog_tag.findFirst({
            where: {
                OR: [{ name: updateData.name }, { slug: updateData.slug }],
                NOT: { id: parseInt(id) }
            }
        });
        if (existing) {
            return next(new utils_1.ErrorResponse("Another tag with this name or slug already exists", 400));
        }
    }
    tag = yield config_1.prisma.blog_tag.update({
        where: { id: parseInt(id) },
        data: updateData,
    });
    return (0, response_util_1.SuccessResponse)(res, "Tag updated successfully", tag);
}));
exports.deleteTag = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const tag = yield config_1.prisma.blog_tag.findUnique({
        where: { id: parseInt(id) },
    });
    if (!tag) {
        return next(new utils_1.ErrorResponse("Tag not found", 404));
    }
    yield config_1.prisma.blog_tag.delete({
        where: { id: parseInt(id) },
    });
    return (0, response_util_1.SuccessResponse)(res, "Tag deleted successfully", null);
}));

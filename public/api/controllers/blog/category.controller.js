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
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getAllCategories = exports.createCategory = void 0;
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
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w-]+/g, "") // Remove all non-word chars
        .replace(/--+/g, "-"); // Replace multiple - with single -
};
exports.createCategory = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    if (!name) {
        return next(new utils_1.ErrorResponse("Category name is required", 400));
    }
    const slug = slugify(name);
    // Check if category already exists
    const existingCategory = yield config_1.prisma.blog_category.findFirst({
        where: { OR: [{ name }, { slug }] },
    });
    if (existingCategory) {
        return next(new utils_1.ErrorResponse("Category with this name or slug already exists", 400));
    }
    const category = yield config_1.prisma.blog_category.create({
        data: {
            name,
            slug,
        },
    });
    return (0, response_util_1.SuccessResponse)(res, "Category created successfully", category);
}));
exports.getAllCategories = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield config_1.prisma.blog_category.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { posts: true }
            }
        }
    });
    return (0, response_util_1.SuccessResponse)(res, "Categories fetched successfully", categories);
}));
exports.getCategoryById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const category = yield config_1.prisma.blog_category.findUnique({
        where: { id: parseInt(id) },
        include: {
            _count: {
                select: { posts: true }
            }
        }
    });
    if (!category) {
        return next(new utils_1.ErrorResponse("Category not found", 404));
    }
    return (0, response_util_1.SuccessResponse)(res, "Category fetched successfully", category);
}));
exports.updateCategory = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name } = req.body;
    let category = yield config_1.prisma.blog_category.findUnique({
        where: { id: parseInt(id) },
    });
    if (!category) {
        return next(new utils_1.ErrorResponse("Category not found", 404));
    }
    const updateData = {};
    if (name) {
        updateData.name = name;
        updateData.slug = slugify(name);
        // Check if another category has the same name/slug
        const existing = yield config_1.prisma.blog_category.findFirst({
            where: {
                OR: [{ name: updateData.name }, { slug: updateData.slug }],
                NOT: { id: parseInt(id) }
            }
        });
        if (existing) {
            return next(new utils_1.ErrorResponse("Another category with this name or slug already exists", 400));
        }
    }
    category = yield config_1.prisma.blog_category.update({
        where: { id: parseInt(id) },
        data: updateData,
    });
    return (0, response_util_1.SuccessResponse)(res, "Category updated successfully", category);
}));
exports.deleteCategory = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const category = yield config_1.prisma.blog_category.findUnique({
        where: { id: parseInt(id) },
    });
    if (!category) {
        return next(new utils_1.ErrorResponse("Category not found", 404));
    }
    // Optional: Check if category has posts before deleting or use prisma cascade
    yield config_1.prisma.blog_category.delete({
        where: { id: parseInt(id) },
    });
    return (0, response_util_1.SuccessResponse)(res, "Category deleted successfully", null);
}));

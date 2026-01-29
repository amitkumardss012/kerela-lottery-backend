import { prisma } from "../../../config";
import { asyncHandler } from "../../middlewares";
import { ErrorResponse } from "../../utils";
import { SuccessResponse } from "../../utils/response.util";

// Helper to create slug
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -
};

export const createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new ErrorResponse("Category name is required", 400));
  }

  const slug = slugify(name);

  // Check if category already exists
  const existingCategory = await prisma.blog_category.findFirst({
    where: { OR: [{ name }, { slug }] },
  });

  if (existingCategory) {
    return next(new ErrorResponse("Category with this name or slug already exists", 400));
  }

  const category = await prisma.blog_category.create({
    data: {
      name,
      slug,
    },
  });

  return SuccessResponse(res, "Category created successfully", category);
});

export const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await prisma.blog_category.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { posts: true }
      }
    }
  });

  return SuccessResponse(res, "Categories fetched successfully", categories);
});

export const getCategoryById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await prisma.blog_category.findUnique({
    where: { id: parseInt(id) },
    include: {
      _count: {
        select: { posts: true }
      }
    }
  });

  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

  return SuccessResponse(res, "Category fetched successfully", category);
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  let category = await prisma.blog_category.findUnique({
    where: { id: parseInt(id) },
  });

  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

  const updateData: any = {};
  if (name) {
    updateData.name = name;
    updateData.slug = slugify(name);

    // Check if another category has the same name/slug
    const existing = await prisma.blog_category.findFirst({
        where: {
            OR: [{ name: updateData.name }, { slug: updateData.slug }],
            NOT: { id: parseInt(id) }
        }
    })
    if(existing) {
        return next(new ErrorResponse("Another category with this name or slug already exists", 400));
    }
  }

  category = await prisma.blog_category.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  return SuccessResponse(res, "Category updated successfully", category);
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await prisma.blog_category.findUnique({
    where: { id: parseInt(id) },
  });

  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

  // Optional: Check if category has posts before deleting or use prisma cascade
  await prisma.blog_category.delete({
    where: { id: parseInt(id) },
  });

  return SuccessResponse(res, "Category deleted successfully", null);
});

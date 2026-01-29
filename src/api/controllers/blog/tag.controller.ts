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
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

export const createTag = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new ErrorResponse("Tag name is required", 400));
  }

  const slug = slugify(name);

  const existingTag = await prisma.blog_tag.findFirst({
    where: { OR: [{ name }, { slug }] },
  });

  if (existingTag) {
    return next(new ErrorResponse("Tag with this name or slug already exists", 400));
  }

  const tag = await prisma.blog_tag.create({
    data: {
      name,
      slug,
    },
  });

  return SuccessResponse(res, "Tag created successfully", tag);
});

export const getAllTags = asyncHandler(async (req, res, next) => {
  const tags = await prisma.blog_tag.findMany({
    orderBy: { createdAt: "desc" },
    include: {
        _count: {
            select: { posts: true }
        }
    }
  });

  return SuccessResponse(res, "Tags fetched successfully", tags);
});

export const getTagById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const tag = await prisma.blog_tag.findUnique({
    where: { id: parseInt(id) },
    include: {
        _count: {
            select: { posts: true }
        }
    }
  });

  if (!tag) {
    return next(new ErrorResponse("Tag not found", 404));
  }

  return SuccessResponse(res, "Tag fetched successfully", tag);
});

export const updateTag = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  let tag = await prisma.blog_tag.findUnique({
    where: { id: parseInt(id) },
  });

  if (!tag) {
    return next(new ErrorResponse("Tag not found", 404));
  }

  const updateData: any = {};
  if (name) {
    updateData.name = name;
    updateData.slug = slugify(name);

    const existing = await prisma.blog_tag.findFirst({
        where: {
            OR: [{ name: updateData.name }, { slug: updateData.slug }],
            NOT: { id: parseInt(id) }
        }
    })
    if(existing) {
        return next(new ErrorResponse("Another tag with this name or slug already exists", 400));
    }
  }

  tag = await prisma.blog_tag.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  return SuccessResponse(res, "Tag updated successfully", tag);
});

export const deleteTag = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const tag = await prisma.blog_tag.findUnique({
    where: { id: parseInt(id) },
  });

  if (!tag) {
    return next(new ErrorResponse("Tag not found", 404));
  }

  await prisma.blog_tag.delete({
    where: { id: parseInt(id) },
  });

  return SuccessResponse(res, "Tag deleted successfully", null);
});

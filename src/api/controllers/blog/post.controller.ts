import { prisma, ENV, uploadToCloudinary } from "../../../config";
import cloudinary from "../../../config/cloudinary";
import { asyncHandler } from "../../middlewares";
import { ErrorResponse } from "../../utils";
import { SuccessResponse } from "../../utils/response.util";

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

export const createPost = asyncHandler(async (req, res, next) => {
  const { title, content, summary, category_id, tags, meta_title, meta_description, meta_keywords, is_published } = req.body;
  const image = req.file as Express.Multer.File;
  const author_id = req.admin?.id;

  if (!title || !content || !author_id) {
    return next(new ErrorResponse("Title, Content, and Author are required", 400));
  }

  const slug = slugify(title);

  // Check unique slug
  const existingPost = await prisma.blog_post.findUnique({ where: { slug } });
  if (existingPost) {
    return next(new ErrorResponse("A post with this title already exists", 400));
  }

  let featured_image = null;
  if (image) {
    const folder = ENV.cloud_folder ? `${ENV.cloud_folder}/blogs` : "blogs";
    const result = await uploadToCloudinary(image.buffer, folder);
    featured_image = result; // { public_id, secure_url }
  }

  // Handle Tags
  let tagConnect = [];
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : JSON.parse(tags);
    tagConnect = await Promise.all(
      tagArray.map(async (tagName: string) => {
        const tagSlug = slugify(tagName);
        const tag = await prisma.blog_tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName, slug: tagSlug },
        });
        return { id: tag.id };
      })
    );
  }

  const post = await prisma.blog_post.create({
    data: {
      title,
      slug,
      content,
      summary,
      featured_image: featured_image as any,
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

  return SuccessResponse(res, "Post created successfully", post);
});

export const getAllPosts = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, category, tag, published, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (category) where.category = { slug: category.toString() };
  if (tag) where.tags = { some: { slug: tag.toString() } };
  if (published !== undefined) where.is_published = published === "true";
  if (search) {
    where.OR = [
      { title: { contains: search.toString() } },
      { content: { contains: search.toString() } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.blog_post.findMany({
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
    prisma.blog_post.count({ where }),
  ]);

  return SuccessResponse(res, "Posts fetched successfully", {
    posts,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getPostBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const post = await prisma.blog_post.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: true,
      author: { select: { id: true, name: true, email: true } },
    },
  });

  if (!post) {
    return next(new ErrorResponse("Post not found", 404));
  }

  // Increment views
  await prisma.blog_post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  });

  return SuccessResponse(res, "Post fetched successfully", post);
});

export const getPostById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const post = await prisma.blog_post.findUnique({
    where: { id: parseInt(id) },
    include: {
      category: true,
      tags: true,
      author: { select: { id: true, name: true, email: true } },
    },
  });

  if (!post) {
    return next(new ErrorResponse("Post not found", 404));
  }

  return SuccessResponse(res, "Post fetched successfully", post);
});

export const updatePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, content, summary, category_id, tags, meta_title, meta_description, meta_keywords, is_published } = req.body;
  const image = req.file as Express.Multer.File;

  const existingPost = await prisma.blog_post.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingPost) {
    return next(new ErrorResponse("Post not found", 404));
  }

  let featured_image = existingPost.featured_image;
  if (image) {
    // Delete old image if exists
    if (featured_image) {
      const oldImg = featured_image as any;
      if (oldImg.public_id) {
        await cloudinary.uploader.destroy(oldImg.public_id);
      }
    }

    const folder = ENV.cloud_folder ? `${ENV.cloud_folder}/blogs` : "blogs";
    const result = await uploadToCloudinary(image.buffer, folder);
    featured_image = result as any;
  }

  // Handle Tags
  let tagSet: any = undefined;
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : JSON.parse(tags);
    const tagIds = await Promise.all(
      tagArray.map(async (tagName: string) => {
        const tagSlug = slugify(tagName);
        const tag = await prisma.blog_tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName, slug: tagSlug },
        });
        return { id: tag.id };
      })
    );
    tagSet = { set: tagIds };
  }

  const updateData: any = {};
  if (title) updateData.title = title;
  if (content) updateData.content = content;
  if (summary !== undefined) updateData.summary = summary;
  if (featured_image) updateData.featured_image = featured_image;
  if (meta_title !== undefined) updateData.meta_title = meta_title;
  if (meta_description !== undefined) updateData.meta_description = meta_description;
  if (meta_keywords !== undefined) updateData.meta_keywords = meta_keywords;

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
  } else if (category_id === null) {
      updateData.category = { disconnect: true };
  }

  if (tagSet) {
    updateData.tags = tagSet;
  }

  const post = await prisma.blog_post.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: {
      category: true,
      tags: true,
      author: { select: { id: true, name: true } },
    },
  });

  return SuccessResponse(res, "Post updated successfully", post);
});

export const deletePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const post = await prisma.blog_post.findUnique({
    where: { id: parseInt(id) },
  });

  if (!post) {
    return next(new ErrorResponse("Post not found", 404));
  }

  // Delete image from Cloudinary
  if (post.featured_image) {
    const img = post.featured_image as any;
    if (img.public_id) {
      await cloudinary.uploader.destroy(img.public_id);
    }
  }

  await prisma.blog_post.delete({
    where: { id: parseInt(id) },
  });

  return SuccessResponse(res, "Post deleted successfully", null);
});

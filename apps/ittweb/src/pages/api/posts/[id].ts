import type { NextApiRequest } from "next";
import { createApiHandler, requireSession, zodValidator } from "@websites/infrastructure/api";
// Import auth config to ensure default auth is registered
import "@/config/auth";
import { UpdatePostSchema } from "@/features/modules/content/blog/lib";
import {
  getPostById,
  updatePost,
  deletePost,
} from "@/features/modules/content/blog/lib/postService";
import { CreatePost } from "@/types/post";
import { createComponentLogger } from "@websites/infrastructure/logging";
import { getUserDataByDiscordIdServer } from "@/features/modules/community/users/services/userDataService.server";
import { isAdmin } from "@/features/modules/community/users";
import type { Post } from "@/types/post";

const logger = createComponentLogger("api/posts/[id]");

/**
 * GET /api/posts/[id] - Get post by ID (public)
 * PUT /api/posts/[id] - Update post (requires authentication and permission)
 * PATCH /api/posts/[id] - Update post (requires authentication and permission)
 * DELETE /api/posts/[id] - Delete post (requires authentication and permission)
 */
export default createApiHandler<Post | { success: boolean }>(
  async (req: NextApiRequest, res, context) => {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      throw new Error("Post ID is required");
    }

    if (req.method === "GET") {
      // Get a single post (public)
      const post = await getPostById(id);
      if (!post) {
        throw new Error("Post not found");
      }
      return post;
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      // Update a post (requires authentication and permission)
      // Session is available from context when default auth is registered
      const session = requireSession(context);
      if (!session.discordId) {
        throw new Error("Authentication required");
      }

      // Get the post to check permissions
      const post = await getPostById(id);
      if (!post) {
        throw new Error("Post not found");
      }

      // Check if user is admin or the author
      const userData = await getUserDataByDiscordIdServer(session.discordId);
      const userIsAdmin = isAdmin(userData?.role);
      const userIsAuthor = post.createdByDiscordId === session.discordId;

      if (!userIsAdmin && !userIsAuthor) {
        throw new Error("You do not have permission to edit this post");
      }

      // Body is already validated by validateBody option
      const updates: Partial<CreatePost> = req.body;
      await updatePost(id, updates);
      logger.info("Post updated", { id, userId: session.discordId });

      return { success: true };
    }

    if (req.method === "DELETE") {
      // Delete a post (requires authentication and permission)
      // Session is available from context when default auth is registered
      const session = requireSession(context);
      if (!session.discordId) {
        throw new Error("Authentication required");
      }

      // Get the post to check permissions
      const post = await getPostById(id);
      if (!post) {
        throw new Error("Post not found");
      }

      // Check if user is admin or the author
      const userData = await getUserDataByDiscordIdServer(session.discordId);
      const userIsAdmin = isAdmin(userData?.role);
      const userIsAuthor = post.createdByDiscordId === session.discordId;

      if (!userIsAdmin && !userIsAuthor) {
        throw new Error("You do not have permission to delete this post");
      }

      await deletePost(id);
      logger.info("Post deleted", { id, userId: session.discordId });

      return { success: true };
    }

    throw new Error("Method not allowed");
  },
  {
    methods: ["GET", "PUT", "PATCH", "DELETE"],
    requireAuth: false, // GET is public, others check auth manually
    logRequests: true,
    // Cache for 10 minutes - posts don't change frequently
    cacheControl: {
      public: true,
      maxAge: 600,
      mustRevalidate: true,
    },
    // Only validate body for PUT/PATCH requests (GET/DELETE don't have bodies)
    validateBody: zodValidator(UpdatePostSchema),
  }
);

import type { NextApiRequest, NextApiResponse } from "next";
// Import server-side mocks FIRST before handler
import "../../../../../__tests__/helpers/mockUserDataService.server";
import {
  mockGetUserDataByDiscordIdServer,
  setIsServerSide,
} from "../../../../../__tests__/helpers/mockUserDataService.server";
import handler from "../[id]";

// Mock dependencies - use function wrappers to avoid hoisting issues
let mockGetPostById: jest.Mock;
let mockUpdatePost: jest.Mock;
let mockDeletePost: jest.Mock;
let mockIsAdmin: jest.Mock;
let mockInfo: jest.Mock;
let mockError: jest.Mock;
let mockWarn: jest.Mock;
let mockDebug: jest.Mock;
let mockGetServerSession: jest.Mock;

// Initialize mocks - this runs after jest.mock hoisting
mockGetPostById = jest.fn();
mockUpdatePost = jest.fn();
mockDeletePost = jest.fn();
mockIsAdmin = jest.fn();
mockInfo = jest.fn();
mockError = jest.fn();
mockWarn = jest.fn();
mockDebug = jest.fn();
mockGetServerSession = jest.fn();

jest.mock("@/features/modules/content/blog/lib/postService", () => ({
  getPostById: jest.fn((...args: unknown[]) => {
    // Access mock via closure - this will be evaluated when the function is called
    return mockGetPostById(...args);
  }),
  updatePost: jest.fn((...args: unknown[]) => {
    // Access mock via closure - this will be evaluated when the function is called
    return mockUpdatePost(...args);
  }),
  deletePost: jest.fn((...args: unknown[]) => {
    // Access mock via closure - this will be evaluated when the function is called
    return mockDeletePost(...args);
  }),
}));

jest.mock("@/features/modules/community/users", () => ({
  isAdmin: jest.fn((...args: unknown[]) => {
    // Access mock via closure - this will be evaluated when the function is called
    return mockIsAdmin(...args);
  }),
}));

jest.mock("@websites/infrastructure/logging", () => ({
  createComponentLogger: jest.fn(() => ({
    // Access mocks via closure - these will be evaluated when the logger is created
    get info() {
      return mockInfo;
    },
    get error() {
      return mockError;
    },
    get warn() {
      return mockWarn;
    },
    get debug() {
      return mockDebug;
    },
  })),
}));

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn((...args: unknown[]) => {
    // Access mock via closure
    return mockGetServerSession(...args);
  }),
}));

jest.mock("@/pages/api/auth/[...nextauth]", () => ({
  authOptions: {},
}));

describe("GET /api/posts/[id]", () => {
  const createRequest = (id: string): NextApiRequest =>
    ({
      method: "GET",
      query: { id },
      body: null,
      url: `/api/posts/${id}`,
    }) as NextApiRequest;

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockPost = {
    id: "post-123",
    title: "Test Post",
    slug: "test-post",
    content: "Test content",
    published: true,
    createdByDiscordId: "discord123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPostById.mockResolvedValue(mockPost);
  });

  it("returns post by ID", async () => {
    // Arrange
    const req = createRequest("post-123");
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetPostById).toHaveBeenCalledWith("post-123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockPost,
    });
  });

  it("returns 500 when post not found", async () => {
    // Arrange
    mockGetPostById.mockResolvedValue(null);
    const req = createRequest("non-existent");
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: "Post not found",
      })
    );
  });

  it("handles error when ID is missing", async () => {
    // Arrange
    const req = {
      method: "GET",
      query: {}, // No id
      body: null,
      url: "/api/posts/",
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: "Post ID is required",
      })
    );
    expect(mockGetPostById).not.toHaveBeenCalled();
  });

  it("does not require authentication", async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest("post-123");
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockPost,
    });
  });

  it("handles error from getPostById", async () => {
    // Arrange
    const error = new Error("Database error");
    mockGetPostById.mockRejectedValue(error);
    const req = createRequest("post-123");
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining("Database error"),
      })
    );
  });
});

describe("PUT /api/posts/[id]", () => {
  const createRequest = (id: string, body: unknown): NextApiRequest =>
    ({
      method: "PUT",
      query: { id },
      body,
      url: `/api/posts/${id}`,
    }) as NextApiRequest;

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockSession = {
    user: { name: "Test User" },
    discordId: "discord123",
    expires: "2024-12-31",
  };

  const mockPost = {
    id: "post-123",
    title: "Test Post",
    slug: "test-post",
    createdByDiscordId: "discord123", // Same as session
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setIsServerSide(true); // Enable server-side mode
    mockGetServerSession.mockResolvedValue(mockSession);
    mockGetPostById.mockResolvedValue(mockPost);
    mockGetUserDataByDiscordIdServer.mockResolvedValue({ role: "user" });
    mockIsAdmin.mockReturnValue(false);
    mockUpdatePost.mockResolvedValue(undefined);
  });

  it("updates post successfully when user is author", async () => {
    // Arrange
    const updates = { title: "Updated Title" };
    const req = createRequest("post-123", updates);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockUpdatePost).toHaveBeenCalledWith("post-123", updates);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { success: true },
    });
  });

  it("updates post successfully when user is admin", async () => {
    // Arrange
    mockIsAdmin.mockReturnValue(true);
    const updates = { title: "Updated Title" };
    const req = createRequest("post-123", updates);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockUpdatePost).toHaveBeenCalledWith("post-123", updates);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("requires authentication", async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest("post-123", { title: "Updated Title" });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining("Authentication required"),
      })
    );
    expect(mockUpdatePost).not.toHaveBeenCalled();
  });

  it("requires discordId in session", async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue({
      user: { name: "Test User" },
      // No discordId
    });
    const req = createRequest("post-123", { title: "Updated Title" });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining("Authentication required"),
      })
    );
    expect(mockUpdatePost).not.toHaveBeenCalled();
  });

  it("returns 500 when post not found", async () => {
    // Arrange
    mockGetPostById.mockResolvedValue(null);
    const req = createRequest("non-existent", { title: "Updated Title" });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: "Post not found",
      })
    );
    expect(mockUpdatePost).not.toHaveBeenCalled();
  });

  it("rejects update when user is not author or admin", async () => {
    // Arrange
    mockPost.createdByDiscordId = "different-discord-id";
    mockGetPostById.mockResolvedValue(mockPost);
    const req = createRequest("post-123", { title: "Updated Title" });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining("permission to edit"),
      })
    );
    expect(mockUpdatePost).not.toHaveBeenCalled();
  });

  it("handles error from updatePost", async () => {
    // Arrange
    // Ensure user has permission (is author)
    mockPost.createdByDiscordId = "discord123";
    mockGetPostById.mockResolvedValue(mockPost);
    const error = new Error("Database error");
    mockUpdatePost.mockRejectedValue(error);
    const req = createRequest("post-123", { title: "Updated Title" });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining("Database error"),
      })
    );
  });
});

describe("PATCH /api/posts/[id]", () => {
  const createRequest = (id: string, body: unknown): NextApiRequest =>
    ({
      method: "PATCH",
      query: { id },
      body,
      url: `/api/posts/${id}`,
    }) as NextApiRequest;

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockSession = {
    user: { name: "Test User" },
    discordId: "discord123",
    expires: "2024-12-31",
  };

  const mockPost = {
    id: "post-123",
    title: "Test Post",
    slug: "test-post",
    createdByDiscordId: "discord123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setIsServerSide(true); // Enable server-side mode
    mockGetServerSession.mockResolvedValue(mockSession);
    mockGetPostById.mockResolvedValue(mockPost);
    mockGetUserDataByDiscordIdServer.mockResolvedValue({ role: "user" });
    mockIsAdmin.mockReturnValue(false);
    mockUpdatePost.mockResolvedValue(undefined);
  });

  it("updates post successfully (same as PUT)", async () => {
    // Arrange
    const updates = { title: "Updated Title" };
    const req = createRequest("post-123", updates);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockUpdatePost).toHaveBeenCalledWith("post-123", updates);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { success: true },
    });
  });
});

describe("DELETE /api/posts/[id]", () => {
  const createRequest = (id: string): NextApiRequest =>
    ({
      method: "DELETE",
      query: { id },
      body: null,
      url: `/api/posts/${id}`,
    }) as NextApiRequest;

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockSession = {
    user: { name: "Test User" },
    discordId: "discord123",
    expires: "2024-12-31",
  };

  const mockPost = {
    id: "post-123",
    title: "Test Post",
    slug: "test-post",
    createdByDiscordId: "discord123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setIsServerSide(true); // Enable server-side mode
    mockGetServerSession.mockResolvedValue(mockSession);
    mockGetPostById.mockResolvedValue(mockPost);
    mockGetUserDataByDiscordIdServer.mockResolvedValue({ role: "user" });
    mockIsAdmin.mockReturnValue(false);
    mockDeletePost.mockResolvedValue(undefined);
  });

  it("deletes post successfully when user is author", async () => {
    // Arrange
    const req = createRequest("post-123");
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockDeletePost).toHaveBeenCalledWith("post-123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { success: true },
    });
  });

  it("deletes post successfully when user is admin", async () => {
    // Arrange
    mockIsAdmin.mockReturnValue(true);
    const req = createRequest("post-123");
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockDeletePost).toHaveBeenCalledWith("post-123");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("requires authentication", async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest("post-123");
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining("Authentication required"),
      })
    );
    expect(mockDeletePost).not.toHaveBeenCalled();
  });

  it("requires discordId in session", async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue({
      user: { name: "Test User" },
      // No discordId
    });
    const req = createRequest("post-123");
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining("Authentication required"),
      })
    );
    expect(mockDeletePost).not.toHaveBeenCalled();
  });

  it("returns 500 when post not found", async () => {
    // Arrange
    mockGetPostById.mockResolvedValue(null);
    const req = createRequest("non-existent");
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: "Post not found",
      })
    );
    expect(mockDeletePost).not.toHaveBeenCalled();
  });

  it("rejects delete when user is not author or admin", async () => {
    // Arrange
    mockPost.createdByDiscordId = "different-discord-id";
    mockGetPostById.mockResolvedValue(mockPost);
    const req = createRequest("post-123");
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining("permission to delete"),
      })
    );
    expect(mockDeletePost).not.toHaveBeenCalled();
  });

  it("handles error from deletePost", async () => {
    // Arrange
    // Ensure user has permission (is author)
    mockPost.createdByDiscordId = "discord123";
    mockGetPostById.mockResolvedValue(mockPost);
    const error = new Error("Database error");
    mockDeletePost.mockRejectedValue(error);
    const req = createRequest("post-123");
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining("Database error"),
      })
    );
  });
});

describe("Method validation", () => {
  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  it("rejects POST method", async () => {
    // Arrange
    const req = {
      method: "POST",
      query: { id: "post-123" },
      body: null,
      url: "/api/posts/post-123",
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining("Method POST not allowed"),
      })
    );
  });
});

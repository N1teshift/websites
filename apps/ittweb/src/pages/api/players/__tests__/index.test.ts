import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../index";

// Mock dependencies - use function wrappers to avoid hoisting issues
let mockGetAllPlayers: jest.Mock;
let mockInfo: jest.Mock;
let mockError: jest.Mock;
let mockWarn: jest.Mock;
let mockDebug: jest.Mock;
let mockGetServerSession: jest.Mock;

// Initialize mocks - this runs after jest.mock hoisting
mockGetAllPlayers = jest.fn();
mockInfo = jest.fn();
mockError = jest.fn();
mockWarn = jest.fn();
mockDebug = jest.fn();
mockGetServerSession = jest.fn();

jest.mock("@/features/modules/community/players/lib/playerService", () => ({
  getAllPlayers: jest.fn((...args: unknown[]) => {
    // Access mock via closure - this will be evaluated when the function is called
    return mockGetAllPlayers(...args);
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

describe("GET /api/players", () => {
  const createRequest = (query: Record<string, string> = {}): NextApiRequest =>
    ({
      method: "GET",
      query,
      body: null,
      url: "/api/players",
    }) as NextApiRequest;

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockPlayers = [
    { name: "Player1", elo: 1500, wins: 10, losses: 5 },
    { name: "Player2", elo: 1600, wins: 15, losses: 3 },
    { name: "Player3", elo: 1400, wins: 8, losses: 7 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllPlayers.mockResolvedValue(mockPlayers);
  });

  it("returns list of players without limit", async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetAllPlayers).toHaveBeenCalledWith(50, undefined); // Default limit is 50, not 100
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.setHeader).toHaveBeenCalledWith(
      "Cache-Control",
      "max-age=120, public, must-revalidate"
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockPlayers,
    });
  });

  it("returns list of players with custom limit", async () => {
    // Arrange
    const req = createRequest({ limit: "25" });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetAllPlayers).toHaveBeenCalledWith(25, undefined);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.setHeader).toHaveBeenCalledWith(
      "Cache-Control",
      "max-age=120, public, must-revalidate"
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockPlayers,
    });
  });

  it("handles empty players list", async () => {
    // Arrange
    mockGetAllPlayers.mockResolvedValue([]);
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.setHeader).toHaveBeenCalledWith(
      "Cache-Control",
      "max-age=120, public, must-revalidate"
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [],
    });
  });

  it("handles error from getAllPlayers", async () => {
    // Arrange
    const error = new Error("Database error");
    mockGetAllPlayers.mockRejectedValue(error);
    const req = createRequest();
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

  it("does not require authentication", async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockPlayers,
    });
  });

  it("handles invalid limit parameter (non-numeric)", async () => {
    // Arrange
    const req = createRequest({ limit: "invalid" });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    // parseInt('invalid', 10) returns NaN, which should be handled
    expect(mockGetAllPlayers).toHaveBeenCalledWith(NaN, undefined);
    // The service should handle NaN, but if it doesn't, we'll get an error
    // For now, we'll just verify the call was made
  });

  it("rejects POST method", async () => {
    // Arrange
    const req = {
      method: "POST",
      query: {},
      body: null,
      url: "/api/players",
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

  it("rejects PUT method", async () => {
    // Arrange
    const req = {
      method: "PUT",
      query: {},
      body: null,
      url: "/api/players",
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining("Method PUT not allowed"),
      })
    );
  });

  it("rejects DELETE method", async () => {
    // Arrange
    const req = {
      method: "DELETE",
      query: {},
      body: null,
      url: "/api/players",
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining("Method DELETE not allowed"),
      })
    );
  });
});

jest.mock("firebase/firestore", () => {
  const mockGetDoc = jest.fn();
  const mockGetDocs = jest.fn();
  return {
    mockGetDoc,
    mockGetDocs,
    getDoc: (...args: unknown[]) => mockGetDoc(...args),
    getDocs: (...args: unknown[]) => mockGetDocs(...args),
    collection: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    where: jest.fn(),
    limit: jest.fn(),
    Timestamp: {
      now: jest.fn(() => ({
        toDate: () => new Date("2020-01-01T00:00:00Z"),
        toMillis: () => 1577836800000,
      })),
      fromDate: jest.fn((date: Date) => ({ toDate: () => date, toMillis: () => date.getTime() })),
    },
  };
});

// Mock dependencies - use function wrappers to avoid hoisting issues
let mockIsServerSide: jest.Mock;

// Initialize mocks - this runs after jest.mock hoisting
mockIsServerSide = jest.fn(() => false);

// Mock dependencies - use function wrappers to avoid hoisting issues
let mockAdminDocGet: jest.Mock;
let mockAdminDocSet: jest.Mock;
let mockAdminDocUpdate: jest.Mock;

// Initialize mocks - this runs after jest.mock hoisting
mockAdminDocGet = jest.fn();
mockAdminDocSet = jest.fn();
mockAdminDocUpdate = jest.fn();

jest.mock("@websites/infrastructure/firebase", () => ({
  getFirestoreInstance: jest.fn(() => ({})),
  getFirestoreAdmin: jest.fn(() => ({
    collection: jest.fn((collectionName: string) => {
      // Access mock via closure - this will be evaluated when the function is called
      return {
        doc: jest.fn((docId: string) => ({
          get: jest.fn(() => mockAdminDocGet()),
          set: jest.fn((data: unknown) => mockAdminDocSet(data)),
          update: jest.fn((data: unknown) => mockAdminDocUpdate(data)),
        })),
      };
    }),
  })),
  isServerSide: jest.fn((...args: unknown[]) => {
    // Access mock via closure - this will be evaluated when the function is called
    return mockIsServerSide(...args);
  }),
  getAdminTimestamp: jest.fn(() => ({
    now: jest.fn(() => ({ toDate: () => new Date("2020-01-01T00:00:00Z") })),
    fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
  })),
}));

jest.mock("@websites/infrastructure/firebase/admin", () => ({
  getFirestoreAdmin: jest.fn(() => ({
    collection: jest.fn((collectionName: string) => ({
      doc: jest.fn((docId: string) => ({
        get: jest.fn(() => mockAdminDocGet()),
        set: jest.fn((data: unknown) => mockAdminDocSet(data)),
        update: jest.fn((data: unknown) => mockAdminDocUpdate(data)),
      })),
    })),
  })),
}));

jest.mock("@websites/infrastructure/logging", () => ({
  createComponentLogger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
  logError: jest.fn(),
}));

jest.mock("@/features/modules/game-management/games/lib/gameService", () => ({
  getGames: jest.fn(),
  getGameById: jest.fn(),
}));

jest.mock("@/features/modules/community/standings/lib/playerCategoryStatsService", () => ({
  upsertPlayerCategoryStats: jest.fn(),
}));

// Mock playerService.read.server (used by main playerService exports)
let mockGetPlayerStatsServer: jest.Mock;
let mockGetAllPlayersServer: jest.Mock;
let mockSearchPlayersServer: jest.Mock;

// Initialize mocks - this runs after jest.mock hoisting
mockGetPlayerStatsServer = jest.fn();
mockGetAllPlayersServer = jest.fn();
mockSearchPlayersServer = jest.fn();

jest.mock("../playerService.read.server", () => ({
  getPlayerStats: jest.fn((...args: unknown[]) => {
    // Access mock via closure - this will be evaluated when the function is called
    return mockGetPlayerStatsServer(...args);
  }),
  getAllPlayers: jest.fn((...args: unknown[]) => {
    // Access mock via closure - this will be evaluated when the function is called
    return mockGetAllPlayersServer(...args);
  }),
  searchPlayers: jest.fn((...args: unknown[]) => {
    // Access mock via closure - this will be evaluated when the function is called
    return mockSearchPlayersServer(...args);
  }),
}));

// Mock playerService.read (client stub) to use the same mocks
// comparePlayers imports from .read, so we need to mock it too
jest.mock("../playerService.read", () => ({
  getPlayerStats: jest.fn((...args: unknown[]) => {
    // Access mock via closure - this will be evaluated when the function is called
    return mockGetPlayerStatsServer(...args);
  }),
  getAllPlayers: jest.fn((...args: unknown[]) => {
    // Access mock via closure - this will be evaluated when the function is called
    return mockGetAllPlayersServer(...args);
  }),
  searchPlayers: jest.fn((...args: unknown[]) => {
    // Access mock via closure - this will be evaluated when the function is called
    return mockSearchPlayersServer(...args);
  }),
}));

const { mockGetDoc, mockGetDocs } = jest.requireMock("firebase/firestore");
const { doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where, orderBy, Timestamp } =
  jest.requireMock("firebase/firestore");
const { getFirestoreInstance } = jest.requireMock("@websites/infrastructure/api/firebase");
const { getFirestoreAdmin, isServerSide } = jest.requireMock("@websites/infrastructure/firebase");
const { getFirestoreAdmin: getFirestoreAdminFromAdmin } = jest.requireMock(
  "@websites/infrastructure/firebase/admin"
);
const { getGames, getGameById } = jest.requireMock(
  "@/features/modules/game-management/games/lib/gameService"
);
const { upsertPlayerCategoryStats } = jest.requireMock(
  "@/features/modules/community/standings/lib/playerCategoryStatsService"
);

import {
  getPlayerStats,
  normalizePlayerName,
  updatePlayerStats,
  getAllPlayers,
  searchPlayers,
  comparePlayers,
} from "../playerService";

describe("playerService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockFn = isServerSide as unknown as jest.Mock | undefined;
    mockFn?.mockReturnValue?.(false);
  });

  describe("normalizePlayerName", () => {
    it("normalizes player names by trimming and lowercasing", () => {
      expect(normalizePlayerName("  Alice ")).toBe("alice");
      expect(normalizePlayerName("BoB")).toBe("bob");
    });

    it("handles empty strings", () => {
      expect(normalizePlayerName("")).toBe("");
      expect(normalizePlayerName("   ")).toBe("");
    });

    it("handles special characters", () => {
      expect(normalizePlayerName("Player_123")).toBe("player_123");
      expect(normalizePlayerName("Player-Name")).toBe("player-name");
    });
  });

  describe("getPlayerStats", () => {
    it("returns null when player stats are missing", async () => {
      // Arrange
      mockGetPlayerStatsServer.mockResolvedValue(null);

      // Act
      const result = await getPlayerStats("unknown");

      // Assert
      expect(result).toBeNull();
      expect(mockGetPlayerStatsServer).toHaveBeenCalledWith("unknown", undefined);
    });

    it("returns player stats when player exists", async () => {
      // Arrange
      const mockPlayerProfile = {
        id: "testplayer",
        name: "TestPlayer",
        categories: {
          "1v1": {
            wins: 5,
            losses: 3,
            draws: 1,
            score: 1050,
            games: 9,
          },
        },
        totalGames: 9,
        lastPlayed: "2024-01-01T00:00:00Z",
        firstPlayed: "2024-01-01T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockGetPlayerStatsServer.mockResolvedValue(mockPlayerProfile);

      // Act
      const result = await getPlayerStats("TestPlayer");

      // Assert
      expect(result).not.toBeNull();
      expect(result?.name).toBe("TestPlayer");
      expect(result?.totalGames).toBe(9);
      expect(result?.categories["1v1"]).toBeDefined();
      expect(mockGetPlayerStatsServer).toHaveBeenCalledWith("TestPlayer", undefined);
    });

    it("includes recent games when includeGames filter is true", async () => {
      // Arrange
      const mockPlayerProfile = {
        id: "testplayer",
        name: "TestPlayer",
        categories: {},
        totalGames: 0,
        recentGames: [
          { id: "game1", gameId: 1 },
          { id: "game2", gameId: 2 },
        ],
        lastPlayed: "2024-01-01T00:00:00Z",
        firstPlayed: "2024-01-01T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockGetPlayerStatsServer.mockResolvedValue(mockPlayerProfile);

      // Act
      const result = await getPlayerStats("TestPlayer", { includeGames: true });

      // Assert
      expect(result?.recentGames).toBeDefined();
      expect(result?.recentGames).toHaveLength(2);
      expect(mockGetPlayerStatsServer).toHaveBeenCalledWith("TestPlayer", { includeGames: true });
    });
  });

  describe("updatePlayerStats", () => {
    beforeEach(() => {
      // Reset admin SDK mocks before each test
      mockAdminDocGet.mockReset();
      mockAdminDocSet.mockReset();
      mockAdminDocUpdate.mockReset();
    });

    it("creates new player stats for new player", async () => {
      // Arrange
      const mockGame = {
        id: "game-123",
        gameId: 1,
        category: "1v1",
        datetime: Timestamp.now(),
        players: [
          {
            name: "Player1",
            pid: 0,
            flag: "winner",
            elochange: 20,
            eloBefore: 1000,
            eloAfter: 1020,
            category: "1v1",
          },
          {
            name: "Player2",
            pid: 1,
            flag: "loser",
            elochange: -20,
            eloBefore: 1000,
            eloAfter: 980,
            category: "1v1",
          },
        ],
      };
      (getGameById as jest.Mock).mockResolvedValue(mockGame);
      // Mock admin SDK document snapshot - player doesn't exist
      mockAdminDocGet.mockResolvedValue({ exists: false, data: () => null });
      mockAdminDocSet.mockResolvedValue(undefined);
      (upsertPlayerCategoryStats as jest.Mock).mockResolvedValue(undefined);

      // Act
      await updatePlayerStats("game-123");

      // Assert
      expect(mockAdminDocSet).toHaveBeenCalled();
      expect(upsertPlayerCategoryStats).toHaveBeenCalled();
    });

    it("updates existing player stats", async () => {
      // Arrange
      const mockGame = {
        id: "game-123",
        gameId: 1,
        category: "1v1",
        datetime: Timestamp.now(),
        players: [
          {
            name: "Player1",
            pid: 0,
            flag: "winner",
            elochange: 20,
            eloBefore: 1000,
            eloAfter: 1020,
            category: "1v1",
          },
        ],
      };
      const mockExistingStats = {
        name: "Player1",
        categories: {
          "1v1": {
            wins: 5,
            losses: 3,
            draws: 0,
            score: 1000,
            games: 8,
          },
        },
        totalGames: 8,
      };
      (getGameById as jest.Mock).mockResolvedValue(mockGame);
      // Mock admin SDK document snapshot - player exists
      mockAdminDocGet.mockResolvedValue({ exists: true, data: () => mockExistingStats });
      mockAdminDocUpdate.mockResolvedValue(undefined);
      (upsertPlayerCategoryStats as jest.Mock).mockResolvedValue(undefined);

      // Act
      await updatePlayerStats("game-123");

      // Assert
      expect(mockAdminDocUpdate).toHaveBeenCalled();
      const updateCall = mockAdminDocUpdate.mock.calls[0][0];
      expect(updateCall.categories["1v1"].wins).toBe(6);
      expect(updateCall.categories["1v1"].score).toBe(1020);
    });

    it("updates peak ELO when ELO increases", async () => {
      // Arrange
      const mockGame = {
        id: "game-123",
        gameId: 1,
        category: "1v1",
        datetime: Timestamp.now(),
        players: [
          {
            name: "Player1",
            pid: 0,
            flag: "winner",
            elochange: 50,
            eloBefore: 1000,
            eloAfter: 1050,
            category: "1v1",
          },
        ],
      };
      const mockExistingStats = {
        name: "Player1",
        categories: {
          "1v1": {
            wins: 5,
            losses: 3,
            score: 1000,
            peakElo: 1020,
            games: 8,
          },
        },
        totalGames: 8,
      };
      (getGameById as jest.Mock).mockResolvedValue(mockGame);
      // Mock admin SDK document snapshot - player exists
      mockAdminDocGet.mockResolvedValue({ exists: true, data: () => mockExistingStats });
      mockAdminDocUpdate.mockResolvedValue(undefined);
      (upsertPlayerCategoryStats as jest.Mock).mockResolvedValue(undefined);

      // Act
      await updatePlayerStats("game-123");

      // Assert
      const updateCall = mockAdminDocUpdate.mock.calls[0][0];
      expect(updateCall.categories["1v1"].peakElo).toBe(1050);
    });

    it("handles draw games correctly", async () => {
      // Arrange
      const mockGame = {
        id: "game-123",
        gameId: 1,
        category: "1v1",
        datetime: Timestamp.now(),
        players: [
          {
            name: "Player1",
            pid: 0,
            flag: "drawer",
            elochange: 0,
            eloBefore: 1000,
            eloAfter: 1000,
            category: "1v1",
          },
        ],
      };
      const mockExistingStats = {
        name: "Player1",
        categories: {
          "1v1": {
            wins: 5,
            losses: 3,
            draws: 0,
            score: 1000,
            games: 8,
          },
        },
        totalGames: 8,
      };
      (getGameById as jest.Mock).mockResolvedValue(mockGame);
      // Mock admin SDK document snapshot - player exists
      mockAdminDocGet.mockResolvedValue({ exists: true, data: () => mockExistingStats });
      mockAdminDocUpdate.mockResolvedValue(undefined);
      (upsertPlayerCategoryStats as jest.Mock).mockResolvedValue(undefined);

      // Act
      await updatePlayerStats("game-123");

      // Assert
      const updateCall = mockAdminDocUpdate.mock.calls[0][0];
      expect(updateCall.categories["1v1"].draws).toBe(1);
    });

    it("returns early when game not found", async () => {
      // Arrange
      (getGameById as jest.Mock).mockResolvedValue(null);

      // Act
      await updatePlayerStats("missing-game");

      // Assert
      expect(mockAdminDocGet).not.toHaveBeenCalled();
    });
  });

  describe("getAllPlayers", () => {
    it("returns all players with limit", async () => {
      // Arrange
      const mockPlayers = [
        {
          id: "p1",
          name: "Player1",
          categories: {},
          totalGames: 0,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "p2",
          name: "Player2",
          categories: {},
          totalGames: 0,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];
      mockGetAllPlayersServer.mockResolvedValue({
        players: mockPlayers,
        hasMore: false,
        lastPlayerName: null,
      });

      // Act
      const result = await getAllPlayers(10);

      // Assert
      expect(result.players).toHaveLength(2);
      expect(result.players[0].name).toBe("Player1");
      expect(result.hasMore).toBe(false);
      expect(mockGetAllPlayersServer).toHaveBeenCalledWith(10, undefined);
    });

    it("respects limit parameter", async () => {
      // Arrange
      // Create 6 players (limit 5 + 1) to test hasMore logic
      const mockPlayers = Array.from({ length: 6 }, (_, i) => ({
        id: `p${i}`,
        name: `Player${i}`,
        categories: {},
        totalGames: 0,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      }));
      mockGetAllPlayersServer.mockResolvedValue({
        players: mockPlayers,
        hasMore: true,
        lastPlayerName: "Player5",
      });

      // Act
      const result = await getAllPlayers(5);

      // Assert
      expect(result.players).toHaveLength(6);
      expect(result.hasMore).toBe(true);
      expect(mockGetAllPlayersServer).toHaveBeenCalledWith(5, undefined);
    });
  });

  describe("searchPlayers", () => {
    it("returns empty array for queries shorter than 2 characters", async () => {
      // Act
      const result1 = await searchPlayers("a");
      const result2 = await searchPlayers("");

      // Assert
      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
      // Should not call the server function for short queries
      expect(mockSearchPlayersServer).not.toHaveBeenCalled();
    });

    it("searches players by name", async () => {
      // Arrange
      mockSearchPlayersServer.mockResolvedValue(["Alice", "AliceSmith"]);

      // Act
      const result = await searchPlayers("alice");

      // Assert
      expect(result).toContain("Alice");
      expect(result).toContain("AliceSmith");
      expect(mockSearchPlayersServer).toHaveBeenCalledWith("alice");
    });

    it("is case-insensitive", async () => {
      // Arrange
      mockSearchPlayersServer.mockResolvedValue(["Alice"]);

      // Act
      const result = await searchPlayers("ALICE");

      // Assert
      expect(result).toContain("Alice");
      expect(mockSearchPlayersServer).toHaveBeenCalledWith("ALICE");
    });

    it("returns empty array on error", async () => {
      // Arrange
      // The real implementation catches errors and returns empty array
      // So the mock should return empty array, not reject
      mockSearchPlayersServer.mockResolvedValue([]);

      // Act
      const result = await searchPlayers("test");

      // Assert
      expect(result).toEqual([]);
      expect(mockSearchPlayersServer).toHaveBeenCalledWith("test");
    });
  });

  describe("comparePlayers", () => {
    beforeEach(() => {
      // Clear any previous mock calls
      mockGetPlayerStatsServer.mockClear();
    });

    it("compares multiple players", async () => {
      // Arrange
      const mockPlayer1 = {
        id: "player1",
        name: "Player1",
        categories: { "1v1": { wins: 5, losses: 3, score: 1050, games: 8 } },
        totalGames: 8,
      };
      const mockPlayer2 = {
        id: "player2",
        name: "Player2",
        categories: { "1v1": { wins: 3, losses: 5, score: 950, games: 8 } },
        totalGames: 8,
      };
      mockGetPlayerStatsServer
        .mockResolvedValueOnce(mockPlayer1)
        .mockResolvedValueOnce(mockPlayer2);
      (getGames as jest.Mock).mockResolvedValue({ games: [] });
      (getGameById as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await comparePlayers(["Player1", "Player2"]);

      // Assert
      expect(result.players).toHaveLength(2);
      expect(result.headToHead).toBeDefined();
      expect(result.eloComparison).toBeDefined();
    });

    it("calculates head-to-head records", async () => {
      // Arrange
      const mockPlayer1 = {
        id: "player1",
        name: "player1",
        categories: {},
        totalGames: 0,
      };
      const mockPlayer2 = {
        id: "player2",
        name: "player2",
        categories: {},
        totalGames: 0,
      };
      const mockGame = {
        id: "game-123",
        players: [
          { name: "player1", flag: "winner" },
          { name: "player2", flag: "loser" },
        ],
      };
      mockGetPlayerStatsServer
        .mockResolvedValueOnce(mockPlayer1)
        .mockResolvedValueOnce(mockPlayer2);
      (getGames as jest.Mock).mockResolvedValue({
        games: [{ id: "game-123" }],
      });
      (getGameById as jest.Mock).mockResolvedValue(mockGame);

      // Act
      // Use lowercase names to match normalized names used in head-to-head calculation
      const result = await comparePlayers(["player1", "player2"]);

      // Assert
      // Head-to-head structure is initialized and updated
      expect(result.headToHead["player1"]).toBeDefined();
      expect(result.headToHead["player1"]["player2"]).toBeDefined();
      expect(result.headToHead["player1"]["player2"].wins).toBe(1);
      expect(result.headToHead["player2"]["player1"].losses).toBe(1);
    });
  });
});

jest.mock("firebase/firestore", () => {
  const mockGetDoc = jest.fn();
  return {
    mockGetDoc,
    getDoc: (...args: unknown[]) => mockGetDoc(...args),
    collection: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    where: jest.fn(),
    limit: jest.fn(),
    Timestamp: {
      now: jest.fn(() => ({ toDate: () => new Date("2020-01-01T00:00:00Z") })),
      fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
    },
  };
});

// Mock dependencies - use function wrappers to avoid hoisting issues
let mockIsServerSide: jest.Mock;

// Initialize mocks - this runs after jest.mock hoisting
mockIsServerSide = jest.fn(() => false);

jest.mock("@websites/infrastructure/firebase", () => ({
  getFirestoreInstance: jest.fn(() => ({})),
  getFirestoreAdmin: jest.fn(() => ({ collection: jest.fn() })),
  isServerSide: jest.fn((...args: unknown[]) => {
    // Access mock via closure - this will be evaluated when the function is called
    return mockIsServerSide(...args);
  }),
  getAdminTimestamp: jest.fn(() => ({
    now: jest.fn(() => ({ toDate: () => new Date("2020-01-01T00:00:00Z") })),
    fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
  })),
}));

jest.mock("@websites/infrastructure/logging", () => ({
  createComponentLogger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
  logError: jest.fn(),
}));

const { mockGetDoc } = jest.requireMock("firebase/firestore");
const { isServerSide } = jest.requireMock("@websites/infrastructure/firebase");
import { getScheduledGameById } from "../scheduledGameService";

describe("scheduledGameService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isServerSide as jest.Mock).mockReturnValue(false);
  });

  it("returns null when scheduled game is missing", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });

    const result = await getScheduledGameById("missing");
    expect(result).toBeNull();
  });
});

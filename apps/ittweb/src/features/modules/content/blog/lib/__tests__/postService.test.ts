jest.mock("firebase/firestore", () => {
  const mockGetDocs = jest.fn();
  return {
    mockGetDocs,
    getDocs: (...args: unknown[]) => mockGetDocs(...args),
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

const { mockGetDocs } = jest.requireMock("firebase/firestore");
const { isServerSide } = jest.requireMock("@websites/infrastructure/firebase");
import { getPostBySlug } from "../postService";

describe("postService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isServerSide as jest.Mock).mockReturnValue(false);
  });

  it("returns null when no post matches the slug", async () => {
    mockGetDocs.mockResolvedValue({ empty: true, docs: [] });

    const result = await getPostBySlug("missing");
    expect(result).toBeNull();
  });
});

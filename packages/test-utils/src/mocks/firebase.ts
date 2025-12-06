/**
 * Firebase mocks for testing
 */

export const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

export const mockFirebaseAdmin = {
  getFirestoreAdmin: jest.fn(() => mockFirestore),
  getStorageAdmin: jest.fn(),
  getStorageBucketName: jest.fn(() => 'test-bucket'),
};



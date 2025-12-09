import { getFirestoreAdmin } from "../firebase/admin";
import { createComponentLogger } from "../logging";

const logger = createComponentLogger("UserService");

export interface User {
  id: string;
  googleId?: string;
  email?: string;
  nickname?: string;
  preferences?: {
    language?: string;
    theme?: string;
  };
  createdAt: Date;
  lastLoginAt: Date;
  [key: string]: any;
}

const USERS_COLLECTION = process.env.USERS_COLLECTION_NAME || "users";

/**
 * Gets a user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  logger.debug("Getting user by ID", { userId });

  try {
    const db = getFirestoreAdmin();
    const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();

    if (!userDoc.exists) {
      logger.debug("User not found", { userId });
      return null;
    }

    const userData = userDoc.data();
    if (!userData) {
      return null;
    }

    const user: User = {
      id: userDoc.id,
      googleId: userData.googleId as string | undefined,
      email: userData.email as string | undefined,
      nickname: userData.nickname as string | undefined,
      preferences: userData.preferences as
        | { language?: string; theme?: string }
        | undefined,
      createdAt: (userData.createdAt as any)?.toDate() || new Date(),
      lastLoginAt: (userData.lastLoginAt as any)?.toDate() || new Date(),
    };

    return user;
  } catch (error) {
    logger.error(
      "Failed to get user",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "UserService",
        operation: "getUserById",
        userId,
      },
    );
    throw error;
  }
}

/**
 * Gets or creates a user by Google ID
 */
export async function getOrCreateUser(
  googleId: string,
  email?: string,
): Promise<User> {
  logger.info("Getting or creating user", { googleId });

  try {
    const db = getFirestoreAdmin();

    // Try to find existing user by googleId
    const usersSnapshot = await db
      .collection(USERS_COLLECTION)
      .where("googleId", "==", googleId)
      .limit(1)
      .get();

    if (!usersSnapshot.empty) {
      const doc = usersSnapshot.docs[0];
      const userData = doc.data();

      // Update lastLoginAt
      await doc.ref.update({
        lastLoginAt: new Date(),
      });

      const user: User = {
        id: doc.id,
        googleId: userData.googleId as string,
        email: (userData.email as string | undefined) || email,
        nickname: userData.nickname as string | undefined,
        preferences: userData.preferences as
          | { language?: string; theme?: string }
          | undefined,
        createdAt: (userData.createdAt as any)?.toDate() || new Date(),
        lastLoginAt: new Date(),
      };

      logger.info("User found", { userId: user.id });
      return user;
    }

    // Create new user
    const now = new Date();
    const newUserRef = await db.collection(USERS_COLLECTION).add({
      googleId,
      email,
      createdAt: now,
      lastLoginAt: now,
    });

    const user: User = {
      id: newUserRef.id,
      googleId,
      email,
      createdAt: now,
      lastLoginAt: now,
    };

    logger.info("User created", { userId: user.id });
    return user;
  } catch (error) {
    logger.error(
      "Failed to get or create user",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "UserService",
        operation: "getOrCreateUser",
        googleId,
      },
    );
    throw error;
  }
}

/**
 * Creates a new user
 */
export async function createUser(userData: Partial<User>): Promise<User> {
  logger.info("Creating user", { googleId: userData.googleId });

  try {
    const db = getFirestoreAdmin();
    const now = new Date();

    const newUserRef = await db.collection(USERS_COLLECTION).add({
      ...userData,
      createdAt: now,
      lastLoginAt: now,
    });

    const user: User = {
      id: newUserRef.id,
      createdAt: now,
      lastLoginAt: now,
      ...userData,
    } as User;

    logger.info("User created", { userId: user.id });
    return user;
  } catch (error) {
    logger.error(
      "Failed to create user",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "UserService",
        operation: "createUser",
      },
    );
    throw error;
  }
}

/**
 * Updates user data
 */
export async function updateUser(
  userId: string,
  updates: Partial<User>,
): Promise<void> {
  logger.info("Updating user", { userId });

  try {
    const db = getFirestoreAdmin();
    const updateData: Record<string, unknown> = {
      ...updates,
      lastLoginAt: new Date(),
    };

    // Remove id and dates from update data (they shouldn't be updated)
    delete updateData.id;
    delete updateData.createdAt;

    await db.collection(USERS_COLLECTION).doc(userId).update(updateData);

    logger.info("User updated", { userId });
  } catch (error) {
    logger.error(
      "Failed to update user",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "UserService",
        operation: "updateUser",
        userId,
      },
    );
    throw error;
  }
}

/**
 * Updates user preferences (nickname, language, theme)
 */
export async function updateUserPreferences(
  userId: string,
  preferences: { nickname?: string; language?: string; theme?: string },
): Promise<void> {
  logger.info("Updating user preferences", { userId, preferences });

  try {
    const db = getFirestoreAdmin();
    const updateData: Record<string, unknown> = {};

    if (preferences.nickname !== undefined) {
      updateData.nickname = preferences.nickname;
    }

    if (preferences.language !== undefined || preferences.theme !== undefined) {
      const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
      const userData = userDoc.data();
      const currentPreferences =
        (userData?.preferences as { language?: string; theme?: string }) || {};

      updateData.preferences = {
        ...currentPreferences,
        ...(preferences.language !== undefined && {
          language: preferences.language,
        }),
        ...(preferences.theme !== undefined && { theme: preferences.theme }),
      };
    }

    await db.collection(USERS_COLLECTION).doc(userId).update(updateData);

    logger.info("User preferences updated", { userId });
  } catch (error) {
    logger.error(
      "Failed to update user preferences",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "UserService",
        operation: "updateUserPreferences",
        userId,
      },
    );
    throw error;
  }
}

import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { createBaseNextAuthConfig, safeCallback } from "@websites/infrastructure/auth";
import { logError } from "@websites/infrastructure/logging";

export const authOptions: NextAuthOptions = {
  ...createBaseNextAuthConfig({
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
    loggerComponentName: "nextauth",
  }),

  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      authorization: {
        params: {
          // Request access to read guild-specific member data (nickname)
          // so we can prefer the user's server nickname when available.
          scope: "identify email guilds guilds.members.read",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      return await safeCallback(
        async () => {
          // On initial sign-in we have both account and profile
          if (account && profile) {
            interface DiscordProfile {
              id: string;
              email?: string;
              name?: string;
              username?: string;
              global_name?: string;
              display_name?: string;
              image_url?: string;
              avatar_url?: string;
              avatar?: string;
            }
            const discordProfile = profile as DiscordProfile;
            token.discordId = discordProfile.id;

            // Prefer guild nickname (if we can fetch it), otherwise Discord display name, then username/name
            let preferredName: string | undefined =
              discordProfile.global_name ||
              discordProfile.display_name ||
              discordProfile.username ||
              profile.name ||
              token.name;

            interface DiscordAccount {
              access_token?: string;
              providerAccountId: string;
            }
            const discordAccount = account as DiscordAccount;

            // If configured, try to fetch the user's nickname from a specific guild
            try {
              const guildId = process.env.DISCORD_GUILD_ID;
              const accessToken = discordAccount.access_token;
              if (guildId && accessToken) {
                const res = await fetch(
                  `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`,
                  {
                    headers: { Authorization: `Bearer ${accessToken}` },
                  }
                );
                if (res.ok) {
                  const member = (await res.json()) as { nick?: string };
                  if (member?.nick) {
                    preferredName = member.nick;
                  }
                }
              }
            } catch {
              // Silently ignore nickname fetch failures and fallback to display name/username
            }

            token.name = preferredName;

            // Try to ensure we have a usable avatar URL
            const existingPicture = token.picture;
            const candidatePicture =
              discordProfile.image_url || discordProfile.avatar_url || existingPicture;
            const finalAvatarUrl =
              candidatePicture ||
              (discordProfile.id && discordProfile.avatar
                ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
                : undefined);
            if (finalAvatarUrl) {
              token.picture = finalAvatarUrl;
            }

            // Update user data in Firestore with complete information including preferred name
            // Use dynamic import to avoid pulling Firebase Admin SDK into module initialization
            try {
              const { saveUserDataServer } =
                await import("@/features/modules/community/users/services/userDataService.server");
              await saveUserDataServer({
                discordId: discordProfile.id || discordAccount.providerAccountId,
                email: discordProfile.email || profile.email,
                name: profile.name,
                preferredName: preferredName,
                avatarUrl: finalAvatarUrl,
                username: discordProfile.username,
                globalName: discordProfile.global_name,
                displayName: discordProfile.display_name,
              });
            } catch (error) {
              // Log error but don't fail the auth process
              // Always log errors to help with debugging
              logError(error as Error, "Failed to update user data in JWT callback", {
                component: "nextauth",
                operation: "jwt",
                discordId: discordProfile.id || discordAccount.providerAccountId,
              });
            }
          }
          return token;
        },
        token,
        {
          component: "nextauth",
          operation: "jwt",
        }
      );
    },
    async session({ session, token }) {
      return await safeCallback(
        async () => {
          // Expose Discord ID and ensure session.user fields reflect our JWT
          session.discordId = token.discordId;
          if (session.user) {
            session.user.name = (token.name as string | undefined) || session.user.name || "User";
            session.user.image =
              (token.picture as string | undefined) || session.user.image || undefined;
          }
          return session;
        },
        session,
        {
          component: "nextauth",
          operation: "session",
        }
      );
    },
  },
};

export default NextAuth(authOptions);

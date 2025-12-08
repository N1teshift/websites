import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { createBaseNextAuthConfig, safeCallback } from "@websites/infrastructure/auth/nextauth";
import { getOrCreateUser } from "@websites/infrastructure/auth/userService";
import { createComponentLogger, logError } from "@websites/infrastructure/logging";

const logger = createComponentLogger('nextauth');

export const authOptions: NextAuthOptions = {
  ...createBaseNextAuthConfig({
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
    loggerComponentName: 'nextauth',
  }),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    AzureADProvider({
      clientId: process.env.AZURE_CLIENT_ID || "",
      clientSecret: process.env.AZURE_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile email",
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
            let providerId: string | undefined;
            let email: string | undefined;
            let name: string | undefined;
            let picture: string | undefined;

            if (account.provider === 'google') {
              providerId = profile.sub || account.providerAccountId;
              email = profile.email;
              name = profile.name;
              picture = profile.picture;
            } else if (account.provider === 'azure-ad') {
              providerId = profile.sub || account.providerAccountId;
              email = profile.email;
              name = profile.name;
              picture = profile.picture;
            }

            if (providerId) {
              // Store provider ID in token for later use
              token.providerId = providerId;
              token.provider = account.provider;

              // Get or create user in Firestore
              // Currently getOrCreateUser only supports Google IDs
              // For Microsoft, we'll need to extend the user service later
              if (account.provider === 'google') {
                try {
                  const user = await getOrCreateUser(providerId, email);
                  token.userId = user.id;
                  token.email = email || user.email;
                  token.name = name || user.nickname || token.name;
                  token.picture = picture || token.picture;
                  
                  logger.debug('User authenticated', { 
                    userId: user.id, 
                    provider: account.provider,
                    providerId 
                  });
                } catch (error) {
                  logError(error as Error, 'Failed to get or create user in JWT callback', {
                    component: 'nextauth',
                    operation: 'jwt',
                    provider: account.provider,
                    providerId,
                  });
                  // Still set basic token info even if user creation fails
                  token.email = email;
                  token.name = name;
                  token.picture = picture;
                }
              } else if (account.provider === 'azure-ad') {
                // TODO: Extend user service to support Microsoft IDs
                // For now, just store the provider info
                token.email = email;
                token.name = name;
                token.picture = picture;
                logger.debug('Microsoft user authenticated (user service not yet extended)', { 
                  provider: account.provider,
                  providerId 
                });
              }
            }
          }
          return token;
        },
        token,
        {
          component: 'nextauth',
          operation: 'jwt',
        }
      );
    },
    
    async session({ session, token }) {
      return await safeCallback(
        async () => {
          // Expose user ID and provider info in session
          if (token.userId) {
            (session as any).userId = token.userId;
          }
          if (token.provider) {
            (session as any).provider = token.provider;
          }
          if (token.providerId) {
            (session as any).providerId = token.providerId;
          }
          
          // Ensure session.user fields are populated
          if (session.user) {
            session.user.name = (token.name as string | undefined) || session.user.name || 'User';
            session.user.email = (token.email as string | undefined) || session.user.email || undefined;
            session.user.image = (token.picture as string | undefined) || session.user.image || undefined;
          }
          
          return session;
        },
        session,
        {
          component: 'nextauth',
          operation: 'session',
        }
      );
    },
  },
  
  pages: {
    signIn: '/',
    error: '/',
  },
};

export default NextAuth(authOptions);

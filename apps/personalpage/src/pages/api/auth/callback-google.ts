/**
 * @file API route handler for the Google OAuth callback.
 * It receives the authorization code, exchanges it for tokens,
 * parses event details from the state, creates a Google Calendar event,
 * and redirects the user.
 * @author Your Name
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getOAuth2Client, createGoogleCalendarEvent } from '@/features/infrastructure/api/google';
import { transformToGoogleEvent } from '../../../features/modules/calendar/utils/eventTransformer';
import { SharedEventDetails } from '../../../features/modules/calendar/types';
import { createComponentLogger } from '@websites/infrastructure/logging';
import { sendCalendarEventEmail } from '../../../features/modules/calendar/utils/emailFormatter';
import { getUserInfo } from '@/features/infrastructure/auth/oauth';

const logger = createComponentLogger('GoogleCallback');

/**
 * API route handler for the Google OAuth 2.0 callback.
 *
 * This endpoint is called by Google after the user grants permission.
 * 1. Validates the request method (must be GET).
 * 2. Extracts the authorization `code` and `state` from the query parameters.
 * 3. Uses the `code` to exchange it for access and refresh tokens via the Google Auth library.
 * 4. Decodes and parses the `SharedEventDetails` from the `state` parameter.
 * 5. Transforms the shared event details into the format required by the Google Calendar API.
 * 6. Uses the obtained tokens and event details to create an event in the user's primary Google Calendar.
 * 7. Redirects the user to a success page (`/math-lessons?success=true`) upon successful event creation.
 * Handles errors during token exchange or event creation.
 *
 * @param {NextApiRequest} req - The incoming API request object (contains `code` and `state` query params).
 * @param {NextApiResponse} res - The outgoing API response object (used for redirection or error response).
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Step 1: Validate the request method
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Step 2: Extract code and state from the query parameters
    const { code, state } = req.query;

    // Step 3: Validate the code parameter
    if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: "Invalid or missing authorization code." });
    }

    try {
        // Step 4: Acquire tokens
        const oauth2Client = getOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Step 5: Fetch the authenticated user's profile from Google to get their email
        let userEmail: string | undefined;
        let userName: string | undefined;
        
        try {
            const googleUserInfo = await getUserInfo(oauth2Client as any); // Type assertion needed due to OAuth2 client type differences
            userEmail = googleUserInfo.email || undefined;
            userName = googleUserInfo.name || 'User';
            logger.debug('Fetched user profile from Google', {
                hasEmail: !!userEmail,
                hasName: !!userName,
                email: userEmail,
            });
        } catch (profileError) {
            logger.warn('Failed to fetch user profile from Google, falling back to attendees', {
                error: profileError instanceof Error ? profileError.message : String(profileError),
            });
            // Fallback to attendees if profile fetch fails
            userEmail = undefined;
            userName = 'User';
        }

        // Step 6: Validate the state parameter
        if (!state || typeof state !== 'string') {
            return res.status(400).json({ message: "Missing event details in state." });
        }

        // Step 7: Parse the shared event details from the state
        const sharedEventDetails: SharedEventDetails = JSON.parse(decodeURIComponent(state));

        // Step 8: Use email from attendees if we didn't get it from Google profile
        if (!userEmail) {
            userEmail = sharedEventDetails.attendees?.[0]?.email;
            userName = sharedEventDetails.attendees?.[0]?.name || userName;
        }

        // Step 9: Transform shared event details to Google event format
        const googleEventDetails = transformToGoogleEvent(sharedEventDetails);

        // Step 10: Create the event in the user's Google Calendar
        const createdEvent = await createGoogleCalendarEvent(oauth2Client, 'primary', googleEventDetails);
        
        // Step 11: Send email notification if user email is available
        const meetingLink = createdEvent.hangoutLink || createdEvent.htmlLink || '';
        
        logger.debug('Preparing to send email notification', {
            hasEmail: !!userEmail,
            hasMeetingLink: !!meetingLink,
        });
        
        if (userEmail) {
            try {
                await sendCalendarEventEmail({
                    userName,
                    userEmail,
                    startDateTime: sharedEventDetails.startDateTime,
                    endDateTime: sharedEventDetails.endDateTime,
                    meetingLink: meetingLink || 'Meeting link will be available in your calendar', // Fallback if no link
                    language: sharedEventDetails.language,
                });
                logger.info('Email notification sent successfully', { userEmail, hasMeetingLink: !!meetingLink });
            } catch (emailError) {
                // Log email error but don't fail the request
                const error = emailError instanceof Error ? emailError : new Error(String(emailError));
                logger.error('Failed to send email notification', error, {
                    userEmail,
                    hasMeetingLink: !!meetingLink,
                    errorMessage: error.message,
                });
            }
        } else {
            logger.debug('Skipping email notification - no user email available');
        }

        // Step 12: Redirect the user with registration method info
        const registrationInfo = {
            method: 'google',
            duration: Math.round((new Date(sharedEventDetails.endDateTime).getTime() - new Date(sharedEventDetails.startDateTime).getTime()) / (1000 * 60)),
            startTime: sharedEventDetails.startDateTime
        };
        const encodedInfo = encodeURIComponent(JSON.stringify(registrationInfo));
        
        // Use environment variable for base URL or fallback to relative path
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
        const redirectUrl = `${baseUrl}/projects/edtech/lessonScheduler?success=true&registrationInfo=${encodedInfo}`;
        res.redirect(redirectUrl);
    } catch (error) {
        logger.error("Error during callback", error instanceof Error ? error : new Error(String(error)));
        res.status(500).json({ message: "Authentication error or event creation failed." });
    }
}




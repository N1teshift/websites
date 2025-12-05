/**
 * @file API route handler for the Microsoft OAuth callback.
 * It receives the authorization code, exchanges it for tokens,
 * parses event details from the state, creates a Microsoft Calendar event,
 * and redirects the user.
 * @author Your Name
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createMSALClient } from '@/features/infrastructure/api/microsoft/auth/microsoftAuth';
import { createMicrosoftCalendarEvent, getMicrosoftConfig } from '@/features/infrastructure/api/microsoft';
import { transformToMicrosoftEvent } from '../../../features/modules/calendar/utils/eventTransformer';
import { SharedEventDetails } from '../../../features/modules/calendar/types';
import { createComponentLogger } from '@websites/infrastructure/logging';
import { sendCalendarEventEmail } from '../../../features/modules/calendar/utils/emailFormatter';
import axios from 'axios';

const logger = createComponentLogger('MicrosoftCallback');

/**
 * API route handler for the Microsoft OAuth 2.0 callback.
 *
 * This endpoint is called by Microsoft after the user grants permission.
 * 1. Validates the request method (must be GET).
 * 2. Extracts the authorization `code` and `state` from the query parameters.
 * 3. Uses the `code` to acquire an access token via the MSAL library (`cca.acquireTokenByCode`).
 * 4. Decodes and parses the `SharedEventDetails` from the `state` parameter.
 * 5. Transforms the shared event details into the format required by the Microsoft Graph API.
 * 6. Uses the obtained access token and event details to create an event in the user's Microsoft Calendar.
 * 7. Sends email notification to the user with meeting details if email and meeting link are available.
 * 8. Redirects the user to a success page upon successful event creation.
 * Handles errors during token acquisition or event creation.
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
        const cca = createMSALClient();
        const tokenResponse = await cca.acquireTokenByCode({ code,
            scopes: ['profile', 'openid', 'email', 'https://graph.microsoft.com/Calendars.ReadWrite', 'https://graph.microsoft.com/OnlineMeetings.ReadWrite', 'https://graph.microsoft.com/User.Read'], redirectUri: process.env.AZURE_REDIRECT_URI || "http://localhost:3000/api/auth/callback-microsoft"
});
        const accessToken = tokenResponse.accessToken;

        // Step 5: Validate the state parameter
        if (!state || typeof state !== 'string') {
            return res.status(400).json({ message: "Missing event details in state." });
        }

        // Step 6: Parse the shared event details from the state
        const sharedEventDetails: SharedEventDetails = JSON.parse(decodeURIComponent(state));

        // Step 7: Transform to Microsoft event format
        const microsoftEventDetails = transformToMicrosoftEvent(sharedEventDetails);

        // Step 8: Fetch the authenticated user's profile from Microsoft Graph to get their email
        const microsoftConfig = getMicrosoftConfig();
        let userEmail: string | undefined;
        let userName: string | undefined;
        
        try {
            const userProfileResponse = await axios({
                method: 'GET',
                url: `${microsoftConfig.graphApiUrl}/me`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const userProfile = userProfileResponse.data as { mail?: string; userPrincipalName?: string; displayName?: string };
            userEmail = userProfile.mail || userProfile.userPrincipalName;
            userName = userProfile.displayName || 'User';
            logger.debug('Fetched user profile from Microsoft Graph', {
                hasEmail: !!userEmail,
                hasName: !!userName,
                email: userEmail,
            });
        } catch (profileError) {
            logger.warn('Failed to fetch user profile from Microsoft Graph, falling back to attendees', {
                error: profileError instanceof Error ? profileError.message : String(profileError),
            });
            // Fallback to attendees if profile fetch fails
            userEmail = sharedEventDetails.attendees?.[0]?.email;
            userName = sharedEventDetails.attendees?.[0]?.name || 'User';
        }

        // Step 9: Create the event in the user's Microsoft calendar
        const createdEvent = await createMicrosoftCalendarEvent(accessToken, microsoftEventDetails) as Record<string, unknown>;
        
        // Step 10: Send email notification if user email is available
        // Extract meeting link from Microsoft Graph API response
        const onlineMeeting = createdEvent.onlineMeeting as Record<string, unknown> | undefined;
        const meetingLink = (onlineMeeting?.joinUrl as string) || (createdEvent.webLink as string) || (createdEvent.onlineMeetingUrl as string) || '';
        
        logger.debug('Preparing to send email notification', {
            hasEmail: !!userEmail,
            hasMeetingLink: !!meetingLink,
            meetingLinkSource: onlineMeeting?.joinUrl ? 'onlineMeeting.joinUrl' : createdEvent.webLink ? 'webLink' : createdEvent.onlineMeetingUrl ? 'onlineMeetingUrl' : 'none',
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

        // Step 11: Redirect the user with registration method info
        const registrationInfo = {
            method: 'microsoft',
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




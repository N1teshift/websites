import { NextApiRequest, NextApiResponse } from 'next';
import { createComponentLogger } from '@websites/infrastructure/logging';
import { createGoogleCalendarClient } from '@/features/infrastructure/api/google';
import { sendCalendarEventEmail } from '../../../features/modules/calendar/utils/emailFormatter';

const logger = createComponentLogger('RegisterOthers', 'handler');

/**
 * API route handler for registering a guest for a calendar event.
 *
 * Expects a POST request with a JSON body containing event details.
 * Uses the Google Calendar API client to create the event.
 * 
 * @param {NextApiRequest} req - The incoming API request object.
 * @param {NextApiResponse} res - The outgoing API response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        logger.info("Creating calendar event using API client");

        // Validate request body
        const eventData = req.body;
        if (!eventData || typeof eventData !== 'object') {
            logger.warn("Invalid request body", { body: req.body });
            return res.status(400).json({ message: "Invalid request body" });
        }

        // Transform the incoming data to Google Calendar API format
        // Note: Service accounts cannot invite attendees without Domain-Wide Delegation
        // So we include guest info in the description instead
        const googleEventData = {
            summary: eventData.summary || 'Math Lesson',
            description: `Guest registration: ${eventData.userName || 'Guest'} (${eventData.userEmail || 'No email'})${eventData.userPhone ? ` - Phone: ${eventData.userPhone}` : ''}${eventData.language ? ` - Language: ${eventData.language}` : ''}`,
            start: {
                dateTime: eventData.startDateTime,
                timeZone: 'Europe/Vilnius'
            },
            end: {
                dateTime: eventData.endDateTime,
                timeZone: 'Europe/Vilnius'
            }
            // Removed attendees field - service accounts cannot invite without Domain-Wide Delegation
        };

        logger.info("Transformed event data for Google Calendar", { 
            summary: googleEventData.summary,
            startTime: googleEventData.start.dateTime,
            endTime: googleEventData.end.dateTime,
            guestEmail: eventData.userEmail || 'No email'
        });

        // Use the Google Calendar API client
        const googleClient = createGoogleCalendarClient();
        const eventResponse = await googleClient.createCalendarEvent('primary', googleEventData) as Record<string, unknown>;

        logger.info("Successfully created calendar event", { 
            eventId: eventResponse?.id,
            summary: eventResponse?.summary 
        });

        // Send email notification if user email is available
        const userEmail = eventData.userEmail;
        const userName = eventData.userName || 'Guest';
        const meetingLink = (eventResponse.hangoutLink as string) || (eventResponse.htmlLink as string) || '';
        
        if (userEmail && meetingLink) {
            try {
                await sendCalendarEventEmail({
                    userName,
                    userEmail,
                    startDateTime: eventData.startDateTime,
                    endDateTime: eventData.endDateTime,
                    meetingLink,
                    language: eventData.language,
                });
                logger.info('Email notification sent successfully', { userEmail });
            } catch (emailError) {
                // Log email error but don't fail the request
                const error = emailError instanceof Error ? emailError : new Error(String(emailError));
                logger.warn('Failed to send email notification', { error: error.message, stack: error.stack });
            }
        } else {
            logger.debug('Skipping email notification', { 
                hasEmail: !!userEmail, 
                hasMeetingLink: !!meetingLink 
            });
        }

        res.status(200).json({ 
            message: 'Event created successfully',
            event: eventResponse 
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("Failed to create calendar event", error instanceof Error ? error : new Error(errorMessage));
        
        res.status(500).json({
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
}




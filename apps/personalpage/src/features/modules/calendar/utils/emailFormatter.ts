import { readFileSync } from 'fs';
import { join } from 'path';
import { sendEmail } from '@websites/infrastructure';

export interface CalendarEmailData {
  userName: string;
  userEmail: string;
  startDateTime: string;
  endDateTime: string;
  meetingLink: string;
  language?: string;
}

/**
 * Loads translation file for a given language
 */
function loadTranslation(language: string): Record<string, unknown> {
  try {
    const translationPath = join(process.cwd(), 'locales', language, 'calendar.json');
    const fileContent = readFileSync(translationPath, 'utf-8');
    return JSON.parse(fileContent) as Record<string, unknown>;
  } catch (error) {
    // Fallback to English if translation file not found
    if (language !== 'en') {
      return loadTranslation('en');
    }
    throw new Error(`Failed to load calendar translations: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Formats email body by replacing placeholders
 */
function formatEmailBody(template: string, data: CalendarEmailData): string {
  return template
    .replace(/\{\{userName\}\}/g, data.userName)
    .replace(/\{\{startDateTime\}\}/g, data.startDateTime)
    .replace(/\{\{endDateTime\}\}/g, data.endDateTime)
    .replace(/\{\{meetingLink\}\}/g, data.meetingLink);
}

/**
 * Sends a calendar event confirmation email
 */
export async function sendCalendarEventEmail(data: CalendarEmailData): Promise<void> {
  const language = data.language || 'en';
  const translations = loadTranslation(language);

  const emailTranslations = translations.email as Record<string, string> | undefined;
  if (!emailTranslations) {
    throw new Error('Email translations not found in calendar.json');
  }

  const subject = emailTranslations.subject || 'Math lesson meeting details';
  const bodyTemplate = emailTranslations.body || '';

  if (!bodyTemplate) {
    throw new Error('Email body template not found in calendar.json');
  }

  const emailBody = formatEmailBody(bodyTemplate, data);

  // Convert plain text to HTML (preserve line breaks)
  const htmlBody = emailBody.replace(/\n/g, '<br>');

  await sendEmail({
    to: data.userEmail,
    subject,
    text: emailBody,
    html: htmlBody,
  });
}






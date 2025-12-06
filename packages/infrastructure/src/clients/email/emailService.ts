import nodemailer, { Transporter } from 'nodemailer';
import { google } from 'googleapis';
import { createComponentLogger } from '@websites/infrastructure/logging';
import { getEmailConfig, validateEmailConfig } from './config';
import { handleEmailError } from './errorHandler';

const logger = createComponentLogger('EmailService');

let transporter: Transporter | null = null;

const gmailClientId = process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID_EMAIL;
const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET_EMAIL;
const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;
const gmailSender = process.env.GMAIL_SENDER;
const gmailRedirectUri = process.env.GMAIL_REDIRECT_URI || 'https://developers.google.com/oauthplayground';

const hasGmailOAuthConfig = Boolean(gmailClientId && gmailClientSecret && gmailRefreshToken && gmailSender);

async function createGmailTransporter(): Promise<Transporter> {
  if (!hasGmailOAuthConfig) {
    throw new Error('Gmail OAuth configuration is missing.');
  }
  logger.info('Initializing Gmail OAuth2 transporter', {
    hasClientId: !!gmailClientId,
    hasClientSecret: !!gmailClientSecret,
    hasRefreshToken: !!gmailRefreshToken,
    sender: gmailSender,
    redirectUri: gmailRedirectUri,
  });

  const oAuth2Client = new google.auth.OAuth2(gmailClientId, gmailClientSecret, gmailRedirectUri);
  oAuth2Client.setCredentials({ refresh_token: gmailRefreshToken });

  const accessTokenResponse = await oAuth2Client.getAccessToken();
  logger.info('Obtained Gmail access token response', {
    responseType: typeof accessTokenResponse,
    hasToken:
      typeof accessTokenResponse === 'string'
        ? !!accessTokenResponse
        : !!accessTokenResponse?.token,
  });
  const accessToken =
    typeof accessTokenResponse === 'string'
      ? accessTokenResponse
      : accessTokenResponse?.token;

  if (!accessToken) {
    throw new Error('Failed to obtain Gmail access token.');
  }

  logger.debug('Gmail OAuth2 auth configuration', {
    user: gmailSender,
    hasClientId: !!gmailClientId,
    hasClientSecret: !!gmailClientSecret,
    hasRefreshToken: !!gmailRefreshToken,
    hasAccessToken: !!accessToken,
    accessTokenLength: accessToken.length,
  });

  // Use explicit SMTP settings instead of 'service: gmail' to ensure XOAUTH2 is used
  const transporterConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      type: 'OAuth2' as const,
      user: gmailSender!,
      clientId: gmailClientId!,
      clientSecret: gmailClientSecret!,
      refreshToken: gmailRefreshToken!,
      accessToken,
    },
  };

  logger.debug('Creating Nodemailer transporter with config', {
    host: transporterConfig.host,
    port: transporterConfig.port,
    secure: transporterConfig.secure,
    authType: transporterConfig.auth.type,
    authUser: transporterConfig.auth.user,
  });

  transporter = nodemailer.createTransport(transporterConfig);

  logger.info('Email transporter created using Gmail OAuth2', {
    sender: gmailSender,
  });

  return transporter;
}

/**
 * Gets or creates the email transporter instance
 */
async function getTransporter(): Promise<Transporter> {
  if (transporter) {
    return transporter;
  }
  logger.debug('Acquiring email transporter', {
    hasCachedTransporter: !!transporter,
    hasGmailOAuthConfig,
  });

  if (hasGmailOAuthConfig) {
    return await createGmailTransporter();
  }

  const config = getEmailConfig();
  const configErrors = validateEmailConfig(config);

  if (configErrors.length > 0) {
    const errorMsg = `Email configuration errors: ${configErrors.join(', ')}`;
    logger.error(errorMsg, new Error(errorMsg), {
      component: 'EmailService',
      operation: 'getTransporter',
    });
    throw new Error(errorMsg);
  }

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  logger.info('Email transporter created', {
    host: config.host,
    port: config.port,
    from: config.from,
  });

  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  fromName?: string;
}

/**
 * Sends an email using the configured email service
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  try {
    const emailTransporter = await getTransporter();
    const config = hasGmailOAuthConfig ? null : getEmailConfig();

    const defaultFromAddress =
      config?.from ||
      gmailSender ||
      config?.auth.user ||
      process.env.EMAIL_USER ||
      process.env.SMTP_USER ||
      '';

    if (!defaultFromAddress) {
      logger.error('No default "from" address configured for emails', undefined, {
        gmailSender,
        configFrom: config?.from,
      });
      throw new Error('No default "from" address configured for emails.');
    }

    const fromAddress = options.from || defaultFromAddress;
    const fromName = options.fromName || config?.fromName || process.env.EMAIL_FROM_NAME;
    const from = fromName ? `${fromName} <${fromAddress}>` : fromAddress;

    logger.info('Sending email', {
      to: options.to,
      subject: options.subject,
      from,
      usingGmailOAuth: hasGmailOAuthConfig,
    });

    const mailOptions = {
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    logger.info('Email sent successfully', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
    });
  } catch (error) {
    throw handleEmailError(error, 'sendEmail');
  }
}

/**
 * Verifies the email transporter configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const emailTransporter = await getTransporter();
    await emailTransporter.verify();
    logger.info('Email configuration verified successfully');
    return true;
  } catch (error) {
    logger.error('Email configuration verification failed', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}








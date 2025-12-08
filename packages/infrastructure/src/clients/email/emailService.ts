import nodemailer, { Transporter } from "nodemailer";
import { google } from "googleapis";
import { createComponentLogger } from "@websites/infrastructure/logging";
import { getEmailConfig, validateEmailConfig } from "./config";
import { handleEmailError } from "./errorHandler";

const logger = createComponentLogger("EmailService");

let transporter: Transporter | null = null;

const gmailClientId =
  process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID_EMAIL;
const gmailClientSecret =
  process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET_EMAIL;
const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;
const gmailSender = process.env.GMAIL_SENDER;
const gmailRedirectUri =
  process.env.GMAIL_REDIRECT_URI ||
  "https://developers.google.com/oauthplayground";

const hasGmailOAuthConfig = Boolean(
  gmailClientId && gmailClientSecret && gmailRefreshToken && gmailSender,
);

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  fromName?: string;
}

/**
 * Sends email using Gmail API directly (more reliable than SMTP for OAuth2)
 */
async function sendEmailViaGmailAPI(options: SendEmailOptions): Promise<void> {
  if (!hasGmailOAuthConfig) {
    throw new Error("Gmail OAuth configuration is missing.");
  }

  const oAuth2Client = new google.auth.OAuth2(
    gmailClientId,
    gmailClientSecret,
    gmailRedirectUri,
  );
  oAuth2Client.setCredentials({ refresh_token: gmailRefreshToken });

  try {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // Build email message in RFC 2822 format
    const from = options.fromName
      ? `${options.fromName} <${options.from || gmailSender}>`
      : options.from || gmailSender;
    const messageParts = [
      `From: ${from}`,
      `To: ${options.to}`,
      `Subject: ${options.subject}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      options.html || options.text || "",
    ];
    const message = messageParts.join("\n");

    // Encode message in base64url format (Gmail API requirement)
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    logger.info("Email sent successfully via Gmail API", {
      messageId: response.data.id,
      to: options.to,
      subject: options.subject,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("invalid_grant")) {
      throw new Error(
        "Gmail refresh token is invalid or expired. Please regenerate it using Google OAuth Playground.",
      );
    }
    throw error;
  }
}

/**
 * Gets or creates the email transporter instance
 * Note: Gmail OAuth2 uses Gmail API directly, not SMTP transporter
 */
async function getTransporter(): Promise<Transporter> {
  if (transporter) {
    return transporter;
  }
  logger.debug("Acquiring email transporter", {
    hasCachedTransporter: !!transporter,
    hasGmailOAuthConfig,
  });

  // Gmail OAuth2 should not use SMTP transporter - it uses Gmail API directly
  if (hasGmailOAuthConfig) {
    throw new Error(
      "Gmail OAuth2 should use Gmail API directly, not SMTP transporter. This should not be called.",
    );
  }

  const config = getEmailConfig();
  const configErrors = validateEmailConfig(config);

  if (configErrors.length > 0) {
    const errorMsg = `Email configuration errors: ${configErrors.join(", ")}`;
    logger.error(errorMsg, new Error(errorMsg), {
      component: "EmailService",
      operation: "getTransporter",
    });
    throw new Error(errorMsg);
  }

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  logger.info("Email transporter created", {
    host: config.host,
    port: config.port,
    from: config.from,
  });

  return transporter;
}

/**
 * Sends an email using the configured email service
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  try {
    // Use Gmail API directly for OAuth2 (more reliable than SMTP)
    if (hasGmailOAuthConfig) {
      return await sendEmailViaGmailAPI(options);
    }

    const emailTransporter = await getTransporter();
    const config = getEmailConfig();

    const defaultFromAddress =
      config?.from ||
      gmailSender ||
      config?.auth.user ||
      process.env.EMAIL_USER ||
      process.env.SMTP_USER ||
      "";

    if (!defaultFromAddress) {
      logger.error(
        'No default "from" address configured for emails',
        undefined,
        {
          gmailSender,
          configFrom: config?.from,
        },
      );
      throw new Error('No default "from" address configured for emails.');
    }

    const fromAddress = options.from || defaultFromAddress;
    const fromName =
      options.fromName || config?.fromName || process.env.EMAIL_FROM_NAME;
    const from = fromName ? `${fromName} <${fromAddress}>` : fromAddress;

    logger.info("Sending email", {
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

    logger.info("Email sent successfully", {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
    });
  } catch (error) {
    // Clear transporter cache on authentication errors so it gets recreated with fresh tokens
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes("Invalid login") ||
      errorMessage.includes("BadCredentials") ||
      errorMessage.includes("authentication")
    ) {
      logger.warn("Authentication error detected, clearing transporter cache", {
        error: errorMessage,
      });
      transporter = null;
    }
    throw handleEmailError(error, "sendEmail");
  }
}

/**
 * Verifies the email transporter configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const emailTransporter = await getTransporter();
    await emailTransporter.verify();
    logger.info("Email configuration verified successfully");
    return true;
  } catch (error) {
    logger.error(
      "Email configuration verification failed",
      error instanceof Error ? error : new Error(String(error)),
    );
    return false;
  }
}

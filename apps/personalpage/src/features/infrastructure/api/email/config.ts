/**
 * Email service configuration
 */

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  fromName?: string;
}

/**
 * Gets email service configuration from environment variables
 */
export function getEmailConfig(): EmailConfig {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587', 10);
  const secure = process.env.EMAIL_SECURE === 'true' || process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.EMAIL_USER || process.env.SMTP_USER || '';
  const pass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD || '';
  const from = process.env.EMAIL_FROM || user;
  const fromName = process.env.EMAIL_FROM_NAME;

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    from,
    fromName,
  };
}

/**
 * Validates email configuration
 * @returns Array of error messages, empty if valid
 */
export function validateEmailConfig(config: EmailConfig): string[] {
  const errors: string[] = [];

  if (!config.host) {
    errors.push('Email host is required (EMAIL_HOST or SMTP_HOST)');
  }

  if (!config.port || config.port < 1 || config.port > 65535) {
    errors.push('Valid email port is required (EMAIL_PORT or SMTP_PORT)');
  }

  if (!config.auth.user) {
    errors.push('Email user is required (EMAIL_USER or SMTP_USER)');
  }

  if (!config.auth.pass) {
    errors.push('Email password is required (EMAIL_PASSWORD or SMTP_PASSWORD)');
  }

  if (!config.from) {
    errors.push('Email from address is required (EMAIL_FROM)');
  }

  return errors;
}








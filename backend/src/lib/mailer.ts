import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from './logger';

export interface PasswordResetMail {
  to: string;
  resetUrl: string;
}

/**
 * Config-selected email transport (feature 004 R-007).
 * - `log`: writes the reset link to the structured logger (local/dev/test).
 * - `smtp`: sends via nodemailer using SMTP_* / MAIL_FROM.
 */
export async function sendPasswordResetEmail({ to, resetUrl }: PasswordResetMail): Promise<void> {
  if (config.mail.transport === 'log') {
    logger.info({ to, resetUrl }, 'password reset link (mail transport=log)');
    return;
  }

  const smtp = config.mail.smtp;
  if (!smtp) {
    throw new Error('SMTP mail transport selected but SMTP config is missing');
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    auth: { user: smtp.user, pass: smtp.pass },
  });

  await transporter.sendMail({
    from: smtp.from,
    to,
    subject: 'Reset your Trace password',
    text: [
      'You requested a password reset for your Trace account.',
      '',
      `Open this link within 30 minutes to choose a new password:`,
      resetUrl,
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
  });
}

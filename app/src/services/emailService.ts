import nodemailer from 'nodemailer';
import { EmailTemplate, ScheduledEmail } from '../models/email';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string, cc?: string[]): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        cc,
        subject,
        html,
      });
    } catch (error: any) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendBulkEmails(recipients: string[], subject: string, html: string): Promise<number> {
    let successCount = 0;
    for (const recipient of recipients) {
      try {
        await this.sendEmail(recipient, subject, html);
        successCount++;
      } catch (error) {
        console.error(`Failed to send email to ${recipient}`, error);
      }
    }
    return successCount;
  }

  async scheduleEmail(to: string, subject: string, html: string, scheduleTime: Date): Promise<string> {
    const emailId = `email_${Date.now()}`;
    // Store in database for later execution
    const scheduledEmail: ScheduledEmail = {
      id: emailId,
      to,
      subject,
      html,
      scheduledTime: scheduleTime,
      status: 'pending',
      createdAt: new Date(),
    };
    // TODO: Save to database
    return emailId;
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    // TODO: Fetch from database
    return [];
  }

  async createTemplate(name: string, content: string): Promise<EmailTemplate> {
    const template: EmailTemplate = {
      id: `template_${Date.now()}`,
      name,
      content,
      variables: this.extractVariables(content),
      createdAt: new Date(),
    };
    // TODO: Save to database
    return template;
  }

  private extractVariables(content: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = content.match(regex) || [];
    return matches.map(m => m.replace(/[{}]/g, ''));
  }
}

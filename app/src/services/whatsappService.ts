import twilio from 'twilio';
import { Message } from '../models/message';

export class WhatsAppService {
  private client: any;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendMessage(to: string, message: string): Promise<string> {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${to}`,
      });
      return result.sid;
    } catch (error: any) {
      throw new Error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }

  async sendBulkMessages(recipients: string[], message: string): Promise<number> {
    let successCount = 0;
    for (const recipient of recipients) {
      try {
        await this.sendMessage(recipient, message);
        successCount++;
      } catch (error) {
        console.error(`Failed to send message to ${recipient}`, error);
      }
    }
    return successCount;
  }

  async getMessageStatus(messageSid: string): Promise<string> {
    try {
      const message = await this.client.messages(messageSid).fetch();
      return message.status;
    } catch (error: any) {
      throw new Error(`Failed to get message status: ${error.message}`);
    }
  }

  async getConversationHistory(phone: string): Promise<Message[]> {
    try {
      const messages = await this.client.messages.list({
        to: `whatsapp:${phone}`,
        limit: 20,
      });
      return messages.map((msg: any) => ({
        id: msg.sid,
        body: msg.body,
        from: msg.from,
        to: msg.to,
        status: msg.status,
        timestamp: msg.dateCreated,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get conversation history: ${error.message}`);
    }
  }

  async addContact(name: string, phone: string): Promise<void> {
    // TODO: Save to database
    console.log(`Contact added: ${name} - ${phone}`);
  }

  async getContacts(): Promise<any[]> {
    // TODO: Fetch from database
    return [];
  }
}

import twilio from 'twilio';
import { Call } from '../models/call';

export class CallService {
  private client: any;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async initiateCall(from: string, to: string, script?: string): Promise<string> {
    try {
      const call = await this.client.calls.create({
        url: `${process.env.TWILIO_WEBHOOK_URL}/voice`,
        to,
        from,
        record: true,
      });
      return call.sid;
    } catch (error: any) {
      throw new Error(`Failed to initiate call: ${error.message}`);
    }
  }

  async scheduleCall(to: string, scheduledTime: Date): Promise<string> {
    const callId = `call_${Date.now()}`;
    // TODO: Store in database and schedule job
    console.log(`Call scheduled to ${to} at ${scheduledTime}`);
    return callId;
  }

  async getCallHistory(limit: number = 20): Promise<Call[]> {
    try {
      const calls = await this.client.calls.list({ limit });
      return calls.map((call: any) => ({
        id: call.sid,
        from: call.from,
        to: call.to,
        duration: call.duration,
        status: call.status,
        recordingUrl: call.recordingUrl,
        startTime: call.dateCreated,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get call history: ${error.message}`);
    }
  }

  async leaveVoicemail(to: string, message: string): Promise<string> {
    try {
      const call = await this.client.calls.create({
        url: `${process.env.TWILIO_WEBHOOK_URL}/voicemail`,
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
        method: 'POST',
        statusCallbackEvent: ['initiated', 'completed'],
      });
      return call.sid;
    } catch (error: any) {
      throw new Error(`Failed to leave voicemail: ${error.message}`);
    }
  }

  async getCallTranscript(callSid: string): Promise<string> {
    // TODO: Fetch from transcription service
    return '';
  }

  async getCallRecording(callSid: string): Promise<string> {
    try {
      const recordings = await this.client.calls(callSid).recordings.list();
      return recordings.length > 0 ? recordings[0].uri : '';
    } catch (error: any) {
      throw new Error(`Failed to get recording: ${error.message}`);
    }
  }

  async endCall(callSid: string): Promise<void> {
    try {
      await this.client.calls(callSid).update({ status: 'completed' });
    } catch (error: any) {
      throw new Error(`Failed to end call: ${error.message}`);
    }
  }
}

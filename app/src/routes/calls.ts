import { Router, Request, Response } from 'express';
import { CallService } from '../services/callService';
import { authMiddleware, rateLimitMiddleware } from '../middleware';

const router = Router();
const callService = new CallService();

/**
 * POST /api/v1/calls/initiate
 * Initiate a phone call
 */
router.post(
  '/initiate',
  authMiddleware,
  rateLimitMiddleware({ windowMs: 60000, max: 30 }),
  async (req: Request, res: Response) => {
    try {
      const {
        phoneNumber,
        greeting,
        scriptId,
        scriptVariables,
        recordCall,
      } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required',
        });
      }

      const result = await callService.initiateCall({
        phoneNumber,
        greeting,
        scriptId,
        scriptVariables,
        recordCall: recordCall || true,
      });

      res.status(201).json({
        success: true,
        callId: result.callId,
        status: 'initiated',
        phoneNumber,
        startedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * POST /api/v1/calls/schedule
 * Schedule a call for later
 */
router.post(
  '/schedule',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const {
        phoneNumber,
        scheduledFor,
        greeting,
        scriptId,
        scriptVariables,
        timezone,
        recordCall,
      } = req.body;

      if (!phoneNumber || !scheduledFor) {
        return res.status(400).json({
          success: false,
          error: 'Phone number and scheduledFor are required',
        });
      }

      const result = await callService.scheduleCall({
        phoneNumber,
        scheduledFor: new Date(scheduledFor),
        greeting,
        scriptId,
        scriptVariables,
        timezone: timezone || 'UTC',
        recordCall: recordCall || true,
      });

      res.status(201).json({
        success: true,
        scheduleId: result.scheduleId,
        status: 'scheduled',
        phoneNumber,
        scheduledFor,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/calls/history
 * Get call history
 */
router.get(
  '/history',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const {
        limit = 50,
        offset = 0,
        status,
        dateFrom,
        dateTo,
        phoneNumber,
      } = req.query;

      const history = await callService.getCallHistory({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        status: status as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        phoneNumber: phoneNumber as string,
      });

      res.status(200).json({
        success: true,
        calls: history.calls,
        total: history.total,
        stats: {
          totalCalls: history.stats.totalCalls,
          successfulCalls: history.stats.successfulCalls,
          failedCalls: history.stats.failedCalls,
          totalDuration: history.stats.totalDuration,
          averageDuration: history.stats.averageDuration,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * POST /api/v1/calls/voicemail
 * Leave a voicemail
 */
router.post(
  '/voicemail',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const {
        phoneNumber,
        message,
        scriptId,
        scriptVariables,
      } = req.body;

      if (!phoneNumber || (!message && !scriptId)) {
        return res.status(400).json({
          success: false,
          error: 'Phone number and (message or scriptId) are required',
        });
      }

      const result = await callService.leaveVoicemail({
        phoneNumber,
        message,
        scriptId,
        scriptVariables,
      });

      res.status(201).json({
        success: true,
        voicemailId: result.voicemailId,
        status: 'sent',
        phoneNumber,
        sentAt: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/calls/:callId/transcript
 * Get call transcript
 */
router.get(
  '/:callId/transcript',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { callId } = req.params;

      const transcript = await callService.getCallTranscript(callId);

      res.status(200).json({
        success: true,
        callId,
        transcript,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/calls/:callId/recording
 * Get call recording URL
 */
router.get(
  '/:callId/recording',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { callId } = req.params;

      const recording = await callService.getCallRecording(callId);

      res.status(200).json({
        success: true,
        callId,
        recordingUrl: recording.url,
        duration: recording.duration,
        format: recording.format,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * POST /api/v1/calls/:callId/end
 * End an ongoing call
 */
router.post(
  '/:callId/end',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { callId } = req.params;

      await callService.endCall(callId);

      res.status(200).json({
        success: true,
        callId,
        status: 'ended',
        endedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

export default router;

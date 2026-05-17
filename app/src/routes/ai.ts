import { Router, Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { authMiddleware, rateLimitMiddleware } from '../middleware';

const router = Router();
const aiService = new AIService();

/**
 * POST /api/v1/ai/generate-cover-letter
 * Generate cover letter using AI
 */
router.post(
  '/generate-cover-letter',
  authMiddleware,
  rateLimitMiddleware({ windowMs: 60000, max: 20 }),
  async (req: Request, res: Response) => {
    try {
      const { jobDescription, resume, companyInfo, tone = 'professional' } = req.body;

      if (!jobDescription || !resume) {
        return res.status(400).json({
          success: false,
          error: 'jobDescription and resume are required',
        });
      }

      const coverLetter = await aiService.generateCoverLetter({
        jobDescription,
        resume,
        companyInfo,
        tone,
      });

      res.status(200).json({
        success: true,
        coverLetter,
        generatedAt: new Date().toISOString(),
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
 * POST /api/v1/ai/optimize-resume
 * Optimize resume for specific job
 */
router.post(
  '/optimize-resume',
  authMiddleware,
  rateLimitMiddleware({ windowMs: 60000, max: 20 }),
  async (req: Request, res: Response) => {
    try {
      const { resume, jobDescription, skills } = req.body;

      if (!resume || !jobDescription) {
        return res.status(400).json({
          success: false,
          error: 'resume and jobDescription are required',
        });
      }

      const optimizedResume = await aiService.optimizeResume({
        resume,
        jobDescription,
        skills,
      });

      res.status(200).json({
        success: true,
        optimizedResume,
        recommendations: optimizedResume.recommendations,
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
 * POST /api/v1/ai/analyze-job
 * Analyze job description and provide insights
 */
router.post(
  '/analyze-job',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { jobDescription, resume } = req.body;

      if (!jobDescription) {
        return res.status(400).json({
          success: false,
          error: 'jobDescription is required',
        });
      }

      const analysis = await aiService.analyzeJob({
        jobDescription,
        resume,
      });

      res.status(200).json({
        success: true,
        analysis,
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
 * POST /api/v1/ai/draft-email
 * Generate personalized email draft
 */
router.post(
  '/draft-email',
  authMiddleware,
  rateLimitMiddleware({ windowMs: 60000, max: 30 }),
  async (req: Request, res: Response) => {
    try {
      const { recipientName, recipientRole, companyName, purpose, tone = 'professional' } = req.body;

      if (!recipientName || !companyName || !purpose) {
        return res.status(400).json({
          success: false,
          error: 'recipientName, companyName, and purpose are required',
        });
      }

      const emailDraft = await aiService.draftEmail({
        recipientName,
        recipientRole,
        companyName,
        purpose,
        tone,
      });

      res.status(200).json({
        success: true,
        subject: emailDraft.subject,
        body: emailDraft.body,
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
 * POST /api/v1/ai/score-match
 * Score how well you match a job
 */
router.post(
  '/score-match',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { resume, jobDescription } = req.body;

      if (!resume || !jobDescription) {
        return res.status(400).json({
          success: false,
          error: 'resume and jobDescription are required',
        });
      }

      const score = await aiService.scoreMatch({
        resume,
        jobDescription,
      });

      res.status(200).json({
        success: true,
        matchScore: score.matchScore,
        matchPercentage: score.matchPercentage,
        strengths: score.strengths,
        gaps: score.gaps,
        recommendations: score.recommendations,
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
 * POST /api/v1/ai/interview-prep
 * Generate interview questions and preparation
 */
router.post(
  '/interview-prep',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { jobDescription, companyName, role } = req.body;

      if (!jobDescription || !companyName) {
        return res.status(400).json({
          success: false,
          error: 'jobDescription and companyName are required',
        });
      }

      const prep = await aiService.generateInterviewPrep({
        jobDescription,
        companyName,
        role,
      });

      res.status(200).json({
        success: true,
        questions: prep.questions,
        companInfo: prep.companyInfo,
        tips: prep.tips,
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
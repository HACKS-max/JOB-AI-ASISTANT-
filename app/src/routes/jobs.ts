import { Router, Request, Response } from 'express';
import { JobService } from '../services/jobService';
import { authMiddleware, rateLimitMiddleware } from '../middleware';

const router = Router();
const jobService = new JobService();

/**
 * GET /api/v1/jobs/search
 * Search for jobs
 */
router.get(
  '/search',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const {
        keyword,
        location,
        experience,
        salary,
        jobType,
        limit = 20,
        offset = 0,
      } = req.query;

      const results = await jobService.searchJobs({
        keyword: keyword as string,
        location: location as string,
        experience: experience as string,
        salary: salary as string,
        jobType: jobType as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      res.status(200).json({
        success: true,
        jobs: results.jobs,
        total: results.total,
        hasMore: results.hasMore,
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
 * POST /api/v1/jobs/apply
 * Apply to a job automatically
 */
router.post(
  '/apply',
  authMiddleware,
  rateLimitMiddleware({ windowMs: 60000, max: 50 }),
  async (req: Request, res: Response) => {
    try {
      const {
        jobId,
        resume,
        coverLetter,
        answers,
        contactInfo,
      } = req.body;

      if (!jobId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: jobId',
        });
      }

      const result = await jobService.applyToJob({
        jobId,
        resume,
        coverLetter,
        answers,
        contactInfo,
      });

      res.status(201).json({
        success: true,
        applicationId: result.applicationId,
        jobId,
        status: 'submitted',
        appliedAt: new Date().toISOString(),
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
 * POST /api/v1/jobs/scrape
 * Scrape job listings from multiple sources
 */
router.post(
  '/scrape',
  authMiddleware,
  rateLimitMiddleware({ windowMs: 60000, max: 10 }),
  async (req: Request, res: Response) => {
    try {
      const {
        sources,
        keywords,
        location,
        limit,
      } = req.body;

      if (!sources || !Array.isArray(sources) || sources.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Sources array is required',
        });
      }

      const scrapingId = await jobService.scrapeJobs({
        sources,
        keywords,
        location,
        limit: limit || 100,
      });

      res.status(202).json({
        success: true,
        scrapingId,
        status: 'processing',
        message: 'Job scraping started. You will be notified when complete.',
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
 * POST /api/v1/jobs/match
 * Find jobs that match your profile
 */
router.post(
  '/match',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const {
        resume,
        preferences,
      } = req.body;

      if (!resume) {
        return res.status(400).json({
          success: false,
          error: 'Resume content is required',
        });
      }

      const matchedJobs = await jobService.matchJobs({
        resume,
        preferences,
      });

      res.status(200).json({
        success: true,
        matchedJobs,
        totalMatches: matchedJobs.length,
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
 * GET /api/v1/jobs/applications
 * Get application history
 */
router.get(
  '/applications',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const {
        limit = 50,
        offset = 0,
        status,
        dateFrom,
        dateTo,
      } = req.query;

      const applications = await jobService.getApplicationHistory({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        status: status as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      });

      res.status(200).json({
        success: true,
        applications: applications.applications,
        total: applications.total,
        stats: applications.stats,
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
 * GET /api/v1/jobs/:jobId
 * Get job details
 */
router.get(
  '/:jobId',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;

      const job = await jobService.getJobDetails(jobId);

      res.status(200).json({
        success: true,
        job,
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
 * POST /api/v1/jobs/:jobId/save
 * Save a job for later
 */
router.post(
  '/:jobId/save',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;

      await jobService.saveJob(jobId);

      res.status(200).json({
        success: true,
        jobId,
        message: 'Job saved successfully',
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
 * GET /api/v1/jobs/saved
 * Get saved jobs
 */
router.get(
  '/saved',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { limit = 50, offset = 0 } = req.query;

      const savedJobs = await jobService.getSavedJobs({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      res.status(200).json({
        success: true,
        jobs: savedJobs.jobs,
        total: savedJobs.total,
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

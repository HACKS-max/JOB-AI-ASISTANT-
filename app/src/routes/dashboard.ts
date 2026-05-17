import { Router, Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';
import { authMiddleware } from '../middleware';

const router = Router();
const dashboardService = new DashboardService();

/**
 * GET /api/v1/dashboard/stats
 * Get overall statistics
 */
router.get(
  '/stats',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { dateFrom, dateTo } = req.query;

      const stats = await dashboardService.getStats({
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      });

      res.status(200).json({
        success: true,
        stats,
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
 * GET /api/v1/dashboard/automations
 * Get active automations
 */
router.get(
  '/automations',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const automations = await dashboardService.getAutomations();

      res.status(200).json({
        success: true,
        automations,
        total: automations.length,
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
 * GET /api/v1/dashboard/applications-summary
 * Get application summary
 */
router.get(
  '/applications-summary',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { days = 30 } = req.query;

      const summary = await dashboardService.getApplicationsSummary({
        days: parseInt(days as string),
      });

      res.status(200).json({
        success: true,
        summary,
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
 * GET /api/v1/dashboard/communication-stats
 * Get email/message/call statistics
 */
router.get(
  '/communication-stats',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { dateFrom, dateTo } = req.query;

      const stats = await dashboardService.getCommunicationStats({
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      });

      res.status(200).json({
        success: true,
        stats,
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
 * GET /api/v1/dashboard/success-rate
 * Get success rate metrics
 */
router.get(
  '/success-rate',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const successRate = await dashboardService.getSuccessRate();

      res.status(200).json({
        success: true,
        successRate,
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
 * GET /api/v1/dashboard/recent-activities
 * Get recent activities
 */
router.get(
  '/recent-activities',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { limit = 20 } = req.query;

      const activities = await dashboardService.getRecentActivities({
        limit: parseInt(limit as string),
      });

      res.status(200).json({
        success: true,
        activities,
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
 * GET /api/v1/dashboard/insights
 * Get AI insights and recommendations
 */
router.get(
  '/insights',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const insights = await dashboardService.getInsights();

      res.status(200).json({
        success: true,
        insights,
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
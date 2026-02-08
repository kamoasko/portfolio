import { Request, Response, NextFunction } from "express";
import { TelemetryEvent } from "../models/TelemetryEvent";
import { throwError } from "../middleware/errorHandler";
import { ApiResponse } from "../types";
import { config } from "../config/environment";

export class TelemetryController {
  static async logEvent(req: Request, res: Response, next: NextFunction) {
    try {
      if (!config.telemetryEnabled) {
        return res.status(204).send();
      }

      const { eventName, attributes, sessionId } = req.body;

      if (!eventName) {
        throwError(400, "Event name is required");
      }

      const event = new TelemetryEvent({
        eventName,
        attributes: attributes || {},
        resource: {
          serviceName: "kamrandev-portfolio",
          serviceVersion: "1.0.0",
          environment: config.nodeEnv,
        },
        userAgent: req.get("user-agent"),
        ipAddress: req.ip,
        sessionId,
        timestamp: new Date(),
      });

      await event.save();

      const response: ApiResponse<null> = {
        success: true,
        message: "Event logged",
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date(),
        eventName,
        limit = 100,
      } = req.query;

      const query: any = {
        timestamp: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
      };

      if (eventName) {
        query.eventName = eventName;
      }

      const events = await TelemetryEvent.find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit as string) || 100)
        .lean();

      // Group by date and event type
      const grouped: any = {};
      events.forEach((event) => {
        const dateKey = event.timestamp.toISOString().split("T")[0];
        if (!grouped[dateKey]) {
          grouped[dateKey] = {};
        }
        if (!grouped[dateKey][event.eventName]) {
          grouped[dateKey][event.eventName] = 0;
        }
        grouped[dateKey][event.eventName]++;
      });

      const data = Object.entries(grouped).map(([date, eventCounts]: any) => ({
        date,
        events: eventCounts,
      }));

      const response: ApiResponse<any> = {
        success: true,
        message: "Analytics retrieved",
        data: {
          data,
          total: events.length,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Get total page views
      const pageViews = await TelemetryEvent.countDocuments({
        eventName: "page_view",
        timestamp: { $gte: thirtyDaysAgo },
      });

      // Get unique users (by IP)
      const uniqueUsers = await TelemetryEvent.distinct("ipAddress", {
        timestamp: { $gte: thirtyDaysAgo },
      });

      // Get top events
      const topEventsAgg = await TelemetryEvent.aggregate([
        {
          $match: {
            timestamp: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: "$eventName",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 5,
        },
      ]);

      const topEvents = topEventsAgg.map((item) => ({
        event: item._id,
        count: item.count,
      }));

      // Get top projects
      const topProjectsAgg = await TelemetryEvent.aggregate([
        {
          $match: {
            eventName: "project_viewed",
            timestamp: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: "$attributes.project_title",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 5,
        },
      ]);

      const topProjects = topProjectsAgg.map((item) => ({
        project: item._id,
        views: item.count,
      }));

      const response: ApiResponse<any> = {
        success: true,
        message: "Summary retrieved",
        data: {
          pageViews,
          uniqueUsers: uniqueUsers.length,
          topEvents,
          topProjects,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

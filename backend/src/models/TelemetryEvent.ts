import mongoose, { Schema, Document } from "mongoose";
import { ITelemetryEvent } from "../types";

interface ITelemetryEventDocument extends ITelemetryEvent, Document {}

const resourceSchema = new Schema(
  {
    serviceName: String,
    serviceVersion: String,
    environment: String,
  },
  { _id: false },
);

const telemetryEventSchema = new Schema<ITelemetryEventDocument>(
  {
    eventName: {
      type: String,
      required: true,
      index: true,
    },
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    resource: {
      type: resourceSchema,
      required: true,
    },
    userAgent: String,
    ipAddress: String,
    sessionId: String,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  },
);

// TTL Index - Auto-delete events older than 90 days
telemetryEventSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

export const TelemetryEvent = mongoose.model<ITelemetryEventDocument>(
  "TelemetryEvent",
  telemetryEventSchema,
);

// User Types
export interface IUser {
  _id?: string;
  email: string;
  username: string;
  passwordHash: string;
  role: "admin" | "viewer";
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  role: string;
}

// Project Types
export interface IProject {
  _id?: string;
  title: string;
  description: string;
  fullDescription?: string;
  technologies: string[];
  previewColor: string;
  previewImage?: string;
  externalLink?: string;
  githubLink?: string;
  demoLink?: string;
  order: number;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

// Content Types
export interface IContent {
  _id?: string;
  type: "hero" | "about" | "skills";
  heroTitle?: string;
  heroTagline?: string;
  heroImage?: string;
  aboutDescription?: string;
  aboutImage?: string;
  aboutImageAlt?: string;
  skills?: Array<{
    category: string;
    items: string[];
  }>;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  lastModifiedBy?: string;
  updatedAt?: Date;
}

// Message Types
export interface IMessage {
  _id?: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  repliedAt?: Date;
  reply?: string;
  repliedBy?: string;
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Telemetry Types
export interface ITelemetryEvent {
  _id?: string;
  eventName: string;
  attributes: Record<string, any>;
  resource: {
    serviceName: string;
    serviceVersion: string;
    environment: string;
  };
  userAgent?: string;
  ipAddress?: string;
  timestamp: Date;
  sessionId?: string;
}

// JWT Types
export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
  iat: number;
  exp: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
